import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef, OnDestroy, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { OverlayConfig, Overlay } from '@angular/cdk/overlay';
import { BBOpenPophelpService } from './bb-open-pophelp.service';
import { TemplatePortal } from '@angular/cdk/portal';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { AppDateAdapter, APP_DATE_FORMATS } from '../bb-open-pophelp/date.adapter';
// import { ExtractTemplateService } from '../bb-open-pophelp/open-pophelp.service'
// import { AngPophelpComponent } from '../ang-pophelp/ang-pophelp.component';
import { BBPophelpComponent } from '../bb-pophelp/bb-pophelp.component';
import { ItemChangeUtils } from '../utility';

@Component({
  selector: 'bb-open-pophelp',
  templateUrl: './bb-open-pophelp.component.html',
  styleUrls: ['./bb-open-pophelp.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: AppDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    },
    DatePipe
  ]
})
export class BBOpenPophelpComponent implements OnInit, OnDestroy {
  title = 'app';
  fieldName = ""; //Added by Jatin M on 21-06-2023 [To set fieldName when pophelp is opened]
  pophelpTitle = "";
  formNo = ""; //Added by Jatin M on 21-06-2023 [To set the value of formNo from the openSuggest]
  //refId = "";
  objectName = "";
  dataSource = "";
  encodedParam = ""; // Added by Mahesh Saggam on 06-AUG-2020
  isBrowse!: boolean;
  overlayRef:any;
  pophelpSelectedvalue = "";
  itemChangeData:any;
  itemChangeFieldValue:any = {};
  pophelpFieldValue:any = {};
  parser!: DOMParser;
  @Input() transMode: string;
  @Input() pluginMetadata: any;
  @Output() itemChangeValues: EventEmitter<any> = new EventEmitter();
  @Output() valueSelected: EventEmitter<any> = new EventEmitter();
  popHelpPosition = {};
  @Input() compData:any;
  @Input() paramData:any;
  @Input() positionObj:any;
  itemChangeList: any = [];
  detailNum:any;
  keyValue:any;
  filterValue:any;//shrutika changes 05-05-2020

  protectAttribParams:any = {};
  visibleAttribParams:any = {};
  // attributeTag;
  @Input('formWiseFormatJson') formWiseFormatJson : any;

  @ViewChild('portal', { read: TemplateRef }) _templatePortal!: TemplateRef<any>;
  @ViewChild(BBPophelpComponent) popHelp!: BBPophelpComponent;
  @Input() isPreventPopHelpItemChange: boolean;
  editFlag: any; 
  formWiseFormatJsonData: any = {};
  callApiForSimpleLayout: boolean = false;
  tokenID: any = '';
  jSessionId: any = '';
  pophelpParamMap: any = '';
  allformValues: any = {};
  index: any = 0;

  constructor(public _openPpohelpService: BBOpenPophelpService, public overlay: Overlay,
    private viewContainerRef: ViewContainerRef, public datePipe: DatePipe,
    public itemChangeUtils: ItemChangeUtils) { }

  ngOnInit() {
    // console.log(' ##  inside onInit method  ## ');
    //shrutika changes 05-05-2020 remove code
  }

  ngOnDestroy() {
    // console.log(' ##  inside ngOnDestroy method  ## ');
    this.resetOverlayContainerZIndex();
    if (this.overlayRef) {
      try { this.overlayRef.destroy(); } catch(e) {}
    }
  }

  openSuggest(id:any, fldVal:any, sqlInput:any, pkValue:any, title?:any, formNo?:any, fldName?: any)
  {

    // let newcurrentCompData = JSON.parse(this.paramData);
    // for(let key in newcurrentCompData)
    // {
    //     if(key.includes('date')) 
    //     {
    //         // console.log("print line no 150 key",key);
    //         // console.log("print line no 151 ", this.paramData[key]);
    //         if( newcurrentCompData[key] != undefined ||  newcurrentCompData[key] != '' ||  newcurrentCompData[key] != null)
    //         {
    //             // console.log("print line no 155 newcurrentCompData[key]", newcurrentCompData[key]);
    //             let dateParts =  newcurrentCompData[key].split('/');
    //             let day = dateParts[0];
    //             let month = dateParts[1];
    //             let year = dateParts[2];
    //             // console.log("print line no 159 day",day);
    //             // console.log("print line no 160 month",month);
    //             // console.log("print line no 161 year",year);
    //             if(month != undefined && year != undefined)
    //             {
    //                 let formattedDate = new Date(year, month , day)
    //                 // let formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    //                 // console.log("print line no 156 formattedDate", formattedDate);
    //                 newcurrentCompData[key] = formattedDate;
    //             }
    //             // console.log("print line no 160 newcurrentCompData", newcurrentCompData);
    //         }
    //     }
    // }
    // this.paramData =  JSON.stringify( newcurrentCompData);
    // console.log('Inside openSuggest with 5 parmaters', this.compData['OBJ_NAME']);
    // Fallback: use fldName if id is undefined to prevent crash on toUpperCase()
    let fldId = id || fldName || '';
    //Added by Jatin M on 21-06-2023 [For issues related to pophelp in simple editor screen] - START
    this.formNo = formNo == undefined ? this.compData['STARTFORM'] : formNo;
    this.compData['OBJ_CTX'] = this.formNo;
    this.editFlag = this.compData['EDIT_FLAG'];
    if(!title)
	  {
		  title = id;
	  }
    this.pophelpTitle = title;
    this.fieldName = fldName;
    this.filterValue = this.checkNull(fldVal);
    
    // this.refId = id;
    this.objectName = this.compData['OBJ_NAME'];
    // if(this.transMode == 'I')
    // {
    //   let paramMap = this.getSqlInputParams(sqlInput);
    //   paramMap["FIELDNAME"] = this.fieldName;
    //   paramMap["OBJ_NAME"] = this.compData['OBJ_NAME'];
    //   paramMap["OUTPUT_FORMAT"] = "JSON";
    //   paramMap["KEYSTRING"] = this.checkNull(sqlInput);
    //   // console.log("print paramMap::::142",paramMap);
    //   this.encodedParam = this._openPpohelpService.getEncodedParamString(paramMap);
    //   this.dataSource = "/ibase/PopupDataServlet";
    // }
    // else
    // {
      let paramMap:any = {};
      paramMap["OBJ_NAME"] = this.compData['OBJ_NAME'];
      paramMap["ACTION"] = "AUTO_SEARCH_POPHELP";
      paramMap["FIELD_NAME"] = id;
      paramMap["SQL_INPUT"] = this.checkNull(sqlInput);
      paramMap["EDITOR_ID"] = this.compData['EDITOR_ID'];
      paramMap["FORM_NO"] = this.formNo;
      // paramMap["PARAMXML"] = this.buildParamXML(this.paramData);
      // paramMap["PARAMXML"] = this.createChgStr(this.fieldName, this.filterValue);
      if(this.transMode =='I')
      {
        if(this.compData['OBJ_CTX'] != '1')
        {
          paramMap["ALLFORMVALUES"] = this.createChgStr(id, this.filterValue);
          paramMap["TRANSMODE"] = this.transMode;
        }
        else
        {
          paramMap["PARAMXML"] = this.createChgStr(id, this.filterValue);
        }
      }
      else
      {
        paramMap["PARAMXML"] = this.createChgStr(id, this.filterValue);
      }
      paramMap["PKVLAUE"] = pkValue;
      paramMap["EDIT_FLAG"] = this.compData['EDIT_FLAG'];
      paramMap[fldId.toUpperCase()] = this.checkNull(fldVal);
      //Added by Jatin M on 21-06-2023 [For issues related to pophelp in simple editor screen] - END
      this.encodedParam = this._openPpohelpService.getEncodedParamString(paramMap);
      // CHECK IF api == TRUe thne call api from service getOpenPophelpDataFromAPI
      if(this.callApiForSimpleLayout == true)
      {
        paramMap["PKVALUE"] = pkValue;
        paramMap["FIELD_NAME"] = fldName;
        this.dataSource = '/ibase/rest/VisionOBJService/autoSearchPophelp';
        this._openPpohelpService.tokenID = this.tokenID;
        this._openPpohelpService.jSessionId = this.jSessionId;
        this._openPpohelpService.callApiForSimpleLayout = this.callApiForSimpleLayout;
        this.pophelpParamMap = JSON.stringify(paramMap);

      }
      else
      {
        this.dataSource = "/ibase/RIAWizardHandlerServlet";
      }
    // }
    
    // setTimeout(() => this.createOverlay(), 200);
    this.createOverlay();
  }

