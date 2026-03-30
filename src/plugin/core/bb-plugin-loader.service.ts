import { ApplicationRef, ComponentRef, inject, Injectable, Injector, NgZone, Type, ViewContainerRef } from '@angular/core';

let loadedComponentReferences: any = {};
@Injectable({
  providedIn: 'root'
})
export class BbPluginLoaderService {

  private appRef: ApplicationRef = inject(ApplicationRef);
  // private componentFactoryResolver: ComponentFactoryResolver = inject(ComponentFactoryResolver);
  private zone: NgZone = inject(NgZone);
  // private viewContainerRef: ViewContainerRef | any;

  constructor(private viewContainerRef: ViewContainerRef) {}
  
  // Added by Kaustubh Nandankar on 18-January-2024 --{{
  loadComponentAtDom<T>(component: Type<T>, dom: Element, pluginMetadata: any, pluginName: any, pluginEvtEmitter: any, injector: Injector): ComponentRef<T> {
    let componentRef: any;
    console.log('print loadComponentAtDom dom::::',dom);
    this.zone.run(() => {
      try {
        let compRef = loadedComponentReferences[pluginName];
        if (compRef && pluginMetadata.cacheComp) {
          // Reuse cached component and update metadata
          componentRef = compRef;
          let compRefInstance = compRef.instance;
          if (compRefInstance && compRefInstance.setPluginMetadata) {
            compRefInstance.setPluginMetadata(pluginMetadata, null);
          }
          dom.appendChild(compRef.location.nativeElement);
          this.appRef.attachView(compRef.hostView);
        } else {
          // let componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
          // componentRef = componentFactory.create(injector, [], dom);
          
          componentRef = this.viewContainerRef.createComponent(component);
          // componentRef = this.viewContainerRef.createComponent(component, {
          //     injector: injector,
          //     projectableNodes: [[], []]
          // });
          
          // Set the plugin metadata and event emitter on the component instance
          componentRef.instance.pluginMetadata = pluginMetadata;
          componentRef.instance.pluginEvtEmitter = pluginEvtEmitter;
          this.appRef.attachView(componentRef.hostView);
          loadedComponentReferences[pluginName] = componentRef;
        }
      } catch (e) {
        console.error("Unable to load component exception ", e);
        throw e;
      }
    });
    return componentRef;
  }    
  //Ends here}}


  detachView(pluginName: string) {

    let compRef = loadedComponentReferences[pluginName];
    console.log('In Detach View::', loadedComponentReferences, compRef);

    if (compRef) {
      this.appRef.detachView(compRef.hostView);
    }
  }

  destroyComponent(pluginName: string) {
    let compRef = loadedComponentReferences[pluginName];
    console.log('In destroyComponent::::', loadedComponentReferences, compRef, pluginName);
  
    if (compRef) {
      this.appRef.detachView(compRef.hostView);
      compRef.destroy();
      delete loadedComponentReferences[pluginName];  // Ensure reference is removed
    }
  }  

}
