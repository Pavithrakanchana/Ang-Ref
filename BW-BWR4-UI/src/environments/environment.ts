// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  authguardEnabled: false,
  ui: './assets/data/',
  baseUrl: 'https://nodeqa2.bwproducers.com/AFT43/',
  // baseUrl: 'https://nodeqa2.bwproducers.com/REG43/', // AZ
  baseWASUrl: 'https://qarating.bristolwest.com/',
  // loggerUrl: 'https://nodeqa.bwproducers.com/log/',
  loggerUrl: 'http://localhost:3002/log/',
  enableLogger: false,
  // getQuoteNumberURL: 'https://nodedev.bwproducers.com/AFT43/bwprospectquotems/v1/quotes/quoteNumber/',
  quoteNumberAPI: 'bwautoquotems/v1/:mco/quoteNumber',
  rateBookAPI: 'bwautoquotems/v1/state/:ST/mco/:MC/ratebook',
  saveQuoteAPI: 'bwautoquotems/v1/quotes',
  retrieveQuoteAPI: 'bwautoquotems/v1/quotes/:quoteNumber',
  regUserURL: 'https://www.bristolwest.com/register?',
  rateQuoteAPI: 'bwautoquotems/v1/quotes',
  driversClueReportAPI: '/bwdriverms/v1/riskreports',
  vintelligenceSymbolsAPI: 'bwvehiclems/v1/vehicle/:vin',
  vintelligenceMakesAPI: 'bwvehiclems/v1/vehicle/years/:year/makes',
  vintelligenceModelsAPI: 'bwvehiclems/v1/vehicle/years/:year/makes/:make/models',
  vinPrefixAPI: 'bwvehiclems/v1/vehicle/vinprefixes?operation=searchForVinPrefixes',
  vintelSymbolsAPI: 'bwvehiclems/v1/vehicle/symbols?operation=getVehicleSymbols',
  addressVerificationAPI: 'PolicyHolderREST/scrubAddress',
  bwLookupPriCarAPI: 'bwlookupms/v1/lookup',
  bwTokenAPI: 'bwtokenms/v1/provider/providerId/userValidation',
  bwGenerateTokenAPI: 'bwtokenms/v1/provider/providerId/tokens',
  retrieveApplicantURL: 'bwprospectquotems/v1/quotes/QID/prospect?operation=retrieveProspects',
  saveApplicantURL: 'bwprospectquotems/v1/quotes/QID/prospect?operation=saveProspects',
  updateApplicantURL: 'bwprospectquotems/v1/quotes/QID/prospect?operation=updateProspects',
  retrieveDriversURL: 'bwdriverms/v1/quotes/QID?operation=retrieveDrivers',
  saveDriversURL: 'bwdriverms/v1/quotes/QID?operation=saveDrivers',
  vehicleHistoryReportURL: 'bwreportingms/v1/policies/QID/vehicleHistoryReport?operation=orderAndGetVehicleHistory',
  //helpTextURL: 'PolicyHolderREST/getAllHelpText?appid=BWR&mco=28&state=02&ratebook=All&lob=APV',
  propCreditReportURL: 'bwcreditcheckms/v1/reports/creditReport',
  propCreditStatusURL: 'bwcreditcheckms/v1/QID/creditReport/status',
  validValuesAPI:'PolicyHolderREST/getDropDownValues',
  validValues: 'PolicyHolderREST/getValidValues',
  consentValues: 'PolicyHolderREST/getConsentMessage',
  BIPDvalidValues:'PolicyHolderREST/getOutOfStateLimitsValidValues',
  getStatesByZipcodeURL:'PolicyHolderREST/getstatebyzipcode?zipCode=garageZipCode',
  muleClientId : '877178104829494b962d336636fe1f32', // old- 320fd4dc1bc14f8ea08b7e9f26fe5128
  muleClientSecret: 'F242333Bd8f44761b1eA15116CF5dBeE', // old - 7f2516bd472e43e2AD6DF875F3A86AE3
  vinPrefillPOSTAPI:'bwdriverms/v1/autoPrefillReport?filterBy=priorVehicles',
  vinPrefillGETStatusAPI:'bwdriverms/v1/autoPrefillReport/quoteNumber?filterBy=priorVehicles&masterCompany=:masterCompany',
  //# US153321-US292902-producerInformationSection
  getLicensedAgentsAPI: 'PolicyHolderREST/getLicensedAgents',
  edmrFormsAPI: '/bwdocumentms/v1/documents',
  emailVerificationAPI: 'PolicyHolderREST/validateEmail',
  emailDuplicateCheckAPI: 'PolicyHolderREST/checkForDupPolicyEmail',
  producerPOSTAPI: 'PolicyHolderREST/requestNewAgent',
  paymentRegion: 'SIT3',
  paymentIframeURL: 'https://frms-sit-319.paymentus.io/xotp/pm/frms?authToken=',
  splPaymentIframeURL: 'https://frms-sit-319.paymentus.io/biller/federation/frms?v2=true&itok=',
  paymentTokenURL: 'PolicyHolderREST/generateIframeToken',
  splPaymentTokenURL: 'PolicyHolderREST/generateSplIVRIframeToken',
  paymentIframeOrigin: 'https://frms-sit-319.paymentus.io',
  paymentListMethods: 'pymtms/v1/customers/{AccountNumber}/paymentMethods?idType=ECN', //'https://apis-bweisg-aft.farmersinsurance.com/pymtms/v1/customers/{AccountNumber}/paymentMethods?idType=ECN',
  paymentDeleteMethod: 'pymtms/v1/customers/{AccountNumber}/paymentMethods/{PaymentMethodToken}', //'https://apis-bweisg-aft.farmersinsurance.com/pymtms/v1/customers/{AccountNumber}/paymentMethods/{PaymentMethodToken}',
  paymentEnrollAutoPay: 'pymtms/v1/accounts/{AccountNumber}/payment?idType=accountNumber&operation=recurringSetup',
  paymentCancelAutoPay: 'pymtms/v1/accounts/{AccountNumber}/payments/{referenceNumber}?accountIdType=billingAccountNumber&operation=cancelRecurring',
  paymentAutopayDetails: 'pymtms/v1/accounts/{AccountNumber}/payment?idType=billingAccountNumber&filter=recurringDetails',
  cancelSPLDownPayURL: 'pymtms/v1/accounts/{AccountNumber}/payments/{referenceNumber}?accountIdType=billingAccountNumber&operation=voidPayment',
  
  bindAPI: 'bwplcyms/v1/policies/{policyNumber}/quotes/{quoteNumber}?operation=bind',
  programGuideIA: 'http://fawincdp06887v/BWPFiles/Guides/Foremost/{StateID}/Select_4.0_Rule_Guide.pdf',
  programGuideEA: 'http://fawincdp06887v/BWPFiles/Guides/{StateID}/Select_4.0_Rule_Guide.pdf',
  invokeExstreamFeedURL :'PolicyHolderREST/invokeExstreamFeed',
  fetchDocumentsURL:'PolicyHolderREST/fetchDocument',
//DB libraries
storageLibrary: 'TSL50LIBOQ',
returnQuoteSearch : "https://www.bwproducers.com/",
  bwpFormsEA: 'http://qa1.bwproducers.com/Producers/ssologin.aspx?page=forms&agentCode={PID}&ssot={SID}',
  bwpFormsIA: 'http://qa.iaproducers.com/Producers/ssologin.aspx?page=forms&agentCode={PID}&ssot={SID}'

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
import { VintelligenceSymbolsService } from '../app/services/vintelligence-symbols.service';
