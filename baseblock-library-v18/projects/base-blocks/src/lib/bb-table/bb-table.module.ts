import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { BBTableComponent } from './bb-table.component';
import { CalculateTotal } from './calculate-total.pipe';
import { MaterialModule } from '../mat-module';


@NgModule({
    declarations: [
        BBTableComponent,
        CalculateTotal
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MaterialModule,
        FormsModule
    ],
    exports: [
        BBTableComponent,
        CalculateTotal
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BBTableModule { }
