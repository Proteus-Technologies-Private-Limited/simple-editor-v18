import { Component, Directive, Input, ContentChildren, forwardRef, QueryList, Optional, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
//import { UniqueSelectionDispatcher, mixinDisabled, CanDisable } from '@angular/material/core';

import {  mixinDisabled, CanDisable } from '@angular/material/core';
import { FocusMonitor } from '@angular/cdk/a11y';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

export class MatRadioChange {
    source: BBRadiobuttonComponent | any;
    value: any;
}

export const MAT_RADIO_GROUP_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => BBRadiobuttonGroup ),
    multi: true
};

let nextUniqueId = 0;

@Directive( {
    selector: 'bb-radio-group',
    providers: [MAT_RADIO_GROUP_CONTROL_VALUE_ACCESSOR]
})
export class BBRadiobuttonGroup implements AfterContentInit, ControlValueAccessor, CanDisable {

    @ContentChildren( forwardRef(() => BBRadiobuttonComponent ) ) _radios: QueryList<BBRadiobuttonComponent> | any;

    private _name: string = `bb-radio-group-${nextUniqueId++}`;
    private _value: any = null;
    private _selected: BBRadiobuttonComponent | null = null;
    private _disabled: boolean = false;
    private _isInitialized: boolean = false;

    constructor( private _changeDetector: ChangeDetectorRef ) {
    }

    _controlValueAccessorChangeFn: ( value: any ) => void = () => { };

    onTouched: () => any = () => { };

    _markRadiosForCheck() {
        if ( this._radios ) {
            this._radios.forEach( (radio: any) => radio._markForCheck() );
        }
    }

    writeValue( value: any ) {
        this.value = value;
        this._changeDetector.markForCheck();
    }

    registerOnChange( fn: ( value: any ) => void ) {
        this._controlValueAccessorChangeFn = fn;
    }

    registerOnTouched( fn: any ) {
        this.onTouched = fn;
    }

    setDisabledState( isDisabled: boolean ) {
        this.disabled = isDisabled;
        this._changeDetector.markForCheck();
    }

    @Output() change: EventEmitter<MatRadioChange> = new EventEmitter<MatRadioChange>();

    @Input()
    get name(): string { return this._name; }
    set name( value: string ) {
        this._name = value;
        this._updateRadioButtonNames();
    }

    @Input()
    get value(): any { return this._value; }
    set value( newValue: any ) {
        if ( this._value != newValue ) {
            this._value = newValue;
            this._updateSelectedRadioFromValue();
            this._checkSelectedRadioButton();
        }
    }

    @Input()
    get selected() { return this._selected; }
    set selected( selected: BBRadiobuttonComponent | null ) {
        this._selected = selected;
        console.log( '-------' );
        this.value = selected ? selected.bbValue : null;
        this._checkSelectedRadioButton();
    }

    @Input()
    get disabled(): boolean { return this._disabled; }
    set disabled( value ) {
        this._disabled = coerceBooleanProperty( value );
        this._markRadiosForCheck();
    }

    _checkSelectedRadioButton() {
        if ( this._selected && !this._selected.bbChecked ) {
            this._selected.bbChecked = true;
        }
    }

    ngAfterContentInit() {
        this._isInitialized = true;
    }

    _touch() {
        if ( this.onTouched ) {
            this.onTouched();
        }
    }

    private _updateRadioButtonNames(): void {
        if ( this._radios ) {
            this._radios.forEach( (radio: any) => {
                radio.name = this.name;
            });
        }
    }

    private _updateSelectedRadioFromValue(): void {
        // If the value already matches the selected radio, do nothing.
        const isAlreadySelected = this._selected != null && this._selected.bbValue == this._value;

        if ( this._radios != null && !isAlreadySelected ) {
            this._selected = null;
            this._radios.forEach( (radio: any) => {
                radio.bbChecked = this.value == radio.bbValue;
                if ( radio.bbChecked ) {
                    this._selected = radio;
                }
            });
        }
    }

    _emitChangeEvent(): void {
        if ( this._isInitialized ) {
            const event = new MatRadioChange();
            event.source = this._selected;
            event.value = this._value;
            this.change.emit( event );
        }
    }

    ngAfterViewChecked() {
        // console.log( '_selected', this._selected );
        // console.log( '_value', this._value );
    }

}

@Component( {
    selector: 'bb-radio-button',
    templateUrl: './bb-radio-button-group.component.html',
    styleUrls: ['./bb-radio-button-group.component.css']
})
export class BBRadiobuttonComponent {

    private _uniqueId: string = `bb-radio-${++nextUniqueId}`;
    @Input( 'uxDesign' ) uxDesign: string = 'UX3';
    @Input( 'checked' ) bbChecked: boolean = false;
    @Input( 'value' ) bbValue: boolean = false;
    @Input('name') name: string | any;
    @Input('id') bbId: string = this._uniqueId;
    @Input('disabled') bbDisabled: boolean = false;
    @Input('required') bbRequired: boolean = false;
    @Input('labelPosition') bbLabelPosition: 'before' | 'after' = 'after';
    @Input( 'type' ) bbType: string='radio';
    
    radioGroup: BBRadiobuttonGroup;
    private _value: any = null;
    private _checked: boolean = false;

    @ViewChild( 'input' ) _inputElement: ElementRef | any;
    @Output() change: EventEmitter<MatRadioChange> = new EventEmitter<MatRadioChange>();

    constructor( @Optional() radioGroup: BBRadiobuttonGroup, private _changeDetector: ChangeDetectorRef,
   //     private _radioDispatcher: UniqueSelectionDispatcher,
        private _focusMonitor: FocusMonitor, ) {

        this.radioGroup = radioGroup;
        // console.log( 'radioGroup', this.radioGroup );
    }

    ngOnInit() {
        if ( this.radioGroup ) {
            this.name = this.radioGroup.name;
        }
    }

    _markForCheck() {
        this._changeDetector.markForCheck();
    }

    changeInput(evt?: any) {
        console.log( '---Input Changed---' );
        if (evt && evt.stopPropagation) {
            evt.stopPropagation();
        }

        const groupValueChanged = this.radioGroup && this.bbValue != this.radioGroup.value;
        this.bbChecked = true;
        this._emitChangeEvent();

        if ( this.radioGroup ) {
            this.radioGroup._controlValueAccessorChangeFn( this.bbValue );
            console.log( 'this.radioGroup', this.radioGroup );
            console.log( 'value--', +this.bbValue );
            this.radioGroup._touch();
            if ( groupValueChanged ) {
                this.radioGroup._emitChangeEvent();
            }
        }
    }

    private _emitChangeEvent(): void {
        const event = new MatRadioChange();
        event.source = this;
        event.value = this._value;
        this.change.emit( event );
    }
}