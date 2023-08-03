FROM node:latest

WORKDIR /usr/generator

COPY package*.json ./

RUN npm install

COPY src/index.js .
COPY src/range.json .

EXPOSE 7373

CMD ["node", "index.js"]
