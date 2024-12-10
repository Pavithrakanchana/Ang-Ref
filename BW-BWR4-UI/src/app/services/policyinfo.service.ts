import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DropDown } from '../shared/model/dropdown-values';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class PolicyinfoService {

  private additionalDrivers: any = undefined;
  constructor(private httpClient: HttpClient) { 
    
  }

  setAdditionalDrivers(data: any): void {
    this.additionalDrivers = data;
  }
  getAdditionalDrivers(): any {
    return this.additionalDrivers;
  }
  getPrimaryResidency(): Observable<DropDown[]> {
    const primaryResidencyValues = [
      { value: 'H', viewValue: 'Own Home/Condo' },
      { value: 'M', viewValue: 'Own Mobile Home' },
      { value: 'O', viewValue: 'Other' },
      { value: 'R', viewValue: 'Rent' }
    ];
    return of(primaryResidencyValues);
  }

  getMultiPolicyDiscount(): Observable<DropDown[]> {
    const multiPolicyDiscountValues = [
      { value: 'N', viewValue: 'None' },
      { value: 'HO3', viewValue: 'Farmers Home (HO-3 only)' },
      { value: 'HO3O', viewValue: 'Farmers Home (HO-3 only) + Other' },
      { value: 'FHO3', viewValue: 'Foremost Choice Home (HO-3 only)' },
      { value: 'FHO3O', viewValue: 'Foremost Choice Home (HO-3 only) + Other' },
      { value: 'MH', viewValue: 'Mobile Home' },
      { value: 'MHO', viewValue: 'Mobile Home + Other' },
      { value: 'O', viewValue: 'Other' }
    ];

    return of(multiPolicyDiscountValues);
  }

  getEft(): Observable<DropDown[]> {
    const eftValuesValues = [
      { value: 'N', viewValue: 'No' },
      { value: 'CS', viewValue: 'Checking/Savings' },
      { value: 'D', viewValue: 'Debit Card' },
      { value: 'C', viewValue: 'Credit Card' }
    ];
    return of(eftValuesValues);
  }

  getDownPayments(): Observable<DropDown[]> {
    const downPaymentValues = [
      { value: 'PS', viewValue: 'Producer Sweep' },
      { value: 'CS', viewValue: 'Checking/Savings' },
      { value: 'D', viewValue: 'Debit Card' },
      { value: 'C', viewValue: 'Credit Card' }
    ];
    return of(downPaymentValues);
  }

  getDriverAction(): Observable<DropDown[]> {
    const driverActionValues = [
      { value: 'NA', viewValue: 'Do Not Add' },
      { value: 'R', viewValue: 'Add as Rated Driver' },
      { value: 'E', viewValue: 'Add as Excluded Driver' }
    ];
    return of(driverActionValues);
  }

  getDriverExplanation(): Observable<DropDown[]> {
    const driverExplanationValues = [
      { value: 'L', viewValue: 'Driver Already Listed' },
      { value: 'OO', viewValue: 'Moved Out of Household' },
      { value: 'U', viewValue: 'Unknown Person - Not in Household' },
      { value: 'K', viewValue: 'Known Person - Never lived in Household' },
      { value: 'D', viewValue: 'Deceased' }
    ];
    return of(driverExplanationValues);
  }

  
}
