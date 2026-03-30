import { Component, OnInit, Input, ViewChild, Optional, Inject, forwardRef, Attribute ,ChangeDetectorRef } from '@angular/core';
import { BaseBlockComponent } from '../base-block.component';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, NG_ASYNC_VALIDATORS, NgModel, Validator, UntypedFormControl, ValidationErrors } from '@angular/forms';
import { EMPTY } from 'rxjs';

@Component( {
    selector: 'bb-email',
    templateUrl: './bb-email.component.html',
    styleUrls: ['./bb-email.component.css'],
    providers: [
    	{
   			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => BBEmailComponent ),
    		multi: true
		}, 
    	{ 
    		provide: NG_VALIDATORS, 
    		useExisting: BBEmailComponent, 
    		multi: true 
    	}
    ]
})
export class BBEmailComponent extends BaseBlockComponent implements Validator {
    @Input( 'requiredMessage' ) requiredMessage = 'This field is required';
    @Input( 'invalidMessage' ) invalidMessage = 'Please enter Valid Email Address (abc@gmail.com)';
    @Input( 'expression' ) bbExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
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

    constructor(  @Attribute("validator") private validator:string  ,private cdr :ChangeDetectorRef) {
        super();
        this.bbType = 'email';
    }
    
    validate(c: UntypedFormControl): ValidationErrors {
        if(!this.validator){
            return EMPTY;
        }
            
        if( !c.value ) { this.errors = null; return EMPTY; }
        const isValidEmail = this.bbExpression.test(c.value);
        const message = {
          'email': {
            'message': this.invalidMessage
          }
        };
        if( !isValidEmail )
        {
            this.errors = message;
        }
        else{
            this.errors = null;
        }
        return isValidEmail ? null as any : message;
    }
    
    ngAfterViewChecked(){
        //your code to update the model
        this.cdr.detectChanges();
     }
}
