import { payPlan } from './../../../state/actions/summary.action';
import { Component, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { EventEmitter } from '@angular/core';
import { AutoCoverages, PayPlanDetails, PolicyFees } from '../../model/autoquote/autoquote.model';
import { CommonUtils } from '../../utilities/common-utils';
import { Store } from '@ngrx/store';
import QuoteSummary from 'src/app/state/model/summary.model';

@Component({
  selector: 'app-payplans',
  templateUrl: './payplans.component.html',
  styleUrls: ['./payplans.component.scss']
})
export class PayplansComponent implements OnInit {

  @Input() payplans!: PayPlanDetails[];
  @Input() form!: UntypedFormGroup;
  @Input() package!: string;
  @Input() fees!: PolicyFees[];
  @Input() underWritingFees!: PolicyFees[];

  @Input() selectPayPlanCode!: string;
  @Input() eftPaymentMethods: boolean = false;
  @Output() clickHandler = new EventEmitter<UntypedFormGroup>();
  selectedPayPlan!: string;
  payplanLabel: any = [];
  selectPayPlanCd!: any;
  duplicatePayPlanExists!: any;
  totalPolicyFee: number = 0;
  downpayPercent: any = []
  underWritingFee: number = 0;
  constructor() { }

  ngOnInit(): void {

    // Check whether duplicate payplan exists in the response object
    let hasDuplicatePlan = false;
    this.payplans?.map(function (obj) {
      return obj.payPlan;
    }).forEach(function (plan, index, arr) {
      if (arr.indexOf(plan) !== index) {
        hasDuplicatePlan = true;
      }
    });
    this.duplicatePayPlanExists = hasDuplicatePlan;

    if (this.fees && this.fees.length > 0) {
      this.fees.forEach((fee: PolicyFees) => {
        this.totalPolicyFee += Number(fee.theCurrencyAmount);
      });
    }
    if (this.underWritingFees && this.underWritingFees.length > 0) {
      this.underWritingFees.forEach((fee: PolicyFees) => {
        this.totalPolicyFee += Number(fee.theCurrencyAmount);
        if (fee.code === 'UW') {
          this.underWritingFee = Number(fee.theCurrencyAmount);
        }
      });
    }
    const payPlanSelectedObj = hasDuplicatePlan ?
      this.payplans?.filter((obj) => (this.eftPaymentMethods && obj.electronicFundTransfer?.requiredIndicator && this.selectPayPlanCode === obj.payPlan) ||
        (!this.eftPaymentMethods && !obj.electronicFundTransfer?.requiredIndicator && this.selectPayPlanCode === obj.payPlan)) :
      this.payplans?.filter((obj) => (this.selectPayPlanCode === obj.payPlan));
    if (payPlanSelectedObj) {
      this.form?.get('payPlan')?.patchValue(payPlanSelectedObj[0]);
    }
    this.selectedPayPlan = this.form?.get('payPlan')?.value;



    this.payplans?.forEach((payplan, index) => {
      this.downpayPercent[index] = Number(payplan?.downPayment?.percent);
      const installCnt = CommonUtils.toInteger(payplan.installment?.numberOfInstallments);
      if (payplan.installment?.numberOfInstallments === 0) // FUll paid
      {
        if (!payplan.electronicFundTransfer?.requiredIndicator) // non-EFT
        {
          this.payplanLabel[index] = 'Paid-In-Full';
        }
        else { // EFT only
          this.payplanLabel[index] = 'Paid-In-Full(EFT Only)';
        }
      } else
        if (!payplan.electronicFundTransfer?.requiredIndicator) // non-EFT
        {
          this.payplanLabel[index] = installCnt + 1 + '-Pay Plan';
        }
        else { // EFT only
          this.payplanLabel[index] = installCnt + 1 + '-Pay Plan(EFT Only)';
        }
    });
  }

  verifySelectedPayplan(plan: any): boolean {

    if ((this.duplicatePayPlanExists && this.eftPaymentMethods && plan.electronicFundTransfer?.requiredIndicator && this.selectPayPlanCode === plan.payPlan) ||
      (this.duplicatePayPlanExists && !this.eftPaymentMethods && !plan.electronicFundTransfer?.requiredIndicator && this.selectPayPlanCode === plan.payPlan) ||
      (!this.duplicatePayPlanExists && this.selectPayPlanCode === plan.payPlan)) {
      return true;
    }

    return false;
  }

  /** Emits an event to the parent component when a payplan is selected
   * and passes the payplan code
   */
  onPayPlanChange(event: MatRadioChange) {
    this.selectedPayPlan = event.value;
    this.clickHandler.emit(this.form);
  }

  generateTotalPremium(payplanPremium: any): number {
    return Number(payplanPremium.savingsAmount?.theCurrencyAmount) +
    this.totalPolicyFee - (payplanPremium.payPlan === "D0" ? this.underWritingFee : 0);
  }
}
