import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';
import { GoPaperlessPopupComponent } from './go-paperless-popup.component';


describe('GoPaperlessPopupComponent', () => {
  let component: GoPaperlessPopupComponent;
  let fixture: ComponentFixture<GoPaperlessPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedUnittestModule],
      declarations: [ GoPaperlessPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoPaperlessPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
