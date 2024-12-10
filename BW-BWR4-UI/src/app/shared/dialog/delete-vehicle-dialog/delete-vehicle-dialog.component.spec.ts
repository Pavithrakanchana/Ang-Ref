import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteVehicleDialogComponent } from './delete-vehicle-dialog.component';

describe('DeleteVehicleDialogComponent', () => {
  let component: DeleteVehicleDialogComponent;
  let fixture: ComponentFixture<DeleteVehicleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteVehicleDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteVehicleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
