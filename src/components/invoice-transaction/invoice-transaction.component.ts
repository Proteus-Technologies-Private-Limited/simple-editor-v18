import { Component, OnInit, Input, NgZone,EventEmitter,OnDestroy, ViewContainerRef, TemplateRef, ViewChild, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { InvoiceTransactionService } from './invoice-transaction.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { KeyValue } from "@angular/common";
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DatePipe } from '@angular/common';
import { format, parse } from 'date-fns';
import * as XLSX from 'xlsx';

import { BBPophelpComponent } from 'base-blocks';


declare var saveDocInContentLibrary:any;
declare let destroyComponent: any;

@Component({
  standalone: false,
  	selector: 'invoice-transaction',
  	templateUrl: './invoice-transaction.component.html',
  	styleUrls: ['./invoice-transaction.component.css'],
  	providers: [InvoiceTransactionService],
	encapsulation: ViewEncapsulation.None
})
export class invoiceTransactionComponent implements OnInit {
 
	@Input() data:any = {};// {'issuer': '', 'order_no': '', 'order_dt': ''};
	@Input() pluginMetadata : any;
	requiredMessage: string = 'This field is required';
	overviewReactiveForms: FormGroup;
	overViewModel: any = {};
	traceLinkData: any;
	ocrData: any;
	pdfSrc:any ;
	docDetails:any;
	showAdd = true;
	isExtractionSuccessful: boolean = false;
	showOverview: boolean = false;
	showForm: boolean = false;
	showTrace: boolean = false;
	traceLinks: any = [];

	selectedTraceTab: string = '';
	showLinkData: boolean = false;
	serviceURL:any;
	safeSrc :any;
	//Added by Pravin K on 6-MAR-20[For text selection] START
	currEvnt:any;
	lastEvnt:any;
	secondLastEvnt:any;
	textSelected:any;
	isClickOn:any;
	movedTONextField:any;
	mouseUpRef:any;
	addSelectionLogArr:any=[];
	objName!:"invoice-transaction";
	docType:any="";
	docId: any = "";
	isSelectionNotAdded:any = true;
	
	tableColumns:any = [];
	//Added by Pravin K on 6-MAR-20[For text selection] END
	systemAttributeArr: any = {};
	systemAttribute: any = {};
	overLayRefForMoreOption: OverlayRef | any;
    @ViewChild('openAttri') openAttri: TemplateRef<any> | any;
	mappingArr: any = {};
	mappingJson:any = {};
	orderData: any = "";
	currentId: any;
	currentIndex: string;
	@ViewChild('standQtyTemp') standQtyTemp: TemplateRef<any> | any;
	standQtyJson: any = {};
	overLayRefForStandQty: OverlayRef | any;
	itemCodeJObject: any = {};
	attrRecognisationObj : any = {};
	iconColorObj : any = {};
	
	popHelpFieldList:any = [];
    pophelpDataList:any = [];
	userRights: string;
	disableOverview: boolean = false;
	disableMapping: boolean = false;
	compData: any = {};
	currentPophelpJson: any = {};
	@ViewChild('popupTemp') popupTemp: TemplateRef<any> | any;
	overLayRefForItemCodeOption: OverlayRef | any;
	dataSource: any;
	filterName: string | any;
	multi_opt:string | any;
	filterValue: any;
	overlayRef: any;
	@ViewChild( 'portal' ) templatePortal: TemplateRef<any> | any;
	isBrowser: boolean | any;
	isPopHelp:boolean = true; 
	filterExprFieldName: any;
	domID: any;
	fieldName: any;
	productIdentificationJson: any = {};
	definedAttributeObj: any = {};
	//Added by vikas on 04-04-23 for processing variables
	procData : FormGroup;
	isleftSidePanelOpen:boolean = false;
    //Added by tejas on 18-04-23 for processing metrhod list
	documentType:any=""; 
	processListArray:any = [];
	procListJsonData:any;
	
	//Added by vikas on 15-05-23 for getting the response of saveType [Start]
	saveType:any = 'W';
	extractedJson:any = {};
	userInfo:any;
	dateFormat: any;
	xlsSrc: any = "";
    //Added by Tejas on 17-Aug-23 for display preview of Excel files
	excelFileData: any = [];
    headData: any = [];

	formatsToTry: any = [
		'dd-MM-yyyy',
		'dd/MM/yyyy',
		'dd MMM yyyy',
		'dd-MMM-yyyy',
		'dd-MM-yy',
		'dd/MM/yy',
		'dd.MM.yy'
	];
	pkValues: any;
	editFlag: string = 'A';
	allformValues: any = {};
	arrayOfDateFields: any = [];
	itemCodeArray: any = [];

	//Added by vikas on 15-05-23 for getting the response of saveType
  	constructor(public zone: NgZone, public invoiceTransactionService: InvoiceTransactionService, private sanitizer: DomSanitizer, private formBuilder: FormBuilder,
		private overlay: Overlay, private viewContainerRef: ViewContainerRef, private datePipe: DatePipe) {
			this.dateFormat = window['e12navigator'] ? window['e12navigator'].applDateFormat : localStorage.getItem('APPL_DATE_FORMAT');
		 }
  
	ngOnInit()
	{
        console.log('ngOnInit invoice-transaction',this.data);
		console.log("pluginMetadata---",this.pluginMetadata);
		this.invoiceTransactionService.getUserInfo().subscribe(/* happy path */ UserInfo => { 
            console.log("getUserInfo:userInfo line no 307:::::::",UserInfo); 
            this.userInfo = UserInfo;
         });
		this.overviewReactiveForms = this.formBuilder.group({
			doc_type : [{ value : this.overViewModel['doc_type'] || '', disabled : true}, Validators.required],
			ent_type : [{ value : this.overViewModel['ent_type'] || '', disabled : true}],
			ent_code : [this.overViewModel['ent_code'] || '', Validators.required],
			ent_name : [this.overViewModel['ent_name'] || '', Validators.required],
			order_type : [this.overViewModel['order_type'] || '', Validators.required],
			file_type: [{ value : this.overViewModel['file_type'] || '', disabled : true}],
			proc_mtd: [this.overViewModel['proc_mtd'] || ''],
			proc_instr: [this.overViewModel['proc_instr'] || ''],
			ai_proc_templ : [this.overViewModel['ai_proc_templ'] || ''],
			ai_proc_variables: [this.overViewModel['ai_proc_variables'] || ''],
			//Added by pranjali To  add feild in import order [Start] 08-Feb-2024
			keyword1: [this.overViewModel['keyword1'] || ''],
			keyword2: [this.overViewModel['keyword2'] || '']
			//Added by pranjali To  add feild in import order [Start] 08-Feb-2024
		});

		if (this.pluginMetadata) 
		{
			this.compData = this.pluginMetadata["compData"];
			if (this.compData) 
			{
				console.log('compData------', this.compData);
				var tmpData:any = {};
				tmpData["ACTION"] = "OBJ_RIGHTS";
				tmpData["OBJ_NAME"] = "invoice-transaction";

				var paramString = this.invoiceTransactionService.getEncodedParamString(tmpData);
				var url = this.invoiceTransactionService.getHostURL() + '/ibase/WEBITMRIARequestHandlerServlet';

				this.invoiceTransactionService.sendRequest(url, paramString, (userRightsResp:any) => {
                    		console.log('userRightsResp---in case of userRightsResp', userRightsResp);
					var callbackRespNew = userRightsResp.split('%%SEP%%');
					var isError = callbackRespNew[1].trim();
					if (!(isError == 'true')) 
					{
                        this.userRights = this.checkNull( callbackRespNew[0] );
						// this.disableOverview = this.userRights.indexOf('*') == -1 ? this.userRights.indexOf('O') == -1 : false;
						this.disableOverview = !(this.userRights.includes('*') || this.userRights.includes('C'));
						this.disableMapping = this.userRights.indexOf('*') == -1 ? this.userRights.indexOf('M') == -1 : false;
						
						var compData = this.pluginMetadata["compData"];
						if( compData )
						{
							var contentData = compData["contentData"];
							if( contentData )
							{
								var tmpData: any = {};
								tmpData["DOC_ID"] = contentData["docId"] ? contentData["docId"] : contentData["DOC_ID"];
								tmpData["FILE_TYPE"] = contentData["fileType"] ? contentData["fileType"] : contentData["FILE_TYPE"];
								tmpData["DOC_NAME"] = contentData["docName"] ? contentData["docName"] : contentData["DOC_NAME"];
								tmpData["extractedData"] = contentData["extractedData"];
								tmpData["DOC_TYPE"] = contentData["docType"] ? contentData["docType"] : contentData["DOC_TYPE"];
								tmpData["OBJ_NAME__IMP"] = contentData["objNameImp"] ? contentData["objNameImp"] : contentData["OBJ_NAME__IMP"];
								
								console.log('tempData---',tmpData);
								this.attachedCallback(tmpData);
								this.showAdd = false;
							}
						}

						this.compData = this.pluginMetadata["compData"];
						if (this.compData) 
						{
							var tmpData: any = {};
							tmpData["OBJ_NAME"] = "invoice-transaction";
							tmpData["ACTION"] = "OBJ_POPHELPINFO_ALL";
							tmpData["OBJ_TYPE"] = "";
							tmpData["dummyInt"] = this.compData["dummyInt"];
							tmpData["PKVLAUE"] = "";
							tmpData["EDIT_FLAG"] = "";
							tmpData["RTEURN_TYPE"] = "JSON";

							var paramString = this.invoiceTransactionService.getEncodedParamString(tmpData);
							var url = this.invoiceTransactionService.getHostURL() + '/ibase/RIAWizardHandlerServlet';
							this.invoiceTransactionService.sendRequest(url, paramString, (objPophelp) => {
								var callbackRespNew = objPophelp.split('%%SEP%%');
								objPophelp = callbackRespNew[0];
								var isError = callbackRespNew[1].trim();
								if (!(isError == 'true')) 
								{
									var objPophelpNew = {} = JSON.parse(objPophelp);
									if (objPophelpNew && objPophelpNew!.ROOT) 
									{
										if (objPophelpNew.ROOT.POPUP != null) 
										{
											let popHelpData = objPophelpNew.ROOT.POPUP;
											if(Array.isArray(popHelpData))
											{
												var popupLen = objPophelpNew.ROOT.POPUP.length;
												for (var i = 0; i < popupLen; i++) 
												{
													this.pophelpDataList.push(objPophelpNew.ROOT.POPUP[i]);
												}
												for (var i = 0; i < this.pophelpDataList.length; i++) 
												{
													var popHelpFldName: string = this.pophelpDataList[i]['attrib']['@FIELD_NAME'];
													this.popHelpFieldList.push(popHelpFldName);
												}
											}
											else
											{
												this.pophelpDataList.push(objPophelpNew.ROOT.POPUP);
												for (var i = 0; i < this.pophelpDataList.length; i++) 
												{
													var popHelpFldName: string = this.pophelpDataList[i]['attrib']['@FIELD_NAME'];
													this.popHelpFieldList.push(popHelpFldName);
												}
											}						
										}
									}
								}
							});
						}
                       
					}
				});
			}
		}

		//this.pdfSrc = "/ibase/DocumentViewerServlet?ACTION=GET_DOCUMENT&DOC_ID=0005020590&DOC_TYPE=pdf";
        this.setPythonServiceUrl();
		this.mappingArr['phy_attrib_1'] = ['Define Mapping', 'Improve Training'];
		this.mappingArr['phy_attrib_2'] = ['Define Mapping', 'Improve Training'];
		this.mappingArr['phy_attrib_3'] = ['Define Mapping', 'Improve Training'];
		this.mappingArr['phy_attrib_4'] = ['Define Mapping', 'Improve Training'];
		this.mappingArr['packing'] = ['Define Mapping', 'Improve Training'];

		this.attrRecognisationObj['extract_phy_attrib_1'] = 'product';
		this.attrRecognisationObj['extract_phy_attrib_2'] = 'delivery';
		this.attrRecognisationObj['extract_phy_attrib_3'] = 'strength';
		this.attrRecognisationObj['extract_phy_attrib_4'] = 'size';
		this.attrRecognisationObj['extract_packing'] = 'packing';
    }
	
	ngAfterViewInit()
	{
	 	console.log('ngAfterViewInit--------');
		
		var contentElement = document.getElementsByClassName("invoice-transaction-content");
		var contentChildElement: any = contentElement[0];
		var popupElement = document.getElementsByClassName("angPopupContent");
		var popupChildElement = popupElement[0];

		if( popupChildElement )
		{
			popupChildElement.setAttribute('style','background-color: #efefef;width: calc(100% - 80px); overflow: visible;');
			var height:any;
			height = Number(popupChildElement.clientHeight);
			var intHeight = Number(height);
			intHeight = intHeight - 90;
			var newHightStr = ''+intHeight+'px';
			
			var contentElement = document.getElementsByClassName("invoice-transaction-content");
			if( contentElement )
			{
				var element: any = contentElement[contentElement.length - 1];
				if( element )
				{
					element["style"].height = newHightStr;
				}

				var actualContentElement = document.getElementsByClassName("contentDiv");
				if( actualContentElement )
				{
					var childElement = actualContentElement[actualContentElement.length - 1];
					if( childElement )
					{
						childElement.setAttribute('style','height: calc(100% - 0px);');
					}
				}
			}

			var popupClose = document.getElementsByClassName("angPopupclose");
			if( popupClose )
			{
				var element: any = popupClose[0];
				if( element )
				{
					element.setAttribute('style','top: -8px; left: -8px;');
				}
			}
		}
		else if( contentChildElement )
		{
			var bbContentPluginElement = contentChildElement.parentElement.parentElement;
			if( bbContentPluginElement )
			{
				var name = bbContentPluginElement.getAttribute("name");
				if( name == "bbContentPlugin" )
				{
					bbContentPluginElement.setAttribute('style','position: absolute; width: 100%; height: 100%;');
				}
			}

			var dbcontentElement = contentChildElement.parentElement.parentElement.parentElement;
			if( dbcontentElement )
			{
				var className = dbcontentElement.getAttribute("class");
				if( className == "dbcontent" )
				{
					dbcontentElement.setAttribute('style','overflow: hidden !important;');
				}
			}
		}
	}
	
