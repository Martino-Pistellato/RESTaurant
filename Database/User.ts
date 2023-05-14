import mongoose = require('mongoose');
import ajv = require('ajv');

export interface User {
    name: string;
    email: string;
    password: string;
    role: string;    
}

const userSchema = new mongoose.Schema({name:{
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

let userModel: mongoose.Model<mongoose.Document>;
export function getModel(): mongoose.Model<mongoose.Document> {
    if (!userModel) {
        userModel = mongoose.model('User', getSchema());
    }
    return userModel;
}

const validator = new ajv();
export function validateUser(user: User): boolean {
    return validator.validate(userSchema, user) as boolean;
};
