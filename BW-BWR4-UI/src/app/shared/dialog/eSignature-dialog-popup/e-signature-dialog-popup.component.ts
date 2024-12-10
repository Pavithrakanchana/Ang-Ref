import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';


@Component({
  selector: 'app-e-signature-dialog-popup',
  templateUrl: './e-signature-dialog-popup.component.html',
  styleUrls: ['./e-signature-dialog-popup.component.scss']
})
export class ESignatureDialogPopupComponent implements OnInit {

  constructor(public router: Router, public dialogRef: MatDialogRef<ESignatureDialogPopupComponent>) { }

  closeDialog(val: boolean) {
    this.dialogRef.close({ event: val });
  }

  ngOnInit(): void {
  }

  submit() {
    this.dialogRef.close({
      clicked: 'submit',
    });
  }

}
