import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { invoiceTransactionComponent } from './invoice-transaction.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PDFViewerModule } from '../pdf-viewer/pdf-viewer.module';
import { InvoiceTransactionService } from './invoice-transaction.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ADD_PLUGINS } from '../../plugin/utils/bb-plugin-util';
import { MaterialModule } from 'base-blocks';
import {  MatFormFieldModule } from '@angular/material/form-field';
import {  MatInputModule } from '@angular/material/input';
import { HttpClientModule } from '@angular/common/http';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { PophelpModule } from 'base-blocks';
import { NgxDocViewerModule } from 'ngx-doc-viewer';


ADD_PLUGINS('invoice-transaction', invoiceTransactionComponent);

@NgModule({
declarations: [ invoiceTransactionComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PDFViewerModule,
    MaterialModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatSelectModule,
    MatOptionModule,
    PophelpModule,
    NgxDocViewerModule,
  ],
  exports: [
    invoiceTransactionComponent
  ],
  /* entryComponents: [
    invoiceTransactionComponent
  ], */
    providers: [
      InvoiceTransactionService,
      DatePipe            
    ],
})
export class invoiceTransactionModule { }
