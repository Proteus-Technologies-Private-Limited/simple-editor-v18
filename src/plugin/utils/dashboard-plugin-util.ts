import { ComponentRef, EventEmitter, Injector, NgModuleRef } from '@angular/core';
import { BBPlugin } from '../core/bb-plugin';
import { BBPluginMetadata } from '../core/bb-plugin.metadata';
import { DashboardLoader } from '../core/dashboard-plugin-loader';
import { changeTheme } from './theme-selector-util';
import { setOverlayPos } from '../../components/shared/hostUrl';
// import { Subject } from 'rxjs/Subject';
import { Subject } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DashboardLoaderService } from '../core/dashboard-plugin-loader.service';

export const PluginMetadata = BBPluginMetadata;

let DASHBOARDS: any = {};

let ng2Loader: any;

export function ADD_DASHBOARDS( dashboardName : string, pluginComp : any ) : void
{
    //console.log( 'ADD_PLUGINS : ', dashboardName, pluginComp );
    DASHBOARDS[dashboardName] = pluginComp;
    //console.log( 'ADD_PLUGINS : ', PLUGINS );
}

// export function INVOKE_DASHBORD(dashboardName:string, pluginMetadata:BBPluginMetadata, pluginModuleInjector:any, pluginEvtEmitter:EventEmitter<any>) : ComponentRef<BBPlugin>
export function INVOKE_DASHBORD(dashboardName: string, pluginMetadata: any, pluginModuleRef: NgModuleRef<any>, pluginEvtEmitter: EventEmitter<any>): ComponentRef<any>
{
    console.log('INVOKE_DASHBORD 28::::', dashboardName, DASHBOARDS[dashboardName], pluginMetadata);
    let compRef : ComponentRef<BBPlugin> | any;
    // ng2Loader = new DashboardLoader(pluginModuleInjector);
    // const pluginModuleInjector: Injector = pluginModuleRef.injector;
    
    const pluginModuleInjector: Injector = pluginModuleRef.injector;
    const ng2Loader = pluginModuleInjector.get(DashboardLoaderService);

    let container: any;
    if( document.getElementById(pluginMetadata.get('target-id')) != null)
    {
        container = document.getElementById(pluginMetadata.get('target-id'));
    }
    else
    {
        container = parent.document.getElementById(pluginMetadata.get('target-id'));
    }
    // Added by sujan on 11 apr 2023 for show dashboard in dashboard pages[END]

    if( container )
    {
        container.innerHTML = '';
        //console.log(container,'\n\n container childNodes', container.childNodes[0]);
        container.classList.add("js-flex-container");
      
        let parent = document.createElement(dashboardName);
        container.appendChild(parent);
        ng2Loader.loadComponentAtDom (DASHBOARDS[dashboardName], parent, dashboardName, pluginMetadata, pluginEvtEmitter, (instance: BBPlugin) => {
            console.log('--instance--',instance);
            instance.pluginMetadata = pluginMetadata;
            instance.selected = pluginEvtEmitter;
        });
       
        //console.log('--compRef--',compRef.instance.pluginId);
        
    }
    setOverlayPos();
    
    return compRef;
}

export function DETACH_DASHBORD(dashboardName:string, metadataname:string)
{
    if(ng2Loader){
        ng2Loader.detachView(dashboardName, metadataname);
    }
}

export function REMOVE_DASHBORD(dashboardName:string, metadataname:string)
{
    if(ng2Loader){
        ng2Loader.destroyComponent(dashboardName, metadataname);
    }
}

export function EXPOSE_DASHBOARD(pluginModuleInjector: any)
{
  console.log('EXPOSE_DASHBOARD CALLED');

   (window as any)['AngDashboard'] = {
      loadDashboard: INVOKE_DASHBORD, 
      detachDashboard: DETACH_DASHBORD,
      destroyDashboard: REMOVE_DASHBORD,
      pluginConfig: PluginMetadata, 
      pluginMI: pluginModuleInjector,
      pluginEvtEmitter: EventEmitter, 
      onTabChange: new EventEmitter(),
      pluginSubject: Subject, 
      //zone: _ngZone
    };  
   
   (window as any)['setAngThemeColor'] = changeTheme;
}

export function SORT(array: any, key: any,typeOfColumn: any,order: any)
{
   var sortedArray: any = Object.assign([], array);
   if( sortedArray )
   {
       if(typeOfColumn=='number'){
           //console.log('SORT function number>>');
           if(order=='Ascending'){
               console.log('ascending');
               sortedArray.sort( function(a: any, b: any) {
                   return parseInt(a[key]) - parseInt(b[key]);
                   } );  
           }
           else
            {
               console.log('dcending');
               sortedArray.sort( function(a: any, b: any) {
                   return parseInt(b[key]) - parseInt(a[key]);
                   } )                  
            }
       
       }
       else if(typeOfColumn=='date'){
          // console.log('SORT function number>>');
           sortedArray.sort( function(a: any, b: any) {
           return parseInt(a[key]) - parseInt(b[key]);
           } )   
       
       }
       else{
           sortedArray.sort( function(a: any, b: any) {
           //console.log('SORT:::',a[key],b[key]);
           return a[key] > b[key]
               } )   
       }
   }
   //console.log(array, sortedArray);
   return sortedArray;
}

/*
SORT(array, key)
{
   var sortedArray = Object.assign([], array);
   if( sortedArray )
   {
       sortedArray.sort( function(a, b) {
            return parseInt(a[key]) < parseInt(b[key])
       } )   
   }
   //console.log(array, sortedArray);
   return sortedArray;
}
*/

