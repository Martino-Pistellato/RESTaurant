import { roleTypes } from '../Database/User'
import * as order from '../Database/Order'
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
                orders.forEach((my_order) => {
                    if (my_order.foods_ordered.length === 0 || (new Date(my_order.insertionDate as Date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)))
                        orders.splice(orders.indexOf(my_order), 1);
                    else {
                        let total_queue_time = 0;
                        my_order.foods_ordered.forEach((food) => { total_queue_time += food['prepareTime']; });
                        my_order['total_queue_time'] = total_queue_time;
                    }
                });
                orders.sort((a, b) => { return a.insertionDate.getTime() - b.insertionDate.getTime(); });
                res.send(orders);
            });
    else if (req.auth.role === roleTypes.BARMAN)
        order.orderModel
            .find()
            .select('beverages_ordered insertionDate status tables')
            .populate('beverages_ordered')
            .populate('tables')
            .then((orders) => {
                orders.forEach((my_order) => {
                    if (my_order.beverages_ordered.length === 0 || ((new Date(my_order.insertionDate as Date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0))))
                        orders.splice(orders.indexOf(my_order), 1);
                    else {
                        let total_queue_time = 0;
                        my_order.beverages_ordered.forEach((food) => { total_queue_time += food['prepareTime']; });
                        my_order['total_queue_time'] = total_queue_time;
                    }
                });
                orders.sort((a, b) => { return a.insertionDate.getTime() - b.insertionDate.getTime(); });
                res.send(orders);
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
                    if (my_order.tables.length > 0 && (new Date(my_order.insertionDate as Date).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)))
                        my_orders.push(my_order);
                });

                my_orders.sort((a, b) => { return a.insertionDate.getTime() - b.insertionDate.getTime(); });
                res.send(my_orders);
            });
    else
        order.orderModel.find()
            .populate('foods_ordered')
            .populate('beverages_ordered')
            .populate('tables')
            .then((orders) => {
                orders.forEach((my_order) => {
                    if (new Date(my_order.insertionDate as Date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0))
                        orders.splice(orders.indexOf(my_order), 1);
                    else {
                        let total_queue_time = 0;

                        my_order.foods_ordered.forEach((food) => { total_queue_time += food['prepareTime']; });
                        my_order.beverages_ordered.forEach((beverage) => { total_queue_time += beverage['prepareTime']; });

                        my_order['total_queue_time'] = total_queue_time;
                    }
                });

                orders.sort((a, b) => { return a.insertionDate.getTime() - b.insertionDate.getTime(); });
                res.send(orders);
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
            if (todayStart <= order.insertionDate && todayEnd >= order.insertionDate) {
                order.foods_prepared.forEach((food) => { total += food['price']; });
                order.beverages_prepared.forEach((beverage) => { total += beverage['price']; });
            }
        });

        res.send({ total: total });
    })
})

//Create new order route
router.post('/', my_authorize([roleTypes.ADMIN, roleTypes.WAITER]), (req, res) => {
    if (req.body.tables.length === 0)
        return res.status(400).json({ error: true, errormessage: "No tables selected" });
    else {
        let my_order = order.newOrder({ tables: req.body.tables });
        my_order.save().then((order) => { res.send(order); });
    }
})

//Add foods or drinks to a certain order
router.put('/:orderID', my_authorize([roleTypes.COOK, roleTypes.BARMAN, roleTypes.WAITER]), (req, res) => { 
    if (req.auth.role === roleTypes.COOK)
        order.orderModel.findOne({ _id: req.params.orderID }).then((my_order) => {
            if (my_order.status.foods === orderStatus.RECEIVED) {
                my_order.status.foods = orderStatus.PREPARING;
                my_order.markModified('status');
                my_order.save().then((order_saved) => { res.send(order_saved); });
            }
            else {
                my_order.foods_prepared.push(...my_order.foods_ordered);
                my_order.foods_ordered = [];
                my_order.status.foods = orderStatus.RECEIVED;
                my_order.markModified('status');
                my_order.save().then((order_saved) => { res.send(order_saved); }); //maybe add a notification for the waiter
            }
        });
    else if (req.auth.role === roleTypes.BARMAN)
        order.orderModel.findOne({ _id: req.params.orderID }).then((my_order) => {
            if (my_order.status.beverages === orderStatus.RECEIVED) {
                my_order.status.beverages = orderStatus.PREPARING;
                my_order.markModified('status');
                my_order.save().then((order_saved) => { res.send(order_saved); });
            }
            else {
                my_order.beverages_prepared.push(...my_order.beverages_ordered);
                my_order.beverages_ordered = [];
                my_order.status.beverages = orderStatus.RECEIVED;
                my_order.markModified('status');
                my_order.save().then((order_saved) => { res.send(order_saved); }); //maybe add a notification for the waiter
            }
        });
    else
        order.orderModel.findOne({ _id: req.params.orderID }).then((order) => {
            if (req.body.beverages.length === 0 && req.body.foods.length === 0)
                return res.status(400).json({ error: true, errormessage: "No foods or beverages selected" });
            else {
                order.beverages_ordered.push(...req.body.beverages);
                order.foods_ordered.push(...req.body.foods);
                order.insertionDate = new Date()
                order.save().then((order) => { res.send(order); }); //maybe add a notification for the cooks/barmans
            }
        });
})

//Delete order and create recipe route
router.delete('/:orderID', my_authorize([roleTypes.ADMIN, roleTypes.CASHIER]), (req, res) => {
    order.orderModel.findOneAndDelete({ _id: req.params.orderID })
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
            order: order['_id'],
            tables: order.tables.map((table) => { return table['number']; }),
            foods: {
                name: order.foods_prepared.map((food) => { return food['name']; }),
                price: order.foods_prepared.map((food) => { return food['price']; })
            },
            beverages: {
                name: order.beverages_prepared.map((beverage) => { return beverage['name']; }),
                price: order.beverages_prepared.map((beverage) => { return beverage['price']; })
            },
            total: total
        }

        res.send(receipe);
    });
})

export default router;