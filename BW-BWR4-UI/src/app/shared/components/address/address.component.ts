import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { GlobalConstants } from 'src/app/constants/global.constant';
import QuoteSummary from 'src/app/state/model/summary.model';
import { Address } from '../../model/autoquote/autoquote.model';
import { ValidValuesReq } from '../../model/validvalues/validvaluesreq.model';
import { ValidValues, ValidValuesRes } from '../../model/validvalues/validvaluesres.model';
import { zipcodePipe } from '../../pipes/zipcode.pipe';
import { ValidValuesService } from '../../services/validvalues/validvalues.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {

  @Input() addressForm!: UntypedFormGroup;
  @Input() address!: any;
  stateValues!: ValidValues[];
  ratebook!: string;

  constructor(private validValuesService: ValidValuesService, private store: Store<{ quoteSummary: QuoteSummary }>) {
    this.store.select('quoteSummary').subscribe(data => {
      this.ratebook = data.rateBook;

    });
    this.loadValidValues();
   }

  ngOnInit(): void {
    if (Array.isArray(this.address)) {
      this.address = this.address[0];
    }
    const zipcodeFormat = new zipcodePipe();
    this.addressForm?.patchValue({
      address: this.address.streetName,
      city: this.address.city,
      state: this.address.state,
      zipcode: zipcodeFormat.transform(this.address.postalCode),
    });
  }

  /* Handle form errors */
  public hasError = (controlName: string, errorName: string) => {
    return this.addressForm?.controls[controlName]?.hasError(errorName);
  }

  loadValidValues(): void {
    const validvaluesreq: ValidValuesReq = {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.APPLICANT_PAGE_NAME,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: this.ratebook,
      state: GlobalConstants.STATE_ALL_VALID_VALUES,
      dropdownName: GlobalConstants.DROPDOWN_ALL_VALID_VALUES,
      filter:''
    }
    this.validValuesService.getValidValues(validvaluesreq).subscribe(async (data: ValidValuesRes) => {
      await data;
      this.stateValues = data.responseMap.states;
    },
      (error: any) => {
        // console.error('Error occured while invoking Valid Values for Applicant');
      }
    );
  }

}
