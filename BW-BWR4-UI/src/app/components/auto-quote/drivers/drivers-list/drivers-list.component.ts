import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormGroup, FormArray, Validators, FormControl, ControlContainer, NgForm, FormGroupDirective } from '@angular/forms';
import { DriverDetails } from 'src/app/shared/model/drivers/add-driver.model';

@Component({
  selector: 'app-drivers-list',
  // moduleId: module.id,
  templateUrl: './drivers-list.component.html',
  styleUrls: ['./drivers-list.component.scss'],
 viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]
})
export class DriversListComponent {
// @input decorator used to fetch the property from the parent component.
@Input() public driverListForm!: UntypedFormGroup;
driverListParentForm!: UntypedFormGroup;
// @Output("addDriver") addDriver: EventEmitter<any> = new EventEmitter();
public drivers: DriverDetails= new DriverDetails();


@Output()
private onFormGroupChange = new EventEmitter<any>();
  constructor(private parentFD: FormGroupDirective) { }

  ngOnInit(){


  }
   public hasError = (controlName: string, errorName: string) => {
    return this.driverListForm.controls[controlName].hasError(errorName);
   }


}
