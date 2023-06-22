import { roleTypes } from './Database/User';
import { Server } from 'socket.io';
import * as https from 'https'

//In this file we define some useful data/method used in different points of our backend

const result = require('dotenv').config();
const { expressjwt: jwt } = require('express-jwt');
const auth = jwt({
    secret: process.env.JWT_SECRET, 
    algorithms: ["HS256"]
});
let io:Server;

export const set_socket = (server: https.Server) => {
    io = new Server(server,{
        cors: {
            origin: ['https://localhost:4200']
        }
    });
}

export const get_socket = () => io;

//Authorization/authentication middleware used in every route except login
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

//Events the socket listens to
export const Events = {
    UPDATE_TABLES_LIST:     'update_tables_list',
    UPDATE_ORDERS_LIST:     'update_orders_list',
    UPDATE_USERS_LIST:      'update_users_list',
    UPDATE_FOODS_LIST:      'update_food_list',
    UPDATE_TOTAL_PROFIT:    'update_total_profit',

    NEW_ORDER_RECEIVED:     'new_order_received',
    NEW_ORDER_PREPARED:     'new_order_prepared',

    FORCE_LOGOUT:           'force_logout'
}