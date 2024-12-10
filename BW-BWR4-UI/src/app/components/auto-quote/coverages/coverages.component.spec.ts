import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';
import { PropCreditService } from 'src/app/services/propcredit.service';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { SharedService } from 'src/app/services/shared.service';
import { MessagesService } from 'src/app/shared/services/messages.service';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { QuoteDataMapper } from 'src/app/shared/utilities/quotedata-mapper';

import { CoveragesComponent } from './coverages.component';

describe('CoveragesComponent', () => {
  let component: CoveragesComponent;
  let fixture: ComponentFixture<CoveragesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedUnittestModule, MatAutocompleteModule],
      declarations: [CoveragesComponent],
      providers: [
        SpinnerStatusService,
        QuoteDataService,
        QuoteDataMapper,
        MessagesService,
        SharedService,
        PropCreditService,
        NavigationService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoveragesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
