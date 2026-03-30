import { Component, OnInit, ViewChild, Input, Output, EventEmitter,AfterViewInit } from '@angular/core';
import { ExtractTemplateService } from '../extract-template/extract-template.service';
import { TaxDetailsService } from './tax-details.service';
import { BBProgressSpinnerComponent } from 'base-blocks';


@Component({
  selector: 'tax-details',
  templateUrl: './tax-details.component.html',
  styleUrls: ['./tax-details.component.css']
})
export class TaxDetailsComponent implements OnInit {

  @Input() popHelpFieldList: any = [];
  originalValue: number;
  lineNumTaxList: any = [];
  lineNumber: any;
  lineNumTax: any;
  
  alltaxFormValues:any = {};
  @Input() allformValues: any[] = [];
  @Input() cuurentValidationRow:any = [];
  @Input() editFlag = "";
  @Input() compData:any = "";
  @Input() taxResponseData = "";
  @Input('formNo') formNo: any;
  @Input('currentRecordDomId') currentRecordDomId:any;
  domId : number = 0;
  taxDomId = "";
  taxEnvDescr : string = "";
  currentDetail: any = "";
  recalculateOnTax: boolean = false;
  @Output() closeTax: EventEmitter<any> = new EventEmitter();
  @Output() callItemchangeFormTax: EventEmitter<any> = new EventEmitter();
  @Output() openPophelpFromTaxSceen: EventEmitter<any> = new EventEmitter();
  @Output() setSelectedTextfromTax: EventEmitter<any> = new EventEmitter();
  @Output() applyTaxScreen: EventEmitter<any> = new EventEmitter();
  @ViewChild('bbSpinner') bbSpinner: BBProgressSpinnerComponent | any;
  isFeedOpen:boolean = false;
  expandedRowIndex: number = 0;
  currentTaxDetails: any = {};
  @Output() taxItemChange: EventEmitter<any> = new EventEmitter();

  constructor( public _extractTempletService: ExtractTemplateService, public taxDetailService: TaxDetailsService ) 
  { 

  }

