import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { BBConfirmBoxComponent } from '../bb-confirm-box';

declare var getBBHostURL: any;
declare let requestData: any;

@Injectable()
export class HttpRequestService {
    urlPath: string | any;
    // _url: string = "/ibase/WEBITMRIARequestHandlerServlet?";
    //Added by shrutika on 10-04-2020[Start] for getting first Call browser data
    confirmBox: any = null;
    bbconfirmBox: any = null;//added by mayuri 1 mar 2024
    isForcedSave: boolean = false;
    columnNaame = null;
    alertMsgList: any = [];
    typeofAlertList: any = [];
    errorColumnNameList: any = [];
    errorRowsList = [];

    allValidationResponse = {};
    //Added by sunny soni for test[Start]
    isBrowser: boolean = false;
    isNative: boolean = false;
    httpMethod: any = null;
    httpHeaders: any = null;


    constructor(private http: HttpClient, public dialog: MatDialog) {
        this.bbconfirmBox = new BBConfirmBoxComponent(dialog);
    }

    isForceSave() {
        return this.isForcedSave;
    }

    setForcedSave(forceSave: any) {
        this.isForcedSave = forceSave;
    }

    getEncodedParamString(paramMap: any): any {
        var encodedString = "";
        for (let k in paramMap) {
            var key = k;
            var value = paramMap[k];
            var encod = encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
            encodedString += encod;
        }
        encodedString = encodedString.substring(0, encodedString.length - 1);
        console.log("Mahesh encodedString :" + encodedString);
        return encodedString;
    }

    getHostURL(): string {
        var HOST_URL: string = '';
        HOST_URL != localStorage.getItem('HOST_URL');
        if (!HOST_URL) HOST_URL = '';
        return HOST_URL;
    }

    getErrorOfJsonData(viewDataResponse: any) {
        var errorArr: any = [];
        var errorObj = JSON.parse(viewDataResponse);
        var errorData = errorObj.Errors;
        try {
            var msg = errorData['error']['message'] + '\n';
            errorArr[0] = msg;
        }
        catch {
            console.log('error while getting errorMsg>>');
            errorArr[0] = "";
        }
        try {
            var trace = errorData['error']['trace'] + '\n';
            errorArr[1] = trace;
        }
        catch {
            console.log('error while getting errorTrace>>');
            errorArr[0] = "";
        }
        try {
            var descr = errorData['error']['description'] + '\n';
            errorArr[2] = descr;
        }
        catch {
            console.log('error while getting errorDescr>>');
            errorArr[0] = "";
        }
        return errorArr;
    }

    getErrorData(viewDataResponse: any): any {
        var errorArr: any = [];
        var errorDom = new Document();
        var parser = new DOMParser();
        errorDom = parser.parseFromString(viewDataResponse, "text/xml");
        console.log('getErrorData xmlDoc>>>>>1.....', errorDom.lastElementChild!.lastChild);
        try {
            var msg = errorDom.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            errorArr[0] = msg;
        }
        catch {
            console.log('error while getting errorMsg>>');
            errorArr[0] = "";
        }
        try {
            var trace = errorDom.getElementsByTagName("trace")[0].childNodes[0].nodeValue;
            errorArr[1] = trace;
        }
        catch {
            console.log('error while getting errorTrace>>');
            errorArr[1] = "";
        }
        try {
            var descr = errorDom.getElementsByTagName("description")[0].childNodes[0].nodeValue;
            errorArr[2] = descr;
        }
        catch {
            console.log('error while getting errorDescr>>');
            errorArr[2] = "";
        }
        return errorArr;
    }

    getErrorMsg(msg: any, msgDescr: any, msgTrace: any) {
        console.log(' in getErrorMsg');
        var response = "";
        response = msg + "\n" + msgTrace + "\n" + msgDescr;
        return response;
    }

    setLoading(flag: boolean) {
        try {
            (<any>window.parent).setLoading(flag);
        }
        catch {
            console.log('window.setLoading is not a function!!');
        }
    }
    //Added by sunny soni for test[Start]
    isJsonParsable(jsonString: string): boolean {
        try {
            JSON.parse(jsonString);
        }
        catch (e) {
            return false;
        }
        return true;
    }
    sendHttpRequest(httpMethod: any, httpHeaders: any, httpURL: any, paramStr: any, callback: any) {
        if (httpMethod) {
            httpMethod = httpMethod.toUpperCase();
            this.httpMethod = httpMethod;
        }
        if (httpHeaders) {
            if (this.isJsonParsable(httpHeaders)) {
                httpHeaders = JSON.parse(httpHeaders);
            }
            this.httpHeaders = httpHeaders;
        }
        this.sendRequest(httpURL, paramStr, callback);
    }
    //Added by sunny soni for test[End]

