import { Directive, Input } from '@angular/core';

import { NG_VALIDATORS, AbstractControl, UntypedFormControl, ValidationErrors, Validator } from '@angular/forms';

@Directive( {
    selector: '[phone-validator]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: PhoneValidator, multi: true }
    ]
})
export class PhoneValidator implements Validator {

    @Input( 'expression' ) expression:any;
    @Input( 'invalidMessage' ) invalidMessage:any;
    @Input('validation') validation = false;
    
    validate(c: UntypedFormControl): ValidationErrors {
        console.log('-------',c.value);
        
        if(!this.validation){
            return null as any;
        }
        
        const isValidNumber = this.expression.test(c.value);
        const message = {
          'phone': {
            'message': this.invalidMessage
          }
        };
        return isValidNumber? null as any: message;
    }
}
