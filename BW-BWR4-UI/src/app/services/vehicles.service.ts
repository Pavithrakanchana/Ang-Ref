import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { GlobalConstants } from '../constants/global.constant';
import { CommonUtils } from '../shared/utilities/common-utils';
import QuoteSummary from '../state/model/summary.model';

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {

  policyState:any;
  umpdVal: any;
  umpdCOVal:any;
  umpdILVal:any;
  umpdOHVal: any;

  constructor(private store: Store<{ quoteSummary: QuoteSummary }>) {
    this.store.select('quoteSummary').subscribe(data => {
      this.policyState = data.policyState;
    });
   }

   umpdBasedOnState(): void {
    if(this.policyState === GlobalConstants.STATE_IL) {
      this.umpdVal =  this.umpdILVal;
    }else if(this.policyState === GlobalConstants.STATE_OH) {
      this.umpdVal =  this.umpdOHVal;
    }
    else if(this.policyState === GlobalConstants.STATE_CO) {
      this.umpdVal = (CommonUtils.toInteger(this.umpdCOVal)?.toString() !== '0' && this.umpdCOVal !=='' && !isNaN(+this.umpdCOVal)) ? CommonUtils.toInteger(this.umpdCOVal)?.toString() : GlobalConstants.NONE;
      //this.umpdVal = (this.umpdCOVal !== '0' && !isNaN(+this.umpdVal)) ? CommonUtils.toInteger(this.umpdVal).toString() : GlobalConstants.NONE;
    }
    return this.umpdVal;
   }

  loadVehicleCoverages(coverages:any) {
      const compCode =coverages?.find((x: { code: string; }) => (x.code === 'OTC' || x.code === 'OTC0GD'))?.code || GlobalConstants.NONE;
      const compVal =coverages?.find((x: { code: string; }) => (x.code === 'OTC' || x.code === 'OTC0GD'))?.deductible || GlobalConstants.NONE;

      const collVal =coverages?.find((x: { code: string; }) => x.code === 'COL')?.deductible || GlobalConstants.NONE;
      const additionalEquipVal =coverages?.find((x: { code: string; }) => x.code === 'CEQ')?.limits || GlobalConstants.NONE;
      if(this.policyState === GlobalConstants.STATE_IL) {
       this.umpdILVal =coverages?.find((x: { code: string; }) => x.code === 'UMPD')?.limits || '000';
      }
      if(this.policyState === GlobalConstants.STATE_OH) {
        this.umpdOHVal =coverages?.find((x: { code: string; }) => x.code === 'UMPD')?.limits || GlobalConstants.NONE;
       }
      if(this.policyState === GlobalConstants.STATE_CO) {
         this.umpdCOVal =coverages?.find((x: { code: string; }) => x.code === 'UMPD')?.deductible || GlobalConstants.NONE;
        }
      const rentalVal =coverages?.find((x: { code: string; }) => x.code === 'EXTR')?.limits || GlobalConstants.NONE;
      const loanLeaseVal =coverages?.find((x: { code: string; }) => x.code === 'ALL')?.limits;
      const roadSideVal =coverages?.find((x: { code: string; }) => x.code === 'RA')?.limits;
      let vehicleCoverageObj: any = {
        OTC:  (compVal !== '0' && !isNaN(+compVal)) ? CommonUtils.toInteger(compVal).toString() + compCode : GlobalConstants.NONE,
        COL: (collVal !== '0' && !isNaN(+collVal)) ? CommonUtils.toInteger(collVal).toString() : GlobalConstants.NONE,
        CEQ: additionalEquipVal,
        UMPD:this.umpdBasedOnState(),
        EXTR: rentalVal === GlobalConstants.EMPTY_STRING ? GlobalConstants.NONE : rentalVal,
        ALL: loanLeaseVal === GlobalConstants.EMPTY_STRING ? 'N' : loanLeaseVal,
        RA: roadSideVal === GlobalConstants.EMPTY_STRING ? 'N' : roadSideVal
      }
      return vehicleCoverageObj;
    }

    setUMPDDefaultVal(): string{
      if(this.policyState === GlobalConstants.STATE_IL)
      {
        return GlobalConstants.EMPTY_VALUE;
      }
      if(this.policyState === GlobalConstants.STATE_CO)
      {
        return GlobalConstants.NONE;
      }
      if(this.policyState === GlobalConstants.STATE_OH)
      {
        return GlobalConstants.NONE;
      }
      return GlobalConstants.EMPTY_VALUE;
    }
}
