import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';

export class ZipCodeValidator {


    //Phone Number formattingzipcodeValidator validation
    static zipcodeValidator(control: AbstractControl) : ValidationErrors | null {
        const zipcodepattern = /^[0-9\-]*$/;
       let enteredValue= control.value?.trim();
        if (enteredValue && Number(enteredValue.replace(/\-/g , '')) === 0) {
          return {zipcode: false};
        }
        if (enteredValue && Number(enteredValue.replace(/\-/g , '').length<5)) {
            return {zipcode: false};
        }
        if ((enteredValue && enteredValue.length>6 && enteredValue.length<10)) {
            return {zipcode: false};
        }
        if ((enteredValue && !enteredValue.match(zipcodepattern))) {
            return {zipcode: true};
        }
        return null;
    }
}
