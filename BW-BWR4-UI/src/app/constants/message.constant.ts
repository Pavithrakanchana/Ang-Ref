import { Injectable } from '@angular/core';
import {formatDate} from '@angular/common';

// Placeholder for all Messages used in the application

@Injectable()
export class MessageConstants {

 constructor() { }

 // Note:  FYI Error Messages are hard edits, Info Messages are soft edits
 // Applicant
 public static OUT_OF_BINDING_MESSAGE = 'Invalid Policy - out of binding.  The quote effective date has been updated to today\'s date.';
 public static EFFECTIVE_DATE_UPDATE_MESSAGE = 'The quote effective date has been updated to today\'s date.';

 public static createPostDateMessage(minimumDate: Date, maximumDate: Date): string {
   const format = 'MM/dd/yyyy';
   const locale = 'en-US';
   return 'Invalid Policy - out of binding.  Please select a date between ' + formatDate(minimumDate, format, locale) +
     ' and ' + formatDate(maximumDate, format, locale) + '.  The quote effective date has been updated to today\'s date.';
 }
public static APPLICANT_INFO_CHANGED= 'Applicant Information has changed, When you select Next, credit will be reordered and your quoted premium may change.';
public static APPLICANT_ADDRESS_SCRUBBING_TYPE = ["Mailing Address","Previous Mailing Address"];
  public static PROP_CREDIT_REORDER_AFTER_60DAYS = 'Credit has not been ordered for 60 days or more.  When you select Next, credit will be reordered and your quoted premium may change.';
//Address Verification
public static SCRUB_ADDRESS_STR_DESC =  'Your entered street name is not valid for the city name you specified. Please review and correct the address information before continuing.';
public static SCRUB_ADDRESS_RESULT_DESC = 'We can\'t find the address in the US Postal Database. Please correct this or click \'Next\'';
public static INVALID_ZIP_CODE = 'The state/zip combination is invalid.';
public static INVALID_ZIP_CODE_2 = 'State/Zip Code combination is incorrect';
public static INVALID_STATE_ZIP_OR_HAS_POBOX = 'The state/zip combination is invalid or zip is a P.O. Box.';

 //Drivers
 public static SR22_NEEDS_DRIVER_RATED = 'SR22 requires driver as being Rated.';
 public static SR22_FDL_NOT_ACCEPTED = 'Drivers with a FDL violation and SR22 are unacceptable.';
 public static PNI_LESS_THAN_14YRS ='PNI cannot be 14 years old.';
 public static PNI_LESS_THAN_16YRS = 'Primary Named Insured must be greater than or equal to 16 years of age.';
 public static DRIVERS_LESS_THAN_15YRS = 'Driver must be at least 15 years old to be listed on the policy.';
 public static ADDL_DRIVER_MESSAGE ='Please complete required information for additional drivers.';
public static EVEN_MARRIED_DRIVERS_EDIT_MSG = 'There must be an even number of married drivers listed in this application, i.e. for every driver listed as married, his/her spouse must also be listed.';
public static EVEN_DOMESTIC_DRIVERS_EDIT_MSG= 'There must be an even number of domestic partner/civil union drivers listed in this application, i.e. for every driver listed as a domestic partner/civil union, his/her domestic partner/civil union must also be listed.';
public static MARRIED_DRIVERS_EDIT_MSG = "If a driver is listed on the application as being the spouse of the applicant, the driver's marital status must be 'married'";
public static DOMESTIC_DRIVERS_EDIT_MSG = "If a driver is listed on the application as being the domestic partner/civil union of the applicant, the driver's marital status must be 'domestic partner/civil union'";
public static PNI_MULTI_SPOUSE_EDIT_MSG = 'Only 1 spouse may be listed as the relation to the Named Insured';
public static PNI_MULTI_DOMESTIC_PARTNER_EDIT_MSG = 'Only 1 domestic partner/civil union may be listed as the relation to the Named Insured';
public static SINGLE_PNI_WITH_DOMESTIC_PARTNER_EDIT_MSG = "Named Insured marital status must be 'domestic partner/civil union' if domestic partner/civil union is listed.";
public static SINGLE_PNI_WITH_SPOUSE_EDIT_MSG = "Named Insured marital status must be 'married' if spouse is listed.";
public static DOMESTIC_CANNOT_BE_SPOUSE_EDIT_MSG = "A domestic partner/civil union cannot be 'Spouse' to insured.";
public static DRIVER_NAMED_NNO = "Driver 2: Only 1 driver per Named Non Owner policy."
public static DRIVER_BROAD_FORM = "Driver 2: Only 1 driver per Broad Form policy."
public static SR22_FR44_FDL_NOT_ACCEPTED = "Drivers with a Foreign Driver's License and State Filing are unacceptable."
public static POLICY_ATLEAST_ONE_DRIVER = "Policy must have at least one rated driver."
public static COURSE_DATE_GREATER_MONTHS_EDIT = ": {0} Driver Course Date is more than {1} months prior to the Policy Effective Date."
public static COURSE_DATE_GREATER_MONTHS_EDIT_PA = ": Drv. Improv. Date is more than 36 months prior to the Policy Effective Date."
//violations
public static VIOLATION_OCC_DATE_LESS_THAN_35YRS = 'Violation date must be within 35 months of policy effective date.';
public static VIOLATION_FUTURE_DATE = 'Violation date is in the future. Please review date and re-enter violation date in the format of mm/dd/yyyy.';
public static VIOLATION_OCC_DATE_35YRS = 'No longer qualifies for the Mature Driver Discount.  The field has been reset to No and the discount has been removed.'

