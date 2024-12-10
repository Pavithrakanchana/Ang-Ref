import { Injectable } from '@angular/core';
import { ObjectUtils } from '../shared/utilities/object-utils';
import { CommonUtils } from '../shared/utilities/common-utils';
import { GlobalConstants } from '../constants/global.constant';
import { VehiclesService } from './vehicles.service';
import { QuoteDataMapper } from '../shared/utilities/quotedata-mapper';
import { Store } from '@ngrx/store';
import QuoteSummary, { Coverage } from '../state/model/summary.model';

@Injectable({
  providedIn: 'root'
})
export class RatesService {

  applicantNonoOwner: any;
  policyState: any;


  constructor(private vehiclesService : VehiclesService,
              private quoteDataMapper : QuoteDataMapper,
              private store: Store<{ quoteSummary: QuoteSummary }>) { }

              ngOnInit(): void {
                this.store.select('quoteSummary').subscribe(data => {
                  this.applicantNonoOwner = data.nonOwner;
                  this.policyState = data.policyState;
                });
              }

  comparePolicyCoverages(formData: any, policyCoverages: any, policyState: any){
    let policyResult: any;
    let modifiedCoverages: any;
    
    if(policyState === GlobalConstants.STATE_PA) {
      let umunstVal = formData?.value?.UMUNST;
      let uimunsVal = formData?.value?.UIMUNS;
      let dbUmstVal = policyCoverages.filter((x: any) => x.code === 'UMST');
      let dbUimstVal = policyCoverages.filter((x: any) => x.code === 'UIMST');
      if(umunstVal !== 'None' || uimunsVal !== 'None') {
        if(umunstVal.includes('S') && dbUmstVal[0].limits !== '' && umunstVal === dbUmstVal[0].limits+'S') {
          let umunstCov: Coverage = {
            code: 'UMUNST',
            deductible: '',
            limits: umunstVal,
            symbols: ''
          }
          let itemIndex = policyCoverages.findIndex((cov:any) => cov.code === 'UMUNST');
          policyCoverages[itemIndex] = umunstCov;
          modifiedCoverages = policyCoverages.filter((cov: any) => cov?.code !== 'UMST' && cov.code !== 'UIMST');
        } else {
        modifiedCoverages = policyCoverages.filter((cov: any) => cov?.code !== 'UIMST' && cov?.code !== 'UMST');
      }
        if(uimunsVal.includes('S') && dbUimstVal[0].limits !== '' && uimunsVal === dbUimstVal[0].limits+'S') {
          let uimunsCov: Coverage = {
            code: 'UIMUNS',
            deductible: '',
            limits: uimunsVal,
            symbols: ''
          }
          let itemIndex = policyCoverages.findIndex((cov:any) => cov.code === 'UIMUNS');
          policyCoverages[itemIndex] = uimunsCov;
          modifiedCoverages = policyCoverages.filter((cov: any) => cov?.code !== 'UIMST' && cov?.code !== 'UMST');
        } else {
        modifiedCoverages = policyCoverages.filter((cov: any) => cov?.code !== 'UIMST' && cov?.code !== 'UMST');
      }
    }
  } else {
    modifiedCoverages = policyCoverages;
  }
     // Determine if Reaclculate/RateQuote POST call needs to be called by comparing FormData and DBData of policyCoverages and VehicleCoverages
    // Policy Coverages
    
    if (!ObjectUtils.isObjectEmpty(modifiedCoverages)) {
      policyResult = modifiedCoverages?.filter((val:any) =>{
            // console.log('formData.controls[val.code]?.value:'+formData.controls[val.code]?.value);
            // console.log('val.code:'+val.code);
            let dbPolCovVal =  val.limits;
             const formPolicyCovVal = (formData.controls[val.code]?.value === undefined || formData.controls[val.code]?.value ==='000' || formData.controls[val.code]?.value === 'None' ) ? '000/000' : formData.controls[val.code]?.value;
             dbPolCovVal = (dbPolCovVal === '' || !dbPolCovVal ) ? '000/000' : dbPolCovVal;
            //  console.log('formPolicyCovVal:'+formPolicyCovVal);
            //  console.log('dbPolCovVal:'+dbPolCovVal);

             return (formPolicyCovVal !== dbPolCovVal);
      });
    }

    return (policyResult?.length > 0) ? true : false;
  }
  compareVehicleCoverages(formData: any, vehicles: any){


    let finalResult = false;;
    // Determine if Reaclculate/RateQuote POST call needs to be called by comparing FormData and DBData of policyCoverages and VehicleCoverages

    //Vehicle Coverages
    if(!ObjectUtils.isObjectEmpty(vehicles)){
      vehicles?.forEach((vehsObj:any, index:number) => {
        const antitheftDBValue = vehsObj.discountIndicators?.find((x: { code: string; }) => x.code === 'antiTheftCode')?.value || '-'
        let vehiclesResult: any;
        const vehiclesFormData = formData.controls.vehicles.value;
        const vehData = vehiclesFormData[index];

        let vehicleCovObj = this.vehiclesService.loadVehicleCoverages(vehsObj?.vehiclesCoverages);
        vehiclesResult = vehsObj?.vehiclesCoverages?.filter((obj:any) =>{
          let covCode = obj.code;
          if( covCode === 'OTC0GD'){
            covCode = 'OTC';
          }
          let formVehCovVal = vehData[covCode];
          let dbCovVal = vehicleCovObj[covCode];
          return dbCovVal !== formVehCovVal;
        });
        if((vehiclesResult.length > 0 && !finalResult) || (antitheftDBValue !== vehData['antiTheftCode'])){
          finalResult = true;
        }

      })
    }
    return finalResult;
  }
}
