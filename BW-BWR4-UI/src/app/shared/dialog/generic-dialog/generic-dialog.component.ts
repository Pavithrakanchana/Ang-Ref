import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Tracker } from '../../utilities/tracker';

@Component({
  selector: 'app-generic-dialog',
  styleUrls: ['./generic-dialog.component.scss'],
  template: 
  `
  <div class="bwr-payment-iframe-header text-center">
    <h5 mat-dialog-title class="bw-header5">{{ title }}</h5>
  </div>
  <div mat-dialog-content>
      <p>{{ message }}</p>
  </div>
  <div mat-dialog-actions class="mb-2">
      <button *ngIf="acceptButtonText !== ''" mat-button mat-raised-button [mat-dialog-close]="true">{{ acceptButtonText }}</button>
      <button *ngIf="cancelButtonText !== ''" mat-button mat-raised-button class="btn-next" [mat-dialog-close]="false" cdkFocusInitial>{{ cancelButtonText }}</button>
  </div>
  `
})
export class GenericDialogComponent implements OnInit {
  message = '';
  title = '';
  acceptButtonText = '';
  cancelButtonText = '';

  constructor(private logTracker: Tracker,
    public dialogRef: MatDialogRef<GenericDialogComponent>,  @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    this.message = this.data.message;
    this.title = this.data.title;
    this.acceptButtonText = this.data.acceptButtonText;
    this.cancelButtonText = this.data.cancelButtonText;

    this.logTracker.loginfo(this.constructor.name, 'ngOnInit', 'ngOnInit', 'Loading Generic Dialog');
  }

}
