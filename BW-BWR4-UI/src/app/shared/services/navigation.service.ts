import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import QuoteSummary from 'src/app/state/model/summary.model';
import { RoutingRules} from '../model/routing-rules.model';
import { GlobalConstants } from '../../constants/global.constant';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { Tracker } from '../utilities/tracker';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
storeLastVisitedPage!: number;
  public quoteNumber: any ;
  private navigationRequestedRoute = new BehaviorSubject('');
  navigationStepObv = this.navigationRequestedRoute.asObservable();

  private navigationRequiredRoutes = new BehaviorSubject<any[]>([]);
  navigationStepOverrideObv = this.navigationRequiredRoutes.asObservable();

  routingRules!: RoutingRules;

  constructor(@Inject(DOCUMENT) readonly document: Document, private store: Store<{ quoteSummary: QuoteSummary }>,
    public quoteDataService: QuoteDataService,
    private router: Router,
    private logTracker: Tracker) {
    this.store.select('quoteSummary').subscribe(data => {
      this.routingRules = data.routingRules;
      this.storeLastVisitedPage = data.lastVistedPage;
      let qid = JSON.stringify(data.qid);
      this.quoteNumber = qid.replace(/"/g, '');
    });
  }

  updateNavigationRequestedRoute(route: string){
    // console.log('NavigationService -> updateNavigationRequestedRoute -> ', route);
    this.navigationRequestedRoute.next(route);
  }

  currentWindow(): Window {
    return document.defaultView || window;
  }

  addRequiredRoutes = (navigationRules: string[]): void => {

    const existingRoutes = this.navigationRequiredRoutes.value;

    this.navigationRequiredRoutes.next([...new Set([...existingRoutes, ...navigationRules])].sort((a,b)=> a - b) );

  }

  removeRequiredRoute = (routeIndex: string): void => {
    this.navigationRequiredRoutes.next(this.navigationRequiredRoutes.value.filter(route => route !== routeIndex));
  }

  routeMessage = (routeIndex: string, navigationRules: RoutingRules): string => {

    const messages = navigationRules.messages;

    const msg =  messages?.filter(rule =>  rule.routeIndex === routeIndex);

    return msg!=null ? msg[0]?.message: '';
  }

  actionBasedRoutes = (actionName: string): string[] => {

    const routingRule = this.routingRules.routes?.filter(rule => rule.code === actionName)[0];

    // console.log('Action: ', actionName, '  and required routes: ', routingRule?.routes);

    return routingRule?.routes || [];
  }

  showRoutes(): void {
    // console.log('Routes Added to the list for stepper ==> ', this.navigationRequiredRoutes.value);
  }

  getRoutes(): string[] {
    return this.navigationRequiredRoutes.value;
  }

  getMinRoute(): string {
    const minRoute = this.navigationRequiredRoutes.value && this.navigationRequiredRoutes.value.length > 0 ? this.navigationRequiredRoutes.value[0] : GlobalConstants.EMPTY_STRING;
    return minRoute;
  }

  removeRuleOnNext(currentPage: number): void {
    const routingRules = this.navigationRequiredRoutes.value;
    const minRouteRuleVal = routingRules.length > 0 ? routingRules?.reduce((a, b) => Math.min(Number(a), Number(b))) : -1;
    const currentPageIndex = (currentPage + 1).toString();
    if (minRouteRuleVal != -1 && minRouteRuleVal.toString() === currentPageIndex) {
      this.removeRequiredRoute(currentPageIndex);
    }
  }

  getNextRoutingRule(currentPageLink:any): void {
    let routeObj = {
      routeLink: GlobalConstants.EMPTY_STRING,
      routeMessage: GlobalConstants.EMPTY_STRING
    };
    const currentPageIndex = GlobalConstants.PAGE_URLS.findIndex((val) => val === currentPageLink);
    const routingRules = this.navigationRequiredRoutes.value;
    const minRouteRuleVal = routingRules.length > 0 ? routingRules?.reduce((a, b) => Math.min(Number(a), Number(b))) : -1;
    if (minRouteRuleVal != undefined && minRouteRuleVal != -1 && currentPageIndex >= (minRouteRuleVal - 1)) {
      routeObj.routeLink = GlobalConstants.PAGE_URLS[minRouteRuleVal - 1];
      routeObj.routeMessage = minRouteRuleVal?.toString();
      this.removeRequiredRoute(minRouteRuleVal?.toString());
    };
    if (currentPageLink === '/exit') {
      window.parent.close();
    } else {
      currentPageLink = (routeObj?.routeLink !== GlobalConstants.EMPTY_STRING) ? routeObj?.routeLink : currentPageLink;
      this.router.navigateByUrl(currentPageLink.concat('?qid='+ this.quoteNumber +'&m=' + routeObj?.routeMessage));
    }
    
  }



}
