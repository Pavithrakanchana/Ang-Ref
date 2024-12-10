import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PhoneNumberValidator } from '../../validators/phone.validator';
import { formatDate } from '@angular/common';
import { Store } from '@ngrx/store';
import { ApplicationService } from 'src/app/services/application.service';
import QuoteSummary from 'src/app/state/model/summary.model';
import { ProducerDataRes } from '../../model/producer.model';
import { MessagesService } from '../../services/messages.service';
import { SpinnerStatusService } from '../../services/spinner-status.service';


@Component({
  selector: 'app-producer-name-popup-dialog',
  templateUrl: './producer-name-popup-dialog.component.html',
  styleUrls: ['./producer-name-popup-dialog.component.scss']
})

export class ProducerNamePopupDialogComponent implements OnInit {

  lineOfBusinessList: any[] = [
    { value: 'APV', viewValue: 'Auto', is_selected: true },
    { value: 'SPL', viewValue: 'Speciality', is_selected: false },
    { value: 'COM', viewValue: 'Commercial', is_selected: false }
  ];

  selectAll = false;
  producerInformationForm!: UntypedFormGroup;
  formSubmitAttempt = false;
  effectiveDate: any;
  quoteNumber!: string;
  mco!: string;
  producerCode!: string;


  constructor(private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<ProducerNamePopupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private store: Store<{ quoteSummary: QuoteSummary }>,
    private applicationService: ApplicationService, private readonly messageService: MessagesService,
    private showSpinnerService: SpinnerStatusService
  ) {

    this.effectiveDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');

    this.store.select('quoteSummary').subscribe(data => {

      this.quoteNumber = data.qid;
      this.mco = data.mco;
      this.producerCode = data.producerCode;

    });
  }

  ngOnInit(): void {
    const lob = this.lineOfBusinessList.map(x => this.fb.control(false))
    this.producerInformationForm = this.fb.group({
      requestProducerName: ['', Validators.required],
      phone: ['', [Validators.required, PhoneNumberValidator.phoneValidator]],
      emailAddress: ['', [Validators.required, Validators.pattern('[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,3}$')]],
      lineOfBusiness: ['APV', Validators.required],
    });
  }


  closeDialog(val: boolean) {

    this.dialogRef.close({ event: val });
  }

  public hasError = (controlName: string, errorName: string, index: any, formArrayName: string) => {
    return this.producerInformationForm.controls[controlName].hasError(errorName);
  };

  trimSpace(formControlNameVal: any) {
    if (this.producerInformationForm.controls[formControlNameVal]?.value !== "" && this.producerInformationForm.controls[formControlNameVal]?.value !== null ) {
      this.producerInformationForm.controls[formControlNameVal]?.patchValue(this.producerInformationForm.controls[formControlNameVal]?.value.trim()); 
    }
  }

  submit(formData: any) {
    if (formData.controls.phone.value == '' || formData.controls.emailAddress.value == '') {
      this.producerInformationForm.markAllAsTouched();
    }

    if (this.producerInformationForm.valid) {
      this.showSpinnerService.showSpinner(true);
      let qid = JSON.stringify(this.quoteNumber);
      qid = qid.replace(/"/g, '');
      const email = this.producerInformationForm.controls.emailAddress.value;
      const phone = this.producerInformationForm.controls.phone.value;
      const producerName = this.producerInformationForm.controls.requestProducerName.value;

      const lob = this.producerInformationForm.controls.lineOfBusiness.value;


      this.applicationService.sendProducerData(email, lob, producerName, phone, this.effectiveDate,
        this.mco, qid, this.producerCode).subscribe((res: ProducerDataRes) => {

          this.showSpinnerService.showSpinner(false);
          this.dialogRef.close({
            clicked: 'submit',
            // form: formData
          });
        },
          (errorData) => {

            this.errorHandler(errorData);
          });
    }
  }


  /* API error handling*/
  errorHandler(errorData?: any): void {
    const errorArr: any = [];
    errorData?.error?.transactionNotification?.remark?.forEach((val: any) => {
      errorArr.push(val.messageText);
    });
    this.messageService.showError(errorArr);
    const element = document.querySelector('#topcontent');
    element?.scrollIntoView();
    this.showSpinnerService.showSpinner(false);
  }
}
