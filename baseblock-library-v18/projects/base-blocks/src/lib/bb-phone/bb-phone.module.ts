import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBPhoneComponent } from './bb-phone.component';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';
import { BBValidatorsModule } from '../validators/bb-validators.module';


@NgModule({
  declarations: [
    BBPhoneComponent,
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BBFormModule,
    BBValidatorsModule,
  ],
  exports: [
    BBPhoneComponent,
    MaterialModule,
    BBFormModule,
    BBValidatorsModule,
    ],
   providers: []

})
export class BBPhoneModule { }

