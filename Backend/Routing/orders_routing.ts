import { roleTypes } from '../Database/User'
import * as order from '../Database/Order'
import * as user from '../Database/User'
import { Router } from 'express';
import { tableModel } from '../Database/Table';
import { my_authorize } from '../utils';

const router = Router();
const orderStatus = order.orderStatus;

//Get orders that a certain waiter took (why do we use req.auth here, but not when getting tables a certain waiter serves?)
router.get('/', my_authorize([]), (req, res) => {
    if (req.auth.role === roleTypes.COOK)
        order.orderModel
            .find()
            .select('foods_ordered insertionDate status tables')
            .populate('foods_ordered')
            .populate('tables')
            .then((orders) => {
                let orders_to_return = [...orders];
                orders.forEach((my_order) => {
                    if (my_order.foods_ordered.length === 0 || 
                        my_order.payed || 
                        (new Date(my_order.insertionDate as Date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)))
                        orders_to_return.splice(orders_to_return.indexOf(my_order), 1);
                    else {
                        let total_queue_time = 0;
                        my_order.foods_ordered.forEach((food) => { total_queue_time += food['prepareTime']; });
                        my_order.total_queue_time = total_queue_time;
                    }
                });
                orders_to_return.sort((a, b) => { return a.insertionDate.getTime() - b.insertionDate.getTime(); });
                res.send(orders_to_return);
            });
    else if (req.auth.role === roleTypes.BARMAN)
        order.orderModel
            .find()
            .select('beverages_ordered insertionDate status tables')
            .populate('beverages_ordered')
            .populate('tables')
            .then((orders) => {
                let orders_to_return = [...orders];
                orders.forEach((my_order) => {
                    if (my_order.beverages_ordered.length === 0 || 
                        my_order.payed || 
                        (new Date(my_order.insertionDate as Date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)))
                        orders_to_return.splice(orders_to_return.indexOf(my_order), 1);
                    else {
                        let total_queue_time = 0;
                        my_order.beverages_ordered.forEach((food) => { total_queue_time += food['prepareTime']; });
                        my_order.total_queue_time = total_queue_time;
                    }
                });
                orders_to_return.sort((a, b) => { return a.insertionDate.getTime() - b.insertionDate.getTime(); });
                res.send(orders_to_return);
            });
    else if (req.auth.role === roleTypes.WAITER)
        order.orderModel.find()
            .populate({
                path: 'tables',
                match: { waiterId: req.auth.id }
            })
            .then((orders) => {
                let my_orders = [];

                orders.forEach((my_order) => {
                    if (my_order.tables.length > 0 && 
                        !my_order.payed && 
                        (new Date(my_order.insertionDate as Date).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)))
                        my_orders.push(my_order);
                });

                my_orders.sort((a, b) => { return a.insertionDate.getTime() - b.insertionDate.getTime(); });
                res.send(my_orders);
            });
    else
        order.orderModel.find()
            .populate('foods_ordered')
            .populate('beverages_ordered')
            .populate('foods_prepared')
            .populate('beverages_prepared')
            .populate('tables')
            .then((orders) => {
                let orders_to_return = [...orders];
                orders.forEach((my_order) => {
                    if (my_order.payed || new Date(my_order.insertionDate as Date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0))
                        orders_to_return.splice(orders_to_return.indexOf(my_order), 1);
                    else {
                        let total_queue_time = 0;

                        my_order.foods_ordered.forEach((food) => { total_queue_time += food['prepareTime']; });
                        my_order.beverages_ordered.forEach((beverage) => { total_queue_time += beverage['prepareTime']; });

                        my_order.total_queue_time = total_queue_time;
                    }
                });

                orders_to_return.sort((a, b) => { return a.insertionDate.getTime() - b.insertionDate.getTime(); });
                res.send(orders_to_return);
            });
})

router.get('/totalprofit', my_authorize([roleTypes.CASHIER]), (req, res) => {
    order.orderModel.find()
    .populate('foods_prepared')
    .populate('beverages_prepared')
    .then((orders) => {
        let total = 0;
        let today = new Date()
        let todayStart = new Date(today.setHours(0, 0, 0, 0))
        let todayEnd = new Date(today.setHours(23, 59, 59, 59))

        orders.forEach((order) => {
            if (order.payed && todayStart <= order.insertionDate && todayEnd >= order.insertionDate) {
                order.foods_prepared.forEach((food) => { total += food['price']; });
                console.log("after food",total)
                order.beverages_prepared.forEach((beverage) => { total += beverage['price']; });
                total += 2*order.covers;
                console.log("after covers",total)

            }
        });
        console.log("after all",total)

        res.send({ total: total });
    })
})

