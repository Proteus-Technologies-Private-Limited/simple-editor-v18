import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBSelect,BBOption } from './bb-choice.component';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';



@NgModule({
  declarations: [
    BBSelect,
    BBOption
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
    BBSelect,
    BBOption,
    MaterialModule,
    BBFormModule,
    ],
   providers: []

})
export class BBSelectModule { }

