import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';
import { AddressVerificationService } from 'src/app/services/address-verification.service';
import { ApplicationService } from 'src/app/services/application.service';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { MessagesService } from 'src/app/shared/services/messages.service';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { ValidValuesService } from 'src/app/shared/services/validvalues/validvalues.service';
import { QuoteDataMapper } from 'src/app/shared/utilities/quotedata-mapper';
import { Tracker } from 'src/app/shared/utilities/tracker';

import { ApplicationComponent } from './application.component';

describe('ApplicationComponent', () => {
  let component: ApplicationComponent;
  let fixture: ComponentFixture<ApplicationComponent>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    // const applicationServiceSpy = jasmine.createSpyObj('ApplicationService', ['getProducerNameData']);
    await TestBed.configureTestingModule({
      imports: [SharedUnittestModule],
      declarations: [ApplicationComponent],
      providers: [
        UntypedFormBuilder,
        ApplicationService,
        MessagesService,
        SpinnerStatusService,
        QuoteDataMapper,
        QuoteDataService,
        AddressVerificationService,
        ValidValuesService,

        NavigationService,
        Tracker,
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
