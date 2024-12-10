import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';

import { QuoteStartUpComponent } from './quote-start-up.component';

describe('QuoteStartUpComponent', () => {
  let component: QuoteStartUpComponent;
  let fixture: ComponentFixture<QuoteStartUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedUnittestModule],
      declarations: [ QuoteStartUpComponent ],

      providers: [
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteStartUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("create auto button name", () => {
    const button = fixture.debugElement.query(By.css("button"));
   const compiled = fixture.debugElement.nativeElement;
   fixture.detectChanges();
   // expect(compiled.innerHTML).toContain("Create New Auto Quote");
   expect(compiled.querySelector(".btn-primary").textContent).toContain("Create Quote");

  });


   /*
  it("Label name for Create quote tab", () => {
    fixture.detectChanges();
    let labelName = fixture.debugElement.query(By.css("label[for=Create Quote]"));
    expect(labelName).toBeTruthy();
    //expect(labelName).toBe("Create Quote");
  });

  it("should remove post upon Create Quote click", () => {
    component.quoteText = "This is a fresh post";
    fixture.detectChanges();
    let labelName = fixture.debugElement.query(By.css("label[for=Create Quote]"));
    // expect(labelName).toBe("Click Me");
    // fixture.debugElement
      // .query(By.css(".row"))
      // .query(By.css(".card"))
      // .triggerEventHandler("click", null);
      fixture.debugElement
      .query(By.css("label[for=Create Quote]"))
      .triggerEventHandler("click", null);
      const compiled = fixture.debugElement.nativeElement;
      const labels = Array.from(compiled.querySelectorAll('label'));
      //.map(({ textContent }) => textContent);
      expect(labels).toContain('City');
   // const compiled = fixture.debugElement.nativeElement;
    expect(compiled.innerHTML).toContain("This is a fresh post");
  });
*/
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
