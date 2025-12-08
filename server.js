require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const Groq = require('groq-sdk');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Inicializar Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Inicializar Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Inicializar PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Cache del esquema de la base de datos (optimización de velocidad)
let cachedSchema = null;

// Probar conexión y cargar esquema en cache
pool.query('SELECT NOW()', async (err, res) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err);
  } else {
    console.log('✅ Conectado a PostgreSQL:', res.rows[0].now);
    
    // Cargar esquema en cache para respuestas más rápidas
    try {
      const schemaQuery = `
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
      `;
      const schemaResult = await pool.query(schemaQuery);
      
      let schemaDescription = 'Esquema de la base de datos:\n';
      let currentTable = '';
      schemaResult.rows.forEach(row => {
        if (row.table_name !== currentTable) {
          currentTable = row.table_name;
          schemaDescription += `\nTabla: ${row.table_name}\n`;
        }
        schemaDescription += `  - ${row.column_name} (${row.data_type})\n`;
      });
      
      cachedSchema = schemaDescription;
      console.log('✅ Esquema de BD cargado en cache para respuestas rápidas');
    } catch (error) {
      console.error('⚠️ Error cargando esquema:', error.message);
    }
  }
});

// Función para consultar la base de datos con IA
async function queryDatabaseWithAI(userQuestion) {
  try {
    // Usar esquema cacheado (ya cargado al inicio)
    if (!cachedSchema) {
      console.log('⚠️ Esquema no disponible, usando consultas básicas');
      return { success: false, error: 'Esquema no disponible' };
    }
    
    const schemaDescription = cachedSchema;

    // Pedir a la IA que genere una consulta SQL
    const sqlPrompt = `Eres un experto en PostgreSQL para una cooperativa de agua potable. Genera UNA SOLA consulta SQL válida para responder a la pregunta del usuario.

${schemaDescription}

GUÍA DE CONSULTAS POR TIPO DE PREGUNTA:

📋 INFORMACIÓN GENERAL (usa tabla "configuracion"):
- Horarios/atención → SELECT valor FROM configuracion WHERE clave = 'horario_atencion'
- Contacto (teléfono) → SELECT valor FROM configuracion WHERE clave = 'telefono'
- Contacto (email) → SELECT valor FROM configuracion WHERE clave = 'email'
- Dirección/ubicación → SELECT valor FROM configuracion WHERE clave = 'direccion'
- Página web → SELECT valor FROM configuracion WHERE clave = 'pagina_web'
- Sectores → SELECT valor FROM configuracion WHERE clave = 'sectores'
- Historia → SELECT clave, valor FROM configuracion WHERE clave LIKE '%historia%'
- Subsidio → SELECT clave, valor FROM configuracion WHERE clave LIKE '%subsidio%'
- Fondo solidario → SELECT clave, valor FROM configuracion WHERE clave LIKE '%fondo_solidario%'
- Emergencias → SELECT clave, valor FROM configuracion WHERE clave LIKE '%emergencia%'
- Convenios/pagos → SELECT clave, valor FROM configuracion WHERE clave LIKE '%convenio%' OR clave LIKE '%interes%'
- Misión/visión → SELECT clave, valor FROM configuracion WHERE clave IN ('mision', 'vision')

💰 DATOS OPERACIONALES:
- Facturas de un socio → SELECT * FROM facturas WHERE socio_id = X
- Pagos de un socio → SELECT * FROM pagos WHERE socio_id = X
- Consumo/lecturas → SELECT * FROM lecturas WHERE medidor_id = X ORDER BY fecha DESC LIMIT 12
- Tarifas → SELECT * FROM tarifas ORDER BY rango_min

👤 DATOS DE SOCIOS:
- Buscar socio → SELECT * FROM socios WHERE rut = 'X' OR nombre ILIKE '%X%'
- Medidores de socio → SELECT * FROM medidores WHERE socio_id = X

REGLAS IMPORTANTES:
1. Responde SOLO con la consulta SQL, sin explicaciones
2. NO uses formato markdown (sin \`\`\`sql)
3. Para búsquedas en "configuracion", usa LIKE '%palabra%' cuando no sepas la clave exacta
4. Para fechas recientes, usa ORDER BY fecha DESC LIMIT X
5. Para nombres, usa ILIKE '%nombre%' (case insensitive)

Pregunta del usuario: ${userQuestion}

Consulta SQL:`;

    const sqlCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: sqlPrompt }],
      max_tokens: 100,
      temperature: 0.1
    });

    let sqlQuery = sqlCompletion.choices[0].message.content.trim();
    
    // Limpiar la consulta SQL (remover markdown si existe)
    sqlQuery = sqlQuery.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('🔍 Consulta SQL generada:', sqlQuery);

    // Ejecutar la consulta
    const queryResult = await pool.query(sqlQuery);
    
    return {
      success: true,
      data: queryResult.rows,
      query: sqlQuery
    };
  } catch (error) {
    console.error('❌ Error en consulta:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Historial de conversaciones (en producción, usar una base de datos)
const conversationHistory = new Map();

// Sistema de agrupación de mensajes
const messageBuffer = new Map();
const messageTimers = new Map();
const MESSAGE_WAIT_TIME = 2000; // 2 segundos de espera (optimizado)

// Endpoint principal para recibir mensajes de WhatsApp
app.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Webhook recibido:', JSON.stringify(req.body, null, 2));
    
    const incomingMessage = req.body.Body;
    const fromNumber = req.body.From;
    const toNumber = req.body.To;

    // Responder inmediatamente a Twilio
    res.status(200).send('OK');

    // Agregar mensaje al buffer
    if (!messageBuffer.has(fromNumber)) {
      messageBuffer.set(fromNumber, []);
    }
    messageBuffer.get(fromNumber).push(incomingMessage);

    // Cancelar timer anterior si existe
    if (messageTimers.has(fromNumber)) {
      clearTimeout(messageTimers.get(fromNumber));
    }

    // Crear nuevo timer
    const timer = setTimeout(async () => {
      await processMessages(fromNumber, toNumber);
    }, MESSAGE_WAIT_TIME);

    messageTimers.set(fromNumber, timer);

  } catch (error) {
    console.error('❌ Error procesando mensaje:', error);
    res.status(500).send('Error');
  }
});

