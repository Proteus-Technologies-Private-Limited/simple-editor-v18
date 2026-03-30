import { Component, OnInit, Input, OnChanges,EventEmitter,Output,ViewEncapsulation,ElementRef } from '@angular/core';
import { FilterInfo } from './bb-criteria-input/filter-info.model';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'bb-criteria',
  templateUrl: './bb-criteria.component.html',
  styleUrls: ['./bb-criteria.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class BBCriteriaComponent implements OnInit {
    @Input() deviceType : string | any;
    @Input() filters:any;
    @Output() onFilterDone : EventEmitter<any> = new EventEmitter<any>();
    @Output() onFilterClose : EventEmitter<any> = new EventEmitter<any>();
    @Input('metadataName') metadataName: string = ''; //Dashboard metadataName
    filterDisplay : string = 'Y';
    fromDateInput : Date | any =null;
    toDateInput : Date | any =null;
    dueDate: any;
    inValid:boolean | any;
    dateFormat = 'dd-MM-yy';
    filterExprInput: any = {};
    fiterExprParam : any = {};
    filterDataSvc: any;
    submittedData: FilterInfo[] = [];
    //Added by nikhil on 15-04-2022 for pophelp info
    @Input() isCriteriaPopUp: boolean | any;
    // Added by Sujan on 07-12-2022 for between operator
    fromInputFieldVal:any;
    toInputFieldVal:any;

  constructor(public ele: ElementRef) { }

  ngOnInit(): void {
    console.log(' >>>  BbCriteriaComponent ngOnit() <<  ',this.filters,this.metadataName);
    //added by mayuri on 18/08/2023 forn between condition [start]
    for(let i=0;i<this.filters.length;i++)
    {
        let NewFilter = this.filters[i];
        if(NewFilter['operator'] == 'between' || NewFilter['operator'] == 'BETWEEN')
        {
          let latestFilterVal = NewFilter['default_value'];
          let currentChnagedVal = [];
          currentChnagedVal =  latestFilterVal.split(',');
          this.fromInputFieldVal = currentChnagedVal[0];
          this.toInputFieldVal = currentChnagedVal[1];
        }
    }
    //added by mayuri on 18/08/2023 forn between condition [end]
  }

  updateFilterParam(filterInfo: any) 
    {
/*        if(filterInfo.mandatory == 'Y' && filterInfo.changedValue == null){
            this.isNotValid = this.isNotValid || true;
            console.log('fitler type  :',this.isNotValid);    
        }else {
            this.isNotValid = false;
        }*/
        
        console.log('updateFilterParam filterInfo :', this.submittedData.length, filterInfo);
        if(filterInfo.col_name=='fromDate'){
            this.fromDateInput=filterInfo.changedValue;
           
            this.fromDateInput=this.toDate(this.fromDateInput);
        }

        if(filterInfo.col_name=='toDate'){
            this.toDateInput=filterInfo.changedValue;
           
            this.toDateInput=this.toDate(this.toDateInput);
        }

        var index = this.submittedData.findIndex( function(elm) {
            return filterInfo.col_id == elm.col_id;
        });
        console.log('updateFilterParam index filterInfo :',index);
        if( index == -1)
        {
            this.submittedData.push(filterInfo);
            console.log('submittedData in if of filterSCreen',this.submittedData);
        }
        else
        {
            this.submittedData[index] = filterInfo;
            console.log('submittedData in else of filterSCreen',this.submittedData);
        }
        console.log('updateFilterParam submittedData.length :', this.submittedData.length);
        console.log('updateFilterParam fromDate :', this.fromDateInput,this.toDateInput);
        
     
    }
    
    //Added Kamal.P to get filterExpression value  from filterInput component START
    onPophelp(filterExpr: any){
        //var filterExprFieldName = filterExpr.substring(filterExpr.indexOf(':')+1, filterExpr.lastIndexOf(':'));
        //console.log('inside on pophelp filterExpressionValue==>',filterExprFieldName);
        
        console.log('filterExpr bb criteria.co==>',filterExpr);
        // Changes added by Pramod S for pass filter input parameter
        if(filterExpr.includes(':'))
		{
			var filterExprFieldName = filterExpr.substring(filterExpr.indexOf(':')+1, filterExpr.lastIndexOf(':'));
		}
		else if(filterExpr != null && filterExpr !== "" && filterExpr != undefined && filterExpr.includes(';'))
		   {
			   var filterSqlInputPram = filterExpr.substring(filterExpr.indexOf(';')+1, filterExpr.lastIndexOf(';'));

	               this.submittedData.forEach(
		            filterInfo => {
		                console.log(' inside if condition on popHelp filterInfo value when data is submited==>',filterInfo);
		                if(filterInfo.col_name == filterSqlInputPram){
		                    this.fiterExprParam[filterSqlInputPram] = filterInfo.changedValue;
		                    console.log('onPophelp filterInfo.changedValue ==>',this.fiterExprParam);
		                }
		            }
		        );
		   }
        // Changes added by Pramod S for pass filter input parameter
        this.submittedData.forEach(
            filterInfo => {
                console.log(' inside if condition on popHelp filterInfo value when data is submited==>',filterInfo);
                if(filterInfo.col_name == filterExprFieldName){
                    this.filterExprInput[filterExprFieldName] = filterInfo.changedValue;
                    console.log('filterExpObj value inside on popHelp==>',this.filterExprInput);
                }
            }
        );
        
    }
    //Added Kamal.P to get filterExpression value  from filterInput component END

    toDate( dateStr: any ) 
    {
        console.log('fromDate::::::::',dateStr);
        
        if(dateStr.indexOf('/') != -1)
        {            
            var splitDate =dateStr.split("/");
            console.log('splitDate::: :',splitDate);
            let firstdate= splitDate[0];
            let month= splitDate[1];
            dateStr=month+'/'+firstdate+'/'+splitDate[2];
            console.log('updated fromDate::: :',dateStr);
            var datePipe = new DatePipe( "en-US" );
            this.dueDate= datePipe.transform(dateStr, 'dd/MM/yyyy' );
            console.log('dueDate::: :',this.dueDate);
            var parts = this.dueDate.split( "/" );
            console.log('parts::: :', parts);
            return new Date( parts[2], parts[1]-1,parts[0]  );            
        }
        else
        {
            return new Date( dateStr  );
        }    
        
        
    }

    submit(){
        console.log('form values',this.submittedData);
    }
  
    closeFilter(event: any)
    {
        console.log('closeFilter...');
        this.onFilterClose.emit(this.submittedData);
        //this.filterDataSvc.clearFilterParameters();
       // this.dashboardFilterComponent.onFilterDone(event);
    }

    applyFilter(event: any) 
    {
       var  count=1;

        console.log('submittedData :',this.submittedData);
        for(var filter of this.submittedData){
            console.log('filter ',filter);
            console.log('filter.changedValue ',filter.changedValue);
            
            if(filter.mandatory =='Y' && ( filter.changedValue==null ||  filter.changedValue==""))
            {
              count++;
              console.log('Inside filter mandatory count if',count);
                
            }
        }
        console.log('OUTER count',count);
        if(count<=1)
        {            
            var filterParams = '';
            console.log('submittedData :',this.submittedData);
            for(var filter of this.submittedData )
            {
                filterParams += filter.col_name + "=" + filter.changedValue + "&";

            }
            console.log('applyFilter filterParams',filterParams);
            
            // this.filterDataSvc.setFilterParameters(this.metadataName, filterParams, this.submittedData);

            //this.dashboardFilterComponent.onFilterDone(this.submittedData);
            this.onFilterDone.emit(this.submittedData);
        }
        else
        {
            this.inValid=true;
            alert('Please fill mandatory field');
            console.log('unAuthorized :',count);
        }
    }
  
    //Added by Samruddhi for UI of criteria component also change done and close icon. [Start]
    getImgSrc(filterType: any, filterOpt: any)
    {
        var imgUrl;
        if(filterOpt == "1")
        {
            if(filterType == "0")
            {
                imgUrl = "/ibase/Insight/angplugin/assets/images/Numeric.svg";
            }
            else if(filterType == "1")
            {
                imgUrl = "/ibase/Insight/angplugin/assets/images/String.svg";
            }
            else if(filterType == "4")
            {
                imgUrl = "/ibase/Insight/angplugin/assets/images/Date.svg";
            }
            else
            {
                imgUrl = "";
            }
        }
        else
        {
            if(filterType == "0")
            {
                imgUrl = "/ibase/Insight/angplugin/assets/images/Numeric.svg";
            }
            else if(filterType == "1")
            {
                imgUrl = "/ibase/Insight/angplugin/assets/images/String.svg";
            }
            else if(filterType == "4")
            {
                imgUrl = "/ibase/Insight/angplugin/assets/images/Date.svg";
            }
            else
            {
                imgUrl = "";
            }
        }
        return imgUrl;
    }
    //Added by Samruddhi for UI of criteria component also change done and close icon. [End]
    
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
            
            .mat-form-field 
            {
                font-size: inherit !important;
                font-weight: 400 !important;
                line-height: 1.125 !important;
                text-align: left !important;
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
                width: 100% !important;
                display: block !important;
                position: relative !important;
                flex: auto !important;
                min-width: 0 !important;
                border-top: 0.84375em solid transparent !important;
            }
            
            :host ::ng-deep .mat-form-field-appearance-legacy .mat-form-field-infix 
            {
                padding: 0px !important;
            }

            :host ::ng-deep input.mat-input-element 
            {
                margin-top: -0.0625em !important;
            }

            :host ::ng-deep .mat-input-element 
            {
                caret-color: #f44336; !important;
                margin-top: 0 !important;
                -webkit-appearance: none !important;
                color: currentColor !important;
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

            .mat-form-field.mat-form-field-invalid .mat-form-field-label 
            {
                color: #f44336 !important;
            }

            .mat-form-field.mat-form-field-invalid .mat-form-field-label .mat-form-field-required-marker .mat-form-field.mat-form-field-invalid .mat-form-field-label.mat-accent 
            {
                color: #f44336 !important;
            }

            .mat-form-field-appearance-legacy .mat-form-field-label 
            {
                top: 1.28125em !important;
            }
            .batteryStatus 
            {
                color: #000 !important;
            }

            .mat-form-field-appearance-legacy .mat-form-field-subscript-wrapper 
            {
                margin-top: 0.54167em !important;
                top: calc(100% - 1.66667em) !important;
                font-size: 75% !important;
            }
            .mat-form-field-appearance-legacy .mat-hint 
            {
                color: rgba(0, 0, 0, .54) !important;
            }

            .mat-select-arrow 
            {
                border-left: 15px solid transparent!important;
                border-right: none!important;
                border-top: 15px solid transparent!important;
                border-image-source: url(/ibase/Insight/angplugin/assets/images/Right_Arrow.svg)!important;
                border-image-repeat: stretch!important;
            }

            .material-icons 
            {
                font-family: 'Material Icons' !important;
                font-weight: normal;
                font-style: normal;
                font-size: 24px;
                letter-spacing: normal;
                text-transform: none;
                white-space: nowrap;
                word-wrap: normal;
                direction: ltr;
                -webkit-font-smoothing: antialiased;
                text-rendering: optimizeLegibility;
                font-feature-settings: 'liga';
            }
        `;
        shadowRoot.getElementById('bb-filter-container').parentNode.appendChild(styleCss);
    }
    
    // Added by Sujan on 07-12-2022 for between operator [Start]
    emitFromFieldValue(fieldValue)
    {
        let fieldJson = JSON.parse(fieldValue);
        this.fromInputFieldVal = fieldJson['fromInputValue'];
    }

    emitToFieldValue(fieldValue)
    {
        let fieldJson = JSON.parse(fieldValue);
        this.toInputFieldVal = fieldJson['toInputValue'];
    }
    // Added by Sujan on 07-12-2022 for between operator [End]
}