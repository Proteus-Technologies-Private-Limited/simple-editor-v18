import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
//import { ExtractTemplateComponent,DialogContent } from './extract-template.component';
import { ExtractTemplateComponent } from './extract-template.component';
import { PDFViewerModule } from '../pdf-viewer/pdf-viewer.module';
import { MaterialModule } from 'base-blocks';
import { MatTooltipModule } from '@angular/material/tooltip'
import { ExtractTemplateService } from './extract-template.service';
import { popHelpModule } from '../open-pophelp/open-pophelp.module';
import { TaxDetailsComponent } from '../tax-details/tax-details.component';
import { TaxDetailsModule } from '../tax-details/tax-details.module';
import {  MatFormFieldModule } from '@angular/material/form-field';
import {  MatInputModule } from '@angular/material/input';
import { BBTextboxModule} from 'base-blocks';

// import { TransactionDetailsModule } from '../transaction-details/transaction-details.module';

import { ADD_PLUGINS } from '../../plugin/utils/bb-plugin-util';
ADD_PLUGINS('sorderform', ExtractTemplateComponent);

@NgModule({
  declarations: [
    ExtractTemplateComponent,
  ],
  imports: [
    BrowserModule, PDFViewerModule, MaterialModule, FormsModule, ReactiveFormsModule, popHelpModule, MatTooltipModule,TaxDetailsModule,
    MatFormFieldModule, MatInputModule,BBTextboxModule
  ],
  providers: [ExtractTemplateService],
  bootstrap: [ExtractTemplateComponent]
})
export class extractTemplateModule { }
// entryComponents: [DialogContent],
