import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { EmailValidator } from './email-validator';
import { NumberValidator } from './number-validator';
import { PasswordValidator } from './password-validator';
import { PhoneValidator } from './phone-validator';
import { TextAreaValidator } from './text-area-validator';
import { TextBoxValidator } from './textbox-validator';
import { BBFormModule } from '../form/form.module';

@NgModule({
  declarations: [
   EmailValidator,
   NumberValidator,
   PasswordValidator,
   PhoneValidator,
   TextAreaValidator,
   TextBoxValidator
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    BBFormModule,
  ],
  exports: [
    BBFormModule,
    EmailValidator,
    NumberValidator,
    PasswordValidator,
    PhoneValidator,
    TextAreaValidator,
    TextBoxValidator
    ],
   providers: []

})
export class BBValidatorsModule { }