  createOverlay() {
    let config = new OverlayConfig();
    config.hasBackdrop = true;
    config.panelClass = 'pophelp-overlay-pane';
    config.positionStrategy = this.overlay.position()
      .global()
      .centerHorizontally()
      .right('0px');
    const templatePortal = new TemplatePortal(
      this._templatePortal,
      this.viewContainerRef
    );

    if (this.overlayRef) {
      try { this.overlayRef.dispose(); } catch(e) {}
      this.overlayRef = null;
    }
    this.overlayRef = this.overlay.create(config);
    this.overlayRef.attach(templatePortal);
    this.overlayRef.backdropClick().subscribe(() => {
      this.onPophelpCancel();
    });

    // Raise overlay container z-index so pophelp appears above all page elements
    try {
      const containerEl = this.overlayRef.hostElement?.closest('.cdk-overlay-container');
      if (containerEl) {
        (containerEl as HTMLElement).style.setProperty('z-index', '99999', 'important');
      }
      // Fix wrapper positioning
      const wrapperEl = this.overlayRef.hostElement?.closest('.cdk-global-overlay-wrapper');
      if (wrapperEl) {
        const w = wrapperEl as HTMLElement;
        w.style.setProperty('position', 'fixed', 'important');
        w.style.setProperty('top', '0', 'important');
        w.style.setProperty('left', '0', 'important');
        w.style.setProperty('right', '0', 'important');
        w.style.setProperty('bottom', '0', 'important');
        w.style.setProperty('z-index', '99999', 'important');
        w.style.setProperty('justify-content', 'flex-end', 'important');
      }
    } catch(e) {}

    if (this.popHelp) {
      this.popHelp.overlayRef = this.overlayRef;
    }
    setTimeout(() => {
      if (this.popHelp) {
        this.popHelp.overlayRef = this.overlayRef;
      }
    }, 100);
  }
  buildParamXML(param:any) {
    // console.log("<<in buildParamXML xml001>> ", param);
    let jsonData:any = {};
    jsonData = JSON.parse(param);
    let paramXML = `<` + this.detailNum + ` objContext="` + this.compData['OBJ_CTX']
      + `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + this.keyValue + `" dbID="" selected="Y">`;
    // paramXML = paramXML + this.attributeTag;
    paramXML = paramXML + this.attributeTagg(jsonData['attribute']);
    for (let key in jsonData) {
      let value = jsonData[key];
      let id = this.detailNum + '.' + this.keyValue + '.' + key;

      if (value instanceof Object || value == null || value == 'null' || value == undefined)
      {
        value = "";
      }
      let protectttValue = "";

      protectttValue = this.protectAttribParams[id];
      if (protectttValue == undefined) {
        protectttValue = "";
      }
      let visbileValue = "";
      visbileValue = this.visibleAttribParams[id];
      if (visbileValue == undefined) {
        visbileValue = "";
      }
      // if (this.dateFeildArray.includes(id)) {
        if (this.checkIsDateFormat(key, this.formNo)) {
        let fldValue = value;
        // value = "";
        if (fldValue) {
          const date = new Date(fldValue);
          if(!isNaN(date.getTime()))
          {
            	if(fldValue.includes(':'))
              	{
                	value = this.datePipe.transform(fldValue, 'dd/MM/yy HH:mm:ss');
                	let val = value;
                	if(val.endsWith('00:00:00'))
                	{
                  		value = val.substring(0, 8);
                	}
              	}
              	else 
              	{
                	value = this.datePipe.transform(fldValue, 'dd/MM/yy');
              	}
          }
        }
        paramXML = paramXML + "<" + key + " id='" + this.detailNum + "_SEP1_" + this.keyValue + "_SEP1_" + key + "' protect='" + protectttValue + "'" + " visible='" + visbileValue + "'" + "><![CDATA[" + value + "]]></" + key + ">";
      }
      else {
        paramXML = paramXML + "<" + key + " id='" + this.detailNum + "_SEP1_" + this.keyValue + "_SEP1_" + key + "' protect='" + protectttValue + "'" + " visible='" + visbileValue + "'" + "><![CDATA[" + value + "]]></" + key + ">";
      }
    }
    paramXML = paramXML + `</` + this.detailNum + `>`;
    // console.log("buildParamXML 001>>....[" + paramXML);
    return paramXML;
  }

  onSelectionChange(event:any) {
    // console.log('on change selection event::::', event, event.value);
    if(event.value)
    {
      this.pophelpSelectedvalue = event.value;
    }
    else
    {
      this.pophelpSelectedvalue = event;
    }
    this.onDone();
  }
  onPophelpCancel() {
    // console.log('Inside 285 onCancelClick.........');
    this.pophelpSelectedvalue = "";
    // setTimeout(() => {
        this.resetOverlayContainerZIndex();
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    // }, 50);
  }

  private resetOverlayContainerZIndex() {
    try {
      if (this.overlayRef) {
        const containerEl = this.overlayRef.hostElement?.closest('.cdk-overlay-container');
        if (containerEl) {
          (containerEl as HTMLElement).style.removeProperty('z-index');
        }
      }
    } catch(e) {}
  }

