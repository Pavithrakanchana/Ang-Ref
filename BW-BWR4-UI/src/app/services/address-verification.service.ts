import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { GlobalConstants } from '../constants/global.constant';
import { ScrubAddrReq, AddressCompareObj } from '../shared/model/address/scrubaddrreq.model';
import { ScrubAddrRes } from '../shared/model/address/scrubaddrres.model';
import { Address } from '../shared/model/autoquote/autoquote.model';
import { ObjectUtils } from '../shared/utilities/object-utils';
import { MessageConstants } from 'src/app/constants/message.constant';

@Injectable({
  providedIn: 'root'
})
export class AddressVerificationService {

  addressVerificationAPI = `${environment.addressVerificationAPI}`;

  constructor(private httpClient: HttpClient) { }

  scrubAddress(scrubMailingAddrsReq: ScrubAddrReq): Observable<any> {
    return this.httpClient.post(`${environment.baseWASUrl}${this.addressVerificationAPI}`, scrubMailingAddrsReq);
  }

  public verifyAddress(dbQuoteDataAddress: any, formDataAddress: any): boolean {
    let verify = true;
    // Determine if Address Verification needs to be called during Update Quote by comparing FormData and DBData
    if (!ObjectUtils.isObjectEmpty(dbQuoteDataAddress)) {
     if (!ObjectUtils.isObjectEmpty(dbQuoteDataAddress) && !ObjectUtils.isObjectEmpty(formDataAddress)) {
        verify = ObjectUtils.compareObjects(dbQuoteDataAddress, formDataAddress) === false;
      }
    }
    return verify;
  }

  public checkForAddressErrors(scrubAdressData: ScrubAddrRes[], page:string, elements:any[]): string[] {
    let errors: any = {
      softEdit: [],
      hardEdit: [],
      COR:[]
    };
    scrubAdressData.forEach((addrRes: ScrubAddrRes, index: number) => {
      // Specify error message along with their elements/fields
      let addressCompareObj : AddressCompareObj = {};
      // Specify idenitifier to get their elements/fields
      const eleNameId = this.nameAddressElement(addressCompareObj, page, elements, index)
      addressCompareObj.id = eleNameId.id;
      addressCompareObj.name = eleNameId.name;
      //error result code logic
      const resStatus = addrRes.status;

      if(addrRes.addressResultCode !== 'VLD'){
        if (!GlobalConstants.SCRUB_ADDRESS_COREECTED_ADDRESS_RESULT_CODES.includes(addrRes.addressResultCode) && addrRes.addressResultCode !== "") {
          if( GlobalConstants.SCRUB_ADDRESS_SOFT_EDIT_RESULT_CODES.includes(addrRes.addressResultCode)){
            const messageDesc = (addrRes.addressResultCode === 'STR') ? MessageConstants.SCRUB_ADDRESS_STR_DESC: MessageConstants.SCRUB_ADDRESS_RESULT_DESC;
            errors.softEdit.push( addressCompareObj.name+' : '+messageDesc);
          }else if (addrRes.addressResultCode === 'BZIP' && addrRes.addressResultDescription === MessageConstants.INVALID_ZIP_CODE_2){
            errors.hardEdit.push( addressCompareObj.name+' : '+addrRes.addressResultDescription);
          } else {
            errors.softEdit.push( addressCompareObj.name+' : '+addrRes.addressResultDescription);
          }
        } else if (resStatus === 'SERVICE_FAILURE') {
          errors.hardEdit.push('Address Verification Service Failure')
        }else if(addrRes.addressResultCode === 'COR'){
          addressCompareObj.correctedAddress = addrRes.parsedAddresses[0];
          errors.COR.push(addressCompareObj);
        }
    }
    });
    return errors;
  }

  nameAddressElement(addressCompareObj:any, page:string, elements:any[], index:number){

     // Specify idenitifier to get their elements/fields
     if(page === 'applicant'){
      addressCompareObj.id = elements[index];
      addressCompareObj.name = elements[index];
    }else if(page === 'vehicleGarage') {
      const veh = elements[index];
      addressCompareObj.name =  'Vehicle ' + elements[index].sequenceNumber; //veh.year+' '+ veh.make+' '+veh.model+' '+veh.vehicleType+' Garaging Address';
      addressCompareObj.id = elements[index].sequenceNumber;
    }else if(page === 'lienHolder'){
      addressCompareObj.id  = elements[index];
      addressCompareObj.name = elements[index];
    }
    return addressCompareObj;
  }

  compareScrubAddressWithFormAddress(scrubMailingAddrsReq: any, enteredAddress: any, page: string, elements:any[]) {
    const comparedArrayObj:any = [];
    enteredAddress?.forEach((addressObj: any, index: number) => {
      if(scrubMailingAddrsReq[index].addressResultCode === 'CZIP'){
        let addressCompareObj : AddressCompareObj = {};
        const scrubAddress = scrubMailingAddrsReq[index].parsedAddresses[0];
        if(scrubAddress.fullStreetAddress.trim().toUpperCase() !== addressObj.streetName.trim().toUpperCase() || scrubAddress.city.trim().toUpperCase() !== addressObj.city.trim().toUpperCase() || scrubAddress.state !== addressObj.state || scrubAddress.zipCode !== addressObj.postalCode){
          addressCompareObj.correctedAddress = scrubAddress;
          addressCompareObj.enteredAddress = addressObj;
          addressCompareObj.page = page;
          // Specify idenitifier to get their elements/fields
          const eleNameId = this.nameAddressElement(addressCompareObj, page, elements, index)
          addressCompareObj.id = eleNameId.id;
          addressCompareObj.name = eleNameId.name;
          comparedArrayObj.push(addressCompareObj)
        }
      }
    });

    return comparedArrayObj;
  }

  getAddressScrubbingResult(addresses?: Address[]): Observable<Array<ScrubAddrRes[]>> {
      let addressReqObj:ScrubAddrReq[] = [];
      addresses?.forEach((addressObj: any, index: number) => {
        const scrubMailingAddrsReq: ScrubAddrReq = {
          fullAddress:addressObj.streetName,
          city:addressObj.city,
          state: addressObj.state,
          zip: addressObj.postalCode,
          sourceSystem: GlobalConstants.APPID,
          addressType:addressObj.addressType
        }
        addressReqObj.push(scrubMailingAddrsReq);
      })
    let singleVehicleObservables = addressReqObj.map((addressReqData: ScrubAddrReq, urlIndex: number) => {
    return this.scrubAddress(addressReqData)
    .pipe(map(single => single as any))
    });
    return forkJoin(singleVehicleObservables);
    };
}
