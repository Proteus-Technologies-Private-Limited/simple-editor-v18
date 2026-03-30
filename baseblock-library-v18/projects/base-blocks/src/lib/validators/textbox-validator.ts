import { Directive, Input } from '@angular/core';

import { NG_VALIDATORS, AbstractControl, UntypedFormControl, ValidationErrors, Validator } from '@angular/forms';

@Directive( {
    selector: '[textbox-validator]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: TextBoxValidator, multi: true }
    ]
})
export class TextBoxValidator implements Validator {

    @Input( 'invalidMessage' ) invalidMessage: string | any;
    @Input('validation') validation = false;
    
    validate(c: UntypedFormControl): ValidationErrors {
        console.log('-------',c.value);
        
        if(!this.validation){
            return null as any;
        }
        
        //const isValidNumber = this.expression.test(c.value);
        const isValidNumber = true;
        const message = {
          'phone': {
            'message': this.invalidMessage
          }
        };
        return isValidNumber ? null as any : message;
    }
}

