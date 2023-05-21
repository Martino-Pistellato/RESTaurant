import mongoose = require('mongoose');
import Ajv from "ajv";

export interface Table extends mongoose.Document{
    capacity: number;
    isFree: boolean;
    //isReserved: boolean;

    changeStatus: () => void;
}

const tableSchema = new mongoose.Schema<Table>({
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

export const tableModel = mongoose.model('Table', getSchema());

tableSchema.methods.changeStatus = function() { this.isFree = !this.isFree; }

const validator = new Ajv();
export function validateTable(table: Table): boolean {
    return validator.validate(tableSchema, table) as boolean;
};

export function newTable( data ): Table {
    let table = new tableModel( data );
    return table;
}