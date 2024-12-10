import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { GlobalConstants } from 'src/app/constants/global.constant';
import { MessageConstants } from 'src/app/constants/message.constant';
import { DriverClueReportService } from 'src/app/services/driver-clue-report.service';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { SharedService } from 'src/app/services/shared.service';
import { AutoQuoteData } from 'src/app/shared/model/autoquote/autoquote.model';
import { ClueResponse } from 'src/app/shared/model/cluereport/clue-response.model';
import { MessagesService } from 'src/app/shared/services/messages.service';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { ObjectUtils } from 'src/app/shared/utilities/object-utils';
import { QuoteDataMapper } from 'src/app/shared/utilities/quotedata-mapper';
import { Tracker } from 'src/app/shared/utilities/tracker';
import QuoteSummary, { PageStatus } from 'src/app/state/model/summary.model';
import * as Actions from '../../../state/actions/summary.action';
import { addPageStatus } from '../../../state/actions/summary.action';
import { ViolationsListComponent } from './violations-list/violations-list.component';
import { ViolationsUtil } from 'src/app/shared/utilities/violations-util';
import { CommonUtils } from 'src/app/shared/utilities/common-utils';

@Component({
  selector: 'app-violations',
  templateUrl: './violations.component.html',
  styleUrls: ['./violations.component.scss'],
})

export class ViolationsComponent implements OnInit {

  @ViewChild('next', { read: ElementRef }) nextButton!: ElementRef;
  @ViewChild(ViolationsListComponent, { read: ElementRef }) violationChild!: ElementRef;

  violationsForm!: UntypedFormGroup;
  formSubmitAttempt!: boolean;
  pageStatus!: number;
  private pristineQuoteData!: AutoQuoteData;
  quoteNumber!: any;
  mco!: any;
  violations: any = [];
  violationsLoaded = false;
  isNewQuote!: boolean;
  orderCLUEReportStatus: any = false;
  clueResponseObj!: ClueResponse;
  autoQuoteData!: AutoQuoteData;
  errorMessage = '';
  dbDriversData!: any;
  clickBack = false;
  clickNext = false;
  errorArr: any = [];
  qid!: any;
  quoteBridgeStatus: boolean = false;
  ratebook!: string;
  policyState!: string;
  softErrArr: any = [];
  within35MonthsIndi: boolean = false;

  requestedRoute = '';
  navigationObvSubscription!: Subscription;
  performSaveExit = false;
  routeMessageObj!: any;
  storedClueResponse: any;
  occuranceDate35months: any = [false];
  policyEffectiveDate!: string;
  formSubmitCount=0;

