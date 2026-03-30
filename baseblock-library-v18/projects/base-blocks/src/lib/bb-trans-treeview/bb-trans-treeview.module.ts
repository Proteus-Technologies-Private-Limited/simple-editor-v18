import { BrowserModule } from '@angular/platform-browser';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BBTransTreeviewComponent } from './bb-trans-treeview.component';
import { TreeviewModule } from 'ngx-treeview';
import { ApplyTransTemplateModule } from './apply-trans-template.directive';
import { MaterialModule } from '../mat-module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PortalModule } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [
        BBTransTreeviewComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        ApplyTransTemplateModule,
        MaterialModule,
        DragDropModule,
        CdkStepperModule,
        CdkTableModule,
        CdkTreeModule,
        OverlayModule,
        ScrollingModule,
        PortalModule,
        A11yModule,
        ClipboardModule,
        TreeviewModule.forRoot(),
        MatIconModule
    ],
    exports: [
        BBTransTreeviewComponent,
        ApplyTransTemplateModule,
        MaterialModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BBTransTreeViewModule { }
