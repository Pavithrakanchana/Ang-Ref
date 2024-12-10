import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-save-exit-popup',
  templateUrl: './save-exit-popup.component.html',
  styleUrls: ['./save-exit-popup.component.scss']
})
export class SaveExitPopupComponent implements OnInit {

  constructor(public router: Router, public dialogRef: MatDialogRef<SaveExitPopupComponent>) { }

  closeDialog(val: boolean) {

    this.dialogRef.close({ event: val });
  }
  ngOnInit(): void {
  }

  submit() {
    this.dialogRef.close({
      clicked: 'save',
    });
  }

}
