import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import * as Actions from './state/actions/summary.action';
import QuoteSummary from './state/model/summary.model';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { HelpTextService } from 'src/app/services/HelpText.service'
import { Subscription } from 'rxjs';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { AutoQuoteData } from './shared/model/autoquote/autoquote.model';
import { NavigationService } from './shared/services/navigation.service';
import { SharedService } from './services/shared.service';
import { PagedetailsService } from './shared/services/pagedetails.service';
import { GlobalConstants } from './constants/global.constant';
import { CommonUtils } from './shared/utilities/common-utils';
import { Tracker } from './shared/utilities/tracker';
//import { Keepalive } from '@ng-idle/keepalive';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public currentStep = 0;
  spinnerStatus: boolean = false;
  spinner$ = this.showSpinnerService.spinner$;
  public ssot: any = {};
  public mco: string = '';
  public quoteID: string = '';
  public displayID: any = {};
  public errorMsg: string = 'Error on generating new quote number!';
  private helpTextServiceSubscription!: Subscription;
  private helpTextloaded: Boolean = false;
  // some fields to store our state so we can display it in the UI
  idleState = "NOT_STARTED";
  countdown?: number = 0;
  //lastPing?: Date = undefined;
  autoQuoteData!: AutoQuoteData;
  storeLastVisitedPage!: any;
  routingRulesObj: number[] = [];
  lastVisitedPageName!: string;
  lastVisitedPageNumber!: any;

  constructor( private logTracker: Tracker, private readonly showSpinnerService: SpinnerStatusService, private route: ActivatedRoute, private router: Router,
    public quoteDataService: QuoteDataService, private navigationService: NavigationService, public sharedService: SharedService,
    private store: Store<{ quoteSummary: QuoteSummary }>, private pagedetailsService: PagedetailsService, private helpTextSvc: HelpTextService, private idle: Idle, /*keepalive: Keepalive,*/ cd: ChangeDetectorRef) {
    this.store.select('quoteSummary').subscribe(data => {
      if (data.helpText.length == 0) {
        this.helpTextloaded = false;

      }
      else {
        this.helpTextloaded = true;
      }

      this.mco = data.mco;
      this.displayID = data.quoteNumber;
      this.storeLastVisitedPage = data.lastVistedPage;

    });
    // set idle parameters
    idle.setIdle(60); // how long can they be inactive before considered idle, in seconds
    idle.setTimeout(1740); // how long can they be idle before considered timed out, in seconds
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES); // provide sources that will "interrupt" aka provide events indicating the user is active

    // do something when the user becomes idle
    idle.onIdleStart.subscribe(() => {
      this.idleState = "IDLE";
      // console.log("IDLE");
    });
    // do something when the user is no longer idle
    idle.onIdleEnd.subscribe(() => {
      this.idleState = "NOT_IDLE";
      // console.log("NOT IDLE");
      this.countdown = 0;
      cd.detectChanges();
    });
    // do something when the user has timed out
    idle.onTimeout.subscribe(() => {
      this.idleState = "TIMED_OUT"
      // console.log("Timeout");
      this.router.navigate(['/auth']);
    });

    // do something as the timeout countdown does its thing
    idle.onTimeoutWarning.subscribe((seconds: number | undefined) => this.countdown = seconds);

    // set keepalive parameters, omit if not using keepalive
    //keepalive.interval(15); // will ping at this interval while not idle, in seconds
    //keepalive.onPing.subscribe(() => this.lastPing = new Date()); // do something when it pings
  }

  ngOnInit(): void {
    window.addEventListener("keyup", disableF5);
    window.addEventListener("keydown", disableF5);

   function disableF5(e: any): void {
      if ((e.which || e.keyCode) == 116) e.preventDefault(); 
   };
    //this.showSpinnerService.spinner$.subscribe(res => this.spinnerStatus = res);
    // right when the component initializes, start reset state and start watching
    this.reset();

  }
  reset() {
    // we'll call this method when we want to start/reset the idle process
    // reset any component state and be sure to call idle.watch()
    this.idle.watch();
    this.idleState = "NOT_IDLE";
    this.countdown = 0;
    //this.lastPing = undefined;
  }

  // @HostListener('window:beforeunload')
  ngOnDestroy() {
    // this.pagedetailsService.saveLastPageInfo();
    this.logTracker.loginfo('AppComponent', 'ngOnDestroy()', 'completed quoteDataService.saveAndExitQuote',
      'QuoteNumber='.concat(this.displayID ));

  }

  @HostListener('window:beforeunload', ['$event'])
  handleBrowserUnload(event: Event) {    
    this.pagedetailsService.saveLastPageInfo();
   event.preventDefault();
    return false;
  }
}
