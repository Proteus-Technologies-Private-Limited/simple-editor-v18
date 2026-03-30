import { Component, Compiler, Input, Output, EventEmitter, ViewChild, ViewContainerRef, ComponentFactory, ComponentRef } from '@angular/core';
import { Component as AOTComponent, NgModule } from './aot.decorators';
import { BrowserModule } from '@angular/platform-browser';

/*
 This Component allows you to compile a template at runtime. Just pass in the template, the needed modules and a context. Make sure that
 context is not a complete component, but an object with attributes. Because you would overwrite internal attributes.
 e.g. <cu-dynamic [template]="myObject.template" [context]="{data: myObject.data}" [modules]="FormsModule"></cu-dynamic>
 With the example above you could use a template like this <div>{{task.id}}</div>
 */
@Component({
  selector: 'dynamic-template',
  template: '<ng-container #vc></ng-container>'
})
export class DynamicTemplateComponent {
  @ViewChild('vc', {read: ViewContainerRef, static: true}) viewContainer: ViewContainerRef | any;
  
  @Input() public selector: string | any;
  @Input() public modules: any[] | any;
  @Input() public hostUrl: any;
  
  container: ComponentRef<any> | any;
  private _context: any;
  private _template: string | any;

  @Input()
  set context(value: any) {
      this._context = value;
      this.replaceComponentInDOM(this._template, this._context);
  }

  @Input()
  set template(value: string) {
      this._template = value;
      try {
          this.replaceComponentInDOM(this._template, this._context);
      } catch (e:any) {
          console.log(e.message);
      }
  }

  @Output() onDrillDown: EventEmitter<any> = new EventEmitter();
  
  constructor(private compiler: Compiler) {
  }

  public static createComponent(compiler: Compiler, selector: string, template: string, modules?: any[]): ComponentFactory<any>
  {
     
    try
    {
        if( !modules || modules.length == 0 )
        {
            modules = [BrowserModule];
        }
        else
        {
            modules.push(BrowserModule);
        }
    }
    catch(e)
    {
        modules = [BrowserModule];
    }

    console.log('createComponent in dynamic component ', selector, template, modules, compiler );
    
    @AOTComponent({
        template : template   
    })
    class TemplateComponent {
        @Input() context:any;
        @Output() onDrillDown: EventEmitter<any> = new EventEmitter();
        
        _hostUrl = eval(' getBBHostURL() ');
        _onDrillDown(data:any, drillFrom:any) {
            console.log( '_onDrillDown : [', data , '] ')
            data['drillFrom'] = drillFrom;
            this.onDrillDown.emit(data);
        }
        
        evalFunction(evalString:any) {
            //console.log("evalString", evalString);
            return eval(evalString);
        }
    }

    @NgModule({
      declarations: [TemplateComponent],
      imports: modules
    })
    class TemplateModule {
    }

    const mod = compiler.compileModuleAndAllComponentsSync(TemplateModule);
    const factory:any = mod.componentFactories.find((comp: any) =>
        comp.componentType === TemplateComponent
    );
    console.log('createComponent factory ..',factory);
    return factory;
  }

  private replaceComponentInDOM(template: string, context: any) {
    console.log('replaceComponentInDOM template && context >>', this.viewContainer, template, context);
    if (template && context && this.viewContainer) 
    {
      try{
        console.log('this.container.instance');
        const component = DynamicTemplateComponent.createComponent(this.compiler,
            this.selector,
            template,
            this.modules
        );
        console.log('component', component);
        this.container = this.viewContainer.createComponent(component);
        console.log('this.container', this.container);
        this.container.instance.context = context;
        this.container.instance.onDrillDown = this.onDrillDown;
        this.container.changeDetectorRef.detectChanges();
      }
      catch(e)
      {
          console.log('Excpetion in replaceComponentInDOM error::::', e);
      }        
    }
}
}

