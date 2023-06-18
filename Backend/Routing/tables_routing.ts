import { Router } from 'express';

import * as table from '../Database/Table';
import * as orders from '../Database/Order';
import { roleTypes } from '../Database/User';
import { my_authorize, get_socket, Events } from '../utils';

const router = Router();

router.delete('/:table_id', my_authorize([roleTypes.ADMIN]), async (req, res) => {
    await table.tableModel.findByIdAndDelete(req.params.table_id);
    get_socket().emit(Events.UPDATE_TABLES_LIST);
    res.send("table deleted");
})

router.get('/', my_authorize([roleTypes.ADMIN, roleTypes.WAITER, roleTypes.CASHIER]), (req, res) => {
    table.tableModel.find()
    .populate('waiter_id')
    .populate('linked_tables')
    .then(tables => res.send(tables));
})

router.get('/serving', my_authorize([roleTypes.WAITER]), (req, res) => {
    table.tableModel.find({waiter_id: req.auth.id})
    .populate('linked_tables')
    .then(tables => res.send(tables));
})

router.put('/link', my_authorize([roleTypes.WAITER, roleTypes.ADMIN, roleTypes.CASHIER]), (req, res, next) => {
    let main_table: table.Table = req.body.tables.shift();

    table.tableModel.findById(main_table._id).then(my_table => {
        my_table?.linked_tables.push(...req.body.tables);
        my_table?.save().then(saved_table => 
            table.tableModel.findById(saved_table._id).populate('linked_tables').then(full_table=> res.send(full_table))
        );        
    })
})

router.get('/:table_id', my_authorize([]), (req, res) => {
    table.tableModel.findById(req.params.table_id)
    .populate('linked_tables')
    .then(table => res.send(table));
})

router.patch('/:table_id', my_authorize([roleTypes.ADMIN]), (req, res, next) => { 
    table.tableModel.findById(req.params.table_id).then(my_table => {
        if(req.body.table_number)
            my_table.number = req.body.table_number;
        if(req.body.table_capacity)
            my_table.capacity = req.body.table_capacity;
        my_table?.save().then((saved_table) => {
            get_socket().emit(Events.UPDATE_TABLES_LIST);
            res.send(saved_table);
        })
    })
})

router.put('/', my_authorize([roleTypes.WAITER, roleTypes.ADMIN, roleTypes.CASHIER]), (req, res, next) => { 
    table.tableModel.findById(req.body.table_id).then(my_table => {
        try {
            orders.orderModel.find().where({table: my_table?._id}).where({is_payed: false}).then(async (my_orders) => {
                if (my_orders.length > 0 && req.admin.role === roleTypes.ADMIN){
                    await orders.orderModel.deleteMany({_id: { $in: [...my_orders.map(ord => ord._id)] }});
                    my_table?.changeStatus(req.body.id, req.body.occupancy);
                    my_table?.save().then(() => get_socket().emit(Events.UPDATE_TABLES_LIST));
                }
                else if(my_orders.length === 0){
                    my_table?.changeStatus(req.body.id, req.body.occupancy);
                    my_table?.save().then(() => get_socket().emit(Events.UPDATE_TABLES_LIST));
                }
                else return res.status(500).json({ 
                    error: true, 
                    errormessage: "You can't free a table when its order is not payed" 
                });
            })
        } catch (error: any) {
            return res.status(500).json({ error: true, errormessage: error.message });
        }
    })
})

router.post('/', my_authorize([roleTypes.ADMIN]), (req, res) => {
    table.tableModel.findOne({number: req.body.number}).then((found_table) => {
        if (found_table) return res.status(400).json({ error: true, errormessage: 'Table already exists' });
        else {
            let my_table = table.newTable({
                capacity: req.body.table_capacity,
                number: req.body.table_number,
            }); 
            my_table.save().then((new_table) => { 
                get_socket().emit(Events.UPDATE_TABLES_LIST); 
                res.send(new_table); 
            });
        }
    })
})

export default router;