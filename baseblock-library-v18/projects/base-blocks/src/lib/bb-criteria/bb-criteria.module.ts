import { BrowserModule } from '@angular/platform-browser';
//import { HttpModule } from '@angular/http';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule,CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core'
import { MaterialModule} from '../mat-module';
//import { MaterialModule } from '../../components/shared/module';

import { BBTextboxModule } from '../bb-textbox/bb-textbox.module';
import { BBButtonModule } from '../bb-button/bb-button.module';
import { BBAutosuggestModule } from '../bb-autosuggest/bb-autosuggest.module';
import { BBCheckboxModule } from '../bb-checkbox/bb-checkbox.module';
import { BBRadiobuttonGroupModule } from '../bb-radio-button-group/bb-radio-button-group.module';
import { BBDatePickerModule } from '../bb-datepicker/bb-datepicker.module';
import { BBChipInputModule } from '../bb-chip-input/bb-chip-input.module';
import { BBTreeViewModule } from '../bb-treeview/bb-treeview.module';
import { PophelpModule } from '../bb-pophelp/pophelp.module';
import { BBSelectModule } from '../bb-choice/bb-choice.module';

import { BBCriteriaComponent } from './bb-criteria.component';
import { BBCriteriaInputComponent } from '../bb-criteria/bb-criteria-input/bb-criteria-input.component';
import { BBSitePickerComponent } from  './bb-site-picker/bb-site-picker.component';

@NgModule({ declarations: [
        BBCriteriaComponent,
        BBCriteriaInputComponent,
        BBSitePickerComponent
    ],
    exports: [
        BBCriteriaComponent,
        BBCriteriaInputComponent,
        BBSitePickerComponent
    ],
    bootstrap: [],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA
    ], imports: [BrowserModule,
        BrowserAnimationsModule,
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
        BBTreeViewModule,
        PophelpModule,
        BBSelectModule], providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class BBCriteriaModule { }
