import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { BBTextboxModule } from 'base-blocks';
import { BBButtonModule } from 'base-blocks';
import { BBAutosuggestModule } from 'base-blocks';
import { BBCheckboxModule } from 'base-blocks';
import { BBRadiobuttonGroupModule } from 'base-blocks';
import { BBDatePickerModule } from 'base-blocks';
import { BBChipInputModule } from 'base-blocks';
import { BBTreeViewModule } from 'base-blocks';
import { MaterialModule } from 'base-blocks';
import { AngPophelpComponent } from './ang-pophelp.component';
//By Sainath T on 23/11/18 [ To get pophelp structure]
import { PophelpLayoutDisplayComponent } from './pophelp-layout-display.component';
import { PophelpService } from './ang-pophelp.service';
import { SearchByPipe } from './search-by.pipe';
import { DatamodelService } from './datamodel.service';

@NgModule({ declarations: [
        AngPophelpComponent,
        PophelpLayoutDisplayComponent,
        SearchByPipe
    ],
    exports: [
        AngPophelpComponent
    ], imports: [BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        BBTextboxModule,
        BBButtonModule,
        BBAutosuggestModule,
        BBCheckboxModule,
        BBRadiobuttonGroupModule,
        MaterialModule,
        BBDatePickerModule,
        BBChipInputModule,
        BBTreeViewModule], providers: [PophelpService, DatamodelService, provideHttpClient(withInterceptorsFromDi())] })
export class PophelpModule { }