import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ValidValuesService } from '../../services/validvalues/validvalues.service';
import { AddionalInterest } from 'src/app/shared/model/autoquote/autoquote.model';
import { ZipCodeValidator } from '../../validators/zipcode.validator';
import { AddressVerificationService } from 'src/app/services/address-verification.service';
import { MessagesService } from '../../services/messages.service';
import { MessageConstants } from 'src/app/constants/message.constant';
import { PopupMailingAddressComponent } from '../popup-mailing-address/popup-mailing-address.component';
import { CommonUtils } from '../../utilities/common-utils';
import { HelptextMapper } from '../../utilities/helptext-mapper';
import { HelpTextDialogComponent } from '../helptext-dialog/helptext-dialog.component';
import { ObjectUtils } from '../../utilities/object-utils';
import { SharedService } from 'src/app/services/shared.service';
import { Tracker } from '../../utilities/tracker';

@Component({
    selector: 'app-loss-payee-popup',
    templateUrl: './loss-payee-popup.component.html',
    styleUrls: ['./loss-payee-popup.component.scss']
})
export class LossPayeePopupComponent implements OnInit {
    showTextAlertMessage = false;
    lossPayeeAdd!: UntypedFormGroup;
    vehicleLienFormArray: any;
    vehicle_LP_AI_data: any;
    addionalInterest?: AddionalInterest[];
    address?: any[] = [];
    nameValidPattern = /^[A-Za-z-'\s]*$/;
    dblosspayeeData!: any;
    // reqVehiclesForAddressScrub: any[] = [];
    addressSoftErrArr: string[] = [];
    softEditStatus: boolean = false;
    errorMessage = '';
    infoMessage!: string;
    addressVerified = false;
    lhIndex: any;
    hiddenField: string[] = [];
    linenHolderObject!: any;
    stateValues: any;

    constructor(public fb: UntypedFormBuilder,
        public validValuesService: ValidValuesService,
        public LPAIdialogRef: MatDialogRef<LossPayeePopupComponent>,
        private addressService: AddressVerificationService,
        private readonly messageService: MessagesService,
        public addressDialog: MatDialog,
        private helpTextMapper: HelptextMapper,
        public helpTextDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private sharedService: SharedService,
        private messageservice: MessagesService,
        private logTracker: Tracker) {
    }

    closeDialog(val: boolean) {

        this.LPAIdialogRef.close({ event: val, data : this.addionalInterest });
    }

    ngOnInit(): void {

        this.vehicleLienFormArray = this.data.vehicleLienFormArray;
        this.linenHolderObject = this.data.linenHolderObject;
        this.vehicle_LP_AI_data = this.data.LP_AI_data;
        this.lhIndex = this.data.lhIndex;
        this.stateValues = this.data.stateValues;

        this.lossPayeeAdd = this.fb.group({
            type: ['LP', Validators.required], //['', Validators.required],
            firstName: ['', [Validators.pattern(this.nameValidPattern)]],
            lastName: '',
            middleName: '',
            institutionName: ['', [Validators.required, Validators.pattern(this.nameValidPattern)]], //['', Validators.required],
            address: ['', [Validators.required, Validators.pattern("^[A-Za-z0-9 \/\&\.\'\#\-]+$")]],
            state: ['', Validators.required],//this.policyState
            city: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z -]*$')]],
            zipcode: ['', [Validators.required, ZipCodeValidator.zipcodeValidator]],
        });

        this.loaddataLPAI(this.vehicle_LP_AI_data);
    }

    loaddataLPAI(vehicle_LP_AI_data: any) {

        if (vehicle_LP_AI_data.length != 0) {

            this.lossPayeeAdd.controls.type.patchValue(vehicle_LP_AI_data.type);
            vehicle_LP_AI_data.type === 'LP' ? this.lossPayeeAdd.controls.institutionName.patchValue(vehicle_LP_AI_data.institutionName) : this.lossPayeeAdd.controls.firstName.patchValue(vehicle_LP_AI_data.firstName);
            this.updateControlValidation(vehicle_LP_AI_data.type);
            this.lossPayeeAdd.controls.address.patchValue(vehicle_LP_AI_data.addresses[0].streetName);
            this.lossPayeeAdd.controls.state.patchValue(vehicle_LP_AI_data.addresses[0].state);
            this.lossPayeeAdd.controls.city.patchValue(vehicle_LP_AI_data.addresses[0].city);
            this.lossPayeeAdd.controls.zipcode.patchValue(vehicle_LP_AI_data.addresses[0].postalCode);
        }
        this.checkVisibilityStatus();
    }

