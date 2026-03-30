import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { OverlayConfig, Overlay } from '@angular/cdk/overlay';
import { SellPlanningService } from './open-pophelp.service';
import { AngPophelpComponent } from '../ang-pophelp/ang-pophelp.component';
import { TemplatePortal } from '@angular/cdk/portal';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../extract-template/date.adapter';
import { DatePipe } from '@angular/common';
import { ExtractTemplateService } from '../extract-template/extract-template.service'

@Component({
  selector: 'open-pophelp',
  templateUrl: './open-pophelp.component.html',
  styleUrls: ['./open-pophelp.component.css'],
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
export class popHelpComponent implements OnInit, OnDestroy {
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
  allformValues = {};
  parser!: DOMParser;
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
  dateFeildArray: any = [];

  @ViewChild('portal', { read: TemplateRef }) _templatePortal!: TemplateRef<any>;
  @ViewChild(AngPophelpComponent) Pophelp!: AngPophelpComponent;
  constructor(public _openPpohelpService: SellPlanningService, public overlay: Overlay,
    private viewContainerRef: ViewContainerRef, public datePipe: DatePipe,
    public _extractTempletService: ExtractTemplateService) { }

  ngOnInit() {
    console.log(' ##  inside onInit method  ## ');
    //shrutika changes 05-05-2020 remove code
  }

  ngOnDestroy() {
    console.log(' ##  inside ngOnDestroy method  ## ');

  }

  openSuggest(id:any, fldVal:any, sqlInput:any, pkValue:any, title?:any, formNo?:any) {

    console.log('Inside openSuggest with 5 parmaters', this.compData['OBJ_NAME']);
    var fldId = id;
    //Added by Jatin M on 21-06-2023 [For issues related to pophelp in simple editor screen] - START
    this.formNo = formNo == undefined ? this.compData['STARTFORM'] : formNo;
    if(!title)
	  {
		  title = id;
	  }
    this.pophelpTitle = title;
    this.fieldName = id;
    this.filterValue = this.checkNull(fldVal);
    var paramMap:any = {};
    var paramString = "";
    // this.refId = id;
    this.objectName = this.compData['OBJ_NAME'];
    paramMap["OBJ_NAME"] = this.compData['OBJ_NAME'];
    paramMap["ACTION"] = "AUTO_SEARCH_POPHELP";
    paramMap["FIELD_NAME"] = this.fieldName;
    paramMap["SQL_INPUT"] = this.checkNull(sqlInput);
    paramMap["EDITOR_ID"] = this.compData['EDITOR_ID'];
    paramMap["FORM_NO"] = this.formNo;
    paramMap["PARAMXML"] = this.buildParamXML(this.paramData);
    paramMap["PKVLAUE"] = pkValue;
    paramMap["EDIT_FLAG"] = this.compData['EDIT_FLAG'];
    paramMap[fldId.toUpperCase()] = this.checkNull(fldVal);
    //Added by Jatin M on 21-06-2023 [For issues related to pophelp in simple editor screen] - END
    this.encodedParam = this._openPpohelpService.getEncodedParamString(paramMap);
    this.dataSource = "/ibase/RIAWizardHandlerServlet";
    setTimeout(() => this.createOverlay(), 200);
  }

  createOverlay() {
    var config = new OverlayConfig();

    var width = this.positionObj['width'];
    var top = this.positionObj['top'];
    var height = this.positionObj['height'];
    var left = this.positionObj['left'];

    config.hasBackdrop = true;
    config.positionStrategy = this.overlay.position()
      .global()
      .centerHorizontally()
      .width(width + 'px')
      .right('-64px')
      //.left(left + 'px')
      .top(top + 'px')
      .height(height + 'px');
    const templatePortal = new TemplatePortal(
      this._templatePortal,
      this.viewContainerRef
    );

    this.overlayRef = this.overlay.create(config);
    this.overlayRef.attach(templatePortal);
  }
  buildParamXML(param:any) {
    console.log("<<in buildParamXML xml001>> ", param);
    var jsonData:any = {};
    jsonData = JSON.parse(param);
    var paramXML = `<` + this.detailNum + ` objContext="` + this.compData['OBJ_CTX']
      + `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + this.keyValue + `" dbID="" selected="Y">`;
    // paramXML = paramXML + this.attributeTag;
    paramXML = paramXML + this.attributeTagg(jsonData['attribute']);
    for (var key in jsonData) {
      var value = jsonData[key];
      var id = this.detailNum + '.' + this.keyValue + '.' + key;

      if (value instanceof Object) {
        value = "";
      }
      var rowNum = this.keyValue - 1;
      var detailAttribyteKey = key + '_' + rowNum;
      var protectttValue = "";

      protectttValue = this.protectAttribParams[id];
      if (protectttValue == undefined) {
        protectttValue = "";
      }
      var visbileValue = "";
      visbileValue = this.visibleAttribParams[id];
      if (visbileValue == undefined) {
        visbileValue = "";
      }
      // if (this.dateFeildArray.includes(id)) {
        if (this.dateFeildArray.includes(id)) {
        let fldName = key;
        let fldValue = value;
        value = "";
        if (fldValue != null ) {
          value = this.datePipe.transform(fldValue, 'dd/MM/yy');
        }
        paramXML = paramXML + "<" + key + " id='" + this.detailNum + "_SEP1_" + this.keyValue + "_SEP1_" + key + "' protect='" + protectttValue + "'" + " visible='" + visbileValue + "'" + "><![CDATA[" + value + "]]></" + key + ">";
      }
      else {
        paramXML = paramXML + "<" + key + " id='" + this.detailNum + "_SEP1_" + this.keyValue + "_SEP1_" + key + "' protect='" + protectttValue + "'" + " visible='" + visbileValue + "'" + "><![CDATA[" + value + "]]></" + key + ">";
      }
    }
    paramXML = paramXML + `</` + this.detailNum + `>`;
    console.log("buildParamXML 001>>....[" + paramXML);
    return paramXML;
  }

  onSelectionChange(event:any) {
    console.log('on change selection event', event, event.value);
    this.pophelpSelectedvalue = event.value;
  }
  onPophelpCancel() {
    console.log('Inside 185 onCancelClick.........');
    this.pophelpSelectedvalue = "";
    setTimeout(() => 
    {
      if (this.overlayRef) {
          this.overlayRef.dispose();
          this.overlayRef = null;
      }
    }, 50);
  }

  attributeTagg(attributeTagJson:any) {
    var attributeTagInXml = `<attribute IS_CHANGE="Y"`;
    if( JSON.stringify(attributeTagJson).includes('IS_CHANGE'))
    {
      attributeTagInXml = `<attribute `;
    }
    if(attributeTagJson && typeof attributeTagJson === 'string')
    {
      attributeTagJson = JSON.parse(attributeTagJson);
    }	
    for (const key of Object.keys(attributeTagJson)) {
      attributeTagInXml = attributeTagInXml + ` ` + key + `="` + attributeTagJson[key] + `"`;
    }
    attributeTagInXml = attributeTagInXml + `/>`;
    console.log('Print attributeTagInXml inside attributeTagg method::: ', attributeTagInXml);
    return attributeTagInXml;
  }

  onDone() {
    try {
	//Added by Jatin M on 21-06-2023 [For issues related to pophelp in simple editor screen] - START
      this.pophelpFieldValue[this.fieldName] = this.pophelpSelectedvalue;
      this.itemChangeFieldValue[this.fieldName] = this.checkNull(this.pophelpSelectedvalue);
      this.valueSelected.emit(JSON.stringify(this.itemChangeFieldValue));
      this.onItemChange(this.fieldName, this.pophelpSelectedvalue);
      //Added by Jatin M on 21-06-2023 [For issues related to pophelp in simple editor screen] - END
      this.itemChangeFieldValue = {};

    }
    catch (error) {
      console.log('Error in onDone', error);

    }
    this.overlayRef.dispose();
  }

  checkNull(value:any) {
    if (value == undefined || value == null) {
      value = "";
    }
    return typeof value == 'string' ? value.trim() : value;
  }


  onItemChange(columnName:any, columnValue:any) {
    console.log('inside onItemChange line 522222', columnName, columnValue);
    //Added by Jatin M on 21-06-2023 [For issues related to pophelp in simple editor screen] - START
    if (!(columnValue instanceof Object) && (""+columnValue).trim() != this.pophelpSelectedvalue.trim()) {
      this.pophelpSelectedvalue = ""+columnValue;
    }
    //Added by Jatin M on 21-06-2023 [For issues related to pophelp in simple editor screen] - END
    console.log('Print itemchnagelist arry in onitemchange method:: ', this.itemChangeList);
    // if (this.itemChangeList.includes(columnName)) {
      if (this.itemChangeList.includes(columnName)) {
      var paramMap:any = {};
      var paramString = "";
      paramMap["OBJ_NAME"] = this.compData['OBJ_NAME'];
      paramMap["ACTION"] = "ITEM_CHANGE";
      paramMap["OBJ_CTX"] = this.compData['OBJ_CTX'];
      paramMap["PAGE_CTX"] = "2";
      paramMap["EDITOR_ID"] = this.compData['EDITOR_ID'];
      paramMap["RTEURN_TYPE"] = "Json";
      paramMap["CHG_STR"] = this.createChgStr(columnName, columnValue);
      paramMap["FIELD_NAME"] = columnName;
      paramMap["dummyInt"] = this.compData['dummyInt'];
      paramString = this._extractTempletService.getEncodedParamString(paramMap);
      var url = this._extractTempletService.getHostURL() + '/ibase/E12EditorHandlerServlet';
      this._extractTempletService.sendRequest(url, paramString, (data:any) => {
        this._extractTempletService.setLoading(false);
        var callbackResp = data.split('%%SEP%%');
        data = callbackResp[0];
        var isError = callbackResp[1].trim();
        console.log('inside onItemChange.......165[' + data);
        console.log('Print isError on reponse of item change::: ', isError);
        if (!(isError == 'true')) {
          this.itemChangeData = JSON.parse(data);
          if (data.Root) {
            console.log('inside onItemChange.......172[', data.Root);

          }
          this.itemChangeFieldValue[this.fieldName] = this.checkNull(this.pophelpSelectedvalue); //Added by Jatin M on 21-06-2023 [For issues related to pophelp in simple editor screen]
          this.itemChangeValues.emit(data);
          this.pophelpSelectedvalue = "";
          this.itemChangeFieldValue = {};
        }
      }
      );
    }
    // }
  }


  createChgStr(columnName:any, columnValue:any) {
    console.log("<<in createChgStr xml001>> [" + columnValue + "]");

    var headerData:any =
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

    var headerXML = `<header>`;
    for (var key in headerData) {
      headerXML = headerXML + `<` + key + `><![CDATA[` + headerData[key] + `]]></` + key + `>`
    }
    headerXML = headerXML + `</header>`;
    var jsonData = JSON.parse(this.paramData);
    console.log('Print jsonFData::: [' + JSON.stringify(jsonData) + ']');
    var paramXML = `<` + this.detailNum + ` objContext="` + this.compData['OBJ_CTX']
      + `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + this.keyValue + `" dbID="" selected="Y">`;
    // paramXML = paramXML + this.attributeTag;
    paramXML = paramXML + this.attributeTagg(jsonData['attribute']);
    for (var key in jsonData) {
      var value = jsonData[key];
      var id = this.detailNum + '.' + this.keyValue + '.' + key;
      if (value instanceof Object) {
        value = "";
      }
      var rowNum = this.keyValue - 1;
      var detailAttribyteKey = key + '_' + rowNum;
      var protectttValue = "";
      protectttValue = this.protectAttribParams[id];
      if (protectttValue == undefined) {
        protectttValue = "";
      }
      var visbileValue = "";
      visbileValue = this.visibleAttribParams[id];
      if (visbileValue == undefined) {
        visbileValue = "";
      }

      // if (this.dateFeildArray.includes(id)) {
        if (this.dateFeildArray.includes(id)) {
        let fldName = key;
        let fldValue = value;
        value = "";
        if (fldValue != null) {
          value = this.datePipe.transform(fldValue, 'dd/MM/yy');
        }
        paramXML = paramXML + "<" + key + " id='" + this.detailNum + "_SEP1_" + this.keyValue + "_SEP1_" + key + "' protect='" + protectttValue + "'" + " visible='" + visbileValue + "'" + "><![CDATA[" + value + "]]></" + key + ">"
      }
      else if (key == columnName) {
        paramXML = paramXML + "<" + key + " id='" + this.detailNum + "_SEP1_" + this.keyValue + "_SEP1_" + key + "' protect='" + protectttValue + "'" + " visible='" + visbileValue + "'" + "><![CDATA[" + columnValue + "]]></" + key + ">"
      } else {
        paramXML = paramXML + "<" + key + " id='" + this.detailNum + "_SEP1_" + this.keyValue + "_SEP1_" + key + "' protect='" + protectttValue + "'" + " visible='" + visbileValue + "'" + "><![CDATA[" + value + "]]></" + key + ">"
      }
    }
    paramXML = paramXML + `</` + this.detailNum + `>`;


    var finalXML = `<?xml version='1.0' encoding='utf-8'?>`
    finalXML = finalXML + '<Root>';
    finalXML = finalXML + headerXML + paramXML;
    finalXML = finalXML + '</Root>';
    console.log("buildParamXML 001>>" + paramXML);
    console.log("buildParamXML 002..." + finalXML);
    return finalXML;
  }
}