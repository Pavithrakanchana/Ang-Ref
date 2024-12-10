import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { NewAutoQuoteDialogComponent } from './new-auto-quote-dialog.component';

describe('NewAutoQuoteDialogComponent', () => {
  let component: NewAutoQuoteDialogComponent;
  let fixture: ComponentFixture<NewAutoQuoteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewAutoQuoteDialogComponent ],
      imports: [MatDialogModule],
      providers: [
        { 
        provide: MatDialogRef,
        useValue: []
         }, 
        { 
        provide: MAT_DIALOG_DATA, 
        useValue: [] 
        }
        ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAutoQuoteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});