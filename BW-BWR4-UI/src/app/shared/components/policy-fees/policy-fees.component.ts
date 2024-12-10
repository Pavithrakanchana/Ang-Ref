import { Component, Input, OnInit } from '@angular/core';
import { PolicyFees } from '../../model/autoquote/autoquote.model';

@Component({
  selector: 'app-policy-fees',
  templateUrl: './policy-fees.component.html',
  styleUrls: ['./policy-fees.component.scss']
})
export class PolicyFeesComponent implements OnInit {

  @Input() fees!: PolicyFees[];
  @Input() package!: string;
  @Input() selectdPackage!: string;

  constructor() { }

  ngOnInit(): void {
  }

}
