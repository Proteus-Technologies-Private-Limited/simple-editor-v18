import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BBCalColumnPropertiesComponent } from './bb-cal-column-properties.component';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { MaterialModule} from '../mat-module';
import { CommonModule } from '@angular/common';
import { BBCalColumnService } from './bb-cal-column-properties.service';

@NgModule({
    declarations: [BBCalColumnPropertiesComponent],
    imports: [BrowserModule,
              FormsModule,
              ReactiveFormsModule,
              MaterialModule,
              CommonModule,
             ],
    bootstrap: [BBCalColumnPropertiesComponent],
    exports: [BBCalColumnPropertiesComponent,
        MaterialModule,
    ],
    providers: [BBCalColumnService]
})
export class BBCalColumnPropertiesModule { }