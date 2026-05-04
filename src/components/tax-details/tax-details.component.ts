import { Component, OnInit, ViewChild, Input, Output, EventEmitter, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, NgZone, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ExtractTemplateService } from '../extract-template/extract-template.service';
import { TaxDetailsService } from './tax-details.service';
import { SimpleEditorService } from '../simple_editor/simple_editor.service';
import { BBProgressSpinnerComponent } from 'base-blocks';


@Component({
  standalone: false,
  selector: 'tax-details',
  templateUrl: './tax-details.component.html',
  styleUrls: ['./tax-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxDetailsComponent implements OnInit, OnDestroy, AfterViewInit {

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
  private taxPercBlur$ = new Subject<{identifier: string, value: number, rateType: any, maxRate: any, minRate: any}>();
  private destroy$ = new Subject<void>();
  cachedImageUrls: { [key: string]: string } = {};
  private taxPercListeners: (() => void)[] = [];

  constructor( public _extractTempletService: ExtractTemplateService, public taxDetailService: TaxDetailsService, public _simpleEditorService: SimpleEditorService, private cdr: ChangeDetectorRef, private ngZone: NgZone, private elRef: ElementRef )
  {
    this.taxPercBlur$.pipe(debounceTime(300)).subscribe(({identifier, value, rateType, maxRate, minRate}) => {
      this.ngZone.run(() => {
        this.processBlur(identifier, value, rateType, maxRate, minRate);
      });
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  getImageUrl(key: string, fldValue: string, objName: string): string {
    let cacheKey = key + '_' + fldValue;
    if(!this.cachedImageUrls[cacheKey]) {
      this.cachedImageUrls[cacheKey] = '/ibase/CustomMenuImageServlet?fldValue=' + fldValue + '&object=tax_form&objName=' + objName + '&ALT_FLD_VALUE=' + fldValue + '&isOval=true';
    }
    return this.cachedImageUrls[cacheKey];
  }

  getFeedImageUrl(taxDescr: string): string {
    let cacheKey = 'feed_' + taxDescr;
    if(!this.cachedImageUrls[cacheKey]) {
      this.cachedImageUrls[cacheKey] = '/ibase/CustomMenuImageServlet?fldValue=' + taxDescr + '&object=tax_form&objName=sorder&ALT_FLD_VALUE=' + taxDescr + '&isOval=true';
    }
    return this.cachedImageUrls[cacheKey];
  }

  ngOnInit() {
    this.lineNumTaxList = [];
    let tempDomId = Number(this.currentRecordDomId)
    this.currentRecordDomId = tempDomId;
    this.currentDetail ='Detail'+this.formNo;


    if(this.cuurentValidationRow && this.cuurentValidationRow.length > 0 )
    {
      var str = this.cuurentValidationRow[0].split('_');
      this.formNo = str[0];
      this.domId = Number( str[1]);
      this.currentDetail ='Detail'+this.formNo;
    }
    let jsonResultData:any = {} = this.taxResponseData;
    if(jsonResultData)
    {
      jsonResultData = {} = JSON.parse(jsonResultData);
      if (jsonResultData && jsonResultData[this.currentDetail]) 
      {
        if(jsonResultData instanceof Array) 
        {
          for( var i=0; i<jsonResultData[this.currentDetail].length; i++ )
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
              this.alltaxFormValues['Taxes_'+(i+1)] = detailArray;
            }
          }
        }
        else if(jsonResultData[this.currentDetail] instanceof Array)
        {
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
            }
          }
        }
        else
        {
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
        this.taxDomId = index;
        var totalCnt = this.alltaxFormValues['Taxes_'+this.domId].length;

        // Batch DOM reads: query all elements once
        var feedDivs: (HTMLElement | null)[] = [];
        var dataDivs: (HTMLElement | null)[] = [];
        var resetDivs: (HTMLElement | null)[] = [];
        for(var i = 1; i <= totalCnt; i++)
        {
          feedDivs[i] = document.getElementById("taxFeedDiv"+i);
          dataDivs[i] = document.getElementById("taxDataDiv"+i);
          resetDivs[i] = document.getElementById("refreshImg"+i);
        }

        var feedDiv = feedDivs[index];
        var dataDiv = dataDivs[index];
        var resetDiv = resetDivs[index];

        // Batch DOM writes: toggle clicked row
        if (feedDiv != null && feedDiv.classList.contains('displayBlock'))
        {
          feedDiv.classList.replace('displayBlock', 'displayNone');
          dataDiv?.classList.replace('displayNone', 'displayBlock');
          resetDiv?.classList.replace('displayNone', 'displayBlock');
        }
        else if (dataDiv != null && dataDiv.classList.contains('displayBlock'))
        {
          dataDiv.classList.replace('displayBlock', 'displayNone');
          feedDiv?.classList.replace('displayNone', 'displayBlock');
          resetDiv?.classList.replace('displayBlock', 'displayNone');
        }

        // Collapse all other rows
        for(var i = 1; i <= totalCnt; i++ )
        {
          if( i != index )
          {
            if (dataDivs[i] != null && dataDivs[i]!.classList.contains('displayBlock'))
            {
              dataDivs[i]!.classList.replace('displayBlock', 'displayNone');
              feedDivs[i]?.classList.replace('displayNone', 'displayBlock');
            }
            if( resetDivs[i] != null && resetDivs[i]!.classList.contains('displayBlock') )
            {
              resetDivs[i]!.classList.replace('displayBlock', 'displayNone');
            }
          }
        }
    }
    catch
    {
    }
  }

  openPopHelp(fldName:any, fldValue:any, formNo:any, detailRowNo?:any) 
  {
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
       let formData:any = {} ;
       formData['fldName'] = fldName;
       formData['fldValue'] = fldValue;
       formData['formNo'] = formNo;
       formData['detailRowNo'] = (this.domId - 1);
       this.callItemchangeFormTax.emit(JSON.stringify(formData));
  }
  setSelectedText(id:any) 
  {      
      this.setSelectedTextfromTax.emit(id);
  }
  setFocusFormNo(cuurrentFormNo:any) 
  {
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
    var chgStrJson: any = {};

    var headerData: any = {
      'objName': this.compData['OBJ_NAME'],
      'pageContext': '2',
      'objContext': this.formNo,
      'editFlag': this.editFlag,
      'focusedColumn': 'tax_perc',
      'elementName': '',
      'keyValue': this.currentRecordDomId,
      'taxKeyValue': this.lineNumTax,
      'saveLevel': '0',
      'forcedSave': 'false',
      'taxInFocus': 'true',
      'forcedconfirm': 'false',
      'isSaveNConitinue': 'false'
    };
    chgStrJson['header'] = headerData;

    var length = this.alltaxFormValues['Taxes_'+this.domId].length;
    var taxRowDomId = (this.domId);
    for(var i=0; i<length; i++ )
    {
      if(this.lineNumTaxList.includes(this.alltaxFormValues['Taxes_' + this.domId][i]['line_no__tax']))
      {
        var detailJson: any = {};
        var row = this.alltaxFormValues['Taxes_'+this.domId][i];
        var attributeTagJson = row['attribute'];

        var attrXml = `<attribute IS_CHANGE="Y"`;
        if (JSON.stringify(attributeTagJson).includes('IS_CHANGE'))
        {
            attrXml = `<attribute `;
        }
        for (var key of Object.keys(attributeTagJson))
        {
          attrXml = attrXml + ` ` + key + `="` + attributeTagJson[key] + `"`;
        }
        attrXml = attrXml + `/>`;

        detailJson['ORIG_ATTRIBUTE_NODE'] = {
          protect: '',
          visible: '',
          content: attrXml
        };

        for (var key in row)
        {
          if (key == 'attribute') continue;
          var value = row[key];
          if (value instanceof Object)
          {
            value = "";
          }
          if (value == null || value == "null")
          {
            value = "";
          }
          detailJson[key] = {
            protect: '',
            visible: '',
            content: String(value)
          };
        }
        chgStrJson[this.currentDetail] = detailJson;
        taxRowDomId = (i+1);
      }
    }

    var chgStr = JSON.stringify(chgStrJson);
    var tmpData:any = {};

      tmpData["OBJ_NAME"] = this.compData["OBJ_NAME"];
      tmpData["OBJ_CONTEXT"] = this.formNo;
      tmpData["PAGE_CTX"] = "2";
      tmpData["CHG_STR"] = chgStr;
      tmpData["FIELD_NAME"] = "tax_perc";
      tmpData["EDITOR_ID"] =  this.compData["EDITOR_ID"];
      tmpData["DOM_ID"] = taxRowDomId;
      tmpData["FORM_NO"] = this.formNo;

      var paramString = this._extractTempletService.getEncodedParamString(tmpData);

      this.setLoading(true);
      this._simpleEditorService.getFieldItemChange(paramString).subscribe({ next: (response:any) => {
        this.setLoading(false);
        this._simpleEditorService.checkErrorExceptionJson(response, (result:any) => {
          if(!result)
          {
            var itmChgResp = JSON.parse(response);
            if(itmChgResp && itmChgResp.data && itmChgResp.data.Root && itmChgResp.data.Root[this.currentDetail])
            {
              if(itmChgResp.data.Root[this.currentDetail]['Taxes'] != null)
              {
                var taxesData = itmChgResp.data.Root[this.currentDetail]['Taxes']['Tax'];
                var responseLen = taxesData.length;
                for(var i=0;i<responseLen;i++ )
                {
                  var currentAllData = taxesData[i];
                  var jsonData:any = {};
                  jsonData = JSON.parse(JSON.stringify(currentAllData));
                  for (var key in jsonData)
                  {
                    var value = jsonData[key];
                    if (value instanceof Object)
                    {
                      if(jsonData[key] && (jsonData[key]['content'] != undefined))
                      {
                        value = jsonData[key]['content'];
                        if(value == null) { value = ''; }
                      }
                      else
                      {
                        value = "";
                      }
                    }
                    if (value == "null")
                    {
                      value = "";
                    }
                    if (key != "attribute")
                    {
                      this.alltaxFormValues['Taxes_'+this.domId][i][key] = value;
                    }
                  }
                }
              }
              this.taxItemChange.emit(JSON.stringify(itmChgResp.data.Root[this.currentDetail]));
            }
          }
          this.cdr.markForCheck();
        });
      }, error: (err: any) => {
        this.setLoading(false);
        this.cdr.markForCheck();
      }});
  }

  onDone()
  {
    try
    {
      if(this.editFlag !== 'V' && !this.recalculateOnTax && this.isFeedOpen)
      {
        this.calculateTax();
      }
      this.closeTax.emit();
    }
    catch
    {
    }
    this.lineNumTaxList = [];
  }

  applyTax()
  {
       //this.closeTax.emit();
      this.applyTaxScreen.emit();
  }

    setUserPref(value:any, prefName:any)
    {
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

            }
            this.cdr.markForCheck();
        });
    }


    getUserPref(prefName:any)
    {
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
            this.cdr.markForCheck();
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
       // this.taxEnvDescr = taxResponaseData
        var response = taxResponaseData.split('%%SEP%%');
        this.taxEnvDescr = response[0];
        var isError = response[1].trim();
        if(!isError)
        {
          this.taxEnvDescr = response[0];
        }
        this.cachedImageUrls = {};
        this.cdr.markForCheck();
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
      }

      // Function called on Blur — delegates to debounced subject to avoid rapid recalculations
      onFeedBlur(identifier: string, value: number,rateType,maxRate,minRate)
      {
        this.isFeedOpen = true;
        this.taxPercBlur$.next({identifier, value, rateType, maxRate, minRate});
      }

      private processBlur(identifier: string, value: number, rateType: any, maxRate: any, minRate: any)
      {
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

      ngOnDestroy()
      {
        this.destroy$.next();
        this.destroy$.complete();
        this.taxPercBlur$.complete();
        this.cleanupTaxPercListeners();
      }

      ngAfterViewInit()
      {
        this.updateTaxEnvDescription(this.allformValues[this.currentDetail][0]['tax_env']);
        this.registerTaxPercOutsideZone();
      }

      private cleanupTaxPercListeners()
      {
        for(let cleanup of this.taxPercListeners)
        {
          cleanup();
        }
        this.taxPercListeners = [];
      }

      private registerTaxPercOutsideZone()
      {
        this.cleanupTaxPercListeners();
        this.ngZone.runOutsideAngular(() => {
          let hostEl = this.elRef.nativeElement as HTMLElement;
          let taxPercInputs = hostEl.querySelectorAll<HTMLInputElement>('input[id*=".tax_perc"]');
          taxPercInputs.forEach((input: HTMLInputElement) => {
            let idParts = input.id.split('.');
            let rowIndex = idParts.length >= 2 ? parseInt(idParts[1], 10) - 1 : 0;

            let focusHandler = () => {
              let taxes = this.alltaxFormValues['Taxes_' + this.domId];
              if(taxes && taxes[rowIndex])
              {
                let detail = taxes[rowIndex];
                this.onFeedBlurFocus(input.id, detail.tax_perc, detail.line_no__tax, detail.line_no);
              }
            };

            let blurHandler = () => {
              let taxes = this.alltaxFormValues['Taxes_' + this.domId];
              if(taxes && taxes[rowIndex])
              {
                let detail = taxes[rowIndex];
                detail.tax_perc = +input.value;
                this.onFeedBlur(input.id, detail.tax_perc, detail.rate_type, detail.max_rate, detail.min_rate);
              }
            };

            input.addEventListener('focus', focusHandler);
            input.addEventListener('blur', blurHandler);
            this.taxPercListeners.push(() => {
              input.removeEventListener('focus', focusHandler);
              input.removeEventListener('blur', blurHandler);
            });
          });
        });
      }
}
