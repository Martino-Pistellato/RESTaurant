import {roleTypes} from '../Database/User'
import * as food from '../Database/Food'
import jsonwebtoken = require('jsonwebtoken');  // JWT generation
import { Router } from 'express';
import { my_authorize } from '../utils';

const router = Router();

//Get all foods and drinks in the menu route
router.get('/', my_authorize([roleTypes.ADMIN, roleTypes.WAITER]), (req, res) => {
    food.foodModel.find().then((foods) => { res.send(foods); }); 
    //redirect order in PUT
})

//Create new food/drink route
router.post('/', my_authorize([roleTypes.ADMIN]), (req, res) => {
    let newFood = food.newFood({
        name: req.body.name,
        price: req.body.price,
        ingredients: req.body.ingredients,
        prepareTime: req.body.prepareTime,
        type: req.body.type
    }); 
    newFood.save().then(() => { res.send(newFood); });  
})

//Delete food/drink route
router.delete('/:foodID', my_authorize([roleTypes.ADMIN]), (req, res) => {
    food.foodModel.findOneAndDelete({_id: req.params.foodID}).then(() => { res.send("Food deleted"); });
})

export default router;