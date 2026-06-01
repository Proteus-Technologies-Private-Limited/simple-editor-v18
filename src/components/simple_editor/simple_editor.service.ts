import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable,throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BBConfirmBoxComponent } from 'base-blocks';
import { catchError, map } from 'rxjs/operators';
import { HttpRequestService } from 'base-blocks';

declare let getBBHostURL: any;
declare let invokeDashboardLink: any;
declare let invokeSimpleLayoutLink:any;
declare let involeSimpleLayoutAction:any;
declare let invokeDashboardAction:any;
const serviceUrl = '/ibase/rest/VisionOBJService';

@Injectable({
    providedIn: 'root'
})
export class SimpleEditorService 
{
    urlPath!: string;
    _url: string = "/ibase/WEBITMRIARequestHandlerServlet?";
    private _url1: string = "/ibase/E12EditorHandlerServlet?";
    private _url2: string = "/ibase/RIAWizardHandlerServlet?";
    confirmBox:any = null;
    bbconfirmBox:any = null;
    isForcedSave: boolean = false;
    columnNaame: any = null;
    alertMsgList: any = [];
    typeofAlertList: any = [];
    errorColumnNameList: any = [];
    errorRowsList: any = [];
    isFromAttachPdf: boolean = false;
    isFromAttachForFirstForm: boolean = false;
    allValidationResponse:any = {};
    public baseUrl: string = serviceUrl;
    isSimpleLayoutCall: boolean = false;
    private detailObjDataCache: Map<string, any> = new Map();
    tokenID = '';
    jSessionId = '';
    hostName = '';

    private dataSubject = new BehaviorSubject<any>(null);
    data$ = this.dataSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();

    constructor(private http: HttpClient, public dialog: MatDialog, public httpRequetService: HttpRequestService) 
    {
       this.bbconfirmBox = new BBConfirmBoxComponent(dialog);
    //    window.addEventListener('wheel', (event) => {
    //     // Handle the event or dispatch an event to subscribers
    //     }, { passive: true });
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
        return this.http.get(this.urlPath, { responseType: 'text', withCredentials: true });
    }

    getEncodedParamString(paramMap: any): any 
    {    
        let encodedString = "";
        for (let k in paramMap) 
        {
            let key = k;
            let value = paramMap[k];
            let encod = encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
            encodedString += encod;
        }
        encodedString = encodedString.substring(0, encodedString.length - 1);
        return encodedString;
    }

    getHostURL(): string
    {
        // Proxy via Express server - no cross-origin needed
        return '';
    }

    getErrorOfJsonData(viewDataResponse:any) 
    {
        let errorArr:any = [];
        let errorObj = JSON.parse(viewDataResponse);
        let errorData = errorObj.Errors;
        try
        {
            let msg = errorData['error']['message'] + '\n';
            errorArr[0] = msg;
        }
        catch
        {
            console.log('error while getting errorMsg>>');
            errorArr[0] = "";
        }
        try 
        {
            let trace = errorData['error']['trace'] + '\n';
            errorArr[1] = trace;
        }
        catch
        {
            console.log('error while getting errorTrace>>');
            errorArr[1] = "";
        }
        try
        {
            let descr = errorData['error']['description'] + '\n';
            errorArr[2] = descr;
        }
        catch
        {
            console.log('error while getting errorDescr>>');
            errorArr[2] = "";
        }
        return errorArr;
    }

