import mongoose = require('mongoose');
import Ajv from "ajv";

export interface Table extends mongoose.Document{
    number: number,
    waiterId: string | null,
    capacity: number,
    isFree: boolean,
    //isReserved: boolean;

    changeStatus: (waiterID: string) => void
}

const tableSchema = new mongoose.Schema<Table>({
    number:{
        type: mongoose.SchemaTypes.Number,
        required: true,
        unique: true
    },
    capacity:{
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    isFree:{
        type: mongoose.SchemaTypes.Boolean,
        required: true,
        default: true
    },
    waiterId:{
        type: mongoose.SchemaTypes.String,
        required: false,
        default: null
    }
});

tableSchema.methods.changeStatus = function(waiterID: string) { 
    this.isFree = !this.isFree; 
    
    if (this.isFree) this.waiterId = null;
    else this.waiterId = waiterID;
}

export function getSchema() {
    return tableSchema;
}

export const tableModel = mongoose.model('Table', getSchema());



const validator = new Ajv();
export function validateTable(table: Table): boolean {
    return validator.validate(tableSchema, table) as boolean;
};

export function newTable( data ): Table {
    let table = new tableModel( data );
    return table;
}