import { Router } from 'express';

import * as user from '../Database/User'
import { my_authorize, get_socket, Events } from '../utils';

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
    my_user.save().then((user) => {
        get_socket().emit(Events.UPDATE_USERS_LIST)
        res.send(user)
    });
})

router.put('/:user_id', my_authorize([roleTypes.ADMIN]), (req, res) => {
    user.userModel.findById(req.params.user_id).then((user_to_update) => {
        if (req.body.name && req.body.name.length > 0)
            user_to_update.name = req.body.name;
        if (req.body.email && req.body.email.length > 0)
            user_to_update.email = req.body.email;
        if (req.body.role && req.body.role >= user.roleTypes.ADMIN && req.body.role <= user.roleTypes.WAITER) 
            user_to_update.role = req.body.role;
        if(req.body.password && req.body.password.length >= 6)
            user_to_update?.setPassword(req.body.password);
            
        user_to_update?.save().then(saved_user => {
            get_socket().emit(Events.UPDATE_USERS_LIST);
            if(req.body.password && req.body.password.length >= 6)
                get_socket().emit(Events.FORCE_LOGOUT, req.params.user_id);
            res.send(saved_user)
        });
    })
})

router.delete('/:user_id', my_authorize([roleTypes.ADMIN]), async (req, res) => {
    await user.userModel.findByIdAndDelete(req.params.user_id);
    get_socket().emit(Events.UPDATE_USERS_LIST);
    get_socket().emit(Events.FORCE_LOGOUT, req.params.user_id);
    res.send("User deleted");
})

export default router;