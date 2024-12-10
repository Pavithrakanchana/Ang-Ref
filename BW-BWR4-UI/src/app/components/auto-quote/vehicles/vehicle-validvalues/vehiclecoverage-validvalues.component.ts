import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, FormGroupDirective } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { GlobalConstants } from 'src/app/constants/global.constant';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { HelpTextDialogComponent } from 'src/app/shared/dialog/helptext-dialog/helptext-dialog.component';
import { Coverage } from 'src/app/shared/model/autoquote/autoquote.model';
import { ValidvaluesCommon, ValidvaluesCommonRes } from 'src/app/shared/model/validvalues/validvaluescommonres';
import { ValidValuesReq } from 'src/app/shared/model/validvalues/validvaluesreq.model';
import { ValidValuesService } from 'src/app/shared/services/validvalues/validvalues.service';
import { HelptextMapper } from 'src/app/shared/utilities/helptext-mapper';
import QuoteSummary, { VehicleSummary } from 'src/app/state/model/summary.model';
@Component({
  selector: 'app-vehiclecoverage-validvalues',
  template:
    `
    <div class="coverages-form" [formGroup]="coveragesForm" >
        <div *ngIf="this.layout === 'vertical' && page ==='rates'" >
          <div>
             <div class="row"  *ngFor="let validvalue of this.validValues">
                <div *ngIf = "validvalue.code !== 'antiTheftCode'" class="col-lg-3 col-md-3 col-sm-8 col-xs-10 bold content-centered">
                  <label *ngIf="!(this.applicantNonOwner && validvalue.description === 'Roadside')
                  && checkIfValidLoanLease(covIndex, validvalue.code)" class="veh-cov-label mat-label-font">{{ validvalue.description }}  </label>
                  <span>
                    <mat-icon *ngIf="validvalue.code === 'CEQ'" class="info-icon align-self-center radio-icon" aria-label="" matTooltip=""
                      id="additionalEquipmentHelp{{covIndex}}" matTooltipClass="bwr-tooltip" (click)="loadHelpText('48')">info</mat-icon>
                    <mat-icon *ngIf="validvalue.code === 'EXTR'" class="info-icon align-self-center radio-icon" aria-label="" matTooltip=""
                      id="rentalHelp{{covIndex}}" matTooltipClass="bwr-tooltip" (click)="loadHelpText('50')">info</mat-icon>
                    <mat-icon *ngIf="validvalue.code === 'ALL' && checkIfValidLoanLease(covIndex, validvalue.code)" class="info-icon align-self-center radio-icon" aria-label="" matTooltip=""
                      id="leaseHelp{{covIndex}}" matTooltipClass="bwr-tooltip" (click)="loadHelpText('51')">info</mat-icon>
                    <mat-icon *ngIf="validvalue.code === 'RA' && vehicleUse() !== 'O' && !this.applicantNonOwner" class="info-icon align-self-center radio-icon" aria-label="" matTooltip=""
                      id="roadSideHelp{{covIndex}}" matTooltipClass="bwr-tooltip" (click)="loadHelpText('632')">info</mat-icon>
                  </span>
                </div>

                <div *ngIf="(validvalue.code !== 'RA' && validvalue.code !== 'ALL' && validvalue.code !== 'antiTheftCode')">
                  <div class="col">
                    <mat-form-field class="field-full-width mandatory-field" appearance="outline">
                      <mat-label>{{ validvalue.description }}</mat-label>
                      <mat-select placeholder="Please select" id="{{validvalue.code}}{{covIndex}}"
                        formControlName="{{validvalue.code}}" (selectionChange)="onCoverageChange(covIndex, validvalue.code,$event)"
                        *ngIf="(!this.applicantNonOwner && item.year>= 1981) && !disableControls(covIndex, validvalue.code)">
                          <ng-container *ngFor="let keypair of validvalue.values">
                            <mat-option *ngIf="keypair.key === 'None' && (item.year > 1980 && vehicleUse() !== 'O') " value="{{ keypair.key }}">{{ keypair.displayvalue }}</mat-option>
                            <mat-option *ngIf="keypair.key !== 'None'" value="{{ keypair.key }}">{{ keypair.displayvalue }}</mat-option>
                            <mat-option *ngIf="keypair.key === 'None' && (item.year > 1980 && vehicleUse() === 'O' && validvalue.code === 'CEQ')" value="{{ keypair.key }}">{{ keypair.displayvalue }}</mat-option>
                            </ng-container>

                      </mat-select>
                      <mat-select placeholder="Please select" id="{{validvalue.code}}{{covIndex}}"
                      formControlName="{{validvalue.code}}"  (selectionChange)="onCoverageChange(covIndex, validvalue.code, '')" [disabled]="true"
                      *ngIf="(this.applicantNonOwner || item.year <= 1980 || item.use === 'O' || disableControls(covIndex, validvalue.code) ) && validvalue.code !=='UMPD' ">
                          <mat-option value="None">Not Available</mat-option>
                      </mat-select>
                      <mat-select placeholder="Please select" id="{{validvalue.code}}{{covIndex}}"
                      formControlName="{{validvalue.code}}"  (selectionChange)="onCoverageChange(covIndex, validvalue.code, '')" [disabled]="true"
                      *ngIf="(this.applicantNonOwner || item.year <= 1980 || item.use === 'O' || disableControls(covIndex, validvalue.code)) && validvalue.code ==='UMPD' ">
                          <mat-option value="{{this.umpdDefaultValState}}">Not Available</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>

                <div *ngIf="((vehicleUse() !== 'O' && validvalue.code === 'RA') || validvalue.code === 'ALL')">
                  <div class="col">
                    <div class="mt-2">
                      <mat-radio-group class="w-100 mandatory-field" *ngIf="this.applicantNonOwner && validvalue.description === 'Loan/Lease' && checkIfValidLoanLease(covIndex, validvalue.code)" formControlName="{{validvalue.code}}"
                        aria-label="Select an option" id="{{validvalue.code}}{{covIndex}}" [disabled]="true">
                        <mat-radio-button class="mr-5 click-area" *ngFor="let keypair of validvalue.values" (change)="onCoverageChange(covIndex, validvalue.code, keypair.key)" id="{{validvalue.code}}{{ keypair.displayvalue }}{{covIndex}}" value="{{keypair.key}}">{{ keypair.displayvalue }}
                        </mat-radio-button>
                      </mat-radio-group>
                      <mat-radio-group class="w-100 mandatory-field" *ngIf="!this.applicantNonOwner &&  checkIfValidLoanLease(covIndex, validvalue.code)" formControlName="{{validvalue.code}}"
                      aria-label="Select an option" id="{{validvalue.code}}{{covIndex}}">
                      <mat-radio-button class="mr-5 click-area" *ngFor="let keypair of validvalue.values" (change)="onCoverageChange(covIndex, validvalue.code, keypair.key)" id="{{validvalue.code}}{{ keypair.displayvalue }}{{covIndex}}" value="{{ keypair.key }}">{{ keypair.displayvalue }}
                      </mat-radio-button>
                      </mat-radio-group>
                    </div>
                  </div>
                </div>

                <div *ngIf="(validvalue.code === 'antiTheftCode' && isAntitheftEnable(covIndex))" class="col-lg-3 col-md-3 col-sm-8 col-xs-10 bold content-centered">
                  <label class="veh-cov-label mat-label-font">{{ validvalue.description }}  </label>
                  <span>
                    <mat-icon *ngIf="validvalue.code === 'antiTheftCode'" class="info-icon align-self-center radio-icon" aria-label="" matTooltip=""
                       matTooltipClass="bwr-tooltip">
                      <img  *ngIf="validvalue.code === 'antiTheftCode'" class="logo antiTheft-img" src="assets/img/piggy.svg" id="piggyIcon" alt="piggy"
                       (click)="loadHelpText('55')" />
                    </mat-icon>
                  </span>
                </div>
                <div  *ngIf="(validvalue.code === 'antiTheftCode' && isAntitheftEnable(covIndex))">
                  <div class="col">
                    <mat-form-field class="field-full-width" appearance="outline">
                      <mat-label>{{ validvalue.description }}</mat-label>
                      <mat-select placeholder="Antitheft" id="{{validvalue.code}}{{covIndex}}"
                                  formControlName="{{validvalue.code}}" (selectionChange)="onCoverageChange(covIndex, validvalue.code,$event)">
                        <mat-option *ngFor="let keypair of validvalue.values" value="{{ keypair.key }}">{{ keypair.displayvalue }}</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>
             </div>
          </div>
         </div>
         <div *ngIf="this.layout === 'vertical' && page ==='vehicles'" >
          <div>
          <div class="row"  *ngFor="let validvalue of this.validValues">
              <div style = "width: 100%" *ngIf="(validvalue.code !== 'RA' && validvalue.code !== 'ALL' && validvalue.code !== 'antiTheftCode')">
               <div [ngClass]="{
                'col-md-12' : (validvalue.code === 'OTC' || validvalue.code === 'COL' || validvalue.code === 'UMPD'),
                'col-md-10 col-10' : (validvalue.code === 'EXTR' || validvalue.code === 'CEQ' || validvalue.code === 'antiTheftCode')
               }">
                <mat-form-field class="field-full-width" appearance="outline">
                   <mat-label>{{ validvalue.description }}</mat-label>
                   <mat-select placeholder="Please select" id="{{validvalue.code}}{{covIndex}}"
                    formControlName="{{validvalue.code}}" (selectionChange)="onCoverageChange(covIndex, validvalue.code,$event)"
                    *ngIf="(!this.applicantNonOwner && item.year >= 1981) && !disableControls(covIndex, validvalue.code)">
                    <ng-container *ngFor="let keypair of validvalue.values">
                            <mat-option *ngIf="keypair.key === 'None' && (item.year > 1980 && vehicleUse() !== 'O') " value="{{ keypair.key }}">{{ keypair.displayvalue }}</mat-option>
                            <mat-option *ngIf="keypair.key !== 'None'" value="{{ keypair.key }}">{{ keypair.displayvalue }}</mat-option>
                            <mat-option *ngIf="keypair.key === 'None' && (item.year > 1980 && vehicleUse() === 'O' && validvalue.code === 'CEQ' )" value="{{ keypair.key }}">{{ keypair.displayvalue }}</mat-option>
                            </ng-container>
                   </mat-select>
                   <mat-select placeholder="Please select" id="{{validvalue.code}}{{covIndex}}"
                   formControlName="{{validvalue.code}}"  (selectionChange)="onCoverageChange(covIndex, validvalue.code, '')" [disabled]="true"
                   *ngIf="(this.applicantNonOwner || item.year <= 1980 || disableControls(covIndex, validvalue.code)) && validvalue.code !=='UMPD' ">
                      <mat-option value="None">Not Available</mat-option>
                   </mat-select>
                   <mat-select placeholder="Please select" id="{{validvalue.code}}{{covIndex}}"
                   formControlName="{{validvalue.code}}"  (selectionChange)="onCoverageChange(covIndex, validvalue.code, '')" [disabled]="true"
                   *ngIf="(this.applicantNonOwner || item.year <= 1980 || disableControls(covIndex, validvalue.code)) && validvalue.code ==='UMPD' ">
                      <mat-option value="{{this.umpdDefaultValState}}">Not Available</mat-option>
                   </mat-select>
                </mat-form-field>
                <!--<div class="col-lg-3 col-md-3 col-sm-8 col-xs-10 bold content-centered">-->
               <span>
               <mat-icon *ngIf="validvalue.code === 'CEQ'" class="info-icon align-self-center" aria-label="" matTooltip=""
                id="additionalEquipmentHelp{{covIndex}}" matTooltipClass="bwr-tooltip" (click)="loadHelpText('48')">info</mat-icon>
               <mat-icon *ngIf="validvalue.code === 'EXTR'" class="info-icon align-self-center" aria-label="" matTooltip=""
                id="rentalHelp{{covIndex}}" matTooltipClass="bwr-tooltip" (click)="loadHelpText('50')">info</mat-icon>


                </span>

              <!--</div>-->
               </div>
              </div>
              <div style = "width: 100%" *ngIf="(validvalue.code === 'antiTheftCode' && isAntitheftEnable(covIndex))">
                <div class="col-md-10 col-10">
                  <mat-form-field class="field-full-width" appearance="outline">
                    <mat-label>{{ validvalue.description }}</mat-label>
                    <mat-select placeholder="Antitheft" id="{{validvalue.code}}{{covIndex}}"
                                formControlName="{{validvalue.code}}" (selectionChange)="onCoverageChange(covIndex, validvalue.code,$event)">
                      <mat-option *ngFor="let keypair of validvalue.values" value="{{ keypair.key }}">{{ keypair.displayvalue }}</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <span>
                    <mat-icon *ngIf="validvalue.code === 'antiTheftCode'" class="info-icon align-self-center" aria-label="" matTooltip=""
                        matTooltipClass="bwr-tooltip" >
                      <img  *ngIf="validvalue.code === 'antiTheftCode'" class="logo antiTheft-img" src="assets/img/piggy.svg" id="piggyIcon" alt="piggy"
                              (click)="loadHelpText('55')" />
                    </mat-icon>
                  </span>
                </div>
              </div>

              <div *ngIf="((vehicleUse() !== 'O' && validvalue.code === 'RA') || validvalue.code === 'ALL')">
              <label *ngIf="!(this.applicantNonOwner) && ((vehicleUse() !== 'O' && validvalue.code === 'RA') || validvalue.code === 'ALL')
               && checkIfValidLoanLease(covIndex, validvalue.code)" class="vehicle-cov-label">{{ validvalue.description }}  </label>
               <!--<div class="col-lg-3 col-md-3 col-sm-8 col-xs-10 bold content-centered">-->
                <span>
               <mat-icon *ngIf="validvalue.code === 'ALL' && checkIfValidLoanLease(covIndex, validvalue.code)" class="info-icon align-self-center radio-icon" aria-label="" matTooltip=""
                id="leaseHelp{{covIndex}}" matTooltipClass="bwr-tooltip" (click)="loadHelpText('51')">info</mat-icon>
               <mat-icon *ngIf="validvalue.code === 'RA' && !this.applicantNonOwner && checkIfValidLoanLease(covIndex, validvalue.code)" class="info-icon align-self-center radio-icon" aria-label="" matTooltip=""
                id="roadSideHelp{{covIndex}}" matTooltipClass="bwr-tooltip" (click)="loadHelpText('632')">info</mat-icon>
                </span>
              <!--</div>-->
               <div class="col">
                <div class="mt-2">
                   <mat-radio-group class="w-100 mandatory-field" *ngIf="this.applicantNonOwner && validvalue.description === 'Loan/Lease' && checkIfValidLoanLease(covIndex, validvalue.code)" formControlName="{{validvalue.code}}"
                    aria-label="Select an option" id="{{validvalue.code}}{{covIndex}}" [disabled]="true">
                    <mat-radio-button class="mr-5 click-area" *ngFor="let keypair of validvalue.values" (change)="onCoverageChange(covIndex, validvalue.code, keypair.key)" id="{{validvalue.code}}{{ keypair.displayvalue }}{{covIndex}}" value="{{keypair.key}}">{{ keypair.displayvalue }}
                    </mat-radio-button>
                   </mat-radio-group>
                   <mat-radio-group class="w-100 mandatory-field" *ngIf="!this.applicantNonOwner &&  checkIfValidLoanLease(covIndex, validvalue.code)" formControlName="{{validvalue.code}}"
                   aria-label="Select an option" id="{{validvalue.code}}{{covIndex}}">
                   <mat-radio-button class="mr-5 click-area" *ngFor="let keypair of validvalue.values" (change)="onCoverageChange(covIndex, validvalue.code, keypair.key)" id="{{validvalue.code}}{{ keypair.displayvalue }}{{covIndex}}" value="{{ keypair.key }}">{{ keypair.displayvalue }}
                   </mat-radio-button>
                  </mat-radio-group>
                </div>

               </div>

              </div>
             </div>
          </div>
         </div>


  </div>
  `,
  styleUrls: ['./vehiclecoverage-validvalues.component.scss']
})
export class VehicleCoverageValidvaluesComponent implements OnInit {
  form!: UntypedFormGroup;
  vehiclesFormArray!: UntypedFormArray;
  validValues!: ValidvaluesCommon[];
  private validValuesMaster!: ValidvaluesCommon[];
  private validValuesReq!: ValidValuesReq;
  riskState = '';
  vehicleDetails!: VehicleSummary[];
  applicantNonOwner!: any;
  ratebook!: string;
  test = 'EA';
  year: any = '';
  use: any = '';
  antiTheftCode: string = 'N';
  dynamicVehFields: any;
  antiTheftRequired: boolean = false;
  umpdDefaultValState! :string;
  // Inputs from parent form. Form reference and existing coverages if available
  @Input() coveragesForm!: UntypedFormGroup;

