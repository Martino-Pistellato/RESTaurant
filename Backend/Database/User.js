"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = exports.userModel = exports.getSchema = void 0;
var mongoose = require("mongoose");
var ajv_1 = require("ajv");
var userSchema = new mongoose.Schema({
    name: {
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
exports.userModel = mongoose.model('User', getSchema());
var validator = new ajv_1.default();
function validateUser(user) {
    return validator.validate(userSchema, user);
}
exports.validateUser = validateUser;
;
