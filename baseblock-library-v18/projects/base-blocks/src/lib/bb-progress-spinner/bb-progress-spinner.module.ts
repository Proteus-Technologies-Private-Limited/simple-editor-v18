import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BBProgressSpinnerComponent } from './bb-progress-spinner.component';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { MaterialModule} from '../mat-module';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [BBProgressSpinnerComponent],
    imports: [BrowserModule,
              FormsModule,
              ReactiveFormsModule,
              MaterialModule,
              CommonModule,
              BrowserAnimationsModule,
             ],
    bootstrap: [BBProgressSpinnerComponent],
    exports: [BBProgressSpinnerComponent,

    ],
    providers: [] 
})
export class BBProgressSpinnerModule { }