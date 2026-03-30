import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BBAgGridComponent } from "./bb-ag-grid.component";
import { BBAgGridService } from "./bb-ag-grid.service";
import { AgGridModule } from "ag-grid-angular";
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA } from '@angular/core';
             
@NgModule({
  declarations: [BBAgGridComponent],
  imports: [
    BrowserModule, 
    FormsModule, 
    ReactiveFormsModule,
    AgGridModule,
    CommonModule,
    BrowserAnimationsModule
  ],
  exports : [
    BBAgGridComponent,
  ],
  bootstrap: [BBAgGridComponent],
  providers: [BBAgGridService],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA
]
})
export class BBAgGridModule {}
