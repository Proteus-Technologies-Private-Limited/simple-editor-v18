import {
    AbstractControl,
    AsyncValidatorFn,
    Validator,
    Validators,
    ValidatorFn,
} from '@angular/forms';

import { of as observableOf } from 'rxjs';

export type ValidationResult = { [validator: string]: string | boolean };

export type AsyncValidatorArray = Array<Validator | AsyncValidatorFn>;

export type ValidatorArray = Array<Validator | ValidatorFn>;

const normalizeValidator =
    ( validator: Validator | ValidatorFn ): ValidatorFn | AsyncValidatorFn => {
        const func = ( validator as Validator ).validate.bind( validator );
        if ( typeof func === 'function' ) {
            return ( c: AbstractControl ) => func( c );
        } else {
            return <ValidatorFn | AsyncValidatorFn>validator;
        }
    };

export const composeValidators =
    ( validators: ValidatorArray ): AsyncValidatorFn | ValidatorFn => {
        if ( validators == null || validators.length === 0 ) {
            return null as any;
        }
        return Validators.compose( validators.map( normalizeValidator )) as any;
    };

export const validate =
    ( validators: ValidatorArray, asyncValidators: AsyncValidatorArray ) => {
        return ( control: AbstractControl ) => {
            const synchronousValid = () => composeValidators( validators )( control );

            if ( asyncValidators ) {
                const asyncValidator: any = composeValidators( asyncValidators );

                return asyncValidator( control).map( (v: any) => {
                    const secondary = synchronousValid();
                    if ( secondary || v ) { // compose async and sync validator results
                        return (<any>Object).assign( {}, secondary, v );
                    }
                });
            }

            if ( validators ) {
                return observableOf( synchronousValid() );
            }

            return observableOf( null );
        };
    };

export const message = ( validator: ValidationResult, key: string ): string => {
    switch (key) {
        case 'minlength':
          return 'Value must be N characters';
        case 'maxlength':
          return 'Value must be a maximum of N characters';
  }
    switch ( typeof validator[key] ) {
        case 'string':
            return <string>validator[key];
        default:
            return ``;
    }
};