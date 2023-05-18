import mongoose = require('mongoose');
import Ajv, {JSONSchemaType} from "ajv"

export interface User {
    name: string;
    email: string;
    password: string;
    role: string;    
}

const userSchema = new mongoose.Schema({
    name:{
        type: mongoose.SchemaTypes.String,
        required: true
    },
    email:{
        type: mongoose.SchemaTypes.String,
        required: true
    },
    password:{
        type: mongoose.SchemaTypes.String,
        required: true
    },
    role:{ 
        type: mongoose.SchemaTypes.String,
        required: true
    }
});
export function getSchema() {
    return userSchema;
}

export const userModel = mongoose.model('User', getSchema());

const validator = new Ajv();
export function validateUser(user: User): boolean {
    return validator.validate(userSchema, user) as boolean;
};
