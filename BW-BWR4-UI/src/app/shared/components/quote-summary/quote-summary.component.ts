import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import QuoteSummary from 'src/app/state/model/summary.model';
import { NavigationService } from '../../services/navigation.service';
import { QuoteSummaryDialogComponent } from '../quote-summary-dialog/quote-summary-dialog.component';
import { SaveExitPopupComponent } from 'src/app/shared/dialog/save-exit-popup/save-exit-popup.component';


@Component({
  selector: 'app-quote-summary',
  templateUrl: './quote-summary.component.html',
  styleUrls: ['./quote-summary.component.scss']
})
export class QuoteSummaryComponent implements OnInit {
   
  viewSummaryDialog: MatDialogRef<QuoteSummaryDialogComponent> | undefined;
  // saveExitDialog : MatDialogRef<SaveExitPopupComponent> | undefined;

  constructor(private dialogModel: MatDialog,
    public saveExitDialog: MatDialog, private navigationService: NavigationService,
    private store: Store<{ quoteSummary: QuoteSummary }>) {
     }

  ngOnInit(): void {
  }

  viewSummary(): void {
    this.viewSummaryDialog = this.dialogModel.open(QuoteSummaryDialogComponent, {
      width: '45%',
      height: 'auto',
      panelClass: 'full-width-dialog'
    });
  }

  saveQuote(): void {
    // update the navigation service
    const saveExitDialogRef = this.saveExitDialog.open(SaveExitPopupComponent, {
      width: '25%',
      height: 'auto',
      panelClass: 'save-exit-dialog'
    });
    saveExitDialogRef.afterClosed().subscribe(result => {
      if (result?.clicked === 'save') {         
        this.navigationService.updateNavigationRequestedRoute('save-/exit');        
      }
    });

    // this.navigationService.updateNavigationRequestedRoute('/exit');
  }
}
