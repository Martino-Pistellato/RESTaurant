import { roleTypes } from '../Database/User'
import * as table from '../Database/Table'
import jsonwebtoken = require('jsonwebtoken');  // JWT generation
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(401).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role !== roleTypes.ADMIN && payload.role !== roleTypes.WAITER && payload.role !== roleTypes.CASHIER)
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            table.tableModel.find().then((tables) => { res.send(tables); });
        }
    });  
})
  
router.get('/:waiterID', (req, res) => { //this is useful because clients do not order as soon as they're seated
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(401).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role !== roleTypes.WAITER)
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            table.tableModel.find({waiterId: req.params.waiterID}).then((table) => { res.send(table); });
            //app.redirect('/orders'); in POST
        }
    });  
})
  
router.put('/:tableID', (req, res) => { //TODO: questo ne occupa/libera uno solo alla volta
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(401).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role !== roleTypes.ADMIN && payload.role !== roleTypes.WAITER && payload.role !== roleTypes.CASHIER)
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            table.tableModel.findOne({_id: req.params.tableID}).then((table) => { 
                table.changeStatus(payload.id);
                table.save().then((table) => { res.send(table); });
            });
        }
    });  
})
  
router.post('/', (req, res) => {
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(401).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role != roleTypes.ADMIN)
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            let my_table = table.newTable({
                capacity: req.body.capacity,
                number: req.body.number,
                isFree: true
            }); 
            my_table.save().then((table) => { res.send(table); });
        }
    });  
})
  

export default router;