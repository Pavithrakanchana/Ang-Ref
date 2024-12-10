// We import all the angular testing tools that we are going to use.
// We import all the dependencies that this component has.
// We use a “describe” to start our test block with the title matching the tested component name.
// We use an async before each. The purpose of the async is to let all the possible asynchronous code to finish before continuing.

import { TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { SharedUnittestModule } from './modules/shared/shared-unittest.module';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedUnittestModule],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });


  it(`should be the step 1`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.currentStep).toEqual(0);
  });

  xit('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled).toBeTruthy()
     //expect(compiled.querySelector('.content span').textContent).toContain('BW-BWR4-UI app is running!');
  });
});
