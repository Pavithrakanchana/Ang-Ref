import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { forkJoin, Observable, Observer, Subscription } from 'rxjs';
import { GlobalConstants } from 'src/app/constants/global.constant';
import { MessageConstants } from 'src/app/constants/message.constant';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { AutoQuoteData, Coverage } from 'src/app/shared/model/autoquote/autoquote.model';
import { ValidvaluesCommon, ValidvaluesCommonRes } from 'src/app/shared/model/validvalues/validvaluescommonres';
import { ValidValuesReq } from 'src/app/shared/model/validvalues/validvaluesreq.model';
import { MessagesService } from 'src/app/shared/services/messages.service';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { ValidValuesService } from 'src/app/shared/services/validvalues/validvalues.service';
import { CommonUtils } from 'src/app/shared/utilities/common-utils';
import { Tracker } from 'src/app/shared/utilities/tracker';
import QuoteSummary from 'src/app/state/model/summary.model';

@Component({
  selector: 'app-policycoverage-validvalues',
  template:
    `
  <form class="coverages-form" [formGroup]="coveragesForm">
    <div class="row" *ngIf="this.layout === 'horizontal'">
      <div *ngFor="let validvalue of this.validValues">
        <div class="col">
          <mat-form-field class="field-full-width" [class.mandatory-field]="validvalue.code === 'BI' || validvalue.code === 'PD'" appearance="outline">
            <mat-label>{{ validvalue.description }}</mat-label>
            <mat-select placeholder="Please select" id="{{validvalue.code}}" *ngIf = "validvalue.code !== 'MEDEXP' && validvalue.code !== 'INCL' && validvalue.code !== 'ACCD' && validvalue.code !== 'FUNB' "
               formControlName="{{validvalue.code}}" (selectionChange)="filterCoverages(validvalue.code, [])">
              <mat-option *ngFor="let keypair of validvalue.values"
                value="{{ keypair.key }}">{{ keypair.displayvalue }}</mat-option>
            </mat-select>
            <mat-select placeholder="Please select" id="{{validvalue.code}}" *ngIf = "!this.disableCov && (validvalue.code === 'MEDEXP' || validvalue.code === 'INCL' || validvalue.code === 'ACCD' || validvalue.code === 'FUNB') "
               formControlName="{{validvalue.code}}" (selectionChange)="filterCoverages(validvalue.code, [])">
              <mat-option *ngFor="let keypair of validvalue.values"
              value="{{ keypair.key }}">{{ keypair.displayvalue }}</mat-option>
            </mat-select>
            <mat-select placeholder="Please select" id="{{validvalue.code}}" *ngIf = "this.disableCov && (validvalue.code === 'MEDEXP' || validvalue.code === 'INCL' || validvalue.code === 'ACCD' || validvalue.code === 'FUNB') "
               formControlName="{{validvalue.code}}" (selectionChange)="filterCoverages(validvalue.code, [])" [disabled]="true">
              <mat-option
                value="None">Not Available</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>
    </div>
    <div *ngIf="this.layout === 'vertical'">
      <div class="row" *ngFor="let validvalue of this.validValues">
      <div class="col-lg-3 col-md-3 col-sm-8 col-xs-10 mat-label-font content-centered">
        {{ validvalue.description }}
      </div>
        <div class="col-lg-5 col-md-5 col-sm-8 col-xs-10">
          <mat-form-field class="field-full-width" [class.mandatory-field]="validvalue.code === 'BI' || validvalue.code === 'PD'" appearance="outline">
            <mat-label>{{ validvalue.description }}</mat-label>
            <mat-select placeholder="Please select" id="{{validvalue.code}}" *ngIf = "validvalue.code !== 'MEDEXP' && validvalue.code !== 'INCL' && validvalue.code !== 'ACCD' && validvalue.code !== 'FUNB' "
              formControlName="{{validvalue.code}}" (selectionChange)="filterCoverages(validvalue.code,[])">
              <mat-option *ngFor="let keypair of validvalue.values"
                value="{{ keypair.key }}">{{ keypair.displayvalue }}</mat-option>
            </mat-select>
            <mat-select placeholder="Please select" id="{{validvalue.code}}" *ngIf = "!this.disableCov && (validvalue.code === 'MEDEXP' || validvalue.code === 'INCL' || validvalue.code === 'ACCD' || validvalue.code === 'FUNB') "
               formControlName="{{validvalue.code}}" (selectionChange)="filterCoverages(validvalue.code, [])">
              <mat-option *ngFor="let keypair of validvalue.values"
              value="{{ keypair.key }}">{{ keypair.displayvalue }}</mat-option>
            </mat-select>
            <mat-select placeholder="Please select" id="{{validvalue.code}}" *ngIf = "this.disableCov && (validvalue.code === 'MEDEXP' || validvalue.code === 'INCL' || validvalue.code === 'ACCD' || validvalue.code === 'FUNB') "
               formControlName="{{validvalue.code}}" [disabled]="true">
              <mat-option
                value="None">Not Available</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>
    </div>
  </form>
  `
})
export class PolicyCoverageValidValues implements OnInit {
  validValues!: ValidvaluesCommon[];
  private validValuesMaster!: ValidvaluesCommon[];
  private validValuesReq!: ValidValuesReq;
  applicantNonOwner!: any;
  riskState = '';
  rideShareIndicator!: any;
  ratebook!: string;
  umpdDBStoreValue!: any;
  umbiDBStoreValue!: any;
  pageStatus!: any;
  duiIndicator: boolean | undefined = false;
  within35MonthsIndi: boolean = false;
  filingTypeFR44: boolean | undefined = false;
  filingTypeSR22: boolean | undefined = false;
  diffInDays: any;
  violations!: any;
  policyEffectiveDate: any;
  duiViolationInd = false;
  quoteNumber: any;
  errorArr: any = [];
  violationsLoaded = false;
  outOfStateList: string[] = [];
  qid: string = '';
  disableCov: boolean = false;