  @Input() vehicleCoverages!: Coverage[];
  @Input() vehicleFormGroupName!: any;
  @Input() layout!: string;
  @Input() vehicleList!: any;
  @Input() formGroupName!: string;
  @Input() item!: any;
  @Input() covIndex!: number;
  @Input() page!: string;
  @Output() coverageChangeEvent = new EventEmitter<string>();
  // @Output() compChangeEvent = new EventEmitter<object>();
  // @Output() antitheftEnableEvent = new EventEmitter<any>();
  // @Input() antiTheftRequired : any;

  constructor(private rootFormGroup: FormGroupDirective, private formBuilder: UntypedFormBuilder, private validvaluesService: ValidValuesService,
    private router: Router, private store: Store<{ quoteSummary: QuoteSummary }>,
    private dialog: MatDialog, private helpTextMapper: HelptextMapper, private vehiclesService: VehiclesService) {
    this.store.select('quoteSummary').subscribe(data => {
      this.vehicleDetails = data.vehicles;
      this.applicantNonOwner = data.nonOwner;
      this.dynamicVehFields = data.dynamicValidValues;
    });
  }

  subscription!: Subscription;

  ngOnInit(): void {
    this.vehiclesFormArray = this.rootFormGroup.control.get('vehicles') as UntypedFormArray;
    this.store.select('quoteSummary').subscribe(data => {
      this.riskState = data.policyState;
      this.ratebook = data.rateBook;
    });
    if(this.page ==='vehicles'){
     this.vehTypeChange(this.vehicleCoverageFormGroup(this.covIndex)?.controls.type?.value,this.covIndex);
    }
     // Valid values vehicle level coverages request
    this.validValuesReq = {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.VEHICLE_COVERAGE_PAGE_NAME,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: this.ratebook,
      state: this.riskState,
      dropdownName: GlobalConstants.VEHICLE_COVERAGE_PAGE_DROPDOWN,
      filter:''
    }

    // console.log('Vehicle Use in Vehicle COverage History ====> ', this.item.use, ' Rate Page Use: ', this.item.primaryUse);

    // subscribe to the valid values service
    this.subscription = this.validvaluesService.getValidValuesDetails(
      this.validValuesReq).subscribe((data: ValidvaluesCommonRes) => {
        // Make a copy by value to use for resetting select options after filtering
        const initialValidValues = JSON.parse(JSON.stringify(data.responseMap.ValidValues));
        this.validValuesMaster = initialValidValues;
        this.validValues = data.responseMap.ValidValues;

      },
        (_error: any) => {
          // console.error('Error occured while invoking Valid Values for Policy Coverages');
        }
      );
      this.umpdDefaultValState = this.vehiclesService.setUMPDDefaultVal();

      this.stateDynamicFields();
  }

