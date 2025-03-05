# Usar una imagen base ligera con Node.js
FROM node:20-alpine AS builder

# Configurar el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Compilar la aplicación Angular
RUN npm run build -- --configuration production

# Usar una imagen base ligera con Nginx para servir la aplicación
FROM nginx:alpine

# Copiar los archivos compilados desde la etapa de construcción
COPY --from=builder /app/dist/front/browser /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx
# COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]