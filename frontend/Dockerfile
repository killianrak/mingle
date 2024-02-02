FROM node:latest as BUILD_IMAGE

WORKDIR /app-react

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

FROM node:latest as PRODUCTION_IMAGE

WORKDIR /app-react

COPY --from=BUILD_IMAGE /app-react/dist/ /app-react/dist/ 

COPY package.json .

RUN npm install 

COPY vite.config.js .

COPY default.conf .

FROM nginx:latest

COPY --from=PRODUCTION_IMAGE /app-react/default.conf /etc/nginx/conf.d/default.conf
COPY --from=PRODUCTION_IMAGE /app-react/dist/ /var/www/html/

EXPOSE 80 

CMD ["nginx", "-g", "daemon off;"]
