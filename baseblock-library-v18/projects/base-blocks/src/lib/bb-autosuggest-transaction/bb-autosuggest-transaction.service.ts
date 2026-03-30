import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ConfirmBoxComponent } from '../confirm-box';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class BbAutosuggestTransactionService {
  suggestData: any;
  columnNaame: any = null;
  isFromAttachPdf: boolean = false;
  allValidationResponse:any = {};
  errorRowsList: any = [];
  alertMsgList: any = [];
    typeofAlertList: any = [];
  isFromAttachForFirstForm: boolean = false;
  errorColumnNameList: any = [];
  isForcedSave: boolean = false;
  confirmBox:any = null;
  tokenID: any = '';
  jSessionId: any = '';
  callApiForSimpleLayout: boolean = false;

  constructor(private http: HttpClient, public dialog: MatDialog) { 
    this.confirmBox = new ConfirmBoxComponent(dialog);
  }
  getEncodedParamString(paramMap: any): any {
    let encodedString = "";
    for (let k in paramMap) {
      let key = k;
      let value = paramMap[k];
      let encod = encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
      encodedString += encod;
    }
    encodedString = encodedString.substring(0, encodedString.length - 1);
    // console.log("the encodedString :" + encodedString);
    return encodedString;
  }
  getSuggestData(dataSource: string, encodedParam: string, filterName: string): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    let options = { headers: headers };
    let loginId = localStorage.getItem('userName');
    // console.log("getPophelpData filterName", loginId, filterName);
    if (loginId) {
      filterName = loginId + '_' + filterName;
    }
    // console.log("getPophelpData filterName", filterName);
    return this.http.post<any>(this.getHostURL() + dataSource, encodedParam, options)
      .pipe(map((res: any) => this.extractData(res, filterName)));
  }
  transformData(res: HttpResponse<any>, isPophelp: boolean, displayMetadata: any): any[] {
    let formatedData: any[] = [];
    console.log('res :: ', res);
    let data: any;
    try {
      let bodyRes = JSON.stringify(res);
      data = JSON.parse(bodyRes);
      if (res.body) {
        data = res.body.json();
      }
    }
    catch (e) {
      if(res.body)
      {
        data = res.body.json();
      }
    }
    if (data && Object.keys(data).length > 0) {
      if (isPophelp) {
        if (data.DETAILS) {
          let detailList = data.DETAILS.slice(2, data.DETAILS.length)
          let thumbObjName, thumbAltCol, thumbImgCol;
          // console.log('THUMB_IMAGE_COL', data.DETAILS[0].THUMB_IMAGE_COL);
          if (detailList[0] && detailList[0][data.DETAILS[0].THUMB_IMAGE_COL]) {
            thumbObjName = data.DETAILS[0].THUMB_OBJ;
            thumbAltCol = data.DETAILS[0].THUMB_ALT_COL;
            thumbImgCol = data.DETAILS[0].THUMB_IMAGE_COL;
          }
          else {
            thumbObjName = this.initCap(data.DETAILS[0].THUMB_OBJ);
            thumbAltCol = this.initCap(data.DETAILS[0].THUMB_ALT_COL);
            thumbImgCol = this.initCap(data.DETAILS[0].THUMB_IMAGE_COL);
          }
          // console.log('thumbObjName', thumbObjName, thumbAltCol, thumbImgCol);
          for (let detail of detailList) {
            let displayChipText;
            let displaySuggestText;
            let value
            if (displayMetadata != undefined && displayMetadata != null && displayMetadata != '') {
              displayChipText = displayMetadata["chipMetadata"];
              displaySuggestText = displayMetadata["suggestMetadata"];
              value = displayMetadata["valueFields"];
              for (let key of Object.keys(detail)) {
                if (detail[key] == 'INVALID_DATA') {
                  detail[key] = '';
                }
                let rKey = '<' + key + '>';
                displayChipText = displayChipText.replace(rKey, detail[key]);
                displaySuggestText = displaySuggestText.replace(rKey, detail[key]);
                value = value.replace(key, detail[key]);
              }
            }
            else {
              displayChipText = detail.value;
              displaySuggestText = detail.value;
              value = detail.id;
            }
            let thumbImgUrl = this.getCustomImageURL(thumbObjName, detail[thumbImgCol], detail[thumbAltCol]);
            let image = detail.imgUrl || thumbImgUrl || "ERROR";
            // console.log('thumbImgUrl', detail.imgUrl, thumbImgUrl);
            let errData: boolean = false;
            formatedData.push({ 'displayChipText': displayChipText, 'displaySuggestText': displaySuggestText, 'value': value, 'image': image, 'detail': detail, 'errData': errData })
          }
        }
      }
      else {
        for (let detail of data.details) {
          let displayChipText = data.chipMetadata || data.chipMetaData;
          let displaySuggestText = data.suggestMetadata || data.suggestMetaData;
          let value = data.valueFields || data.valueField;
          let image = data.imgUrl;
          let errData: boolean = false;
          for (let key of Object.keys(detail)) {
            if (detail[key] == 'INVALID_DATA') {
              errData = true;
              detail[key] = '';
            }
            let rKey = '<' + key + '>';
            displayChipText = displayChipText.replace(rKey, detail[key]);
            displaySuggestText = displaySuggestText.replace(rKey, detail[key]);
            value = value.replace(key, detail[key]);
            if (image) {
              image = image.replace(rKey, detail[key]);
            }
          }
          formatedData.push({ 'displayChipText': displayChipText, 'displaySuggestText': displaySuggestText, 'value': value, 'image': image, 'detail': detail, 'errData': errData })
        }
      }


    }

    if (formatedData) data = formatedData;
    return data;
  }
  private initCap(value: string) {
    if (value) return value.toLowerCase().replace(/(?:^|\s|_)[a-z]/g, function (m) {
      return m.toUpperCase();
    });
    return '';
  }
  private getCustomImageURL(thumbObjName: any, thumbImgCol: any, thumbAltCol: any) {
    let imageURL = '/ibase/CustomMenuImageServlet?';
    imageURL += 'fldValue=' + thumbImgCol;
    imageURL += '&ALT_FLD_VALUE=' + thumbAltCol;
    imageURL += '&objName=' + thumbObjName;
    imageURL += '&object=' + thumbObjName;
    return imageURL;
  }
  public getHostURL(): string 
  {
    if(this.callApiForSimpleLayout == true)
    {
      return '';
    }
    else
    {
      let HOST_URL: any = '';
      HOST_URL = localStorage.getItem('HOST_URL');
      if (!HOST_URL) HOST_URL = '';
      return HOST_URL;
    }
  }
  private extractData(res: Response, filterName: any) {
    localStorage.setItem(filterName, JSON.stringify(res));

    // console.log('extractData[' + JSON.stringify(res) + ']');
    return res || {};
  }
  sendRequest(url:any, paramString:any, cllback:any,validationKey?:any) 
    {
        try 
        {
            // console.log('Print inisde sendRequestNew Mahesh New');
            let returnRes;
            let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
            this.http.post(url, paramString, { headers, responseType: 'text' }).subscribe(resp => {
                // console.log('Print the data inisde subscribe');
              this.checkErrorException(resp, (res:any) => {
                if (res) {
                  if (this.isForceSave()) {
                    paramString = paramString + "&FORCESAVE=true";
                    this.sendRequest(url, paramString, cllback, validationKey);
                  }
                  else {
                    returnRes = resp + '%%SEP%%' + res + '%%SEP%%' + this.columnNaame;
                    cllback(returnRes);
                  }
                }
                else {
                  returnRes = resp + '%%SEP%%' + res + '%%SEP%%' + this.columnNaame;
                  cllback(returnRes);
                }
              },validationKey);
            });
        }
        catch (e:any) 
        {
            console.log('Exception inside sendRequest:: ', e.message);
        }
    }
    setLoading(flag : boolean)
    {
      try
      {
        (<any>window.parent).setLoading(flag);
      }
      catch{
        console.log('window.setLoading is not a function!!');        
      }
    }
    checkErrorException(response:any, callback:any,validationKey?:any) 
    {
        try
        {
            // console.log("checkErrorException:: response[",response,"],callback[",callback,"],validationKey[",validationKey,"] ");//pa
            let errorDom = new Document();
            let parser = new DOMParser();
            if (response.indexOf('Errors') != -1) 
            {
                errorDom = parser.parseFromString(response, "text/xml");
                // console.log("checkErrorException:: errorDom[",errorDom,"]");//pa
                let errorType:any;
                let errorId:any;
                let msg:any = "";
                let descr:any = "";
                let trace:any = "";
                let errorColName:any;
                let errorLen:any = errorDom.getElementsByTagName("error").length;
                // console.log("checkErrorException:: errorLen[",errorLen,"]");//pa
                for (let i = 0; i < errorLen; i++)
                {
                    if (errorDom.getElementsByTagName("error")[i] != null) 
                    {
                        errorColName = errorDom.getElementsByTagName("error")[i].getAttribute("column_name");
                        errorType = errorDom.getElementsByTagName("error")[i].getAttribute("type");
                        errorId = errorDom.getElementsByTagName("error")[i].getAttribute("id");
                    }

                    if (errorDom.getElementsByTagName("message")[i] != null && errorDom.getElementsByTagName("message")[i].childNodes[0] != null) 
                    {
                        msg = errorDom.getElementsByTagName("message")[i].childNodes[0].nodeValue;
                    }
                    
                    if (errorDom.getElementsByTagName("description")[i] != null && errorDom.getElementsByTagName("description")[i].childNodes[0] != null) 
                    {
                        descr = errorDom.getElementsByTagName("description")[i].childNodes[0].nodeValue;
                    }
                    
                    if (errorDom.getElementsByTagName("trace")[i] != null && errorDom.getElementsByTagName("trace")[i].childNodes[0] != null) 
                    {
                        trace = errorDom.getElementsByTagName("trace")[i].childNodes[0].nodeValue;
                    }

                    // console.log("checkErrorException:: isFromAttachPdf[",this.isFromAttachPdf,"],validationKey[",validationKey,"],errorType[",errorType,"],this.isFromAttachForFirstForm[",this.isFromAttachForFirstForm,"]formNo[",formNo,"]");//pa
                    let formNo:any = "";
                    let errorMessage:any = msg + "<br><br>" + descr;
                    if( (this.isFromAttachPdf && validationKey != null && errorType != 'P') || (this.isFromAttachForFirstForm && validationKey != null && errorType != 'P' ))
                    {
                        // console.log("checkErrorException:: inside errorColName[",errorColName,"]");
                        this.allValidationResponse[validationKey] = response;
                        if (errorColName != 'null') 
                        {
                           let splitValidationKey = validationKey.split('_');
                           formNo = splitValidationKey[1];
                           let rowNo = splitValidationKey[0];
                           if( rowNo.startsWith('0'))
                            {
                                rowNo = rowNo.substring(1);
                            }
                           let id = 'Detail'+formNo+'.'+rowNo+ '.'+errorColName;
                          //  console.log('inside checError.....291',id);
                            let elem = document.getElementById(id);

                            if( elem != null && formNo =="1" )
                            {
                                elem.classList.add('errorFieldforHeader');
                                elem.title = msg;
                            }
                            else if( errorColName == "item_code" && elem != null)
                            {
                               elem.classList.add('firstFieldErrorField');
                                elem.title = msg; 
                            }
                            else if (elem != null) 
                            {
                                elem.classList.add('errorField');
                                elem.title = msg;
                            }
                            let errorRowId = 'selected_Detail' + formNo + '_RowNo_' + rowNo;
                            this.errorRowsList.push(errorRowId);
                        }
                    }
                    if(( formNo == "1" && !this.isFromAttachForFirstForm) ||( formNo !="1" && !this.isFromAttachPdf))
                    {
                        // console.log("checkErrorException:: inside errorType[",errorType,"]");
                        if (errorType == 'E' || errorType == 'X') 
                        {
                            errorMessage = errorMessage + '%%TRACEMESSAGE%%' +  errorId+'%%SEP%%'+trace;
                            if( document.getElementById('popup_content'))
                            {
                                this.alertMsgList.push(errorMessage);
                                this.typeofAlertList.push('E');
                                this.errorColumnNameList.push(errorColName);
                            }
                            else
                            {
                                // console.log('call showAlert........298');
                                this.showAlert(errorMessage, 'E', errorColName, (res:any) => {
                                    callback(res);
                                    return;
                                });
                            }
                        }
                        else if (errorType == 'W') 
                        {
                            this.setLoading(false);
                            if( document.getElementById('popup_content'))
                            {
                                this.alertMsgList.push(errorMessage);
                                this.typeofAlertList.push('W');
                                this.errorColumnNameList.push(errorColName);
                            }
                            else
                            {
                                this.showAlert(errorMessage, 'W', errorColName, (res:any) => {
                                    callback(res);
                                    return;
                                });
                            }
                        }
                        else if (errorType == 'P') 
                        {
                            if( document.getElementById('popup_content'))
                            {
                                this.alertMsgList.push(errorMessage);
                                this.typeofAlertList.push('P');
                                this.errorColumnNameList.push(errorColName);
                            }
                            else
                            {
                                this.showAlert(errorMessage, 'P', errorColName, (res:any) => {
                                    callback(res);
                                    return;
                                });
                            }
                        }
                    }
                    else
                    {
                        // console.log('Inside checkErrorException........344');
                        callback(true);
                        return;
                    }
                }
            }
            else 
            {
                callback(false);
                return;
            }
        }
        catch (e:any) 
        {
            console.log('Exception inside checkErrorException method 363::::', e.message);
        }
    }
    isForceSave()
    {
        return this.isForcedSave;
    }
    showAlert(errorMessage:any, errorType:any, errorColName:any, callback:any)
    {
        this.columnNaame = errorColName;
        try
        {
            if( errorType == 'E' )
            {
                errorMessage = errorMessage.split('%%TRACEMESSAGE%%');
                let msg = errorMessage[0];
                let traceMsg = errorMessage[1];
                this.confirmBox.alert('Error', msg,traceMsg).subscribe((resp:any) => {
                    this.setLoading(false);
                    if (resp) 
                    {
                        this.setForcedSave(false);
                        callback(true);
                        return;
                    }
                });
            }
            else if( errorType == 'W')
            {
                this.confirmBox.confirm("confirm", errorMessage).subscribe((resp:any) => {
                    if (resp == 'YES') 
                    {
                        this.setForcedSave(true);
                        if( this.alertMsgList.length > 0)
                        {
                            let msg = this.alertMsgList[0];
                            let type = this.typeofAlertList[0];
                            let colName = this.errorColumnNameList[0];
                            this.alertMsgList.splice(0,1);
                            this.typeofAlertList.splice(0,1);
                            this.errorColumnNameList.splice(0,1);
                            this.showAlert( msg, type, colName, callback);
                        }
                        else
                        {
                            this.setLoading(true);
                            callback(true);
                            return;
                        }
                    }
                    else if (resp == 'NO') 
                    {
                        this.setForcedSave(false);
                        this.setLoading(true);
                        callback(true);
                        return;
                    }
                });
            }
            else if( errorType == 'P')
            {
                this.confirmBox.alert('Prompt', errorMessage).subscribe((result:any )=> {
                    this.setLoading(false);
                    if (result) 
                    {
                        this.setForcedSave(false);
                        if( this.alertMsgList.length > 0)
                        {
                            let msg = this.alertMsgList[0];
                            let type = this.typeofAlertList[0];
                            let colName = this.errorColumnNameList[0];
                            this.alertMsgList.splice(0,1);
                            this.typeofAlertList.splice(0,1);
                            this.errorColumnNameList.splice(0,1);
                            this.showAlert( msg, type,colName, callback);
                        }
                        else
                        {
                            callback(false);
                            return;
                        }
                   }
                });
            }
            else
            {
                callback(false);
                return;
            }
        }
        catch (e: any) 
        {
            console.log('Exception inisde showAlert method ', e.message);
        }
    }
    setForcedSave(forceSave:any) 
    {
        this.isForcedSave = forceSave;
    }

  getPophelpData(payLoad: any) 
  {
    console.log('print getPophelpData payLoad 467:::',payLoad);
    let headerObj: any = {
        'Content-Type': 'application/json',
        'TOKEN_ID': this.tokenID || ''
    };
    if(this.jSessionId) {
        headerObj['JSESSIONID'] = this.jSessionId;
    }
    let httpHeaders = new HttpHeaders(headerObj);
    let URL = this.getHostURL() + '/ibase/rest/VisionOBJService/autoSearchPophelp';
      
    console.log('Request payLoad:', payLoad);
    console.log('Request this.tokenID:', this.tokenID);
    console.log('Request this.jSessionId:', this.jSessionId);

    return this.http.post(URL, payLoad, { 
          headers: httpHeaders, 
          responseType: 'text', 
          withCredentials: true 
      });

    /* let jsonObject = JSON.parse(payLoad);
    let objName = jsonObject["OBJ_NAME"];
    let fieldName = jsonObject["FIELD_NAME"];
    let editorId = jsonObject["EDITOR_ID"];
    let sqlInput = jsonObject["SQL_INPUT"];
    let formNo = jsonObject["FORM_NO"];
    let paramxml = jsonObject["PARAMXML"];
    let pkValues = jsonObject["PKVALUE"];
    let editFlag = jsonObject["EDIT_FLAG"];
    let allFormValues = jsonObject["ALLFORMVALUES"];
    let transMode = jsonObject["TRANSMODE"];
    let serverURL = this.getHostURL() + '/ibase/rest/VisionOBJService/autoSearchPophelp?'+ 'OBJ_NAME='+ objName +'&FIELD_NAME='+ fieldName +'&EDITOR_ID='+ editorId +'&SQL_INPUT='+ sqlInput +'&FORM_NO='+ formNo +'&PARAMXML='+ paramxml +'&PKVALUE='+ pkValues +'&EDIT_FLAG='+ editFlag +'&ALLFORMVALUES='+ allFormValues +'&TRANSMODE='+ transMode;
    this.http.get(serverURL, { headers: httpHeaders, withCredentials: true }).subscribe({
          next: (response: any) => {
              callBack(response);
          },
          error: (error: any) => {
              console.error('getDetailObjData error:', error);
              callBack({ status: 'error', message: error.message });
          }
      }); */
  }
}
