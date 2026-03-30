import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { QueryBuilderModule } from "angular2-query-builder";
import { LayoutModule } from "@angular/cdk/layout";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { QueryComponent } from "./bb-query/bb-query.component";
import { QueryBuilderComponentnew } from "./bb-query-builder.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from "@angular/platform-browser";
import {MaterialModule} from '../mat-module';
import { A11yModule } from '@angular/cdk/a11y';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { OverlayModule } from '@angular/cdk/overlay';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatIconModule } from "@angular/material/icon";

@NgModule({ declarations: [QueryComponent, QueryBuilderComponentnew],
    bootstrap: [QueryBuilderComponentnew, QueryComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [QueryBuilderComponentnew, QueryComponent], imports: [CommonModule,
        FormsModule,
        ReactiveFormsModule,
        QueryBuilderModule,
        LayoutModule,
        BrowserAnimationsModule,
        BrowserModule,
        MaterialModule,
        A11yModule,
        ClipboardModule,
        DragDropModule,
        PortalModule,
        ScrollingModule,
        CdkStepperModule,
        CdkTableModule,
        CdkTreeModule,
        OverlayModule,
        MatIconModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class QueryBuilderNewModule {}
