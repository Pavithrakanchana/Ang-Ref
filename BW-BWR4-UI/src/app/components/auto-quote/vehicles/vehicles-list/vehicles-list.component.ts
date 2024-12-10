import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-vehicles-list',
  templateUrl: './vehicles-list.component.html',
  styleUrls: ['./vehicles-list.component.scss']
})
export class VehiclesListComponent implements OnInit {
// we will pass in address from App component
@Input('group')
public vehicleListForm!: UntypedFormGroup;

  constructor() { }

  ngOnInit(): void {

  }
   public hasError = (controlName: string, errorName: string) => {
    return this.vehicleListForm.controls[controlName].hasError(errorName);
   }

}
