
import { Store } from '@ngrx/store';
import QuoteSummary from 'src/app/state/model/summary.model';
import { VinPrefixReq } from '../model/vehicles/vin-prefix-req.model';
import { VinPrefixRes } from '../model/vehicles/vin-prefixes.model';


export class VintelligenceSymbolsMapper {
  public quoteNumber = '';
  public mco = '';

  constructor(store: Store<{ quoteSummary: QuoteSummary }>) {
    store.select('quoteSummary').subscribe(data => {
      this.quoteNumber = data.qid;
      this.mco = data.mco;
    });
  }


  /* Utility function to map VINPrefix method request to VINTellignec service API */
  //mapVINPrefixRequestData(make: string, year: string, model: string): VinPrefixReq {
  // }

  /* Utility function to map VINPrefix method response from VINTellignec service API */
  // mapVINPrefixResponseData(vinPrefixResponse: string): VinPrefixRes {
  // }
}
