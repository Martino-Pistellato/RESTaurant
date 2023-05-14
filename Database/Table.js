"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTable = exports.getModel = exports.getSchema = void 0;
var mongoose = require("mongoose");
var ajv = require("ajv");
var tableSchema = new mongoose.Schema({
    capacity: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    isFree: {
        type: mongoose.SchemaTypes.Boolean,
        required: true,
        default: true
    },
});
function getSchema() {
    return tableSchema;
}
exports.getSchema = getSchema;
var tableModel;
function getModel() {
    if (!tableModel) {
        tableModel = mongoose.model('Table', getSchema());
    }
    return tableModel;
}
exports.getModel = getModel;
var validator = new ajv();
function validateTable(table) {
    return validator.validate(tableSchema, table);
}
exports.validateTable = validateTable;
;
