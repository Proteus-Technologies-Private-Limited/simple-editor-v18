import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../mat-module';
import { BBGridsterComponent } from './bb-gridster.component';
import { GridsterModule } from "angular-gridster2";
import { BBGridsterService } from './bb-gridster.service';
import { VisualViewModule } from 'visuals';

@NgModule({
    declarations: [
        BBGridsterComponent,
      ],
    imports: [
      BrowserModule,
      BrowserAnimationsModule,
      FormsModule,
      ReactiveFormsModule,
      MaterialModule,
      GridsterModule,
      VisualViewModule
    ],
    exports: [
      BBGridsterComponent,
      MaterialModule,
      ],
     providers: [BBGridsterService],
     bootstrap: [BBGridsterComponent]

  
  })
  export class BBGridsterModule { }