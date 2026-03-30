import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBButtonComponent } from './bb-button.component';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';


@NgModule({
  declarations: [
    BBButtonComponent,
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
    BBButtonComponent,
    MaterialModule,
    BBFormModule,
    ],
   providers: []

})
export class BBButtonModule { }

