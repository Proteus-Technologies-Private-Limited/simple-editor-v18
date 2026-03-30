import { ComponentRef, EventEmitter, Injector, NgModuleRef, ViewContainerRef } from '@angular/core';

import { BBPlugin } from '../core/bb-plugin';
import { BBPluginMetadata } from '../core/bb-plugin.metadata';
import { BBPluginLoader } from '../core/bb-plugin-loader';
import { setOverlayPos } from '../../components/shared/hostUrl';
import { BbPluginLoaderService } from '../core/bb-plugin-loader.service';
import { NgZone } from '@angular/core';
//
export const PluginMetadata = BBPluginMetadata;

//
let PLUGINS: any = {};
let loadedComponentReferences: ComponentRef<BBPlugin>[] = [];
let ng2Loader: any;
//
export function ADD_PLUGINS( pluginName : string, pluginComp : any ) : void
{
    console.log( 'ADD_PLUGINS : ', pluginName, pluginComp );
    PLUGINS[pluginName] = pluginComp;
    //console.log( 'ADD_PLUGINS : ', PLUGINS );
}

// Commented and changed by Kaustubh Nandankar on 17-April-2025 
// export function INVOKE_PLUGIN(pluginName:string, pluginMetadata:any, pluginModuleInjector:any, pluginEvtEmitter:EventEmitter<any>) : ComponentRef<any>
// {
//     console.log('INVOKE_PLUGIN', pluginName, PLUGINS[pluginName], pluginMetadata, pluginModuleInjector);
//     let compRef : ComponentRef<any> | any;
//     ng2Loader = new BBPluginLoader(pluginModuleInjector);
//     let container = document.getElementById(pluginMetadata["target-id"]);
//     if( container )
//     {
//         //console.log(container,'\n\n container childNodes', container.childNodes[0]);
//         container.classList.add("js-flex-container");

//         let parent = document.createElement(pluginName);
//         container.appendChild(parent);
//  		// Added by Sonam K [Passed pluginEvtEmitter to the loadComponentAtDom] START
// 		//Changed by Sonam K [Added compRef for getting component reference]
//         compRef = ng2Loader.loadComponentAtDom(PLUGINS[pluginName], parent, pluginMetadata, pluginName, pluginEvtEmitter);
// 		// Added by Sonam K [Passed pluginEvtEmitter to the loadComponentAtDom] END
//         //console.log('--compRef--',compRef.instance.pluginId);
//         loadedComponentReferences.push(compRef);
//     }
//     setOverlayPos();
//     return compRef;
// }

/* export function INVOKE_PLUGIN(pluginName: string, pluginMetadata: any, pluginModuleRef: NgModuleRef<any>, pluginEvtEmitter: EventEmitter<any>): ComponentRef<any> {
    console.log('Print INVOKE_PLUGIN::::line number 52:::', pluginMetadata);
    let compRef: ComponentRef<any>;

    const pluginModuleInjector: Injector = pluginModuleRef.injector;

    const ng2Loader = pluginModuleInjector.get(BbPluginLoaderService);

    let container = document.getElementById(pluginMetadata["target-id"]);
    if (container) {
        container.classList.add("js-flex-container");
        let parent = document.createElement(pluginName);
        container.appendChild(parent);
        compRef = ng2Loader.loadComponentAtDom(PLUGINS[pluginName], parent, pluginMetadata, pluginName, pluginEvtEmitter, pluginModuleInjector);
    }
    return compRef;
} */

    export function INVOKE_PLUGIN(pluginName:string, pluginMetadata:any, pluginModuleInjector:any , pluginEvtEmitter:EventEmitter<any>) : ComponentRef<any>
{
    console.log('Print INVOKE_PLUGIN 69 >>::::', pluginName, PLUGINS[pluginName], pluginMetadata);

    let compRef : ComponentRef<any>;
    ng2Loader = new BBPluginLoader(pluginModuleInjector);
    // const pluginModuleInjector: Injector = pluginModuleRef.injector;
    // console.log('print pluginModuleInjector 72 >>:::::',pluginModuleInjector);
    // ng2Loader = pluginModuleInjector.get(BbPluginLoaderService);
    console.log('print ng2Loader 74:::::',ng2Loader);
    let container = document.getElementById(pluginMetadata["target-id"]);
    console.log('print container 78:::::',container);
    if( container )
    {
        container.classList.add("js-flex-container");
        let parent = document.createElement(pluginName);
        console.log('print parent 83:::::',parent);
        container.appendChild(parent);
        console.log('print container 85:::::',container);
        compRef = ng2Loader.loadComponentAtDom(PLUGINS[pluginName], parent, pluginMetadata, pluginName, pluginEvtEmitter, pluginModuleInjector);
        console.log('print compRef 87:::::',compRef);

        // loadedComponentReferences.push(compRef);
    }
    return compRef;
}

// Ends here

export function REMOVE_PLUGIN(compName:string)
{
	if(ng2Loader){
        ng2Loader.destroyComponent(compName);
    }
}

export function DETACH_PLUGIN(pluginName:string)
{
    console.log('In DETACH_PLUGIN',pluginName);
    if(ng2Loader){
        ng2Loader.detachView(pluginName);
    }
}

export function EXPOSE_PLUGIN(pluginModuleInjector: any)
{
  console.log('EXPOSE_PLUGIN CALLED');
  (window as any)['SimpEditPlugin'] = {
    loadPlugin: INVOKE_PLUGIN,
    destroyPlugin: REMOVE_PLUGIN,
    detachPlugin: DETACH_PLUGIN,
    pluginConfig: PluginMetadata,
    pluginMI: pluginModuleInjector,
    pluginEvtEmitter: EventEmitter//,
    //zone: _ngZone
  };
  
}
