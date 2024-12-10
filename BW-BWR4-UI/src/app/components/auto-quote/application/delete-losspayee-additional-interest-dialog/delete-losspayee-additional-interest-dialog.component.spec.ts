import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteLosspayeeAdditionalInterestDialogComponent } from './delete-losspayee-additional-interest-dialog.component';

describe('DeleteLosspayeeAdditionalInterestDialogComponent', () => {
  let component: DeleteLosspayeeAdditionalInterestDialogComponent;
  let fixture: ComponentFixture<DeleteLosspayeeAdditionalInterestDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteLosspayeeAdditionalInterestDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteLosspayeeAdditionalInterestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
