import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';
import { QuoteDataService } from 'src/app/services/quote-data.service';

import { RetrieveQuoteComponent } from './retrieve-quote.component';

describe('RetrieveQuoteComponent', () => {
  let component: RetrieveQuoteComponent;
  let fixture: ComponentFixture<RetrieveQuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedUnittestModule],
      declarations: [ RetrieveQuoteComponent ],
      providers: [
        QuoteDataService
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetrieveQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