  ngOnInit() {
    this.lineNumTaxList = [];
    let tempDomId = Number(this.currentRecordDomId)
    this.currentRecordDomId = tempDomId;
    console.log('PRINT LINE NO 42 currentRecordDomId]]]]]]:::',this.currentRecordDomId);
    console.log('inside oninit.......18',this.popHelpFieldList);
    console.log('inside oninit.......19',this.editFlag);
    this.currentDetail ='Detail'+this.formNo;
    console.log('currentDetail before assignment:', this.currentDetail);
    console.log("line no 42 allformValues", this.allformValues);


    if(this.cuurentValidationRow && this.cuurentValidationRow.length > 0 )
    {
      var str = this.cuurentValidationRow[0].split('_');
      console.log('inside oninit.......26',str[0]);
      console.log('inside oninit.......27',str[1]);
      this.formNo = str[0];
      this.domId = Number( str[1]);
      this.currentDetail ='Detail'+this.formNo;
    }
    let jsonResultData:any = {} = this.taxResponseData;
    console.log('inside oninit.......28',jsonResultData);
    if(jsonResultData)
    {
      jsonResultData = {} = JSON.parse(jsonResultData);
      console.log("line no 53 jsonResultData", jsonResultData);
      if (jsonResultData && jsonResultData[this.currentDetail]) 
      {
        console.log("line no 56 jsonResultData", jsonResultData instanceof Array);
        console.log("line no 57 currentDetail",jsonResultData[this.currentDetail]);
        if(jsonResultData instanceof Array) 
        {
          console.log("line no 63 currentDetail",jsonResultData);
          for( var i=0; i<jsonResultData[this.currentDetail].length; i++ )
          {
            if(this.currentRecordDomId == jsonResultData[this.currentDetail][i]['domID'])
            {
              var detailArray:any = [];
              if(!jsonResultData[this.currentDetail][i]['Taxes'] || !jsonResultData[this.currentDetail][i]['Taxes']['Tax']) {
                continue;
              }
              var detailLen = jsonResultData[this.currentDetail][i]['Taxes']['Tax'].length;
              console.log("line no 68 currentDetail",detailLen);
              var detailJsonData:any = {};
              for (var j = 0; j < detailLen; j++)
              {
                detailJsonData = jsonResultData[this.currentDetail][i]['Taxes']['Tax'][j];
                for (const key of Object.keys(detailJsonData)) 
                {
                    var value = detailJsonData[key];
                    if (key != 'attribute' && value instanceof Object) 
                    {
                      if (detailJsonData[key] && (detailJsonData[key].content || detailJsonData[key].content == 0)) 
                      {
                        value = detailJsonData[key].content;
                      }
                      else 
                      {
                        value = "";
                      }
                    }
                    detailJsonData[key] = value;
                }
                detailArray.push(detailJsonData);
              }
              this.alltaxFormValues['Taxes_'+(i+1)] = detailArray;
              console.log("line no 94 currentDetail",this.alltaxFormValues);
            }
          }
        }
        else if(jsonResultData[this.currentDetail] instanceof Array)
        {
          console.log('PRINT LINE NO 90 ]]]]]]:::',jsonResultData);
          for(let i=0;i<jsonResultData[this.currentDetail].length;i++)
          {
            if(this.currentRecordDomId == jsonResultData[this.currentDetail][i]['domID'])
            {
              var detailArray:any = [];
              if(!jsonResultData[this.currentDetail][i]['Taxes'] || !jsonResultData[this.currentDetail][i]['Taxes']['Tax']) {
                continue;
              }
              var detailLen = jsonResultData[this.currentDetail][i]['Taxes']['Tax'].length;
              var detailJsonData:any = {};
              for (var j = 0; j < detailLen; j++)
              {
                detailJsonData = jsonResultData[this.currentDetail][i]['Taxes']['Tax'][j];
                for (const key of Object.keys(detailJsonData)) 
                {
                    var value = detailJsonData[key];
                    if (key != 'attribute' && value instanceof Object) 
                    {
                      if (detailJsonData[key] && (detailJsonData[key].content || detailJsonData[key].content == 0)) 
                      {
                        value = detailJsonData[key].content;
                      }
                      else 
                      {
                        value = "";
                      }
                    }
                    detailJsonData[key] = value;
                }
                detailArray.push(detailJsonData);
              }
              this.alltaxFormValues['Taxes_'+this.domId] = detailArray;
              console.log('inside tax details.........52',this.alltaxFormValues);
            }
          }
        }
        else
        {
          console.log('PRINT LINE NO 155:::',jsonResultData[this.currentDetail]);
          if(this.currentRecordDomId == jsonResultData[this.currentDetail]['domID'])
          {
            var detailArray:any = [];
            if(!jsonResultData[this.currentDetail]['Taxes'] || !jsonResultData[this.currentDetail]['Taxes']['Tax']) {
              return;
            }
            var detailLen = jsonResultData[this.currentDetail]['Taxes']['Tax'].length;
            var detailJsonData:any = {};
            for (var j = 0; j < detailLen; j++) 
            {
              detailJsonData = jsonResultData[this.currentDetail]['Taxes']['Tax'][j];
              for (const key of Object.keys(detailJsonData)) 
              {
                  var value = detailJsonData[key];
                  if (key != 'attribute' && value instanceof Object) 
                  {
                    if (detailJsonData[key] && (detailJsonData[key].content || detailJsonData[key].content == 0)) 
                    {
                      value = detailJsonData[key].content;
                    }
                    else 
                    {
                      value = "";
                    }
                  }
                  detailJsonData[key] = value;
              }
              detailArray.push(detailJsonData);
            }
            this.alltaxFormValues['Taxes_'+this.domId] = detailArray;
            console.log('inside tax details.........52',this.alltaxFormValues);
          }
        }
      }
    }
    var prefName = "RECALCULATE_TAX_"+this.formNo;
    this.getUserPref( prefName );
  }

