import { Component, OnInit, Input, NgZone, ViewChild, TemplateRef, ViewContainerRef, Renderer2,Inject } from '@angular/core';
import { InvoiceTransactionService } from '../invoice-transaction/invoice-transaction.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { FormGroup, UntypedFormBuilder } from '@angular/forms';
import { popHelpComponent } from '../open-pophelp/open-pophelp.component';
import { ExtractTemplateService } from './extract-template.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { AppDateAdapter, APP_DATE_FORMATS } from './date.adapter';
//Added by shrutika on 26-05-2020 for close panel in case of extract template.

//Mahesh changes 04-05-2020
import { ConfirmBoxComponent } from '../shared/confirm-box/confirm-box.component';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
//import {  MatDatepickerModule } from '@angular/material/datepicker';

declare let closeExtractTemplate: any;

declare var saveDocInContentLibrary: any;
// Added by Pravin K  on 15-JUL-20 STRT
//Comente By pravin K on 6-OCT-20 START      
// export interface DialogData {
// 	tableColumns : Array<tableColumns>;
// 	tableStart : string;
// 	tableEnd : string;
// 	action : string;
// }
// export interface  tableColumns{
//       col: string;  val: string; isNull: boolean;
// }
// export interface mapDialogData {
// 	selectionArray : Array<any>;
// }
//Comente By pravin K on 6-OCT-20 END 
// Added by Pravin K  on 15-JUL-20 END
@Component({
	selector: 'sorderform',
	templateUrl: './extract-template.component.html',
	styleUrls: ['./extract-template.component.css'],
	providers: [
		{
			provide: DateAdapter, useClass: AppDateAdapter
		},
		{
			provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
		},
		DatePipe
	]
})
export class ExtractTemplateComponent implements OnInit {


	@Input() data: any = {};
	@Input() pluginMetadata: any;
	pdfSrc: any;
	docDetails: any;
	showAdd:any = true;
	serviceURL: any;
	safeSrc: any;
	allformValues:any = {};///Added by shrutika on 10-04-2020 for getting first Call browser data
	currentCompData:any;
	tmpDataCopy:any;
	editFlag:any;
	editorId:any;
	refSer:any;
	objName:any;
	positionPopHelp = {};
	compData:any = {};
	detailNum:any;
	itemChangeList: any[] = [];
	feildName:any;
	FORM_NO:any;
	itemChangeArr: any = [];
	pophelpDataList: any = [];
	popHelpFieldList: any = [];
	visibleAttribParams:any = {};
	protectAttribParams:any = {};
	@ViewChild('popHelp') popHelp: popHelpComponent | any;
	pkValues:any;
	showHeaderForm: boolean = true;
	showDetailForm: boolean = false;
	arrayOfDateFields: any = [];

	//Mahesh changes 04-05-2020
	confirmBox:any = null;
	numOfForms:any;
	allMandatoryFields: any = [];
	lineLen:any = 0;
	//shrutika changes for validation
	cuurentValidationRow: any = [];
	cuurentFormNumber:any = "";
	@ViewChild('expandAndCollapseTemp') expandAndCollapseTemp: TemplateRef<any>|any;
	@ViewChild('taxDetails') taxDetail: TemplateRef<any>|any;
	groupBoxOverlay!: OverlayRef;
	taxDetailOverLay!: OverlayRef;
	currElemId:any;

	//Added by Pravin K on 26-JUNE-20[For text selection] START
	currEvnt: any;
	lastEvnt: any;
	secondLastEvnt: any;
	textSelected: any;
	isClickOn: any;
	movedTONextField: any = false;
	mouseUpRef: any;
	addSelectionLogArr: any = [];
	docType: any = "";
	isSelectionNotAdded:any = true;
	//Added by Pravin K on 26-JUNE-20[For text selection] START
	tableColumns: any = [{ "col": "", val: "" ,isNull:false}];
	tableLineData : any = {"tableColumns":{},"tableStart":"","tableEnd":"","action":"","keyIndex":[]};
	//Added by Pravin K on 26-JUNE-20[For text selection] END
	isExpanded: boolean = false;
	taxResponseData:any = "";
	detailCount:any = 0;
	mapForNewDetail:any = {};
	mapForNewDetailFromPdf:any = {};
    allItemCodes:any;
    //Added by Pravin K on 23-OCT-20[For template creation overlay] START
    tableColumnCount:any=1;
    tableStartEndPosiotn:any={};
    invalidRow:any={};
	templateUIMode:any;
    selecTableStartTxt:any;
    selecTableEndTxt:any;
    showTableMarking = true;
    selectKeyword:any;
    trainingData: any = [];
    //Added by shrutika on 19-04-21 for tax form related changes.
    taxFormInfo:any = "";
    ///Added by Pravin K on 23-OCT-20[For template creation overlay]  END
    constructor(private invoiceTransactionService: InvoiceTransactionService, public _extractTempletService: ExtractTemplateService, private sanitizer: DomSanitizer,
		private zone: NgZone, private fb: UntypedFormBuilder, public datePipe: DatePipe, public dialog: MatDialog,
		private overlay: Overlay, private viewContainerRef: ViewContainerRef, public renderer: Renderer2) {
		//Mahesh changes 04-05-2020
		this.confirmBox = new ConfirmBoxComponent(dialog);

	}

	ngOnInit() 
	{
		console.log('ngOnInit invoice-transaction', this.data);
		console.log("pluginMetadata---", this.pluginMetadata);
        //Added By Pravin k on 25-AUG-20 START
        var that = this;

        //Added by Pravin K on 23-OCT-20[For template creation overlay] START
        this.templateUIMode ="Add";
        this.selecTableStartTxt = "Click here to mark starting of table in document"; 
        this.selecTableEndTxt = "Click here to mark end of table in document";
        this.selectKeyword = "Add Keywords";
        //Added by Pravin K on 23-OCT-20[For template creation overlay] END
        // this._extractTempletService.getAllItemCode().subscribe(data => {
		// 		console.log("getAllItemCode::result data", data);
		// 		if (data.includes(":INVALID_DOCUMENT") ) 
		// 		{
		// 			console.log("error while getting all item codes", data,"]");
		// 		}
		// 		else 
		// 		{
        //              var objData = eval ("(" + data + ")");
        //             console.log("getAllItemCode::result objData[", objData,"]");
        //             if(objData)
        //             {
        //                 that.allItemCodes = objData;
        //             }			
		// 		}
		// 	});
         //Added By Pravin k on 25-AUG-20 END

		if (this.pluginMetadata) 
		{
			this._extractTempletService.allValidationResponse = {};
			var compData = this.pluginMetadata["compData"];
			if (compData) 
			{
				var contentData = compData["contentData"];
				if (contentData) 
				{
					var tmpData:any = {};
					tmpData["DOC_ID"] = contentData["docId"];
					tmpData["FILE_TYPE"] = contentData["fileType"];
					tmpData["DOC_NAME"] = contentData["docName"];

					console.log('tempData---', tmpData);
					this.attachedCallback(tmpData);
				}
				this.editFlag = compData["EDIT_FLAG"];
				this.pkValues = compData["PK_VALUES"];//Shrutika changes 07-05-2020
				this.editorId = compData["EDITOR_ID"];
				this.refSer = compData["REF_SER"];
				this.objName = compData["OBJ_NAME"];
				this.numOfForms = compData['NO_OF_FORMS']
				console.log('pkfields ......85', this.pkValues);
				console.log('editFlag ......85', this.editFlag);
				console.log('editorId ......85', this.editorId);
				console.log('refSer ......85', this.refSer);
				console.log('objName ......85', this.objName);
			}
		}
		//Added by shrutika on 10-04-2020[Start] for getting first Call browser data

		if (this.pluginMetadata) 
		{
			this.compData = this.pluginMetadata["compData"];
			if (this.compData) 
			{
				this.loadFormData();
			}
		}
		//Added by shrutika on 10-04-2020[End] for getting first Call browser data

		//Added by shrutika for getting obj details and set itemchange list
		if (this.pluginMetadata) 
		{
			this.compData = this.pluginMetadata["compData"];
			if (this.compData) 
			{
				console.log('compData------', this.compData);
				var tmpData:any = {};
				tmpData["ACTION"] = "OBJ_DETAILS";
				tmpData["PAGE_CTX"] = "1";
				tmpData["OBJ_TYPE"] = "T";
				tmpData["OBJ_NAME"] = this.compData["OBJ_NAME"];
				tmpData["dummyInt"] = this.compData["dummyInt"];
				tmpData["RTEURN_TYPE"] = this.compData["RTEURN_TYPE"];

				console.log('tempData---in case of objdetails', tmpData);
				var paramString = this._extractTempletService.getEncodedParamString(tmpData);
				var url = this._extractTempletService.getHostURL() + '/ibase/WEBITMRIARequestHandlerServlet';

				console.log('paramString-----', paramString);
				this._extractTempletService.isFromAttachPdf = false;
                console.log('11 url[',url,']paramString[',paramString,']');
				this._extractTempletService.sendRequest(url, paramString, (objDetailsData:any) => {
                    console.log('objDetailsData---in case of objDetailsData', objDetailsData);// Added By Pravin K on 6-JAN-21
					var callbackRespNew = objDetailsData.split('%%SEP%%');
                    console.log('objDetailsData---in case of callbackRespNew', callbackRespNew);// Added By Pravin K on 6-JAN-21
					objDetailsData = callbackRespNew[0];
                    console.log('objDetailsData---in case of objDetailsData', objDetailsData);// Added By Pravin K on 6-JAN-21
					var isError = callbackRespNew[1].trim();
					if (!(isError == 'true')) 
					{
						this.buildItemChangeList(objDetailsData);
                        //Added by shrutika on 19-04-21 for tax form related changes.
                        var objdetailsNew = {} = JSON.parse(objDetailsData); 
                        if (objdetailsNew && objdetailsNew!.ROOT)
                         { 
                             if (objdetailsNew.ROOT.Transaction.TRANSETUP != null)
                              { 
                                this.taxFormInfo = objdetailsNew.ROOT.Transaction.TRANSETUP['TAX_FORMS']; 
                            } 
                        }
                        //Added by shrutika on 19-04-21 for tax form related changes.	
					}
				});
			}
		}
		//Added by shrutika for getting obj details and set itemchange list

		if (this.pluginMetadata) 
		{
			this.compData = this.pluginMetadata["compData"];
			if (this.compData) 
			{
				console.log('compData------', this.compData);
				var tmpData:any = {};
				tmpData["OBJ_NAME"] = this.compData["OBJ_NAME"];
				tmpData["ACTION"] = "OBJ_POPHELPINFO_ALL";
				tmpData["OBJ_TYPE"] = "";
				tmpData["dummyInt"] = this.compData["dummyInt"];
				tmpData["PKVLAUE"] = "";
				tmpData["EDIT_FLAG"] = "";
				tmpData["RTEURN_TYPE"] = this.compData["RTEURN_TYPE"];

				console.log('tempData---in case of pophelp', tmpData);	
				var paramString = this._extractTempletService.getEncodedParamString(tmpData);
				var url = this._extractTempletService.getHostURL() + '/ibase/RIAWizardHandlerServlet';
				this._extractTempletService.isFromAttachPdf = false;
                console.log('url[',url,']paramString[',paramString,']');
				this._extractTempletService.sendRequest(url, paramString, (objPophelp: any) => {
                    console.log('.. tempData---in case of objPophelp', objPophelp);// Added By Pravin K on 6-JAN-21
					var callbackRespNew = objPophelp.split('%%SEP%%');
					objPophelp = callbackRespNew[0];
					var isError = callbackRespNew[1].trim();

					if (!(isError == 'true')) 
					{
						var objPophelpNew:any = {} = JSON.parse(objPophelp);
                        console.log('tempData---in case of objPophelpNew', objPophelpNew);// Added By Pravin K on 6-JAN-21
						if (objPophelpNew && objPophelpNew!.ROOT) 
						{
							if (objPophelpNew.ROOT.POPUP != null) 
							{
								var popupLen = objPophelpNew.ROOT.POPUP.length;
								for (var i = 0; i < popupLen; i++) 
								{
									// this.pophelpDataList.push(objPophelpNew.ROOT.POPUP[i]);
									this.pophelpDataList.push(objPophelpNew.ROOT.POPUP[i]);
								}

								//Changes for avoid duplicate mode name
								for (var i = 0; i < this.pophelpDataList.length; i++) 
								{
									var popHelpFldName: string = this.pophelpDataList[i]['attrib']['@FIELD_NAME'].toLowerCase();
									// this.popHelpFieldList.push(popHelpFldName);
									this.popHelpFieldList.push(popHelpFldName);
								}
							}
						}
					}
				});
			}

			//For OBJ_POPHELPINFO_ALL_X
			tmpData["ACTION"] = "OBJ_POPHELPINFO_ALL_X";
			var paramString1 = this._extractTempletService.getEncodedParamString(tmpData);
			var url = this._extractTempletService.getHostURL() + '/ibase/RIAWizardHandlerServlet';
			this._extractTempletService.isFromAttachPdf = false;
			this._extractTempletService.sendRequest(url, paramString1, (objPophelpDataX:any) => {
                console.log('tempData---in case of objPophelpDataX', objPophelpDataX);// Added By Pravin K on 6-JAN-21
				var callbackRespNew = objPophelpDataX.split('%%SEP%%');
				objPophelpDataX = callbackRespNew[0];
				var isError = callbackRespNew[1].trim();

				if (!(isError == 'true')) 
				{
					var objPophelpNew = {} = JSON.parse(objPophelpDataX);
                    console.log('tempData---in case of objPophelpNew', objPophelpNew);// Added By Pravin K on 6-JAN-21
					if (objPophelpNew && objPophelpNew!.ROOT) 
					{
						if (objPophelpNew.ROOT.POPUP != null) 
						{
							var popupLen = objPophelpNew.ROOT.POPUP.length;
							for (var i = 0; i < popupLen; i++) 
							{
								var popHelpFldName: string | any = objPophelpNew.ROOT.POPUP[i]['attrib']['@FIELD_NAME'].toLowerCase()
								// if (!this.popHelpFieldList.includes(popHelpFldName)) 
								if (!this.popHelpFieldList.includes(popHelpFldName)) 
								{
									this.pophelpDataList.push(objPophelpNew.ROOT.POPUP[i]);
								}
							}
							this.popHelpFieldList = [];
							for (var i = 0; i < this.pophelpDataList.length; i++) 
							{
								var popHelpFldName: string | any = this.pophelpDataList[i]['attrib']['@FIELD_NAME'].toLowerCase();
								// this.popHelpFieldList.push(popHelpFldName);
								this.popHelpFieldList.push(popHelpFldName);
							}
						}
					}
				}
			});
		}

		//Added by shrutika on 24-05-2020 for switch layout related changes.
		(<any>window)["expTemp"] = this.allformValues;
		(<any>window)["expArrayOfDateFields"] = this.arrayOfDateFields;
		(<any>window)["expDatePipe"] = this.datePipe;
		(<any>window)["expCuurentRow"] = this.cuurentValidationRow;
		(<any>window)["expCuurentFormNo"] = this.cuurentFormNumber;
		this.setPythonServiceUrl();
	}

	getMandatoryFeilds() 
	{
        try
        {
            var formNo = this.compData['NO_OF_FORMS'];
            var detailData = {};
            for (var i = 0; i < formNo; i++) 
            {
                var formDetail = 'Detail' + (i + 1);
                var detailLen;
                if (formDetail == 'Detail1') 
                {
                    detailData = this.allformValues;
                    for (var key of Object.keys(detailData)) 
                    {
                        let id = formDetail + '.1.' + key;
                        var elem = document.getElementById(id);
                        var value = this.allformValues[key];
                       	if (elem != null && elem.getAttribute('required') != null
                            && !(this.allMandatoryFields.includes(id))) {
                            this.allMandatoryFields.push(id);
                        }
                        else if (elem != null && elem.getAttribute('format') == 'dateBox' && value != null) {
                            var arrayDate;
                            var validDate;
                            console.log('Print is id instance of date::: ', id);
                            console.log('Print is value instance of date::: ', value);
                            if(this.arrayOfDateFields.includes(id) && value.length > 0)
                            {
                                console.log('Print inside arrayOfDateFlds 1:::');
                                arrayDate = value.split('/'); // DD-MM-YY
                                validDate = arrayDate[1] + '/' + arrayDate[0] + '/' + arrayDate[2]; // MM-DD-YY
                                this.allformValues[key] = new Date(validDate);
                            }
                            else if (!(this.arrayOfDateFields.includes(id)) && value.length > 0) 
                            {
                                arrayDate = value.split('/'); // DD-MM-YY
                                validDate = arrayDate[1] + '/' + arrayDate[0] + '/' + arrayDate[2]; // MM-DD-YY
                                this.allformValues[key] = new Date(validDate);
                                this.arrayOfDateFields.push(id);
                            }
                            else if(!(this.arrayOfDateFields.includes(id)) && value.length == undefined)
                            {
                                this.arrayOfDateFields.push(id);
                            }
                        }
                    }
                }
                else if (this.allformValues.hasOwnProperty(formDetail)) 
                {
                    detailLen = this.allformValues[formDetail].length;
                    console.log('inside getMandatoryFields......356[',detailLen);
                    for (var j = 0; j < detailLen; j++) 
                    {
                        detailData = this.allformValues[formDetail][j];
                        for (var key of Object.keys(detailData)) 
                        {
                            let id = formDetail + '.' + (j + 1) + '.' + key;
                            var elem = document.getElementById(id);
                            var value = this.allformValues[formDetail][j][key];

                            if (elem != null && elem.getAttribute('required') != null
                                && !(this.allMandatoryFields.includes(id))) {
                                this.allMandatoryFields.push(id);
                            }
                            else if (elem != null && elem.getAttribute('format') == 'dateBox' && value != null) {
                                var arrayDate;
                                var validDate;
                                if(this.arrayOfDateFields.includes(id) && value.length > 0)
                                {
                                    arrayDate = value.split('/'); // DD-MM-YY
                                    validDate = arrayDate[1] + '/' + arrayDate[0] + '/' + arrayDate[2]; // MM-DD-YY
                                    //this.allformValues[key] = new Date(validDate);
                                    this.allformValues[formDetail][j][key] = new Date(validDate);
                                }
                                else if (!(this.arrayOfDateFields.includes(id)) && value.length > 0) 
                                {
                                    arrayDate = value.split('/'); // DD-MM-YY
                                    validDate = arrayDate[1] + '/' + arrayDate[0] + '/' + arrayDate[2]; // MM-DD-YY
                                    //this.allformValues[key] = new Date(validDate);
                                    this.allformValues[formDetail][j][key] = new Date(validDate);
                                    this.arrayOfDateFields.push(id);
                                }
                                else if(!(this.arrayOfDateFields.includes(id)) && value.length == undefined)
                                {
                                    this.arrayOfDateFields.push(id);
                                }
                            }
                        }
                    }
                }
            }
            console.log('Print arrayOfDateFields line 616 ', this.arrayOfDateFields);
        }
        catch (e:any) 
		{
			console.log('Exception inside getMandatoryFields ', e.message);
		}
	}

	ngAfterViewInit() 
	{
		this.popHelp.dateFeildArray = this.arrayOfDateFields;
		setTimeout(() => {
			this.getMandatoryFeilds();
		}, 3000);
		var contentElement = document.getElementsByClassName("extract-template-content");
		var contentChildElement = contentElement[0];
		if (contentChildElement) 
		{
			var bbContentPluginElement = contentChildElement?.parentElement?.parentElement;
			console.log('print inside 883', bbContentPluginElement?.getAttribute("name"));
			if (bbContentPluginElement) 
			{
				var name = bbContentPluginElement.getAttribute("name");
				if (name == "bbContentPlugin") 
				{
					bbContentPluginElement.setAttribute('style', 'position: absolute; width: 100%; height: 100%;');
				}
			}

			var dbcontentElement:any = contentChildElement?.parentElement?.parentElement?.parentElement;
			dbcontentElement.setAttribute('style', 'overflow: hidden !important; background-color: #efefef;');

			var headerElem = document.getElementsByClassName("tran-editor-main-panel")[0];
			var parentHeader:any = headerElem.parentElement;
			parentHeader['style'].width = "100% !important";

			if (dbcontentElement) 
			{
				var className = dbcontentElement.getAttribute("class");
				if (className.trim() == "dbcontentMenuPanel") 
				{
					console.log('Inside print 102');
				}
			}
		}


		var elem = document.getElementsByClassName('dbcontentMenuPanel')[0];
		var positionOfPopHelp:any = {};
		if (elem) 
		{
			var position = document.getElementsByClassName('dbcontentMenuPanel')[0].getBoundingClientRect();

			positionOfPopHelp['width'] = '500';
			// positionOfPopHelp['top'] = position.top + 50;
			positionOfPopHelp['top'] = position.top + 9;
			// positionOfPopHelp['height'] = position.height - 97;
			positionOfPopHelp['height'] = position.height - 55;
			positionOfPopHelp['left'] = position.left + 1073;

			this.positionPopHelp = positionOfPopHelp;
		}
	}

	getPosition(e:any) 
	{
		var posx = 0;
		var posy = 0;
		if (!e) 
		{
			e = window.event;
		}
		if (e.pageX || e.pageY) 
		{
			posx = e.pageX;
			posy = e.pageY;
		}
		else if (e.clientX || e.clientY) 
		{
			posx = e.clientX + document.body.scrollLeft +
				document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop +
				document.documentElement.scrollTop;
		}
		return {
			x: posx,
			y: posy
		}
	}

	createExpCollapseOverlay(event:any) 
	{
		event.preventDefault();
		var position = this.getPosition(event);
		const positionStrategy = this.overlay
			.position()
			.global()
			.width('135px')
			.left((position.x + 10) + 'px')
			.top(position.y + 'px');

		const overlayConfig = new OverlayConfig({
			positionStrategy,
		});
		overlayConfig.hasBackdrop = true;
		overlayConfig.backdropClass = 'backDrpOfGrpBox';
		const templatePortal = new TemplatePortal(this.expandAndCollapseTemp, this.viewContainerRef);
		this.groupBoxOverlay = this.overlay.create(overlayConfig);

		this.groupBoxOverlay.backdropClick().subscribe(() => {
			this.groupBoxOverlay.dispose();
		});
		this.groupBoxOverlay.attach(templatePortal);
	}

	onContextMenuClick(event:any, currElemIdd?:any, isMoreButtonClick?:any) 
	{
		console.log('Print isMoreButtonClick on line 419::: ', isMoreButtonClick);
		if (isMoreButtonClick == null) 
		{
			this.createExpCollapseOverlay(event);
		}
		var grpBoxCount = document.getElementsByClassName('e12GroupBox').length;
		var currElem:any;
		if (document.getElementById(currElemIdd) != null && document.getElementById(currElemIdd)!.children[0] != null) 
		{
			currElem = document.getElementById(currElemIdd)!.children[0];
			console.log('Print currEleme::::: ', currElem.classList);
		}
		this.currElemId = currElemIdd
		var collapseCount = 0;
		var expandCount = 0;
		var totGrpBoxShown = 0;
		var expCollapseTemp:any = document.getElementById('expColpseOptForExtractTemp');
		console.log('Print ismoreBtnclick iisde onContextMenuClick:: ', isMoreButtonClick, grpBoxCount);
		if (isMoreButtonClick) 
		{
			var elem: Element | any = document.getElementById(currElemIdd);
			if (this.isExpanded) 
			{
				this.hideShowGroupBtnNew('CO', isMoreButtonClick);
				elem.children[0].innerHTML = 'Show More';
				elem.children[1].setAttribute('src', '/ibase/images/ExpandV.svg');
				this.isExpanded = !this.isExpanded;
			}
			else 
			{
				this.hideShowGroupBtnNew('EX', isMoreButtonClick);
				elem.children[0].innerHTML = 'Show Less';
				elem.children[1].setAttribute('src', '/ibase/images/CollapseV.svg');
				this.isExpanded = !this.isExpanded;
			}
		}
		else 
		{
			for (var i = 0; i < grpBoxCount; i++) 
			{
				var grpBoxElem = document.getElementsByClassName('e12GroupBox')[i];
				var styles: string | any = grpBoxElem.getAttribute('style');
				if (styles.includes('display: block')) 
				{
					totGrpBoxShown++;
				}
				var grpBoxElemClassList = grpBoxElem.children[0].classList;
				if (grpBoxElemClassList.contains('collapseGroupBox') && styles.includes('display: block')) 
				{
					collapseCount++;
				}
				else if (grpBoxElemClassList.contains('expandGroupBox') && styles.includes('display: block')) 
				{
					expandCount++;
				}
			}
			console.log('Print line no 552::: ', currElem);
			if (currElem.classList.contains('collapseGroupBox')) 
			{
				expCollapseTemp.children[0].setAttribute('style', 'display: none');
			}
			else 
			{
				expCollapseTemp.children[1].setAttribute('style', 'display: none');
			}
			if (totGrpBoxShown == 1) 
			{
				expCollapseTemp.children[2].setAttribute('style', 'display: none');
				expCollapseTemp.children[3].setAttribute('style', 'display: none');
			}
			else 
			{
				if (totGrpBoxShown == collapseCount) 
				{
					expCollapseTemp.children[2].setAttribute('style', 'display: none');
				}
				else if (totGrpBoxShown == expandCount) 
				{
					expCollapseTemp.children[3].setAttribute('style', 'display: none');
				}
			}
		}
		console.log('Print totGrpBoxShown line 517:: [' + totGrpBoxShown + '] collapseCount:: [' + collapseCount + '] expandCount:: [' + expandCount + ']');
	}

	hideShowGroupBtn(id:any) 
	{
		var elem:any = document.getElementById(id);
		var grpBoxElem = elem.children[0];
		var arrowElem
		var nextSiblingElem;

		if (grpBoxElem != null && grpBoxElem.classList.contains('expandGroupBox')) 
		{
			grpBoxElem.classList.remove('expandGroupBox');
			grpBoxElem.classList.add('collapseGroupBox');
		}
		else 
		{
			grpBoxElem.classList.remove('collapseGroupBox');
			grpBoxElem.classList.add('expandGroupBox');
		}

		arrowElem = elem.children[0].children[1];
		if (arrowElem != null && arrowElem.classList.contains('vision-ui-arrow_right')) 
		{
			arrowElem.classList.remove('vision-ui-arrow_right');
			arrowElem.classList.add('vision-ui-arrow_down');
		}
		else 
		{
			arrowElem.classList.remove('vision-ui-arrow_down');
			arrowElem.classList.add('vision-ui-arrow_right');
		}

		nextSiblingElem = elem.children[0].nextElementSibling;
		if (nextSiblingElem != null && nextSiblingElem.classList.contains('expandGroupBoxChild')) 
		{
			nextSiblingElem.classList.remove('expandGroupBoxChild');
			nextSiblingElem.classList.add('collapseGroupBoxChild');
		}
		else 
		{
			nextSiblingElem.classList.remove('collapseGroupBoxChild');
			nextSiblingElem.classList.add('expandGroupBoxChild');
		}
		if (this.groupBoxOverlay != null && this.groupBoxOverlay.hasAttached()) 
		{
			this.groupBoxOverlay.dispose();
		}
	}

