import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { SsoService } from 'src/app/services/sso.service';
import { MessagesService } from 'src/app/shared/services/messages.service';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { StatemcoService } from 'src/app/shared/services/statemco.service';

import { AuthComponent } from './auth.component';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedUnittestModule],
      declarations: [AuthComponent],
      providers: [
        QuoteDataService,
        StatemcoService,
        SsoService,
        SpinnerStatusService,
        MessagesService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
