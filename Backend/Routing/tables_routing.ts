import { roleTypes } from '../Database/User'
import * as table from '../Database/Table'
import jsonwebtoken = require('jsonwebtoken');  // JWT generation
import { Router } from 'express';

const router = Router();

//Get all tables route
router.get('/all', (req, res) => {
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(500).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role !== roleTypes.ADMIN && payload.role !== roleTypes.WAITER && payload.role !== roleTypes.CASHIER)
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            table.tableModel.find().populate('waiterId').then((tables) => { res.send(tables); });
        }
    });  
})

//Get all tables that a certain waiter will serve for the night --> useful to select a table before taking its order
router.get('/', (req, res) => { //this is useful because clients do not order as soon as they're seated
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(500).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role !== roleTypes.WAITER)
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            table.tableModel.find({waiterId: payload.id}).then((table) => { res.send(table); });
            //app.redirect('/orders'); in POST
        }
    });  
})

//Used to change status of a table form occupied to free and viceversa
router.put('/', (req, res) => { //TODO: questo ne occupa/libera uno solo alla volta
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(500).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role !== roleTypes.ADMIN && payload.role !== roleTypes.WAITER)
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            table.tableModel.findOne({_id: req.body.tableID}).then((table) => { 
                try {
                    table.changeStatus(payload.id, req.body.occupancy);
                    table.save().then((table) => { res.send(table); });
                } 
                catch (error) {
                    return res.status(500).json({ error: true, errormessage: error.message });
                }
            });
        }
    });  
})

//Create new table route
router.post('/', (req, res) => {
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(500).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role != roleTypes.ADMIN)
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            let my_table = table.newTable({
                capacity: req.body.capacity,
                number: req.body.number,
            }); 
            my_table.save().then((table) => { res.send(table); });
        }
    });  
})

//Delete table route
router.delete('/:tableID', (req, res) => {
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(500).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role != roleTypes.ADMIN)
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            table.tableModel.deleteOne({_id: req.params.tableID}).then((table) => { res.send("table deleted"); });
        }
    });  
})  

export default router;