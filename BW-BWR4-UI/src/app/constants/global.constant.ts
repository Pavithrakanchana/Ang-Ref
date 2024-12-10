import { Injectable } from "@angular/core";

@Injectable()
export class GlobalConstants {

    public static APPID = 'BWC';
    public static APP_NAME = 'BWR4';
    public static BWR_APP_NAME = 'BWR';
    public static LINE_OF_BUSINESS = 'APV';
    public static APPLICANT_PAGE_NAME = 'Applicant';
    public static DRIVER_PAGE_NAME = 'Drivers';
    public static VIOLATION_PAGE_NAME = 'Violations';
    public static VEHICLE_PAGE_NAME = 'Vehicles';
    public static COVERAGE_PAGE_NAME = 'Coverages';
    public static OUT_OF_STATE_LIMIT = 'StateCoveragesOutOfStateLimits';
    public static OUT_OF_STATE_LIMIT_DROPDOWN = 'state_coverages_outofstate_limits';
    public static POLICY_INFO_PAGE_NAME = 'PolicyInfo';
    public static APPLICATION_PAGE_NAME = 'Application';
    public static APPLICANT_PAGE_CONSENT = 'ApplicantConsent';
    public static PAYMENT_METHODS_PAGE_NAME = 'StatePaymentMethods';
    public static PAYMENT_METHODS_DROPDOWN = 'state_payment_methods';
    public static POLICY_COVERAGE_PAGE_NAME = 'StatePolicyCoverages';
    public static POLICY_COVERAGE_PAGE_DROPDOWN = 'state_policy_coverages';
    public static VEHICLE_COVERAGE_PAGE_NAME = 'StateVehicleCoverages';
    public static VEHICLE_COVERAGE_PAGE_DROPDOWN = 'state_vehicle_coverages';
    public static ROUTING_RULES = 'StateNavigationRules';
    public static STATE_ALL_VALID_VALUES = 'ALL';
    public static MCO_ALL_VALID_VALUES = 'ALL';
    public static RATEBOOK_ALL_VALID_VALUES = 'ALL';
    public static DROPDOWN_ALL_VALID_VALUES = 'ALL';
    public static DROPDOWN_NAME = 'consent_message';
    public static RULES_DROPDOWN = 'state_navigation_rules';
    public static STATE_AZ_VALID_VALUES = 'AZ';
    public static BI_FILTER_CODES: string[] = ['BI','RBIP'];
    public static PD_FILTER_CODES: string[] = ['PD'];
    public static PD_UMPD_FILTER_CODES : string[] = ['UMPD']
    public static UM_FILTER_CODES: string[] = ['UIM','UMBI','UM/UIM','UM','UIMBI', 'UMST', 'UMUNST', 'UIMUNS', 'UIMST'];
    public static VIOLATION_FILTER_CODES: string[] = ['AAF', 'AF2', 'AF3', 'MAJ', 'MIN', 'DUI', 'SPD', 'UDR', 'SPL'];
    public static BI_UMPD_MP_FILTER_CODES : string[] = ['UMBI', 'MP'];
    public static SR22_CHECKBOX_STATE : string[] = ['AZ', 'IL', 'IN', 'CO', 'OH', 'TX'];
    public static UMS_FOR_UMPD_UMUIM: string[] = ['UMPD','UM/UIM'];
    public static BI_NNO_FILTER = '050/100';
    public static BI_NNO_FILTER_VA = '060/120';  // move to Global Constants
    public static PD_NNO_FILTER = '050';
    public static PD_NNO_FILTER_VA = '040'
    public static UMPD_NNO_FILTER = '100';
    public static BI_RIDESHARE_FILTER = '025/050';
    public static BI_RIDESHARE_FILTER_OH = '050/100';
    public static BI_RIDESHARE_FILTER_PA = '050/100';
    public static PD_RIDESHARE_FILTER_OH = '025';
    public static PD_RIDESHARE_FILTER_PA = '025';
    public static UIM_COVERAGE_CD = 'UIM';
    public static UIM_COVERAGE_DEFAULT = '000/000';
    public static UMBI_COVERAGE_DEFAULT = '000/000';
    public static UMBI_COVERAGE_CD = 'UMBI';
    public static UMBI_COVERAGE_2550 = '025/050';
    public static UMBI_COVERAGE_5050 = '050/050';
    public static UMPD_COVERAGE_CD = 'UMPD';
    public static UMPD_DEDUCTIBLE_DEFAULT = '300';
    public static UMPD_DEDUCTIBLE_DEFAULT_TX = '250';

