import mongoose = require('mongoose');
import Ajv from "ajv";

export interface Table extends mongoose.Document{
    number: number,
    capacity: number,
    isFree: boolean,
    waiterId: string | null,
    occupancy: number
    //isReserved: boolean;

    changeStatus: (waiterID: string, occupancy: number) => void
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
        required: false,
        default: true
    },
    waiterId:{
        type: mongoose.SchemaTypes.String,
        required: false,
        default: null
    },
    occupancy:{
        type: mongoose.SchemaTypes.Number,
        required: false,
        default: 0
    }
});

//handle case of cashier freeing table --> what about admin?
tableSchema.methods.changeStatus = function(waiterID: string, occupancy: number) { 
    if (occupancy > this.capacity) throw new Error("Occupancy cannot be greater than capacity");
    
    if(!this.isFree){
        if(this.waiterId == waiterID || waiterID == null){
            this.isFree = true
            this.waiterId = null;
            this.occupancy = 0;
        }
        else{
            throw new Error("You cannot free a table you're not serving!");
        }
    }
    else{
        this.isFree = false
        this.waiterId = waiterID;
        this.occupancy = occupancy;
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

export function newTable( data ): Table {
    let table = new tableModel( data );
    return table;
}