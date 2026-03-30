import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ADD_PLUGINS } from '../utils/bb-plugin-util';

import { SimpleEditorModule } from 'src/components/simple_editor/simple_editor.module';
import { SimpleEditorComponent } from 'src/components/simple_editor/simple_editor.component';
import { popHelpModule } from '../../components/open-pophelp/open-pophelp.module';
import { extractTemplateModule } from '../../components/extract-template/extract-template.module';
import { PDFViewerModule } from '../../components/pdf-viewer/pdf-viewer.module';
import { invoiceTransactionModule } from '../../components/invoice-transaction/invoice-transaction.module';

ADD_PLUGINS('simple_editor', SimpleEditorComponent);              

@NgModule({
    imports: [
		CommonModule,
		SimpleEditorModule,
    popHelpModule,
    extractTemplateModule,
    PDFViewerModule,
    invoiceTransactionModule,
    ],
    schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class BBPluginImplModule {}



