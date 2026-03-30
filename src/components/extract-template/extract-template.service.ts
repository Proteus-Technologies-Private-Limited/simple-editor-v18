import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import 'rxjs/add/observable/from';
// import { Observable } from 'rxjs/Observable';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmBoxComponent } from '../shared/confirm-box/confirm-box.component';
//import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';

declare var getBBHostURL: any;

@Injectable()
export class ExtractTemplateService 
{
    urlPath!: string;
    _url: string = "/ibase/WEBITMRIARequestHandlerServlet?";
    //Added by shrutika on 10-04-2020[Start] for getting first Call browser data
    private _url1: string = "/ibase/E12EditorHandlerServlet?";
    private _url2: string = "/ibase/RIAWizardHandlerServlet?";
    confirmBox:any = null;
    isForcedSave: boolean = false;
    columnNaame: any = null;
    alertMsgList: any = [];
    typeofAlertList: any = [];
    errorColumnNameList: any = [];
    errorRowsList: any = [];
    isFromAttachPdf: boolean = false;
    isFromAttachForFirstForm: boolean = false;
    allValidationResponse:any = {};

    constructor(private http: HttpClient, public dialog: MatDialog) 
    {
        this.confirmBox = new ConfirmBoxComponent(dialog);
    }

    isForceSave()
    {
        return this.isForcedSave;
    }

    setForcedSave(forceSave:any) 
    {
        this.isForcedSave = forceSave;
    }

    getActions(paramString:any): Observable<any> 
    {
        this.urlPath = this.getHostURL() + this._url + paramString;
        console.log('url path', this.urlPath);
        return this.http.get(this.urlPath, { responseType: 'text' });
    }

    getEncodedParamString(paramMap: any): any 
    {    
        var encodedString = "";
        for (let k in paramMap) 
        {
            var key = k;
            var value = paramMap[k];
            var encod = encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
            encodedString += encod;
        }
        encodedString = encodedString.substring(0, encodedString.length - 1);
        console.log("Mahesh encodedString :" + encodedString);
        return encodedString;
    }

    getHostURL(): string 
    {
        // var HOST_URL: string = '';
        var HOST_URL: any = '';

        HOST_URL = localStorage.getItem('HOST_URL');
        //  HOST_URL = JSON.parse (localStorage.getItem('HOST_URL')||'{}');

        if (!HOST_URL) HOST_URL = '';
        return HOST_URL;
    }

    getErrorOfJsonData(viewDataResponse:any) 
    {
        var errorArr:any = [];
        var errorObj = JSON.parse(viewDataResponse);
        var errorData = errorObj.Errors;
        try
        {
            var msg = errorData['error']['message'] + '\n';
            errorArr[0] = msg;
        }
        catch
        {
            console.log('error while getting errorMsg>>');
            errorArr[0] = "";
        }
        try 
        {
            var trace = errorData['error']['trace'] + '\n';
            errorArr[1] = trace;
        }
        catch
        {
            console.log('error while getting errorTrace>>');
            errorArr[0] = "";
        }
        try 
        {
            var descr = errorData['error']['description'] + '\n';
            errorArr[2] = descr;
        }
        catch
        {
            console.log('error while getting errorDescr>>');
            errorArr[0] = "";
        }
        return errorArr;
    }

    //Added by shrutika on 10-04-2020[Start] for getting first Call browser data
    getErrorData(viewDataResponse: any): any 
    {
        var errorArr:any = [];
        var errorDom = new Document();
        var parser = new DOMParser();
        errorDom = parser.parseFromString(viewDataResponse, "text/xml");
        console.log('getErrorData xmlDoc>>>>>1.....', errorDom.lastElementChild?.lastChild);
        try 
        {
            var msg = errorDom.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            errorArr[0] = msg;
        }
        catch
        {
            console.log('error while getting errorMsg>>');
            errorArr[0] = "";
        }
        try
        {
            var trace = errorDom.getElementsByTagName("trace")[0].childNodes[0].nodeValue;
            errorArr[1] = trace;
        }
        catch
        {
            console.log('error while getting errorTrace>>');
            errorArr[1] = "";
        }
        try 
        {
            var descr = errorDom.getElementsByTagName("description")[0].childNodes[0].nodeValue;
            errorArr[2] = descr;
        }
        catch
        {
            console.log('error while getting errorDescr>>');
            errorArr[2] = "";
        }
        return errorArr;
    }

