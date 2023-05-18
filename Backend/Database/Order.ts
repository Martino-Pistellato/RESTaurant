import mongoose = require('mongoose');
import ajv = require('ajv');
import * as food from './Food';
import * as table from './Table';
import { ObjectId } from 'mongodb';

export interface Order {
    status: string;
    orders: food.Food[];
    tables: table.Table[];
    waiterId: mongoose.SchemaTypes.ObjectId;
}


const orderSchema = new mongoose.Schema({
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

let orderModel: mongoose.Model<mongoose.Document>;
export function getModel(): mongoose.Model<mongoose.Document> {
    if (!orderModel) {
        orderModel = mongoose.model('Order', getSchema());
    }
    return orderModel;
}

const validator = new ajv();
export function validateOrder(order: Order): boolean {
    return validator.validate(orderSchema, order) as boolean;
};
