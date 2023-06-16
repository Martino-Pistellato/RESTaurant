import { Router } from 'express';

import * as order from '../Database/Order'
import { Table, tableModel} from '../Database/Table'
import { roleTypes, userModel } from '../Database/User'
import { foodTypes, Food } from '../Database/Food'
import { get_socket, my_authorize, Events } from '../utils';

const router = Router();
const orderStatus = order.orderStatus;

router.get('/', my_authorize([]), (req, res) => {
    if (req.auth.role === roleTypes.COOK || req.auth.role === roleTypes.BARMAN)
        order.orderModel.find().populate('foods').populate('table').then(orders => {
            let my_orders: order.Order[] = [];
            orders.forEach(order => {
                if (order.status !== orderStatus.TERMINATED && (order.cook_id === null || order.cook_id === req.auth.id)){
                    let my_foods = order.foods;
                    order.queue_time = 0;

                    my_foods.forEach(food => {
                        if (req.auth.role === roleTypes.COOK) {
                            if (food['type'] === foodTypes.DRINK)
                                order.foods.splice(order.foods.indexOf(food),1);
                            else 
                                order.queue_time += food['prepare_time'];
                        }
                        else {
                            if (food['type'] === foodTypes.DRINK) 
                                order.queue_time += food['prepare_time'];
                            else 
                                order.foods.splice(order.foods.indexOf(food),1);
                        }
                    })

                    my_orders.push(order);
                }
            });

            my_orders.sort((a, b) => a.insertion_date.getTime() - b.insertion_date.getTime());
            res.send(my_orders);
        });
    else if (req.auth.role === roleTypes.WAITER)
        order.orderModel.find().populate({
            path: 'table',
            match: { waiter_id: req.auth.id }
        }).then((orders) => {
            let my_orders: order.Order[] = [];

            orders.forEach((my_order) => {
                if (!my_order.is_payed)// && (new Date(my_order.insertion_date as Date).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)))
                    my_orders.push(my_order);
            });

            my_orders.sort((a, b) => a.insertion_date.getTime() - b.insertion_date.getTime());
            res.send(my_orders);
        });
    else 
        order.orderModel.find().populate('table').populate('cook_id').populate('foods').then(orders => {
            let my_orders: order.Order[] = [];

            orders.forEach(order => { 
                if (!order.is_payed){//&& (new Date(order.insertion_date as Date).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0))
                    order.queue_time = 0;
                    order.foods.forEach(food => order.queue_time += food['prepare_time']);
                    my_orders.push(order);
                }
            })

            my_orders.sort((a, b) => a.insertion_date.getTime() - b.insertion_date.getTime());
            res.send(my_orders);
        });
})

router.get('/all', my_authorize([roleTypes.CASHIER]), (req, res) => {
    order.orderModel.find().populate('foods').populate('table').then(orders => res.send(orders))
})

router.get('/receipt/:table_id', my_authorize([roleTypes.CASHIER]), async (req, res) => {
    tableModel.findById(req.params.table_id).populate('linked_tables').then(table =>{
        let my_table = (table as Table);

        let my_foods: Food[] = [], my_drinks: Food[] = [];
        let total = 0, my_covers = 0;
        let my_tables = [...my_table.linked_tables.map(table => table['number'])];
        my_tables.push(my_table.number);

        order.orderModel.find({table: my_table._id}).where({is_payed: false}).where({status: orderStatus.TERMINATED}).populate('foods').then((my_orders) => {
            my_orders.forEach(my_order => my_order.foods.forEach(my_food => {
                total += my_food['price'];
                if (my_food['type'] === foodTypes.DRINK)
                    my_drinks.push((my_food as unknown) as Food);
                else
                    my_foods.push((my_food as unknown) as Food);
            }));

            my_covers = (my_orders.at(0) as order.Order).covers;
            let total_order = order.newOrder({
                table:  my_table._id,
                foods:  [...my_foods.concat(my_drinks).map(food => food._id )],
                covers: my_covers
            });

            total_order.save().then(async my_order => {
                await order.orderModel.deleteMany({_id: { $in: [...my_orders.map(ord => ord._id)] }});

                let receipt = {
                    date: new Date(),
                    order:  my_order._id,
                    tables:  my_tables,
                    foods:  [...my_foods.map((food) => {return {name: food.name, price: food.price};})],
                    drinks: [...my_drinks.map((drink) => {return {name: drink.name, price: drink.price};})],
                    covers: my_covers,
                    total: total + 2*(my_covers)
                }

                get_socket().emit(Events.UPDATE_ORDERS_LIST); 
                res.send(receipt);
            });
        });
    })
})

