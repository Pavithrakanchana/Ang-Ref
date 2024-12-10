import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskinput'
})
export class MaskinputPipe implements PipeTransform {

  transform(inputVal: any, type?: any): any {

    if (!inputVal || !type) { return null; }

    if (type === "SSN") {
      const visibleDigits = 4;
      const maskedSection = inputVal.slice(0, -visibleDigits);
      const visibleSection = inputVal.slice(-visibleDigits);
      return maskedSection.replace(/./g, '*') + visibleSection;
    }


    return inputVal;
  }

}
