import mongoose = require('mongoose');
import Ajv, {JSONSchemaType} from "ajv";

export interface Food extends mongoose.Document {
    name: string;
    price: number;
    prepareTime: number; //in minutes
    notes: string;   
    ingredients: string[]; 
}

const foodSchema = new mongoose.Schema<Food>({
    name:{
        type: mongoose.SchemaTypes.String,
        required: true
    },
    price:{
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    prepareTime:{
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    notes:{ 
        type: mongoose.SchemaTypes.String,
        required: true
    },
    ingredients:{ 
        type: [mongoose.SchemaTypes.String],
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

export function newFood( data ): Food {
    let food = new foodModel( data );
    return food;
}