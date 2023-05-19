import mongoose = require('mongoose');
import Ajv, {JSONSchemaType} from "ajv"
import crypto = require('crypto');

export interface User extends mongoose.Document {
    name: string;
    email: string;
    role: string;
    salt: string;
    digest: string;
    
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
    salt:{
        type: mongoose.SchemaTypes.String,
        required: false
    },
    digest:{
        type: mongoose.SchemaTypes.String,
        required: false
    }
});

userSchema.methods.setPassword = function( pwd:string ) {
    this.salt = crypto.randomBytes(16).toString('hex'); // We use a random 16-bytes hex string for salt
    const hmac = crypto.createHmac('sha512', this.salt );
    hmac.update( pwd );
    this.digest = hmac.digest('hex'); // The final digest depends both by the password and the salt
}

userSchema.methods.validatePassword = function( pwd:string ):boolean {
    const hmac = crypto.createHmac('sha512', this.salt );
    hmac.update(pwd);
    const digest = hmac.digest('hex');
    return (this.digest === digest);
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