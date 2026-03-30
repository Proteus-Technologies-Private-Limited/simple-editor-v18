import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBSwitchButtonComponent } from './bb-switch-button.component';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';

@NgModule({
    declarations: [
        BBSwitchButtonComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        BBFormModule
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ],
    exports: [
        BBSwitchButtonComponent,
        MaterialModule,
        BBFormModule
    ],
    providers: [],
    bootstrap: []
})
export class BBSwitchButtonModule { }

