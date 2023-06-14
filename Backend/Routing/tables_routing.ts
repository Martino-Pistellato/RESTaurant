import { Router } from 'express';

import * as table from '../Database/Table';
import * as orders from '../Database/Order';
import { roleTypes } from '../Database/User';
import { my_authorize, get_socket, Events } from '../utils';

const router = Router();

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

router.get('/:table_id', my_authorize([roleTypes.WAITER, roleTypes.COOK, roleTypes.BARMAN, roleTypes.CASHIER]), (req, res) => {
    table.tableModel.findById(req.params.table_id)
    .populate('linked_tables')
    .then(table => res.send(table));
})

router.put('/', my_authorize([roleTypes.WAITER, roleTypes.ADMIN, roleTypes.CASHIER]), (req, res, next) => { 
    table.tableModel.findById(req.body.table_id).then(my_table => {
        try {
            orders.orderModel.findOne().where({table: my_table?._id}).where({is_payed: false}).then(my_order => {
                if (my_order === null){
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

router.put('/link', my_authorize([roleTypes.WAITER, roleTypes.ADMIN, roleTypes.CASHIER]), (req, res, next) => { 
    let main_table: table.Table = req.body.tables.shift();

    table.tableModel.findById(main_table._id).then(my_table => {
        my_table?.linked_tables.push(...req.body.tables);
        my_table?.save().then(saved_table => 
            table.tableModel.findById(saved_table._id).populate('linked_tables').then(full_table=> res.send(full_table))
        );        
    })
})

router.post('/', my_authorize([roleTypes.ADMIN]), (req, res) => {
    table.tableModel.findOne({number: req.body.number}).then((found_table) => {
        if (found_table) return res.status(400).json({ error: true, errormessage: 'Table already exists' });
        else {
            let my_table = table.newTable({
                capacity: req.body.capacity,
                number: req.body.number,
            }); 
            my_table.save().then((new_table) => { 
                get_socket().emit(Events.UPDATE_TABLES_LIST); 
                res.send(new_table); 
            });
        }
    })
})

router.delete('/:table_id', my_authorize([roleTypes.ADMIN]), (req, res) => {
    table.tableModel.deleteOne({number: req.params.table_id}).then(table => {
        get_socket().emit(Events.UPDATE_TABLES_LIST);
        res.send("table deleted")
    });
})

export default router;