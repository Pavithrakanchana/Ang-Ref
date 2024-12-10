import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UntypedFormBuilder, FormGroupDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from 'src/app/state/appstate.state';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { Router } from '@angular/router';
import { Tracker } from 'src/app/shared/utilities/tracker';
import { ValidValuesService } from 'src/app/shared/services/validvalues/validvalues.service';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule.withRoutes([]),
    BrowserAnimationsModule,
    AngularMaterialModule,
    MatExpansionModule,
    StoreModule.forRoot(reducers, { metaReducers })
],
providers: [
  { provide: MAT_DIALOG_DATA, useValue: {} },
  { provide: MatDialog, useValue: {} },
  { provide: MatDialogRef, useValue: {} },
  // { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigateByUrl'])},
  DatePipe, FormGroupDirective, UntypedFormBuilder,
  HttpClientTestingModule, Tracker, ValidValuesService, FormGroupDirective
],
schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class SharedUnittestModule { }
