import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';

import { SaveExitPopupComponent } from './save-exit-popup.component';

describe('SaveExitPopupComponent', () => {
  let component: SaveExitPopupComponent;
  let fixture: ComponentFixture<SaveExitPopupComponent>;

  beforeEach(async () => {
    //const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    await TestBed.configureTestingModule({
      imports: [SharedUnittestModule],
      declarations: [ SaveExitPopupComponent ],
      /*providers: [
        {provide: Router, useValue: routerSpy}

      ]*/
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveExitPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
