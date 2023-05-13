FROM node:latest
EXPOSE 27017

COPY . /app
WORKDIR /app

RUN npm install
RUN npm install mongodb mongoose typescript @types/mongoose @types/mongodb  --save
RUN npm link mongoose mongodb
CMD [ "node", "mongoose_test.js" ]