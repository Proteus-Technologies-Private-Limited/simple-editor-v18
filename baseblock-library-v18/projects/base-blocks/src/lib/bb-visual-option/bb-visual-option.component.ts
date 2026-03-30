import { Component, OnInit, Input, OnChanges,EventEmitter,Output,ViewEncapsulation,ElementRef } from '@angular/core';
// import { FilterInfo } from '../bb-criteria-input/filter-info.model';
import { DatePipe } from '@angular/common';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';

@Component({
  selector: 'bb-visual-option',
  templateUrl: './bb-visual-option.component.html',
  styleUrls: ['./bb-visual-option.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class BBVisualOptionComponent implements OnInit {
    @Input() defaultVisual:any;
    @Input() currentVisual:any;
    @Input() editorVisuals:any;
    @Input() isDashboard:any;
    overLayRefForVisualOption: OverlayRef | any;
    @Output() onCloseAction: EventEmitter<any> = new EventEmitter();
    @Output() onDoneAction: EventEmitter<any> = new EventEmitter();
    optionArray:any;
    listValues:any;
    listFinalJson:any= {};
    listFinalArr = [];
    // Added by Samruddhi on 14-06-2022 to add toggle button for boolean values
    checked: boolean = false;
  constructor(public ele: ElementRef) { }

    ngOnInit()
    {
        this.optionArray = this.currentVisual['options'];
        for (let key in this.optionArray) 
        {
            let listOfValuesArray:any = [];
            let listOfValue = this.optionArray[key]['optionId'];
            this.listValues = this.optionArray[key].listOfValues;
            if( this.listValues != undefined)
            {
                listOfValuesArray[key] = this.listValues.split(",");
            }
            this.listFinalJson[listOfValue] = listOfValuesArray[key];
            this.listFinalArr = this.listFinalJson[listOfValue];
            // Added by Samruddhi on 14-06-2022 to add toggle button for boolean values [Start]
            if(this.optionArray[key]['dataType'] == "boolean" && (this.optionArray[key]['defaultValue'] == "true" || this.optionArray[key]['defaultValue'] == "false"))
            {
                this.checked = JSON.parse(this.optionArray[key]['defaultValue']);
                this.optionArray[key]['checked'] = this.checked;
            }
            
            if(this.optionArray[key]['dataType'] == "boolean" && this.optionArray[key]['defaultValue'] == "on")
            {
                this.checked = true;
                this.optionArray[key]['checked'] = this.checked;
            } 
            else if(this.optionArray[key]['dataType'] == "boolean" && this.optionArray[key]['defaultValue'] == "off")
            {
                this.checked = false;
                this.optionArray[key]['checked'] = this.checked;
            } 
            // Added by Samruddhi on 14-06-2022 to add toggle button for boolean values [End]
        }
    }

    submit(event:any)
    {
        let doneAction:any = {};
        doneAction['event'] = event;
        doneAction['currentVisual'] = this.currentVisual;
        doneAction['currentVisualOption'] = this.currentVisual['options'];
        let currentEditorVisual = [];
        currentEditorVisual = this.editorVisuals['Visuals'];
        doneAction['currentEditorOption'] = this.editorVisuals;
        this.onDoneAction.emit(JSON.stringify(doneAction));
    }
  
    closeFilter(event:any)
    {
        let closeAction:any = {};
        closeAction['event'] = event;
        this.onCloseAction.emit(JSON.stringify(closeAction));
    }

    getImgSrc(dataType:any)
    {
        var imgUrl;
        if(dataType == "number")
        {
            imgUrl = "/ibase/Insight/angplugin/assets/images/Numeric.svg";
        }
        else if(dataType == "string")
        {
            imgUrl = "/ibase/Insight/angplugin/assets/images/String.svg";
        }
        else if(dataType == "boolean")
        {
            imgUrl = "/ibase/Insight/angplugin/assets/images/svg/Boolean.svg";
        }
        else
        {
            imgUrl = "";
        }
        return imgUrl;
    }

    // Added by Samruddhi on 15-06-2022 to add toggle button for boolean values
    optionToggleBtn(currOptionName: any)
    {
        for(let i = 0; i < this.optionArray.length; i++)
        {
            if(this.optionArray[i]['optionName'] == currOptionName && this.optionArray[i]['dataType'] == "boolean")
            {
                if(this.optionArray[i]['defaultValue'] == "false")
                {
                    this.optionArray[i]['defaultValue'] = "true";
                }
                else if(this.optionArray[i]['defaultValue'] == "true")
                {
                    this.optionArray[i]['defaultValue'] = "false";
                }
                else if(this.optionArray[i]['defaultValue'] == "off")
                {
                    this.optionArray[i]['defaultValue'] = "on";
                }
                else if(this.optionArray[i]['defaultValue'] == "on")
                {
                    this.optionArray[i]['defaultValue'] = "off";
                }
            }
        }
    }

    // Added by Samruddhi on 28-07-2022 to implement shadow dom logic
    ngAfterViewInit()
    {
        const shadowRoot: DocumentFragment | any = this.ele.nativeElement.shadowRoot;
        const styleCss = document.createElement('style');
        styleCss.textContent = `
            .form-field-input
            {
                background-color: transparent !important;
                backdrop-filter: blur(12px) !important;
                padding-top: 11px !important;
            }
            .full-form-field
            {
                width: calc(100% - 10px) !important;
                --primary: auto;
                font-size: 14px !important;
                padding-top: 10px !important;
            }
            .full-form-field-select
            {
                width: calc(100% - 10px) !important;
                --primary: auto !important;
                font-size: 14px !important;
                padding-top: 2px !important;
            }

            .full-form-fieldInput
            {
                width: calc(100% - 10px) !important;
                --primary: auto !important;
                font-size: 14px !important;
                border-bottom: 0.5px #6666 solid !important;
            }
            .mat-form-field-appearance-legacy .mat-form-field-underline 
            {
                background-color: rgba(0, 0, 0, .42) !important;
                height: 1px !important;
                bottom: 1.25em !important;
            }
            .mat-form-field-appearance-legacy .mat-form-field-wrapper
            {
                padding-bottom: 1.25em !important;
            }
            .mat-form-field-infix 
            {
                border: 0px !important;
                padding: 0 !important;
                display: block !important;
                position: relative !important;
                flex: auto !important;
                min-width: 0 !important;
                width: 100% !important;
            }
            input.mat-input-element 
            {
                margin-top: -0.0625em !important;
            }
            .mat-input-element 
            {
                caret-color: var(--primary) !important;
            }
            .mat-form-field-label-wrapper 
            {
                top: -0.84375em !important;
                padding-top: 0.84375em !important;
            }
            .mat-form-field-underline 
            {
                position: absolute !important;
                width: 100% !important;
                pointer-events: none !important;
                transform: scale3d(1, 1.0001, 1) !important;
            }
            .mat-form-field-appearance-legacy .mat-form-field-label 
            {
                top: 1.28125em !important;
            }
        `;
        shadowRoot.getElementById('bb-visual-container').parentNode.appendChild(styleCss);
    }
}
