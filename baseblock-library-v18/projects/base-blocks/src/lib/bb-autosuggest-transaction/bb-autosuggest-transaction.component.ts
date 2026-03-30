import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ViewContainerRef, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { BbAutosuggestTransactionService } from './bb-autosuggest-transaction.service';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { DatePipe, JsonPipe } from '@angular/common';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ItemChangeUtils } from '../utility';

@Component({
  selector: 'bb-autosuggest-transaction',
  templateUrl: './bb-autosuggest-transaction.component.html',
  styleUrls: ['./bb-autosuggest-transaction.component.css']
})
export class BbAutosuggestTransactionComponent implements OnInit {
  encodedParam = "";
  formNo = "";
  isOpen: boolean = false;
  @Input() compData: any;
  @Input() paramData: any;
  @Input() id: any;
  fieldName = "";
  pophelpTitle = "";
  filterValue: any;
  objectName = "";
  dataSource = "";
  overlayRef: OverlayRef;
  detailNum: any;
  keyValue: any;
  protectAttribParams: any = {};
  visibleAttribParams: any = {};
  // dateFeildArray: any = [];
  @Input('formWiseFormatJson') formWiseFormatJson: any;
  newResult: any;
  @Output() onChangeValue: EventEmitter<any> = new EventEmitter();
  autocompleteTrigger: MatAutocompleteTrigger | any;
  filteredOptions: any;
  suggestFormattedData: any;
  @Input() displayMetadata: any;
  showSuggestions: boolean = false;
  isPophelp: boolean = true;
  minLength:number;
  @Output() suggestBoxEmit: EventEmitter<any> = new EventEmitter();
  custImage1 = "/ibase/CustomMenuImageServlet?fldValue=";
  custImage2 = "&ALT_FLD_VALUE=" + '' + "&object=";
  custImage3 = "&objName=";
  custImage4 = "&isOval=" + 'true';
  @Output() itemChangeValues: EventEmitter<any> = new EventEmitter();
  @Input() transMode: string;
  selectedIndex: number = -1;
  @Output() preventItemChange: EventEmitter<any> = new EventEmitter();
  @Output() preventEnterKeyItemChange: EventEmitter<any> = new EventEmitter();
  isAutoSuggestDataFetch: boolean = false;
  hoverIndex: number | null = null;
  @Output() autoSuggestData: EventEmitter<any> = new EventEmitter();
  @Input() callApiForSimpleLayout: boolean = false;
  @Input() tokenID: any = '';
  @Input() jSessionId: any = '';
  domID: any = '1';
  index: any = 0;
  dropdownStyle: any = {};

  constructor(public autoSuggestService: BbAutosuggestTransactionService, public overlay: Overlay, private viewContainerRef: ViewContainerRef, public datePipe: DatePipe, private overlayElem: ElementRef,
      public itemChangeUtil: ItemChangeUtils, private cdr: ChangeDetectorRef)
  {
  }

