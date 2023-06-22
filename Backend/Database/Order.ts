import mongoose = require('mongoose');
import Ajv from 'ajv';

//Order model definition

export enum orderStatus {
    RECEIVED,
    PREPARING,
    TERMINATED
}

export interface Order extends mongoose.Document{
    foods:                  string[],
    cook_id:                string,

    table:                  string,
    notes:                  string,

    status:                 orderStatus,
    is_payed:               boolean,
    covers:                 number,

    insertion_date:         Date,
    queue_time:             number
}

const orderSchema = new mongoose.Schema<Order>({
    foods:{
        type: [mongoose.SchemaTypes.String], 
        required: false,
        default: [],
        ref : 'Food'
    },
    cook_id:{
        type: mongoose.SchemaTypes.String, 
        required: false,
        default: null,
        ref : 'User'
    },
    table:{
        type: mongoose.SchemaTypes.String, 
        required: true,
        ref: 'Table'
    },
    notes:{
        type: mongoose.SchemaTypes.String, 
        required: false
    },
    status:{
        type: mongoose.SchemaTypes.Mixed,
        required: false,
        default: orderStatus.TERMINATED
    },
    insertion_date:{
        type: mongoose.SchemaTypes.Date,
        required: false,
        default: new Date()
    },
    queue_time:{
        type: mongoose.SchemaTypes.Number,
        required: false,
        default: 0
    },
    is_payed:{
        type: mongoose.SchemaTypes.Boolean,
        required: false,
        default: false
    },
    covers:{
        type: mongoose.SchemaTypes.Number,
        required: true
    }
});

export function getSchema() {
    return orderSchema;
}

export const orderModel = mongoose.model('Order', getSchema());

const validator = new Ajv();
export function validateOrder(order: Order): boolean {
    return validator.validate(orderSchema, order) as boolean;
};

export function newOrder( data: any ): Order {
    let order = new orderModel( data );
    return order;
}