import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'zipcode'
})
export class zipcodePipe implements PipeTransform {

  transform(inputVal: any): any {

    if (!inputVal) { return null; }
    else {
      inputVal = inputVal.replace(/-/g, '');
      if (inputVal.toString().length == 9) {
        return inputVal.substr(0, 5) + '-' + inputVal.substr(5, 4);
      }
      else {
        return inputVal;
      }
    }

  }

}
