import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BBMonthPickerComponent } from './bb-month-picker/bb-month-picker.component';
import { BBYearPickerComponent } from './bb-year-picker/bb-year-picker.component';
import { BBDayPickerComponent } from './bb-day-picker/bb-day-picker.component';
import { BBFormModule } from '../form/form.module';
import {MaterialModule} from '../mat-module';
import { BBValidatorsModule } from '../validators/bb-validators.module';
import {  MatFormFieldModule } from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatIconModule} from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';


@NgModule({
  declarations: [
    BBMonthPickerComponent,
    BBYearPickerComponent,
    BBDayPickerComponent
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BBFormModule,
    BBValidatorsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule,
    MatInputModule,
  ],
  exports: [
    BBMonthPickerComponent,
    BBYearPickerComponent,
    BBDayPickerComponent,
    MaterialModule,
    BBFormModule,
    BBValidatorsModule,
    ],
   providers: []

})
export class BBDatePickerModule { }