  toggleFeed( index:any )
  {
      try
      {
        console.log('inside toggleFeed..........86',index);
        var isFeedOpen: boolean = false;
        this.taxDomId = index;
        var feedDiv = document.getElementById("taxFeedDiv"+index);
        var dataDiv = document.getElementById("taxDataDiv"+index);
        var resetDiv = document.getElementById("refreshImg"+index);
        var totalCnt = this.alltaxFormValues['Taxes_'+this.domId].length;
        for(var i=1;i<=totalCnt; i++ )
        {
            var tempDataDiv = document.getElementById("taxDataDiv"+i);
            if (tempDataDiv != null && tempDataDiv.classList.contains('displayBlock'))
            {
                isFeedOpen = true;
            }
        }
        if (feedDiv != null && feedDiv.classList.contains('displayBlock'))
        {
          feedDiv.classList.remove('displayBlock');
          feedDiv.classList.add('displayNone');
          dataDiv?.classList.remove('displayNone');
          dataDiv?.classList.add('displayBlock');

          resetDiv?.classList.remove('displayNone');
          resetDiv?.classList.add('displayBlock');
        }
        else
        {
          if (dataDiv != null && dataDiv.classList.contains('displayBlock'))
          {
            dataDiv.classList.remove('displayBlock');
            dataDiv.classList.add('displayNone');
            feedDiv?.classList.remove('displayNone');
            feedDiv?.classList.add('displayBlock');

            resetDiv?.classList.remove('displayBlock');
            resetDiv?.classList.add('displayNone');
          }
        }
        for(var i=1;i<=totalCnt; i++ )
        {
          if( i != index )
          {
            var dataDiv = document.getElementById("taxDataDiv"+i);
            var feedDiv = document.getElementById("taxFeedDiv"+i);
            var resetDiv = document.getElementById("refreshImg"+i);
            if (dataDiv != null && dataDiv.classList.contains('displayBlock'))
            {
              dataDiv.classList.remove('displayBlock');
              dataDiv.classList.add('displayNone');
              feedDiv?.classList.remove('displayNone');
              feedDiv?.classList.add('displayBlock');
            }
            if( resetDiv != null && resetDiv.classList.contains('displayBlock') )
            {
              resetDiv.classList.remove('displayBlock');
              resetDiv.classList.add('displayNone');
            }
          }
        }
    }
    catch
    {
      console.log('Error while save trasaction......');
    }
  }

  openPopHelp(fldName:any, fldValue:any, formNo:any, detailRowNo?:any) 
  {
    console.log('inside tax detail openPophelp',fldName);
    console.log('inside tax detail fldValue',fldValue);
    console.log('inside tax detail formNo',formNo);
    let pophelpData:any = {} ;
    pophelpData['fldName'] = fldName;
    pophelpData['fldValue'] = fldValue;
    pophelpData['formNo'] = formNo;
    // pophelpData['detailRowNo'] = (this.domId - 1);
    pophelpData['detailRowNo'] = this.currentRecordDomId - 1;
    pophelpData['title'] = fldValue;
    this.openPophelpFromTaxSceen.emit(JSON.stringify(pophelpData));

  }
  callLocalItemChange(fldName:any, fldValue:any, formNo:any, detailRowNo?:any) 
  {
      console.log('inside tax detail.........216');
       let formData:any = {} ;
       formData['fldName'] = fldName;
       formData['fldValue'] = fldValue;
       formData['formNo'] = formNo;
       formData['detailRowNo'] = (this.domId - 1);
       this.callItemchangeFormTax.emit(JSON.stringify(formData));
       console.log('inside tax detail.........222');
  }
  setSelectedText(id:any) 
  {      
      console.log('inside tax detail.........227');
      this.setSelectedTextfromTax.emit(id);
  }
  setFocusFormNo(cuurrentFormNo:any) 
  {
      console.log('inside tax detail.........235');
  }