  constructor(
    private router: Router,
    private showSpinnerService: SpinnerStatusService,
    private quoteDataService: QuoteDataService,
    private formB: UntypedFormBuilder,
    private store: Store<{ quoteSummary: QuoteSummary }>,
    public quoteDataMapper: QuoteDataMapper,
    private readonly messageService: MessagesService,
    private clueReportService: DriverClueReportService,
    private navigationService: NavigationService,
    private logTracker: Tracker,
    private sharedService: SharedService
  ) {

    this.store.select('quoteSummary').subscribe(data => {
      this.mco = data.mco;
      this.policyState = data.policyState;
      this.ratebook = data.rateBook;
      this.policyEffectiveDate = data.policyEffectiveDate
      const pageStatusArr = data.pageStatus.filter(page => (page.name === 'VIOLATIONS'));
      this.pageStatus = pageStatusArr.length > 0 ? pageStatusArr[0].status : 0;
      this.quoteBridgeStatus = (data.bridgeStatus ? data.bridgeStatus : false);
      this.isNewQuote = (data.newQuote === 'true' ? true : false);
      this.orderCLUEReportStatus = data.orderCLUEReport;
      let qid = JSON.stringify(data.qid);
      this.quoteNumber = qid.replace(/"/g, '');
      this.routeMessageObj = data?.routingRules?.messages;
      this.storedClueResponse = data.clueReport;
      //this.drivers = data.drivers;
     });
  }

  ngOnDestroy(): void {
    this.navigationService.updateNavigationRequestedRoute('');
    this.navigationObvSubscription.unsubscribe();
  }

  ngOnInit(): void {

    this.violationsForm = this.formB.group({
      addViolation: this.formB.array([])
    });


      this.getViolations();

    this.navigationObservableWatch();

  }

  getViolations(): void {
    let softEdits: string[] = [];
    const urlParams:any = this.sharedService.getURLQueryParameter();
    if (urlParams !== undefined && urlParams?.m !== undefined && urlParams?.m !== GlobalConstants.EMPTY_STRING) {
      const routeMessage = this.routeMessageObj?.filter((obj: any) => obj.routeIndex === urlParams?.m)[0]?.message;
      softEdits.push(routeMessage);
    }

    // if ((sessionStorage.getItem('NEWQUOTE') !== 'TRUE') || (sessionStorage.getItem('violationFormData') != null)) {
      let orderingClue = false;
      let violationsObservables: Observable<any>[] = new Array();
      violationsObservables.push(this.quoteDataService.retrieveQuote(this.quoteNumber, 'getViolations', this.policyState, this.ratebook));

      this.showSpinnerService.showSpinner(true);
      if ((this.pageStatus === 0 && !this.orderCLUEReportStatus) || this.orderCLUEReportStatus || (Boolean(this.quoteBridgeStatus) === true && !this.orderCLUEReportStatus && this.pageStatus !== 1 )){
        violationsObservables.push(this.clueReportService.orderClueReport(this.quoteNumber, this.mco));
        orderingClue = true;
      }

      this.logTracker.loginfo('ViolationsComponent', 'getViolations', 'On Page load', 'On Page load Calls '.concat(violationsObservables.length.toString()).concat(' Page Status ').concat(this.pageStatus.toString()).concat(' OrderCLUEReportStatus ').concat(this.orderCLUEReportStatus));
      forkJoin(violationsObservables)
          .subscribe(results => {
            // get violations response
            this.pristineQuoteData = results[0];
            this.violations = results[0].autoQuote?.personalAuto?.drivers;

            // clue response
            //this.clueResponseObj = results[1];
            if(results[1] !== undefined){
              this.store.dispatch(Actions.addClueReport ({ clueReport: results[1] }));
              this.clueResponseObj = results[1];
           }else{
              this.clueResponseObj = this.storedClueResponse;
            }

            // Bridge Edits
            if (this.orderCLUEReportStatus){
              this.checkForBridgeEdits(results[1], softEdits);
            } else {
              this.messageService.softError(softEdits);
            }

            this.store.dispatch(Actions.orderCLUEReport ({ orderCLUEReport: false }));
            this.violationsLoaded = true;
            this.showSpinnerService.showSpinner(false);

            this.logTracker.loginfo('ViolationsComponent', 'getViolations', 'QuoteAPI.getViolations', 'Success retrievd QuoteAPI');

            if(orderingClue) {
              this.logTracker.loginfo('ViolationsComponent', 'getViolations', 'clueReportService.orderClueReport', 'Success retrievd CLUE Violations');
            }
          },
          (error: any) => {
            this.errorHandler(error);
            this.violationsLoaded = true;
            this.showSpinnerService.showSpinner(false);
            this.logTracker.logerror('ViolationsComponent', 'ngOnInit', 'getViolations', 'Error=Retrieve Violations page error', error);
          });
    // }
  }

  checkForBridgeEdits(clueResponse: ClueResponse, softEdits:string[]) {

    // if (this.quoteBridgeStatus === true || this.quoteBridgeStatus.toString() === 'true') { // This edit to be fired
      if (clueResponse?.riskReports?.declaredClaim.length > 0) {
        softEdits.push(MessageConstants.VIOLATIONS_CLUE_EDT);
      } else if(clueResponse?.riskReports?.currentCarrierMessage?.length > 0){
        softEdits.push(clueResponse?.riskReports?.currentCarrierMessage[0]?.messageCode);
      }else {
        softEdits.push(MessageConstants.VIOLATIONS_NOCLUE_EDT);
    }
    if (softEdits.length > 0) {
      this.messageService.softError(softEdits);
    }

   //  }
  }

  onSubmit(formData: any): void {
    this.violationChild?.nativeElement?.querySelector('#violationNext')?.click();
    //this.violationChild.nativeElement.querySelector('#violationListForm').submit();
    this.errorArr = this.messageService.clearErrors();
    this.formSubmitAttempt = true;
    this.clickNext = true;
    this.formSubmitCount= this.formSubmitCount+1;
    const violationRequestObj = JSON.parse(JSON.stringify(this.violations));

    /*Whole Violation object is not required to be stored in session anymore as DUI Violations are checked with Indicators

    for(let violation of violationRequestObj){
      violation.violations = violation.violations && violation.violations.length > 0 ?
      violation.violations.filter((x:any) => !x.operation || x.operation !== "delete") : [];
    }
    sessionStorage.setItem('violationFormData', violationRequestObj);*/

    if((this.policyState === GlobalConstants.STATE_FL || this.policyState === GlobalConstants.STATE_OH) && this.formSubmitCount == 1){
      let hasMaturedDriverViolation: any = ViolationsUtil.validateMatureDriverViolation(violationRequestObj, formData.value.addViolation,this.policyEffectiveDate);
      if (hasMaturedDriverViolation.violation) {
        this.messageService.softError(hasMaturedDriverViolation.edit);
        const element = document.querySelector('#topcontent');
        element?.scrollIntoView();
        this.performSaveExit = false;
        return;
      }
    }

    this.logTracker.loginfo('ViolationsComponent', 'onSubmit', 'Next Button Click', 'Violation FormData Submission and Is Form Valid ' + this.violationsForm.valid);
    if (this.violationsForm.valid) {
      this.showSpinnerService.showSpinner(true);
      let quoteID = this.quoteNumber;


      // const violationRequestObj = JSON.parse(JSON.stringify(this.violations));
      // let duiIndicator = this.getDUIViolationInd(violationRequestObj);
      // this.store.dispatch(Actions.setDUIViolationInd ({ duiViolationInd: duiIndicator }));
      sessionStorage.setItem('violationFormData', violationRequestObj);
      this.autoQuoteData = this.quoteDataMapper.mapViolationData(violationRequestObj, formData.value.addViolation);

      sessionStorage.setItem('autoQuoteData', this.autoQuoteData.toString());

      this.quoteDataService.saveUpdateQuote(this.autoQuoteData, quoteID, 'saveQuote').subscribe(async (data: any) => {

        await data;
         const pageStatus: PageStatus = { name: 'VIOLATIONS', status: 1 };
        this.store.dispatch(addPageStatus({ pageStatus }));
        this.sharedService.updateLastVisitedPage(2);
        this.navigationService.removeRuleOnNext(2);
        this.store.dispatch(Actions.addClueReport ({ clueReport:{} }));
        const violationRequestObj = JSON.parse(JSON.stringify(this.violations));
        let duiIndicator = this.getDUIViolationInd(violationRequestObj);
        this.store.dispatch(Actions.setDUIViolationInd ({ duiViolationInd: duiIndicator }));
        if (this.performSaveExit) {
          this.showSpinnerService.showSpinner(false);
          this.navigationService.getNextRoutingRule(this.requestedRoute);
          return;
        }



        this.showSpinnerService.showSpinner(false);
        this.logTracker.loginfo('ViolationsComponent', 'onSubmit', 'QuoteAPI.saveUpdateQuote', 'Successfully saved Violations Data');

        if (this.clickBack) {
          this.launchDrivers(quoteID);
        } else {
          await this.router.navigateByUrl('/vehicles?qid=' + quoteID);
        }
      },
        (error: any) => {
          this.errorHandler(error);
          if(error?.status=='418'){
            if(this.clickBack){
              this.launchDrivers(quoteID);
            }else if(!this.clickBack && (this.requestedRoute !== GlobalConstants.EMPTY_STRING)){
              this.navigationService.getNextRoutingRule(this.requestedRoute);
              return;
            }
          }
          this.logTracker.logerror('ViolationsComponent', 'onSumbit', 'saveUpdateQuote', 'Error=Violations Page Error', error);
        }
      );
    } else {
      this.performSaveExit = false;
    }
  }

  //DUI violation Indicator
  getDUIViolationInd(drivers: any) : boolean {
    // this.violationsMonthsCal(drivers);
    let duiIndicator = false;
    drivers?.forEach((driver: any) => {
      driver.violations.forEach((violation: any) => {
        if (violation?.violationCode === GlobalConstants.DUI_VIOLATION && this.violationsMonthsCal(violation) && (violation?.operation !== 'delete' || violation?.operation === undefined)) {
        duiIndicator = true;
        return;
      }
    });
  });
    return duiIndicator;
  }

violationsMonthsCal(violation: any) :boolean{
   // drivers.forEach((driver: any) => {
    //  driver.violations.forEach((violation: any) => {
        let violatioNDate = violation.violationDate;
        var today = new Date(this.policyEffectiveDate);
        let violationOccDate = new Date(violatioNDate);
        if (CommonUtils.monthDiff(violationOccDate, today) <= 35 && CommonUtils.daysDiff(violationOccDate, today) <= 1060) {
          this.within35MonthsIndi = true;
         // return;
        } else {
          this.within35MonthsIndi = false;
        }
     // });
    //});
    return this.within35MonthsIndi;
  }

  checkForViolationLIst(violationObj: any) {
   return violationObj.filter((z: any) => z.violations.length > 0)
  }
  /* API error handling*/
  errorHandler(errorData: any): void {
    errorData?.error?.transactionNotification?.remark?.forEach((val: any) => {
      if (!this.errorArr.includes(val.messageText)) {
        if(val.messageType !== "Soft Edit"){
          this.errorArr.push(val.messageText);
        }else {
          this.softErrArr.push(val.messageText);
        }
      }
    });
    this.messageService.showError(this.errorArr);
    this.messageService.softError(this.softErrArr);
    const element = document.querySelector('#topcontent');
    element?.scrollIntoView();
    this.showSpinnerService.showSpinner(false);
  }

  onClickBack(formData: any): void {
    this.clickBack = true;
   this.quoteDataService.isAddtionalDriver.next(false);

   this.logTracker.loginfo('ViolationsComponent', 'onClickBack', 'Back Button Clicked', 'Submitting Violation Form');
    this.onSubmit(formData);
  }

  launchDrivers(quoteId: string): void {
    this.router.navigateByUrl('/drivers?qid=' + quoteId);
  }

  navigationObservableWatch(): void {
    // console.log('1. Violations Page -> navigationObservableWatch() ');
    this.navigationObvSubscription = this.navigationService.navigationStepObv.subscribe(
      nextRoute => {
        // console.log('2. Violations Page -> Next Route -> ', nextRoute);
        if (nextRoute.startsWith('save-')) {
          this.requestedRoute =  nextRoute.split('-')[1].trim();
          // simulate form submit
          this.performSaveExit = true;
          this.nextButton.nativeElement.click();
        }
      },
      error => this.logTracker.logerror('ViolationsComponent', 'navigationObservableWatch', 'navigationStepObv',
        'Violations Page navigationObservableWatch Error', error));
  }

}