    getErrorData(viewDataResponse: any): any 
    {
        let errorArr:any = [];
        let errorDom = new Document();
        let parser = new DOMParser();
        errorDom = parser.parseFromString(viewDataResponse, "text/xml");
        try 
        {
            let msg = errorDom.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            errorArr[0] = msg;
        }
        catch
        {
            console.log('error while getting errorMsg>>');
            errorArr[0] = "";
        }
        try
        {
            let trace = errorDom.getElementsByTagName("trace")[0].childNodes[0].nodeValue;
            errorArr[1] = trace;
        }
        catch
        {
            console.log('error while getting errorTrace>>');
            errorArr[1] = "";
        }
        try 
        {
            let descr = errorDom.getElementsByTagName("description")[0].childNodes[0].nodeValue;
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
        let response = "";
        response = msg + "\n" + msgTrace + "\n" + msgDescr;
        return response;
    }

    setLoading(flag: boolean)
    {
        let parentHandled = false;
        try
        {
            if(window.parent && window.parent !== window && typeof (<any>window.parent).setLoading === 'function')
            {
                (<any>window.parent).setLoading(flag);
                parentHandled = true;
            }
        }
        catch
        {
            console.log('window.setLoading is not a function!!');
        }
        // Only show local loading overlay if parent didn't handle it (not in iframe)
        if(!parentHandled)
        {
            this.loadingSubject.next(flag);
        }
        else if(!flag)
        {
            // Always hide local overlay when loading ends
            this.loadingSubject.next(false);
        }
    }

    getFirstCallResponse(paramString:any): Observable<any>
    {
        let url = this.getHostURL() + this._url1 + paramString;
        return this.http.get(url, { responseType: 'text', withCredentials: true });
    }

    getObjDetailResponse(paramString:any): Observable<any>
    {
        let url = this.getHostURL() + this._url + paramString;
        return this.http.get(url, { responseType: 'text', withCredentials: true });
    }

    getPophelpInfoResponse(paramString:any): Observable<any>
    {
        let url = this.getHostURL() + this._url2 + paramString;
        return this.http.get(url, { responseType: 'text', withCredentials: true });
    }

    commonServerCallMethod(paramString:any): Observable<any>
    {
        paramString = this.getHostURL() + paramString;
        return this.http.get(paramString, { responseType: 'text', withCredentials: true });
    }

    getFinishResponse(paramString:any): Observable<any>
    {
        let url = this.getHostURL() + this._url1 + paramString;
        return this.http.get(url, { responseType: 'text', withCredentials: true });
    }

    sendRequest(url:any, paramString:any, cllback:any,validationKey?:any) 
    {
        try 
        {
            let returnRes;
            let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded',
                'TOKEN_ID': this.tokenID,
                'Cookie' : this.jSessionId
            });
            // 'SESSION_ID':'3_fqoa9yLP6YoNqOb-gdTmPrTgjRYuHODArdovyf'
            // 'JSESSIONID' : 'eoCvD7bWTJAyP7KcSXlA-ETxva8UgbDGD1vdqS25.base-hp-247-g8-notebook-pc'
            
            this.http.post(url, paramString, { headers, responseType: 'text', withCredentials: true }).subscribe(resp => {
                this.checkErrorException(resp, (res:any) => {
                    if (res) 
                    {
                        if (this.isForceSave()) 
                        {
                            paramString = paramString + "&FORCESAVE=true";
                            this.sendRequest(url, paramString, cllback, validationKey);
                        }
                        else {
                            returnRes = resp + '%%SEP%%' + res + '%%SEP%%' + this.columnNaame;
                            cllback(returnRes);
                        }
                    }
                    else 
                    {
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
        console.log('[checkErrorException] called with response type:', typeof response);
        try
        {
            // Check if response is JSON with status Reject/exception/error
            if(response && typeof response === 'string') {
                let trimmed = response.trim();
                if(trimmed.startsWith('{')) {
                    try {
                        let jsonResp = JSON.parse(trimmed);
                        if(jsonResp['status'] && (jsonResp['status'] == 'Reject' || jsonResp['status'] == 'exception' || jsonResp['status'] == 'error')) {
                            this.checkErrorExceptionJson(response, callback, validationKey);
                            return;
                        }
                    } catch(e) {
                        // Not valid JSON, continue with XML parsing
                    }
                }
            }

            let errorDom = new Document();
            let parser = new DOMParser();
            if (response.indexOf('Errors') != -1)
            {
                errorDom = parser.parseFromString(response, "text/xml");
                let errorType:any;
                let errorId:any;
                let msg:any = "";
                let descr:any = "";
                let trace:any = "";
                let errorColName:any;
                let errorLen:any = errorDom.getElementsByTagName("error").length;
                if(errorLen == 0)
                {
                    callback(false);
                    return;
                }
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

                    let formNo:any = "";
                    let errorMessage:any = msg;
                    if (descr) {
                        errorMessage = msg + "<br><br>" + descr;
                    }
                    if (!errorMessage) {
                        errorMessage = "An unknown error occurred";
                    }
                    if( (this.isFromAttachPdf && validationKey != null && errorType != 'P') || (this.isFromAttachForFirstForm && validationKey != null && errorType != 'P' ))
                    {
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
                        if (errorType == 'E' || errorType == 'X') 
                        {
                            this.setLoading(false);
                            errorMessage = errorMessage + '%%TRACEMESSAGE%%' +  errorId+'%%SEP%%'+trace;
                            if( document.getElementById('popup_content'))
                            {
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
                        callback(true);
                        return;
                    }
                }

                // If errors were queued but no showAlert was triggered (e.g. a popup was already open),
                // process the first queued error now so callback eventually fires
                if(this.alertMsgList.length > 0 && !document.getElementById('popup_content'))
                {
                    this.setLoading(false);
                    let qMsg = this.alertMsgList[0];
                    let qType = this.typeofAlertList[0];
                    let qColName = this.errorColumnNameList[0];
                    this.alertMsgList.splice(0,1);
                    this.typeofAlertList.splice(0,1);
                    this.errorColumnNameList.splice(0,1);
                    this.showAlert(qMsg, qType, qColName, (res:any) => {
                        callback(res);
                    });
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
            this.setLoading(false);
            callback(false);
        }
    }

    showAlert(errorMessage:any, errorType:any, errorColName:any, callback:any)
    {
        console.log('[showAlert] called with errorMessage:', errorMessage, 'errorType:', errorType);
        if (!errorMessage || errorMessage.replace(/<br>/g, '').trim() === '') {
            errorMessage = 'An unknown error occurred%%TRACEMESSAGE%%';
            console.log('[showAlert] empty message, using fallback');
        }
        this.columnNaame = errorColName;
        try
        {
            if( errorType == 'E' )
            {
                errorMessage = errorMessage.split('%%TRACEMESSAGE%%');
                let msg = errorMessage[0];
                let traceMsg = errorMessage[1];
                console.log('[showAlert] alerting with msg:', msg, 'traceMsg:', traceMsg);
                    this.bbconfirmBox.alert('Error', msg,traceMsg).subscribe((resp:any) => {
                    console.log('[showAlert] E alert subscribe resp:', resp);
                    this.setLoading(false);
                    if (resp)
                    {
                        this.setForcedSave(false);
                        console.log('[showAlert] E alert - calling callback(true)');
                        callback(true);
                        return;
                    }
                });
            }
            else if( errorType == 'W')
            {
                    console.log('[showAlert] calling confirm for W type, message:', errorMessage);
                    this.bbconfirmBox.confirm("bbconfirmBox", errorMessage, (resp:any) => {
                    console.log('[showAlert] W confirm callback, resp:', resp);
                    if (resp == 'YES')
                    {
                        console.log('[showAlert] W - YES clicked, setting forcedSave=true');
                        this.setForcedSave(true);
                        if( this.alertMsgList.length > 0)
                        {
                            console.log('[showAlert] W - more alerts in queue:', this.alertMsgList.length);
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
                            console.log('[showAlert] W - no more alerts, calling callback(true)');
                            this.setLoading(true);
                            callback(true);
                            return;
                        }
                    }
                    else if (resp == 'NO')
                    {
                        console.log('[showAlert] W - NO clicked, setting forcedSave=false');
                        this.setForcedSave(false);
                        this.setLoading(false);
                        callback(false);
                        return;
                    }
                });
            }
            else if( errorType == 'P')
            {
                this.bbconfirmBox.confirm("Prompt", errorMessage, (resp:any) => {
                    this.setLoading(false);
                    if (resp == 'YES') 
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
            this.setLoading(false);
            callback(false);
        }
    }

    saveYmlTemolate(data:any)
    {
        this.urlPath = this.getHostURL() + '/ibase/WebITMDocumentHandlerServlet?ACTION=SAVE_YML' + this.getEncodedParamString(data);
        return this.http.get(this.urlPath, { responseType: 'text', withCredentials: true });
    }
        
    removeResponseFromValidationMap( key :any)
    {
        let response  = this.allValidationResponse[key];
        let errorDom = new Document();
        let parser = new DOMParser();
        if (response.indexOf('Errors') != -1) 
        {
            errorDom = parser.parseFromString(response, "text/xml");
            // let errorType;
            // let errorId;
            let errorColName;
            let errorLen = errorDom.getElementsByTagName("error").length;
            for (let i = 0; i < errorLen; i++)
            {
                if (errorDom.getElementsByTagName("error")[i] != null) 
                {
                    errorColName = errorDom.getElementsByTagName("error")[i].getAttribute("column_name");
                    // errorType = errorDom.getElementsByTagName("error")[i].getAttribute("type");
                    // errorId = errorDom.getElementsByTagName("error")[i].getAttribute("id");
                }

                if (errorColName != 'null') 
                {
                    let newKey = key;
                    if( key.startsWith('0'))
                    {
                        newKey = key.substring(1);
                    }
                    let strArray = newKey.split('_');
                    let id = 'Detail'+strArray[1]+'.'+strArray[0]+'.'+errorColName;
                    let elem = document.getElementById(id);
                    if( strArray[1] == "1" && elem != null )
                    {
                        elem.classList.remove('errorFieldforHeader');
                    }
                    else if( errorColName == "item_code" && elem != null)
                    {
                        elem.classList.remove('firstFieldErrorField');
                    }
                    else if (elem != null) 
                    {
                        elem.classList.remove('errorField');
                    }
                    let errorRowId  = 'validationIndicatorForRow_'+strArray[0]+'_'+strArray[1];
                    let indicatorElem:any = document.getElementById(errorRowId);
                    if(indicatorElem != null)
                    {
                        indicatorElem.parentNode.removeChild(indicatorElem);
                    }
                }
                
            }
            delete this.allValidationResponse[key];
        }
    }


    displayErrorException(response:any, callback:any) 
    {
        try
        {
            let errorDom = new Document();
            let parser = new DOMParser();
            if (response.indexOf('Errors') != -1) 
            {
                errorDom = parser.parseFromString(response, "text/xml");
                let errorType:any;
                let errorId:any;
                let msg:any = "";
                let descr:any = "";
                let trace:any = "";
                let errorColName:any;
                let errorLen:any = errorDom.getElementsByTagName("error").length;
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
                    let errorMessage:any = msg;
                    if (descr) {
                        errorMessage = msg + "<br><br>" + descr;
                    }
                    if (!errorMessage) {
                        errorMessage = "An unknown error occurred";
                    }
                    if( !this.isFromAttachPdf )
                    {
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
                                    this.setLoading(false);
                                    if (this.isForceSave())
                                    {
                                        let errorJson  = this.allValidationResponse;
                                        if( errorJson != null )
                                        {
                                            let keys = Object.keys(errorJson);
                                            let key = keys[0];
                                            let nextKey = keys[1];
                                            this.removeResponseFromValidationMap(key);
                                            if( nextKey != null )
                                            {
                                                let response = errorJson[nextKey];
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
    
    invokeLink(link: any, feedData: any, objName: any, formNum: any, firstFormData: any, domId?: any)
    {
        let pkFieldValue = '';
        if (link && link['formNo']) 
        { 
            let newLink = link;
            newLink['FormNo'] = newLink['formNo'].toString();
            delete newLink['formNo'];
            link = newLink;
        }
        if (link && link['fieldName'])   
        { 
            let newFieldName = link;
            newFieldName['FieldName'] = newFieldName['fieldName'].toString();
            delete newFieldName['fieldName'];
            link = newFieldName;
        }
        if(feedData)
        {
            let linkArgStr = (link.LinkArg || link.link_arg || '').trim();
            if(linkArgStr && linkArgStr.length > 0)
            {
                let linkArgArray = linkArgStr.split(',');
                linkArgArray.forEach(
                    (arg: any) => {
                        let trimmedArg = arg.trim();
                        if(trimmedArg && trimmedArg.indexOf('.') > 0)
                        {
                            let colName = trimmedArg.substring(0, trimmedArg.indexOf('.'));
                            let colValue = feedData[colName];
                            pkFieldValue = pkFieldValue + (colValue != null ? colValue : '') + ':';
                        }
                    }
                );
            }
        }


        // Convert all values to strings for GWT getRowFeedData (HashMap<String, String>) compatibility
        let feedDataStr: any = {};
        if (feedData) {
            for (const key in feedData) {
                feedDataStr[key] = (feedData[key] != null && feedData[key] !== undefined) ? String(feedData[key]) : '';
            }
        }
        let firstFormDataStr: any = {};
        if (firstFormData) {
            for (const key in firstFormData) {
                firstFormDataStr[key] = (firstFormData[key] != null && firstFormData[key] !== undefined) ? String(firstFormData[key]) : '';
            }
        }

        let response = {
                "linkInfo" : link,
                "pkFieldValue" : pkFieldValue,
                "objName" : objName,
                "isAnyRowSelected": true,
                "feedData" : JSON.stringify(feedDataStr),
                "domId" : domId,
                "formNo":formNum.toString(),
                "firstFormData" : firstFormDataStr,
                "isFocusOrBlur":false
        }
        console.log("invokeLink response:", JSON.stringify(response));
        let linkInvoked = false;
        if (typeof invokeSimpleLayoutLink !== 'undefined')
        {
            console.log("invokeLink: calling invokeSimpleLayoutLink from current window");
            invokeSimpleLayoutLink(response);
            linkInvoked = true;
        }
        if (!linkInvoked)
        {
            try
            {
                if (window.parent && window.parent !== window && typeof (<any>window.parent).invokeSimpleLayoutLink === 'function')
                {
                    console.log("invokeLink: calling invokeSimpleLayoutLink from window.parent");
                    (<any>window.parent).invokeSimpleLayoutLink(response);
                    linkInvoked = true;
                }
            }
            catch(e)
            {
                console.warn("invokeLink: error accessing window.parent.invokeSimpleLayoutLink:", e);
            }
        }
        if (!linkInvoked)
        {
            try
            {
                if (window.top && window.top !== window && typeof (<any>window.top).invokeSimpleLayoutLink === 'function')
                {
                    console.log("invokeLink: calling invokeSimpleLayoutLink from window.top");
                    (<any>window.top).invokeSimpleLayoutLink(response);
                    linkInvoked = true;
                }
            }
            catch(e)
            {
                console.warn("invokeLink: error accessing window.top.invokeSimpleLayoutLink:", e);
            }
        }
        if (!linkInvoked)
        {
            console.warn("invokeSimpleLayoutLink is NOT available on window, window.parent, or window.top");
        }
    }

    invokeAction(link: any, feedData: any, objName: any, formNum: any, firstFormData: any, domId?: any)
    {
        let pkFieldValue = '';
        // GWT performAction() reads formNo / field_name in snake/lowercase from actionInfo,
        // so do NOT strip them here (unlike invokeLink which converts to PascalCase).
        if(feedData)
        {
            let linkArgStr = (link.LinkArg || link.link_arg || '').trim();
            if(linkArgStr && linkArgStr.length > 0)
            {
                let linkArgArray = linkArgStr.split(',');
                linkArgArray.forEach(
                    (arg: any) => {
                        let trimmedArg = arg.trim();
                        if(trimmedArg && trimmedArg.indexOf('.') > 0)
                        {
                            let colName = trimmedArg.substring(0, trimmedArg.indexOf('.'));
                            let colValue = feedData[colName];
                            pkFieldValue = pkFieldValue + (colValue != null ? colValue : '') + ':';
                        }
                    }
                );
            }
        }

        // System actions (summary page Add/Edit/etc.) don't carry link_arg, so the loop above
        // leaves pkFieldValue empty. Fall back to the PK the caller already stamped onto the
        // link (e.g. lastSavedTranId set as PK_VALUES/pkValues in invokeSummaryActionAsLink).
        if(!pkFieldValue || pkFieldValue.length === 0)
        {
            let pkFallback = link && (link.PK_VALUES || link.pkValues || link.pk_values);
            if(pkFallback != null && String(pkFallback).length > 0)
            {
                pkFieldValue = String(pkFallback) + ':';
            }
        }

        let feedDataStr: any = {};
        if (feedData) {
            for (const key in feedData) {
                feedDataStr[key] = (feedData[key] != null && feedData[key] !== undefined) ? String(feedData[key]) : '';
            }
        }
        let firstFormDataStr: any = {};
        if (firstFormData) {
            for (const key in firstFormData) {
                firstFormDataStr[key] = (firstFormData[key] != null && firstFormData[key] !== undefined) ? String(firstFormData[key]) : '';
            }
        }

        // GWT reads actionInfo fields via .isString().stringValue(); numbers/booleans throw NPE.
        // Coerce all primitive values (recursively for nested objects like service_code) to strings.
        const stringifyPrimitives = (val: any): any => {
            if (val === null || val === undefined) return '';
            if (typeof val === 'object') {
                if (Array.isArray(val)) return val.map(stringifyPrimitives);
                const out: any = {};
                for (const k in val) out[k] = stringifyPrimitives(val[k]);
                return out;
            }
            return String(val);
        };
        let linkStr: any = link ? stringifyPrimitives(link) : link;

        let response = {
                "actionInfo" : linkStr,
                "pkFieldValue" : pkFieldValue,
                "objName" : objName,
                "isAnyRowSelected": true,
                "feedData" : JSON.stringify(feedDataStr),
                "domId" : domId,
                "formNo":formNum.toString(),
                "firstFormData" : firstFormDataStr,
                "isFocusOrBlur":false
        }
        console.log("invokeAction response:", JSON.stringify(response));
        let actionInvoked = false;
        if (typeof invokeDashboardAction !== 'undefined')
        {
            console.log("invokeAction: calling invokeDashboardAction from current window");
            invokeDashboardAction(response);
            actionInvoked = true;
        }
        if (!actionInvoked)
        {
            try
            {
                if (window.parent && window.parent !== window && typeof (<any>window.parent).invokeDashboardAction === 'function')
                {
                    console.log("invokeAction: calling invokeDashboardAction from window.parent");
                    (<any>window.parent).invokeDashboardAction(response);
                    actionInvoked = true;
                }
            }
            catch(e)
            {
                console.warn("invokeAction: error accessing window.parent.invokeDashboardAction:", e);
            }
        }
        if (!actionInvoked)
        {
            try
            {
                if (window.top && window.top !== window && typeof (<any>window.top).invokeDashboardAction === 'function')
                {
                    console.log("invokeAction: calling invokeDashboardAction from window.top");
                    (<any>window.top).invokeDashboardAction(response);
                    actionInvoked = true;
                }
            }
            catch(e)
            {
                console.warn("invokeAction: error accessing window.top.invokeDashboardAction:", e);
            }
        }
        if (!actionInvoked)
        {
            console.warn("invokeDashboardAction is NOT available on window, window.parent, or window.top");
        }
    }

    getAllItemCode()
    {
        this.urlPath = this.getHostURL() + '/ibase/WebITMDocumentHandlerServlet?ACTION=GET_ALL_ITEM_CODE_LIST';
        return this.http.get(this.urlPath, { responseType: 'text', withCredentials: true });
    }
    
    getAllItemCodeList(jsonData:any)
    {
        this.urlPath = this.getHostURL() + '/ibase/WebITMDocumentHandlerServlet?ACTION=GET_ITEM_CODE_LIST';
        return this.http.post(this.urlPath, jsonData, { responseType: 'text', withCredentials: true });
    }

    trainTimeCodeAPI(jsonData:any)
    {
        this.urlPath = this.getHostURL() + '/ibase/WebITMDocumentHandlerServlet?ACTION=TRAIN_ITEM_CODE_API';
        return this.http.post(this.urlPath, jsonData, { responseType: 'text', withCredentials: true });
    }

    getExtractedDataOfDocument(docId:any)
    {
        this.urlPath = this.getHostURL() + '/ibase/WebITMDocumentHandlerServlet?ACTION=EXTRACT_DOCUMENT&DOC_ID=' + docId;
        return this.http.get(this.urlPath, { responseType: 'text', withCredentials: true });
    }

    getUserInfo():any
    {
        let data$ = this.http
        .get(`${this.getHostURL()+this.baseUrl}/getUserInfo`, { headers: this.getHeaders(), withCredentials: true })
        .pipe(map(res => res))
        .pipe(catchError(handleError));
        return data$;
    }
    private getHeaders()
    {
        let headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'TOKEN_ID': this.tokenID || '',
            'JSESSIONID': this.jSessionId || ''
        });
        return headers;
    }

    private SERVICE_URL1 = '/ibase/rest/dashboard/getActionsOption/'; 
    getActionData(objName:any ,callBack:any): any
    {
        let httpHeaders = { 'Content-Type': 'application/json',
            'TOKEN_ID' : this.tokenID,
            'JSESSIONID' : this.jSessionId
        };
        let serverUrl = this.getHostURL() +this.SERVICE_URL1 + objName.toLowerCase();
        // console.log("print serverUrl 768:::",serverUrl);
        this.httpRequetService.sendHttpRequest('GET', httpHeaders, serverUrl, '', (response: any) => 
        {   
            // console.log("print response 771:::",response);        
            callBack(response)
            return;
        });                   
    }

	invokeSimpleLink(feedData:any,domId:any,formNo:any,fieldName:any,objName: any,isFocusOrBlur:any,fldValue:any) 
	{
        let response = {
            "feedData" : feedData, 
            "domId" : domId,
            "formNo" : formNo,
            "fieldName" : fieldName,
            "objName" :objName,
            "isFocusOrBlur":isFocusOrBlur,
			"fldValue":fldValue,
        }
		// console.log("invokeSimpleLink response SimpleEditor service File 836: [",response);
        if (typeof invokeSimpleLayoutLink !== 'undefined')
        {
            invokeSimpleLayoutLink(response);
        }
        else if (window.parent && window.parent !== window && typeof (<any>window.parent).invokeSimpleLayoutLink === 'function')
        {
            (<any>window.parent).invokeSimpleLayoutLink(response);
        }
    }

    getServiceHandlerRequest(paramString:any, callBack:any) : any {
        this.urlPath = this.getHostURL() + this._url + paramString;
        // console.log('print this.urlPath 797:::::::',this.urlPath);
        // return this.http.get(this.urlPath, { responseType: 'text' });
        let httpHeaders = { 'Content-Type': 'application/json',
            'TOKEN_ID' : this.tokenID,
            'JSESSIONID' : this.jSessionId
        };
        // let serverUrl = this.getHostURL() +this.SERVICE_URL1 + objName.toLowerCase();
        this.httpRequetService.sendHttpRequest('GET', httpHeaders, this.urlPath, '', (response: any) => 
        {   
            // console.log("print response 803:::",response);        
            callBack(response)
            return;
        });
    }
    
    setSimpleLayoutDetailData(title:any, data: any, proResp: any)
    {
        // console.log("setSimpleLayoutDetailData response SimpleEditor service File 803 :: ",data);
        const dataResp = { title, data, proResp };
        this.dataSubject.next(dataResp);
    }

    private SERVICE_URL2 = '/ibase/rest/VisionOBJService/getAddData?';
    serverUrl = '';
    getAddData(objName:any, formNo: any, objContext: any, editorId: any, editFlag: any, pkValues: any, noOfForms: any, chgStr: any, coreMdlId: any, callBack:any): any
    {
        console.log('print getAddData jSessionId:::',this.jSessionId);
        console.log('print getAddData tokenID:::',this.tokenID);
        console.log('print getAddData objName:::',objName);
        console.log('print getAddData formNo:::',formNo);
        console.log('print getAddData objContext:::',objContext);
        console.log('print getAddData editorId:::',editorId);
        console.log('print getAddData editFlag:::',editFlag);
        console.log('print getAddData pkValues:::',pkValues);
        console.log('print getAddData noOfForms:::',noOfForms);
        console.log('print getAddData chgStr:::',chgStr);
        console.log('print getAddData coreMdlId:::',coreMdlId);

        // Build headers - only include JSESSIONID if it has a value
        let headerObj: any = {
            'Content-Type': 'application/json',
            'TOKEN_ID': this.tokenID || ''
        };
        if(this.jSessionId) {
            headerObj['JSESSIONID'] = this.jSessionId;
        }
        let httpHeaders = new HttpHeaders(headerObj);

        this.serverUrl = this.getHostURL() + this.SERVICE_URL2 + 'OBJ_NAME='+ objName +'&FORM_NO='+ formNo +'&OBJ_CONTEXT='+ objContext + '&EDITOR_ID='+ editorId +'&EDIT_FLAG='+ editFlag + '&PK_VALUES='+ (pkValues || '') + '&NO_OF_FORMS='+ (noOfForms || '1') + '&CHG_STR='+ (chgStr || '') + '&CORE_MDL_ID='+ (coreMdlId || '');

        // Use Angular HttpClient with observe: 'response' to capture headers and withCredentials: true
        this.http.get(this.serverUrl, {
            headers: httpHeaders,
            observe: 'response',
            withCredentials: true
        }).subscribe({
            next: (response: any) => {
                // Try to extract JSESSIONID from Set-Cookie header
                const setCookie = response.headers.get('Set-Cookie');
                if(setCookie) {
                    const match = setCookie.match(/JSESSIONID=([^;]+)/);
                    if(match && match[1]) {
                        console.log('print JSESSIONID from Set-Cookie header:::',match[1]);
                        this.jSessionId = match[1];
                        sessionStorage.setItem('JSESSIONID', match[1]);
                        document.cookie = `JSESSIONID=${match[1]}; path=/`;
                    }
                }

                // Parse the response body
                let responseData = response.body;
                if(typeof responseData === 'string') {
                    try {
                        responseData = JSON.parse(responseData);
                    } catch(e) {
                        // Not JSON
                    }
                }

                // Check for JSESSIONID in response body as well
                let jsessionId = responseData?.JSESSIONID || responseData?.jsessionId;
                if(!jsessionId && responseData?.data) {
                    jsessionId = responseData.data.JSESSIONID || responseData.data.jsessionId;
                }
                if(jsessionId) {
                    console.log('print JSESSIONID from response body:::',jsessionId);
                    this.jSessionId = jsessionId;
                    sessionStorage.setItem('JSESSIONID', jsessionId);
                    document.cookie = `JSESSIONID=${jsessionId}; path=/`;
                }

                callBack(responseData);
            },
            error: (error: any) => {
                console.error('getAddData error:', error);
                callBack({ status: 'error', message: error.message || 'Failed to load data' });
            }
        });
    }

    private SERVICE_URL3 = '/ibase/rest/VisionOBJService/getDetailObjData?';
    getDetailObjData(objName: any, objType: any,callBack:any)
    {
        let cacheKey = 'detailObjData_' + objName + '_' + objType;
        let cachedData = localStorage.getItem(cacheKey);
        if(cachedData) {
            try {
                let cachedResponse = JSON.parse(cachedData);
                console.log('getDetailObjData: returning cached response for', cacheKey);
                callBack(cachedResponse);
                return;
            } catch(e) {
                localStorage.removeItem(cacheKey);
            }
        }

        let headerObj: any = {
            'Content-Type': 'application/json',
            'TOKEN_ID': this.tokenID || ''
        };
        if(this.jSessionId) {
            headerObj['JSESSIONID'] = this.jSessionId;
        }
        let httpHeaders = new HttpHeaders(headerObj);
        let serverUrl = this.getHostURL() + this.SERVICE_URL3 + 'OBJ_NAME='+ objName +'&OBJ_TYPE='+ objType;
        this.http.get(serverUrl, { headers: httpHeaders, withCredentials: true }).subscribe({
            next: (response: any) => {
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(response));
                } catch(e) {
                    console.error('getDetailObjData: failed to cache response', e);
                }
                callBack(response);
            },
            error: (error: any) => {
                console.error('getDetailObjData error:', error);
                callBack({ status: 'error', message: error.message });
            }
        });
    }
    // validateAndNext(objName:any, chgData: any, objContext: any, editFlag: any, formNo: any, editor: any, domId: any, editorId: any, callBack:any): any
    validateAndNext(paramString:any) 
    {
        console.log('print validateAndNext jSessionId:::',this.jSessionId);
        // , text/plain, */*
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded',
            'TOKEN_ID' : this.tokenID,
            'JSESSIONID' : this.jSessionId
        });
        let URL = this.getHostURL() + '/ibase/rest/VisionOBJService/validateAndNext';
        console.log( "URL for validateAndNext method >>>>>" , URL );
        return this.http.post(URL, paramString, { headers, responseType: 'text', withCredentials: true });
    }

    validateAndSave(paramString: any)
    {
        console.log('print validateAndSave jSessionId:::', this.jSessionId);
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded',
            'TOKEN_ID' : this.tokenID,
            'JSESSIONID' : this.jSessionId
        });
        let URL = this.getHostURL() + '/ibase/rest/VisionOBJService/validateAndSave';
        console.log( "URL for validateAndSave method >>>>>" , URL );
        return this.http.post(URL, paramString, { headers, responseType: 'text', withCredentials: true });
    }

    getSummaryHtml(objName: string, tranId: string, editorId: string): Observable<any>
    {
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded',
            'TOKEN_ID' : this.tokenID,
            'JSESSIONID' : this.jSessionId
        });
        let body = 'OBJ_NAME=' + encodeURIComponent(objName || '')
            + '&TRAN_ID=' + encodeURIComponent(tranId || '')
            + '&EDITOR_ID=' + encodeURIComponent(editorId || '');
        let URL = this.getHostURL() + '/ibase/rest/VisionOBJService/getSummaryHtml';
        return this.http.post(URL, body, { headers, responseType: 'text', withCredentials: true });
    }

    private SERVICE_URL4 = '/ibase/rest/VisionOBJService/getXmlDataDetails?';
    getXmlDataDetails(objName:any, formNo: any, objContext: any, editorId: any, editFlag: any, action: any, pkValues: any, formType: any, lastDomId: any, pageContext: any, pgCtx: any, callBack:any): any
    {
        console.log('print getXmlDataDetails jSessionId:::',this.jSessionId);
        console.log('print getXmlDataDetails objName:::',objName);
        console.log('print getXmlDataDetails formNo:::',formNo);
        console.log('print getXmlDataDetails objContext:::',objContext);
        console.log('print getXmlDataDetails editorId:::',editorId);
        console.log('print getXmlDataDetails editFlag:::',editFlag);

        let headerObj: any = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'TOKEN_ID': this.tokenID || ''
        };
        if(this.jSessionId) {
            headerObj['JSESSIONID'] = this.jSessionId;
        }
        let httpHeaders = new HttpHeaders(headerObj);

        let serverUrl = this.getHostURL() + this.SERVICE_URL4 + 'OBJ_NAME='+ objName +'&OBJ_CONTEXT='+ objContext + '&EDIT_FLAG='+ editFlag + '&EDITOR_ID='+ editorId +'&ACTION='+ action +'&FORM_NO='+ formNo +'&PK_VALUES=' + pkValues + '&FORM_TYPE='+ formType + '&LAST_DOM_ID='+ lastDomId + '&PAGE_CONTEXT='+ pageContext + '&PG_CTX='+ pgCtx;
        this.http.get(serverUrl, { headers: httpHeaders, withCredentials: true }).subscribe({
            next: (response: any) => {
                callBack(response);
            },
            error: (error: any) => {
                console.error('getXmlDataDetails error:', error);
                callBack({ status: 'error', message: error.message });
            }
        });
    }

    private SERVICE_URL5 = '/ibase/rest/VisionOBJService/autoSearchPophelp?'; 
    getPophelpData(payLoad: any) 
    {
        console.log('print getPophelpData this.tokenID:::',this.tokenID);
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

        return this.http.post(URL, payLoad, { 
            headers: httpHeaders, 
            responseType: 'text', 
            withCredentials: true 
        });
    }

    // this.jSessionId+"."+this.hostName
    getFieldItemChange(paramString:any) 
    {
        console.log('print getFieldItemChange hostName:::',this.hostName);
        // , text/plain, */*
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded',
            'TOKEN_ID' : this.tokenID,
            'JSESSIONID' : this.jSessionId
        });
        let URL = this.getHostURL() + '/ibase/rest/VisionOBJService/getFieldItemChange';
        console.log( "URL for getFieldItemChange method >>>>>" , URL );
        return this.http.post(URL, paramString, { headers, responseType: 'text', withCredentials: true });                      
    }

    validateAndDone(paramString:any) 
    {
        // , text/plain, */*
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded',
            'TOKEN_ID' : this.tokenID,
            'JSESSIONID' : this.jSessionId
        });
        let URL = this.getHostURL() + '/ibase/rest/VisionOBJService/validateAndDone';
        console.log( "URL for getFieldItemChange method >>>>>" , URL );
        return this.http.post(URL, paramString, { headers, responseType: 'text', withCredentials: true });                      
    }

    validateAndDelete(paramString:any) 
    {
        // , text/plain, */*
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded',
            'TOKEN_ID' : this.tokenID,
            'JSESSIONID' : this.jSessionId
        });
        let URL = this.getHostURL() + '/ibase/rest/VisionOBJService/validateAndDelete';
        console.log( "URL for validateAndDelete method >>>>>" , URL );
        return this.http.post(URL, paramString, { headers, responseType: 'text', withCredentials: true });                      
    }

    private SERVICE_URL = '/ibase/rest/VisionOBJService/getObjData?';
    getObjData(objName:any, callBack:any): any
    {
        console.log('print getObjData jSessionId:::',this.jSessionId);
        console.log('print getObjData objName:::',objName);

        let cacheKey = 'objData_' + objName;
        let cachedData = localStorage.getItem(cacheKey);
        if(cachedData) {
            try {
                let cachedResponse = JSON.parse(cachedData);
                console.log('getObjData: returning cached response for', cacheKey);
                callBack(cachedResponse);
                return;
            } catch(e) {
                localStorage.removeItem(cacheKey);
            }
        }

        let headerObj: any = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'TOKEN_ID': this.tokenID || ''
        };
        if(this.jSessionId) {
            headerObj['JSESSIONID'] = this.jSessionId;
        }
        let httpHeaders = new HttpHeaders(headerObj);

        let serverUrl = this.getHostURL() + this.SERVICE_URL + 'OBJ_NAME='+ objName +'&OBJ_TYPE=T';
        this.http.get(serverUrl, { headers: httpHeaders, withCredentials: true }).subscribe({
            next: (response: any) => {
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(response));
                } catch(e) {
                    console.error('getObjData: failed to cache response', e);
                }
                callBack(response);
            },
            error: (error: any) => {
                console.error('getObjData error:', error);
                callBack({ status: 'error', message: error.message });
            }
        });
    }

    getPreValidate(payLoad: any) 
    {
        console.log('Request payLoad:::::', payLoad);
        let headerObj: any = {
            'Content-Type': 'application/json',
            'TOKEN_ID': this.tokenID || ''
        };
        if(this.jSessionId) {
            headerObj['JSESSIONID'] = this.jSessionId;
        }
        let httpHeaders = new HttpHeaders(headerObj);
        let URL = this.getHostURL() + '/ibase/rest/VisionOBJService/preValidate';
        
        return this.http.post(URL, payLoad, { 
            headers: httpHeaders, 
            responseType: 'text', 
            withCredentials: true 
        });
    }

    getDataWithHeaders(): Observable<HttpResponse<any>> {
        return this.http.get<any>(this.serverUrl, { observe: 'response', withCredentials: true });
    }

    checkErrorExceptionJson(response:any, callback:any,validationKey?:any)
    {
        try
        {
            // Clear previous alert queues before processing new response
            this.alertMsgList = [];
            this.typeofAlertList = [];
            this.errorColumnNameList = [];

            // Server may pack a summary payload as "<saveJson>~#~<xsl>~#~<xml>". Parse only the JSON prefix.
            let jsonPart = response;
            if(typeof response === 'string')
            {
                const sep = response.indexOf('~#~');
                if(sep !== -1) jsonPart = response.substring(0, sep);
            }
            let resp = JSON.parse(jsonPart);

            // Handle token expired / Reject response
            if(resp['status'] && resp['status'] == 'Reject')
            {
                this.setLoading(false);
                const errorMsg = (resp['data'] && resp['data']['message']) ? resp['data']['message'] : 'Session rejected. Please sign in again.';
                console.error('checkErrorExceptionJson Reject:', errorMsg);
                this.showAlert(errorMsg, 'E', '', (res:any) => {
                    callback(res);
                });
                return;
            }

            // Handle exception response without nested Errors
            if(resp['status'] && resp['status'] == 'exception' && !(resp['data'] && resp['data']['Root'] && resp['data']['Root']['Errors']) && !(resp['Root'] && resp['Root']['Errors']))
            {
                this.setLoading(false);
                const errorMsg = 'System Exception';
                console.error('checkErrorExceptionJson exception:', errorMsg);
                this.showAlert(errorMsg, 'E', '', (res:any) => {
                    callback(res);
                });
                return;
            }

            // Check for Errors in both data.Root.Errors (wrapped) and Root.Errors (direct REST API response) paths
            let errorsObj = null;
            if(resp['data'] && resp['data']['Root'] && resp['data']['Root']['Errors'])
            {
                errorsObj = resp['data']['Root']['Errors'];
            }
            else if(resp['Root'] && resp['Root']['Errors'])
            {
                errorsObj = resp['Root']['Errors'];
            }
            if(errorsObj)
            {
                let firstErrorShown = false;
                let errorDataList: any[] = [];

                // Handle indexed errors format: Errors[1]['error'], Errors[2]['error'], ...
                if(errorsObj[1] && errorsObj[1]['error'])
                {
                    for (let errIdx = 1; errorsObj[errIdx] && errorsObj[errIdx]['error']; errIdx++) {
                        let errItem = errorsObj[errIdx]['error'];
                        if(Array.isArray(errItem))
                        {
                            errorDataList.push(...errItem);
                        }
                        else
                        {
                            errorDataList.push(errItem);
                        }
                    }
                }
                // Handle direct error format: Errors['error'] (could be a single object or an array)
                else if(errorsObj['error'])
                {
                    let errItem = errorsObj['error'];
                    if(Array.isArray(errItem))
                    {
                        errorDataList.push(...errItem);
                    }
                    else
                    {
                        errorDataList.push(errItem);
                    }
                }

                if(errorDataList.length === 0)
                {
                    callback(false);
                    return;
                }

                for (let errIdx = 0; errIdx < errorDataList.length; errIdx++) {
                    let errorData = errorDataList[errIdx];
                    let msg = errorData['message'];
                    let trace = errorData['trace'];
                    let errorColName = errorData['column_name'];
                    let errorType:any = (errorData['type'] || errorData['@type'] || '')[0];
                    let errorId:any = errorData['id'] || errorData['@id'];
                    let descr:any = errorData['description'];

                    let formNo:any = "1";
                    let errorMessage:any = msg;
                    if (descr) {
                        errorMessage = msg + "<br><br>" + descr;
                    }
                    if (!errorMessage) {
                        errorMessage = "An unknown error occurred";
                    }
                    if( (this.isFromAttachPdf && validationKey != null && errorType != 'P') || (this.isFromAttachForFirstForm && validationKey != null && errorType != 'P' ))
                    {
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
                        if (errorType == 'E' || errorType == 'X')
                        {
                            this.setLoading(false);
                            errorMessage = errorMessage + '%%TRACEMESSAGE%%' +  errorId+'%%SEP%%'+trace;
                            if( firstErrorShown || document.getElementById('popup_content'))
                            {
                                this.alertMsgList.push(errorMessage);
                                this.typeofAlertList.push('E');
                                this.errorColumnNameList.push(errorColName);
                            }
                            else
                            {
                                firstErrorShown = true;
                                this.showAlert(errorMessage, 'E', errorColName, (res:any) => {
                                    try
                                    {
                                        callback(res);
                                    }
                                    catch(e:any)
                                    {
                                        console.error('[checkErrorExceptionJson] E callback error:', e.message);
                                    }
                                    return;
                                });
                            }
                        }
                        else if (errorType == 'W')
                        {
                            this.setLoading(false);
                            if( firstErrorShown || document.getElementById('popup_content'))
                            {
                                this.alertMsgList.push(errorMessage);
                                this.typeofAlertList.push('W');
                                this.errorColumnNameList.push(errorColName);
                            }
                            else
                            {
                                firstErrorShown = true;
                                this.showAlert(errorMessage, 'W', errorColName, (res:any) => {
                                    callback(res);
                                    return;
                                });
                            }
                        }
                        else if (errorType == 'P')
                        {
                            if( firstErrorShown || document.getElementById('popup_content'))
                            {
                                this.alertMsgList.push(errorMessage);
                                this.typeofAlertList.push('P');
                                this.errorColumnNameList.push(errorColName);
                            }
                            else
                            {
                                firstErrorShown = true;
                                this.showAlert(errorMessage, 'P', errorColName, (res:any) => {
                                    callback(res);
                                    return;
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

                // If errors were queued but no showAlert was triggered (e.g. a popup was already open),
                // process the first queued error now so callback eventually fires
                if(!firstErrorShown && this.alertMsgList.length > 0)
                {
                    this.setLoading(false);
                    let msg = this.alertMsgList[0];
                    let type = this.typeofAlertList[0];
                    let colName = this.errorColumnNameList[0];
                    this.alertMsgList.splice(0,1);
                    this.typeofAlertList.splice(0,1);
                    this.errorColumnNameList.splice(0,1);
                    this.showAlert(msg, type, colName, (res:any) => {
                        callback(res);
                    });
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
            console.error('Exception inside checkErrorExceptionJson method ', e.message);
            this.setLoading(false);
            callback(false);
        }
    }

    // REST API method for Default action (WebITMServiceHandlerServlet3)
    getDefaultData(payLoad: any, callBack: any)
    {
        let headerObj: any = {
            'Content-Type': 'application/json',
            'TOKEN_ID': this.tokenID || ''
        };
        if(this.jSessionId) {
            headerObj['JSESSIONID'] = this.jSessionId;
        }
        let httpHeaders = new HttpHeaders(headerObj);
        let URL = this.getHostURL() + '/ibase/rest/VisionOBJService/getDefaultData';
        this.http.post(URL, payLoad, {
            headers: httpHeaders,
            responseType: 'text',
            withCredentials: true
        }).subscribe({
            next: (response: any) => {
                callBack(response);
            },
            error: (error: any) => {
                console.error('getDefaultData error:', error);
                callBack(null);
            }
        });
    }

    // REST API method for USER_ACTION (WebITMRequestHandlerServlet)
    getUserAction(payLoad: any, callBack: any)
    {
        let headerObj: any = {
            'Content-Type': 'application/json',
            'TOKEN_ID': this.tokenID || ''
        };
        if(this.jSessionId) {
            headerObj['JSESSIONID'] = this.jSessionId;
        }
        let httpHeaders = new HttpHeaders(headerObj);
        let URL = this.getHostURL() + '/ibase/rest/VisionOBJService/getUserAction';
        this.http.post(URL, payLoad, {
            headers: httpHeaders,
            responseType: 'text',
            withCredentials: true
        }).subscribe({
            next: (response: any) => {
                callBack(response);
            },
            error: (error: any) => {
                console.error('getUserAction error:', error);
                callBack(null);
            }
        });
    }

    // REST API method for USER_ACTION_SET_DATA (WebITMRequestHandlerServlet)
    getUserActionSetData(payLoad: any, callBack: any)
    {
        let headerObj: any = {
            'Content-Type': 'application/json',
            'TOKEN_ID': this.tokenID || ''
        };
        if(this.jSessionId) {
            headerObj['JSESSIONID'] = this.jSessionId;
        }
        let httpHeaders = new HttpHeaders(headerObj);
        let URL = this.getHostURL() + '/ibase/rest/VisionOBJService/getUserActionSetData';
        this.http.post(URL, payLoad, {
            headers: httpHeaders,
            responseType: 'text',
            withCredentials: true
        }).subscribe({
            next: (response: any) => {
                callBack(response);
            },
            error: (error: any) => {
                console.error('getUserActionSetData error:', error);
                callBack(null);
            }
        });
    }

    // REST API method for SET_DETAIL_DATA (WebITMRequestHandlerServlet)
    setDetailData(payLoad: any, callBack: any)
    {
        let headerObj: any = {
            'Content-Type': 'application/json',
            'TOKEN_ID': this.tokenID || ''
        };
        if(this.jSessionId) {
            headerObj['JSESSIONID'] = this.jSessionId;
        }
        let httpHeaders = new HttpHeaders(headerObj);
        let URL = this.getHostURL() + '/ibase/rest/VisionOBJService/setDetailData';
        this.http.post(URL, payLoad, {
            headers: httpHeaders,
            responseType: 'text',
            withCredentials: true
        }).subscribe({
            next: (response: any) => {
                callBack(response);
            },
            error: (error: any) => {
                console.error('setDetailData error:', error);
                callBack(null);
            }
        });
    }

}
function handleError (error: any)
{
	let errorMsg = error.message || "There is a problem while connecting with server.";
	console.error(errorMsg);
    return throwError(errorMsg);
}
export function getHostURL(): string 
{
    let HOST_URL: string = '';

    HOST_URL = localStorage.getItem( 'HOST_URL' );

    if ( !HOST_URL ) 
    {
       HOST_URL = ''; 
    }
    return HOST_URL;
}
