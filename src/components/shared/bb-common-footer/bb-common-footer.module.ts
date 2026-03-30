import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BBCommonFooterComponent } from './bb-common-footer.component';

@NgModule({
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        FormsModule,
    ],
    declarations: [BBCommonFooterComponent],
    exports: [
        BBCommonFooterComponent
    ]
})
export class BBCommonFooterModule { }
