"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = exports.getModel = exports.getSchema = void 0;
var mongoose = require("mongoose");
var ajv = require("ajv");
var userSchema = new mongoose.Schema({ name: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    email: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    password: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    role: {
        type: mongoose.SchemaTypes.String,
        required: true
    }
});
function getSchema() {
    return userSchema;
}
exports.getSchema = getSchema;
var userModel;
function getModel() {
    if (!userModel) {
        userModel = mongoose.model('User', getSchema());
    }
    return userModel;
}
exports.getModel = getModel;
var validator = new ajv();
function validateUser(user) {
    return validator.validate(userSchema, user);
}
exports.validateUser = validateUser;
;
