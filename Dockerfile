FROM node:latest

RUN apt update && apt -y install git

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm i --include=dev

COPY . .

CMD npm start