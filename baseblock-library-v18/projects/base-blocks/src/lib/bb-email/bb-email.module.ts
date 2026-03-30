import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBEmailComponent } from './bb-email.component';
import { BBFormModule } from '../form/form.module';
import { BBValidatorsModule } from '../validators/bb-validators.module';
import {MaterialModule} from '../mat-module';


@NgModule({
  declarations: [
   BBEmailComponent,
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
    BBEmailComponent,
    MaterialModule,
    BBFormModule,
    BBValidatorsModule,
    ],
   providers: []

})
export class BBEmailModule { }

