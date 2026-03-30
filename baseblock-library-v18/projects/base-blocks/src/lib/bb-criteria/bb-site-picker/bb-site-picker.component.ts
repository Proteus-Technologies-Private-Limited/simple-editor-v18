import { Component, OnInit,OnChanges, Input, Output, EventEmitter, ElementRef,ViewChild,ViewEncapsulation, ViewContainerRef, TemplateRef } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { FilterInfo } from '../bb-criteria-input/filter-info.model';            //Changes made by Sameer Dhoteghar on 23rd November 2021[For issue in filter type 7]
//import { DashboardService } from '../../dashboard.service';

import { Overlay,OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal,Portal,TemplatePortal } from '@angular/cdk/portal';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'bb-site-picker',
  templateUrl: './bb-site-picker.component.html',
  styleUrls: ['./bb-site-picker.component.css'],
  providers:[DatePipe],
  encapsulation: ViewEncapsulation.Emulated
})

export class BBSitePickerComponent{
    readOnly: any;
    filterId: any;
    refId: any;
    layout: any;

    selected = '1';
    filterValue: any;
    filterValue1: any;
    filterValue2: any;
    filterVal: any;
    filterDefValue: any;
    filterDescr: any;
    filterMandatory: any;
    multi_opt='1';
    help_option: any;
    isPopHelp:boolean | any;
    hidden: any;
    key_string: any;
    filterName: any;
    dataSource: any;
    obj_name: any;
    filterExprFieldName: any;
    overlayRef: any;
    @Output() populateData: EventEmitter<any> = new EventEmitter;
    @Output() populateExprData: EventEmitter<any> = new EventEmitter;
    isBrowser: boolean | any;
    @Input() filterExprInput: any;  
    @ViewChild( 'portal' ) templatePortal: TemplateRef<any> | any;
    userInfo: any;
    facilityCode: any;
    finEntity: any;
    loginId: any;
    chipData1: any[]=[];
    chipData2: any[]=[];
    chipData3: any[]=[];
    errorMessage: string = '';
    @Output() valueChange: EventEmitter<any> = new EventEmitter;
    hostUrl: any;
    textValue: any;
    selectePophelpId: any;
    displayMetadata =  {
            "suggestMetadata" : "<Site_Code>  (<Site_Code>)",
            "valueFields":"Site_Code",
            "chipMetadata":"<Site_Code>",
    }
    