router.get('/totalprofit', my_authorize([roleTypes.CASHIER, roleTypes.ADMIN]), (req, res) => {
    order.orderModel.find()
    .populate('foods')
    .then((orders) => {
        let total = 0;
        let today = new Date()
        let todayStart = new Date(today.setHours(0, 0, 0, 0))
        let todayEnd = new Date(today.setHours(23, 59, 59, 59))

        orders.forEach((order) => {
            if (order.is_payed && todayStart <= order.insertion_date && todayEnd >= order.insertion_date) {
                order.foods.forEach((food) => { total += food['price']; });
                total += 2*order.covers;
            }
        });

        res.send({ total: total });
    })
})

router.post('/', my_authorize([roleTypes.WAITER]), (req, res) => {
    if (req.body.table === null)
        return res.status(500).json({ error: true, errormessage: "No tables selected" });
    else {
        let my_table = req.body.table;
        let my_covers = my_table.occupancy;
        if (my_table.linked_tables.length > 0)
            my_table.linked_tables.forEach(table => my_covers += table.occupancy ); 
        
        let my_order = order.newOrder({ table: my_table, covers: my_covers });
        my_order.save().then((order) => { 
            userModel.findById(req.auth.id).then((user) => {
                user.totalWorks.push(order._id);
                user.save().then(data=>res.send(order));
            })
        });
    }
})

router.put('/', my_authorize([roleTypes.COOK, roleTypes.BARMAN, roleTypes.CASHIER, roleTypes.WAITER]), (req, res) => {
    order.orderModel.findById(req.body.order_id).populate('table').then((selected_order) => {
        let my_order = selected_order as order.Order;
        if (req.auth.role === roleTypes.COOK || req.auth.role === roleTypes.BARMAN){
            if (my_order.status === orderStatus.RECEIVED) {
                my_order.status = orderStatus.PREPARING;
                my_order.cook_id = req.auth.id;
                my_order.save().then((order_saved) => { 
                    get_socket().emit(Events.UPDATE_ORDERS_LIST); 
                    res.send(order_saved); 
                });
            }
            else if (my_order.status === orderStatus.PREPARING) {
                userModel.findById(req.auth.id).then((user) => {
                    user.totalWorks.push(...my_order.foods);
                    my_order.status = orderStatus.TERMINATED;
                    user.save().then(data => my_order.save().then(order_saved => {
                        get_socket().emit(Events.UPDATE_ORDERS_LIST); 
                        get_socket().emit(Events.NEW_ORDER_PREPARED, {
                            waiter_id: my_order.table['waiter_id'],  
                            table_number: my_order.table['number']
                        });
                        res.send(order_saved);
                    }));
                }); //maybe add a notification for the waiter
            }
        }
        else if (req.auth.role === roleTypes.WAITER){
            if (req.body.foods.length === 0)
                return res.status(500).json({ error: true, errormessage: "No foods or beverages selected" });
            else {
                my_order.foods.push(...req.body.foods);
                my_order.status = orderStatus.RECEIVED;
                my_order.save().then((order) => { 
                    get_socket().emit(Events.UPDATE_ORDERS_LIST);
                    let has_food = false, has_drink = false;
                    has_food = order.foods.some(food => food['type'] !== foodTypes.DRINK);
                    has_drink = order.foods.some(food => food['type'] === foodTypes.DRINK);
                    if (has_food)
                        get_socket().emit(Events.NEW_ORDER_RECEIVED, roleTypes.COOK);
                    if (has_drink)
                        get_socket().emit(Events.NEW_ORDER_RECEIVED, roleTypes.BARMAN);
                    res.send(order); 
                });
            }
        }
        else{
            my_order.is_payed = true;
            tableModel.findById(my_order.table['_id']).then(my_table => {
                if (my_table.linked_tables.length > 0)
                    my_table.linked_tables.forEach(linked_table => {
                        tableModel.findById(linked_table).then(table_to_free => {
                            table_to_free?.changeStatus(null,0);
                            table_to_free?.save()
                        })
                    });
                my_table.changeStatus(null, 0);
                my_table.linked_tables = [];
                my_table.save();
            })
            my_order.save().then((saved_order) => {
                userModel.findById(req.auth.id).then((user) => {
                    user.totalWorks.push(saved_order._id);
                    user?.save().then(saved_user => {
                        get_socket().emit(Events.UPDATE_ORDERS_LIST); 
                        get_socket().emit(Events.UPDATE_TABLES_LIST);
                        get_socket().emit(Events.UPDATE_TOTAL_PROFIT);
                        res.send(saved_order)
                    });
                })
            });
        } 
    });
})

router.delete('/:orderId', my_authorize([roleTypes.ADMIN]), (req, res) => {
    order.orderModel.findByIdAndDelete(req.params.order_id).then(order => {
        get_socket().emit(Events.UPDATE_ORDERS_LIST);
        res.send(order)
    });
})

export default router;