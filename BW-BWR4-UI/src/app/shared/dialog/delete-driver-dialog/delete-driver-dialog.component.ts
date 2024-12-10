import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-driver-dialog',
  templateUrl: './delete-driver-dialog.component.html',
  styleUrls: ['./delete-driver-dialog.component.scss']
})
export class DeleteDriverDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DeleteDriverDialogComponent>,  @Optional() @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

}
