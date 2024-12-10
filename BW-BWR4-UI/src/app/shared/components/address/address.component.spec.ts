import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';
import { ValidValuesService } from '../../services/validvalues/validvalues.service';

import { AddressComponent } from './address.component';

describe('AddressComponent', () => {
  let component: AddressComponent;
  let fixture: ComponentFixture<AddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedUnittestModule],
      declarations: [ AddressComponent ],
      providers: [
        ValidValuesService
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
