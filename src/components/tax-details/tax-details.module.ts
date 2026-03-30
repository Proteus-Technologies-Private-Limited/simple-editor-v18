import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import { TaxDetailsComponent } from './tax-details.component';
import { PDFViewerModule } from '../pdf-viewer/pdf-viewer.module';
import { MaterialModule, BBProgressSpinnerModule } from 'base-blocks';
import { MatTooltipModule } from '@angular/material/tooltip'
import { TaxDetailsService } from './tax-details.service';
import { popHelpModule } from '../open-pophelp/open-pophelp.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// import { TransactionDetailsModule } from '../transaction-details/transaction-details.module';

import { ADD_PLUGINS } from '../../plugin/utils/bb-plugin-util';
ADD_PLUGINS('tax-details', TaxDetailsComponent);

@NgModule({
  declarations: [
  TaxDetailsComponent,
  ],
  imports: [
    BrowserModule, PDFViewerModule, MaterialModule, FormsModule, ReactiveFormsModule, popHelpModule, MatTooltipModule, BBProgressSpinnerModule, BrowserAnimationsModule,
  ],
  exports: [
   TaxDetailsComponent
  ],
  providers: [TaxDetailsService],
  bootstrap: [TaxDetailsComponent]
})
export class TaxDetailsModule { }
