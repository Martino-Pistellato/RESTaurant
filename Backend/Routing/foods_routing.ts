import {roleTypes} from '../Database/User'
import * as food from '../Database/Food'
import jsonwebtoken = require('jsonwebtoken');  // JWT generation
import { Router } from 'express';

const router = Router();

//Get all foods and drinks in the menu route
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

//Create new food/drink route
router.post('/', (req, res) => {
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(401).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role !== roleTypes.ADMIN) //TODO: add cooks?
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            let newFood = food.newFood({
                name: req.body.name,
                price: req.body.price,
                ingredients: req.body.ingredients,
                prepareTime: req.body.prepareTime,
                type: req.body.type
            }); 
            newFood.save().then(() => { res.send(newFood); });
        }
    });  
})

//Delete food/drink route
router.delete('/:foodID', (req, res) => {
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(401).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role !== roleTypes.ADMIN) //add cooks?
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            food.foodModel.findAndDelete({_id: req.params.foodID}).then(() => { res.send("Food deleted"); });
        }
    });  
})

export default router;