  attributeTagg(attributeTagJson:any) {
    let attributeTagInXml = `<attribute IS_CHANGE="Y"`;
    if( JSON.stringify(attributeTagJson) != undefined && JSON.stringify(attributeTagJson).includes('IS_CHANGE'))
    {
      attributeTagInXml = `<attribute `;
    }
    if(attributeTagJson && typeof attributeTagJson === 'string')
    {
      attributeTagJson = JSON.parse(attributeTagJson);
    }	
    if(attributeTagJson)
    {
      for (const key of Object.keys(attributeTagJson)) {
        attributeTagInXml = attributeTagInXml + ` ` + key + `="` + attributeTagJson[key] + `"`;
      }
      // attributeTagInXml = attributeTagInXml + `/>`;
      // console.log('Print attributeTagInXml inside attributeTagg method::: ', attributeTagInXml);
    }
    attributeTagInXml = attributeTagInXml + `/>`;
    return attributeTagInXml;
  }

  onDone() {
    try {
	    //Added by Jatin M on 21-06-2023 [For issues related to pophelp in simple editor screen] - START
      this.pophelpFieldValue[this.fieldName] = this.pophelpSelectedvalue;
      this.itemChangeFieldValue[this.fieldName] = this.checkNull(this.pophelpSelectedvalue);
      this.valueSelected.emit(JSON.stringify(this.itemChangeFieldValue));
      this.setFocusOnPopupHelp(JSON.stringify(this.itemChangeFieldValue));
      this.itemChangeUtils.objName = this.compData['OBJ_NAME'];
      this.itemChangeUtils.handleResponse = false;
      this.itemChangeUtils.callBackFunction = this.onItemChangeResponseReceived.bind(this);
      if( this.transMode == 'I')
      {
        // let paramData = JSON.parse(this.paramData);
        let paramData = this.paramData;
        paramData[this.fieldName] = this.pophelpSelectedvalue;
        this.itemChangeUtils.setModel(paramData);
        if(this.isPreventPopHelpItemChange == false)
        {
          this.itemChangeUtils.statelessItemChange(this.fieldName, this.formNo, this.keyValue, this.pophelpSelectedvalue, 
            this.compData['EDIT_FLAG'], this.formWiseFormatJsonData, this.compData['NO_OF_FORMS']);
        }
        else
        {
          this.isPreventPopHelpItemChange = false;
        }
      }
      else
      {
        // this.itemChangeUtils.stateFulItemChange(this.fieldName, this.pophelpSelectedvalue, this.formNo, this.compData['EDITOR_ID'], this.createChgStr(this.fieldName, this.pophelpSelectedvalue), this.compData['dummyInt'] );
        if(this.isPreventPopHelpItemChange == false)
        {
          console.log('print this.callApiForSimpleLayout 348::::',this.callApiForSimpleLayout);
          // this.itemChangeUtils.stateFulItemChange(this.fieldName, this.pophelpSelectedvalue, this.formNo, this.compData['EDITOR_ID'], this.createChgStr(this.fieldName, this.pophelpSelectedvalue), this.dateFeildArray, this.compData['dummyInt'],this.keyValue);
          if(this.callApiForSimpleLayout == true)
          {
            let tempParam = {};
            tempParam['OBJ_NAME'] = this.compData['OBJ_NAME'];
            tempParam['OBJ_CONTEXT'] = this.compData['OBJ_CTX'];
            tempParam['PAGE_CTX'] = '2';
            tempParam['CHG_STR'] = this.buildJsonChgStr(this.formNo,this.fieldName);
            tempParam['FIELD_NAME'] = this.fieldName;
            tempParam['EDITOR_ID'] = this.compData['EDITOR_ID'];
            tempParam['DOM_ID'] = this.keyValue;
            console.log('print tempParam 358::::',tempParam);
            let paramString = this._openPpohelpService.getEncodedParamString(tempParam);
            this._openPpohelpService.getFieldItemChange(paramString).subscribe( (response:any)=> {
              console.log('print pophelp item change response::::',response);
              let itmChgResp = JSON.parse(response);
              if(itmChgResp && itmChgResp.status && itmChgResp.status == 'success')
              {
                // Emit to parent so it handles the update and triggers change detection
                this.itemChangeValues.emit(JSON.stringify(itmChgResp.data));
              }
              else if(itmChgResp && itmChgResp.status && itmChgResp.status == 'error')
              {
                // Emit full response for error handling by parent
                this.itemChangeValues.emit(response);
              }
            }, (error:any) => {
              console.log('Error in pophelp item change API call::::',error);
            });
          }
          else
          {
            this.itemChangeUtils.stateFulItemChange(this.fieldName, this.pophelpSelectedvalue, this.formNo, this.compData['EDITOR_ID'], this.getCurrentRowXML(this.formNo, 2, '', false, '', this.keyValue, this.fieldName, this.pophelpSelectedvalue), this.formWiseFormatJsonData, this.compData['dummyInt'], this.keyValue);
          }
        }
        else
        {
          this.isPreventPopHelpItemChange = false;
        }
        //this.onItemChange(this.fieldName, this.pophelpSelectedvalue);
      }
      //Added by Jatin M on 21-06-2023 [For issues related to pophelp in simple editor screen] - END
      this.itemChangeFieldValue = {};

    }
    catch (error) {
      console.log('Error in pophelp onDone::::', error);
    }
    finally {
      this.resetOverlayContainerZIndex();
      if (this.overlayRef)
      {
        this.overlayRef.dispose();
        this.overlayRef = null;
      }
    }
  }

  checkNull(value: any): any {    
    if (value === null || value === undefined || value === '') {
      return '';
    }
    if (typeof value === 'object' && value instanceof Date && isNaN(value.getTime())) {
      return ''; // or any default value you want
    }
    return value;
  }


  onItemChange(columnName:any, columnValue:any) {
    // console.log('inside onItemChange line 522222', columnName, columnValue);
    //Added by Jatin M on 21-06-2023 [For issues related to pophelp in simple editor screen] - START
    if (!(columnValue instanceof Object) && (""+columnValue).trim() != this.pophelpSelectedvalue.trim()) {
      this.pophelpSelectedvalue = ""+columnValue;
    }
    //Added by Jatin M on 21-06-2023 [For issues related to pophelp in simple editor screen] - END
    // console.log('Print itemchnagelist arry in onitemchange method:: ', this.itemChangeList);
    // if (this.itemChangeList.includes(columnName)) {
      if (this.itemChangeList.includes(columnName)) {
      let paramMap:any = {};
      let paramString = "";
      paramMap["OBJ_NAME"] = this.compData['OBJ_NAME'];
      paramMap["ACTION"] = "ITEM_CHANGE";
      paramMap["OBJ_CTX"] = this.compData['OBJ_CTX'];
      paramMap["PAGE_CTX"] = "2";
      paramMap["EDITOR_ID"] = this.compData['EDITOR_ID'];
      paramMap["RTEURN_TYPE"] = "Json";
      paramMap["CHG_STR"] = this.createChgStr(columnName, columnValue);
      paramMap["FIELD_NAME"] = columnName;
      paramMap["dummyInt"] = this.compData['dummyInt'];
      paramString = this._openPpohelpService.getEncodedParamString(paramMap);
      let url = this._openPpohelpService.getHostURL() + '/ibase/E12EditorHandlerServlet';
      this._openPpohelpService.sendRequest(url, paramString, (data:any) => {
        this._openPpohelpService.setLoading(false);
        let callbackResp = data.split('%%SEP%%');
        data = callbackResp[0];
        let isError = callbackResp[1].trim();
        // console.log('inside onItemChange.......165[' + data);
        // console.log('Print isError on reponse of item change::: ', isError);
        if (!(isError == 'true')) {
          this.onItemChangeResponseReceived(data);
          // this.itemChangeData = JSON.parse(data);
          // if (data.Root) {
          //   // console.log('inside onItemChange.......172[', data.Root);

          // }
          // this.itemChangeFieldValue[this.fieldName] = this.checkNull(this.pophelpSelectedvalue); //Added by Jatin M on 21-06-2023 [For issues related to pophelp in simple editor screen]
          // this.itemChangeValues.emit(data);
          // this.pophelpSelectedvalue = "";
          // this.itemChangeFieldValue = {};
        }
      }
      );
    }
    // }
  }

