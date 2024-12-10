import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import QuoteSummary from "src/app/state/model/summary.model";
import { HelpText } from "../model/help-text";

@Injectable({
    providedIn: 'root'
  })
export class HelptextMapper {

    title = '';
    text = '';

    private helpTextTitleMap: Map<string, string> = new Map();

    constructor(private store: Store<{ quoteSummary: QuoteSummary }>,) {
        this.helpTextTitleMap.set('8', 'Marital Status');
        this.helpTextTitleMap.set('9', 'Relationship To Insured');
        this.helpTextTitleMap.set('11', 'License Type');
        this.helpTextTitleMap.set('13', 'SR22/FR44');
        this.helpTextTitleMap.set('16', 'Distant Student Discount');
        this.helpTextTitleMap.set('19', 'Mature Driver');
        this.helpTextTitleMap.set('20', 'Course Date');
        this.helpTextTitleMap.set('29', 'Garaging ZIP Code');
        this.helpTextTitleMap.set('36', 'Vehicle Identification Number');
        this.helpTextTitleMap.set('41', 'Vehicle Use');
        this.helpTextTitleMap.set('48', 'Additional Equipment');
        this.helpTextTitleMap.set('50', 'Rental Coverage');
        this.helpTextTitleMap.set('51', 'Loan Lease Coverage');
        this.helpTextTitleMap.set('55', 'Anti-Theft');
        this.helpTextTitleMap.set('86', 'Email Address');
        this.helpTextTitleMap.set('97', 'Effective Date');
        this.helpTextTitleMap.set('104', 'Social Security Number');
        this.helpTextTitleMap.set('107', 'Continuous Coverage');
        this.helpTextTitleMap.set('110', 'Cancel/Expiration Date');
        this.helpTextTitleMap.set('114', 'Multi-Policy Discount');
        this.helpTextTitleMap.set('113', 'Go Paperless Discount');
        this.helpTextTitleMap.set('116', 'EFT Future Installments');
        this.helpTextTitleMap.set('201', 'Down Payment Method');
        this.helpTextTitleMap.set('202', 'Primary Residence');
        this.helpTextTitleMap.set('337', 'Loss Payee');
        this.helpTextTitleMap.set('343', 'Additional Interest');
        this.helpTextTitleMap.set('505', 'eSignature');
        this.helpTextTitleMap.set('632', 'Roadside Assistance');
        this.helpTextTitleMap.set('632', 'Roadside Assistance');
        this.helpTextTitleMap.set('645', 'Text Alerts');
        this.helpTextTitleMap.set('650', 'Household Member Information');
        
       /* Removed from spec
        this.helpTextTitleMap.set('628', 'Education');
        this.helpTextTitleMap.set('629', 'Occupation');
        this.helpTextTitleMap.set('630', 'Sub-Occupation');
        this.helpTextTitleMap.set('631', 'Dispute');
        this.helpTextTitleMap.set('637', 'Policy Term');
        this.helpTextTitleMap.set('641', 'Additional Driver Action');
        this.helpTextTitleMap.set('642', 'Additional Driver Explanation');
        this.helpTextTitleMap.set('643', 'Additional Driver Listed');
        this.helpTextTitleMap.set('644', 'Paid Today');     */

    }

    /**
     * Looks up the help text by fieldID and adds the corresponding title
     * @param fieldID
     * @returns HelpText object representing requested help text
     */
    mapHelpText(fieldID: string): HelpText {

        this.store.select('quoteSummary').subscribe(data => {
            var arrText = data.helpText.filter(text => (text.fieldID == fieldID));
            this.text = arrText.length > 0 ? arrText[0].producerText : '';
            this.title = (this.helpTextTitleMap.get(fieldID) !== '' ? this.helpTextTitleMap.get(fieldID)! : '');
        });

        const helptext: HelpText = {
        fieldID: fieldID,
        title: this.title,
        text: this.text
        };

        return helptext;
    }
}