  // Inputs from parent form. Form reference and existing coverages if available
  @Input() coveragesForm!: UntypedFormGroup;
  @Input() policyCoverages!: Coverage[];
  @Input() layout!: string;
  @Output() coverageChangeEvent = new EventEmitter<string>();
  highestStateBILimit: string = '';
  highestStatePDLimit: string = '';



  constructor(private validvaluesService: ValidValuesService,
    private showSpinnerService: SpinnerStatusService,
    private quoteDataService: QuoteDataService,
    private logTracker: Tracker,
    private readonly messageService: MessagesService,
    private store: Store<{ quoteSummary: QuoteSummary }>) {
    this.store.select('quoteSummary').subscribe(data => {
      this.applicantNonOwner = data.nonOwner;
      this.riskState = data.policyState;
      this.rideShareIndicator = data.rideShare;
      this.ratebook = data.rateBook;
      this.umpdDBStoreValue = data.umpdStoredValue;
      this.umbiDBStoreValue = data.umbiStoredValue;
      const pageStatusArr = data.pageStatus.filter(page => (page.name === 'COVERAGES'));
      this.pageStatus = pageStatusArr.length > 0 ? pageStatusArr[0].status : 0;
      this.policyEffectiveDate = data.policyEffectiveDate;
      this.quoteNumber = data.qid;
      this.filingTypeFR44 = data.filingTypeFR44;
      this.filingTypeSR22 = data.filingTypeSR22;
      this.duiIndicator = data.duiViolationInd;

    });
  }

  subscription!: Subscription;

  ngOnInit(): void {

    // Valid values policy level coverages request
    this.getStateVVwithFilter(this.getVVFiltercode());
  }

  errorHandler(errorData: any): void {
    errorData?.error?.transactionNotification?.remark?.forEach((val: any) => {
      this.errorArr.push(val.messageText);
    });
    this.messageService.showError(this.errorArr);
    const element = document.querySelector('#topcontent');
    element?.scrollIntoView();
    this.showSpinnerService.showSpinner(false);
  }

  getStateVVwithFilter = (filterCode: string) => {
    this.validValuesReq = {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.POLICY_COVERAGE_PAGE_NAME,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: this.ratebook,
      state: this.riskState,
      dropdownName: GlobalConstants.POLICY_COVERAGE_PAGE_DROPDOWN,
      filter: filterCode
    }

    this.subscription = this.validvaluesService.getValidValuesDetails(
      this.validValuesReq).subscribe((data: ValidvaluesCommonRes) => {
        this.validValues = data.responseMap.ValidValues;
          if (!this.applicantNonOwner) {
            this.validValues.forEach((validValue, i) => {
              if (validValue.code == "PIP" || validValue.code == "PIPI" || validValue.code == "PIPD") {
                validValue.values.forEach((ele, j) => {
                  if (ele.key == "None" && this.riskState !== GlobalConstants.STATE_TX) {
                    validValue.values.splice(j, 1);
                  }
                });
              }
            })
          }

        // Make a copy by value to use for resetting select options after filtering
        this.validValuesMaster = JSON.parse(JSON.stringify(data.responseMap.ValidValues));

        // dymanically create form based on valid values response
        this.coveragesForm = this.toFormGroup();
        // perform initial filtering based on BI
        this.filterCoverages(this.validValues[0].code, []);

        // this.coveragesForm.patchValue({
        //   PD: '050' //set default value to PD
        // });
      },
        (_error: any) => {
          // console.error('Error occured while invoking Valid Values for Policy Coverages');
        }
      )

  }

  getVVFiltercode() {
    let filterVal = "";
    if (this.riskState == GlobalConstants.STATE_FL) {
      if (!this.applicantNonOwner && (this.filingTypeFR44|| (this.duiIndicator) || (this.filingTypeFR44 && this.filingTypeSR22))) {
        filterVal = GlobalConstants.FILING_FR44;
      } else if (this.applicantNonOwner && (this.filingTypeFR44 || (this.duiIndicator) || (this.filingTypeFR44 && this.filingTypeSR22))) {
        filterVal = GlobalConstants.APPLICANT_NAMED_NON_OWNER_FR44;
      } else if (!this.applicantNonOwner && this.filingTypeSR22) {
        filterVal = GlobalConstants.FILING_SR22;
      } else if (this.applicantNonOwner && this.filingTypeSR22) {
        filterVal = GlobalConstants.APPLICANT_NAMED_NON_OWNER_SR22;
      } else if (this.applicantNonOwner) {
        filterVal = GlobalConstants.APPLICANT_NAMED_NON_OWNER;
      }
    } else if (this.riskState == GlobalConstants.STATE_IN || this.riskState == GlobalConstants.STATE_CO || this.riskState == GlobalConstants.STATE_OH) {
      filterVal = this.applicantNonOwner ? GlobalConstants.APPLICANT_NAMED_NON_OWNER : (this.rideShareIndicator ? GlobalConstants.VEHICLE_USE_RIDESHARE : '');
    } else if (GlobalConstants.APPLICATION_NON_OWNER_STATES.includes(this.riskState)) {
      filterVal = this.applicantNonOwner ? GlobalConstants.APPLICANT_NAMED_NON_OWNER : '';
    } else if (this.riskState == GlobalConstants.STATE_VA) {
      if (!this.applicantNonOwner && this.filingTypeFR44) {
        filterVal = GlobalConstants.FILING_FR44;
      } else if (this.applicantNonOwner && this.filingTypeFR44) {
        filterVal = GlobalConstants.APPLICANT_NAMED_NON_OWNER_FR44;
      } else if (this.applicantNonOwner) {
        filterVal = GlobalConstants.APPLICANT_NAMED_NON_OWNER;
      }
    } else if (this.riskState == GlobalConstants.STATE_PA) {
      if (this.applicantNonOwner) {
        filterVal = GlobalConstants.APPLICANT_NAMED_NON_OWNER;
      }
    }

    console.log(filterVal,"Set Filter code for ", this.riskState, "  state", filterVal);
    return filterVal
  }

