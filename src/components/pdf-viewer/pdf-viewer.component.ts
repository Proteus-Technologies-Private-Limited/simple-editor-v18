import { Component, OnInit ,Input, ViewEncapsulation,Output,EventEmitter} from '@angular/core';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
// import { StylesCompileDependency } from '@angular/compiler';

//metaData

@Component({
  selector: 'pdf-viewer-editor',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PdfViewerComponent implements OnInit {
 
 pluginMetadata:any;
 pdfSrc!:string ;
 isError = false;
 status = 'loading';
 @Input() pdfSrcNew!:string ;//Added by Pravin K on 06-02-2020
 @Input() isHoriScrollReq:any;//Added by Pravin K on 06-02-2020
 @Output() onAllPagesLoad: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {
    
	    console.log("01 PluginMetadata : ",this.pluginMetadata);
	    //changed By Pravin K on 23-JAN-20 [for null issue] START
	    if(this.pluginMetadata)
	    {
		    console.log("this.pluginMetadata.compData.pdfSrc : ",this.pluginMetadata.compData.pdfSrc);
		    if( this.pluginMetadata.compData.pdfSrc )
		    {
			    this.pdfSrc = this.pluginMetadata.compData.pdfSrc;//compData
		    }
		    else
		    {
		    	 this.isError = true;
		    }
	    }
	    //Added by Pravin K on 27-JAN-20 START
	    console.log("01 this.pdfSrcNew : ",this.pdfSrcNew);
	    if(this.pdfSrcNew)
	    {
	     	this.pdfSrc = this.pdfSrcNew
	    }
   	    //Added by Pravin K on 27-JAN-20 END

	    //changed By Pravin K on 23-JAN-20 [for null issue] END
	}
	
	onError()
  	{
   		this.isError = true;
  	}
  
	loadComplete(pdf: PDFDocumentProxy)  
	{
		this.status = 'loadingComplet';
		console.log("no of pages loaded pdf.numPages"+pdf.numPages);

		//Added by Pravin K on 18-FEB-20 [TO get pdf load callback] START
		this.onAllPagesLoad.emit();
		//Added by Pravin K on 18-FEB-20 [TO get pdf load callback] END
	}

	removeHorizontalScrollOfPDFViewer()
	{
	    var elm = document.getElementsByClassName("ng2-pdf-viewer-container");
	    if(elm[0])
		{
	    	elm[0].setAttribute("style","overflow: inherit");
	    }
	}
}
