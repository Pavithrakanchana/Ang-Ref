import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';

import { DeleteViolationDialogComponent } from './delete-violation-dialog.component';

describe('DeleteViolationDialogComponent', () => {
  let component: DeleteViolationDialogComponent;
  let fixture: ComponentFixture<DeleteViolationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteViolationDialogComponent ],
      imports: [SharedUnittestModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteViolationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
