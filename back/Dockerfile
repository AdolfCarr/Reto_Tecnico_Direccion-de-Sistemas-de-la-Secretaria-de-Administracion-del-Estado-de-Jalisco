# Usar Node.js 20 Alpine
FROM node:20-alpine

# Instalar dependencias requeridas para crypto
RUN apk add --no-cache openssl

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Compilar la aplicación
RUN npm run build

# Comando para iniciar
CMD ["npm", "run", "start:prod"]