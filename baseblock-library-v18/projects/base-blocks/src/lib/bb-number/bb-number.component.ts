import { BaseBlockComponent } from '../base-block.component';
import { Component, OnInit, Input, ViewChild, Optional, Inject, forwardRef, Attribute ,ChangeDetectorRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, NG_ASYNC_VALIDATORS, NgModel, Validator, UntypedFormControl, ValidationErrors } from '@angular/forms';
import { EMPTY } from 'rxjs';

@Component( {
    selector: 'bb-number',
    templateUrl: './bb-number.component.html',
    styleUrls: ['./bb-number.component.css'],
    providers: [
                {
                    provide: NG_VALUE_ACCESSOR,
                    useExisting: forwardRef(() => BBNumberComponent ),
                    multi: true
                }, 
                { 
                    provide: NG_VALIDATORS, 
                    useExisting: BBNumberComponent, 
                    multi: true 
                }
            ]
})
export class BBNumberComponent extends BaseBlockComponent implements Validator {
    @Input( 'requiredMessage' ) requiredMessage: string = 'This field is required';
    @Input( 'invalidMessage' ) invalidMessage: string = 'Please enter a valid number';
    @Input( 'align' ) align: 'right'|'left' = "right";
    @Input( 'max' ) bbMaxValue: number = -1;  //default value for max
    @Input( 'min' ) bbMinValue: number = -1;   //default value for min
    @Input( 'expression' ) bbExpression = /^/;
    @ViewChild( NgModel ) model: NgModel | any;

    errors : any ;
    
    public readonly customErrorMessages = {
            'required': () => this.requiredMessage,
            'minlength': ( params: any ) => 'The min number of characters is ' + params.requiredLength,
            'maxlength': ( params: any ) => 'The max allowed number of characters is ' + params.requiredLength,
            'email': (params: any) => params.message,
            'password': (params: any) => params.message,
            'phone': (params: any) => params.message,
            'number': (params: any) => params.message
    };

    constructor(  @Attribute("validator") private validator:string ,private cdr :ChangeDetectorRef ) {
        super();
        this.bbType = 'number';
    }
    
    validate(c: UntypedFormControl): ValidationErrors {
        if(!this.validator){
            return EMPTY;
        }
            
        if( !c.value ) { this.errors = null; return EMPTY; }
        const isValidNumber = this.bbExpression.test(c.value);
        const message = {
          'number': {
            'message': this.invalidMessage
          }
        };
        if( !isValidNumber )
        {
            this.errors = message;
        }
        else{
            this.errors = null;
        }
        return isValidNumber ? null as any: message;
    }
    ngAfterViewChecked(){
        //your code to update the model
        this.cdr.detectChanges();
     }
}
