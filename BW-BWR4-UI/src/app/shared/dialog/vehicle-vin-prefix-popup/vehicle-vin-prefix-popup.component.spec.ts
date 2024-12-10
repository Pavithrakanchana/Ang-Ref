import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';

import { VehicleVinPrefixPopupComponent } from './vehicle-vin-prefix-popup.component';

describe('VehicleVinPrefixPopupComponent', () => {
  let component: VehicleVinPrefixPopupComponent;
  let fixture: ComponentFixture<VehicleVinPrefixPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedUnittestModule],
      declarations: [ VehicleVinPrefixPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleVinPrefixPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