    sendRequest(url: any, paramString: any, cllback: any) {
        try {
            var returnRes;
            //Added by sunny soni for test[Start]
            // if (window["NATIVE"]) {
            if ((window as any)["NATIVE"]) {
                // if (window["NATIVE"]["ISNATIVE"]) {
                if ((window as any)["NATIVE"]["ISNATIVE"]) {
                    // this.isNative = window["NATIVE"]["ISNATIVE"];   
                    this.isNative = (window as any)["NATIVE"]["ISNATIVE"];
                }
            }
            if (!this.isNative) {
                let headers = new HttpHeaders(this.httpHeaders);
                if ('POST' == this.httpMethod) {
                    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
                    this.http.post(url, paramString, { headers, responseType: 'text' }).subscribe(resp => {
                        //this.handledResponse(resp, url, paramString, cllback);  
                        // cllback(resp);    
                        //added by mayuri 1 mar 2024 start  
                        this.checkErrorException(resp, (res: any) => {
                            console.log('checkErrorException sendRequest res 219::::', res);
                            if (res) {
                                console.log('checkErrorException sendRequest isForceSave 221::::', this.isForceSave());
                                if (this.isForceSave()) {
                                    paramString = paramString + "&FORCESAVE=true";
                                    this.sendRequest(url, paramString, cllback);
                                }
                                else {
                                    returnRes = resp + '%%SEP%%' + res + '%%SEP%%' + this.columnNaame;
                                    console.log('checkErrorException sendRequest returnRes 228::::', returnRes);
                                    cllback(returnRes);
                                }
                            }
                            else {
                                returnRes = resp + '%%SEP%%' + res + '%%SEP%%' + this.columnNaame;
                                console.log('checkErrorException sendRequest returnRes 234::::', returnRes);
                                cllback(returnRes);
                            }
                        });
                        //added by mayuri 1 mar 2024 end
                    });
                }
                else {
                    var options = { headers: headers };
                    this.http.get<any>(url, options).subscribe(response => {
                        cllback(response);
                    });
                }
            }
            else {
                this.sendRequestFromNative(url, paramString, cllback);
            }
            //Added by sunny soni for test[End]            
        }
        catch (e: any) {
            console.log('Exception inside sendRequest:: ', e.message);
        }
    }
    checkErrorException(response: any, callback: any) {
        try {
            var errorDom = new Document();
            var parser = new DOMParser();
            if (response.indexOf('error') != -1) {
                var res = response.toUpperCase()
                if (res.toUpperCase().indexOf('<ROOT>') == -1) {
                    response = '<root>' + response + '</root>';
                }

                errorDom = parser.parseFromString(response, "text/xml");
                var errorType;
                var errorId;
                var msg: any = "";
                var descr: any = "";
                var trace: any = "";
                var errorColName;
                var errorLen = errorDom.getElementsByTagName("Errors").length;
                var errorsElements = errorDom.getElementsByTagName('Errors');
                if (errorLen == 0) {
                    callback(false);
                    return;
                }
                for (var i = 0; i < errorLen; i++) {
                    let errorElement = errorsElements[i].getElementsByTagName('error')[0];
                    if (errorElement != null) {
                        errorColName = errorElement.getAttribute("column_name");
                        errorType = errorElement.getAttribute("type");
                        errorId = errorElement.getAttribute("id");

                        if (errorElement.getElementsByTagName("message")[0] != null) {
                            msg = errorElement.getElementsByTagName("message")[0].textContent;
                        }

                        if (errorElement.getElementsByTagName("description")[0] != null) {
                            descr = errorElement.getElementsByTagName("description")[0].textContent;
                        }

                        if (errorElement.getElementsByTagName("trace")[0] != null) {
                            trace = errorElement.getElementsByTagName("trace")[0].textContent;
                        }
                        var formNo = "";
                        var errorMessage = msg + "<br><br>" + descr;
                        if (errorType == 'E' || errorType == 'X') {
                            this.setLoading(false);
                            errorMessage = errorMessage + '%%TRACEMESSAGE%%' + errorId + '%%SEP%%' + trace;
                            if (document.getElementById('popup_content')) {
                                this.alertMsgList.push(errorMessage);
                                this.typeofAlertList.push('E');
                                this.errorColumnNameList.push(errorColName);
                            }
                            else {
                                this.showAlert(errorMessage, 'E', errorColName, (res: any) => {
                                    callback(res);
                                    return;
                                });
                            }
                        }
                        else if (errorType == 'W') {
                            this.setLoading(false);
                            if (document.getElementById('popup_content')) {
                                this.alertMsgList.push(errorMessage);
                                this.typeofAlertList.push('W');
                                this.errorColumnNameList.push(errorColName);
                            }
                            else {
                                this.showAlert(errorMessage, 'W', errorColName, (res: any) => {
                                    console.log("print line no 309 res", res);
                                    callback(res);
                                    return;
                                });
                            }
                        }
                        else if (errorType == 'P') {
                            this.setLoading(false);
                            if (document.getElementById('popup_content')) {
                                this.alertMsgList.push(errorMessage);
                                this.typeofAlertList.push('P');
                                this.errorColumnNameList.push(errorColName);
                            }
                            else {
                                this.showAlert(errorMessage, 'P', errorColName, (res: any) => {
                                    callback(res);
                                    return;
                                });
                            }
                        }
                        else {
                            console.log('Inside checkErrorException........344');
                            callback(true);
                            return;
                        }
                    }
                    else {
                        console.log("setLoading false ::: ")
                        this.setLoading(false);
                    }
                }
            }
            else {
                console.log("print line no 383 ....");
                callback(false);
                return;
            }
        }
        catch (e: any) {
            console.log('Exception inside checkErrorException method 390:::::::', e.message);
        }
    }

