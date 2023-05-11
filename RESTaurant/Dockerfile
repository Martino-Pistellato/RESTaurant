FROM node:latest
RUN npm install -g @angular/cli
EXPOSE 4200
CMD [ "ng", "serve", "--host", "0.0.0.0" ]
WORKDIR /app
COPY . /app