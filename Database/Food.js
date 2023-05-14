"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFood = exports.getModel = exports.getSchema = void 0;
var mongoose = require("mongoose");
var ajv = require("ajv");
var foodSchema = new mongoose.Schema({
    name: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    price: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    prepareTime: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    notes: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    ingredients: {
        type: [mongoose.SchemaTypes.String],
        required: true
    }
});
function getSchema() {
    return foodSchema;
}
exports.getSchema = getSchema;
var foodModel;
function getModel() {
    if (!foodModel) {
        foodModel = mongoose.model('Food', getSchema());
    }
    return foodModel;
}
exports.getModel = getModel;
var validator = new ajv();
function validateFood(food) {
    return validator.validate(foodSchema, food);
}
exports.validateFood = validateFood;
;
