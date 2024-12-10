import { Directive, ElementRef, HostListener, Inject, LOCALE_ID } from '@angular/core';
@Directive({
  selector: '[appDateformatter]'
})
export class DateformatterDirective {
  constructor(private el: ElementRef) {}

  @HostListener("keyup", ["$event"])
  onKeyup(e: any) {
    let keyCode : number;
    if (e.keyCode != 8 )
      this.el.nativeElement.value = this.formatDate(e.target.value);
  }

  @HostListener("focus", ["$event"])
  onFocus(e: any) {
      let bwrDateString : string;

      if (e.target.value != '' && e.target.value != undefined) {
        let dateArr : any [];
        dateArr = e.target.value.split('/');
        dateArr[0] = (dateArr[0]?.length < 2  )?('0' + dateArr[0]?.slice(-2)) : dateArr[0];
        dateArr[1] = (dateArr[1]?.length < 2  )?('0' + dateArr[1]?.slice(-2)) : dateArr[1];
        bwrDateString = (dateArr[0] + '/' + dateArr[1] + '/' + dateArr[2] );
        this.el.nativeElement.value = this.formatDate(bwrDateString);
      }
  }

  formatDateString(originalString: string, newString: any, index: any) {
    return originalString.slice(0, index) + newString + originalString.slice(index);
  }

  formatDate(dateString: string) {
    let cleanDate = dateString.replace(/\D/g, ''); // Removes all non-numeric characters
    let output = cleanDate.slice(0, 8); // Limit to 8 digits
    const size = dateString.length;
    if (size > 4)
      output = this.formatDateString(output, '/', 4);

    if (size > 2)
      output = this.formatDateString(output, '/', 2);

    return output;
  }
}




