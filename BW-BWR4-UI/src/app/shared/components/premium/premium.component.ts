import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-premium',
  templateUrl: './premium.component.html',
  styleUrls: ['./premium.component.scss']
})
export class PremiumComponent implements OnInit {

  @Input() totalPremium!: string;

  constructor() { }

  ngOnInit(): void {
  }

}
