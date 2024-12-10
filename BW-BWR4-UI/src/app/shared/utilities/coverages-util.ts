import { GlobalConstants } from "src/app/constants/global.constant";
import { Coverage } from "../model/autoquote/autoquote.model";
import { ValidvaluesCommon, ValuePair } from "../model/validvalues/validvaluescommonres";
import { ObjectUtils } from "./object-utils";

export interface CoverageAbstract {
  code: string;
  description: string;
  value: string;
  amount: string;
  type: string;
}

export class CoveragesUtil {
  constructor() { }

  public static prepareCoverageAbstract(riskState: any, vvtCoverages: ValidvaluesCommon[], dbCoverages: Coverage[], discountIndicators: any[], antiTheftRequired: any): CoverageAbstract[] {
    // console.log("vvtCoverages", vvtCoverages, dbCoverages, discountIndicators, antiTheftRequired)

    let coverageAbstract: CoverageAbstract[] = [];
    let dbpipCode:string;
    let _underinsuredmotoristSelection:string = "";
    let _INCLDisplayValue:string = "";
    dbCoverages.forEach(coverage => {
      if(coverage.code === 'BPIP' && coverage.limits !== ""){
        dbpipCode = 'BPIP'
      }else if (coverage.code === 'EPIP' && coverage.limits !== ""){
        dbpipCode = 'EPIP'
      }
      else if(coverage.code === 'UMPD' && coverage.type !== ""){
        if(riskState === GlobalConstants.STATE_VA){
        _underinsuredmotoristSelection  = coverage.type === undefined || coverage.type === null? '': coverage.type;
        }
      }
      else if(coverage.code === 'INCL'){
        if(riskState === GlobalConstants.STATE_VA){
          _INCLDisplayValue = coverage.type === undefined || coverage.type === null || coverage.limits === ""? 'No': "Yes";
        }
      }
    })

    vvtCoverages.forEach(coverage => {
      
      const covObj = dbCoverages.find((cov: { code: string }) => coverage.code === cov.code || cov.code === 'OTC0GD');
      const limitOrDeduct = !ObjectUtils.isFieldEmpty(covObj?.limits?.trim()) ? covObj?.limits : (covObj?.code === 'OTC' || covObj?.code === 'OTC0GD') ? (Number(covObj?.deductible) + '' + covObj?.code) : Number(covObj?.deductible) + '';

      if (coverage.code === 'antiTheftCode') {
        const antitheftDBValue = discountIndicators?.find((x: { code: string; }) => x.code === 'antiTheftCode')?.value || '-'
        if(antiTheftRequired){
          coverageAbstract.push(
            {
              code: coverage.code,
              description: coverage.description,
              value: coverage.values.find(valuepair => valuepair.key === antitheftDBValue)?.displayvalue || 'None',
              amount: '0',
              type: ''
            }
          )
        }
      }else if(coverage.code === 'PIP'){
        if(riskState===GlobalConstants.STATE_FL){

        
        const coverageObj = dbCoverages.find((cov: { code: string }) => cov.code === dbpipCode);
        const limitOrDeductible = dbCoverages?.find((x: { code: string; }) => x.code === dbpipCode)?.limits || '';
        let pipVal='';
        if (limitOrDeductible){
          if (coverageObj?.code.substring(0, 1) == "B" && limitOrDeductible?.substring(3, 4) == "I") {
            pipVal = "BWLI"
          } else if (coverageObj?.code.substring(0, 1) == "B" && limitOrDeductible?.substring(3, 4) == "E") {
            pipVal = "BWLE"
          }else if (coverageObj?.code.substring(0, 1) == "E" && limitOrDeductible?.substring(3, 4) == "I") {
            pipVal = "EWLI"
          } else if (coverageObj?.code.substring(0, 1) == "E" && limitOrDeductible?.substring(3, 4) == "E") {
            pipVal = "EWLE"
          }
        }
          coverageAbstract.push(
            {
              code: coverage.code,
              description: coverage.description,
              value: this.findCoverageValue(pipVal || 'None', coverage.values),
              amount: '0',
              type: ''
            })
          }
          else{
            const pipVal = dbCoverages?.find((x: { code: string; }) => x.code === coverage.code)?.limits || '';
            coverageAbstract.push(
              {
                code: coverage.code,
                description: coverage.description,
                value: this.findCoverageValue(pipVal || 'None', coverage.values),
                amount: '0',
                type: ''
              })
          }
        }else if(coverage.code === 'PIPI'){
        const limitOrDeductible = dbCoverages?.find((x: { code: string; }) => x.code === dbpipCode)?.limits || '';
        let pipiVal='';
        if (limitOrDeductible){
          
          if (limitOrDeductible.substring(4) == "N") {
            pipiVal = "NIO"
          } else{
            pipiVal = "NIRR"
          }
        }
          coverageAbstract.push(
            {
              code: coverage.code,
              description: coverage.description,
              value: this.findCoverageValue(pipiVal || 'None', coverage.values),
              amount: '0',
              type: ''
            })
        
      }else if(coverage.code === 'PIPD'){
        const coverageObj = dbCoverages.find((cov: { code: string }) => cov.code === dbpipCode);
        const limitOrDeductible = dbCoverages?.find((x: { code: string; }) => x.code === dbpipCode)?.limits || '';
        let pipdVal;
        if (limitOrDeductible){
        pipdVal = coverageObj?.deductible?.slice(0,-3);
        pipdVal = pipdVal === ''? '0' : pipdVal;
        }
        coverageAbstract.push(
            {
              code: coverage.code,
              description: coverage.description,
              value: this.findCoverageValue(pipdVal || 'None', coverage.values),
              amount: '0',
              type: ''
            })
        
      } else if(coverage.code == "UMS"){
        coverageAbstract.push(
          {
            code: coverage.code,
            description: coverage.description,
            value: _underinsuredmotoristSelection,
            amount: '0',
            type: ''
          })
      } else if(coverage.code == "INCL"){
        coverageAbstract.push(
          {
            code: coverage.code,
            description: coverage.description,
            value: _INCLDisplayValue,
            amount: '0',
            type: ''
          })
      }
      else {
        console.log(this.findCoverageValue(limitOrDeduct || 'None', coverage.values), "=============");
        
        coverageAbstract.push(
          {
            code: coverage.code,
            description: coverage.description,
            value: this.findCoverageValue(limitOrDeduct || 'None', coverage.values),
            amount: '0',
            type: ''
          }
        )
      }
    });

    return coverageAbstract;
  }

  public static findCoverageValue(dbCovValue: string, vvtCovValues: ValuePair[]): string {

    return vvtCovValues.find(valuepair => valuepair.key === dbCovValue)?.displayvalue || 'No Coverage';

  }
}
