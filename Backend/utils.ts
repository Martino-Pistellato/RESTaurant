import { roleTypes } from './Database/User';

const result = require('dotenv').config();
const { expressjwt: jwt } = require('express-jwt');
const auth = jwt({
    secret: process.env.JWT_SECRET, 
    algorithms: ["HS256"]
});

export const my_authorize = (roles: roleTypes[] = []) => {
    return [
        auth,
        (req: any, res: any, next: any) => {
            if (roles.length && !roles.includes(req.auth.role)) 
                return res.status(401).json({error: true, errormessage: 'Unhautorized'});
            next();
        }
    ];
}