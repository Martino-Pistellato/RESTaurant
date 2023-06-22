import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Receipt } from 'src/app/services/orders-services/orders.service';

@Component({
  selector: 'app-receipt-dialog',
  templateUrl: './receipt-dialog.component.html',
  styleUrls: ['./receipt-dialog.component.css']
})
export class ReceiptDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ReceiptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected data: {receipt: Receipt}) { }

  //Closes dialog
  close() {
    this.dialogRef.close(null);
  }

  //Closes dialog indicating to set the order as paid
  pay(order_id: string) {
    this.dialogRef.close(order_id);
  }
}