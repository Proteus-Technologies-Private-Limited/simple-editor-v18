import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBJsonEditorComponent } from './bb-json-editor.component';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@NgModule({
  declarations: [
    BBJsonEditorComponent,
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BBFormModule,
    NgxJsonViewerModule
  ],
  exports: [
    BBJsonEditorComponent,
    MaterialModule,
    BBFormModule
    ],
   providers: []

})
export class BBJsonEditorModule { }

