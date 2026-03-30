import { Injectable } from '@angular/core';
// import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { HttpClient,HttpHeaders} from '@angular/common/http';

declare var getBBHostURL : any;


@Injectable({
  providedIn: 'root'
})

export class BBOpenPophelpService {

  private _url: string = "/ibase/WEBITMRIARequestHandlerServlet?";
  private _urlPophelpFields = "/ibase/RIAWizardHandlerServlet?";
  private _url1: string = "/ibase/E12EditorHandlerServlet?";

  isForcedSave: boolean = false;
  isFromAttachPdf: boolean = false;
  columnNaame: any = null;
  allValidationResponse:any = {};
  alertMsgList: any = [];
  typeofAlertList: any = [];
  errorColumnNameList: any = [];
  errorRowsList: any = [];
  isFromAttachForFirstForm: boolean = false;
  confirmBox:any = null;
  tokenID: any = '';
  jSessionId: any = '';
  callApiForSimpleLayout: boolean = false;

  constructor(private http1:HttpClient,private http: HttpClient) { } //private http:Http, 


  getItemchangeResponse(paramString:any) : Observable <any> {

    let url = getBBHostURL() + this._url1 + paramString;
    // console.log("##...... itemChange rest service ==>", url);
    return this.http1.get(url);
   // return this.http1.get(url, { responseType: 'text' }); //need to define what type of data is coming
    }

  getHostURL() 
  {
    if(this.callApiForSimpleLayout == true)
    {
        return '';
    }
    else
    {
        // let HOST_URL: string = '';
        let HOST_URL: any = '';
        HOST_URL = localStorage.getItem('HOST_URL');
        if (!HOST_URL) HOST_URL = '';
        // console.log('getHostURL..[', HOST_URL, ']');
        return HOST_URL;
    }
  }

  getEncodedParamString(paramMap: any): any 
  {
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
  //Added by Vikas L. on 16-Jan-2020-End

  getErrorData(viewDataResponse: any): any {
    let errorArr:any = [];
    let errorDom:any = new Document();
    let parser = new DOMParser();
    errorDom = parser.parseFromString(viewDataResponse, "text/xml");
    // console.log('getErrorData xmlDoc>>>>>1.....', errorDom.lastElementChild.lastChild);
    try {
      let msg = errorDom.getElementsByTagName("message")[0].childNodes[0].nodeValue;
      errorArr[0] = msg;
    }
    catch{
      console.log('error while getting errorMsg>>');
      errorArr[0] = "";
    }
    try {
      let trace = errorDom.getElementsByTagName("trace")[0].childNodes[0].nodeValue;
      errorArr[1] = trace;
    }
    catch{
      console.log('error while getting errorTrace>>');
      errorArr[0] = "";
    }
    try {
      let descr = errorDom.getElementsByTagName("description")[0].childNodes[0].nodeValue;
      errorArr[2] = descr;
    }
    catch{
      console.log('error while getting errorDescr>>');
      errorArr[0] = "";
    }
    return errorArr;
  }


  getErrorMsg(msg:any, msgDescr:any, msgTrace:any) {
    // console.log(' in getErrorMsg');
    let response = "";
    response = msg + "\n" + msgTrace + "\n" + msgDescr;
    return response;
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


  getFirstCallResponse(paramString:any) : Observable <any> {

    let url = getBBHostURL() + this._url1 + paramString;
    // console.log("##...... getFirstCall rest service ==>", url);
   // return this.http1.get(url);
    return this.http1.get(url, { responseType: 'text' }); //need to define what type of data is coming
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
                        //    console.log('inside checError.....291',id);
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
                            //let errorRowId = 'selected_Detail' + formNo + '_RowNo_' + rowNo + '%%SEP%%' + formNo + '%%SEP%%' + rowNo;
                            let errorRowId = 'selected_Detail' + formNo + '_RowNo_' + rowNo;
                            // this.errorRowsList.push(errorRowId);
                            this.errorRowsList.push(errorRowId);
                        }
                    }
                    //if( !this.isFromAttachPdf )
                     if(( formNo == "1" && !this.isFromAttachForFirstForm) ||( formNo !="1" && !this.isFromAttachPdf))
                    {
                        // console.log("checkErrorException:: inside errorType[",errorType,"]");
                        if (errorType == 'E' || errorType == 'X') 
                        {
                            errorMessage = errorMessage + '%%TRACEMESSAGE%%' +  errorId+'%%SEP%%'+trace;
                            if( document.getElementById('popup_content'))
                            {
                                /*this.alertMsgList.push(errorMessage);
                                this.typeofAlertList.push('E');
                                this.errorColumnNameList.push(errorColName);*/
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
                               /* this.alertMsgList.push(errorMessage);
                                this.typeofAlertList.push('W');
                                this.errorColumnNameList.push(errorColName);*/
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
                                /*this.alertMsgList.push(errorMessage);
                                this.typeofAlertList.push('P');
                                this.errorColumnNameList.push(errorColName);*/
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
            console.log('Exception inside checkErrorException method 325::::', e.message);
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

    getFieldItemChange(paramString:any) 
    {
        // , text/plain, */*
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded',
            'TOKEN_ID' : this.tokenID,
            'JSESSIONID' : this.jSessionId
        });
        let URL = this.getHostURL() + '/ibase/rest/VisionOBJService/getFieldItemChange';
        console.log( "URL for getFieldItemChange method >>>>>" , URL );
        return this.http.post(URL, paramString, { headers, responseType: 'text', withCredentials: true });                      
    }
}
