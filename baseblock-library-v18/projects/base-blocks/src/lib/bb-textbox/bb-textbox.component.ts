import { BaseBlockComponent } from '../base-block.component';
import { Component, OnInit, Input, ViewChild, Optional, Inject, forwardRef, Attribute ,ChangeDetectorRef , Output , EventEmitter, ViewEncapsulation, Renderer2, HostListener, ChangeDetectionStrategy} from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, NG_ASYNC_VALIDATORS, NgModel, Validator, FormControl, ValidationErrors, ControlValueAccessor } from '@angular/forms';
import { EMPTY } from 'rxjs';
import { BbAutosuggestTransactionComponent } from '../bb-autosuggest-transaction/bb-autosuggest-transaction.component';

@Component( {
    selector: 'bb-textbox',
    templateUrl: './bb-textbox.component.html',
    styleUrls: ['./bb-textbox.component.css'],
    providers: [
                {
                    provide: NG_VALUE_ACCESSOR,
                    useExisting: forwardRef(() => BBTextboxComponent ),
                    multi: true
                }, 
                { 
                    provide: NG_VALIDATORS, 
                    useExisting: BBTextboxComponent, 
                    multi: true 
                }
            ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BBTextboxComponent extends BaseBlockComponent implements Validator, ControlValueAccessor {
    @Input( 'align' ) align: 'right'|'left' = "right";
    @Input( 'requiredMessage' ) requiredMessage: string = 'This field is required';
    @Input( 'invalidMessage' ) invalidMessage: string = 'Please enter a valid input';
    @Input( 'expression' ) bbExpression = /^/;
    
    @ViewChild( NgModel ) model: NgModel | any;
    @Output() bbFocus: EventEmitter<any> = new EventEmitter<any>();

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
    @ViewChild('bbAutoSuggest') bbAutosuggestTransactionComponent: BbAutosuggestTransactionComponent | any;
    @Input('paramData') currentCompData: any;
    @Input('compData') compData: any;
    @Input('domID') domID : any = '1';
    @Input() allFormValues: any;
    @Input('transMode') transMode: any;
    @Input('formWiseFormatJson') formWiseFormatJson: any = {}; 
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
    @Input('editFlag') editFlag: any = 'A';
    @Input('noPlaceholderNotDisable') noPlaceholderNotDisable = false;
    @Input('isSimpleLayout') isSimpleLayout = false;
    @Input('limit') limit: any;
    // @Output() pophelpFieldData: EventEmitter<any> = new EventEmitter();
    @Output() autoSuggSelectedData: EventEmitter<any> = new EventEmitter();
    @Input('callApiForSimpleLayout') callApiForSimpleLayout = false;
    @Input('tokenID') tokenID = '';
    @Input('jSessionId') jSessionId = '';
    @Input('allformValues') allformValues = {};
    @Input('index') index:any = 0;
     
    public readonly customErrorMessages = {
            'required': () => this.requiredMessage,
            'minlength': ( params:any ) => 'The min number of characters is ' + params.requiredLength,
            'maxlength': ( params:any ) => 'The max allowed number of characters is ' + params.requiredLength,
            'email': (params:any) => params.message,
            'password': (params:any) => params.message,
            'phone': (params:any) => params.message
    };

    constructor(  @Attribute("validator") private validator:boolean , private cdr: ChangeDetectorRef, private renderer: Renderer2 ) {
         
        
        super();
        // this.bbType = this.datatype;
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
        if(this.limit > 0)
        {
            this.bbMaxlength = this.limit;
        }
        
        try 
        {
            // if (!this.popupList || this.popupList.length === 0) 
            if (!this.popupList) 
            {
                throw new Error('popupList is undefined or empty.');
            }
            
            if(this.popupList)
            {
                let popHelpData = this.popupList.find((pophelpInfo: any) => {
                    // console.log('print inside openPopHelp pophelpInfo:::::::', pophelpInfo);
                    return pophelpInfo.attrib['@FIELD_NAME'].toLowerCase() === this.fieldName.toLowerCase();
                });
            
        
                if (!popHelpData) 
                {
                    // console.log('No matching popHelpData found for fieldName:', this.fieldName);
                } 
                else 
                {
                    this.sqlInput = popHelpData.attrib['@SQL_INPUT'];
                    // console.log('print inside openPopHelp sqlInput:::::::', this.sqlInput);
                }
            }
        }catch (error) {
            console.error(error);
        }
    }
    
    validate(c: FormControl): ValidationErrors {
        //this.cdr.detectChanges();
        if(!this.validator){
            return EMPTY;
        }
            
        if( !c.value ) { this.errors = null; return EMPTY; }
        const isValidText = this.bbExpression.test(c.value);
        const message = {
          'textbox': {
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
     }

    openPopHelp(fieldName?: any, value?: any) 
	{
        this.popHelpRef.detailNum = 'Detail' + this.formNo
        this.popHelpRef.formWiseFormatJson = this.formWiseFormatJson;
        this.popHelpRef.paramData = this.currentCompData;
        // let tempPophelpfldName: any = '';
        console.log('print this.fieldName 169::::',this.fieldName);
        let tempPophelpfldName: any = this.fieldName;
        let sqlString: string = "";   
        if(this.fieldName && this.fieldName.includes('__'))
        {
            tempPophelpfldName = this.getFieldNameBeforeUnderscore(this.fieldName);
        }

        let popHelpFldName: any = this.pophelpDataList.find((i: any) => this.fieldName === i['attrib']['@FIELD_NAME'].toLowerCase())
        if(popHelpFldName)
        {
            sqlString = popHelpFldName['attrib']['@SQL_INPUT'];
            tempPophelpfldName = this.fieldName;
        }
        else 
        {
          let tempFldName: any
          tempFldName = this.pophelpDataList.find((i: any) => tempPophelpfldName === i['attrib']['@FIELD_NAME'].toLowerCase())
          if(tempFldName)
          {
            sqlString = tempFldName['attrib']['@SQL_INPUT'];
          }
        }
        let paramMap:any = {};
        paramMap["OBJ_NAME"] = this.compData['OBJ_NAME'];
        paramMap["FIELD_NAME"] = tempPophelpfldName;
        paramMap["SQL_INPUT"] = this.popHelpRef.checkNull(this.sqlInput);
        paramMap["EDITOR_ID"] = this.compData['EDITOR_ID'];
        paramMap["FORM_NO"] = this.formNo;
        if(this.transMode =='I')
        {
            if(this.compData['OBJ_CTX'] != '1')
            {
                paramMap["ALLFORMVALUES"] = this.popHelpRef.createChgStr(tempPophelpfldName, value);
                paramMap["TRANSMODE"] = this.transMode;
            }
            else
            {
                paramMap["PARAMXML"] = this.popHelpRef.createChgStr(tempPophelpfldName, value);
            }
        }
        else
        {
            paramMap["PARAMXML"] = this.popHelpRef.createChgStr(tempPophelpfldName, value);
        }
        paramMap["PKVALUE"] = this.pkValues;
        paramMap["EDIT_FLAG"] = this.compData['EDIT_FLAG'];
        paramMap[tempPophelpfldName.toUpperCase()] = this.popHelpRef.checkNull(value);
        paramMap['FIELD_VALUE'] = this.value;
        paramMap['isPopHelp'] = true;
        console.log('print paramMap 167::::',paramMap);
        // let newcurrentCompData =JSON.parse(this.currentCompData);
        let newcurrentCompData = this.currentCompData;
        this.popHelpRef.callApiForSimpleLayout = this.callApiForSimpleLayout;
        this.popHelpRef.tokenID = this.tokenID;
        this.popHelpRef.jSessionId = this.jSessionId;
        this.popHelpRef.allformValues = this.allformValues;
        this.popHelpRef.index = this.index;
        if (this.formNo == '1' && this.popHelpRef) 
		{
			this.popHelpRef.keyValue = "1";
            // this.pophelpFieldData.emit(JSON.stringify(paramMap)); 
            this.popHelpRef.openSuggest(tempPophelpfldName, this.value, sqlString, this.pkValues, this.bbPlaceholder, this.formNo, this.fieldName);
			// console.log('Print domID when angular sign selected::: 143', this.popHelpRef.keyValue);
		}
		else 
		{
            if(this.popHelpRef)
            {
                this.popHelpRef.keyValue = newcurrentCompData.domID;
                // this.pophelpFieldData.emit(JSON.stringify(paramMap));
                this.popHelpRef.openSuggest(tempPophelpfldName, this.value, sqlString, this.pkValues, this.bbPlaceholder, this.formNo, this.fieldName);
            } 
			// console.log('Print domID when angular sign selected::: 149', this.popHelpRef.keyValue);
		}
	}

    openAutosuggest(fldName:any, fldValue:any, formNo:any, detailRowNo?:any) 
    {
        console.log('print inside openAutosuggest::::',fldName);
        let tempPophelpfldName = fldName;
        let minLength = 3;
        this.formNo = formNo;
        // console.log('print fldValue 208:::::',fldValue);
        // if(fldValue)
        // {
        //     console.log('print fldValue length:::::',fldValue.length);
        // }
        if(fldValue && this.bbAutosuggestTransactionComponent)
        {
            this.bbAutosuggestTransactionComponent.detailNum = 'Detail' + this.formNo;
            this.bbAutosuggestTransactionComponent.keyValue = this.domID;
            // let newcurrentCompData =JSON.parse(this.currentCompData);
            let newcurrentCompData = this.currentCompData;
     
            let popHelpFldName: any = this.pophelpDataList.find((i: any) => fldName === i['attrib']['@FIELD_NAME'].toLowerCase())
            if(popHelpFldName)
            {
                tempPophelpfldName = fldName;
            }
            else 
            {
                if(fldName && fldName.includes('__'))
                {
                    tempPophelpfldName = this.getFieldNameBeforeUnderscore(fldName);
                }
            }
            console.log('print this.formNo:::::',this.formNo);
            let paramMap:any = {};
            paramMap["OBJ_NAME"] = this.compData['OBJ_NAME'];
            paramMap["FIELD_NAME"] = tempPophelpfldName;
            paramMap["SQL_INPUT"] = this.bbAutosuggestTransactionComponent.checkNull(this.sqlInput);
            paramMap["EDITOR_ID"] = this.compData['EDITOR_ID'];
            paramMap["FORM_NO"] = this.formNo;
            paramMap['isPopHelp'] = false;
            if(this.transMode =='I')
            {
                if(this.compData['OBJ_CTX'] != '1')
                {
                    paramMap["ALLFORMVALUES"] = this.bbAutosuggestTransactionComponent.createChgStr(tempPophelpfldName, fldValue);
                    paramMap["TRANSMODE"] = this.transMode;
                }
                else
                {
                    paramMap["PARAMXML"] = this.bbAutosuggestTransactionComponent.createChgStr(tempPophelpfldName, fldValue);
                }
            }
            else
            {
                paramMap["PARAMXML"] = this.bbAutosuggestTransactionComponent.createChgStr(tempPophelpfldName, fldValue);
            }
            paramMap["PKVALUE"] = this.pkValues;
            paramMap["EDIT_FLAG"] = this.compData['EDIT_FLAG'];
            paramMap[tempPophelpfldName.toUpperCase()] = this.bbAutosuggestTransactionComponent.checkNull(fldValue);
            paramMap['FIELD_VALUE'] = fldValue;
            if(this.formNo == '1' && this.bbAutosuggestTransactionComponent)
            {
                console.log('print this.tokenID::::',this.tokenID);
                this.bbAutosuggestTransactionComponent.keyValue = "1";
                // this.pophelpFieldData.emit(JSON.stringify(paramMap));
                this.bbAutosuggestTransactionComponent.openSuggest(tempPophelpfldName, fldValue, this.sqlInput, this.pkValues, minLength, this.formNo, '', fldName);

            }
            else
            {
                if(this.bbAutosuggestTransactionComponent)
                {
                    this.bbAutosuggestTransactionComponent.keyValue = newcurrentCompData.domID;
                    // this.pophelpFieldData.emit(JSON.stringify(paramMap));
                    this.bbAutosuggestTransactionComponent.openSuggest(tempPophelpfldName, fldValue, this.sqlInput, this.pkValues, minLength, this.formNo, '', fldName);
                }
            }
        }
    }

    getFieldNameBeforeUnderscore(fieldName: string): string 
	{
  		if (fieldName && fieldName.includes('__')) 
  		{
    		return fieldName.substring(0, fieldName.indexOf('__'));
  		}
  		return fieldName;
	}

    onItemChangeFromSuggestBox(event:any)
	{
		// console.log("print line no 161 event:::::::",event);
        this.itemChangeValues.emit(event);
	}

    setEmitValue(event:any)
	{
        event['FIELD_NAME'] = this.fieldName;
        event['FORM_NO'] = this.formNo;
        this.onChangeValue.emit(event);
	}

    onFocus(event: any, id?: any): Promise<void> {
        return new Promise((resolve, reject) => {
            try
            {
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
                this.focus.emit(event);
                setTimeout(() => {
                    resolve();
                }, 0);
            }
            catch(error)
            {
                console.log('Exception inside onFocus :::::::',error);
                reject(error);
            }
        });
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
        // console.log('print id 311::::',id);
        let elem: any = document.getElementById(id);
        if(elem)
        {
            let inputElement = elem.getElementsByClassName('inputClass');
            if (inputElement && inputElement[0] && inputElement[0].hasAttribute('disabled')) 
            {
                let iconElem = elem.querySelectorAll('.textFilterIcon');
                if(iconElem && iconElem[0])
                {
                    iconElem[0].classList.remove('textFilterIcon');
                    iconElem[0].classList.add('disableTextFilterIcon');
                }
            }
            else if(inputElement && inputElement[0] && !inputElement[0].hasAttribute('disabled'))
            {
                let iconElem = elem.querySelectorAll('.disableTextFilterIcon');
                if(iconElem && iconElem[0])
                {
                    iconElem[0].classList.remove('disableTextFilterIcon');
                    iconElem[0].classList.add('textFilterIcon');
                    // let optIconElem = iconElem[0].querySelectorAll('.disabledOptionIcon');
                    // console.log('print optIconElem 343::::',optIconElem);
                    // if(optIconElem && optIconElem[0])
                    // {
                    // 	optIconElem[0].classList.remove('disabledOptionIcon');
                    // 	optIconElem[0].classList.add('optionIcon');
                    // }
                }
            }
            let parentElem = elem.parentElement;
            if(parentElem)
            {
                if(parentElem.classList.contains('noPlaceholderIsDisable'))
                {
                    let matInfixDiv: any = parentElem.getElementsByClassName('mat-form-field-infix');
                    if (matInfixDiv && matInfixDiv.length > 0) 
                    {
                        for (const div of matInfixDiv) 
                        {
                            div.setAttribute('style', 'padding: 0px !important');
                            let nextElem = div.querySelector(`#${this.inputID}`);
                            if(nextElem)
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
        }
    }

    onKeyEvent(event: KeyboardEvent)
    {
        if(this.bbAutosuggestTransactionComponent)
        {
            this.bbAutosuggestTransactionComponent.handleUpDownKeyEvent(event);
        }
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent)
    {
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
        this.onKeyEvent(event);
    }

    onKeyUp(event: KeyboardEvent)
    {
    }

    ngOnDestroy() {
    }

    checkMaxLengthForNum(event: any, fldType: string)
    {
        let input = event.target as HTMLInputElement;

        let max = this.bbMaxlength;
        let value = input.value;

        if(value.length > max)
        {
            input.value = value.slice(0, max);
        }
    }

    /* getAutoSearchPophelp(data: any, fldValue: any, isPopHelp: any)
    {
        console.log('Print inside getAutoSearchPophelp isPopHelp::::',isPopHelp);
        if(data)
        {
            let result = JSON.parse(data);
            if(isPopHelp === true)
            {
                console.log('Print inside getAutoSearchPophelp this.popHelpRef 546::::',this.popHelpRef);
                this.popHelpRef.openPophelpPopUp(result);
            }
            else
            {
                console.log('Print inside getAutoSearchPophelp this.bbAutosuggestTransactionComponent 551::::',this.bbAutosuggestTransactionComponent);
                this.bbAutosuggestTransactionComponent.getData(result, fldValue);
            }
        }
    } */

    autoSuggestData(event: any)
    {
        console.log('print autoSuggestData 567::::',event);
        if(event)
        {
            event['DOM_ID'] = this.domID;
            event['INDEX'] = this.index;
            this.autoSuggSelectedData.emit(event);
        }

    } 
}