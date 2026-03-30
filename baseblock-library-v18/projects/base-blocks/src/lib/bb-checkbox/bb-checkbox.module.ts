import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBCheckboxComponent } from './bb-checkbox.component';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';


@NgModule({
  declarations: [
   BBCheckboxComponent
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BBFormModule,
  ],
  exports: [
    BBCheckboxComponent,
    MaterialModule,
    BBFormModule,
    ],
   providers: []

})
export class BBCheckboxModule { }

