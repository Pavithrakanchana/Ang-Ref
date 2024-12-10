import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';

export class PhoneNumberValidator {


    //Phone Number formatting validation
    static phoneValidator(control: AbstractControl) : ValidationErrors | null {
        const phonepattern = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
        if(control.value && control.value.replace(/\D/g, '') === "")
        {
            return {phone: false};
        }
        if ((control.value && !control.value.match(phonepattern) )) {
                    return {phone: true};
        }
        return null;
    }


}