  onRecalculate(event:any) 
  {
    if (event.target.checked) 
    {
      this.recalculateOnTax = true;
    }
    else
    {
      this.recalculateOnTax = false;
    }
    var prefName = "RECALCULATE_TAX_"+this.formNo;
    this.setUserPref(this.recalculateOnTax,prefName);

  }
  calculateTax()
  {
    var dbId = ""
    var finalXml = "<Root>";
    finalXml = finalXml + "<header>";
    finalXml = finalXml + "<objName><![CDATA["+this.compData["OBJ_NAME"]+"]]></objName>";
    finalXml = finalXml + "<pageContext><![CDATA[2]]></pageContext>";
    finalXml = finalXml + "<objContext><![CDATA["+this.formNo+"]]></objContext>";
    finalXml = finalXml + "<editFlag><![CDATA["+this.editFlag+"]]></editFlag>";
    finalXml = finalXml + "<focusedColumn><![CDATA[tax_perc]]></focusedColumn>";
    finalXml = finalXml + "<elementName><![CDATA[]]></elementName>";
    finalXml = finalXml + "<keyValue><![CDATA["+this.currentRecordDomId+"]]></keyValue>";
    finalXml = finalXml + "<taxKeyValue><![CDATA["+this.lineNumTax+"]]></taxKeyValue>";
    finalXml = finalXml + "<saveLevel><![CDATA[0]]></saveLevel>";
    finalXml = finalXml + "<forcedSave><![CDATA[false]]></forcedSave>";
    finalXml = finalXml + "<taxInFocus><![CDATA[true]]></taxInFocus>";
    finalXml = finalXml + "<forcedconfirm><![CDATA[false]]></forcedconfirm>";
    finalXml = finalXml + "<isSaveNConitinue><![CDATA[false]]></isSaveNConitinue>";
    finalXml = finalXml + "</header>";

    var length = this.alltaxFormValues['Taxes_'+this.domId].length;
    console.log('PRINT LINE NO 369 this.alltaxFormValues::::',this.alltaxFormValues['Taxes_'+this.domId]);
    for(var i=0; i<length; i++ )
    {
      // if(this.lineNumTaxList == this.alltaxFormValues['Taxes_'+this.domId][i]['line_no__tax'])
      // {
      if(this.lineNumTaxList.includes(this.alltaxFormValues['Taxes_' + this.domId][i]['line_no__tax'])) 
      {
        var deatilXml = `<`+this.currentDetail+ ` domID="` + (i+1) + `" dbID="` + dbId + `">`
        var currentAllData  = this.alltaxFormValues['Taxes_'+this.domId][i];
        var jsonData:any = {};
        jsonData = JSON.parse(JSON.stringify(currentAllData));
        var attributeTagJson = this.alltaxFormValues['Taxes_'+this.domId][i]['attribute'];
        var attributeTagInXml = `<attribute IS_CHANGE="Y"`;
        if (JSON.stringify(attributeTagJson).includes('IS_CHANGE')) 
        {
            attributeTagInXml = `<attribute `;
        }
        for (var key of Object.keys(attributeTagJson)) 
        {
          attributeTagInXml = attributeTagInXml + ` ` + key + `="` + attributeTagJson[key] + `"`;
        }
        attributeTagInXml = attributeTagInXml + `/>`;
        deatilXml = deatilXml + attributeTagInXml;
        for (var key in jsonData) 
        {
          var value = jsonData[key];
          if (value instanceof Object) 
          {
            value = "";
          }
          if (value == "null") 
          {
            value = "";
          }
          else if (key != "attribute") 
          {
            deatilXml = deatilXml + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
          }
          
        }
        deatilXml = deatilXml + `</`+this.currentDetail+`>`;
        finalXml = finalXml + deatilXml;
        console.log('PRINT LINE NO 385 finalXml::::',finalXml);
      }
    }
    var finalXml = finalXml + "</Root>";
    var tmpData:any = {};
     
      tmpData["OBJ_NAME"] = this.compData["OBJ_NAME"];
      tmpData["OBJ_CTX"] = this.formNo;
      tmpData["OBJ_CTX"] = "2";
      tmpData["ACTION"] = "ITEM_CHANGE";
      tmpData["CHG_STR"] = finalXml;
      tmpData["FIELD_NAME"] = "tax_perc";
      tmpData["EDITOR_ID"] =  this.compData["EDITOR_ID"];
      tmpData["dummyInt"] = this.compData["dummyInt"];
      tmpData['RTEURN_TYPE'] = "json"

      var paramString = this._extractTempletService.getEncodedParamString(tmpData);
      var url = this._extractTempletService.getHostURL() + '/ibase/WebITMRequestHandlerServlet';

      this.setLoading(true);
      this._extractTempletService.sendRequest(url, paramString, (taxResponaseData:any) => {
        this.setLoading(false);
        var callbackRespNew = taxResponaseData.split('%%SEP%%');
        taxResponaseData = callbackRespNew[0];
        var isError = callbackRespNew[1].trim();
        if (!(isError == 'true')) 
				{
          var taxData = {} = JSON.parse(taxResponaseData);
          if (taxData && taxData.Root) 
					{
						if (taxData.Root[this.currentDetail]['Taxes'] != null) 
						{
              var responseLen = taxData.Root[this.currentDetail]['Taxes']['Tax'].length;
              for(var i=0;i<responseLen;i++ )
              {
                var currentAllData  = taxData.Root[this.currentDetail]['Taxes']['Tax'][i];
                var jsonData:any = {};
                jsonData = JSON.parse(JSON.stringify(currentAllData));
                for (var key in jsonData) 
                  {
                    var value = jsonData[key];
                    if (value instanceof Object) 
                    {
                      value = "";
                    }
                    if (value == "null") 
                    {
                      value = "";
                    }
                    
                    else if (key != "attribute") 
                    {
                      this.alltaxFormValues['Taxes_'+this.domId][i][key] = value;
                    }
                  }
              }
            }
            if(taxData.Root[this.currentDetail])
            {
              console.log('Print taxData.Root[this.currentDetail].....',taxData.Root[this.currentDetail]);
              this.taxItemChange.emit(JSON.stringify(taxData.Root[this.currentDetail]));
            }
          }
        }
    });
  }

