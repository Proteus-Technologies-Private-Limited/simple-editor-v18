import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBFabButtonComponent } from './bb-fab-button.component';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';

@NgModule({
  declarations: [
    BBFabButtonComponent
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
    BBFabButtonComponent,
    MaterialModule,
    BBFormModule
    ],
   providers: []

})
export class BBFabButtonModule { }