	hideShowGroupBtnNew(opt:any, isMoreButtonClick?:any) 
	{
		var elem = document.getElementsByClassName('e12GroupBox');
		for (var i = 0; i < elem.length; i++) 
		{
			var grpBoxElem:any = elem[i];
			var firstChildElem = grpBoxElem.children[0];
			var secndChildElem = grpBoxElem.children[1];
			if (grpBoxElem.getAttribute('style').includes('display: block') && isMoreButtonClick == null) 
			{
				if (opt == 'EX' && firstChildElem.classList.contains('collapseGroupBox')) 
				{
					firstChildElem.classList.remove('collapseGroupBox');
					firstChildElem.classList.add('expandGroupBox');
					firstChildElem.children[1].classList.remove('vision-ui-arrow_right');
					firstChildElem.children[1].classList.add('vision-ui-arrow_down');
					secndChildElem.classList.remove('collapseGroupBoxChild');
					secndChildElem.classList.add('expandGroupBoxChild');
				}
				else if (opt == 'CO' && firstChildElem.classList.contains('expandGroupBox')) 
				{
					firstChildElem.classList.remove('expandGroupBox');
					firstChildElem.classList.add('collapseGroupBox');
					firstChildElem.children[1].classList.remove('vision-ui-arrow_down');
					firstChildElem.children[1].classList.add('vision-ui-arrow_right');
					secndChildElem.classList.remove('expandGroupBoxChild');
					secndChildElem.classList.add('collapseGroupBoxChild');
				}
			}
			else 
			{
				if (opt == 'EX') 
				{
					if (i != 0) 
					{
						grpBoxElem.setAttribute('style', 'padding: 0px 0px 5px 0px; display: block;');
					}
					if (i != 0 && firstChildElem.classList.contains('expandGroupBox')) 
					{
						grpBoxElem.setAttribute('style', 'padding: 0px 0px 5px 0px; display: block;');
						firstChildElem.classList.remove('expandGroupBox');
						firstChildElem.classList.add('collapseGroupBox');
						firstChildElem.children[1].classList.remove('vision-ui-arrow_down');
						firstChildElem.children[1].classList.add('vision-ui-arrow_right');
						secndChildElem.classList.remove('expandGroupBoxChild');
						secndChildElem.classList.add('collapseGroupBoxChild');
					}
				}
				else 
				{
					if (i != 0 && !grpBoxElem.getAttribute('style').includes('display: none')) 
					{
						grpBoxElem.setAttribute('style', 'padding: 0px 0px 5px 0px; display: none;');

					}
				}
			}
			if (this.groupBoxOverlay != null && this.groupBoxOverlay.hasAttached()) 
			{
				this.groupBoxOverlay.dispose();
			}
		}
	}

	expAndCollOnOptionsClick(option:any) 
	{
		if (option == 'E' || option == 'C') 
		{
			this.hideShowGroupBtn(this.currElemId);
		}
		else if (option == 'EX' || option == 'CO') 
		{
			this.hideShowGroupBtnNew(option);
		}
		this.currElemId = null;
	}

	setFocusOnFirstEditableFld(currentDet:any) 
	{
		console.log('Inside setFocusOnFirstEditableFld ', currentDet);
		if (currentDet == 'Detail1') 
		{
			var allHeaderSections = document.getElementsByClassName('freeFormContentTwoColumn');
			var headerSectionLen = allHeaderSections.length;
			headerLoop:
			for (var i = 0; i < headerSectionLen; i++) 
			{
				var allHeaderSectionChildren = allHeaderSections[i].children;
				for (var j = 0; j < allHeaderSectionChildren.length; j++) 
				{
					var fldElemChildren = allHeaderSectionChildren[j];
					var inputElem:any = fldElemChildren;
					var id;
					var elem: any;
					if (inputElem != null && inputElem.tagName == 'MAT-FORM-FIELD') 
					{
						var elemInput:any = inputElem.firstElementChild.firstElementChild.firstElementChild.firstElementChild;
						id = elemInput.id;
						elem = document.getElementById(id);
						if (elem != null && !elemInput.hasAttribute('disabled')) 
						{
							elem.focus();
							break headerLoop;
						}
					}
					else if (inputElem != null) 
					{
						id = inputElem.id;
						elem = document.getElementById(id);
						if (elem != null && !elem.classList.contains('disabledFieldAng')) 
						{
							elem.focus();
							break headerLoop;
						}
					}
				}
			}
		}
		else if (this.allformValues.hasOwnProperty(currentDet)) 
		{
			var detailLen = this.allformValues[currentDet].length;
			if (this.cuurentValidationRow.length > 0) 
			{
				let cuurentValidationData: any = this.cuurentValidationRow[0];
				var str = cuurentValidationData.split('_');
				detailLen = str[1];
			}
			var rowElemId = 'selected_' + currentDet + '_RowNo_' + detailLen;
			console.log('Print rowElemId for detail::: line 559 ', rowElemId);
			elem = document.getElementById(rowElemId);
			var selectedRowChildren = elem.children;
			detailLoop:
			for (var j = 0; j < selectedRowChildren.length; j++) 
			{
				var detailInputElem = selectedRowChildren[j].firstElementChild;
				if (detailInputElem != null) 
				{
					var detID = detailInputElem.id;
					var detElem = document.getElementById(detID);
					if (detElem != null && !detElem.classList.contains('disableCellData')) 
					{
						detElem.focus();
						break detailLoop;
					}
				}
			}
		}
	}

	openPopHelp(fldName:any, fldValue:any, formNo:any, detailRowNo?:any) 
	{
		this.FORM_NO = formNo;
		this.feildName = fldName;
		var sqlInput: string = "";
		for (var i = 0; i < this.pophelpDataList.length; i++) 
		{
			var popHelpFldName: string = this.pophelpDataList[i]['attrib']['@FIELD_NAME'].toLowerCase();
			if (fldName == popHelpFldName) 
			{
				sqlInput = this.pophelpDataList[i]['attrib']['@SQL_INPUT'];
				break;
			}
		}

		//Change by shrutika for system Inconsistency error occur when directly click on pophelp without selecting row.
		if (this.cuurentFormNumber != formNo) 
		{
			setTimeout(() => {
				this.updateChgStr(formNo, detailRowNo);
				this.popHelp.openSuggest(fldName, fldValue, sqlInput, this.pkValues);
			}, 1000);
		}
		else 
		{
			this.updateChgStr(formNo, detailRowNo);
			this.popHelp.openSuggest(fldName, fldValue, sqlInput, this.pkValues);
		}
	}

	callLocalItemChange(fldName:any, fldValue:any, formNo:any, detailRowNo?:any) 
	{
		try 
		{
			this.getMandatoryFeilds();
			this.feildName = fldName;
			this.FORM_NO = formNo;
			this.updateChgStr(formNo, detailRowNo);
			if (this.popHelp.itemChangeList.includes(fldName) && fldValue != null) 
			{
				var tempData = JSON.parse(this.tmpDataCopy);
				var res;
				if ((<any>window).localItemChange) 
				{
					res = (<any>window).localItemChange(tempData['OBJ_CTX'], 'itemchange', tempData['OBJ_NAME'], this.popHelp.paramData,
						fldName, '', fldValue);
				}
				var returnVal;
				console.log('Print res 478::: ', res);
				if (res != null && res.trim().length > 0) 
				{
					console.log('Print inisde localitemchane 481');
					returnVal = JSON.parse(res);
					var retVal:any = {};
					retVal = returnVal.ROOT.Detail[0];
					if (retVal) 
					{
						for (const key of Object.keys(retVal)) 
						{
							this.allformValues[key] = retVal[key];
						}
					}
				}
				this.popHelp.onItemChange(fldName, fldValue);
			}
		}
		catch (e: any) 
		{
			console.log('Exception inside callLocalItemChange ', e.message);
		}
	}

	buildItemChangeList(objDetailsData:any) 
	{
		var objdetailsNew = {} = JSON.parse(objDetailsData);
		if (objdetailsNew && objdetailsNew!.ROOT) 
		{
			if (objdetailsNew.ROOT.ITEMCHANGE_FIELDS.ITEMCHANGE_FIELD != null) 
			{
				var childLen = objdetailsNew.ROOT.ITEMCHANGE_FIELDS.ITEMCHANGE_FIELD.length;
				//this.itemChangeArr = objdetailsNew.ROOT.ITEMCHANGE_FIELDS.ITEMCHANGE_FIELD;
                for( var i=0 ; i<childLen; i++ )
                {
                    var itemchangeData = objdetailsNew.ROOT.ITEMCHANGE_FIELDS.ITEMCHANGE_FIELD[i].content;
                    this.itemChangeArr.push(itemchangeData);
                }
                console.log('inside buildItemChangeList........itemChangeArr',this.itemChangeArr);
			}
		}
	}

	checkError(serverData:any) 
	{
		var errorData: any[] = this._extractTempletService.getErrorData(serverData);
		var msg = errorData[0] != undefined ? errorData[0] : "";
		var msgDescr = errorData[1] != undefined ? errorData[1] : "";
		var msgTrace = errorData[2] != undefined ? errorData[2] : "";
		var errMsg = this._extractTempletService.getErrorMsg(msg, msgDescr, msgTrace);
		console.log('errMsg', errMsg);
		this._extractTempletService.setLoading(false);
		alert(errMsg);
	}

	updateChgStr(formNo:any, detailRowNo:any) 
	{

		var rowNo = detailRowNo == null ? -1 : detailRowNo;
		// var attributeTagJson;
		// var attributeTagInXml;
		this.detailNum = rowNo;
		this.popHelp.detailNum = 'Detail' + formNo;
		if (detailRowNo == null) 
		{
			this.popHelp.keyValue = this.allformValues['domID'];
			console.log('Print domID when angular sign selected::: ', this.popHelp.keyValue);
		}
		else 
		{
			this.popHelp.keyValue = this.allformValues[this.popHelp.detailNum][detailRowNo]['domID'];
			console.log('Print domID when angular sign selected::: ', this.popHelp.keyValue);
		}
		// this.popHelp.keyValue = detailRowNo == null ? '1' : detailRowNo + 1;
		this.popHelp.itemChangeList = this.itemChangeArr[formNo - 1];
		console.log('Print itemchangelist::: ', this.popHelp.itemChangeList);
		var detailLength = rowNo >= 0 && (this.popHelp.detailNum != 'Detail1') ? this.allformValues[this.popHelp.detailNum].length : null;
		this.popHelp.protectAttribParams = this.protectAttribParams;
		this.popHelp.visibleAttribParams = this.visibleAttribParams;
		if (detailLength == null && rowNo >= 0) 
		{
			this.popHelp.paramData = this.allformValues[this.popHelp.detailNum];
			this.popHelp.compData['OBJ_CTX'] = formNo;

		}
		else if (rowNo >= 0) 
		{
			this.popHelp.paramData = JSON.stringify(this.allformValues[this.popHelp.detailNum][rowNo])
			// if (this.allFormAttributeTag[this.popHelp.detailNum][rowNo]) {
			// 	attributeTagJson = this.allFormAttributeTag[this.popHelp.detailNum][rowNo];
			// 	console.log('Print attributeTagJson 591 ', attributeTagJson);
			// }
			this.popHelp.compData['OBJ_CTX'] = formNo;

		}
		else 
		{
			var currentAllData = JSON.parse(JSON.stringify(this.allformValues));
			console.log('Inside else condition start', JSON.stringify(currentAllData));
			for (var key in currentAllData) 
			{
				var value = currentAllData[key];
				if (value instanceof Array) 
				{
					delete currentAllData[key];
				}
			}
			this.popHelp.paramData = JSON.stringify(currentAllData);
			this.popHelp.compData['OBJ_CTX'] = formNo;
			// attributeTagJson = this.allFormAttributeTag[this.popHelp.detailNum];
		}
		// attributeTagInXml = `<attribute IS_CHANGE="Y"`;
		// for (const key of Object.keys(attributeTagJson)) {
		// 	attributeTagInXml = attributeTagInXml + ` ` + key + `="` + attributeTagJson[key] + `"`;
		// }
		// attributeTagInXml = attributeTagInXml + `/>`;
		// this.popHelp.attributeTag = attributeTagInXml;
	}

	selectedValueFromPopHelp(values:any) 
	{
		var selectedVal = JSON.parse(values);
		for (const key of Object.keys(selectedVal)) 
		{
			if (this.allformValues.hasOwnProperty(key) && (this.popHelp.detailNum == 'Detail1')) 
			{
				this.allformValues[key] = selectedVal[key];
			}
			else 
			{
				console.log('Prnt this.popHelp.detailNum :::: ', this.popHelp.detailNum);
				this.allformValues[this.popHelp.detailNum][this.detailNum][key] = selectedVal[key];
			}
		}
	}

	checkErrorOfJsonData(values:any) 
	{
		var errorData: any[] = this._extractTempletService.getErrorOfJsonData(values);
		var msg = errorData[0] != undefined ? errorData[0] : "";
		var msgDescr = errorData[1] != undefined ? errorData[1] : "";
		var msgTrace = errorData[2] != undefined ? errorData[2] : "";
		var errMsg = this._extractTempletService.getErrorMsg(msg, msgDescr, msgTrace);
		this._extractTempletService.setLoading(false);
		//Mahesh changes 04-05-2020
		// alert(errMsg);
		this.confirmBox.alert('Error', errMsg);
	}

	onItemChangeFromPophelp(values:any) 
	{
		console.log('Print values lin no 278::::: [' + values + ']');
		var details = JSON.parse(values);
		var itemChnageValues:any = {};
		var formNo = this.compData['NO_OF_FORMS'];
		try 
		{
			if (values.indexOf('Errors') != -1) 
			{
				this.checkError(values);
			}
			else 
			{
				for (var i = 0; i < formNo; i++) 
				{
					var curronFormNo = i + 1;
					var currentFormNoDetail = 'Detail' + curronFormNo;
					if (details.Root[currentFormNoDetail]) 
					{
						console.log('Inside Detail ', currentFormNoDetail);
						itemChnageValues = details.Root[currentFormNoDetail];
						if (currentFormNoDetail == 'Detail1') 
						{
							for (var key in itemChnageValues) 
							{
								if (itemChnageValues[key] && (itemChnageValues[key].content || itemChnageValues[key].content == 0)) 
								{
									if (itemChnageValues[key] && itemChnageValues[key].content) 
									{
										var value = itemChnageValues[key].content;
										this.allformValues[key] = value;
										this.checkProtectAndvisibleforFirstForm(itemChnageValues, key);
									}
								}
								else 
								{
									var value = itemChnageValues[key];
									if (value instanceof Object) 
									{
										value = "";
									}
									this.allformValues[key] = value;
									this.checkProtectAndvisibleforFirstForm(itemChnageValues, key);
								}
							}
						}
						else 
						{
							for (const key of Object.keys(itemChnageValues)) 
							{
								var id = this.popHelp.detailNum + '.' + (this.detailNum + 1) + '.' + key;
								if (itemChnageValues[key] && (itemChnageValues[key].content || itemChnageValues[key].content == 0)) 
								{
									var value = itemChnageValues[key].content;
									this.allformValues[currentFormNoDetail][this.detailNum][key] = value;
									this.checkProtectAndVisbile(itemChnageValues, key, id);
								}
								else 
								{
									var value = itemChnageValues[key];
									if (value instanceof Object) 
									{
										value = "";
									}
									this.allformValues[currentFormNoDetail][this.detailNum][key] = value;
									this.checkProtectAndVisbile(itemChnageValues, key, id);
								}
							}
						}
					}
				}
			}
		}
		catch
		{
			console.log('Exception inside onItemChangeFromPophelp');
		}
		this.getMandatoryFeilds();
	}

	setDataExtractedFromPdf(index:any, detailData:any, detailDataFromPdf:any, detailNo:any, formNo:any) 
	{
		var rowNum = index + 1;
		var detailArray:any = [];

		let detailLen = 0;
		if (this.allformValues.hasOwnProperty(detailNo)) 
		{
			detailLen = this.allformValues[detailNo].length;
		}
		console.log('Print detailLen inside setDataExtractedFromPdf::: ', detailLen);
		if (detailLen != 0) 
		{
			// detailArray = this.allformValues[detailNo];
		}
		// for (const key of Object.keys(detailData)) 
		// {
		// 	var value = detailData[key];
		// 	if (key != 'attribute' && value instanceof Object) 
		// 	{
		// 		value = "";
		// 	}
		// 	detailData[key] = value;
		// }
		// for (const key of Object.keys(detailDataFromPdf)) 
		// {
		// 	var value = detailDataFromPdf[key];
		// 	if (detailData.hasOwnProperty(key)) 
		// 	{
		// 		detailData[key] = value;
		// 	}
		// }
		for(var i=1; i<=this.lineLen; i++){
			
			var detailData = this.mapForNewDetail[i];
			var dataFromPdf = this.mapForNewDetailFromPdf[i];
            // Changed by Pravin k on 4-NOV-20 [for tehe issue after save and extract data] SATRT
            if(!this.mapForNewDetail[1])
            {
                detailData = this.mapForNewDetail[i+1];
			    dataFromPdf = this.mapForNewDetailFromPdf[i+1];
		    }
            console.log("detailData-:",detailData,":dataFromPdf:",dataFromPdf);
            if(detailData)
            {
                for (const key of Object.keys(detailData)) 
                {
                    var value = detailData[key];
                    if (key != 'attribute' && value instanceof Object) 
                    {
                        value = "";
                    }
                    detailData[key] = value;
                }
                for (const key of Object.keys(dataFromPdf)) 
                {
                    var value = dataFromPdf[key];
                    if (detailData.hasOwnProperty(key)) 
                    {
                        detailData[key] = value;
                    }
                }
                detailData['line_indx'] = dataFromPdf['line_indx'];
                console.log("detailData::",detailData);
                detailArray.push(detailData);       
            }
            // Changed by Pravin k on 4-NOV-20 [for tehe issue after save and extract data] END
        }
        //added by pravin k on 3-NOV-20[to add  line_indx] START
        var tempObj={};
        console.log('inside 1070..........detailArray:[',detailArray,"],this.lineLen[",this.lineLen,"]");
        // for(var i=0; i<this.lineLen; i++)
        // {
           
        //     if(detailArray[i])
        //     {
        //         var tempArrObj =   detailArray[i];
        //         var line_indx = tempArrObj["line_indx"];
        //         line_indx = Number(line_indx);
        //         tempObj[line_indx] = tempArrObj;
        //     }
        // }
        // detailArray = [];
        // console.log('inside tempObj:',tempObj,",:detailArray:",detailArray);
        // for(var i=0; i<this.lineLen; i++)
        // {
        //     detailArray.push( tempObj[i+1] ); 
        // }
        //added by pravin k on 3-NOV-20[to add  line_indx] START

		this.allformValues[detailNo] = detailArray;
		// this.validatePdfRows(detailNo,formNo,detailLen);

		this.detailCount = 0;
		console.log('inside 1070..........',this.allformValues[detailNo]);
		for(var i=0; i<this.lineLen; i++)
		{
			this.updateChgStr(formNo, i);
			this.callItemDeafult( 'itm_default', '',formNo, i);
		}
		for(var i=1; i<=this.allformValues[detailNo].length; i++ )
		{
			console.log('inside 1072....',i);
			 this.validatePdfRows(detailNo,formNo,i); 
		}
		this._extractTempletService.setLoading(false);
		setTimeout(() => {
			this.getMandatoryFeilds();
			//this.setFocusOnFirstEditableFld(detailNo);
		}, 2000);
	}

	addDetail(detailNo:any, formNo:any, isFromAttachPdf?: boolean, detailDataFromPdf?:any) 
	{
		this.FORM_NO = formNo;

		// var allFormAttrArray = [];
		console.log('Inside add detial: [' + detailNo + ']isFromAttachPdf[',isFromAttachPdf,']');//PA
		let detailLen = 0;
		if (this.allformValues.hasOwnProperty(detailNo)) 
		{
			detailLen = this.allformValues[detailNo].length;
		}
		var newRow = detailLen;
		if( isFromAttachPdf )
		{
			this.addNewDetailRow(formNo, newRow, isFromAttachPdf, detailDataFromPdf)
		}
		else
		{
			var rowData = formNo + "_" + (newRow + 1);
			if (this.cuurentValidationRow.length > 0) 
			{
				let cuurentValidationData: any = this.cuurentValidationRow[0];
				var str = cuurentValidationData.split('_');
				this.validateCurrentDetail(str[0], str[1], rowData, formNo, newRow, true, isFromAttachPdf, detailDataFromPdf, false,false);
			}
			else 
			{
				if (this.cuurentFormNumber == "1") 
				{
					console.log("call Validate first from......1064");
					this.callPreVlaidate(true, rowData, formNo, newRow, detailDataFromPdf, isFromAttachPdf, false);
				}
				else 
				{
					this.addNewDetailRow(formNo, newRow, isFromAttachPdf, detailDataFromPdf)
				}
			}
		}
	}
	//Mahesh changes 04-05-2020
	validateMandatoryFlds() 
	{
		try 
		{
			var isError = false;
			var rowNo = 0;
			var tempData = JSON.parse(this.tmpDataCopy);
			console.log('Print all form values:::: [' + JSON.stringify(this.allformValues) + ']');
			var returnVal;
			if ((<any>window).localWfValData) 
			{
				returnVal = (<any>window).localWfValData(tempData['OBJ_CTX'], 'finish', tempData['OBJ_NAME'], this.allformValues, '');
			}
			console.log('Print retrun val 808::: ', returnVal);
			if (returnVal != undefined && returnVal != false) 
			{
				console.log('Print response of local validation');
				this.checkError(returnVal);
				isError = true;
				return isError;
			}
			for (var a = 0; a < this.allMandatoryFields.length; a++) 
			{
				// var splitId = id.split('.');
				let id = this.allMandatoryFields[a];
				var str = id.split('.');
				let currentFormDet = str[0]
				// let id = str[1];
				rowNo = str[1] - 1;
				var inputElem = document.getElementById(id);
				let fldName = str[2];
				if (currentFormDet == 'Detail1') 
				{
					let fldVal = this.allformValues[fldName];
					if (!(fldVal.length > 0) && inputElem != null) 
					{
						alert('Set all mandatory feilds');
						inputElem.focus();
						isError = true;
						break;
					}
				}
				else 
				{
					let detailLen = 0;
					if (this.allformValues.hasOwnProperty(currentFormDet)) 
					{
						detailLen = this.allformValues[currentFormDet].length;
					}
					let fldVal = this.allformValues[currentFormDet][rowNo][fldName];
					if (!(fldVal.trim().length > 0) && inputElem != null) 
					{
						alert('Set all mandatory feilds');
						inputElem.focus();
						isError = true;
						break;
					}
				}
			}
			return isError;
		}
		catch (e: any) 
		{
			console.log('Exception inside validateMandatoryFlds() ', e.message);
		}
	}

	save() 
	{
		try 
		{
            //Added by Pravin K on 6-JAN-21 [To save new changed valus for training AI engine] START
            console.log('inside Save::this.editFlag[',this.editFlag,']cuurentFormNumber:',this.cuurentFormNumber);
			console.log("inside  afterSaveClick......this.editFlag");
            console.log("this.allItemCodes[",this.allItemCodes);
            console.log("this.allformValues[",this.allformValues);
            console.log("this.allformValues[",this.allformValues['Detail2']);
            this.trainingData = [];
            //Added by Pravin K on 4-FEB-21 [checked allformValues is not null]  
            for(var i = 0; this.allformValues['Detail2'] && i < this.allformValues['Detail2'].length ;i++ )
            {
                var obj =  this.allformValues['Detail2'][i];
                var descr = obj["descr"];
                var item_code = obj["item_code"];
                var pred_obj = this.allItemCodes[descr];
                //console.log("obj[",obj,"],pred_obj[",pred_obj,"]");
                if(pred_obj)
                {
                    var pred_item_code = pred_obj["item_code"];
                    //console.log("pred_item_code[",pred_item_code,"],item_code[",item_code,"]");
                    if( pred_item_code != item_code)
                    {
                        // this.trainingData.push({"item_code":item_code, "text":descr});
						this.trainingData.push({"item_code":item_code, "text":descr});
                    }
                }
                else
                {
                    // this.trainingData.push({"item_code":item_code, "text":descr});
					this.trainingData.push({"item_code":item_code, "text":descr});
                }
            }
            console.log("this. data for trainingData [", this.trainingData);
            this._extractTempletService.setLoading(true);//Added By Pravin k on 27-JAN-21
            this._extractTempletService.trainTimeCodeAPI(JSON.stringify(this.trainingData)).subscribe((data: any) =>{
                this._extractTempletService.setLoading(false);//Added By Pravin k on 27-JAN-21
                console.log("Resust of  trainingData ::data [", data);
            });
            
            this.afterSaveClick(false);
            //Added by Pravin K on 6-JAN-21 [To save new changed valus for training AI engine] END
            //Change by shrutika on 26/10/2020 [Start] for working finish functionality same as compact layout(Eevery fiels validate on finish because of processRequest)
            // Changed by Pravin k on 4-NOV-20 [changes done as suggested by shrutika] SATRT
            
            // if(this.editFlag == 'A')
            // {
            //     if (this.cuurentFormNumber == "1") 
            //     {
            //         this.callPreVlaidate(false, this.cuurentValidationRow[0], this.cuurentFormNumber, "", null, false, true);
            //     }
            //     else if (this.cuurentValidationRow.length > 0) 
            //     {
            //         let cuurentValidationData = this.cuurentValidationRow[0];
            //         var str = cuurentValidationData.split('_');
            //         this.validateCurrentDetail(str[0], str[1], "", this.cuurentFormNumber, "", false, false, null, true,false);
            //     }
            // }
            // else
            // {
            //     this.afterSaveClick(false);
            // }
            
            
            // Changed by Pravin k on 4-NOV-20 [changes done as suggested by shrutika] END
            //Change by shrutika on 26/10/2020 [End] for working finish functionality same as compact layout(Eevery fiels validate on finish because of processRequest)
		}
		catch (e:any) 
		{
			console.log('Exception in save method....', e.message);
		}
	}

