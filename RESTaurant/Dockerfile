FROM node:latest
EXPOSE 4200

COPY . /app
WORKDIR /app

RUN npm install npm@6
RUN npm install -g @angular/cli

CMD [ "ng", "serve", "--host", "0.0.0.0" ]