    getErrorMsg(msg:any, msgDescr:any, msgTrace:any) 
    {
        console.log(' in getErrorMsg');
        var response = "";
        response = msg + "\n" + msgTrace + "\n" + msgDescr;
        return response;
    }

    setLoading(flag: boolean) 
    {
        try 
        {
            (<any>window.parent).setLoading(flag);
        }
        catch
        {
            console.log('window.setLoading is not a function!!');
        }
    }

    getFirstCallResponse(paramString:any): Observable<any> 
    {
        var url = this.getHostURL() + this._url1 + paramString;
        console.log("##...... getFirstCall rest service ==>", url);
        // return this.http.get(url);
        return this.http.get(url, { responseType: 'text' }); //need to define what type of data is coming
    }

    //Added by shrutika for getting obj details
    getObjDetailResponse(paramString:any): Observable<any> 
    {
        var url = this.getHostURL() + this._url + paramString;
        console.log("##...... getObjdetail rest service ==>", url);
        //return this.http.get(url);
        return this.http.get(url, { responseType: 'text' }); //need to define what type of data is coming
    }
    //Added by shrutika for getting obj details 

    //Added by shrutika on 10-04-2020[End] for getting first Call browser data

    getPophelpInfoResponse(paramString:any): Observable<any> 
    {
        var url = this.getHostURL() + this._url2 + paramString;
        console.log("##...... getPophelpInfoResponse rest service ==>", url);
        //return this.http.get(url);
        return this.http.get(url, { responseType: 'text' }); //need to define what type of data is coming
    }

    commonServerCallMethod(paramString:any): Observable<any> 
    {
        console.log('Inside commonServerCallMethod');
        paramString = this.getHostURL() + paramString;
        return this.http.get(paramString, { responseType: 'text' });
    }

    getFinishResponse(paramString:any): Observable<any> 
    {
        var url = this.getHostURL() + this._url1 + paramString;
        console.log("##...... getFinishResponse rest service ==>", url);
        //return this.http.get(url);
        return this.http.get(url, { responseType: 'text' }); //need to define what type of data is coming
    }

    // sendRequestNew(url, data): Observable<any>
    // {
    //     console.log('Print inside sendRequestNew');
    //     let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    //     return this.http.post(url, data, { headers: headers });
    // }

