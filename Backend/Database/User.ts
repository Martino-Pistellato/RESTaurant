import mongoose = require('mongoose');
import Ajv from 'ajv';
const bcrypt = require("bcrypt")

export interface User extends mongoose.Document {
    name: string;
    email: string;
    role: string;
    password: string;
    
    setPassword: (pwd:string)=>void,
    validatePassword: (pwd:string)=>boolean
}

const userSchema = new mongoose.Schema<User>({
    name:{
        type: mongoose.SchemaTypes.String,
        required: true
    },
    email:{
        type: mongoose.SchemaTypes.String,
        required: true
    },
    role:{ 
        type: mongoose.SchemaTypes.String,
        required: true
    },
    password:{
        type: mongoose.SchemaTypes.String,
        required: false
    }
});

userSchema.methods.setPassword = function(pwd: string) {
    this.password = bcrypt.hashSync(pwd, 10);2
}

userSchema.methods.validatePassword = function(pwd: string): boolean {
    return bcrypt.compareSync(pwd, this.password);
}

export function getSchema() {
    return userSchema;
}

export const userModel = mongoose.model('User', getSchema());

const validator = new Ajv();
export function validateUser(user: User): boolean {
    return validator.validate(userSchema, user) as boolean;
};

export function newUser( data ): User {
    let user = new userModel( data );
    return user;
}