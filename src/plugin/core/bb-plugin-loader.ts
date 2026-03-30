import { Type, ApplicationRef, ComponentFactoryResolver, Component, ComponentRef, Injector, NgZone } from '@angular/core';

let loadedComponentReferences: any = {};

export class BBPluginLoader
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

	// Changed by Sonam K [Added new parameter "pluginEvtEmitter", for pass event to the component caller] START
    loadComponentAtDom<T>(component:Type<T>, dom:Element, pluginMetadata: any, pluginName: any, pluginEvtEmitter: any): ComponentRef<T>
    {
        let componentRef: any;
        //console.log("To load component", component, "at", dom);
        console.log('---onInit bb plugin---',pluginMetadata,dom,component);
        this.zone.run(() =>
        {
            try
            {
                let compRef = loadedComponentReferences[pluginName];
                console.log('Loading Dashboard component...',loadedComponentReferences,compRef);

                if(compRef && pluginMetadata.cacheComp)
                {
					//Added by Sonam K [For passing component reference to angPlugin.js]
                    componentRef = compRef;
                    var compRefInstance = compRef.instance;
                    console.log('compRefInstance ==>',compRefInstance);
					if( compRefInstance && compRefInstance.setPluginMetadata )
					{
					   compRefInstance.setPluginMetadata(pluginMetadata,null);
					}
                    setTimeout( () => {
                        dom.appendChild(compRef.location.nativeElement);
                        this.appRef.attachView(compRef.hostView);
                    }, 500);
                }
                else
                {
                    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
                    componentRef = componentFactory.create(this.injector, [], dom);
                    //onInit && onInit(componentRef.instance);
                    componentRef.instance.pluginMetadata = pluginMetadata;
					// Added by Sonam K [Passing event emitter reference to component] START
                    componentRef.instance.pluginEvtEmitter = pluginEvtEmitter;
					// Added by Sonam K [Passing event emitter reference to component] END
                    this.appRef.attachView(componentRef.hostView);
                    loadedComponentReferences[pluginName] = componentRef;
                }

            }
            catch (e)
            {
                console.error("Unable to load component", component, "at", dom);
                throw e;
            }
        });
        return componentRef;
    }
	// Changed by Sonam K [Added new parameter "pluginEvtEmitter", for pass event to the component caller] END

    detachView(pluginName:string){

        let compRef = loadedComponentReferences[pluginName];
        console.log('In Detach View::',loadedComponentReferences,compRef);

        if(compRef){
            this.appRef.detachView(compRef.hostView);
        }
    }

	destroyComponent(pluginName:string){

        let compRef = loadedComponentReferences[pluginName];
        console.log('In Detach View::',loadedComponentReferences,compRef,pluginName);

        if(compRef){
            compRef.destroy();
            delete loadedComponentReferences[pluginName];
        }
    }
}