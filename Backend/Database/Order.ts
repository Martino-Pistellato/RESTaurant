import mongoose = require('mongoose');
import Ajv from 'ajv';

export enum orderStatus {
    RECEIVED,
    PREPARING,
    TERMINATED
}

export interface Order extends mongoose.Document{
    foods_ordered:          string[], 
    beverages_ordered:      string[],

    foods_prepared:         string[],
    beverages_prepared:     string[],

    tables:                 string[],
    notes:                  string,

    status: {
        foods:              orderStatus,
        beverages:          orderStatus
    },

    insertionDate:          Date,
    total_queue_time:       number
    
    payed:                 boolean
}

const orderSchema = new mongoose.Schema<Order>({
    foods_ordered:{
        type: [mongoose.SchemaTypes.String], 
        required: false,
        default: [],
        ref : 'Food'
    },
    beverages_ordered:{
        type: [mongoose.SchemaTypes.String], 
        required: false,
        default: [],
        ref : 'Food'
    },
    foods_prepared:{
        type: [mongoose.SchemaTypes.String], 
        required: false,
        default: [],
        ref : 'Food'
    },
    beverages_prepared:{
        type: [mongoose.SchemaTypes.String], 
        required: false,
        default: [],
        ref : 'Food'
    },
    tables:{
        type: [mongoose.SchemaTypes.String], 
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
        default: {
            foods: orderStatus.TERMINATED,
            beverages: orderStatus.TERMINATED
        }
    },
    insertionDate:{
        type: mongoose.SchemaTypes.Date,
        required: false,
        default: new Date()
    },
    total_queue_time:{
        type: mongoose.SchemaTypes.Number,
        required: false,
        default: 0
    },
    payed:{
        type: mongoose.SchemaTypes.Boolean,
        required: false,
        default: false
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

export function newOrder( data ): Order {
    let order = new orderModel( data );
    return order;
}