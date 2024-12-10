import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Store, StoreModule } from '@ngrx/store';
import { AngularMaterialModule } from 'src/app/modules/angular-material/angular-material.module';
import { Appstate } from 'src/app/state/appstate.state';
import { summaryReducer } from 'src/app/state/reducers/summary.reducer';
import { QuoteSummaryDialogComponent } from '../quote-summary-dialog/quote-summary-dialog.component';

import { QuoteSummaryComponent } from './quote-summary.component';

describe('QuoteSummaryComponent', () => {
  let component: QuoteSummaryComponent;
  let fixture: ComponentFixture<QuoteSummaryComponent>;
  let viewSummaryLink: DebugElement;
  let saveBtn: DebugElement;
  let store: Store<Appstate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        AngularMaterialModule,
        HttpClientTestingModule,
        StoreModule.forRoot({quoteSummary: summaryReducer})
      ],
      declarations: [QuoteSummaryComponent, QuoteSummaryDialogComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(Store);
    fixture = TestBed.createComponent(QuoteSummaryComponent);
    component = fixture.componentInstance;

    viewSummaryLink = fixture.debugElement.query(By.css('#view'));

    fixture.detectChanges();


  });

  it('should define component', () => {
    expect(component).toBeTruthy();
  });

  it('should open summary dialog when click on view summary', async(() => {
    spyOn(component, 'viewSummary');

    expect(viewSummaryLink).toBeDefined();

    viewSummaryLink.nativeElement.click();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.viewSummary).toHaveBeenCalled();
    });
  }));

  it('should call summary dialog and define dialog reference', fakeAsync(() => {
    
    component.viewSummary();

    fixture.detectChanges();

    tick();
    expect(component.viewSummaryDialog).toBeDefined();
    component.viewSummaryDialog?.close()
    /*fixture.whenStable().then(() => {
      
      component.viewSummaryDialog?.close()
    });*/
  }));

  xit('should Save quote when click on Save button', () => {
    //TODO: Implement when Save Functionality is ready
  });


});