  //constructor(public overlay: Overlay,private viewContainerRef: ViewContainerRef,private dashboardService: DashboardService) { }
  constructor(public overlay: Overlay,private viewContainerRef: ViewContainerRef) { }
    //@Input() filterInfo ;
@Input() filterInfo : FilterInfo | any;  //Changes made by Sameer Dhoteghar on 23rd November 2021[For issue in filter type 7]
  ngOnInit() {
      console.log('Inside site picker',this.selected);
      console.log('filterInfo-- in site picker',this.filterInfo);
      //this.hostUrl=this.dashboardService.getHostURL();
      if( this.filterInfo )
      {
        this.filterDefValue = this.filterInfo.default_value ? this.filterInfo.default_value : '';
        this.filterDescr = this.filterInfo.col_descr ? this.filterInfo.col_descr : '';
        this.filterMandatory = this.filterInfo.mandatory == 'Y' ? true : false;
        this.filterValue = this.filterDefValue;
        this.layout = this.filterInfo.layout; //Changes made by Sameer Dhoteghar on 23rd November 2021[For issue in filter type 7]
        this.multi_opt = this.filterInfo.multi_opt ? this.filterInfo.multi_opt : '';
        this.isPopHelp = this.filterInfo.is_pophelp;
        this.help_option = this.filterInfo.help_option ? this.filterInfo.help_option : '';
        this.hidden = this.filterInfo.hidden == 'Y' ? true : false;
        this.key_string = this.filterInfo.key_string ? this.filterInfo.key_string : '';
        this.filterName = this.filterInfo.col_name ? this.filterInfo.col_name : '';
        this.obj_name = this.filterInfo.obj_name ? this.filterInfo.obj_name : (this.filterInfo.mod_name ? this.filterInfo.mod_name : '');
        this.filterExprFieldName = this.filterInfo.filter_expr ? this.filterInfo.filter_expr : '';
        console.log('isPopHelp ',this.isPopHelp);
        //this.userInfo=this.dashboardService.getUserInfo();
        console.log('userInfo ',this.userInfo);
        //Commented by Sameer Dhoteghar on 23rd November 2021[For issue in filter type 7]-[START]
        //this.facilityCode=this.userInfo.facility_code;
        //this.finEntity=this.userInfo.fin_entity;
        //this.loginId=this.userInfo.loginCode;
        //console.log('facilityCode ',this.facilityCode, this.finEntity);
        //Commented by Sameer Dhoteghar on 23rd November 2021[For issue in filter type 7]-[END]
        
      }
      if(this.isPopHelp){       
          if(!this.key_string){
            this.dataSource = "/ibase/PopupDataServlet?FIELDNAME="+this.filterName+"&OBJ_NAME="+this.obj_name+"&OUTPUT_FORMAT=JSON&KEYSTRING=dummy";
          }else {
            //Temporary  
            //this.refId = this.key_string.replace(":", '');
            this.dataSource = "/ibase/PopupDataServlet?FIELDNAME="+this.filterName+"&OBJ_NAME="+this.obj_name+"&OUTPUT_FORMAT=JSON&KEYSTRING="+this.key_string;
          }
        }
      
      let index = window.location.pathname.indexOf('E12BROWSER');
      if(index > -1){
          this.isBrowser = true;
      }
      
      /*
      if(this.filterValue && typeof(this.filterValue)=='string'){
          this.filterValue = this.filterValue.replace(",",'');
          this.chipData1.push({ display: this.filterValue, value: this.filterValue });
      }
      */
      if(this.multi_opt == '1' && this.filterValue && typeof(this.filterValue)=='string'){
          this.filterValue.split(",").map( (chipValue)=>{
	          this.chipData1.push(
	             { display: chipValue, value: chipValue }
	          );
          });
      }
     
      this.emitValueChg();
      

      console.log('filterValue sitePickerComponent',this.filterValue);
  }
  
  openPophelp(pophelpId: any)
  {
      this.selectePophelpId = pophelpId;
      console.log('selectePophelpId ',this.selectePophelpId);
      if( this.selectePophelpId == 51 ){
          this.multi_opt='0';
          this.filterVal=this.filterValue1;
      }
      if(this.selectePophelpId == 52 ){
          this.multi_opt='0';
          this.filterVal=this.filterValue2;
      }
      if( this.selectePophelpId == 11 ){
          this.multi_opt='1';
          this.filterVal=this.filterValue;
      }

      console.log('multiopt ',this.multi_opt);
      //Added by Kamal.P to pass filterExpression value at filterScreen component START
      if(this.filterExprFieldName)
      {
           this.populateExprData.emit(this.filterExprFieldName); //Used at filter-screen.component
           console.log('filterExpresionResult==>',this.filterExprInput);
      }  
      //Added by Kamal.P to pass filterExpression value at filterScreen component END
      this.createOverlay();
  }
  
  changeValue()
  { 
      console.log('selected--changeValue',this.filterValue);
      this.filterInfo.changedValue = this.filterValue;
      this.emitValueChg();
  }
  dropDownSelect(){
       console.log('this.selected ',this.selected);

      if(this.selected == '1') 
      {
          this.filterValue='';
      }
      if(this.selected == '2') 
      {
          this.filterValue='';
          this.textValue=this.loginId;
          this.filterValue=this.loginId;
      }
      if(this.selected == '3') 
      {
          this.filterValue='';
          this.textValue=this.finEntity;
          this.filterValue=this.finEntity;
      }
      if(this.selected == '4') 
      {
          this.filterValue='';
          this.textValue=this.facilityCode;
          this.filterValue=this.facilityCode;
      }
      if(this.selected == '5') 
      {
          this.filterValue1 = '';
          this.filterValue2 = '';
          this.filterVal ='';
         // this.filterValue=this.loginId+this.filterValue;
      }
      console.log('dropDownSelect', this.filterValue);
      
      this.emitValueChg();
  }
  


