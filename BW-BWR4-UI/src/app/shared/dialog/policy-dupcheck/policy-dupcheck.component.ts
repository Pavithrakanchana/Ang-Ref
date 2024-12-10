import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-policy-dupcheck',
  templateUrl: './policy-dupcheck.component.html',
  styleUrls: ['./policy-dupcheck.component.scss']
})
export class PolicyDupcheckComponent implements OnInit {

  dupcheckMessage!: string;
  constructor(public router: Router,public dialogRef: MatDialogRef<PolicyDupcheckComponent>,  @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.dupcheckMessage = this.data.message;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
