import {
  OnDestroy,
  OnInit,
  OnChanges,
  EventEmitter,
  ElementRef,
  Input,
  Output,
  NgModule,
  SimpleChanges,
  Directive
} from '@angular/core';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


var dataSetConstruct:boolean = false;

@Directive({
    selector: '[applyTemplate]'
  })
export class ApplyTemplateDirective implements   OnInit {
  
  //@Input() public data:number[] | any[];
  @Input()  shHtml : string | any;
  @Input()  data: any;
  @Input () itemTemplates:any;
  
  @Output() public htmlLoaded:EventEmitter<any> = new EventEmitter();

  public constructor(private el: ElementRef, private _sanitizer:DomSanitizer ) {
  }

  public ngOnInit():any {
      if(this.itemTemplates){
          console.log('inside if of item template');
          this.el.nativeElement.innerHTML =  this.applyDataForMultipleTemplate();
      }
      else{
          console.log('inside else of item template');
          this.applyData();
          this.el.nativeElement.innerHTML = this.shHtml;
      }
  }
  
  applyData()
  {
      let idVal: string;
      var data = this.data.itemData || this.data;
  
      for(var key of Object.keys(data))
      {
          var key1 = "{{"+key+"}}";
          var value = data[key];
          //console.log("each :" ,key , key1 ,value );
        
          this.shHtml = this.shHtml.replace(key1, value);
      }
  }
  
  applyDataForMultipleTemplate(){
       let idVal: string;
       var data = this.data.itemData || this.data;
       var templHtml;
       
       if(data.id > -1){
           console.log('length in if ',data.id);
           templHtml = this.itemTemplates[data.id].value;
       }else {
           var length = this.itemTemplates.length;
           console.log('length in else ',length);
           templHtml = this.itemTemplates[length-1].value;
       }
       
       for(var key of Object.keys(data))
       {
           var key1 = "{{"+key+"}}";
           var value = data[key];
           console.log('templHtml ',templHtml,key1);
           templHtml = templHtml.replace(new RegExp(key1, 'g'), value);

       }
        console.log('Formatted html',templHtml);
       
       return templHtml;
       
  }

  getDisplayChar(descr: any)
  {
      var wordArray = descr.split(" ");
      var displayVal;
      if(wordArray.length > 1){
          displayVal = wordArray[0].charAt(0)+wordArray[1].charAt(0);
      }else {
          displayVal = descr.charAt(0)
      }
      return displayVal.toUpperCase();
  }
}

// private helper functions
@NgModule({
  declarations: [
    ApplyTemplateDirective
  ],
  exports: [
    ApplyTemplateDirective
  ],
  imports: []
})
export class ApplyTemplateModule {
}