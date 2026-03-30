import {Component, Input} from '@angular/core';
import { AbstractControlDirective, AbstractControl } from '@angular/forms';

@Component({
  selector: 'validation',
  template: `
    <span *ngIf="shouldShowErrors()">
      <span style="color: #f44336;" *ngFor="let error of listOfErrors()">{{error}}</span>
    </span>
  `,
  styles: []
})
export class ValidationComponent {
  // @Input('control') private control!: AbstractControlDirective | AbstractControl ;
  // @Input('errors') private customErrors : any;
  // @Input('errorMessages') private customErrorMessages: any;
  @Input('control') public control: AbstractControlDirective | AbstractControl | any ;
  @Input('errors') public customErrors : any;
  @Input('errorMessages') public customErrorMessages: any;
  localErrors : any;

/*
  private readonly defErrorMessages = {
      'required': () => 'Required field',
      'minlength': ( params ) => 'The min number of characters is ' + params.requiredLength,
      'maxlength': ( params ) => 'The max allowed number of characters is ' + params.requiredLength,
      'email': (params) => params.message,
      'password': (params) => params.message,
      'phone': (params) => params.message
  };
*/

  ngDoCheck() {
     

      if( this.customErrors ) {
        this.localErrors = this.customErrors;
      }
      else if( this.control && this.control.errors ) {
        this.localErrors = this.control.errors;
      }
      else {
        this.localErrors = null;
      }
      
      this.shouldShowErrors();
  }

  shouldShowErrors(): boolean {
    return this.localErrors && ( this.control.dirty || this.control.touched );
  }

  listOfErrors(): string[] {
    return Object.keys( this.localErrors ).map( field => this.getMessage( field, this.localErrors[field] ) ).splice(0,1);
  }

  private getMessage( type: string, params: any ) {
     
      return this.customErrorMessages[type]( params );
  }
    
}