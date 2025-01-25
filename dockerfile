FROM node:21-alpine3.19

WORKDIR /user/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3001