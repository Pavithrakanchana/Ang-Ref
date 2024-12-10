import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone'
})
export class phonePipe implements PipeTransform {

  transform(inputVal: any): any {
    
    if (!inputVal) { return null; }
    
    return inputVal.substr(0, 3) + '-' + inputVal.substr(3, 3) + '-' + inputVal.substr(6, 4);
            
  }

}
