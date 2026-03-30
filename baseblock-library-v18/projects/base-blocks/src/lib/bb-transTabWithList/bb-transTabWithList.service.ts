import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import 'rxjs/add/observable/from';
// import { Observable } from 'rxjs/Observable';
import { Observable, from } from 'rxjs';

@Injectable()
export class BBtransTabWithListService {

constructor( private http: HttpClient) { }

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
    HOST_URL!= localStorage.getItem('HOST_URL');
    if (!HOST_URL) HOST_URL = '';
    console.log('Mahesh getHostURL 29!!!![', HOST_URL, ']');
    return HOST_URL;
  }

callRequest(url:any, paramString:any) : Observable <any>{
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

}


    