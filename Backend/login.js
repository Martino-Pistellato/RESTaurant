"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var user = require("./Database/User");
var http = require("http"); // HTTP module
var colors = require("colors");
var mongoose = require("mongoose");
var cors = require("cors");
var express = require("express");
var result = require('dotenv').config();
var jwt = require('express-jwt').expressjwt;
var app = express();
var app_route = express.Router();
var server = http.createServer(app);
server.listen(3000, function () { return console.log("HTTP Server started on port 3000"); });
var port = 3000;
colors.enabled = true;
var ios = undefined;
var auth = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"]
});
if (result.error) {
    console.log("Unable to load \".env\" file. Please provide one to store the JWT secret key");
    process.exit(-1);
}
if (!process.env.JWT_SECRET) {
    console.log("\".env\" file loaded but JWT_SECRET=<secret> key-value pair was not found");
    process.exit(-1);
}
app.use(cors());
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
        var my_user = user.userModel.create(req.body).then(function (waiter) {
            res.send(waiter);
        });
    });
});
