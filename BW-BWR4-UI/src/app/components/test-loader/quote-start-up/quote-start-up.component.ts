import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { NewAutoQuoteDialogComponent } from 'src/app/shared/dialog/new-auto-quote-dialog/new-auto-quote-dialog.component';
import { Tracker } from 'src/app/shared/utilities/tracker';

interface MCO {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-quote-start-up',
  templateUrl: './quote-start-up.component.html',
  styleUrls: ['./quote-start-up.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class QuoteStartUpComponent implements OnInit {
  mcoValues: MCO[] = [
    {value: '20', viewValue: '20'},
    {value: '41', viewValue: '41'},
    {value: '12', viewValue: '12'}
  ];

  selected = '';
  simpleDialog: MatDialogRef<NewAutoQuoteDialogComponent> | undefined;
  // Data capture fields
  // Data capture fields
  producerCode!: string;
  // producerType: any[] = [];
  quote:string='';
  mco: string = "";
  ratebook: string = "";
  state:string = 'az';
  term: string = "";
  active = 1;
  formSubmitAttempt!: boolean;
  quoteStartForm!: UntypedFormGroup;
  producerType!: string;


  constructor(private dialogModel: MatDialog,
    private fb: UntypedFormBuilder,
    private router: Router,
    private logTracker: Tracker) {}

  ngOnInit(): void {
    this.logTracker.loginfo('QuoteStartUpComponent', 'constructor', 'Initializing onload functions', 'Quote Start Page');
    this.reactiveForm();
  }

  /* Reactive form */
  reactiveForm() {
    // Initialize form with defualt value and validators
    this.quoteStartForm = this.fb.group({
      quote: [this.quote],
      producerCode: [this.producerCode,  Validators.required],//Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5)])],
      mco: [this.mco, Validators.required],
      mco1: [this.mco, Validators.required],
      state: [this.state, Validators.required],
   term:[this.term, Validators.required],// term: [this.term],
      ratebook: [this.ratebook, Validators.required],
       producerType:  [this.producerType, Validators.requiredTrue],
    });
  }

    goAuth() :void {
      this.producerCode = this.quoteStartForm.get('producerCode')?.value;
      this.state = this.quoteStartForm.get('state')?.value;
     this.mco = this.quoteStartForm.get('mco1')?.value;
     this.ratebook = this.quoteStartForm.get('ratebook')?.value;
      this.router.navigate(
        ['/auth'],
        { queryParams: { state: this.state.toUpperCase(), mco:this.mco, rateBook: this.ratebook, newquote: true, ssot: 'abcd1234', userName:"*abcdef", agentCode: this.producerCode, quoteNum: this.quote } }
        );
    }
  toggleChange(event:any,val:string)
  {

  this.producerType=val;
  }

  /* Handle form errors in Angular 8 */
  public hasError = (controlName: string, errorName: string) =>{
    return this.quoteStartForm.controls[controlName].hasError(errorName);
  }

  dialog() {
    this.simpleDialog = this.dialogModel.open(NewAutoQuoteDialogComponent, {
      width: '80%',
      height: 'auto',
      panelClass: 'full-width-dialog'
    });
    }


    retrieveQuote() {

     this.mco = this.quoteStartForm.get('mco')?.value;
     this.quote = this.quoteStartForm.get('quote')?.value;
     this.producerCode = this.quoteStartForm.get('producerCode')?.value;

      this.router.navigate(
        ['/auth'],
        { queryParams: { state: 'CO', mco:this.mco, rateBook: 'R', ssot: 'abcd1234', userName:"*abcdef", agentCode: this.producerCode, newquote: false, quoteNum: this.quote, bridging: true, source: 'RTR',
        edit: 'There were 7 vehicle(s) quoted in RTR but we were only able to transfer 6 vehicle(s) into Bristol West quote. Please review the Vehicle screen and enter manually any additional vehicle(s) that you would like to have included in the quote' } }
        );
  }

  // // Form Validation Utilities
  // isFieldValid(field: string) {
  //   return (
  //     (!this.quoteStartForm.get(field).valid && this.quoteStartForm.get(field).touched) ||
  //     (this.quoteStartForm.get(field).untouched  && this.formSubmitAttempt)
  //   );
  // }

}
