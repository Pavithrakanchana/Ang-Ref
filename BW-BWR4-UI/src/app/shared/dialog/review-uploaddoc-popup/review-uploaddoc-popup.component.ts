import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-review-uploaddoc-popup',
  templateUrl: './review-uploaddoc-popup.component.html',
  styleUrls: ['./review-uploaddoc-popup.component.scss']
})
export class ReviewUploaddocPopupComponent implements OnInit {

  policyEffDate!: string;
  constructor(public router: Router,public dialogRef: MatDialogRef<ReviewUploaddocPopupComponent>,  @Inject(MAT_DIALOG_DATA) public data: any) { }

  closeDialog(val: boolean) {

    this.dialogRef.close({ event: val });
  }

  uploadDoc() {

    this.dialogRef.close({  event: true });
  }

  ngOnInit(): void {
    this.policyEffDate = this.data.policyEffectiveDate;
  }

}
