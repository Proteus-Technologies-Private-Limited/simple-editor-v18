import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import { SimpleEditorComponent } from './simple_editor.component';
import { PDFViewerModule } from '../pdf-viewer/pdf-viewer.module';
import { HttpRequestService, MaterialModule } from 'base-blocks';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SimpleEditorService } from './simple_editor.service';
import { BBOpenPophelpModule } from 'base-blocks';
import { TaxDetailsModule } from '../tax-details/tax-details.module';
import {  MatFormFieldModule } from '@angular/material/form-field';
import {  MatInputModule } from '@angular/material/input';
import { BBTextboxModule} from 'base-blocks';
import { BBConfirmBoxModule} from 'base-blocks';
import { BbAutosuggestTransactionModule} from 'base-blocks';
import { BBFeedViewModule} from 'base-blocks';
import { CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA } from '@angular/core';
import { BBTextAreaModule} from 'base-blocks';
import { BBSetRowCountModule }from 'base-blocks';
import { BBSelectModule } from 'base-blocks';
import { BBDatePickerModule } from 'base-blocks';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {OverlayModule} from '@angular/cdk/overlay';
import {MatMenuModule} from '@angular/material/menu';
import { BBAgGridModule } from 'base-blocks';
// import {OpenStockDetailsComponent } from '../open-stock-details/open-stock-details.component';
import { CommonModule, DatePipe } from '@angular/common';

import { ADD_PLUGINS } from '../../plugin/utils/bb-plugin-util';
// import { MatIconModule } from '@angular/material/icon';

ADD_PLUGINS('simple_editor', SimpleEditorComponent);              

@NgModule({
  declarations: [
    SimpleEditorComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule, PDFViewerModule, MaterialModule, FormsModule, ReactiveFormsModule, BBOpenPophelpModule, MatTooltipModule,TaxDetailsModule,
    MatFormFieldModule, MatInputModule,BBTextboxModule,BBConfirmBoxModule,BbAutosuggestTransactionModule,BBFeedViewModule,BBTextAreaModule,
    BBSetRowCountModule,
    BBSelectModule,
    BBDatePickerModule,
    MatDatepickerModule,
    OverlayModule,
    MatMenuModule,
    BBAgGridModule,
    // MatIconModule
  ],
  providers: [SimpleEditorService, DatePipe, HttpRequestService ],
  exports: [SimpleEditorComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA
]
})
export class SimpleEditorModule { }


