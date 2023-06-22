import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

import { Table } from 'src/app/services/tables-services/tables.service';

@Component({
  selector: 'app-table-occupancy-dialog',
  templateUrl: './table-occupancy-dialog.component.html',
  styleUrls: ['./table-occupancy-dialog.component.css']
})
export class TableOccupancyDialogComponent{
    occupancyControl: FormControl;

    //Checks if the number of clients for a table is valid (occupancy <= capacity and occupancy > 0)
    getErrorMessage() {
      return this.occupancyControl.hasError('max') ? 'Occupancy cannot be greater than capacity' : this.occupancyControl.hasError('min') ? 'Occupancy cannot be empty' : 'Unknown error';
    }

    constructor(
        private dialogRef: MatDialogRef<TableOccupancyDialogComponent>,
        @Inject(MAT_DIALOG_DATA) protected data: {table: Table, occupancy: number}) {
        this.occupancyControl = new FormControl('', [Validators.max(data.table.capacity), Validators.min(1)]);
    }

    //Closes dialog
    close() {
        this.dialogRef.close(null);
    }
}