	OBJtoXML(obj:any) 
	{
		var xml = '';
		for (var prop in obj) 
		{
			if (obj[prop] instanceof Array) 
			{
				for (var array in obj[prop]) 
				{
					xml += '<' + prop + '>';
					xml += this.OBJtoXML(new Object(obj[prop][array]));
					xml += '</' + prop + '>';
				}
			}
			else 
			{
				xml += '<' + prop + '>';
				typeof obj[prop] == 'object' ? xml += this.OBJtoXML(new Object(obj[prop])) : xml += '<![CDATA[' + obj[prop] + ']]>';
				xml += '</' + prop + '>';
			}
		}
		var xml = xml.replace(/<\/?[0-9]{1,}>/g, '');
		return xml;
	}
    //Added By Pravin k on 18-FEB-21 START
    OBJtoXMLForDetail2(obj:any) 
	{
		//var xml = "<?xml version='1.0' encoding='utf-8'?> <Root> <header> <objName><![CDATA[sorderform]]></objName> <pageContext><![CDATA[2]]></pageContext> <objContext><![CDATA[2]]></objContext>	<editFlag><![CDATA[A]]></editFlag> <focusedColumn><![CDATA[]]> </focusedColumn> <elementName><![CDATA[false]]></elementName> <keyValue><![CDATA[1]]></keyValue> <taxKeyValue><![CDATA[1]]></taxKeyValue> <saveLevel><![CDATA[0]]></saveLevel><forcedSave><![CDATA[false]]></forcedSave> <taxInFocus><![CDATA[false]]></taxInFocus> </header> ";
        var xml=`<DocumentRoot><description>Datawindow Root</description><group0><description>Group0 description</description><Header0><description>Header0 members</description>`;

		for (var prop in obj) 
		{
    
            var totqty ='';
            xml +='<Detail2 dbID=\'\' domID=\'\' objContext=\'2\' objName=\'sorderform\'> <attribute pkNames=\'\' selected=\'N\' status=\'N\' updateFlag=\'A\' />';
			if (obj[prop] instanceof Array) 
			{
				for (var array in obj[prop]) 
				{
					xml += '<' + prop + '>';
					xml += this.OBJtoXML(new Object(obj[prop][array]));
					xml += '</' + prop + '>';
				}
			}
			else 
			{
				xml += '<' + prop + '>';
				typeof obj[prop] == 'object' ? xml += this.OBJtoXML(new Object(obj[prop])) : xml += '<![CDATA[' + obj[prop] + ']]>';
				xml += '</' + prop + '>';
			}
            //xml += ' <ATTRIBUTE_NODE><![CDATA[<attribute IS_CHANGE = \'Y\'  pkNames=\'\' selected=\'N\' status=\'N\' updateFlag=\'A\' protectSubform=\'\' />]]></ATTRIBUTE_NODE> </Detail2>';
            console.log("prop[",prop,"]totqty[",totqty,"]");
            totqty = obj[prop]['totqty'];
            console.log("totqty[",totqty,"]");
            xml +='<tax_type><![CDATA[]]></tax_type><qty_1><![CDATA['+totqty+`]]></qty_1><qty_2><![CDATA[0]]></qty_2><qty_3><![CDATA[0]]></qty_3><qty_4><![CDATA[0]]></qty_4><qty_5><![CDATA[0]]></qty_5><qty_6><![CDATA[0]]></qty_6><qty_7><![CDATA[0]]></qty_7><qty_8><![CDATA[0]]></qty_8><qty_9><![CDATA[0]]></qty_9><qty_10><![CDATA[0]]></qty_10><qty_11><![CDATA[0]]></qty_11><qty_12><![CDATA[0]]></qty_12><qty_1_t><![CDATA[00/00/00]]></qty_1_t><qty_2_t><![CDATA[00/00/00]]></qty_2_t><qty_3_t><![CDATA[00/00/00]]></qty_3_t><qty_4_t><![CDATA[00/00/00]]></qty_4_t><qty_5_t><![CDATA[00/00/00]]></qty_5_t><qty_6_t><![CDATA[00/00/00]]></qty_6_t><qty_7_t><![CDATA[00/00/00]]></qty_7_t><qty_8_t><![CDATA[00/00/00]]></qty_8_t><qty_9_t><![CDATA[00/00/00]]></qty_9_t><qty_10_t><![CDATA[00/00/00]]></qty_10_t><qty_11_t><![CDATA[00/00/00]]></qty_11_t><qty_12_t><![CDATA[00/00/00]]></qty_12_t><cust_item_ref_descr><![CDATA[ ]]></cust_item_ref_descr></Detail2>`
		}
        xml += '</Header0></group0></DocumentRoot>';
		var xml = xml.replace(/<\/?[0-9]{1,}>/g, '');
		return xml;
	}
    
    addDetail2Rows(lines:any)
    {
        this._extractTempletService.setLoading(true);
        var detail2Xml = this.OBJtoXMLForDetail2(lines);
        console.log('addDetail2Rows callback Print detail2Xml:',detail2Xml);
        //xmldata,obj_ctxt,objName, core_mdl_id,forced_daved,pk_values)
        var forcedSave = 'false';
        
        var self = this;
        console.log('22 attached callback currentCompData[',self.currentCompData,'],compData[',self.compData,']');
        //var self = this;
        self._extractTempletService.getDetail2data(detail2Xml,self.compData['OBJ_CTX'],self.compData['CORE_MDL_ID'], self.objName, 
        
        forcedSave, self.compData['PK_VALUES']).subscribe((data: any) => {
            
            self._extractTempletService.setLoading(false);

            console.log('getDetail2data callback result[',data,']');
            var jsonDetail2Data = JSON.parse(data);
            var detail2ArrNew:any = [];
            if(jsonDetail2Data && jsonDetail2Data["DocumentRoot"]["group0"]["Header0"]["Detail2"] )
            {
                var detail2Arr = jsonDetail2Data["DocumentRoot"]["group0"]["Header0"]["Detail2"];
                var detail2ArrLen = detail2Arr.length;
                for(var cn=0; cn < detail2ArrLen ; cn++)
                {
                    //console.log("detail2Arr[",cn,"][",detail2Arr[cn],"],self.data.lines[",cn,"][",self.data.lines[cn],"]");
                    Object.assign(detail2Arr[cn], self.data.lines[cn]);
                    detail2ArrNew.push(detail2Arr[cn]);
                }
            }
            
            console.log("detail2ArrNew[",detail2ArrNew,"]");
            self.allformValues['Detail2'] = detail2ArrNew;
            console.log(" self.allformValues[", self.allformValues,"]");


            setTimeout(() => {
            
                var ErrArr = jsonDetail2Data["detail2_errors"];
                console.log(" checkErrorException -------   ErrArr",Object.keys(ErrArr));
                for(var obj in ErrArr)
                {
                    var errStr = ErrArr[obj];
                    console.log("checkErrorException  detail2ErrArr[",obj,"][",errStr,"]");
                    //selected_Detail2_RowNo_1
                    var modifiedDomId = obj+"";
                    if( obj.length == 1)
                    {
                        modifiedDomId = '0'+obj;
                    }
                    var validationKey = modifiedDomId + "_2"; 
                    console.log('checkErrorExceptionrow validationKey[',validationKey,']');

                    self._extractTempletService.checkErrorException(errStr, function(res:any){
                        console.log("checkErrorException callback::",res);
                    },validationKey)
                }

                //for(var ob in obj){console.log(obj[ob]);}
                console.log("showIndicator -------------  ErrArr[",ErrArr,"], AllKeys::",Object.keys(ErrArr));
                console.log("errorRowsList", JSON.stringify(this._extractTempletService.errorRowsList) ,"]");
                for(var obj in ErrArr)
                {
                    console.log("ErrArr[",obj,"][",ErrArr[obj],"]");
                    //selected_Detail2_RowNo_1
                    var rowToValidate = 'selected_Detail2_RowNo_' + obj;
                    console.log('inside add detail rowToValidate[',rowToValidate,']');
                    self.showIndicator(rowToValidate, 2, obj);
                }
            }, 1000);

        });
    }
    //Added By Pravin k on 18-FEB-21 END

	attachedCallback(data:any) 
	{
		console.log('attachedCallback called', data);
		if (data["DOC_ID"]) 
		{
			var self = this;
			var extractedData;
			var docId = data["DOC_ID"];
			this.docType = data["FILE_TYPE"];
			this.pdfSrc = "";
			this.safeSrc = "";
			console.log('.... this.pdfSrc', this.pdfSrc);
            this._extractTempletService.setLoading(true);//Added By Pravin k on 27-JAN-21
			this.invoiceTransactionService.getUplodedDocumentsDetails(docId).subscribe(
				result => {
					console.log('callBack getUplodedDocumentsDetails :: result', result);
					//var strData = result["_body"];
					var strData = JSON.stringify(result);
					//console.log('strData', result["_body"]);
					console.log('callBack getUplodedDocumentsDetails :: ....1261');
					//var jsonData = JSON.parse(strData);
					var jsonData = JSON.parse(result);
					console.log('jsonData', jsonData);
					console.log('docId', docId);
					jsonData["DOC_ID"] = docId;
					console.log('jsonData', jsonData);
					if (jsonData['EXTRACTED_DATA'] && this.editFlag == 'A') 
					{

                        //Aded by Pravin k on 25-OCT-20[To hide create template ] START 
                        this.showTableMarking = false;
                        this.selectKeyword = "Change Keywords";
                        //Aded by Pravin k on 25-OCT-20[To hide create template ] START 
                        if (jsonData['EXTRACTED_DATA']) 
                        {
                            extractedData = JSON.parse(jsonData['EXTRACTED_DATA']); 
                            console.log('extractedData', extractedData);
                            console.log('newObj extractedData this.numOfForms', this.numOfForms);
                            for (var i = 1; i < this.numOfForms; i++) 
                            {
                                var formDetail = 'Detail' + i;
                                var formNo = i;
                                for (const key of Object.keys(extractedData)) 
                                {
                                    var id = formDetail + '.' + i + '.' + key;
                                    var elem = document.getElementById(id);
                                    var value = extractedData[key];
                                    if(elem != null && elem.getAttribute('format') == 'dateBox')
                                    {
                                        var arrayDate = value.split('-'); // YY-MM-DD
                                        var validDate = arrayDate[1] + '/' + arrayDate[2].substring(0, 2) + '/' + arrayDate[0]; //MM-DD-YY
                                        // validDate = arrayDate[1] + '/' + arrayDate[0] + '/' + arrayDate[0];
                                        this.allformValues[key] = new Date(validDate);
                                    }
                                    else if (key != 'lines' && this.allformValues.hasOwnProperty(key) && formDetail == 'Detail1') 
                                    {
                                        this.allformValues[key] = extractedData[key];
                                    }
                                }
                            }
                        }
                       // this.callPreVlaidate(false, this.cuurentValidationRow[0], this.cuurentFormNumber, "", null, true, false);
                
                        self.data = {};
                        self.data = JSON.parse(jsonData['EXTRACTED_DATA']);
                        console.log('Print inside getPythonServiceUrl self.data',self.data);
                        var strLines = self.data.lines;
                        console.log('Print strLines:',strLines);
                        console.log('Print this.allformValues',this.allformValues);//pa
                        //Added by Pravin K on 8-OCT-20 [For if data is extracted but lines not readed] START
                        var lines:any = [];
                        if(strLines)
                        {
                            lines = strLines;
                        }

                        // if(strLines)
                        // {
                        //     const regex = /\"\w+'\w+\"/g;
                        //     if(strLines.search(regex))
                        //     {
                        //         var arr = strLines.match(regex);
                        //         console.log("arr:",arr);

                        //         if(arr)
                        //         {	
                        //             for(var valIndx in arr)
                        //             {
                        //                 var newVal=  arr[valIndx].replace("'","\\\'");
                        //                 console.log(arr[valIndx]+"-:"+newVal);
                        //                 strLines = strLines.replace(arr[valIndx],newVal);
                        //             }
                        //         }
                        //         console.log("2 strLines:",strLines);

                        //         strLines = strLines.replace(/'/g, '"');
                        //         console.log("3 strLines:",strLines);

                        //         strLines = strLines.replace(/\\"/g, "'");
                        //         console.log("4 strLines:",strLines);
                        //     }
                        //     else
                        //     {
                        //         strLines = strLines.replace(/'/g, '"');
                        //     }
                        //     lines = JSON.parse(strLines);
                        // }
                        var newLines:any = [];
                        this.lineLen = lines.length;
                        
                        //Added by Pravin K on 8-OCT-20 [For if data is extracted but lines not readed] END
                        //Added by Pravin K on 2-NOV-20 for line_indx START
                        console.log('Print new lines::[',lines);
                        

                        var objData = self.data.itemCodeList
                        console.log('Print objData::',objData);
                        this.allItemCodes = objData;//added by pravin k on 6-JAN-21
                        for (var i = 0;  i < this.lineLen ; i++){
                            lines[i]["line_indx"] = i+1; 
                            lines[i]["dom_id"] = i+1; 
                            //NEW START -6-JAN-21   
                            var lineObj = lines[i];
                            var key = lineObj.descr;
                            console.log('inside for loop......1394',i);
                            //Added By Pravin K on 25-AUG-20[For all item codes] START 
                            var value:any ="";
                            var newObj:any = {};
                            if(objData)
                            {
                                if(objData[key]) 
                                {
									//Added by Nikhil on 02/12/2022 for item code is not extracted in attachment.
                                    //value = objData[key]["item_code"];
                                    value = objData[key];
                                }
                            }
                            console.log("newObj getAllItemCode allItemCodes:key[",key,"][",objData[key],"]");
                            if (value) 
                            {
                                newObj["item_code"] = value;
                            }
                            else 
                            {
                                newObj["item_code"] = "";
                            }
                            for (var k in lineObj) 
                            {
                                newObj[k] = lineObj[k];
                            }
                            newLines.push(newObj);
                            console.log('newObj getAllItemCode callback', JSON.stringify(newObj));
                            console.log('newObj getAllItemCode this.numOfForms', this.numOfForms);

                            // comented By Pravin K for detail 2 texting START       
                            // for (var j = 2; j <= this.numOfForms; j++) 
                            // {
                            //     var currentDetail = 'Detail' + j;
                            //     console.log('newObj getAllItemCode currentDetail', currentDetail);
                            //     var formNo = j;
                            //     if (currentDetail != 'Detail1') 
                            //     {
                            //         this.addDetail(currentDetail, formNo, true, newObj);
                            //     }
                            // }
                            // comented By Pravin K for detail 2 texting START 
                            
                        }
                        console.log('attached callback Print lines after line add',lines);
                        self.data.lines = newLines;

                        this.callPreVlaidate(false, this.cuurentValidationRow[0], this.cuurentFormNumber, "", null, true, false);//added By pravin k on 19-JAN-21 
                        //Added Pravin K on 18-FEB-21 [to call addDeail once] START 
                        console.log('attached callback Print lines after line add newLines',newLines);
                        this.addDetail2Rows(newLines);
                        //Added Pravin K on 18-FEB-21 [to call addDeail once] END
 
                        //Added by Pravin K on 2-NOV-20 for line_indx END
                        
                        //new new

                       
                        //Added by Pravin K on 23-OCT-20[For template creation overlay] END
                        // this._extractTempletService.getAllItemCodeList(JSON.stringify(lines)).subscribe(data => {
                        //         console.log("attachedCallback getAllItemCodeList::result data:[", data);
                        //         if (data.includes("result") ) 
                        //         {
                        //             var objData = JSON.parse(data);
                        //             console.log("attachedCallback getAllItemCode::result objData[", objData,"]");
                        //             var objData = objData["result"];
                        //             console.log("getAllItemCode::result objData[", objData,"]");
                        //             if(objData)
                        //             {
                        //                 this.allItemCodes = objData;

                        //                 //old start
                        //                 for (var i = 0; i < lines.length; i++) 
                        //                 {
                        //                     var lineObj = lines[i];
                        //                     var key = lineObj.descr;
                        //                     console.log('inside for loop......1394',i);
                        //                     //Added By Pravin K on 25-AUG-20[For all item codes] START 
                        //                     var value:any ="";
                        //                     var newObj = {};
                        //                     if(objData)
                        //                     {
                        //                         if(objData[key]) 
                        //                         {
                        //                             value = objData[key]["item_code"];
                        //                         }
                        //                     }
                        //                     console.log("newObj getAllItemCode allItemCodes:key[",key,"][",objData[key],"]");
                        //                     if (value) 
                        //                     {
                        //                         newObj["item_code"] = value;
                        //                     }
                        //                     else 
                        //                     {
                        //                         newObj["item_code"] = "";
                        //                     }
                        //                     for (var k in lineObj) 
                        //                     {
                        //                         newObj[k] = lineObj[k];
                        //                     }
                        //                     newLines.push(newObj);
                        //                     console.log('newObj getAllItemCode callback', JSON.stringify(newObj));
                        //                     console.log('newObj getAllItemCode this.numOfForms', this.numOfForms);

                        //                     for (var j = 2; j <= this.numOfForms; j++) 
                        //                     {
                        //                         var currentDetail = 'Detail' + j;
                        //                         console.log('newObj getAllItemCode currentDetail', currentDetail);
                        //                         var formNo = j;
                        //                         if (currentDetail != 'Detail1') 
                        //                         {
                        //                             this.addDetail(currentDetail, formNo, true, newObj);
                        //                         }
                        //                     }
                        //                 }
                        //                 self.data.lines = newLines;
                        //                 //old end
                        //             }			
                        //         }
                        //     });

                        //this._extractTempletService.setLoading(false);//Comented  by pravin k on 16-MAR-21 
                        
                        //Added By Pravin k on 25-AUG-20 END
                        //new new
                     


						/*this.getPythonServiceUrl((url) => {
							if (url) 
							{


								if (jsonData['EXTRACTED_DATA']) 
								{
									extractedData = JSON.parse(jsonData['EXTRACTED_DATA'])
									for (var i = 1; i < this.numOfForms; i++) 
									{
										var formDetail = 'Detail' + i;
										var formNo = i;
										for (const key of Object.keys(extractedData)) 
										{
											var id = formDetail + '.' + i + '.' + key;
											var elem = document.getElementById(id);
											var value = extractedData[key];
											if(elem != null && elem.getAttribute('format') == 'dateBox')
											{
												var arrayDate = value.split('-'); // YY-MM-DD
												var validDate = arrayDate[1] + '/' + arrayDate[2].substring(0, 2) + '/' + arrayDate[0]; //MM-DD-YY
												// validDate = arrayDate[1] + '/' + arrayDate[0] + '/' + arrayDate[0];
												this.allformValues[key] = new Date(validDate);
											}
											else if (key != 'lines' && this.allformValues.hasOwnProperty(key) && formDetail == 'Detail1') 
											{
												this.allformValues[key] = extractedData[key];
											}
										}
									}
								}
								this.callPreVlaidate(false, this.cuurentValidationRow[0], this.cuurentFormNumber, "", null, true, false);
								
								console.log('Print inside getPythonServiceUrl line 1088');
								self.data = {};
								self.data = JSON.parse(jsonData['EXTRACTED_DATA']);
								var strLines = self.data.lines;
								strLines = strLines.replace(/'/g, '"');
								var lines = JSON.parse(strLines);
								var newLines = [];
								this.lineLen = lines.length;
								for (var i = 0; i < lines.length; i++) {
									var lineObj = lines[i];
									var key = lineObj.description;

                                    //Added By Pravin K on 25-AUG-20[For all item codes] START 
                                    var value:any ="";
                                    var newObj = {};
                                    if(this.allItemCodes)
                                    {
                                        if(this.allItemCodes[key]) 
                                        {
                                            value = this.allItemCodes[key]
                                            console.log("allItemCodes:key[",key,"][",value,"]")
                                        }
                                    }
                                    
                                    if (value) 
                                    {
                                        newObj["item_code"] = value;
                                    }
                                    else 
                                    {
                                        newObj["item_code"] = "";
                                    }
                                    for (var k in lineObj) 
                                    {
                                        newObj[k] = lineObj[k];
                                    }
                                    newLines.push(newObj);
                                    console.log('newObj getAllItemCode callback', JSON.stringify(newObj));

                                    for (var i = 2; i <= this.numOfForms; i++) 
                                    {
                                        var currentDetail = 'Detail' + i;
                                        var formNo = i;
                                        if (currentDetail != 'Detail1') 
                                        {
                                            this.addDetail(currentDetail, formNo, true, newObj);
                                        }
                                    }

                                    //else //python cal for item codes
                                    //{
                                        // var val = self.getItemcode(lineObj, (lineObjn: any, val: string) => {

                                        //     var newObj = {};
                                        //     if (val) 
                                        //     {
                                        //         newObj["item_code"] = val;
                                        //     }
                                        //     else 
                                        //     {
                                        //         newObj["item_code"] = "";
                                        //     }
                                        //     for (var k in lineObjn) 
                                        //     {
                                        //         newObj[k] = lineObjn[k];
                                        //     }
                                        //     newLines.push(newObj);
                                        //     console.log('Print newObj :::: inside getItemCode callback::: ', JSON.stringify(newObj));

                                        //     for (var i = 2; i <= this.numOfForms; i++) 
                                        //     {
                                        //         var currentDetail = 'Detail' + i;
                                        //         var formNo = i;
                                        //         if (currentDetail != 'Detail1') 
                                        //         {
                                        //             this.addDetail(currentDetail, formNo, true, newObj);
                                        //         }
                                        //     }
                                        // });
                                    //}
                                    //Added By Pravin K on 25-AUG-20[For all item codes] END
								}
								self.data.lines = newLines;

								
							}
						});*/
					}
					else 
					{
                         this.showTableMarking = false;
                        this._extractTempletService.setLoading(false);//Added By Pravin k on 27-JAN-20
						setTimeout(() => {
							this.getMandatoryFeilds();
							console.log('Call setFocusOnFirstEditableFld.....1258');
							this.setFocusOnFirstEditableFld('Detail1');
						}, 1000);
						console.log('Extracted data not found .');
					}

					if (jsonData) 
					{
						this.docDetails = jsonData;
					}
					this.showAdd = false;
					if (this.docType == "pdf") 
					{
						this.pdfSrc = "/ibase/DocumentViewerServlet?ACTION=GET_DOCUMENT&DOC_ID=" + docId + "&DOC_TYPE=pdf";
					}
					else 
					{
						var src = "/ibase/DocumentViewerServlet?ACTION=GET_DOCUMENT&DOC_ID=" + docId + "&DOC_TYPE=TXT";
						this.safeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(src);
						console.log("this.safeSrc:", this.safeSrc);
					}

					setTimeout(() => {
						// this.getMandatoryFeilds();
						this.setFocusOnFirstEditableFld('Detail1');
					}, 1000);
				});
		}
	}

	loadComplete(pdf: PDFDocumentProxy) 
	{
		console.log("no of pages loaded pdf.numPages[" + pdf.numPages + "]");
	}

	onError() 
	{
		console.log("Error while pdf loading");
	}

	addContent() 
	{
		var contentConfig = { "objName": this.objName, "title": "Orders", "refId": this.editorId, "refSer": this.refSer, "docLinkOpt": "BOTH" };
		if (this.editFlag == 'E') 
		{
			var pkValue = this.pkValues.substring(0, this.pkValues.length - 1);
			contentConfig = { "objName": this.objName, "title": "Orders", "refId": pkValue, "refSer": this.refSer, "docLinkOpt": "BOTH" };
		}
		saveDocInContentLibrary(this, 'attachedCallback', contentConfig);
	}


	cancel() 
	{
		console.log("In cancel");
		this.data = {};
		this.pdfSrc = "";
		this.safeSrc = "";
		this.showAdd = true;
		this.zone.run(() => {
			console.log('view refreshed');
		});
	}

	downloadExcelFile() 
	{
		console.log("In downloadExcelFile");
		var element = document.getElementsByClassName("invoice-transaction-content");
		if (element) 
		{
			var contentElement = document.getElementsByClassName("contentDiv");
			if (contentElement) 
			{
				var childElement = contentElement[contentElement.length - 1];
				if (childElement) 
				{
					childElement.setAttribute('style', 'height: 0px;');
				}
			}
		}
		var Newdata = this.data;

		var detailsTwo = Newdata.lines;
		delete Newdata.lines;
		var detailsOne = Newdata;
		var detailArrobjs:any = [];

		for (var i = 0; i < detailsTwo.length; i++) 
		{
			var lineObj = detailsTwo[i];
			var newLineObj: any = {}

			for (var k in detailsOne) 
			{
				if (k != "desc" && k != "issuer" && k != "currency") 
				{
					newLineObj[k] = detailsOne[k]
				}
			}

			for (var k in lineObj) 
			{
				newLineObj[k] = lineObj[k]
			}

			detailArrobjs.push(newLineObj);
		}

		var dataXml = this.OBJtoXML({ "Detail": detailArrobjs });
		dataXml = '<root>' + dataXml + '</root>';
		this.invoiceTransactionService.downloadExcelFile(dataXml, this.docDetails).subscribe(
			(result:any) => {
				console.log('callBack getUplodedDocumentsDetails :: result', result);
				var filePath = result['_body'];
				var link = document.createElement("a");
				link.href = filePath;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				//Mahesh changes 04-05-2020
				// alert("Excel file downloaded successfully.");
				this.confirmBox.alert('Success', 'Excel file downloaded successfully.');
				this.data = {};
				this.pdfSrc = "";
				this.safeSrc = "";
				this.showAdd = true;
				this.zone.run(() => {
					console.log('view refreshed');
				});
			});
	}

	getPythonServiceUrl(callBack:any) 
	{
		var self = this;
		this.invoiceTransactionService.getPythonServiceConfiguration().subscribe(
			(result:any) => {
				console.log('callBack getPythonServiceConfiguration :: result', result);
				console.log(result['_body']);
				//if (result['_body']) 
				if (result)
				{
					var config = result;
					console.log("config[" + config + "]")

					if (config) 
					{
						self.serviceURL = config;
						if (callBack) 
						{
							callBack(config);
						}
					}
				}
				console.log('self.serviceURL...', self.serviceURL);
				console.log('this.serviceURL...', this.serviceURL);
			});
	}

