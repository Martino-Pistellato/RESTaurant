import * as user from './Database/User'
import * as table from './Database/Table'
import * as food from './Database/Food'
import jsonwebtoken = require('jsonwebtoken');  // JWT generation
import fs = require('fs');
import https = require('https');                // HTTPS module
import colors = require('colors');
import passport = require('passport');           
import passportHTTP = require('passport-http');
import mongoose = require('mongoose');
import cors = require('cors');  
import { Server } from "socket.io";
import express = require('express');
import cookieParser = require('cookie-parser');
const result = require('dotenv').config();
const { expressjwt: jwt } = require('express-jwt');

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

mongoose.connect('mongodb+srv://Furellato:XV5Nbg3sRBz5flZN@restaurant.bqyjdfs.mongodb.net/RESTaurant_db?retryWrites=true&w=majority');

const app = express();
app.use( cors() );
app.use( express.json( ) );
app.use( cookieParser() );

//express app.router o qualcosa di simile

let server = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
},app);
let ios = new Server(server);
server.listen(3000, () => console.log("HTTPS Server started on port 3000"));

colors.enabled = true;
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

//--------------------USER--------------------

passport.use( new passportHTTP.BasicStrategy(
    function(username, password, done) {
      console.log("New login attempt from ".green + username );

      user.userModel.findOne({ email: username }).then((user)=>{
        if( !user ) 
          return done(null,false,{statusCode: 500, error: true, errormessage:"Invalid user"});

        if(user.validatePassword(password))
          return done(null, user);

        return done(null,false,{statusCode: 500, error: true, errormessage:"Invalid password"});
      });
    }
));

app.get('/login', passport.authenticate('basic', { session: false }),(req, res) => {
  console.log("Login granted. Generating token" );

  let tokendata = {
    name: req.user.name,  
    role: req.user.role,
    email: req.user.email
  };
  let token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn: '24h' } );
  res.cookie('token', token_signed, {httpOnly: true, secure: true, sameSite: 'none'});

  //app.redirect('/home');
  return res.status(200).json({ error: false, errormessage: "", token: token_signed });
})

app.post('/user', (req, res) => {
  jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
    if (error) 
      return res.status(401).json({ error: true, errormessage: "An error occurred" });
    else if (! (payload.role === 'admin'))
      return res.status(401).json({ error: true, errormessage: "Unauthorized" });
    else{
      let my_user = user.newUser({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
      }); 
      my_user.setPassword(req.body.password);
      my_user.save().then((user) => { res.send(user); });
    }
  });  
})

//--------------------TABLES--------------------

app.get('/tables', (req, res) => {
  jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
    if (error) 
      return res.status(401).json({ error: true, errormessage: "An error occurred" });
    else if (! (payload.role === 'waiter' || payload.role === 'cashier'))
      return res.status(401).json({ error: true, errormessage: "Unauthorized" });
    else{
      table.tableModel.find().then((tables) => { res.send(tables); });
    }
  });  
})

app.put('/tables/:id', (req, res) => {
  jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
    if (error) 
      return res.status(401).json({ error: true, errormessage: "An error occurred" });
    else if (! (payload.role === 'waiter' || payload.role === 'admin'))
      return res.status(401).json({ error: true, errormessage: "Unauthorized" });
    else{
      table.tableModel.findOne({id: req.params.id}).then((table) => { 
        table.changeStatus();
        res.send(table); 
      });
    }
  });  
})

app.post('/tables', (req, res) => {
  jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
    if (error) 
      return res.status(401).json({ error: true, errormessage: "An error occurred" });
    else if (! (payload.role === 'admin'))
      return res.status(401).json({ error: true, errormessage: "Unauthorized" });
    else{
      let my_table = table.newTable({
        capacity: req.body.capacity,
        isFree: true
      }); 
      my_table.save().then((table) => { res.send(table); });
    }
  });  
})

//--------------------FOOD--------------------

app.get('/foods/', (req, res) => {
  jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
    if (error) 
      return res.status(401).json({ error: true, errormessage: "An error occurred" });
    else if (! (payload.role === 'waiter'))
      return res.status(401).json({ error: true, errormessage: "Unauthorized" });
    else{
      food.foodModel.find().then((foods) => { res.send(foods); });
    }
  });  
})

app.put('/tables/:orderID/:foodID', (req, res) => {
  jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
    if (error) 
      return res.status(401).json({ error: true, errormessage: "An error occurred" });
    else if (! (payload.role === 'waiter' || payload.role === 'admin'))
      return res.status(401).json({ error: true, errormessage: "Unauthorized" });
    else{
      food.foodModel.findOne({id: req.params.foodID}).then((food) => { 
        //i think it's better to create a local array of foods and when it's complete then the order is created
      });
    }
  });  
})


