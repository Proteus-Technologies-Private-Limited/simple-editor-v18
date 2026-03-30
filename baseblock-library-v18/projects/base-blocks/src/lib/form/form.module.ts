import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import {ValidationComponent} from './validation';
import {MaterialModule} from '../mat-module';

@NgModule({
  declarations: [
    ValidationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
  ],
  exports: [
     MaterialModule,
    ValidationComponent,
    ],
   providers: []

})
export class BBFormModule { }

 
