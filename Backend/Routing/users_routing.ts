import { Router } from 'express';

import * as user from '../Database/User'
import { my_authorize } from '../utils';

const router = Router();
const roleTypes = user.roleTypes;

router.get('/', my_authorize([roleTypes.ADMIN, roleTypes.CASHIER]), (req, res) => {
    user.userModel.find().then((users) => res.send(users));
})

router.post('/', my_authorize([roleTypes.ADMIN]), (req, res) => {
    let my_user = user.newUser({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }); 
    my_user.setPassword(req.body.password);
    my_user.save().then((user) => res.send(user));
})

router.delete('/:userId', my_authorize([roleTypes.ADMIN]), (req, res) => {
    user.userModel.findByIdAndDelete(req.params.userId).then(() => res.send("User deleted"));
})

export default router;