  calculateDropdownPosition()
  {
    const hostEl = this.overlayElem.nativeElement;
    const parentEl = hostEl.parentElement;
    if (parentEl)
    {
      const rect = parentEl.getBoundingClientRect();
      // Check if inside CDK overlay - use natural flow positioning
      let insideCdkOverlay = !!hostEl.closest('.cdk-overlay-pane');
      if (insideCdkOverlay) {
        this.dropdownStyle = {
          'z-index': '9999'
        };
      } else {
        // Normal flow - use fixed positioning relative to viewport
        let dropdownWidth = Math.max(rect.width, 400);
        let dropdownHeight = 244;
        let vpWidth = window.innerWidth;
        let vpHeight = window.innerHeight;
        let top = rect.bottom;
        let left = rect.left;
        if (top + dropdownHeight > vpHeight) {
          top = rect.top - dropdownHeight;
        }
        if (top < 0) { top = 8; }
        if (left + dropdownWidth > vpWidth) {
          left = vpWidth - dropdownWidth - 8;
        }
        if (left < 0) { left = 8; }
        this.dropdownStyle = {
          'position': 'fixed',
          'top': top + 'px',
          'left': left + 'px',
          'width': rect.width + 'px',
          'z-index': '9999'
        };
      }
    }
  }
  ngOnInit(): void 
  {
	
  }
  openSuggest(id: any, fldVal: any, sqlInput: any, pkValue: any, minLength?: number, formNo?: any, title?: any, fldName?:any, domID? : any, index?: any)
  {
    this.isOpen = true;
    this.selectedIndex = -1;
    this.hoverIndex = null;
    // Changed by Samruddhi for item change not working on blur
    // let preventItemChangeJSON = {};
    // preventItemChangeJSON['preventItemChange'] = true;
    // this.preventItemChange.emit(JSON.stringify(preventItemChangeJSON));

    // Null-safe check for fldVal
    if(fldVal == null || fldVal == undefined)
    {
      fldVal = '';
    }
    else if(typeof fldVal !== 'string')
    {
      fldVal = String(fldVal);
    }
    // console.log("print this.isOpen ::::: 58 ", this.isOpen);
    if (fldVal.trim() === "")
    {
      this.isAutoSuggestDataFetch = false;
      this.filteredOptions = [];
      this.suggestFormattedData = [];
      this.isOpen = false;
      this.cdr.detectChanges();
    }
    let fldId = id;
    this.formNo = (formNo == undefined || formNo === '') ? this.compData['STARTFORM'] : formNo;
    if (!title) {
      title = id;
    }
    this.minLength = minLength == undefined ? 3 : minLength;
    this.pophelpTitle = title;
    this.fieldName = fldName;
    this.filterValue = this.checkNull(fldVal).toUpperCase();
    let paramMap: any = {};
    this.objectName = this.compData['OBJ_NAME'];
    if (fldVal.length >= minLength && !this.isAutoSuggestDataFetch) 
    {
      paramMap["OBJ_NAME"] = this.compData['OBJ_NAME'];
      paramMap["ACTION"] = "AUTO_SEARCH_POPHELP";
      paramMap["FIELD_NAME"] = id;
      paramMap["SQL_INPUT"] = this.checkNull(sqlInput);
      paramMap["EDITOR_ID"] = this.compData['EDITOR_ID'];
      // paramMap["FORM_NO"] = this.formNo;
      paramMap["FORM_NO"] = this.compData['OBJ_CTX'];
      // paramMap["PARAMXML"] = this.buildParamXML(this.paramData);
      // paramMap["PARAMXML"] = this.createChgStr(this.fieldName, this.filterValue);
      if(this.transMode =='I')
      {
        if(this.compData['OBJ_CTX'] != '1')
        {
          // paramMap["ALLFORMVALUES"] = this.createCurrentChgStr(this.fieldName, this.filterValue);
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
        // if(this.compData['OBJ_CTX'] != '1')
        // {
        //   paramMap["PARAMXML"] = this.createCurrentChgStr(this.fieldName, this.filterValue);
        // }
        // else
        // {
        //   // console.log("autoSuggest paramXML ::: ")
        //   paramMap["PARAMXML"] = this.createChgStr(this.fieldName, this.filterValue);
        // }
      }
      paramMap["PKVLAUE"] = pkValue;
      paramMap["EDIT_FLAG"] = this.compData['EDIT_FLAG'];
      paramMap[fldId.toUpperCase()] = this.checkNull(fldVal);
      this.encodedParam = this.autoSuggestService.getEncodedParamString(paramMap);
      // CHECK IF api == TRUe thne call api from service getOpenPophelpDataFromAPI
      console.log('print this.callApiForSimpleLayout 138::::',this.callApiForSimpleLayout);
      if(this.callApiForSimpleLayout == true)
      {
        paramMap["PKVALUE"] = pkValue;
        paramMap["FIELD_NAME"] = fldName;
        this.dataSource = '/ibase/rest/VisionOBJService/autoSearchPophelp';
        this.domID = domID;
        this.index = index;
      }
      else
      {
        this.dataSource = "/ibase/RIAWizardHandlerServlet";
      }
      this.getData(this.filterValue, JSON.stringify(paramMap));
    }
    else
    {
      if(this.suggestFormattedData)
      {
        this.filteredOptions = this.suggestFormattedData.filter((data: any) => {
        return JSON.stringify(data).includes(this.filterValue);
        });
      }
      if (this.filteredOptions && this.filteredOptions.length > 0)
      {
        this.selectedIndex = 0;
      }
      this.calculateDropdownPosition();
      this.cdr.detectChanges();
    }
  }
  // getData(fieldValue: any) {
  //   this.autoSuggestService.getSuggestData(this.dataSource, this.encodedParam, this.fieldName).subscribe(
  //     (result: any) => {
  //       this.newResult = result;
  //       this.suggestFormattedData = this.autoSuggestService.transformData(this.newResult, this.isPophelp, this.displayMetadata);
  //       this.filteredOptions = this.suggestFormattedData.filter(data => {
  //         // console.log("print line no 89 filteredOptions",this.filteredOptions);
  //         return JSON.stringify(data).includes(fieldValue);
  //       });
  //     }
  //   );
  // }

  //Added by Tejas s On 18-Mar-2024 [Replace label values and replace '|' with '-']
  getData(fieldValue: any, paramMap?: any)
  {
    if(this.callApiForSimpleLayout == true)
    {
      console.log('print this.tokenID 175:::',this.tokenID);
      console.log('print this.jSessionId 176:::',this.jSessionId);
      this.autoSuggestService.tokenID = this.tokenID;
      this.autoSuggestService.jSessionId = this.jSessionId;
      this.autoSuggestService.callApiForSimpleLayout = this.callApiForSimpleLayout;
      this.autoSuggestService.getPophelpData(paramMap).subscribe({
        next: (result: any) => {
          console.log('print getData result 181:::::',result);
          this.newResult = JSON.parse(result);
          console.log('print getData this.newResult 183:::::',this.newResult);
          if (this.newResult && this.newResult.DETAILS)
          {
            this.isOpen = true;
            this.newResult.DETAILS.forEach((item: any) => {
              if (item.label) {
                item.label = item.label.replace(/\|/g, '-').replace(/-$/, '');
              }
            });
          }

          this.suggestFormattedData = this.autoSuggestService.transformData(this.newResult, this.isPophelp, this.displayMetadata);
          this.isAutoSuggestDataFetch = true;
          this.filteredOptions = this.suggestFormattedData.filter((data: any) => {
            return JSON.stringify(data).includes(fieldValue);
          });
          if (this.filteredOptions.length > 0)
          {
            this.selectedIndex = 0;
            this.calculateDropdownPosition();
            this.cdr.detectChanges();
          }
        },
        error: (err: any) => {
          console.error('autoSearchPophelp API error:', err);
          this.isOpen = false;
          this.isAutoSuggestDataFetch = false;
          this.cdr.detectChanges();
        }
      });
    }
    else
    {
      this.autoSuggestService.getSuggestData(this.dataSource, this.encodedParam, this.fieldName).subscribe({
        next: (result: any) => {
          console.log('print getData fieldValue:::::',fieldValue);
          this.newResult = result;
          console.log('print getData this.newResult:::::',this.newResult);
          if (this.newResult && this.newResult.DETAILS)
          {
            this.isOpen = true;
            this.newResult.DETAILS.forEach((item: any) => {
              if (item.label) {
                item.label = item.label.replace(/\|/g, '-').replace(/-$/, '');
              }
            });
          }

          this.suggestFormattedData = this.autoSuggestService.transformData(this.newResult, this.isPophelp, this.displayMetadata);
          this.isAutoSuggestDataFetch = true;
          this.filteredOptions = this.suggestFormattedData.filter((data: any) => {
            return JSON.stringify(data).includes(fieldValue);
          });
          if (this.filteredOptions.length > 0)
          {
            this.selectedIndex = 0;
            this.calculateDropdownPosition();
            this.cdr.detectChanges();
          }
        },
        error: (err: any) => {
          console.error('getSuggestData API error:', err);
          this.isOpen = false;
          this.isAutoSuggestDataFetch = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onSuggestionClick = (event: any) => {
    if (this.onChangeValue != undefined) 
    {
      event['FIELD_NAME'] = this.fieldName;
      event['FORM_NO'] = this.formNo;
      this.onChangeValue.emit(event);
    }
    this.isOpen = false;
    this.selectedIndex = -1;
    this.isAutoSuggestDataFetch = false;
    this.itemChangeUtil.objName = this.compData['OBJ_NAME'];
    this.itemChangeUtil.handleResponse = false;
    this.itemChangeUtil.callBackFunction = this.onItemChangeResponseReceived.bind(this);
    if( this.transMode == 'I')
    {
      let paramData = this.paramData;
      paramData[this.fieldName] = event.value;
      this.itemChangeUtil.setModel(paramData);
      this.itemChangeUtil.statelessItemChange(this.fieldName, this.compData['OBJ_CTX'], this.keyValue, event.value, this.compData['EDIT_FLAG'], this.formWiseFormatJson, this.compData['NO_OF_FORMS']);
    }
    else
    {
      console.log('print this.fieldName 217:::::',this.fieldName);
      console.log('print event 217:::::',event);
      console.log('print this.compData 217:::::',this.compData);
      
      if(this.callApiForSimpleLayout == true)
      {
        let itemChgData = {};
        itemChgData['FIELD_NAME'] = event.FIELD_NAME;
        itemChgData['FIELD_VALUE'] = event.value;
        itemChgData['FORM_NO'] = event.FORM_NO;
        itemChgData['DOM_ID'] = this.domID;
        itemChgData['INDEX'] = this.index;
        this.autoSuggestData.emit(itemChgData);
      }
      else
      {
        this.itemChangeUtil.stateFulItemChange(this.fieldName, event.value, this.compData['OBJ_CTX'], this.compData['EDITOR_ID'], this.createChgStr(this.fieldName, event.value), this.formWiseFormatJson, this.compData['dummyInt'],this.keyValue);
      }
    }
    //this.onItemChange(this.fieldName, event.value);
  }

  checkNull(value: any) {
    if (value == undefined || value == 'undefined' || value == null || value == 'null' || value == '') {
      value = "";
    }
    if (typeof value === 'object' && value instanceof Date && isNaN(value.getTime())) {
      return ''; // or any default value you want
    }
    // return typeof value == 'string' ? value.trim() : value;
    return value;
  }
  buildParamXML(param: any) {
    // console.log("<<in buildParamXML xml001>> ", param);
    let jsonData: any = {};
    jsonData = JSON.parse(param);
    let paramXML = `<` + this.detailNum + ` objContext="` + this.compData['OBJ_CTX']
      + `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + this.keyValue + `" dbID="" selected="Y">`;
    paramXML = paramXML + this.attributeTagg(jsonData['attribute']);
    // console.log("print line no 112 paramXML", paramXML);
    for (let key in jsonData) {
      let value = jsonData[key];
      let id = this.detailNum + '.' + this.keyValue + '.' + key;

      if (value instanceof Object) {
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
      if (this.checkIsDateFormat(key, this.formNo)) 
      {
        let fldValue = value;
        // value = "";
        if (fldValue) 
        {
          const date = new Date(fldValue);
          if(!isNaN(date.getTime()))
          {
            	if(fldValue.includes(':'))
            	{
                value = this.formatDate(fldValue);
	            } 
    	        else 
        	    {
					      return value = this.datePipe.transform(fldValue, 'dd/MM/yy');
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
  attributeTagg(attributeTagJson: any) {
    let attributeTagInXml = `<attribute IS_CHANGE="Y"`;
    if (attributeTagJson && JSON.stringify(attributeTagJson).includes('IS_CHANGE')) {
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
    }
    attributeTagInXml = attributeTagInXml + `/>`;
    return attributeTagInXml;
  }
  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (!this.overlayElem.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  onItemChange(columnName:any, columnValue:any) {
    // console.log('inside onItemChange line 522222', columnName, columnValue);
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
      paramString = this.autoSuggestService.getEncodedParamString(paramMap);
      let url = this.autoSuggestService.getHostURL() + '/ibase/E12EditorHandlerServlet';
      this.autoSuggestService.sendRequest(url, paramString, (data:any) => {
        this.autoSuggestService.setLoading(false);
        let callbackResp = data.split('%%SEP%%');
        data = callbackResp[0];
        let isError = callbackResp[1].trim();
        if (!(isError == 'true')) {
          this.onItemChangeResponseReceived(data);
          // let itemChangeData = JSON.parse(data);
          // console.log("print line no 200 itemChangeData",itemChangeData);
          // this.itemChangeValues.emit(itemChangeData);
        }
     });
  }

  onItemChangeResponseReceived(data: any)
  {
    if(data && typeof data === 'string' && data[0] === '{')
    {
      let itemChangeData = JSON.parse(data);
      this.itemChangeValues.emit(itemChangeData);
    }
  }

  createChgStr(columnName:any, columnValue:any) {
    // console.log("<<in createChgStr xml001>> [" + columnValue + "]");

    let headerData:any =
    {
      'objName': this.compData['OBJ_NAME'],
      'pageContext': '1',
      'objContext': this.compData['OBJ_CTX'],
      'editFlag': this.compData['EDIT_FLAG'],
      'focusedColumn': columnName,
      'elementName': '',
      'keyValue': this.keyValue,
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
    
    let finalXML = `<?xml version='1.0' encoding='utf-8'?>`
    finalXML = finalXML + '<Root>';
    let paramXML: any;
    if(this.transMode == 'I')
    {
      paramXML = this.getallFormXml(headerXML);
      finalXML = finalXML + paramXML;
    }
    else
    {
      // let jsonData = JSON.parse(this.paramData);
      // let jsonData = this.paramData;
      paramXML = `<` + this.detailNum + ` objContext="` + this.compData['OBJ_CTX']
      + `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + this.keyValue + `" dbID="" selected="Y">`;
      // paramXML = paramXML + this.attributeTag;
      let jsonData: any = {};
      if(this.paramData && typeof this.paramData === 'string')
      {
        this.paramData = this.paramData.trim();
        if (this.paramData.indexOf("{") == 0 ) 
        {
          jsonData = JSON.parse(this.paramData);
        }
      }
      else if (this.paramData instanceof Object) 
      {
        jsonData = this.paramData;
      }
      // console.log('Print jsonData 388::::: ', JSON.stringify(jsonData));
      if(jsonData)
      {
        paramXML = paramXML + this.attributeTagg(jsonData['attribute']);
        for (let key in jsonData) 
        {
          let value = jsonData[key];
          let id = this.detailNum + '.' + this.keyValue + '.' + key;
          if (value instanceof Object) 
          {
            if(value.content)
            {
              value = value.content
            }
          }
          value = this.checkNull(jsonData[key]);
            // value = "";
            if (value !== null && value !== undefined && value !== '') 
            {
              if (this.checkIsDateFormat(key, this.formNo))
              {
                let val = value.toString();
                const date = new Date(val);
                if(!isNaN(date.getTime()))
                {
                  if(val.includes(':'))
                  {
                    value = this.formatDate(value);
                  } 
                  else 
                  {
                    // return value = this.datePipe.transform(val, 'dd/MM/yy');
                    value = this.datePipe.transform(val, 'dd/MM/yy');
                  }
                }
              } 
              // else {
              //   value = "";
              // }  
            }
            // console.log('Print value 427::: ', value );
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

            if (value) {
              // console.log('Print value 441::: ', value );
              if (this.checkIsDateFormat(key, this.formNo)) 
              {
                let fldValue = value;
                if (!value.includes('/')) 
                {
                  // value = "";
                  if (fldValue) 
                  {
                    const date = new Date(fldValue);
                    // console.log('Print date 449::: ', date );
                    if(!isNaN(date.getTime()))
                    {
                        if(fldValue.includes(':'))
                        {
                          value = this.formatDate(fldValue);
                        } 
                        else 
                        {
                          // return value = this.datePipe.transform(fldValue, 'dd/MM/yy');
                          value = this.datePipe.transform(fldValue, 'dd/MM/yy');
                        }
                    }
                    if (value == null) 
                    {
                      value = "";
                    }
                  }
                }
                paramXML = paramXML + "<" + key + " id='" + this.detailNum + "_SEP1_" + this.keyValue + "_SEP1_" + key + "' protect='" + protectttValue + "'" + " visible='" + visbileValue + "'" + "><![CDATA[" + value + "]]></" + key + ">"
              }
            }
            if (key == columnName) {
              paramXML = paramXML + "<" + key + " id='" + this.detailNum + "_SEP1_" + this.keyValue + "_SEP1_" + key + "' protect='" + protectttValue + "'" + " visible='" + visbileValue + "'" + "><![CDATA[" + columnValue + "]]></" + key + ">"
            } 
            else 
            {
              if(value == null)
              {
                value = "";
              }
              paramXML = paramXML + "<" + key + " id='" + this.detailNum + "_SEP1_" + this.keyValue + "_SEP1_" + key + "' protect='" + protectttValue + "'" + " visible='" + visbileValue + "'" + "><![CDATA[" + value + "]]></" + key + ">"
            }
          // }
        }
        paramXML = paramXML + `</` + this.detailNum + `>`;
        finalXML = finalXML + headerXML + paramXML;
      }
    }
    finalXML = finalXML + '</Root>';
    // console.log('Print finalXML 467::: ', finalXML );
    return finalXML;
  }

  createCurrentChgStr(columnName:any, columnValue:any) {
    // console.log("<<in createCurrentChgStr xml001>> [" + columnValue + "]");
    let headerData:any =
    {
      'objName': this.compData['OBJ_NAME'],
      'pageContext': '1',
      'objContext': this.compData['OBJ_CTX'],
      'editFlag': this.compData['EDIT_FLAG'],
      'focusedColumn': columnName,
      'elementName': '',
      'keyValue': this.keyValue,
      'taxKeyValue': '',
      'saveLevel': '0',
      'forcedSave': 'false',
      'taxInFocus': 'false',
    }

    let headerXML = `<header>`;
    for (let key in headerData) {
      headerXML = headerXML + `<` + key + `><![CDATA[` + headerData[key] + `]]></` + key + `>`
    }
    headerXML = headerXML + `</header>`;
    let finalXML = "";
    // let finalXML = `<?xml version='1.0' encoding='utf-8'?>`
    // finalXML = finalXML + '<Root>';
    let paramXML: any;
    if(this.transMode == 'I')
    {
      finalXML = `<?xml version='1.0' encoding='utf-8'?>`
      finalXML = finalXML + '<Root>';
      paramXML = this.getallFormXml(headerXML);
      finalXML = finalXML + paramXML + '</Root>';
      // finalXML = finalXML + '</Root>';
    }
    else
    {
      // let jsonData = JSON.parse(this.paramData);
      let jsonData = this.paramData;
      // console.log('Print jsonData 510::: [' + JSON.stringify(jsonData) + ']');
      paramXML = `<` + this.detailNum + ` objContext="` + this.compData['OBJ_CTX']
        + `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + this.keyValue + `" dbID="" selected="Y">`;
      // paramXML = paramXML + this.attributeTag;
      if(jsonData)
      {
        paramXML = paramXML + this.attributeTagg(jsonData['attribute']);
        for (let key in jsonData) 
        {
          let value = jsonData[key];
          let id = this.detailNum + '.' + this.keyValue + '.' + key;
          if (value instanceof Object) {
            // value = "";
            if (this.checkIsDateFormat(key, this.formNo))
            {
              let val = value.toString();
              const date = new Date(val);
              if(!isNaN(date.getTime()))
              {
	                if(val.includes(':'))
                  {
                      value = this.formatDate(val);
	             	  } 
	                else 
    	            {
                   		return value = this.datePipe.transform(val, 'dd/MM/yy');
                  }
              }
            } 
            else {
              value = "";
            }  
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
  
          if (value) {
            if (this.checkIsDateFormat(key, this.formNo)) {
              let fldValue = value;
              if (!value.includes('/')) {
                // value = "";
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
                       		return value = this.datePipe.transform(fldValue, 'dd/MM/yy');
                      	}
                  }
                  if (value == null) {
                    value = "";
                  }
                }
              }
              paramXML = paramXML + "<" + key + " id='" + this.detailNum + "_SEP1_" + this.keyValue + "_SEP1_" + key + "' protect='" + protectttValue + "'" + " visible='" + visbileValue + "'" + "><![CDATA[" + value + "]]></" + key + ">"
            }
          }
          if (key == columnName) {
            paramXML = paramXML + "<" + key + " id='" + this.detailNum + "_SEP1_" + this.keyValue + "_SEP1_" + key + "' protect='" + protectttValue + "'" + " visible='" + visbileValue + "'" + "><![CDATA[" + columnValue + "]]></" + key + ">"
          }
        }
        paramXML = paramXML + `</` + this.detailNum + `>`;
        finalXML = finalXML + paramXML;
      }
    }    
    return finalXML;
  }

  getallFormXml(finalXml:any) 
	{
    // console.log('Print this.paramData 01042024::: ', JSON.stringify(this.paramData));
		let noOfForm = this.compData["NO_OF_FORMS"];
		for (let i = 0; i < noOfForm; i++) 
		{
			let formDetail = 'Detail' + (i + 1);
			if (formDetail == 'Detail1') 
			{
				let dbId = "";
				// console.log('Print allformvalues inside line 1237::: ', this.paramData['attribute']);
				let attributeTagJson = this.paramData['attribute'];

				let attributeTagInXml = `<attribute `;
				// console.log('Print 620:::::');
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
				let currentAllData = JSON.parse(JSON.stringify(this.paramData));
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

					if (value == null) 
					{
						value = "";
					}
          if(this.checkIsDateFormat(key, i+1))
          {
              let fldValue = value;
              // console.log("print line no 478 fldValue",fldValue);
              // value = "";
              try
              {
                if (fldValue) 
                {
                  const date = new Date(fldValue);
                  if(!isNaN(date.getTime()))
                  {
                    	if(fldValue.includes(':'))
                      	{
                          value = this.formatDate(fldValue);
                      	} 
                    	else 
                      	{
                       		return value = this.datePipe.transform(fldValue, 'dd/MM/yy');
                      	}
                  }
                  // console.log("print line no 484 value",value);
                }
              }
              catch(error)
              {
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
					let currentAllData = this.paramData[formDetail][j];
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
						if (value == null) 
						{
							value = "";
						}
            if(this.checkIsDateFormat(key, i+1))
            {
                let fldValue = value;
                // console.log("print line no 478 fldValue",fldValue);
                // value = "";
                try
                {
                  if (fldValue)  
                  {
                    const date = new Date(fldValue);
                    if(!isNaN(date.getTime()))
                    {
                      	if(fldValue.includes(':'))
                        {
                            value = this.formatDate(fldValue);
                        } 
                      	else 
                        {
                         	return value = this.datePipe.transform(fldValue, 'dd/MM/yy');
                        }
                    }
                    // console.log("print line no 484 value",value);
                  }
                }
                catch(error)
                {
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
  

  onMouseOver(event: any, index?: number)
  {
    this.hoverIndex = index;
    // window.addEventListener('mousewheel', (_event) => {
      // Handle the event or dispatch an event to subscribers
      let preventItemChangeJSON: any = {};
      preventItemChangeJSON['preventItemChange'] = true;
      this.preventItemChange.emit(JSON.stringify(preventItemChangeJSON));
    // }, { passive: true });
  }

  onMouseOut(event: any)
  {
      this.hoverIndex = null;
      if (this.isOpen) {
        let preventItemChangeJSON: any = {};
        preventItemChangeJSON['preventItemChange'] = false;
        this.preventItemChange.emit(JSON.stringify(preventItemChangeJSON));
      }
  }

  handleUpDownKeyEvent(event: KeyboardEvent): void
  {
      if (event.key === 'ArrowDown')
      {
        event.preventDefault();
        event.stopPropagation();
        if (this.filteredOptions && this.filteredOptions.length > 0)
        {
          if (this.selectedIndex < this.filteredOptions.length - 1)
          {
            this.selectedIndex += 1;
          }
          else
          {
            this.selectedIndex = 0;
          }
          this.cdr.detectChanges();
          let suggestionList = this.overlayElem.nativeElement.querySelector('.suggestions') as HTMLElement;
          this.scrollToSelectedItem(suggestionList);
        }
      }
      else if (event.key === 'ArrowUp')
      {
        event.preventDefault();
        event.stopPropagation();
        if (this.filteredOptions && this.filteredOptions.length > 0)
        {
          if (this.selectedIndex > 0)
          {
            this.selectedIndex -= 1;
          }
          else
          {
            this.selectedIndex = this.filteredOptions.length - 1;
          }
          this.cdr.detectChanges();
          let suggestionList = this.overlayElem.nativeElement.querySelector('.suggestions') as HTMLElement;
          this.scrollToSelectedItem(suggestionList);
        }
      }
      else if (event.key === 'Enter')
      {
        event.preventDefault();
        event.stopPropagation();
        this.selectItem();
      }
      else if (event.key === 'Tab')
      {
        this.selectItem();
      }
  }

  selectItem(): void
  {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredOptions.length)
    {
      // this.onChangeValue.emit(selectedItem);
      this.onSuggestionClick(this.filteredOptions[this.selectedIndex]);
      this.isOpen = false;
      this.selectedIndex = -1;
      this.cdr.detectChanges();
      let preventEnterKeyItemChange: any = {};
      preventEnterKeyItemChange['preventEnterKeyItemChange'] = true;
      this.preventEnterKeyItemChange.emit(JSON.stringify(preventEnterKeyItemChange));
    }
  }

  scrollToSelectedItem(suggestionList: HTMLElement): void
  {
    if(suggestionList && this.selectedIndex >= 0)
    {
      const items = suggestionList.querySelectorAll('li');
      const selectedItem = items[this.selectedIndex] as HTMLElement;
      if (selectedItem)
      {
        const listRect = suggestionList.getBoundingClientRect();
        const itemRect = selectedItem.getBoundingClientRect();
        if (itemRect.bottom > listRect.bottom)
        {
          suggestionList.scrollTop += (itemRect.bottom - listRect.bottom);
        }
        else if (itemRect.top < listRect.top)
        {
          suggestionList.scrollTop -= (listRect.top - itemRect.top);
        }
      }
    }
  }

  checkIsDateFormat(key: any, formNo: any): boolean
	{
		const form = this.formWiseFormatJson[formNo];
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

  formatDate(dateVal: string | Date): string
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

  ngAfterViewInit() {
    document.addEventListener('touchstart', this.onMouseOver, { passive: true });
    document.addEventListener('touchmove', this.onMouseOut, { passive: true });
  }
}
