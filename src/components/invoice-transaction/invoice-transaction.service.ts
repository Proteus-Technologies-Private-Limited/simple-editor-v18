import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs/Observable';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { catchError, map, Observable, throwError } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { ConfirmBoxComponent } from 'base-blocks';
import { MatDialog } from '@angular/material/dialog';
const serviceUrl = '/ibase/rest/GenProcessPreviewService';
@Injectable()
export class InvoiceTransactionService {
    columnName: any;
    confirmBox: any = null;
    isForcedSave: boolean = false;
    alertMsgList:any = [];
    typeofAlertList:any = [];
    errorColumnNameList:any = [];
    errorRowsList:any = [];
    allValidationResponse:any = {};
    //Added by vikas on 17-05-23 for userinfo api [Start]
    public baseUrl: string = serviceUrl; 
    //Added by vikas on 17-05-23 for userinfo api [End]
    constructor(private http: HttpClient, public dialog: MatDialog) 
    {
        this.confirmBox = new ConfirmBoxComponent(dialog);
    }

	getUplodedDocumentsDetails (docId : string)
    {
        console.log('InvoiceTransactionService :: updateUserTaskStatus docId[',docId,']');
        let URL = this.getHostURL() + '/ibase/WebITMDocumentHandlerServlet?ACTION=GET_DOC_CONTENTS&DOC_ID='+docId+'';
        let headers = new HttpHeaders({ 'Content-Type': 'text/html' });
        //let options = { headers: headers };
        console.log( "URL for UpdateDocTransPageInfo method >>>>>" , URL ); 
        return this.http.get(URL,{ responseType: 'text' }); 
	}

	uplodedDocumentsDetails (dataStr : string,docDetails:any, docType?: any, format?: any)
    {

        console.log('InvoiceTransactionService :: uplodedDocumentsDetails dataStr[',dataStr,'],docDetails[',docDetails,']');
        let docName: any = '';
        let docId = '';
        dataStr = encodeURIComponent(dataStr);
        if(docDetails&&docDetails.DOC_NAME)
        {
            docName = docDetails.DOC_NAME;
        }
        if(docDetails&&docDetails.DOC_ID)
        {
            docId = docDetails.DOC_ID;
            console.log('DocID:',docId);
        }
        docName = docName.replaceAll(" ", "_");
        docName = encodeURIComponent(docName);
        let URL = this.getHostURL() + '/ibase/WebITMRequestHandlerServlet?ACTION=SAVE_DATA_IN_EXCEL&docName='+docName+'&docId='+docId+'&docType='+docType+'&dataFormat=' + format;
        let headers = new HttpHeaders({ 'Content-Type': 'text/html' });
        //let options = { headers: headers }
        console.log( "URL for UpdateDocTransPageInfo method >>>>>" , URL ); 
        return this.http.post(URL,dataStr,{ responseType: 'text' }); 
	}   
      
    downloadExcelFile (dataStr : string,docDetails:any, docType?: any, format?: any)
    {
        console.log('InvoiceTransactionService :: uplodedDocumentsDetails dataStr[',dataStr,'],ocDetails[',docDetails,']');
	    let docName: any = ''
	    let docId: any = ''
        dataStr = encodeURIComponent(dataStr);
	    if(docDetails&&docDetails.DOC_NAME)
	    {
    	  	docName = docDetails.DOC_NAME;
	    }
        docName = docName.replaceAll(" ", "_");
        docName = encodeURIComponent(docName);
        
        if(docDetails&&docDetails.DOC_ID)
	    {
    	  	docId = docDetails.DOC_ID;
	    }
        
        let URL = this.getHostURL() + '/ibase/WebITMRequestHandlerServlet?ACTION=DOWNLOAD_EXCEL_FILE&docName='+docName+'&docId='+docId+'&docType='+docType+'&dataFormat=' + format;
        let headers = new HttpHeaders({ 'Content-Type': 'text/html' });
        //let options = { headers: headers }
        console.log( "URL for UpdateDocTransPageInfo method >>>>>" , URL ); 
        return this.http.post(URL,dataStr,{ responseType: 'text' }); 
    }
    
    getPythonServiceConfiguration ()
    {
        console.log('InvoiceTransactionService :: getPythonServiceConfiguration ');
        let URL = this.getHostURL() + '/ibase/WebITMDocumentHandlerServlet?ACTION=GET_PYTHON_SERVICE_CONFIG&SERVICE=INVOICE_DETAILS';
       // let headers = new HttpHeaders({ 'Content-Type': 'text/html' });
       // let options = { headers: headers }
        console.log( "URL for UpdateDocTransPageInfo method >>>>>" , URL ); 
        return this.http.get(URL, { responseType: 'text' }); 
	}
	