	save()
	{
		console.log('Inside save() this.saveType ['+this.saveType+']');
		if(this.saveType == 'G')
		{
			//Added by Jatin M on 20-07-2023 [To format the form tab table data as per the excel format provided by GSK] - START
			let csvData = this.buildCSV();
			this.invoiceTransactionService.uplodedDocumentsDetails(csvData,this.docDetails, this.documentType, 'CSV').subscribe(
			response => {
				response = response.indexOf('ERR_MSG :INVALID_DOCUMENT\n') != -1 ? response.substring('ERR_MSG :INVALID_DOCUMENT\n'.length) : response;
				this.invoiceTransactionService.checkErrorException(response, (result: any) => {
					this.invoiceTransactionService.setLoading(false);
					if(!result)
					{
						alert(response);
						//this.saveProcessData();
						this.data = {};
						this.pdfSrc="";
						this.safeSrc="";
						this.showAdd = true;
						this.zone.run(() => {
								console.log( 'view refreshed' );
						});
					}
				});
			});
			//Added by Jatin M on 20-07-2023 [To format the form tab table data as per the excel format provided by GSK] - END
		}
		else if(this.saveType == 'W' || this.checkNull(this.saveType) == '')
		{
			var element = document.getElementsByClassName("invoice-transaction-content");
			if( element )
			{
				var contentElement = document.getElementsByClassName("contentDiv");
				if( contentElement )
				{
					var childElement = contentElement[contentElement.length - 1];
					if( childElement )
					{
						childElement.setAttribute('style','height: 0px;');
					}
				}
			}
			
			var Newdata = this.data;
			var detailsTwo = Newdata.lines;
			delete Newdata.lines;
			var detailsOne = Newdata;
			var detailArrobjs:any=[];
			
			for( var i =0; i<detailsTwo.length; i++ )
			{
				var lineObj = detailsTwo[i];
				var newLineObj:any = {}
			
				for(var k in detailsOne)
				{
					if( k != "desc" && k != "issuer" && k != "currency" )
					{
						newLineObj[k] = detailsOne[k]
					}
				}
			
				for(var k in lineObj)
				{
					newLineObj[k] = lineObj[k]
				}
			
				detailArrobjs.push(newLineObj);
			}
		
			var dataXml = this.OBJtoXML({"Detail":detailArrobjs});
			dataXml = '<root>' +dataXml+'</root>';
			this.invoiceTransactionService.uplodedDocumentsDetails(dataXml,this.docDetails).subscribe(
			response => {
				response = response.indexOf('ERR_MSG :INVALID_DOCUMENT\n') != -1 ? response.substring('ERR_MSG :INVALID_DOCUMENT\n'.length) : response;
				this.invoiceTransactionService.checkErrorException(response, (result: any) => {
					console.log( 'callBack getUplodedDocumentsDetails :: result::', result );
					this.invoiceTransactionService.setLoading(false);
					if(!result)
					{
						alert(response);
						//this.saveProcessData();
						this.data = {};
						this.pdfSrc="";
						this.safeSrc="";
						this.xlsSrc="";
						this.showAdd = true;
						this.zone.run(() => {
								console.log( 'view refreshed' );
						});
					}
				});
			});
		}
		else if(this.saveType == 'R')
		{
			let detail1:any = [];
			let json  = {};
			json['order_date'] = this.data['order_dt'];
			json['order_no'] = this.data['order_no'];
			json['cust_code'] = this.data['ent_code'];
			json['cust_name'] = this.data['ent_name'];
			json['order_type'] = this.overViewModel['order_type'];
			//json['item_ser'] = 'FG06';
			detail1.push(json);
			// for(const key in this.data)
			// {
			// 	if(key != 'lines')
			// 	{
			// 		let json  = {};
			// 		json[key] = this.data[key];
			// 		detail1.push(json);
			// 	}
			// }
			this.extractedJson  = {"Root":{"Detail1":detail1,"Detail2":this.data['lines']}};
			var paramdata: any = {};
			let enterprise = this.userInfo['result']['UserInfo']['enterprise'];
			let appId = 'IMPORD';
			let objName = this.objName;
			paramdata["INPUT_DATA"] = JSON.stringify(this.extractedJson);
			var paramString = this.invoiceTransactionService.getEncodedParamString(paramdata);
			this.invoiceTransactionService.saveUsingRestAPI(paramString,enterprise,appId,objName).subscribe((response:any)=>
			{
				this.invoiceTransactionService.setLoading(false);
				this.invoiceTransactionService.checkErrorException(response, (result: any) => {
					if(!result)
					{
						var splitresponse =  response.split(',');
						let responseMessage = JSON.parse(splitresponse)
						window.alert(responseMessage.Message);
						if( this.documentType == 'Orders' || this.documentType == 'Order Email' || this.documentType == 'Order Excel')
						{
							this.saveProcessData();
						}
					}
				});
			});
		}
		else if(this.saveType == 'P')
		{
			console.log('Print the line no 473', this.compData);
			var action = "SAVE";
			var forcedSave = "false";
			var pkvalues = this.pkValues;
			// console.log("print line no 464 ",this.sorderComponent.objDetailLength);
			this.compData['NO_OF_FORMS'] = 4;
			var pageContext = "1";
			if (this.editFlag == 'E') 
			{
				action = "EDIT";
				pkvalues = pkvalues.substring(0, pkvalues.length - 1);
				pageContext = "2";
			}

			this.allformValues = {};
			this.allformValues['attribute'] =
			{
				"updateFlag": "A",
				"pkNames": "",
				"selected": "N",
				"status": "N"
			}
			this.allformValues['domID'] = 1;
			this.allformValues['order_date'] = this.data['order_dt'];
			this.allformValues['order_no'] = this.data['order_no'];
			this.allformValues['cust_code'] = this.data['ent_code'];
			this.allformValues['cust_name'] = this.data['ent_name'];
			this.allformValues['order_type'] = this.overViewModel['order_type'];
			this.allformValues['Detail2'] = [];
			for (var i = 0; i < this.data['lines'].length; i++) {
				let tempDetail: any = this.data['lines'][i];
				tempDetail['domID'] = i + 1;
				tempDetail['attribute'] =
				{
					"updateFlag": "A",
					"pkNames": "",
					"selected": "N",
					"status": "N"
				}
				let currentDetail: any = {};
				for (let detKey of Object.keys(tempDetail)) 
				{
					let reConstructedKey: any = detKey;
					if(detKey.includes(' '))
					{
						reConstructedKey = reConstructedKey.replaceAll(' ', '_').toLowerCase();
					}
					currentDetail[reConstructedKey] = tempDetail[detKey];

					let id = 'Detail2.' + tempDetail['domID'] + '.' + reConstructedKey;
					let value = currentDetail[reConstructedKey];
					if(reConstructedKey.includes('/') && reConstructedKey.split('/').length > 2)
					{
						try 
						{
							if(this.arrayOfDateFields.includes(id) && value.length > 0)
							{
								console.log('Print inside arrayOfDateFlds 1:::');
								let arrayDate = value.split('/'); // DD-MM-YY
								let validDate = arrayDate[1] + '/' + arrayDate[0] + '/' + arrayDate[2]; 
								currentDetail[reConstructedKey] = new Date(validDate);
							}
							else if (!(this.arrayOfDateFields.includes(id)) && value.length > 0) 
							{
								let arrayDate = value.split('/'); 
								let validDate = arrayDate[1] + '/' + arrayDate[0] + '/' + arrayDate[2]; 
								currentDetail[reConstructedKey] = new Date(validDate);
								this.arrayOfDateFields.push(id);
							}
						} catch (error) {
							console.log('Date in Detail2 is not valid on save() :::', error);
						}
					}
				}
				// let currentDetail = tempDetail;

				this.allformValues['Detail2'].push(currentDetail);
			}
			
			
			var finalXml = "<Root>";
			finalXml = finalXml + "<DocumentRoot>";
			finalXml = finalXml + "<description>Datawindow Root</description>";
			finalXml = finalXml + "<group0>";
			finalXml = finalXml + "<description>Group0 description</description>";
			finalXml = finalXml + "<Header0>";
			finalXml = finalXml + "<objName><![CDATA[" + this.objName + "]]></objName>";
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
			var newtempData: any = {};
			newtempData["OBJ_NAME"] = this.objName; //'invoice-transaction'
			newtempData["EDITOR_ID"] = '';
			newtempData["XML_STR"] = finalXml;
			newtempData["ACTION"] = "SAVE_EXTRACT_TEMPLATE_DATA";
			var paramString = this.invoiceTransactionService.getEncodedParamString(newtempData);
			var url = this.invoiceTransactionService.getHostURL() + '/ibase/E12EditorHandlerServlet';
			this.invoiceTransactionService.setLoading(true);
			this.invoiceTransactionService.sendRequest(url, paramString, (responase: any) => {
				console.log('Print inisde save method:: responase ', responase);
				this.invoiceTransactionService.setLoading(false);
				let tranArray = responase.split("%%SEP%%");
				if (tranArray[1] == "false") 
				{
					let tranXML = tranArray[0];
					this.pdfSrc = "";
					this.safeSrc = "";
					var errorDom = new Document();
					var parser = new DOMParser();
					errorDom = parser.parseFromString(tranXML, "text/xml");
					var tranId = errorDom.getElementsByTagName("TranID")[0].childNodes[0].nodeValue;
					var msg = errorDom.getElementsByTagName("MsgOnSave")[0].childNodes[0].nodeValue;
					var displayMsg = tranId + " - " + msg;
					this.invoiceTransactionService.confirmBox.alert('Success', displayMsg);
					document.getElementById('angPopupContainerNew').remove();
					destroyComponent(this.objName);
					destroyComponent(this.compData.targetId);
				}
			});	
		}
	}

	buildCSV()
	{
		var element = document.getElementsByClassName("invoice-transaction-content");
		if( element )
		{
			var contentElement = document.getElementsByClassName("contentDiv");
			if( contentElement )
			{
				var childElement = contentElement[contentElement.length - 1];
				if( childElement )
				{
					childElement.setAttribute('style','height: 0px;');
				}
			}
		}

		let csvData = '"Hdr/ Line","Doc Type","Sales org VKORG","Dist Channel (VTWEG)","Division (SPART)","Sold-To (KUNNR)","Ship-To (KUNWE)","Order Reason (AUGRU)","PO Number (BSTNK)","Text ID (TDID)","Text Line","Text ID2 (TDID)","Text Line","Text ID3 (TDID)","Text Line","Material","Quant","Manual Condition Typ","Condition Rate","Ship-to name 1","Ship-to name 2","Ship-to name 3","Ship-to name 4","Ship-to street 1","Ship-to street 2","Ship-to City","Ship-to Region","Ship-to Post Code","Requested Delivery Date","Payment Type (VBKD-ZTERM)","Contract Header Status ZZSTATUS","End of contract date ZZDATFIN","Date for reviewing the contract ZZDATREV","Customer answer date - ZZDATREP","Contract Return document date ZZDATRET","Contract Notification dateZZDATNOTIF","Contract Validation date ZZDATVALI","Contract Function service ZZFUNCTION","Lot Number ZZLOT","Under Lot NumberZZLOT1","Called Qty ZZCALLQTY","Consumed qty ZZCONSQTY","Duplicate flag ZZFLAGDBL","Free Goods periodZZPERIOD","Contract Valid From","Contract Valid To","Bill-To","Payer","Batch","UoM","Plant","Refernce Document","Indicator","Reference document item No (VGBEL-POSEX)","Reference credit valueKOMV-KWERT","Return GST Flag","Item Text id","Item Text","Item Text id 2","Item Text2","Item Text id 3","Item Text3","Departure country","WBS element","Customer NFE","PO Date","Manual Condition Value","PO Type","Storage Location","Item Category","Batch - Additional data B","SLED/BBD","Item Reason Code","External Customer Number","Customer Contract Number","Tax relevant classification","Text Language Indicator1","Text Language Indicator2","Text Language Indicator3"';
		var Newdata = this.data;
		var detail2Data = Newdata.lines;
		delete Newdata.lines;
		var detail1Obj = Newdata;
		let labelArr = csvData.split(",");
		if(detail1Obj)
		{
			csvData += "\n";
			for(let label of labelArr)
			{
				if(label == '"Hdr/ Line"')
					csvData += '"0",';
				else if(label == '"Doc Type"')
					csvData += '"ZECR",';
				else if(label == '"Sales org VKORG"')
					csvData += '"TH01",';
				else if(label == '"Dist Channel (VTWEG)"')
					csvData += '"'+this.checkNull(this.overViewModel['order_type'])+ '",';
				else if(label == '"Division (SPART)"')
					csvData += '"SP",';
				else if(label == '"Sold-To (KUNNR)"')
					csvData += '"'+detail1Obj.ent_code + '",';
				else if(label == '"Ship-To (KUNWE)"')	
					csvData += '"' + detail1Obj.ent_code + '",';
				else if(label == '"PO Number (BSTNK)"')	
					csvData += '"' + detail1Obj.order_no + '",';
				else if(label == '"PO Date"')	
					csvData += '"' + this.formatDate(detail1Obj.order_dt, "dd.MM.20yy") + '",';
				else if(label == '"PO Type"')	
					csvData += '"ZUPL",';
				else
					csvData += ",";
			}
			csvData = csvData.substring(0, csvData.length - 1);
		}
		if(detail2Data)
		{
			for(let detail2 of detail2Data)
			{
				console.log('07122023 detail2.stop_business:::',detail2.stop_business);
				if(detail2.stop_business !== 'Y')
				{
					csvData += "\n";
					for(let label of labelArr)
					{
						if(label == '"Hdr/ Line"')
							csvData += '"1",';
						else if(label == '"Material"')
							csvData += '"' + detail2.item_code + '",';
						else if(label == '"Quant"')
							csvData += '"' + detail2.stan_qty + '",';
						else
							csvData += ",";
					}
					csvData = csvData.substring(0, csvData.length - 1);
				}
			}
		}
		return csvData;
	}

