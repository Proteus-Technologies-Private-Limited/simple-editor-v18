import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBTextAreaComponent } from './bb-text-area.component';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';
import { BBValidatorsModule } from '../validators/bb-validators.module';
import { BbAutosuggestTransactionModule} from '../bb-autosuggest-transaction/bb-autosuggest-transaction.module';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [
    BBTextAreaComponent,
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BBFormModule,
    BBValidatorsModule,
    BbAutosuggestTransactionModule,
    MatInputModule,
    MatFormFieldModule
  ],
  exports: [
    BBTextAreaComponent,
    MaterialModule,
    BBFormModule,
    BBValidatorsModule,
    ],
   providers: []

})
export class BBTextAreaModule { }