	getItemcode(lineObj: any, calbck: any) 
	{
		var description = lineObj.descr;
		var URL = this.serviceURL + "?description=" + description;

		this.invoiceTransactionService.getItemCode(URL).subscribe(
			result => {
				console.log('callBack getItemCode :: result', result);
				/*var itemCode = "";
				if (result['_body']) 
				{
					itemCode = result['_body'];
				}
				
				calbck(lineObj, itemCode);*/
				calbck(lineObj, result);
			});
	}

	setPythonServiceUrl() 
	{
		var self = this;
		this.invoiceTransactionService.getPythonServiceConfiguration().subscribe(
			(result:any) => {
				console.log('callBack setPythonServiceConfiguration :: result', result);
				console.log(result['_body']);
				if (result['_body']) 
				{
					var config = result['_body'];
					console.log("config[" + config + "]")

					if (config) 
					{
						self.serviceURL = config;
					}
				}
				console.log('self.serviceURL', self.serviceURL);
				console.log('this.serviceURL', this.serviceURL);
			});
	}


	checkProtectAndVisbile(itemChnageValues:any, key:any, id:any) 
	{
		if (itemChnageValues[key].protect != undefined) 
		{
			this.protectAttribParams[id] = itemChnageValues[key].protect;
			if (itemChnageValues[key].protect == '1') 
			{
				if (document.getElementById(id) != null) 
				{
					if (!document.getElementById(id)?.classList.contains('disableCellData')) 
					{
						document.getElementById(id)?.classList.add("disableCellData");
					}
					var nextElem = document.getElementById(id)?.nextElementSibling;
					if (nextElem != null && !nextElem.classList.contains('disablePopHelp')) 
					{
						document.getElementById(id)?.nextElementSibling?.classList.add("disablePopHelp");
					}
				}

			}
			else if (itemChnageValues[key].protect == '0') 
			{
				if (document.getElementById(id) != null) 
				{
					console.log('Print if elem is disbaled:: ', document.getElementById(id)?.getAttribute('disabled'));
					if (document.getElementById(id)?.classList.contains('disableCellData')) 
					{
						document.getElementById(id)?.classList.remove(("disableCellData"));
					}
					var nextElem = document.getElementById(id)?.nextElementSibling;
					if (nextElem != null && nextElem.classList.contains('disablePopHelp')) 
					{
						document.getElementById(id)?.nextElementSibling?.classList.remove(("disablePopHelp"));
					}
				}
			}

		}
		else 
		{
			this.protectAttribParams[id] = "";
		}
		if (itemChnageValues[key].visible != undefined) 
		{
			this.visibleAttribParams[id] = itemChnageValues[key].visible;

			if (itemChnageValues[key].visible == '0') 
			{
			}
		}
		else 
		{
			this.visibleAttribParams[id] = "";
		}

	}
	checkProtectAndvisibleforFirstForm(itemChnageValues:any, key:any) 
	{
		var id = 'Detail1.1.' + key;
		var elem:any = document.getElementById(id);
		var format;
		console.log('Print elem inside checkProtectAndvisibleforFirstForm::: ', elem);
		if (elem != null) 
		{
			format = elem.getAttribute('format');
			console.log('Print line inside checkProtectAndvisibleforFirstForm 1534 ', format);
			if (itemChnageValues[key].protect != undefined) 
			{
				this.protectAttribParams[id] = itemChnageValues[key].protect;
				if (itemChnageValues[key].protect == '1') 
				{
					if (format == 'dateBox') 
					{
						var datePickerElem = elem.parentElement?.nextElementSibling?.firstElementChild?.firstElementChild;
						if (!elem.hasAttribute('disabled')) 
						{
							elem['disabled'] = true;
						}
						if (!datePickerElem.hasAttribute('disabled')) 
						{
							datePickerElem['disabled'] = true;
						}
					}
					else 
					{
						if (!elem.hasAttribute('disabled')) 
						{
							elem['disabled'] = true;
						}
						var nextElem = elem.nextElementSibling;
						if (nextElem != null && !nextElem.classList.contains('disablePopHelp')) 
						{
							nextElem.classList.add("disablePopHelp");
						}
					}
				}
				else if (itemChnageValues[key].protect == '0') 
				{
					if (format == 'dateBox') 
					{
						var datePickerElem = elem.parentElement.nextElementSibling.firstElementChild.firstElementChild;
						if (elem.hasAttribute('disabled')) 
						{
							elem.removeAttribute('disabled');
						}
						if (datePickerElem.hasAttribute('disabled')) 
						{
							datePickerElem.removeAttribute('disabled');
						}
					}
					else 
					{
						if (elem.hasAttribute('disabled')) 
						{
							elem.removeAttribute('disabled');
						}
						var nextElem = elem.nextElementSibling;
						if (nextElem != null && nextElem.classList.contains('disablePopHelp')) 
						{
							nextElem.classList.remove(("disablePopHelp"));
						}
					}
				}
			}
			else 
			{
				this.protectAttribParams[id] = "";
			}
			console.log('print visible on line 1390:: ', itemChnageValues[key].visible);
			if (itemChnageValues[key].visible != undefined && !(itemChnageValues[key].visible == '')) 
			{
				this.visibleAttribParams[id] = itemChnageValues[key].visible;
				var matFormField = elem.parentElement.parentElement.parentElement.parentElement;
				if (itemChnageValues[key].visible == '0') 
				{
					matFormField.style.display = 'none';
				}
				else if (itemChnageValues[key].visible == '1') 
				{
					matFormField.style.display = 'block';
				}
			}
			else 
			{
				this.visibleAttribParams[id] = "";
			}
		}
	}

	rowSelected(currentDetail:any, index:any, isAddDetail: boolean) 
	{
		let selectedRow = index + 1;
		let deleteBtnId;
		let selectedRowDetail;
		var detElem;
		var selectedRowElem:any;
		//shrutika changes for validation end
		var editElem;
		let editBtnId;
		//shrutika changes for validation end
		var noOfForm = this.compData["NO_OF_FORMS"];
		for (var i = 0; i < noOfForm; i++) 
		{
			var formDetail = 'Detail' + (i + 1);
			if (formDetail == currentDetail && this.allformValues.hasOwnProperty(currentDetail)) 
			{
				let detailLen = this.allformValues[formDetail].length;
				for (var j = 0; j < detailLen; j++) 
				{
					deleteBtnId = 'deleteBtn_' + (j + 1);
					//selectedRowDetail = 'selected_Detail2_RowNo_' + (j + 1);
					selectedRowDetail = 'selected_' + currentDetail + '_RowNo_' + (j + 1);
					console.log('Print rowId inside rowSelcted():: ', deleteBtnId);
					detElem = document.getElementById(deleteBtnId);
					selectedRowElem = document.getElementById(selectedRowDetail);
					console.log('Print j==index:::: ', j == index);
					if (detElem != null && !detElem.classList.contains('showDeleteBtn') && j == index) 
					{
						detElem.classList.add('showDeleteBtn');
						selectedRowElem.classList.add('changeBackGroundForSelectedRow');
					}
					else if (detElem != null && detElem.classList.contains('showDeleteBtn') && j != index) 
					{
						detElem.classList.remove('showDeleteBtn');
						selectedRowElem.classList.remove('changeBackGroundForSelectedRow');
					}

                     //Added by shrutika on 19-04-21 for tax form related changes.
                    var taxBtnId = 'taxBtn_' + (j + 1);
                    var taxElem = document.getElementById(taxBtnId);
                    if (taxElem != null && !taxElem.classList.contains('showDeleteBtn') && j == index) 
					{
						taxElem.classList.add('showDeleteBtn');
						selectedRowElem.classList.add('changeBackGroundForSelectedRow');
					}
					else if (taxElem != null && taxElem.classList.contains('showDeleteBtn') && j != index) 
					{
						taxElem.classList.remove('showDeleteBtn');
						selectedRowElem.classList.remove('changeBackGroundForSelectedRow');
					}
                     //Added by shrutika on 19-04-21 for tax form related changes.
				}
			}
		}

		var formNo = currentDetail[currentDetail.length - 1];
		console.log('Inside rowSelection.....1328', formNo);
		if (this.cuurentValidationRow.length > 0) 
		{
			var rowData = formNo + "_" + (index + 1);
			console.log('Inside rowSelection.....rowData', rowData);
			console.log('Inside rowSelection.....cuurentValidationRow', this.cuurentValidationRow[0]);
			if (rowData != this.cuurentValidationRow[0]) 
			{
				this.editDeatil(currentDetail, formNo, index);
			}
		}
		else
		{
			this.editDeatil(currentDetail, formNo, index);
		}
		this.setKeyNavigation(formNo);
	}

	deleteSelectedDetail(currentDetail:any, formNo:any, index:any) 
	{
		try 
		{
			var paramMap:any = {};
			var allDomIDFromResp:any = [];
			var selectedDetailData:any = {};
			selectedDetailData = this.allformValues[currentDetail][index];
			var selectedDetDomId = selectedDetailData['domID'];
			var allFormDetDomID:any;
			var id = 'selected_' + currentDetail + '_RowNo_' + (index + 1);
			var elemSelected:any = document.getElementById(id);
			var indicatorId = 'validationIndicatorForRow_' + (index + 1) + '_' + formNo;
			var indicatorElem = document.getElementById(indicatorId);
			for (var key of Object.keys(selectedDetailData)) 
			{
				var value = selectedDetailData[key];
				paramMap[key] = value;
			}
			paramMap['OBJ_NAME'] = this.compData['OBJ_NAME'];
			paramMap['FORM_NO'] = formNo;
			paramMap['OBJ_CTX'] = '2';
			paramMap['ACTION'] = 'DESELECT';
			paramMap['EDITOR_ID'] = this.compData['EDITOR_ID'];
			paramMap['CHG_STR'] = this.chgStrParam(formNo, selectedDetDomId);
			paramMap['PK_VALUES'] = '';
			paramMap['EDIT_FLAG'] = 'D';
			paramMap['RTEURN_TYPE'] = this.compData['RTEURN_TYPE'];
			paramMap['EDITOR'] = 'MobEditor';

			var paramString = this._extractTempletService.getEncodedParamString(paramMap);
			var url = this._extractTempletService.getHostURL() + '/ibase/E12EditorHandlerServlet';
			this._extractTempletService.isFromAttachPdf = false;
			this._extractTempletService.sendRequest(url, paramString, (dataOnDeleteDetail:any) => {
				var callbackResp = dataOnDeleteDetail.split('%%SEP%%');
				dataOnDeleteDetail = callbackResp[0];
				var isError = callbackResp[1].trim();

				if (!(isError == 'true')) 
				{
					var dataOnDeleteDetailNew = {} = JSON.parse(dataOnDeleteDetail);
					if (dataOnDeleteDetailNew[currentDetail]) 
					{
						var detailData = dataOnDeleteDetailNew[currentDetail];
						var detailLen = detailData.length;
						if (detailLen == null) 
						{
							allFormDetDomID = detailData['domID'];
							allDomIDFromResp.push(allFormDetDomID);
						}
						else 
						{
							for (var i = 0; i < detailLen; i++) 
							{
								detailData = dataOnDeleteDetailNew[currentDetail][i];
								allFormDetDomID = detailData['domID'];
								allDomIDFromResp.push(allFormDetDomID);
							}
						}
						console.log('Print allformValues inside delet detail::: 1320Z ', JSON.stringify(this.allformValues));
						if (allDomIDFromResp.includes(selectedDetDomId)) 
						{
							elemSelected.setAttribute('style', 'display: none');
							if (detailLen == null) 
							{
								this.allformValues[currentDetail][index]['attribute'] = dataOnDeleteDetailNew[currentDetail]['attribute'];
							}
							else 
							{
								this.allformValues[currentDetail][index]['attribute'] = dataOnDeleteDetailNew[currentDetail][index]['attribute'];
							}
						}
						else 
						{
							elemSelected.setAttribute('style', 'display: none');
							this.resetIndicator(selectedDetDomId + '', formNo);
							// this.allformValues[currentDetail].splice(index, 1);
						}
						console.log('Print allformValues inside delet detail::: 1330 ', JSON.stringify(this.allformValues));
					}
					else 
					{
						elemSelected.setAttribute('style', 'display: none');
						this.allformValues[currentDetail].splice(index, 1);
					}
				}
			});
		}
		catch (e:any) 
		{
			console.log('Exception inside deleteSelectedDetail:::: ', e.message);
		}

	}

	resetIndicator(selectedDetDomId:any, formNo:any)
	{
		var currDet = 'Detail' + formNo;
		var elem:any = document.getElementById('tableDetails_2');
		if(selectedDetDomId.length == '1')
		{
			selectedDetDomId = '0' + selectedDetDomId;
		}
		var indicatorCount = elem.childElementCount;
		var indiactorArr:any = []
		for(var i=0; i<indicatorCount; i++)
		{
			var indicatorEle = elem.children[i];
			if(indicatorEle != null && indicatorEle.getAttribute('id') != null 
			 && indicatorEle.getAttribute('id').startsWith('validationIndicatorForRow_'))
			 {
				 var id = indicatorEle.getAttribute('id');
				indiactorArr.push(id);
			 }
		}
		for(var a=0; a<indiactorArr.length; a++)
		{
			var idNew = indiactorArr[a];
			var indicatorElem = document.getElementById(idNew);
			if(indicatorElem != null && indicatorElem.getAttribute('id') != null 
			 && indicatorElem.getAttribute('id')?.startsWith('validationIndicatorForRow_'))
			{
				indicatorElem.parentNode?.removeChild(indicatorElem);
			}
		}
		if(this._extractTempletService.allValidationResponse.hasOwnProperty(selectedDetDomId + "_" + formNo))
		{
			this._extractTempletService.removeResponseFromValidationMap( selectedDetDomId + "_" + formNo)
		}
		var detailLen = this.allformValues[currDet].length;
		var errorJson:any = this._extractTempletService.allValidationResponse;
		for(const key of Object.keys(errorJson))
		{
			var resp = errorJson[key];
			var keyRes = key.split('_');
			var domIdFromValResp = keyRes[0];
			if(domIdFromValResp.startsWith('0'))
			{
				domIdFromValResp = domIdFromValResp.substring(1);
			}
			if(detailLen != null)
			{
				for(var i=0; i<detailLen; i++)
				{
					var detailData = this.allformValues[currDet][i];
					var DomId = detailData['domID']
					var tableRowId = 'selected_' + currDet + '_RowNo_' + (i+1);
					if(domIdFromValResp == DomId)
					{
						this.showIndicator(tableRowId, formNo, (i+1));
					}
				}
			}
		}
	}

	chgStrParam(formNo:any, keyVal:any) 
	{
		var chgStr = `<?xml version='1.0' encoding='utf-8'?>
						<Root>
							<header>
								<objName><![CDATA[sorderform]]></objName>
								<pageContext><![CDATA[1]]></pageContext>
								<objContext><![CDATA[`+ formNo + `]]></objContext>
								<editFlag><![CDATA[D]]></editFlag>
								<focusedColumn><![CDATA[]]></focusedColumn>
								<elementName><![CDATA[]]></elementName>
								<keyValue><![CDATA[`+ keyVal + `]]></keyValue>
								<taxKeyValue><![CDATA[]]></taxKeyValue>
								<saveLevel><![CDATA[0]]></saveLevel>
								<forcedSave><![CDATA[false]]></forcedSave>
								<taxInFocus><![CDATA[false]]></taxInFocus>
								<forcedconfirm><![CDATA[false]]></forcedconfirm>
								<isSaveNConitinue><![CDATA[false]]></isSaveNConitinue>
							</header>
						</Root>`;

		return chgStr;
	}


	getallFormXml(finalXml:any) 
	{
		var noOfForm = this.compData["NO_OF_FORMS"];
		for (var i = 0; i < noOfForm; i++) 
		{
			var formDetail = 'Detail' + (i + 1);
			if (formDetail == 'Detail1') 
			{
				var dbId = "";
				// var attributeTagJson = this.allFormAttributeTag[formDetail];
				console.log('Print allformvalues inside line 1237::: ', this.allformValues['attribute']);
				var attributeTagJson = this.allformValues['attribute'];

				var attributeTagInXml = `<attribute `;
				console.log('Print 620:::::');
				for (const key of Object.keys(attributeTagJson)) 
				{
					if (this.editFlag == 'E') 
					{
						if (key == "pkNames") 
						{
							var primaryKey = attributeTagJson[key];

							var newstr = primaryKey.substring(0, primaryKey.length - 1);
							var arr = newstr.split(":");
							var arrLength = arr.length;

							for (var k = 0; k < arrLength; k++) 
							{
								var currentPkName = arr[k];
								dbId = dbId + this.allformValues[currentPkName] + ":";
							}
							dbId = dbId.substring(0, dbId.length - 1);
						}
					}
					attributeTagInXml = attributeTagInXml + ` ` + key + `="` + attributeTagJson[key] + `"`;
				}
				attributeTagInXml = attributeTagInXml + `/>`;
				if (dbId == undefined || dbId == 'undefined') 
				{
					dbId = "";
				}
				var paramXML = `<` + formDetail + ` objContext="` + (i + 1)
					+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + (i + 1) + `" dbID="` + dbId + `" selected="Y">`;

				paramXML = paramXML + attributeTagInXml;
				var currentAllData = JSON.parse(JSON.stringify(this.allformValues));
				for (var key in currentAllData) 
				{
					var value = currentAllData[key];
					if (value instanceof Array) 
					{
						delete currentAllData[key];
					}
				}

				var jsonData:any = {};
				jsonData = JSON.parse(JSON.stringify(currentAllData));

				for (var key in jsonData) 
				{
					var id:any = formDetail + '.1.' + key;
					var value = jsonData[key];
					if (value instanceof Object) 
					{
						value = "";
					}

					if (value == "null") 
					{
						value = "";
					}
					if (this.arrayOfDateFields.includes(id)) 
					{
						let fldName = key;
						let fldValue = value;
						value = "";
						if (fldValue != null) 
						{
							value = this.datePipe.transform(fldValue, 'dd/MM/yy');
						}
						paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
					}
					else if (key != "attribute") 
					{
						paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
					}
				}
				paramXML = paramXML + `</` + formDetail + `>`;
				finalXml = finalXml + paramXML;
			}
			else 
			{
				var detailDataLen = 0;
				if (this.allformValues[formDetail] != undefined) 
				{
					detailDataLen = this.allformValues[formDetail].length;
				}
				for (var j = 0; j < detailDataLen; j++) 
				{
					var dbId = "";
					var attributeTagJson = this.allformValues[formDetail][j]['attribute'];
					if (attributeTagJson) 
					{
						attributeTagJson = this.allformValues[formDetail][j]['attribute'];
					}

					var attributeTagInXml = `<attribute IS_CHANGE="Y"`;
					if (JSON.stringify(attributeTagJson).includes('IS_CHANGE')) 
					{
						attributeTagInXml = `<attribute `;
					}
					for (const key of Object.keys(attributeTagJson)) 
					{
						if (this.editFlag == 'E') 
						{
							if (key == "pkNames") 
							{
								var primaryKey = attributeTagJson[key];
								var newstr = primaryKey.substring(0, primaryKey.length - 1);
								var arr = newstr.split(":");
								var arrLength = arr.length;

								for (var k = 0; k < arrLength; k++) 
								{
									var currentPkName = arr[k];
									dbId = dbId + this.allformValues[formDetail][j][currentPkName] + ":";
								}
								dbId = dbId.substring(0, dbId.length - 1);
							}
						}
						attributeTagInXml = attributeTagInXml + ` ` + key + `="` + attributeTagJson[key] + `"`;
					}
					attributeTagInXml = attributeTagInXml + `/>`;

					console.log('inside detail case......1345', dbId);
					if (dbId == undefined || dbId == 'undefined') 
					{
						dbId = "";
					}
					var paramXML = "";
					if( this.editFlag == 'A')
					{
						var domId = this.allformValues[formDetail][j]['domID'];
						console.log('inside build allFormXml......1798',domId);
						paramXML = `<` + formDetail + ` objContext="` + (i + 1)
						+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + domId + `" dbID="` + dbId + `">`;
					}
					else
					{
						paramXML = `<` + formDetail + ` objContext="` + (i + 1)
						+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + (j + 1) + `" dbID="` + dbId + `">`;
					}
					
					paramXML = paramXML + attributeTagInXml;
					currentAllData = this.allformValues[formDetail][j];
					var jsonData:any = {};
					jsonData = JSON.parse(JSON.stringify(currentAllData));

					for (var key in jsonData) 
					{
						let id = formDetail + '.' + (j + 1) + '.' + key;
						var value = jsonData[key];
						if (value instanceof Object) 
						{
							value = "";
						}
						if (value == "null") 
						{
							value = "";
						}
						if (this.arrayOfDateFields.includes(id)) 
						{
							let fldName = key;
							let fldValue = value;
							value = "";
							if (fldValue != null) 
							{
								value = this.datePipe.transform(fldValue, 'dd/MM/yy');
							}
							paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
						}
						else if (key != "attribute") 
						{
							paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
						}
					}
					paramXML = paramXML + `</` + formDetail + `>`;
					finalXml = finalXml + paramXML;
				}
			}
		}
		console.log('Final XML..........................1573', finalXml);
		return finalXml;
	}


	//shrutika changes for validation

	callPreVlaidate(isAddClick:any, rowData:any, currentFormNo:any, index:any, detailDataFromPdf?:any, isFromAttachPdf?: boolean | any, isSaveClick?: boolean) 
	{
        console.log('Final XML..rowData::', rowData);//Added By Pravin k on 27-JAN-20
		var finalXml = "<Root>";
		finalXml = finalXml + "<DocumentRoot>";
		finalXml = finalXml + "<description>Datawindow Root</description>";
		finalXml = finalXml + "<group0>";
		finalXml = finalXml + "<description>Group0 description</description>";
		finalXml = finalXml + "<Header0>";
		finalXml = this.getallFormXml(finalXml);

		finalXml = finalXml + "</Header0>";
		finalXml = finalXml + "</group0>";
		finalXml = finalXml + "</DocumentRoot>";
		finalXml = finalXml + "</Root>";

		var paramMap:any = {};

		paramMap['OBJ_NAME'] = this.compData['OBJ_NAME'];
		paramMap['XML_STR'] = finalXml;
		paramMap['EDIT_FLAG'] = this.editFlag;
		paramMap['EDITOR_ID'] = this.compData['EDITOR_ID'];
		paramMap['ACTION'] = 'Pre_Validate';
		paramMap['FORM_NO'] = "1";
		paramMap['PK_VLAUES'] = this.compData['PK_VALUES'];
		paramMap['DOM_ID'] = "1";
		//Added by shrutika on 26-06-2020 for issue in case of warning occur.
		paramMap['RTEURN_TYPE'] = "json"
		this._extractTempletService.isFromAttachPdf = isFromAttachPdf;
        this._extractTempletService.isFromAttachForFirstForm = isFromAttachPdf;
		var paramString = this._extractTempletService.getEncodedParamString(paramMap);
		var url = this._extractTempletService.getHostURL() + '/ibase/E12EditorHandlerServlet';
        console.log('Print inisde Pre_validate:: Mahesh ', url);
        console.log('Print inisde Pre_validate:: isFromAttachPdf:', isFromAttachPdf);//pa

		this._extractTempletService.setLoading(true);
        // this._extractTempletService.sendRequestNew(url, paramString).subscribe(
        //     data => {
        //         console.log('Server call compeleted inside Pre_validate');
        //     }
        // );
		this._extractTempletService.sendRequest(url, paramString, (preValidateResponase:any) => {
            console.log('Print inisde Pre_validate:: Result ', preValidateResponase);//pa
			this._extractTempletService.setLoading(false);
			var callbackResp = preValidateResponase.split('%%SEP%%');
			preValidateResponase = callbackResp[0];
			var isError = callbackResp[1].trim();
			var columnName = callbackResp[2];
			if( isFromAttachPdf )
			{
                this._extractTempletService.isFromAttachForFirstForm = false;
                /*console.log('inside callPreVlaidate...........2393');
                var rowToValidate = 'selected_Detail' + "1" + '_RowNo_' + "1";
				console.log('inside add detail response....2395 ', rowToValidate);
				this.showIndicator(rowToValidate, "1", index);*/
				this._extractTempletService.setLoading(false);
				return;
			}
			var currentDetail = 'Detail' + currentFormNo;
			if (!(isError == 'true')) 
			{
                console.log('!isError::currentDetail:',currentDetail);//pa
                if(this._extractTempletService.allValidationResponse.hasOwnProperty("01_1"))
				{
					this._extractTempletService.removeResponseFromValidationMap("01_1");
				}

				var selectedRowDetail = 'selected_' + currentDetail + '_RowNo_' + (index + 1);
				var rowData = currentFormNo + "_" + (index + 1);

				var selectedRowElem = document.getElementById(selectedRowDetail);
				if (selectedRowElem != null && selectedRowElem.classList.contains('disableRow')) 
				{
					selectedRowElem.classList.remove('disableRow');
					selectedRowElem.classList.add('enableRow');

					var editBtnId = 'editBtn_' + (index + 1);
					var editElem = document.getElementById(editBtnId);
					if (editElem != null && editElem.classList.contains('showDeleteBtn')) 
					{
						editElem.classList.remove('showDeleteBtn');
						editElem.classList.add('editDetailBtn');
					}

				}
				this.cuurentFormNumber = currentFormNo;
                console.log('---::currentFormNo:',currentFormNo);//pa
				if (this.cuurentValidationRow.length > 0) 
				{
					this.cuurentValidationRow.splice(0, 1);
				}
				this.cuurentValidationRow.push(rowData);
                console.log('---::isSaveClick:',isSaveClick,',isAddClick[',isAddClick,']');//pa
				if (isSaveClick) 
				{
					this.afterSaveClick(false);
				}
				else if (isAddClick) 
				{
					this.addNewDetailRow(currentFormNo, index, isFromAttachPdf, detailDataFromPdf);
				}
				else 
				{
					this.updateChgStr(currentFormNo, index);
					this.popHelp.onItemChange('itm_defaultedit', '');
				}
				if (!isAddClick) 
				{
					this.setFocusOnFirstEditableFld('Detail' + currentFormNo);
				}
                 console.log('-------------{::}-------------');//pa
			}
			else 
			{
				this.setFocusOnError('Detail1', '1', columnName);
			}
        },("01_1")
		);
	}
	
