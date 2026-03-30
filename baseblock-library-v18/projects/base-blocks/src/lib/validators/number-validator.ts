import { Directive, Input } from '@angular/core';

import { NG_VALIDATORS, AbstractControl,UntypedFormControl,ValidationErrors, Validator } from '@angular/forms';

@Directive( {
    selector: '[number-validator]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: NumberValidator, multi: true }
    ]
})
export class NumberValidator implements Validator {

    @Input( 'expression' ) expression = /^\+?\d{2}[- ]?\d{3}[- ]?\d{5}$/;
    @Input( 'invalidMessage' ) invalidMessage: string | any;
    @Input('validation') validation = false;
    
    
    validate(c: UntypedFormControl): ValidationErrors {
        console.log('-------',c.value);
        
        if(!this.validation){
            return null as any;
        }
        
        const isValidPassword = this.expression.test(c.value);
        const message = {
          'password': {
            'message': this.invalidMessage
          }
        };
        return isValidPassword ? null as any: message;
    }
}

