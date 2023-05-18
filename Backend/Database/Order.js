"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOrder = exports.getModel = exports.getSchema = void 0;
var mongoose = require("mongoose");
var ajv = require("ajv");
var orderSchema = new mongoose.Schema({
    status: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    orders: {
        type: [mongoose.SchemaTypes.Mixed],
        required: true
    },
    tables: {
        type: [mongoose.SchemaTypes.Mixed],
        required: true
    },
    waiterId: {
        type: mongoose.SchemaTypes.String,
        required: true
    }
});
function getSchema() {
    return orderSchema;
}
exports.getSchema = getSchema;
var orderModel;
function getModel() {
    if (!orderModel) {
        orderModel = mongoose.model('Order', getSchema());
    }
    return orderModel;
}
exports.getModel = getModel;
var validator = new ajv();
function validateOrder(order) {
    return validator.validate(orderSchema, order);
}
exports.validateOrder = validateOrder;
;
