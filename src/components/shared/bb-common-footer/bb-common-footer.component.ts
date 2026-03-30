import { Component, OnInit, Input } from '@angular/core';
// ort { getHostURL, getOS } from '../hostUrl';

@Component({
  selector: 'bb-common-footer',
  templateUrl: './bb-common-footer.component.html',
  styleUrls: ['./bb-common-footer.component.css']
})
export class BBCommonFooterComponent implements OnInit {

  isMobile = false;
  isIos = false;
  className = 'bb-commom-footer-sales-planning';
  @Input('isSalesPlanning') isSalesPlanning = false;
  constructor() {
      let index = window.location.pathname.indexOf('E12BROWSER');
      
      if(index == -1){
          this.isMobile = true;
      }
      else
      {
        var rootElem = <HTMLElement>document.querySelector(':root');
        var slideMenuPanelWidth = document.getElementById("mainMenusHorzPanel")?.offsetWidth;
        console.log('in constructor slideMenuPanelWidth>>',slideMenuPanelWidth);
        rootElem.style.setProperty( '--mainMenusHorzPanel', slideMenuPanelWidth +"px" );
      }
      
    //   if(getHostURL() && getOS() == "iOS"){
    //       this.isIos = true;
    //   }
  }

  ngOnInit() {
        console.log('in On component BBCommonFooterComponent ngOnInit!!',this.isSalesPlanning);
  }
}
