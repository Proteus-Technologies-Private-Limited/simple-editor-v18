import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BbAutosuggestTransactionComponent } from './bb-autosuggest-transaction.component';
import { BbAutosuggestTransactionService } from './bb-autosuggest-transaction.service';
import {MaterialModule} from '../mat-module';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ItemChangeUtils } from '../utility';

@NgModule({
  declarations: [BbAutosuggestTransactionComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    BrowserAnimationsModule
    
  ],
  providers: [ItemChangeUtils],
  exports: [BbAutosuggestTransactionComponent],
  bootstrap: [BbAutosuggestTransactionComponent],

})
export class BbAutosuggestTransactionModule { }
