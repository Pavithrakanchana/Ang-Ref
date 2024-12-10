import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';

import { AppMessageComponent } from './app-message.component';

describe('AppMessageComponent', () => {
  let component: AppMessageComponent;
  let fixture: ComponentFixture<AppMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppMessageComponent ],
      imports: [SharedUnittestModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
