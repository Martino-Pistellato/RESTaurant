import {roleTypes} from '../Database/User'
import * as food from '../Database/Food'
import jsonwebtoken = require('jsonwebtoken');  // JWT generation
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(401).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role !== roleTypes.ADMIN && payload.role !== roleTypes.WAITER) //TODO: add cooks?
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            food.foodModel.find().then((foods) => { res.send(foods); }); 
            //redirect order in PUT
        }
    });  
})

export default router;