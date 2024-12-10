import { Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from 'src/app/modules/angular-material/angular-material.module';
import { DateformatterDirective } from './dateformatter.directive';

@Component({
  template: `
  <div class="col-md-3">
  <mat-form-field class="field-full-width mandatory-field" appearance="outline">
      <!-- Effective Date-->
      <mat-label>Test Effective Date</mat-label>
      <input matInput appDateformatter [matDatepicker]="testEffDate" id="testEffDate" maxlength="10">
      <mat-datepicker #testEffDate></mat-datepicker>
      <mat-datepicker-toggle matSuffix [for]="testEffDate"></mat-datepicker-toggle>
    </mat-form-field>
  </div>`
})
class TestMatDateComponent { }

describe('DateformatterDirective', () => {

  let fixture: ComponentFixture<TestMatDateComponent>;
  let dateField: DebugElement[];  // the three elements w/ the directive
  
  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, AngularMaterialModule],
      declarations: [ DateformatterDirective, TestMatDateComponent ],
      //schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .createComponent(TestMatDateComponent);
  
    fixture.detectChanges(); // initial binding
  
    // all elements with an attached HighlightDirective
    dateField = fixture.debugElement.queryAll(By.directive(DateformatterDirective));
  
  });
  
  it('should format month and date when given 1212', () => {
    const input = dateField[0].nativeElement as HTMLInputElement;
    input.value = '1212';

    input.dispatchEvent(new Event('keyup'));
    fixture.detectChanges();

    expect(input.value).toBe('12/12', 'formatted date');
  });

  it('should format month, date and year when given 12122021', () => {
    const input = dateField[0].nativeElement as HTMLInputElement;
    input.value = '12122021';

    input.dispatchEvent(new Event('keyup'));
    fixture.detectChanges();

    expect(input.value).toBe('12/12/2021', 'formatted date');
  });

  it('should not format date when pass empty date', () => {
    const input = dateField[0].nativeElement as HTMLInputElement;
    input.value = '';

    input.dispatchEvent(new Event('keyup'));
    fixture.detectChanges();

    expect(input.value).toBe('', 'formatted date');
  });

  
});
