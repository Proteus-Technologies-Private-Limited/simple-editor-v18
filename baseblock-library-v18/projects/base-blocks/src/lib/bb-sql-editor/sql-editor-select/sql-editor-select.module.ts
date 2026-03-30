import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { MaterialModule } from '../../mat-module';
import { SqlEditorSelectComponent } from './sql-editor-select.component';
import { BBTreeViewModule } from '../../bb-treeview/bb-treeview.module';
import { QueryBuilderNewModule } from '../../bb-query-builder/bb-query-builder.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PortalModule } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { SQLEditorService } from './sql-editor-select.service';
// import { DragScrollModule } from "cdk-drag-scroll";
import { LongPress } from './long-press';
//Added by shrutika on 27-09-21 for schema designer [Start]
import { BBtabWithListModule } from '../../bb-tabWithList/bb-tabWithList.module';
import { BBDatabaseListModule } from '../../bb-databaseList/bb-databaseList.module';
// Added by Samruddhi for Visual Option component
import { BBVisualOptionModule } from '../../bb-visual-option/bb-visual-option.module';
import { CommonModule } from '@angular/common';
//Added by Vikas for columnproperties popup
import { BBColumnPropertiesModule } from '../../bb-column-properties/bb-column-properties.module';
import { BBCalColumnPropertiesModule } from '../../bb-cal-column-properties/bb-cal-column-properties.module';

@NgModule({
  declarations: [SqlEditorSelectComponent, LongPress],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BBTreeViewModule,
    QueryBuilderNewModule,
    DragDropModule,
    CdkStepperModule, 
    CdkTableModule, 
    CdkTreeModule, 
    OverlayModule, 
    ScrollingModule, 
    PortalModule, 
    A11yModule, 
    ClipboardModule,
    // DragScrollModule,
    //Added by shrutika on 27-09-21 for schema designer [Start]
    BBtabWithListModule,
    BBDatabaseListModule,
    // Added by Samruddhi for Visual Option component
    BBVisualOptionModule,
    CommonModule,
    BBColumnPropertiesModule,
    BBCalColumnPropertiesModule
    ],
  bootstrap: [SqlEditorSelectComponent],
  exports: [
    SqlEditorSelectComponent,
    MaterialModule
    ],
   providers: [SQLEditorService]  

})

export class SqlEditorSelectModule { }