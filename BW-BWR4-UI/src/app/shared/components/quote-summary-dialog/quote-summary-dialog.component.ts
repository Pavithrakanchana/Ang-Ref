import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { forkJoin, Observable } from 'rxjs';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { addDriver, addQuoteNumber, addVehicle } from 'src/app/state/actions/summary.action';
import QuoteSummary, { DriverSummary, VehicleSummary } from 'src/app/state/model/summary.model';
import { selectQuoteSummary } from 'src/app/state/selectors/summary.selector';
import { AutoQuoteData } from '../../model/autoquote/autoquote.model';
import { ValidValues } from '../../model/validvalues/validvaluesres.model';
import { MessagesService } from '../../services/messages.service';
import { SpinnerStatusService } from '../../services/spinner-status.service';
import { ValidValuesService } from '../../services/validvalues/validvalues.service';
import { ObjectUtils } from '../../utilities/object-utils';
import { DriversComponent} from 'src/app/components/auto-quote/drivers/drivers.component';

@Component({
  selector: 'app-quote-summary-dialog',
  templateUrl: './quote-summary-dialog.component.html',
  styleUrls: ['./quote-summary-dialog.component.scss']
})
export class QuoteSummaryDialogComponent implements OnInit {
  
  quoteSummary$!: Observable<QuoteSummary>;
  quoteNumber!: string;
  policyState!: string;
  ratebook!: string;
  mco!: string;
  viewQuoteData!: AutoQuoteData;
  quoteNumDisplayID!: string;
  appliedPolicyDiscounts: string[] = []; //TODO: remove this one actual
  eligibleDiscounts!: ValidValues[];
  filteredEligibleDiscount!: ValidValues[];
  hasDrivers = false;
  hasVehicles = false;
  hasAppliedDiscounts = false;
  excludeEligibleDiscount = [];  
  dob: any;

  constructor(private store: Store<{ quoteSummary: QuoteSummary }>,
    public quoteDataService: QuoteDataService, public validValuesService: ValidValuesService,
    private showSpinnerService: SpinnerStatusService, private readonly messageservice: MessagesService, public DriverComp :DriversComponent
   ) {
    // console.log('read quote number');
    // this.quoteSummary$ = this.store.pipe(select(selectQuoteSummary));

    this.store.select('quoteSummary').subscribe((data: QuoteSummary) => {
      this.quoteNumber = data?.qid;
      this.mco = data?.mco;
      this.policyState = data.policyState;
      this.ratebook = data.rateBook;
      this.eligibleDiscounts = data?.eligibleDiscounts;
      this.policyState = data?.policyState
    });
  }

  ngOnInit(): void {
    let quoteID = JSON.stringify(this.quoteNumber)
    quoteID = quoteID?.replace(/"/g, '');
    this.quoteNumDisplayID = quoteID?.slice(0, 3) + '-' + quoteID?.slice(3, 10) + '-' + quoteID?.slice(10, 12);

    let quoteSummaryObservables: Observable<any>[] = new Array();
    quoteSummaryObservables.push(this.quoteDataService.retrieveQuote(quoteID, 'getViewSummary', this.policyState, this.ratebook))


    this.showSpinnerService.showSpinner(true);

    forkJoin(quoteSummaryObservables).subscribe(results => {
      if (!ObjectUtils.isObjectEmpty(results[0])) {
        this.viewQuoteData = results[0];
        this.hasDrivers = results[0].autoQuote?.personalAuto?.drivers?.length > 0;
        this.hasVehicles = results[0].autoQuote?.personalAuto?.vehicles?.length > 0;
        this.hasAppliedDiscounts = results[0].autoQuote?.appliedPolicyDiscounts?.length > 0;
        let dob = '';
        this.filteredEligibleDiscount =  this.eligibleDiscounts.filter(edisc => !results[0]?.autoQuote?.appliedPolicyDiscounts?.some((ad: { code: string; }) => edisc.key === ad.code));
        /*if(this.hasDrivers){
          for(var index in results[0].autoQuote?.personalAuto?.drivers){
            dob = results[0].autoQuote?.personalAuto?.drivers[index].birthDate;
            var age = this.DriverComp.calculateAge(dob);
            if(age>55){
              this.filteredEligibleDiscount =  this.filteredEligibleDiscount;
              break;
            }else{
              this.filteredEligibleDiscount = this.filteredEligibleDiscount.filter((item) => {
                  return item.key !== 'MD';
                  });
            }
          }
        }else{
          this.filteredEligibleDiscount = this.eligibleDiscounts.filter((item) => {
            return item.key !== 'MD';
            });
        }*/
      }

      this.showSpinnerService.showSpinner(false);
    },
      (errorData: any) => {
        this.filteredEligibleDiscount = this.eligibleDiscounts;
        this.errorHandler(errorData);


      });
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

}
