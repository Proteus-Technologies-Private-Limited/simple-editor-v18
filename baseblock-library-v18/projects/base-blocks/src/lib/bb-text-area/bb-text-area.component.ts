import { Component, Input, ViewChild, Attribute, ElementRef, Renderer2 ,ChangeDetectorRef , Output , EventEmitter,forwardRef, ViewEncapsulation, ViewChildren, QueryList, Optional, Inject, HostListener, ChangeDetectionStrategy}from '@angular/core';
import { NgModel, Validator, FormControl, ValidationErrors, NG_ASYNC_VALIDATORS, NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor } from '@angular/forms';
import { EMPTY } from 'rxjs';
import { ValueAccessorBase } from '../form';
import { BbAutosuggestTransactionComponent } from '../bb-autosuggest-transaction/bb-autosuggest-transaction.component';

@Component( {
    selector: 'bb-textarea',
    templateUrl: './bb-text-area.component.html',
    styleUrls: ['./bb-text-area.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BBTextAreaComponent ),
            multi: true
        }, 
        { 
            provide: NG_VALIDATORS, 
            useExisting: BBTextAreaComponent, 
            multi: true 
        }
    ],
// encapsulation: ViewEncapsulation.Emulated,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BBTextAreaComponent extends ValueAccessorBase<string> implements Validator, ControlValueAccessor{
    @ViewChild( 'textArea' ) textArea: any;
    @ViewChild( NgModel ) model: NgModel | any;
    @Output() bbFocusOut: EventEmitter<any> = new EventEmitter<any>();

    
    textAreaInput: any;
    @Input( 'align' ) align: string | any;
    @Input( 'rows' ) bbRows: number = 3;  //default value for rows
    @Input( 'cols' ) bbColoumn: number = 12;        //default value for column
    @Input( 'resize' ) bbResize: string = 'none';
    @Input( 'direction' ) bbDirection: 'ltr'|'rtl' = 'ltr'; //direction of text rtl,ltr
    @Input( 'height' ) bbTextArHeight: string = 'auto !important';
    @Input( 'uxDesign' ) uxDesign: string = 'UX3';
    @Input( 'uxTheme' ) uxTheme: string | any;
    @Input( 'placeholder' ) bbPlaceholder: string = '';
    @Input( 'required' ) bbRequired: boolean = false;
    // @Input( 'value' )  value: string = '';
    @Input( 'value' )  bbValue: string = '';
    @Input( 'disabled' ) bbDisabled: boolean = false;
    @Input( 'maxlength' ) bbMaxlength: number = 524288;  //default value for maxlength
    @Input( 'minlength' ) bbMinlength: number = 0;        //default value for minlength
    @Input( 'readOnly' ) bbReadOnly: boolean = false;
    @Input( 'autofocus' ) bbAutofocus: boolean = false;
    @Input( 'autoexpand' ) bbAutoexpand: boolean = false;
    @Input( 'requiredMessage' ) requiredMessage: string = 'This field is required';
    @Input( 'expression' ) bbExpression = /^/;
    @Input( 'invalidMessage' ) invalidMessage: string = 'Invalid Input';
    @Input( 'label' ) bbLabel: string = '';
    @Input( 'labelPosition' ) bbLabelPostion: 'left'|'top' = "top";

    
    errors : any ;
    sqlInput : any ;
    detailNum :any;
    popupList : any;
    @Input('fieldName') fieldName: any;
    @Input('popHelpRef') popHelpRef: any;
    @Input('pophelpDataList') pophelpDataList : any;
    @Input('pkValues') pkValues: any;
    @Input('drawPophelp') drawPophelp: any;
    @Input('formNo') formNo: any = '1';
    @ViewChild(BbAutosuggestTransactionComponent) bbAutosuggestTransactionComponent: BbAutosuggestTransactionComponent | any;
    @Input('paramData') currentCompData: any;
    @Input('compData') compData: any;
    @Input('domID') domID : any = '1';
    @Input() allFormValues: any;
    @Output() itemChangeValues: EventEmitter<any> = new EventEmitter();
    @Output() onChangeValue: EventEmitter<any> = new EventEmitter();
    @Output() focus: EventEmitter<any> = new EventEmitter();
    @Output() preventItemChange: EventEmitter<any> = new EventEmitter();
    @Output() preventPopHelpItemChange: EventEmitter<any> = new EventEmitter();
    @Input('dataType') dataType: any;
    @Output() blur: EventEmitter<any> = new EventEmitter();
    @Input('inputID') inputID: any;
    @Input('placeholder') placeholder: any;
    @Input('required') required: any
    @Input('disabled') bbTextDisabled: any;
    @Input('noPlaceholderIsDisable') noPlaceholderIsDisable = false;
    @Input( 'type' ) bbType: string | any;
    @Input('editFlag') editFlag: any = 'A';
    @Input('noPlaceholderNotDisable') noPlaceholderNotDisable = false;
    @Input('limit') limit: any;

    public readonly customErrorMessages = {
            'required': () => this.requiredMessage,
            'minlength': ( params:any) => 'The min number of characters is ' + params.requiredLength,
            'maxlength': ( params:any) => 'The max allowed number of characters is ' + params.requiredLength,
            'email': (params:any) => params.message,
            'password': (params:any) => params.message,
            'phone': (params:any) => params.message
    };
    
    constructor( elementRef: ElementRef, renderer: Renderer2, @Attribute("validator") public validator:string ,private cdr :ChangeDetectorRef) {
        super();
        
        renderer.listen( elementRef.nativeElement, 'keydown', ( event: any ) => {
            // Do something with 'event'
            if ( this.bbAutoexpand )
                this.autosize();
        });
    }
    
    ngOnInit() 
    {
        if(this.dataType != undefined && (this.dataType == 'char' || this.dataType == 'String')){
            this.bbType = 'text';
        }
        else if(this.dataType != undefined && (this.dataType == 'number' || this.dataType == 'decimal')){
            this.bbType = 'number';
        } 
        else
        {
            this.bbType = 'text';
        }
        this.popupList = this.pophelpDataList;
        // console.log('print popupList in the bb-textarea:::::::', this.popupList);
        if(this.limit > 0)
        {
            this.bbMaxlength = this.limit;
        }
        try 
        {
            // if (!this.popupList || this.popupList.length === 0) 
            // if (!this.popupList) 
            // {
            //     throw new Error('popupList is undefined or empty.');
            // }
        
            if(this.popupList != undefined && this.popupList != null && this.popupList != '')
            {
                let popHelpData = this.popupList.find((pophelpInfo: any) => {
                    //console.log('print inside openPopHelp pophelpInfo:::::::', pophelpInfo);
                    return pophelpInfo.attrib['@FIELD_NAME'].toLowerCase() === this.fieldName.toLowerCase();
                });
            
                if (!popHelpData) 
                {
                    //console.log('No matching popHelpData found for fieldName:', this.fieldName);
                } 
                else 
                {
                    this.sqlInput = popHelpData.attrib['@SQL_INPUT'];
                    //console.log('print inside openPopHelp sqlInput:::::::', this.sqlInput);
                }
            }
        } catch (error) {
            console.error('print error in textarea::::',error);
        }
    }

    autosize() {
        let el = this.textArea.nativeElement;

        setTimeout( function() {
            el.style.height = 'auto';
            el.style.padding = '0';
            // for box-sizing other than "content-box" use:
            // el.style.cssText = '-moz-box-sizing:content-box';
            //   console.log("el style",el.style);
            el.style.height = el.scrollHeight + 'px';
        }, 0 );

    }
    
    validate(c: FormControl): ValidationErrors {
        if(!this.validator){
            return EMPTY;
        }
            
        if( !c.value ) { this.errors = null; return EMPTY; }
        const isValidText = this.bbExpression.test(c.value);
        const message = {
          'textarea': {
            'message': this.invalidMessage
          }
        };
        if( !isValidText )
        {
            this.errors = message;
        }
        else{
            this.errors = null;
        }
        return isValidText ? null as any: message;
    }
    
    ngAfterViewChecked(){
        //your code to update the model
        this.cdr.detectChanges();
     }

    openPopHelp() 
	{
        this.popHelpRef.detailNum = 'Detail' + this.formNo;
        this.popHelpRef.paramData = this.currentCompData;
        var sqlString: string = "";
		for (var i = 0; i < this.pophelpDataList.length; i++) 
		{
			var popHelpFldName: string = this.pophelpDataList[i]['attrib']['@FIELD_NAME'].toLowerCase();
			if (this.fieldName == popHelpFldName) 
			{
				sqlString = this.pophelpDataList[i]['attrib']['@SQL_INPUT'];
                // console.log('print sqlString:::::::',sqlString);
				break;
			}
		}
        let newcurrentCompData = this.currentCompData;
        if (this.formNo == '1' && this.popHelpRef) 
		{
			this.popHelpRef.keyValue = 1;
            this.popHelpRef.formNo = "1";
            this.popHelpRef.openSuggest(this.fieldName, this.value, sqlString, this.pkValues, this.bbPlaceholder, this.formNo);
		}
		else 
		{
            if(this.popHelpRef)
            {
                this.popHelpRef.keyValue = newcurrentCompData.domID;
                this.popHelpRef.formNo = this.formNo;
                this.popHelpRef.openSuggest(this.fieldName, this.value, sqlString, this.pkValues, this.bbPlaceholder, this.formNo);
            }
		}
	}

    openAutosuggest(fldName:any, fldValue:any, formNo:any, detailRowNo?:any) 
    {
        let minLength = 3;
        // console.log('print inside openAutosuggest:::::::147',this.bbAutosuggestTransactionComponent); 
        if(fldValue && this.bbAutosuggestTransactionComponent)
        {
            this.bbAutosuggestTransactionComponent.detailNum = 'Detail' + formNo;
            this.bbAutosuggestTransactionComponent.keyValue = this.domID;
            this.bbAutosuggestTransactionComponent.openSuggest(fldName, fldValue, this.sqlInput, this.pkValues, minLength, formNo);
        }
     } 

    onItemChangeFromSuggestBox(event:any)
	{
		console.log("print line no 161 event:::::::",event);
        this.itemChangeValues.emit(event);
	}

    setEmitValue(event:any)
	{
        event['FIELD_NAME'] = this.fieldName;
        event['FORM_NO'] = this.formNo;
        this.onChangeValue.emit(event);
	}

    onFocus(event: any, id?: any) {
        id = id + "_Icon";
        let iconElem = document.getElementById(id);
        
        if (iconElem && iconElem.classList.contains('optionIcon')) 
        {
            iconElem.classList.remove('optionIcon');
            iconElem.classList.add('focusOptionIcon');
            let imgElem = iconElem.getElementsByTagName('img');
            if(imgElem && imgElem[0])
            {
                imgElem[0].setAttribute('src','/ibase/Insight/angplugin/assets/images/svg/'+this.bbType+'_simple_W.svg')
            }
        }
        function debounce(fn: any, delay: any) 
		{
			let timeout: any;
			return (...args: any) => {
				clearTimeout(timeout);
				timeout = setTimeout(() => fn(...args), delay);
			};
		}
		
		document.addEventListener('keydown', debounce(() => {
		}, 200));
		document.addEventListener('click', debounce(() => {
		}, 200));
        this.focus.emit(event);
    }

    onBlur(event: any, id?: any) {
        id = id + "_Icon";
        let iconElem = document.getElementById(id);
        
        if (iconElem && iconElem.classList.contains('focusOptionIcon')) 
        {
            iconElem.classList.remove('focusOptionIcon');
            iconElem.classList.add('optionIcon');
            let imgElem = iconElem.getElementsByTagName('img');
            if(imgElem && imgElem[0])
            {
                imgElem[0].setAttribute('src','/ibase/Insight/angplugin/assets/images/svg/'+this.bbType+'_simple.svg')
            }
        }
        let preventItemChangeJSON: any = {};
        preventItemChangeJSON['preventItemChange'] = false;
        preventItemChangeJSON['preventPopHelpItemChange'] = false;
        preventItemChangeJSON['input'] = event.target as HTMLInputElement;
        function debounce(fn: any, delay: any) 
		{
			let timeout: any;
			return (...args: any) => {
				clearTimeout(timeout);
				timeout = setTimeout(() => fn(...args), delay);
			};
		}
		
		document.addEventListener('keydown', debounce(() => {
		}, 200));
		document.addEventListener('click', debounce(() => {
		}, 200));
        this.blur.emit(preventItemChangeJSON);
    }

    onPreventItemChange(event: any)
    {
        this.preventItemChange.emit(event);
    }

    onMouseOver(event: any)
    {
        let preventPopHelpItemChangeJSON: any = {};
        preventPopHelpItemChangeJSON['preventPopHelpItemChange'] = true;
        this.preventPopHelpItemChange.emit(JSON.stringify(preventPopHelpItemChangeJSON));
    }

    onMouseOut(event: any)
    {
        let preventPopHelpItemChangeJSON: any = {};
        preventPopHelpItemChangeJSON['preventPopHelpItemChange'] = false;
        this.preventPopHelpItemChange.emit(JSON.stringify(preventPopHelpItemChangeJSON));
    }

    setVisible(id: any)
    {
        this.cdr.detectChanges();
        // console.log('print id 305::::',id);
        let elem = document.getElementById(id);
        if(elem)
        {
            let inputElement = elem.getElementsByClassName('textAreaInputClass');
            if (inputElement && inputElement[0] && inputElement[0].hasAttribute('disabled')) 
            {
                let iconElem = elem.querySelectorAll('.textAreaFilterIcon');
                if(iconElem && iconElem[0])
                {
                    iconElem[0].classList.remove('textAreaFilterIcon');
                    iconElem[0].classList.add('disableTextAreaFilterIcon');
                }
            }
            else if(inputElement && inputElement[0] && !inputElement[0].hasAttribute('disabled'))
            {
                let iconElem = elem.querySelectorAll('.disableTextAreaFilterIcon');
                if(iconElem && iconElem[0])
                {
                    iconElem[0].classList.remove('disableTextAreaFilterIcon');
                    iconElem[0].classList.add('textAreaFilterIcon');
                }
            }
            let parentElem = elem.parentElement;
            if(parentElem)
            {
                if(parentElem.classList.contains('noPlaceholderIsDisable'))
                {
                    parentElem.setAttribute('style','height: auto !important');
                    let matInfixDiv: any = parentElem.getElementsByClassName('mat-form-field-infix');
                    if (matInfixDiv && matInfixDiv.length > 0) 
                    {
                        for (const div of matInfixDiv) 
                        {
                            div.setAttribute('style', 'padding: 0px !important');
                            let nextElem = div.querySelector(`#${this.inputID}`);
                            if(nextElem)
                            {
                                nextElem.setAttribute('style','width: 100% !important; border-radius: 0px !important');
                            }
                        }
                    }
                }
            }
        }
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        event.stopPropagation();
        // For Enter/Tab with autosuggest open and item selected, select the item
        // and force change detection so the input value and popup state update
        if ((event.key === 'Enter' || event.key === 'Tab') &&
            this.bbAutosuggestTransactionComponent &&
            this.bbAutosuggestTransactionComponent.isOpen &&
            this.bbAutosuggestTransactionComponent.selectedIndex >= 0) {
            this.bbAutosuggestTransactionComponent.handleUpDownKeyEvent(event);
            this.cdr.detectChanges();
            return;
        }
        if(this.bbAutosuggestTransactionComponent)
        {
            this.bbAutosuggestTransactionComponent.handleUpDownKeyEvent(event);
        }
    }
    
    ngOnDestroy() {
        window.removeEventListener('keydown', this.onKeyDown);
        // window.removeEventListener('click', this.onClick);
    }
}