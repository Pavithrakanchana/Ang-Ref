import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-driver-dialog',
  templateUrl: './helptext-dialog.component.html',
  styleUrls: ['./helptext-dialog.component.scss']
})
export class HelpTextDialogComponent implements OnInit {
  title:any;
  text: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<HelpTextDialogComponent>,) {
    this.title = data.title;
    this.text = data.text;
  }

  ngOnInit(): void {
  }

   /**
 * closeDialog function that closes the Payment Method dialog
 * @param {boolean} val - true or false value
 */
    closeDialog(val: boolean): void {
      this.dialogRef.close({ event: val });
    }

}
