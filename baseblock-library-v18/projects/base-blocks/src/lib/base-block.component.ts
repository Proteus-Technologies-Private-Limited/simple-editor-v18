import { Directive, Input } from '@angular/core';
import { ValueAccessorBase } from './form';

@Directive()
export abstract class BaseBlockComponent extends ValueAccessorBase<string>{

    @Input( 'uxDesign' ) uxDesign: string = 'UX3';
    @Input( 'uxTheme' ) uxTheme: string | any;

    @Input( 'placeholder' ) bbPlaceholder: string = '';
    @Input( 'required' ) bbRequired: boolean = false;
    @Input( 'value' ) bbValue: string = '';
    @Input( 'disabled' ) bbDisabled: boolean = false;
    @Input( 'type' ) bbType: string | any;
    @Input( 'maxlength' ) bbMaxlength: number = 524288;  //default value for maxlength
    @Input( 'minlength' ) bbMinlength: number = 0;        //default value for minlength
    @Input( 'readOnly' ) bbReadOnly: boolean = false;
    @Input( 'autofocus' ) bbAutofocus: boolean = false;
    @Input( 'autocomplete' ) bbAutocomplete: string = 'off';
    @Input( 'label' ) bbLabel: string = '';
    @Input( 'labelPosition' ) bbLabelPostion: 'left'|'top' = "top";

}
