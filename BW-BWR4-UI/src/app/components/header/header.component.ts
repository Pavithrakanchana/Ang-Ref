import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import QuoteSummary from 'src/app/state/model/summary.model';
import { SsoService } from 'src/app/services/sso.service';
import { Tracker } from 'src/app/shared/utilities/tracker';
import { TokenGenRes } from 'src/app/shared/model/sso/generate-token-res.model';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  sessionTicket: any;
  channel!: string;
  producerCode!: string;
  quoteNumber!: string;
  policyStateId!: string;
  qid: string = '';

  constructor(public ssoDataService: SsoService,
    private store: Store<{ quoteSummary: QuoteSummary }>,
    private showSpinnerService: SpinnerStatusService, private logTracker: Tracker) {
  }

  ngOnInit(): void {
    this.store.select('quoteSummary').subscribe(data => {
      this.sessionTicket = data.sessionToken;
      this.channel = data.channel;
      this.producerCode = data.producerCode;
      this.quoteNumber = data.qid;
      this.policyStateId = data.policyState;
    });
  }

  launchProgramGuide() {
    let programGuideURL = this.channel === 'EA' ? `${environment.programGuideEA}` : `${environment.programGuideIA}`;
    programGuideURL = programGuideURL.replace('{StateID}', this.policyStateId);
    this.logTracker.loginfo(this.constructor.name, 'launchProgramGuide', 'Launching Program Guide', 'Forms Path='.concat(programGuideURL));
    window.open(programGuideURL, "_blank");
  }


  redirectForms() {

    this.showSpinnerService.showSpinner(true);


    this.ssoDataService.generateToken(this.sessionTicket).subscribe({

      next: (res: TokenGenRes) => {
        this.showSpinnerService.showSpinner(false);
        let bwFormURL = this.channel === 'EA' ? `${environment.bwpFormsEA}` : `${environment.bwpFormsIA}`;
        bwFormURL = bwFormURL.replace('{PID}', this.producerCode);
        bwFormURL = bwFormURL.replace('{SID}', res.tokens[0].token.tokenId);

        this.logTracker.loginfo(this.constructor.name, 'redirectForms', 'Generating Token', 'Forms Path='.concat(bwFormURL));
        window.open(bwFormURL, "_blank");
      },
      complete(): void {  },
      error: err => {
        this.showSpinnerService.showSpinner(false);
        this.logTracker.logerror(this.constructor.name, 'redirectForms', 'Generating Token', 'Error=', err);
      }

    });
  }
}
