# 1️⃣ Build do app Vite (package.json dentro de /app)
FROM node:18-alpine AS build
WORKDIR /app

# Copia manifests do Vite
COPY app/package*.json ./
RUN npm install

# Copia o restante do app
COPY app .
RUN npm run build

# 2️⃣ Nginx para produção
FROM nginx:alpine

# Remove config padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia config SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia build final
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
