import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
// import 'rxjs/add/observable/from';
// import { Observable } from 'rxjs/Observable';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Added by nikhil on 12-01-2022 for scheduler visual for user info	
const serviceUrl = '/ibase/rest/GenProcessPreviewService';

@Injectable()
export class BBDatabaseListService {
// Added by nikhil on 12-01-2022 for scheduler visual for user info		
public baseUrl: string = serviceUrl;
constructor( private http: HttpClient) { }

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
        console.log("Mahesh encodedString :" + encodedString);
        return encodedString;
    }

    getHostURL(): string 
    {
        var HOST_URL: string | any = '';
        HOST_URL = localStorage.getItem('HOST_URL');
        if (!HOST_URL) HOST_URL = '';
        console.log('Mahesh getHostURL 29!!!![', HOST_URL, ']');
        return HOST_URL;
    }

    callRequest(url: any, paramString: any) : Observable <any>
    {
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

  // Added by vikas on 25-08-2022 for scheduler visual for user info
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
     // Added by vikas on 25-08-2022 for scheduler visual for user info
    }
    // Added by vikas on 25-08-2022 for scheduler visual for user info
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
    // Added by vikas on 25-08-2022 for scheduler visual for user info

    