import { Component, OnInit, Input, Output, forwardRef, EventEmitter, ViewEncapsulation} from '@angular/core';
import { ValueAccessorBase } from '../form/value-accessor';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

let nextUniqueId = 0;
export const BB_SWITCH_CONTROL_VALUE_ACCESSOR: any = {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BBSwitchButtonComponent ),
        multi: true
};

@Component( {
    selector: 'bb-switch',
    templateUrl: './bb-switch-button.component.html',
    styleUrls: ['./bb-switch-button.component.css'],
    providers: [BB_SWITCH_CONTROL_VALUE_ACCESSOR],
    encapsulation: ViewEncapsulation.None
})
export class BBSwitchButtonComponent<T> extends ValueAccessorBase<T> implements OnInit {

    private _uniqueId: string = `bb-checkbox-${++nextUniqueId}`;
    @Input( 'uxDesign' ) uxDesign: string = 'UX1';
    @Input( 'id' ) bbId = this._uniqueId;
    @Input( 'required' ) bbRequired: any;
    @Input( 'align' ) bbAlign: 'start' | 'end' | any;
    @Input( 'labelPosition' ) bbLabelPosition:'before' | 'after' = 'after';
    @Input( 'name' ) bbName: any;
    @Input( 'value' ) bbValue: any;
    @Input( 'checked' ) bbChecked: boolean = false;
    @Input( 'indeterminate' ) bbIndeterminate: boolean | any = false;
    @Input( 'disabled' ) bbDisabled: boolean = false;
    @Input( 'type' ) bbType: string='checkbox';
    @Input() isRounded: boolean= false;
    
    @Output() bbChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() bbIndeterminateChange: EventEmitter<any> = new EventEmitter<any>();

    ngOnInit() {
    }

}
