import { NgModel } from '@angular/forms';

import { Observable } from 'rxjs';
import { map as observableMap } from 'rxjs/operators';

import { ValueAccessorBase } from './value-accessor';

import {
    AsyncValidatorArray,
    ValidatorArray,
    ValidationResult,
    message,
    validate,
} from './validate';

export abstract class ElementBase<T> extends ValueAccessorBase<T> {
    protected abstract model: NgModel;

    constructor(
        private validators: ValidatorArray,
        private asyncValidators: AsyncValidatorArray,
    ) {
        super();
    }

    protected validate(): Observable<ValidationResult> | any {
        if ( this.model )
            return validate
                ( this.validators, this.asyncValidators )
                ( this.model.control );
    }

    protected get invalid(): Observable<boolean> | any{
        if ( this.model )
            return this.validate().
            pipe(observableMap( (v: any) => Object.keys( v || {}).length > 0 ));
    }

    protected get failures(): Observable<Array<string>> | any {
        if ( this.model )
            return this.validate().
            pipe(observableMap( (v: any) => Object.keys( v ).map( k => message( v, k ) ) ));
    }
}