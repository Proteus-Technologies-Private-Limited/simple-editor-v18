import { Directive, Input } from '@angular/core';

import { NG_VALIDATORS, AbstractControl,UntypedFormControl, ValidationErrors, Validator } from '@angular/forms';

@Directive( {
    selector: '[email-validator]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: EmailValidator, multi: true }
    ]
})
export class EmailValidator implements Validator {

    @Input( 'expression' ) expression:any;
    @Input( 'invalidMessage' ) invalidMessage:any;
    @Input('validation') validation = false;

    validate(c: UntypedFormControl): ValidationErrors {
        console.log('-------',c.value);
        
        if(!this.validation){
            return null as any;
        }
        
        const isValidEmail = this.expression.test(c.value);
        const message = {
          'email': {
            'message': this.invalidMessage
          }
        };
        return isValidEmail ? null as any : message;
    }
}