  closePohelp()
  {
      this.overlayRef.dispose();
  }
  
  setValue(value: any)
  {
    //  this.filterValue='';
      //this.filterValue = value;
      this.filterVal='';
      if(this.selectePophelpId == 51)
      {
          this.filterValue1 = value; 
          this.filterVal=this.filterValue1;
          console.log('valueSelected Value:',value);
          this.closePohelp();
          
          this.filterInfo.changedValue = value;

          this.chipData2=[];
          //var data='';
          for(let chipValue of value  ){
              this.chipData2.push(
                 { display: chipValue, value: chipValue }
             );
          }
          this.emitValueChg();
      }
      if(this.selectePophelpId == 52)
      {
          this.filterValue2 = value; 
          this.filterVal=this.filterValue2;
          console.log('valueSelected Value:',value);
          this.closePohelp();
          
          this.filterInfo.changedValue = value;

          this.chipData3=[];
          //var data='';
          for(let chipValue of value  ){
              this.chipData3.push(
                 { display: chipValue, value: chipValue }
             );
          }
          this.emitValueChg();
      }
      if(this.selectePophelpId == 11)
      {
          this.filterValue = value;  
          this.filterVal=this.filterValue;
          console.log('valueSelected Value:',value);
          this.closePohelp();
          
          this.filterInfo.changedValue = value;

          this.chipData1=[];
          //var data='';
          for(let chipValue of value  ){
              this.chipData1.push(
                 { display: chipValue, value: chipValue }
             );
          }
          this.emitValueChg();
      }
      console.log('multi opti ',this.multi_opt);
     
     
  }

  
  emitValueChg(){
    //  this.valueChange.emit(this.filterInfo);
      var val
      if(this.selected == '5')
      {
          //val = '~SITE_CODE~' + this.selected+'.'+this.loginId+','+this.filterValue1+','+this.filterValue2;
          val = '~SITE_CODE~' + this.selected+'.'+this.filterValue1+','+this.filterValue2;               //Changes made by Sameer Dhoteghar on 23rd November 2021[For issue in filter type 7]
      }
      else
      {
          val = '~SITE_CODE~' +  this.selected+'.'+this.filterValue;
      }
      console.log('val   :::::::::',val);
      this.populateData.emit(val);
  }
  
  

  
  createOverlay()
  {
      var config = new OverlayConfig();
      var width = '500px';
      var top = this.isBrowser ? '100px' : '40px';
      var height = 'auto';
      var left = "calc(100% - 350px)";

      config.hasBackdrop = true;
      console.log( 'config & templatePortals ', config, this.templatePortal );

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
  
  
  onChangeValue1(value ?: any)
  {
      console.log("onChangeValue event get called in filter - input 1" , value.value);
      this.filterValue1 = '';
      this.filterValue1 = value.value;
      this.filterVal =this.filterValue1;
      this.emitValueChg();
  }
  
  onChangeValue2(value ?: any)
  {
      console.log("onChangeValue event get called in filter - input 2 " , value.value);
      this.filterValue2 ='';
      this.filterValue2 = value.value;
      this.filterVal =this.filterValue2;
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

  changeChipValue( value: any ) {
      console.log( 'selected--changeChipValue1', value );
      this.filterValue1 = value.split( "," ).filter( (val: any) => { return val.trim() } );
      this.filterVal =this.filterValue1;
      this.emitValueChg();
  }
  
  changeChipValue2( value: any ) {
      console.log( 'selected--changeChipValue2', value );
      this.filterValue2 = value.split( "," ).filter( (val: any) => { return val.trim() } );
      this.filterVal =this.filterValue2;
      this.emitValueChg();
  }


}
