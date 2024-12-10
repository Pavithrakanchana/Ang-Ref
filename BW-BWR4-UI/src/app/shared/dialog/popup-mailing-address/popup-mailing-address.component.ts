import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {MatRadioButton, MatRadioChange} from '@angular/material/radio';
import {MatAccordion} from '@angular/material/expansion';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ObjectUtils } from '../../utilities/object-utils';

@Component({
  selector: 'app-popup-mailing-address',
  templateUrl: './popup-mailing-address.component.html',
  styleUrls: ['./popup-mailing-address.component.scss']
})
export class PopupMailingAddressComponent implements OnInit {

  addressVerificationForm!: UntypedFormGroup;
  addressArrayObj!: any;

  constructor(public dialogRef: MatDialogRef<PopupMailingAddressComponent>,@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {

    this.addressArrayObj = this.data.compareObj;
    this.createDynamicFormGroup();
  }

  createDynamicFormGroup(){
    let form:any = {};
    if (!ObjectUtils.isObjectEmpty(this.data)) {
    this.data.compareObj.forEach((item: any, i: number) => {
      form['addressSelection'+i] = new UntypedFormControl('enteredAddress');
    });
    this.addressVerificationForm = new UntypedFormGroup(form);
    }
  }

  closeDialog(val:boolean) {
    this.dialogRef.close({ event: val, data: this.addressVerificationForm.value });
  }

  }


