import { Router } from 'express';

import { roleTypes } from '../Database/User'
import * as food from '../Database/Food'
import { my_authorize, get_socket, Events } from '../utils';

const router = Router();

//Get all foods and drinks in the menu route
router.get('/', my_authorize([roleTypes.ADMIN, roleTypes.WAITER, roleTypes.CASHIER]), (req, res) => {
    food.foodModel.find().then((foods) => { res.send(foods); });
})

//Create new food/drink route
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

//Delete food/drink route
router.delete('/:food_id', my_authorize([roleTypes.ADMIN]), (req, res) => {
    food.foodModel.findByIdAndDelete(req.params.food_id).then(() => { 
        get_socket().emit(Events.UPDATE_FOODS_LIST);
        res.send("Food deleted"); 
    });
})

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