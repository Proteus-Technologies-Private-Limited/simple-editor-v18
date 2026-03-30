import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBLabelComponent } from './bb-label.component';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';

@NgModule({
  declarations: [
    BBLabelComponent,
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BBFormModule
  ],
  exports: [
    BBLabelComponent,
    MaterialModule,
    BBFormModule
    ],
   providers: []

})
export class BBLabelModule { }