	removeDeletedData()
	{
		for(var i=2; i<=this.numOfForms; i++)
		{
			var formNo = i;
			var currDet = 'Detail' + formNo;
			var allformValuesDemo:any = [];
			var detailLen = this.allformValues[currDet].length;
			var indOfRemovedData:any = [];
			if(detailLen != null)
			{
				for(var i=0; i<detailLen; i++)
				{
					var detailData = this.allformValues[currDet][i];
					var attribute = detailData['attribute'];
					var updateFlag;
					if(attribute != null && attribute instanceof Object)
					{
						updateFlag = attribute['updateFlag'];
					}
					var detailId = 'selected_' + currDet + '_RowNo_' + (i+1);
					var detailElem: any = document.getElementById(detailId);
					if(detailElem != null && detailElem.getAttribute('style') != null && detailElem.getAttribute('style').includes('display: none') && updateFlag != 'D')
					{
						indOfRemovedData.push(i);
						updateFlag = '';
					}
				}
				for(var i=0; i<detailLen; i++)
				{
					if(!indOfRemovedData.includes(i))
					{
						var data = this.allformValues[currDet][i];
						allformValuesDemo.push(data);
					}
				}
				this.allformValues[currDet] = allformValuesDemo;
			}
		}
		console.log('Print arrayOfDateFields inside removeDeletedData line 2257:: ', this.arrayOfDateFields);
		this.arrayOfDateFields = [];
		this.getMandatoryFeilds();
	}

	validateCurrentDetail(formNo:any, DomId:any, rowData:any, currentFormNo:any, index:any, isAddDetail:any, isFromAttachPdf?: boolean | any, detailDataFromPdf?:any, isSaveClick?: boolean, isTaxClick: boolean = false) 
	{
		var modifiedDomId = DomId;
		if( DomId.length == '1')
		{
			modifiedDomId = '0'+DomId;
		}
		var id = 'selected_' + "Detail" + formNo + '_RowNo_' + (DomId);
		var elemSelected:any = document.getElementById(id);

        console.log('inside validateCurrentDetail isSaveClick[',isSaveClick,'],detailDataFromPdf[',detailDataFromPdf,']');
		if( elemSelected != null )
		{
			if (elemSelected.getAttribute('style') != null) 
			{
				if (elemSelected.getAttribute('style').includes('display: none')) 
				{
					var newRowData = currentFormNo + "_" + (index + 1);
					this.cuurentFormNumber = currentFormNo;
					this.cuurentValidationRow.splice(0, 1);
					this.cuurentValidationRow.push(newRowData);
					if (isSaveClick) 
					{
						this.afterSaveClick(false);
					}
					else if (currentFormNo == "1") 
					{
						console.log('inside validateCurrentDetail after validate... ');
					}
					else if (isAddDetail) 
					{
						this.addNewDetailRow(formNo, index, isFromAttachPdf, detailDataFromPdf);
					}
					else 
					{
						this.updateChgStr(currentFormNo, index);
						this.popHelp.onItemChange('itm_defaultedit', '');
					}
					return;
				}
			}
		}
        console.log('inside ------isFromAttachPdf[',isFromAttachPdf,']');//pa 
		var finalXml = "<Root>";
		finalXml = finalXml + "<DocumentRoot>";
		finalXml = finalXml + "<description>Datawindow Root</description>";
		finalXml = finalXml + "<group0>";
		finalXml = finalXml + "<description>Group0 description</description>";
		finalXml = finalXml + "<Header0>";

		finalXml = this.getallFormXml(finalXml);

		finalXml = finalXml + "</Header0>";
		finalXml = finalXml + "</group0>";
		finalXml = finalXml + "</DocumentRoot>";
		finalXml = finalXml + "</Root>";

		var paramMap:any = {};
		paramMap['OBJ_NAME'] = this.compData['OBJ_NAME'];
		paramMap['CHG_STR'] = finalXml;
		paramMap['EDIT_FLAG'] = 'A';
		paramMap['EDITOR_ID'] = this.compData['EDITOR_ID'];
		paramMap['ACTION'] = "ADD_DETAIL_DOM";
		paramMap['FORM_NO'] = formNo;
		paramMap['OBJ_CTX'] = formNo;
		paramMap['PK_VLAUES'] = "";
		paramMap['DOM_ID'] = DomId;
		paramMap['EDITOR'] = "MobEditor";
		paramMap["RTEURN_TYPE"] = this.compData["RTEURN_TYPE"];
        console.log('inside ------paramMap',paramMap);//pa 

		var paramString = this._extractTempletService.getEncodedParamString(paramMap);
		var url = this._extractTempletService.getHostURL() + '/ibase/E12EditorHandlerServlet';
		this._extractTempletService.setLoading(true);
		this._extractTempletService.isFromAttachPdf = isFromAttachPdf;
		this._extractTempletService.sendRequest(url, paramString, (preValidateResponase:any) => {
            console.log('inside ------preValidateResponase',preValidateResponase);//pa 
			this._extractTempletService.setLoading(false);
			var callbackResp = preValidateResponase.split('%%SEP%%');
			preValidateResponase = callbackResp[0];
			var isError = callbackResp[1].trim();
			var columnName = callbackResp[2];
			this.detailCount++;
			// if(this.detailCount == this.lineLen && isFromAttachPdf)
			// {
			// 	console.log('inside add detail response.......2243');
			// 	this.showIndicator();
			// }
			if( isFromAttachPdf )
			{
				this._extractTempletService.setLoading(false);
				var rowToValidate = 'selected_Detail' + formNo + '_RowNo_' + (index);
				console.log('inside add detail response....2243 ', rowToValidate);
				this.showIndicator(rowToValidate, formNo, index);
				return;
			}
			
			var currentDetail = 'Detail' + currentFormNo;
			if (!(isError == 'true')) 
			{
				if(this._extractTempletService.allValidationResponse.hasOwnProperty(modifiedDomId + "_" + formNo))
				{
					this._extractTempletService.removeResponseFromValidationMap( modifiedDomId + "_" + formNo)
				}
				var selectedRowDetail = 'selected_' + currentDetail + '_RowNo_' + (index + 1);
				var rowData = currentFormNo + "_" + (index + 1);


	            var selectedRowElem = document.getElementById(selectedRowDetail);
				this.cuurentFormNumber = currentFormNo;
                
                this.cuurentValidationRow.splice(0, 1);
                this.cuurentValidationRow.push(rowData);
                
			
				if (isSaveClick) 
				{
					this.afterSaveClick(false);
				}
				else if (currentFormNo == "1") 
				{
					console.log('inside validateCurrentDetail after validate... ');
				}
				else if (isAddDetail) 
				{
					this.addNewDetailRow(formNo, index, isFromAttachPdf, detailDataFromPdf);
				}
				else if( isTaxClick )
				{
					this.taxResponseData = preValidateResponase;
					console.log('inside validateCurrentDetail isTaxClick......2286');
					this.createTaxDetOverLay();
				}
				else 
				{
					this.updateChgStr(currentFormNo, index);
					this.popHelp.onItemChange('itm_defaultedit', '');
				}
			}
			else 
			{
				var strArray = this.cuurentValidationRow[0].split('_');
				var currDet = 'Detail' + strArray[0];
				var ind = strArray[1];
				this.setFocusOnError(currDet, ind, columnName);
			}
		},(modifiedDomId + "_" + formNo)
		);
	}

	setFocusOnError(currentDet:any, rowNum:any, columnName:any) 
	{
		if (columnName != 'null') 
		{
			var id = currentDet + '.' + rowNum + '.' + columnName;
			console.log('Print columnNAme line 1809 ::: [' + columnName + '] id:: [' + id + ']');
			var elem = document.getElementById(id);
			if (elem != null) 
			{
				if(currentDet == 'Detail1' && !elem.hasAttribute('disabled'))
				{
					elem.focus();
				}
				else if(currentDet != 'Detail1' && !elem.classList.contains('disableCellData'))
				{
					elem.focus();
				}
				//change by shrutika on 26-06-2020 for issue in case of warning occur.
				if (currentDet != "Detail1") 
				{
					this.rowSelected(currentDet, (rowNum - 1), false);
				}
			}
		}
	}

	editDeatil(currentDetail:any, formNo:any, index:any) 
	{
		var selectedRowDetail = 'selected_' + currentDetail + '_RowNo_' + (index + 1);
		console.log('inside edit detail....181', selectedRowDetail);
		var rowData = formNo + "_" + (index + 1);

		if (this.cuurentFormNumber == "1") 
		{
			this.callPreVlaidate(false, rowData, formNo, index, null, false, false);
		}
		else if (this.cuurentValidationRow.length == 0) 
		{
			this.cuurentFormNumber = formNo;
			this.updateChgStr(formNo, index);
			this.popHelp.onItemChange('itm_defaultedit', '');
			this.cuurentValidationRow.push(rowData);
		}
		else 
		{
			let cuurentValidationData = this.cuurentValidationRow[0];
			var str = cuurentValidationData.split('_');
			this.validateCurrentDetail(str[0], str[1], rowData, formNo, index, false, false, null, false,false);
		}
	}

	addNewDetailRow(formNo:any, newRow:any, isFromAttachPdf?: boolean, detailDataFromPdf?:any) 
	{
		var detailNo = "Detail" + formNo;
		this.FORM_NO = formNo;
		// var allFormAttrArray = [];
		console.log('Inside add detial:::::::: [' + detailNo + '],detailDataFromPdf[',detailDataFromPdf,']');
        console.log('Inside add allformValues [',JSON.stringify(this.allformValues),']');
		let detailLen = 0;
		if (this.allformValues.hasOwnProperty(detailNo)) 
		{
			detailLen = this.allformValues[detailNo].length;
		}

		var detailArray:any = [];
		var paramMap:any = {};
		paramMap['OBJ_NAME'] = this.compData['OBJ_NAME'];
		paramMap['OBJ_CTX'] = '2';
		paramMap['EDIT_FLAG'] = 'A';
		paramMap['EDITOR_ID'] = this.compData['EDITOR_ID'];
		paramMap['ACTION'] = 'XML_DATA_DETAIL';
		paramMap['FORM_NO'] = formNo;
		paramMap['PK_VALUES'] = this.compData['PK_VALUES'];
		paramMap['FORM_TYPE'] = '';
		paramMap['LAST_DOM_ID'] = detailLen == 0 ? 1 : (detailLen + 1);
		paramMap['PG_CTX'] = '1';
		paramMap['RTEURN_TYPE'] = this.compData['RTEURN_TYPE'];

		var paramString = this._extractTempletService.getEncodedParamString(paramMap);
		var url = this._extractTempletService.getHostURL() + '/ibase/E12EditorHandlerServlet';

		if (isFromAttachPdf) 
		{
			this._extractTempletService.isFromAttachPdf = false;
			this._extractTempletService.setLoading(true);
			this._extractTempletService.sendRequest(url, paramString, (addDetailResp:any) => {
				var callbackRespNew = addDetailResp.split('%%SEP%%');
				addDetailResp = callbackRespNew[0];
				var isError = callbackRespNew[1].trim();

				if (!(isError == 'true')) 
				{
					this.detailCount++;
					console.log('Inside addnewdetail......detailNo', detailNo,',addDetailResp[', addDetailResp,']');
					var addDetailRespNew = JSON.parse(addDetailResp);
					var detailData = {} = addDetailRespNew.DocumentRoot.group0.Header0[detailNo];

					console.log('Inside addnewdetail......detailData', detailData);
					var domId = detailData['domID'];
					this.mapForNewDetail[domId] = detailData;
					this.mapForNewDetailFromPdf[domId] = detailDataFromPdf;
					this._extractTempletService.setLoading(false);
                    console.log('Inside addnewdetail......detailDataFromPdf', detailDataFromPdf);
                    console.log('detailCount['+this.detailCount+'],this.lineLen['+this.lineLen+']');
                    console.log('this.mapForNewDetail['+this.mapForNewDetail+'],this.mapForNewDetailFromPdf['+this.mapForNewDetailFromPdf+']');
					if(this.detailCount == this.lineLen)
					{
						console.log('Print inside setExtractedDatFormPdf on 2374');
						this.setDataExtractedFromPdf(newRow, detailData, detailDataFromPdf, detailNo, formNo);
					}
				}
			}
			);
		} 
		else 
		{
			this._extractTempletService.isFromAttachPdf = false;
			this._extractTempletService.setLoading(true);
			this._extractTempletService.sendRequest(url, paramString, (addDetailResp:any) => {
				var callbackRespNew = addDetailResp.split('%%SEP%%');
				addDetailResp = callbackRespNew[0];
				var isError = callbackRespNew[1].trim();

				if (!(isError == 'true')) 
				{
					var addDetailRespNew = JSON.parse(addDetailResp);
					var detailData = {} = addDetailRespNew.DocumentRoot.group0.Header0[detailNo];
					if (detailLen != 0) 
					{
						detailArray = this.allformValues[detailNo];
					}
					detailArray.push(detailData);
					this.allformValues[detailNo] = detailArray;
					for (const key of Object.keys(detailData)) 
					{
						var id = 'Detail' + formNo + '.' + (newRow + 1) + '.' + key;
						var value = detailData[key];

						if (detailData[key] && (detailData[key].content || detailData[key].content == 0)) 
						{
							var value = detailData[key].content;
							this.checkProtectAndVisbile(detailData, key, id);
							this.allformValues[detailNo][newRow][key] = value;
						}
						else 
						{
							var value = detailData[key];
							if (key != 'attribute' && value instanceof Object) 
							{
								value = "";
							}
							this.checkProtectAndVisbile(detailData, key, id);
							this.allformValues[detailNo][newRow][key] = value;
						}
					}
					this.showDetailForm = true;

					this.updateChgStr(formNo, newRow);
					this.callItemDeafult( 'itm_default', '',formNo, newRow);
					setTimeout(() => {
						this.getMandatoryFeilds();
						this.rowSelected(detailNo, newRow, true);
						this.setFocusOnFirstEditableFld(detailNo);
					}, 1000);
					console.log('Prit allFormVal inside add detail:: [' + JSON.stringify(this.allformValues) + ']');
					this._extractTempletService.setLoading(false);
				}
			}
			);
		}
	}

	setFocusFormNo(cuurrentFormNo:any,id:any) 
	{
		console.log("on focuscuurrentFormNo[",cuurrentFormNo,"] setSelectedText::id[" + id + "]");
		//Added By Pravin K on 7-JUL-20 Start
        if(! window["selectionLogs"])
        {
            window["selectionLogs"]={};
        } 
        window["selectionLogs"]["selectedTextboxId"] = id;  
        //this.showSelectionOnPFD(id);
		//Added By Pravin K on 7-JUL-20 End
		if (this.cuurentValidationRow.length > 0 && this.cuurentFormNumber != "1") 
		{
			let cuurentValidationData = this.cuurentValidationRow[0];
			var str = cuurentValidationData.split('_');
			//this.validateCurrentDetail( str[0], str[1], "", cuurrentFormNo, "", false, false, null,false);
			this.validateCurrentDetail(str[0], str[1], "", cuurrentFormNo, "", false, false, null, false,false);
		}
		this.cuurentFormNumber = cuurrentFormNo;
	} 
	// Added by Pravin k on 6-jul-20 start
	removeSelectionOnPFD()
	{ 
	 	console.log("removeSelectionOnPFD");
          /*Comente By pravin K on 6-OCT-20 START */
		// var elems = document.querySelectorAll(".highlightPDFText");
        // if(elems)
        // {
        //     [].forEach.call(elems, function(el) {
        //         el.classList.remove("highlightPDFText");
        //         el["style"]["backgroundColor"] = "";
        //     });
        // }
        /*Comente By pravin K on 6-OCT-20 END */
	}
    showSelectionOnPFD(selectedDomId:any) 
    {
      
	    var serlctedTextBox:any = document.getElementById(selectedDomId);
	    /*Added By pravin K on 4-SEP-20 START */
        if(!serlctedTextBox)
        {
            return;
        }
        /*Added By pravin K on 4-SEP-20 END */
	   // serlctedTextBox.style.backgroundColor = "rgba(244, 232, 207, 1)";
	    var serlctedTextBoxValue =  serlctedTextBox["value"];
	    console.log(".serlctedTextBoxValue[",serlctedTextBoxValue,"]");
		if(!(serlctedTextBoxValue.trim()))
		{
			 console.log("No text  in serlctedTextBoxValue.");
			 return;
		
		}
		

	    var elms = document.getElementsByClassName("textLayer");
	    var len = elms.length;
	    console.log("textLayer length : ",len);

	    if(len)
	    {
	    	this.removeSelectionOnPFD();
			for(var cn=0 ; cn< len; cn++ )
			{
				var childs:any = elms[cn].children;
	    		console.log("childs lengtg : ",cn);
			  	var chLin = childs.length;
			  	if(chLin)
			  	{
			    	for(var i=0 ; i< chLin; i++ )
				    {
						var str = childs[i].innerHTML		
					  	if(str.includes(serlctedTextBoxValue))
					  	{
							if (document as any["selection"]) {
								console.log(i," document str : ",str);
								// var range = document.body ["createTextRange"]();
								var range = (document as any).body ["createTextRange"]();
							  	range.moveToElementText(childs[i]);
							 	range.select();
							} 
							// else if (window.getSelection) { //previous
							else if (window.getSelection()) {

							  	console.log(i,"window str : ",str);
							  	childs[i]["style"]["backgroundColor"] = "#144dee";
							  	childs[i].classList.add('highlightPDFText');
							  	/* let  range:any = document.createRange();
							  	range.selectNode(childs[i]);
							  	window.getSelection().removeAllRanges();
							 	window.getSelection().addRange(range); */
							}
					  	}
				    }
				}
			}
		}
    }
	// Added by Pravin k on 6-jul-20 end
   
	afterSaveClick(isError:any) 
	{
        console.log('inside  afterSaveClick...editFlag',this.editFlag);//pa
        console.log('inside  afterSaveClick...trainingData::',this.trainingData);//pa
        
		try 
		{
			if(this.editFlag == 'A')
			{
                //Change by shrutika on 09-10-2020 for issue occur when there is no detail record present.
				//this.removeDeletedData();
                console.log('editFlag numOfForms[',this.numOfForms,']this.allformValues[',this.allformValues,']');//pa
                for(var i=2; i<=this.numOfForms; i++)
                {
                    var formNo = i;
                    var currDet = 'Detail' + formNo;
                    if( this.allformValues[currDet] != null )
                    {
	                    this.removeDeletedData();
                    }
                }
			}
            console.log('afterSaveClick numOfForms[',this.numOfForms,']');//pa
			var errorJson:any  = this._extractTempletService.allValidationResponse;
			const ordered:any = {};
			Object.keys(errorJson).sort().forEach(function(key) {
			ordered[key] = errorJson[key];
			});
            console.log('afterSaveClick errorJson[',errorJson,']');//pa
			this._extractTempletService.allValidationResponse = {} =  ordered;
			errorJson  = this._extractTempletService.allValidationResponse;
			var keys = Object.keys(errorJson);
            //Change by shrutika on 09-10-2020 for issue occur when there is no detail record present.
			if( errorJson != null && keys != null && keys.length > 0 )
			{
				var keys = Object.keys(errorJson);
				var key = keys[0];
				console.log('inside  afterSaveClick......2423',key);
				var response = errorJson[key];
				this._extractTempletService.setLoading(true);
				this._extractTempletService.isFromAttachPdf = false;
				this._extractTempletService.displayErrorException(response, (res:any) => {
                    console.log('inside  displayErrorException......res[', res ,']response[',response,']' );//pa
					if (res) 
					{
						this._extractTempletService.setLoading(false);
						var errorJsonData  = this._extractTempletService.allValidationResponse;
						if( errorJsonData != null )
						{
							var errorKeys = Object.keys(errorJsonData);
							var currentKey = errorKeys[0];
							var errorColName = this._extractTempletService.columnNaame;
							var strArray = currentKey.split('_');
							//var currDet = 'Detail' + strArray[0];
							var currDet = 'Detail' + strArray[1];
							//var ind = strArray[1];
							var ind = strArray[0];
							if( ind.startsWith('0'))
							{
								ind = ind.substring(1);
							}
							if (this.cuurentValidationRow.length > 0) 
							{
								this.cuurentValidationRow.splice(0, 1);
							}
							this.cuurentValidationRow.push(strArray[1]+"_"+ind);
							this.setFocusOnError(currDet, ind, errorColName);
						}
					}
					else
					{
						this.afterSaveClick(false);
					}
					});
					return;
			}
			//var isError = true;
			console.log('Print isErrror in save()::: ', isError);
			//shrutika 08-05-2020
			var action = "SAVE";
			var forcedSave = "true";
			var pkvalues = this.pkValues;
			var pageContext = "1";
			if (this.editFlag == 'E') 
			{
				action = "EDIT";
				forcedSave = "false";
				pkvalues = pkvalues.substring(0, pkvalues.length - 1);
				pageContext = "2";
			}
			var finalXml = "<Root>";
			finalXml = finalXml + "<DocumentRoot>";
			finalXml = finalXml + "<description>Datawindow Root</description>";
			finalXml = finalXml + "<group0>";
			finalXml = finalXml + "<description>Group0 description</description>";
			finalXml = finalXml + "<Header0>";
			finalXml = finalXml + "<objName><![CDATA[" + this.compData["OBJ_NAME"] + "]]></objName>";
			finalXml = finalXml + "<pageContext><![CDATA[" + pageContext + "]]></pageContext>";
			finalXml = finalXml + "<objContext><![CDATA[1]]></objContext>";
			finalXml = finalXml + "<editFlag><![CDATA[" + this.editFlag + "]]></editFlag>";
			finalXml = finalXml + "<focusedColumn><![CDATA[]]></focusedColumn>";
			finalXml = finalXml + "<action><![CDATA[" + action + "]]></action>";
			finalXml = finalXml + "<elementName><![CDATA[]]></elementName>";
			finalXml = finalXml + "<keyValue><![CDATA[1]]></keyValue>";
			finalXml = finalXml + "<taxKeyValue><![CDATA[]]></taxKeyValue>";
			finalXml = finalXml + "<saveLevel><![CDATA[1]]></saveLevel>";
			finalXml = finalXml + "<forcedSave><![CDATA[" + forcedSave + "]]></forcedSave>";
			finalXml = finalXml + "<taxInFocus><![CDATA[false]]></taxInFocus>";
			finalXml = finalXml + "<description>Header0 members</description>";
			finalXml = finalXml + "<pkValues><![CDATA[" + pkvalues + "]]></pkValues>";

			finalXml = this.getallFormXml(finalXml);

			finalXml = finalXml + "</Header0>";
			finalXml = finalXml + "</group0>";
			finalXml = finalXml + "</DocumentRoot>";
			finalXml = finalXml + "</Root>";
			console.log('final xml for finish..............1066[[[[[[[[', finalXml);

			var newtempData:any = {};

            //Change by shrutika on 26/10/2020 [Start] for working finish functionality same as compact layout(Eevery fiels validate on finish because of processRequest)
			/*newtempData["XML_STR"] = finalXml;
			newtempData["OBJ_NAME"] = this.compData["OBJ_NAME"];
			newtempData["ACTION"] = "SAVE_EXTRACT_TEMPLATE_DATA";
			newtempData["EDITOR_ID"] = this.editorId;*/

            let cuurentValidationData = this.cuurentValidationRow[0];
			var str = cuurentValidationData.split('_');
			newtempData["OBJ_NAME"] = this.compData["OBJ_NAME"];
            newtempData["CHG_STR"] = finalXml;
            newtempData["FORM_NO"] = this.cuurentFormNumber;
			newtempData["ACTION"] = "VAL_DATA";
            newtempData["SAVE_LVL"] = "1";
            newtempData["SAVE_DOCUMENT"] = "FALSE";
            newtempData["EDIT_FLAG"] = this.editFlag;
            newtempData["FORM_TYPE"] = "";
            newtempData["EDITOR_ID"] = this.editorId;
            newtempData["EDITOR"] = "MobEditor";
            newtempData["isAttachMandatory"] = "";
            newtempData["CALLER_INTERFACE"] = "BROWSER";
            newtempData["RTEURN_TYPE"] = "json";
            newtempData["IsExtractTemplate"] = "true";
            // Changed by Pravin k on 4-NOV-20 [chavges done as suggested by shrutika] SATRT
            if(this.editFlag == 'A')
			{
                newtempData["IS_FORM_CHANGE"] = "false";
            }
            else
            {
                newtempData["IS_FORM_CHANGE"] = "true";
            }
            // Changed by Pravin k on 4-NOV-20 [chavges done as suggested by shrutika] END
            
            if (this.cuurentFormNumber == "1") 
			{
				newtempData["DOM_ID"] = "1";
			}
			else if (this.cuurentValidationRow.length > 0) 
			{
                newtempData["DOM_ID"] = str[1];
            }
            // if(this.trainingData.length)
            // {
            //     newtempData["trainingData"] = JSON.stringify(this.trainingData);
            // }
            
            //Change by shrutika on 26/10/2020 [End] for working finish functionality same as compact layout(Eevery fiels validate on finish because of processRequest)
            var paramString = this._extractTempletService.getEncodedParamString(newtempData);
            console.log("paramString [", paramString,"]");
			var url = this._extractTempletService.getHostURL() + '/ibase/E12EditorHandlerServlet';
			if (!isError) 
			{
				this._extractTempletService.isFromAttachPdf = false;
				this._extractTempletService.setLoading(true);
				this._extractTempletService.sendRequest(url, paramString, (objPophelp: any) => {
					var callbackRespNew = objPophelp.split('%%SEP%%');
					objPophelp = callbackRespNew[0];
					var isError = callbackRespNew[1].trim();
                    this._extractTempletService.setLoading(false);
                    var columnName = callbackRespNew[2];
					if (!(isError == 'true')) 
					{
						var errorDom:any = new Document();
						var parser = new DOMParser();
                        //Change by shrutika on 26/10/2020 [Start] for working finish functionality same as compact layout.
                        var finisResponse = objPophelp.split('~#~');
                        objPophelp = finisResponse[0];
                        //Change by shrutika on 26/10/2020 [End] for working finish functionality same as compact layout.
						errorDom = parser.parseFromString(objPophelp, "text/xml");
						console.log('getErrorData xmlDoc>>>>>1.....', errorDom.lastElementChild.lastChild);
						try 
						{
							var tranId = errorDom.getElementsByTagName("TranID")[0].childNodes[0].nodeValue;
							var msg = errorDom.getElementsByTagName("MsgOnSave")[0].childNodes[0].nodeValue;
							var displayMsg = tranId + " -" + msg;
							// alert(displayMsg);
							this.confirmBox.alert('Success', displayMsg);
							//Added by shrutika on 26-05-2020 for close panel in case of extract template.
							closeExtractTemplate();
						}
						catch
						{
							this._extractTempletService.setLoading(false);
							console.log('Error while save trasaction......');
						}
						console.log('inside on Responase of finish action', objPophelp);
						this._extractTempletService.setLoading(false);
					}
                    else 
                    {
                        console.log('inside val data...........3105');
                        var strArray = this.cuurentValidationRow[0].split('_');
                        var currDet = 'Detail' + strArray[0];
                        var ind = strArray[1];
                         console.log('inside val data...........3109');
                        this.setFocusOnError(currDet, ind, columnName);
                    }
				});
			}
		}
		catch (e:any) {
			console.log('Exception afterSaveClick method....', e.message);
		}
	}

