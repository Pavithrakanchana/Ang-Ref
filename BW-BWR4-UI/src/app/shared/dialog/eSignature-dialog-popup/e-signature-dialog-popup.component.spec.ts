import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';

import { ESignatureDialogPopupComponent } from './e-signature-dialog-popup.component';

describe('ESignatureDialogPopupComponent', () => {
  let component: ESignatureDialogPopupComponent;
  let fixture: ComponentFixture<ESignatureDialogPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedUnittestModule],
      declarations: [ ESignatureDialogPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ESignatureDialogPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
