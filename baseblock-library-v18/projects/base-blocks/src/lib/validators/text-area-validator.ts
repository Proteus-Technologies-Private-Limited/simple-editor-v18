import { Directive, Input } from '@angular/core';

import {
    NG_VALIDATORS,
    AbstractControl,
} from '@angular/forms';

@Directive( {
    selector: '[text-area-validator]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: TextAreaValidator, multi: true }
    ]
})
export class TextAreaValidator {

    @Input( 'required' ) bbRequired: boolean = false;
    @Input( 'requiredMessage' ) requiredMessage = 'Please enter some text';
    @Input( 'invalidMessage' ) invalidMessage = 'Please enter valid text';

    validate( control: AbstractControl ): { [validator: string]: string } {
        //console.log('this.invalidMessage'+this.invalidMessage);
        if ( !control.value && this.bbRequired ) {
            return { message: this.requiredMessage };
        }

        if ( control.value ) {
            const value = control.value.trim();

            if ( this.invalidMessage ) {
                return { message: this.invalidMessage };
            }
        }

        return null as any;
    }
}

 
