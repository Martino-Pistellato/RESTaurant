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

    // drinks_ready:   boolean,
    // foods_ready:    boolean,

    tables:                 string[],
    notes:                  string,

    status: {
        foods:              orderStatus,
        beverages:          orderStatus
    },

    insertionDate:          Date,
    
    //maybe we should have a "closed" or "payed" field to distinguish between old and new orders?
    //maybe we should have a "date" field to distinguish between old and new orders (or today orders)?
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
    // drinks_ready:{
    //     type: mongoose.SchemaTypes.Boolean,
    //     required: true
    // },
    // foods_ready:{
    //     type: mongoose.SchemaTypes.Boolean,
    //     required: true
    // },
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
            foods: orderStatus.RECEIVED,
            beverages: orderStatus.RECEIVED
        }
    },
    insertionDate:{
        type: mongoose.SchemaTypes.Date,
        required: false,
        default: new Date()
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