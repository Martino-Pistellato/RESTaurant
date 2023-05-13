FROM node:latest
EXPOSE 3000

COPY . /app
WORKDIR /app

RUN npm install
RUN npm install express nodemon cors typescript @types/node @types/express @types/cors --save
#CMD [ "node", "mongoose_test.js" ]