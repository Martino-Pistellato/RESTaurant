import { Router } from 'express';

import { roleTypes } from '../Database/User'
import * as food from '../Database/Food'
import { my_authorize, get_socket, Events } from '../utils';

//In this file we define routes for Food

const router = Router();

//This route gets all food and drinks in the menu
router.get('/', my_authorize([roleTypes.ADMIN, roleTypes.WAITER, roleTypes.CASHIER]), (req, res) => {
    food.foodModel.find().then((foods) => { res.send(foods); });
})

//This route creates a new food/drink
router.post('/', my_authorize([roleTypes.ADMIN]), (req, res) => {
    let newFood = food.newFood({
        name: req.body.name,
        price: req.body.price,
        ingredients: req.body.ingredients,
        prepare_time: req.body.prepare_time,
        type: Number(req.body.type)
    }); 
    newFood.save().then(() => { 
        get_socket().emit(Events.UPDATE_FOODS_LIST);
        res.send(newFood); 
    });  
})

//This route deletes a food/drink
router.delete('/:food_id', my_authorize([roleTypes.ADMIN]), (req, res) => {
    food.foodModel.findByIdAndDelete(req.params.food_id).then(() => { 
        get_socket().emit(Events.UPDATE_FOODS_LIST);
        res.send("Food deleted"); 
    });
})

//This route updates a food/drink
router.patch('/:food_id', my_authorize([roleTypes.ADMIN]), (req, res) => {
    food.foodModel.findById(req.params.food_id).then((my_food) => { 
        if(req.body.name)
            my_food.name = req.body.name;
        if(req.body.price)
            my_food.price = req.body.price;
        if(req.body.ingredients && req.body.ingredients.length > 0)
            my_food.ingredients = req.body.ingredients;
        if(req.body.prepare_time)
            my_food.prepare_time = req.body.prepare_time;
        if(req.body.type)
            my_food.type = Number(req.body.type);

        my_food?.save().then(saved_food => {
            get_socket().emit(Events.UPDATE_FOODS_LIST);
            res.send(saved_food);
        })
    });
})

export default router;