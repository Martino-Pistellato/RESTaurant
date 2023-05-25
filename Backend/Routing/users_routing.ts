import * as user from '../Database/User'
import jsonwebtoken = require('jsonwebtoken');  // JWT generation
import { Router } from 'express';

const router = Router();
const roleTypes = user.roleTypes;

//Create user route
router.post('/', (req, res) => {
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(401).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role !== roleTypes.ADMIN)
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            let my_user = user.newUser({
                name: req.body.name,
                email: req.body.email,
                role: req.body.role//TODO: capisci meglio che fare qua con roleTypes
            }); 
            my_user.setPassword(req.body.password);
            my_user.save().then((user) => { res.send(user); });
        }
    });  
})

//Delete user route
router.delete('/:userID', (req, res) => {
    jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET, (error, payload) => {
        if (error) 
            return res.status(401).json({ error: true, errormessage: "An error occurred" });
        else if (payload.role !== roleTypes.ADMIN)
            return res.status(401).json({ error: true, errormessage: "Unauthorized" });
        else{
            user.userModel.findAndDelete({_id: req.params.userID}).then(() => { res.send("User deleted"); });
        }
    });  
})
export default router;