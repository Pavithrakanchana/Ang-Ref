import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-new-auto-quote-dialog',
  templateUrl: './new-auto-quote-dialog.component.html',
  styleUrls: ['./new-auto-quote-dialog.component.scss']
})
export class NewAutoQuoteDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<NewAutoQuoteDialogComponent>) { }

    close(): void {
    this.dialogRef.close();
    } 

  ngOnInit(): void {
  }

}