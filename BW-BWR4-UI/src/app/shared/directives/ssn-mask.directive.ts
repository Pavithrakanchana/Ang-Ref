import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2, HostListener } from '@angular/core';
import { NgControl, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[formControlName][appSsnMask]'
})
export class SsnMaskDirective {

  private _ssnControl!:AbstractControl;
  private _preValue!: string;
  @Input() 
  set ssnControl(control:AbstractControl){
    this._ssnControl = control;
  }
  @Input() 
  set preValue(value:string){
    this._preValue = value;
  }

  private sub!:Subscription;

  constructor(public ngControl: NgControl, private renderer: Renderer2) { }
  ssnUI!: string;
  ssn!: string;
  maskedSectionOriginal = '';
/*
  @HostListener('ngModelChange', ['$event'])
  onModelChange(event: any): void {
    console.log('ngModelChange');
    //this.onInputChange(event, false);
  }

  @HostListener('keydown.backspace', ['$event'])
  keydownBackspace(event: any): void {
    console.log('keydown.backspace');
    this.onInputChange(event.target.value, true);
  }*/

  @HostListener("keydown", ["$event"])
  keydown(event:any) {
    this.onInputChange(event.target.value, true);
  }

  onInputChange(event: any, backspace: any): void {
    this.sub = this._ssnControl.valueChanges.subscribe((data) => {
      let preInputValue: string = this._preValue;
      var lastChar: string = preInputValue?.substring(preInputValue.length - 1);
      // remove all mask characters (keep only numeric)
      var newVal = data?.replace(/\D/g, '');

      let start = this.renderer.selectRootElement('#ssn').selectionStart;
      let end = this.renderer.selectRootElement('#ssn').selectionEnd;

      //when removed value from input
      if (data?.length < preInputValue?.length) {
        /**while removing if we encounter - character,
        then remove the last digit too.*/
        if (preInputValue?.length < start) {
          if (lastChar == '-') {
            newVal = newVal?.substring(0, newVal?.length - 1);
          }
        }
        //if no number then flush
        if (newVal?.length == 0) {
          newVal = '';
        } else if (newVal?.length <= 3) {
          newVal = newVal?.replace(/^(\d{0,3})/, '$1');
        } else if (newVal?.length <= 5) {
          newVal = newVal?.replace(/^(\d{0,3})(\d{0,2})/, '$1-$2');
        } else {
          newVal = newVal?.replace(/^(\d{0,3})(\d{0,2})(\d{0,4})/, '$1-$2-$3');
        }
        this._ssnControl.setValue(newVal, { emitEvent: false });
        this.renderer.selectRootElement('#ssn').setSelectionRange(start, end);
      } else {
        var removedD = data?.charAt(start);
        if (newVal?.length == 0) {
          newVal = '';
        }
        else if (newVal?.length <= 3) {
          newVal = newVal?.replace(/^(\d{0,3})/, '$1-');
        } else if (newVal?.length <= 5) {
          newVal = newVal?.replace(/^(\d{0,3})(\d{0,2})/, '$1-$2');
        } else {
          newVal = newVal?.replace(/^(\d{0,3})(\d{0,2})(.*)/, '$1-$2-$3');
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
          this._ssnControl.setValue(newVal, { emitEvent: false });
          this.renderer.selectRootElement('#ssn').setSelectionRange(start, end);
        } else {
          this._ssnControl.setValue(newVal, { emitEvent: false });
          this.renderer
            .selectRootElement('#ssn')
            .setSelectionRange(start + 1, end + 1); // +2 because of wanting standard typing
        }
      }
    });
  }
}