	getErrorFieldName(response:any) 
	{
		try 
		{
			var errorDom = new Document();
			var parser = new DOMParser();
			errorDom = parser.parseFromString(response, "text/xml");
			console.log('inside getErrorFieldName error.....', errorDom.getElementsByTagName("error")[0]);
			console.log('inside getErrorFieldName error.....', errorDom.getElementsByTagName("error")[0].getAttribute("column_name"));

			var columName = errorDom.getElementsByTagName("error")[0].getAttribute("column_name");
			return columName;
		}
		catch (e:any) 
		{
			console.log('Exception getErrorFieldName method....', e);
			return "";
		}
	}

	setKeyNavigation(formNo:any) 
	{
		console.log("setKeyNavigation ...");
		var tableId = "tableDetails_" + formNo;
		var element = document.getElementById(tableId);
		console.log("setKeyNavigation :: element:", element);

		if (element) 
		{
			var self = this;
			element.onkeydown = function (evnt: KeyboardEvent) 
			{
				evnt = evnt || <any>window["event"];
				switch (evnt.keyCode) {

					case 38:
						self.upArrowPressed(evnt, formNo);
						break;
					case 40:
						self.downArrowPressed(evnt, formNo);
						break;
				}
			};
		}
	}

	upArrowPressed(evnt:any, formNo:any) 
	{
		try 
		{
			var targetElm = evnt.target;
			console.log("call upArrowPressed :", targetElm);
			if (targetElm) 
			{
				var id = targetElm.id;
				//var start = "detail.2.";
				var start = "Detail" + formNo + ".";
				if (id.startsWith(start)) 
				{
					var idWithCount = id.replace(start, "");
					var count = idWithCount.substring(0, idWithCount.indexOf("."));
					console.log("count[", count, "]");
					var isFocus: boolean = false;
					do 
					{
						count--;
						if (count == 0) 
						{
							break;
						}
						var onlyId = idWithCount.substring(idWithCount.indexOf(".") + 1);
						var newId = start + count + '.' + onlyId; console.log("Move to newId:", newId);
						var element = document.getElementById(newId);

						if (element != null) 
						{
							var isDisplay = element.offsetParent === null;
							console.log("Move to isDisplay:", isDisplay);
							if (!isDisplay) 
							{
								isFocus = true;
								element.focus();
								this.rowSelected("Detail" + formNo, (count - 1), false);
							}

						}
					} while (!isFocus)
				}
			}
		}
		catch (e:any) 
		{
			console.log('Exception inside upArrowPressed method....', e.message);
		}
	}

	downArrowPressed(evnt:any, formNo:any) 
	{
		try 
		{
			var targetElm = evnt.target;
			console.log("call downArrowPressed:", targetElm);
			if (targetElm) 
			{
				var id = targetElm.id;
				//var start = "detail.2.";
				var start = "Detail" + formNo + ".";
				if (id.startsWith(start)) 
				{
					var idWithCount = id.replace(start, "");
					var count = idWithCount.substring(0, idWithCount.indexOf("."));
					count = Number(count);
					var isFocus: boolean = false;
					do 
					{
						count++;
						var formDetail = "Detail" + formNo;
						var detailDataLen = 0;
						if (this.allformValues[formDetail] != undefined) 
						{
							detailDataLen = this.allformValues[formDetail].length;
						}
						if (count > detailDataLen) 
						{
							break;
						}
						var onlyId = idWithCount.substring(idWithCount.indexOf(".") + 1);
						var newId = start + count + '.' + onlyId;
						console.log("Move to newId:", newId);
						var element = document.getElementById(newId);
						if (element != null) 
						{
							var isDisplay = element.offsetParent === null;
							console.log("Move to isDisplay:", isDisplay);
							if (!isDisplay) 
							{
								isFocus = true;
								element.focus();
								this.rowSelected("Detail" + formNo, (count - 1), false);
							}
						}
					} while (!isFocus)
				}
			}
		}
		catch (e:any) 
		{
			console.log('Exception inside downArrowPressed method....', e.message);
		}
	}

	//Added by Pravin K on 26-JUNE-20[For text selection] START
	SaveOrUpdateYML() 
	{
		console.log("SaveOrUpdateYML addSelectionLogArr : ", this.addSelectionLogArr);
		console.log(" this.docDetails : ", this.docDetails);

		var fileName = "";
		if (this.docDetails) 
		{
			if (this.docDetails['DOC_NAME']) 
			{
				fileName = this.docDetails['DOC_NAME'];
				var ind = fileName.indexOf(' ');
				if (ind == -1) 
				{
					ind = fileName.lastIndexOf('.');
				}

				fileName = fileName.substring(0, ind);
			}
		}
        var keywords = this.tableLineData["keywords"]?this.tableLineData["keywords"]:"";
		var lineDetails = this.getLinesDetails();
        console.log("data: lineDetails::", lineDetails);
		if (this.addSelectionLogArr.length > 0) 
		{
            this._extractTempletService.setLoading(true); //Added By Pravin K on 29-JAN-21
			var data:any = { "fileName": fileName, "issuer": fileName, "keywords": keywords, "fields": this.addSelectionLogArr };
			if (lineDetails) 
			{
                data["lines"] = lineDetails;
			}
			console.log("data:", data);

			var self = this;
			this.invoiceTransactionService.saveYmlTemolate(JSON.stringify(data)).subscribe(data => {

                this._extractTempletService.setLoading(false); //Added By Pravin K on 29-JAN-21
				console.log("invoiceTransactionService::result data", data);
				var result = "";
				if (data.trim()== "successful") 
				{
					result = "YML updated successfuly";
					console.log("successful::result data[", data,"]");
                    //Added By Pravin K on 4-NOV-20 [To call data extraction after save template ] SAVE
                    this.tableLineData = {"tableColumns":{},"tableStart":"","tableEnd":"","action":"","keyIndex":[]};
                    this.extractData();
                    //Added By Pravin K on 4-NOV-20 [To call data extraction after save template ] END
					//self.attachedCallback(self.data);
				}
				else 
				{
					result = "YML updated failed";
                    console.log("Update Failed::result [", result,"]");
				}
				//alert(result);
			});
		}
		else 
		{
			//alert("There is no selection to update.");
            console.log("There is no selection to update");
		}
		console.log("this.tableColumns :", this.tableColumns);
	}

	addTextSelection() 
	{
		console.log("AddSelectionEvent() elementId=pdf-viewer-editor ");

		var element:any = document.getElementById("pdf-viewer-editor");
		console.log("pdf element : ", element);
		var self:any = this;
		var elm = null;
        //added By pravin k start
        console.log("mouse self.removeSelectionOnPFD[" ,self,"]this[",this,"]");
        /*if(this && this.addSelectionLogArr)
        {
            this["mapDialogData"]["selectionArray"] = this["addSelectionLogArr"];
        }
        //added By pravin k end
        console.log("AddSelectionEvent[",self,"]this["+this+"], mapDialogData[" +self["mapDialogData"]+ "]");*/
		this.mouseUpRef = function (event:any) 
		{
			console.log("mouse click//*-[" ,event);//pa 20
            console.log("mouse self.removeSelectionOnPFD[" ,self,"]this[",this,"]");
            if(self && self.removeSelectionOnPFD)
            {
			    //self.removeSelectionOnPFD();// Added By Pravin K on 8-JUL-20 [to remove highlighted  pdf text]
            }
			var currEvnt = this.currEvnt;
			var lastEvnt = this.lastEvnt;
			var secondLastEvnt = this.secondLastEvnt;

			currEvnt = "click";
            var selectedText = self.getSelectedText();
            console.log("mouse click selectedText[" ,selectedText, "]");//pa 20
			if (selectedText)// event.button==2 this was used for right click identifivation 
			{
				console.log("lastEvnt[" + lastEvnt + "],secondLastEvnt[" + secondLastEvnt + "]self[",self,"]");//pa 20
				
				this.textSelected = true;

				console.log("clickSelection ::isClickOn ", self.isClickOn);
				console.log("clickSelection ::moveToNext ", self.movedTONextField);
				if (this.isClickOn) 
				{
					//this.selectionLogs(true);
					//call logic for doubleclick
				}

				if (lastEvnt == "dblClick" || (lastEvnt == "click" && secondLastEvnt == "dblClick")) 
				{
					// Replace current value of the field.
					if (self.movedTONextField) 
					{
						console.log("clickSelection 1 ");
						self.callEvent("TEXT_SELECT", selectedText);
					}
					else  // to set first value to the field //replace the value of textBox
					{
						console.log("clickSelection 3 ");
						self.callEvent("TEXT_RESELECT", selectedText);
					}
					self.movedTONextField = false;
				}
				else // to set first value to the field //first dcSelection
				{
					// console.log("new fild text --1 "+selectedText); 
					console.log("clickSelection 2 :",self.movedTONextField);//pa 20
					self.callEvent("TEXT_SELECT", selectedText);
                    self.movedTONextField = false;
				}
				//to check this if first click if isClickOn is true then ,
				//this is second click or sengle click select
				if (!self.isClickOn) {
					self.textSelected = false;
				}
				//if last event is click then change isClickOn to  false;
				if (lastEvnt == "click") {
					self.isClickOn = false;
				}
				currEvnt = "dblClick";
			}
			else    //go to next lield to set text
			{
				self.isClickOn = true;
				window.setTimeout(() => {
					// if(! this.textSelected)
					if (!self.textSelected) 
					{
						console.log("lastEvnt [" + lastEvnt + "]");
						if (lastEvnt && lastEvnt == "dblClick") 
						{
							console.log("move to next .......... ");
							//self.callEvent("TEXT_DESELECT", "move to next ..........");
						}
						self.movedTONextField = true;
						self.isClickOn = false;
					}
					self.textSelected = false;
				}, 400);
			}
			//console.log("C : " +currEvnt+ ", L : " +lastEvnt+ ", SL : "+secondLastEvnt);
			self.secondLastEvnt = lastEvnt;
			self.lastEvnt = currEvnt;
		}
		//};
		console.log('doctype:[' + this.docType + ']');
		if (this.docType == "pdf") 
		{
			element.onmouseup = this.mouseUpRef;
		}
		else 
		{
			var elmCont = (element["contentWindow"] || element["contentDocument"]);
			elmCont.document.onmouseup = this.mouseUpRef;
		}
	}

	leftArrowPressed(evnt:any) {
		var targetElm = evnt.target;
		console.log("Move to left text box:", targetElm);
		if (targetElm) {
			var id = targetElm.id;
			if (id.startsWith("detail.2.")) {
				var leftElm = targetElm.previousElementSibling; //nextElementSibling
				console.log("Move to left lefElm:", leftElm);
				if (leftElm) {
					leftElm.focus();
				}
			}
		}
	}

	rightArrowPressed(evnt:any) 
	{
		var targetElm = evnt.target;
		console.log("Move to righttext box:", targetElm);
		if (targetElm) 
		{
			var id = targetElm.id;
			if (id.startsWith("detail.2.")) 
			{
				var rgtElm = targetElm.nextElementSibling; //nextElementSibling
				console.log("Move to right rgtElm:", rgtElm);
				if (rgtElm) 
				{
					rgtElm.focus();
				}
			}
		}
	}

	callEvent(eventType:any, selectedText:any) 
	{
		console.log("eventType[" + eventType + "],selectedText[" + selectedText + "]this.docType[" + this.docType + "]");

        //Changed by Pravin K on 6-OCT-20 for createing on line regular expression  START
        var action = this.tableLineData.action +"";
		if (this.docType == "pdf") 
		{
			this.selectionLogs(true);
		}
        console.log("window.selection action[",action, "]");
        if(!action)
        {
            /* this will set selected value to priviously selected text box 	STRT*/
            console.log(" window.selection[", window["selectionLogs"], "]");
            if (window["selectionLogs"] && window["selectionLogs"]["selectedTextboxId"]) 
            {
                var id = window["selectionLogs"]["selectedTextboxId"];
                var elment:any = document.getElementById(id);
                var selectedTxt = this.getSelectedText();
                console.log("selectedTxt : ", selectedTxt);
                if (elment) 
                {
                    elment["value"] = selectedTxt;
                    elment.dispatchEvent(new Event('input', { bubbles: true }))
                }
            }
            /* this will set selected value to priviously selected text box 	END*/
        }
        console.log("befor window.selection action[",action, "]");
        action="";
        console.log("after window.selection action[",action, "]");
        //Changed by Pravin K on 6-OCT-20 for createing on line regular expression  END
	}

	getSelectedText() 
	{
		var selectedText = '';
		if (this.docType == "pdf") 
		{
			if (window.getSelection) 
			{
				return window.getSelection()?.toString();
			} 
			else if (<any>document as any["selection"]) 
			{
				return (document as any)["selection"].createRange().text;
			}
			return '';
		}
		else 
		{
			var iframe: any = document.getElementById('pdf-viewer-editor');
			var idoc = iframe["contentDocument"] || iframe["contentWindow"]["document"];
			if (idoc.getSelection().toString()) 
			{
				return idoc.getSelection().toString();
			}
		}
		return '';
	}

	selectionLogs(isDoubleClickSelection:any) 
	{
		var objName = this.objName;  //"misc_voucher";
		var documentType = this.docType; // "Invoice";
		var self = this;
        //Changed by Pravin K on 4-SEP-20 for createing on line regular expression  START
        var highlightKey = true;
        if (window["selectionLogs"] && window["selectionLogs"]["selectedTextboxId"]) 
        {
            // var selectedTextboxId = window["selectionLogs"]["selectedTextboxId"];
			var selectedTextboxId = window["selectionLogs"]["selectedTextboxId"];
            console.log("getLabelForSelection result selectedTextboxId [", selectedTextboxId,"]");
            console.log("tableLineData.action[", this.tableLineData,"]");
            //this.tableLineData.action
            if(this.tableLineData.action)
            {
                console.log(" this.tableLineData.action [",this.tableLineData.action,"]");
                if(this.tableLineData.action=="tableStart")
                {
                    this.selecTableStartTxt = "Click here to edit Starting mark of the document"; 
                    
                    this.tableLineData.tableStart = this.getSelectedText();
                    var currElm = this.getSelectedElement();
                    this.setTapleElementPositon(currElm,"tableStart");
                }
                else if(this.tableLineData.action=="tableEnd")
                {
                    this.selecTableEndTxt = "Click here to edit ending mark of the document";
                    this.tableLineData.tableEnd = this.getSelectedText();
                    var currElm = this.getSelectedElement();
                    this.setTapleElementPositon(currElm,"tableEnd");

                    this.setAllColumns();
                }
                else if(this.tableLineData.action=="keyword") /*Added on 26-NOV-20  for keyword START*/
                {
                    //this.selecTableEndTxt = "Click here to edit ending mark of the document";
                    this.tableLineData["keywords"] = this.getSelectedText();
                    console.log("getLabelForSelection  this.tableLineData:",this.tableLineData);
                    //this.setAllColumns();
                }/*Added on 26-NOV-20  for keyword START*/
                else
                {
                    var colName = "";
                    if(this.tableLineData.action=="AddComumn")
                    {
                        colName = "colum_"+this.tableColumnCount;
                        this.tableColumnCount +=1;
                    }
                    else
                    {
                        var lastindDot = this.tableLineData.action.lastIndexOf('.');
                        colName = this.tableLineData.action.substring(lastindDot+1);
                    }
                    var colVal  = this.getSelectedText();
                    console.log("getLabelForSelection  colName [", colName,"],colVal [", colVal,"]");
                    if(colName && colVal)
                    {
                        this.updateTableColumns(colName,colVal,false); 
                    }
                }
                console.log("befor this.tableLineData.action [",this.tableLineData.action,"]");
                this.tableLineData.action="";
                console.log("after this.tableLineData.action [",this.tableLineData.action,"]");
            }
            else if(selectedTextboxId.startsWith("Detail2"))
            {
                var lastindDot = selectedTextboxId.lastIndexOf('.');
                var colName: string = selectedTextboxId.substring(lastindDot+1);
                var colVal  = this.getSelectedText();
                console.log("Detail2 getLabelForSelection  colName [", colName,"],colVal [", colVal,"]");
                if(colName && colVal)
                {
                    this.updateTableColumns(colName,colVal,false); 
                }
            }
            else
            {
                console.log("selectionLogs - ", <any>window["processSelection"]);
                window["processSelection"].getLabelForSelection(isDoubleClickSelection, function (data:any) 
                {

                    console.log("getLabelForSelection result details :", data);

                    var isRegGenerated = self.getRegularExp(data);

                    if (isRegGenerated) 
                    {
                        var isUpdated = self.updatePresentSelectionLog(data);
                        if (!isUpdated) 
                        {
                            self.addSelectionLogArr.push(data);
                        }
                        //added SaveOrUpdateYML on 26-MAY-20  [To update yml after selection ]
                    }
                    console.log("self.addSelectionLogArr", self.addSelectionLogArr, "]");
                    console.log("this.data", self.data, "]");
                },highlightKey);

            }

        }
        //self.SaveOrUpdateYML();
        //Changed by Pravin K on 4-SEP-20 for createing on line regular expression  END
		
	}
    // Added By Pravin K on 4-SEPT-20 [For adding selected value in tableColumns] START
    extractData()
    {
        console.log("extractData:: docId [", this.docDetails['DOC_ID'],"]");
        this._extractTempletService.setLoading(true); //Added By Pravin K on 29-JAN-21
        this._extractTempletService.getExtractedDataOfDocument(this.docDetails['DOC_ID']).subscribe((data: any) => {
            
            this._extractTempletService.setLoading(false); //Added By Pravin K on 29-JAN-21

            console.log("getExtractedDataOfDocument::result [", data,"]");
            if(!data)
            {
                console.log("Data is not extracted.");
                return;
            }

            var extractedData = JSON.parse(data);
            console.log('extractedData', extractedData);
            console.log('docId',this.docDetails['DOC_ID']);
            extractedData["DOC_ID"] = this.docDetails['DOC_ID'];
            console.log('extractedData', extractedData);
            
            //Aded by Pravin k on 25-OCT-20[To hide create template ] START exitaction found;
            this.showTableMarking = false;
            //Aded by Pravin k on 25-OCT-20[To hide create template ] START 
            if (extractedData) 
            {
                // extractedData = JSON.parse(jsonData['EXTRACTED_DATA']); 
                
                console.log('newObj extractedData this.numOfForms', this.numOfForms);
                for (var i = 1; i < this.numOfForms; i++) 
                {
                    var formDetail = 'Detail' + i;
                    var formNo = i;
                    for (const key of Object.keys(extractedData)) 
                    {
                        var id = formDetail + '.' + i + '.' + key;
                        var elem = document.getElementById(id);
                        var value = extractedData[key];
                        if(elem != null && elem.getAttribute('format') == 'dateBox')
                        {
                            var arrayDate = value.split('-'); // YY-MM-DD
                            var validDate = arrayDate[1] + '/' + arrayDate[2].substring(0, 2) + '/' + arrayDate[0]; //MM-DD-YY
                            // validDate = arrayDate[1] + '/' + arrayDate[0] + '/' + arrayDate[0];
                            this.allformValues[key] = new Date(validDate);
                        }
                        else if (key != 'lines' && this.allformValues.hasOwnProperty(key) && formDetail == 'Detail1') 
                        {
                            this.allformValues[key] = extractedData[key];
                        }
                    }
                }
            }
            this.callPreVlaidate(false, this.cuurentValidationRow[0], this.cuurentFormNumber, "", null, true, false);
    
            this.data = {};
            this.data = extractedData;
            console.log('Print inside getPythonServiceUrl this.data',this.data);
            var strLines = this.data.lines;
            console.log('Print strLines[',strLines);
            //Added by Pravin K on 8-OCT-20 [For if data is extracted but lines not readed] START
            var lines:any = [];
            if(this.data.lines)
            {
                lines = this.data.lines;
            }
            // if(strLines)
            // {
            //     const regex = /\"\w+'\w+\"/g;
            //     if(strLines.search(regex))
            //     {
            //         var arr = strLines.match(regex);
            //         console.log("2arr:",arr);

            //         if(arr)
            //         {	
            //             for(var valIndx in arr)
            //             {
            //                 var newVal=  arr[valIndx].replace("'","\\\'");
            //                 console.log(arr[valIndx]+"-:"+newVal);
            //                 strLines = strLines.replace(arr[valIndx],newVal);
            //             }
            //         }
            //         console.log("22 strLines:",strLines);

            //         strLines = strLines.replace(/'/g, '"');
            //         console.log("23 strLines:",strLines);

            //         strLines = strLines.replace(/\\"/g, "'");
            //         console.log("24 strLines:",strLines);
            //     }
            //     else
            //     {
            //         strLines = strLines.replace(/'/g, '"');
            //     }
            //     lines = JSON.parse(strLines);
            // }
            var newLines:any = [];
            this.lineLen = lines.length;
            //Added by Pravin K on 8-OCT-20 [For if data is extracted but lines not readed] END
            console.log('Print lines',lines);
            //Added by Pravin K on 2-NOV-20 for line_indx START
            var objData = this.data.itemCodeList
            console.log('Print objData',objData);
            this.allItemCodes = objData;//added by pravin k on 6-JAN-21
            for (var i = 0; i < this.lineLen; i++){
                lines[i]["line_indx"] = i+1; 
                lines[i]["dom_id"] = i+1; 
                //Adde by Pravin k on 6-JAN-21 START
                var lineObj = lines[i];
                var key = lineObj.descr;
                console.log('extractData inside for loop......1394',i);
                //Added By Pravin K on 25-AUG-20[For all item codes] START 
                var value:any ="";
                var newObj:any = {};
                if(objData)
                {
                    if(objData[key]) 
                    {
                        value = objData[key]["item_code"];
                    }
                }
                console.log("extractData getAllItemCode allItemCodes:key[",key,"][",value,"]");
                if (value) 
                {
                    newObj["item_code"] = value;
                }
                else 
                {
                    newObj["item_code"] = "";
                }
                for (var k in lineObj) 
                {
                    newObj[k] = lineObj[k];
                }
                newLines.push(newObj);
                console.log('newObj getAllItemCode callback', newObj);
                console.log('newObj getAllItemCode this.numOfForms', this.numOfForms);

                //Comented by Pravin K on 16-MAR-21 [to stop multiple call to add detail2] START
                // for (var j = 2; j <= this.numOfForms; j++) 
                // {
                //     var currentDetail = 'Detail' + j;
                //     console.log('newObj getAllItemCode currentDetail', currentDetail);
                //     var formNo = j;
                //     if (currentDetail != 'Detail1') 
                //     {
                //         this.addDetail(currentDetail, formNo, true, newObj);
                //     }
                // }
                //Comented by Pravin K on 16-MAR-21 [to stop multiple call to add detail2] END
                //Adde by Pravin k on 6-JAN-21 END
            }
            this.data.lines = newLines;
            console.log('Print lines after line add',lines);

            this.addDetail2Rows(newLines);//Added By Pravin k on 11-MAR-21 

            //Added by Pravin K on 2-NOV-20 for line_indx END
            //new new Added By Pravin K on 29-DEC-20 START
            // this._extractTempletService.getAllItemCodeList(JSON.stringify(lines)).subscribe(data => {
            //         console.log("extractData  getAllItemCodeList::result data", data);
            //         if (data.includes("resut") ) 
            //         {
            //             var objData =JSON.parse(data);
            //             console.log("extractData getAllItemCode::result objData[", objData,"]");
            //             if(objData)
            //             {
            //                 this.allItemCodes = objData;
            //             }
            //         }
            //         console.log("extractData getAllItemCodeList::result data", data);
                    
            //         for (var i = 0; i < lines.length; i++) {
            //             var lineObj = lines[i];
            //             var key = lineObj.descr;
            //             console.log('extractData inside for loop......1394',i);
            //             //Added By Pravin K on 25-AUG-20[For all item codes] START 
            //             var value:any ="";
            //             var newObj = {};
            //             if(this.allItemCodes)
            //             {
            //                 if(this.allItemCodes[key]) 
            //                 {
            //                     value = this.allItemCodes[key]
            //                 }
            //             }
            //             console.log("extractData getAllItemCode allItemCodes:key[",key,"][",value,"]");
            //             if (value) 
            //             {
            //                 newObj["item_code"] = value;
            //             }
            //             else 
            //             {
            //                 newObj["item_code"] = "";
            //             }
            //             for (var k in lineObj) 
            //             {
            //                 newObj[k] = lineObj[k];
            //             }
            //             newLines.push(newObj);
            //             console.log('newObj getAllItemCode callback', newObj);
            //             console.log('newObj getAllItemCode this.numOfForms', this.numOfForms);

            //             for (var j = 2; j <= this.numOfForms; j++) 
            //             {
            //                 var currentDetail = 'Detail' + j;
            //                 console.log('newObj getAllItemCode currentDetail', currentDetail);
            //                 var formNo = j;
            //                 if (currentDetail != 'Detail1') 
            //                 {
            //                     this.addDetail(currentDetail, formNo, true, newObj);
            //                 }
            //             }
            //         }
            //         this.data.lines = newLines;
            //     });
                //new new Added By Pravin K on 29-DEC-20 END   
            
        });

        // console.log('All line updated')
        // this.zone.run(() => {
        //         console.log('view refreshed');
        //     });

    }

