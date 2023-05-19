import * as user from './Database/User'
import jsonwebtoken = require('jsonwebtoken');  // JWT generation
import fs = require('fs');
import http = require('http'); 
import https = require('https');                // HTTPS module
import colors = require('colors');
import passport = require('passport');           
import passportHTTP = require('passport-http');
import mongoose = require('mongoose');
import { nextTick } from 'process';
import cors = require('cors');  
import { Server } from "socket.io";
import express = require('express');
const result = require('dotenv').config()
const { expressjwt: jwt } = require('express-jwt') ; 
const {MongoClient} = require('mongodb');


const app = express()
const app_route =  express.Router();

let server = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
},app);
let ios = new Server(server);
//let server = http.createServer(app);
server.listen(3000, () => console.log("HTTPS Server started on port 3000"));
const port = 3000;

colors.enabled = true;
let auth = jwt( {
                  secret: process.env.JWT_SECRET, 
                  algorithms: ["HS256"]
                } );


if (result.error) {
  console.log("Unable to load \".env\" file. Please provide one to store the JWT secret key");
  process.exit(-1);
}
if( !process.env.JWT_SECRET ) {
  console.log("\".env\" file loaded but JWT_SECRET=<secret> key-value pair was not found");
  process.exit(-1);
}


declare global {
  namespace Express {
      interface User {
        email:string,
        name: string,
        role: string,
        id: string
      }

      interface Request {
        auth: {
          email: string;
        }
      }
    }
}


app.use( cors() );
app.use( express.json( ) );

passport.use( new passportHTTP.BasicStrategy(
    function(username, password, done) {
      console.log("New login attempt from ".green + username );

      mongoose.connect(
      'mongodb+srv://Furellato:XV5Nbg3sRBz5flZN@restaurant.bqyjdfs.mongodb.net/RESTaurant_db?retryWrites=true&w=majority')
      .then(()=>{
        user.userModel.findOne( {email: username}).then((user)=>{
          if( !user ) {
            return done(null,false,{statusCode: 500, error: true, errormessage:"Invalid user"});
          }
    
          if( user.validatePassword( password ) ) {
            return done(null, user);
          }
    
          return done(null,false,{statusCode: 500, error: true, errormessage:"Invalid password"});
        });
      });
    }
  ));

app.get('/', passport.authenticate('basic', { session: false }),(req, res) => {
  console.log("Login granted. Generating token" );

    let tokendata = {
      name: req.user.name,
      role: req.user.role,
      email: req.user.email
    };
    let token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn: '24h' } );
    
    return res.status(200).json({ error: false, errormessage: "", token: token_signed });
})

app.get('/register', (req, res) => {
    res.send('before register')
})
app.post('/register', (req, res) => {
    mongoose.connect(
    'mongodb+srv://Furellato:XV5Nbg3sRBz5flZN@restaurant.bqyjdfs.mongodb.net/RESTaurant_db?retryWrites=true&w=majority')
    .then(() => {
      let my_user = user.newUser(req.body); //TODO: risistemare
      my_user.setPassword('123456');
      my_user.save().then((user) => {
            res.send(user);
      });
    })
})