// Función para procesar mensajes agrupados
async function processMessages(fromNumber, toNumber) {
  const startTime = Date.now();
  try {
    // Obtener todos los mensajes acumulados
    const messages = messageBuffer.get(fromNumber) || [];
    if (messages.length === 0) return;

    // Limpiar buffer
    messageBuffer.delete(fromNumber);
    messageTimers.delete(fromNumber);

    // Combinar mensajes
    const incomingMessage = messages.join(' ');
    console.log(`📱 Procesando ${messages.length} mensaje(s) de ${fromNumber}: ${incomingMessage}`);

    // Detectar si necesita consultar la base de datos
    const needsDatabase = /\b(buscar|consultar|mostrar|listar|cuánto|cuánta|cuántos|cuántas|dame|ver|datos|información|registro|tabla|usuario|producto|precio|stock|inventario|cliente|pedido|venta|socio|factura|pago|medidor|lectura|consumo|tarifa|horario|horarios|atención|atencion|atienden|abierto|abren|cierran|teléfono|telefono|correo|email|dirección|direccion|contacto|oficina|ubicación|ubicacion|subsidio|convenio|sector|sectores|emergencia|corte|cloro|historia|fuga|fugas|respaldo|queja|quejas|reclamo|reclamos|página|pagina|web|sitio|link|url)\b/i.test(incomingMessage);

    let aiResponse = '';
    let dbContext = '';

    // Si necesita datos, consultar la base de datos
    if (needsDatabase) {
      console.log('🔍 Consultando base de datos...');
      const dbResult = await queryDatabaseWithAI(incomingMessage);
      
      if (dbResult.success && dbResult.data.length > 0) {
        dbContext = `\n\nDatos obtenidos de la base de datos:\n${JSON.stringify(dbResult.data, null, 2)}\n\nUsa estos datos para responder al usuario de forma clara y amigable.`;
        console.log('✅ Datos encontrados:', dbResult.data.length, 'registros');
      } else if (dbResult.success && dbResult.data.length === 0) {
        dbContext = '\n\nNo se encontraron datos en la base de datos para esta consulta.';
      } else {
        dbContext = `\n\nNo pude consultar la base de datos: ${dbResult.error}`;
      }
    }

    // Obtener o crear historial de conversación
    if (!conversationHistory.has(fromNumber)) {
      conversationHistory.set(fromNumber, [
        {
          role: 'system',
          content: 'Eres el asistente virtual de la Cooperativa de Agua Potable La Compañía 💧, fundada en 1968 en Chile. Atendemos a 7 sectores: Aníbana, Molinos, La Compañía, Santa Margarita, Maitén 1, Maitén 2 y La Morera.\n\nPuedes ayudar con:\n💰 Facturas, pagos y convenios (sin intereses)\n📊 Consumo, lecturas y medidores\n🎁 Subsidio de agua potable (15m³, 3 años)\n🤝 Fondo solidario (incendios, enfermedades, invalidez)\n⚠️ Emergencias y cortes programados\n🌐 Información sobre nuestra página web\n📖 Historia y misión de la cooperativa\n\nIMPORTANTE:\n- Respuestas CORTAS y DIRECTAS (máximo 300 caracteres)\n- USA EMOJIS y formato visual atractivo (listas con •, -, números)\n- Divide la información en párrafos cortos\n- Usa saltos de línea para mejor lectura\n- Si es una lista, usa viñetas o emojis\n- Si preguntan temas NO relacionados con la cooperativa, responde amablemente que solo ayudas con agua potable\n- Tienes acceso a la base de datos\n- Sé amigable, profesional y servicial\n- Responde siempre en español'
        }
      ]);
    }

    const history = conversationHistory.get(fromNumber);
    
    // Agregar mensaje del usuario con contexto de BD si existe
    history.push({
      role: 'user',
      content: incomingMessage + dbContext
    });

    // Limitar historial a últimos 6 mensajes (optimizado para velocidad)
    if (history.length > 7) {
      history.splice(1, history.length - 7);
    }

    // Obtener respuesta de Groq (optimizado para velocidad)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: history,
      max_tokens: 200,
      temperature: 0.7
    });

    aiResponse = completion.choices[0].message.content;

    // Limitar respuesta a 1500 caracteres para WhatsApp
    if (aiResponse.length > 1500) {
      aiResponse = aiResponse.substring(0, 1500) + '...';
    }

    // Agregar respuesta de la IA al historial
    history.push({
      role: 'assistant',
      content: aiResponse
    });

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`🤖 Respuesta enviada en ${totalTime}s: ${aiResponse}`);

    // Enviar respuesta por WhatsApp usando Twilio
    await twilioClient.messages.create({
      body: aiResponse,
      from: toNumber,
      to: fromNumber
    });

  } catch (error) {
    console.error('❌ Error procesando mensaje:', error);
    
    // Enviar mensaje de error al usuario
    try {
      await twilioClient.messages.create({
        body: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor intenta de nuevo.',
        from: toNumber,
        to: fromNumber
      });
    } catch (sendError) {
      console.error('❌ Error enviando mensaje de error:', sendError);
    }
  }
}

// Endpoint de salud
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Chatbot funcionando correctamente' });
});

// Endpoint raíz
app.get('/', (req, res) => {
  res.send(`
    <h1>🤖 Chatbot de WhatsApp con IA</h1>
    <p>El servidor está funcionando correctamente.</p>
    <p>Webhook URL: <code>${req.protocol}://${req.get('host')}/webhook</code></p>
  `);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📱 Webhook disponible en: http://localhost:${PORT}/webhook`);
  console.log(`💡 Recuerda configurar este URL en tu consola de Twilio`);
});
