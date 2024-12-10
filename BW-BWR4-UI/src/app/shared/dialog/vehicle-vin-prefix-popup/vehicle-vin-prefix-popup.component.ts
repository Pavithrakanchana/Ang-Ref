import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-vehicle-vin-prefix-popup',
  templateUrl: './vehicle-vin-prefix-popup.component.html',
  styleUrls: ['./vehicle-vin-prefix-popup.component.scss']
})
export class VehicleVinPrefixPopupComponent implements OnInit {
  vehicleVinprefixForm!: UntypedFormGroup;
  vinArrayObj!: any;
  selectedVINIndex!: number;
  formStatus!: boolean;
  formSubmit: boolean = false;
  constructor(private formb: UntypedFormBuilder, public dialogRef: MatDialogRef<VehicleVinPrefixPopupComponent>,@Inject(MAT_DIALOG_DATA) public data: any) { }
  displayedColumns: string[] = ['select','vin', 'cylinders', 'fuel', 'transmission', 'drive'];
  ngOnInit(): void {
    this.vinArrayObj = this.data.data;
    this.vehicleVinprefixForm = this.formb.group({
      vin: ['',Validators.required]
    });
  }
  onVINSelect(i:any) {
    this.selectedVINIndex = i;
  }
  onSubmit(formData: any) { 
    this.formSubmit = true;    
    if (this.vehicleVinprefixForm.valid) {  
      const selectedVin = this.vehicleVinprefixForm.value?.vin;     
      const selectedVinDetails = this.vinArrayObj.filter((vinList: any) => 
      vinList.vehicleModel.vehicleIdentificationNumberPrefix === selectedVin); 
            if (selectedVinDetails.length >=  1) {
              this.dialogRef.close({ event: true, data: selectedVinDetails });
            } 
    }
    
    
  }

}
