import * as user from '../Database/User'
import { Router } from 'express';
import { my_authorize } from '../utils';

const router = Router();
const roleTypes = user.roleTypes;

//Create user route
router.post('/', my_authorize([roleTypes.ADMIN]), (req, res) => {
    let my_user = user.newUser({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role//TODO: capisci meglio che fare qua con roleTypes
    }); 
    my_user.setPassword(req.body.password);
    my_user.save().then((user) => { res.send(user); });
})

//Delete user route
router.delete('/:userID', my_authorize([roleTypes.ADMIN]), (req, res) => {
    user.userModel.findOneAndDelete({_id: req.params.userID}).then(() => { res.send("User deleted"); });
})

export default router;