import { roleTypes } from '../Database/User'
import * as order from '../Database/Order'
import jsonwebtoken = require('jsonwebtoken');  // JWT generation
import { Router } from 'express';
import { tableModel } from '../Database/Table';

const router = Router();

//Get orders that a certain waiter took (why do we use payload here, but not when getting tables a certain waiter serves?)
router.get('/', (req, res) => {
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(401).json({ error: true, errormessage: "An error occurred" });
        else{
            if (payload.role != roleTypes.WAITER)
                order.orderModel.find().then((order) => { res.send(order); }); 
            else
                order.orderModel.find().populate({
                    path: 'tables',
                    match: { waiterId: payload.id }
                })
                .then((orders) => { 
                    let my_orders = [];

                    orders.forEach((order) => {
                    if (order.tables.length > 0)
                        my_orders.push(order);
                    });
        
                    res.send(my_orders); 
                });    
        }
    });  
})

//Create new order route
router.post('/', (req, res) => {
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(401).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role !== roleTypes.ADMIN && payload.role !== roleTypes.WAITER)
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            if (req.body.tables.length === 0)
                return res.status(401).json({ error: true, errormessage: "No tables selected" });
            else{
                let my_order = order.newOrder({ tables: req.body.tables });
                my_order.save().then((order) => { 
                    res.send(order); 
                    //adds orderid to cookie
                    //redirect /food in GET
                });
            }      
        }
    });  
})

//Add foods or drinks to a certain order
router.put('/:orderID', (req, res) => { //we use cookie, not orderID
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(401).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role !== roleTypes.COOK && payload.role !== roleTypes.BARMAN && payload.role !== roleTypes.WAITER)
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            if (payload.role == roleTypes.COOK)
                order.orderModel.findOne({_id: req.params.orderID}).then((order) => {
                    order.foods_prepared.push(...order.foods_ordered);
                    order.foods_ordered = [];
                    order.save().then((order) => { res.send(order); }); //maybe add a notification for the waiter
                });
            else if (payload.role == roleTypes.BARMAN)
                order.orderModel.findOne({_id: req.params.orderID}).then((order) => {
                    order.beverages_prepared.push(...order.beverages_ordered);
                    order.beverages_ordered = [];
                    order.save().then((order) => { res.send(order); }); //maybe add a notification for the waiter
                });
            else 
                order.orderModel.findOne({_id: req.params.orderID}).then((order) => {
                    order.beverages_ordered.push(...req.body.beverages);
                    order.foods_ordered.push(...req.body.foods);
                    order.save().then((order) => { res.send(order); }); //maybe add a notification for the cooks/barmans
                });
        }
    });  
})

//Delete order and create recipe route
router.delete('/:orderID', (req, res) => {
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(401).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role !== roleTypes.ADMIN && payload.role !== roleTypes.CASHIER)
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            order.orderModel.findOneAndDelete({_id: req.params.orderID})
            .populate('foods_prepared')
            .populate('beverages_prepared')
            .populate('tables')
            .then((order) => { 
                let total = 0;

                order.foods_prepared.forEach((food) => { total += food['price']; });
                order.beverages_prepared.forEach((beverage) => { total += beverage['price']; });

                order.tables.forEach((table) => { 
                    tableModel.findOne({_id: table['_id']}).then((table) => {
                        table.changeStatus(null);
                        table.save();
                    });
                });
                
                let receipe = {
                    order: order['_id'],
                    tables: order.tables.map((table) => { return table['number']; }),
                    foods: order.foods_prepared.map((food) => { return food['name']; }), //should we also show the price?
                    beverages: order.beverages_prepared.map((beverage) => { return beverage['name']; }), //price?
                    total: total
                }
                
                //total_of_the_day += total;
                res.send(receipe); 
            });
        }
    });  
})

export default router;