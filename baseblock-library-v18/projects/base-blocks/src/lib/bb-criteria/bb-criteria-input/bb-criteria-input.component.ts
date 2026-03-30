import { Component, OnInit,OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { ElementRef,ViewChild,ViewEncapsulation, ViewContainerRef, TemplateRef } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { FilterInfo } from './filter-info.model';

import { Overlay,OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal,Portal,TemplatePortal } from '@angular/cdk/portal';
import {FormControl} from '@angular/forms';

 // Added by Pravin K on 8-MAY-20[To set application date format] START 
import { DateAdapter, MAT_DATE_FORMATS ,MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import { DateFormatService } from './date-format/date-format.service';
import { CustomDateAdapter } from './date-format/customDateAdapter';
 // Added by Pravin K on 8-MAY-20[To set application date format] END

@Component({
  selector: 'bb-criteria-input',
  templateUrl: './bb-criteria-input.component.html',
  styleUrls: ['./bb-criteria-input.component.css']
})
export class BBCriteriaInputComponent implements OnInit {

  constructor( public datePipe:DatePipe,public overlay: Overlay,private viewContainerRef: ViewContainerRef,private dateFormatService: DateFormatService) { }

  @Input() filterInfo : FilterInfo | any;
  @Input() dateFormat : string | any;
  @Output() valueChange: EventEmitter<any> = new EventEmitter;
  @Input() fromDate :Date | any ;
  @Input() toDate :Date | any ;
  @Input('metadataName') metadataName: string | any;
  
  @ViewChild( 'portal' ) templatePortal: TemplateRef<any> | any;
  @ViewChild("monthPickerEl") monthPickerEl : ElementRef | any;
  overlayRef: any;
  dataSource: any;
  filterInput: any;
  refId: any;
  selectedVal: any[]=[];
  isAllChecked: any ;

  checkedData = [];
  
  filterType: string | any;
  filterValue: any;
  filterDefValue: string | any;
  filterName: string | any;
  filterDescr: string | any; 
  filterId: string | any;
  filterFieldName: string | any;
  filterModName: string | any; 
  filterShowOnTitle: string | any; 
  filterValues: any;
  filterMandatory: boolean | any;
  maxDate = new Date(); //date upadted
  inputValue='';
  
  key_string:string | any;
  auto_fill_len:string | any;
  multi_opt:string | any;
  obj_name:string | any;
  isPopHelp:boolean | any;
  help_option:string | any;
  layout: any; 
  chipData: any[]=[];
  isBrowser: boolean | any;
  isAllSelected: any;
  disabled: any;
  hidden:boolean | any;

  readOnly: any;
  userInfo: any;// Added By Pravin K on 16-JUL-20 [to set EMP_CODE,SITE_CODE]
  argName: any;//Added By Pravin K on 17-SEPT-20 [for the issue of download file name]

  @Input() filterExprInput: any;  
  @Input() fiterExprParam: any;
  filterExprFieldName: any;
  filterExprParamArray : any;
  keyStringParameter : any;
  @Output() populateExprData: EventEmitter<any> = new EventEmitter;
  //Added by nikhil on 15-04-2022 for pophelp info
  overLayRefForMoreOption;
  @ViewChild('popupTemp') popupTemp: TemplateRef<any> | any;
  @Input() isCriteriaPopUp : boolean | any;
   //Added by nikhil on 15-04-2022 for pophelp info
 //Added by nikhil on 02-08-2022 for multi-input field for 'IN' operator
  isChipValue: boolean | any;
  // Added by Sujan on 28-11-2022 for between operator
    @Input() placeHolderPrefix: any;
    placeHolderName: any;
    tempDefaultArray = [];
    fromFieldValue:any;
    toFieldValue:any;
    fromDateFieldValue:any;
    toDateFieldValue:any;
    @Input() fromInputFieldVal: any;
    @Input() toInputFieldVal: any;
    @Output() emitFromFieldValue: EventEmitter<any> = new EventEmitter;
    @Output() emitToFieldValue: EventEmitter<any> = new EventEmitter;
    
  ngOnInit() {

     // Added by Pravin K on 8-MAY-20[To set application date format] START 

	// Added by Pravin K on 7-AUG-20[To set application date format] START 
	console.log('bb-criteria is filterInfo--appl_date found',(!this.filterInfo.appl_date));	
	//added by mayuri on 18/08/2023 check for between condition [start]
    if(this.fromInputFieldVal != undefined)
    {
        this.fromFieldValue = this.fromInputFieldVal;
        console.log("peinr line no 113 fromFieldValue",this.fromFieldValue);
    }
    if(this.toInputFieldVal != undefined)
    {
        this.toFieldValue = this.toInputFieldVal;
        console.log("peinr line no 118 toFieldValue",this.toFieldValue);
    }
    //added by mayuri on 18/08/2023 check for between condition [end]
    if(!this.filterInfo.appl_date)
	{
		this.filterInfo.appl_date = localStorage.getItem('APPL_DATE_FORMAT')
		console.log('bb-criteria from localstorage filterInfo--appl_date found',this.filterInfo.appl_date);	
		if(!this.filterInfo.appl_date)
		{
	 	 	this.filterInfo.appl_date = 'dd-MMM-yyyy';		
		}
	 	console.log('bb-criteria filal filterInfo--appl_date::',this.filterInfo.appl_date);		
	}
	// Added by Pravin K on 7-AUG-20[To set application date format] END 
     
if(this.filterInfo.appl_date)
     this.dateFormatService.format = this.filterInfo.appl_date.toUpperCase();
     console.log('Filter-input dateFormatService.format[9-may-22.][',this.dateFormatService.format,']84');
     // Added by Pravin K on 8-MAY-20[To set application date format] END
     
     // Added By Pravin K on 16-JUL-20 [to set EMP_CODE,SITE_CODE]  START
     console.log('(<any>window).angBIReport:',(<any>window).angBIReport,'],this.userInfo[',this.userInfo,']');
     if((<any>window).angBIReport)
     {
       this.userInfo = (<any>window).angBIReport.userInfo;
     }
     // Added By Pravin K on 16-JUL-20 [to set EMP_CODE,SITE_CODE]  END
     
      console.log('filterInfo--',this.filterInfo);
      if( this.filterInfo )
      {
        this.filterType = this.filterInfo.type ? this.filterInfo.type : '1';
        this.filterDefValue = this.filterInfo.default_value ? this.filterInfo.default_value : '';
        this.filterName = this.filterInfo.col_name ? this.filterInfo.col_name : '';
        this.filterDescr = this.filterInfo.col_descr ? this.filterInfo.col_descr : '';
        this.filterId = this.filterInfo.col_id ? this.filterInfo.col_id : '';
        this.filterMandatory = this.filterInfo.mandatory == 'Y' ? true : false;
        this.filterValues = this.filterInfo.values ? this.filterInfo.values : '';
        this.filterValue = this.filterDefValue;
        this.layout = this.filterInfo.layout;
        this.filterExprFieldName = this.filterInfo.filter_expr ? this.filterInfo.filter_expr : '';

        this.dateFormat = this.filterInfo.appl_date;
        this.argName = this.filterInfo["argName"] ? this.filterInfo["argName"] : '';//Added BY Pravin K on 16-SEPT-20[For the issue of period selection] 
        console.log('argName[',this.argName,'],filterInfo::',this.filterInfo);//Added BY Pravin K on 16-SEPT-20[For the issue of period selection] 
        console.log('dateFormat  ::::::: ',this.dateFormat)
		console.log('dateFormat filterInfo--appl_date::',this.filterInfo);

        this.hidden = this.filterInfo.hidden == 'Y' ? true : false;
        console.log('filterStringValue==>',this.filterExprFieldName);
        
        this.filterInfo.changedValue = this.filterValue; 

        if(this.filterType=='4'){
            //Added By Pravin k on 10-JUL-20 [To show date set from report xml] START
            //Changed By Pravin K on 10-SEP-20 [to set todays date to all report] START
            //this.filterValue = new Date(this.filterValue);
            // Added By Pravin K on 16-JUL-20 [to set CURRENT_DATE,lAST,NEXT DATES]  START
            if(this.filterValue) 
            {
                this.filterValue = new Date(this.getDefaultDate(this.filterValue));
            }
            // else
            // {
            //     this.filterValue = new Date(this.filterValue);
            // }
            // Added By Pravin K on 16-JUL-20 [to set CURRENT_DATE,lAST,NEXT DATES]  START
            //Changed By Pravin K on 10-SEP-20 [to set todays date to all report] AND
            //Added By Pravin k on 10-JUL-20 [To show date set from report xml] END

            this.filterValue = this.getDefaultDate(this.filterInfo.default_value);
            this.filterInfo.changedValue = this.formatDate(this.filterValue);
            this.filterInfo.default_value = this.formatDate(this.filterValue);            
        }else if(this.filterType=='6'){
            this.filterValue = this.getDefaultYear(this.filterInfo.default_value);
            this.filterInfo.changedValue = this.filterValue;
            this.filterInfo.default_value = this.filterValue;
            
            var defDate = new Date();
            defDate.setFullYear(this.filterValue);
            this.filterValue = defDate;
        }
        else if(this.filterType=='5'){
            this.filterValue = this.getDefaultMonth(this.filterInfo.default_value);
            this.filterInfo.changedValue = this.filterValue;
            this.filterInfo.default_value = this.filterValue;
        }
        else if(this.filterType=='7')
        {
            this.filterInfo.default_value = this.filterValue;
            this.filterValue =this.getDefaultSite(this.filterInfo.default_value);
            //this.filterInfo.default_value = this.filterValue;
            this.filterInfo.changedValue= this.filterValue;
            console.log('filter type 7',this.filterValue,this.filterInfo.default_value);
         }
         else if(this.filterType=='1') // Added By Pravin K on 16-JUL-20 [to set EMP_CODE,SITE_CODE]  START
        {
            console.log('filter type 1.....this.userInfo:',this.userInfo,"::filterValue::",this.filterValue);
            if(this.filterValue == 'EMP_CODE' || this.filterValue == 'LOGIN_CODE' || this.filterValue == 'SITE_CODE' )
            {
                if(this.userInfo)
                { 
                   this.getDefaultValue()
                }
            } 
        }
        // Added By Pravin K on 16-JUL-20 [to set EMP_CODE,SITE_CODE]  END
        
        console.log('filterValue ',this.filterValue);
        
        this.key_string = this.filterInfo.key_string ? this.filterInfo.key_string : '';
        this.auto_fill_len = this.filterInfo.auto_fill_len ? this.filterInfo.auto_fill_len : '';
        this.multi_opt = this.filterInfo.multi_opt ? this.filterInfo.multi_opt : '';
		//Added by nikhil on 02-08-2022 for multi-input field for 'IN' operator
		this.isChipValue = this.filterInfo.isChipValue ? this.filterInfo.isChipValue : '';
        this.obj_name = this.filterInfo.obj_name ? this.filterInfo.obj_name : (this.filterInfo.mod_name ? this.filterInfo.mod_name : '');
        this.isPopHelp = this.filterInfo.is_pophelp;
        this.help_option = this.filterInfo.help_option ? this.filterInfo.help_option : '';
      }

      if(this.metadataName != 'BI-FILTER'){

        if(this.isPopHelp){       
              if(!this.key_string){
              this.dataSource = "/ibase/PopupDataServlet?FIELDNAME="+this.filterName+"&OBJ_NAME="+this.obj_name+"&OUTPUT_FORMAT=JSON&KEYSTRING=dummy";
              }else {
              //Temporary  
              //this.refId = this.key_string.replace(":", '');
              this.dataSource = "/ibase/PopupDataServlet?FIELDNAME="+this.filterName+"&OBJ_NAME="+this.obj_name+"&OUTPUT_FORMAT=JSON&KEYSTRING="+this.key_string;
              }
          }
      } else {
        if(!this.key_string){
            this.dataSource = "/ibase/PopupDataServlet?FIELDNAME="+this.filterName+"&OBJ_NAME="+this.obj_name+"&IS_BI_POPHELP=true&OUTPUT_FORMAT=JSON&KEYSTRING=dummy";
          }else {
            //Temporary  
            //this.refId = this.key_string.replace(":", '');
            this.dataSource = "/ibase/PopupDataServlet?FIELDNAME="+this.filterName+"&OBJ_NAME="+this.obj_name+"&IS_BI_POPHELP=true&OUTPUT_FORMAT=JSON&KEYSTRING="+this.key_string;
          }
      }

      this.emitValueChg();
      
      let index = window.location.pathname.indexOf('E12BROWSER');
      
      if(index > -1){
          this.isBrowser = true;
      }
      /*
      if(this.filterValue && typeof(this.filterValue)=='string'){
          this.filterValue = this.filterValue.replace(",",'');
          this.chipData.push({ display: this.filterValue, value: this.filterValue });
      }
	  */      
      if(this.multi_opt == '1' && this.filterValue && typeof(this.filterValue)=='string'){
          console.log('vicky  filterValue ',this.filterValue);
          this.filterValue.split(",").map( (chipValue)=>{
              console.log('Vicky  #',chipValue);
	          this.chipData.push(
	             { display: chipValue, value: chipValue }
	          );
          });
      }
      
      console.log('filterValue ',this.filterValue);
      
      //   Added by Sujan on 28-11-2022 for between operator
      if(this.placeHolderPrefix != undefined)
      {
          this.placeHolderName = this.filterDescr +" "+ this.placeHolderPrefix;
      }
  }

  ngOnChanges(){
      if(this.toDate==null){
          this.toDate=this.maxDate;
      }
  }
  
  
  changeChipValue( value : string | any) {
      value = value['selectedValues'];
      console.log( '# selected--', value, this.filterValue );
      this.filterValue = value.split( "," ).filter( (val: any) => { return val.trim() } );
      console.log( 'on spliting', this.filterValue );
      this.filterInfo.changedValue = this.filterValue;
      this.emitValueChg();
  }
   
   /*
  //Changed by Pravin k on 7-MAY-20 [Chip deletion issue] START 
   changeChipValue( value:any ) {
    console.log( 'selected-0-', value,",filterValue:"+ this.filterValue );
    var selectedValue = value['selectedValues'];
    var inputValue = value['inputValue'];

    this.filterValue = selectedValue;
    this.inputValue = inputValue;

    console.log( 'on spliting', this.filterValue );
    this.filterInfo.changedValue = this.filterValue;
    this.emitValueChg();
} */
//Changed by Pravin k on 7-MAY-20 [Chip deletion issue] END
  
  changeValue()
  { 
      console.log('selected--',this.filterValue);
      this.filterInfo.changedValue = this.filterValue;
      this.emitValueChg();
  }
  
  changeSelection(detail: any)
  {
      console.log('change selection--',detail);
      //this.filterValue = detail.id;
      this.filterValue = detail.detail.id; //changed by chitranga tandel
      
      this.filterInfo.changedValue = this.filterValue;
      this.emitValueChg();
  }

  changeDate( event: MatDatepickerInputEvent<Date> )
  {  
      console.log('selected change date--',event);
      console.log('selected filterValue --',this.filterValue);
      console.log('selected dateFormat --',this.dateFormat);
      this.filterInfo.changedValue = this.formatDate(this.filterValue);
      
      this.emitValueChg();
  }
  
  formatDate(dateValue : any) : any
  {
      var changedValue: any ='';
      if( this.dateFormat )
      {
          try{
              
              changedValue = this.datePipe.transform(dateValue, this.dateFormat);
          }
          catch(e){
             // changedValue = this.datePipe.transform(dateValue, 'dd/MM/yyyy');
              changedValue = this.datePipe.transform( new Date(), this.dateFormat );
          }
      }
      else
      {
          changedValue = this.datePipe.transform(dateValue, 'dd/MM/yyyy');
      }
      return changedValue;
  }
  createOverlay()
  {
      var config = new OverlayConfig();
      var width = '500px';
      var top = this.isBrowser ? '100px' : '40px';
      //var height = 'auto';
      var height = this.isBrowser ? 'auto' : 'calc(100% - 90px)';
      var left = "calc(100% - 350px)";

      config.hasBackdrop = true;
      console.log( 'config & templatePortals ', config, this.templatePortal );

      /*  
      if ( this.clientWidth < 640 ) {
          width = '100%';
          top = '0';
          height = '100%';
      }
      */

      config.positionStrategy = this.overlay.position()
          .global()
          .centerHorizontally()
          .width( width )
          .left( left )
          .top( top )
          .height( height );

      const templatePortal = new TemplatePortal(
          this.templatePortal,
          this.viewContainerRef
      );

      this.overlayRef = this.overlay.create( config );
      this.overlayRef.attach( templatePortal );
  }
  
  openPophelp()
  {
      //Added by Kamal.P to pass filterExpression value at filterScreen component START
      if(this.filterExprFieldName)
      {
	       console.log('this.filterExprFieldName ==>',this.filterExprFieldName);
           this.populateExprData.emit(this.filterExprFieldName); //Used at filter-screen.component
           console.log('filterExpresionResult==>',this.filterExprInput);
      }  
      //Added by Kamal.P to pass filterExpression value at filterScreen component END

      // Added by Pramod Shirke to pass filter input parameter 
      if(this.key_string)
      {
           this.populateExprData.emit(this.key_string); 
           if(this.fiterExprParam != null)
			{
				var keys = Object.keys(this.fiterExprParam);
				for(var i = 0; i < keys.length; i++)
			    {  
				    var filterPram = this.key_string.substring(1,this.key_string.length);
			        var key = keys[i];
			        var value = this.fiterExprParam[key];
			        if(typeof value == 'string')
			        {
		                this.keyStringParameter = value;
					      if(this.keyStringParameter !== '' && this.keyStringParameter != undefined && this.keyStringParameter != null)
					      {
						       this.dataSource = "/ibase/PopupDataServlet?FIELDNAME="+this.filterName+"&OBJ_NAME="+this.obj_name+"&OUTPUT_FORMAT=JSON&KEYSTRING="+this.key_string+"&"+filterPram+"="+this.keyStringParameter;
					      }
			        }
			        else if(value instanceof Array)
			        {
						this.keyStringParameter = value[0];
					      if(this.keyStringParameter !== '' && this.keyStringParameter != undefined && this.keyStringParameter != null)
					      {
						       this.dataSource = "/ibase/PopupDataServlet?FIELDNAME="+this.filterName+"&OBJ_NAME="+this.obj_name+"&OUTPUT_FORMAT=JSON&KEYSTRING="+this.key_string+"&"+filterPram+"="+this.keyStringParameter;
					      }
		            }
		        }
	          console.log('this.dataSource -> ',this.dataSource);
			}
      }  
      // Added by Pramod Shirke to pass filter input parameter 
      //Added by nikhil on 15-04-2022 for pophelp info[Start]
	  if(this.isCriteriaPopUp == true)
	  {
		  console.log('Inside openPophelp 378')
		  this.overlayForCriteriaPopUp();
	  }
	  else
	  {
		  console.log('Inside openPophelp 383')
		  this.createOverlay();
	  }
	  //Added by nikhil on 15-04-2022 for pophelp info[End]
  }
  
  closePohelp()
  {
      //Added by nikhil on 15-04-2022 for pophelp info[Start]
	  if(this.isCriteriaPopUp == true)
	  {
		  console.log('Inside closePohelp 392')
		  this.overLayRefForMoreOption.dispose();
	  }
	  else
	  {
		  console.log('Inside closePohelp 397')
		  this.overlayRef.dispose();
	  }
	  //Added by nikhil on 15-04-2022 for pophelp info[End]
  }
  
  /*
  setValue(value)
  {
       //27-MAY-20 [for issue while single selection pophelp]START
       if (value instanceof Array) 
	   {
           let index = value.indexOf(this.inputValue);
           console.log('setValue selected index:',index);
           if (index >= 0) {
               value.splice(index, 1);
               this.inputValue='';
               
           }
       } 
       Added By Pravin K on 6-SEPT-20 [Done chavnges for the issye of radio  button uncheck] START  
       if(!value)
       {
           value =  this.filterValue;// Changed on 10-SEP-20 for the blank issue in single selection
       }
       /*Added By Pravin K on 6-SEPT-20 [Done chavnges for the issye of radio  button uncheck] END  
       //27-MAY-20 [for issue while single selection pophelp]END


      this.filterValue = value;
      console.log('Emitted Value:',this.filterValue);
      this.closePohelp();
      
      this.filterInfo.changedValue = this.filterValue;

      this.chipData=[];
      for(let chipValue of this.filterValue  ){
          this.chipData.push(
             { display: chipValue, value: chipValue }
         );
      }
      console.log('chipData',this.chipData);
     
      this.emitValueChg();
  }*/
  

  setValue(value: any)
  {

      try 
      {
	//Added by nikhil on 02-08-2022 for multi-input field for 'IN' operator
			this.filterValue =  value;
            console.log('Inside try # Vicky Emitted Value:',this.filterValue);
            this.closePohelp();
            
            this.filterInfo.changedValue = this.filterValue;

             this.chipData=[];
            for(let chipValue of this.filterValue  ){
                console.log('##   ',chipValue);
                this.chipData.push(
                    { display: chipValue, value: chipValue }
                );
            }

      } catch (error) {
          
        /*this.filterValue = value;
        console.log('Inside catch # Vicky Emitted Value:',this.filterValue);
        this.closePohelp();
        this.filterInfo.changedValue = this.filterValue;
        this.chipData=[];
        this.chipData.push( { display: this.filterValue, value: this.filterValue } );*/

      }
     
        console.log('chipData   ::  ',this.chipData);
        this.emitValueChg();
  }

  emitValueChg(){
      this.valueChange.emit(this.filterInfo);
  }
  
  onChangeValue(value: any)
  {
      console.log("onChangeValue event get called in filter - input " , value);
      this.filterValue = value;
	  //Added by nikhil on 24-04-2022 on seting the default value the output is not shown
      // if(this.filterInfo != undefined && this.filterInfo.changedValue == '' && this.isCriteriaPopUp)
	  if(this.filterInfo != undefined)
      {
          this.filterInfo.changedValue = value;
      }
  }
  
  toDateMethod( dateStr: any ) 
  {
      console.log('fromDate::::::::',dateStr);
      var splitDate =dateStr.split("/");
      console.log('splitDate::: :',splitDate);
      let firstdate= splitDate[0];
      let month= splitDate[1];
      dateStr=month+'/'+firstdate+'/'+splitDate[2];
      console.log('updated fromDate::: :',dateStr);
      var datePipe = new DatePipe( "en-US" );
      if(this.dateFormat ){
        var date: any= datePipe.transform(dateStr, this.dateFormat );
      } else {
          var date: any= datePipe.transform(dateStr, 'dd/MM/yyyy' );
      }
      console.log('dueDate::: :',date);
      var parts = date.split( "/" );
      console.log('parts::: :', parts);
 //     return new Date( parts[2], parts[1]-1,parts[0]  );
  }
  
    
  changeSingleValues(value: any)
  {
      console.log('change value selection--',value);
     // this.filterValue = detail.id;
      
      this.filterInfo.changedValue = value;
      this.emitValueChg();
  }
  
  changeMultipleValue(value: any)
  {
      console.log('change multipl value filter value ',this.filterValue);
      var index = this.selectedVal.indexOf(value);
      if(index > -1){
          this.selectedVal.splice(index, 1);
      }else {
           this.selectedVal.push(value);

      }
      this.filterInfo.changedValue = this.selectedVal;
      console.log('change multiple value ',value);
      console.log('---Selected Multiples Values  are END--',this.selectedVal);
      
  }
  
  selectAll(valuesArray: any){
      this.isAllSelected = !this.isAllSelected;
      var allSelectedVal: any=[];
      this.disabled=!this.disabled;
      for(let values of valuesArray){
          allSelectedVal.push(values.data);
      }
      this.filterInfo.changedValue = allSelectedVal;
      console.log('inside select all>>> ',allSelectedVal,this.filterInfo.changedValue);
  }

  changeMonthValues(value: any)
  {
      this.filterInfo.changedValue='';
      var changedValue = this.formatMonth(value);
      console.log('change month value selection--',changedValue);
      this.filterInfo.changedValue = changedValue;
      this.emitValueChg();
  }
  
  changeYearValues(value: any)
  {
      this.filterInfo.changedValue='';
      console.log('change year value selection--',value);
      this.filterInfo.changedValue = value;
      this.emitValueChg();
  }
 
  elemRef: any;
  openCalender($event: any)
  {
      this.elemRef = document.getElementsByClassName('mat-calendar-period-button');
      if(this.elemRef){
          setTimeout (() => {
              this.elemRef[0].disabled = true;
          }, 100)
      }
      console.log('the calender is open',this.elemRef);
  }
  ngAfterViewInit(){
      console.log('monthPickerEl ::',this.monthPickerEl);
      if(this.filterType=='5' && this.monthPickerEl)
      {
          console.log('this.filterValue ',this.filterValue);
          var dateVals = this.filterValue.split('/');
          var dateObj = new Date();
          try {              
              dateObj.setMonth(Number(dateVals[0]) - 1);
              dateObj.setFullYear(Number(dateVals[1]));
          } catch(e){
              console.log('Exception in FilterInputComponent',e);
          }
          console.log('dateObj ::',dateObj);
          var displayValue = this.datePipe.transform(dateObj, 'MMM yyyy');  
          this.monthPickerEl.nativeElement.querySelector('input').value = displayValue;
      }
  }
  
  formatMonth(monthString : string)
  {
      var monthStr = '';
      if(monthString && monthString.indexOf("/") != -1) 
      {
           var parts = monthString.split("/");
           var year = parseInt(parts[1]);
           var month = parseInt(parts[0]);
           if(month == 0 || month > 12 || isNaN(month) || isNaN(year)) 
           {
               monthStr = '';
           }
           else
           {
               monthStr = month > 9 ? '' + month : '0' + month ;
               monthStr+= '/' + year;
           }
      }
      return monthStr; 
  }
  
  changeSiteValue(filterExpr: any){
      console.log('inside on pophelp onFiler==>',filterExpr);
          this.changeSingleValues(filterExpr);

  }

  getDefaultDate(value: string)
    {
        var defaultDate = new Date();
        console.log('value :::', value,'  default date :::::',defaultDate);
        try 
        {
            //if(value && ( value.startsWith('LAST') || value.startsWith('NEXT') ) )
            if(value && ( value.startsWith('LAST') || value.startsWith('NEXT') || value.startsWith('QUARTER') ) )
            {
                console.log('---Starts with LAST or NEXT ---');
                defaultDate = eval(value);
            }
            else if(value && value == 'CURRENT_DATE'){
                defaultDate = new Date();
            }
            else if(value)
            {
                defaultDate = new Date(value)
            }
            else
            {
                defaultDate = new Date();
                console.log('This case should never happened');
            }
            
        } 
        catch (e)
        {
        	console.log('Exception in getDefaultDate',e);
        }
        
        console.log('In getDefaultDate',defaultDate);
        return defaultDate;
    }
    
    
    getDefaultSite(value: string)
    {
        var defaultSite;
        console.log('getDefaultSite value :::', value);
        try 
        {
            if(value  )
            {
                console.log('---Starts with LAST or NEXT ---');
                defaultSite = '1.'+value;
            }
        } 
        catch (e)
        {
            console.log('Exception in getDefaultSite',e);
        }
        
        console.log('In defaultSite',defaultSite);
        return defaultSite;
    }

    getDefaultYear(value:string){
        
        var defaultYear;
        
        switch(value)
        {
            case "CURRENT_YEAR" :
                var currDate = new Date();
                defaultYear = currDate.getFullYear();
                break;
            default :
                if(value){
                    defaultYear = value;
                }else {
                    var currDate = new Date();
                    defaultYear = currDate.getFullYear();
                }
        }
        
        console.log('defaultYear ::',defaultYear);
        return defaultYear;
    }

    getDefaultMonth(value:string){
        console.log('dafault month ',value);
        var defaultMonth;
        var currDate: any;
        
        switch(value)
        {
            case "CURRENT_MONTH" :
                currDate = new Date();
                defaultMonth = currDate.getMonth() +1;
                if (defaultMonth < 10) defaultMonth = '0' + defaultMonth;
                break;
            default :
                if(value){
                    defaultMonth = value;
                }else {
                    currDate = new Date();
                    defaultMonth = currDate.getMonth() +1;
                    if (defaultMonth < 10) defaultMonth ='0' + defaultMonth;
                }
        }
        console.log('defaultMonth >>>>',defaultMonth);
        defaultMonth = defaultMonth + '/' + currDate.getFullYear();
        console.log('defaultMonth ::',defaultMonth);
        return defaultMonth;
    }
    
    LAST(count: any, type: any, day: any)
    {
        console.log('In LAST',count,type,"]day[",day,"]");
        var defaultDate: Date = new Date();

        try 
        {            
            switch(type)
            {
                case "M" :
                    defaultDate.setMonth(defaultDate.getMonth() - parseInt(count));
                    if(day=='F_DT' || day=='f_dt')
                    {
                        defaultDate.setDate(1);
                    }
                    else if(day=='L_DT' || day=='l_dt')
                    {
                        var lastDayOfMonth = new Date(defaultDate.getFullYear(), defaultDate.getMonth() + 1, 0).getDate();
                        console.log('LAST Default lastDayOfMonth::',lastDayOfMonth);
                        defaultDate.setDate(lastDayOfMonth);
                    }
                    else
                    {
                        defaultDate.setDate(1);
                    } 

                    break;            
            }
        }
        catch(e) 
        {
            console.log('Exception in LAST',e);
        }
        console.log('LAST Default date::',defaultDate);
        
        return defaultDate;
    }
    
    NEXT(count: any, type: any, day: any)
    {
        console.log('In NEXT',count,type,"]day[",day,"]");
        var defaultDate: Date = new Date();
        
        try 
        {            
            switch(type)
            {
                case "M" :
                    defaultDate.setMonth(defaultDate.getMonth() + parseInt(count));
                    if(day=='F_DT' || day=='f_dt')
                    {
                        defaultDate.setDate(1);
                    }
                    else if(day=='L_DT' || day=='l_dt')
                    {
                        var lastDayOfMonth = new Date(defaultDate.getFullYear(), defaultDate.getMonth() + 1, 0).getDate();
                        defaultDate.setDate(lastDayOfMonth);
                    }
                    else
                    {
                        var lastDayOfMonth = new Date(defaultDate.getFullYear(), defaultDate.getMonth() + 1, 0).getDate();
                        defaultDate.setDate(lastDayOfMonth);
                    }
                    
                    break;
            }
        }
        catch(e) 
        {
            console.log('Exception in NEXT',e);
        }
        console.log('Default date::',defaultDate);
        
        return defaultDate;
    }
    
    //Get Start and End date of current quarter [ Calender Quarters ]
	//TODO : Financial Calender Quarter
	QUARTER(type: any)
    {
		var quarters = [[0,1,2],[3,4,5],[6,7,8],[9,10,11]];
        var defaultDate: Date = new Date();
        //quarter_of_the_year
        var month = defaultDate.getMonth() + 1;
        var qurtOfYear = (Math.ceil(month / 3));//Get Current Quarter of Current Year
        console.log('In QUARTER',type, month,qurtOfYear);
               
        try 
        {            
            switch(type)
            {
                case "START" :
                    defaultDate.setMonth( quarters[qurtOfYear-1][0] );
                    var dayOfQuart = new Date(defaultDate.getFullYear(), defaultDate.getMonth() + 1, 1).getDate();
                    defaultDate.setDate(dayOfQuart);
                    break;
                case "END" :
                    defaultDate.setMonth( quarters[qurtOfYear-1][2] );
                    var dayOfQuart = new Date(defaultDate.getFullYear(), defaultDate.getMonth() + 1, 0).getDate();
                    defaultDate.setDate(dayOfQuart);
                    break;
                case "MTD" :
                    defaultDate = new Date();
                    break;
            }
        }
        catch(e) 
        {
            console.log('Exception in QUARTER',e);
        }
        console.log('Default date::',defaultDate);
        
        return defaultDate;
    }
    
    getDefaultValue()
    {
        console.log('getDefaultValue this.filterValue',this.filterValue,"this.userInfo::",this.userInfo);
        if(this.userInfo)
        {
            if(this.filterValue == 'EMP_CODE' || this.filterValue == 'emp_code' )
            {
                console.log('getDefaultValue EMP_CODE');
                this.filterInfo.changedValue = this.userInfo.empCode;
                this.filterInfo.default_value = this.userInfo.empCode;
                this.filterValue  = this.userInfo.empCode;
               
            }
            else if(this.filterValue == 'SITE_CODE' || this.filterValue == 'site_code' )
            {
                console.log('getDefaultValue SITE_CODE');
                this.filterInfo.changedValue = this.userInfo.siteCode;
                this.filterInfo.default_value = this.userInfo.siteCode;
                this.filterValue  = this.userInfo.siteCode;
               
            }
            else if(this.filterValue == 'LOGIN_CODE' || this.filterValue == 'login_code' )
            {
                console.log('getDefaultValue LOGIN_CODE');
                this.filterInfo.changedValue = this.userInfo.loginCode;
                this.filterInfo.default_value = this.userInfo.loginCode;
                this.filterValue  = this.userInfo.loginCode;
              
            }
        }
        console.log('getDefaultValue this.filterValue',this.filterValue,"this.userInfo::",this.filterInfo);   
        // Added By Pravin K on 16-JUL-20 [to set CURRENT_DATE,LAST,NEXT dates]  END
    }
	//Added by nikhil on 15-04-2022 for pophelp info[Start]
	overlayForCriteriaPopUp()
	{
		console.log('Inside overlayForCriteria 866')
		var width = '300';
	    var top = 155;
	    var left = 281;
	    var bottom = 0;
	    /*const positionStrategy = this.overlay.position()
	      .global()
	      .centerHorizontally()
	      .height('500px')
	      .width('400px')
	      .centerVertically();*/
	      /* Changed by Samruddhi for UI of criteria pop up window */
	      const positionStrategy = this.overlay.position()
	      .global()
	      .centerHorizontally()
	      .centerVertically();
	
	    const overlayConfig = new OverlayConfig({
	      positionStrategy,
	    });
	
	    overlayConfig.hasBackdrop = true;
	    const popupTemp = new TemplatePortal(this.popupTemp, this.viewContainerRef);
	    this.overLayRefForMoreOption = this.overlay.create(overlayConfig);
	    this.overLayRefForMoreOption.attach(popupTemp);	
	}
	//Added by nikhil on 15-04-2022 for pophelp info[End]
	
	//Added by Sujan on 07-12-2022 for between operator [Start]
    setCurrentField()
    {
        var fieldValueJson = {};
        fieldValueJson['fromInputValue'] = this.fromFieldValue;
        this.emitFromFieldValue.emit(JSON.stringify(fieldValueJson));

        if(this.toInputFieldVal != undefined)
        {
            if(this.filterType =='4')
            {
                this.tempDefaultArray[0] = this.formatDate(this.fromFieldValue);
                this.tempDefaultArray[1] = this.formatDate(this.toInputFieldVal);
            }
            else
            {
                this.tempDefaultArray[0] = this.fromFieldValue;
                this.tempDefaultArray[1] = this.toInputFieldVal;
            }
            if(this.tempDefaultArray.length == 2)
            {
                this.filterInfo.changedValue = this.tempDefaultArray;
                this.filterInfo.default_value = this.tempDefaultArray;
                this.emitValueChg();
            }
        }   
    }

    setBetweenFieldValue()
    {
        {
            let fieldValueJson = {};
            fieldValueJson['toInputValue'] = this.toFieldValue;
            this.emitToFieldValue.emit(JSON.stringify(fieldValueJson));

            if(this.filterType =='4')
            {
                this.tempDefaultArray[0] = this.formatDate(this.fromInputFieldVal);
                this.tempDefaultArray[1] = this.formatDate(this.toFieldValue);
            }
            else
            {
                this.tempDefaultArray[0] = this.fromInputFieldVal;
                this.tempDefaultArray[1] = this.toFieldValue;
            }

         if(this.tempDefaultArray.length == 2)
         {
             this.filterInfo.changedValue = this.tempDefaultArray;
             this.filterInfo.default_value = this.tempDefaultArray;
             this.emitValueChg();
         }
 
         console.log('Print filterInfo::::::',this.filterInfo);

        }
    }
    //Added by Sujan on 07-12-2022 for between operator [End]
}
