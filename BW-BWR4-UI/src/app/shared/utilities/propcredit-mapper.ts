import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import QuoteSummary from 'src/app/state/model/summary.model';
import { CreditReportData, CreditReport, Applicant, PersonalInformation, Names, Addresses, PhoneNumbers, DriversLicense, Address, DataSources, EquifaxUSConsumerCreditReport, Models, CustomAttributes } from '../model/services/applicant/propcredit-post-request';
import { zipcodePipe } from '../pipes/zipcode.pipe';
import { environment } from '../../../environments/environment';

export class PropCreditMapper {
  public creditReportData!: CreditReportData;
  public creditReport!: CreditReport;
  public quoteNumber = '';
  public mco = '';
  public agentCode!:string;
  public policyState!: string;

constructor(store: Store<{ quoteSummary: QuoteSummary }>) {
    store.select('quoteSummary').subscribe(data => {
      this.quoteNumber = data.qid;
      this.mco = data.mco;
      this.agentCode = data.producerCode;
      this.policyState = data.policyState;
    });
  }

    /*
        Utility function to map Applicant Form data to PropCredit post request object
    */
        mapPropCreditPostData(applicantFormData: any, operation: string, processOrderInd: string): CreditReportData {

            const datePipe = new DatePipe('en-US');
            const zipcodeFormat = new zipcodePipe();
            const namesData: Names[] = [{
              firstName: applicantFormData.get('firstname')?.value,
              middleName: applicantFormData.get('middlename')?.value == null ? '' : applicantFormData.get('middlename')?.value,
              lastName: applicantFormData.get('lastname')?.value,
              prefixName: applicantFormData.get('prefix')?.value == null ? '' : applicantFormData.get('prefix')?.value,
              suffixName: applicantFormData.get('suffix')?.value == null ? '' : applicantFormData.get('suffix')?.value
            }];

            const phonesData: PhoneNumbers[] = [{
              identifier: 'Home',
              telephoneNumber: applicantFormData.get('phone').value == null ?
                '' : applicantFormData.get('phone').value.replace(/\D/g, ''),
            }];

            const addressData: Addresses[] = [];
            const hasMovedWithinPastSixMonthIndicator = applicantFormData.get('moved').value == null ?
              false : applicantFormData.get('moved').value;
            const currentAddress: Addresses = {
              addressType: 'Current',
              addressStatus: 'Own',
              addressPostRuralIndicator: applicantFormData.get('pobox')?.value? 'POB' :'NOR',
              boxNumber: this.getBoxNumber(applicantFormData.get('pobox').value, applicantFormData.get('address').value),
              ruralRouteNumber: '',
              apartmentNumber: '',
              houseNumber: '',
              streetName: applicantFormData.get('address')?.value,
              streetType: applicantFormData.get('pobox')?.value? '' :'RD',
              city: applicantFormData.get('city')?.value,
              state: applicantFormData.get('state')?.value,
              zip: applicantFormData.get('zipcode').value == null ?
                null : zipcodeFormat.transform(applicantFormData.get('zipcode').value),
              preDirectional: '',
              postDirectional: '',
              durationOfLivingInYYMM: ''
            };

            addressData.push(currentAddress);

            if (hasMovedWithinPastSixMonthIndicator) {
              const previousAddress: Addresses = {
                addressType: 'Previous',
                addressStatus: '',
                addressPostRuralIndicator: applicantFormData.get('prevAddressPO')?.value? 'POB' :'NOR',
                boxNumber: this.getBoxNumber(applicantFormData.get('prevAddressPO').value, applicantFormData.get('prevAddress').value),
                ruralRouteNumber: '',
                apartmentNumber: '',
                houseNumber: '',
                streetName: applicantFormData.get('prevAddress')?.value,
                streetType: '',
                city: applicantFormData.get('prevCity')?.value,
                state: applicantFormData.get('prevState')?.value,
                zip: applicantFormData.get('prevZipcode').value == null ? null :
                  zipcodeFormat.transform(applicantFormData.get('prevZipcode').value),
                preDirectional: '',
                postDirectional: '',
                durationOfLivingInYYMM: ''
              };

              addressData.push(previousAddress);
            }

            const driversAddressData: Address = {
              state: applicantFormData.get('state')?.value
            };

            const driversLicenseData: DriversLicense = {
              driverLicenseNumber: 'A12345678',
              issueDate: '09/29/1978',
              expirationDate: '09/29/2024',
              address: driversAddressData
            };

            const personalInformationData: PersonalInformation = {
              names: namesData,
              socialSecurityNumber: applicantFormData.get('ssn').value == null ? '' : applicantFormData.get('ssn').value.replace(/-/g, ''),
              dateOfBirth: datePipe.transform(
                new Date(applicantFormData.get('birthdate')?.value), 'MM/dd/yyyy') ?? Date.now().toString(),
              age: '',
              householdCode: '',
              addresses: addressData,
              phoneNumbers: phonesData,
              driversLicense: driversLicenseData
            };

            const modelsData: Models[] = [{
              identifier: '05127'
            }];

            const customAttributesData: CustomAttributes[] = [{
              checkCreditRulesIndicator: 'false',
              proprietoryCreditRuleCode: '',
              extraScoreType: '',
              reportProcessingOrderIndicator: processOrderInd,//always '0' unless a soft edit being sent by credit API
              businessTransactionType: 'NB',
              changeInQuoteInformationIndicator: 'true',
              storageLibrary: environment.storageLibrary
            }];

            const equifaxUSConsumerCreditReportData: EquifaxUSConsumerCreditReport = {
              securityCode: '',
              outputFormat: '02',
              ECOAInquiryType: '',
              multipleFileIndicator: '',
              permissiblePurposeCode: '',
              numberOfMonthsToCountInquiries: '',
              models: modelsData,
              customAttributes: customAttributesData
            };

            const dataSourcesData: DataSources = {
              equifaxUSConsumerCreditReport: equifaxUSConsumerCreditReportData
            };

            const applicantData: Applicant[] = [{
              type: 'primary',
              personalInformation: personalInformationData,
              dataSources: dataSourcesData
            }];

          const creditReportData = {
            quoteNumber: this.quoteNumber,
            requestorLOB: 'APV',
            masterCompanyCode: this.mco,
            UWCompanyCode: '00',
            UWCompanyName: '',
            rateBook: 'A',
            effectiveDate: datePipe.transform(
              new Date(applicantFormData.get('polEffDt')?.value), 'MM/dd/yyyy') ?? Date.now().toString(),
          //  quoteReference: applicantFormData.get('callID')?.value,
           // term: applicantFormData.get('policyTerm')?.value,
            coverageState: this.policyState, // applicantFormData.get('state')?.value,
            producerCode: this.agentCode,
            applicants: applicantData
          };



          this.creditReportData = {
            creditReport: creditReportData
          };



          return this.creditReportData;
        }

        private getBoxNumber(pobIndicator: boolean, streetName: string): string {
          var boxNumber = '';

          if (pobIndicator) {
            var parsedStreet = streetName.trim().split(' ');
            boxNumber = parsedStreet[parsedStreet.length-1];
          }

          return boxNumber;
        }
}
