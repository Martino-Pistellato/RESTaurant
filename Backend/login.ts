import * as user from './Database/User'
const mongoose = require('mongoose');
//import user from 'Backend/'
const express = require('express')
const app = express()
const app_route =  express.Router();

import http = require('http');
let server = http.createServer(app);
server.listen(3000, () => console.log("HTTP Server started on port 3000"));
const port = 3000;

app.use( express.json( ) );

app.get('/', (req, res) => {
    res.send('before login')
})
app.post('/', (req, res) => {
})

app.get('/register', (req, res) => {
    res.send('before register')
})
app.post('/register', (req, res) => {
    mongoose.connect(
        'mongodb+srv://Furellato:XV5Nbg3sRBz5flZN@restaurant.bqyjdfs.mongodb.net/RESTaurant_db?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        let my_user = user.userModel.create(req.body).then((waiter) => {
            res.send(waiter);
        });
    })
})