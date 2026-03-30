import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBPasswordComponent } from './bb-password.component';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';
import { BBValidatorsModule } from '../validators/bb-validators.module';

@NgModule({
  declarations: [
    BBPasswordComponent,
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
    BBPasswordComponent,
    MaterialModule,
    BBFormModule,
    BBValidatorsModule,
    ],
   providers: []

})
export class BBPasswordModule { }

