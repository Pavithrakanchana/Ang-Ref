import { DatePipe } from "@angular/common";
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";

export class CommonUtils {

    constructor() {}

    public static scrollToTop() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    public static updateControlValidation(fControl: AbstractControl, isRequired: boolean) {
        if (isRequired) {
          fControl.setValidators([Validators.required]);
        } else {
          fControl.setValidators([]);
        }
        fControl.updateValueAndValidity();
    }


    public static amountPayValidator(validationType: string): ValidatorFn {
      return (control: AbstractControl): ValidationErrors => {
         //  return validate === true ?  {"amountLess" : true} : null;
         return validationType === 'amountLess' ?  { amountLessError : true} : { amountPIFError : true};
      };
    }

    public static lrtrim(x: string): string {
        return x ? x.replace(/^\s+|\s+$/gm, '') : '';
      }

      // this will remove whole whitespace from the string
      public static trim_all_spaces(x: string): string {
        return x ? x.replace(/\s/g, '') : '';
      }

    public static removewhitespaces(name: string): string {
        if (name !== null) {
          const re = /\ /gi;
          return name.replace(re, '');
        }

        return name;

    }

    public static padNumber(value: number): string {
        if (this.isNumber(value)) {
            return `0${value}`.slice(-2);
        } else {
            return '';
        }
    }

    public static isNumber(value: any): boolean {
        return !isNaN(this.toInteger(value));
    }

    public static toInteger(value: any): number {
      if (value === undefined || value === '') {
        return 0;
      }

      return parseInt(`${value}`, 10);
    }

    public static elapsedTime(startTime: Date): number {
      let endTime = new Date();
      return (endTime.getTime() - startTime.getTime()) / 1000;
    }

    public static base64toBlob (base64Data:any, contentType:any) {
      contentType = contentType || '';
      const sliceSize = 1024;
      const byteCharacters = atob(base64Data);
      const bytesLength = byteCharacters.length;
      const slicesCount = Math.ceil(bytesLength / sliceSize);
      const byteArrays = new Array(slicesCount);

      for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        const begin = sliceIndex * sliceSize;
        const end = Math.min(begin + sliceSize, bytesLength);

        const bytes = new Array(end - begin);
          for (let offset = begin, i = 0 ; offset < end; ++i, ++offset) {
              bytes[i] = byteCharacters[offset].charCodeAt(0);
          }
          byteArrays[sliceIndex] = new Uint8Array(bytes);
      }
      return new Blob(byteArrays, { type: contentType });
  }

  public static  downloadDocument(pdf: string, name: string) {
    // console.log('pdf:'+pdf);
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should


    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    const nav = (window?.navigator as any);
    /*if (nav && nav?.msSaveOrOpenBlob) {
      nav.msSaveOrOpenBlob(CommonUtils.base64toBlob(pdf, 'application/pdf'));
      return;
    }
    */
    if (nav && nav?.msSaveOrOpenBlob) {
    (window.navigator as any).msSaveOrOpenBlob(CommonUtils.base64toBlob(pdf, 'application/pdf'));
    return;
  }
      /*
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(CommonUtil.base64toBlob(pdf, 'application/pdf'));
      return;
    }*/



    // FOR OTHER BROWSERS
    const pdfUrl = URL.createObjectURL(CommonUtils.base64toBlob(pdf, 'application/pdf'));
    const fileName = name + '.pdf';
    const downloadLink = document.createElement('a');
    downloadLink.href = pdfUrl;
    // downloadLink.download = fileName;
    downloadLink.target = '_blank';
    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
      // For Firefox it is necessary to delay revoking the ObjectURL
      document.body.removeChild(downloadLink);
      // window.URL.revokeObjectURL(data);
    });
  }


  public static generateCleanDate(): Date {
    return this.zeroOutHoursForComparison(new Date());
  }

  public static zeroOutHoursForComparison(dateToZero: Date): Date {
    dateToZero.setHours(0, 0, 0, 0);

    return dateToZero;
  }

  public static generateCurrentDate(): any {
    const datepipe: DatePipe = new DatePipe('en-US')
    const formattedDate = datepipe.transform(new Date(), 'MM/dd/YYYY');
    return formattedDate?.toString();
  }

  public static monthDiff(d1: any, d2: any) {
    let d1Y = d2.getFullYear();
    let d2Y = d1.getFullYear();
    let d1M = d2.getMonth();
    let d2M = d1.getMonth();
    let monthDiff = (d1M + 12 * d1Y) - (d2M + 12 * d2Y)
    return monthDiff;
  }

  public static daysDiff(d1: any, d2: any) {
    let diffInDays: any;
    let diffInTime = (d2.getTime() - d1.getTime()) / 1000;
    let diff = diffInTime / (60 * 60 * 24);
    diffInDays = Math.round(diff);
    // console.log(">>>>>>>>>>>>>", diffInDays);
    return diffInDays;
  }
}
