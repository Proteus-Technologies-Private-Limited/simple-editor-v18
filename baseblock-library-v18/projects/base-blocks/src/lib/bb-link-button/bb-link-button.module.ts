import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBLinkButtonComponent } from './bb-link-button.component';   
import { BBFormModule } from '../form/form.module';
import { MaterialModule} from '../mat-module';

@NgModule({
  declarations: [
    BBLinkButtonComponent,
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
    BBLinkButtonComponent,
    MaterialModule,
    BBFormModule,
    ],
   providers: []

})
export class BBLinkButtonModule { }

