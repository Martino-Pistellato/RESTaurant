import mongoose = require('mongoose');
import Ajv from 'ajv';

//Table model definition

export interface Table extends mongoose.Document{
    number:         number,
    capacity:       number,
    is_free:         boolean,
    waiter_id:       string,
    occupancy:      number,
    linked_tables:  string[]

    changeStatus: (waiter_id: string | null, occupancy: number) => void
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
    is_free:{
        type: mongoose.SchemaTypes.Boolean,
        required: false,
        default: true
    },
    waiter_id:{
        type: mongoose.SchemaTypes.String,
        required: false,
        default: null,
        ref: 'User'
    },
    occupancy:{
        type: mongoose.SchemaTypes.Number,
        required: false,
        default: 0
    },
    linked_tables:{
        type: [mongoose.SchemaTypes.String],
        required: false,
        default: [],
        ref: 'Table'
    }
});


tableSchema.methods.changeStatus = function(waiter_id: string | null, occupancy: number) { 
    if (occupancy > this.capacity) throw new Error("Occupancy cannot be greater than capacity");
    if(!this.is_free){
        if(this.waiter_id === waiter_id || waiter_id === null){
            this.is_free = true
            this.waiter_id = null;
            this.occupancy = 0;
        }
        else throw new Error("You cannot free a table you're not serving!");
    }
    else {
        if(waiter_id !== null){
            this.is_free = false
            this.waiter_id = waiter_id;
            this.occupancy = occupancy;
        }
        else throw new Error("Only waiter can occupy tables");
    }
}

export function getSchema() {
    return tableSchema;
}

export const tableModel = mongoose.model('Table', getSchema());

const validator = new Ajv();
export function validateTable(table: Table): boolean {
    return validator.validate(tableSchema, table) as boolean;
};

export function newTable( data: any ): Table {
    let table = new tableModel( data );
    return table;
}