  loadCoverages() {
    let PDValue = this.coveragesForm.controls['PD'].value;
    let initUmbiValue = this.riskState === (GlobalConstants.STATE_VA || GlobalConstants.STATE_TX) ? this.coveragesForm.controls['UM/UIM']?.value : this.coveragesForm.controls['UMBI']?.value;
    this.validValues.forEach(validValue => {
      if (validValue.code === 'UMPD' && !this.applicantNonOwner) {
        // console.log("loadCoverages");
        if ((this.umbiDBStoreValue !== undefined && this.umbiDBStoreValue !== '') || initUmbiValue !== 'None') {
          if (initUmbiValue !== 'None') {
            validValue.values = validValue.values.filter(val => val.key === 'None' || val.key <= PDValue);
          } else {
            validValue.values = validValue.values.filter(val => val.key === 'None');
          }
        } else {
          validValue.values = validValue.values.filter(val => val.key === 'None');
        }
      }
      else if (validValue.code === 'UMPD' &&  (this.riskState === GlobalConstants.STATE_VA && this.applicantNonOwner)) {
        // console.log("loadCoverages");
        if ((this.umbiDBStoreValue !== undefined && this.umbiDBStoreValue !== '') || initUmbiValue !== 'None') {
          if (initUmbiValue !== 'None') {
            validValue.values = validValue.values.filter(val => val.key === 'None' || val.key <= PDValue);
          } else {
            validValue.values = validValue.values.filter(val => val.key === 'None');
          }
        } else {
          validValue.values = validValue.values.filter(val => val.key === 'None');
        }
      }
    });
  }
  loadPIPData(obj: any): any {
    let coverages = obj.autoQuote.policyCoveragesDetails.coverages;

    let objdata = {
      pipVal: "",
      pipiVal: "",
      pipdVal: "",
    }
    let objdatafill = false
    coverages.forEach((ele: any) => {
        if(this.riskState ===GlobalConstants.STATE_FL)
        {
          if (this.applicantNonOwner) {
            objdata.pipVal = "None"
            objdata.pipiVal = "None"
            objdata.pipdVal = "None"
          } else {
            if (ele.code == "BPIP") {
              if (ele.limits == "") {
                objdata.pipVal = "BWLI"
                objdata.pipiVal = "NIO"
                objdata.pipdVal = ""
              } else {
                if (ele.code.substring(0, 1) == "B" && ele.limits.substring(3, 4) == "I") {
                  objdata.pipVal = "BWLI"
                } else if (ele.code.substring(0, 1) == "B" && ele.limits.substring(3, 4) == "E") {
                  objdata.pipVal = "BWLE"
                }

                if (ele.limits.substring(4) == "N") {
                  objdata.pipiVal = "NIO"
                } else if (ele.limits.substring(4) == "D") {
                  objdata.pipiVal = "NIRR"
                }
                objdata.pipdVal = ele.deductible === '.00'? '0': ele.deductible.split(".")[0]
                objdatafill = true;
              }
            }
            if (ele.code == "EPIP" && !objdatafill) {
              if (ele.limits == "") {
                objdata.pipVal = "BWLI"
                objdata.pipiVal = "NIRR"
                objdata.pipdVal = ""
              } else {
                if (ele.code.substring(0, 1) == "E" && ele.limits.substring(3, 4) == "I") {
                  objdata.pipVal = "EWLI"
                } else if (ele.code.substring(0, 1) == "E" && ele.limits.substring(3, 4) == "E") {
                  objdata.pipVal = "EWLE"
                }

                if (ele.limits.substring(4) == "N") {
                  objdata.pipiVal = "NIO"
                } else if (ele.limits.substring(4) == "D") {
                  objdata.pipiVal = "NIRR"
                }
                objdata.pipdVal = ele.deductible === '.00'? '0': ele.deductible.split(".")[0]
              }
            }
          }
        }
        else
        {
          if(ele.code ==='PIP'){
            objdata.pipVal = ele.limits === "" ? "None" : ele.limits
          }
        }



    });
    return objdata;
  }
  toFormGroup(): UntypedFormGroup {
    // loop through valid values
    this.validValues.forEach(validValue => {
      let existingValue = null;

      // First check @Input value for existing coverage limits which need to be set
      this.policyCoverages?.forEach(coverage => {
        if (coverage?.code?.trim() === validValue?.code?.trim()) {
          existingValue = coverage?.limits;
        }
      });

      // add a form control for every valid value
      this.coveragesForm.addControl(
        validValue.code, (validValue.required ?
          new UntypedFormControl(existingValue !== null && existingValue > validValue.values[0].key ? existingValue : validValue.values[0].key,
            Validators.compose([Validators.required])) :
          new UntypedFormControl(existingValue !== null && existingValue > validValue.values[0].key ? existingValue : validValue.values[0].key)));
    });
    // console.log("coveragesform", this.coveragesForm);
    return this.coveragesForm;
  }

