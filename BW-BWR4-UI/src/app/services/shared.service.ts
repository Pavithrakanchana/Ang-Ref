import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GlobalConstants } from '../constants/global.constant';
import { AttributeArray, LookUp, PriorCarriersReq, Value } from '../shared/model/coverages/priorcarriersreq.model';
import { ValidValues } from '../shared/model/validvalues/validvaluesres.model';
import { Store } from '@ngrx/store';
import QuoteSummary from '../state/model/summary.model';
import * as Actions from '../state/actions/summary.action';
import { ActivatedRoute } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class SharedService {
  policyState: any;
  storeLastVisitedPage!: number;
  public displayID: any = {};
  constructor(private httpClient: HttpClient, private store: Store<{ quoteSummary: QuoteSummary }>,
    private route: ActivatedRoute) {
    this.store.select('quoteSummary').subscribe(data => {
      this.storeLastVisitedPage = data.lastVistedPage;
      this.displayID = data.quoteNumber;
    });
  }
  public getStatesByZipcode(zipCode: string): any {
    return this.httpClient.get(`${environment.baseWASUrl}${environment.getStatesByZipcodeURL}`.replace('garageZipCode', zipCode));
  }

  getBWLookUpForPriorCarrier(): Observable<any> {
    const attributearray: AttributeArray[] = [
      {
        name: 'businessType',
        value: 'NewBusiness'
      },
      {
        name: 'policyCompany',
        value: '00'
      },
      {
        name: 'masterCompany',
        value: GlobalConstants.MCO_ALL_VALID_VALUES
      },
      {
        name: 'state',
        value: this.policyState
      },
      {
        name: 'rateBook',
        value: GlobalConstants.RATEBOOK_ALL_VALID_VALUES
      },
      {
        name: 'shortDescriptionIndicator',
        value: true
      }
    ]

    const value: Value = {
      attributes: attributearray
    }

    const lookup: LookUp[] = [
      {
        key: 'priorInsCarrier',
        value: value
      }
    ]


    const priorcarriersReq: PriorCarriersReq = {
      lookup: lookup
    }

    const priorCarrierAPIUrl = `${environment.baseUrl}${environment.bwLookupPriCarAPI}?operation=getPRICARS40X`;
    return this.httpClient.post(priorCarrierAPIUrl, priorcarriersReq);
  }

  mapBWLookUpForPriorCarrier(data: PriorCarriersReq) {
    const priorCarrierValidValObj: ValidValues[] = [];
    let key = '';
    let displayvalue = '';
    data?.lookup?.forEach((lookupObj: LookUp) => {
      lookupObj?.value?.attributes?.forEach((attrObj: AttributeArray) => {
        if (attrObj?.name === 'description') {
          displayvalue = attrObj?.value?.trim();
        }
        if (attrObj?.name === 'code') {
          key = attrObj?.value?.trim();
        }
      });
      priorCarrierValidValObj.push({ key: key, displayvalue: displayvalue });
    });
    return priorCarrierValidValObj;
  }

  updateLastVisitedPage(page: number) {
    if (page > this.storeLastVisitedPage || (page == 6 && this.storeLastVisitedPage > page)) {
      this.store.dispatch(Actions.lastVistedPage({ lastVistedPage: page }));
    }
  }

  getLastVisitedPage() {
    let lastVisitedPage = 0;
    this.store.select('quoteSummary').subscribe(data => {
      lastVisitedPage = data.lastVistedPage;
    })
    return lastVisitedPage;
  }

  getURLQueryParameter() {
    let queryParams;
    this.route.queryParams.subscribe(params => {
      queryParams = params;
    })
    return queryParams;
  }

}
