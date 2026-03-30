import { BaseBlockComponent } from '../base-block.component';
import { Component, OnInit, Input, ViewChild, Optional, Inject, forwardRef, Attribute ,ChangeDetectorRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, NG_ASYNC_VALIDATORS, NgModel, Validator, UntypedFormControl, ValidationErrors } from '@angular/forms';
import { EMPTY } from 'rxjs';

@Component( {
    selector: 'bb-phone',
    templateUrl: './bb-phone.component.html',
    styleUrls: ['./bb-phone.component.css'],
    providers: [
                {
                    provide: NG_VALUE_ACCESSOR,
                    useExisting: forwardRef(() => BBPhoneComponent ),
                    multi: true
                }, 
                { 
                    provide: NG_VALIDATORS, 
                    useExisting: BBPhoneComponent, 
                    multi: true 
                }
            ]
})
export class BBPhoneComponent extends BaseBlockComponent implements Validator{
    @Input( 'requiredMessage' ) requiredMessage = 'This field is required';
    @Input( 'invalidMessage' ) invalidMessage = 'Please enter Valid Phone Number';
    @Input('validation') bbValidation = false;
    @Input( 'expression' ) bbExpression :any = /^\+?\d{2}[- ]?\d{3}[- ]?\d{5}$/;

    @ViewChild( NgModel ) model: NgModel | any;
    
    errors : any ;
    
    public readonly customErrorMessages = {
            'required': () => this.requiredMessage,
            'minlength': ( params: any ) => 'The min number of characters is ' + params.requiredLength,
            'maxlength': ( params: any ) => 'The max allowed number of characters is ' + params.requiredLength,
            'email': (params: any) => params.message,
            'password': (params: any) => params.message,
            'phone': (params: any) => params.message
    };

    constructor(  @Attribute("validator") private validator:string ,private cdr :ChangeDetectorRef) {
        super();
        this.bbType = 'tel';
    }
    
    validate(c: UntypedFormControl): ValidationErrors {
        if(!this.validator){
            return EMPTY;
        }
            
        if( !c.value ) { this.errors = null; return EMPTY; }
        const isValidPhone = new RegExp(this.bbExpression, 'i').test(c.value);
        const message = {
          'phone': {
            'message': this.invalidMessage
          }
        };
        if( !isValidPhone )
        {
            this.errors = message;
        }
        else{
            this.errors = null;
        }
        return isValidPhone ? null as any: message;
    }
    
  validateMax(e: any)
  {
     var input;
     input = String.fromCharCode(e.which);
     return !!/[\d\s#+-]/.test(input);
  }
  
  ngAfterViewChecked(){
      //your code to update the model
      this.cdr.detectChanges();
   }
}