    updateTableColumns(colName:any, colVal:any,isNull:any)
    {
        console.log("updateTableColumns this.tableLineData.tableColumns",this.tableLineData.tableColumns, "],colName[",colName,",[", this.tableLineData.tableColumns[colName],"]");
        //var isValueNotUpdated = true;
        if(!this.tableLineData.tableColumns.hasOwnProperty(colName))
        {
           this.tableLineData.keyIndex.push(colName);
        }  
        var elm = this.getSelectedElement();
        var currElm = elm.anchorNode.parentElement;
        var currElmTop = currElm.style.top;
        currElmTop =  Number(currElmTop.substring(0,currElmTop.indexOf("px")));
        var currElmLeft = currElm.style.left;
        currElmLeft =  Number(currElmLeft.substring(0,currElmLeft.indexOf("px")));
        
        this.tableLineData.tableColumns[colName] = { "col": colName, "val": colVal,"isNull":false ,"left":currElmLeft,"top":currElmTop }; 
        console.log("after update updateTableColumns this.tableLineData",this.tableLineData, "]");
        this.updateMachColumn(colName,currElmLeft,currElmTop);

    }
    updateMachColumn(colName:any,currElmLeft:any,currElmTop:any)
    {
        console.log("in updateMachColumn::colName[",colName,"],currElmLeft[",currElmLeft,"],currElmTop[",currElmTop,"]this.tableLineData:",this.tableLineData);
        if(!this.tableLineData["machColumn"])
        {
            this.tableLineData["machColumn"]={};
        }

        if(! this.tableLineData["machColumn"][colName])
        {
            var valFound = false;
            //Added By Prain K on 9-FEB-20 [Checked allColumns is not null]
            for(var cn=0 ; this.tableLineData["allColumns"]  && cn < this.tableLineData["allColumns"].length && valFound==false  ; cn++ )
            {
                var obj = this.tableLineData["allColumns"][cn];
                //for(var sample in obj["sampleVal"])
                var columnName =  obj["column"];
                for(var objCn=0 ; objCn < obj["sampleVal"].length && valFound==false  ; objCn++ )
                {
                    var sample = obj["sampleVal"][objCn];
                    if(sample)
                    {
                        var currSampleTop = sample["top"];
                        var currSampleLeft = sample["left"];
                      
                        if(currSampleTop == currElmTop && currSampleLeft==currElmLeft)
                        {
                           this.tableLineData["machColumn"][columnName] = colName;
                           valFound = true;
                        }
                    }
                }
            }
        }
        console.log("End updateMachColumn::",this.tableLineData);
    }
    
    setTapleElementPositon(currElm:any,elmName:any)
    {
        console.log("in setTapleStartPositon ");
        //var currElm = this.getSelectedElement();
        if(currElm)
        {
            currElm = currElm.anchorNode.parentElement;
            var currElmTop = currElm.style.top;
            currElmTop =  Number(currElmTop.substring(0,currElmTop.indexOf("px")));
            var currElmLeft = currElm.style.left;
            currElmLeft =  Number(currElmLeft.substring(0,currElmLeft.indexOf("px")));

            this.tableStartEndPosiotn[elmName] = {"top":currElmTop, "left":currElmLeft} ;       
        }
        console.log("in setTapleElementPositon :",this.tableStartEndPosiotn);
    }

    setAllColumns()
    {
        console.log("in setAllColumns ");
    //  var tableStartelm = this.getSelectedElement();
        var tableStartElm:any = this.getTableElementByLeftAndTop(this.tableStartEndPosiotn["tableStart"]);
        this.tableLineData["allColumns"] = [];
        console.log("setAllColumns tableStartElm: --",tableStartElm);
        if(tableStartElm)
        {
            // tableStartelm = tableStartelm.anchorNode.parentElement;
            // console.log("setAllColumns tableStartelm:",tableStartelm);
            //var currElmTop = window["processSelection"].getIntNumber(currElm.style.top);
            var tableStartElmTop = tableStartElm["style"].top;
            var text = tableStartElm["innerText"];
            var offSetWidth = tableStartElm.offsetWidth
            
            // var allColValues = this.getAllCollValues(tableStartElm); 
            // this.tableLineData["allColumns"].push({"column":text,"top:":tableStartElmTop,"left": tableStartElm["style"].left,"sampleVal":allColValues,"offSetWidth":offSetWidth});
            // var nextElm = tableStartElm["nextElementSibling"];      
            // var nextElmTop = nextElm.style.top;
            // console.log("tableStartElmTop[",tableStartElmTop,"],nextElmTop[",nextElmTop,"] ");
            var tableHeadersObj:any={};
            var allTableSpans = document.getElementsByClassName("textLayer");
            if(allTableSpans[0])
            {
                var nextElm:any = allTableSpans[0].firstChild;
                console.log("3958 currElm nextElm[",nextElm,"]");
                while(nextElm)
                {
                    var nextElmTop = nextElm["style"].top;
                    if(tableStartElmTop == nextElmTop)
                    {
                        console.log("currElm nextElm[",nextElm,"]");

                        var nextElmLeft = nextElm["style"].left;    
                        nextElmLeft = Number(nextElmLeft.substring(0,nextElmLeft.indexOf("px")));
                        tableHeadersObj[nextElmLeft] = nextElm ;
                        // var allColValues = this.getAllCollValues(nextElm); 
                        // this.tableLineData["allColumns"].push({"column":text,"top:":nextElmTop,"left": nextElm["style"].left,"sampleVal":allColValues,"offSetWidth":offSetWidth});
                    }
                    nextElm = nextElm["nextElementSibling"];      
                }
                console.log("tableHeadersObj[",tableHeadersObj,"]");
                var headerKeys = Object.keys(tableHeadersObj);
                console.log("befor headerKeys[",headerKeys,"]");
                headerKeys.sort(this.sortEggsInNest);
                console.log("sorted headerKeys[",headerKeys,"]");

                for(var i = 0; i < headerKeys.length; i++)
                {
                    nextElm = tableHeadersObj[headerKeys[i]];
                    if(nextElm)
                    {
                        text = nextElm["innerText"];
                        offSetWidth = nextElm["offsetWidth"];
                        var nextElmTop = nextElm["style"].top;
                        var allColValues = this.getAllCollValues(nextElm,i,tableHeadersObj,headerKeys); 
                        this.tableLineData["allColumns"].push({"column":text,"top:":nextElmTop,"left": nextElm["style"].left,"sampleVal":allColValues,"offSetWidth":offSetWidth});
                    }
                }
            }
        }
        console.log("this.tableLineData[allColumns] [",this.tableLineData["allColumns"],"]");
        this.processInvalidvalues();
        console.log("END setAllColumns  tableLineData",this.tableLineData);
        
    }
    
    sortEggsInNest(a:any, b:any) {
        return a - b
    }
    
    processInvalidvalues()
    {
        console.log("--processInvalidvalues  tableLineData[allColumns] [",this.tableLineData["allColumns"],"]");
        var maxRowCn = 0;
        for(var cn=0 ; cn < this.tableLineData["allColumns"].length ; cn ++ )
        {
            var obj = this.tableLineData["allColumns"][cn]
            console.log("processInvalidvalues::cn[",cn,"] obj[",obj,"]");
            var sampleObj = obj["sampleVal"];
            //console.log("processInvalidvalues[",sampleObj,"]");
            //console.log("processInvalidvalues11[",sampleObj.length,"]");
            if(sampleObj.length>maxRowCn)
            {
                maxRowCn = sampleObj.length;
            }
        }
        console.log("processInvalidvalues22[",maxRowCn,"]");
        this.invalidRow={}; //.includes
        sampleObj  = [];
        console.log(" sampleObj[",sampleObj,"]");
        for(var cn=0 ; cn < this.tableLineData["allColumns"].length ; cn++ )
        {
            sampleObj = this.tableLineData["allColumns"][cn];
            if(sampleObj["sampleVal"].length=maxRowCn)
            {
                //console.log( "removeInvalidvalues:311698",obj["sampleVal"]);
                
                //for(var sample in sampleObj["sampleVal"])
                for(var objCn=0 ; objCn < sampleObj["sampleVal"].length; objCn++)
                {
                    var sample = sampleObj["sampleVal"][objCn];
                    if(sample)
                    {
                        var sampleTop = sample["top"];
                        var rewCnt = this.getElementCountOfThisTop(sampleTop,cn);
                        this.invalidRow[sampleTop]=rewCnt;
                    }
                }

            }
        }
        console.log("processInvalidvalues   this.invalidRow[", this.invalidRow,"]");
        this.removeInvalidFormData(maxRowCn);
    }
    removeInvalidFormData(maxRowCn:any)
    {
        console.log("removeInvalidFormData this.invalidRow[", this.invalidRow,"],tableLineData['allColumns']",this.tableLineData["allColumns"]);
        //Added By Prain K on 9-FEB-20 [Checked allColumns is not null]
        for(var cn=0 ; this.tableLineData["allColumns"]  && cn < this.tableLineData["allColumns"].length ; cn++ )
        {
            var sampleObj = this.tableLineData["allColumns"][cn];
            var sampleObjLen = sampleObj["sampleVal"].length;
            for(var objCn=0 ; objCn < sampleObjLen ; objCn++)
            {
                var sample = sampleObj["sampleVal"][objCn];
                if(sample)
                {
                    var sampleTop = sample["top"];
                    if(this.invalidRow[sampleTop] && this.invalidRow[sampleTop] <3 )
                    {
                        //console.log("sample::[",sample,",this.invalidRow[sampleTop]",this.invalidRow[sampleTop]); 
                        sampleObj["sampleVal"].splice(objCn, 1);
                        //fruits.splice(cn, 1); 
                        sampleObjLen--;
                    }
                }
            }
        }
        console.log("END tableLineData['allColumns']",this.tableLineData["allColumns"]);
    }

    getElementCountOfThisTop(sampleTop:any, currentArrCn:any)
    {
        var valueCnt = 0
        for(var cn=0 ; cn < this.tableLineData["allColumns"].length ; cn++ )
        {
            var obj = this.tableLineData["allColumns"][cn];
            //for(var sample in obj["sampleVal"])
            for(var objCn=0 ; objCn < obj["sampleVal"].length ; objCn++ )
            {
                var sample = obj["sampleVal"][objCn];
                if(sample)
                {
                    var currSampleTop = sample["top"];
                    if(currSampleTop == sampleTop)
                    {
                        valueCnt++;
                    }
                }
            }
        }
        //console.log("getElementCountOfThisTop :: sampleTop[",sampleTop,"],currentArrCn[",currentArrCn,"],valueCnt[",valueCnt,"]");

        return valueCnt;
    }

    getTableElementByLeftAndTop(elmJson:any)
    {
        console.log("getTableElementByLeftAndTop :",elmJson);
        var tableEndTop  = elmJson["top"] +"px";
        var tableEndLeft = elmJson["left"] +"px" ;

        var allTableSpans = document.getElementsByClassName("textLayer");
        var result; //this is declared to use return undefined
        if(allTableSpans[0])
        {
            var elm:any = allTableSpans[0].firstChild;
            while(elm)            
            {       
                if(elm && elm["style"])
                {
                   var  currTop =  elm["style"].top;
                   var  currLeft =  elm["style"].left; 
                    if(tableEndTop == currTop && tableEndLeft == currLeft )
                    {
                        console.log("getTableElementByLeftAndTop table start elm:",elm);
                    return elm;
                    }
                    elm = elm["nextElementSibling"];
                }

            }
        }
        console.log("getTableElementByLeftAndTop end result:",result); 
        return result;
    }

    getAllCollValues(currHeaderElem:any, ind:any, tableHeadersObj:any, headerKeys:any)
    {
        console.log("getAllCollValues ::currHeaderElem[",currHeaderElem,"],tableStartEndPosiotn:",this.tableStartEndPosiotn);
        console.log("ind[",ind,"],tableHeadersObj[",tableHeadersObj,"]headerKeys:",headerKeys);
        var tableEndTop = this.tableStartEndPosiotn["tableEnd"]["top"];

        //;pot"""][]["tableStart"] ["tableStart"] """][]this.tableStartEndPosiotn = poTdnEdneelbatt rav                
        var currHeadLeft = currHeaderElem.style.left;
        var currHeadOffsetWidth = currHeaderElem.offsetWidth;
        var isfirst=false;

        var nextHeaderElem:any;
        var prevHeaderElem:any; 
        
        if( ind>0 )
        {
           prevHeaderElem =  tableHeadersObj[headerKeys[ind-1]];
        }

        if( headerKeys.length-1 != ind )
        {
            nextHeaderElem = tableHeadersObj[headerKeys[ind+1]];
        } 

        var nextHeaderLeft = "";
        var nextHeaderLeftNo = 0;
        var prvHeaderLeftNo = 0;
        var prvHeadOffsetWidth = 0;
        if(nextHeaderElem)
        {
            if(nextHeaderElem.style.top == currHeaderElem.style.top )
            {
                nextHeaderLeft = nextHeaderElem.style.left;    
                nextHeaderLeftNo = Number(nextHeaderLeft.substring(0,nextHeaderLeft.indexOf("px")));
            }
        }
        if(prevHeaderElem )
        {
            if(prevHeaderElem.style.top == currHeaderElem.style.top )
            {
                var prvHeaderLeft = prevHeaderElem.style.left;
                prvHeaderLeftNo = Number(prvHeaderLeft.substring(0,prvHeaderLeft.indexOf("px")));
                prvHeadOffsetWidth = prevHeaderElem.offsetWidth;
            }
        }
        console.log(" nextHeaderLeftNo[",nextHeaderLeftNo,"],prvHeadOffsetWidth[",prvHeadOffsetWidth,"]prvHeaderLeftNo[",prvHeaderLeftNo,"],currHeadOffsetWidth[",currHeadOffsetWidth,"],headerTopNo[",currHeaderElem.style.top,"]");
        var allcolumnValues:any=[];
        
        var allTableSpans = document.getElementsByClassName("textLayer");
        if(allTableSpans[0])
        {
            var elm:any = allTableSpans[0].firstChild;
            var headerTopNo =  currHeaderElem.style.top;
            headerTopNo =  Number(headerTopNo.substring(0,headerTopNo.indexOf("px")));


            console.log( elm["innerText"],"]headerTopNo[",headerTopNo,"]")
            while(elm)            
            {       
                var currTopNo =  elm["style"].top;
                //console.log( elm["innerText"],"currTopNostr[",currTopNo,"]elm:");
                currTopNo =  Number(currTopNo.substring(0,currTopNo.indexOf("px")));

                if(currTopNo > headerTopNo && currTopNo < tableEndTop-2)
                {
                    var elmLeft = elm["style"].left;
                    var elmOffsetWidth = elm["offsetWidth"];
                    var text = elm["innerText"];
                    

                    var elmLeftNo = Number(elmLeft.substring(0,elmLeft.indexOf("px")));
                    var currHeadLeftNo = Number(currHeadLeft.substring(0,currHeadLeft.indexOf("px")));
                    
                    if(currHeaderElem.innerHTML == "Quantity" )
                    {
                        console.log("ElmLeft[",elmLeft,"],CurrHeadLeft[",currHeadLeft,"],prvHeaderLeftNo[",prvHeaderLeftNo,"],prvHeadOffsetWidth[",prvHeadOffsetWidth,"],nextHeaderLeftNo[",nextHeaderLeftNo,"]currHeadLeftNo[",currHeadLeftNo,"],elmOffsetWidth[",elmOffsetWidth,"],elmLeftNo[",elmLeftNo,"]elmLeft:",text)
                    }
                    
                    //if(elmLeft && (elmLeft == currHeadLeft) || ( elmLeft > currHeadLeft && ( (elmLeftNo+elmOffsetWidth) >= (currHeadLeftNo+currHeadOffsetWidth) )  ) )
                    if(elmLeft && ( (elmLeft == currHeadLeft) || (ind==0 &&(elmLeftNo < (currHeadLeftNo+currHeadOffsetWidth)) ) || ( elmLeftNo >= (prvHeaderLeftNo+prvHeadOffsetWidth) && elmLeftNo <= (currHeadLeftNo+currHeadOffsetWidth) && ( nextHeaderLeftNo==0 || (elmLeftNo+elmOffsetWidth) < nextHeaderLeftNo) ) ) )
                    {
                        if(text)
                        {
                            var data = {"value":text,"top":currTopNo,"left":elmLeftNo} ;
                            if(currHeaderElem.innerHTML == "Quantity" )
                            {
                                console.log("data[",data,"]");
                            }
                            allcolumnValues.push(data);
                        }
                    }
                }

                elm = elm["nextElementSibling"];
                // if(elm && elm["style"])
                // {
                //     currTopNo =  elm["style"].top;
                //     currTopNo =  Number(currTopNo.substring(0,currTopNo.indexOf("px")));
                // }
               
            }
        }
        console.log("getAllCollValues ::allcolumnValues:",allcolumnValues);
        return allcolumnValues;

    }
    getSelectedElement() 
	{
        console.log("in getSelectedElement :",this.docType);
		var selectedText = '';
		if (this.docType == "pdf") 
		{
			if (window.getSelection) 
			{
				return window.getSelection();
			} 
			// else if (<any>document["selection"]) 
			else if (document as any["selection"]) 
			{
				// return <any>document["selection"].createRange();
				return (document as any)["selection"].createRange();
			}
			return '';
		}
		else 
		{
			var iframe:any = document.getElementById('pdf-viewer-editor');
			var idoc = iframe["contentDocument"] || iframe["contentWindow"]["document"];
			if (idoc.getSelection().toString()) 
			{
				return idoc.getSelection();
			}
		}
		return '';
	}
    // Added By Pravin K on 4-SEPT-20 [For adding selected value in tableColumns] END
    //Added By Pravin k on 15-DEC-20 [TO get Separator ] START
    getSeparator(dataObj: any)
    {
        console.log("getSeparator(dataObj) [", dataObj, "]");
        var lblLeft = dataObj["lblLeft"];
        var textLeft = dataObj["textLeft"];
        var rowTop = dataObj["rowTop"];

        var allTableSpans = document.getElementsByClassName("textLayer");
        if(allTableSpans[0])
        {
            var nextElm:any = allTableSpans[0].firstChild;
            while(nextElm)
            {
                var nextElmTop = nextElm["style"].top;
                nextElmTop = nextElmTop.substring(0,nextElmTop.indexOf("px"));

                nextElmTop = Number(nextElmTop.substring(0,nextElmTop.indexOf(".")));
                //console.log("nextElm[",nextElmTop,"],rowTop[",rowTop,"]");
                if(rowTop == nextElmTop  )
                {
                    var nextElmLeft = nextElm["style"].left; 
                    nextElmLeft = Number(nextElmLeft.substring(0,nextElmLeft.indexOf("px")));
                    //console.log("4355 nextElm ::nextElmLeft[",nextElmLeft,"],lblLeft[",lblLeft,"],textLeft[",textLeft,"]");
                    if(nextElmLeft > lblLeft && nextElmLeft < textLeft )
                    {
                        console.log("--nextElm[",nextElm,"], innerText[",nextElm["innerText"],"]");
                        /*Added By Pravin K on 25-JAN-21 [for the isue of lable haveing separator at end ] START*/
                        var text = nextElm["innerText"];
                        text = text.trim();
                        
                        if( text.length >2 && ( text.endsWith('.')|| text.endsWith(':')) )
                        {
                            dataObj["separator"] = text.substr(text.length-1)
                        }
                        else
                        {
                            dataObj["separator"] = text
                        }
                        console.log("--nextElm dataObj.separator[",dataObj["separator"],"],text[",text,"]");
                        /*Added By Pravin K on 25-JAN-21 [for the isue of lable haveing separator at end ] END*/
                    }
                }
                nextElm = nextElm["nextElementSibling"];      
            }
        }
    }
    //Added By Pravin k on 15-DEC-20 [TO get Separator ] END
    // //Added By Pravin k on 16-DEC-20 [To get sub columns] START
    // getSeparator(dataObj: any)
    // {
    //     console.log("getSeparator(dataObj) [", dataObj, "]");
    //     var lblLeft = dataObj["lblLeft"];
    //     var textLeft = dataObj["textLeft"];
    //     var rowTop = dataObj["rowTop"];

    //     var allTableSpans = document.getElementsByClassName("textLayer");
    //     if(allTableSpans[0])
    //     {
    //         var nextElm = allTableSpans[0].firstChild;
    //         while(nextElm)
    //         {
    //             var nextElmTop = nextElm["style"].top;
    //             nextElmTop = nextElmTop.substring(0,nextElmTop.indexOf("px"));

    //             nextElmTop = Number(nextElmTop.substring(0,nextElmTop.indexOf(".")));
    //             //console.log("nextElm[",nextElmTop,"],rowTop[",rowTop,"]");
    //             if(rowTop == nextElmTop  )
    //             {
    //                 var nextElmLeft = nextElm["style"].left;
    //                 nextElmLeft = Number(nextElmLeft.substring(0,nextElmLeft.indexOf("px")));
    //                 //console.log("4355 nextElm ::nextElmLeft[",nextElmLeft,"],lblLeft[",lblLeft,"],textLeft[",textLeft,"]");
    //                 if(nextElmLeft > lblLeft && nextElmLeft < textLeft )
    //                 {
    //                     console.log("--nextElm[",nextElm,"], innerText[",nextElm["innerText"],"]");
    //                     dataObj["separator"] = nextElm["innerText"];
    //                 }
    //             }
    //             nextElm = nextElm["nextElementSibling"];      
    //         }
    //     }
    // }
    // //Added By Pravin k on 16-DEC-20 [To get sub columns] END

	getRegularExp(dataObj: any) 
	{
		console.log("getRegularExp(cb)clb [", dataObj, "]");
		if (dataObj) 
		{
            var regularExp = dataObj.Label;

            console.log("getRegularExp regularExp [", regularExp, "]");
            if(regularExp && regularExp.startsWith("static_"))
            {
                dataObj["regularExp"] =  dataObj.Text;
                dataObj["regularExpLabel"] = regularExp;
                dataObj["labelOnFile"] = "";
                console.log("static dataObj-[", JSON.stringify(dataObj), "]");
                return true;
            }
            else
            {
                this.getSeparator(dataObj); 
                var lbl = this.getKeyField();
                if (lbl)   
                {
                    var endChar = "";
                    var endChar = regularExp.endsWith(".") ? '.' : ':';

                    regularExp = regularExp.trim();
                    regularExp = regularExp.replace(/\s+/g, ' ');

                    var ExpLbl = regularExp.replace(endChar, '');
                    var lblInFile = ExpLbl;
                    console.log("ExpLbl[", ExpLbl, "]");
                    ExpLbl = ExpLbl.trim();
                    ExpLbl = ExpLbl.replace(/\s+/g, '_');

                    if (ExpLbl.endsWith(".")) 
                    {
                        ExpLbl = ExpLbl.replace('.', '');
                    }
                    if (ExpLbl) 
                    {
                        var tempExpLbl = ExpLbl.toLowerCase();
                        if (tempExpLbl.endsWith("date")) 
                        {
                            ExpLbl = ExpLbl + '_';
                        }
                    }

                    console.log("getRegularExp::lbl [", regularExp, "],endChar[",endChar,"]");
                    if (regularExp.endsWith(endChar)) 
                    {
                        var all_text_val = dataObj.all_text_val;

                        var valExp = "(\\S+)";
                        // Added by pravin k on 14-DEC-20 [For endChar condation singhel line key-value]
                        if (all_text_val && all_text_val.indexOf(" ") != -1 && all_text_val.indexOf(endChar) == -1)  
                        {
                            valExp = "([\\S \\S]+)";
                        }
                        var allExpr = "";
                        if(dataObj["separator"])
                        {
                            //Changed by Pravin k on 25-JAN-20  START
                            console.log("dataObj  separator:", dataObj["separator"]);

                            if(endChar == dataObj["separator"] )
                            {
                                allExpr ="\\s*" + dataObj["separator"] + "\\s*" + valExp;
                            }
                            else
                            {
                                allExpr ="\\s*" + endChar + "\\s*"+ dataObj["separator"] + "\\s*" + valExp;
                            }
                            //Changed by Pravin K on 25-JAN-20 END
                        }
                        else
                        {
                            allExpr ="\\s*" + endChar + "\\s*" + valExp;
                        }
                        
                        regularExp = regularExp.substring(0,regularExp.lastIndexOf(endChar));
                        regularExp = regularExp + allExpr;

                        //regularExp = regularExp.replace(endChar, allExpr);
                        console.log("dataObj-----:-:allExpr[",allExpr,"],regularExp[",regularExp,"]");//pa

                        dataObj["regularExp"] = regularExp;
                        console.log("getLabelForSelection(cb)clb  window.selection[", window["selectionLogs"], "]");

                        dataObj["regularExpLabel"] = lbl;
                        dataObj["labelOnFile"] = lblInFile;
                        console.log("dataObj-[", dataObj, "]");
                    }
                    return true;
                }

            }
		}
		console.log("no label find to set regular exp ");
		return false;
	}

	getKeyField() 
	{
		var lbl = "";
		console.log("getKeyField window.selectionLogs : ", window["selectionLogs"]);
		if (window["selectionLogs"] && window["selectionLogs"]["selectedTextboxId"]) 
		{
			var id = window["selectionLogs"]["selectedTextboxId"];
			lbl = id.substring(id.lastIndexOf(".") + 1);
            /*var elment = document.getElementById(id);
            if(elment)
            {
                if(elment.getAttribute("label"))
                {
                    lbl = elment.getAttribute("label");
                }
            }*/
		}
		return lbl;
	}

	updatePresentSelectionLog(data:any) 
	{
		var isUpdated = false;
		var key = data.regularExpLabel
		key = key.trim();

		var length = this.addSelectionLogArr.length;
		for (var i = 0; i < length; i++) 
		{
			var details = this.addSelectionLogArr[i];
			var RegLbl = details["regularExpLabel"];
			RegLbl = RegLbl.trim();
			if (key === RegLbl) 
			{
				details["Text"] = data["Text"];
				details["all_text"] = data["all_text"];
				details["all_text_val"] = data["all_text_val"];
				details["regularExp"] = data["regularExp"];
				details["Label"] = data["Label"];
				details["LabelPosition"] = data["LabelPosition"];
                details["labelOnFile"] = data["labelOnFile"];// Added by pravin K on 4-SEP-20

				isUpdated = true;
			}
			console.log("updatePresentSelectionLog :: RegLbl[", RegLbl, "]details:", details, ":", isUpdated);
		}
		console.log("updatePresentSelectionLog :: key[", key, "]isUpdated:" + isUpdated);
		return isUpdated;
	}

	setSelectedText(id:any) 
	{
		console.log("setSelectedText::id[" + id + "]");
        /*Added By pravin K on 4-SEP-20 START */
        if(id.startsWith("Detail."))
		{
			return;
		}
        /*Added By pravin K on 4-SEP-20 END */
		if (!window["selectionLogs"]) 
		{
			window["selectionLogs"] = {};
		}
		window["selectionLogs"]["selectedTextboxId"] = id;
        console.log("after setSelectedText::window[selectionLogs][selectedTextboxId][" , window["selectionLogs"]["selectedTextboxId"] , "]");
		//this.showSelectionOnPFD(id);// Added By Pravi k on 21-JUL-20
	}