  vehicleCoverageFormGroup(index: any): UntypedFormGroup {
    const itemArray = this.rootFormGroup.control.get('vehicles') as UntypedFormArray;
    return itemArray?.controls[index] as UntypedFormGroup;
  }

  stateDynamicFields() {
    for(let i=0;i<=this.dynamicVehFields?.length;i++) {
      if(this.dynamicVehFields[i]?.key === 'Antitheft') {
        this.antiTheftRequired = true
      }
    }
  }

  vehicleUse = (): string => {
    const vehUse =  this.item.primaryUse !== undefined ? this.item.primaryUse :  this.item.use;
    return vehUse;
  }

  filterValidValuesOnUseChange(coverage: string, filterValue: string, use: string, index: number) {
    if(use === 'O') {
        const filteredValidvalues = this.validValues.map((obj) => {
        const validvaues = obj.code === coverage ? obj.values.filter(objval => objval.key !== filterValue) : obj.values
         obj.values = validvaues;
         return obj;
       });
      //  console.log("??????????????",this.covIndex)
       this.validValues = filteredValidvalues;
      //  console.log('Filtered Valid Vlaues after Use change ====> ', this.validValues);
      } else {
        const updateValidValues = this.validValuesMaster;
        this.validValues = updateValidValues;
        // console.log('Filtered Valid Vlaues after Use change ====> ', this.validValues);
      }


  }

