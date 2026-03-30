import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
// import { ConfirmBoxComponent } from 'base-blocks';
// import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatDialog } from '@angular/material/dialog';
import { HttpRequestService } from '../httpRequest';

const serviceUrl = '/ibase/rest/GenProcessPreviewService';
declare var getBBHostURL: any;

@Injectable({ providedIn: 'root'})
export class BBGridsterService {
//   isForcedSave: boolean = false;
//   alertMsgList:any = [];
//   typeofAlertList:any = [];
//   errorColumnNameList:any = [];
//   columnNaame:any = null;
//   confirmBox:any = null;
//   public baseUrl: string = serviceUrl;
    public baseUrl: string = serviceUrl;
    urlPath: string | any;
    confirmBox:any = null;
    isForcedSave: boolean = false;
    columnNaame:any = null;
    alertMsgList:any = [];
    typeofAlertList:any = [];
    errorColumnNameList:any = [];
    errorRowsList:any = [];
    allValidationResponse:any = {};
    isFromAttachPdf: boolean = false;

  constructor(private http: HttpClient,public dialog: MatDialog, public httpRequetService: HttpRequestService) 
    {
        // this.confirmBox = new ConfirmBoxComponent(dialog);
    }
    getPositions():Observable<any>{
        return new Observable(observer=>{
    
           setTimeout(()=>{
            if(localStorage.getItem('positions')){
               observer.next(JSON.parse(localStorage.getItem('positions')!))
     
            } else { //default data
             
                observer.next( [   
                      {cols: 6, rows: 8, y: 0, x: 6},
                      {cols: 6, rows: 8, y: 0, x: 0},
                      {cols: 6, rows: 8, y: 8, x: 0},
                      {cols: 6, rows: 8, y: 8, x: 6},
                      {cols: 4, rows: 16, y: 0, x: 12}
                ]);
             
            }
           },1000);
        });
      }
      savePositions(positions){
        localStorage.setItem('positions', JSON.stringify(positions))
      }
      isForceSave()
    {
        return this.isForcedSave;
    }

    setForcedSave(forceSave:any) 
    {
        this.isForcedSave = forceSave;
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
        var HOST_URL: any = '';
        HOST_URL = localStorage.getItem('HOST_URL');
        if (!HOST_URL) HOST_URL = '';
        return HOST_URL;
    }

    getErrorOfJsonData(viewDataResponse: any) 
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

