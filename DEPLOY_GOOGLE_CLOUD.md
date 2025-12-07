# Deploy a Google Cloud Run

## Requisitos:
- Cuenta de Google Cloud con $300 de créditos trial
- [Google Cloud CLI instalado](https://cloud.google.com/sdk/docs/install)

## Pasos:

### 1. Instalar gcloud CLI (si no lo tienes)
Descarga desde: https://cloud.google.com/sdk/docs/install

### 2. Autenticarte
```bash
gcloud auth login
gcloud config set project TU_PROJECT_ID
```

### 3. Habilitar servicios necesarios
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
```

### 4. Build y Deploy
Desde la carpeta del proyecto:
```bash
gcloud run deploy chatbot-whatsapp \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "TWILIO_ACCOUNT_SID=tu_sid,TWILIO_AUTH_TOKEN=tu_token,TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886,GROQ_API_KEY=tu_groq_key,DATABASE_URL=tu_database_url"
```

### 5. Obtener URL
Después del deploy, te dará una URL como:
```
https://chatbot-whatsapp-xxxxx-uc.a.run.app
```

### 6. Configurar Webhook en Twilio
Ve a Twilio Console y pon:
```
https://chatbot-whatsapp-xxxxx-uc.a.run.app/webhook
```

## Ventajas de Cloud Run:
- ✅ No se duerme (siempre activo)
- ✅ Escalado automático
- ✅ $300 en créditos gratis
- ✅ Performance superior

## Desventajas:
- ⚠️ Configuración más compleja
- ⚠️ Después de 90 días o gastar $300, necesitas pagar
- ⚠️ Requiere instalar Google Cloud CLI

## Monitorear costos:
https://console.cloud.google.com/billing
