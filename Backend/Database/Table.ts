import mongoose = require('mongoose');
import ajv = require('ajv');

export interface Table {capacity: number;
    isFree: boolean;
    //isReserved: boolean;
}

const tableSchema = new mongoose.Schema({
    capacity:{
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    isFree:{
        type: mongoose.SchemaTypes.Boolean,
        required: true,
        default: true
    },
});
export function getSchema() {
    return tableSchema;
}

let tableModel: mongoose.Model<mongoose.Document>;
export function getModel(): mongoose.Model<mongoose.Document> {
    if (!tableModel) {
        tableModel = mongoose.model('Table', getSchema());
    }
    return tableModel;
}

const validator = new ajv();
export function validateTable(table: Table): boolean {
    return validator.validate(tableSchema, table) as boolean;
};
