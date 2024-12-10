import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ssn'
})
export class ssnPipe implements PipeTransform {

  transform(inputVal: any): any {
    
    if (!inputVal) { return null; }
    
    return inputVal.substr(0, 3) + '-' + inputVal.substr(3, 2) + '-' + inputVal.substr(5, 4);
            
  }

}