	onPageLoad() 
	{
		console.log("All Pages Loaded ...");
		this.addTextSelection();
		this.removeHorizontalScrollOfPDFViewer();
		this.removeSelectionEvent();
	}

	removeSelectionEvent() 
	{
		try 
		{
			if (this.docType == "pdf") 
			{
				var element = <any>document.getElementById("pdf-viewer-editor");
				element.removeEventListener(element, this.mouseUpRef);
			}
			else 
			{
				var elmCont = (element["contentWindow"] || element["contentDocument"]);
				elmCont.document.removeEventListener(elmCont.document, this.mouseUpRef);
			}
		}
		catch (ex) 
		{
			console.log("Exception while Removing event", ex);
		}
		console.log("selection event is removed .element::", element);
	}

	//not required for text selection start 
	removeHorizontalScrollOfPDFViewer() 
	{
		var elm = document.getElementsByClassName("ng2-pdf-viewer-container");
		if (elm[0]) 
		{
			elm[0].setAttribute("style", "overflow: inherit");
		}
	}

	addNewColumn() 
	{
		var tempCol = { "col": "", val: "",isNull:false };
		this.tableColumns.push(tempCol);
		console.log("this.tableColumns :", this.tableColumns);
		//this.createRegex();
	}
	getLinesDetails() 
	{
        console.log("this.tableColumns  getLinesDetails:", this.tableLineData);
		var lineSdetails:any = {};
		var tableStart = this.tableLineData.tableStart;
		var tableEnd = this.tableLineData.tableEnd;
		var line = this.createLineRegex();

		if (tableStart && tableEnd && line) 
		{
			lineSdetails["tableStart"] = tableStart;
			lineSdetails["tableEnd"] = tableEnd;
			lineSdetails["line"] = line;

		}
		return lineSdetails;
	}

	createLineRegex() 
	{
		var regex = "";
        console.log("regex: createLineRegex::", this.tableLineData);
      
		//for (key in  this.tableLineData.tableColumns) 
        for (var i=0 ; this.tableLineData.allColumns   && i < this.tableLineData.allColumns.length ; i++) 
		{
            //var indexedKey = this.tableLineData.keyIndex[i];
            //var key = this.tableLineData.allColumns[i];
			var obj = this.tableLineData.allColumns[i]; 
            console.log("regex:: obj:", obj);
            var key = obj["column"];
             
            var isNull = false;
            var columnName = key;
            if(this.tableLineData.machColumn && this.tableLineData.machColumn[key])
            {
                columnName = this.tableLineData.machColumn[key];
            }
            else
            {
                columnName = columnName.replace(" ","_");
                if(columnName.includes("."))
                {
                    columnName = columnName.replace(".","_");
                }
            }
            
            console.log("regex:: obj:", obj);
            var len = 0;
            for(var cn=0; cn < obj["sampleVal"].length ; cn++)
            {
                if(obj["sampleVal"][cn])
                {
                    len++;
                }
            }
            var value:any = ""
            if(len!=0)
            {
                value = obj["sampleVal"][len-1]["value"];
            }
            
            if(len < 3)
            {
                isNull = true
            }
            console.log("regex:[",regex,"]regex.len[",regex.length,"]: columnName[",columnName,"],value-[",value,"],isNull[",isNull,"]len[",len,"]");
			if (columnName) 
			{
				var valReg = "";
				var regExp = this.getRegeularExp(value, isNull,obj["sampleVal"]);
                var start = "";
                if(regex.trim())
                {
                   // console.log("value-:",regex);
                    start = value ? "\\s+" : "\\s*";
                }
                else
                {
                   // console.log("start value-[",regex);
                    start = "\\s*";
                }
                var strTemp = "<" + columnName + ">";
                console.log("strTemp[",strTemp,"],regex:", regex,"foundColumName:",regex.indexOf(strTemp));
                if(regex.indexOf(strTemp)!=-1)
                {
				    regex = regex + start + "(?P<" + columnName + "_>" + regExp + ")";
                }
                else
                {
				    regex = regex + start + "(?P<" + columnName + ">" + regExp + ")";
                }
			}
		}
		console.log("value[",value,"],regex:", regex);
		return regex;
	}

	getRegeularExp(value:any,isNull:any,valArr:any ) 
	{
		var regExp = "";
		if (value) 
		{
			var isNotNo = isNaN(value);
			if (isNotNo) 
			{
                if(! (isNaN(value.charAt(0))) )
                {
                    console.log("valArr::",valArr);
                    var isSpaceAvalable = false;
                    for(var objCn=0 ; objCn < valArr.length && isSpaceAvalable==false  ; objCn++ )
                    {
                        var sample = valArr[objCn];
                        if(sample)
                        {
                            var tempValue = sample["value"];
                            tempValue = tempValue.trim();
                        
                            if(tempValue.indexOf(' ') != -1)
                            {
                                isSpaceAvalable = true;
                            }
                        }
                    } 
                    console.log("--------isSpaceAvalable:",isSpaceAvalable)
                    if(isSpaceAvalable)
                    {
                       regExp ="\\d+\\s*.+"
                    }
                    else
                    {
                        if (/[0-9]/.test(value)|| /[ ]/.test(value)) 
                        {
                            if (/[ ]/.test(value)) 
                            {
                                regExp = ".+";
                            }
                            else if (/[-/]/.test(value) || /['/]/.test(value) || /[ ]/.test(value)) 
                            {
                                value = value.replace(/[A-z]+/g, '\\w+');
                                value = value.replace(/[0-9]+/g, '\\d+');

                                regExp = value;
                            }
                            else 
                            {
                                regExp = "\\w+";
                            }
                        }
                        else 
                        {
                            regExp = "\\w+";
                        }

                    }

                }
                else
                {
                    if (/[0-9]/.test(value)|| /[ ]/.test(value)) 
                    {
                        if (/[ ]/.test(value)) 
                        {
                            regExp = ".+";
                        }
                        else if (/[-/]/.test(value) || /[ ]/.test(value)) 
                        {
                            value = value.replace(/[A-z]+/g, '\\w+');
                            value = value.replace(/[0-9]+/g, '\\d+');

                            regExp = value;
                        }
                        else 
                        {
                            regExp = "\\w+";
                        }
                    }
                    else 
                    {
                        regExp = "\\w+";
                    }
                }
			}
			else //only number
			{
				var isDotPresent = /[.]/.test(value);
				//regExp = isDotPresent ? "\\d+\\.\\d" : "\\d";
                regExp = isDotPresent ? "\\d+\\.?\\d" : "\\d";
				// Added by Pravin K on 20-JUL-20 START
				if(isNull)// in case blank value possioble
				{
					regExp += "*";
				}
				else
				{
					regExp += "+";
				}
				// Added by Pravin K on 20-JUL-20 END
			}

		}
        if(value.length==0)
        {
            regExp = "\\d*";
        }
		return regExp
	}
	//Added by Pravin K on 26-JUNE-20[For text selection] END
	loadFormData() 
	{
		console.log('compData------', this.compData);
		var tmpData:any = {};
		tmpData = this.compData;
		this.tmpDataCopy = JSON.stringify(tmpData);
		console.log('tempData---', tmpData);
		var maxFormNum = tmpData["NO_OF_FORMS"];
		this.editFlag = tmpData["EDIT_FLAG"];
		var paramString = this._extractTempletService.getEncodedParamString(tmpData);
		var url = this._extractTempletService.getHostURL() + '/ibase/E12EditorHandlerServlet';

		this._extractTempletService.isFromAttachPdf = false;
		this._extractTempletService.sendRequest(url, paramString, (firstCallBrowserData:any) => {
			var callbackRespNew = firstCallBrowserData.split('%%SEP%%');
			firstCallBrowserData = callbackRespNew[0];
			var isError = callbackRespNew[1].trim();

			if (!(isError == 'true')) 
			{
				var firstCallBrowserDataNew = {} = JSON.parse(firstCallBrowserData);
				if (firstCallBrowserDataNew && firstCallBrowserDataNew!.DocumentRoot) 
				{
					for (var i = 1; i <= maxFormNum; i++) 
					{
                        var detailArray:any = [];
						var currentFormNoDetail = 'Detail' + i;
						if (firstCallBrowserDataNew.DocumentRoot.group0.Header0[currentFormNoDetail]) 
						{
							var detailLen = firstCallBrowserDataNew.DocumentRoot.group0.Header0[currentFormNoDetail].length;
							var currentLinetag = 'Detail' + i;
							if ((detailLen == null) && (currentFormNoDetail == "Detail1")) 
							{
								var detailJsonData:any = {};
								detailJsonData = firstCallBrowserDataNew.DocumentRoot.group0.Header0[currentFormNoDetail];
								this.currentCompData = JSON.stringify(detailJsonData);
								let id;
								for (var key in detailJsonData) 
								{
									id = currentFormNoDetail + '.1.' + key;
									if (detailJsonData[key] && (detailJsonData[key].content || detailJsonData[key].content == 0)) 
									{
										var value = detailJsonData[key].content;
										this.checkProtectAndvisibleforFirstForm(detailJsonData, key);
										this.allformValues[key] = value;

									}
									else 
									{
										var value = detailJsonData[key];
										if (key != 'attribute' && value instanceof Object) 
										{
											value = "";
										}
										this.checkProtectAndvisibleforFirstForm(detailJsonData, key);
										this.allformValues[key] = value;
									}
								}
								this.currentCompData = JSON.stringify(this.allformValues);
							}
							else 
							{
                                console.log('inside loadformData.......3535',detailLen);
								var detailJsonData:any = {};
								let id;
								if (detailLen == null) 
								{
									this.showDetailForm = true;
									detailJsonData = firstCallBrowserDataNew.DocumentRoot.group0.Header0[currentFormNoDetail];
									for (const key of Object.keys(detailJsonData)) 
									{
										var value = detailJsonData[key];
										if (key != 'attribute' && value instanceof Object) 
										{
											//value = "";
											if (detailJsonData[key] && (detailJsonData[key].content || detailJsonData[key].content == 0)) 
											{
												value = detailJsonData[key].content;
											}
											else 
											{
												value = "";
											}
										}
										id = currentFormNoDetail + '.1.' + key;
                                         
										detailJsonData[key] = value;
									}
									detailArray.push(detailJsonData);
								}
								else 
								{
									this.showDetailForm = true;
									for (var j = 0; j < detailLen; j++) 
									{
										let id;
										detailJsonData = firstCallBrowserDataNew.DocumentRoot.group0.Header0[currentFormNoDetail][j];
										id = currentFormNoDetail + '.' + (j + 1) + '.' + key;
										for (const key of Object.keys(detailJsonData)) 
										{
											var value = detailJsonData[key];
											if (key != 'attribute' && value instanceof Object) 
											{
												//value = "";
												if (detailJsonData[key] && (detailJsonData[key].content || detailJsonData[key].content == 0)) 
												{
													value = detailJsonData[key].content;
												}
												else 
												{
													value = "";
												}
												this.checkProtectAndVisbile(detailJsonData, key, id);
											}
											detailJsonData[key] = value;
										}
										detailArray.push(detailJsonData);
									}
								}                            
								this.allformValues[currentLinetag] = detailArray;
							}
						}
					}
					console.log('inside final data....3611[', this.allformValues);
				}
			}
		});
	}


	validatePdfRows( detailNo:any,formNo:any,detailLen:any )
	{
		var tempCurrFormNo = "";
		var tempVlaidationRow:any = [];
		if (tempVlaidationRow.length > 0)
		{
			tempVlaidationRow.splice(0, 1);
		}
		tempVlaidationRow.push(formNo + "_" + detailLen )
			var newRow = detailLen;
			var rowData = formNo + "_" + (newRow + 1);
			if (tempVlaidationRow.length > 0) {
				let cuurentValidationData = tempVlaidationRow[0];
				var str = cuurentValidationData.split('_');
				this.validateCurrentDetail(str[0], str[1], rowData, formNo, newRow, true, true, true, false,false);
			}
			if( detailLen == (this.lineLen - 1) )
			{
				setTimeout(() => {
					console.log('Call setFocus onfirst field.....3064');
					this.setFocusOnFirstEditableFld('Detail1');
				}, 2000);
			}
	}

	showIndicator(selectedRowId:any, formNo:any, rowNo:any)
	{

        console.log("selectedRowId[",selectedRowId,"],formNo[",formNo,"],rowNo[",rowNo,"],errorRowsList[", this._extractTempletService.errorRowsList,"]");
        console.log("errorRowsList.includes[", this._extractTempletService.errorRowsList.includes(selectedRowId),"]");
        if(formNo == "1" && this._extractTempletService.errorRowsList != null && this._extractTempletService.errorRowsList.includes(selectedRowId))
        {
            console.log('inside showIndicator first form no');
        }
        if( this._extractTempletService.errorRowsList != null && this._extractTempletService.errorRowsList.includes(selectedRowId) )
		{
            //Done changes by Pravin k on 16-MAR-21 [to avoid exception in case selectedRowId element not found ] START
            console.log('inside showIndicator second form..',document.getElementById(selectedRowId));
            if(! (document.getElementById(selectedRowId)) )
            {
            console.log('inside showIndicator selectedRowId not found::');
                return;
            }
            //Done changes by Pravin k on 16-MAR-21 [to avoid exception in case selectedRowId element not found ] END
			var positionOfRow = document.getElementById(selectedRowId)?.getBoundingClientRect();
            //Done changes by Pravin k on 16-MAR-21 [to avoid exception in case selectedRowId element not found ] START
            console.log('inside showIndicator spositionOfRow::',positionOfRow);
            if(!positionOfRow)
            {
                return;
            }
            //Done changes by Pravin k on 16-MAR-21 [to avoid exception in case selectedRowId element not found ] END
			var indicator = this.renderer.createElement('div');
			var parentElem = document.getElementById('tableDetails_2');
            // Change by Pravin K on 16-MAR-21 start
            if(parentElem)
            {
                var positionOfTable = parentElem.getBoundingClientRect();
                var topPos = positionOfRow.top - positionOfTable.top + 3;
                console.log('top of position of dotss:: 3454' , topPos);
                // var table = document.getElementById('tableDetails_2').firstElementChild.nextElementSibling;
				var table = document.getElementById('tableDetails_2')?.firstElementChild?.nextElementSibling;
                this.renderer.insertBefore(parentElem, indicator, table);		
                indicator.id = 'validationIndicatorForRow_'+(rowNo)+'_'+(formNo);
                indicator.style.top = topPos + 'px';
                indicator.classList.add('indicatorForRow');
                this.detailCount = 0;
            }
            // Change by Pravin K on 16-MAR-21 end
		}
	}

	openTaxScreen(currentDetail:any, formNo:any, index:any) 
	{
		try 
		{
			if (this.cuurentValidationRow.length > 0 )
			{
				var rowData = formNo + "_" + (index + 1);
				let cuurentValidationData = this.cuurentValidationRow[0];
				var str = cuurentValidationData.split('_');
				this.validateCurrentDetail(str[0], str[1], rowData, formNo, index, false, false, null, false,true);
			}
		}
		catch (e: any) 
		{
			console.log('Exception inside openTaxScreen:::: ', e.message);
		}
	}
	createTaxDetOverLay() 
	{
		const positionStrategy = this.overlay
			.position()
			.global()
			.centerHorizontally()
			.height('500px')
			.width('1000px')
			.centerVertically();
		const overlayConfig = new OverlayConfig({
			positionStrategy,
		});
		overlayConfig.hasBackdrop = true;
		const templatePortal = new TemplatePortal(this.taxDetail, this.viewContainerRef);
		this.taxDetailOverLay = this.overlay.create(overlayConfig);
		this.taxDetailOverLay.attach(templatePortal);
	}
	closeTaxOverlay()
	{
		console.log('inside close tax click......479');
		this.taxDetailOverLay.dispose();
	}


	callItemDeafult(columnName:any, columnValue:any, formNo:any,detailNum:any) 
	{
		if (!(columnValue instanceof Object) && columnValue.trim() != this.popHelp.pophelpSelectedvalue.trim()) 
		{
		 	 this.popHelp.pophelpSelectedvalue = columnValue;
		}
		if (this.popHelp.itemChangeList.includes(columnName)) 
		{
			console.log('inside callItemDeafult...3711', columnName, columnValue);
			var paramMap:any = {};
			var paramString:any = "";
			paramMap["OBJ_NAME"] = this.compData['OBJ_NAME'];
			paramMap["ACTION"] = "ITEM_CHANGE";
			paramMap["OBJ_CTX"] = this.compData['OBJ_CTX'];
			paramMap["PAGE_CTX"] = "2";
			paramMap["EDITOR_ID"] = this.compData['EDITOR_ID'];
			paramMap["RTEURN_TYPE"] = "Json";
			paramMap["CHG_STR"] = this.popHelp.createChgStr(columnName, columnValue);
			paramMap["FIELD_NAME"] = columnName;
			paramMap["dummyInt"] = this.compData['dummyInt'];
			paramString = this._extractTempletService.getEncodedParamString(paramMap);
			var url = this._extractTempletService.getHostURL() + '/ibase/E12EditorHandlerServlet';
			this._extractTempletService.sendRequest(url, paramString, (data:any) => {
				this._extractTempletService.setLoading(false);
				var callbackResp = data.split('%%SEP%%');
				data = callbackResp[0];
				var isError = callbackResp[1].trim();
				if (!(isError == 'true')) 
				{
					console.log('inside callItemDeafult.......3727[' + data);
					this.applyDataOnCurrentForm(data,formNo,detailNum);
				}
			}
			);
		}
	}

	applyDataOnCurrentForm(values:any, formNo:any,detailNum:any) 
	{
		var details = JSON.parse(values);
		var itemChnageValues:any = {};
		try 
		{
			if (values.indexOf('Errors') != -1) 
			{
				this.checkError(values);
			}
			else 
			{
				var currentFormNoDetail = 'Detail' + formNo;

				if (details.Root[currentFormNoDetail]) 
				{
					itemChnageValues = details.Root[currentFormNoDetail];
					for (const key of Object.keys(itemChnageValues)) 
					{
						var id = this.popHelp.detailNum + '.' + (detailNum + 1) + '.' + key;
						console.log('inside applyDataOnCurrentForm id[',id);
						if (itemChnageValues[key] && (itemChnageValues[key].content || itemChnageValues[key].content == 0)) 
						{
							var value = itemChnageValues[key].content;
							this.allformValues[currentFormNoDetail][detailNum][key] = value;
							this.checkProtectAndVisbile(itemChnageValues, key, id);
						}
						else 
						{
							var value = itemChnageValues[key];
							if (value instanceof Object) 
							{
								value = "";
							}
							this.allformValues[currentFormNoDetail][detailNum][key] = value;
							this.checkProtectAndVisbile(itemChnageValues, key, id);
						}
					}
				}
			}
		}
		catch
		{
			console.log('Exception inside applyDataOnCurrentForm');
		}
		this.getMandatoryFeilds();
	}

	// Added by Pravin k on 15-JUL-20 start 
    //Comented  by Pravin K on 6-OCT-20 START
// 	openDialog( selectedText:any) 
// 	{
// 		console.log("this.tableLineData.action[", this.tableLineData.action ,"]selectedText[" ,selectedText, "]");
// 		selectedText  = selectedText.trim();
// 		//var tableLineData = {"tableColumns":this.tableColumns, "tableStart":"st", "tableEnd":"ed" } ;
// 		console.log("befor chante[", this.tableLineData ,"]");
// 		if(this.tableLineData.action=="tableStart")
// 		{
// 			this.tableLineData.tableStart = selectedText;
// 		}
// 		else if(this.tableLineData.action=="tableEnd")
// 		{
// 			this.tableLineData.tableEnd = selectedText;
// 		}
// 		else if(this.tableLineData.action=="tableHeading")
// 		{
// 			this.tableLineData.tableColumns.push({ "col": selectedText, val: "",isNull:false }) 
// 		}
// 		else if(this.tableLineData.action=="tableValue")
// 		{
// 			if(this.tableLineData.tableColumns.length)
// 			{

// 				this.tableLineData.tableColumns[this.tableLineData.tableColumns.length-1]["val"]= selectedText
// 			}
// 		}
// 		console.log("after chante[", this.tableLineData ,"]");
		
// 	    //const dialogRef = this.dialog.open(DialogContent,{data:this.tableLineData , disableClose: true, width: '500px'});
		
// 		var self = this;
		
// 	    dialogRef.afterClosed().subscribe(result => {
// 	      console.log(`Dialog result: ${result}`);
// 	      console.log("tableColumns:",self.tableColumns);
// 		  console.log("tableLineData:",self.tableLineData);
// 		  if(this.tableLineData.action=="done")
// 		  {
// 			  self.SaveOrUpdateYML();
//               self.tableLineData  = {"tableColumns":[],"tableStart":"","tableEnd":"","action":""}
// 		  }
	      
// 	    });
// 		self.tableLineData.action = "";
//    }
//Comented  by Pravin K on 6-OCT-20 END
// Added by Pravin k on 15-JUL-20 END
  
    setDialogFor(action: any)
    {
        console.log("template action --:",action)
        this.tableLineData.action = action;
        if(action == "tableStart")
        {
            this.selecTableStartTxt = "Select the area in document to mark starting of table";
        }
        else if(action == "tableEnd")
        {
            this.selecTableEndTxt = "Select the area in document to mark ending of table";
        }
        else if(action == "keyword")
        {
            this.selectKeyword = "Change Keywords";
        }
	}

    closeTableOverlay(action:any)
	{
        console.log("closeTableOverlay ::action[",action,"]tableLineData:",this.tableLineData);
        if(action=="clear")
        {
            this.tableLineData = {"tableColumns":{},"tableStart":"","tableEnd":"","action":"","keyIndex":[]}
        }  
        // var elm = document.getElementById("tableTemplateSelection"); 
        // console.log("elm:",elm);
        // if(elm)
        // {
        //     elm.style.height = "50px";
        //     elm.style.zIndex ="0";
        //     elm.style.width = "100px";
        // } 
        this.showTableMarking = false;
    }
    
    openTableOverlay()
	{
        console.log("openTableOverlay ");
        this.templateUIMode = "Edit";
        this.showTableMarking = true;
        // var elm = document.getElementById("tableTemplateSelection"); 
        // console.log("elm:",elm);
        // if(elm)
        // {
        //     // elm.style.height="calc(100% + 25px)";
        //     // elm.style.zIndex="2";
        //     // elm.style.width = "100%"
            
        // } 
	}

    onKeypressdetail1( event:any , field_name:any, field_value:any , formNo:any )
    {
        console.log("event:value[",event,"],event.target.value[",event.target.value,"],field_name[",field_name,"],field_value[",field_value,"],formNo[",formNo,"]");
        var dataObj:any={};
        //dataObj.Label = "static_"+field_name
        dataObj["Label"] = "static_"+field_name;
        dataObj["Text"] =  event.target.value;
        dataObj["labelOnFile"] = "";
        console.log("befor: JSON.stringify(obj)[", JSON.stringify(dataObj),"]");
        var isRegGenerated = this.getRegularExp(dataObj);
        console.log("after: JSON.stringify(obj)[", JSON.stringify(dataObj),"]");

        if (isRegGenerated) 
        {
            var isUpdated = this.updatePresentSelectionLog(dataObj);
            if (!isUpdated) 
            {
                this.addSelectionLogArr.push(dataObj);
            }
            //added SaveOrUpdateYML on 26-MAY-20  [To update yml after selection ]
        }
    }

    //Added by shrutika on 19-04-21 for tax form related changes.
    openPophelpFromTaxSceen( cuurentPophelData:any)
    {
       console.log('inside openPophelpFromTaxSceen.........5661');
      var currentFormData = JSON.parse(cuurentPophelData);
      var fldName = currentFormData['fldName'];
      var fldValue = currentFormData['fldValue'];
      var formNo = currentFormData['formNo'];
      var detailRowNo = currentFormData['detailRowNo'];
       console.log('inside openPophelpFromTaxSceen.........5668',fldName);
	  this.openPopHelp(fldName, fldValue, formNo, detailRowNo) 
    }

    callItemchangeFormTax( currentData:any )
    {
         var currentFormData = JSON.parse(currentData);
      var fldName = currentFormData['fldName'];
      var fldValue = currentFormData['fldValue'];
      var formNo = currentFormData['formNo'];
      var detailRowNo = currentFormData['detailRowNo'];
      this.callLocalItemChange(fldName, fldValue, formNo, detailRowNo) 

    }

    applyTaxScreen()
    {
        console.log('inside applyTaxScreen.....5679',this.cuurentValidationRow);
        if( this.cuurentValidationRow.length > 0 )
        {
            var str = this.cuurentValidationRow[0].split('_');
            console.log('inside applyTaxScreen.......26',str[0]);
            console.log('inside applyTaxScreen.......27',str[1]);
            var formNo = str[0];
            var domId  = Number( str[1]);
            var index = ( domId - 1);
            this.validateCurrentDetail(formNo, domId, this.cuurentValidationRow, formNo, index, false, false, false, false, true); 
             console.log('inside applyTaxScreen.......5700');
            this.closeTaxOverlay();
        }
    }
     //Added by shrutika on 19-04-21 for tax form related changes.
 
}
//Comented  by Pravin K on 6-OCT-20 START
// Added by Pravin k on 15-JUL-20 START
// @Component({
//   selector: 'table-template-creation',
//   templateUrl: 'table-template-creation.html',
//   styleUrls: ['./extract-template.component.css']
  
// })

	
// export class DialogContent {
	
// 	constructor(
// 		public dialogRef: MatDialogRef<DialogContent>,
// 		@Inject(MAT_DIALOG_DATA) public data: DialogData) {
// 			//dialogRef.disableClose = true;			
// 	}

// 	addNewColumn() 
// 	{
// 		var tempCol = { "col": "", val: "" ,isNull:false};
// 		this.data["tableColumns"]["push"](tempCol);
// 		console.log("this.tableColumns :",this.data);
// 	}
// 	closeDilog()
// 	{
// 		this.dialogRef.close();
// 	}
	
// 	setDialogFor(action)
// 	{
// 		console.log("template action :",action)
// 		this.data["action"] = action;
		
// 		this.closeDilog();
// 	}
// }
//Comented  by Pravin K on 6-OCT-20 END