	cancel()
	{
		console.log("In cancel");
		var element = document.getElementsByClassName("invoice-transaction-content");
		if( element )
		{
			var contentElement = document.getElementsByClassName("contentDiv");
			if( contentElement )
			{
				var childElement = contentElement[contentElement.length - 1];
				if( childElement )
				{
					childElement.setAttribute('style','height: 0px;');
				}
			}
		}
		this.data = {};
		this.pdfSrc="";
		this.safeSrc="";
		this.xlsSrc="";
		this.showAdd = true;
		this.zone.run(() => {
				console.log( 'view refreshed' );
			});
	}

	downloadExcelFile()
	{
		console.log("In downloadExcelFile 739:::::");
		var dataStr = "";
		let format = ""
		if(this.saveType == 'G')
		{
			dataStr = this.buildCSV();
			format = "CSV";
		}
		else
		{
			var element = document.getElementsByClassName("invoice-transaction-content");
			if( element )
			{
				var contentElement = document.getElementsByClassName("contentDiv");
				if( contentElement )
				{
					var childElement = contentElement[contentElement.length - 1];
					if( childElement )
					{
						childElement.setAttribute('style','height: 0px;');
					}
				}
			}
			var Newdata = this.data;
		
			var detailsTwo = Newdata.lines;
			delete Newdata.lines;
			var detailsOne = Newdata;
			var detailArrobjs:any=[];

			for( var i =0; i<detailsTwo.length; i++ )
			{
				var lineObj = detailsTwo[i];
				var newLineObj: any={}
			
				for(var k in detailsOne)
				{
					if( k != "desc" && k != "issuer" && k != "currency" )
					{
						newLineObj[k] = detailsOne[k]
					}
				}
			
				for(var k in lineObj)
				{
					newLineObj[k] = lineObj[k]		  
				}
			
				detailArrobjs.push(newLineObj);
			}	
			
			dataStr = this.OBJtoXML({"Detail":detailArrobjs});
			dataStr = '<root>' +dataStr+'</root>';
			format = "XML";
		}
		
		this.invoiceTransactionService.downloadExcelFile(dataStr,this.docDetails, this.documentType, format).subscribe(
		result => {
			if(result)
			{
				// Added by Samruddhi to save item code data in import order item info table
				if(this.itemCodeArray && this.itemCodeArray.length > 0)
				{
					let docName: any = '';
					let docId: any = '';
					if(this.docDetails && this.docDetails.DOC_NAME)
					{
						docName = this.docDetails.DOC_NAME;
					}
					if(this.docDetails && this.docDetails.DOC_ID)
					{
						docId = this.docDetails.DOC_ID;
					}
					let tmpData: any = {};
					tmpData['ACTION'] = 'SAVE_IMPORT_ORDER_ITEM_INFO';
					tmpData['DOC_ID'] = docId;
					tmpData['DOC_NAME'] = docName;
					tmpData['ITEMCODE_STR'] = JSON.stringify(this.itemCodeArray);
					let paramString = this.invoiceTransactionService.getEncodedParamString(tmpData);
					let url = this.invoiceTransactionService.getHostURL() + '/ibase/WebITMDocumentHandlerServlet';
					this.invoiceTransactionService.sendRequest(url, paramString, (response) => 
					{
						console.log( 'Print response:::::', response );
					});
				}
				var filePath = result;
				var link = document.createElement("a");
				//link.download = name;
				link.href = filePath+"";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				alert("Excel file downloaded successfully.");
				this.data = {};
				this.pdfSrc="";
				this.safeSrc="";
				this.xlsSrc="";
				this.showAdd = true;
				this.zone.run(() => {
					console.log( 'view refreshed' );
				});			
			}
		});
	}
   
