import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { BBTextboxModule } from '../bb-textbox/bb-textbox.module';
import { BBButtonModule } from '../bb-button/bb-button.module';
import { BBAutosuggestModule } from '../bb-autosuggest/bb-autosuggest.module';
import { BBCheckboxModule } from '../bb-checkbox/bb-checkbox.module';
import { BBRadiobuttonGroupModule } from '../bb-radio-button-group/bb-radio-button-group.module';
import { BBDatePickerModule } from '../bb-datepicker/bb-datepicker.module';
import { BBChipInputModule } from '../bb-chip-input/bb-chip-input.module';
import { BBTreeViewModule } from '../bb-treeview/bb-treeview.module';
import { MaterialModule} from '../mat-module'; //import { MaterialModule } from '../';
import { BBPophelpComponent } from './bb-pophelp.component';
//By Sainath T on 23/11/18 [ To get pophelp structure]
import { PophelpLayoutDisplayComponent } from './pophelp-layout-display.component';
import { PophelpService } from './bb-pophelp.service';
import { SearchByPipe } from './search-by.pipe';
import { DatamodelService } from './datamodel.service';

@NgModule({ declarations: [
        BBPophelpComponent,
        PophelpLayoutDisplayComponent,
        SearchByPipe
    ],
    exports: [
        BBPophelpComponent
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
        BBTreeViewModule], providers: [DatamodelService, PophelpService, provideHttpClient(withInterceptorsFromDi())] })
export class PophelpModule { }