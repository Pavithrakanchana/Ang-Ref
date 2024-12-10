import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';
import { SafePipe } from '../../pipes/safe.pipe';
import { PaymentsService } from '../../services/payments.service';
import { SpinnerStatusService } from '../../services/spinner-status.service';

import { PaymentMethodComponent } from './payment-method.component';

describe('PaymentMethodComponent', () => {
  let component: PaymentMethodComponent;
  let fixture: ComponentFixture<PaymentMethodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedUnittestModule, SafePipe],
      declarations: [ PaymentMethodComponent ],
      providers: [
        PaymentsService,
        SpinnerStatusService,
        SafePipe
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
