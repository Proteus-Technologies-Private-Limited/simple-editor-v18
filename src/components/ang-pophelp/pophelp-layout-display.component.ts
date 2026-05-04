import { Component, OnInit , ViewEncapsulation , AfterViewChecked ,ChangeDetectorRef ,Input} from '@angular/core';

@Component({
  standalone: false,
  selector: 'pophelp-layout-display',
  template: `  <span [innerHTML] = "parsedHTML" ></span>`,
  encapsulation: ViewEncapsulation.None, 
})

//By Sainath T on 23/11/18 [ To get pophelp dispaly structure - need to pass template and Json - will replace key with value and create parse html]
export class PophelpLayoutDisplayComponent implements OnInit, AfterViewChecked  {
    
  constructor(private cdr: ChangeDetectorRef) { } 
  @Input('detailJson') jSon: any;
  @Input('templateLayout') template: any;
  parsedHTML: string | any;
  ngOnInit()
  {
    this.parsedHTML = this.createParsedHTML(this.jSon);
  }

  private createParsedHTML(object: Object | any) {
    let template = this.template;
    
    for (let key in object) 
    {
        var regExp = new RegExp('{{\\s*' + key + '\\s*}}', 'g');
        var value = object[key];
        template = template.replace(regExp, value);
    }
    return template;
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }
}
