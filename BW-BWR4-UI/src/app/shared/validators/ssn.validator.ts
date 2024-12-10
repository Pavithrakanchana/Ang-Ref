import { AbstractControl, ValidationErrors } from '@angular/forms';

export class SsnValidator {
    // SSN formatting validation
    static ssnValidator(control: AbstractControl): ValidationErrors | null {
        const socialPattern = /(?!000)(?!666)(?!9)[0-9]{3}[ -]?(?!00)[0-9]{2}[ -]?(?!0000)[0-9]{4}/;
        if (control.value === null && control.value === '')
        {
          return {ssn: false};
        }

        if ((control.value && !control.value.match(socialPattern))) {
                    return {ssn: true};
        }

        return null;
    }
}
