import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Receipt } from 'src/app/services/orders-services/orders.service';

@Component({
  selector: 'app-receipt-dialog',
  templateUrl: './receipt-dialog.component.html',
  styleUrls: ['./receipt-dialog.component.css']
})
export class ReceiptDialogComponent {
  protected receipt: Receipt;
  
  constructor(
    private dialogRef: MatDialogRef<ReceiptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: {receipt: Receipt}) {
      this.receipt = data.receipt;
  }

  close() {
    this.dialogRef.close(null);
  }
}