  coveragesOnUseIndex(covValues: any, index: number) {
    this.vehicleCoverageFormGroup(index)
  }


  onCoverageChange(index: number, coverageCode: string, val: any): void {
    this.antiTheftCode = this.coveragesForm.value.antiTheftCode === 'N' ? '-' : this.coveragesForm.value.antiTheftCode;

    if (val !== '') {
      if (coverageCode === 'RA' || coverageCode === 'ALL') {
        this.vehicleCoverageFormGroup(index)?.controls[coverageCode]?.patchValue(val);
      }
      if (coverageCode === 'OTC' && val.value === GlobalConstants.NONE) {
        this.vehicleCoverageFormGroup(index)?.controls.COL.patchValue(GlobalConstants.NONE);
        this.vehicleCoverageFormGroup(index)?.controls.CEQ.patchValue(GlobalConstants.NONE);
        this.vehicleCoverageFormGroup(index)?.controls.EXTR.patchValue(GlobalConstants.NONE);
        this.vehicleCoverageFormGroup(index)?.controls.antiTheftCode.patchValue('N');

        // this.compChangeEvent.emit({ compVal: val, antiTheftCode: this.antiTheftCode, index: index });
      } else if (coverageCode === 'OTC' && val.value !== GlobalConstants.NONE) {
        // this.compChangeEvent.emit({ compVal: val, antiTheftCode: this.antiTheftCode, index: index });
      }
      if(coverageCode === 'COL' && val.value !== GlobalConstants.NONE && this.riskState === GlobalConstants.STATE_CO)
      {
        this.vehicleCoverageFormGroup(index)?.controls.UMPD.patchValue(GlobalConstants.NONE);
      }
      if (coverageCode === 'OTC' && val.value === GlobalConstants.NONE && this.riskState === GlobalConstants.STATE_CO) {
        this.vehicleCoverageFormGroup(index)?.controls.UMPD.patchValue(GlobalConstants.NONE);
      }

      if(coverageCode === 'COL' && val.value !== GlobalConstants.NONE && this.riskState === GlobalConstants.STATE_OH)
      {
        this.vehicleCoverageFormGroup(index)?.controls.UMPD.patchValue(GlobalConstants.NONE);
      }
    }
    this.coverageChangeEvent.next('');
  }