  onItemChangeResponseReceived(data: any)
  {
    // console.log('print onItemChangeResponseReceived 369::::', data );
    if(data !== null && typeof data === 'object' && !Array.isArray(data))
    {
      this.itemChangeData = JSON.parse(data);
    }
    if (data.Root) {
      // console.log('inside onItemChange.......172[', data.Root);
    }
    this.itemChangeFieldValue[this.fieldName] = this.checkNull(this.pophelpSelectedvalue); //Added by Jatin M on 21-06-2023 [For issues related to pophelp in simple editor screen]
    // console.log('27022024 onItemChangeResponseReceived this.itemChangeFieldValue [', this.itemChangeFieldValue ,']');
    this.itemChangeValues.emit(data);
    this.pophelpSelectedvalue = "";
    this.itemChangeFieldValue = {};
  }


  createChgStr(columnName:any, columnValue:any, formNo?: any) {
    // console.log("415 <<in createChgStr xml001>> [" + columnValue + "]");
    console.log("createchgstr formNo :: ",formNo)
    let finalXML = `<?xml version='1.0' encoding='utf-8'?>`
    finalXML = finalXML + '<Root>';

    let headerData:any =
    {
      'objName': this.compData['OBJ_NAME'],
      'pageContext': '1',
      'objContext': this.compData['OBJ_CTX'],
      'editFlag': this.compData['EDIT_FLAG'],
      'focusedColumn': columnName,
      'elementName': '',
      'keyValue': this.keyValue || '1',
      'taxKeyValue': '',
      'saveLevel': '0',
      'forcedSave': 'false',
      'taxInFocus': 'false',
    }

    columnValue = this.checkNull(columnValue)
    let headerXML = `<header>`;
    for (let key in headerData) {
      headerXML = headerXML + `<` + key + `><![CDATA[` + headerData[key] + `]]></` + key + `>`
    }
    headerXML = headerXML + `</header>`;
    let paramXML: any;
    if(this.transMode == 'I')
    {
      paramXML = this.getallFormXml(headerXML);
      finalXML = finalXML + paramXML;
    }
    else
    {
      // let jsonData = JSON.parse(this.paramData);
      let jsonData = this.paramData;
      if (this.detailNum == undefined || this.detailNum == null || this.detailNum == '')
      {
        this.detailNum = 'Detail' + this.formNo;
      }
      // console.log('Print jsonFData 450 inside pophelp:::::' + JSON.stringify(jsonData));
      let extractedJsonData: any = {};
      let mainExtractedData: any;
      let dataIsObject = (typeof jsonData === 'object' && !Array.isArray(jsonData));
      if (dataIsObject && this.compData['OBJ_NAME'] === 'item-attributes') 
      {
        for (const key in jsonData) 
        {
          let data = jsonData[key];
          if (typeof data === 'object' && Object.keys(data).length > 1) 
          {
            let extractedJsonObj = Object.keys(data).filter(k => k !== 'FIELDNAME' && data[k] !== '');
            if (extractedJsonObj.length > 0) 
            {
              extractedJsonData[key] = data;
              mainExtractedData = extractedJsonData[key];
            }
          }
        }
      }
      else
      {
        mainExtractedData = jsonData;
      }
      // console.log("Extracted JSON:", JSON.stringify(extractedJsonData, null, 2));
      paramXML = `<` + this.detailNum + ` objContext="` + this.compData['OBJ_CTX']
      + `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + this.keyValue + `" dbID="" selected="Y">`;
      // paramXML = paramXML + this.attributeTag;
      if(mainExtractedData)
      {
        paramXML = paramXML + this.attributeTagg(jsonData['attribute']);
        for (let key in mainExtractedData) 
        {
          let jsonValue = this.checkNull(mainExtractedData[key]);
          let id = this.detailNum + '.' + this.keyValue + '.' + key;
          let protectttValue = this.protectAttribParams[id];
          let visbileValue = this.visibleAttribParams[id];
          if (jsonValue !== null && jsonValue !== undefined && jsonValue !== '') 
          {
            if (jsonValue instanceof Object) 
            {
              if (this.checkIsDateFormat(key, formNo))
              {
                let val = jsonValue.toString();
                const date = new Date(val);
                if(date && !isNaN(date.getTime()))
                {
                  if(val.includes(':'))
                    {
                      jsonValue = this.formatDate(val);
                    } 
                    else
                    {
                      jsonValue = this.datePipe.transform(val, 'dd/MM/yy');
                    }
                }
              }
            }

            if (protectttValue == undefined) {
              protectttValue = "";
            }
           
            if (visbileValue == undefined) {
              visbileValue = "";
            }
            // if(value == null || value == 'null' || value == undefined)
            // {
            //   value = "";
            // }
            if(this.checkIsDateFormat(key, formNo))
            {
                let fldValue = jsonValue;
                if (fldValue) 
                {
                  // console.log("PRINT LINE NO 517 fldValue:::::", fldValue);
                  if (typeof fldValue === "object" && fldValue !== null)
                  {
                    fldValue = JSON.stringify(fldValue); 
                  }
                  let date;
                  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
                  if (isoDateRegex.test(fldValue)) 
                  {
                    date = new Date(fldValue);
                  } 
                  else 
                  {
                    if (fldValue && typeof fldValue === "string") 
                    {
                      date = this.parseCustomDateFormat(fldValue);
                    }
                  }
                  if (date && !isNaN(date.getTime())) 
                  {
                    // Now the date is valid, so we use DatePipe to format it
                    // value = this.datePipe.transform(date, 'dd/MM/yy HH:mm:ss');
                    // Changed by Samruddhi for system inconsistency error.
                     jsonValue = this.formatDate(date);
                  } 
                  else 
                  {
                   // console.log("Invalid Date: Cannot format", fldValue);
                  }
                }
                paramXML = paramXML + "<" + key + " id='" + this.detailNum + "_SEP1_" + this.keyValue + "_SEP1_" + key + "' protect='" + protectttValue + "'" + " visible='" + visbileValue + "'" + "><![CDATA[" + jsonValue + "]]></" + key + ">"
              }
            if (key == columnName) {
              paramXML = paramXML + "<" + key + " id='" + this.detailNum + "_SEP1_" + this.keyValue + "_SEP1_" + key + "' protect='" + protectttValue + "'" + " visible='" + visbileValue + "'" + "><![CDATA[" + columnValue + "]]></" + key + ">"
            } else {
              paramXML = paramXML + "<" + key + " id='" + this.detailNum + "_SEP1_" + this.keyValue + "_SEP1_" + key + "' protect='" + protectttValue + "'" + " visible='" + visbileValue + "'" + "><![CDATA[" + jsonValue + "]]></" + key + ">"
            }
          }
          else
          {
            if (protectttValue == undefined) {
              protectttValue = "";
            }
           
            if (visbileValue == undefined) {
              visbileValue = "";
            }
            paramXML = paramXML + "<" + key + " id='" + this.detailNum + "_SEP1_" + this.keyValue + "_SEP1_" + key + "' protect='" + protectttValue + "'" + " visible='" + visbileValue + "'" + "><![CDATA[" + jsonValue + "]]></" + key + ">"
          }
        }
        paramXML = paramXML + `</` + this.detailNum + `>`;
        finalXML = finalXML + headerXML + paramXML;
      }
    }
    
    finalXML = finalXML + '</Root>';
    // console.log("buildParamXML 001>>" + paramXML);
    // console.log("buildParamXML 475..." + finalXML);
    return finalXML;
  }

