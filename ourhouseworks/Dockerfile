#stage 1
FROM node:latest as node
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps
RUN npm run build --prod

#stage 2
FROM nginx:alpine
COPY --from=node /app/dist/ourhouseworks /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]