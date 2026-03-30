import { Injectable, ViewChild } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { BBProgressSpinnerComponent } from '../bb-progress-spinner';
import { MatDialog } from '@angular/material/dialog';


@Injectable()

export class BBSetRowCountService {
  @ViewChild('bbSpinner') bbSpinner: BBProgressSpinnerComponent | any;
  isFromAttachPdf: boolean = false;
  isFromAttachForFirstForm: boolean = false;
  allValidationResponse:any = {};
  confirmBox:any = null;
  errorRowsList: any = [];
  alertMsgList: any = [];
  typeofAlertList: any = [];
  errorColumnNameList: any = [];
  isForcedSave: boolean = false;
  columnNaame: any = null;
  constructor(private http: HttpClient) { 
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
    //   console.log("Mahesh encodedString :" + encodedString);
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


  sendRequest(url:any, paramString:any, cllback:any,validationKey?:any) 
  {
      try 
      {
        //   console.log('Print inisde sendRequestNew Mahesh New');
          var returnRes;
          let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
          this.http.post(url, paramString, { headers, responseType: 'text' }).subscribe(resp => {
              console.log('Print the data inisde subscribe',resp);
            this.checkErrorException(resp, (res:any) => {
              if (res) {
                console.log("Line no 64 for res:::");
                if (this.isForceSave()) {
                  console.log("line no 65 :::", res);
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
                console.log("line no 77 returnRes", returnRes);
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

    setLoading(flag: boolean) 
    {
        try 
        {
            if(this.bbSpinner)
            {
                this.bbSpinner.setLoading(flag);
            }
        }
        catch
        {
            console.log('this.bbSpinner.setLoading is not a function!');
        }
    }

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
          console.log('Exception inside checkErrorException method 266:::::', e.message);
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

  isForceSave()
  {
      return this.isForcedSave;
  }

  setForcedSave(forceSave:any) 
  {
      this.isForcedSave = forceSave;
  }

}
