import { Injectable, EventEmitter } from '@angular/core';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';
// import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';

declare var callDataModel: any;

@Injectable()
export class DatamodelService {
    
    dmResponseSubjects: any={};
    //isWaiting = false;
    
    getDataModelData(dataModelName: any, filterParameter: any, scopeKey: any, isRefresh: any): Observable<any>
    {
        //if( !this.dmResponseSubjects[dataModelName] || isRefresh )
        //{           
            var dmConfig={
                dataModelName:dataModelName,
                datasourceKey:dataModelName,
                scopeParams:filterParameter,
                scopeKey:scopeKey,
                isRefresh:isRefresh
            };
            var defaultMsg = {"reponse": "loading"};
            
            var responseObj = {
               "status" : "pending",
               "respSubj" : new BehaviorSubject<any>(defaultMsg),
               "config" : dmConfig
            };
            
            this.dmResponseSubjects[dataModelName] = responseObj;
            
            //if(!this.isWaiting){
                this.callDataModelFunc(dmConfig);
            //}
        //}
         
        return this.dmResponseSubjects[dataModelName].respSubj;
    }
    
    callDataModelFunc(dmConfig: any)
    {
        //this.isWaiting = true;
        var onSuccess = this.onSuccess.bind(this);
        var onError = this.onError.bind(this);
        callDataModel(dmConfig, onSuccess, onError);
    }
    
    onSuccess(dataModelName: any, resp: any) 
    {
        console.log("Data model loaded successfully for: ",dataModelName,resp);
        
        if(resp && typeof resp === "string"){
            resp = JSON.parse(resp);
        }
        this.dmResponseSubjects[dataModelName].status = "loaded";
        this.dmResponseSubjects[dataModelName].respSubj.next(resp);
        
        
        /*
        var pendingKey = Object.keys(this.dmResponseSubjects).filter(key => this.dmResponseSubjects[key].status == 'pending')[0];
        
        if(pendingKey){
            this.callDataModelFunc(this.dmResponseSubjects[pendingKey].config);
        }else {
            this.isWaiting = false;
        }
        */
        
    }
    
    onError() 
    {
        console.log("Eror while loading Data model");
    }
}