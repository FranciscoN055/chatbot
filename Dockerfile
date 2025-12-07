# Dockerizar la aplicación para Google Cloud Run
FROM node:18-slim

# Directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código
COPY . .

# Puerto que usa Cloud Run
ENV PORT=8080

# Comando de inicio
CMD ["npm", "start"]
