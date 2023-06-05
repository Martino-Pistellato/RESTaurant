import { roleTypes } from '../Database/User'
import * as table from '../Database/Table'
import { Router } from 'express';

const result = require('dotenv').config();
const router = Router();
const { expressjwt: jwt } = require('express-jwt');

export const auth = jwt({
    secret: process.env.JWT_SECRET, 
    algorithms: ["HS256"]
});


export function authorize(roles: roleTypes[] = []) {
    return [
        auth,
        (req: any, res: any, next: any) => {
            if (roles.length && !roles.includes(req.auth.role)) 
                return res.status(401).json({error: true, errormessage: 'Unhautorized'});
            next();
        }
    ];
}

//Get all tables route
router.get('/all', authorize([roleTypes.WAITER,roleTypes.ADMIN,roleTypes.CASHIER]), (req, res, next) => {
    table.tableModel.find().populate('waiterId').then((tables) => { res.send(tables); });
})

//Get all tables that a certain waiter will serve for the night --> useful to select a table before taking its order
router.get('/', authorize([roleTypes.WAITER]), (req, res, next) => { //clients do not order as soon as they're seated
    table.tableModel.find({waiterId: req.auth.id}).then((table) => { res.send(table); });
    //app.redirect('/orders'); in POST
})

//Used to change status of a table form occupied to free and viceversa
router.put('/', authorize([roleTypes.WAITER, roleTypes.ADMIN]), (req, res, next) => { //ne occupa/libera uno alla volta
    table.tableModel.findOne({number: req.body.tableNumber}).then((table) => { 
        try {
            table.changeStatus(req.auth.id, req.body.occupancy);
            table.save().then((table) => { res.send(table); });
        } 
        catch (error) {
            return res.status(500).json({ error: true, errormessage: error.message });
        }
    });
})

//Create new table route
router.post('/', authorize([roleTypes.ADMIN]), (req, res) => {
    let my_table = table.newTable({
        capacity: req.body.capacity,
        number: req.body.number,
    }); 
    my_table.save().then((table) => { res.send(table); });
})

//Delete table route
router.delete('/:tableID', authorize([roleTypes.ADMIN]), (req, res) => {
    table.tableModel.deleteOne({_id: req.params.tableID}).then((table) => { res.send("table deleted"); });
})  

export default router;