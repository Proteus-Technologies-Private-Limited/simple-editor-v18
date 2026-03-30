import { ModuleWithProviders } from '@angular/core';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { BbtimepickerComponent } from './bb-timepicker.component';
import {MaterialModule} from '../mat-module';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    BbtimepickerComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
  ],
  exports: [
    BbtimepickerComponent
  ]
})
export class BBTimePickerModule { }
