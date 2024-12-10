import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageDetailsMapping } from '../model/pagedetailsmapping';
import { map } from 'rxjs/operators';
import { GlobalConstants } from '../../constants/global.constant';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { Tracker } from '../utilities/tracker';
import { CommonUtils } from '../utilities/common-utils';
import QuoteSummary from 'src/app/state/model/summary.model';
import { Store } from '@ngrx/store';
import { AutoQuoteData } from '../model/autoquote/autoquote.model';
import { SpinnerStatusService } from './spinner-status.service';
import { Router } from '@angular/router';
import { NavigationService } from './navigation.service';

@Injectable({
  providedIn: 'root'
})
export class PagedetailsService {
   public quoteNumber = '';
  public storeRateBook = '';
  public state = '';
  public autoQuoteData!: AutoQuoteData;
  storeLastVisitedPage!: number;
  public displayID: any = {};
  pageDetailsMappingPath = 'assets/data/pagedetailsmapping.json';
  PAGE_NAME_ARRAY: string[] = ['Applicant','Drivers','Violations', 'Vehicles', 'Coverages', 'Policy Info', 'Rate', 'Reports', 'Application', 'Review', 'Confirmation'];

  constructor(private readonly showSpinnerService: SpinnerStatusService, private httpClient: HttpClient,private store: Store<{ quoteSummary: QuoteSummary }>,
    public quoteDataService: QuoteDataService,
    public navigationService: NavigationService,
  private router: Router,
    private logTracker: Tracker) {
    store.select('quoteSummary').subscribe(data => {
      this.quoteNumber = data.qid;
      this.storeRateBook = data.rateBook;
      this.state = data.policyState;
      this.storeLastVisitedPage = data.lastVistedPage;
      this.displayID = data.quoteNumber;
    });
   }

  getPageNameFromPageNumber(pageNumber: string): Observable<string> {
    return this.httpClient.get<PageDetailsMapping>(this.pageDetailsMappingPath).pipe(
      map((res: PageDetailsMapping) => {
        const pageName = res.PageDetailsConfig.pageConfig?.find((x) => (x.number === pageNumber))?.name || '';
        return pageName;
      })
    );
  }

  getPageNumberFromPageName(pageName: string): Observable<string> {
    return this.httpClient.get<PageDetailsMapping>(this.pageDetailsMappingPath).pipe(
      map((res: PageDetailsMapping) => {
        const pageNumber = res.PageDetailsConfig.pageConfig?.find((x) => (x.name === pageName))?.number || '';
        return pageNumber;
      })
    );
  }


  mapLastSavedPageData(lastVisitedPageOrIndex : string, lastVisitedPageName:string): AutoQuoteData {
      const autoQuoteData = {
      quoteNumber: this.quoteNumber,
      rateBook: this.storeRateBook,
     // masterCompany : this.mco,
      lastVisitedPageOrIndex: lastVisitedPageName+ '-' + lastVisitedPageOrIndex,
      state: this.state,
    };
    this.autoQuoteData = {
      autoQuote: autoQuoteData
    };

    return this.autoQuoteData;
  }


  saveLastPageInfo() {
    /**** save lastvisitedpage value in DB via Mule API call ****/
    // minRouteRuleVal = routingRulesObj.length > 0 ? routingRulesObj?.reduce((a, b) => Math.min(Number(a), Number(b))) : minRouteRuleVal;
    const minRouteRuleVal = this.navigationService.getMinRoute();
    const lastVisitedPageNumber = (minRouteRuleVal !== GlobalConstants.EMPTY_STRING && Number(minRouteRuleVal) < (this.storeLastVisitedPage + 1)) ? minRouteRuleVal : this.storeLastVisitedPage + 1;
    const lastVisitedPageName = this.PAGE_NAME_ARRAY[Number(lastVisitedPageNumber)-1];

    const autoQuoteData = {
        quoteNumber: this.quoteNumber,
        rateBook: this.storeRateBook,
        lastVisitedPageOrIndex: lastVisitedPageName+ '-' + lastVisitedPageNumber?.toString(),
        state: this.state,
      };
      this.autoQuoteData = {
        autoQuote: autoQuoteData
      };
      this.quoteDataService.saveAndExitQuote(this.autoQuoteData, 'saveAndExitQuote').subscribe();
  }
}
