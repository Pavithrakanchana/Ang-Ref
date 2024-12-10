import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';

import { VehicleCoverageValidvaluesComponent } from './vehiclecoverage-validvalues.component';

describe('VehicleCoverageValidvaluesComponent', () => {
  let component: VehicleCoverageValidvaluesComponent;
  let fixture: ComponentFixture<VehicleCoverageValidvaluesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedUnittestModule],
      declarations: [ VehicleCoverageValidvaluesComponent ],

    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleCoverageValidvaluesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