    sendRequest(url:any, paramString:any, cllback:any,validationKey?:any) 
    {
        try 
        {
            console.log('Print inisde sendRequestNew Mahesh New');
            var returnRes;
            let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
            this.http.post(url, paramString, { headers, responseType: 'text' }).subscribe(resp => {
                console.log('Print the data inisde subscribe');
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

    // sendRequest(paramString, cllback,validationKey?) 
    // {
    //     try 
    //     {
    //         var url = paramString;
    //         var returnRes;
    //         this.http.get(url, { responseType: 'text' }).subscribe(resp => {
    //           this.checkErrorException(resp, (res) => {
    //             if (res) {
    //               if (this.isForceSave()) {
    //                 url = paramString + "&FORCESAVE=true";
    //                 this.sendRequest(url, cllback);
    //               }
    //               else {
    //                 returnRes = resp + '%%SEP%%' + res + '%%SEP%%' + this.columnNaame;
    //                 cllback(returnRes);
    //               }
    //             }
    //             else {
    //               returnRes = resp + '%%SEP%%' + res + '%%SEP%%' + this.columnNaame;
    //               cllback(returnRes);
    //             }
    //           },validationKey);
    //         });
    //     }
    //     catch (e) 
    //     {
    //         console.log('Exception inside sendRequest:: ', e.message);
    //     }
    // }


    checkErrorException(response:any, callback:any,validationKey?:any) 
    {
        try
        {
            console.log("checkErrorException:: response[",response,"],callback[",callback,"],validationKey[",validationKey,"] ");//pa
            var errorDom = new Document();
            var parser = new DOMParser();
            if (response.indexOf('Errors') != -1) 
            {
                errorDom = parser.parseFromString(response, "text/xml");
                console.log("checkErrorException:: errorDom[",errorDom,"]");//pa
                var errorType:any;
                var errorId:any;
                var msg:any = "";
                var descr:any = "";
                var trace:any = "";
                var errorColName:any;
                var errorLen:any = errorDom.getElementsByTagName("error").length;
                console.log("checkErrorException:: errorLen[",errorLen,"]");//pa
                for (var i = 0; i < errorLen; i++)
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

                    console.log("checkErrorException:: isFromAttachPdf[",this.isFromAttachPdf,"],validationKey[",validationKey,"],errorType[",errorType,"],this.isFromAttachForFirstForm[",this.isFromAttachForFirstForm,"]formNo[",formNo,"]");//pa
                    var formNo:any = "";
                    var errorMessage:any = msg + "<br><br>" + descr;
                    if( (this.isFromAttachPdf && validationKey != null && errorType != 'P') || (this.isFromAttachForFirstForm && validationKey != null && errorType != 'P' ))
                    {
                        console.log("checkErrorException:: inside errorColName[",errorColName,"]");
                        this.allValidationResponse[validationKey] = response;
                        if (errorColName != 'null') 
                        {
                           var splitValidationKey = validationKey.split('_');
                           formNo = splitValidationKey[1];
                           var rowNo = splitValidationKey[0];
                           if( rowNo.startsWith('0'))
                            {
                                rowNo = rowNo.substring(1);
                            }
                           var id = 'Detail'+formNo+'.'+rowNo+ '.'+errorColName;
                           console.log('inside checError.....291',id);
                            var elem = document.getElementById(id);

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
                            //var errorRowId = 'selected_Detail' + formNo + '_RowNo_' + rowNo + '%%SEP%%' + formNo + '%%SEP%%' + rowNo;
                            var errorRowId = 'selected_Detail' + formNo + '_RowNo_' + rowNo;
                            // this.errorRowsList.push(errorRowId);
                            this.errorRowsList.push(errorRowId);
                        }
                    }
                    //if( !this.isFromAttachPdf )
                     if(( formNo == "1" && !this.isFromAttachForFirstForm) ||( formNo !="1" && !this.isFromAttachPdf))
                    {
                        console.log("checkErrorException:: inside errorType[",errorType,"]");
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
                                console.log('call showAlert........298');
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
                        console.log('Inside checkErrorException........344');
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
            console.log('Exception inisde checkErrorException method ', e.message);
        }
    }

    showAlert(errorMessage:any, errorType:any, errorColName:any, callback:any)
    {
        this.columnNaame = errorColName;
        try
        {
            if( errorType == 'E' )
            {
                errorMessage = errorMessage.split('%%TRACEMESSAGE%%');
                var msg = errorMessage[0];
                var traceMsg = errorMessage[1];
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
                            var msg = this.alertMsgList[0];
                            var type = this.typeofAlertList[0];
                            var colName = this.errorColumnNameList[0];
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
                            var msg = this.alertMsgList[0];
                            var type = this.typeofAlertList[0];
                            var colName = this.errorColumnNameList[0];
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

    //Added by Pravin K on 26-june-20[For text selection] START
	  saveYmlTemolate(data:any)
	  {
	      console.log('InvoiceTransactionService :: saveYmlTemolate data[',data,']');
	      this.urlPath = this.getHostURL() + '/ibase/WebITMDocumentHandlerServlet?ACTION=SAVE_YML' + this.getEncodedParamString(data);
	      console.log('url path', this.urlPath);
	      return this.http.get(this.urlPath, { responseType: 'text' });
	  }
        //Added by Pravin K on 26-june-20[For text selection] END
        
    removeResponseFromValidationMap( key :any)
    {
        var response  = this.allValidationResponse[key];
        var errorDom = new Document();
        var parser = new DOMParser();
        if (response.indexOf('Errors') != -1) 
        {
            errorDom = parser.parseFromString(response, "text/xml");
            var errorType;
            var errorId;
            var errorColName;
            var errorLen = errorDom.getElementsByTagName("error").length;
            for (var i = 0; i < errorLen; i++)
            {
                if (errorDom.getElementsByTagName("error")[i] != null) 
                {
                    errorColName = errorDom.getElementsByTagName("error")[i].getAttribute("column_name");
                    errorType = errorDom.getElementsByTagName("error")[i].getAttribute("type");
                    errorId = errorDom.getElementsByTagName("error")[i].getAttribute("id");
                }

                if (errorColName != 'null') 
                {
                    var newKey = key;
                    if( key.startsWith('0'))
                    {
                        newKey = key.substring(1);
                    }
                    var strArray = newKey.split('_');
                    var id = 'Detail'+strArray[1]+'.'+strArray[0]+'.'+errorColName;
                    var elem = document.getElementById(id);
                    if( strArray[1] == "1" && elem != null )
                    {
                        elem.classList.remove('errorFieldforHeader');
                    }
                     else if( errorColName == "item_code" && elem != null)
                    {
                        elem.classList.remove('firstFieldErrorField');
                    }
                    else if (elem != null) {
                        elem.classList.remove('errorField');
                    }
                    var errorRowId  = 'validationIndicatorForRow_'+strArray[0]+'_'+strArray[1];
                    var indicatorElem:any = document.getElementById(errorRowId);
                    if(indicatorElem != null)
                    {
                        indicatorElem.parentNode.removeChild(indicatorElem);
                    }
                    // var elements = document.querySelectorAll("[id='"+errorRowId+"']");
                    // if( elements != null && elements != undefined )
                    // {
                    //     var eleLen = elements.length;
                    //     for( var i=0; i<eleLen; i++ )
                    //     {
                    //         if( elements[i] != null )
                    //         {
                    //             elements[i].classList.remove('indicatorForRow');
                    //             elements[i].classList.add('removeIndicatorForRow');
                               
                    //         }
                    //     }
                    // }
                }
                
            }
            delete this.allValidationResponse[key];
        }
    }


    displayErrorException(response:any, callback:any) 
    {
        console.log('Inside displayErrorException........247');
        try
        {
            var errorDom = new Document();
            var parser = new DOMParser();
            if (response.indexOf('Errors') != -1) 
            {
                errorDom = parser.parseFromString(response, "text/xml");
                var errorType:any;
                var errorId:any;
                var msg:any = "";
                var descr:any = "";
                var trace:any = "";
                var errorColName:any;
                var errorLen:any = errorDom.getElementsByTagName("error").length;
                for (var i = 0; i < errorLen; i++)
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
                    var errorMessage:any = msg + "<br><br>" + descr;
                    if( !this.isFromAttachPdf )
                    {
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
                                /*this.alertMsgList.push(errorMessage);
                                this.typeofAlertList.push('W');
                                this.errorColumnNameList.push(errorColName);*/
                                this.alertMsgList.push(errorMessage);
                                this.typeofAlertList.push('W');
                                this.errorColumnNameList.push(errorColName);

                            }
                            else
                            {
                                this.showAlert(errorMessage, 'W', errorColName, (res:any) => {
                                    this.setLoading(false);
                                    if (this.isForceSave())
                                    {
                                        var errorJson  = this.allValidationResponse;
                                        if( errorJson != null )
                                        {
                                            var keys = Object.keys(errorJson);
                                            var key = keys[0];
                                            var nextKey = keys[1];
                                            this.removeResponseFromValidationMap(key);
                                            if( nextKey != null )
                                            {
                                                var response = errorJson[nextKey];
                                                setTimeout(() => {
                                                    this.displayErrorException(response,callback);
                                                }, 100);
                                            }
                                            else
                                            {
                                                callback(false);
                                                return;
                                            }
                                        }
                                    }
                                    else
                                    {
                                        callback(res);
                                        return;
                                    }
                                });
                            }
                        }
                    }
                    else
                    {
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
            console.log('Exception inisde displayErrorException method ', e.message);
        }
    }
    
 //Added by Pravin K on 25-AUG-20[TO get item code from servlet] START
    getAllItemCode()
    {
        console.log('getAllItemCode' );                                    
        this.urlPath = this.getHostURL() + '/ibase/WebITMDocumentHandlerServlet?ACTION=GET_ALL_ITEM_CODE_LIST';

        console.log('url path', this.urlPath);
        return this.http.get(this.urlPath, { responseType: 'text' });
    }
    //Added by Pravin K on 26-AUG-20[TO get item code from servlet] END :INVALID_DOCUMENT
    
    //Added By Pravin K on 29-OCT-20[to extrace document] START 
    getAllItemCodeList(jsonData:any)
    {
        console.log("getAllItemCodeList::["+jsonData+"]");                                    
        this.urlPath = this.getHostURL() + '/ibase/WebITMDocumentHandlerServlet?ACTION=GET_ITEM_CODE_LIST';

        console.log('getAllItemCodeList url path::', this.urlPath);
        return this.http.post(this.urlPath,jsonData,{ responseType: 'text' });
        //return this.http.get(this.urlPath, { responseType: 'text' });
    }

    //Added By Pravin K on 20-JAN-21 [API call to train python engine] START
    trainTimeCodeAPI(jsonData:any)
    {
        console.log("trainTimeCodeAPI::["+jsonData+"]");                                    
        this.urlPath = this.getHostURL() + '/ibase/WebITMDocumentHandlerServlet?ACTION=TRAIN_ITEM_CODE_API';

        console.log('trainTimeCodeAPI url path::', this.urlPath);
        return this.http.post(this.urlPath,jsonData,{ responseType: 'text' });
        //return this.http.get(this.urlPath, { responseType: 'text' });
    }
    //Added By Pravin K on 20-JAN-21 [API call to train python engine] END
    getExtractedDataOfDocument(docId:any)
    {
        console.log('InvoiceTransactionService :: getExtractedDataOfDocument docId[',docId,']');
        this.urlPath = this.getHostURL() + '/ibase/WebITMDocumentHandlerServlet?ACTION=EXTRACT_DOCUMENT&DOC_ID=' + docId;
        console.log('url path', this.urlPath);
        return this.http.get(this.urlPath, { responseType: 'text' });
    }
    //Added By Pravin K on 29-OCT-20[to extrace document] END

    //Added By Pravin k on 16-JAN-21 [To get all records of detail2 om one call ] START
    getDetail2data(xmldata:any, OBJ_CTXT:any, CORE_MDL_ID:any, objName:any, FORCED_SAVE:any, pk_values:any)
    {
        //http://13.228.194.105:9090/ibase/WebITMRequestHandlerServlet?OBJ_NAME=d_itemser_sales&ACTION=XSD_METADATA&PROFILEID=FIELD_RT&dummyInt=0.5651912110000734
        console.log("getDetail2data::OBJ_CTXT2-[",OBJ_CTXT,']-,CORE_MDL_ID[',CORE_MDL_ID,'],objName[', objName,'],FORCED_SAVE[', FORCED_SAVE,'],pk_values[', pk_values+"]"); 
        console.log("getDetail2data::xmldata["+xmldata+"]");       
        console.log("getDetail2data::static data xmldata["+xmldata+"]");                
        //this.urlPath = this.getHostURL() + '/ibase/WebITMRequestHandlerServlet?ACTION=EXTRACTION_SET_DETAIL_DATA&OBJ_NAME='+objName;
        this.urlPath = this.getHostURL() + '/ibase/WebITMRequestHandlerServlet?ACTION=EXTRACTION_SET_DETAIL_DATA&OBJ_CTXT=2&CORE_MDL_ID='+CORE_MDL_ID+'&OBJ_NAME='+objName+'&FORCED_SAVE='+FORCED_SAVE;
        if(pk_values)
        {
            this.urlPath = this.urlPath+'&PK_VALUES='+pk_values;
        }

        console.log('getDetail2data url path::', this.urlPath);
        // return this.http.get(this.urlPath, { responseType: 'text' });
        return this.http.post(this.urlPath,xmldata,{ responseType: 'text' });
    }
    //Added By Pravin k on 16-JAN-21 [To get all records of detail2 om one call ] END
   
}
