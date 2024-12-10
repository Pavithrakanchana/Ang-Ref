import { DatePipe, formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ControlContainer, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { GlobalConstants } from 'src/app/constants/global.constant';
import { HelpTextDialogComponent } from 'src/app/shared/dialog/helptext-dialog/helptext-dialog.component';
import { Driver, License, Violation, ClaimsPayouts } from 'src/app/shared/model/autoquote/autoquote.model';
import { ClueResponse, DeclaredClaim } from 'src/app/shared/model/cluereport/clue-response.model';
import { ValidValues, ValidValuesRes } from 'src/app/shared/model/validvalues/validvaluesres.model';
import { MessagesService } from 'src/app/shared/services/messages.service';
import { ValidValuesService } from 'src/app/shared/services/validvalues/validvalues.service';
import QuoteSummary from 'src/app/state/model/summary.model';
import { DeleteViolationDialogComponent } from '../delete-violation-dialog/delete-violation-dialog.component';
import { MessageConstants } from 'src/app/constants/message.constant';
import { ObjectUtils } from 'src/app/shared/utilities/object-utils';
import { CommonUtils } from 'src/app/shared/utilities/common-utils';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { forkJoin, Observable, of } from 'rxjs';
import { HelptextMapper } from 'src/app/shared/utilities/helptext-mapper';
import { Tracker } from 'src/app/shared/utilities/tracker';
@Component({
  selector: 'app-violations-list',
  templateUrl: './violations-list.component.html',
  styleUrls: ['./violations-list.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]
})
export class ViolationsListComponent implements OnInit {

  @Input() violationsForm!: UntypedFormGroup;
  @Input() violations!: any[];
  @Input() clueViolations!: ClueResponse;
  // @Input() mvrViolations!: any[]; // Not Using this for reading the MVR violations
  @Input() showInputs!: boolean;
  @Output() licenseChangeEvent = new EventEmitter<string>();
  @Input() page!: string;
  @Input() violationCount!: number;

  displayViolationObj: any[] = [];
  addViolationStatusByDriver: any = [];
  deleteViolationDialog!: MatDialogRef<DeleteViolationDialogComponent>;
  disputeViolations: any = [];
  disputeViolationDefaultStatus: any = [];
  editViolationIndex!: number;
  editViolationStatusByDriver: any = [];
  errorArr: any = [];
  eventType!: string;
  explanations: ValidValues[] = [];
  licenseStateValues!: ValidValues[];
  policyEffectiveDate!: string;
  todayDate = new Date();
  minDate = new Date(1900, 0, 1);
  errorMessage = "";
  alphaNumValidPattern = '^[A-Za-z0-9 ]+$';
  licenseNumberList: any = []

  driverIndex!: number;
  helpText = '';
  helpTextTitle = '';
  license!: License;
  JSON: any;
  policyState: string = ''

  vioIndex!: number;
  violationCodes: ValidValues[] = [];
  licenseStateStatus: any = [];
  dbViolations: any;
  ratebook!: string;
  highestViolationSeq!: number;
  isRequiredConvictionDate: boolean = false;
  constructor(
    private rootFormGroup: FormGroupDirective,
    private dialog: MatDialog,
    private formB: UntypedFormBuilder,
    private readonly messageservice: MessagesService,
    public validValuesService: ValidValuesService,
    private showSpinnerService: SpinnerStatusService,
    private helpTextMapper: HelptextMapper,
    public helpTextDialog: MatDialog,
    private store: Store<{ quoteSummary: QuoteSummary }>,
    private logTracker: Tracker) {
    this.store.select('quoteSummary').subscribe(data => {
      this.policyEffectiveDate = data.policyEffectiveDate;
      this.policyState = data.policyState;
      this.ratebook = data.rateBook;
      this.policyState = data.policyState;
      this.isRequiredConvictionDate = data.isRequiredConvictionDate;
    });
  }

  ngOnInit(): void {
    //this.violations = [];
    this.violationsForm = this.rootFormGroup.form;
    //this.highestViolationSeq = this.violationCount;
    this.logTracker.loginfo(this.constructor.name, 'ngOnInit', 'ngOnInit', 'Violations Child Component Initialized');

  }
  ngOnChanges(): void {
    //this.driverViolationsArray().removeAt(0);
    this.showSpinnerService.showSpinner(true);
    let getReviewObservables: Observable<any>[] = new Array();
    getReviewObservables.push(this.validValuesService.getValidValues(this.loadValidValues()));
    getReviewObservables.push(of(this.violations));
    forkJoin(getReviewObservables).subscribe(async (results: any) => {
      this.licenseNumberList = [];
      this.showSpinnerService.showSpinner(false);
      this.violationCodes = results[0].responseMap.accvoilationcodes;
      this.explanations = results[0].responseMap.disputereasons;
      this.licenseStateValues = results[0].responseMap.states;
      this.violations = this.sortViolationsByDate(results[1]);
      this.loadViolationList(results[1]);
    });
  }
  sortViolationsByDate(violationsList: any) {
    violationsList?.forEach((driver: any, i: number) => {
      violationsList[i].violations = driver.violations?.sort((a: any, b: any) => new Date(a.violationDate).getTime() < new Date(b.violationDate).getTime() ? 1 : -1);
    }
    )
    return violationsList;
  }
  public loadViolationList(violationsList: any) {
    this.logTracker.loginfo(this.constructor.name, 'loadViolationList', 'loadViolationList', 'Loading Violations from Parent Component '.concat(this.page));
    //this.driverViolationsArray().removeAt(0);
    this.addViolationStatusByDriver = [];
    // console.log(violationsList,"==========violationsList");
    
    violationsList = this.sortViolationsByDate(violationsList);
    violationsList[0].violations?.forEach((elem: any, i: any) => {
      if (elem.violationCode == "NC"){
        violationsList[0].violations?.splice(i, 1);
      }
    });
    // console.log(violationsList, "======After====violationsList");
    
    if (violationsList) {
      if (this.page === 'Reports') {
        this.displayViolationObj = [];
      }
      violationsList?.forEach((driver: any, i: number) => {
        // i == 1 ? driver['driverType'] = 'E' : driver['driverType'] = 'R'; // need to uncomment this line
        const addViolationDefaultStatus = {
          id: driver.sequenceNumber,
          status: false,
          violations: [],
        };
        this.addViolationStatusByDriver.push(addViolationDefaultStatus);
        this.disputeViolations = driver.violations;//?.sort((a: any, b: any) => a.violationDate < b.violationDate ? 1 : -1);
        violationsList[i].violations = this.disputeViolations;
        this.addDriverViolationForm();
        this.displayViolationObj.push(this.violations[i]);
        if (this.page === 'Reports') {
          //   CommonUtils.updateControlValidation(this.violationFormGroup(i).controls.licenseNumber, true);
          this.violationFormGroup(i).get('licenseNumber')?.patchValue(driver?.license?.licenseNumber);
          this.violationFormGroup(i).get('licenseType')?.patchValue(driver?.license?.licenseType);
          this.violationFormGroup(i).get('dob')?.patchValue(formatDate(driver?.birthDate, 'MM/dd/yyyy', 'en-US'));
          if (driver?.license?.licenseType !== 'F' && driver?.license?.licenseType !== 'N' && driver?.driverType !== 'E') {
            this.licenseStateStatus[i] = true;
            CommonUtils.updateControlValidation(this.violationFormGroup(i).controls.licensestate, true);
            this.violationFormGroup(i).get('licensestate')?.patchValue(driver?.license?.licenseState);
          }
          else {
            this.licenseStateStatus[i] = false;
            CommonUtils.updateControlValidation(this.violationFormGroup(i).controls.licensestate, false);
            CommonUtils.updateControlValidation(this.violationFormGroup(i).controls.licenseNumber, false);
          }
        } else {
          CommonUtils.updateControlValidation(this.violationFormGroup(i).controls.licenseNumber, false);
          CommonUtils.updateControlValidation(this.violationFormGroup(i).controls.licensestate, false);
        }

        // loop thru the initial GET violation list which includes sequenceNumber: 0
        /*this.disputeViolations.forEach((violation: any, v: number) => {
          if (violation.sequenceNumber === 0) {
            //removes 1 element at index 0
            violationsList[i].violations.splice(v, 1);
          }
        });*/
        //loop thru the updated violation list which do not include sequenceNumber: 0 from GET call
        violationsList[i].violations.forEach((newviolation: any, newv: number) => {
          this.applyViolationsLogic(newviolation, i, newv);
        });
      });
    }
    this.transformCLUEResponse(this.clueViolations);
  }

  checkForUndefined(formValues : any, ctrlVal : string){
    if((ctrlVal === 'delete' && formValues?.controls?.operation.value == 'delete') || (ctrlVal === 'checked' && formValues?.controls?.dispute.value)){
        return true;
      } else{
        return false;         
      }   
    }
    
  driverViolationForm(): UntypedFormGroup {
    return this.formB.group({
      violationCode: new UntypedFormControl(''),
      occurenceDate: new UntypedFormControl(''),
      convictionDate: new UntypedFormControl(''),
      listOfViolations: this.formB.array([]),
      source: '',
      operation: 'Add',
      licenseNumber: new UntypedFormControl('', [Validators.pattern(this.alphaNumValidPattern)]),
      licensestate: new UntypedFormControl(''),
      licenseType: new UntypedFormControl(''),
      dob: new UntypedFormControl('')
    });
  }
  //licenseNumber: new FormControl('', [Validators.required, Validators.pattern(this.alphaNumValidPattern)]),
  newDriverViolation(): UntypedFormGroup {
    return this.formB.group({
      dispute: [false],
      explanation: [''],
      operation: 'Add' // existing DB record and then delete violation
    });
  }

  addDriverViolation(v: number): void {
    this.listOfViolations(v).push(this.newDriverViolation());
  }
  listOfViolationsFormGroup(driverIndex: any, violationIndex: number): UntypedFormGroup {
    const itemControls = this.violationFormGroup(driverIndex)?.get('listOfViolations') as UntypedFormArray;
    return itemControls?.controls[violationIndex] as UntypedFormGroup;
  }

  /** listOfViolations */
  listOfViolations(v: number): UntypedFormArray {
    return this.driverViolationsArray()?.at(v)?.get('listOfViolations') as UntypedFormArray;
  }

  violationFormGroup(index: number): UntypedFormGroup {
    const itemControls = this.violationsForm.get('addViolation') as UntypedFormArray;
    return itemControls.controls[index] as UntypedFormGroup;
  }

  driverViolationsArray(): UntypedFormArray {
    return (this.violationsForm.get('addViolation') as UntypedFormArray);
  }

  addDriverViolationForm(): void {
    this.driverViolationsArray().push(this.driverViolationForm());
  }

  applyViolationsLogic(violation: any, i: number, v: number): void {
    this.addDriverViolation(i);
    this.disputeViolationDefaultStatus = {
      id: violation?.sequenceNumber,
      status: violation?.disputeExplanation !== ""
    };
    if (violation?.displayingDisputeIndicator || violation?.disputeLevel >= 2) {
      this.listOfViolationsFormGroup(i, v).get('dispute')?.patchValue(violation?.displayingDisputeIndicator === true);
      this.listOfViolationsFormGroup(i, v).get('explanation')?.patchValue(
        this.explanations.find(x => x.key === violation.disputeExplanation)?.key);
      this.setExplanationAsRequired(i, v, violation?.displayingDisputeIndicator);
    } else {
      this.listOfViolationsFormGroup(i, v).get('dispute')?.patchValue(false);
      this.setExplanationAsRequired(i, v, false);
    }
    this.listOfViolationsFormGroup(i, v).get('operation')?.patchValue('');
    this.addViolationStatusByDriver[i].violations.push(this.disputeViolationDefaultStatus);
    this.setAddViolationFormAsRequired(i, false);
  }

  /* CLUE response data Transformation */
  transformCLUEResponse(data: ClueResponse): void {
    const datePipe = new DatePipe('en-US');
    data?.riskReports?.declaredClaim?.forEach((clueData: DeclaredClaim) => {
      const driverId = Number(clueData.driver.unitNumber);
      const driver = this.getDriverObject(driverId);
      if (driver != null) {
        const violationId = this.generateNextViolationId(driverId);
        let claimsPayoutsArr: any = [];
        clueData?.claim?.claimPayment?.forEach((claimData) => {
          const claimsPayouts: ClaimsPayouts = {
            name: "",
            status: claimData.transactionStatus,
            code: claimData.type,
            amount: claimData.paidAmount,
          };
          claimsPayoutsArr.push(claimsPayouts)
        })

        const violation = {
          sequenceNumber: String(violationId),
          violationName: (clueData.claim.accidentCode === 'AF3' || clueData.claim.accidentCode === 'AF2') ? clueData.claim.accidentDescription : this.violationCodes.find(x => x.key.trim() === clueData.claim.accidentCode.trim())?.displayvalue,
          violationCode: (clueData.claim.accidentCode === 'AF3' || clueData.claim.accidentCode === 'AF2') ? clueData.claim.accidentCode : this.violationCodes.find(x => x.key.trim() === clueData.claim.accidentCode.trim())?.key,
          violationDate: datePipe.transform(new Date(clueData.claim.claimDate), 'MM/dd/yyyy'),
          displayingDisputeIndicator: Number(clueData.claim.disputeLevel) >= 2,
          disputeLevel: Number(clueData.claim.disputeLevel),
          disputeExplanation: '',
          reportingSource: 'CLUE',
          withinChargeablePeriodIndicator: false,
          editableIndicator: false,
          removableIndicator: false,
          convictionDate: datePipe.transform(new Date(clueData.claim.claimDate), 'MM/dd/yyyy'),
          claimsPayouts: claimsPayoutsArr
        } as Violation;

        this.pushNewClueViolation(driver, violation);
      }
    });
  }

  private pushNewClueViolation(driver: Driver, violation: Violation): void {
    this.addDriverViolation(this.getDriverIndex(Number(driver.sequenceNumber)));
    this.disputeViolationDefaultStatus = {
      id: violation?.sequenceNumber,
      status: false,
    };

    this.addViolationStatusByDriver[this.getDriverIndex(Number(driver.sequenceNumber))]
      .violations.push(this.disputeViolationDefaultStatus);
    const duplicateViolationStatus = this.checkForDuplicateViolations(violation, driver.sequenceNumber);
    if (duplicateViolationStatus.length == 0) {
      driver.violations?.push(violation);
    }
  }

  checkForDuplicateViolations(violation: any, driverId: any) {
    const datePipe = new DatePipe('en-US');
    const driver = this.violations.find((x: any) => x.sequenceNumber === driverId);
    return driver?.violations?.find((x: any) => (x.violationCode === violation.violationCode && (datePipe.transform(new Date(x.violationDate), 'MM/dd/yyyy')) === violation.violationDate
      && x.reportingSource === violation.reportingSource)) || [];
  }

  private generateNextViolationId(driverId: number): number {
    let count = this.getMaxExistingViolationForDriver(driverId) + 1
    this.highestViolationSeq = count
    return count
  }

  private getMaxExistingViolationForDriver(driverId: number): number {
    const driver = this.getDriverObject(driverId);
    let highestViolationId: any;
    if (driver != null) {
      highestViolationId = driver?.violationsCount;
      driver.violations?.forEach((violation: Violation) => {
        const currentViolationId = Number(violation.sequenceNumber);
        if (currentViolationId > highestViolationId) {
          highestViolationId = currentViolationId;
        }
      });
    }

    return highestViolationId;
  }

  removeDriverViolation(i: number, v: number): void {
    const dialogRef = this.dialog.open(DeleteViolationDialogComponent, {
      width: '25%',
      panelClass: 'full-width-dialog',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this.listOfViolationsFormGroup(i, v).controls.operation.value === 'Add') {
          this.listOfViolations(i).removeAt(v);
          this.violations[i].violations.splice(v, 1);
        }
        else {
          this.violations[i].violations[v].operation = 'delete';
          this.listOfViolationsFormGroup(i, v).controls.operation.patchValue('delete');
          this.removeViolationFieldsAsRequired(i, v);
        }
        this.displayViolationObj = this.violations;
      }
    });
  }

  editDriverViolation(i: number, v: number): void {
    this.logTracker.loginfo(this.constructor.name, 'editDriverViolation', 'editDriverViolation', 'Editing Violation');
    this.setAddViolationFormAsRequired(i, true);
    this.eventType = 'edit';
    this.editViolationIndex = v;
    this.addViolationStatusByDriver[i].status = true;
    const violationCode = this.violations[i].violations[v].violationCode;
    const violationDate =  this.violations[i].violations[v].violationDate.split(' ')[0];
    const convictionDate = this.isRequiredConvictionDate ? this.violations[i].violations[v].convictionDate.split(' ')[0]: '';
    this.violationFormGroup(i).get('violationCode')?.patchValue(this.violationCodes.find(x => x.key === violationCode)?.key);
     
    this.violationFormGroup(i).get('occurenceDate')?.patchValue(new Date(violationDate));
    if(this.isRequiredConvictionDate ){
      this.violationFormGroup(i).get('convictionDate')?.patchValue(new Date(convictionDate));
    }
    
  }

  // set required validator dynamically for explanation formControl based on dispute checkbox selection
  setAddViolationFormAsRequired(driverIndex: number, status: boolean): void {
    const violationControl = this.violationFormGroup(driverIndex).get('violationCode');
    const occurrenceControl = this.violationFormGroup(driverIndex).get('occurenceDate');
    const convictionControl = this.violationFormGroup(driverIndex).get('convictionDate');
    if (status) {
      violationControl?.setValidators([Validators.required]);
      this.isRequiredConvictionDate ? convictionControl?.setValidators([Validators.required]):occurrenceControl?.setValidators([Validators.required]);
      
    } else {
      violationControl?.setValidators(null);
      this.isRequiredConvictionDate ? convictionControl?.setValidators(null) : occurrenceControl?.setValidators(null);
      
    }
    violationControl?.updateValueAndValidity();
    occurrenceControl?.updateValueAndValidity();
    convictionControl?.updateValueAndValidity();
  }

  // set required validator dynamically for explanation formControl based on dispute checkbox selection
  setExplanationAsRequired(driverIndex: number, violationIndex: number, status: boolean): void {
    const explanationControl = this.listOfViolationsFormGroup(driverIndex, violationIndex).get('explanation');
    if (status) {
      explanationControl?.setValidators([Validators.required]);
    } else {
      // update the Explanation value to 'Please Select' option.
      this.listOfViolationsFormGroup(driverIndex, violationIndex).get('explanation')?.patchValue('');
      explanationControl?.setValidators(null);
    }
    explanationControl?.updateValueAndValidity();
  }

  loadValidValues() {
    return {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.VIOLATION_PAGE_NAME,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: GlobalConstants.RATEBOOK_ALL_VALID_VALUES,
      state: this.policyState,
      dropdownName: GlobalConstants.DROPDOWN_ALL_VALID_VALUES,
      filter: ''
    }
  }

  removeViolationFieldsAsRequired(driverIndex: any, violationIndex: any): void {
    const violationCode = this.listOfViolationsFormGroup(driverIndex, violationIndex).controls.violationCode;
    const occurrenceDate = this.listOfViolationsFormGroup(driverIndex, violationIndex).controls.occurenceDate;
    const convictionDate = this.listOfViolationsFormGroup(driverIndex, violationIndex).controls.convictionDate;

    violationCode?.setValidators(null);
    occurrenceDate?.setValidators(null);
    convictionDate?.setValidators(null);
    violationCode?.updateValueAndValidity();
    occurrenceDate?.updateValueAndValidity();
    convictionDate?.updateValueAndValidity();
  }

  onDisputeClick(event: any, driverIndex: any, violationIndex: any): void {
    this.driverIndex = driverIndex;
    this.vioIndex = violationIndex;
    this.addViolationStatusByDriver[driverIndex].violations[violationIndex].status = !!event.checked;
    this.setExplanationAsRequired(this.driverIndex, this.vioIndex, event.checked);
  }

  onExplanationchange(event: any, driverIndex: any, violationIndex: any): void {
    if (this.page === 'Reports') {
      this.listOfViolationsFormGroup(driverIndex, violationIndex).get('explanation')?.patchValue(event.value);
    }
  }
  viewAddViolation(i: number, typeVal: string): void {
    if (typeVal === 'add') {
      this.eventType = 'add';
    }
    this.addViolationStatusByDriver[i].status = true;
    this.setAddViolationFormAsRequired(i, this.addViolationStatusByDriver[i].status);
  }

  private getDriverObject(driverId: number): Driver | null {
    if (this.isDriverFound(driverId)) {
      return this.violations[this.getDriverIndex(driverId)];
    }

    return null;
  }

  private isDriverFound(driverId: number): boolean {
    return (this.getDriverIndex(driverId) !== -1);
  }

  private getDriverIndex(driverId: number): number {
    return this.tryParseDriverIndex(driverId);
  }

  private tryParseDriverIndex(driverId: number): number {
    const unsetDriverId = -1;
    const driverSequenceNumber = this.violations?.findIndex((
      x: { sequenceNumber: number; }) => x.sequenceNumber === driverId);

    return driverSequenceNumber == null ? unsetDriverId : driverSequenceNumber;
  }


  loadHelpText(fieldID: string): void {
    let helpTextObj = this.helpTextMapper.mapHelpText(fieldID);

    if (helpTextObj) {
      this.helpTextDialog.open(HelpTextDialogComponent, {
        width: '30%',
        panelClass: 'full-width-dialog',
        data: {
          title: helpTextObj.title,
          text: helpTextObj.text
        }
      });
    }
  }

  hideAddViolation(driverIndex: any): void {
    this.messageservice.clearErrors();
    this.violationFormGroup(driverIndex).get('violationCode')?.patchValue('');
    this.violationFormGroup(driverIndex).get('occurenceDate')?.patchValue('');
    this.violationFormGroup(driverIndex).get('convictionDate')?.patchValue('');
    this.addViolationStatusByDriver[driverIndex].status = false;
    this.setAddViolationFormAsRequired(driverIndex, this.addViolationStatusByDriver[driverIndex].status);
  }

  addUpdateViolation(driverIndex: number): void {
    this.logTracker.loginfo(this.constructor.name, 'addUpdateViolation', 'addUpdateViolation', 'Add/Update Violation for Driver '.concat(driverIndex.toString()));
    let violationId = this.violations[driverIndex].violationsCount;
    if (this.violations[driverIndex].violations.length > 0) {
      violationId = Math.max.apply(Math, this.violations[driverIndex].violations.map(function (o: { sequenceNumber: any; }) { return o.sequenceNumber; }));
    }
    violationId = violationId + 1;
    const datePipe = new DatePipe('en-US');
    const violationCode = this.violationFormGroup(driverIndex).get('violationCode')?.value;
    const occurrenceDate = this.isRequiredConvictionDate? this.violationFormGroup(driverIndex).get('convictionDate')?.value : this.violationFormGroup(driverIndex).get('occurenceDate')?.value;
    
    if ((occurrenceDate == null || occurrenceDate === '') || ObjectUtils.isFieldEmpty(violationCode)) {
      return;
    }
    var today = new Date(this.policyEffectiveDate);
    var violationOccDate = new Date(occurrenceDate);
    if (!this.isFutureDate(violationOccDate)) { //check for future date
      //if (this.monthDiff(violationOccDate, today) <= 35) { // check violationOccDate is within 35 months policy effective date
        if (this.violationFormGroup(driverIndex).status === 'VALID') {
          this.messageservice.showError([]);
          if (this.eventType === 'add') {
            const driverViolationObj = {

              sequenceNumber: violationId,
              violationCode: this.violationCodes.find(x => x.key === violationCode)?.key,
              violationName: this.violationCodes.find(x => x.key === violationCode)?.displayvalue,
              violationDate: datePipe.transform(new Date(occurrenceDate), 'MM/dd/yyyy'),
              convictionDate: this.isRequiredConvictionDate?datePipe.transform(new Date(occurrenceDate), 'MM/dd/yyyy'):'',
              reportingSource: 'Self Reported',
              displayingDisputeIndicator: this.violationFormGroup(driverIndex).get('violationCode')?.value !== '',
              disputeLevel: 0,
              disputeExplanation: this.violationFormGroup(driverIndex).get('violationCode')?.value,
              withinChargeablePeriodIndicator: false,
              editableIndicator: true,
              removableIndicator: true,
              operation: 'Add'
            };
            /*if (driverViolationObj.operation === 'Add') {
              driverViolationObj.sequenceNumber = this.highestViolationSeq;
            }*/
            this.violations[driverIndex].violations.push(driverViolationObj);
            const violationInd = this.violations[driverIndex].violations.length - 1;
            this.addDriverViolation(driverIndex);
            this.listOfViolationsFormGroup(driverIndex, violationInd).controls.operation.patchValue('Add');
          } else if (this.editViolationIndex !== undefined && this.eventType === 'edit') {
            this.violations[driverIndex].violations[this.editViolationIndex].violationCode =
              this.violationCodes.find(x => x.key === violationCode)?.key;
            this.violations[driverIndex].violations[this.editViolationIndex].violationName =
              this.violationCodes.find(x => x.key === violationCode)?.displayvalue;
            this.violations[driverIndex].violations[this.editViolationIndex].violationDate =
              datePipe.transform(new Date(occurrenceDate), 'MM/dd/yyyy');
            if(this.isRequiredConvictionDate){
              this.violations[driverIndex].violations[this.editViolationIndex].convictionDate =
              datePipe.transform(new Date(occurrenceDate), 'MM/dd/yyyy');
            }
            this.listOfViolationsFormGroup(driverIndex, this.editViolationIndex).get('operation')?.patchValue('');
          }
          this.displayViolationObj = this.violations;
          this.hideAddViolation(driverIndex);
          //}
        } 
      
      /*else {
        const errorMsg = [MessageConstants.VIOLATION_OCC_DATE_LESS_THAN_35YRS];
        this.messageservice.showError(errorMsg);
        const element = document.querySelector('#topcontent');
        element?.scrollIntoView();
      }*/
    } else {
      const errorMsg = [MessageConstants.VIOLATION_FUTURE_DATE];
      this.messageservice.showError(errorMsg);
      const element = document.querySelector('#topcontent');
      element?.scrollIntoView();
    }
  }
  public hasError = (controlName: string, errorName: string, driverIndex: any, violationIndex: any) => {
    return this.listOfViolationsFormGroup(driverIndex, violationIndex)?.controls[controlName]?.hasError(errorName);
  }

  monthDiff(d1: any, d2: any) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
  }
  isFutureDate(dateVal: any) {
    const today = new Date();
    return dateVal.getTime() > today.getTime();
  }
  public driverFormHasError = (controlName: string, errorName: string, index: any) => {
    return this.violationFormGroup(index)?.controls[controlName]?.hasError(errorName);
  }
  onLicenseChange(index: number): void {
    const updatedLicenseNumber = this.violationFormGroup(index).controls['licenseNumber'].value;
    const existingLicenseNumber = this.violations[index].license.licenseNumber;
    this.licenseNumberList[index] = (updatedLicenseNumber?.toUpperCase() !== existingLicenseNumber?.toUpperCase()) ? true : false;
    this.licenseChangeEvent.emit(this.licenseNumberList);
  }
}
