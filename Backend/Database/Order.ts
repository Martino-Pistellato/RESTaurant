import mongoose = require('mongoose');
import Ajv from 'ajv';

export interface Order extends mongoose.Document{
    foods:          string[], 
    beverages:      string[],
    drinks_ready:   boolean,
    foods_ready:    boolean
    tables:         string[],
}

const orderSchema = new mongoose.Schema<Order>({
    foods:{
        type: [mongoose.SchemaTypes.String], 
        required: true
    },
    beverages:{
        type: [mongoose.SchemaTypes.String], 
        required: true
    },
    drinks_ready:{
        type: mongoose.SchemaTypes.Boolean,
        required: true
    },
    foods_ready:{
        type: mongoose.SchemaTypes.Boolean,
        required: true
    },
    tables:{
        type: [mongoose.SchemaTypes.String], 
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

export function newOrder( data ): Order {
    let order = new orderModel( data );
    return order;
}