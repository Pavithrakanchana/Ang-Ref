import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-vehicle-vin-prefill-popup',
  templateUrl: './vehicle-vin-prefill-popup.component.html',
  styleUrls: ['./vehicle-vin-prefill-popup.component.scss']
})
export class VehicleVinPrefillPopupComponent implements OnInit {
  vehicleVinprefillForm!: UntypedFormGroup;
  vinArrayObj!: any;
  vinStatus!: any;
  formSubmit: boolean = false;

  constructor(private formb: UntypedFormBuilder, public dialogRef: MatDialogRef<VehicleVinPrefillPopupComponent>,@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.vinArrayObj = this.data.data?.sort((a:any, b: any) => a.year < b.year ? 1 : -1)
    .filter(
      (btype:any, i: any, arr: any[]) => arr.findIndex(t => t.year === btype.year) < 6);

    this.vehicleVinprefillForm = this.formb.group({
      vinList: new UntypedFormArray([])
    });
    this.addCheckboxesToForm();
  }

  private addCheckboxesToForm() {
    this.vinArrayObj?.forEach(() => this.vinFormArray?.push(new UntypedFormControl(false)));
    }
  get vinFormArray() {
    return this.vehicleVinprefillForm?.controls?.vinList as UntypedFormArray;
    }
    onVINSelect() {
      this.vinStatus = this.vehicleVinprefillForm?.value?.vinList.filter((vin: any) => vin);

    }
  onPrefillSubmit() {

    this.formSubmit = true;
    const selectedVins = this.vehicleVinprefillForm?.value?.vinList
    .map((checked:any, i:number) => checked ? this.vinArrayObj[i].vin : null)
    .filter((vin: any) => vin !== null);
    if (selectedVins.length >=  1) {
      this.dialogRef.close({ event: true, data: selectedVins });
    }

  }

}
