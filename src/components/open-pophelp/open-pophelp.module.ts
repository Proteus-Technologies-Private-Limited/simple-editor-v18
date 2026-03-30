import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ADD_PLUGINS } from '../../plugin/utils/bb-plugin-util';

import { popHelpComponent } from './open-pophelp.component';
import { PophelpModule } from '.././ang-pophelp/pophelp.module';
import { MaterialModule } from 'base-blocks';


ADD_PLUGINS('open-pophelp', popHelpComponent);

@NgModule({
  declarations: [
    popHelpComponent
  ],
  imports: [
    BrowserModule,MaterialModule,FormsModule,PophelpModule
  ],
  providers: [],
  exports: [popHelpComponent],
  bootstrap: [popHelpComponent]
})
export class popHelpModule { }
