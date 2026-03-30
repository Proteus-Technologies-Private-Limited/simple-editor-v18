import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBtransDatabaseList } from './bb-transDatabaseList.component';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';
import { BBtabWithListService } from '../bb-tabWithList/bb-tabWithList.service';
import { BBtransDatabaseListService } from './bb-transDatabaseList.service';

@NgModule({
  declarations: [
    BBtransDatabaseList,
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
    BBtransDatabaseList,
    MaterialModule,
    BBFormModule,
    ],
   providers: [BBtabWithListService,BBtransDatabaseListService],

})
export class BBtransDatabaseListModule { }

