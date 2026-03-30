import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBImageComponent } from './bb-image.component';
import {MaterialModule} from '../mat-module';

 
@NgModule({
  declarations: [
    BBImageComponent,
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
  ],
  exports: [
    BBImageComponent,
    MaterialModule,
    ],
   providers: []

})
export class BBImageModule { }

