import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { forkJoin, Observable } from 'rxjs';
import { SsoService } from 'src/app/services/sso.service';
import { AutoQuoteData } from 'src/app/shared/model/autoquote/autoquote.model';
import { MessagesService } from 'src/app/shared/services/messages.service';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { StatemcoService } from 'src/app/shared/services/statemco.service';
import { CommonUtils } from 'src/app/shared/utilities/common-utils';
import { ObjectUtils } from 'src/app/shared/utilities/object-utils';
import { Tracker } from 'src/app/shared/utilities/tracker';
import { addPageStatus } from 'src/app/state/actions/summary.action';
import QuoteSummary, { PageStatus } from 'src/app/state/model/summary.model';
import { QuoteDataService } from '../../services/quote-data.service';
import { HelpText } from 'src/app//state/model/summary.model';
import { HelpTextService } from 'src/app/services/HelpText.service'
import { Subscription } from 'rxjs';
import * as Actions from '../../state/actions/summary.action';
@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  loadQuoteForm: UntypedFormGroup;
  public ssot: any = {};
  public userName: string = '';
  public quoteID: string = '';
  state: string = '';
  mco: string = '';
  rateBook: string = '';
  agentCode: string = '';
  channel: string = '';
  lang: string = '';
  newquote: boolean = false;
  public sessionTicket: any = {};
  public producerUserId: any = '';
  public errorMsg: string = 'Error on generating new quote number!';
  showSpinner = false;
  public term: string = '';
  public callID: boolean = false;
  bridging = false;
  quoteSrc: string = '';
  bridgeEdits: string[] = [];
  public isProdSweepDownPayEligible: boolean = false;
  public producerFirstName: any = '';
  public producerLastName: any = '';
  private helpTextloaded: Boolean = false;
  private helpTextServiceSubscription!: Subscription;
  constructor(
    public quoteDataService: QuoteDataService,
    public stateMCOService: StatemcoService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
    public ssoDataService: SsoService,
    private showSpinnerService: SpinnerStatusService,
    private readonly messageservice: MessagesService,
    private store: Store<{ quoteSummary: QuoteSummary }>,
    private helpTextSvc: HelpTextService,
    private logTracker: Tracker) {

    this.loadQuoteForm =
      this.fb.group({
        'quoteNumber': ['', Validators.compose([Validators.required, Validators.minLength(14), Validators.maxLength(14)])],
        'mco': ['', Validators.compose([Validators.required])]
      });
    this.store.select('quoteSummary').subscribe(data => {
      if (data.helpText.length == 0) {
        this.helpTextloaded = false;
      }
      else {
        this.helpTextloaded = true;
      }
    });
  }

  ngOnInit(): void {
    this.showSpinner = true;

    this.route.queryParams.subscribe(params => {
      // this.rateBook = params['rateBook'] || 'A'; // Still in Question
      this.quoteID = params['quoteNum'];

      if (!this.quoteID) {
        if (params['symbol'])
          this.quoteID = params['symbol'].concat(params['policy']).concat(params['mod']); // Still in Question
      }

      this.ssot = params['ssot'];
      this.userName = params['userName'];
      this.agentCode = params['agentCode'];
      this.channel = params['theme'] === 'BristolWest' ? 'EA' : 'IA';
      this.lang = params['lang'];
      this.newquote = this.quoteID ? false : true;

      if (params['bridging']) {
        this.bridging = (params['bridging'] === 'false' ? false : true);
      } else {
        this.bridging = false;
      }

      this.quoteSrc = params['source'];
      const bredits = params['edit'];
      this.bridgeEdits = !ObjectUtils.isFieldEmpty(bredits) ? bredits.split(';') : [];

      if (ObjectUtils.isFieldEmpty(this.ssot)) {
        this.router.navigateByUrl('/unauthorized'); // Navigate to BWProducers.com
      } else {
        // Retrieve State Code
        this.stateMCOService.getStateCodesMapping(this.agentCode).subscribe(res => {
          this.state = res;
          this.stateMCOService.getStateCodeMCOMapping(this.state, this.channel).subscribe(resp => {
            this.mco = resp;
            if (!this.helpTextloaded) {
              this.loadHelpText();
            }

            /* US396477
            if (this.state === 'IL') {
              this.rateBook = 'E'
            }
            if (this.state === 'IN') {
              this.rateBook = 'K'
            }*/


            // Integrate USM service to authorize the token and store state and mco in store

            this.sessionTicket = '';
            this.ssoDataService.tokenLogin({
              token: this.ssot
            }).subscribe(async (data: any) => {
              await data;
              this.showSpinnerService.showSpinner(false);
              
              this.sessionTicket = data.signInStatus.sessionTicket;
              this.producerUserId = data.signInStatus.user.userId;
              this.producerFirstName = data.signInStatus.user.firstName;
              this.producerLastName = data.signInStatus.user.lastName;


              // Try to fetch Producer user first and last name
              if (this.producerFirstName?.includes(',')) {
                const names = this.producerFirstName.split(',')
                this.producerLastName = names?.length > 0 ? names[0] : ''
                this.producerFirstName = names?.length > 1 ? names[1] : ''
              } else {
                if (this.producerFirstName?.includes(' ')) {
                  const names = this.producerFirstName.split(' ')
                  this.producerFirstName = names?.length > 0 ? names[0] : ''
                  this.producerLastName = names?.length > 1 ? names[1] : ''
                }
              }

              this.store.dispatch(Actions.sessionToken({ sessionToken: this.sessionTicket }));

              // console.log(this.userName,"=======");
              
              
              this.store.dispatch(Actions.setProducerUserId({ producerUserId: this.producerUserId }))
              this.store.dispatch(Actions.setProducerUserFirstName({ producerUserFirstName: this.producerFirstName }))
              this.store.dispatch(Actions.setProducerUserLastName({ producerUserLastName: this.producerLastName }))

              this.store.dispatch(Actions.setPolicyState({ policyState: this.state }));
              this.store.dispatch(Actions.setMCO({ mco: this.mco }));
              this.store.dispatch(Actions.setUserName({ userName: this.userName }));
              this.store.dispatch(Actions.setChannel({ channel: this.channel }));
              this.store.dispatch(Actions.setProducerCode({ producerCode: '' + this.agentCode }));
              // this.store.dispatch(Actions.setRateBook({ rateBook: this.rateBook }));
              this.store.dispatch(Actions.setQuoteSrc({ quoteSrc: this.quoteSrc }));
              this.store.dispatch(Actions.setBridgingStatus({ bridgeStatus: this.bridging }));
              this.store.dispatch(Actions.bridgeEdits({ bridgeEdits: this.bridgeEdits }));
              this.store.dispatch(Actions.setNewQuoteFlag({ newQuote: (this.newquote ? 'true' : 'false') }));
              this.logTracker.loginfo('AuthComponent', 'verifyState', 'ngOnInit',
                'QuoteNumber='.concat(this.quoteID + '|1. policyState='.concat(this.state)));
              // If authorization is success then check if Quote number in the param
              // If No quote Number then it is a new Customer and new quote
              if (this.newquote === true || this.newquote.toString() === 'true') {
                let quoteNumObservables: Observable<any>[] = new Array();
                quoteNumObservables.push(this.quoteDataService.getQuoteID(this.mco, this.agentCode));
                quoteNumObservables.push(this.quoteDataService.getRatebook(this.mco, this.agentCode, this.state, CommonUtils.generateCurrentDate().toString()));
                // console.log('Date Today ===> ', CommonUtils.generateCurrentDate());
                forkJoin(quoteNumObservables).subscribe(results => {
                  this.quoteID = JSON.stringify(results[0].quoteNumber);
                  this.quoteID = this.quoteID.replace(/"/g, '');
                  this.term = results[0].term;
                  this.callID = results[0].quoteReferenceIndicator;
                  this.isProdSweepDownPayEligible = results[0].producerSweepEligibilityIndicator;

                  if (this.quoteID != '') {
                    const displayID = this.quoteID.slice(0, 3).concat('-').concat(this.quoteID.slice(3, 10)).concat('-').concat(this.quoteID.slice(10, 12));
                    this.store.dispatch(Actions.setQuoteResponseChannel({ quoteResponseChannel: results[0].quoteResponseChannel }));
                    this.store.dispatch(Actions.addQuoteNumber({ quoteNumber: displayID }));
                    this.store.dispatch(Actions.setQID({ qid: this.quoteID }));
                    this.store.dispatch(Actions.setTerm({ term: this.term }));
                    this.store.dispatch(Actions.callIDStatus({ callIDStatus: this.callID }));
                    this.store.dispatch(Actions.prodSweepStatus({ prodSweepStatus: this.isProdSweepDownPayEligible }));
                    this.store.dispatch(Actions.setRateBook({ rateBook: results[1].rateBook }));
                    this.logTracker.loginfo(this.constructor.name, 'ngOnInit', 'New Quote', 'New Quote');
                    this.logTracker.loginfo('AuthComponent', 'verifyState', 'ngOnInit',
                      'QuoteNumber='.concat(this.quoteID + '|2. policyState='.concat(this.state)));
                    this.router.navigateByUrl('/applicant?qid=' + this.quoteID);
                  }

                  this.showSpinner = false;
                },
                  (errorData: any) => {
                    this.logTracker.logerror('AuthComponent', 'ngOnInit', 'quoteDataService.getQuoteID|quoteDataService.getRatebook', 'Error=Auth Page Error', errorData);

                    this.errorHandler(errorData);

                  });

              } else {
                const quoteKey = this.generateQuoteKey(this.quoteID, this.mco);
                let quoteNumber;
                if (this.quoteID.indexOf('-') > -1) {
                  quoteNumber = this.quoteID;
                } else {
                  quoteNumber = this.quoteID.slice(0, 3).concat('-').concat(this.quoteID.slice(3, 10)).concat('-').concat(this.quoteID.slice(10, 12));
                }

                this.store.dispatch(Actions.addQuoteNumber({ quoteNumber: quoteNumber }));
                this.store.dispatch(Actions.setQID({ qid: quoteKey }));

                //Mule API call to get the lastvisited page name
                // console.log('inside oninit of auth');
                let startTime = new Date();
                this.showSpinnerService.showSpinner(true);

                ////////////////

                let existingQuoteObservables: Observable<any>[] = new Array();
                existingQuoteObservables.push(this.quoteDataService.retrieveLastSavedQuote(quoteKey, this.state, 'NA', 'getLastSavedQuote',  this.agentCode));
                existingQuoteObservables.push(this.quoteDataService.retrieveSavedQuoteIndicators(quoteKey, this.state, this.mco));
                forkJoin(existingQuoteObservables).subscribe(results => {
                  let apiLastVisitedPageName;
                  let apiresp;
                  apiresp = results[0]?.autoQuote?.lastVisitedPageOrIndex || 'Applicant-1';
                  let dataArr: any[];
                  dataArr = apiresp.split('-');
                  apiLastVisitedPageName = dataArr[0];
                  this.store.dispatch(Actions.setQuoteResponseChannel({ quoteResponseChannel: results[0]?.autoQuote?.quoteResponseChannel ? results[0]?.autoQuote?.quoteResponseChannel : '' }));
                  if (dataArr != undefined && dataArr.length > 1) {
                    const savedPage = dataArr[1].trim();
                    // console.log(savedPage);
                    this.store.dispatch(Actions.lastVistedPage({ lastVistedPage: Number(savedPage) - 1 }));
                    this.showSpinnerService.showSpinner(false);
                    this.logTracker.loginfo('AuthComponent', 'ngOnInit', 'MuleAPI.getLastSavedQuote()', 'QuoteNumber='.concat(quoteKey + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
                    this.router.navigateByUrl('/applicant?qid=' + quoteKey);
                  } else {
                    this.router.navigateByUrl('/applicant?qid=' + quoteKey);
                  }
                  this.logTracker.loginfo('AuthComponent', 'ngOnInit', 'MuleAPI.getLastSavedQuote()', 'QuoteNumber='.concat(quoteKey + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
                // TO:DO once Mule API is up and running, then uncomment this code.
                  let indresp;
                  indresp = results[1]?.filters;
                  indresp?.forEach((eachfil: any, i: number) => {
                    if (eachfil?.key === 'policy') {
                      eachfil?.values?.forEach((eachval: any, j: number) => {
                        eachval?.attributes?.forEach((eachattr: any, k: number) => {
                          if (eachattr.name === 'drivingUnderInfluenceIndicator') {
                            // console.log(eachattr.value,"============");
                            
                          this.store.dispatch(Actions.setDUIViolationInd({ duiViolationInd : eachattr.value }));
                          }
                          if(eachattr.name === 'namedNonOwnerIndicator') {
                            this.store.dispatch(Actions.setNonOwner({nonOwner : eachattr.value}));
                          }    
                        });
                      });
                    } else if (eachfil?.key === 'drivers') {
                      eachfil?.values?.forEach((eachval: any, j: number) => {
                        eachval?.attributes?.forEach((eachattr: any, k: number) => {
                          if (eachattr.name === 'fr44FilingIndicator') {
                            this.store.dispatch(Actions.setFilingTypeFR44({ filingTypeFR44: eachattr.value }));
                          }
                          if (eachattr.name === 'sr22FilingIndicator') {
                            this.store.dispatch(Actions.setFilingTypeSR22({ filingTypeSR22: eachattr.value }));
                          }
                        });
                      });
                    } else if (eachfil?.key === 'vehicles') {
                      eachfil?.values?.forEach((eachval: any, j: number) => {
                        eachval?.attributes?.forEach((eachattr: any, k: number) => {
                          if (eachattr.name === 'rideShareIndicator') {
                            this.store.dispatch(Actions.setRideShare({ rideShare: eachattr.value }));
                          }
                        });
                      });
                    }
                  });

                  this.logTracker.loginfo('AuthComponent', 'ngOnInit', 'MuleAPI.retrieveIndicatorsSavedQuote()', 'QuoteNumber='.concat(quoteKey + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));

                },
                  (errorData: any) => {
                    this.logTracker.logerror('AuthComponent', 'ngOnInit', 'quoteDataService.retrieveLastSavedQuote|quoteDataService.retrieveIndicatorsSavedQuote', 'Error=Auth Page Error'.concat('QuoteNumber='.concat(quoteKey + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString()))), errorData);
                    this.errorHandler(errorData);
                  });
                this.logTracker.loginfo(this.constructor.name, 'ngOnInit', 'Bridged Quote', 'Bridged Quote');
              }
            },
              (errorData: any) => {
                this.errorHandler(errorData);
              });



          });
        });

      }
    });
  }

  loadHelpText() {
    this.helpTextServiceSubscription = this.helpTextSvc.getHelpText(this.mco, this.agentCode).subscribe(async (data?: any) => {

      await data;

      if (data.length > 0) {
        data.forEach((element: any) => {
          const helpText1: HelpText = {
            fieldID: element.fieldID,
            producerText: element.producerText,
          }
          this.store.dispatch(Actions.setHelpText({ helpText: helpText1 }));
        });
      }

    },
      (error?: any) => {
        //navigate to error page
      }
    );
  }

  onSubmit(formData: any): void {
    if (this.loadQuoteForm.valid) {
      const pageStatus: PageStatus = { name: 'APPLICANT', status: 1 };
      this.store.dispatch(addPageStatus({ pageStatus }));
      this.router.navigateByUrl('/applicant');
    }
  }

  generateQuoteKey(quoteNum: string, mco: string): string {
    let quoteKey = quoteNum + mco;
    quoteKey = quoteKey.replace(/-|\s/g, '');

    return quoteKey;
  }

  /* API error handling*/
  errorHandler(errorData: any) {
    const errorArr: any = [];
    errorData?.error?.transactionNotification?.remark?.forEach((val: any) => {
      errorArr.push(val.messageText);
    });
    this.messageservice.showError(errorArr);
    const element = document.querySelector('#topcontent');
    element?.scrollIntoView();
    this.showSpinnerService.showSpinner(false);
  }

  ngOnDestroy(): void {
    this.helpTextServiceSubscription?.unsubscribe();
  }
}

