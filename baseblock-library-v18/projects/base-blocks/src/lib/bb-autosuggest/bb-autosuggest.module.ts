import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { BBAutosuggestComponent } from './bb-autosuggest.component';
import { BBAutosuggestService } from './bb-autosuggest.service';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';

@NgModule({ declarations: [
        BBAutosuggestComponent,
    ],
    exports: [
        BBAutosuggestComponent,
        MaterialModule,
        BBFormModule,
    ], imports: [BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        BBFormModule], providers: [BBAutosuggestService, provideHttpClient(withInterceptorsFromDi())] })
export class BBAutosuggestModule { }