	OBJtoXML(obj: any) 
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
           		typeof obj[prop] == 'object' ? xml += this.OBJtoXML(new Object(obj[prop])) : xml += '<![CDATA['+ obj[prop] +']]>';
           		xml += '</' + prop + '>';
       		}
   		}
   		var xml = xml.replace(/<\/?[0-9]{1,}>/g, '');
   		return xml;
	}
   
  	loadComplete(pdf: PDFDocumentProxy)  
	{
	  	console.log("no of pages loaded pdf.numPages[" +pdf.numPages+ "]");
	}

	onError()
	{
		console.log("Error while pdf loading");
	}
	
	addContent()
	{
        //console.log('getPluginMetadata', this.contentSandbox.contentConfig);
        //var contentConfig = {"objName":"invoice-transaction","title":"Orders"};
		var contentConfig = {"objName":"invoice-transaction","title":"Document Type"};
        saveDocInContentLibrary( this, 'attachedCallback', contentConfig );
    }
	
	attachedCallbackOld( data : any)
	{
        console.log( 'attachedCallback called', data );
        if(data["DOC_ID"])
        {
			var element = document.getElementsByClassName("invoice-transaction-content");
			if( element )
			{
				var contentElement = document.getElementsByClassName("contentDiv");
				if( contentElement )
				{
					var childElement = contentElement[contentElement.length - 1];
					if( childElement )
					{
						childElement.setAttribute('style','height: calc(100% - 0px);');
					}
				}
			}
			var self = this;
	        var docId = data["DOC_ID"];
	       // this.docType = data["FILE_TYPE"];
	        var docType = data["FILE_TYPE"].toLowerCase();
	        this.docType = docType;
	        this.pdfSrc="";
	        this.safeSrc ="";
			this.xlsSrc="";
	        	        
	        console.log( 'this.pdfSrc', this.pdfSrc );
	       
        	// 23-mar
	       /*if(data["extractedData"])
	       {
	        	self.data = {};
				self.data = JSON.parse(data['extractedData']);
				console.log( 'line add self.data ', self.data  );
				var strLines =  self.data.lines ;
				console.log( 'line add strLines', strLines );
				strLines=strLines.replace(/'/g,'"');
    			var lines = JSON.parse(strLines);
				self.data.lines = lines;
				
				var jsonData = self.data;
				console.log( 'line add this jsonData', jsonData );
	        	// 23-mar
		        
	        	if(this.docType=="pdf")
		        {
		        	this.pdfSrc = "/ibase/DocumentViewerServlet?ACTION=GET_DOCUMENT&DOC_ID="+docId+"&DOC_TYPE=pdf";
		        }
		       	else
		       	{
		       		var src = "/ibase/DocumentViewerServlet?ACTION=GET_DOCUMENT&DOC_ID="+docId+"&DOC_TYPE=TXT";
		       		this.safeSrc =  this.sanitizer.bypassSecurityTrustResourceUrl(src);
    				
		       	}
		       	
		       	 if(jsonData)
		        {
		        	this.docDetails = jsonData;
		        }
		        this.showAdd = false;
	        	if(this.docType=="pdf")
		        {
		        	this.pdfSrc = "/ibase/DocumentViewerServlet?ACTION=GET_DOCUMENT&DOC_ID="+docId+"&DOC_TYPE=pdf";
		        }
		       	else
		       	{
		       		var src = "/ibase/DocumentViewerServlet?ACTION=GET_DOCUMENT&DOC_ID="+docId+"&DOC_TYPE=TXT";
		       		this.safeSrc =  this.sanitizer.bypassSecurityTrustResourceUrl(src);
    				
		       	}
		       	console.log("safeSrc:[",this.safeSrc,"],pdfSrc["+this.pdfSrc+"],this.docType["+ this.docType+ "]");
    			console.log( 'self.data:',self.data);
    			return;
	       }*/
       	 // tbr 23-mar end */
	       
	        this.invoiceTransactionService.getUplodedDocumentsDetails(docId).subscribe(
	        result => {
		        console.log( 'callBack getUplodedDocumentsDetails :: result', result );
		     /*   var strData = result["_body"];
		        console.log( 'strData', result["_body"] );*/
		        var jsonData = JSON.parse(result);
				console.log( 'jsonData', jsonData );
				console.log( 'docId', docId );
				jsonData["DOC_ID"] = docId;
				console.log( 'jsonData', jsonData );
		        if(jsonData['EXTRACTED_DATA'])
		        {
					this.getPythonServiceUrl( function(url: any) {
						if(url)
						{
							self.data = {};
							self.data = JSON.parse(jsonData['EXTRACTED_DATA']);
							var strLines =  self.data.lines ;
							if(strLines)
							{
								strLines=strLines.toString().replace(/'/g,'"');
								var lines = JSON.parse(strLines);
								var newLines: any=[];

								for(var i =0;i<lines.length ;i++)
								{
									var lineObj = lines[i];
									var key ='';
									if(lineObj.description)
									{
										key =lineObj.description;
									}
									else if(lineObj.Produc)
									{
										key =lineObj.Produc;
									}	

									var val = self.getItemcode(lineObj,function(lineObjn:any,val:string){
									
										var newObj: any={};
										if(val)
										{
											newObj["item_code"] = val;							
										}
										else
										{
											newObj["item_code"] = "";	
										}
										
										for(var k in lineObjn)
										{
											newObj[k] = lineObjn[k];
										}
										newLines.push(newObj);
									});
									
								}
								self.data.lines = newLines;
							}
						}
					});

					
		        }
		        else
		        {
		        	console.log( 'Extracted data not found .');
		        }
		         
		        if(jsonData)
		        {
		        	this.docDetails = jsonData;
		        }
		        this.showAdd = false;
	        	// if(docType=="pdf" || docType=="PDF")
	        	if(docType.trim() == "pdf")
		        {
		        	this.pdfSrc = "/ibase/DocumentViewerServlet?ACTION=GET_DOCUMENT&DOC_ID="+docId+"&DOC_TYPE=pdf";
		        }
				else if(docType.trim() == "xls" || docType.trim() == "xlsx" || docType.trim() == "docx")
				{
					this.xlsSrc= window.location.origin + "/ibase/DocumentViewerServlet?ACTION=GET_DOCUMENT&DOC_ID=" + docId + "&DOC_TYPE=" + docType;
					this.loadExcelData(this.xlsSrc);
				}
		       	else
		       	{
		       		// var src = "/ibase/DocumentViewerServlet?ACTION=GET_DOCUMENT&DOC_ID="+docId+"&DOC_TYPE=TXT";
					let src = "/ibase/DocumentViewerServlet?ACTION=GET_DOCUMENT&DOC_ID="+docId+"&DOC_TYPE="+docType;
		       		this.safeSrc =  this.sanitizer.bypassSecurityTrustResourceUrl(src);
		       		console.log("this.safeSrc:",this.safeSrc);
				}
				console.log("safeSrc:[",this.safeSrc,"],pdfSrc["+this.pdfSrc+"],this.docType["+ this.docType+ "]");
    			console.log( 'self.data:',self.data);
	        });
        }
    }
    
    //Changed by Nikhil on 05-12-2022 for item code and description
    attachedCallback(data:any) 
	{
		console.log('attachedCallback called', data);
        if(data["DOC_ID"])
        {
			var element = document.getElementsByClassName("invoice-transaction-content");
			if( element )
			{
				var contentElement = document.getElementsByClassName("contentDiv");
				if( contentElement )
				{
					var childElement = contentElement[contentElement.length - 1];
					if( childElement )
					{
						childElement.setAttribute('style','height: calc(100% - 0px);');
					}
				}
			}
			var self = this;
			var extractedData;
	        var docId = data["DOC_ID"];
			this.objName = data["OBJ_NAME__IMP"];
			this.docId = docId;
	       // this.docType = data["FILE_TYPE"];
	        var docType = data["FILE_TYPE"].toLowerCase();
	        this.docType = docType;
			this.documentType = data["DOC_TYPE"];
	        this.pdfSrc="";
	        this.safeSrc ="";
			this.xlsSrc="";
			//Added by Jatin M to reinitialize global variable when the document is changed - START
			this.systemAttributeArr = {};
			this.systemAttribute = {};
			this.mappingJson = {};
			this.orderData = "";
			this.itemCodeJObject = {};
			this.iconColorObj = {};
	        //Added by Jatin M to reinitialize global variable when the document is changed - END        
	        console.log( 'this.pdfSrc', this.pdfSrc );
	        var overviewData = {};
	        this.invoiceTransactionService.getUplodedDocumentsDetails(docId).subscribe(
	        result => {
		        console.log( 'callBack getUplodedDocumentsDetails 415:: result', result );
		        var jsonData = JSON.parse(result);
			console.log( 'jsonData', jsonData );
			console.log( 'docId', docId );
			jsonData["DOC_ID"] = docId;
			console.log( 'jsonData EXTRACTED_DATA', jsonData['EXTRACTED_DATA'] );
			this.overViewModel = {};
			//Added by Tejas s on 12-june-2023...[to store overviewData and extractedData saperately]..start
			if(jsonData['OVERVIEW_DATA'])
			{
                overviewData =  JSON.parse(jsonData['OVERVIEW_DATA']);
				this.updateOverviewModel(overviewData);
				this.bindValueToReactiveForms(this.overViewModel)
			}
			//Added by Tejas s on 12-june-2023...[to store overviewData and extractedData saperately]..end
		        if(jsonData['EXTRACTED_DATA'])
		        {
					self.data = {};
					
					self.data = JSON.parse(jsonData['EXTRACTED_DATA']);
					if(self.data.order_dt)
					{
						self.data['order_dt'] = this.formatDate(self.data['order_dt']);
					}
					//Added by vikas on 15-05-23 for getting the response of saveType [Start]
					this.documentType = data["DOC_TYPE"];
					this.getDocTypeDetails();
					//Added by vikas on 15-05-23 for getting the response of saveType [End]
					var strLines =  self.data.lines ;
					
					if(strLines)
					{
						this.showOverview = false;
						this.showForm = true;
						this.showTrace = false;
						this.isExtractionSuccessful = true;
						
						extractedData = self.data; //JSON.parse(jsonData['EXTRACTED_DATA']); 
						console.log('extractedData', extractedData);
						var lines = strLines;
						for (var i = 1; i < lines; i++) 
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
								}
							}
						}
					}
					else
					{
						this.showOverview = true;
						//this.loadOverviewData();
						this.showForm = false;
						this.showTrace = false;
						this.isExtractionSuccessful = false;
					}
					console.log('setting extracted template data');
					this.updateOverviewModel(self.data);
					// self.data = {};
					// self.data = JSON.parse(jsonData['EXTRACTED_DATA']);
					var strLines = self.data.lines;
					var lines:any = [];
					var lineLen:any = 0;
					if(strLines)
					{
						lines = strLines;
					}

					var newLines:any = [];
					lineLen = lines.length;

					var objData = self.data.itemCodeList
					console.log('Print objData::',objData);
					for (var i = 0;  i < lineLen ; i++){
						lines[i]["line_indx"] = i+1; 
						lines[i]["dom_id"] = i+1; 
						//NEW START -6-JAN-21   
						var lineObj = lines[i];
						var key = lineObj.descr;
						var value:any ="";
						var newObj:any = {};
						if(objData)
						{
							if(objData[key]) 
							{
								console.log('Print the value line no 1702',value);
								value = objData[key];
								console.log('Print the value 1705',value);
							}
						}
						if (value) 
						{
							newObj["item_code"] = value;
						}
						else 
						{
							console.log('Print the value line no 1715');
							newObj["item_code"] = "";
						}
						for (var k in lineObj) 
						{
							newObj[k] = lineObj[k];
						}
						newLines.push(newObj);
						console.log('newObj getAllItemCode callback', JSON.stringify(newObj));

						
					}
					console.log('attached callback Print lines after newLines',newLines);
					self.data.lines = newLines;
					console.log('attached callback Print lines after line self.data.lines',self.data.lines);

				}
				else 
				{
					this.showOverview = true;
					//this.loadOverviewData();
					this.showForm = false;
					this.showTrace = false;
					this.isExtractionSuccessful = false;
				}

				if (jsonData) 
				{
					this.docDetails = jsonData;
				}
				this.showAdd = false;
				
				if(this.docType && this.docType.trim().toLowerCase() == "pdf") 
				{
					this.pdfSrc = "/ibase/DocumentViewerServlet?ACTION=GET_DOCUMENT&DOC_ID=" + docId + "&DOC_TYPE=pdf";
				}
				// else if(this.docType.trim() == "xls" || this.docType.trim() == "xlsx" || this.docType.trim() == "docx")
				else if(this.docType && (this.docType.trim().toLowerCase() == "csv" || this.docType.trim().toLowerCase() == "xls" || this.docType.trim().toLowerCase() == "xlsx") )
				{
					//this.xlsSrc= window.location.origin + "/ibase/DocumentViewerServlet?ACTION=GET_DOCUMENT&DOC_ID=" + docId + "&DOC_TYPE=" + this.docType;
					this.xlsSrc = "/ibase/DocumentViewerServlet?ACTION=GET_DOCUMENT&DOC_ID=" + docId + "&DOC_TYPE=" + this.docType;
                    this.loadExcelData(this.xlsSrc);
				}
				else 
				{
					// var src = "/ibase/DocumentViewerServlet?ACTION=GET_DOCUMENT&DOC_ID=" + docId + "&DOC_TYPE=TXT";
					let src = "/ibase/DocumentViewerServlet?ACTION=GET_DOCUMENT&DOC_ID=" + docId + "&DOC_TYPE="+this.docType;
					this.safeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(src);
					console.log("this.safeSrc:", this.safeSrc);
				}

			});
			
			//Added by Tejas S on 18-May-23 for getting Process method List...Start
			this.invoiceTransactionService.getProcMethodList(this.documentType).subscribe(
				result => 
				{
					console.log( 'callBack getProcMethodList :: result', result );
				    // this.procListJsonData = JSON.parse(result);
					let tempProcJsonData = JSON.parse(result);
					this.procListJsonData = tempProcJsonData.map(obj => {
						const key = Object.keys(obj)[0]; // Extract key
						const value = obj[key];          // Extract value
						return { key, value };
					});
					console.log( 'Print procListJsonData 1246::::::', this.procListJsonData );
				});
			//Added by Tejas S on 18-May-23 for getting Process method List...Start
		}
	}

	bindValueToReactiveForms(overViewModel)
	{
		try 
		{
			for(const key of Object.keys(this.overviewReactiveForms.controls))
			{
				if(overViewModel.hasOwnProperty(key) )
				{
					this.overviewReactiveForms.controls[key].setValue(this.checkNull( overViewModel[key] ));
				}
			}
			if(overViewModel['ai_proc_variables'] && overViewModel['ai_proc_variables']['Details'])
			{
				var jsonArr: any = overViewModel['ai_proc_variables']['Details'];
				for(const key of Object.keys(this.procData.controls))
				{	
					for(var i = 0; i < jsonArr.length; i++)
					{
						var jsonObj: any = jsonArr[i];
						if(jsonObj.hasOwnProperty(key))
						{
							this.procData.controls[key].setValue(jsonObj['default_value']);
							this.procData.controls[key].setValidators(jsonObj['required'] == 'true' ? Validators.required : Validators.nullValidator);
						}
					}
				}
			}
		}
		catch (error) 
		{
			console.log('Exception in bindValueToReactiveForms::',error);
		}
	}
    
    getItemcode(lineObj : any,calbck:any)
    {
		var description = lineObj.description;
		var URL=this.serviceURL+"?description="+description;
		
		this.invoiceTransactionService.getItemCode(URL).subscribe(
			result => {
				console.log("invoiceTransactionService:",result);
				var itemCode = "";
				if(result)
				{
					itemCode = result;
				}
				calbck(lineObj,itemCode);
			});
    }
	
	getPythonServiceUrl( callBack : any)
 	{
		var self = this;
 		this.invoiceTransactionService.getPythonServiceConfiguration().subscribe(
	    result => {
			console.log( 'callBack getPythonServiceConfiguration :: result', result );
		    //console.log(result['_body']);
		    if(result)
		    {
				var config = result;
			    console.log("config[" +config+ "]")
			   					    
				if(config)
				{
					self.serviceURL = config;
					if( callBack )
					{
						callBack(config);
					}
				}
			}
			console.log('self.serviceURL...',self.serviceURL);
			console.log('this.serviceURL...',this.serviceURL);
		});
	}
	
 	setPythonServiceUrl( )
 	{
		var self = this;
 		this.invoiceTransactionService.getPythonServiceConfiguration().subscribe(
	    result => {
			console.log( ' callBack setPythonServiceConfiguration :: result', result );
		    //console.log(result['_body']);
		    if(result)
		    {
				var config = result;
			    console.log("config[" +config+ "]")
			   					    
				if(config)
				{
					self.serviceURL = config;
				}
			}
			console.log('self.serviceURL',self.serviceURL);
			console.log('this.serviceURL',this.serviceURL);
		});
	}
		//Added by Pravin K on 6-MAR-20[For text selection] START
		SaveOrUpdateYML()
		{
			console.log("this.addSelectionLogArr : ",this.addSelectionLogArr);
			console.log(" this.docDetails : ", this.docDetails);
	
			var fileName = "";
			if(this.docDetails)
			{
				if(this.docDetails['DOC_NAME'])
				{
					fileName = this.docDetails['DOC_NAME'];
					var ind = fileName.indexOf(' ');
					if(ind== -1)
					{
						ind = fileName.lastIndexOf('.');
					}
					
					fileName = fileName.substring(0,ind);
				}
			}
			var lineDetails =this.getLinesDetails();
			if(this.addSelectionLogArr.length>0)
			{
				var data: any={"fileName":fileName,"issuer":fileName,"keywords":fileName,"fields":this.addSelectionLogArr};
				if(lineDetails)
				{
					data["lines"] = lineDetails;
				}
				console.log("data:",data);
			
				
				 this.invoiceTransactionService.saveYmlTemolate(JSON.stringify(data)).subscribe( (data: any) =>{
	
					console.log("invoiceTransactionService::result data",data);
					var result=""; 
				    if(data['status']==200)
					{
						result = "YML updated successfuly";
					}
					else
					{
						result = "YML updated failed";
					}
					alert(result);
				}); 
			}
			else
			{
				alert("There is no selection to update.");
			}
			 console.log("this.tableColumns :",this.tableColumns);
		}
		//for text selection START 
		addTextSelection()
		{
			console.log("AddSelectionEvent() elementId=pdf-viewer-editor ");
			
			var element: any =  document.getElementById("pdf-viewer-editor");
			console.log("pdf element : ",element);
			var self = this;
			var elm = null;
			this.mouseUpRef = function()
			{
				
				var currEvnt = this.currEvnt;
				var lastEvnt = this.lastEvnt;
				var secondLastEvnt = this.secondLastEvnt;
					
				currEvnt="click";
				
				var selectedText = self.getSelectedText();
				if(selectedText)
				{
					console.log("lastEvnt[" +lastEvnt+ "],secondLastEvnt[" +secondLastEvnt+"]");//pa 20
					this.textSelected = true;
	
					console.log("clickSelection ::isClickOn ",self.isClickOn);
					console.log("clickSelection ::moveToNext ",self.movedTONextField );
					if(this.isClickOn)
					{
						//this.selectionLogs(true);
						//call logic for doubleclick
					}
					
					if(lastEvnt == "dblClick"||(lastEvnt=="click"  && secondLastEvnt=="dblClick"))
					{
						// Replace current value of the field.
						if(self.movedTONextField)
						{
							console.log("clickSelection 1 ");
							self.callEvent("TEXT_SELECT",selectedText);
						}
						else  // to set first value to the field //replace the value of textBox
						{
							console.log("clickSelection 3 ");
							self.callEvent("TEXT_RESELECT",selectedText);
						}
						self.movedTONextField = false;
					}
					else // to set first value to the field //first dcSelection
					{
						// console.log("new fild text --1 "+selectedText); 
						console.log("clickSelection 2 ");//pa 20
						self.callEvent("TEXT_SELECT",selectedText);
						self.movedTONextField = false;
					}
					//to check this if first click if isClickOn is true then ,
					//this is second click or sengle click select
					if(! self.isClickOn)
					{
						self.textSelected = false;
					}
					//if last event is click then change isClickOn to  false;
					if(lastEvnt == "click")
					{
						self.isClickOn = false;
					}
					currEvnt="dblClick";
				}
				else    //go to next lield to set text
				{
					self.isClickOn = true;
					window.setTimeout(()=>{
						// if(! this.textSelected)
						if(! self.textSelected)
						{
							console.log("lastEvnt ["+lastEvnt+"]"); 
							if(lastEvnt=="dblClick")
							{
								console.log("move to next .......... ");
								self.callEvent("TEXT_DESELECT","move to next ..........");
							}
							self.movedTONextField = true;
							self.isClickOn = false;
						}
						self.textSelected = false;
					},400);
				}
				//console.log("C : " +currEvnt+ ", L : " +lastEvnt+ ", SL : "+secondLastEvnt);
				self.secondLastEvnt = lastEvnt;
				self.lastEvnt = currEvnt;
			}
			//};
			
			if(this.docType.trim()=="pdf")
			{
				element.onmouseup = this.mouseUpRef;
			}
			else
			{
				var elmCont = (element["contentWindow"] || element["contentDocument"]);
				elmCont.document.onmouseup = this.mouseUpRef;
			}
			this.setKeyNavigation()
		}
		//23-mar-start
		setKeyNavigation()
		{
			console.log("setKeyNavigation ...");
			var element =  document.getElementById("tableDetails");
			console.log("setKeyNavigation :: element:",element);
			
			if(element)
			{
				var self = this;
				element.onkeydown = function(evnt:KeyboardEvent) 
				{
					evnt = evnt || <any>window["event"];
					switch (evnt.keyCode) {
						/*case 37:
							self.leftArrowPressed(evnt);
							break;
						case 39:
							self.rightArrowPressed(evnt);
							break;*/
						case 38:
							self.upArrowPressed(evnt);
							break;
						case 40:
							self.downArrowPressed(evnt);
							break;
					}
				};
			}
		}
		
		upArrowPressed(evnt: any)
		{
			var targetElm = evnt.target;
			console.log("Move to upArrowPressed :",targetElm);
			if(targetElm)
			{
				var id = targetElm.id;
				var start = "detail.2.";
				if( id.startsWith(start) )
				{
					var idWithCount = id.replace(start,"");
					var count = idWithCount.substring(0,idWithCount.indexOf("."));
					console.log("count[",count,"]");
					count--;
	
					var onlyId = idWithCount.substring(idWithCount.indexOf(".")+1);
					var newId =  start+count+'.'+onlyId;console.log("Move to newId:",newId);
					var element =  document.getElementById(newId);
					if(element)
					{
						element.focus()
					}
				}
			}
		}
		downArrowPressed(evnt: any)
		{
			var targetElm = evnt.target;
			console.log("Move to downArrowPressed:",targetElm);
			if(targetElm)
			{
				var id = targetElm.id;
				var start = "detail.2.";
				if( id.startsWith(start) )
				{
					var idWithCount = id.replace(start,"");
					var count = idWithCount.substring(0,idWithCount.indexOf("."));
					count = Number(count);
					count++;
	
					var onlyId = idWithCount.substring(idWithCount.indexOf(".")+1);
					var newId =  start+count+'.'+onlyId;
				
					console.log("Move to newId:",newId);	
					var element =  document.getElementById(newId);
					if(element)
					{
						element.focus()
					}
				}
			}
		}
		
		leftArrowPressed(evnt: any)
		{
			var targetElm = evnt.target;
			console.log("Move to left text box:",targetElm);
			if(targetElm)
			{
				var id = targetElm.id;
				if( id.startsWith("detail.2.") )
				{
					var leftElm = targetElm.previousElementSibling; //nextElementSibling
					console.log("Move to left lefElm:",leftElm);
					if(leftElm)
					{
						leftElm.focus();
					}
				}
			
			}
			
		}
		
		rightArrowPressed(evnt: any)
		{
			var targetElm = evnt.target;
			console.log("Move to righttext box:",targetElm);
			if(targetElm)
			{
				var id = targetElm.id;
				if( id.startsWith("detail.2.") )
				{
					var rgtElm = targetElm.nextElementSibling; //nextElementSibling
					console.log("Move to right rgtElm:",rgtElm);
					if(rgtElm)
					{
						rgtElm.focus();
					}
				}
			
			}
			
		}
		
		//23-mar-end
	
		callEvent(eventType: any, selectedText: any)
		{
			console.log("eventType[" +eventType+ "],selectedText[" +selectedText+ "]this.docType[" +this.docType+ "]");
					
			/* this will set selected value to priviously selected text box 	STRT*/		
			console.log(" window.selection[", window["selectionLogs"] ,"]");
			if(window["selectionLogs"] && window["selectionLogs"]["selectedTextboxId"])
			{
				var id = window["selectionLogs"]["selectedTextboxId"];
				var elment: any = document.getElementById(id);
				var selectedTxt = this.getSelectedText();
				console.log("selectedTxt : ",selectedTxt);
				if(elment)
				{
					elment["value"] = selectedTxt;
					elment.dispatchEvent(new Event('input', { bubbles: true }))
				}
			}
			/* this will set selected value to priviously selected text box 	END*/
			if(this.docType.trim()=="pdf")
			{
				this.selectionLogs(true);
			}
		}
		
		getSelectedText() 
		{
			var selectedText='';
			if(this.docType.trim()=="pdf")
			{
				if (window.getSelection) {
					return  window.getSelection()!.toString();
				} else if (document as any["selection"]) {
					return( document as any)["selection"].createRange().text;
				}
				return '';
			}
			else
			{
				var iframe= document.getElementById('pdf-viewer-editor');
				var idoc= iframe as any["contentDocument"] || iframe as any["contentWindow"]["document"];
				if(idoc.getSelection().toString())
				{
					return idoc.getSelection().toString();
				}
			}
			return '';
		}
		 
		selectionLogs(isDoubleClickSelection: any)
		{
			var objName = this.objName ;  //"misc_voucher";
			var documentType = this.docType; // "Invoice";
			var self = this;
			console.log("selectionLogs - ",window["processSelection"]);
			window["processSelection"].getLabelForSelection(isDoubleClickSelection, function(data: any){
				
				console.log("getLabelForSelection result details :", data );
				
				var isRegGenerated = self.getRegularExp(data);
				
				if(isRegGenerated)
				{
					var isUpdated = self.updatePresentSelectionLog(data);
					if(! isUpdated)
					{
						self.addSelectionLogArr.push(data);
						//added SaveOrUpdateYML on 26-MAY-20  [To update yml after selection ]
						self.SaveOrUpdateYML();
					}
				}
				
				console.log("self.addSelectionLogArr", self.addSelectionLogArr ,"]");
				console.log("this.data", self.data ,"]");
			});
		}
		
		getRegularExp(dataObj:any)
		{   
			console.log("getRegularExp(cb)clb [", dataObj ,"]");
			if(dataObj)
			{
				var lbl = this.getKeyField();
				if(lbl)
				{
					var regularExp = dataObj.Label;
					var endChar = "";
					var endChar = regularExp.endsWith(".")?'.':':';
					
					regularExp = regularExp.trim();
					regularExp = regularExp.replace(/\s+/g,' ');
					
					var ExpLbl = regularExp.replace(endChar,'');
					var lblInFile =  ExpLbl;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
					console.log("ExpLbl[", ExpLbl,"]");
					ExpLbl = ExpLbl.trim();
					ExpLbl = ExpLbl.replace(/\s+/g,'_');
									
					if(ExpLbl.endsWith("."))
					{
						ExpLbl = ExpLbl.replace('.','');
					}
					if(ExpLbl)
					{
						var tempExpLbl = ExpLbl.toLowerCase();
						if(tempExpLbl.endsWith("date"))
						{
							ExpLbl = ExpLbl+'_';
						}
					}
					
					console.log("getRegularExp::lbl [", regularExp ,"]");
					if(regularExp.endsWith(endChar))
					{
						var all_text_val = dataObj.all_text_val;
						
						var valExp = "(\\S+)";
						if(all_text_val.indexOf(" ")!= -1)
						{
							valExp = "([\\S \\S]+)";
						}
						var allExpr = "\\s*"+endChar+"\\s*"+valExp;
						regularExp = regularExp.replace(endChar, allExpr);
						
						dataObj["regularExp"] = regularExp;
						console.log("getLabelForSelection(cb)clb  window.selection[", window["selectionLogs"] ,"]");
									
						dataObj["regularExpLabel"] =  lbl;
						dataObj["labelOnFile"] =  lblInFile;
						console.log("dataObj[", dataObj,"]");
					}
					return true; 
				}
			}
			console.log("no label find to set regular exp ");
			return false; 
		}
		
		getKeyField()
		{
			var lbl: any = "";
			console.log("getKeyField window.selectionLogs : ",window["selectionLogs"]);
			if(window["selectionLogs"] && window["selectionLogs"]["selectedTextboxId"])
			{
				var id = window["selectionLogs"]["selectedTextboxId"];
				var elment = document.getElementById(id);
				if(elment)
				{
					if(elment.getAttribute("label"))
					{
						lbl = elment.getAttribute("label");
					}
				}
			}
			return lbl;
		}
		
		updatePresentSelectionLog(data: any)
		{
			var isUpdated = false;
			var key = data.regularExpLabel
			key = key.trim();
			
			var length = this.addSelectionLogArr.length;
			for(var i=0; i<length; i++)
			{
				var details = this.addSelectionLogArr[i];
				var RegLbl = details["regularExpLabel"];
				RegLbl = RegLbl.trim();
				if(key===RegLbl)
				{
					details["Text"] = data["Text"];
					details["all_text"] = data["all_text"];
					details["all_text_val"] = data["all_text_val"];
					details["regularExp"] = data["regularExp"];
					details["Label"] = data["Label"];
					details["LabelPosition"] = data["LabelPosition"];
					
					isUpdated = true;
				}
				console.log("updatePresentSelectionLog :: RegLbl[",RegLbl,"]details:",details,":",isUpdated);
			}
			console.log("updatePresentSelectionLog :: key[",key,"]isUpdated:"+isUpdated);
			return isUpdated;
		}
	
		setSelectedText(id: any)
		{
			console.log("setSelectedTest::id[" +id+"]");
			if(! window["selectionLogs"])
			{
				window["selectionLogs"]={};
			}
        // Added by Pravin k on 6-jul-20 start
        if(window["selectionLogs"]["selectedTextboxId"])
        {
	        var prevSerlctedTextBox = document.getElementById(window["selectionLogs"]["selectedTextboxId"]);
	       prevSerlctedTextBox!.style.backgroundColor = "";
        }
        
			window["selectionLogs"]["selectedTextboxId"] = id; 
        this.showSelectionOnPFD(id);
        // Added by Pravin k on 6-jul-20 end
        
		}
    // Added by Pravin k on 6-jul-20 start
    
    
    showSelectionOnPFD(selectedDomId: any) {
      
    var serlctedTextBox: any = document.getElementById(selectedDomId);
    
    serlctedTextBox!.style.backgroundColor = "rgba(244, 232, 207, 1)";
    var serlctedTextBoxValue =  serlctedTextBox["value"];
    
    console.log("serlctedTextBoxValue:",serlctedTextBoxValue);
    if(serlctedTextBoxValue.length > 20)
    {
        serlctedTextBoxValue = serlctedTextBoxValue.substring(0, serlctedTextBoxValue.length-10);
    }
    else if(serlctedTextBoxValue.length < 20)
    {
        if(serlctedTextBoxValue.length > 10)
        {
            serlctedTextBoxValue = serlctedTextBoxValue.substring(0,10);
        }
        else
        {
            serlctedTextBoxValue = serlctedTextBoxValue;
        }
    }
    var elms = document.getElementsByClassName("textLayer");
    
    var len = elms.length;
    if(len)
    {
      var childs: any = elms[0].children;
      var chLin = childs.length;
      if(chLin)
      {
        for(var i=0 ; i< chLin; i++ )
        {
          var str = childs[i].innerHTML		
          // if(str.includes(serlctedTextBoxValue) || serlctedTextBoxValue.includes(str))
		  if(str.includes(serlctedTextBoxValue) && str.length > 0)
          {
            if ((document as any)["selection"]) {
              var range = (document as any).body["createTextRange"]();
              range.moveToElementText(childs[i]);
              range.select();
            } 
            else if (window.getSelection) {
              console.log("................",childs[i]);
              let  range:any = document.createRange();
              range.selectNode(childs[i]);
              window.getSelection()?.removeAllRanges();
              childs[i].setAttribute("tabindex", "1");
              childs[i]["focus"]( {preventScroll:true});
              window.getSelection()?.addRange(range);
            }
          }
        }
      }
     }
   }
    // Added by Pravin k on 6-jul-20 end
	  
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
			if(this.docType.trim()=="pdf")
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
				console.log("Exception while Removing event",ex);
			}
			console.log("selection event is removed .element::",element );
		}
	
		removeHorizontalScrollOfPDFViewer()
		{
			var elm = document.getElementsByClassName("ng2-pdf-viewer-container");
			if(elm[0])
			{
				elm[0].setAttribute("style","overflow: inherit");
			}
		}
		
		addNewColumn()
		{
		   var tempCol={"col":"",val:""};
		   this.tableColumns.push(tempCol);
		   console.log("this.tableColumns :",this.tableColumns);
		   //this.createRegex();
		}
		getLinesDetails()
		{
			var lineSdetails: any={};
			var tableStart: any = document.getElementById("tableStart");
			var tableEnd: any = document.getElementById("tableEnd");
			var line = this.createLineRegex();
			
			if(tableStart && tableEnd && line)
			{
				lineSdetails["tableStart"] = tableStart["value"];
				lineSdetails["tableEnd"] = tableEnd["value"];
				lineSdetails["line"] = line;
				
			}
			return lineSdetails;
		}
		
		createLineRegex()
		{
			var regex = "";
			for (var i=0; i<this.tableColumns.length;i++)
			{
				var obj = this.tableColumns[i];
				if(obj.col)
				{
					var valReg = "";
					var key = obj.col;
					var val = obj.val;
					val = val.trim();
					//key = key.replace("  "," ");
					//key = key.replace(" ","_");
					var regExp = this.getRegeularExp(val)
					var start = i==0?"\\s*":"\\s+";
	
					regex = regex +start+"(?P<"+obj.col+">"+regExp+ ")";
				}
			}
			console.log("regex:",regex);
			return regex;
		}
		
		getRegeularExp(value: any)
		{
			var regExp="";
			if(value)
			{
				var isNotNo = isNaN(value);
				if(isNotNo)
				{
					if(/[0-9]/.test(value))
					{
						if(/[-/]/.test(value))
						{
							value = value.replace(/[A-z]+/g,'\\w+');
							value = value.replace(/[0-9]+/g,'\\d+');
	
							regExp = value;
						}
						else if(/[ ]/.test(value))
						{
							regExp = ".+";
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
				else //only number
				{
					var isDotPresent = /[.]/.test(value);
					regExp = isDotPresent? "\\d+\\.\\d+" : "\\d+"; 
				}
				
			}
			return regExp
		}
		
		saveProcessData()
		{
			if(this.overviewReactiveForms.valid)
			{
				this.invoiceTransactionService.saveProcessData(JSON.stringify(this.overViewModel)).subscribe( (response:any)=> {
					this.invoiceTransactionService.setLoading(false);
					this.invoiceTransactionService.checkErrorException(response, (result:any) =>{
						console.log('saveProcessData result::::',result);
						if(!result)
						{
							alert("Overview data saved successfully");
						}
					});
					
				});
			}
		}
		//Changed by vikas on 19-04-23 for adding alert on Validation of input fields
		getLayoutAIData()
		{
			// this.validateForm().subscribe(
				// isValid => {
					let isValid: boolean = this.validateForm(); 
					console.log('getLayoutAIData isValid::::',isValid);
					if(!isValid)
					{
						return;
					}
					let queryParamObj = this.overViewModel;
					
					this.invoiceTransactionService.extractUploadedData(JSON.stringify(queryParamObj), this.docId, this.docDetails).subscribe( (response:any)=> {
						this.invoiceTransactionService.checkErrorException(response, (result) => {
							console.log('extractUploadedData result::::',result);
							this.invoiceTransactionService.setLoading(false);
							if(!result)
							{
								try
								{
									var self = this;
									self.data = {};
									
									this.itemCodeJObject = {};
									this.iconColorObj = {};
									var jsonData = {};
									if(typeof response == 'object')
									{
										jsonData = response;
									}
									else
									{
										jsonData = JSON.parse(response);
									}
									
									var extractedData;
									
									self.data = jsonData;
									
									if(self.data.order_dt)
									{
										self.data['order_dt'] = this.formatDate(self.data['order_dt']);
									}
									var strLines =  self.data.lines ;
									
									if(strLines)
									{	
										extractedData = jsonData; 
										console.log('extractUploadedData extractedData', extractedData);
										var lines = strLines;
										for (var i = 1; i < lines; i++) 
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
												}
											}
										}
									}

									self.data = {};
									self.data = jsonData//JSON.parse(jsonData['EXTRACTED_DATA']);
									var strLines = self.data.lines;
									var lines:any = [];
									var lineLen:any = 0;
									if(strLines)
									{
										lines = strLines;
									}

									var newLines:any = [];
									lineLen = lines.length;

									var objData = self.data.itemCodeList
									console.log('extractUploadedData objData::',objData);
									for (var i = 0;  i < lineLen ; i++){
										lines[i]["line_indx"] = i+1; 
										lines[i]["dom_id"] = i+1; 
										//NEW START -6-JAN-21   
										var lineObj = lines[i];
										var key = lineObj.descr;
										var value:any ="";
										var newObj:any = {};
										if(objData)
										{
											if(objData[key]) 
											{
												console.log('extractUploadedData the value line no 1702',value);
												value = objData[key];
												console.log('extractUploadedData the value 1705',value);
											}
										}
										if (value) 
										{
											newObj["item_code"] = value;
										}
										else 
										{
											console.log('extractUploadedData the value line no 1715');
											newObj["item_code"] = "";
										}
										for (var k in lineObj) 
										{
											newObj[k] = lineObj[k];
										}
										newLines.push(newObj);
										console.log('extractUploadedData callback', JSON.stringify(newObj));

										
									}
									console.log('extractUploadedData lines after newLines',newLines);
									self.data.lines = newLines;
									console.log('extractUploadedData lines after line self.data.lines',self.data.lines);
									if (jsonData)
									{
										this.docDetails = jsonData;
									}
									if( this.documentType == 'Orders' || this.documentType == 'Order Email' || this.documentType == 'Order Excel')
									{
										this.saveProcessData();
									}
								}
								catch(e)
								{
									console.log('Exception while extracting data in extractUploadedData:::',e);
								}
								this.openFormTemplate();
							}
							
						});
					});
				// });
			
		}
		//Added by vikas on 19-04-23 for adding alert on Validation of input fields [Start]
		validateForm(): any
		{
			let isValid: any = true;
			let elementId: any;
			console.log('Print overviewReactiveForms line no 1725::::::',this.overviewReactiveForms)
			console.log('Print line no 1726:::',this.procData)
			let values:any;
			let errors:any;
			for(const key of Object.keys(this.overviewReactiveForms.controls))
			{
				values = this.overviewReactiveForms.controls[key];
				if(typeof values.value == 'string')
				{
					let value = this.checkNull(values.value);
               		this.overviewReactiveForms.controls[key].setValue(value);
				}
				if(values.status == "INVALID")
				{
					errors = values.errors;
					console.log('invalid name in overviewReactiveForms::::',key);
					if(!this.showOverview)
					{
						this.openOverviewTemplate();
					}
					isValid = false;
					elementId = key;
					break;
				}
			}

			if(isValid)
			{
				for(const key of Object.keys(this.procData.controls))
				{	
					values = this.procData.controls[key];
					if(typeof values.value == 'string')
					{
						let value = this.checkNull(values.value);
                    	this.procData.controls[key].setValue(value);
					}
					if(values.status == "INVALID")
					{
						errors = values.errors;
						console.log('invalid name in procData::::',key);
						if(!this.showOverview)
						{
							this.openOverviewTemplate();
						}
						if(!this.isleftSidePanelOpen)
						{
							this.isleftSidePanelOpen = true;
						}
						isValid = false;
						elementId = key;
						break;
					}
				}
			}

			console.log('08052023 isValid:::::',isValid);
			if(!isValid) //&& this.overViewModel['ai_proc_variables']['Details'])
			{
				setTimeout(()=>{
					var element = document.getElementById(elementId);
					console.log('Print element line no 1735::::::',element);
					var name = element.getAttribute('data-placeholder');
					console.log('Print element name::::::',name);
					if(errors.required)
					{
						window.alert('Please provide input for '+name+'. This field is required.');
					}
					else if(errors.maxlength)
					{
						window.alert('Input for '+name+' exceeds the limit. The input limit is '+errors.maxlength.requiredLength);
					}
					if(element)
					{
						element.focus();
					}
					return isValid;
				}, 500);
				//let overViewModel = this.overViewModel['ai_proc_variables']['Details'];
				// for(var i = 0; i < overViewModel.length; i++)
				// {
				// 	let id = overViewModel[i];
				// 	if(id == elementId)
				// 	{
				// 		var name = overViewModel[i]['displayName'];
				// 		window.alert('Please fill the required input field '+name);
				// 		var element = document.getElementById(elementId);
				// 		console.log('Print element line no 1735::::::',element);
				// 		if(element)
				// 		{
				// 			element.focus();
				// 		}
				// 		return false;
				// 	}
				// }
			}
			else
			{
				console.log('form validated');
				return isValid;
			}
			
				
		}
		//Added by vikas on 19-04-23 for adding alert on Validation of input fields [End]
		//Added by Pravin K on 6-MAR-20[For text selection] END
		//Changed by vikas on 07-04-23 for hiding alert on form tab 
		openFormTemplate()
		{
			// if(!this.overviewReactiveForms.valid && this.showOverview)
			// {
			// 	alert('Please fill all the required fields');
			// 	return;
			// }
			if(this.showOverview || this.showTrace)
			{
				this.showForm = true;
				this.showOverview = false;
				this.showTrace = false;
			}
		}
		//Changed by vikas on 07-04-23 for hiding alert on trace tab 
		openTraceTemplate()
		{
			// if(!this.overviewReactiveForms.valid && this.showOverview)
			// {
			// 	alert('Please fill all the required fields');
			// 	return;
			// }
			if(this.showOverview || this.showForm)
			{
				this.traceLinks = this.checkNull(this.overViewModel['proc_mtd']).split('-');
				if(this.checkNull(this.selectedTraceTab) == '' && !this.traceLinks.includes(this.selectedTraceTab))
				{
					this.openTraceLink(this.traceLinks[0]);
				}
				else
				{
					this.openTraceLink(this.selectedTraceTab);
				}
				console.log('traceLinks opentracetemplate::::', this.traceLinks);
				//this.closeTraceLink();
				this.showTrace = true;
				this.showOverview = false;
				this.showForm = false;
			}
		}
		
		openOverviewTemplate()
		{
			if(this.showTrace || this.showForm)
			{
				this.showTrace = false;
				this.showOverview = true;
				this.showForm = false;
			}
		}

		openTraceLink(processId: any)
		{
			this.selectedTraceTab = processId;
			var tmpData: any = {};
			tmpData["processId"] = processId;
			tmpData["proc_mtd"] = this.overViewModel['proc_mtd'];
			tmpData["docId"] = this.docId;
			var paramString = this.invoiceTransactionService.getEncodedParamString(tmpData);
			this.invoiceTransactionService.getTraceLinkData(paramString).subscribe( (response:any)=> {
				// this.invoiceTransactionService.checkErrorException(response, (result: any) => {
				// 	if(!result)
				// 	{
						this.invoiceTransactionService.setLoading(false);
						this.traceLinkData = response;
						console.log('this.traceLinkData  getTraceLinkData data::',this.traceLinkData);
					//}
				//});
			});
			console.log('this.traceLinkData::',this.traceLinkData);
			
		}

		closeTraceLink()
		{
			// this.showLinkTitle = true;
			// this.showLinkData = false;
		}

		loadOverviewData()
		{
			var tmpData: any = {};
			tmpData["doc_type"] = 'Orders';
			tmpData["ent_type"] = '';
			tmpData["ent_code"] = '';
			var paramString = this.invoiceTransactionService.getEncodedParamString(tmpData);
			this.invoiceTransactionService.getOverviewModel(paramString).subscribe((response:any)=> {
				this.invoiceTransactionService.setLoading(false);
				console.log('response getOverviewModel data::',response);
				if(response)
				{
					var tempModel = JSON.parse(response);
					this.updateOverviewModel(tempModel);
				}
			});
		}
		//Changed by vikas on 05-04-23 for creating dynamic formcontrols as per json name [Start]
		updateOverviewModel(overviewMdl : any)
		{
			var keys = Object.keys(this.overviewReactiveForms.controls);
			for(var i = 0; i < keys.length; i++)
			{
				var key: any = keys[i];
				
				if(key == 'ai_proc_variables' && overviewMdl['ai_proc_variables'])
				{
					this.initializeProcData(overviewMdl['ai_proc_variables']);
				}
        	
				if(overviewMdl.hasOwnProperty(key))
				{
					//if(this.checkNull( overviewMdl[key] ) !== '')
					{
						var value = overviewMdl[key];
						if( this.overViewModel[key] !== value)
						{
							let val = this.isJson(value)
							// console.log('Print 1873::::::',val);
							if(val == false)
							{
								// console.log('Print 1876::::::',val);
								this.overViewModel[key] = overviewMdl[key];
								// console.log('Print 1878::::::',this.overViewModel[key]);
							}
							else
							{
								this.overViewModel[key] = val;
								// console.log('Print 1884::::::',this.overViewModel[key]);
							}
							//this.overViewModel[key] = value;
						}
					}
				}
			}
		}

		initializeProcData(overviewMdl)
		{
			let jsonObj = overviewMdl
			if(typeof overviewMdl !== 'object')
			{
				jsonObj = JSON.parse(overviewMdl);
            }
			let form = {};
			for(let i=0; i <jsonObj['Details'].length;i++)
			{
				if(jsonObj['Details'][i].mandatory == "true")
				{
					form[jsonObj['Details'][i].name + '_t'] = new FormControl('');
				}
				form[jsonObj['Details'][i].name] = new FormControl('');
			}
			this.procData = new FormGroup(form);
			if(this.disableOverview)
			{
				this.procData.disable();
			}
		}

		isJson(value)
		{
			// console.log('Print 2463::::::',value);
			let val:any;
			try 
			{
			//   console.log('Print 1901::::::',value);
			if(value)
			{
				val = JSON.parse(value);	
			}
			//   console.log('Print 2469::::::',val);
			} 
			catch (error) 
			{
				console.log('Print 2501::::::',value + "" + error);
				val = false
			}
			return val;
		}
		//Changed by vikas on 05-04-23 for creating dynamic formcontrols as per json name [End]
		checkNull(input : any)
		{
			if( input == null || input == undefined || input === 'undefined' )
			{
				input = '';
			}
			return typeof input == 'string' ? input.trim() : input;
		}

		applyIndication(event: any, order: any, id: any)
		{
			this.iconColorObj[id] = 'io-red';
			order['isChange'] = true;
			this.itemCodeJObject[id] = order;
			// console.log('print order 2492::::::',order);
			// console.log('print this.itemCodeJObject 2493::::::',this.itemCodeJObject);
			// console.log('print this.data[lines] 2494::::::',this.data['lines']);
		}

		onBlur(index: any, id: any)
		{
			// console.log('print order 2499::::::',order);
			// console.log('print id 2530:::',id);
			// console.log('print this.itemCodeJObject 2531::::::',this.itemCodeJObject);
			if(this.data && this.data['lines'] && this.data['lines'][index] && this.itemCodeJObject && this.itemCodeJObject[id] && this.itemCodeJObject[id]['isChange'] == true)
			{
				this.updatedItemCode(this.data['lines'][index]);
			}

		}

		updatedItemCode(value: any)
		{
			// console.log('print value 2539:::::',value);
			console.log('print this.itemCodeArray 2540:::::',this.itemCodeArray);
			let exists = this.itemCodeArray.some(item => item.item_code === value.item_code);

			if (!exists) {
				this.itemCodeArray.push(value);
				console.log('Print this.itemCodeArray 2520::::', this.itemCodeArray);
			}
		}

		setBackgroundColor(id: any)
		{
			var color = 'io-grey';
			if(this.iconColorObj[id] != undefined)
			{
				color = this.iconColorObj[id];
			}
			return color;
		}
		
		getRowBg(order: any)
		{
			if( this.checkNull(order.stop_business).trim()  === 'Y')
			{
				return 'rowBgInvPrd';
			}
			else if( this.checkNull(order.system_item_code).trim()  === '' && this.checkNull(order.vector_item_code).trim()  === '' ) 
			{
				return 'rowBgYellow';
			} 
			else if ( this.checkNull(order.system_item_code).trim()  === '' && this.checkNull(order.vector_item_code).trim()  !== '' ) 
			{
				return 'rowBgPurple';
			}
			else if ( this.checkNull(order.system_item_code).trim() !== '' && this.checkNull(order.vector_item_code).trim() === '' ) 
			{
				return 'rowBgRed';
			}
			else if ( this.checkNull(order.system_item_code).trim()  !==  this.checkNull(order.vector_item_code).trim() ) 
			{
				return 'rowBgOrange';
			}
		}

		setStdBackgroundColor(order: any,id: any)
		{
			if(order.quantity == order.stan_qty)
			{
				return 'hideElement';
			}
			var color = 'io-grey';
			if(this.iconColorObj[id] != undefined)
			{
				color = this.iconColorObj[id];
			}
			return color;
		}

		openAttribute(order: any, id: any, index: any)
		{
			this.productIdentificationJson = {};
			this.definedAttributeObj = {};
			this.mappingJson = {};
			if(this.checkNull(order.item_code) == '' && this.checkNull(order.extr_item_code) == '')
			{
				window.alert('Item code field is null. Please provide an input for item code');
				return;
			}

			this.systemAttribute = {};
			for(var key in order)
			{
				if(key.includes('phy_attrib') || key.includes('phy_attr_lbl'))
				{
					this.systemAttribute[key] = order[key];
				}
			}
			console.log("print this.systemAttribute::::",this.systemAttribute);
			//this.systemAttribute['item_code'] = order['item_code'];
			//this.systemAttribute['descr'] = order['descr'];
			//this.systemAttribute['extr_item_code'] = order['extr_item_code'];
			this.systemAttribute['extract_descr'] = order['extract_descr'];
			this.systemAttribute['system_item_code'] = order['system_item_code'];
			this.systemAttribute['system_item_descr'] = order['system_item_descr'];
			this.systemAttribute['vector_item_code'] = order['vector_item_code'];
			this.systemAttribute['vector_descr'] = order['vector_descr'];
			this.systemAttribute['extract_packing'] = order['packing'];

			this.invoiceTransactionService.getProductIdentificationAlias().subscribe((response:any)=> {
				this.invoiceTransactionService.setLoading(false);
				response = JSON.stringify(response);
				this.invoiceTransactionService.checkErrorException(response,(result: any) =>{
					if(!result)
					{
						this.productIdentificationJson = JSON.parse(response); 
						const keys = Object.keys(this.productIdentificationJson);
						const phyAttrKeys = Object.keys(this.attrRecognisationObj);
						for(var i = 0; i < phyAttrKeys.length; i++)
						{
							var phyAttrKey = phyAttrKeys[i];
							var bisEntityID =  phyAttrKey.substring('extract_'.length);
							var definedAttrKey  = 'defined_' + bisEntityID;
							console.log('phyAttrKey::::',phyAttrKey,':::bisEntityID:::',bisEntityID,':::definedAttrKey:::',definedAttrKey);
							if(keys.includes(this.systemAttribute[phyAttrKey] + "_" + bisEntityID + "_" + this.systemAttribute['extract_phy_attrib_1']))
							{
								this.definedAttributeObj[definedAttrKey] = this.productIdentificationJson[ this.systemAttribute[phyAttrKey] + "_" + bisEntityID + "_" + this.systemAttribute['extract_phy_attrib_1'] ];
							}
							else if(keys.includes(this.systemAttribute[phyAttrKey] + "_" + bisEntityID))
							{
								this.definedAttributeObj[definedAttrKey] = this.productIdentificationJson[ this.systemAttribute[phyAttrKey] + "_" + bisEntityID ];
							}
							else if(keys.includes(this.systemAttribute[phyAttrKey] + "_" + this.systemAttribute['extract_phy_attrib_1']))
							{
								this.definedAttributeObj[definedAttrKey] = this.productIdentificationJson[ this.systemAttribute[phyAttrKey] + "_" + this.systemAttribute['extract_phy_attrib_1'] ];
							}
							else if(keys.includes(this.systemAttribute[phyAttrKey]))
							{
								this.definedAttributeObj[definedAttrKey] = "*"+this.productIdentificationJson[ this.systemAttribute[phyAttrKey] ];
							}
						}
						this.currentIndex = '';
						this.currentIndex = index;
						this.orderData = '';
						this.orderData = order;
						this.currentId = '';
						this.currentId = id;
						this.overLayForAttribute();
					}
				});
			});
			
		}

		overLayForAttribute() 
		{
			var width = '1000';
			var top = 155;
			var left = 281;
			var bottom = 0;
			const positionStrategy = this.overlay.position()
			.global()
			.centerHorizontally()
			.centerVertically();

			const overlayConfig = new OverlayConfig({
				positionStrategy,
			});

			overlayConfig.hasBackdrop = true;
			const templatePortal = new TemplatePortal(this.openAttri, this.viewContainerRef);
			this.overLayRefForMoreOption = this.overlay.create(overlayConfig);
			this.overLayRefForMoreOption.attach(templatePortal);
		}

		closeFilter(event)
		{
			this.overLayRefForMoreOption.dispose();
			// let index = this.currentIndex+1;
			// let curIndId = 'indicator.item_code.'+index;
			// let indicElem = document.getElementById(curIndId);
			 this.definedAttributeObj = {};
		}

		setRadioValue(keyVal:any, value: any) {
			this.mappingJson[keyVal] = value;
		}

		applyFilter(event)
		{
			//if(this.mappingValue1 == '' && this.mappingValue2 == '' && this.mappingValue3 == '' && this.mappingValue4 == '')
			if( this.mappingJson && Object.values(this.mappingJson).every(value => value === null || value === undefined || value.toString().trim() === '') )
			{
				window.alert('Please select atleast one option from the following \n i.e Define Mapping or Improve Training to implement it on Apply');
				return;
			}
			if(this.mappingJson != undefined)
			{
				let bisJsonArray = [];
				for(const key of Object.keys(this.mappingJson))
				{
					if(this.mappingJson[key] == "Define Mapping")
					{
						let phrase = this.systemAttribute["extract_"+key];
						let resValue = this.systemAttribute[key];
						if(this.checkNull(phrase) !== '' && this.checkNull(resValue) !== '' && this.checkNull(resValue) !== this.checkNull(phrase))
						{
							let bisJSONObj = {};
							//bisJSONObj[phrase] = resValue;
							bisJSONObj["phrase"] = phrase;
							bisJSONObj["resValue"] = resValue;
							bisJSONObj["bisEntityID"] = key;
							let tempJSON = {};
					        tempJSON[this.systemAttribute['extract_phy_attrib_1']] = bisJSONObj;
							bisJsonArray.push(tempJSON);
						}
					}
					else if(this.mappingJson[key] == "Improve Training")
					{
						this.improveTraining(key, this.systemAttribute);
					}
				}
				/*if(Object.keys(bisJSONObj).length > 0)
				{
					console.log('Inside applyFilter print the bisJSONObj',bisJSONObj);
					let tempJSON = {};
					tempJSON[this.systemAttribute['extract_phy_attrib_1']] = bisJSONObj;
					console.log('Inside applyFilter print the tempJSON',tempJSON);
					this.defineMapping(tempJSON);
				}*/
				if(bisJsonArray.length > 0)
				{
					console.log('Inside applyFilter print the bisJsonArray',bisJsonArray);
					this.defineMapping(bisJsonArray);
				}
			}
			this.mappingJson = {};
			if(JSON.stringify(this.itemCodeJObject) !== '{}')
			{
				this.updateItemDataInDB();
			}
			let index = this.currentIndex+1;
			let curIndId = 'detail.2.'+index+'.item_code'; 
			
			let indicElem = document.getElementById(curIndId);
			if(indicElem != undefined)
			{
				this.iconColorObj[curIndId] = 'io-green';
			}
			this.overLayRefForMoreOption.dispose();
			
		}

		defineMapping(jsonToMap: any)
		{
			this.updateDictionaryAliasinDB(jsonToMap);
		}

		improveTraining(key: any,order : any )
       	{
			console.log('improveTraining order:::',order);
			console.log('improveTraining key:::',key);
			
			var text = "";
			var name = this.attrRecognisationObj['extract_'+key];
			let prefix = order['extract_'+key];
			var jsonArr: any = this.overViewModel['ai_proc_variables']['Details'];
			for(var i = 0; i < jsonArr.length; i++)
			{
				var jsonObj: any = jsonArr[i];
				if(jsonObj.name == name)
				{
					let suffix = jsonObj.defaultValue;
					text = prefix + ', ' + suffix;
					jsonObj.defaultValue = text;
				}
				
			}
			
			if(this.checkNull(text) !== '')
			{
				alert('Improve Training has been successfully completed.');
			}
       	}

		ngOnChanges(changes: SimpleChanges)
		{
			//console.log('Print inside ngonchanges:::::::',this.data.lines);
		}

		updateItemDataInDB()
		{
			var paramdata: any = {};
			paramdata["jsonObject"] = JSON.stringify(this.itemCodeJObject);
			
			var paramString = this.invoiceTransactionService.getEncodedParamString(paramdata);
			this.invoiceTransactionService.updateItemCode(paramString).subscribe((response:any)=> {
				this.invoiceTransactionService.setLoading(false);
				this.itemCodeJObject = {};
				this.invoiceTransactionService.checkErrorException(response,(result: any) =>{
					if(!result && response == "success")
					{
						alert('Item code has been successfully updated.');
					}
				});
			});
		}

		storeRecalculatedUOM()
		{
			var param: any = {};
			param["jsonObject"] = JSON.stringify(this.standQtyJson);
			
			var paramString = this.invoiceTransactionService.getEncodedParamString(param);
			this.invoiceTransactionService.recalculateUOM(paramString).subscribe((response:any)=> {
				this.invoiceTransactionService.setLoading(false);
				this.invoiceTransactionService.checkErrorException(response, (result: any) => {
					console.log('storeRecalculatedUOM result::::',result);
					if(!result && response == "success")
					{
						alert("Unit of Measurement has been updated against the Item.");
					}
					
				});
			});
		}

		updateDictionaryAliasinDB(jsonArray : any)
		{
			var tmpData: any = {};
			tmpData["jsonArray"] = JSON.stringify(jsonArray);
			var paramString = this.invoiceTransactionService.getEncodedParamString(tmpData);
			this.invoiceTransactionService.updateDictionaryAlias(paramString).subscribe((response:any)=> {
				this.invoiceTransactionService.setLoading(false);
				this.invoiceTransactionService.checkErrorException(response, (result: any) => {
					console.log('updateDictionaryAliasinDB result::::',result);
					if(!result && response == "success")
					{
						alert("Define Mapping has been successfully completed.");
					}
				});
			});
		}
 		
		openStandQty(event, id)
		{
			this.iconColorObj[id] = 'io-red';
		}

		openStandQtyPopup(order, id, index)
		{
			if(order.item_code == '')
			{
				window.alert('Item code field is null. Please provide an input for item code');
				return;
			}
			this.standQtyJson = order;
			//this.standQtyJson['factor'] = this.standQtyJson.stan_qty/this.standQtyJson.quantity;
			this.currentIndex = '';
			this.currentIndex = index;
			this.overLayForStandardQty();
		}

		overLayForStandardQty() 
		{
			var width = '300';
			var top = 155;
			var left = 281;
			var bottom = 0;
			const positionStrategy = this.overlay.position()
			.global()
			.centerHorizontally()
			.centerVertically();

			const overlayConfig = new OverlayConfig({
				positionStrategy,
			});

			overlayConfig.hasBackdrop = true;
			const templatePortal = new TemplatePortal(this.standQtyTemp, this.viewContainerRef);
			this.overLayRefForStandQty = this.overlay.create(overlayConfig);
			this.overLayRefForStandQty.attach(templatePortal);
		}

		applyStandQty(event)
		{
			console.log('print inside applyStandQty event::::::',event);
			this.storeRecalculatedUOM();
			if(this.standQtyJson.std_unit != '' && this.standQtyJson.std_unit != undefined && this.standQtyJson.std_unit != null)
			{
				let index = this.currentIndex+1;
				let curIndId = 'detail.2.'+index+'.stan_qty';
				let indicElem = document.getElementById(curIndId);
				if(indicElem != undefined)
				{
					this.iconColorObj[curIndId] = 'io-green';
				}
				this.overLayRefForStandQty.dispose();
			}
			else
			{
				alert("Standard Unit field is null. Please provide an input for standard unit.");
			}
		}

		closeStandFilter(event)
		{
			this.overLayRefForStandQty.dispose();
		}

		closePohelp()
		{
			this.overLayRefForItemCodeOption.dispose();
		}

		openPophelp(order: any, fieldName: any, fieldValue: any, domID: any)
		{
			this.domID = domID;
			this.fieldName = fieldName;
			for(let i = 0; i < this.pophelpDataList.length; i++)
			{
				if(this.pophelpDataList[i]['attrib']['@FIELD_NAME'] == fieldName.toUpperCase())
				{
					let parameters = this.getSQLInputValues(this.pophelpDataList[i]['attrib']['@SQL_INPUT'], order);
					this.dataSource = "/ibase/PopupDataServlet?FIELDNAME="+fieldName.toUpperCase()+"&"+parameters+"&OBJ_NAME=W_INVOICE-TRANSACTION&IS_BI_POPHELP=true&OUTPUT_FORMAT=JSON&KEYSTRING="+this.pophelpDataList[i]['attrib']['@SQL_INPUT'];
					this.multi_opt = "0";
					this.filterValue = fieldValue;
					this.filterName = fieldValue;
					this.overlayForFieldName();
				}
			}
		} 

		getSQLInputValues(keyString: any, order: any)
		{
			let parameters = '';
			try
			{
				let tempArr = [];
				let keyStringArr = keyString.split(':');
				for(let i = 0; i < keyStringArr.length; i++)
				{
					let curToken = keyStringArr[i];
					if(curToken && curToken.length > 0 && !tempArr.includes(curToken))
					{
						tempArr.push(curToken);
						if(curToken.indexOf(".") != -1)
						{
							curToken = curToken.substring(curToken.indexOf(".")+1);
						}
						curToken = (curToken.indexOf(",") != -1) ? curToken.substring(0,curToken.indexOf(",")) : curToken;
						let value = order[curToken] ? order[curToken] : order[curToken.toUpperCase()];
						if(!value)
						{
							if(this.userInfo['result'] && this.userInfo['result']['UserInfo'])
							{
								value = this.userInfo['result']['UserInfo'][curToken];
							}
						}
						parameters = parameters + curToken.toUpperCase() + '=' + value + '&';
					}
				}
				if(parameters.length > 1)
				{
					parameters = parameters.substring(0, parameters.length - 1);
				}
			}
			catch(e)
			{
				console.log('Error while getting getSQLInputValues');
			}
			return parameters;
		}

		setValue(value: any)
		{
			if(this.showOverview)
			{
				this.overViewModel[this.fieldName] = value
			}
			else
			{
				let order = this.data.lines[this.domID];
				if(this.checkNull(order[this.fieldName]) !== this.checkNull(value))
				{
					var fieldID = 'detail.2.'+ (this.domID+1) + "."+this.fieldName;
					this.iconColorObj[fieldID] = 'io-red';
				}
				if(this.checkNull(value) != '')
				{
					order[this.fieldName] = value;
				}
			}
			this.fieldName = "";
		}

		overlayForFieldName()
		{
			var config = new OverlayConfig();
			var width = '500px';
			var top = '100px';
			var height = 'auto';
			var left = "calc(100% - 350px)";
			config.hasBackdrop = true;
			const positionStrategy = this.overlay.position()
				.global()
				.centerHorizontally()
				.width( width )
				.left( left )
				.top( top )
				.height( height );
	  
			const templatePortal = new TemplatePortal(
				this.templatePortal,
				this.viewContainerRef
			);
			
			const overlayConfig = new OverlayConfig({
				positionStrategy,
				});

			overlayConfig.hasBackdrop = true;
			const popupTemp = new TemplatePortal(this.popupTemp, this.viewContainerRef);
			this.overLayRefForItemCodeOption = this.overlay.create(overlayConfig);
			this.overLayRefForItemCodeOption.attach(popupTemp);
		}
		
		onItemChange(selPophelpDetails: any[])
		{
			try
			{
				let index = selPophelpDetails.length - 1;
				let selPophelpData = selPophelpDetails[index];
				const commonKeys = Object.keys(selPophelpData);
				if(this.showOverview)
				{
					for (const key of commonKeys) 
					{
						if (this.overViewModel.hasOwnProperty(key.toLowerCase())) 
						{
							this.overViewModel[key.toLowerCase()] = selPophelpData[key];
						}
					}
				}
				else
				{
					
					let order = this.data.lines[this.domID];
					for (const key of commonKeys) 
					{
						if (order.hasOwnProperty(key.toLowerCase())) 
						{
							order[key.toLowerCase()] = selPophelpData[key];
							let id = 'detail.2.'+(this.domID+1)+'.item_code';
							order['isChange'] = true;
							this.itemCodeJObject[id] = order;
							if(this.data && this.data['lines'] && this.data['lines'][this.domID] && this.itemCodeJObject && this.itemCodeJObject[id] && this.itemCodeJObject[id]['isChange'] == true)
							{
								this.updatedItemCode(this.data['lines'][this.domID]);
							}
						}
					}
				}
			}
			catch(e)
			{
				console.log('Error in onItemchange::::',e);
			}
			this.closePohelp();
		}
		
		setMappingAttribute(bisEntityID: any, fieldName: any)
		{			
			var attriVal = this.systemAttribute['extract_'+bisEntityID];
			const keys = Object.keys(this.productIdentificationJson);			
			if(fieldName == this.attrRecognisationObj['extract_'+bisEntityID] && keys.includes(attriVal + "_" + bisEntityID + "_" + this.systemAttribute['extract_phy_attrib_1']))
			{
				this.definedAttributeObj['defined_'+bisEntityID] = this.productIdentificationJson[attriVal + "_" + bisEntityID + "_" + this.systemAttribute['extract_phy_attrib_1']];
			}
			else if(fieldName == this.attrRecognisationObj['extract_'+bisEntityID] && keys.includes(attriVal + "_" + bisEntityID))
			{
				this.definedAttributeObj['defined_'+bisEntityID] = this.productIdentificationJson[attriVal + "_" + bisEntityID];
			}
			else if(fieldName == this.attrRecognisationObj['extract_'+bisEntityID] && keys.includes(attriVal + "_" + this.systemAttribute['extract_phy_attrib_1']))
			{
				this.definedAttributeObj['defined_'+bisEntityID] = this.productIdentificationJson[attriVal + "_" + this.systemAttribute['extract_phy_attrib_1']];
			}
			else if(fieldName == this.attrRecognisationObj['extract_'+bisEntityID] && keys.includes(attriVal))
			{
				this.definedAttributeObj['defined_'+bisEntityID] = "*"+this.productIdentificationJson[attriVal];
			}
			else
			{
				this.definedAttributeObj['defined_'+bisEntityID] = '';
			}
		}

		//Added by vikas on 07-04-23 for giving expand collapse functionality to
		// processing instructions fields
		expandcollapse()
		{
			this.isleftSidePanelOpen = !this.isleftSidePanelOpen;
			console.log('Print line no 2444::::',this.isleftSidePanelOpen);
		}

		//Added by Tejas S on 19-05-23 for  ai_proc_variables and ai_proc_templ should get changed according to the selected processing method
		onChangeProcMethod(event : any )
		{
		   
			let queryParamObj = this.overViewModel;
			let procMethod = event.value;
			let procMethodParms: any = {};
			this.invoiceTransactionService.getProcMethodParams(JSON.stringify(queryParamObj),procMethod).subscribe(
				result => 
				{	
					procMethodParms = JSON.parse(result);
					this.overViewModel['ai_proc_templ'] = procMethodParms['ai_proc_templ'];
					if(procMethodParms['ai_proc_variables'])
					{
						this.initializeProcData(procMethodParms['ai_proc_variables']);
						this.overViewModel['ai_proc_variables'] = procMethodParms['ai_proc_variables'];
						this.isleftSidePanelOpen = false; 
					}
				});
		}

		getDocTypeDetails()
		{
			var tmpData: any = {};
			tmpData["ACTION"] = "GET_DOC_TYPE_DET";
			tmpData["documentType"] = this.documentType;
			var paramString = this.invoiceTransactionService.getEncodedParamString(tmpData);
			var url = this.invoiceTransactionService.getHostURL() + '/ibase/WebITMDocumentHandlerServlet';
			this.invoiceTransactionService.sendRequest(url, paramString, (response) => 
			{
				this.invoiceTransactionService.setLoading(false);
				var callbackRespNew = response.split('%%SEP%%');
				var isError = callbackRespNew[1].trim();
				
                		if (!(isError == 'true')) 
				{
					var docTypeObj = JSON.parse(callbackRespNew[0]);
					console.log('11102023 docTypeObj::::',docTypeObj);
					this.saveType = docTypeObj['save_type'];
					this.objName = docTypeObj['obj_name__imp'];
				}
				
			});
		}
		
		formatDate(date: any, dateFormat?: any)
		{
			dateFormat = dateFormat ? dateFormat : this.dateFormat;
			var formattedDate: any = "";
			try
			{
				let parsedDate: any;
			    for (const format of this.formatsToTry) {
			      parsedDate = parse(date, format, new Date());
			      if (parsedDate != 'Invalid Date') {
			        break;
			      }
			    }
			    formattedDate = format(parsedDate, dateFormat);
			}
			catch(e)
			{
				console.log('catch block formatDate:::', e);
				formattedDate = date;
			}
			return formattedDate;
		}

		keyDownEventOnTxtArea(event: any)
		{
			console.log('keyDownEvent event.key:::', event.key);
			if (event.key === 'Enter') 
			{
				event.preventDefault();
				const textarea = event.target;
				const startPos = textarea.selectionStart;
				const endPos = textarea.selectionEnd;

				// Insert a newline character at the current cursor position
				const currentValue = textarea.value;
				const newValue = currentValue.substring(0, startPos) + '\n' + currentValue.substring(endPos);

				textarea.value = newValue;

				// Set the cursor position after the inserted newline
				textarea.selectionStart = startPos + 1;
				textarea.selectionEnd = startPos + 1;
			}
		}
        // Added by Tejas s on 17-Aug-2023 to Display preview of Excel FILES
		loadExcelData (fileUrl: string): void 
		{
		  fetch(fileUrl)
			.then(response => response.blob())
			.then(blob => {
			  const reader: FileReader = new FileReader();
			  reader.onload = (e: any) => {
				const bstr: string = e.target.result;
				const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
	  
				const wsname: string = wb.SheetNames[0];
				const ws: XLSX.WorkSheet = wb.Sheets[wsname];
	  
				this.excelFileData = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
				this.headData = this.excelFileData[0];
				this.excelFileData = this.excelFileData.slice(1);
			  };
			  reader.readAsBinaryString(blob);
			})
			.catch(error => {
			  console.error('Error loading Excel file:', error);
			});
		}
		
		getallFormXml(finalXml: any) 
		{
			var noOfForm = this.compData["NO_OF_FORMS"];
			for (var i = 0; i < noOfForm; i++) 
			{
				var formDetail = 'Detail' + (i + 1);
				if (formDetail == 'Detail1') 
				{
					var dbId = "";
					var attributeTagJson = this.allformValues['attribute'];
					var attributeTagInXml = `<attribute `;
					if (attributeTagJson != undefined) 
					{
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
							+ `" objName="` + this.objName + `" domID="` + (i + 1) + `" dbID="` + dbId + `" selected="Y">`;
	
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
	
						var jsonData: any = {};
						jsonData = JSON.parse(JSON.stringify(currentAllData));
	
						for (var key in jsonData) 
						{
							var id: any = formDetail + '.1.' + key;
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
							if (this.editFlag == 'A') 
							{
								var domId = this.allformValues[formDetail][j]['domID'];
								console.log('inside build allFormXml......1798', domId);
								paramXML = `<` + formDetail + ` objContext="` + (i + 1)
									+ `" objName="` + this.objName + `" domID="` + domId + `" dbID="` + dbId + `">`;
							}
							else 
							{
								paramXML = `<` + formDetail + ` objContext="` + (i + 1)
									+ `" objName="` + this.objName + `" domID="` + (j + 1) + `" dbID="` + dbId + `">`;
							}
	
							paramXML = paramXML + attributeTagInXml;
							currentAllData = this.allformValues[formDetail][j];
							var jsonData: any = {};
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
			}
			console.log('Final XML..........................1573', finalXml);
			return finalXml;
		}
}