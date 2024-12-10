import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';

import { VehicleVinPrefillPopupComponent } from './vehicle-vin-prefill-popup.component';

describe('VehicleVinPrefillPopupComponent', () => {
  let component: VehicleVinPrefillPopupComponent;
  let fixture: ComponentFixture<VehicleVinPrefillPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedUnittestModule],
      declarations: [ VehicleVinPrefillPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleVinPrefillPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
