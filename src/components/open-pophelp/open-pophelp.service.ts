import { Injectable } from '@angular/core';
// import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

declare var getBBHostURL : any;


@Injectable({
  providedIn: 'root'
})

export class SellPlanningService {

  private _url: string = "/ibase/WEBITMRIARequestHandlerServlet?";
  private _urlPophelpFields = "/ibase/RIAWizardHandlerServlet?";
  private _url1: string = "/ibase/E12EditorHandlerServlet?";


  constructor(private http1:HttpClient) { } //private http:Http, 


  getItemchangeResponse(paramString:any) : Observable <any> {

    var url = getBBHostURL() + this._url1 + paramString;
    console.log("##...... itemChange rest service ==>", url);
    return this.http1.get(url);
   // return this.http1.get(url, { responseType: 'text' }); //need to define what type of data is coming
    }

  getHostURL() 
  {
    // var HOST_URL: string = '';
    var HOST_URL: any = '';
    HOST_URL = localStorage.getItem('HOST_URL');
    if (!HOST_URL) HOST_URL = '';
    console.log('getHostURL..[', HOST_URL, ']');
    return HOST_URL;
  }

  getEncodedParamString(paramMap: any): any 
  {
    var encodedString = "";
    for (let k in paramMap) {
      var key = k;
      var value = paramMap[k];
      var encod = encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
      encodedString += encod;
    }
    encodedString = encodedString.substring(0, encodedString.length - 1);
    // console.log("the encodedString :" + encodedString);
    return encodedString;
  }
  //Added by Vikas L. on 16-Jan-2020-End

  getErrorData(viewDataResponse: any): any {
    var errorArr:any = [];
    var errorDom:any = new Document();
    var parser = new DOMParser();
    errorDom = parser.parseFromString(viewDataResponse, "text/xml");
    console.log('getErrorData xmlDoc>>>>>1.....', errorDom.lastElementChild.lastChild);
    try {
      var msg = errorDom.getElementsByTagName("message")[0].childNodes[0].nodeValue;
      errorArr[0] = msg;
    }
    catch{
      console.log('error while getting errorMsg>>');
      errorArr[0] = "";
    }
    try {
      var trace = errorDom.getElementsByTagName("trace")[0].childNodes[0].nodeValue;
      errorArr[1] = trace;
    }
    catch{
      console.log('error while getting errorTrace>>');
      errorArr[0] = "";
    }
    try {
      var descr = errorDom.getElementsByTagName("description")[0].childNodes[0].nodeValue;
      errorArr[2] = descr;
    }
    catch{
      console.log('error while getting errorDescr>>');
      errorArr[0] = "";
    }
    return errorArr;
  }


  getErrorMsg(msg:any, msgDescr:any, msgTrace:any) {
    console.log(' in getErrorMsg');
    var response = "";
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

    var url = getBBHostURL() + this._url1 + paramString;
    console.log("##...... getFirstCall rest service ==>", url);
   // return this.http1.get(url);
    return this.http1.get(url, { responseType: 'text' }); //need to define what type of data is coming
    }
}
