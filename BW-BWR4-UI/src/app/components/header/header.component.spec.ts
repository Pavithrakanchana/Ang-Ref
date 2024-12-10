import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderComponent ],
      imports: [SharedUnittestModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it("Header", () => {
    const button = fixture.debugElement.query(By.css("img"));
   const compiled = fixture.debugElement.nativeElement;
   fixture.detectChanges();
   // expect(compiled.innerHTML).toContain("Create New Auto Quote");
   const link = fixture.debugElement.nativeElement.querySelector("a");
   expect(component).toBeTruthy();
   //expect(compiled.querySelector(".logo").textContent).toContain("Bristol West Logo");

  });
});
