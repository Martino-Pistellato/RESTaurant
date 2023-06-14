import mongoose = require('mongoose');
import Ajv from 'ajv';

export enum foodTypes{
    APPETIZER,
    FIRST_COURSE,
    SECOND_COURSE,
    SIDE_DISH,
    DESSERT,
    DRINK
}

export interface Food extends mongoose.Document {
    name:           string;
    price:          number;
    prepare_time:    number; //in minutes
    ingredients:    string[]; 
    type:           foodTypes;
}

const foodSchema = new mongoose.Schema<Food>({
    name:{
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    },
    price:{
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    prepare_time:{
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    ingredients:{ 
        type: [mongoose.SchemaTypes.String],
        required: true
    },
    type:{
        type: mongoose.SchemaTypes.Mixed,
        required: true
    }
});

export function getSchema() {
    return foodSchema;
}

export const foodModel = mongoose.model('Food', getSchema());

const validator = new Ajv();
export function validateFood(food: Food): boolean {
    return validator.validate(foodSchema, food) as boolean;
};

export function newFood( data: any ): Food {
    let food = new foodModel( data );
    return food;
}