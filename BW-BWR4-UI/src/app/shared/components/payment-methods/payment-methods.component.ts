import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { GlobalConstants } from 'src/app/constants/global.constant';
import QuoteSummary from 'src/app/state/model/summary.model';
import { HelpTextDialogComponent } from '../../dialog/helptext-dialog/helptext-dialog.component';
import { ValidvaluesCommonRes, ValuePair } from '../../model/validvalues/validvaluescommonres';
import { ValidValuesReq } from '../../model/validvalues/validvaluesreq.model';
import { ValidValuesService } from '../../services/validvalues/validvalues.service';
import { HelptextMapper } from '../../utilities/helptext-mapper';

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.scss']
})
export class PaymentMethodsComponent implements OnInit {

  @Input() formRef!: UntypedFormGroup;
  @Input() downpaymentValue!: string;
  @Input() installmentValue!: string;
  @Input() hasProducerSweep!: boolean;
   @Input() page!: string;

  @Output() payMethodChangeEvent = new EventEmitter<boolean>();

  helpText = '';
  helpTextTitle = '';
  downpaymentValidValues!: ValuePair[];
  installmentValidValues!: ValuePair[];
  helpTextMapper: HelptextMapper;
  policyState:string = '';  
  ratebook!: string;

  constructor(private dialog: MatDialog,
    public validValuesService: ValidValuesService, helpTextMapper: HelptextMapper, private store: Store<{ quoteSummary: QuoteSummary }>) {
      this.store.select('quoteSummary').subscribe(data => {
        this.ratebook = data.rateBook;
        this.policyState = data.policyState;
      });
      this.loadValidValues();
      this.helpTextMapper = helpTextMapper;
  }

  ngOnInit(): void {
    this.formRef?.addControl('eft',new UntypedFormControl((this.installmentValue !== '' ? this.installmentValue : 'B'),Validators.compose([Validators.required])));
    this.formRef?.addControl('downPayment',new UntypedFormControl((this.downpaymentValue !== '' ? this.downpaymentValue : '1'),Validators.compose([Validators.required])));
  }

  /* Handle form errors */
  public hasError = (controlName: string, driverIndex: any, errorName: string) => {
      return this.formRef?.controls[controlName]?.hasError(errorName);
  };

  loadHelpText(fieldID: string): void {
    let helpTextObj = this.helpTextMapper.mapHelpText(fieldID);

    if (helpTextObj) {
      this.dialog.open(HelpTextDialogComponent, {
        width: '30%',
        panelClass: 'full-width-dialog',
        data: {
          title: helpTextObj.title,
          text: helpTextObj.text
        }
      });
    }
  }

  loadValidValues(): void {
    const validvaluesreq: ValidValuesReq = {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.PAYMENT_METHODS_PAGE_NAME,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook:  this.ratebook,
      state: this.policyState,
      dropdownName: GlobalConstants.PAYMENT_METHODS_DROPDOWN,
      filter:''
    };
    this.validValuesService.getValidValuesDetails(validvaluesreq).subscribe((data: ValidvaluesCommonRes) => {
      this.installmentValidValues = data.responseMap.ValidValues[0].values;
      this.downpaymentValidValues = (
        this.hasProducerSweep === false ? data.responseMap.ValidValues[1].values.filter(val => val.key !== 'N')
        : data.responseMap.ValidValues[1].values);



    },
      (error: any) => {
        // console.error('Error occured while invoking Valid Values for Coverages for Prior Carrier Limits');
      }
    );
  }

  checkForRerate(type: string, val: any) {
    let recalculateStatus = false;
    if ((type === 'eft' && val !== this.installmentValue) || (type === 'downpay' && val !== this.downpaymentValue)) {
      recalculateStatus = true;
    }

    /*if (type === 'eft' && this.installmentValue === 'N' && val !== this.installmentValue) {
      this.formRef.controls.downPayment.patchValue('Y');
      this.formRef.controls.eft.patchValue('Y');
    }*/

    this.payMethodChangeEvent.emit(recalculateStatus);
  }
}
