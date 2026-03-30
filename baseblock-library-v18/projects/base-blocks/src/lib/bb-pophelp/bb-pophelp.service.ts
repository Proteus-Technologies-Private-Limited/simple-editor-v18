import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
// import { Observable } from 'rxjs/Observable';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { map } from "rxjs/operators"; 
// import 'rxjs/Rx';
import { throwError } from 'rxjs';

@Injectable()
export class PophelpService {
                    
    constructor(private http: HttpClient) { }
    pophelpData: any;
    tokenID: any = '';
    jSessionId: any = '';

    getPophelpData (dataSource:string, encodedParam: string, filterName:string,isRefresh:boolean): Observable<any> {
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        let options = { headers: headers };
        var loginId = localStorage.getItem('userName');
        console.log("getPophelpData filterName", loginId, filterName);
        if( loginId ){
            filterName = loginId + '_' + filterName;
        }
        console.log("getPophelpData filterName",filterName);
        
        if(!isRefresh){
            this.pophelpData = localStorage.getItem(filterName);
            if(this.pophelpData){
                console.log("dashboard service found data in local storage");
                var dataHandler = new BehaviorSubject<any>(JSON.parse(this.pophelpData));
                return dataHandler;
            }
        }
        
        // return this.http.get<any>( this.getHostURL()+dataSource, options)
        //     .map( (res) => this.extractData(res,filterName) );

        // Added by Mahesh Saggam on 06-AUG-2020
        return this.http.post<any>( this.getHostURL()+dataSource, encodedParam, options)
            // .map( (res: any) => this.extractData(res,filterName) );
            .pipe(map( (res: any) => this.extractData(res,filterName) ));
    }

    
    private extractData(res: Response,filterName: any) {
        //changed by sainath angular 9 migration
        //let body = res.json();
        localStorage.setItem(filterName, JSON.stringify(res));

        // console.log('extractData[' + JSON.stringify(res) + ']');
        return res || { };
    }

    private handleError (error: HttpErrorResponse | any) {
        let errMsg: string;
        if (error instanceof HttpErrorResponse)
        {
            //const body = error.json() || '';
            //const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''}`;
        }
        else
        {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error('Service handleError:' + errMsg);
        // return Observable.throw(errMsg);
        return throwError(errMsg);
    }
    
   public getHostURL(): string {
        // let HOST_URL: string = '';
        /* let HOST_URL: any = '';
        HOST_URL = localStorage.getItem( 'HOST_URL' );
        if ( !HOST_URL ) HOST_URL = '';
        console.log( 'getHostURL[', HOST_URL, ']' );
        return HOST_URL; */
        return '';
    }

    getApiPophelpData(payLoad: any) 
    {
        console.log('print getApiPophelpData payLoad 85:::',payLoad);
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
    
}
