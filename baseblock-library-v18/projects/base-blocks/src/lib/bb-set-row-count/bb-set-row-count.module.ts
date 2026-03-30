import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


import { BBSetRowCountService } from './bb-set-row-count.service';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';
import { BBSetRowCountComponent } from './bb-set-row-count.component';

@NgModule({
  declarations: [
    BBSetRowCountComponent,
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BBFormModule,
    HttpClientModule
  ],
  exports: [
    BBSetRowCountComponent,
    MaterialModule,
    BBFormModule,
    ],
   providers: [BBSetRowCountService]


})
export class BBSetRowCountModule { }

