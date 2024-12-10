import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DisableDirective } from './disable.directive';

@Component({
  template: `<input type="text" appDisable>`
})
class TestComponent { }

describe('DisableDirective', () => {

  let fixture: ComponentFixture<TestComponent>;
  let inputEl: DebugElement;

  beforeEach( () => {

     fixture = TestBed.configureTestingModule({
      declarations: [ DisableDirective, TestComponent ]
    })
    .createComponent(TestComponent);

    fixture.detectChanges();
    inputEl = fixture.debugElement.query(By.css('input'));
  });
  it('should disable element', () => {

    expect(inputEl.nativeElement.disabled).toBe(false);
  });
});
