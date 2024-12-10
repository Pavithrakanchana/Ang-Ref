import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';

import { AddViolationComponent } from './add-violation.component';

describe('AddViolationComponent', () => {
  let component: AddViolationComponent;
  let fixture: ComponentFixture<AddViolationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddViolationComponent ],
      imports: [SharedUnittestModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddViolationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
