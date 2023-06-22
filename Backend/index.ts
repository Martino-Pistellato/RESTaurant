import fs = require('fs');
import https = require('https');  
import mongoose = require('mongoose');
import cors = require('cors');  
import express = require('express');
import cookieParser = require('cookie-parser');
import jsonwebtoken = require('jsonwebtoken');  
import passport = require('passport');           
import passportHTTP = require('passport-http');

import { userModel } from './Database/User';
import users_router from './Routing/users_routing';
import foods_router from './Routing/foods_routing';
import orders_router from './Routing/orders_routing';
import tables_router from './Routing/tables_routing';
import { Events, set_socket, get_socket } from './utils';

const app = express();
const result = require('dotenv').config();
if( result.error ) {
    console.log("Unable to load \".env\" file. Please provide one to store the JWT secret key");
    process.exit(-1);
}
if( !process.env.JWT_SECRET ) {
    console.log("\".env\" file loaded but JWT_SECRET=<secret> key-value pair was not found");
    process.exit(-1);
}

mongoose.connect(process.env.DB_URI);

app.use( cors({origin: "https://localhost:4200"}) );
app.use( express.json( ) );
app.use( cookieParser() );

//We set all the routes defined in the Routing folder so the app can use them
app.use( '/users',  users_router );
app.use( '/orders', orders_router );
app.use( '/foods',  foods_router );
app.use( '/tables', tables_router );

//We create a server and we set it to listen on port 3000. Certification are specified since we will use HTTPS protocol. We also create a socket used to listen to certain events (i.e. notifications)
let server = https.createServer({
  key: fs.readFileSync('keys/key.pem'),
  cert: fs.readFileSync('keys/cert.pem')
}, app);
server.listen(3000, () => console.log("HTTPS Server started on port 3000"));
set_socket(server);
let io = get_socket();

//We use passport middleware for login authentication
passport.use( new passportHTTP.BasicStrategy(
    function(email: string, password: string, done: Function) {
        userModel.findOne({ email: email }).then((user)=>{
            if( !user ) 
                return done(null,false,{statusCode: 500, error: true, errormessage:"Invalid user"});

            if(user.validatePassword(password))
                return done(null, user);

            return done(null,false,{statusCode: 500, error: true, errormessage:"Invalid password"});
        });
    }
));

//This route handles the login phase.
//If the user is authenticated, a JWT valid for the next 9 hours is generated
app.get('/login', passport.authenticate('basic', { session: false }),(req, res) => {
    console.log("Login granted. Generating token" );
    
    userModel.findById(req.user._id).then((logged_user) => {
        logged_user.totalWorks = [];
        logged_user?.save().then((user) => {
            let tokendata = {
                name: req.user.name,  
                role: req.user.role,
                email: req.user.email,
                id : req.user._id
            };

            let token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn: '9h' } );
            res.send({token: token_signed});
        })
    })
})
