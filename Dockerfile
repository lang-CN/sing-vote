# Frontend Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm config set registry https://registry.npmmirror.com
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .
COPY public/favicon.ico ./favicon.ico
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
