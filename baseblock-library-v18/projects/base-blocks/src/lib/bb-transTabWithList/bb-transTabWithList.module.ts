import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBtransTabWithList } from './bb-transTabWithList.component';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';
import { BBtransTabWithListService } from './bb-transTabWithList.service';
//import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  declarations: [
    BBtransTabWithList,
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
    BBtransTabWithList,
    MaterialModule,
    BBFormModule,
    ],
   providers: [BBtransTabWithListService],
    //schemas: [
    //CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA
//],

})
export class BBtransTabWithListModule { }

