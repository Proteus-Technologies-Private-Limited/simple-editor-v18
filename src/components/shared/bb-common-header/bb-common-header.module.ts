import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BBCommonHeaderComponent } from './bb-common-header.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
     ReactiveFormsModule,
  ],
  declarations: [ BBCommonHeaderComponent ],
  exports: [
    BBCommonHeaderComponent
  ],
  // entryComponents: [BBCommonHeaderComponent],
})
export class BBCommonHeaderModule { }
