FROM node:latest
EXPOSE 3000

COPY . /app
WORKDIR /app

RUN npm install
RUN npm install express nodemon cors typescript tsconfig-paths ajv mongodb mongoose @types/mongoose @types/mongodb @types/node @types/express @types/cors --save
RUN npm link mongoose mongodb
RUN npx tsc login

CMD [ "node", "login" ]