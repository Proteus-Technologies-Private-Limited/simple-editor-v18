import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs/Observable';
import { Observable, Subject } from 'rxjs';
// import 'rxjs/add/operator/catch';
// import 'rxjs/add/operator/map';
import { throwError } from 'rxjs';
// import 'rxjs/Rx';
import { catchError, map } from "rxjs/operators"; 

@Injectable()
export class BBAutosuggestService  {
        
  constructor(private http: HttpClient) { }
    
  getChipListData( dataSourceURL : string,isPophelp : boolean , displayMetadata :any)
  {
      console.log("URL: " + dataSourceURL );
      let headers = new HttpHeaders( { 'Content-Type': 'application/json' });
      let options = { headers: headers };
      return this.http.get( dataSourceURL, options )
    //   .map( (res: HttpResponse<any> | any) => this.extractData(res ,isPophelp , displayMetadata ) )
    //   .catch( this.handleError );
      .pipe(map( (res: HttpResponse<any> | any) => this.extractData(res ,isPophelp , displayMetadata ) ))
      .pipe(catchError( this.handleError ));
  } 
    
  transformData( res : HttpResponse<any>, isPophelp : boolean , displayMetadata :any ) : any[] {
      //TODO : 
      let formatedData : any[] = [];
      //Changed by Prasad on 04/02/2021 [to resolve the auto suggestion issue in updated framework] START
	  console.log('res :: ', res );
      //let data = res.body.json();
	  let data:any;
      try
      {
          let bodyRes = JSON.stringify( res );
          data = JSON.parse( bodyRes );
          if ( res.body )
          {
              data = res.body.json();
          }
          console.log('data:: ', data );
      }
      catch(e)
      {
          console.log('transformData :: res ', e );
          data = res.body.json();
      }
	  //Changed by Prasad on 04/02/2021 [to resolve the auto suggestion issue in updated framework] END
      console.log(' length of data ', data , Object.keys(data).length );
      if( data && Object.keys(data).length > 0 ) 
      {
         console.log('data & isPophelp in transformData function', data , isPophelp  , displayMetadata);
         
        //console.log('typeof data in service', typeof data ,Array.isArray(data) );
        //console.log('transformData data.details', data.details , typeof data.details ,Array.isArray(data.details));
        //console.log('transformData', data.imgUrl);  
        //console.log('transformData', data.chipMetadata);
        //console.log('transformData', data.suggestMetadata);
        //console.log('transformData', data.valueFields);
         
        //if(data.DETAILS)
       
        if(isPophelp)
        {
            if(data.DETAILS){
                var detailList = data.DETAILS.slice(2, data.DETAILS.length)
                var thumbObjName, thumbAltCol, thumbImgCol;
                console.log('THUMB_IMAGE_COL', data.DETAILS[0].THUMB_IMAGE_COL);
				//Changed by Prasad on 15/04/2021 [set object name to image url]
                //if(detailList[0] && detailList[0][data.DETAILS[0].THUMB_OBJ])
                if(detailList[0] && detailList[0][data.DETAILS[0].THUMB_IMAGE_COL])
                {
                    thumbObjName = data.DETAILS[0].THUMB_OBJ;
                    thumbAltCol =  data.DETAILS[0].THUMB_ALT_COL;
                    thumbImgCol = data.DETAILS[0].THUMB_IMAGE_COL;                    
                }
                else
                {
                    thumbObjName = this.initCap( data.DETAILS[0].THUMB_OBJ );
                    thumbAltCol   = this.initCap( data.DETAILS[0].THUMB_ALT_COL );
                    thumbImgCol = this.initCap( data.DETAILS[0].THUMB_IMAGE_COL );      
                }
                console.log('thumbObjName', thumbObjName, thumbAltCol, thumbImgCol);
            }
            for( let detail of detailList )
            {
                let displayChipText ;
                let displaySuggestText ;
                let value 
                if(displayMetadata)
                {
                //   console.log("displayMetadata exist   ");
                    displayChipText = displayMetadata["chipMetadata"] ;
                    displaySuggestText = displayMetadata["suggestMetadata"]; 
                    value = displayMetadata["valueFields"];
                 //   console.log("displaySuggestText" , displaySuggestText , value , displayChipText);
                    for( let key of Object.keys(detail) ) 
                    {
                        if(detail[key]=='INVALID_DATA')
                        {
                          detail[key] = '';
                        }
                        //console.log('transformData', key, detail[key] );
                        let rKey = '<' + key + '>';
                        displayChipText = displayChipText.replace(rKey, detail[key]);
                        displaySuggestText = displaySuggestText.replace(rKey, detail[key]);              
                        value = value.replace(key, detail[key]);
                     }
                     //   formatedData.push({'displayChipText' : displayChipText, 'displaySuggestText' : displaySuggestText, 'value' : value,'detail':detail})
                }
                else
                {
                     displayChipText = detail.value;
                     displaySuggestText = detail.value; 
                     value = detail.id;
                }
                //Changed by Prasad on 15/04/2021 [set object name to image url]
				var thumbImgUrl = this.getCustomImageURL(thumbObjName, detail[thumbImgCol], detail[thumbAltCol] );
                let image = detail.imgUrl || thumbImgUrl || "ERROR";
                // console.log('thumbImgUrl', detail.imgUrl, thumbImgUrl);
                //let dataObj = detail;
                let errData : boolean = false;
            //    console.log(" formatedData  === >in chitra" , formatedData);
                formatedData.push({'displayChipText' : displayChipText, 'displaySuggestText' : displaySuggestText, 'value' : value, 'image' : image,'detail':detail,'errData':errData})
            }
        }
        //if( data.details )
        else
        {
          for( let detail of data.details ) 
          {
              let displayChipText = data.chipMetadata || data.chipMetaData;
              let displaySuggestText = data.suggestMetadata || data.suggestMetaData;              
              let value = data.valueFields || data.valueField;
              let image = data.imgUrl;
              //let dataObj = detail;
              let errData : boolean = false;
              //console.log('transformData in loop', detail, Object.keys(detail), typeof detail ,Array.isArray(detail) );
              for( let key of Object.keys(detail) ) 
              {
        		  if(detail[key]=='INVALID_DATA')
        		  {
        		    errData = true;
        		    detail[key] = '';
        		  }
                  //console.log('transformData', key, detail[key] );
                  let rKey = '<' + key + '>';
                  displayChipText = displayChipText.replace(rKey, detail[key]);
                  displaySuggestText = displaySuggestText.replace(rKey, detail[key]);              
                  value = value.replace(key, detail[key]);
                  if(image) {
                      image = image.replace(rKey, detail[key]);
                  }
              }
              formatedData.push({'displayChipText' : displayChipText, 'displaySuggestText' : displaySuggestText, 'value' : value, 'image' : image,'detail':detail,'errData':errData})
          }
        }
        
        
      }

      if( formatedData ) data = formatedData;
      //console.log("formatedData",formatedData ,Array.isArray(formatedData));
      return data;
  }
    
