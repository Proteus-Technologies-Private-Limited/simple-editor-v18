import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BBColumnPropertiesComponent} from './bb-column-properties.component';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { MaterialModule} from '../mat-module';
import { CommonModule } from '@angular/common';

 
@NgModule({
    declarations: [BBColumnPropertiesComponent],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        CommonModule,

    ],
    bootstrap:[BBColumnPropertiesComponent],
    exports:[BBColumnPropertiesComponent]
})

export class BBColumnPropertiesModule {}