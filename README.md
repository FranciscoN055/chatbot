# 🤖 Chatbot de WhatsApp con IA para Cooperativa de Agua Potable La Compañía

Un chatbot inteligente para WhatsApp que utiliza Twilio para mensajería, Groq AI (gratuito) para inteligencia artificial, y PostgreSQL para gestionar datos de socios, medidores, facturas y pagos de la Cooperativa de Agua Potable La Compañía.

**Proyecto desarrollado para:** Trabajo universitario - Universidad San Sebastián  
**Cliente:** [Cooperativa de Agua Potable La Compañía](https://www.cooplacia.cl/)

## ✨ Características Principales

### 🤖 Inteligencia Artificial
- **Modelo:** Groq llama-3.3-70b-versatile (gratuito, sin tarjeta de crédito)
- **Idioma:** Respuestas en español
- **Contexto:** Especializado en servicios de cooperativa de agua potable
- **Restricción:** Solo responde preguntas relacionadas con el agua potable

### 📊 Base de Datos Inteligente
- **Consultas en lenguaje natural:** Pregunta en español y el chatbot genera automáticamente las consultas SQL
- **Datos operativos:**
  - Información de socios
  - Medidores y lecturas de consumo
  - Facturas y pagos
  - Tarifas de consumo
- **Información de la cooperativa:**
  - Sectores operativos y cobertura
  - Subsidio de agua potable y fondo solidario
  - Tiempos de atención de emergencias
  - Convenios de pago (sin intereses)
  - Procedimientos operativos (fugas, cortes, cloro)
  - Historia, misión y visión institucional
  - Canales de contacto

### ⚡ Optimizaciones de Velocidad
- **Cache de esquema de BD:** Carga la estructura de la base de datos al inicio (ahorro ~2s por consulta)
- **Consultas SQL directas:** Para preguntas comunes (horarios, teléfono, subsidio, etc.) usa SQL predefinido sin llamar a IA (ahorro ~10-15s)
- **Tokens optimizados:** Respuestas limitadas a 200 tokens para generación más rápida
- **Historial reducido:** Solo mantiene últimos 6 mensajes para procesamiento más rápido

### ⚡ Sistema de Buffer de Mensajes
- **Espera de 2 segundos:** Si el usuario envía varios mensajes seguidos, el chatbot espera 2 segundos para agruparlos
- **Respuesta única:** En lugar de generar múltiples respuestas, consolida todos los mensajes en una sola respuesta coherente
- **Mejor experiencia:** Evita spam de respuestas cuando el usuario escribe en varios mensajes

### 💬 Historial de Conversación
- Mantiene contexto de la conversación por cada usuario
- Últimos 6 mensajes en memoria (optimizado)
- Se reinicia al reiniciar el servidor

### 📏 Límite de Respuestas
- Respuestas optimizadas para WhatsApp (máximo 1500 caracteres)
- Generación limitada a 200 tokens para velocidad
- Evita errores de mensajes demasiado largos

## 📊 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUARIO EN WHATSAPP                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Envía mensaje(s)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        TWILIO (WhatsApp API)                        │
│                   Recibe mensaje y hace POST                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ POST /webhook
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    TU SERVIDOR (Google Cloud Run)                   │
│                         Express.js + Node.js                        │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  SISTEMA DE BUFFER   │
                  │  Espera 2 segundos   │
                  │  Agrupa mensajes     │
                  └──────────┬───────────┘
                             │
                             │ Mensaje(s) agrupado(s)
                             ▼
                  ┌──────────────────────────────────────┐
                  │    DETECCIÓN INTELIGENTE DE QUERY    │
                  │  ¿Es pregunta común o compleja?      │
                  └──┬───────────────┬───────────────┬───┘
                     │               │               │
              COMÚN  │        COMPLEJA│          OTRO│
              (Rápido)       (IA SQL)             (IA)
                     │               │               │
         ┌───────────▼─────┐    ┌────▼──────┐      │
         │ SQL DIRECTO ⚡  │    │ GROQ AI   │      │
         │ (sin usar IA)   │    │ Genera SQL│      │
         │ Horarios,tel,   │    │ complejo  │      │
         │ subsidio,etc.   │    └────┬──────┘      │
         └───────────┬─────┘         │             │
                     │               │             │
                     │ Query SQL     │             │
                     ▼               ▼             │
         ┌────────────────────────────┐            │
         │      POSTGRESQL 💾         │            │
         │    (Neon Database)         │            │
         │  ✅ Esquema en cache       │            │
         │  ✅ Consulta instantánea   │            │
         └────────────┬───────────────┘            │
                      │                            │
                      │ Resultados                 │
                      │                            │
                      └────────────┬───────────────┘
                                   │
                                   │ Datos + Mensaje
                                   ▼
                        ┌──────────────────────┐
                        │   GROQ AI (Final)    │
                        │  llama-3.3-70b       │
                        │  Genera respuesta    │
                        │  (max 200 tokens)    │
                        └──────────┬───────────┘
                                   │
                                   │ Respuesta (max 1500 chars)
                                   ▼
                        ┌──────────────────────┐
                        │  HISTORIAL GUARDADO  │
                        │  En memoria (Map)    │
                        │  Últimos 6 mensajes  │
                        └──────────┬───────────┘
                       │
                       │ Respuesta final
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        TWILIO (WhatsApp API)                        │
│                      Envía mensaje al usuario                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Mensaje recibido
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         USUARIO EN WHATSAPP                         │
│                    Ve la respuesta del chatbot                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Ejemplo de Flujo Real:

**Usuario escribe rápidamente:**
1. "Hola" → Buffer inicia temporizador de 2s
2. "Soy el socio 001" → Buffer reinicia temporizador
3. "¿Cuánto debo?" → Buffer reinicia temporizador

**Después de 2 segundos sin nuevos mensajes:**
- Agrupa: "Hola Soy el socio 001 ¿Cuánto debo?"
- Detecta keyword: "socio", "debo" → Necesita BD
- Groq genera: `SELECT * FROM socios WHERE numero_socio = '001'`
- PostgreSQL devuelve: Juan Pérez, dirección, etc.
- Groq genera: `SELECT * FROM facturas WHERE socio_id = X AND estado = 'pendiente'`
- PostgreSQL devuelve: $45.50 pendiente
- Groq formula respuesta: "¡Hola Juan Pérez! Tienes una factura pendiente de $45.50..."
- Usuario recibe UNA SOLA respuesta completa

## 📋 Requisitos Previos

- Node.js (versión 14 o superior)
- Una cuenta de Twilio con WhatsApp habilitado
- Una API Key de Groq (gratuita, sin tarjeta de crédito)
- Base de datos PostgreSQL (recomendado: Neon.tech gratis)
- Google Cloud Platform con $300 en créditos gratis (para producción)

## 🚀 Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**

Copia el archivo `.env.example` a `.env`:
```bash
copy .env.example .env
```

Luego edita el archivo `.env` con tus credenciales:

```env
# Twilio (obtenlas de https://console.twilio.com/)
TWILIO_ACCOUNT_SID=tu_account_sid_aqui
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Groq AI (obtén tu API key GRATIS en https://console.groq.com/keys)
GROQ_API_KEY=tu_groq_api_key_aqui

# Base de datos PostgreSQL
DATABASE_URL=tu_postgresql_url_aqui

# Puerto del servidor
PORT=3000
```

## 🔧 Configuración de Twilio

1. **Obtener credenciales:**
   - Ve a [Twilio Console](https://console.twilio.com/)
   - Copia tu `Account SID` y `Auth Token`

2. **Configurar WhatsApp Sandbox:**
   - Ve a [Twilio WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
   - Sigue las instrucciones para unirte al sandbox enviando un mensaje desde tu WhatsApp
   - Copia el número de WhatsApp de Twilio (generalmente `whatsapp:+14155238886`)

3. **Configurar Webhook:**
   - En la consola de Twilio, ve a la configuración de WhatsApp Sandbox
   - En "When a message comes in", ingresa la URL de tu webhook
   - Si estás en desarrollo local, usa ngrok (ver sección abajo)

### 📱 Alternativa: WhatsApp Business API (Producción - De Pago)

El **Twilio Sandbox es gratuito** pero tiene limitaciones (usuarios deben enviar código "join" para registrarse, no puedes personalizar foto/nombre del bot). Para producción profesional:

**WhatsApp Business API ofrece:**
- ✅ Tu propio número de WhatsApp dedicado
- ✅ Foto de perfil y nombre personalizable
- ✅ Usuarios NO necesitan enviar código de registro
- ✅ Sin límite de usuarios
- ✅ Mensajes iniciados por el negocio (con plantillas aprobadas)

**Requisitos:**
- Número de teléfono dedicado (NO puede estar registrado en WhatsApp personal)
- Facebook Business Manager verificado
- Aprobación de Meta (1-7 días)

**Costos aproximados (Twilio):**
- ~$0.005 - $0.012 USD por mensaje (varía por país)
- Número virtual: ~$1-2 USD/mes

**Cómo activar:**
1. Ve a [Twilio WhatsApp](https://www.twilio.com/whatsapp)
2. Click en "Request Access" para WhatsApp Business
3. Sigue el proceso de verificación
4. Una vez aprobado, tu código actual funciona igual, solo cambias las credenciales

**Alternativas a Twilio:**
- [Meta Cloud API](https://developers.facebook.com/products/whatsapp/) - 1,000 conversaciones gratis/mes
- [360dialog](https://www.360dialog.com/) - Más económico en algunos países
- [Vonage](https://www.vonage.com/communications-apis/messages/) - Alternativa global

## 🔑 Configuración de Groq AI (Gratuito)

1. Ve a [Groq Console](https://console.groq.com/keys)
2. Crea una cuenta (NO requiere tarjeta de crédito)
3. Crea una nueva API Key
4. Cópiala y pégala en tu archivo `.env`

## 🗄️ Configuración de Base de Datos PostgreSQL

1. Ve a [Neon.tech](https://neon.tech) (plan gratuito disponible)
2. Crea una nueva base de datos
3. Copia la connection string
4. Pégala en `DATABASE_URL` en tu `.env`
5. Ejecuta el script de configuración:
   ```bash
   node setup_database.js
   ```

## 🌐 Exponer tu servidor local (Desarrollo)

Para que Twilio pueda enviar mensajes a tu servidor local, necesitas exponerlo a internet:

### Opción 1: Usar ngrok (Recomendado para desarrollo)

1. **Instalar ngrok:**
   - Descarga desde [ngrok.com](https://ngrok.com/)
   - O instala con npm: `npm install -g ngrok`

2. **Iniciar el servidor:**
```bash
npm start
```

3. **En otra terminal, exponer el puerto:**
```bash
ngrok http 3000
```

4. **Copiar la URL pública:**
   - ngrok te dará una URL como `https://1234-56-78-90.ngrok.io`
   - Tu webhook será: `https://1234-56-78-90.ngrok.io/webhook`

5. **Configurar en Twilio:**
   - Pega esta URL en la configuración de WhatsApp Sandbox de Twilio

### Opción 2: Desplegar en Google Cloud Run (Producción - $300 Gratis)

**Requisitos previos:**
- [Google Cloud CLI instalado](https://cloud.google.com/sdk/docs/install)
- Cuenta de Google Cloud con $300 en créditos trial

**Pasos:**

1. **Autenticarte y configurar proyecto:**
```bash
gcloud auth login
gcloud config set project TU_PROJECT_ID
```

2. **Habilitar servicios necesarios:**
```bash
gcloud services enable cloudbuild.googleapis.com run.googleapis.com
```

3. **Dar permisos a la cuenta de servicio:**
```bash
# Reemplaza PROJECT_NUMBER con tu número de proyecto
gcloud projects add-iam-policy-binding TU_PROJECT_ID \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.builder"

gcloud projects add-iam-policy-binding TU_PROJECT_ID \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/storage.objectViewer"
```

4. **Deploy (desde la carpeta del proyecto):**
```bash
gcloud run deploy chatbot-whatsapp \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "TWILIO_ACCOUNT_SID=tu_sid,TWILIO_AUTH_TOKEN=tu_token,TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886,GROQ_API_KEY=tu_groq_key,DATABASE_URL=tu_database_url"
```

5. **Configurar Webhook en Twilio:**
   - Te dará una URL como: `https://chatbot-whatsapp-xxxxx.us-central1.run.app`
   - Ve a [Twilio Console](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
   - En "When a message comes in", pon: `https://tu-url.run.app/webhook`
   - Método: `POST`

**✅ Ventajas de Google Cloud Run:**
- Siempre activo (no se duerme)
- Escalado automático
- $300 en créditos gratis por 90 días
- Performance superior
- Ideal para producción

**🔄 Para actualizar el chatbot después de cambios:**
```bash
# Después de modificar el código:
git add .
git commit -m "descripción de los cambios"
git push

# Re-desplegar en Google Cloud:
gcloud run deploy chatbot-whatsapp \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```
*Las variables de entorno se mantienen, no necesitas ponerlas de nuevo*

## ▶️ Ejecutar el Proyecto

```bash
# Modo normal
npm start

# Modo desarrollo (auto-reload en Node.js 18+)
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 📱 Probar el Chatbot

1. Asegúrate de que tu servidor esté corriendo
2. Si usas ngrok, verifica que esté exponiendo el puerto
3. Envía un mensaje de WhatsApp al número de Twilio
4. ¡El chatbot debería responder con IA!

## 🛠️ Estructura del Proyecto

```
chatbot/
├── server.js           # Servidor Express principal
├── setup_database.js   # Script para crear base de datos
├── package.json        # Dependencias del proyecto
├── Dockerfile          # Configuración Docker para Cloud Run
├── .dockerignore       # Archivos excluidos de Docker
├── .env                # Variables de entorno (no subir a git)
├── .env.example        # Ejemplo de configuración
├── .gitignore          # Archivos ignorados por git
└── README.md           # Este archivo
```

## 🔧 Cómo Funciona

### Flujo de Mensajes:

1. **Usuario envía mensaje(s) por WhatsApp** 
   - Puede enviar uno o varios mensajes seguidos

2. **Sistema de buffer (3 segundos)**
   - El chatbot espera 3 segundos después del último mensaje
   - Agrupa todos los mensajes recibidos en ese período
   - Ejemplo: Si escribes "Hola", "¿Cuánto debo?", "Soy el socio 001" → Se procesan juntos

3. **Análisis del mensaje agrupado**
   - Detecta si necesita consultar la base de datos
   - Keywords: socio, medidor, factura, pago, consumo, horario, atención, etc.

4. **Consulta a la base de datos (si es necesario)**
   - Groq AI convierte la pregunta en lenguaje natural a SQL
   - Ejecuta la consulta en PostgreSQL
   - Obtiene datos reales

5. **Generación de respuesta**
   - Groq AI formula una respuesta clara y concisa
   - Usa los datos de la BD si los consultó
   - Mantiene el contexto de la conversación

6. **Respuesta por WhatsApp**
   - Envía una sola respuesta coherente
   - Máximo 1500 caracteres para compatibilidad con WhatsApp

### Ejemplo de Uso:

```
Usuario: "Hola"
Usuario: "Soy el socio 001"
Usuario: "¿Cuánto debo?"

[Chatbot espera 3 segundos después del último mensaje]

Chatbot: "¡Hola! Vi que eres el socio 001 - Juan Pérez. 
Consultando tu cuenta... Tienes una factura pendiente 
de $45.50 correspondiente al mes de noviembre. ¿Te 
gustaría saber cómo realizar el pago?"
```

## 🔄 Personalizar el Chatbot

Puedes personalizar el comportamiento del chatbot editando el mensaje del sistema en `server.js` (líneas 195-210):

```javascript
{
  role: 'system',
  content: 'Eres el asistente virtual de la Cooperativa de Agua Potable La Compañía 💧, fundada en 1968 en Chile. Atendemos a 7 sectores: Aníbana, Molinos, La Compañía, Santa Margarita, Maitén 1, Maitén 2 y La Morera.\n\nPuedes ayudar con:\n💰 Facturas, pagos y convenios (sin intereses)\n📊 Consumo, lecturas y medidores\n🎁 Subsidio de agua potable (15m³, 3 años)\n🤝 Fondo solidario (incendios, enfermedades, invalidez)\n⚠️ Emergencias y cortes programados\n🌐 Información sobre nuestra página web\n📖 Historia y misión de la cooperativa\n\nIMPORTANTE:\n- Respuestas CORTAS y DIRECTAS (máximo 300 caracteres)\n- USA EMOJIS y formato visual atractivo (listas con •, -, números)\n- Divide la información en párrafos cortos\n- Usa saltos de línea para mejor lectura\n- Si es una lista, usa viñetas o emojis\n- Si preguntan temas NO relacionados con la cooperativa, responde amablemente que solo ayudas con agua potable\n- Tienes acceso a la base de datos\n- Sé amigable, profesional y servicial\n- Responde siempre en español'
}
```

**Características del prompt actual:**
- ✅ Contexto específico de la cooperativa (nombre, fundación, sectores)
- ✅ Lista clara de servicios con emojis
- ✅ Instrucciones de formato visual para WhatsApp
- ✅ Límite de caracteres para respuestas concisas
- ✅ Restricción de alcance (solo temas de agua potable)

**Para personalizar:**
1. Cambia el nombre de la organización
2. Ajusta los servicios ofrecidos
3. Modifica los emojis según tu marca
4. Cambia el límite de caracteres según tu necesidad
5. Ajusta el tono (formal, casual, técnico, etc.)

## ⚠️ Notas Importantes

- El historial de conversaciones se guarda en memoria (se pierde al reiniciar el servidor)
- Groq AI es GRATUITO (sin necesidad de tarjeta de crédito)
- Neon PostgreSQL tiene plan gratuito generoso
- Google Cloud Run tiene $300 en créditos gratis por 90 días
- El sandbox de WhatsApp de Twilio tiene limitaciones (solo números pre-autorizados)
- Para producción, necesitas una cuenta de WhatsApp Business aprobada

## 🐛 Solución de Problemas

**El webhook no recibe mensajes:**
- Verifica que ngrok esté corriendo
- Confirma que la URL en Twilio sea correcta
- Revisa los logs del servidor

**Error de autenticación de Twilio:**
- Verifica que `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN` sean correctos
- Asegúrate de no tener espacios extras en el archivo `.env`

**Error de Groq AI:**
- Verifica que tu API Key sea válida
- Confirma que la copiaste correctamente (sin espacios)
- Groq es gratuito, no requiere créditos

**Error de Base de Datos:**
- Verifica que la URL de conexión sea correcta
- Confirma que ejecutaste `setup_database.js` y `add_horarios.js`
- Revisa que la base de datos esté accesible desde internet

## 📚 Recursos

- [Documentación de Twilio WhatsApp](https://www.twilio.com/docs/whatsapp)
- [Documentación de Groq AI](https://console.groq.com/docs)
- [Neon PostgreSQL](https://neon.tech/docs)
- [Google Cloud Run](https://cloud.google.com/run/docs)
- [Express.js](https://expressjs.com/)
- [ngrok](https://ngrok.com/docs)

## 📄 Licencia

ISC