export function GROUP_BY(array: any, key: any)
{
   //console.log('Inside group by',array,key);
   var i = 0;
   var groupedArray: any = []; //Object.assign([], array);
   var groupUniqueKeys: any = [];
   if( array )
   {
       array.forEach( function(arrayObj: any) { 
        //   console.log('Inside group by arrayObj',arrayObj);
           if(groupUniqueKeys.indexOf(arrayObj[key]) >= 0) 
           {
               var existingObj: any = groupedArray.find( function (fobj: any) { 
                   return fobj.key== arrayObj[key] 
               }); 
               
               if( existingObj )
               {
                   existingObj.count += 1;
                   existingObj.objects.push(arrayObj);
                  // console.log(existingObj.count);
               }
           } 
           else 
           {
               var objects: any = [];
               objects.push(arrayObj);
               var groupObj = {'key' : arrayObj[key], 'count' : 1, 'objects' : objects};          
               groupedArray[i] = groupObj;
               groupUniqueKeys[i] = arrayObj[key];
               i++;
           }                    
       });   
   }
  // console.log(groupUniqueKeys);
  // console.log(groupedArray);
   return groupedArray;
}


export function DUAL_GROUP_BY(dataArray: any, feedsConfig: any)
{
  var inpArr = feedsConfig.groupkey;
  var inputStr = inpArr[0];
  var finalGroupArray: any = [];
  var groupArray = GROUP_BY(dataArray, inputStr);
  if(inpArr.length > 1)
  {
    inputStr = inpArr[1];
    for(var grpObj of groupArray){
      var groupedRes = GROUP_BY(grpObj.objects, inputStr);
      for(var grpResObj of groupedRes){
        finalGroupArray.push(grpResObj);
      }
    }
  }
  else
  {
    finalGroupArray = groupArray;
  }
  console.log('Inside group by finalGroupArray',finalGroupArray);
  var finalGroupRes: any = [];
  for(var grpResObj of finalGroupArray){
     var resObj1 = applyFeedsConfig(grpResObj.objects, feedsConfig);
     //console.log('After applySumFunction resObj1',resObj1);
     var resObj2 = evalFunction(Object.assign({}, resObj1), feedsConfig.formula);
     //console.log('After evalFunction resObj2',resObj2);
     finalGroupRes.push(resObj2);
  }
  //console.log('Inside group by arrayObj',JSON.stringify(finalGroupRes));
  //console.log('Inside group by finalGroupRes',finalGroupRes);

  return finalGroupRes;
}

function evalFunction(x: any, formula: any){
    JSON.parse(formula);
    return x;
}

function applyFeedsConfig(array: any, feedsConfig: any)
{
    var sumkeys = feedsConfig.sumkeys; // It should have number type data 
    var mergekeys = feedsConfig.mergekeys; 
    var deletekeys = feedsConfig.excludekeys;
    var sumObj = array.reduce((sumObj: any, elem: any) => {
        if( sumObj instanceof Object )
        {
            console.log('Inside aaply feeds if ',sumObj);
            mergekeys.map( (mergekey: any) => {
                if(sumObj[mergekey+'_Merge']){
                    sumObj[mergekey+'_Merge'] = sumObj[mergekey+'_Merge'] + ',' + elem[mergekey];
                }
                else{
                    sumObj[mergekey+'_Merge'] = sumObj[mergekey] + ',' + elem[mergekey];
                }
            });
            sumkeys.map( (sumkey: any) => {
                sumObj[sumkey] = sumObj[sumkey] + elem[sumkey];
            });
        }
        else
        {
            console.log('Inside aaply feeds else ');
            sumObj += elem;
        }
        return sumObj;
    });
    deletekeys.map( (deletekey: any) => {
        delete sumObj[deletekey]; 
    });
    return sumObj;
}

// Added by Yogesh Mohite [group and sum] 24/07/2019
export function GROUP_BY_KEYS( dataList: any, keystring: any ) 
{
    var result = dataList;
    if( keystring )
    {
        var keyList = keystring.split(',');
        keyList = keyList.map((key: any) => { return key.trim() });
    
        result = groupBy( dataList, function( item: any, keys: any ) {
            var kval: any = [];
            keys.map(( key: any ) => {
                kval.push( item[key] );
            } );
            return kval;
        }, keyList );
    }
    return result;
}

function groupBy( array: any, f: any, kl: any ) {
    var groups: any = {};
    array.forEach( function( o: any ) {
        var group = JSON.stringify( f( o, kl ) );
        groups[group] = groups[group] || [];
        groups[group].push( o );
    } );
    return Object.keys( groups ).map( function( group ) {
        return groups[group];
    } )
}

export function SUM( array: any, key: any ) : any {
    console.log('sum funcction ',array);
    console.log('sum key ',key);
    var sumArray: any = [];
    var sumValue = 0;
    var isArray = false;
    array.map(( objArr: any ) => {
        console.log( objArr, objArr instanceof Array );
        if ( objArr instanceof Array ) {
            isArray = true;
            var totalSum = objArr.reduce( function( prev, cur ) {
                return getIntValue(prev)+ getIntValue(cur[key]);
            }, 0 );
            var finalObj = Object.assign({},objArr[0]);
            finalObj[key] = totalSum;
            sumArray.push( finalObj );
        }
        else {
            sumValue = sumValue +getIntValue(objArr[key]);
        }

    } );
    if ( isArray ) {
        return sumArray;
    }
    else {
        return sumValue;
    }
}

function getIntValue(value: any) 
{
    try {
        return parseInt(value);
    }
    catch ( e ) {
        return 0;
    }
}