 //vehicles
public static VEHICLES_VIN_DUPLICATE = 'Two vehicles may not have the same VIN.';
public static VEHICLES_VIN_INVALID = 'The VIN entered does not appear to be valid. To get the most accurate rate please verify the VIN.';
public static NON_OWNER_DELETE_VEHICLES = 'Only One Vehicle is allowed on Named Non Owner Policy.';
public static BROAD_FORM_DELETE_VEHICLES = 'Only One Vehicle is allowed on Broad Form Policy.';
public static CORRECTED_VIN_SOFT_MSG = 'The entered VIN contains errors. We have a vendor that identifies these errors and suggests an updated VIN. Please review the updated VIN and verify it matches the VIN of the customers vehicle. Common errors include entering invalid characters, such as I, O, and Q';
public static OUT_OF_STATE_ZIPCODE = 'Out of state zip is not allowed on first vehicle. Please check zip code and re-enter.';
public static BANNED_STATE_MSG = 'This policy is unacceptable because the garaging address provided is in one of the following states: DC, MA, MI, NY, NJ';
public static NO_INSURANCE_STATE_MSG = 'Vehicle is garaged in a state where company currently doesn\'t offer insurance.';
public static INCORRECT_ZIPCODE = 'Incorrect zip code.';
public static EMAIL_VERIFICATION_ERROR = 'A valid e-mail address must be entered. Valid e-mail addresses must contain an at symbol (@) and at least one period (.) Example: yourname@aol.com';

// PolicyInfo
public static ADD_DRIVERS_MAXOUT = 'Unable to add the amount of drivers selected. Amount of drivers listed on a policy cannot exceed 6. Please contact Service Point at 1-888-888-0080 for more information';
public static HHM_DRIVERS_CHECK = 'Number of listed drivers cannot exceed the number of household members.';
//Coverages
public static INCORRECT_PRIORCARRIER = 'Please enter/select a valid Prior Carrier.';
  public static POP_BLOCK_MESSAGE = 'We found prior insurance with a Bristol West Affiliated company. You can dispute this by uploading the policy and submitting valid proof of prior insurance with another carrier which may result in an adjustment in your rate. Please see your agent guide for further details and possible exceptions.'
  public static POP_FARMERS_AFFILIATED_MESSAGE = 'We found prior insurance with a Farmers Affiliated company. You can dispute this by uploading the policy and submitting valid proof of prior insurance with another carrier which may result in an adjustment in your rate. Please see your agent guide for further details and possible exceptions.'
  public static BI_LIMIT_ON_RIDESHARE = "Policy requires BI to be purchased when Ridesharing use is selected";
public static POP_NOT_Required_By_Law = 'Not Required by Law is not a valid option based on the Named Insured Age. Only Named Insured over 18 can select this option. Please select a valid Prior Carrier to proceed';

// Rate
public static RATE_REPORTS_VERIFIED = 'This premium has been completely verified through all underwriting reports.';
public static RATE_REPORTS_NONVERIFIED = 'This premium has not yet been completely verified through all underwriting reports.';

// Application
public static TEXT_ALERTS_DISCLAIMER = 'The customer has voluntarily provided his/her phone number and agrees to receive texts about the policy or on behalf of the company.';
public static PRODUCER_DATA_NOT_FOUND = 'Producer Information error : Policy cannot be uploaded unless a name is selected. If your name is not listed, please click link below to add your name.';
public static EMAIL_REQUIRED = "A valid e-mail address must be entered. Valid e-mail addresses must contain an at symbol (@) and at least one period (.) and it must not be the Producer's e-mail address. Example:your name@aol.com"
public static GO_PAPERLESS_DISCLAIMER = 'You have enrolled in Go Paperless, your premium will be adjusted to reflect the Go Paperless Discount along with any other policy changes and can be viewed on the Final Rate/Upload screen.';
public static TEXT_ALERTS_REQUIRED = 'To enroll in Text Alerts, you must provide atleast one valid mobile phone number.';
public static POLICY_NO_FARMERS_REQ = 'Please provide the Farmers Policy number if assigned.';
public static POLICY_NO_FARMERS_INVALID = 'Invalid Farmers Policy Number. Please re-enter.';
public static POLICY_NO_FOREMOST_REQ = 'Please provide the Foremost Policy number if assigned.';
public static POLICY_NO_FOREMOST_INVALID = 'Invalid Foremost Policy Number. Please re-enter.';
public static POLICY_NO_ZURICH_REQ = 'Please provide the Zurich Policy number if assigned.';
public static POLICY_NO_ZURICH_INVALID = 'Invalid Zurich Policy Number. Please re-enter.';
public static VEH_GARAGE_ADDRESS_REQ = 'Garaging Address is required.';
public static VEH_GARAGE_CITY_REQ = 'Garaging City is required.';
public static VEH_GARAGE_STATE_REQ = 'Garaging State is required.';
public static POLICY_NO_MULTI_MSG = 'Please provide valid Policy Number(s)';

public static POLICY_NO_BRISTOL_REQ = 'Please provide the Bristolwest Policy number if assigned.';
public static POLICY_NO_BRISTOL_INVALID = 'Invalid Bristolwest Policy Number. Please re-enter.';

public static INVALID_EMAIL = 'Email address entered is invalid.';
public static DUPLICATE_EMAIL = 'This email is currently associated with a different policy. Please enter a different email.';
public static PAYMETHOD_CHANGE_EDIT = 'The Quote needs to be recalculated.';
public static LP_AI_ADDRESS_SCRUBBING_TYPE = ["Additional Insured/Loss Payee Address"];
public static APPL_FINAL_RATE = 'Premium fully validated by all underwriting reports.';
public static ESIGN_VALID_EMAIL = "In order to sign via electronic signature, a valid e-mail address must be entered. Valid e-mail addresses must contain an at symbol (@) and at least one period (.) and it must not be the Producer's e-mail address. Example: yourname@aol.com.";

public static INVALID_POLICY_NUMBER = 'Invalid Policy Number. Please re-enter';
public static POLICY_NUMBER_SOFT_EDIT = 'Please provide the Policy number if assigned';
public static TEXT_ALERT_MOBILE1_REQ = 'To enroll in Text Alerts, you must provide at least one valid mobile phone number.';

//Rates
public static VIN_17DIGITS_EDIT = 'Please enter complete 17-digit VIN on Vehicles screen to proceed.';
public static EMPTY_VIN_EDIT  = 'Please enter VIN on Vehicles screen to proceed.'
public static DRIVING_SCORE_NO_CONNECT_MSG = 'Unable to connect to the Driving Score Vendor. You may upload the policy now or you may attempt to order the report at a later time. If you upload now, the Driving Score report will be ordered after upload and the premium may change at that time.';

// Reports
public static PRIOR_INSUR_STATUS_MSG = 'The selected prior carrier information was not verified by reports. Proof of prior insurance will be required in order to avoid a potential increase in premium.';
public static LICENSE_ID_DUPLICATE = 'Two drivers may not have the same license number';
public static PRIOR_INSURANCE_SR22_FR44 = 'This policy requires a Non-Cancelable SR22/FR44 Filing and Prior Insurance was not able to be verified at point of sale. Therefore, this policy will be rated without prior Insurance. Acceptable prior Insurance can be submitted after upload and we will adjust the policy premium accordingly.';

//REVIEW
public static AMOUNT_PAY_5LESS = 'Down Payment must be between {1} and {2}.';
public static AMOUNT_PAY_PIF = 'Your down payment indicates that the policy is Paid in Full yet you have elected a Payment Plan. Please select Paid in Full on the Rate Page and continue forward to the Final Rate/Upload Page. You may also elect to select a payment plan by lowering the down payment amount.';
public static PRODUCER_NOTE_CHECKINS = 'PRODUCER NOTE: Do not accept check or cash from the Policyholder. The down payment shown above will be swept from the policy holder\'s ' +
                                        ' checking/savings account.';
public static PRODUCER_NOTE_CC = 'PRODUCER NOTE: Do not accept check or cash from the Policyholder. The down payment shown above will be charged against the policyholder\'s debit/credit card.';

public static PRODUCER_NOTE_SWEEP = 'PRODUCER NOTE: Retain the policyholder\'s remittance. The down payment shown above will be swept from YOUR account within 3 business days.';

public static PAYMENT_METHOD_CHANGE = 'Payment method has changed, please update payment information';

// BRIDGE EDITS - APPLICANT
public static APLCNT_PRM_EDT = 'Review quote information for accuracy. Premium may change based on underwriting reports.';

public static APLCNT_VEH_EDT = 'There were :vehCnt vehicle(s) quoted in :bridgeSrc but we were only able to transfer 6 vehicle(s) into Bristol West quote. ' +
        'Please review the Vehicle screen and enter manually any additional vehicle(s) that you would like to have included in the quote.';

// BRIDGE EDITS - VIOLATION
public static VIOLATIONS_CLUE_EDT = 'CLUE Order Complete. Add and review violations.';
public static VIOLATIONS_NOCLUE_EDT = 'CLUE Order Complete. No violations.';

// BRIDGE EDITS - VEHICLE
public static VEHICLE_VIN_EDT_LESSTHAN_17 = 'Enter 17 digit VIN to receive the most accurate premium.';
public static VEHICLE_VIN_EDT_17 = 'Vehicle History has been ordered. Premium may have been updated.';

// BRIDGE EDITS - RATE
public static RATE_UPDATEPREM_NO_VH = 'See updated premium. Due to underwriting reports premium may have changed.';
public static RATE_UPDATEPREM_HIT_VH = 'See updated premium. Due to underwriting reports and vehicle history premium may have changed.';
public static RATE_UPDATEPREM_ON_BRIDGE = 'Alert: See updated premium. Due to underwriting reports premium may have changed.';
// CONFIRMATION PAGE
public static PRODUCER_SWEAP = "Retain the policyholder's remittance. The down payment shown above will be swept from YOUR account within 3 business days.";
public static CHECKING_SAVING_ACCOUNT = "Do not accept check or cash from the Policyholder. The down payment shown above will be swept from the policyholder's checking/savings account.";
public static CREDIT_DEBIT_CARD = "Do not accept check or cash from the Policyholder. The down payment shown above will be charged against the policyholder's debit/credit card.";



}