    public static EMPTY_STRING = '';
    public static EMPTY_VALUE = '000';
    public static NON_OWNER_YEAR_VALUE = '9999';
    public static NON_OWNER_MAKE_VALUE = 'NAME';
    public static NON_OWNER_MODEL_VALUE = 'NON-OWNER';
    public static BROAD_FORM_MAKE_VALUE = 'BROAD';
    public static BROAD_FORM_MODEL_VALUE = 'FORM';
    public static CONVERSION_VAN_MAKE_VALUE = 'CONV';
    public static CONVERSION_VAN_MODEL_VALUE = 'VAN';
    public static NOT_APPLICABLE = 'N/A';
    public static NONE = 'None';
    public static MPEXP_DEFAULT = '005'
    public static NON_OWNER_CODE = 'N';
    public static BROAD_FORM_CODE = 'Y';
    public static CONVERSION_VAN_CODE = 'C';
    public static ANTI_THEFT_CODE = 'antiTheftCode';
    public static ANTI_LOCK_BRAKE_OPTION = 'antiLockBrakesOption';
    public static AIRBAG_TYPE_COPDE = 'airBagTypeCode';
    public static DAYLIGHT_RUNNING_LIGHT = 'daylightRunningLightsOption';
    public static HTTP_STATUS_CODE_404 = '404';
    public static ERROR_STATUS_CODE_406 = 'UAP-APP-DUPCHECK-406';
    public static DUMMY_DATE = '01/01/0001';
    public static DISPUTE = 'DISPUTE';
    public static POP_BLOCK_BW_FO_VALUES: string[] = ['BW','FO','Bristol West', 'Foremost'];
    public static POP_BLOCK_VALUES: string[] = ['BW', 'FO', '9B', 'TC', 'FA', 'MC', 'MT', '99'];
    public static BRISTOL_WEST_AFFILIATED_VALUES: string[] = ['BW', 'FO', '99'];
    public static FARMERS_AFFILIATED_VALUES: string[] = ['9B', 'TC', 'FA', 'MC', 'MT'];
    public static POP_NO_PRIOR: 'NO PRIOR';
    public static LAYOUT_VERTICAL = "vertical";
    public static LAYOUT_HORIZONTAL = "horizontal";
    public static DISPUTE_LISTED_DECESASED_VALUES: string[] = ['AL', 'DE'];
    public static NEW_BUSINESS = 'NB';
    public static QUOTE_WORKSHEET = 'QW';
    public static APPLICATION_PACKAGE = 'AP';
    public static MULTI_POLICY_HOME_WITH_OTHER: string[] = ['G','K','M','I'];
    public static SCRUB_ADDRESS_SOFT_EDIT_RESULT_CODES: string[] = ['STR','DBE','EWS','INV','NDA', 'RNF'];
    public static SCRUB_ADDRESS_COREECTED_ADDRESS_RESULT_CODES: string[] = ['COR', 'CZIP'];
    public static REPORTS_VERIFICATION_CODES: any = {'HOMEOWNER':'Homeowner','MULTYPOLICY':'Multipolicy','CLUE':'CLUE','MVR':'MVR'};
    public static AMOUNT_ZERO = '0';
    public static PAYMENT_TYPE_CHECKING_SAVINGS = 'DD';
    public static PAYMENT_TYPE_CREDIT_DEBIT = 'CC';
    public static PAYMENT_DOWNPAYMENT = 'DOWNPAY';
    public static PAYMENT_INSTALL = 'INSTALL';
    public static PAYMENT_INSTALLMENT = 'INSTALLMENT';
    public static PAYMENT_SCHEDULE_TYPE = 'LIABILITY';
    public static PAYMENT_SCHEDULE_STATUS = 'execute';
    public static PAYMENT_TRANSACTION_TYPE = 'stage';
    public static PAYMENT_USER_TYPE = 'CUSTOMER';
    public static PAYMENT_COUNTRY = 'US';
    public static ITERNATIONAL_LICENSE = 'IT';
    public static CONFIRMATION_PAGE_NAME = 'CONFIRMATION';
    public static RATE_PAGE_NAME = 'RATE';
    public static REVIEW_PAGE_NAME = 'REVIEW';
    public static UPLOAD_STATUS_YES = 'Y';
    public static UPLOAD_STATUS_NO = 'N';
    public static DUI_VIOLATION = 'DUI';
    public static NOT_REQUIRED_BY_LAW ='Not Required by Law';
    public static NOT_REQUIRED_BY_LAW_KEY ='NR';
    public static SPL_PAYMENT_TYPE_CODE = 'FI';
    public static SPL_EXTERNAL_CHANNEL = 'EA';
    public static SPL_PAYMENT_ACTION = 'downpayment';
    public static SPL_ENTRY_POINT = 'create-payment';
    public static SPL_EFT_ENTRY_POINT = 'create-schedule';
    public static CUSTOMER_TYPE = 'CSR';
    public static PAYMENT_REFERENCE_STRING_DOWPAY = 'paymentReferenceNumber';
    public static PAYMENT_REFERENCE_STRING_INSTALL = 'scheduleReferenceNumber';
    // State Codes
    public static STATE_IN = 'IN';
    public static STATE_FL = 'FL';
    public static STATE_AZ = 'AZ';
    public static STATE_IL = 'IL';
    public static STATE_CO = 'CO';
    public static STATE_OH = 'OH';
    public static STATE_TX = 'TX';
    public static STATE_VA = 'VA';
    public static STATE_PA = 'PA';
    public static BROAD_FORM_STATES: string[] = ['CO', 'WA'];
    public static APPLICATION_NON_OWNER_STATES: string[]  = ['AZ','IL','TX'];
    public static PD_UMPD_STATES: string[]  = ['IN','TX','VA'];
    public static UMUIM_SYMBOLS_STATES: string[]  = ['IL','CO','OH','TX','VA'];
    // Logger API
    public static LOGGER_INFO = 'info';
    public static LOGGER_ERROR = 'error';
    public static LOGGER_TIME = 'time';

