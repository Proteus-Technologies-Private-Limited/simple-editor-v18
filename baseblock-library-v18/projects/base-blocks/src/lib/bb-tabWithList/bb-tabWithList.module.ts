import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBtabWithList } from './bb-tabWithList.component';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';
import { BBtabWithListService } from './bb-tabWithList.service';
//import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  declarations: [
    BBtabWithList,
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BBFormModule,
    //Ng2SearchPipeModule
  ],
  exports: [
    BBtabWithList,
    MaterialModule,
    BBFormModule,
    ],
   providers: [BBtabWithListService],
    //schemas: [
    //CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA
//],

})
export class BBtabWithListModule { }