    getErrorData(viewDataResponse: any): any 
    {
        var errorArr:any = [];
        var errorDom: any = new Document();
        var parser: any = new DOMParser();
        errorDom = parser.parseFromString(viewDataResponse, "text/xml");
        console.log('getErrorData xmlDoc>>>>>1.....', errorDom.lastElementChild.lastChild);
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

    getErrorMsg(msg: any, msgDescr: any, msgTrace: any) 
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


    sendRequest(url: any, paramString: any, cllback: any) 
    {
        try 
        {
            console.log('Print inisde sendRequestNew Mahesh New');
            var returnRes;
            let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
            this.http.post(url, paramString, { headers, responseType: 'text' }).subscribe(resp => {
                console.log('Print the data inisde subscribe');
                this.checkErrorException(resp, (res: any) => {
                  console.log('checkErrorException..............177',res);
                if (res) {
                  if (this.isForceSave()) {
                    paramString = paramString + "&FORCESAVE=true";
                    this.sendRequest(url, paramString, cllback);
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
              });
            });
        }
        catch (e: any) 
        {
            console.log('Exception inside sendRequest:: ', e.message);
        }
    }

    checkErrorException(response: any, callback: any) 
    {
        console.log('Inside checkErrorException.........201',response);
        try
        {
            console.log('Inside checkErrorException.........205');
            var errorDom = new Document();
            var parser = new DOMParser();
            if (response.indexOf('Errors') != -1) 
            {
                errorDom = parser.parseFromString(response, "text/xml");
                var errorType: any;
                var errorId: any;
                var msg: any = "";
                var descr: any = "";
                var trace: any = "";
                var errorColName: any;
                var errorLen: any = errorDom.getElementsByTagName("error").length;
                console.log('Inside checkErrorException.........errorLen',errorLen);
                if( errorLen == 0 )
                {
                     callback(false);
                    return;
                }
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
                    var formNo = "";
                    var errorMessage = msg + "<br><br>" + descr;
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
                            console.log('call showAlert........298');
                            this.showAlert(errorMessage, 'E', errorColName, (res: any) => {
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
                            this.showAlert(errorMessage, 'W', errorColName, (res: any) => {
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
                            this.showAlert(errorMessage, 'P', errorColName, (res: any) => {
                                callback(res);
                                return;
                            });
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
        catch (e: any)
        {
            console.log('Exception inisde checkErrorException method ', e.message);
        }
    }

    showAlert(errorMessage: any, errorType: any, errorColName: any, callback: any)
    {
        this.columnNaame = errorColName;
        try
        {
            if( errorType == 'E' )
            {
                errorMessage = errorMessage.split('%%TRACEMESSAGE%%');
                var msg = errorMessage[0];
                var traceMsg = errorMessage[1];
                this.confirmBox.alert('Error', msg,traceMsg).subscribe((resp: any) => {
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
                this.confirmBox.confirm("confirm", errorMessage).subscribe((resp: any) => {
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
                this.confirmBox.alert('Prompt', errorMessage).subscribe((result: any) => {
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

    callWebservice ( paramString: any, data: any): Observable<any>
    {
        try 
        {
            var metadataUrl = this.getHostURL() + paramString;  
            console.log( "getDashboardMetadata>>>>>" + metadataUrl); 
             console.log("##### onValidation rest service ==>", metadataUrl);
            let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
            let options = {headers: headers};
            return this.http.post<any>( metadataUrl, JSON.stringify(data) , options) 
            .pipe(map( (res: any) => this.extractData(res) ));
           
        }
        catch (e: any) 
        {
            console.log('Exception inside sendRequest:: ', e.message);
        }
    }

      
    private extractData(res: HttpResponse<any>) 
    {
        console.log('extractData[' + JSON.stringify(res) + ']');
        return res || { };
    }

    callRequest(url: any, paramString: any) : Observable <any>
    {
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        return this.http.post(url, paramString, { headers, responseType: 'text' });
    }

    getUserInfo():any
    {
        let data$ = this.http
        .get(`${getHostURL()+this.baseUrl}/getUserInfo`, { headers: this.getHeaders()})
        .pipe(map(res => res))
        .pipe(catchError(handleError));
        console.log("user info in service -- > " , data$)
        return data$;
    }

     getHeaders()
    {
        let headers = new HttpHeaders();
        headers.append('Accept',  'application/x-www-form-urlencoded');
        return headers;
    }
    
    private SERVICE_URL = '/ibase/rest/dashboard/getLinkOption/'; 
    getLinkData(objName:any ,callBack:any): any
    {
        var httpHeaders = { 'Content-Type': 'application/json' }; 
        var serverUrl = this.getHostURL() +this.SERVICE_URL + objName.toLowerCase();
        console.log("print serverUrl:::471",serverUrl);
        this.httpRequetService.sendHttpRequest('GET', httpHeaders, serverUrl, '', (response: any) => 
        {   console.log("print response:::473",response);        
        callBack(response)
        return;
    });                   
}

private SERVICE_URL1 = '/ibase/rest/dashboard/getActionsOption/'; 
getActionData(objName:any ,callBack:any): any
{
            let httpHeaders = { 'Content-Type': 'application/json' }; 
            let serverUrl = this.getHostURL() +this.SERVICE_URL1 + objName.toLowerCase();
            console.log("print serverUrl 502:::",serverUrl);
            this.httpRequetService.sendHttpRequest('GET', httpHeaders, serverUrl, '', (response: any) => 
            {   console.log("print response 504:::",response);        
                callBack(response)
                return;
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
    console.log( 'getHostURL[', HOST_URL, ']' );
    return HOST_URL;
}