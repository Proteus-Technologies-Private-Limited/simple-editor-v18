import { BaseBlockComponent } from '../base-block.component';
import { Component, OnInit, Input, ViewChild, Optional, Inject, forwardRef, Attribute ,ChangeDetectorRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, NG_ASYNC_VALIDATORS, NgModel, Validator, UntypedFormControl, ValidationErrors } from '@angular/forms';
import { EMPTY } from 'rxjs';

@Component( {
    selector: 'bb-password',
    templateUrl: './bb-password.component.html',
    styleUrls: ['./bb-password.component.css'],
    providers: [
                {
                    provide: NG_VALUE_ACCESSOR,
                    useExisting: forwardRef(() => BBPasswordComponent ),
                    multi: true
                }, 
                { 
                    provide: NG_VALIDATORS, 
                    useExisting: BBPasswordComponent, 
                    multi: true 
                }
            ]
})

export class BBPasswordComponent extends BaseBlockComponent implements Validator {
    @Input( 'requiredMessage' ) requiredMessage = 'This field is required';
    @Input( 'invalidMessage' ) invalidMessage = 'Password must be of 8 characters and must contain uppercase, lowercase, digit and a special character';
    @Input( 'expression' ) bbExpression :any = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

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

    constructor(  @Attribute("validator") private validator:string ,private cdr :ChangeDetectorRef ) {
        super();
        this.bbType = 'password';
    }
    
    validate(c: UntypedFormControl): ValidationErrors {
        if(!this.validator){
            return EMPTY;
        }
            
        if( !c.value ) { this.errors = null; return EMPTY; }
        const isValidPassword = new RegExp(this.bbExpression, 'i').test(c.value);
        const message = {
          'password': {
            'message': this.invalidMessage
          }
        };
        if( !isValidPassword )
        {
            this.errors = message;
        }
        else{
            this.errors = null;
        }
        return isValidPassword ? null as any: message;
    }
    ngAfterViewChecked(){
        //your code to update the model
        this.cdr.detectChanges();
     }
}
