import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-add-violation',
  templateUrl: './add-violation.component.html',
  styleUrls: ['./add-violation.component.scss'],
})
export class AddViolationComponent implements OnInit {
  enableEdit: any = {
    status: false,
    value: ""
  };
  public _index!: any;
  @Input() driverId!: string;
  @Input() editViolationValues!: any;
  @Input() index!: string;
  @Input() eventType!: string;

  @Output() selfReportedViolation = new EventEmitter<any>();
  @Output() hideAddViolation = new EventEmitter<any>();
  @Output() editSelfReportedViolation = new EventEmitter<any>();

  violationForm!: UntypedFormGroup;
  formSubmitAttempt!: boolean;

  violationCodes = [
    {
      value: 'AC',
      viewValue: 'At-Fault Accident',
    },
    {
      value: 'DUI',
      viewValue: 'Driving Under the Influence',
    },
    {
      value: 'MAV',
      viewValue: 'Major Violation',
    },
    {
      value: 'MIV',
      viewValue: 'Minor Violation',
    },
    {
      value: 'NAF',
      viewValue: 'Not-At-Fault Accident',
    },
    {
      value: 'CCG',
      viewValue: 'Comprehensive Claim > $1,000',
    },
    {
      value: 'CCL',
      viewValue: 'Comprehensive Claim < = $1,000',
    },
    {
      value: 'SPD',
      viewValue: 'Speeding',
    },

  ];

  constructor(private _fb: UntypedFormBuilder, public datepipe: DatePipe) { }

  ngOnInit(): void {
   // alert(this.eventType)
    if (this.eventType === 'add') {
      this._index = parseInt(this.index) + 1;
    } else {
      this._index = this.index;
    }
    this.violationForm = this._fb.group({
      violationCode: new UntypedFormControl('', [Validators.required]),
      occurenceDate: new UntypedFormControl('', [Validators.required]),
    });
    if (this.editViolationValues != '') {
      this.enableEdit.status = true;
      this.enableEdit.value = this.driverId + '' + this.editViolationValues?.id;
      this.violationForm.controls['violationCode'].patchValue(this.violationCodes.find(x => x.viewValue === this.editViolationValues?.code)?.value);
      this.violationForm.controls['occurenceDate'].patchValue(new Date(this.editViolationValues?.occurenceDate));
    } else {
      this.enableEdit.status = false;
      this.enableEdit.value = this.driverId + '' + this.editViolationValues.id;
    }
  }

  addEditViolation(violationData: any) {
    this.formSubmitAttempt = true;
    const datePipe = new DatePipe('en-US');
    if (this.violationForm.valid) {
      this.selfReportedViolation.emit({
        id: this.driverId,
        violations: [
          {
            id: this._index,
            code: this.violationCodes.find(x => x.value === violationData.violationCode)?.viewValue,
            occurenceDate: datePipe.transform(new Date(violationData.occurenceDate), 'MM/dd/yyyy'),//, 'EST', 'en-US'),
            source: 'UserSelected',
            dispute: '',
            explanation: '',
          },
        ],
      });
    }
  }
  cancel(event: any) {
    this.hideAddViolation.emit();
    this.selfReportedViolation.emit({
      id: this.driverId,
      violations: [],
    });
  }
}