  getallFormXml(finalXml:any) 
	{
		let noOfForm = this.compData["NO_OF_FORMS"];
		for (let i = 0; i < noOfForm; i++) 
		{
			let formDetail = 'Detail' + (i + 1);
      let currentAllData = JSON.parse(JSON.stringify(this.paramData));
			if (formDetail == 'Detail1') 
			{
				let dbId = "";
				// console.log('Print paramData inside line 1237::: ', this.paramData['attribute']);
				let attributeTagJson = this.paramData['attribute'];
		  	if(attributeTagJson && typeof attributeTagJson === 'string')
		  	{
			  		attributeTagJson = JSON.parse(attributeTagJson);
		    }	
				let attributeTagInXml = `<attribute `;
				// console.log('Print 620:::::');
				for (const key of Object.keys(attributeTagJson)) 
				{
					if (this.compData['EDIT_FLAG'] == 'E') 
					{
						if (key == "pkNames") 
						{
							let primaryKey = attributeTagJson[key];

							let newstr = primaryKey.substring(0, primaryKey.length - 1);
							let arr = newstr.split(":");
							let arrLength = arr.length;

							for (let k = 0; k < arrLength; k++) 
							{
								let currentPkName = arr[k];
								dbId = dbId + this.paramData[currentPkName] + ":";
							}
							dbId = dbId.substring(0, dbId.length - 1);
						}
					}
					attributeTagInXml = attributeTagInXml + ` ` + key + `="` + attributeTagJson[key] + `"`;
				}
				attributeTagInXml = attributeTagInXml + `/>`;
				if (dbId == undefined || dbId == 'undefined') 
				{
					dbId = "";
				}
				let paramXML = `<` + formDetail + ` objContext="` + (i + 1)
					+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + (i + 1) + `" dbID="` + dbId + `" selected="Y">`;

				paramXML = paramXML + attributeTagInXml;
				
				for (let key in currentAllData) 
				{
					let value = currentAllData[key];
					if (value instanceof Array) 
					{
						delete currentAllData[key];
					}
				}

				let jsonData:any = {};
				jsonData = JSON.parse(JSON.stringify(currentAllData));

				for (let key in jsonData) 
				{
					let id:any = formDetail + '.1.' + key;
					let value = jsonData[key];
					if (value instanceof Object) 
					{
						value = "";
					}

					if(value == null || value == 'null' || value == undefined)
					{
						value = "";
					}
          if(this.checkIsDateFormat(key, i+1))
          {
              let fldValue = value;
              // value = "";
              try {
                if (fldValue) {
                  const date = new Date(fldValue);
                  if(!isNaN(date.getTime()))
                  {
                    	if(fldValue.includes(':'))
                      	{
                          value = this.formatDate(fldValue);
                      	}
                      	else 
                      	{
                        	value = this.datePipe.transform(fldValue, 'dd/MM/yy');
                      	}
                  }
                }
              }
              catch (error) {
                value = fldValue;
              }
              paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
          }
					else if (key != "attribute") 
					{
						paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
					}
				}
				paramXML = paramXML + `</` + formDetail + `>`;
				finalXml = finalXml + paramXML;
			}
			else 
			{
				let detailDataLen = 0;
				if (this.paramData[formDetail] != undefined) 
				{
					detailDataLen = this.paramData[formDetail].length;
				}
				for (let j = 0; j < detailDataLen; j++) 
				{
					let dbId = "";
					let attributeTagJson = this.paramData[formDetail][j]['attribute'];
					if (attributeTagJson) 
					{
						attributeTagJson = this.paramData[formDetail][j]['attribute'];
					}

					let attributeTagInXml = `<attribute IS_CHANGE="Y"`;
					if (JSON.stringify(attributeTagJson).includes('IS_CHANGE')) 
					{
						attributeTagInXml = `<attribute `;
					}
          if(attributeTagJson && typeof attributeTagJson === 'string')
          {
            	attributeTagJson = JSON.parse(attributeTagJson);
          }	
					for (const key of Object.keys(attributeTagJson)) 
					{
						if (this.compData['EDIT_FLAG'] == 'E') 
						{
							if (key == "pkNames") 
							{
								let primaryKey = attributeTagJson[key];
								let newstr = primaryKey.substring(0, primaryKey.length - 1);
								let arr = newstr.split(":");
								let arrLength = arr.length;

								for (let k = 0; k < arrLength; k++) 
								{
									let currentPkName = arr[k];
									dbId = dbId + this.paramData[formDetail][j][currentPkName] + ":";
								}
								dbId = dbId.substring(0, dbId.length - 1);
							}
						}
						attributeTagInXml = attributeTagInXml + ` ` + key + `="` + attributeTagJson[key] + `"`;
					}
					attributeTagInXml = attributeTagInXml + `/>`;

					// console.log('inside detail case......1345', dbId);
					if (dbId == undefined || dbId == 'undefined') 
					{
						dbId = "";
					}
					let paramXML = "";
					let domId = this.paramData[formDetail][j]['domID'];
					if( this.compData['EDIT_FLAG'] == 'A')
					{
						// let domId = this.paramData[formDetail][j]['domID'];
						// console.log('inside build allFormXml......1798',domId);
						paramXML = `<` + formDetail + ` objContext="` + (i + 1)
						+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + domId + `" dbID="` + dbId + `">`;
					}
					else
					{
						paramXML = `<` + formDetail + ` objContext="` + (i + 1)
						+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + domId + `" dbID="` + dbId + `">`;
					}
					
					paramXML = paramXML + attributeTagInXml;
					currentAllData = this.paramData[formDetail][j];
					let jsonData:any = {};
					jsonData = JSON.parse(JSON.stringify(currentAllData));

					for (let key in jsonData) 
					{
						// let id = formDetail + '.' + (j + 1) + '.' + key;
						let id = formDetail + '.' + domId + '.' + key;
						let value = jsonData[key];
						if (value instanceof Object) 
						{
							value = "";
						}
						if(value == null || value == 'null' || value == undefined)
						{
							value = "";
						}
            if(this.checkIsDateFormat(key, i+1))
            {
                let fldValue = value;
                // value = "";
                try {
                  if (fldValue) {
                    const date = new Date(fldValue);
                    if(!isNaN(date.getTime()))
                    {
                      	if(fldValue.includes(':'))
                        {
                            value = this.formatDate(fldValue)
                        }
                        else 
                        {
                          	value = this.datePipe.transform(fldValue, 'dd/MM/yy');
                        }
                    }
                  }
                }
                catch (error) {
                  value = fldValue;
                }
                paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
            }
						else if (key != "attribute") 
						{
							paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
						}
					}
					paramXML = paramXML + `</` + formDetail + `>`;
					finalXml = finalXml + paramXML;
				}
			}
		}
		// console.log('Final XML..........................1573', finalXml);
		return finalXml;
	}

