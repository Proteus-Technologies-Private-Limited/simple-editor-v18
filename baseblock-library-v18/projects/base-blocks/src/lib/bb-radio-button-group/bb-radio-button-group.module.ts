import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBRadiobuttonGroup, BBRadiobuttonComponent } from './bb-radio-button-group.component';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';

@NgModule({
  declarations: [ 
   BBRadiobuttonGroup,
   BBRadiobuttonComponent,
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
    BBRadiobuttonGroup,
    BBRadiobuttonComponent,
    MaterialModule,
    BBFormModule,
    ],
   providers: []

})
export class BBRadiobuttonGroupModule { }

