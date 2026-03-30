import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { PdfViewerModule} from 'ng2-pdf-viewer';
import { PdfViewerComponent } from './pdf-viewer.component';
import { ADD_PLUGINS } from '../../plugin/utils/bb-plugin-util';
//import { MaterialModule } from '../../module';
import { MaterialModule } from 'base-blocks';
import {CdkTableModule} from '@angular/cdk/table';

ADD_PLUGINS('pdf-viewer-editor', PdfViewerComponent)

@NgModule({
    declarations: [
        PdfViewerComponent
    ],
    imports: [
        BrowserModule,
        PdfViewerModule,
        MaterialModule,
        CdkTableModule
    ],
    exports: [PdfViewerComponent],
    providers: []
})
export class PDFViewerModule { }