  disableControls(index: number, coverageCode: string): boolean {
    const compVal = this.vehicleCoverageFormGroup(index)?.controls.OTC.value;
    const colVal = this.vehicleCoverageFormGroup(index)?.controls.COL.value;
    if (coverageCode !== 'OTC' && coverageCode !== 'UMPD') {
      if (compVal === GlobalConstants.NONE) {
        return true;
      } else if (compVal !== GlobalConstants.NONE && this.vehicleUse() === 'O') {
        if (coverageCode === 'CEQ') {
          return false;
        } else {
          return true;
        }
      }
    } else if (coverageCode === 'UMPD') {
      if (compVal !== GlobalConstants.NONE
        && (this.vehicleUse() === 'O' || ((this.riskState === GlobalConstants.STATE_CO || this.riskState === GlobalConstants.STATE_OH) && colVal !== GlobalConstants.NONE))) {
        return true;
      }
    }
    return false;
  }

  isAntitheftEnable(index: any){

    if(this.vehicleCoverageFormGroup(index)?.controls.OTC.value !== 'None' && this.antiTheftRequired) {

      return true;
    } else {

      return false;
    }
  }



  checkIfValidLoanLease(index: number, coverageCode: string): boolean {

    let returnVal = true;
    if (coverageCode === 'ALL') {
      const compVal = this.vehicleCoverageFormGroup(index)?.controls.OTC.value;
      const collVal = this.vehicleCoverageFormGroup(index)?.controls.COL.value;

      returnVal = false;
      if (compVal === GlobalConstants.NONE || collVal === GlobalConstants.NONE) {
        this.vehicleCoverageFormGroup(index).controls.ALL.patchValue('N');
      } else {
        returnVal = true;
      }
    }
    if (coverageCode === 'RA') {
      const useVal = this.vehiclesFormArray?.controls[index].value.use;
      if (useVal === 'O' || this.vehicleUse() === 'O') {
        returnVal = false;
      } else {
        returnVal = true;
      }
    }
    return returnVal;

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

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

  vehTypeChange(val: any, index: any) {
    // console.log("Dynamic " + val);

    if (val === 'N') {
      this.applicantNonOwner = true;
    } else {
      this.applicantNonOwner = false;
    }
  }

  vehUseChange(val: any, index: any) {
    const additionalEquipment = this.coveragesForm.value.CEQ;
    const umpd = this.coveragesForm.value.UMPD;

    if (val.value === 'O') {
      this.vehicleCoverageFormGroup(index).controls.RA.patchValue('N');
      this.vehicleCoverageFormGroup(index).controls.COL.patchValue(GlobalConstants.NONE);
      this.vehicleCoverageFormGroup(index).controls.EXTR.patchValue(GlobalConstants.NONE);
      this.vehicleCoverageFormGroup(index).controls.UMPD.patchValue(this.umpdDefaultValState);
      this.vehicleCoverageFormGroup(index).controls.OTC.patchValue('500OTC');
      this.vehicleCoverageFormGroup(index).controls.CEQ.patchValue(additionalEquipment);
    } else {
      if (additionalEquipment === GlobalConstants.NONE) {
        this.vehicleCoverageFormGroup(index).controls.CEQ.patchValue(GlobalConstants.NONE);
      }
      this.vehicleCoverageFormGroup(index).controls.OTC.patchValue('None');
      this.vehicleCoverageFormGroup(index).controls.UMPD.patchValue(umpd);
      this.vehicleCoverageFormGroup(index).controls.CEQ.patchValue(GlobalConstants.NONE);
      this.vehicleCoverageFormGroup(index).controls.RA.patchValue('N');
      this.vehicleCoverageFormGroup(index).controls.COL.patchValue(GlobalConstants.NONE);
    }

  }
}