    loadHelpText(fieldID: string): void {
        let helpTextObj = this.helpTextMapper.mapHelpText(fieldID);

        if (helpTextObj) {
          this.helpTextDialog.open(HelpTextDialogComponent, {
            width: '30%',
            panelClass: 'full-width-dialog',
            data: {
              title: helpTextObj.title,
              text: helpTextObj.text
            }
          });
        }
      }

    onTypeChange(value: any) {

        this.updateControlValidation(value);
    }
    updateControlValidation(value: any) {
         this.lossPayeeAdd.controls.type.patchValue(value);
        if (value === 'LP') {
            CommonUtils.updateControlValidation(this.lossPayeeAdd?.controls?.firstName, false);
            CommonUtils.updateControlValidation(this.lossPayeeAdd?.controls?.institutionName, true);
        }
        else if (value === 'AI') {
            CommonUtils.updateControlValidation(this.lossPayeeAdd?.controls?.institutionName, false);
            CommonUtils.updateControlValidation(this.lossPayeeAdd?.controls?.firstName, true);
        }
    }

    /* Handle form errors */
    public hasError = (controlName: string, errorName: string) => {
        return this.lossPayeeAdd.controls[controlName].hasError(errorName);
    }

    openDialog(addressComparer: any): void {
        const dialogRef = this.addressDialog.open(PopupMailingAddressComponent, {
            width: '80%',
            panelClass: 'full-width-dialog',
            disableClose: true,
            data: {
                compareObj: addressComparer
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            const dialogValue = result;
            if (dialogValue.event) {
                addressComparer.forEach((obj: any, i: number) => {
                    if (dialogValue.data['addressSelection' + i] !== 'enteredAddress') {
                        this.patchAddressDetails(obj);
                    }
                });
            }
        });
    }

    patchAddressDetails(obj: any) {
        const correctedAddress = obj.correctedAddress;
        this.lossPayeeAdd.patchValue({
            address: correctedAddress.fullStreetAddress,
            city: correctedAddress.city,
            state: correctedAddress.state,
            zipcode: correctedAddress.zipCode
        });
        this.objectFormation();
        this.LPAIdialogRef.close({
            event: true,
            data: this.addionalInterest
        });
    }

    objectFormation(){
        this.address = [{
            streetName: this.lossPayeeAdd.value?.address,
            city: this.lossPayeeAdd.value?.city,
            state: this.lossPayeeAdd.value?.state,
            postalCode: this.lossPayeeAdd.value?.zipcode,
            id: '',
            addressType: '',
            addressLine: '',
            postalOfficeBoxNumber: '',
            POBoxIndicator: false,
            ruralRouteNumber: '',
            apartmentNumber: '',
            houseNumber: '',
            streetType: '',
            movedWithinPastSixMonthIndicator: false
        }]
        this.addionalInterest = [
            {
                type: this.lossPayeeAdd.value?.type,
                firstName: this.lossPayeeAdd.value?.type === 'AI' ? this.lossPayeeAdd.value?.firstName : '',
                lastName: this.lossPayeeAdd.value?.type === 'AI' ? this.lossPayeeAdd.value?.lastName : '',
                middleName: this.lossPayeeAdd.value?.type === 'AI' ? this.lossPayeeAdd.value?.middleName : '',
                institutionName: this.lossPayeeAdd.value?.type === 'LP' ? this.lossPayeeAdd.value?.institutionName : '',
                addresses: this.address
            }
        ]
    }

    checkVisibilityStatus() {
        const lineHolderValues = ['LP', 'AI'];
            lineHolderValues?.forEach((val: string) => {
                if (this.linenHolderObject == undefined){
                    if(this.lossPayeeAdd.value.type != val){
                    this.hiddenField.push(val);
                    }
                }else{
                    const vehicleLineHolder = this.linenHolderObject.filter((obj: { type: any; }) => obj.type === val);
                    if (!this.hiddenField.includes(val) && vehicleLineHolder?.length > 0) { // If  LP/ AI is already in hiddenField array, dont push/add again
                        this.hiddenField.push(val)
                    }
                }
            });
        if (this.hiddenField.length == 1) {
            const visibleLineHolder = lineHolderValues.filter((x: any) => x !== this.hiddenField[0]);
            this.updateControlValidation(visibleLineHolder[0]);
        }

    }

    submit(formData: any) {
        let zip = this.lossPayeeAdd.value.zipcode;
        this.lossPayeeAdd.value.zipcode = zip.length <= 6 ? zip.replace(/-/g, "") : zip;

        this.objectFormation();

        if(this.lhIndex !== ''){
            this.vehicleLienFormArray.at(this.lhIndex).patchValue({
                type: this.lossPayeeAdd.value?.type,
                firstName: this.lossPayeeAdd.value?.type === 'AI' ? this.lossPayeeAdd.value?.firstName : '',
                lastName: this.lossPayeeAdd.value?.type === 'AI' ? this.lossPayeeAdd.value?.lastName : '',
                middleName: this.lossPayeeAdd.value?.type === 'AI' ? this.lossPayeeAdd.value?.middleName : '',
                institutionName: this.lossPayeeAdd.value?.type === 'LP' ? this.lossPayeeAdd.value?.institutionName : '',
                address: this.lossPayeeAdd.value?.address,
                state: this.lossPayeeAdd.value?.state,//this.policyState
                city: this.lossPayeeAdd.value?.city,
                zipcode: this.lossPayeeAdd.value?.zipcode
              });
        }
        else{
            this.vehicleLienFormArray.push(this.lossPayeeAdd);
        }

        if (this.lossPayeeAdd.valid) {

          const state = this.lossPayeeAdd.value.state;
          const zipcode = zip.length <= 6 ? zip.replace(/-/g, "") : zip;
          if (!ObjectUtils.isFieldEmpty(state) && !ObjectUtils.isFieldEmpty(zipcode)) {
          let startTime = new Date();
          let zipPin = zipcode.substring(0,5);
          this.sharedService.getStatesByZipcode(zipPin).subscribe((data: any) => {

            const states = data.States;

            if ((states?.length > 0 && states[0] !== state) || states?.length === 0) {

              const errorMsg = [];
              errorMsg.push(MessageConstants.INVALID_ZIP_CODE);
              this.messageservice.showError([MessageConstants.INVALID_ZIP_CODE]);
              const element = document.querySelector('#topcontent');
              element?.scrollIntoView();
            } else {
              this.messageservice.clearErrors();

          const verifyAddressObj = this.addressService.verifyAddress(this.dblosspayeeData, this.address);
          if (verifyAddressObj) {
              this.addressService.getAddressScrubbingResult(this.address).subscribe((addressResults: Array<any>) => {
                  const addressErrors: any = this.addressService.checkForAddressErrors(addressResults, 'lienHolder', MessageConstants.LP_AI_ADDRESS_SCRUBBING_TYPE);
                  this.messageService.softError([]);
                  if (addressErrors?.COR.length > 0) {
                      addressErrors?.COR?.forEach((obj: any, i: number) => {
                        if(obj.correctedAddress.fullStreetAddress.length > 30){
                            obj.correctedAddress.fullStreetAddress = obj.correctedAddress.fullStreetAddress.substring(0,30);
                        }
                          this.patchAddressDetails(obj);
                      });
                  }
                  let softEditCheck = addressErrors?.softEdit?.filter((item: string) => this.addressSoftErrArr?.indexOf(item) < 0);
                  // this.softEditStatus = false;
                  this.softEditStatus = softEditCheck.length > 0 ? false : true;
                  if (addressErrors?.softEdit.length > 0 && !this.softEditStatus) {
                      this.messageService.softError(addressErrors?.softEdit);
                      this.softEditStatus = true;
                      const element = document.querySelector('.topcontent');
                      element?.scrollIntoView();
                      this.addressSoftErrArr = addressErrors?.softEdit;
                      setTimeout(()=>{
                        this.closeDialog(true);
                      }, 1000);
                  } else {
                      const compareObj = this.addressService.compareScrubAddressWithFormAddress(addressResults, this.address, 'lienHolder', MessageConstants.LP_AI_ADDRESS_SCRUBBING_TYPE);
                      if (compareObj.length > 0) {
                          this.openDialog(compareObj);
                      }else {
                          this.closeDialog(true);
                      }
                  }
              });
          }
            }

            this.logTracker.loginfo(this.constructor.name, 'submit', 'losspayeecomponent.getStatesByZipcode',
            'Duration='.concat(CommonUtils.elapsedTime(startTime).toString()));
        }, (errorData: any) => {

          this.logTracker.logerror(this.constructor.name, 'checkForValidZipCode', 'sharedService.getStatesByZipcode',
            'Error=Get state by zipcode', errorData);

        });
        }

        }
    }

    closeLossPayee() {
      this.messageService.clearErrors();
      this.closeDialog(false);
    }
}