    //Chat
    public static AGENCY_NAME = 'BWR40';

    public static VEHICLE_BANNED_STATES=['DC', 'MA', 'MI', 'NY', 'NJ'];
    public static VEHICLE_NO_INSURANCE_STATES = ['AK', 'HI', 'VT', 'RI', 'DE', 'WV', 'NC'];
    public static PAGE_URLS: string[] = ['/applicant','/drivers','/violations', '/vehicles', '/coverages', '/policyinfo', '/rates', '/reports', '/application', '/review', '/confirmation'];

    public static PAGE_NAME_ARRAY: string[] = ['Applicant','Drivers','Violations', 'Vehicles', 'Coverages', 'Policy Info', 'Rate', 'Reports', 'Application', 'Review', 'Confirmation'];

    public static APPLICANT_NAMED_NON_OWNER ='nno'
    public static VEHICLE_USE_RIDESHARE = 'rideshare';
    public static APPLICANT_NAMED_NON_OWNER_SR22 ='nno_sr22'
    public static APPLICANT_NAMED_NON_OWNER_FR44 = 'nno_fr44';
    public static FILING_FR44 ='fr44'
    public static FILING_SR22 = 'sr22';
    public static CONVICTION_DATE_KEY ='ConvictionDate';

    public static PNI_EXCLUDE_STATES = ['CO', 'OH', 'PA']; //US524598
}
