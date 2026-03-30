import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import 'rxjs/add/observable/from';
// import { Observable } from 'rxjs/Observable';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ConfirmBoxComponent } from '../confirm-box';
// import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatDialog } from '@angular/material/dialog';

// Added by nikhil on 12-01-2022 for scheduler visual for user info	
const serviceUrl = '/ibase/rest/GenProcessPreviewService';

@Injectable()
export class BBCalColumnService {
// Added by nikhil on 12-01-2022 for scheduler visual for user info		
public baseUrl: string = serviceUrl;
isForcedSave: boolean = false;
columnNaame:any = null;
alertMsgList:any = [];
typeofAlertList:any = [];
errorColumnNameList:any = [];
confirmBox:any = null;
constructor( private http: HttpClient, public dialog: MatDialog) { 
  this.confirmBox = new ConfirmBoxComponent(dialog);
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
    var HOST_URL: string | any = '';
    HOST_URL = localStorage.getItem('HOST_URL');
    if (!HOST_URL) HOST_URL = '';
    console.log('Mahesh getHostURL 29!!!![', HOST_URL, ']');
    return HOST_URL;
  }

callRequest(url: any, paramString: any) : Observable <any>{
      let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
      return this.http.post(url, paramString, { headers, responseType: 'text' });
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

  // Added by nikhil on 12-01-2022 for scheduler visual for user info
  getUserInfo():any
  {
      let data$ = this.http
      .get(`${getHostURL()+this.baseUrl}/getUserInfo`, { headers: this.getHeaders()})
      .pipe(map(res => res))
      .pipe(catchError(handleError));
      console.log("user info in service -- > " , data$)
      return data$;
  }

  private getHeaders()
  {
    let headers = new HttpHeaders();
   // headers.append('Accept', 'application/json');
   // headers.append( "Content-Type", "application/json" );
    headers.append('Accept', 'application/json');
    return headers;
  }
  // Added by nikhil on 12-01-2022 for scheduler visual for user info

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

              console.log('Print response..............87',res);
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

    isForceSave()
    {
        return this.isForcedSave;
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

    setForcedSave(forceSave:any) 
    {
      this.isForcedSave = forceSave;
    }

}
// Added by nikhil on 12-01-2022 for scheduler visual for user info
function handleError (error: any) 
{
	let errorMsg = error.message || "There is a problem while connecting with server.";
	console.error(errorMsg);
	/*alert(errorMsg);*/
	// return Observable.throw(errorMsg);
  return throwError(errorMsg);
}
export function getHostURL(): string 
{
    let HOST_URL: string | any = '';

    HOST_URL = localStorage.getItem( 'HOST_URL' );

    if ( !HOST_URL ) 
    {
       HOST_URL = ''; 
    }
    console.log( 'getHostURL[', HOST_URL, ']' );
    return HOST_URL;
}
// Added by nikhil on 12-01-2022 for scheduler visual for user info

    