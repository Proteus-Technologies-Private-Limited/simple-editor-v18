import { Component, OnInit } from '@angular/core';
import { getHostURL, getOS } from '../hostUrl';

//import { getHostURL, getOS } from '../../../shared/hostUrl';

@Component({
  selector: 'bb-common-header',
  templateUrl: './bb-common-header.component.html',
  styleUrls: ['./bb-common-header.component.css']
})
export class BBCommonHeaderComponent implements OnInit {

  isMobile = false;
  isIos = false;
    
  constructor() {
     // this.onComponentLoad();
      let index = window.location.pathname.indexOf('E12BROWSER');
      
      if(index == -1){
          this.isMobile = true;
      }
      
      if(getHostURL() && getOS() == "iOS"){
          this.isIos = true;
      }
  }

  ngOnInit() {
        console.log('in On component load ngOnInit!!');
  }

  onComponentLoad(){
    let index = window.location.pathname.indexOf('E12BROWSER');
    
    if(index == -1){
        this.isMobile = true;
    }
    console.log('in On component load!!');
    if(this.isMobile) {          
        var gwtMobileHeader = document.getElementById("MobileHeader");
        var gwtMobileContents = document.getElementById("MobileContents");
        if(gwtMobileHeader){
            gwtMobileHeader.style.display = "none"
        }
        if(gwtMobileContents){
            gwtMobileContents.style.paddingTop = "0px";
        }
    }
  }
}

//to use this paste this in ur html
    //    <bb-common-header>
    //       <back-button (click)="onCancel()" > <!-- [ngStyle]= "{'visibility' : cancelButton ? 'visible' : 'hidden'}" -->
    //          <span class="visionicon icon-nav-left" [ngStyle]="{'color' : isMobile ? '#fff' : 'var(--primary)'}"></span>  
    //         <span [ngStyle]="{'color' : isMobile ? '#fff' : 'var(--primary)'}">{{ cancelButton }}</span>
    //       </back-button>
    //       <page-title [ngStyle]="{'color' : isMobile ? '#fff' : ''}">{{headerTitle}}</page-title>
    //       <page-subtitle style="display: block;" [ngStyle]="{'color' : isMobile ? '#fff' : ''}"><span class="visionicon icon-plus-circle"  [ngStyle]="{'color' : isMobile ? '#fff' : ''}"></span>{{headerSubTitle}}</page-subtitle>
    //        <confirm-button (click)="onFinish();"> <!--  [ngStyle]= "{'visibility' : saveButton ? 'visible' : 'hidden'}" -->
    //         <span [ngStyle]="{'color' : isMobile ? '#fff' : 'var(--primary)'}">{{ saveButton }}</span>
    //         <span class="visionicon icon-nav-right" [ngStyle]="{'color' : isMobile ? '#fff' : 'var(--primary)'}"></span>
    //       </confirm-button>
    //     </bb-common-header>