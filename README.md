# 🤖 Chatbot de WhatsApp con IA para Cooperativa de Agua Potable

Un chatbot inteligente para WhatsApp que utiliza Twilio para mensajería, Groq AI (gratuito) para inteligencia artificial, y PostgreSQL para gestionar datos de socios, medidores, facturas y pagos de una cooperativa de agua potable.

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
├── server.js              # Servidor Express principal
├── setup_database.js      # Script para crear base de datos
├── add_horarios.js        # Script para agregar horarios
├── package.json           # Dependencias del proyecto
├── Dockerfile             # Configuración Docker para Cloud Run
├── .dockerignore          # Archivos excluidos de Docker
├── .env                   # Variables de entorno (no subir a git)
├── .env.example           # Ejemplo de configuración
├── .gitignore             # Archivos ignorados por git
├── DEPLOY_GOOGLE_CLOUD.md # Guía de despliegue en GCP
└── README.md              # Este archivo
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
