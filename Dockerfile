# Build stage (Vite app inside /app)
FROM node:18-alpine AS build
WORKDIR /app

COPY app/package*.json ./
RUN npm install

COPY app .
RUN npm run build

# Production stage (Nginx)
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