  getSqlInputParams(sqlInput: any) : any
  {
      // console.log('Inside 01032024 sqlInput::::',sqlInput);
      let tmpData: any = {};
      let sqlInputArr = sqlInput.split(":");
      let sqlInputList = [];
      for(let curToken of sqlInputArr)
      {
          if(curToken)
          {
              curToken = (curToken.indexOf(",") != -1) ? curToken.substring(0,curToken.indexOf(",")) : curToken;
              if(curToken.indexOf(".") != -1)
              {
                  curToken = curToken.substring(curToken.indexOf(".") + 1);
              }
              // console.log('Inside 01032024 curToken::::',curToken);
              sqlInputList.push(curToken);
          }
      }
      // console.log('Inside 01032024 sqlInputList::::',sqlInputList);
      for(let curToken of sqlInputList)
      {
        if(this.paramData.hasOwnProperty(curToken)  && this.checkNull(this.paramData[curToken]) !== '')
        {
          tmpData[curToken] = this.paramData[curToken];
        }
      }
      if(Number(this.formNo) > 1)
      {
        // console.log('Inside 01032024 this.detailNum::::',this.detailNum);
        // console.log('Inside 01032024 this.keyValue::::',this.keyValue);
        // console.log('Inside 01032024 this.paramData[this.detailNum]::::',this.paramData[this.detailNum]);
        let currentFormData = this.paramData[this.detailNum].find((obj: any) =>{
          return obj['domID'] == this.keyValue;
        });
        // console.log('Inside 01032024 currentFormData::::',currentFormData);
        if(currentFormData)
        {
          for(let curToken of sqlInputList)
          {
            // console.log('Inside 01032024 curToken 2::::',curToken);
            if(currentFormData.hasOwnProperty(curToken) && this.checkNull(currentFormData[curToken]) !== '')
            {
              tmpData[curToken] = currentFormData[curToken];
            }
            // console.log('Inside 01032024 tmpData[curToken] 2::::',tmpData[curToken]);
          }
        }
      }
      return tmpData;
  }

