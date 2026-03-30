import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../mat-module';
import { BBOpenPophelpComponent } from './bb-open-pophelp.component';

import { PophelpModule } from "../bb-pophelp/pophelp.module";
import { ItemChangeUtils } from '../utility';
// import { ADD_PLUGINS } from '../../plugin/utils/bb-plugin-util';
// import { PophelpModule } from '.././ang-pophelp/pophelp.module';


// ADD_PLUGINS('open-pophelp', BBOpenPophelpComponent);

@NgModule({
  declarations: [
    BBOpenPophelpComponent
  ],
  imports: [
    BrowserModule,MaterialModule,FormsModule,PophelpModule
  ],
  providers: [ItemChangeUtils],
  exports: [BBOpenPophelpComponent],
  bootstrap: [BBOpenPophelpComponent]
})
export class BBOpenPophelpModule { }