    showAlert(errorMessage: any, errorType: any, errorColName: any, callback: any) {
        this.columnNaame = errorColName;
        try {
            if (errorType == 'E') {
                errorMessage = errorMessage.split('%%TRACEMESSAGE%%');
                var msg = errorMessage[0];
                var traceMsg = errorMessage[1];
                // this.confirmBox.alert('Error', msg,traceMsg).subscribe((resp:any) => {
                this.bbconfirmBox.alert('Error', msg, traceMsg).subscribe((resp: any) => {
                    this.setLoading(false);
                    if (resp) {
                        this.setForcedSave(false);
                        callback(true);
                        return;
                    }
                });
            }
            else if (errorType == 'W') {
                // this.confirmBox.confirm("confirm", errorMessage).subscribe((resp:any) => {
                this.bbconfirmBox.confirm("bbconfirmBox", errorMessage, (resp: any) => {
                    if (resp == 'YES') {
                        this.setForcedSave(true);
                        if (this.alertMsgList.length > 0) {
                            var msg = this.alertMsgList[0];
                            var type = this.typeofAlertList[0];
                            var colName = this.errorColumnNameList[0];
                            this.alertMsgList.splice(0, 1);
                            this.typeofAlertList.splice(0, 1);
                            this.errorColumnNameList.splice(0, 1);
                            this.showAlert(msg, type, colName, callback);
                        }
                        else {
                            this.setLoading(true);
                            callback(true);
                            return;
                        }
                    }
                    else if (resp == 'NO') {
                        this.setForcedSave(false);
                        this.setLoading(true);
                        callback(true);
                        return;
                    }
                });
            }
            else if (errorType == 'P') {
                // this.confirmBox.alert('Prompt', errorMessage).subscribe((result:any)=> {
                this.bbconfirmBox.confirm("Prompt", errorMessage, (result: any) => {
                    this.setLoading(false);
                    if (result) {
                        this.setForcedSave(false);
                        if (this.alertMsgList.length > 0) {
                            var msg = this.alertMsgList[0];
                            var type = this.typeofAlertList[0];
                            var colName = this.errorColumnNameList[0];
                            this.alertMsgList.splice(0, 1);
                            this.typeofAlertList.splice(0, 1);
                            this.errorColumnNameList.splice(0, 1);
                            this.showAlert(msg, type, colName, callback);
                        }
                        else {
                            callback(false);
                            return;
                        }
                    }
                });
            }
            else {
                callback(false);
                return;
            }
        }
        catch (e: any) {
            console.log('Exception inisde showAlert method ', e.message);
        }
    }

    //Added by sunny soni for test[Start]
    sendRequestFromNative(url: any, paramString: any, callback: any) {
        try {
            var success = (result: any) => {
                callback(result);
                //this.handledResponse(result, url, paramString, callback);
            };
            var error = (err: any) => {
                callback(err);
            };
            // console.log('[sendRequestFromNative] Plugin calling', window["plugins"]);
            console.log('[sendRequestFromNative] Plugin calling', (window as any)["plugins"]);
            // window["plugins"]["httpRequestHandler"].requestData(success, error, [url, paramString, this.httpMethod]);
            (window as any)["plugins"]["httpRequestHandler"].requestData(success, error, [url, paramString, this.httpMethod]);
        }
        catch (ex: any) {
            console.log('[sendRequestFromNative] Exception is:: ', ex.message);
        }
    }
    handledResponse(responseData: any, url: any, paramString: any, callback: any) {
        try {
            var returnRes;
            this.checkErrorException(responseData, (result: any) => {
                if (result) {
                    if (this.isForceSave()) {
                        if (paramString) {
                            paramString = paramString + "&FORCESAVE=true";
                        }
                        this.sendRequest(url, paramString, callback);
                    }
                    else {
                        returnRes = responseData + '%%SEP%%' + result + '%%SEP%%' + this.columnNaame;
                        callback(returnRes);
                    }
                }
                else {
                    returnRes = responseData + '%%SEP%%' + result + '%%SEP%%' + this.columnNaame;
                    callback(returnRes);
                }
            });
        }
        catch (ex: any) {
            console.log('Exception inside handledResponse:: ', ex.message);
        }
    }
    //Added by sunny soni for test[End]
}