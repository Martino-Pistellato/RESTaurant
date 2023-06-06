FROM node:latest
EXPOSE 3000

COPY . /app
WORKDIR /app

RUN npm install npm@6
RUN npm link mongoose mongodb
RUN npm i @types/node --save-dev

RUN npx tsc Database/db_init.ts
RUN node Database/db_init

RUN npx tsc index
CMD [ "node", "index" ]