import * as user from '../Database/User'
import jsonwebtoken = require('jsonwebtoken');  // JWT generation
import passport = require('passport');           
import passportHTTP = require('passport-http');
import { Router } from 'express';

const router = Router();
const roleTypes = user.roleTypes;

passport.use( new passportHTTP.BasicStrategy(
    function(username, password, done) {
        console.log("New login attempt from " + username );

        user.userModel.findOne({ email: username }).then((user)=>{
            if( !user ) 
                return done(null,false,{statusCode: 500, error: true, errormessage:"Invalid user"});

            if(user.validatePassword(password))
                return done(null, user);

            return done(null,false,{statusCode: 500, error: true, errormessage:"Invalid password"});
        });
    }
));

router.get('/', passport.authenticate('basic', { session: false }),(req, res) => {
    console.log("Login granted. Generating token" );

    let tokendata = {
        name: req.user.name,  
        role: req.user.role,
        email: req.user.email,
        id : req.user._id
    };
    let token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn: '24h' } );
    res.cookie('token', token_signed, {httpOnly: true, secure: true, sameSite: 'none'});

    //app.redirect('/home');
    return res.status(200).json({ error: false, errormessage: "", token: token_signed });
})

router.post('/', (req, res) => {
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(401).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role !== roleTypes.ADMIN)
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            let my_user = user.newUser({
                name: req.body.name,
                email: req.body.email,
                role: req.body.role//TODO: capisci meglio che fare qua con roleTypes
            }); 
            my_user.setPassword(req.body.password);
            my_user.save().then((user) => { res.send(user); });
        }
    });  
})

export default router;