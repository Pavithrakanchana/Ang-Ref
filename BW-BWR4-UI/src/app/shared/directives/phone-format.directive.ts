import { Directive, Input, Renderer2,  HostListener } from '@angular/core';
import { NgControl, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[formControlName][appPhoneFormat]'
})
export class PhoneFormatDirective {

  private _phoneControl!:AbstractControl;
  private _preValue!: string;
  @Input() 
  set phoneControl(control:AbstractControl){
    this._phoneControl = control;
  }
  @Input() 
  set preValue(value:string){
    this._preValue = value;
  }

  private sub!: Subscription;
  
  constructor(public ngControl: NgControl, private renderer: Renderer2) { }
  



/*  @HostListener("ngModelChange", ["$event"])
  onModelChange(event:any) {
    console.log('ngModelChange');
    this.onInputChange(event, false);
  }

  @HostListener("keydown.backspace", ["$event"])
  keydownBackspace(event:any) {
    console.log('keydown.backspace');
    this.onInputChange(event.target.value, true);
  }*/

  @HostListener("keydown", ["$event"])
  keydown(event:any) {
    this.onInputChange(event.target.value, true);
  }

  

  onInputChange(event: any, backspace: any): void {
    this.sub = this._phoneControl.valueChanges.subscribe((data) => {
      let preInputValue: string = this._preValue;
      var lastChar: string = preInputValue?.substring(preInputValue.length - 1);
      // remove all mask characters (keep only numeric)
      var newVal = data?.replace(/\D/g, '');

      let start = this.renderer.selectRootElement('#phone').selectionStart;
      let end = this.renderer.selectRootElement('#phone').selectionEnd;

      //let start=this.phoneRef.nativeElement.selectionStart;
      //let end = this.phoneRef.nativeElement.selectionEnd;
      //when removed value from input
      if (data?.length < preInputValue?.length) {
        // this.message = 'Removing...'; //Just console
        /**while removing if we encounter ) character,
        then remove the last digit too.*/
        if (preInputValue?.length < start) {
          if (lastChar == '-') {
            newVal = newVal?.substring(0, newVal.length - 1);
          }
        }
        //if no number then flush
        if (newVal?.length == 0) {
          newVal = '';
        } else if (newVal?.length <= 3) {
          newVal = newVal?.replace(/^(\d{0,3})/, '$1');
        } else if (newVal?.length <= 7) {
          newVal = newVal?.replace(/^(\d{0,3})(\d{0,3})/, '$1-$2');
        } else {
          newVal = newVal?.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, '$1-$2-$3');
        }

        this._phoneControl.setValue(newVal, { emitEvent: false });
        this.renderer.selectRootElement('#phone').setSelectionRange(start, end);
      } else {
        var removedD = data?.charAt(start);
        if (newVal?.length == 0) {
          newVal = '';
        }
        else if (newVal?.length <= 3) {
          newVal = newVal?.replace(/^(\d{0,3})/, '$1-');
        } else if (newVal?.length <= 7) {
          newVal = newVal?.replace(/^(\d{0,3})(\d{0,3})/, '$1-$2');
        } else {
          newVal = newVal?.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, '$1-$2-$3');
        }
        //check typing whether in middle or not
        //in the following case, you are typing in the middle
        if (preInputValue?.length >= start) {
          if (removedD == '-') {
            start = start + 1;
            end = end + 2;
          }
          if (removedD == '-') {
            start = start + 1;
            end = end + 1;
          }
          if (removedD == ' ') {
            start = start + 1;
            end = end + 1;
          }
          this._phoneControl.setValue(newVal, { emitEvent: false });
          this.renderer.selectRootElement('#phone').setSelectionRange(start, end);
        } else {
          this._phoneControl.setValue(newVal, { emitEvent: false });
          this.renderer
            .selectRootElement('#phone')
            .setSelectionRange(start + 1, end + 1); // +2 because of wanting standard typing
        }
      }
    });
  }
}


