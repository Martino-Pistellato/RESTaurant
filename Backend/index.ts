import fs = require('fs');
import https = require('https');  
import mongoose = require('mongoose');
import cors = require('cors');  
import { Server } from "socket.io";
import express = require('express');
import cookieParser = require('cookie-parser');
import jsonwebtoken = require('jsonwebtoken');  // JWT generation
import passport = require('passport');           
import passportHTTP = require('passport-http');

import { userModel, roleTypes } from './Database/User';
import users_router from './Routing/users_routing';
import foods_router from './Routing/foods_routing';
import orders_router from './Routing/orders_routing';
import tables_router from './Routing/tables_routing';

const result = require('dotenv').config();
const { expressjwt: jwt } = require('express-jwt');
const auth = jwt({
    secret: process.env.JWT_SECRET, 
    algorithms: ["HS256"]
});

passport.use( new passportHTTP.BasicStrategy(
    function(email, password, done) {
        console.log("New login attempt from " + email );

        userModel.findOne({ email: email }).then((user)=>{
            if( !user ) 
                return done(null,false,{statusCode: 500, error: true, errormessage:"Invalid user"});

            if(user.validatePassword(password))
                return done(null, user);

            return done(null,false,{statusCode: 500, error: true, errormessage:"Invalid password"});
        });
    }
));

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
app.use( cors({origin: "https://localhost:4200"}) );
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

//Login route
app.get('/login', passport.authenticate('basic', { session: false }),(req, res) => {
    console.log("Login granted. Generating token" );

    let tokendata = {
        name: req.user.name,  
        role: req.user.role,
        email: req.user.email,
        id : req.user._id
    };
    let token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn: '10m' } );
    //res.cookie('token', token_signed, {httpOnly: true, secure: true, sameSite: 'none'});//TODO: we can eliminate it

    //app.redirect('/home');
    res.send({token: token_signed});
})





//TODO: add @login_required (or something like that)
//TODO: add logout