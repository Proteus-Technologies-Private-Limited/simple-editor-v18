import { Type, ApplicationRef, ComponentFactoryResolver, Component, ComponentRef, Injector, NgZone, EmbeddedViewRef, Injectable } from '@angular/core';
import { BBPlugin } from '../core/bb-plugin';

let loadedComponentReferences: ComponentRef<BBPlugin>[] | any = [];
@Injectable({
  providedIn: 'root'
})

export class DashboardLoaderService 
{
    private appRef: ApplicationRef;
    private componentFactoryResolver: ComponentFactoryResolver;
    private zone:NgZone;

    constructor(private injector:Injector) 
    {
        this.appRef = injector.get(ApplicationRef);
        this.zone = injector.get(NgZone);
        this.componentFactoryResolver = injector.get(ComponentFactoryResolver);
    }
    
    loadComponentAtDom<T>(component:Type<T>, dom:Element, pluginName: any, pluginMetadata: any, pluginEvtEmitter: any, onInit?: (Component:T) => void)
    {
        let componentRef;
        //console.log("To load component", component, "at", dom);
        console.log('---onInit---',onInit,pluginName, pluginMetadata);
        this.zone.run(() => 
        {
            try 
            {
                console.log('Loading Dashboard component...',loadedComponentReferences);
                var metadataname = pluginMetadata.get( 'metadataname' );
                var pluginId = pluginName +'_'+metadataname;
                let compRef: any = loadedComponentReferences.find((compRef: any) => compRef.instance.pluginId === pluginId);
                var dashboardData = loadedComponentReferences.find((dashboardData: any) => dashboardData.instance['dashboardData'] );
                
                var compRefInstance: any;
                console.log('compRef == > ',compRef ,dashboardData);
                if( compRef && pluginMetadata.cacheComp)
                {
                    console.log('Loading Existing component::',compRef);
                    if(pluginName == "dashboard"){                    
                      compRefInstance = compRef.instance;
//					  if( compRefInstance && compRefInstance.setPluginMetadata )
//					  {
//						 compRefInstance.setPluginMetadata(pluginMetadata);
//					  }
                      var subTitleData = compRefInstance.subTitleData;
                      console.log('compRefInstance ==>',compRefInstance,subTitleData,pluginEvtEmitter);
                      compRef.instance.selected = pluginEvtEmitter;
                      pluginEvtEmitter.emit(subTitleData);
                    }
                  
                    setTimeout( () => {
                        dom.appendChild(compRef.location.nativeElement);
                        this.appRef.attachView(compRef.hostView);
                        if( compRefInstance && compRefInstance.setPluginMetadata )
                        {
                           compRefInstance.setPluginMetadata(pluginMetadata,dashboardData);
                        }
                    }, 500);
                    console.log('compRefInstance 1==>',compRefInstance);
                }
                else 
                {
                    console.log('Creating new component to load::');
                    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
                    componentRef = componentFactory.create(this.injector, [], dom);
                    onInit && onInit(componentRef.instance);
                    this.appRef.attachView(componentRef.hostView);
                    loadedComponentReferences.push(componentRef);
                }
            } 
            catch (e) 
            {
                console.error("Unable to load component", component, "at", dom);
                throw e;
            }
        });

    }
    
    detachView(dashboardName:string, metadataname:string){
        
        loadedComponentReferences.forEach((compRef: any) => {
            
            if(dashboardName=='dashboard')
            {
                var pluginId = dashboardName +'_'+metadataname;
                console.log('--dashboardName--',dashboardName, '--metadataname--',metadataname);
                console.log('--DETACH_DASHBOARD--',compRef.instance.pluginId);       
                if(pluginId == compRef.instance.pluginId){
                    console.log('--Dashboard Detach--');       
                    this.appRef.detachView(compRef.hostView);
                }
            }
        });
    }
    
    destroyComponent(dashboardName:string, metadataname:string){
        console.log('--destroyComponent--', loadedComponentReferences);      
        loadedComponentReferences.forEach((compRef: any) => {
            
            if(dashboardName=='dashboard')
            {
                var pluginId = dashboardName +'_'+metadataname;
                console.log('--dashboardName--',dashboardName, '--metadataname--',metadataname);
                console.log('--REMOVE_DASHBOARD--',compRef.instance.pluginId);       
                if(pluginId == compRef.instance.pluginId){
                    console.log('--Dashboard Destroy--');       
                    compRef.destroy();
                    var compRefIdx = loadedComponentReferences.indexOf(compRef);
                    console.log('--Dashboard Destroy--', compRefIdx); 
                    loadedComponentReferences.splice(compRefIdx, 1);
                    console.log('--destroyComponent--', loadedComponentReferences); 
                    compRef.changeDetectorRef.detach();
                    compRef = null;    
                }
            }
        });
    }
}