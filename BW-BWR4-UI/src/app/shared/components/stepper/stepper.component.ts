import { Component, OnInit, Input } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { GlobalConstants } from 'src/app/constants/global.constant';
import { addPageStatus } from 'src/app/state/actions/summary.action';
import QuoteSummary, { PageStatus } from 'src/app/state/model/summary.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavigationService } from '../../services/navigation.service';
import * as Actions from '../../../state/actions/summary.action';
import { SharedService } from 'src/app/services/shared.service';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { Tracker } from '../../utilities/tracker';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent implements OnInit {
  @Input() step: any;
  activatedStep!: number;
  activeStep: number = 0;
  disableStepper: boolean = false;
  routingRulesObj: number[] = [];
  lastActivatedStepper!: number;
  stepperRestriction: boolean = false;
  storeState!: any;
  storeRatebook!: any;
  storeQID!: any;
  totalStepper = [
    { 'label': 'Applicant', 'link': '/applicant', 'activated': false },
    { 'label': 'Drivers', 'link': '/drivers', 'activated': false },
    { 'label': 'Violations', 'link': '/violations', 'activated': false },
    { 'label': 'Vehicles', 'link': '/vehicles', 'activated': false },
    { 'label': 'Coverages', 'link': '/coverages', 'activated': false },
    { 'label': 'Policy Info', 'link': '/policyinfo', 'activated': false },
    { 'label': 'Rate', 'link': '/rates', 'activated': false },
    { 'label': 'Reports', 'link': '/reports', 'activated': false },
    { 'label': 'Application', 'link': '/application', 'activated': false },
    { 'label': 'Review', 'link': '/review', 'activated': false },
    { 'label': 'Confirmation', 'link': '/confirmation', 'activated': false }
  ];
  constructor(public router: Router, public quoteDataService: QuoteDataService, private store: Store<{ quoteSummary: QuoteSummary }>,
    private dialog: MatDialog, private logTracker: Tracker, private navigationService: NavigationService, public sharedService: SharedService) {
    this.router.events.subscribe((val) => {
      const pageIndex = this.totalStepper.findIndex((obj) => window.location.pathname.trim().startsWith(obj.link));
      this.getStep(pageIndex);
    });
    this.store.select('quoteSummary').subscribe(data => {
      this.lastActivatedStepper = data.lastVistedPage;
      this.stepperRestriction = data.stepperRestriction;
      this.storeQID = data.qid;
      this.storeState = data.policyState;
      this.storeRatebook = data.rateBook;
    })
  }

  ngOnInit(): void {
    this.onPageLoad();
  };

  stepperMethod(index: number, routerLink: any) {
    const currentLink = this.totalStepper.findIndex((obj) => window.location.pathname.trim().startsWith(obj.link));
    if (this.totalStepper[index].activated && currentLink != index) {  // check if selected link is activated  and restrict if current page and userClicked stepper link are same
      this.navigationService.updateNavigationRequestedRoute('save-' + routerLink);      
      this.step = currentLink; // check if selected link is active
      if (this.lastActivatedStepper === currentLink) {this.restrictionLogic(index, this.step); }      
    }
  }

  getStep(index: number): void {
    this.restrictionLogic(index, index);
    this.onPageLoad();
    this.step = index;
    if (this.step == 10) {
      this.disableStepper = true; // disable stepper if agent is on confirmation page
    }
  }

  onPageLoad() { //Onpageload get savedpage index from backendAPI/ngstore  and display stpper status accordingly
    this.lastActivatedStepper = this.sharedService.getLastVisitedPage();
    this.totalStepper?.forEach((z: any, i: number) => {
      if (i <= this.lastActivatedStepper) {
        this.totalStepper[i].activated = true;
      } else {
        this.totalStepper[i].activated = false;
      }
    })
  }

  restrictionLogic(index: number, currentPage: number) { // if user/agent visits pages after rate page and if user/agent clicks on previous pages/RATE page, enable stepper till RATE page and disable pages after rates page
    if (((this.lastActivatedStepper > 6 || currentPage > 6) && index <= 6) && this.lastActivatedStepper != 10) {
      if (!this.stepperRestriction) { this.store.dispatch(Actions.stepperRestriction({ stepperRestriction: true })); }
      this.sharedService.updateLastVisitedPage(6);
      this.onPageLoad();
    } else {
      if (this.stepperRestriction) { this.store.dispatch(Actions.stepperRestriction({ stepperRestriction: false })); }
    }
  }

}
