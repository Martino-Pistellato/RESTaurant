"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require('mongoose');
var express = require('express');
var app = express();
var app_route = express.Router();
var http = require("http");
var server = http.createServer(app);
server.listen(3000, function () { return console.log("HTTP Server started on port 3000"); });
var port = 3000;
app.use(express.json());
app.get('/', function (req, res) {
    res.send('before login');
});
app.post('/', function (req, res) {
});
app.get('/register', function (req, res) {
    res.send('before register');
});
app.post('/register', function (req, res) {
    mongoose.connect('mongodb+srv://Furellato:XV5Nbg3sRBz5flZN@restaurant.bqyjdfs.mongodb.net/RESTaurant_db?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(function () {
        var my_user = User_1.User.Model().create(req.body).then(function (waiter) {
            res.send(waiter);
        });
    });
});
