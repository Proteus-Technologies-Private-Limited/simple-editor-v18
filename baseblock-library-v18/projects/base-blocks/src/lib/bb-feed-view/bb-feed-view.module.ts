import { NgModule } from '@angular/core';
import { BBFeedViewComponent } from './bb-feed-view.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import { MaterialModule} from '../mat-module';
import { HttpClientModule } from '@angular/common/http';
import {  MatFormFieldModule } from '@angular/material/form-field';
import {  MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from "@angular/material/select";
import { MatExpansionModule } from "@angular/material/expansion";
import { BBProgressSpinnerModule } from './../bb-progress-spinner';
import {BBFeedViewService} from './bb-feed-view.service';
import { BBTextboxModule } from '../bb-textbox';
import {BBTextAreaModule} from '../bb-text-area';
import { BBSelectModule } from '../bb-choice';
import { BBDatePickerModule } from '../bb-datepicker';

@NgModule({
  declarations: [
    BBFeedViewComponent
  ],
  imports: [
      BrowserModule,
      FormsModule,
      MaterialModule,
      HttpClientModule,
      BBProgressSpinnerModule,
      MatFormFieldModule, 
      MatInputModule,
      MatTooltipModule,
      ReactiveFormsModule,
      MatSelectModule,
      MatExpansionModule,
      BBTextboxModule,
      BBTextAreaModule,
      BBSelectModule,
      BBDatePickerModule
     ],
  bootstrap: [BBFeedViewComponent],
  
  exports :[
    BBFeedViewComponent,
    ],
    providers: [BBFeedViewService]  
})

export class BBFeedViewModule { }