	getItemCode(URL:string)
    {
        console.log('InvoiceTransactionService :: getItemCode URL :'+URL);
        //let headers = new HttpHeaders({ 'Content-Type': 'text/html'});
        //let options = { headers: headers };
        //return this.http.get(URL,options); 
        return this.http.get(URL,{ responseType: 'text' }); 
	}
  	public getHostURL(): string {
        // let HOST_URL: string = '';
        let HOST_URL: any = '';

        HOST_URL = localStorage.getItem( 'HOST_URL' );
        // HOST_URL = JSON.parse(localStorage.getItem( 'HOST_URL' )||'{}');

        if ( !HOST_URL ) HOST_URL = '';
        console.log( 'getHostURL[', HOST_URL, ']' );
        return HOST_URL;
    }
    //Added by Pravin K on 6-MAR-20[For text selection] START
    saveYmlTemolate(data:any)
    {
        console.log('InvoiceTransactionService :: saveYmlTemolate data[',data,']');
        let URL = this.getHostURL() + '/ibase/WebITMDocumentHandlerServlet?ACTION=SAVE_YML';
        let headers = new HttpHeaders({ 'Content-Type': 'text/html' });
        //let options = { headers: headers };
        console.log( "URL for UpdateDocTransPageInfo method >>>>>" , URL ); 
        return this.http.post(URL,data,{ responseType: 'text' }); 
    }
    //Added by Pravin K on 6-MAR-20[For text selection] END
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
        console.log("InvoiceTransactionService encodedString :" + encodedString);
        return encodedString;
    }

    saveProcessData(overViewModel: any)
    {
        this.setLoading(true);
        console.log('InvoiceTransactionService :: saveProcessData overViewModel[',overViewModel,']');
        let URL = this.getHostURL() + '/ibase/rest/DataExtractionService/saveProcessData';
        let headers = new HttpHeaders({ 'Content-Type': 'text/html' });
        console.log( "URL for saveProcessData method >>>>>" , URL );
        return this.http.post(URL,overViewModel,{ responseType: 'text' }); 
    }

    extractUploadedData(overViewModel: any, docId: any, docDetails: any)
    {
        this.setLoading(true);
        var docName = "";
	  	if(docDetails)
	  	{
		  	if(docDetails['DOC_NAME'])
		  	{
			  	docName = docDetails['DOC_NAME'];
			}
	  	}
        var tmpData: any = {};
        tmpData["ACTION"] = "EXTRACT_UPLOADED_DOCUMENT";
        tmpData["OBJ_NAME"] = "invoice-transaction";
        tmpData["jsonData"] = overViewModel;
        tmpData["DOC_ID"] = docId;
        tmpData["DOC_NAME"] = docName;
        var paramString = this.getEncodedParamString(tmpData);
        console.log('InvoiceTransactionService :: extractUploadedData overViewModel[',overViewModel,']');
        let URL = this.getHostURL() + '/ibase/WebITMDocumentHandlerServlet';
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        console.log( "URL for saveProcessData method >>>>>" , URL );
        return this.http.post(URL, paramString, { headers, responseType: 'text' }); 
    }

    getTraceLinkData(paramString: any)
    {
        this.setLoading(true);
        console.log('InvoiceTransactionService :: getTraceLinkData overViewModel[',paramString,']');
        let URL = this.getHostURL() + '/ibase/rest/DataExtractionService/getTraceLinkData';
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        console.log( "URL for getTraceLinkData method >>>>>" , URL );
        return this.http.post(URL, paramString, { headers, responseType: 'text' }); 
    }
    
    getOverviewModel(paramString: any)
    {
        this.setLoading(true);
        console.log('InvoiceTransactionService :: getOverviewModel overViewModel[',paramString,']');
        let URL = this.getHostURL() + '/ibase/rest/DataExtractionService/getOverviewModel';
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        console.log( "URL for getOverviewModel method >>>>>" , URL );
        return this.http.post(URL, paramString, { headers, responseType: 'text' }); 
    }
    
    updateDictionaryAlias(paramString: any)
    {
	    this.setLoading(true);
        console.log('InvoiceTransactionService :: updateDictionaryAlias[',paramString,']');
        let URL = this.getHostURL() + '/ibase/rest/DataExtractionService/updateDictionaryAlias';
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        console.log( "URL for updateDictionaryAlias method >>>>>" , URL );
        return this.http.post(URL, paramString, { headers, responseType: 'text' }); 
	}
	
	recalculateUOM(paramString: any)
    {
		this.setLoading(true);
        console.log('InvoiceTransactionService :: recalculateUOM[',paramString,']');
        let URL = this.getHostURL() + '/ibase/rest/DataExtractionService/recalculateUOM';
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        console.log( "URL for recalculateUOM method >>>>>" , URL );
        return this.http.post(URL, paramString, { headers, responseType: 'text' }); 
	}
	
	updateItemCode(paramString: any)
    {
		this.setLoading(true);
        console.log('InvoiceTransactionService :: updateItemCodeUOM[',paramString,']');
        let URL = this.getHostURL() + '/ibase/rest/DataExtractionService/updateItemCode';
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        console.log( "URL for updateItemCodeUOM method >>>>>" , URL );
        return this.http.post(URL, paramString, { headers, responseType: 'text' });
	}

    getProductIdentificationAlias()
    {
		this.setLoading(true);
        let URL = this.getHostURL() + '/ibase/rest/DataExtractionService/getProductIdentificationAlias';
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        console.log( "URL for getProductIdentificationAlias method >>>>>" , URL );
        return this.http.post(URL, { headers, responseType: 'text' });
	}
    //Added by Tejas S on 18-MAY-23[For to get Process Method & Process method parameters] START
    getProcMethodList (documentType : string)
    {
        console.log('InvoiceTransactionService :: getProcMethodList documentType[',documentType,']');
        let URL = this.getHostURL() + '/ibase/rest/DataExtractionService/getProcMethodList';
        let headers = new HttpHeaders({ 'Content-Type': 'text/html' });
        console.log( "URL for getProcMethodList method >>>>>" , URL ); 
        return this.http.post(URL, documentType, { headers, responseType: 'text' });
    }

    getProcMethodParams(paramString: any , procMethod: any)
    {
        console.log('InvoiceTransactionService :: getProcMethodParams paramString[',paramString,']');
        let URL = this.getHostURL() + '/ibase/rest/DataExtractionService/getProcMethodParams';
        let headers = new HttpHeaders({ 'Content-Type': 'text/html' });
        console.log( "URL for getProcMethodParams method >>>>>" , URL ); 
        return this.http.post(URL, paramString,{ headers, responseType: 'text' });
    }
    //Added by Tejas S on 18-MAY-23[For to get Process Method & Process method parameters] END

    checkErrorException(response: any, callback: any) 
    {
        console.log('Inside checkErrorException.........201',response);
        try
        {
			let responseObj = this.isJson(response);
            if( (typeof response == 'object' && !(response instanceof Array) ) || responseObj)
            {
                response = responseObj ? responseObj : response;
                if(response && response.Root && response.Root.Errors) 
                {
                    if(response.Root.Errors[0]?.error?.type == 'E')
                    {
                        let errorMessage = '';
                        errorMessage = response.Root.Errors[0].error.description + '%%TRACEMESSAGE%%' + response.Root.Errors[0].error.trace;
                        this.showAlert(errorMessage, 'E', response.Root.Errors[0].error.column_name, (res: any) => {							
                            callback(res);
                            return;
                        });
                    }
                    else
                    {
                        callback(false);
                    }
                }
                else
                {
                    callback(false);
                }
            }
            else
            {
                if(typeof response !== 'string')
                {
                    callback(false);
                    return;
                }
                console.log('Inside checkErrorException.........205::::',response.indexOf('Errors'));
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
        }
        catch (e: any)
        {
            console.log('Exception inisde checkErrorException method ', e.message);
        }
    }

    showAlert(errorMessage: any, errorType: any, errorColName: any, callback: any)
    {
        this.columnName = errorColName;
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

    setForcedSave(forceSave:any) 
    {
        this.isForcedSave = forceSave;
    }

    sendRequest(url: any, paramString: any, cllback: any) 
    {
        try 
        {
            var returnRes;
            let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
            this.http.post(url, paramString, { headers, responseType: 'text' }).subscribe(resp => {
                this.checkErrorException(resp, (res: any) => {

                if (res) {
                  if (this.isForceSave()) {
                    paramString = paramString + "&FORCESAVE=true";
                    this.sendRequest(url, paramString, cllback);
                  }
                  else {
                    returnRes = resp + '%%SEP%%' + res + '%%SEP%%' + this.columnName;
                    cllback(returnRes);
                  }
                }
                else {
                  returnRes = resp + '%%SEP%%' + res + '%%SEP%%' + this.columnName;
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
    isForceSave()
    {
        return this.isForcedSave;
    }

    //Added by vikas on 17-05-23 for calling rest api when savetype is R[Start]
    getUserInfo():any
    {
      let data$ = this.http
      .get(`${this.getHostURL()+this.baseUrl}/getUserInfo`, { headers: this.getHeaders()})
      .pipe(map(res => res))
      .pipe(catchError(handleError));
      console.log("user info in service -- > " , data$)
      return data$;
    }

    private getHeaders()
    {
        let headers = new HttpHeaders();
        headers.append('Accept', 'application/json');
        return headers;
    }

    saveUsingRestAPI(paramString: any,enterprise:any,appId:any,objName:any)
    {
		this.setLoading(true);
        console.log('InvoiceTransactionService :: saveUsingRestAPI[',paramString,']');
        let URL = this.getHostURL() + '/ibase/rest/EDIService/setData/'+objName+'/'+enterprise+'/'+appId+'/'+'writeFileSaveTrans';
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        console.log( "URL for  saveUsingRestAPI method >>>>>" , URL );
        return this.http.post(URL, paramString, { headers, responseType: 'text' });
	}
	
	isJson(value)
	{
		let val:any;
		try 
		{
		  val = JSON.parse(value);	
		} 
		catch (error) 
		{
			val = false;
		}
		return val;
	}
}

function handleError (error: any) 
{
    let errorMsg = error.message || "There is a problem while connecting with server.";
    console.error(errorMsg);
    return throwError(errorMsg);
}
//Added by vikas on 17-05-23 for calling rest api when savetype is R[End]