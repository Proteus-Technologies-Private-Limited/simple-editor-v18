import { Component, Directive, OnDestroy ,HostListener, OnInit, Input, AfterContentInit, ContentChildren, QueryList, ElementRef, Optional, ChangeDetectorRef, forwardRef, Output, EventEmitter , ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { ValueAccessorBase } from '../form/value-accessor';

let _uniqueIdCounter = 0;

export const BB_SELECT_CONTROL_VALUE_ACCESSOR: any = {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BBSelect ),
        multi: true
};

@Component({
    selector: 'bb-select',
    templateUrl: './bb-choice.component.html',
    styleUrls: ['./bb-choice.component.css'],
    providers: [BB_SELECT_CONTROL_VALUE_ACCESSOR]
})
export class BBSelect<T> extends ValueAccessorBase<T> implements AfterContentInit , OnDestroy{
    @ContentChildren( forwardRef(() => BBOption ) ) options: QueryList<BBOption> | any;
    @Input( 'uxDesign' ) uxDesign: string = 'UX3';
    @Input( 'placeholder' ) bbPlaceholder: string = 'Select';
    @Input('required') bbRequired: boolean = false;
    @Input('floatPlaceholder') bbFloatPlaceholder: any;
    @Input('value') bbValue: string | any;
    @Input('disableRipple') bbDisableRipple: boolean = false;
    @Input('panelClass') bbPanelClass: any;
    @Input('multiple') bbMultiple: boolean = false;
    @Input('disabled') bbDisabled: boolean = false;
    
    @Output() bbChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() bbOnOpen: EventEmitter<any> = new EventEmitter<any>();
    @Output() bbOnClose: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('mySelect') mySelect: any;

    ngAfterContentInit(){
        console.log('optionGroups',this.options);
        
      //  this.options.forEach(alertInstance => console.log(alertInstance));
    }
    
    @HostListener('window:orientationchange', ['$event']) 
    orientationChange(event: any) {
        if(this.mySelect){
            setTimeout(() => {
                this.mySelect.close();
              }, 0)
        }
     }
    
    ngOnDestroy() { 
      console.log("ngOnDestroy of bb-choice component"); 
    }
    
}

@Directive( {
    selector: 'bb-option'
})
export class BBOption {

    private _uniqueId: string = `bb-option-${_uniqueIdCounter++}`;
    @Input( 'value' ) bbValue: any;
    @Input('id') bbId: string = this._uniqueId;
    @Input( 'disabled' ) bbDisabled: boolean = false;
    
    constructor(private _element: ElementRef) {
    }
    
    _getHostElement(): HTMLElement {
        return this._element.nativeElement;
    }
    
    get viewValue(): string {
        return (this._getHostElement().textContent || '').trim();
    }
}
