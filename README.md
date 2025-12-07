# 🤖 Chatbot de WhatsApp con IA para Cooperativa de Agua Potable

Un chatbot inteligente para WhatsApp que utiliza Twilio para mensajería, Groq AI (gratuito) para inteligencia artificial, y PostgreSQL para gestionar datos de socios, medidores, facturas y pagos de una cooperativa de agua potable.

## 📋 Requisitos Previos

- Node.js (versión 14 o superior)
- Una cuenta de Twilio con WhatsApp habilitado
- Una API Key de Groq (gratuita, sin tarjeta de crédito)
- Base de datos PostgreSQL (recomendado: Neon.tech gratis)
- Railway.app o Render.com para deploy en producción (gratis)

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
   node add_horarios.js
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

### Opción 2: Desplegar en Render.com (Producción - Gratis)

1. **Crear cuenta en Render.com:**
   - Ve a [render.com](https://render.com) y crea una cuenta gratuita

2. **Conectar tu repositorio:**
   - Click en "New +" → "Web Service"
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio `FranciscoN055/chatbot`

3. **Configurar el servicio:**
   - **Name:** `chatbot-whatsapp` (o el nombre que prefieras)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Agregar variables de entorno:**
   - Click en "Advanced" → "Add Environment Variable"
   - Agrega cada variable de tu `.env`:
     ```
     TWILIO_ACCOUNT_SID=tu_account_sid_de_twilio
     TWILIO_AUTH_TOKEN=tu_auth_token_de_twilio
     TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
     GROQ_API_KEY=tu_groq_api_key
     DATABASE_URL=tu_postgresql_url_de_neon
     PORT=3000
     ```

5. **Deploy:**
   - Click en "Create Web Service"
   - Render automáticamente construirá y desplegará tu app
   - Te dará una URL como: `https://chatbot-whatsapp-xxxx.onrender.com`

6. **Configurar Webhook en Twilio:**
   - Ve a [Twilio Console](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
   - En "When a message comes in", pon: `https://tu-app.onrender.com/webhook`
   - Método: `POST`
   - Guarda los cambios

**⚠️ Nota importante de Render.com (plan gratuito):**
- El servicio se "duerme" después de 15 minutos de inactividad
- El primer mensaje puede tardar 30-60 segundos en responder (mientras "despierta")
- Después funciona normal
- Se reinicia automáticamente cada mes

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
├── package.json        # Dependencias del proyecto
├── .env               # Variables de entorno (no subir a git)
├── .env.example       # Ejemplo de configuración
├── .gitignore         # Archivos ignorados por git
└── README.md          # Este archivo
```

## 💡 Características

- ✅ Respuestas con IA usando Groq (llama-3.3-70b-versatile)
- ✅ Consultas inteligentes a base de datos PostgreSQL
- ✅ Generación automática de SQL desde lenguaje natural
- ✅ Gestión completa de cooperativa de agua potable
- ✅ Buffer de mensajes (agrupa mensajes rápidos)
- ✅ Historial de conversación por usuario
- ✅ Manejo de errores robusto
- ✅ Límite de caracteres para WhatsApp

## 🔄 Personalizar el Chatbot

Puedes personalizar el comportamiento del chatbot editando el mensaje del sistema en `server.js`:

```javascript
{
  role: 'system',
  content: 'Eres un asistente virtual amigable y servicial. Responde de manera clara, concisa y en español.'
}
```

Cambia este mensaje para darle una personalidad diferente, como:
- Un asistente de ventas
- Un soporte técnico
- Un tutor educativo
- etc.

## ⚠️ Notas Importantes

- El historial de conversaciones se guarda en memoria (se pierde al reiniciar el servidor)
- Para producción, considera usar una base de datos (MongoDB, PostgreSQL, etc.)
- Groq AI es GRATUITO (sin necesidad de tarjeta de crédito)
- Neon PostgreSQL tiene plan gratuito generoso
- Render.com tiene plan gratuito (con auto-sleep después de 15 min inactividad)
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
- [Render.com Deploy](https://render.com/docs)
- [Express.js](https://expressjs.com/)
- [ngrok](https://ngrok.com/docs)

## 📄 Licencia

ISC
