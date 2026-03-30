import { Component, OnInit, AfterViewChecked, Input, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';

declare var getAttachmentsPlugin: any;
declare var getImagePlugin: any;


@Component( {
    selector: 'bb-image',
    templateUrl: './bb-image.component.html',
    styleUrls: ['./bb-image.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class BBImageComponent implements OnInit, AfterViewChecked {
    @Input() refId: string | any;
    @Input() refSer: string | any;
    @Input() object: string | any;
    @Input() attachType: string | any;
    @Input() enterprise: string | any;
    @Input() isSingleImage: any;
    @Input() height: string | any;
    @Input() width: any;
    @Input() isThumbnail: boolean = false;
    @Input() isSmallIcon: boolean = false;
    
    @ViewChild( 'targetAttachImage' ) targetDiv: ElementRef | any;
    @ViewChild( 'targetImage' ) targetImg: ElementRef | any;
    @ViewChild( 'loadingImage' ) loadingDiv: ElementRef | any;
    imageUrl : any;
  
  attchPluginViewUI: any;
  constructor() { }

  ngOnInit() 
  {
      if( this.attachType )
      {
          //this.initImage(this.object,this.refSer, this.refId, this.attachType);
      }
      else
      {
          ////this.initAttachImage(this.object,this.refSer, this.refId, 'V', this.isSingleImage, this.height, this.width);
          //this.initSingleImage(this.object,this.refSer, this.refId);
          this.attachType = "";
      }
      this.initSingleImage(this.object,this.refSer, this.refId, this.enterprise);
  }
  
  //192.168.0.222:9090/ibase/rest/E12ExtService/getAttachDocument?
  //OBJ_NAME=objName&
  //REF_SER=refSer&
  //REF_ID=refId&
  //DOC_TYPE=attachType&
  //TOKEN_ID=localStorage.getItem('TOKEN_ID')&
  //DATA_FORMAT=JSON
  initImage(objName:string, refSer:string, refId:string, attachType:string)
  {
      this.imageUrl = "?OBJ_NAME=" + objName + "&REF_SER=" + refSer + "&REF_ID=" + refId +
                   "&DOC_TYPE=" + attachType + "&TOKEN_ID=" + localStorage.getItem('TOKEN_ID') + "&DATA_FORMAT=JSON" +
                   "&TEST=ON";
      console.log("initImage calling /ibase/rest/E12ExtService/getAttachDocument ");          
      console.log("created imageUrl " + this.imageUrl);      
  }
/*  
  initAttachImage(objName:string, refSer:string, refId:string, uiMode:string, isSingleImage:any, height:string, width:string)
  {
      console.log("loadImage check window.getAttachmentsPlugin ");          
      if (! getAttachmentsPlugin ){
          console.log("window.getAttachmentsPlugin is null" );          
          return;
      }
      // Get the target element in which you want to add AttachmentsPlugin.
      console.log("loadImage after check window.getAttachmentsPlugin ");          
      this.attchPluginViewUI = getAttachmentsPlugin({
          OBJ_NAME : objName,
          REF_SER : refSer,
          REF_ID : refId,//ITEM_CODE
          // host url can be empty in browser
          // for mobile devices it has be specified correctly
          HOST_URL : "",
          DOC_TYPE : "",
          // A - For gettig add ui (user can add new attachments and view attached files)
          // E - For getting edit ui (user can view attachments, add new attachments as well as delete attachments)
          // V - For getting view ui (user can only view attachments)
          UI : uiMode,
          // The thumbnail height and width
          THUMBNAIL_WIDTH : width ? width : '100%',
          THUMBNAIL_HEIGHT : height ? height : '100%',
          // Maximum width of attachment plugin, can be specified in pixels
          MAX_WIDTH : "100%",
          // true for browser, false for mobile.
          IS_HOSTED_MODE : true || false,
          ENABLE_SINGLE_IMAGE : isSingleImage
      });
      
      //console.log("created attchPluginViewUI " + this.attchPluginViewUI);      
      //this.nodeToString( this.attchPluginViewUI );      
           
      if (this.targetDiv && this.attchPluginViewUI)
      {
          this.targetDiv.nativeElement.innerHTML = "";
      }
  }
*/

  initSingleImage(objName:string, refSer:string, refId:string, enterprise:string)
  {
      console.log("initSingleImage check window.getImagePlugin [", objName +"] [",refSer +"] [",refId);         
      console.log(" getImagePlugin -------->>");           
      if (! getImagePlugin ){
          console.log("window.getImagePlugin is null" );          
          return;
      }
      // Get the target element in which you want to add AttachmentsPlugin.
      console.log("loadImage after check window.getImagePlugin ");          
      getImagePlugin({
          OBJ_NAME : objName,
          REF_SER : refSer,
          REF_ID : refId,//ITEM_CODE
          HOST_URL : "",
          DOC_TYPE : this.attachType,
          IS_HOSTED_MODE : true || false,
          ENABLE_SINGLE_IMAGE : true,
          ENTERPRISE : enterprise
          
      }, this, 'imageCallback');
  }
  
  imageCallback(imgData:any) {
      console.log("imageCallback imgData>>" , imgData);
      if( imgData && imgData[0]) {
          this.targetDiv.nativeElement.appendChild( imgData[0] );
          this.loadingDiv.nativeElement.style.display = 'none';
      }
  }

  
  ngAfterViewChecked()
  {
      //console.log("EcmImageComponent ngAfterViewChecked... ");
      if( this.targetDiv && this.attchPluginViewUI && this.attchPluginViewUI.innerHTML !== "" && this.targetDiv.nativeElement.innerHTML === "" )
      {
          console.log("EcmImageComponent ngAfterViewChecked... ");
          this.targetDiv.nativeElement.appendChild(this.attchPluginViewUI);
          this.loadingDiv.nativeElement.style.display = 'none';
      }
      
      if (this.targetImg && this.imageUrl)
      {
          console.log("this.targetImg ngAfterViewChecked... " + this.targetImg.nativeElement);
          this.targetImg.nativeElement.src = "/ibase/rest/E12ExtService/getAttachDocument" + this.imageUrl;
          //this.targetImg.nativeElement.onerror ="this.src = '/ecm/assets/images/svg/img_not_found.svg'; this.onerror = null;";
          this.targetImg.nativeElement.onerror = this.onEcmImageError;
          this.imageUrl = null;
      }
  }
  
  onEcmImageError( elem: any ){
      console.log( "onEcmImageError", this );
      console.log( "onEcmImageError", elem );
  }
  
}