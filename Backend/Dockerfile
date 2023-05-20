FROM node:latest
EXPOSE 3000

COPY . /app
WORKDIR /app

RUN npm install
RUN npm link mongoose mongodb

RUN npx tsc Database/db_init.ts
RUN node Database/db_init

RUN npx tsc index
CMD [ "node", "index" ]