  onDone()
  {
    try
    {
      console.log('inside on Done 457 ].....');
      if(this.editFlag !== 'V' && !this.recalculateOnTax && this.isFeedOpen)
      {
        this.calculateTax();
      }
      this.closeTax.emit();
    }
    catch
    {
      console.log('Exception inside onDone.....');
    }
    this.lineNumTaxList = [];
  }

  applyTax()
  {
      console.log('inside applyTaxScreen.....377');
       //this.closeTax.emit();
      console.log('inside applyTaxScreen.....378');
      this.applyTaxScreen.emit();
  }

    setUserPref(value:any, prefName:any)
    {
        console.log('inside setUserPref....5750',value);
        console.log('nside setUserPref....5751', prefName);
        let paramMap:any = {};
        paramMap['ACTION']='SET_USER_PREF';
        paramMap['PREF_VAL']=value;
        paramMap['OBJ_NAME']=this.compData["OBJ_NAME"];;
        paramMap['PREF_NAME']=prefName;
        paramMap['PREF_VAL_TYPE']='String';
        var paramString = this._extractTempletService.getEncodedParamString(paramMap);
        var url = this._extractTempletService.getHostURL() + '/ibase/WebITMRequestHandlerServlet';
        this._extractTempletService.sendRequest(url, paramString, (data:any) => {
            this.setLoading(false);
            var callbackResp = data.split('%%SEP%%');
            data = callbackResp[0];
            var isError = callbackResp[1].trim();
            if (!(isError == 'true')) 
            {
                console.log('inside callItemDeafult.......3727[' + data);
                
            }
        });
    }