  public filterCoverages(coverageCode: string, biPdStateLimit: any) {
    // console.log("filterCoverages");
    this.coverageChangeEvent.next('');

    if (GlobalConstants.PD_UMPD_STATES.includes(this.riskState) && !this.applicantNonOwner) {
      const PDValue = biPdStateLimit.length > 0 ? biPdStateLimit[0] : this.coveragesForm.controls[coverageCode].value;
      let initUmbiValue = this.coveragesForm.controls['UMBI']?.value;
      let initUmuimValue = this.coveragesForm.controls['UM/UIM']?.value;
      // fire when PD changed IN state
      if (GlobalConstants.PD_FILTER_CODES.includes(coverageCode)) {
        //   this.validValues = [];
        //   this.validValues = JSON.parse(JSON.stringify(this.validValuesMaster));
        //   // Loop through form controls and check if coverage code is a UM code
        Object.keys(this.coveragesForm.controls).forEach(key => {
          if (GlobalConstants.PD_UMPD_FILTER_CODES.includes(key)) {
            this.validValues.forEach(validValue => {
              // if found then filter the values equal to or less than the BI value
              if (validValue.code === key) {
                if ((initUmbiValue !== 'None' || this.umbiDBStoreValue !== '') && this.riskState === GlobalConstants.STATE_IN) {
                  validValue.values = this.validValuesMaster.filter(obj => obj.code === key)[0].values;
                }
                if (initUmuimValue !== 'None' && this.riskState === GlobalConstants.STATE_TX) {
                  validValue.values = this.validValuesMaster.filter(obj => obj.code === key)[0].values;
                }
              }
            });
          }
        });

        Object.keys(this.coveragesForm.controls).forEach(key => {

          if (GlobalConstants.PD_UMPD_FILTER_CODES.includes(key)) {
            this.validValues.forEach(validValue => {
              // if found then filter the values equal to or less than the BI value
              //if(initUmbiValue !== 'None' || this.umbiDBStoreValue !== '') {
              if (validValue.code === key) {
                const coverageValue = this.coveragesForm.controls[validValue.code].value;
                validValue.values = validValue.values.filter(
                  val => val.key === 'None' || val.key <= PDValue);
                if ((this.umbiDBStoreValue !== '' || initUmbiValue !== 'None') && this.riskState === GlobalConstants.STATE_IN) {
                  // console.log("CheckValue", coverageValue, PDValue, (coverageValue > PDValue));
                  if (coverageValue > PDValue && this.coveragesForm.controls[validValue.code].value !== 'None') {
                    this.coveragesForm.controls[validValue.code].patchValue(PDValue);
                  }
                }
                if (initUmuimValue !== 'None' && this.riskState === GlobalConstants.STATE_TX) {
                  if (coverageValue > PDValue && this.coveragesForm.controls[validValue.code].value !== 'None') {
                    this.coveragesForm.controls[validValue.code].patchValue(PDValue);
                  }
                }
              }
            });
          }
        });
      }
      // update UMPD validvalues based on UMBI(uninsured/underinsured motorist) selection for IN state only
    }

    if (GlobalConstants.PD_UMPD_STATES.includes(this.riskState)) {
      const PDValue = biPdStateLimit.length > 0 ? biPdStateLimit[0] : this.coveragesForm.controls[coverageCode].value;
      let initUmuimValue = this.coveragesForm.controls['UM/UIM']?.value;
      // fire when PD changed VA state
      if (GlobalConstants.PD_FILTER_CODES.includes(coverageCode)) {
        Object.keys(this.coveragesForm.controls).forEach(key => {
          if (GlobalConstants.PD_UMPD_FILTER_CODES.includes(key)) {
            this.validValues.forEach(validValue => {
              // if found then filter the values equal to or less than the BI value
              if (validValue.code === key) {
                if (initUmuimValue !== 'None' && this.riskState === GlobalConstants.STATE_VA) {
                  validValue.values = this.validValuesMaster.filter(obj => obj.code === key)[0].values;
                }
              }
            });
          }
        });

        Object.keys(this.coveragesForm.controls).forEach(key => {
          if (GlobalConstants.PD_UMPD_FILTER_CODES.includes(key)) {
            this.validValues.forEach(validValue => {
              if (validValue.code === key) {
                const coverageValue = this.coveragesForm.controls[validValue.code].value;
                validValue.values = validValue.values.filter(
                  val => val.key === 'None' || val.key <= PDValue);
                if (initUmuimValue !== 'None' && this.riskState === GlobalConstants.STATE_VA) {
                  if (coverageValue > PDValue && this.coveragesForm.controls[validValue.code].value !== 'None') {
                    this.coveragesForm.controls[validValue.code].patchValue(PDValue);
                  }
                }
              }
            });
          }
        });
      }
      // update UMPD validvalues based on UMBI(uninsured/underinsured motorist) selection for VA state only
    }

    // Fire when BI is changed
    if (GlobalConstants.BI_FILTER_CODES.includes(coverageCode)) {
      try {
        const biValue = biPdStateLimit.length > 0 ? biPdStateLimit[0] : this.coveragesForm.controls[coverageCode].value;

        // reset values then filter
        // this.validValues = [];
        // this.validValues = JSON.parse(JSON.stringify(this.validValuesMaster));
        Object.keys(this.coveragesForm.controls).forEach(key => {
          if (GlobalConstants.UM_FILTER_CODES.includes(key)) {
            this.validValues.forEach(validValue => {
              // if found then filter the values equal to or less than the BI value
              if (validValue.code === key) {
                validValue.values = this.validValuesMaster.filter(obj => obj.code === key)[0].values;
              }
            });
          }
        });
        if (biPdStateLimit?.length == 0) {
          // Loop through form controls and check if coverage code is a UM code
          Object.keys(this.coveragesForm.controls).forEach(key => {
            if (GlobalConstants.UM_FILTER_CODES.includes(key)) {
              this.validValues.forEach(validValue => {
                // if found then filter the values equal to or less than the BI value
                if (validValue.code === key) {
                  const coverageValue = this.coveragesForm.controls[validValue.code].value;
                  if (key === 'UMBI' && this.riskState === GlobalConstants.STATE_FL || ((key === 'UMUNST' || key === 'UIMUNS') && this.riskState === GlobalConstants.STATE_PA)) {
                    const biValueStacked = biValue + 'S';
                    validValue.values = validValue.values.filter(
                      val => val.key === 'None' || val.key <= biValueStacked);
                    if (coverageValue > biValueStacked && this.coveragesForm.controls[validValue.code].value !== 'None') {
                      this.coveragesForm.controls[validValue.code].patchValue(this.applicantNonOwner? GlobalConstants.NONE : biValueStacked);
                    }
                  }
                  else {
                    validValue.values = validValue.values.filter(
                      val => val.key === 'None' || val.key <= biValue);
                    if (coverageValue > biValue && this.coveragesForm.controls[validValue.code].value !== 'None') {
                      this.coveragesForm.controls[validValue.code].patchValue(biValue);
                    }
                  }
                }
              });
            }
          });
        }
        // Apply OutOfState highest BI PD limits logic
        if (biPdStateLimit.length > 0) { //update highest values
          this.highestStateBILimit = biPdStateLimit[0];
          this.highestStatePDLimit = biPdStateLimit[1];
        }
        if (this.highestStateBILimit !== GlobalConstants.EMPTY_STRING || this.highestStatePDLimit !== GlobalConstants.EMPTY_STRING) {
          this.validValues.forEach(validValue => {
            // if found then filter the values equal to or less than the BI value
            if (validValue.code === 'BI' || validValue.code === 'PD') {
              const biLimit = this.highestStateBILimit === GlobalConstants.EMPTY_STRING ? biValue : this.highestStateBILimit;
              const pdValue = this.highestStatePDLimit === GlobalConstants.EMPTY_STRING ? this.coveragesForm.controls['PD'].value : this.highestStatePDLimit;
              const value = validValue.code === 'BI' ? biLimit : pdValue;
              validValue.values = validValue.values.filter(
                val => val.key === 'None' || val.key >= value);
            }
          });
        }

        // Apply logic for underInsured and Uninsured on BI limits changes
      } catch (e) {
        // console.error('Error occured while filtering policy coverages');
      }
    }
    if (this.riskState === GlobalConstants.STATE_IN  && !this.applicantNonOwner) {
      // filter UMPD coverage for IN
      let PDVal = this.coveragesForm.controls['PD'].value
      if (coverageCode === 'UMBI' && this.coveragesForm.controls['UMBI'].value === 'None') {
        this.validValues.forEach(validValue => {
          if (validValue.code === 'UMPD') {
            validValue.values = validValue.values.filter(val => val.key === 'None');
            this.coveragesForm.patchValue({
              UMPD: 'None'
            });
          }
        });
      }
      if (coverageCode === 'UMBI' && this.coveragesForm.controls['UMBI'].value !== 'None') {
        // console.log("UMPD else ")
        let masterData = JSON.parse(JSON.stringify(this.validValuesMaster));
        let umpd_validvalues = masterData.find((i: any) => { if (i.code === 'UMPD') { return i.values; } })
        this.validValues.forEach(validValue => {
          if (validValue.code === 'UMPD') {
            validValue.values = umpd_validvalues.values
            validValue.values = validValue.values.filter(
              val => val.key === 'None' || val.key <= PDVal);
          }
        });
      }
    }
    if (this.riskState === GlobalConstants.STATE_TX  && !this.applicantNonOwner) {
      // filter UMPD coverage for IN
      let PDVal = this.coveragesForm.controls['PD'].value
      let umUIMValue = this.coveragesForm.controls['UM/UIM'].value;
      if (coverageCode === 'UM/UIM' && umUIMValue === 'None') {
        this.validValues.forEach(validValue => {
          if (validValue.code === 'UMPD') {
            validValue.values = validValue.values.filter(val => val.key === 'None');
            this.coveragesForm.patchValue({
              UMPD: 'None'
            });
          }
        });
      }
      if (coverageCode === 'UM/UIM' && umUIMValue !== 'None') {
        // console.log("UMPD else ")
        let masterData = JSON.parse(JSON.stringify(this.validValuesMaster));
        let umpd_validvalues = masterData.find((i: any) => { if (i.code === 'UMPD') { return i.values; } })
        this.validValues.forEach(validValue => {
          if (validValue.code === 'UMPD') {
            validValue.values = umpd_validvalues.values
            validValue.values = validValue.values.filter(
              val => val.key === 'None' || val.key <= PDVal);
          }
        });
      }
    }
    if(this.riskState === GlobalConstants.STATE_IN) {
      if (coverageCode === 'PD' && this.coveragesForm.controls['UMBI']?.value === 'None') {
        this.validValues.forEach(validValue => {
          if (validValue.code === 'UMPD') {
            validValue.values = validValue.values.filter(val => val.key === 'None');
            this.coveragesForm.patchValue({
              UMPD: 'None'
            });
          }
        });
      }
  }
    if (coverageCode === 'BI' && this.coveragesForm.controls['BI'].value === 'None') {
      this.validValues.forEach(validValue => {
        if (GlobalConstants.BI_UMPD_MP_FILTER_CODES.includes(validValue.code)) {
          validValue.values = validValue.values.filter(val => val.key === 'None');
          this.coveragesForm.patchValue({
            UMBI: 'None',
            MP: 'None'
          });
        }
      });
    }
    if (coverageCode === 'BI' && this.coveragesForm.controls['BI'].value !== 'None') {
      this.validValuesMaster.forEach(validValue => {
        if (validValue.code === 'MP') {
          this.validValues.forEach(validValueData => {
            if (validValueData.code === 'MP') {
              validValueData.values = validValue.values;
            }
          });
        }
      });
    }
    if(this.riskState === GlobalConstants.STATE_PA) {
      let cfpbValue = this.coveragesForm.controls['CFPB']?.value;
        let disableCov = cfpbValue !== 'None' ? true : false;
        this.embCovCtl(disableCov);
        if(disableCov) {
          this.coveragesForm.controls['MEDEXP']?.setValue('None');
          this.coveragesForm.controls['INCL']?.setValue('None');
          this.coveragesForm.controls['ACCD']?.setValue('None');
          this.coveragesForm.controls['FUNB']?.setValue('None');
          this.disableCov = true;
        } else {
          this.disableCov = false;
    }
  }
  if(this.riskState === GlobalConstants.STATE_PA && this.rideShareIndicator) {
    this.validValues.forEach(validValue => {
        if(validValue.code === 'BI') {
        validValue.values = validValue.values.filter(val => val.key >= GlobalConstants.BI_RIDESHARE_FILTER_PA);
        }
        if(validValue.code === 'PD') {
          validValue.values = validValue.values.filter(val => val.key >= GlobalConstants.PD_RIDESHARE_FILTER_PA);
          }
    });
  }
    return this.validValues
  
}
  embCovCtl(disableCov: boolean) {
    let medexpValue = this.coveragesForm.controls['MEDEXP']?.value;
    if(!disableCov && (medexpValue < '100' || medexpValue === 'None')) {
      this.coveragesForm.controls['EMB'].disable();
      this.coveragesForm.controls['EMB']?.setValue('None');
    } else {
      this.coveragesForm.controls['EMB'].enable();
    }
  }

