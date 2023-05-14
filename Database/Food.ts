import mongoose = require('mongoose');
import ajv = require('ajv');

export interface Food {
    name: string;
    price: number;
    prepareTime: number; //in minutes
    notes: string;   
    ingredients: string[]; 
}

const foodSchema = new mongoose.Schema({
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

let foodModel: mongoose.Model<mongoose.Document>;
export function getModel(): mongoose.Model<mongoose.Document> {
    if (!foodModel) {
        foodModel = mongoose.model('Food', getSchema());
    }
    return foodModel;
}

const validator = new ajv();
export function validateFood(food: Food): boolean {
    return validator.validate(foodSchema, food) as boolean;
};