    getUserPref(prefName:any)
    {
        console.log('nside getUserPref....5751', prefName);
        let paramMap:any = {};
        paramMap['ACTION']='GET_USER_PREF';
        paramMap['OBJ_NAME']=this.compData["OBJ_NAME"];;
        paramMap['PREF_NAME']=prefName;
        var paramString = this._extractTempletService.getEncodedParamString(paramMap);
        var url = this._extractTempletService.getHostURL() + '/ibase/WebITMRequestHandlerServlet';
        this._extractTempletService.sendRequest(url, paramString, (data:any) => {
            this.setLoading(false);
            var callbackResp = data.split('%%SEP%%');
            data = callbackResp[0];
            var isError = callbackResp[1].trim();
            if (!(isError == 'true')) 
            {
                var calcualteTaxId = "RECALCULATE_TAX_"+this.formNo;
                console.log('inside getUserPref.......436[' + data);
                if( prefName == calcualteTaxId)
                {
                   if( data == 'true')
                   {
                       this.recalculateOnTax = true;
                   }
                   else
                   {
                        this.recalculateOnTax = false;
                   }
                }
            }
        });
    }

    setLoading(flag: boolean) 
    {
        try 
        {
		this.bbSpinner.setLoading(flag);
        }
        catch
        {
            console.log('this.bbSpinner.setLoading is not a function!!');
        }
    }

    updateTaxEnvDescription(fieldValue: any)
    {
      var tmpData:any = {};
      tmpData["OBJ_NAME"] = this.compData["OBJ_NAME"];
      tmpData["ACTION"] = "GET_TAXENV_DESCRIPTION";
      tmpData["TAX_ENV"] = fieldValue;
      var paramString = this._extractTempletService.getEncodedParamString(tmpData);
      var url = this._extractTempletService.getHostURL() + "/ibase/E12EditorHandlerServlet";
      this.setLoading(true);
      this._extractTempletService.sendRequest(url, paramString, (taxResponaseData:any) => {
        this.setLoading(false);
        console.log("PRINT LINE NO 618 taxResponaseData:::::::",taxResponaseData)
       // this.taxEnvDescr = taxResponaseData
        var response = taxResponaseData.split('%%SEP%%');
        this.taxEnvDescr = response[0];
        var isError = response[1].trim();
        if(!isError)
        {
          this.taxEnvDescr = response[0];
        }
      });
    }


      // Function called on focus
      onFeedBlurFocus(identifier: string, value: number,lineNumTax:any,lineNumber) 
      {
        this.isFeedOpen = true;
        this.originalValue = value; 
        this.lineNumTax = lineNumTax;
        this.lineNumTaxList.push(lineNumTax);
        this.lineNumber = lineNumber
        console.log('LINE NO TAX LINE NO 623:', this.lineNumTaxList);
      }

      // Function called on Blur
      onFeedBlur(identifier: string, value: number,rateType,maxRate,minRate) 
      {
        this.isFeedOpen = true;
        if(rateType == "P")
        {
          if( ( maxRate != 0.0 && minRate != 0.0 ) || ( maxRate == 0.0 && minRate != 0.0 ) || ( maxRate != 0.0 && minRate == 0.0 ) )
          {
            if( !(value >= minRate && value <= maxRate ))
            {
              window.alert("Please enter the value between "+""+ minRate+" to "+""+maxRate+"");
              return
            }
            else if( maxRate == 0.0 && minRate == 0.0 )
            {
              if( !(value >= 0 && value <= 100))
              { 
                window.alert("Please enter the value between 0 to 100");
                return
              }
            }
          }
        }
        if (this.originalValue !== null && this.originalValue !== value && this.recalculateOnTax == true)
        {
          this.calculateTax()
          let index;
          this.toggleFeed(index)
        }
        else
        {
          return;
        }
        this.originalValue = null;
      }

      onCalculateTaxClick()
      {
        // if(!this.recalculateOnTax) 
        if(this.lineNumber != undefined && this.lineNumTax != undefined && !this.recalculateOnTax)
        {
          this.calculateTax();
        }
        else
        {
          window.alert('No changes in tax for Recalculate');
        }
        let index;
        this.toggleFeed(index)
      }

      ngAfterViewInit()
      {
        console.log("print line no 663 allformValues",this.allformValues[this.currentDetail][0]['tax_env'])
        this.updateTaxEnvDescription(this.allformValues[this.currentDetail][0]['tax_env']);
      }
}