  getCurrentRowXML(formNo: any, pageContext: any, action: any, forcedSave: any, pkvalues: any, domId: any, columnName: any, columnValue: any)
	{
    let keyVal = this.keyValue
    let currentAllData = JSON.parse(JSON.stringify(this.paramData));
		// let currentAllData = this.paramData;
		// console.log('Print currentAllData 885::::::',currentAllData);
		let finalXml = "<?xmlversion='1.0'encoding='utf-8'?><Root>";
		finalXml = finalXml + "<header>";
		finalXml = finalXml + "<objName><![CDATA[" + this.compData["OBJ_NAME"] + "]]></objName>";
		finalXml = finalXml + "<pageContext><![CDATA[" + pageContext + "]]></pageContext>";
		finalXml = finalXml + "<objContext><![CDATA[" + formNo +"]]></objContext>";
		finalXml = finalXml + "<editFlag><![CDATA[" + this.editFlag + "]]></editFlag>";
		finalXml = finalXml + "<focusedColumn><![CDATA[" + columnName + "]]></focusedColumn>";
		finalXml = finalXml + "<elementName><![CDATA[]]></elementName>";
		finalXml = finalXml + "<keyValue><![CDATA[" + keyVal + "]]></keyValue>";
		finalXml = finalXml + "<taxKeyValue><![CDATA[]]></taxKeyValue>";
		finalXml = finalXml + "<saveLevel><![CDATA[1]]></saveLevel>";
		finalXml = finalXml + "<forcedSave><![CDATA[" + forcedSave + "]]></forcedSave>";
		finalXml = finalXml + "<taxInFocus><![CDATA[false]]></taxInFocus>";
		finalXml = finalXml + "</header>";
		
		let formDetail: any = 'Detail' + formNo;
		if (formDetail == 'Detail1' || this.paramData[formDetail] == undefined)
		{
			let dbId = "";
			// console.log('Print allformvalues inside line 1237::: ', this.paramData['attribute']);
			let attributeTagJson = this.paramData['attribute'];
      if(attributeTagJson && typeof attributeTagJson === 'string')
      {
       	 	attributeTagJson = JSON.parse(attributeTagJson);
      }	
			let attributeTagInXml = `<attribute `;
			// console.log('Print 620:::::');
			for (const key of Object.keys(attributeTagJson)) 
			{
				if (this.editFlag == 'E') 
				{
					if (key == "pkNames") 
					{
						let primaryKey = attributeTagJson[key];

						let newstr = primaryKey.substring(0, primaryKey.length - 1);
						let arr = newstr.split(":");
						let arrLength = arr.length;

						for (let k = 0; k < arrLength; k++) 
						{
							let currentPkName = arr[k];
							dbId = dbId + this.paramData[currentPkName] + ":";
						}
						dbId = dbId.substring(0, dbId.length - 1);
					}
				}
				attributeTagInXml = attributeTagInXml + ` ` + key + `="` + attributeTagJson[key] + `"`;
			}
			attributeTagInXml = attributeTagInXml + `/>`;
			if (dbId == undefined || dbId == 'undefined') 
			{
				dbId = "";
			}
      let paramXML;
      if( formDetail == 'Detail1' )
      {
        paramXML = `<` + formDetail + ` objContext="` + formNo
				+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + formNo + `" dbID="` + dbId + `" selected="Y">`;
      }
      if( this.paramData[formDetail] == undefined )
      {
        paramXML = `<` + formDetail + ` objContext="` + formNo
				+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + this.keyValue + `" dbID="` + dbId + `" selected="Y">`;
      }

			paramXML = paramXML + attributeTagInXml;
			
			for (let key in currentAllData) 
			{
				let value = currentAllData[key];
				if (value instanceof Array) 
				{
					delete currentAllData[key];
				}
			}

			let jsonData:any = {};
			jsonData = JSON.parse(JSON.stringify(currentAllData));

			for (let key in jsonData) 
			{
				let id:any = formDetail + '.1.' + key;
				let value = jsonData[key];
				if (value instanceof Object) 
				{
					value = "";
				}

				if (value == "null") 
				{
					value = "";
				}
				if (this.checkIsDateFormat(key, formNo)) 
				{
					let fldValue = value;
					value = "";
					try
					{
						if (fldValue) 
						{
							if(fldValue.includes(':'))
							{
                if (fldValue) 
                {
                  if (fldValue && fldValue.endsWith('00:00:00')) 
                  {
                    fldValue = fldValue.substring(0, 8); 
                  }
                  let date;
                  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
                  if (isoDateRegex.test(fldValue)) 
                  {
                    date = new Date(fldValue);
                  } else 
                  {
                    date = this.parseCustomDateFormat(fldValue)
                  }
                  if (!isNaN(date.getTime())) 
                  {
                    value = this.formatDate(date);
                  } 
                }
							} 
							else
							{
                fldValue = this.parseCustomDateFormat(fldValue);

                if(!isNaN(fldValue.getTime()))
                {
                  value = this.formatDate(fldValue);
                }
							}
						}
					}
					catch(error)
					{
						value = fldValue;
					}
					if(value == null || value == 'null' || value == undefined)
					{
						value = "";
					}
					paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
				}
				else if (key != "attribute") 
				{
					if(value == null || value == 'null' || value == undefined)
					{
						value = "";
					}
					paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
				}
			}
			paramXML = paramXML + `</` + formDetail + `>`;
			finalXml = finalXml + paramXML;
		}
		else 
		{
			let detailDataLen = 0;
			// console.log('Print this.paramData[formDetail] 4613::::::',this.paramData[formDetail]);
			if (this.paramData[formDetail] != undefined) 
			{
				detailDataLen = this.paramData[formDetail].length;
				
			}
			if(detailDataLen > 0)
			{
				for (let j = 0; j < detailDataLen; j++) 
				{
					let dbId = "";
					if(this.paramData && this.paramData[formDetail] && this.paramData[formDetail][j] && this.paramData[formDetail][j]['domID'])
					{
						// console.log('Print this.paramData[formDetail][j] ::::::',this.paramData[formDetail][j]);
						// console.log('Print domId ::::::',domId);
						if(this.paramData[formDetail][j]['domID'] == domId)
						{
							let attributeTagJson = this.paramData[formDetail][j]['attribute'];
							// console.log('Print attributeTagJson 4629::::::',attributeTagJson);
							if (attributeTagJson) 
							{
								attributeTagJson = this.paramData[formDetail][j]['attribute'];
							}
			
							let attributeTagInXml = `<attribute IS_CHANGE="Y"`;
							if (JSON.stringify(attributeTagJson).includes('IS_CHANGE')) 
							{
								attributeTagInXml = `<attribute `;
							}
              if(attributeTagJson && typeof attributeTagJson === 'string')
              {
                attributeTagJson = JSON.parse(attributeTagJson);
              }	
							for (const key of Object.keys(attributeTagJson)) 
							{
								if (this.editFlag == 'E') 
								{
									if (key == "pkNames") 
									{
										let primaryKey = attributeTagJson[key];
										let newstr = primaryKey.substring(0, primaryKey.length - 1);
										let arr = newstr.split(":");
										let arrLength = arr.length;
			
										for (let k = 0; k < arrLength; k++) 
										{
											let currentPkName = arr[k];
											dbId = dbId + this.paramData[formDetail][j][currentPkName] + ":";
										}
										dbId = dbId.substring(0, dbId.length - 1);
									}
								}
								attributeTagInXml = attributeTagInXml + ` ` + key + `="` + attributeTagJson[key] + `"`;
							}
							attributeTagInXml = attributeTagInXml + `/>`;
			
							// console.log('inside detail case......1345', dbId);
							if (dbId == undefined || dbId == 'undefined') 
							{
								dbId = "";
							}
							let paramXML = "";
							if( this.editFlag == 'A')
							{
								let domId = this.paramData[formDetail][j]['domID'];
								// console.log('inside build allFormXml......1798',domId);
								paramXML = `<` + formDetail + ` objContext="` + formNo
								+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + domId + `" dbID="` + dbId + `">`;
							}
							else
							{
								paramXML = `<` + formDetail + ` objContext="` + formNo
								+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + domId + `" dbID="` + dbId + `">`;
							}
							
							paramXML = paramXML + attributeTagInXml;
							currentAllData = this.paramData[formDetail][j];
							let jsonData:any = {};
							jsonData = JSON.parse(JSON.stringify(currentAllData));
			
							for (let key in jsonData) 
							{
								// console.log('Print key 4689::::::['+key+']');
								let id = formDetail + '.' + (j + 1) + '.' + key;
								let value = jsonData[key];
								if (value instanceof Object) 
								{
									value = "";
								}
								if (value == "null") 
								{
									value = "";
								}
								if (this.checkIsDateFormat(key, formNo)) 
								{
									let fldValue = value;
									value = "";
									try
									{
										if (fldValue) 
                    {
											let date;
											const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
											if (isoDateRegex.test(fldValue)) 
                      {
												// console.log("PRINT LINE NO 584 fldValue", fldValue);
												date = new Date(fldValue);
											} else 
                      {
                        date = this.parseCustomDateFormat(fldValue);
											}
											if (!isNaN(date.getTime())) 
                      {
                        value = this.formatDate(date);
											} 
										}
									}
									catch(error)
									{
										value = fldValue;
									}
									if(value == null || value == 'null' || value == undefined)
									{
										value = "";
									}
									paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
								}
								else if (key != "attribute") 
								{
									if(value == null || value == 'null' || value == undefined)
									{
										value = "";
									}
									paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
									// paramXML = paramXML + `<` + key + ` id = '` + id + `'><![CDATA[` + value + `]]></` + key + `>`
								}
							}
							paramXML = paramXML + `</` + formDetail + `>`;
							finalXml = finalXml + paramXML;
						}
					}
				}
			}
			else
			{
				finalXml = "";
				return finalXml;
			}
		}
		finalXml = finalXml + "</Root>";
		// console.log('Final XML getCurrentRowXML ::::', finalXml);
		return finalXml;
	}

  setFocusOnPopupHelp(item: any) 
  {
    let formDetail: any = 'Detail' + this.formNo;
    let selectedVal = typeof item === 'string' ? JSON.parse(item) : item;

    for (const key of Object.keys(selectedVal)) 
    {
      if (Object.prototype.hasOwnProperty.call(selectedVal, key)) 
      {
        let id = document.getElementById(`${formDetail}-`+this.keyValue+`-${key}`) ? `${formDetail}-`+this.keyValue+`-${key}` : `${formDetail}.`+this.keyValue+`.${key}`;
        let inputElem = document.getElementById(id);
        let inputField = inputElem.querySelector('input');
        if (inputField && inputField instanceof HTMLInputElement && !inputField.hasAttribute('disabled')) 
        {
          inputField.focus();
        } 
        else if (inputElem && inputElem instanceof HTMLTextAreaElement && !inputElem.hasAttribute('disabled')) 
        {
          inputElem.focus();
        }
        else if (inputElem instanceof HTMLInputElement && !inputElem.hasAttribute('disabled'))
        {
          inputElem.focus();
        }
      }
    }
  }

