import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { AngularMaterialModule } from 'src/app/modules/angular-material/angular-material.module';
import { Appstate } from 'src/app/state/appstate.state';
import { summaryReducer } from 'src/app/state/reducers/summary.reducer';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { QuoteSummaryDialogComponent } from './quote-summary-dialog.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { selectQuoteSummary } from 'src/app/state/selectors/summary.selector';

describe('QuoteSummaryDialogComponent', () => {
  let component: QuoteSummaryDialogComponent;
  let fixture: ComponentFixture<QuoteSummaryDialogComponent>;
  let store: MockStore<Appstate>;
  let quoteSummarySelector;
  const mockInitialState = {
    quoteNumber: 'Q01-1234567-00',
    drivers: [
        {
            firstName: 'John',
            lastName: 'Doe'
        },
        {
            firstName: 'Jane',
            lastName: 'Doe'
        }
    ],
    vehicles: [
        {
            year: 2015,
            make: 'Toyota',
            model: 'Camry SE',
            vin: 'AABBCC123456'
        }]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AngularMaterialModule,
        HttpClientTestingModule,
        StoreModule.forRoot({quoteSummary: summaryReducer})
      ],
      declarations: [ QuoteSummaryDialogComponent ],
      providers: [
         provideMockStore(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(async () => {
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(QuoteSummaryDialogComponent);
    component = fixture.componentInstance;
    // quoteSummarySelector = store.overrideSelector(selectQuoteSummary, mockInitialState);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.quoteSummary$).toBeDefined();
  });

  it('should define store', () => {
    expect(store).toBeDefined();
  });

  it('should contain quote number from mock store', async() => {
    const quoteNum = fixture.debugElement.queryAll(By.css('h1'));
    expect(quoteNum[0].nativeElement.textContent).toBe('Quote Summary - Q01-1234567-00');
  });

  it('should contain 2 drivers from mock store', async() => {
    const driversLen = fixture.debugElement.queryAll(By.css('#drivers li')).length;
    expect(driversLen).toBe(2);
  });

  it('should contain 1 vehicle from mock store', async() => {
    const vehiclesLen = fixture.debugElement.queryAll(By.css('#vehicles li')).length;
    expect(vehiclesLen).toBe(1);
  });
});
