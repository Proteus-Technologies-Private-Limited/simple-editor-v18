import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBDatabaseList } from './bb-databaseList.component';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';
import { BBtabWithListService } from '../bb-tabWithList/bb-tabWithList.service';
import { BBDatabaseListService } from './bb-databaseList.service';

@NgModule({
  declarations: [
    BBDatabaseList,
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BBFormModule,
  ],
  exports: [
    BBDatabaseList,
    MaterialModule,
    BBFormModule,
    ],
   providers: [BBtabWithListService,BBDatabaseListService],

})
export class BBDatabaseListModule { }

