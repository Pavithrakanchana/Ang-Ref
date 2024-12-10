import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CaseNumberValidator {
    // SR22FR44 Case Number formatting validation
    static casenumberValidator(control: AbstractControl): ValidationErrors | null {
        const validPattern = /^[X0-9]([0-9]){8}$/;
        const repeatNumPattern = /(\d)\1{8}/;
        const consecutiveNumPattern = /^123456789$/;
        const x = control.value.match(repeatNumPattern);
        const y = control.value.match(validPattern);
        const z = control.value.match(consecutiveNumPattern);
        if (control.value === null && control.value === ''){
          return {casenumber: false};
        }
        if ((control.value && !control.value.match(validPattern))) {
          return {casenumber: false};
        }else if (control.value && control.value.match(repeatNumPattern)) {
          return {casenumber: true};
        }else if (control.value && control.value.match(consecutiveNumPattern)) {
          return {casenumber: true};
        }
        return null;
    }
}
