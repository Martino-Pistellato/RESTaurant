import * as mongoose from 'mongoose';
import Ajv from 'ajv';
import * as food from './Food';
import * as table from './Table';

export interface Order extends mongoose.Document{
    status: string,
    orders: food.Food[], //maybe is better Foods and Beverages
    tables: table.Table[],
    waiterId: mongoose.ObjectId
}

const orderSchema = new mongoose.Schema<Order>({
    status:{
        type: mongoose.SchemaTypes.String,
        required: true
    },
    orders:{
        type: [mongoose.SchemaTypes.Mixed], //this or food.getSchema()?
        required: true
    },
    tables:{
        type: [mongoose.SchemaTypes.Mixed], //table.getSchema()
        required: true
    },
    waiterId:{
        type: mongoose.SchemaTypes.String,
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