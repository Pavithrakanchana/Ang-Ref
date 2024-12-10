import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store, StoreConfig } from '@ngrx/store';
import { environment } from 'src/environments/environment';
import QuoteSummary from 'src/app/state/model/summary.model';



@Component({
  selector: 'app-go-paperless-popup',
  templateUrl: './go-paperless-popup.component.html',
  styleUrls: ['./go-paperless-popup.component.scss']
})
export class GoPaperlessPopupComponent implements OnInit {

  userLastName:any;
  policyNumber:any;
  resgisterUrl:any;

  constructor(public router: Router,public dialogRef: MatDialogRef<GoPaperlessPopupComponent>,
    private store: Store<{ quoteSummary: QuoteSummary }>,) {
    this.store.select('quoteSummary').subscribe(data => {
      this.policyNumber = data?.bindData?.bindPolicyNumber;
      this.userLastName = data?.drivers[0]?.lastName;
      this.resgisterUrl = `${environment.regUserURL}policyNumber=${this.policyNumber}&LastName=${this.userLastName}`;
    });
    }

  closeDialog(val: boolean) {
    this.dialogRef.close({ event: val });
  }

  ngOnInit(): void {
};
}