  checkForOutOfState(): void {
    const outOfStateCount = this.outOfStateList?.filter((val: any) => (val?.trim() !== "" && val?.trim() !== this.riskState)).length;
    if (outOfStateCount > 0) {
      this.getBIPDHightestValidValue(this.outOfStateList);
    }
  }

getBIPDHightestValidValue(stateList: any): void {
    let qid = JSON.stringify(this.quoteNumber);
    this.qid = qid.replace(/"/g, '');
    this.showSpinnerService.showSpinner(true);
    const validvaluesreq: ValidValuesReq = {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.OUT_OF_STATE_LIMIT,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: this.ratebook,
      state: stateList.join(','),
      dropdownName: GlobalConstants.OUT_OF_STATE_LIMIT_DROPDOWN,
      filter:''
    };

    let startTime = new Date();
    this.validvaluesService.getBIPDHighestValidValues(validvaluesreq).subscribe(async (data: any) => {
      await data;
      if (data?.responseMap?.ValidValues) {
        const biDBValue = this.coveragesForm.controls['BI'].value;
        const pdDBValue = this.coveragesForm.controls['PD'].value;
        let highestStateBIValue = '', highestStateBIDisplayValue = '', biState = '', highestStatePDValue = '', highestStatePDDisplayValue = '', pdState = '';
        data.responseMap.ValidValues.forEach((validValue: { code: any; values: any[], state: any }) => {
          if (validValue.code === 'BI') {
            highestStateBIValue = validValue.values[0].key;
            highestStateBIDisplayValue = validValue.values[0].displayvalue;
            this.highestStateBILimit = highestStateBIValue;
            biState = validValue.state;
          }
          if (validValue.code === 'PD') {
            highestStatePDValue = validValue.values[0].key;
            highestStatePDDisplayValue = validValue.values[0].displayvalue
            this.highestStatePDLimit = highestStatePDValue;
            pdState = validValue.state;
          }
        });

        /*this.coveragesForm.patchValue({ // patch BI/PD highest values to filter dropdowns
          BI: highestStateBIValue,
          PD: highestStatePDValue
        });*/

        const validvalues = this.filterCoverages('BI', [highestStateBIValue, highestStatePDValue]);
        let biValue = biDBValue < highestStateBIValue ? highestStateBIValue : biDBValue;
        let pdValue = pdDBValue < highestStatePDValue ? highestStatePDValue : pdDBValue;
        // const validvalues = this.child.filterCoverages('BI', [biValue, pdValue]);
        validvalues.forEach(validValue => {
          if (validValue.code === 'BI') {
            if (!(validValue.values.some(e => e.key === highestStateBIValue))) {
              //biValue = biValue === validValue.values[0].key || biValue == highestStateBIValue ? validValue.values[0].key : biValue;
              biValue = (biValue !== validValue.values[0].key && biValue === highestStateBIValue) ? validValue.values[0].key : biValue;
              highestStateBIDisplayValue = validValue.values[0].displayvalue;
            }
          }
          if (validValue.code === 'PD') {
            if (!(validValue.values.some(e => e.key === highestStatePDValue))) {
              //pdValue = pdDBValue === validValue.values[0].key ? validValue.values[0].key : pdDBValue;
              pdValue = (pdValue !== validValue.values[0].key && pdValue === highestStatePDValue) ? validValue.values[0].key : pdValue;
              highestStatePDDisplayValue = validValue.values[0].displayvalue;
            }
          }
        });

        this.coveragesForm.patchValue({  // Once dropdown filtering is done now patch BI/PD based on getCall resp and Statehighest condition
          BI: biValue,
          PD: pdValue
        });

        // Loop through form controls and check if coverage code is a UM code
        this.filterCoverages('BI', []);
        /*Object.keys(this.coveragesForm.controls).forEach(key => {
          if (GlobalConstants.UM_FILTER_CODES.includes(key)) {
            validvalues.forEach(validValue => {
              // if found then filter the values equal to or less than the BI value
              if (validValue.code === key) {
                const coverageValue = this.coveragesForm.controls[validValue.code].value;
                validValue.values = validValue.values.filter(
                  val => val.key === 'None' || val.key <= biValue || val?.key === biValue+'S');
                if (coverageValue > biValue && this.coveragesForm.controls[validValue.code].value !== 'None') {
                  this.coveragesForm.controls[validValue.code].patchValue(biValue);
                }
              }
            });
          }
        });*/
        let softErrors = [];
        if (biDBValue < highestStateBIValue) {
          const biMessage = "BI limits were adjusted to " + highestStateBIDisplayValue + " because of the " + biState + " state requirements for minimum liability coverage.";
          softErrors.push(biMessage);
        }
        if (pdDBValue < highestStatePDValue) {
          //const pdMessage = "PD limits were adjusted to " + (arrHDisplayVal.length > 0 ? arrHDisplayVal[0] : highestStatePDDisplayValue) + " because of the " + pdState + " state requirements for minimum liability coverage.";
          const pdMessage = "PD limits were adjusted to " + highestStatePDDisplayValue + " because of the " + pdState + " state requirements for minimum liability coverage.";
          softErrors.push(pdMessage);
        }
        this.messageService.softError(softErrors);
        if (softErrors.length > 0) {
          const element = document.querySelector('#topcontent');
          element?.scrollIntoView();
        }
      }

      this.logTracker.loginfo('RatesComponent', 'getBIPDHightestValidValue', 'validValuesService.getBIPDHighestValidValues',
        'QuoteNumber='.concat(this.qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));

      this.showSpinnerService.showSpinner(false);
    },
      (error: any) => {
        this.logTracker.logerror('RatesComponent', 'getBIPDHightestValidValue', 'validValuesService.getBIPDHighestValidValues',
          'Error=Rate Page Rate Get BIPD Highest Valid Values|QuoteNumber='.concat(this.qid), error);
        this.showSpinnerService.showSpinner(false);
        // console.error('Error occured while invoking Valid Values for Coverages for Prior Carrier Limits' + error);
      }
    );
  }

loadOutOfStateList = (vehicles: any): void => {
    vehicles?.forEach((obj: any) => {
      if (obj?.garageAddress?.state) {
        this.outOfStateList.push(obj?.garageAddress?.state);
      }
    });
  }

setpdLimit(obj: any, pdBLimit: string): string {
    let defaultLimit;
    let vvLimit = this.validValues?.filter(obj => GlobalConstants.PD_FILTER_CODES.includes(obj.code))[0]?.values[0]?.key;
    if (this.riskState === GlobalConstants.STATE_FL) {
      if (this.applicantNonOwner && (this.filingTypeFR44 || (this.duiIndicator))) {
        defaultLimit = pdBLimit > GlobalConstants.PD_NNO_FILTER ? pdBLimit : '050';
        return defaultLimit;
      }
      if (!this.applicantNonOwner && (this.filingTypeFR44 || (this.duiIndicator))) {
        defaultLimit = pdBLimit > GlobalConstants.PD_NNO_FILTER ? pdBLimit : '050'
        return defaultLimit;
      }
      if (this.applicantNonOwner && (!this.filingTypeFR44 && (!this.duiIndicator))) {
        defaultLimit = pdBLimit !== '010' ? '010' : '010'
        return defaultLimit;
      }
    }
    // 
     if (this.riskState === GlobalConstants.STATE_VA) {
      if (!this.applicantNonOwner && this.filingTypeFR44) {
        defaultLimit = pdBLimit > "025" ? pdBLimit : '040'
        return defaultLimit;
      }
      if (this.applicantNonOwner && this.filingTypeFR44) {
        if(pdBLimit === '' && !this.checkAnyLimitSaved(obj)){
          defaultLimit = "040"
        }else if(pdBLimit === '' && this.checkAnyLimitSaved(obj)){
          defaultLimit = "None"
        }else if (pdBLimit >= "020"){
          defaultLimit = pdBLimit;
        }else{
          defaultLimit='None';
        }
        defaultLimit = pdBLimit > GlobalConstants.PD_NNO_FILTER  ? '040' : pdBLimit === '' || pdBLimit === '020' || pdBLimit === '025'? '040': pdBLimit;
        return defaultLimit;
      }
      if (this.applicantNonOwner && !this.filingTypeFR44 ) {
        if(pdBLimit === '' && !this.checkAnyLimitSaved(obj)){
          defaultLimit = "020"
        }else if(pdBLimit === '' && this.checkAnyLimitSaved(obj)){
          defaultLimit = "None"
        }else if (pdBLimit >= "020"){
          defaultLimit = pdBLimit;
        }else{
          defaultLimit='None';
        }
        //defaultLimit = pdBLimit > GlobalConstants.PD_NNO_FILTER  ? '040' : pdBLimit === '' || pdBLimit === '020' || pdBLimit === '025'? '040': pdBLimit;
        return defaultLimit;
      }
    }

    if (!this.applicantNonOwner && pdBLimit > GlobalConstants.PD_NNO_FILTER && this.riskState !== GlobalConstants.STATE_CO && this.riskState !== GlobalConstants.STATE_VA && this.riskState !== GlobalConstants.STATE_PA) {
      defaultLimit = GlobalConstants.PD_NNO_FILTER;
      return defaultLimit;
    }
    if (this.rideShareIndicator) {
        vvLimit = this.riskState === GlobalConstants.STATE_PA ? '025' : vvLimit;
      defaultLimit = pdBLimit > vvLimit ? pdBLimit : (this.riskState === GlobalConstants.STATE_OH ? GlobalConstants.PD_RIDESHARE_FILTER_OH : (this.riskState === GlobalConstants.STATE_PA ? GlobalConstants.PD_RIDESHARE_FILTER_PA : vvLimit));
      return defaultLimit
    }
    defaultLimit = pdBLimit !== '' ? pdBLimit : vvLimit;
    return defaultLimit;

  }

setBILimit(obj: any, biDBLimit: string): string {
    let defaultLimit;
    let vvLimit = this.validValues?.filter(obj => GlobalConstants.BI_FILTER_CODES.includes(obj.code))[0]?.values[0]?.key;
    // console.log('biDBLimit:' + biDBLimit);
    // console.log('vvLimit-' + vvLimit);
    if (this.riskState === GlobalConstants.STATE_FL) {
      if (this.applicantNonOwner && (this.filingTypeFR44 || (this.duiIndicator))) {
        defaultLimit = biDBLimit == '' || biDBLimit == null ? "100/300" : biDBLimit > '100/300' ? biDBLimit :  '100/300';
        return defaultLimit;
      }
      if (!this.applicantNonOwner && (this.filingTypeFR44 || (this.duiIndicator))) {
        defaultLimit = biDBLimit > '100/300' ? biDBLimit : '100/300'
        return defaultLimit;
      }
      // console.log(biDBLimit + "===biDBLimit=====");
      if (this.applicantNonOwner && (!this.filingTypeFR44 || (!this.duiIndicator)) && this.filingTypeSR22) {
        defaultLimit = biDBLimit == '' || biDBLimit == null ? '010/020' : biDBLimit > '010/020' ? '010/020' : '010/020'
        return defaultLimit;
      }
      if (!this.applicantNonOwner && (!this.filingTypeFR44 || (!this.duiIndicator)) && this.filingTypeSR22) {
        defaultLimit = biDBLimit == '' || biDBLimit == null ? '010/020' : biDBLimit > '010/020' ? biDBLimit : '010/020'
        return defaultLimit;
      }

      if (this.applicantNonOwner && (!this.filingTypeFR44 && (!this.duiIndicator))) {
        if(biDBLimit === '' && !this.checkAnyLimitSaved(obj)){
          defaultLimit = "010/020"
        }else if(biDBLimit === '' && this.checkAnyLimitSaved(obj)){
          defaultLimit = "None"
        }else if (biDBLimit >= "010/020"){
          defaultLimit = "010/020";
        }else{
          defaultLimit='None';
        }
        //defaultLimit = (biDBLimit === '' || biDBLimit === 'None') && (this.checkAnyLimitSaved(obj) ? "010/020" : (biDBLimit > '010/020'? '010/020': biDBLimit;
        //defaultLimit = biDBLimit === 'None' || biDBLimit > '010/020' ? '010/020' : biDBLimit === ''? 'None': biDBLimit;
        return defaultLimit;
      }
      if (!this.applicantNonOwner && (!this.filingTypeFR44 && !this.duiIndicator && !this.filingTypeSR22)) {
        if(biDBLimit === '' && !this.checkAnyLimitSaved(obj)){
          defaultLimit = "010/020"
        }else if(biDBLimit === '' && this.checkAnyLimitSaved(obj)){
          defaultLimit = "None"
        }else if (biDBLimit > "010/020"){
          defaultLimit = biDBLimit;
        }else{
          defaultLimit="010/020"
        }

        // defaultLimit = biDBLimit === '' || biDBLimit === 'None' ? "None" : biDBLimit;
        //defaultLimit = biDBLimit === '' || biDBLimit === 'None' ? (!this.checkAnyLimitSaved(obj) ? "010/020" : "None") : biDBLimit;
        return defaultLimit;
      }
    }

    if(this.riskState === GlobalConstants.STATE_PA) {
      if (this.applicantNonOwner) {
        defaultLimit = biDBLimit == '' || biDBLimit == null ? "100/300" : biDBLimit < '100/300' ? biDBLimit :  '100/300';
        return defaultLimit;
      }
    }

    if (this.riskState === GlobalConstants.STATE_VA) {
      if (this.applicantNonOwner && !this.filingTypeFR44) {
        if(biDBLimit === '' && !this.checkAnyLimitSaved(obj)){
          defaultLimit = "030/060"
        }else if(biDBLimit === '' && this.checkAnyLimitSaved(obj)){
          defaultLimit = "None"
        }
        else if (biDBLimit >= "030/060"){
          defaultLimit = biDBLimit;
        }else{
          defaultLimit='None';
        }
        defaultLimit = biDBLimit > GlobalConstants.BI_NNO_FILTER_VA ? '030/060' : biDBLimit === ''? '030/060': biDBLimit;
        return defaultLimit;
      }
      if (!this.applicantNonOwner && !this.filingTypeFR44) {
        if(biDBLimit === '' && !this.checkAnyLimitSaved(obj)){
          defaultLimit = "030/060"
        }else if(biDBLimit === '' && this.checkAnyLimitSaved(obj)){
          defaultLimit = "None"
        }else if (biDBLimit > "030/060"){
          defaultLimit = biDBLimit;
        }else{
          defaultLimit="030/060"
        }
        return defaultLimit;
      }
    }
    if (this.applicantNonOwner && biDBLimit > GlobalConstants.BI_NNO_FILTER && this.riskState !== GlobalConstants.STATE_CO && this.riskState !== GlobalConstants.STATE_VA) {
      defaultLimit = GlobalConstants.BI_NNO_FILTER;
      return defaultLimit;
    }

    if(this.applicantNonOwner && this.filingTypeFR44 && this.riskState === GlobalConstants.STATE_VA){
      defaultLimit = GlobalConstants.BI_NNO_FILTER_VA;
      return defaultLimit;
    }

    if (this.filingTypeFR44 && biDBLimit < GlobalConstants.BI_NNO_FILTER_VA && this.riskState === GlobalConstants.STATE_VA) {
      defaultLimit = GlobalConstants.BI_NNO_FILTER_VA;
      return defaultLimit;
    }

    if (this.rideShareIndicator) {
      // console.log('inside ride');
      vvLimit = this.riskState == GlobalConstants.STATE_PA ? '050/100' : vvLimit;
      defaultLimit = biDBLimit > vvLimit ? biDBLimit : (this.riskState === GlobalConstants.STATE_OH ? GlobalConstants.BI_RIDESHARE_FILTER_OH : (this.riskState === GlobalConstants.STATE_PA ? GlobalConstants.BI_RIDESHARE_FILTER_PA : vvLimit));
      return defaultLimit;
    }
    defaultLimit = biDBLimit !== '' ? biDBLimit : vvLimit;
    // console.log('defaultLimit::' + defaultLimit);
    return defaultLimit;

  }

getUms(obj: any) {
    if(this.riskState === GlobalConstants.STATE_VA) {
      let umsType = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'UMPD')?.type.trim();
      console.log(umsType);
      if(umsType==='Standard'){
        umsType = 'Y';
      }
      else if(umsType==='Alternative'){
        umsType = 'N';
      }
      else{umsType='Y'}
      return umsType;
    }
  }
  
getUmunstlimit(obj: any) {
  if(this.riskState === GlobalConstants.STATE_PA) {
    let umunstLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'UMUNST')?.limits.trim();
    let umstLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'UMST')?.limits.trim();
    umunstLimit = umstLimit ==='' || umstLimit === null ? umunstLimit : umstLimit+'S';
  return umunstLimit;
}
}

getUimunsLimit(obj: any) {
  if(this.riskState === GlobalConstants.STATE_PA) {
    let uimunsLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'UIMUNS')?.limits.trim();
    let uimstLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'UIMST')?.limits.trim();
    uimunsLimit = uimstLimit ==='' || uimstLimit === null ? uimunsLimit : uimstLimit+'S';
  return uimunsLimit;
}
}

  checkAnyLimitSaved(obj: any): boolean {
    const covg = obj?.autoQuote?.policyCoveragesDetails?.coverages;

    if (covg && covg.length > 0) {
      for (let el of covg) {
        if (el.code === 'PD' && el.limits) {
          return true;
        }
      };
    }
    return false;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
