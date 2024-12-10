import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';
import { reducers, metaReducers } from 'src/app/state/appstate.state';

import { PolicyCoverageValidValues } from './policycoverage-validvalues.component';

describe('PolicyCoverageValidValues', () => {
  let component: PolicyCoverageValidValues;
  let fixture: ComponentFixture<PolicyCoverageValidValues>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolicyCoverageValidValues ],
      imports: [SharedUnittestModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyCoverageValidValues);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
