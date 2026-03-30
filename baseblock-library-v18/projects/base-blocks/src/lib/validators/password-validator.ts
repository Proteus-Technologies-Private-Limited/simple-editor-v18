import { Directive, Input } from '@angular/core';

import { NG_VALIDATORS, AbstractControl, UntypedFormControl, ValidationErrors, Validator } from '@angular/forms';

@Directive( {
    selector: '[password-validator]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: PasswordValidator, multi: true }
    ]
})
export class PasswordValidator implements Validator {

    @Input( 'expression' ) expression = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    @Input('invalidMessage') invalidMessage: string | any;
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