  private getCustomImageURL(thumbObjName: any, thumbImgCol: any, thumbAltCol: any) 
  {
      var imageURL = '/ibase/CustomMenuImageServlet?';
      imageURL+='fldValue=' + thumbImgCol;
      imageURL+='&ALT_FLD_VALUE=' + thumbAltCol;
      imageURL+='&objName=' + thumbObjName;
      //Changed by Prasad on 15/04/2021 [set object name to image url]
	  imageURL+='&object=' + thumbObjName;
    //  console.log('imageURL >>', imageURL);
      return imageURL;
  }
      
  private initCap (value : string) 
  {
      if( value )  return value.toLowerCase().replace(/(?:^|\s|_)[a-z]/g, function (m) {
         return m.toUpperCase();
      });
      return '';
  }
  
  private extractData(res: HttpResponse<any> ,isPophelp : boolean , displayMetadata :any) {
      //Changed by Prasad on 04/02/2021 [to resolve the auto suggestion issue in updated framework] START
      //let jsonData = res.body.json();
      let jsonData: any;
      try
      {
          let bodyRes = JSON.stringify( res );
          jsonData = JSON.parse( bodyRes );
          if ( res.body )
          {
              jsonData = res.body.json();
          }
      }
      catch(e)
      {
          console.log('transformData :: res ', e );
          jsonData = res.body.json();
      }
	  //Changed by Prasad on 04/02/2021 [to resolve the auto suggestion issue in updated framework] END
      //console.log('Response in Extractdata of autosuggest:',res,jsonData);
    //   console.log('extractData[' + JSON.stringify[jsonData] + ']');
    console.log('extractData[' + JSON.stringify(jsonData) + ']');

      return this.transformData( jsonData ,isPophelp , displayMetadata ) || [];
  }
      
  private handleError (error: HttpResponse<any> | any) {
    let errMsg: string;
    if (error instanceof HttpResponse) {
      //Changed by Prasad on 04/02/2021 [to resolve the auto suggestion issue in updated framework] START
	  //const body = error.body.json() || '';
      let bodyJsonData:any;
      try
      {
          let bodyRes = JSON.stringify( error );
          bodyJsonData = JSON.parse( bodyRes );
          if ( error.body )
          {
              bodyJsonData = error.body.json() || '';
          }
      }
      catch(e)
      {
          console.log('transformData :: res ', e );
          bodyJsonData = error.body.json() || '';
      }
      //Changed by Prasad on 04/02/2021 [to resolve the auto suggestion issue in updated framework] END
      const body = bodyJsonData || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error('Service handleError:' + errMsg);
    // return Observable.throwError(errMsg);
    return throwError(errMsg);
  }
  
}
