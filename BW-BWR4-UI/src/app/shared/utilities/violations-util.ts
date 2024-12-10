import { GlobalConstants } from "src/app/constants/global.constant";
import { MessageConstants } from "src/app/constants/message.constant";


export class ViolationsUtil {

  constructor() { }

  public static validateMatureDriverViolation(violationRequestObj: any,violationAddData: any, policyEffectiveDate: string): object {
    let isValidMaturedDriver: {violation: boolean, edit:any}= {'violation': false, 'edit':[]};
    let softEdits: string[] = [];
    let occurrenceDate35months: any = [false];

    if (violationRequestObj && violationRequestObj.length > 0) {
      violationRequestObj.forEach((ref: any, j: number) => {
        occurrenceDate35months = [false];
        let violationObj = ref.violations;
        let maturedDriverIndicator = ref.discountIndicators.matureDriverIndicator;
          if (maturedDriverIndicator){
          violationObj.forEach((item: any, i: number) => {
            let displayingDisputeIndicator =  violationAddData[j].listOfViolations[i].dispute;
          if (GlobalConstants.VIOLATION_FILTER_CODES.includes(item.violationCode) && item.operation !== 'delete' && !displayingDisputeIndicator) {
            let pDate = new Date(policyEffectiveDate);
            let occurrenceDate = new Date(item.violationDate);
            let d1Y = pDate.getFullYear();
            let d2Y = occurrenceDate.getFullYear();
            let d1M = pDate.getMonth();
            let d2M = occurrenceDate.getMonth();
            let d1D = pDate.getDate();
            let d2D = occurrenceDate.getDate();
            let monthDiff = (d1M + 12 * d1Y) - (d2M + 12 * d2Y)
            if(monthDiff < 35){
              occurrenceDate35months[i] = true;
           }else if(monthDiff == 35){
              occurrenceDate35months[i] =  (d2D >= d1D) ? true : false;
           }else{
             occurrenceDate35months[i] = false;
          }
         }
        });
        if (occurrenceDate35months.includes(true)) {
          softEdits.push("Driver "+(j+1)+": "+MessageConstants.VIOLATION_OCC_DATE_35YRS);
          isValidMaturedDriver.edit = softEdits;
          isValidMaturedDriver.violation = true;
        }
      }
      });
    }

    return isValidMaturedDriver;
  }
}
