import fs = require('fs');
import https = require('https');  
import mongoose = require('mongoose');
import cors = require('cors');  
import { Server } from "socket.io";
import express = require('express');
import cookieParser = require('cookie-parser');
import users_router from './Routing/users_routing';
import foods_router from './Routing/foods_routing';
import orders_router from './Routing/orders_routing';
import tables_router from './Routing/tables_routing';

const result = require('dotenv').config();
const { expressjwt: jwt } = require('express-jwt');
let auth = jwt({
    secret: process.env.JWT_SECRET, 
    algorithms: ["HS256"]
});

if( result.error ) {
    console.log("Unable to load \".env\" file. Please provide one to store the JWT secret key");
    process.exit(-1);
}
if( !process.env.JWT_SECRET ) {
    console.log("\".env\" file loaded but JWT_SECRET=<secret> key-value pair was not found");
    process.exit(-1);
}

mongoose.connect('mongodb+srv://Furellato:XV5Nbg3sRBz5flZN@restaurant.bqyjdfs.mongodb.net/RESTaurant_db?retryWrites=true&w=majority');

const app = express();
app.use( cors() );
app.use( express.json( ) );
app.use( cookieParser() );

app.use( '/users',  users_router );
app.use( '/orders', orders_router );
app.use( '/foods',  foods_router );
app.use( '/tables', tables_router );

let server = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}, app);
let ios = new Server(server);
server.listen(3000, () => console.log("HTTPS Server started on port 3000"));

//TODO: add @login_required (or something like that)
//TODO: add logout