  checkIsDateFormat(key: any, formNo: any): boolean
	{
		const form = this.formWiseFormatJsonData[formNo];
		if(!form)
		{
			return false;
		}
		
		const format = form[key];

		if(!format)
		{
			return false;
		}

		const dateFormats = ['dateBox', '[shortdate] [time]', 'dd/mm/yy', 'datetime'];
		
		return dateFormats.includes(format);
	}

  ngOnChanges(changes: SimpleChanges) 
  {
    if (changes['formWiseFormatJson'] && changes['formWiseFormatJson'].currentValue) 
      {
        this.formWiseFormatJsonData = changes['formWiseFormatJson'].currentValue;
    }
  }

  parseCustomDateFormat(fldValue: string): Date
	{	
		let date;
		const [datePart, timePart] = fldValue.split(" ");
		const finalTimePart = timePart ? timePart : "00:00:00";
		const [day, month, year] = datePart.split("/");
		const formattedDate = `20${year}-${month}-${day}T${finalTimePart}`;
		date = new Date(formattedDate);
		return date;
	}

  formatDate(dateVal: Date): string
	{
    const date = dateVal instanceof Date ? dateVal : new Date(dateVal);

		let value;

		value = this.datePipe.transform(date, 'dd/MM/yy HH:mm:ss');

		let val = value;
		if (val && val.endsWith('00:00:00')) 
		{
			value = val.substring(0, 8);
		}

		return value;
	}

  /* openPophelpPopUp(result: any)
  {
    console.log('print openPophelpPopUp result::::',result);
    this.createOverlay();
    this.popHelp.openPophelp(result);
  } */
  
  buildJsonChgStr(formNo: any, focusedCol?: any)
	{
		let detailNo = 'Detail'+formNo;
		let chgStrJson: any = {};

		let headerData:any =
		{
		'objName': this.compData['OBJ_NAME'],
		'pageContext': '1',
		'objContext': formNo,
		'editFlag': this.compData['EDIT_FLAG'],
		'focusedColumn': focusedCol,
		'elementName': '',
		'keyValue': this.keyValue || '1',
		'taxKeyValue': '',
		'saveLevel': '0',
		'forcedSave': 'false',
		'taxInFocus': 'false',
		}
		chgStrJson['header'] = headerData;
		if(this.allformValues && this.allformValues[detailNo] && this.allformValues[detailNo].length > 0)
		{
			let detailArr: any = this.allformValues[detailNo]
			console.log('print detailArr 8617:::',detailArr);
			if (detailArr && (!Array.isArray(detailArr) || detailArr.length === 0)) return;
			if(detailArr && detailArr.length > 0)
			{
				for(let i = 0; i < detailArr.length; i++)
				{
					const row = detailArr[i];
					chgStrJson[detailNo] = {};
		
					Object.keys(row).forEach((key) => {
						if (key.endsWith('_protect') || key.endsWith('_visible')) return;
						// ----- ATTRIBUTE → ORIG_ATTRIBUTE_NODE -----
						if (key === 'attribute')
						{
							let attrObj: any = {};
							let attrVal = row[key];
							if(attrVal && typeof attrVal === 'object')
							{
								attrObj = attrVal;
							}
							else if(attrVal && typeof attrVal === 'string')
							{
								try { attrObj = JSON.parse(attrVal); } catch(e) { attrObj = {}; }
							}
							chgStrJson[detailNo]['ORIG_ATTRIBUTE_NODE'] = {
							protect: row['attribute_protect'] || '',
							visible: row['attribute_visible'] || '',
							content:
								`<attribute pkNames="${attrObj.pkNames || ''}" ` +
								`selected="${attrObj.selected || ''}" ` +
								`status="${attrObj.status || ''}" ` +
								`updateFlag="${attrObj.updateFlag || ''}"/>`
							};
							// return;
						}
						else if(key.includes('_date'))
						{
							let value = row[key];
							console.log('print value 8716::::',value);
							if(value && value != 'Invalid Date')
							{
								row[key] = this.formatDateToDDMMYY(value);
							}
							else
							{
								row[key] = '';
							}
						}
		
						// ----- NORMAL FIELDS -----
						chgStrJson[detailNo][key] = {
							protect: row[`${key}_protect`] || '',
							visible: row[`${key}_visible`] || '',
							content: row[key] || ''
						};
					});	
					console.log('print chgStrJson 8705:::',chgStrJson);
				}
			}
		}
		else if(this.allformValues && formNo == '1')
		{
			let data = this.allformValues;
			chgStrJson[detailNo] = {};
			Object.keys(data).forEach((key) => {
				if(key != detailNo)
				{
					if (key.endsWith('_protect') || key.endsWith('_visible')) return;
					// ----- ATTRIBUTE → ORIG_ATTRIBUTE_NODE -----
					if (key === 'attribute')
					{
						let attrObj: any = {};
						let attrVal = data[key];
						if(attrVal && typeof attrVal === 'object')
						{
							attrObj = attrVal;
						}
						else if(attrVal && typeof attrVal === 'string')
						{
							try { attrObj = JSON.parse(attrVal); } catch(e) { attrObj = {}; }
						}
						chgStrJson[detailNo]['ORIG_ATTRIBUTE_NODE'] = {
						protect: data['attribute_protect'] || '',
						visible: data['attribute_visible'] || '',
						content:
							`<attribute pkNames="${attrObj.pkNames || ''}" ` +
							`selected="${attrObj.selected || ''}" ` +
							`status="${attrObj.status || ''}" ` +
							`updateFlag="${attrObj.updateFlag || ''}"/>`
						};
						// return;
					}
					else if(key.includes('_date'))
					{
						let value = data[key];
						// console.log('print value 8733:::::',value);
						if(value && value != 'Invalid Date')
						{
							data[key] = this.formatDateToDDMMYY(value);
						}
						else
						{
							data[key] = '';
						}
					}
		
					// ----- NORMAL FIELDS -----
					chgStrJson[detailNo][key] = {
						protect: data[`${key}_protect`] || '',
						visible: data[`${key}_visible`] || '',
						content: data[key] || ''
					};
				}
			});	
			console.log('print chgStrJson 8748:::',chgStrJson);
		}
		return JSON.stringify(chgStrJson);
	}

  formatDateToDDMMYY(date: any): string 
	{
		// console.log('print formatDateToDDMMYY date::::',date);
		// console.log('print formatDateToDDMMYY typeof date::::',typeof date);
		if(date && typeof date == 'string' && date.includes('/'))
		{
			return date;
		}
		else
		{
			const dd = String(date.getDate()).padStart(2, '0');
			const mm = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
			const yy = String(date.getFullYear()).slice(-2);
			return `${dd}/${mm}/${yy}`;
		}
	}
}