//Create new order route
router.post('/', my_authorize([roleTypes.ADMIN, roleTypes.WAITER]), (req, res) => {
    if (req.body.tables.length === 0)
        return res.status(400).json({ error: true, errormessage: "No tables selected" });
    else {
        let my_covers = 0;
        let my_tables: string[] = [];
        req.body.tables.forEach(table => {
            my_covers += table.occupancy;
            my_tables.push(table._id);
        }); 

        let my_order = order.newOrder({ tables: my_tables, covers: my_covers });
        my_order.save().then((order) => { 
            user.userModel.findOne({_id:req.auth.id}).then((user) => {
                user.totalWorks.push(order._id);
                user.save().then(data=>res.send(order));
            })
        });
    }
})

//Add foods or drinks to a certain order
router.put('/:orderID', my_authorize([roleTypes.COOK, roleTypes.BARMAN, roleTypes.WAITER, roleTypes.CASHIER]), (req, res) => { 
    if (req.auth.role === roleTypes.COOK)
        order.orderModel.findOne({ _id: req.params.orderID }).then((my_order) => {
            if (my_order.status.foods === orderStatus.RECEIVED) {
                my_order.status.foods = orderStatus.PREPARING;
                my_order.markModified('status');
                my_order.save().then((order_saved) => { res.send(order_saved); });
            }
            else if (my_order.status.foods === orderStatus.PREPARING) {
                my_order.foods_prepared.push(...my_order.foods_ordered);
                my_order.foods_ordered = [];
                my_order.status.foods = orderStatus.TERMINATED;
                my_order.total_queue_time = 0;
                my_order.markModified('status');
                my_order.save().then((order_saved) => { 
                    user.userModel.findOne({_id:req.auth.id}).then((user) => {
                        user.totalWorks.push(...my_order.foods_prepared);
                        user.save().then(data=>res.send(order_saved));
                    })
                }); //maybe add a notification for the waiter
            }
        });
    else if (req.auth.role === roleTypes.BARMAN)
        order.orderModel.findOne({ _id: req.params.orderID }).then((my_order) => {
            if (my_order.status.beverages === orderStatus.RECEIVED) {
                my_order.status.beverages = orderStatus.PREPARING;
                my_order.markModified('status');
                my_order.save().then((order_saved) => { res.send(order_saved); });
            }
            else if (my_order.status.beverages === orderStatus.PREPARING){
                my_order.beverages_prepared.push(...my_order.beverages_ordered);
                my_order.beverages_ordered = [];
                my_order.status.beverages = orderStatus.TERMINATED;
                my_order.total_queue_time = 0;
                my_order.markModified('status');
                my_order.save().then((order_saved) => { 
                    user.userModel.findOne({_id:req.auth.id}).then((user) => {
                        user.totalWorks.push(...my_order.beverages_prepared);
                        user.save().then(data=>res.send(order_saved));
                    })
                });
            }
        });
    else if (req.auth.role === roleTypes.WAITER)
        order.orderModel.findOne({ _id: req.params.orderID }).then((order) => {
            if (req.body.beverages.length === 0 && req.body.foods.length === 0)
                return res.status(400).json({ error: true, errormessage: "No foods or beverages selected" });
            else {
                order.beverages_ordered.push(...req.body.beverages);
                order.foods_ordered.push(...req.body.foods);
                order.insertionDate = new Date();

                if(req.body.foods.length !== 0)
                    order.status.foods = orderStatus.RECEIVED;
                if(req.body.beverages.length !== 0)
                    order.status.beverages = orderStatus.RECEIVED;
                order.markModified('status');
                
                order.save().then((order) => { res.send(order); }); //maybe add a notification for the cooks/barmans
            }
        });
    else 
        order.orderModel.findOne({ _id: req.params.orderID })
        .populate('foods_prepared')
        .populate('beverages_prepared')
        .populate('tables')
        .then((order) => {
            let total = 0;

            order.foods_prepared.forEach((food) => { total += food['price']; });
            order.beverages_prepared.forEach((beverage) => { total += beverage['price']; });

            order.tables.forEach((table) => {
                tableModel.findOne({ _id: table['_id'] }).then((table) => {
                    table.changeStatus(null, 0);
                    table.save();
                });
            });

            let receipe = {
                date: new Date(),
                order: order['_id'],
                tables: [...order.tables.map((table) => { return table['number']; })],
                foods: [...order.foods_prepared.map((food) => {return {name: food['name'], price: food['price']};})],
                beverages: [...order.beverages_prepared.map((drink) => {return {name: drink['name'], price: drink['price']};})],
                covers: order.covers,
                total: total + 2*(order.covers)
            }

            order['payed'] = true;
            order.save().then((saved_order) => {
                user.userModel.findOne({_id:req.auth.id}).then((user)=>{
                    user.totalWorks.push(saved_order._id);
                    user.save().then(data => res.send(receipe))
                })
            })
        });
})

//Delete order and create recipe route
router.delete('/:orderID', my_authorize([roleTypes.ADMIN, roleTypes.CASHIER]), (req, res) => {
    
})

export default router;