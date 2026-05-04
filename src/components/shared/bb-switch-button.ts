import { Component, OnInit, Input, Output, forwardRef, EventEmitter, ViewEncapsulation, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

let nextUniqueId = 0;
export const BB_SWITCH_CONTROL_VALUE_ACCESSOR: any = {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BBSwitchButton ),
        multi: true
};

export abstract class ValueAccessorBase<T> implements ControlValueAccessor {
    private innerValue!: T;

    private changed = new Array<( value: T ) => void>();
    private touched = new Array<() => void>();

    get value(): T {
        return this.innerValue;
    }

    set value( value: T ) {
        if ( this.innerValue !== value ) {
            this.innerValue = value;
            this.changed.forEach( f => f( value ) );
        }
    }

    writeValue( value: T ) {
        this.innerValue = value;
    }

    registerOnChange( fn: ( value: T ) => void ) {
        this.changed.push( fn );
    }

    registerOnTouched( fn: () => void ) {
        this.touched.push( fn );
    }

    touch() {
        this.touched.forEach( f => f() );
    }
}

@Component( {
  standalone: false,
    selector: 'bb-switch',
    template: `
    
        <label class="bb-switch">
          <input [id]="bbId" [align]="bbAlign" [disabled]="bbDisabled"
          [name]="bbName"  [type]="bbType" 
          [required]="bbRequired" [checked]="bbChecked" 
          [value]="bbValue"  
          (change)="bbChange.emit($event);" 
          [(indeterminate)]="bbIndeterminate" />
          <span class="bb-slider" [ngClass]="{ 'round' : isRounded }"></span>
        </label>

    `,
    styles: [
    `
        .bb-switch {
          position: relative;
          display: inline-block;
          width: 56px;
          height: 30px;
        }
        
        .bb-switch input { 
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .bb-slider{
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          -webkit-transition: .4s;
          transition: .4s;
        }
        
        .bb-slider:before {
          position: absolute;
          content: 'Yes';
          font-size: 12px;
		  font-weight: 700;
          text-align:center;
          line-height: 26px;
          height: 26px;
          width: 26px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          -webkit-transition: .4s;
          transition: .4s;
        }
        
        .bb-switch > input + .bb-slider:before {
          content: 'No';
        }
        
        .bb-switch > input:checked + .bb-slider:before {
          content: 'Yes';
        }
        
        .bb-switch > input:checked + .bb-slider {
          background-color: #2196F3;
        }
        
        .bb-switch > input:focus + .bb-slider {
          box-shadow: 0 0 1px #2196F3;
        }
        
        .bb-switch > input:checked + .bb-slider:before {
          -webkit-transform: translateX(26px);
          -ms-transform: translateX(26px);
          transform: translateX(26px);
        }
        
        
        /* Rounded bb-sliders */
        .bb-slider.round {
          border-radius: 32px;
        }
        
        .bb-slider.round:before {
          border-radius: 50%;
        }
    `
    ],
    providers: [BB_SWITCH_CONTROL_VALUE_ACCESSOR],
    encapsulation: ViewEncapsulation.None
})
export class BBSwitchButton<T> extends ValueAccessorBase<T> implements OnInit {
    
    private _uniqueId: string = `bb-checkbox-${++nextUniqueId}`;
    @Input( 'uxDesign' ) uxDesign: string = 'UX1';
    @Input( 'id' ) bbId = this._uniqueId;
    @Input( 'required' ) bbRequired:any;
    @Input( 'align' ) bbAlign!: 'start' | 'end';
    @Input( 'labelPosition' ) bbLabelPosition:'before' | 'after' = 'after';
    @Input( 'name' ) bbName:any;
    @Input( 'value' ) bbValue:any;
    @Input( 'checked' ) bbChecked: boolean = false;
    @Input( 'indeterminate' ) bbIndeterminate: boolean = false;
    @Input( 'disabled' ) bbDisabled: boolean = false;
    @Input( 'type' ) bbType: string='checkbox';
    @Input() isRounded: boolean= false;
    
    @Output() bbChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() bbIndeterminateChange: EventEmitter<any> = new EventEmitter<any>();
    

    ngOnInit() {
    }
}

@NgModule({
    declarations: [
        BBSwitchButton,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ],
    exports: [
        BBSwitchButton
    ],
    providers: [],
    bootstrap: []
})
  export class BBSwitchButtonModule { }

