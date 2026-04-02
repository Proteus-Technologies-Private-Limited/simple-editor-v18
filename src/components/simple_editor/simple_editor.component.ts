import { Component, OnInit, Input, NgZone, ViewChild, TemplateRef, ViewContainerRef, Renderer2,Inject, ElementRef, QueryList, ViewChildren, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, OnDestroy, DoCheck, forwardRef, signal, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ControlValueAccessor, FormBuilder, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BBOpenPophelpComponent } from 'base-blocks';
import { SimpleEditorService } from './simple_editor.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePipe, KeyValue } from '@angular/common';
import { AppDateAdapter, APP_DATE_FORMATS } from './date.adapter';
import { ConfirmBoxComponent } from '../shared/confirm-box/confirm-box.component';
import { Overlay, OverlayConfig, OverlayRef, OverlayContainer } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import ResizeObserver from 'resize-observer-polyfill'; 
import { BbAutosuggestTransactionComponent, BBFeedViewComponent} from 'base-blocks';
import { ItemChangeUtils } from 'base-blocks';
import { TransActionUtility } from 'base-blocks';
import { MatSelect } from '@angular/material/select';
import * as _ from 'lodash';
import { BBTextboxComponent } from 'base-blocks';
import { BBConfirmBoxComponent } from 'base-blocks';
import { BBTextAreaComponent } from 'base-blocks';
import { MetaDataNodeObj } from "./MetaDataNodeObj"
import { MatDatepicker } from '@angular/material/datepicker';
import moment from 'moment';
import { BBAgGridComponent } from 'base-blocks';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';

declare let closeEditor: any;

@Component({
	selector: 'simple_editor',
	templateUrl: './simple_editor.component.html',
	styleUrls: ['./simple_editor.component.css'],
	providers: [
		{
			provide: DateAdapter, useClass: AppDateAdapter
		},
		{
			provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
		},
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => SimpleEditorComponent),
			multi: true
		},
		DatePipe
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	// standalone: true,
	// imports: [MatIconModule],
	// encapsulation: ViewEncapsulation.None
})
export class SimpleEditorComponent implements OnInit, OnDestroy, DoCheck, ControlValueAccessor {

	@ViewChildren(MatSelect) matSelects!: QueryList<MatSelect>;
	@Input() data: any = {};
	@Input() pluginMetadata: any;
	allformValues:any = {};
	currentCompData:any;
	tmpDataCopy:any;
	editFlag:any;
	editorId:any;
	refSer:any;
	objName:any;
	positionPopHelp = {};
	compData:any = {};
	itemChangeList: any = [];
	fieldName:any;
	itemChangeArr: any = [];
	pophelpDataList: any = [];
	pophelpDataMap: Map<string, any> = new Map();
	popHelpFieldList: any = [];
	popHelpFieldSet: Set<string> = new Set();
	private disabledFieldCache: Map<string, boolean> = new Map();
	private isDetailInputFocused: boolean = false;
	visibleAttribParams:any = {};
	protectAttribParams:any = {};
	@ViewChild('popHelp') popHelp: BBOpenPophelpComponent | any;
	pkValues:any;
	showHeaderForm: boolean = true;
	arrayOfDateFields: any = [];
	
	confirmBox:any = null;
	numOfForms:any;
	
	currentValidationRow: any = [];
	currentFormNo:any = "1";
	currentIndexForDetailForm: any = "";
	currentFeedData: any = "";
	@ViewChild('expandAndCollapseTemp') expandAndCollapseTemp: TemplateRef<any>|any;
	@ViewChild('taxDetails') taxDetail: TemplateRef<any>|any;
	groupBoxOverlay!: OverlayRef;
	showContextMenu: boolean = false;
	contextMenuX: number = 0;
	contextMenuY: number = 0;
	private _lastDatepickerInput: HTMLElement | null = null;
	private _lastMenuTrigger: HTMLElement | null = null;
	private _isFixingOverlay = false;
	taxDetailOverLay!: OverlayRef;
	currElemId:any;
    
	FeedViewOverlay!: OverlayRef;
	@ViewChild('BBFeedView') BBFeedView: BBFeedViewComponent | any;
	@ViewChild('popupTemp') popupTemp: TemplateRef<any> | any;
	overLayForFeedView: OverlayRef | any;
	
	isExpanded: boolean = false;
	taxResponseData: any = "";
	rawResponseData: any = {};
	detailCount: any = 0;
	mapForNewDetail: any = {};
    taxFormInfo: any = "";
	objectDetails: any;
	userInfo: any;
	objHeaderImg: any;
	formWiseLstDomIdObj: any = {};
	@ViewChild('resizeElement') resizeElement!: ElementRef;
	@ViewChildren('bbAutoSuggest')bbAutoSuggest!: QueryList<BbAutosuggestTransactionComponent>;
	@Input() transMode: any = '';
	validateResponse: any = 'true';
	saveTrue: boolean = false; 
	userInput: string = '';
	toggleValuesJson: any = {};
	linksDataForTransaction: any = [];
	linkType: any;
	feedData: any;
	currentFormNumber: any = "1";
	currentDomID: any = "1";
	currentRowIndex: any = "1";
	isPreventItemChange: boolean = false;
	isPreventPopHelpItemChange: boolean = false;
	previousFieldValue: any;
	deletedRowIndex: any = '0';
	isAddDetail: boolean = false;
	isLoading: boolean = false;
	checkValidationError: boolean = false;
	@ViewChild('textbox') textbox: BBTextboxComponent | any;
	@ViewChild('textarea') textarea: BBTextAreaComponent | any;
	bbconfirmBox: any = null;
	pdfSrc: boolean = false;
	optionsMap:Map<string, any> = new Map();
	labelMapData: Map<string, any> = new Map();
	feedFormData: any = {};
	objFormDetailsJson: any = {};
	detailFormJsonArr: any = [];
	compTitle: any = '';
	@ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
	@ViewChild(BbAutosuggestTransactionComponent) bbAutosuggestTransactionComponent: BbAutosuggestTransactionComponent | any;
	isPreventEnterKeyItemChange: boolean = false;
	activeDetailAutoSuggest: BbAutosuggestTransactionComponent | null = null;
	columnsObjArray: any = {};
	finalColumnsObjArray: any = {};
	primaryKeyArray: any = {};
	@ViewChild('OpenAgGrid') openAgGrid: BBAgGridComponent | any;
	overLayForAgGridView: OverlayRef | any;
	gridData: any = {};
	selectedDetailRowIndex: number = 0;
	actionArrayForForms: any = {};
	filteredActionArrayForForms: any = {};
	isHeaderActionButton: boolean = false;
	currentAllFormData: any;
	innerValue: any;
	private onChange: (value: any) => void = () => {};
	private onTouched: () => void = () => {};
	openRowCount: any = {};
	formWiseFormatJson: any = {};
	formWiseRequiredFieldsJson: any = {};
	keyAscOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
		return a.key.localeCompare(b.key);
	};
	objSqlModelData: any = [];
	tokenID: any = '';
	jSessionID: any = '';
	formWiseMap: any = {};
	objFormWiseJson: any = {};
	private pendingFieldChangePromise: Promise<void> | null = null;
	private pendingFieldChangeResolve: (() => void) | null = null;
	private pendingClickTarget: HTMLElement | null = null;
	private focusNextAfterItemChange: boolean = false;
	
    constructor(public _extractTempletService: SimpleEditorService, public datePipe: DatePipe, public dialog: MatDialog, private overlay: Overlay, private viewContainerRef: ViewContainerRef, public renderer: Renderer2, private itemChangeUtils:ItemChangeUtils,private transActionUtility: TransActionUtility, private cdr: ChangeDetectorRef, private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer, private ngZone: NgZone, private overlayContainer: OverlayContainer)
	{
		this.confirmBox = new ConfirmBoxComponent(dialog);
		this.bbconfirmBox = new BBConfirmBoxComponent(dialog);
		iconRegistry.addSvgIconLiteral(
			'add',
			sanitizer.bypassSecurityTrustHtml(`
			<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
				<path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
			</svg>
			`)
		);
	}

	writeValue(value: any): void {
		this.innerValue = value;
		// update UI if necessary
	}

	registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	setDisabledState?(isDisabled: boolean): void {
		// handle disabling input if needed
	}

	// call this method when your component changes value
	updateValue(value: any) {
		this.innerValue = value;
		this.onChange(value);
		this.onTouched();
	}
	
	private _isInitialized = false;

	ngDoCheck()
	{
		// Cache is now cleared explicitly after item change responses and row selection
		// instead of on every change detection cycle
	}

	ngOnInit()
	{
		// Prevent duplicate initialization
		if (this._isInitialized) {
			console.log('SimpleEditorComponent already initialized, skipping...');
			return;
		}
		this._isInitialized = true;

		// Subscribe to loading state for showing/hiding loading overlay
		this._extractTempletService.loading$.subscribe((flag: boolean) => {
			this.isLoading = flag;
			this.cdr.reattach();
			this.cdr.detectChanges();
		});

		console.log('print inside simple editor v18 ngoninit:::',this.pluginMetadata);
		// document.addEventListener('click', this.onClick);
		// document.addEventListener('keydown', this.onKeyDown);
		let tokenId = '';
		if (this.pluginMetadata)
		{
			this._extractTempletService.allValidationResponse = {};
			let compData = this.pluginMetadata["compData"];
			if (compData) 
			{
				let contentData = compData["contentData"];
				if (contentData) 
				{
					let tmpData:any = {};
					tmpData["DOC_ID"] = contentData["docId"];
					tmpData["FILE_TYPE"] = contentData["fileType"];
					tmpData["DOC_NAME"] = contentData["docName"];
				}
				this.editFlag = compData["EDIT_FLAG"];
				this.pkValues = compData["PK_VALUES"];
				this.editorId = compData["EDITOR_ID"];
				this.refSer = compData["REF_SER"];
				this.objName = compData["OBJ_NAME"];
				this.numOfForms = compData['NO_OF_FORMS'];
				this.objHeaderImg = "/ibase/images/menuImages/mob/" + this.objName + "_header.png";
				tokenId = compData['TOKEN_ID'];
				console.log('print tokenId 224::::::::',tokenId);
				this._extractTempletService.tokenID = tokenId;
				let jSessionId = compData['JSESSIONID'];
				// If JSESSIONID is empty, try to get from browser cookies
				if(!jSessionId || jSessionId === '') {
					const cookies = document.cookie.split(';');
					for(let cookie of cookies) {
						const [name, value] = cookie.trim().split('=');
						if(name === 'JSESSIONID') {
							jSessionId = value;
							break;
						}
					}
				}
				console.log('print jSessionId 227::::::::',jSessionId);
				this._extractTempletService.jSessionId = jSessionId;

				let hostName = compData['HOST_NAME'];
				this._extractTempletService.hostName = hostName;

				// ACTION = FIRST_CALL_BROWSER
				this._extractTempletService.setLoading(true);
				this._extractTempletService.getAddData(this.objName, '1', compData['OBJ_CTX'], this.editorId, this.editFlag, this.pkValues, this.numOfForms, '', this.editorId, (response:any) =>
				{
					this._extractTempletService.setLoading(false);
					// console.log('print response 231::::::::',response);
					// Handle error response
					if(response && response.status && response.status == 'error')
					{
						const errorMsg = response.message || 'Failed to load data';
						console.error('getAddData error:', errorMsg);
						this.bbconfirmBox.alert('Error', errorMsg, '').subscribe((resp: any) => {
							console.log('Error alert closed');
						});
						return;
					}

					// Handle token expired / Reject response
					if(response && response.status && response.status == 'Reject')
					{
						const errorMsg = (response.data && response.data.message) ? response.data.message : 'Session rejected. Please sign in again.';
						console.error('getAddData Reject:', errorMsg);
						this.bbconfirmBox.alert('Error', errorMsg, '').subscribe((resp: any) => {
							console.log('Reject alert closed');
						});
						return;
					}

					// Handle exception response
					if(response && response.status && response.status == 'exception')
					{
						let errorMsg = 'System Exception';
						// Check for Errors nested in data.Root.Errors
						if(response.data && response.data.Root && response.data.Root.Errors) {
							const errorData = response.data.Root.Errors.error || response.data.Root.Errors;
							errorMsg = errorData.description || errorData.message || errorMsg;
						}
						console.error('getAddData exception:', errorMsg);
						this.bbconfirmBox.alert('Error', errorMsg, '').subscribe((resp: any) => {
							console.log('Exception alert closed');
						});
						return;
					}

					// Check for Errors in response (top-level)
					if(response && response.Errors)
					{
						const errorData = response.Errors.error || response.Errors;
						const errorMsg = errorData.message || 'An error occurred';
						console.error('getAddData error:', errorMsg);
						this.bbconfirmBox.alert('Error', errorMsg, errorData.trace || '').subscribe((resp: any) => {
							console.log('Error alert closed');
						});
						return;
					}

					if(response && response.status && response.status == 'success')
					{
						// Extract JSESSIONID from getAddData response if available
						let jsessionIdd = response.JSESSIONID || response.jsessionId;
						if(!jsessionIdd && response.data) {
							jsessionIdd = response.data.JSESSIONID || response.data.jsessionId;
						}
						// If still not found, try to get from browser cookies (set by server via Set-Cookie)
						if(!jsessionIdd) {
							const cookies = document.cookie.split(';');
							for(let cookie of cookies) {
								const [name, value] = cookie.trim().split('=');
								if(name === 'JSESSIONID') {
									jsessionIdd = value;
									break;
								}
							}
						}
						if(jsessionIdd) {
							console.log('print JSESSIONID from getAddData response:::',jsessionIdd);
							this._extractTempletService.jSessionId = jsessionIdd;
							sessionStorage.setItem('JSESSIONID', jsessionIdd);
						}
						console.log('print jsessionIdd 307::::::::',jsessionIdd);
						this.tokenID = this._extractTempletService.tokenID;
						console.log('print getAddData this.tokenID:::',this.tokenID);
						this.jSessionID = this._extractTempletService.jSessionId;
						console.log('print JSESSIONID from getAddData this.jSessionID:::',this.jSessionID);
						// Process Detail1 (header/first form) - stored flat in allformValues
						if(response.data && response.data['Detail1'])
						{
							let firstFormData = response.data['Detail1'];
							for (let key in firstFormData)
							{
								let value = firstFormData[key];
								if(value == null || value == undefined)
								{
									this.allformValues[key] = '';
								}
								else
								{
									if (value && typeof value === 'object')
									{
										// Attribute object has pkNames, selected, status, updateFlag but no content property
										// JSON-stringify it so buildChgStr can reconstruct ORIG_ATTRIBUTE_NODE for save
										if(key === 'attribute')
										{
											this.allformValues[key] = JSON.stringify(value);
											this.allformValues[key+"_protect"] = "0";
											this.allformValues[key+"_visible"] = "";
										}
										else if(value.content != undefined)
										{
											this.allformValues[key] = (value.content == null) ? '' : value.content;
											if(value.protect != undefined)
											{
												this.allformValues[key+"_protect"] = value.protect;
											}
											else
											{
												this.allformValues[key+"_protect"] = "0"
											}
											if(value.visible != undefined)
											{
												this.allformValues[key+"_visible"] = value.visible;
											}
											else
											{
												this.allformValues[key+"_visible"] = "";
											}
										}
										else
										{
											this.allformValues[key] = '';
											this.allformValues[key+"_protect"] = "0"
											this.allformValues[key+"_visible"] = "";
										}
									}
									else
									{
										this.allformValues[key] = value;
										this.allformValues[key+"_protect"] = "0"
										this.allformValues[key+"_visible"] = ""
									}
								}
							}
							console.log('print this.allformValues 396::::::::',this.allformValues);
						}
						// Process Detail2, Detail3, ... DetailN - stored as arrays in allformValues
						for(let formIdx = 2; formIdx <= this.numOfForms; formIdx++)
						{
							let currentDetail = 'Detail' + formIdx;
							if(response.data && response.data[currentDetail])
							{
								let detailData = response.data[currentDetail];
								let detailArray: any = [];
								// If detailData is not an array (single row), wrap it
								if(!Array.isArray(detailData))
								{
									detailData = [detailData];
								}
								for(let j = 0; j < detailData.length; j++)
								{
									let rowData: any = {};
									let row = detailData[j];
									for(let key in row)
									{
										let value = row[key];
										if(value == null || value == undefined)
										{
											rowData[key] = '';
										}
										else if(value && typeof value === 'object')
										{
											// Attribute object has pkNames, selected, status, updateFlag but no content property
											// JSON-stringify it so buildChgStr can reconstruct ORIG_ATTRIBUTE_NODE for save
											if(key === 'attribute')
											{
												rowData[key] = JSON.stringify(value);
												rowData[key + '_protect'] = '0';
												rowData[key + '_visible'] = '';
											}
											else if(value.content != undefined)
											{
												rowData[key] = (value.content == null) ? '' : value.content;
												rowData[key + '_protect'] = (value.protect != undefined) ? value.protect : '0';
												rowData[key + '_visible'] = (value.visible != undefined) ? value.visible : '';
											}
											else
											{
												rowData[key] = '';
												rowData[key + '_protect'] = (value.protect != undefined) ? value.protect : '0';
												rowData[key + '_visible'] = (value.visible != undefined) ? value.visible : '';
											}
										}
										else
										{
											rowData[key] = value;
											rowData[key + '_protect'] = '0';
											rowData[key + '_visible'] = '';
										}
									}
									detailArray.push(rowData);
								}
								this.allformValues[currentDetail] = detailArray;
								console.log('print this.allformValues[' + currentDetail + ']::::::::',this.allformValues[currentDetail]);
							}
						}
						// Store raw response data for view mode tax screen
						if(response.data)
						{
							this.rawResponseData = response.data;
						}
						this._extractTempletService.setLoading(true);
						this._extractTempletService.getDetailObjData(this.objName, 'T', (resp:any) =>
						{
							this._extractTempletService.setLoading(false);
							// console.log('print resp 299::::::::',JSON.stringify(resp));
							if(resp && resp['status'] && resp['status'] == 'success')
							{
								this.objectDetails = JSON.stringify(resp);
								this.compTitle = resp?.data?.sql_models?.[0]?.sql_model?.form_title;
								// Set taxFormInfo from API transetup response
								if(resp.data && resp.data.transetup && resp.data.transetup.tax_forms)
								{
									this.taxFormInfo = resp.data.transetup.tax_forms;
								}
								this.buildObjFormDetailsJson(resp);
								// Set focus on first editable text field (skip date fields) after form renders
								setTimeout(() => {
									let formContainer = document.getElementById('formContentDivID');
									if(formContainer)
									{
										let allFields = formContainer.querySelectorAll('.expandGroupBoxChild input:not([disabled]):not([type="hidden"])');
										for(let i = 0; i < allFields.length; i++)
										{
											let field = allFields[i] as HTMLElement;
											if(!field.closest('.datePickerDiv') && !field.closest('bb-day-picker'))
											{
												field.focus({ preventScroll: true });
												break;
											}
										}
									}
								}, 500);
							}
						});

						this._extractTempletService.getObjData(this.objName, (response:any) =>
						{
							console.log('print response 446::::::::',response);
							if(response && response['status'] && response['status'] == 'Reject')
							{
								const errorMsg = (response.data && response.data.message) ? response.data.message : 'Session rejected. Please sign in again.';
								console.error('getObjData Reject:', errorMsg);
								this.bbconfirmBox.alert('Error', errorMsg, '').subscribe((resp: any) => {});
								return;
							}
							if(response && response['status'] && (response['status'] == 'exception' || response['status'] == 'error'))
							{
								let errorMsg = 'System Exception';
								if(response.data && response.data.Root && response.data.Root.Errors) {
									const errorData = response.data.Root.Errors.error || response.data.Root.Errors;
									errorMsg = errorData.description || errorData.message || errorMsg;
								} else if(response.message) {
									errorMsg = response.message;
								}
								console.error('getObjData error:', errorMsg);
								this.bbconfirmBox.alert('Error', errorMsg, '').subscribe((resp: any) => {});
								return;
							}
							if(response && response['status'] && response['status'] == 'success')
							{
								this.buildFeedObjFormDetailJson(response);
							}
						});
					}

				});
			}
		}
		
		if (this.pluginMetadata) 
		{
			this.compData = this.pluginMetadata["compData"];
			if (this.compData && this.transMode != 'I')
			{
				// this.loadFormData();
			}
		}
		this.itemChangeUtils.setModel(this.allformValues);
		this.itemChangeUtils.objName = this.objName;
		this.itemChangeUtils.handleResponse = true;
		this.itemChangeUtils.callBackFunction = (_data: any) => {
			this.disabledFieldCache.clear();
			this.cdr.detectChanges();
		};

		if (this.pluginMetadata) 
		{
			this.compData = this.pluginMetadata["compData"];
			/* let tmpData:any = {};
			if (this.compData) 
			{
				tmpData["OBJ_NAME"] = this.compData["OBJ_NAME"];
				tmpData["ACTION"] = "OBJ_POPHELPINFO_ALL";
				tmpData["OBJ_TYPE"] = "";
				tmpData["dummyInt"] = this.compData["dummyInt"];
				tmpData["PKVLAUE"] = "";
				tmpData["EDIT_FLAG"] = "";
				tmpData["RTEURN_TYPE"] = "JSON";

				let paramString = this._extractTempletService.getEncodedParamString(tmpData);
				let url = this._extractTempletService.getHostURL() + '/ibase/RIAWizardHandlerServlet';
				this._extractTempletService.isFromAttachPdf = false;
				this._extractTempletService.sendRequest(url, paramString, (objPophelp: any) => {
					let callbackRespNew = objPophelp.split('%%SEP%%');
					objPophelp = callbackRespNew[0];
					let isError = callbackRespNew[1].trim();

					if (!(isError == 'true')) 
					{
						let objPophelpNew:any = {} = JSON.parse(objPophelp);
						if (objPophelpNew && objPophelpNew!.ROOT) 
						{
							if (objPophelpNew.ROOT.POPUP != null) 
							{
								let popupLen = objPophelpNew.ROOT.POPUP.length;
								for (let i = 0; i < popupLen; i++) 
								{
									
									this.pophelpDataList.push(objPophelpNew.ROOT.POPUP[i]);
								}

								
								for (let i = 0; i < this.pophelpDataList.length; i++)
								{
									let popHelpFldName: string = this.pophelpDataList[i]['attrib']['@FIELD_NAME'].toLowerCase();

									this.popHelpFieldList.push(popHelpFldName);
									this.popHelpFieldSet.add(popHelpFldName);
									this.pophelpDataMap.set(popHelpFldName, this.pophelpDataList[i]);
								}
							}
						}
					}
				});
			} */

			
			/* tmpData["ACTION"] = "OBJ_POPHELPINFO_ALL_X";
			let paramString1 = this._extractTempletService.getEncodedParamString(tmpData);
			let url = this._extractTempletService.getHostURL() + '/ibase/RIAWizardHandlerServlet';
			this._extractTempletService.isFromAttachPdf = false;
			this._extractTempletService.sendRequest(url, paramString1, (objPophelpDataX:any) => {
				let callbackRespNew = objPophelpDataX.split('%%SEP%%');
				objPophelpDataX = callbackRespNew[0];
				let isError = callbackRespNew[1].trim();

				if (!(isError == 'true')) 
				{
					let objPophelpNew = {} = JSON.parse(objPophelpDataX);
					if (objPophelpNew && objPophelpNew!.ROOT) 
					{
						if (objPophelpNew.ROOT.POPUP != null) 
						{
							let popupLen = objPophelpNew.ROOT.POPUP.length;
							for (let i = 0; i < popupLen; i++) 
							{
								let popHelpFldName: string | any = objPophelpNew.ROOT.POPUP[i]['attrib']['@FIELD_NAME'].toLowerCase()
								
								if (!this.popHelpFieldSet.has(popHelpFldName))
								{
									this.pophelpDataList.push(objPophelpNew.ROOT.POPUP[i]);
								}
							}
							this.popHelpFieldList = [];
							this.popHelpFieldSet.clear();
							this.pophelpDataMap.clear();
							for (let i = 0; i < this.pophelpDataList.length; i++)
							{
								let popHelpFldName: string | any = this.pophelpDataList[i]['attrib']['@FIELD_NAME'].toLowerCase();

								this.popHelpFieldList.push(popHelpFldName);
								this.popHelpFieldSet.add(popHelpFldName);
								this.pophelpDataMap.set(popHelpFldName, this.pophelpDataList[i]);
							}
						}
					}
				}
			}); */
		}
		
		if (this.pluginMetadata) 
		{
			this.compData = this.pluginMetadata["compData"];

			/* if (this.compData) 
			{
				let tmpData:any = {};
				tmpData["ACTION"] = "OBJ_DETAILS";
				tmpData["PAGE_CTX"] = "1";
				tmpData["OBJ_TYPE"] = "T";
				tmpData["OBJ_NAME"] = this.compData["OBJ_NAME"];
				tmpData["dummyInt"] = this.compData["dummyInt"];
				tmpData["RTEURN_TYPE"] = "JSON";

				let paramString = this._extractTempletService.getEncodedParamString(tmpData);
				let url = this._extractTempletService.getHostURL() + '/ibase/WEBITMRIARequestHandlerServlet';

				this._extractTempletService.isFromAttachPdf = false;
				this._extractTempletService.sendRequest(url, paramString, (objDetailsData:any) => {
					let callbackRespNew = objDetailsData.split('%%SEP%%');
					objDetailsData = callbackRespNew[0];
					let isError = callbackRespNew[1].trim();
					if (!(isError == 'true')) 
					{
                        let objdetailsNew = {} = JSON.parse(objDetailsData); 
                        if(this.transMode != 'I' && objdetailsNew && objdetailsNew!.ROOT)
                        { 
                            if (objdetailsNew.ROOT.Transaction.TRANSETUP != null)
                            { 
                                this.taxFormInfo = objdetailsNew.ROOT.Transaction.TRANSETUP['TAX_FORMS']; 
                            } 
							if(objdetailsNew.ROOT.Transaction && objdetailsNew.ROOT.Transaction.Form)
							{
								{
									let objectFormDetailData = objdetailsNew.ROOT.Transaction.Form;
									if(objectFormDetailData && objectFormDetailData.length > 0)
									{
										this.compTitle = objectFormDetailData[0]['Title'];
									}
									else
									{
										this.compTitle = objectFormDetailData['Title'];
									}
									this.getObjMetadata(objectFormDetailData);
								}	
							}
                        }
						this.buildItemChangeList(objDetailsData);
						if(this.transMode == 'I')
						{
							this.updateChgStr('1', null);
						}
					}
					this.objectDetails = objDetailsData;
					
					let currentObjdetails = {} = JSON.parse(this.objectDetails); 
					let detailsLinkData = currentObjdetails.ROOT.Transaction.Form;
					let maxFormNo = Math.max(...detailsLinkData.map((form: any) => parseInt(form.no)));
					let actionData = currentObjdetails.ROOT.Transaction.ACTIONS.action;
					for (let i = 0; i < actionData.length; i++)
					{
						let action = actionData[i];
    					let formNo = action.formNo;

						if (formNo <= maxFormNo) 
						{
							if (!this.actionArrayForForms[formNo]) 
							{
								this.actionArrayForForms[formNo] = [];
							}
							this.actionArrayForForms[formNo].push(action);
    					}
					}
					
					for(let i in this.actionArrayForForms)
					{
						if(this.actionArrayForForms[i])
						{
							this.filteredActionArrayForForms[i] = this.actionArrayForForms[i].filter((action: any) => action.page_context === '1')
						}
					}
				});
			}
			else
			{
				this.buildItemChangeList(this.objectDetails);
				let objdetailsNew = {} = JSON.parse(this.objectDetails); 
				if (objdetailsNew && objdetailsNew!.ROOT)
				{ 
					if (objdetailsNew.ROOT.Transaction.TRANSETUP != null)
					{ 
						this.taxFormInfo = objdetailsNew.ROOT.Transaction.TRANSETUP['TAX_FORMS']; 
					} 
				}
				if(this.transMode == 'I')
				{
					this.updateChgStr('1', null);
				}
			} */
		}

//		this._extractTempletService.getUserInfo().subscribe(/* happy path */ (UserInfo: any) => { 
//          this.userInfo = UserInfo;
//        });
        
        	this._extractTempletService.data$.subscribe(res => {
			// console.log("_extractTempletService.data$.subscribe 002 ::: ",res)
			if(res)
			{
				const { title, data } = res;
				let procRespVal = res['proResp'];
				if(procRespVal != null && procRespVal == "D")
				{
					this.setSimpleLayoutDetailData(title, data, procRespVal)
				}
				else if(procRespVal != null && procRespVal == "F")
				{
					this.setSimpleLayoutFreeFormData(title, data, procRespVal)
				}
				
			}
		})
	}

	formatFieldsValue() 
	{
        try
        {
            let formNo = this.compData['NO_OF_FORMS'];
            let detailData: any = {};
            for (let i = 0; i < formNo; i++) 
            {
                let formDetail = 'Detail' + (i + 1);
                let detailLen;
                if (formDetail == 'Detail1') 
                {
                    detailData = this.allformValues;
                    for (let key of Object.keys(detailData)) 
                    {
						let id = formDetail + '.1.' + key;
						let value = this.allformValues[key];
						if(this.checkIsDateFormat(key, i+1))
						{
							if (typeof value === 'string' && value) 
							{
								this.allformValues[key] = this.convertStringToDate(value);
							}
						}
                    }
                }
                else if (this.allformValues && this.allformValues.hasOwnProperty(formDetail)) 
                {
                    detailLen = this.allformValues[formDetail].length;
                    for (let j = 0; j < detailLen; j++) 
                    {
                        detailData = this.allformValues[formDetail][j];
                        for (let key of Object.keys(detailData)) 
                        {
							let id = formDetail + '.' + (detailData['domID']) + '.' + key;
							let value = this.allformValues[formDetail][j][key];
							if(this.checkIsDateFormat(key, i+1))
							{
								if (typeof value === 'string' && value) 
								{
									this.allformValues[formDetail][j][key] = this.convertStringToDate(value);
								}
							}
                        }
                    }
                }
            }
			this.cdr.markForCheck();
        }
        catch (e:any) 
		{
			console.log('Exception inside formatFieldsValue ', e.message);
		}
	}

	ngAfterViewInit()
	{
		// Fix CDK overlay container positioning - ensure it's at document.body level
		this.fixCdkOverlayContainer();

		// Register keydown listener outside Angular zone to prevent change detection on every keystroke
		this.ngZone.runOutsideAngular(() => {
			document.addEventListener('keydown', this.onKeyDown);
		});

		try
		{
			const observer = new ResizeObserver(() => {
				this.adjustGroupBox();
			});
			const elementToObserve = this.resizeElement.nativeElement;
			observer.observe(elementToObserve);
		}
		catch (e: any)
		{
			console.log('Exception inside ResizeObserver ', e.message);
		}
		// this.popHelp.formWiseFormatJson = this.formWiseFormatJson;
		// setTimeout(() => {
			// this.formatFieldsValue();
		// }, 3000);
		let contentElement = document.getElementsByClassName("extract-template-content");
		let contentChildElement = contentElement[0];
		if (contentChildElement) 
		{
			let bbContentPluginElement = contentChildElement?.parentElement?.parentElement;
			if (bbContentPluginElement) 
			{
				let name = bbContentPluginElement.getAttribute("name");
				if (name == "bbContentPlugin") 
				{
					bbContentPluginElement.setAttribute('style', 'position: absolute; width: 100%; height: 100%;');
				}
			}

			let dbcontentElement:any = contentChildElement?.parentElement?.parentElement?.parentElement;
			dbcontentElement.setAttribute('style', 'overflow: hidden !important; background-color: transparent;');

			let headerElem = document.getElementsByClassName("tran-editor-main-panel")[0];
			if(headerElem != undefined)
			{
				let parentHeader:any = headerElem.parentElement;
				parentHeader['style'].width = "100% !important";
			}

			if (dbcontentElement) 
			{
				let className = dbcontentElement.getAttribute("class");
				if (className.trim() == "dbcontentMenuPanel") 
				{
					
				}
			}
		}


		let elem = document.getElementsByClassName('dbcontentMenuPanel')[0];
		let positionOfPopHelp:any = {};
		if (elem) 
		{
			let position = document.getElementsByClassName('dbcontentMenuPanel')[0].getBoundingClientRect();

			positionOfPopHelp['width'] = '500';
			
			positionOfPopHelp['top'] = position.top + 9;
		
			positionOfPopHelp['height'] = position.height - 55;
			positionOfPopHelp['left'] = position.left + 1073;

			this.positionPopHelp = positionOfPopHelp;
		}
		else if(document.getElementById('simple-layout-ctr_simple_editor'))
		{
			let element = document.getElementById('simple-layout-ctr_simple_editor');
			if(element)
			{
				let position = element.getBoundingClientRect();

				positionOfPopHelp['width'] = '500';
				
				positionOfPopHelp['top'] = position.top - 23;
			
				positionOfPopHelp['height'] = position.height - 55;
				positionOfPopHelp['left'] = position.left;

				this.positionPopHelp = positionOfPopHelp;
			}
		}
		
        if( document.getElementById("simple_editor") != null && document.getElementById("simple_editor_simple") != null)
        {
            document.getElementById("simple_editor")!.style.height = "100%";
            document.getElementById("simple_editor")!.style.width = "100%";
            document.getElementById("simple_editor")!.style.position = "absolute";
            document.getElementById("simple_editor")!.style.top = '0px';
           
			if(document.getElementById("simple_editor")!.childNodes[0] != null  )
            {
                const parent: HTMLElement | any= document.getElementById("simple_editor");
                const child = parent.children[0];
                this.renderer.setStyle(child, 'display', 'block');
                this.renderer.setStyle(child, 'width', '100%');
                this.renderer.setStyle(child, 'height', '100%');
            }
		} 
		

		if( document.getElementById("simple_editor") != null )
		{
			document.getElementById("simple_editor")!.style.height = "100%";
			document.getElementById("simple_editor")!.style.width = "100%";
			document.getElementById("simple_editor")!.style.display = "flex";
			document.getElementById("simple_editor")!.style.position = "absolute";
			
			if(document.getElementById("simple_editor")!.childNodes[0] != null  )
			{
				const parent: HTMLElement | any= document.getElementById('simple_editor');
				const child = parent.children[0];
				this.renderer.setStyle(child, 'width', '100%');
				this.renderer.setStyle(child, 'display', 'flex');
				this.renderer.setStyle(child, 'height', '100%');
			}
		}
		if( document.getElementById("E12TransEditorContainer-mainpanel_visual_definition") != null )
		{
			document.getElementById("E12TransEditorContainer-mainpanel_visual_definition")!.style.width = "100%";
		}
		let headerClose: any = document.getElementById('e12popUpPnl-close');
		if(headerClose != undefined)
		{
			headerClose.classList.add('headerCloseBtn');
		}
		this.wrapFields();
	}
	wrapFields() 
	{
		let noPlaceholderIsDisableElements = document.querySelectorAll('.noPlaceholderIsDisable');
	
		noPlaceholderIsDisableElements.forEach(element => {
			if(element)
			{
				let matInfixDiv: any = element.getElementsByClassName('mat-form-field-infix');
				if (matInfixDiv && matInfixDiv.length > 0) 
				{
					for (const div of matInfixDiv) 
					{
						div.setAttribute('style', 'padding: 0px !important');
					}
				}
				let previousSibling = element.previousElementSibling;
				while (previousSibling && !previousSibling.classList.contains('mainInputField')) 
				{
					previousSibling = previousSibling.previousElementSibling;
				}
				if (previousSibling) 
				{
					let wrapperDiv = this.renderer.createElement('div');
					this.renderer.setAttribute(wrapperDiv, 'id', 'columnDivID');
					this.renderer.addClass(wrapperDiv, 'columnDiv'); 
					this.renderer.insertBefore(previousSibling.parentNode, wrapperDiv, previousSibling);
					this.renderer.appendChild(wrapperDiv, previousSibling);
					this.renderer.appendChild(wrapperDiv, element);
				}		
			}
		});

		let mainInputFields = document.querySelectorAll('.mainInputField');
		mainInputFields.forEach(mainInputField => {
			let elementsToWrap = [mainInputField];
			let nextSibling = mainInputField.nextElementSibling;
			while (nextSibling && nextSibling.classList.contains('noPlaceholderNotDisable')) 
			{
				elementsToWrap.push(nextSibling);
				nextSibling = nextSibling.nextElementSibling;
			}
			if (elementsToWrap.length > 1) 
			{
				let wrapperDiv = this.renderer.createElement('div');
				this.renderer.setAttribute(wrapperDiv, 'id', 'mainDivID');
				this.renderer.addClass(wrapperDiv, 'mainDivClass');
				this.renderer.insertBefore(mainInputField.parentNode, wrapperDiv, mainInputField);
				elementsToWrap.forEach(element => {
				this.renderer.appendChild(wrapperDiv, element);
				});
			}
		});
	}
	  
	/**
	 * Fix z-index on a specific overlay instance so its backdrop and pane
	 * stack above the main container buttons (save, close, more).
	 * Only affects the specific overlay — not global CDK styles.
	 */
	fixOverlayZIndex(overlayRef: OverlayRef)
	{
		try
		{
			const pane = overlayRef.overlayElement;
			if(!pane) return;

			// Set position and z-index on the overlay pane.
			// position is required because bb-open-pophelp's ::ng-deep sets position:static
			// which makes z-index ineffective. Inline !important overrides stylesheet !important.
			pane.style.setProperty('z-index', '1050', 'important');
			pane.style.setProperty('pointer-events', 'auto', 'important');
			// Only set position if not already set to fixed (e.g. tax overlay sets its own position)
			if(!pane.style.getPropertyValue('position') || pane.style.getPropertyValue('position') === 'static')
			{
				pane.style.setProperty('position', 'relative', 'important');
			}

			// Fix the parent wrapper (cdk-global-overlay-wrapper)
			const wrapper = pane.parentElement;
			if(wrapper && wrapper.classList.contains('cdk-global-overlay-wrapper'))
			{
				wrapper.style.setProperty('z-index', '1050', 'important');
				wrapper.style.setProperty('position', 'fixed', 'important');
				wrapper.style.setProperty('top', '0', 'important');
				wrapper.style.setProperty('left', '0', 'important');
				wrapper.style.setProperty('right', '0', 'important');
				wrapper.style.setProperty('bottom', '0', 'important');
				wrapper.style.setProperty('width', '100%', 'important');
				wrapper.style.setProperty('height', '100%', 'important');
			}

			// Fix the backdrop — it's a sibling of the wrapper inside the container
			const container = overlayRef.overlayElement.closest('.cdk-overlay-container');
			if(container)
			{
				const backdrops = container.querySelectorAll('.cdk-overlay-backdrop');
				if(backdrops.length > 0)
				{
					const lastBackdrop = backdrops[backdrops.length - 1] as HTMLElement;
					lastBackdrop.style.setProperty('z-index', '1049', 'important');
					lastBackdrop.style.setProperty('position', 'fixed', 'important');
					lastBackdrop.style.setProperty('top', '0', 'important');
					lastBackdrop.style.setProperty('left', '0', 'important');
					lastBackdrop.style.setProperty('right', '0', 'important');
					lastBackdrop.style.setProperty('bottom', '0', 'important');
					lastBackdrop.style.setProperty('width', '100%', 'important');
					lastBackdrop.style.setProperty('height', '100%', 'important');
					lastBackdrop.style.setProperty('pointer-events', 'auto', 'important');
				}
			}
		}
		catch(e: any)
		{
			console.log('Error in fixOverlayZIndex:', e.message);
		}
	}

	/**
	 * Detect MatDialog overlays (error/confirm popups) and fix their backdrop z-index
	 * so they appear above feed-view and tax overlays.
	 * Called from MutationObserver when new overlay nodes are added.
	 */
	fixDialogOverlayZIndex(containerEl: HTMLElement)
	{
		try
		{
			const dialogPanes = containerEl.querySelectorAll('.cdk-overlay-pane');
			dialogPanes.forEach((paneEl) => {
				const el = paneEl as HTMLElement;
				const hasDialog = el.querySelector('.mat-mdc-dialog-container, .mat-dialog-container, .popup_content_error');
				if(!hasDialog) return;

				// Fix the pane
				el.style.setProperty('z-index', '99999', 'important');
				el.style.setProperty('position', 'relative', 'important');
				el.style.setProperty('pointer-events', 'auto', 'important');

				// Fix the wrapper
				const wrapper = el.parentElement;
				if(wrapper && wrapper.classList.contains('cdk-global-overlay-wrapper'))
				{
					wrapper.style.setProperty('z-index', '99999', 'important');
				}

				// Fix the backdrop — find the backdrop that precedes this wrapper
				if(wrapper && wrapper.previousElementSibling && wrapper.previousElementSibling.classList.contains('cdk-overlay-backdrop'))
				{
					const backdrop = wrapper.previousElementSibling as HTMLElement;
					backdrop.style.setProperty('z-index', '99998', 'important');
					backdrop.style.setProperty('position', 'fixed', 'important');
					backdrop.style.setProperty('top', '0', 'important');
					backdrop.style.setProperty('left', '0', 'important');
					backdrop.style.setProperty('right', '0', 'important');
					backdrop.style.setProperty('bottom', '0', 'important');
					backdrop.style.setProperty('width', '100%', 'important');
					backdrop.style.setProperty('height', '100%', 'important');
					backdrop.style.setProperty('pointer-events', 'auto', 'important');
				}
			});
		}
		catch(e: any)
		{
			console.log('Error in fixDialogOverlayZIndex:', e.message);
		}
	}

	fixCdkOverlayContainer()
	{
		try
		{
			const containerEl = this.overlayContainer.getContainerElement();
			if(!containerEl) return;

			// Move to document.body if not already there
			if(containerEl.parentElement !== document.body)
			{
				document.body.appendChild(containerEl);
			}

			// Inject CSS fix: Override CDK's inline "position: static" on overlay panes
			const styleId = 'cdk-overlay-fix-styles';
			if(!document.getElementById(styleId))
			{
				const style = document.createElement('style');
				style.id = styleId;
				style.textContent = `
					.cdk-overlay-pane:not(.tax-overlay-panel):not(.pophelp-overlay-pane) {
						position: absolute !important;
					}
					.pophelp-overlay-pane {
						position: static !important;
						pointer-events: auto !important;
					}
					.cdk-overlay-container:has(.pophelp-overlay-pane) {
						z-index: 99999 !important;
					}
					.cdk-global-overlay-wrapper:has(.pophelp-overlay-pane) {
						position: fixed !important;
						top: 0 !important;
						left: 0 !important;
						right: 0 !important;
						bottom: 0 !important;
						z-index: 99999 !important;
						justify-content: flex-end !important;
						pointer-events: none !important;
					}
					.pophelp-overlay-pane {
						pointer-events: auto !important;
					}
					.cdk-overlay-backdrop {
						pointer-events: auto !important;
					}
					/* Error/confirm dialog must stack above feed-view and tax overlays */
					.cdk-global-overlay-wrapper:has(.mat-mdc-dialog-container),
					.cdk-global-overlay-wrapper:has(.mat-dialog-container),
					.cdk-global-overlay-wrapper:has(.popup_content_error) {
						z-index: 99999 !important;
						position: fixed !important;
						top: 0 !important;
						left: 0 !important;
						right: 0 !important;
						bottom: 0 !important;
						width: 100% !important;
						height: 100% !important;
						display: flex !important;
						justify-content: center !important;
						align-items: center !important;
					}
					.cdk-overlay-pane:has(.mat-mdc-dialog-container),
					.cdk-overlay-pane:has(.mat-dialog-container),
					.cdk-overlay-pane:has(.popup_content_error) {
						z-index: 99999 !important;
						position: relative !important;
						pointer-events: auto !important;
					}
				`;
				document.head.appendChild(style);
			}

			// Track last clicked datepicker toggle and menu trigger
			const self = this;
			document.addEventListener('click', (e) => {
				const target = e.target as HTMLElement;
				if(!target) return;

				// Track datepicker toggle clicks - just record which input was clicked
				// MutationObserver handles positioning when overlay appears
				const toggle = target.closest('mat-datepicker-toggle');
				if(toggle)
				{
					const parent = toggle.parentElement;
					if(parent)
					{
						const input = parent.querySelector('input');
						if(input) self._lastDatepickerInput = input;
					}
				}

				// Track menu trigger clicks and reposition directly (no hide/show cycle)
				const menuBtn = target.closest('.showmore-button, .mat-mdc-menu-trigger, [mat-icon-button]');
				if(menuBtn && (menuBtn.hasAttribute('ng-reflect-mat-menu-trigger-for') || menuBtn.classList.contains('mat-mdc-menu-trigger') || menuBtn.classList.contains('showmore-button')))
				{
					self._lastMenuTrigger = menuBtn as HTMLElement;
					// Reposition menu directly after CDK renders it (handles overlay reuse on scroll)
					setTimeout(() => self.repositionMenuOverlay(containerEl), 50);
				}
			}, true); // capture phase

			// Watch for new overlay nodes and fix positioning
			const observer = new MutationObserver((mutations) => {
				if(self._isFixingOverlay) return; // Prevent re-entry loop
				for(const mutation of mutations)
				{
					if(mutation.addedNodes.length > 0)
					{
						self.fixOverlayPositioning(containerEl);
						// Fix z-index for dialog overlays (error/confirm popups)
						self.fixDialogOverlayZIndex(containerEl);
						break; // Only need to run once per batch
					}
				}
			});
			observer.observe(containerEl, { childList: true, subtree: true });
		}
		catch(e: any)
		{
			console.log('Error in fixCdkOverlayContainer:', e.message);
		}
	}

	fixOverlayPositioning(containerEl: HTMLElement)
	{
		if(this._isFixingOverlay) return; // Prevent re-entry from MutationObserver loop
		this._isFixingOverlay = true;

		try
		{
			// Force BBox to fill container (like CDK's exact-position mode)
			const boxes = containerEl.querySelectorAll('.cdk-overlay-connected-position-bounding-box');
			boxes.forEach(box => {
				const el = box as HTMLElement;
				if(!el.style.top && !el.style.width)
				{
					el.style.top = '0';
					el.style.left = '0';
					el.style.width = '100%';
					el.style.height = '100%';
				}
			});

			// Hide panes at (0,0) immediately to prevent flicker before repositioning
			const allPanes = containerEl.querySelectorAll('.cdk-overlay-pane:not(.pophelp-overlay-pane)');
			allPanes.forEach(pane => {
				const el = pane as HTMLElement;
				const rect = el.getBoundingClientRect();
				if(rect.top === 0 && rect.left === 0 && rect.width > 1)
				{
					el.style.visibility = 'hidden';
				}
			});

			// Try to trigger CDK's deferred apply() by forcing zone stability
			this.ngZone.run(() => {});

			// After a short delay, position overlays stuck at (0,0) and reveal them
			setTimeout(() => {
				try
				{
					const panes = containerEl.querySelectorAll('.cdk-overlay-pane:not(.pophelp-overlay-pane)');
					panes.forEach(pane => {
						const el = pane as HTMLElement;
						const rect = el.getBoundingClientRect();

						// Skip hidden/empty panes (width <= 1)
						if(rect.width <= 1) return;

						// Skip panes already correctly positioned by CDK (not at 0,0)
						if(rect.top !== 0 || rect.left !== 0)
						{
							if(el.style.visibility === 'hidden') el.style.visibility = '';
							return;
						}

						// Find what type of overlay this is and position it
						const datepickerContent = el.querySelector('.mat-datepicker-content, mat-datepicker-content');
						const menuPanel = el.querySelector('.mat-mdc-menu-panel, .mat-menu-panel');

						if(datepickerContent)
						{
							this.positionDatepickerOverlay(el, rect);
						}
						else if(menuPanel)
						{
							this.positionMenuOverlay(el, rect);
						}

						// Reveal after positioning
						el.style.visibility = '';
					});
				}
				finally
				{
					this._isFixingOverlay = false;
				}
			}, 30);
		}
		catch(e)
		{
			this._isFixingOverlay = false;
		}
	}

	// Reposition menu overlay directly from click listener (no hide/show cycle, no observer loop)
	private repositionMenuOverlay(containerEl: HTMLElement)
	{
		const panes = containerEl.querySelectorAll('.cdk-overlay-pane');
		panes.forEach(pane => {
			const el = pane as HTMLElement;
			const menuPanel = el.querySelector('.mat-mdc-menu-panel, .mat-menu-panel');
			if(!menuPanel) return;

			const rect = el.getBoundingClientRect();
			if(rect.width <= 1) return;

			this.positionMenuOverlay(el, rect);
		});
	}

	private positionDatepickerOverlay(el: HTMLElement, rect: DOMRect)
	{
		// Use tracked datepicker input, or fallback to finding one
		let triggerEl: HTMLElement | null = this._lastDatepickerInput;
		if(!triggerEl || triggerEl.offsetParent === null)
		{
			const inputs = document.querySelectorAll('input.mat-datepicker-input');
			inputs.forEach(input => {
				const inputEl = input as HTMLElement;
				if(inputEl.offsetParent !== null) triggerEl = inputEl;
			});
		}
		if(!triggerEl) return;

		const triggerRect = triggerEl.getBoundingClientRect();
		const vpWidth = window.innerWidth;
		const vpHeight = window.innerHeight;
		const overlayWidth = rect.width || 296;
		const overlayHeight = rect.height || 354;

		let top = triggerRect.bottom + 2;
		let left = triggerRect.left;

		// Keep within viewport
		if(left + overlayWidth > vpWidth) left = vpWidth - overlayWidth - 8;
		if(left < 0) left = 8;
		if(top + overlayHeight > vpHeight) top = triggerRect.top - overlayHeight - 2;
		if(top < 0) top = 8;

		el.style.top = top + 'px';
		el.style.left = left + 'px';
	}

	private positionMenuOverlay(el: HTMLElement, rect: DOMRect)
	{
		// Use tracked menu trigger, or fallback to aria-expanded
		let triggerEl: HTMLElement | null = this._lastMenuTrigger;
		if(!triggerEl || triggerEl.offsetParent === null)
		{
			const menuTriggers = document.querySelectorAll('[aria-expanded="true"].showmore-button, [aria-expanded="true"].mat-mdc-menu-trigger, [aria-expanded="true"][mat-icon-button]');
			if(menuTriggers.length > 0)
			{
				triggerEl = menuTriggers[menuTriggers.length - 1] as HTMLElement;
			}
		}
		if(!triggerEl) return;

		const triggerRect = triggerEl.getBoundingClientRect();
		const vpWidth = window.innerWidth;
		const vpHeight = window.innerHeight;
		const overlayWidth = rect.width || 200;
		const overlayHeight = rect.height || 100;

		let top = triggerRect.bottom + 2;
		let left = triggerRect.left;

		// If menu would go off the right edge, open to the left
		if(left + overlayWidth > vpWidth) left = triggerRect.right - overlayWidth;
		if(left + overlayWidth > vpWidth) left = vpWidth - overlayWidth - 8;
		if(left < 0) left = 8;

		// If menu would go off bottom, open above the trigger
		if(top + overlayHeight > vpHeight) top = triggerRect.top - overlayHeight - 2;
		if(top < 0) top = 8;

		el.style.top = top + 'px';
		el.style.left = left + 'px';
	}

	getPosition(e:any)
	{
		let posx = 0;
		let posy = 0;
		if (!e) 
		{
			if((window as any))
			{
				e = (window as any).event;
			}
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
		this.contextMenuX = event.clientX;
		this.contextMenuY = event.clientY;
		this.showContextMenu = true;
		this.cdr.detectChanges();
	}

	closeContextMenu()
	{
		this.showContextMenu = false;
		this.cdr.detectChanges();
	}

	onContextMenuClick(event:any, currElemIdd?:any, isMoreButtonClick?:any) 
	{
		if (isMoreButtonClick == null) 
		{
			this.createExpCollapseOverlay(event);
		}
		let grpBoxCount = document.getElementsByClassName('e12GroupBox').length;
		let currElem:any;
		if (document && document.getElementById(currElemIdd) != null && document.getElementById(currElemIdd)!.children[0] != null) 
		{
			currElem = document.getElementById(currElemIdd)!.children[0];
		}
		this.currElemId = currElemIdd
		let collapseCount = 0;
		let expandCount = 0;
		let totGrpBoxShown = 0;
		let expCollapseTemp: any = document.getElementById('expColpseOptForExtractTemp');
		if (isMoreButtonClick) 
		{
			let elem: Element | any = document.getElementById(currElemIdd);
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
			for (let i = 0; i < grpBoxCount; i++) 
			{
				let grpBoxElem = document.getElementsByClassName('e12GroupBox')[i];
				if(grpBoxElem)
				{
					let styles: string | any = grpBoxElem.getAttribute('style');
					if (styles.includes('display: block')) 
					{
						totGrpBoxShown++;
					}
					let grpBoxElemClassList = grpBoxElem.children[0].classList;
					if (grpBoxElemClassList && grpBoxElemClassList.contains('collapseGroupBox') && styles.includes('display: block')) 
					{
						collapseCount++;
					}
					else if (grpBoxElemClassList && grpBoxElemClassList.contains('expandGroupBox') && styles.includes('display: block')) 
					{
						expandCount++;
					}
				}
			}
			if (currElem.classList.contains('collapseGroupBox') && expCollapseTemp && expCollapseTemp.children[0]) 
			{
				expCollapseTemp.children[0].setAttribute('style', 'display: none');
			}
			else 
			{
				if(expCollapseTemp && expCollapseTemp.children[1])
				{
					expCollapseTemp.children[1].setAttribute('style', 'display: none');
				}
			}
			if (totGrpBoxShown == 1) 
			{
				if(expCollapseTemp && expCollapseTemp.children[2])
				{
					expCollapseTemp.children[2].setAttribute('style', 'display: none');
				}
				if(expCollapseTemp && expCollapseTemp.children[3])
				{
					expCollapseTemp.children[3].setAttribute('style', 'display: none');
				}
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
	}

	hideShowGroupBtn(id:any) 
	{
		let elem:any = document.getElementById(id);
		let grpBoxElem = elem.children[0];
		let arrowElem
		let nextSiblingElem;

		if (grpBoxElem != null)
		{
			if(grpBoxElem.classList.contains('expandGroupBox')) 
			{
				grpBoxElem.classList.remove('expandGroupBox');
				grpBoxElem.classList.add('collapseGroupBox');
			}
			else 
			{
				grpBoxElem.classList.remove('collapseGroupBox');
				grpBoxElem.classList.add('expandGroupBox');
			}
		}

		if(id !== 'simple_editor_Basic')
		{
			arrowElem = elem.children[0].children[1];
			if (arrowElem != null)
			{
				if(arrowElem.classList.contains('vision-ui-arrow_right')) 
				{
					arrowElem.classList.remove('vision-ui-arrow_right');
					arrowElem.classList.add('vision-ui-arrow_down');
				}
				else 
				{
					arrowElem.classList.remove('vision-ui-arrow_down');
					arrowElem.classList.add('vision-ui-arrow_right');
				}
			}
		}

		nextSiblingElem = elem.children[0].nextElementSibling;
		if (nextSiblingElem != null)
		{
			if(nextSiblingElem.classList.contains('expandGroupBoxChild')) 
			{
				nextSiblingElem.classList.remove('expandGroupBoxChild');
				nextSiblingElem.classList.add('collapseGroupBoxChild');
			}
			else 
			{
				nextSiblingElem.classList.remove('collapseGroupBoxChild');
				nextSiblingElem.classList.add('expandGroupBoxChild');
			}
		}
		this.closeContextMenu();
		this.adjustGroupBox();
	}

	hideShowGroupBtnNew(opt:any, isMoreButtonClick?:any) 
	{
		let elem = document.getElementsByClassName('e12GroupBox');
		for (let i = 0; i < elem.length; i++) 
		{
			let grpBoxElem:any = elem[i];
			let firstChildElem = grpBoxElem.children[0];
			let firstChildElemClass = firstChildElem.querySelectorAll('.simple_collapseGroupBox');
			let secondChildElemClass = firstChildElem.querySelectorAll('.simple_expandGroupBox');
			let secndChildElem = grpBoxElem.children[1];
			if (grpBoxElem.getAttribute('style').includes('display: block') && isMoreButtonClick == null) 
			{
				if (opt == 'EX') 
				{
					if(firstChildElemClass.length > 0)
					{
						for (let j = 0; j < firstChildElemClass.length; j++) 
						{
							let currentElement = firstChildElemClass[j];
							if (opt === 'EX' && currentElement.classList.contains('simple_collapseGroupBox')) 
							{
								currentElement.classList.remove('simple_collapseGroupBox');
								currentElement.classList.add('simple_expandGroupBox');
								if(i > 0)
								{
									firstChildElem.children[1].classList.remove('vision-ui-arrow_right');
									firstChildElem.children[1].classList.add('vision-ui-arrow_down');
								}
								secndChildElem.classList.remove('collapseGroupBoxChild');
								secndChildElem.classList.add('expandGroupBoxChild');
							}
						}
					}
				}
				else if (opt == 'CO') 
				{
					for (let k = 0; k < secondChildElemClass.length; k++) 
					{
						let currentElement = secondChildElemClass[k];
						if(currentElement.classList.contains('simple_expandGroupBox'))
						{		
							currentElement.classList.remove('simple_expandGroupBox');
							currentElement.classList.add('simple_collapseGroupBox');		
							if(i > 0)
							{
								firstChildElem.children[1].classList.remove('vision-ui-arrow_down');
								firstChildElem.children[1].classList.add('vision-ui-arrow_right');		
							}		
							secndChildElem.classList.remove('expandGroupBoxChild');		
							secndChildElem.classList.add('collapseGroupBoxChild');
						}
					}
				}
			}
			else 
			{
				if (opt == 'EX') 
				{
					if (i != 0) 
					{
						grpBoxElem.setAttribute('style', 'display: block;');
					}
					if (i != 0 && firstChildElem.classList.contains('expandGroupBox')) 
					{
						grpBoxElem.setAttribute('style', 'display: block;');
						firstChildElem.classList.remove('expandGroupBox');
						firstChildElem.classList.add('collapseGroupBox');
						if(i > 0)
						{
							firstChildElem.children[1].classList.remove('vision-ui-arrow_down');
							firstChildElem.children[1].classList.add('vision-ui-arrow_right');
						}
						secndChildElem.classList.remove('expandGroupBoxChild');
						secndChildElem.classList.add('collapseGroupBoxChild');
					}
				}
				else 
				{
					if (i != 0 && !grpBoxElem.getAttribute('style').includes('display: none')) 
					{
						grpBoxElem.setAttribute('style', 'display: none;');
					}
				}
			}
			this.closeContextMenu();
		}
		this.adjustGroupBox();
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
		if (currentDet == 'Detail1') 
		{
			let allHeaderSections = document.getElementsByClassName('freeFormContentTwoColumn');
			let headerSectionLen = allHeaderSections.length;
			headerLoop:
			for (let i = 0; i < headerSectionLen; i++) 
			{
				let allHeaderSectionChildren = allHeaderSections[i].children;
				for (let j = 0; j < allHeaderSectionChildren.length; j++) 
				{
					let fldElemChildren = allHeaderSectionChildren[j];
					let inputElem:any = fldElemChildren;
					let id;
					let elem: any;
					if (inputElem != null && inputElem.tagName == 'MAT-FORM-FIELD') 
					{
						let elemInput:any = inputElem.firstElementChild.firstElementChild.firstElementChild.firstElementChild;
						id = elemInput.id;
						elem = document.getElementById(id);
						if (elem != null && !elemInput.hasAttribute('disabled'))
						{
							elem.focus({ preventScroll: true });
							break headerLoop;
						}
					}
					else if (inputElem != null)
					{
						id = inputElem.id;
						elem = document.getElementById(id);
						if (elem != null && !elem.classList.contains('disabledFieldAng'))
						{
							elem.focus({ preventScroll: true });
							break headerLoop;
						}
					}
				}
			}
		}
		else if (this.allformValues.hasOwnProperty(currentDet)) 
		{
			let currIndex = this.allformValues[currentDet].length;
			if (this.currentValidationRow && this.currentValidationRow.length > 0) 
			{
				let cuurentValidationData: any = this.currentValidationRow[0];
				let str = cuurentValidationData.split('_');
				currIndex = str[1];
			}
			let currDomID = 1;
			if(this.allformValues[currentDet][currIndex])
			{
				currDomID = this.allformValues[currentDet][currIndex]['domID'];
			}
			let rowElemId = 'selected_' + currentDet + '_RowNo_' + currDomID;
			let elem = document.getElementById(rowElemId);
			if(elem)
			{
				let selectedRowChildren = elem.children;
				detailLoop:
				for (let j = 0; j < selectedRowChildren.length; j++) 
				{
					let detailInputElem = selectedRowChildren[j].firstElementChild;
					if (detailInputElem != null)
					{
						let detID = detailInputElem.id;
						let detElem = document.getElementById(detID);
						if (detElem != null && !detElem.classList.contains('disableCellData'))
						{
							this.scrollIntoViewInsideContainer(detElem);
							detElem.focus({ preventScroll: true });
							break detailLoop;
						}
					}
				}
			}
		}
		this.cdr.markForCheck();
	}

	openPopHelp(fldName:any, fldValue:any, formNo:any, index?:any, title?: any) 
	{
		this.fieldName = fldName;
		let sqlInput: string = "";
		let tempPophelpfldName: any;

		if(fldName && fldName.includes('__'))
		{
			tempPophelpfldName = this.getFieldNameBeforeUnderscore(fldName);
		}

		let popHelpFldName: any = this.pophelpDataMap.get(fldName);
		if(popHelpFldName)
		{
			sqlInput = popHelpFldName['attrib']['@SQL_INPUT'];
			tempPophelpfldName = fldName;
		}
		else
		{
			let tempFldName: any = tempPophelpfldName ? this.pophelpDataMap.get(tempPophelpfldName) : undefined;
			if(tempFldName)
			{
				sqlInput = tempFldName['attrib']['@SQL_INPUT'];
			}
		}
		// Fallback: ensure tempPophelpfldName is always defined to prevent crash in openSuggest
		if(!tempPophelpfldName)
		{
			tempPophelpfldName = fldName;
		}
		this.popHelp.callApiForSimpleLayout = true;
		this.popHelp.tokenID = this.tokenID;
		this.popHelp.jSessionId = this.jSessionID;
		this.popHelp.allformValues = this.allformValues;
		this.popHelp.index = index;
		this.currentIndexForDetailForm = index;
		if (this.currentFormNumber != formNo) 
		{
			// setTimeout(() => {
				this.updateChgStr(formNo, index);
				this.popHelp.openSuggest(tempPophelpfldName, fldValue, sqlInput, this.pkValues, title, formNo, fldName);
			// }, 1000);
		}
		else 
		{
			this.updateChgStr(formNo, index);
			this.popHelp.openSuggest(tempPophelpfldName, fldValue, sqlInput, this.pkValues, title, formNo, fldName);
		}
	}
	
	callLocalItemChange(fldName: any, fldValue: any, formNo: any, textCase?: any, index?: any): Promise<void> {
			return new Promise((resolve, reject) => {
			try
			{
				let formDetail = 'Detail' + formNo;
				let colDomID = "1";
				if(this.allformValues && this.allformValues[formDetail] && this.allformValues[formDetail][index] && this.allformValues[formDetail][index]['domID'] != undefined)
				{
					colDomID = this.allformValues[formDetail][index]['domID'];
				}
				let id = formDetail + '.'+ colDomID +'.' + fldName;
				// let elem = document.getElementById(id);
				if (this.checkIsDateFormat(fldName, formNo))
				{
						if (fldValue) 
						{
							fldValue =  new Date(fldValue);
							if (!isNaN(fldValue.getTime()))
							{
								fldValue = this.datePipe.transform(fldValue, 'dd/MM/yy HH:mm:ss');
							}
		
							if(this.allformValues && this.allformValues[fldName] != undefined)
							{
								this.allformValues[fldName] = this.convertStringToDate(fldValue);
							}
							else if(this.allformValues && this.allformValues[formDetail] && this.allformValues[formDetail][index] && this.allformValues[formDetail][index][fldName] != undefined)
							{
								this.allformValues[formDetail][index][fldName] = this.convertStringToDate(fldValue);
							}
						}
						else
						{
							if(this.allformValues && this.allformValues[formDetail] && this.allformValues[formDetail][index] && this.allformValues[formDetail][index][fldName] != undefined)
							{
								this.allformValues[formDetail][index][fldName] = "";
							}
							else
							{
								this.allformValues[fldName] = '';
							}
						}
				}
				// console.log('print this.allformValues 1101::::::',this.allformValues);
				fldValue = this.changeTextCase(fldValue, textCase);
				this.itemChangeList = this.itemChangeArr[formNo - 1];
				if(this.itemChangeList && this.itemChangeList.includes(fldName) && (fldName == 'itm_default' || fldName == 'itm_defaultedit' || this.previousFieldValue != fldValue))
				{
					this.allformValues[fldName+'_ISCHANGE'] = false;
					if(this.transMode == 'I')
					{
						let domID: any;
						if(formNo == '1')
						{
							domID = this.allformValues['domID'];
						}
						else
						{
							domID = this.allformValues['Detail'+formNo][index]['domID'];
						}
						if(this.isPreventItemChange == false && this.isPreventPopHelpItemChange == false)
						{
							this.itemChangeUtils.statelessItemChange(fldName, formNo, domID, fldValue,this.editFlag,this.formWiseFormatJson,this.compData['NO_OF_FORMS'],index);
						}
						else
						{
							this.isPreventItemChange = false;
							this.isPreventPopHelpItemChange = false;
						}
					}
					else
					{
						this.updateChgStr(formNo, index);
						let chgStr = this.popHelp.createChgStr(fldName, fldValue, formNo);
						let domID: any;
						if(formNo == '1')
						{
							domID = this.allformValues['domID'];
						}
						else
						{
							domID = this.allformValues['Detail'+formNo][index]['domID'];
						}
						if(this.isPreventItemChange == false && this.isPreventPopHelpItemChange == false && !this.isPreventEnterKeyItemChange)
						{
							this.itemChangeUtils.stateFulItemChange(fldName,fldValue,this.compData['OBJ_CTX'],this.compData['EDITOR_ID'],chgStr,this.formWiseFormatJson ,this.compData['dummyInt'],domID,this.compData['NO_OF_FORMS'],index);
						}
						else
						{
							this.isPreventItemChange = false;
							this.isPreventPopHelpItemChange = false;
						}
					}
					
					if(this.itemChangeUtils.protectAttribParams)
					{
						this.protectAttribParams = this.itemChangeUtils.protectAttribParams;
					} 
					if(this.itemChangeUtils.visibleAttribParams)
					{
						this.visibleAttribParams = this.itemChangeUtils.visibleAttribParams;
					}
					// this.formatFieldsValue();
				}
		
				if (this.previousFieldValue !== fldValue) 
				{
					let currentDetail = 'Detail' + this.currentFormNumber;
					let isFocusOrBlur = true;
					if(currentDetail === "Detail1" && this.allformValues[currentDetail] === undefined)
					{
						const feedData: any = {};
						
						for (const key in this.allformValues) 
						{
							if (!key.startsWith("Detail")) 
							{
								feedData[key] = JSON.parse(JSON.stringify(this.allformValues[key]));
							}
						}
						this._extractTempletService.invokeSimpleLink(feedData, this.currentDomID, this.currentFormNumber, fldName, this.objName, isFocusOrBlur,fldValue);
					} 
					else 
					{
						let feedData = {};
						let tempDomId = this.currentDomID;		
						if(this.allformValues[currentDetail])
						{
							let matchingRecord = this.allformValues[currentDetail].find((record: any) => {
								return record.domID == tempDomId;
							});

							if (matchingRecord)
							{
								this.currentDomID = matchingRecord.domID;
								feedData = JSON.parse(JSON.stringify(matchingRecord));
								this._extractTempletService.invokeSimpleLink(feedData, this.currentDomID, this.currentFormNumber, fldName, this.objName, isFocusOrBlur,fldValue);
							}
							else
							{
								console.log("No matching record found 1127 on callLocalItem.");
							}
						}
					}
				}
				setTimeout(() => {
					resolve(); // Resolve the promise when done
				}, 0);
			}
			catch(error)
			{
				console.log('Exception inside callLocalItemChange :::::::',error);
				reject(error);
			}
		});
    }


	changeTextCase(fldValue: any, textCase: any): any 
    {
        if(textCase === "" || typeof fldValue !== 'string')
        {
            return fldValue;
        }
        else if(textCase === "upper" && fldValue)
        {
            fldValue = fldValue.toUpperCase();
        }
        else if(textCase === "lower" && fldValue)
        {
            fldValue = fldValue.toLowerCase();
        }
        return fldValue;
    }

	callChangeDetection()
	{
		this.disabledFieldCache.clear();
		this.cdr.detectChanges();
	}

	buildItemChangeList(objDetailsData:any) 
	{
		let objdetailsNew = {} = JSON.parse(objDetailsData);
		if (objdetailsNew && objdetailsNew!.ROOT) 
		{
			if (objdetailsNew.ROOT.ITEMCHANGE_FIELDS.ITEMCHANGE_FIELD != null) 
			{
				let itemChangeField = objdetailsNew.ROOT.ITEMCHANGE_FIELDS.ITEMCHANGE_FIELD;
				if(itemChangeField instanceof Array)
				{
					let childLen = itemChangeField.length;
					for( let i=0 ; i<childLen; i++ )
					{
						let itemchangeData = itemChangeField[i].content;
						this.itemChangeArr.push(itemchangeData);
					}
				}
				else
				{
					let itemchangeData = itemChangeField.content;
                    this.itemChangeArr.push(itemchangeData);
                }
			}
		}
	}

	checkError(serverData:any)
	{
		console.log('[checkError] called with serverData type:', typeof serverData);
		console.log('[checkError] serverData:', serverData);
		let msg = "";
		let msgDescr = "";
		let msgTrace = "";
		try
		{
			// Try JSON parsing first (new API response format)
			let jsonData = JSON.parse(serverData);
			console.log('[checkError] JSON.parse succeeded, jsonData:', jsonData);
			let errorObj: any = null;
			// Handle { Root: { Errors: ["", { error: {...} }] } } format
			if(jsonData && jsonData.Root && jsonData.Root.Errors && jsonData.Root.Errors[1] && jsonData.Root.Errors[1].error)
			{
				console.log('[checkError] Matched Root.Errors[1].error format');
				errorObj = jsonData.Root.Errors[1].error;
			}
			// Handle { data: { Root: { Errors: ["", { error: {...} }] } } } format
			else if(jsonData && jsonData.data && jsonData.data.Root && jsonData.data.Root.Errors && jsonData.data.Root.Errors[1] && jsonData.data.Root.Errors[1].error)
			{
				console.log('[checkError] Matched data.Root.Errors[1].error format');
				errorObj = jsonData.data.Root.Errors[1].error;
			}
			// Handle { Errors: { error: {...} } } format
			else if(jsonData && jsonData.Errors && jsonData.Errors.error)
			{
				console.log('[checkError] Matched Errors.error format');
				errorObj = jsonData.Errors.error;
			}
			else
			{
				console.log('[checkError] No format matched! jsonData keys:', Object.keys(jsonData));
			}
			console.log('[checkError] errorObj:', errorObj);
			if(errorObj)
			{
				msg = errorObj['message'] || "";
				msgDescr = errorObj['description'] || "";
				msgTrace = errorObj['trace'] || "";
			}
		}
		catch(e: any)
		{
			console.log('[checkError] JSON.parse failed, error:', e.message);
			// If JSON parsing fails, fall back to XML parsing (old response format)
			let errorData: any[] = this._extractTempletService.getErrorData(serverData);
			console.log('[checkError] XML fallback errorData:', errorData);
			msg = errorData[0] != undefined ? errorData[0] : "";
			msgDescr = errorData[1] != undefined ? errorData[1] : "";
			msgTrace = errorData[2] != undefined ? errorData[2] : "";
		}
		console.log('[checkError] msg:', msg, 'msgDescr:', msgDescr, 'msgTrace:', msgTrace);
		let errorMessage = msg;
		if(msgDescr)
		{
			errorMessage = msg + "<br><br>" + msgDescr;
		}
		if(!errorMessage || errorMessage.replace(/<br>/g, '').trim() === '')
		{
			errorMessage = "An unknown error occurred";
		}
		let traceMsg = msgTrace;
		console.log('[checkError] final errorMessage:', errorMessage);
		console.log('[checkError] final traceMsg:', traceMsg);
		this._extractTempletService.setLoading(false);
		this.bbconfirmBox.alert('Error', errorMessage, traceMsg).subscribe((resp: any) => {
			console.log('Error alert closed');
		});
	}

	updateChgStr(formNo:any, index:any) 
	{

		let rowNo = index == null ? -1 : index;
		this.popHelp.itemChangeUtils = this.itemChangeUtils;
		this.currentIndexForDetailForm = rowNo;
		this.popHelp.detailNum = 'Detail' + formNo;
		if (formNo == '1') 
		{
			this.popHelp.keyValue = this.allformValues['domID'];
		}
		else
		{
			if(this.allformValues[this.popHelp.detailNum] && this.allformValues[this.popHelp.detailNum][index])
			{
				this.popHelp.keyValue = this.allformValues[this.popHelp.detailNum][index]['domID'];
			}
			else
			{
				// Fallback: use domID '1' if detail row not found
				this.popHelp.keyValue = this.currentDomID || '1';
				console.log('updateChgStr fallback keyValue:', this.popHelp.keyValue, 'detailNum:', this.popHelp.detailNum, 'index:', index);
			}
		}
		this.popHelp.itemChangeList = this.itemChangeArr[formNo - 1];
		let detailLength = rowNo >= 0 && (this.popHelp.detailNum != 'Detail1') ? this.allformValues[this.popHelp.detailNum].length : null;
		this.popHelp.protectAttribParams = this.protectAttribParams;
		this.popHelp.visibleAttribParams = this.visibleAttribParams;
		if (detailLength == null && rowNo >= 0) 
		{
			if(this.transMode != 'I')
			{
				this.popHelp.paramData = this.allformValues[this.popHelp.detailNum];
			}
			this.popHelp.compData['OBJ_CTX'] = formNo;

		}
		else if (rowNo >= 0) 
		{
			if(this.transMode != 'I')
			{
				this.popHelp.paramData = this.allformValues[this.popHelp.detailNum][rowNo];
			}
			this.popHelp.compData['OBJ_CTX'] = formNo;

		}
		else 
		{
			if(this.transMode != 'I')
			{
				let currentAllData = JSON.parse(JSON.stringify(this.allformValues));
				for (let key in currentAllData) 
				{
					let value = currentAllData[key];
					if (value instanceof Array) 
					{
						delete currentAllData[key];
					}
				}
				this.popHelp.paramData = currentAllData;
			}
			this.popHelp.compData['OBJ_CTX'] = formNo;
			
		}
		this.cdr.markForCheck();
	}

	updateAutoSuggestChgStr(formNo:any, index:any, autoSuggest: BbAutosuggestTransactionComponent)
	{
		let rowNo = index == null ? -1 : index;

		this.currentIndexForDetailForm = rowNo;
		autoSuggest.detailNum = 'Detail' + formNo;
		// autoSuggest.dateFeildArray = this.arrayOfDateFields;
		if (formNo == '1')
		{
			autoSuggest.keyValue = this.allformValues ? this.allformValues['domID'] : '1';
		}
		else
		{
			if(this.allformValues && this.allformValues[autoSuggest.detailNum] && this.allformValues[autoSuggest.detailNum][index])
			{
				autoSuggest.keyValue = this.allformValues[autoSuggest.detailNum][index]['domID'];
			}
			else
			{
				autoSuggest.keyValue = '1';
			}
		}
		let detailLength = rowNo >= 0 && (autoSuggest.detailNum != 'Detail1') ? this.allformValues[autoSuggest.detailNum].length : null;
		autoSuggest.protectAttribParams = this.protectAttribParams;
		autoSuggest.visibleAttribParams = this.visibleAttribParams;
		if (detailLength == null && rowNo >= 0) 
		{
			if(this.transMode != 'I')
			{
				autoSuggest.paramData = this.allformValues[autoSuggest.detailNum];
			}
			autoSuggest.compData['OBJ_CTX'] = formNo;

		}
		else if (rowNo >= 0) 
		{
			if(this.transMode != 'I')
			{
				autoSuggest.paramData = JSON.stringify(this.allformValues[autoSuggest.detailNum][rowNo])
			}
			autoSuggest.compData['OBJ_CTX'] = formNo;

		}
		else 
		{
			if(this.transMode != 'I')
			{
				let currentAllData = JSON.parse(JSON.stringify(this.allformValues));
				for (let key in currentAllData) 
				{
					let value = currentAllData[key];
					if (value instanceof Array) 
					{
						delete currentAllData[key];
					}
				}
				autoSuggest.paramData = JSON.stringify(currentAllData);
			}
			autoSuggest.compData['OBJ_CTX'] = formNo;
			
		}
		this.cdr.markForCheck();
	}

	selectedValueFromPopHelp(values:any)
	{
		let selectedVal = JSON.parse(values);
		let currentDetail = 'Detail' + this.popHelp.formNo;
		let selectedFldName = '';
		let selectedFldValue = '';
		for (const key of Object.keys(selectedVal))
		{
			selectedFldName = key;
			selectedFldValue = selectedVal[key];
			if( currentDetail == 'Detail1')
			{
				this.allformValues[key] = selectedVal[key];
			}
			else
			{
				if(this.allformValues && this.allformValues[this.popHelp.detailNum] && this.allformValues[this.popHelp.detailNum][this.currentIndexForDetailForm])
				{
					this.allformValues[this.popHelp.detailNum][this.currentIndexForDetailForm][key] = selectedVal[key];
				}
			}
		}
		// Refresh feed-view data if open
		if(this.currentFeedData && this.popHelp && this.popHelp.detailNum && this.allformValues[this.popHelp.detailNum] && this.allformValues[this.popHelp.detailNum][this.currentIndexForDetailForm])
		{
			this.currentFeedData = this.allformValues[this.popHelp.detailNum][this.currentIndexForDetailForm];
		}
		// When feed-view is open, call getFieldItemChange directly from simple_editor
		if(this.overLayForFeedView && selectedFldName)
		{
			let domID = this.popHelp.keyValue || this.currentDomID || '1';
			let formNo = this.popHelp.formNo || this.currentFormNumber;
			this.getFieldItemChange(selectedFldName, selectedFldValue, domID, formNo, this.currentIndexForDetailForm);
		}
		this.cdr.reattach();
		this.cdr.detectChanges();
	}

	checkErrorOfJsonData(values:any) 
	{
		let errorData: any[] = this._extractTempletService.getErrorOfJsonData(values);
		let msg = errorData[0] != undefined ? errorData[0] : "";
		let msgDescr = errorData[1] != undefined ? errorData[1] : "";
		let msgTrace = errorData[2] != undefined ? errorData[2] : "";
		let errMsg = this._extractTempletService.getErrorMsg(msg, msgDescr, msgTrace);
		this._extractTempletService.setLoading(false);
		this.confirmBox.alert('Error', errMsg);
	}

	onItemChangeFromPophelp(values:any)
	{
		console.log('onItemChangeFromPophelp called, detailNum:', this.popHelp?.detailNum, 'keyValue:', this.popHelp?.keyValue, 'currentIndex:', this.currentIndexForDetailForm);
		if(values !== null && values !== '' && values !== undefined && typeof values === 'string' && !values.includes('<Errors>'))
		{
			let details = JSON.parse(values);
			// Handle JSON error/exception/Reject response from item change API
			if(details && details.status && (details.status == 'error' || details.status == 'exception' || details.status == 'Reject'))
			{
				this._extractTempletService.checkErrorExceptionJson(values, (result:any) => {
					console.log('[onItemChangeFromPophelp] checkErrorExceptionJson callback result:', result);
				});
				return;
			}
			let itemChnageValues:any = {};
			let formNo = this.compData['NO_OF_FORMS'];
			try
			{
				if (values.indexOf('Errors') != -1)
				{
					this.checkError(values);
				}
				else
				{
					for (let i = 0; i < formNo; i++) 
					{
						let currFormNo = i + 1;
						let currentFormNoDetail = 'Detail' + currFormNo;
						if (details.Root[currentFormNoDetail]) 
						{
							itemChnageValues = details.Root[currentFormNoDetail];
							if (currentFormNoDetail == 'Detail1') 
							{
								for (let key in itemChnageValues) 
								{
									if (itemChnageValues[key] && itemChnageValues[key].protect)
									{
										if(itemChnageValues[key].protect.toString() == "")
										{
											this.allformValues[key+'_protect'] = "0";
										}
										else
										{
											this.allformValues[key+'_protect'] = itemChnageValues[key].protect.toString();
										}
									}
									else
									{
										this.allformValues[key+'_protect'] = "0";
									}
									if (itemChnageValues[key] && itemChnageValues[key].visible) 
									{
										this.allformValues[key+'_visible'] = itemChnageValues[key].visible;
									}
									else
									{
										this.allformValues[key+'_visible'] = "";
									}
									if (itemChnageValues[key] && (itemChnageValues[key].content || itemChnageValues[key].content == 0)) 
									{
										if (itemChnageValues[key] && itemChnageValues[key].content) 
										{
											let value = itemChnageValues[key].content;
											if(value == null || value == undefined)
											{
												this.allformValues[key] = ""; 
											}
											else
											{
												this.allformValues[key] = value;
											}
											this.checkProtectAndvisibleforFirstForm(itemChnageValues, key);
										}
									}
									else
									{
										let value = itemChnageValues[key];
										if (key === 'attribute' && value instanceof Object)
										{
											value = JSON.stringify(value);
										}
										else if (value instanceof Object)
										{
											value = "";
										}
										if(value == null || value == undefined)
										{
											this.allformValues[key] = "";
										}
										else
										{
											this.allformValues[key] = value;
										}
										this.checkProtectAndvisibleforFirstForm(itemChnageValues, key);
									}
								}
							}
							else
							{
								for (const key of Object.keys(itemChnageValues)) 
								{
									let id = this.popHelp.detailNum + '.' + this.popHelp.keyValue + '.' + key;
									let formId = this.popHelp.detailNum + '-' + this.popHelp.keyValue + '-' + key;
									if (itemChnageValues[key] && itemChnageValues[key].protect) 
									{
										if(this.allformValues && this.allformValues[currentFormNoDetail] && this.allformValues[currentFormNoDetail][this.currentIndexForDetailForm])
										{
											if(itemChnageValues[key].protect.toString() == "")
											{
												this.allformValues[currentFormNoDetail][this.currentIndexForDetailForm][key+'_protect'] = "0";
											}
											else
											{
												this.allformValues[currentFormNoDetail][this.currentIndexForDetailForm][key+'_protect'] = itemChnageValues[key].protect.toString();
											}
										}
									}
									else
									{
										if(this.allformValues && this.allformValues[currentFormNoDetail] && this.allformValues[currentFormNoDetail][this.currentIndexForDetailForm])
										{
											this.allformValues[currentFormNoDetail][this.currentIndexForDetailForm][key+'_protect'] = "0";
										}
									}
									if (itemChnageValues[key] && itemChnageValues[key].visible) 
									{
										if(this.allformValues && this.allformValues[currentFormNoDetail] && this.allformValues[currentFormNoDetail][this.currentIndexForDetailForm])
										{
											this.allformValues[currentFormNoDetail][this.currentIndexForDetailForm][key+'_visible'] = itemChnageValues[key].visible;
										}
									}
									else
									{
										if(this.allformValues && this.allformValues[currentFormNoDetail] && this.allformValues[currentFormNoDetail][this.currentIndexForDetailForm])
										{
											this.allformValues[currentFormNoDetail][this.currentIndexForDetailForm][key+'_visible'] = "";
										}
									}
									if (itemChnageValues[key] && (itemChnageValues[key].content || itemChnageValues[key].content == 0)) 
									{
										let value = itemChnageValues[key].content;
										if(this.allformValues && this.allformValues[currentFormNoDetail] && this.allformValues[currentFormNoDetail][this.currentIndexForDetailForm])
										{
											if(value == null || value == undefined)
											{
												this.allformValues[currentFormNoDetail][this.currentIndexForDetailForm][key] = "";
											}
											else
											{
												this.allformValues[currentFormNoDetail][this.currentIndexForDetailForm][key] = value;
											}
										}
										this.checkProtectAndVisbile(itemChnageValues, key, id, formId);
									}
									else
									{
										let value = itemChnageValues[key];
										if (key === 'attribute' && value instanceof Object)
										{
											value = JSON.stringify(value);
										}
										else if (value instanceof Object)
										{
											value = "";
										}
										if(this.allformValues && this.allformValues[currentFormNoDetail] && this.allformValues[currentFormNoDetail][this.currentIndexForDetailForm])
										{
											if(value == null || value == undefined)
											{
												this.allformValues[currentFormNoDetail][this.currentIndexForDetailForm][key] = "";
											}
											else
											{
												this.allformValues[currentFormNoDetail][this.currentIndexForDetailForm][key] = value;
											}
										}
										this.checkProtectAndVisbile(itemChnageValues, key, id, formId);
									}
								}
							}
						}
					}
				}
				// Refresh feed-view data if open
				if(this.currentFeedData && this.popHelp && this.popHelp.detailNum && this.allformValues[this.popHelp.detailNum] && this.allformValues[this.popHelp.detailNum][this.currentIndexForDetailForm])
				{
					this.currentFeedData = this.allformValues[this.popHelp.detailNum][this.currentIndexForDetailForm];
				}
				this.cdr.reattach();
				this.cdr.detectChanges();
				this.focusNextEditableField();
			}
			catch(e:any)
			{
				console.log('Exception inside onItemChangeFromPophelp:', e?.message);
			}
		}
	}

	addDetail(detailNo:any, formNo:any, isFromAttachPdf?: boolean, detailDataFromPdf?:any)
	{
		this.waitForPendingFieldChange().then(() => {
		this.isAddDetail = true;
		let requiredFldExist = this.validateMandatoryFields(this.currentFormNumber, this.currentDomID);
		if(requiredFldExist == true)
		{
			return;
		}
		
		let detailLen = 0;
		if (this.allformValues.hasOwnProperty(detailNo)) 
		{
			detailLen = this.allformValues[detailNo].length;
		}
		let detailIndex = detailLen;
		if (this.currentValidationRow && this.currentValidationRow.length > 0) 
		{
			if(this.currentFormNo != formNo)
			{
				if(this.currentDomID)
				{
					this.onNext(this.currentFormNo, this.currentDomID, formNo, detailIndex, true, false);
				}
				else 
				{
					this.addNewDetailRow(formNo, detailIndex, isFromAttachPdf, detailDataFromPdf)
				}
			}
			else
			{
				if(this.currentDomID)
				{
					this.validateCurrentDetail(formNo, this.currentDomID, formNo, detailIndex, true, isFromAttachPdf, detailDataFromPdf, false,false);
				}
				else 
				{
					this.addNewDetailRow(formNo, detailIndex, isFromAttachPdf, detailDataFromPdf);
				}
			}
		}
		else
		{
			if(formNo == '1')
			{
				// let rowData = formNo + "_" + detailIndex;
				this.callPreValidate(true, this.currentDomID, formNo, detailIndex, detailDataFromPdf, isFromAttachPdf, false);
			}
			else if(this.currentDomID)
			{
				// Validate current form (form 1/header) before adding detail row to target form
				let prevFormNo = this.currentFormNumber || '1';
				console.log('[addDetail] currentValidationRow empty, validating form', prevFormNo, 'before adding to form', formNo);
				this.onNext(prevFormNo, this.currentDomID, formNo, detailIndex, true, false);
			}
			else
			{
				this.addNewDetailRow(formNo, detailIndex, isFromAttachPdf, detailDataFromPdf)
			}
		}
		});
	}

	save() 
	{
		try 
		{
			if (this.currentValidationRow && this.currentValidationRow.length > 0) 
			{
				let cuurentValidationData = this.currentValidationRow[0];
				let str = cuurentValidationData.split('_');
				let previousDomId = 1;
				let indexNew:any;
				if(this.currentFormNumber == '1')
				{
					previousDomId = this.allformValues['domID'];
				}
				else 
				{
					let prevDetail = 'Detail' + str[0];
					indexNew = this.allformValues[prevDetail].length - 1;
					previousDomId = this.allformValues[prevDetail][indexNew]['domID'];
				}
				this.saveTrue = true;
				this.validateCurrentDetail(this.currentFormNumber, previousDomId, this.currentFormNumber, indexNew, false, false, null, true, false);
				let requiredFldExist = this.validateMandatoryFields(this.currentFormNumber, previousDomId);
				if (requiredFldExist == true) 
				{
					return;
				}
			}
		}
		catch (e:any) 
		{
			console.log('Exception in save method....', e.message);
		}
	}

	checkProtectAndVisbile(itemChnageValues:any, key:any, id:any, formId: any) 
	{
		if (itemChnageValues && itemChnageValues[key] && itemChnageValues[key].protect != undefined) 
		{
			this.protectAttribParams[id] = itemChnageValues[key].protect;
			if (itemChnageValues && itemChnageValues[key] && itemChnageValues[key].protect != undefined  && itemChnageValues[key].protect != '' && (itemChnageValues[key].protect.toString() == '1' || itemChnageValues[key].protect == 1))
			{
				if (document.getElementById(id)) 
				{
					if (!document.getElementById(id)?.classList.contains('disableCellData')) 
					{
						document.getElementById(id)?.classList.add("disableCellData");
						document.getElementById(id)?.setAttribute('disabled','true');
					}
					let elem = document.getElementById(id);
					if (elem && !elem.classList.contains('disablePopHelp'))
					{
						let nextElem = elem.nextElementSibling;
						if(nextElem)
						{
							nextElem.setAttribute('style', 'display: none');
							if(nextElem.nextElementSibling && !nextElem.nextElementSibling.classList.contains('disablePopHelp'))
							{
								nextElem.nextElementSibling.setAttribute('style', 'display: block');
								nextElem.nextElementSibling.classList.add("disablePopHelp");
							}
						}
					}
				}
				// setTimeout(() => {
				if (document.getElementById(formId) != null) 
				{
					const elem:any = document.getElementById(formId);
					if (elem && elem?.classList?.contains('mat-datepicker-input')) 
					{
						if(elem && elem.parentElement && elem.parentElement.nextElementSibling && elem.parentElement.nextElementSibling.firstElementChild && elem.parentElement.nextElementSibling.firstElementChild.firstElementChild)
						{
							let datePickerElem = elem.parentElement?.nextElementSibling?.firstElementChild?.firstElementChild;
							if (elem && !elem.hasAttribute('disabled')) 
							{
								elem['disabled'] = true;
							}
							if (datePickerElem && !datePickerElem.hasAttribute('disabled')) 
							{
								datePickerElem['disabled'] = true;
								datePickerElem.setAttribute('style', 'display: none');
							}
						}
					}
					else 
					{
						if (elem && !elem.hasAttribute('disabled')) 
						{
							elem['disabled'] = true;
						}
						if(document.getElementById(formId))
						{
							let nextElem = document.getElementById(formId)?.nextElementSibling;
							if(nextElem)
							{
								nextElem.setAttribute('style', 'display: none');
								if(nextElem.nextElementSibling && !nextElem.nextElementSibling.classList.contains('disablePopHelp'))
								{
									nextElem.nextElementSibling.setAttribute('style', 'display: block');
									nextElem.nextElementSibling.classList.add("disablePopHelp");
								}
							}
						}
					}
				}
			// }, 500);
			}
			else if (itemChnageValues && itemChnageValues[key] && itemChnageValues[key].protect != undefined && itemChnageValues[key].protect != '' && (itemChnageValues[key].protect.toString() == '0' || itemChnageValues[key].protect == 0)) 
			{
				if (document.getElementById(id) != null) 
				{
					if (document.getElementById(id)?.classList.contains('disableCellData')) 
					{
						document.getElementById(id)?.classList.remove(("disableCellData"));
						document.getElementById(id)?.removeAttribute('disabled');
					}
					let elem = document.getElementById(id);
					if (elem != null)
					{
						let nextElem = elem.nextElementSibling;
						if(nextElem)
						{
							nextElem.setAttribute('style', 'display: block');
							if(nextElem.nextElementSibling && nextElem.nextElementSibling.classList.contains('disablePopHelp'))
							{
								nextElem.nextElementSibling.classList.remove(("disablePopHelp"));
							}
						}
					}
				}
				// setTimeout(() => {
				if (document.getElementById(formId) != null) 
				{
					const elem:any = document.getElementById(formId);
					if (elem && elem?.classList?.contains('mat-datepicker-input')) 
					{
						if(elem && elem.parentElement && elem.parentElement.nextElementSibling && elem.parentElement.nextElementSibling.firstElementChild && elem.parentElement.nextElementSibling.firstElementChild.firstElementChild)
						{
							let datePickerElem = elem.parentElement?.nextElementSibling?.firstElementChild?.firstElementChild;
							if (elem && elem.hasAttribute('disabled')) 
							{
								elem['disabled'] = false;
							}
							if (datePickerElem && datePickerElem.hasAttribute('disabled')) 
							{
								datePickerElem['disabled'] = false;
								datePickerElem.setAttribute('style', 'display: block');
							}
						}
					}
					else 
					{
						if (elem && elem.hasAttribute('disabled')) 
						{
							elem.removeAttribute('disabled');
						}
						if(elem.parentElement && !elem.parentElement.classList.contains('noPlaceholderIsDisable'))
						{
							let matFormData = elem.querySelector('mat-form-field');
							if(matFormData)
							{
								if(matFormData.classList.contains('mat-form-field-disabled'))
								{
									matFormData.classList.remove('mat-form-field-disabled');
								}
							}
						}
						let inputData = elem.querySelector('input');
						if (inputData && inputData.hasAttribute('disabled'))
						{
							inputData.removeAttribute('disabled');
						}
						if (elem && elem.hasAttribute('disabled')) 
						{
							elem['disabled'] = false;
						}
						if(document.getElementById(formId))
						{
							let nextElem = document.getElementById(formId)?.nextElementSibling;
							if(nextElem)
							{
								nextElem.setAttribute('style', 'display: block');
								if(nextElem.nextElementSibling && nextElem.nextElementSibling.classList.contains('disablePopHelp'))
								{
									nextElem.nextElementSibling.setAttribute('style', 'display: block');
									nextElem.nextElementSibling.classList.remove("disablePopHelp");
								}
							}
						}
					}
				}	
			// }, 500);
			}

		}
		else 
		{
			this.protectAttribParams[id] = "";
		}
		if (itemChnageValues && itemChnageValues[key] && itemChnageValues[key].visible != undefined) 
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
		let id = 'Detail1.1.' + key;
		let elem:any = document.getElementById(id);
		let format;
		const keys = Object.keys(itemChnageValues);
		this.matSelects.forEach(select => {
			const id = select.id;
        	const selectKey = id.substring(id.lastIndexOf('.') + 1);
        	if (keys.includes(selectKey)) 
			{
				const value = itemChnageValues[selectKey];
				if (value && typeof value === 'object' && 'protect' in value) 
				{
					select.disabled = value.protect === 1 ? true : false;
				}
			}
		});
		if (elem != null) 
		{
			format = elem.getAttribute('format');
			if(this.textbox)
			{
				this.textbox.setVisible(id);
			}
			if(this.textarea)
			{
				this.textarea.setVisible(id);
			}
			this.setUpdateVisibleProperty(id);

			let inputData = elem.querySelector('input');
			if (itemChnageValues && itemChnageValues[key] && itemChnageValues[key].protect != undefined && itemChnageValues[key].protect != '' && itemChnageValues[key].protect.toString()) 
			{
				this.protectAttribParams[id] = itemChnageValues[key].protect;
				if (itemChnageValues && itemChnageValues[key] && itemChnageValues[key].protect.toString() == '1' || itemChnageValues[key].protect == 1) 
				{
					if (format == 'dateBox' || format == '[shortdate] [time]' || format =='dd/mm/yy') 
					{
						let datePickerElem = elem.parentElement?.nextElementSibling?.firstElementChild?.firstElementChild;
						if (elem && !elem.hasAttribute('disabled')) 
						{
							elem['disabled'] = true;
							if(this.textbox)
							{
								this.textbox.setVisible(id);
							}
							if(this.textarea)
							{
								this.textarea.setVisible(id);
							}
							this.setUpdateVisibleProperty(id);
						}
						if (!datePickerElem.hasAttribute('disabled')) 
						{
							datePickerElem['disabled'] = true;
						}
						if (datePickerElem) 
						{
							datePickerElem.style.display = 'none';
						}
					}
					else 
					{
						if(inputData && !inputData.hasAttribute('disabled'))
						{
							elem.querySelector('input').disabled = true;
							if(this.textbox)
							{
								this.textbox.setVisible(id);
							}
							if(this.textarea)
							{
								this.textarea.setVisible(id);
							}
							this.setUpdateVisibleProperty(id);
						}
						let nextElem = elem.getElementsByClassName('wizTransPophelpImg icon-pophelp pophelpTransactionEffect gwtPopUpTxtLabel popHelpIconForExtract');
						if( nextElem && nextElem[0])
						{
							nextElem[0].setAttribute('style', 'display: none');
						}
					}
				}
				else if (itemChnageValues && itemChnageValues[key] && itemChnageValues[key].protect != undefined && itemChnageValues[key].protect != '' && itemChnageValues[key].protect.toString() && (itemChnageValues[key].protect.toString() == '0' || itemChnageValues[key].protect == 0))
				{
					if (format == 'dateBox' || format == '[shortdate] [time]' || format =='dd/mm/yy') 
					{
						let datePickerElem = elem.parentElement.nextElementSibling.firstElementChild.firstElementChild;
						if (elem.hasAttribute('disabled')) 
						{
							elem.removeAttribute('disabled');
							if(this.textbox)
							{
								this.textbox.setVisible(id);
							}
							if(this.textarea)
							{
								this.textarea.setVisible(id);
							}
							this.setUpdateVisibleProperty(id);
						}
						if (datePickerElem.hasAttribute('disabled')) 
						{
							datePickerElem.removeAttribute('disabled');
						}
						if (datePickerElem) 
						{
							datePickerElem.style.display = '';
						}
					}
					else 
					{
						if (inputData && inputData.hasAttribute('disabled'))
						{
							inputData.removeAttribute('disabled');
							if(this.textbox)
							{
								this.textbox.setVisible(id);
							}
							if(this.textarea)
							{
								this.textarea.setVisible(id);
							}
							this.setUpdateVisibleProperty(id);
						}
						let nextElem = elem.getElementsByClassName('wizTransPophelpImg icon-pophelp pophelpTransactionEffect gwtPopUpTxtLabel popHelpIconForExtract');
						if(nextElem && nextElem[0])
						{
							nextElem[0].setAttribute('style', 'display: block');
						}
					}
				}
			}
			else 
			{
				this.protectAttribParams[id] = "";
			}
			if (itemChnageValues && itemChnageValues[key] && itemChnageValues[key].visible != undefined && !(itemChnageValues[key].visible == '')) 
			{
				this.visibleAttribParams[id] = itemChnageValues[key].visible;
				let matFormField = elem.parentElement.parentElement.parentElement.parentElement;
				if (itemChnageValues[key].visible == '0') 
				{
					matFormField.style.display = 'none';
				}
				else if (itemChnageValues[key].visible.toString() == '1') 
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

	rowSelected(currentDetail:any, selectedIndex:any, selectedDomID:any, isAddDetail:boolean)
	{
		this.disabledFieldCache.clear();
		let deleteBtnId;
		let selectedRowDetail;
		let detElem;
		let selectedRowElem:any;
		let noOfForm = this.compData["NO_OF_FORMS"];
		for (let i = 0; i < noOfForm; i++) 
		{
			let formDetail = 'Detail' + (i + 1);
			if (formDetail == currentDetail && this.allformValues.hasOwnProperty(currentDetail)) 
			{
				let detailLen = this.allformValues[formDetail].length;
				for (let j = 0; j < detailLen; j++) 
				{
					let domID = this.allformValues[formDetail][j]['domID'];
					deleteBtnId = 'deleteBtn_' + domID;
					selectedRowDetail = 'selected_' + currentDetail + '_RowNo_' + domID;
					detElem = document.getElementById(deleteBtnId);
					selectedRowElem = document.getElementById(selectedRowDetail);
					if (detElem != null && !detElem.classList.contains('showDeleteBtn') && domID == selectedDomID) 
					{
						detElem.classList.add('showDeleteBtn');
						selectedRowElem.classList.add('changeBackGroundForSelectedRow');
					}
					else if (detElem != null && detElem.classList.contains('showDeleteBtn') && domID != selectedDomID) 
					{
						selectedRowElem.classList.remove('changeBackGroundForSelectedRow');
					}

					let taxBtnId = 'taxBtn_' + domID;
                    let taxElem = document.getElementById(taxBtnId);
                    if (taxElem != null && !taxElem.classList.contains('showDeleteBtn') && domID == selectedDomID) 
					{
						taxElem.classList.add('showDeleteBtn');
						selectedRowElem.classList.add('changeBackGroundForSelectedRow');
					}
					else if (taxElem != null && taxElem.classList.contains('showDeleteBtn') && domID != selectedDomID) 
					{
						selectedRowElem.classList.remove('changeBackGroundForSelectedRow');
					}
				}
			}
		}

		let formNo = currentDetail[currentDetail.length - 1];
		if (this.currentValidationRow && this.currentValidationRow.length > 0) 
		{
			let rowData = formNo + "_" + selectedIndex;
			if (rowData != this.currentValidationRow[0]) 
			{
				this.editDetail(currentDetail, formNo, selectedIndex, selectedDomID);
			}
		}
		else
		{
			this.editDetail(currentDetail, formNo, selectedIndex, selectedDomID);
		}
		this.setKeyNavigation(formNo);
	}

	deleteSelectedDetail(currentDetail:any, formNo:any, index:any) 
	{
		try 
		{
			if(this.transMode != 'I')
			{
				this.deletedRowIndex = index;
				let allDomIDFromResp:any = [];
				let selectedDetailData:any = {};
				selectedDetailData = this.allformValues[currentDetail][index];
				let selectedDetDomId = selectedDetailData['domID'];
				let allFormDetDomID:any;
				let id = 'selected_' + currentDetail + '_RowNo_' + selectedDetDomId;
				let elemSelected:any = document.getElementById(id);
				let chgStrg = this.chgStrParam(formNo, selectedDetDomId, 'D');
				// this.transActionUtility.onDeselect(selectedDetailData, this.compData['OBJ_NAME'], formNo, this.compData['EDITOR_ID'], chgStrg, this.compData['RTEURN_TYPE'], (response: any) => {	
				let paramMap = {};
				paramMap['OBJ_NAME'] = this.compData['OBJ_NAME'];
				paramMap['FORM_NO'] = formNo
				paramMap['OBJ_CONTEXT'] = formNo
				paramMap['PAGE_CTX'] = formNo;
				paramMap['DOM_ID'] = selectedDetDomId;
				paramMap['ACTION'] = 'DESELECT';
				paramMap['EDITOR_ID'] = this.compData['EDITOR_ID'];
				paramMap['CHG_DATA'] = this.buildChgStr(formNo);
				paramMap['PK_VALUES'] = '';
				paramMap['EDIT_FLAG'] = 'D';
				paramMap['EDITOR'] = "MobEditor";
				console.log('print paramMap 2413::::',paramMap);
				let paramString = this._extractTempletService.getEncodedParamString(paramMap);
				this._extractTempletService.validateAndDelete(paramString).subscribe( (response:any)=> {
					console.log('print response 2416::::',response);
					this._extractTempletService.checkErrorExceptionJson(response, (result:any) =>{
						console.log('print result 2418::::',result);
						if(!result)
						{
							response = JSON.parse(response);
							console.log('print response 2422::::',response);
							if (response.data && response.data.Root && response.data.Root[currentDetail]) 
							{
								let dataOnDeleteDetailNew = response.data.Root;
								let detailData = dataOnDeleteDetailNew[currentDetail];
								let detailLen = detailData.length;
								console.log('print detailData 2428::::',detailData);
								if (detailLen == null) 
								{
									allFormDetDomID = detailData['domID'];
									allDomIDFromResp.push(allFormDetDomID);
								}
								else 
								{
									for (let i = 0; i < detailLen; i++) 
									{
										detailData = dataOnDeleteDetailNew[currentDetail][i];
										allFormDetDomID = detailData['domID'];
										allDomIDFromResp.push(allFormDetDomID);
									}
								}
								console.log('print allDomIDFromResp 2442::::',allDomIDFromResp);
								if (allDomIDFromResp.includes(selectedDetDomId)) 
								{
									elemSelected.setAttribute('style', 'display: none');
									if (detailLen == null)
									{
										let delAttr = dataOnDeleteDetailNew[currentDetail]['attribute'];
										this.allformValues[currentDetail][index]['attribute'] = (delAttr && typeof delAttr === 'object') ? JSON.stringify(delAttr) : delAttr;
									}
									else
									{
										let delAttr = dataOnDeleteDetailNew[currentDetail][index]['attribute'];
										this.allformValues[currentDetail][index]['attribute'] = (delAttr && typeof delAttr === 'object') ? JSON.stringify(delAttr) : delAttr;
									}
									if(this.allformValues[currentDetail][index]['domID'] == selectedDetDomId)
									{
										this.allformValues[currentDetail].splice(index, 1);
										let newIndex = this.allformValues[currentDetail].length - 1;
										let newRowData = formNo +'_'+newIndex;
										this.currentValidationRow.splice(0, 1);
										if(newIndex >= 0)
										{
											this.currentValidationRow.push(newRowData);
										}
										this.currentDomID = ""
										this.currentRowIndex = ""
									}
								}
								else 
								{
									elemSelected.setAttribute('style', 'display: none');
									this.resetIndicator(selectedDetDomId + '', formNo);
									if(this.allformValues[currentDetail][index]['domID'] == selectedDetDomId)
									{
										this.allformValues[currentDetail].splice(index, 1);
										let newIndex = this.allformValues[currentDetail].length - 1;
										let newRowData = formNo +'_'+newIndex;
										this.currentValidationRow.splice(0, 1);
										if(newIndex >= 0)
										{
											this.currentValidationRow.push(newRowData);
										}
										this.currentDomID = ""
										this.currentRowIndex = ""
									}
								}
							}
							else
							{
								elemSelected.setAttribute('style', 'display: none');

								let currentRow = formNo + '_' + index;
								if(this.currentValidationRow[0] === currentRow)
								{

									if(this.allformValues[currentDetail][index]['domID'] == selectedDetDomId)
									{
										this.allformValues[currentDetail].splice(index, 1);
										let newIndex = this.allformValues[currentDetail].length - 1;
										let newRowData = formNo +'_'+newIndex;
										this.currentValidationRow.splice(0, 1);
										this.currentDomID = ""
										this.currentRowIndex = ""
										if(newIndex > 0)
										{
											this.currentValidationRow.push(newRowData);
										}
										if (this.allformValues[currentDetail].length == 0)
										{
											delete this.allformValues[currentDetail];
										}
									}
								}
							}
							console.log('print this.allformValues 2515::::',this.allformValues);
						}
					});
				});
			}
			else
			{
				
				this.allformValues[currentDetail].splice(index, 1);
				this.currentDomID = ""
				this.currentRowIndex = ""
				
			}
			this.cdr.markForCheck();
		}
		catch (e:any) 
		{
			console.log('Exception inside deleteSelectedDetail:::: ', e.message);
		}

	}

	resetIndicator(selectedDetDomId:any, formNo:any)
	{
		let currDet = 'Detail' + formNo;
		let elem:any = document.getElementById('tableDetails_'+formNo);
		if(selectedDetDomId.length == '1')
		{
			selectedDetDomId = '0' + selectedDetDomId;
		}
		let indicatorCount = elem.childElementCount;
		let indiactorArr:any = []
		for(let i=0; i<indicatorCount; i++)
		{
			let indicatorEle = elem.children[i];
			if(indicatorEle != null && indicatorEle.getAttribute('id') != null 
			 && indicatorEle.getAttribute('id').startsWith('validationIndicatorForRow_'))
			 {
				 let id = indicatorEle.getAttribute('id');
				indiactorArr.push(id);
			 }
		}
		for(let a=0; a<indiactorArr.length; a++)
		{
			let idNew = indiactorArr[a];
			let indicatorElem = document.getElementById(idNew);
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
		let detailLen = this.allformValues[currDet].length;
		let errorJson:any = this._extractTempletService.allValidationResponse;
		for(const key of Object.keys(errorJson))
		{
			let keyRes = key.split('_');
			let domIdFromValResp = keyRes[0];
			if(domIdFromValResp.startsWith('0'))
			{
				domIdFromValResp = domIdFromValResp.substring(1);
			}
			if(detailLen != null)
			{
				for(let i=0; i<detailLen; i++)
				{
					let detailData = this.allformValues[currDet][i];
					let DomId = detailData['domID']
					let tableRowId = 'selected_' + currDet + '_RowNo_' + DomId;
					if(domIdFromValResp == DomId)
					{
						this.showIndicator(tableRowId, formNo, (i+1));
					}
				}
			}
		}
	}

	chgStrParam(formNo:any, keyVal:any, editFlag: any, responseToCache?: any) 
	{
		if(keyVal == null || keyVal == undefined)
		{
			keyVal = ""
		}
		// responseToCache = responseToCache == undefined ? "" : responseToCache;
		let chgStr;
		if(responseToCache == undefined || responseToCache == null || responseToCache == '')
		{
			responseToCache = "";
			chgStr = `<?xml version='1.0' encoding='utf-8'?>
						<Root>
							<header>
								<objName><![CDATA[`+ this.objName + `]]></objName>
								<pageContext><![CDATA[1]]></pageContext>
								<objContext><![CDATA[`+ formNo + `]]></objContext>
								<editFlag><![CDATA[`+ editFlag + `]]></editFlag>
								<focusedColumn><![CDATA[]]></focusedColumn>
								<elementName><![CDATA[]]></elementName>
								<keyValue><![CDATA[`+ keyVal + `]]></keyValue>
								<taxKeyValue><![CDATA[]]></taxKeyValue>
								<saveLevel><![CDATA[0]]></saveLevel>
								<forcedSave><![CDATA[false]]></forcedSave>
								<taxInFocus><![CDATA[false]]></taxInFocus>
								<forcedconfirm><![CDATA[false]]></forcedconfirm>
								<isSaveNConitinue><![CDATA[false]]></isSaveNConitinue>
							</header>`
							+ responseToCache +
						`</Root>`;
		}
		else 
		{
			chgStr = responseToCache
		}
		return chgStr;
	}

	getCurrentFormXML(finalXml: any, formNo: any)
	{
		let formDetail: any = 'Detail' + formNo;
		// console.log('Print getCurrentFormXML formDetail::: ', formDetail);
		if (formDetail == 'Detail1')
		{
			let dbId = "";
			let attributeTagJson = this.allformValues['attribute'];
			if(attributeTagJson && typeof attributeTagJson === 'string')
			{
				attributeTagJson = JSON.parse(attributeTagJson);
			}	
			let attributeTagInXml = `<attribute `;
			for (const key of Object.keys(attributeTagJson)) 
			{
				if (this.editFlag == 'E') 
				{
					if (key == "pkNames") 
					{
						let primaryKey = attributeTagJson[key];

						let newstr = primaryKey.substring(0, primaryKey.length - 1);
						let arr = newstr.split(":");
						let arrLength = arr.length;

						for (let k = 0; k < arrLength; k++) 
						{
							let currentPkName = arr[k];
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
			let paramXML = `<` + formDetail + ` objContext="` + formNo
				+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + formNo + `" dbID="` + dbId + `" selected="Y">`;

			paramXML = paramXML + attributeTagInXml;
			let currentAllData = JSON.parse(JSON.stringify(this.allformValues));
			for (let key in currentAllData) 
			{
				let value = currentAllData[key];
				if (value instanceof Array) 
				{
					delete currentAllData[key];
				}
			}

			let jsonData:any = {};
			jsonData = JSON.parse(JSON.stringify(currentAllData));

			for (let key in jsonData) 
			{
				let id:any = formDetail + '.1.' + key;
				let value = jsonData[key];
				if (value instanceof Object) 
				{
					value = "";
				}

				if (value == null) 
				{
					value = "";
				}
				if (this.checkIsDateFormat(key, formNo)) 
				{
					let fldValue = value;
					value = "";
					try
					{
						if (fldValue) 
						{
							if(fldValue.includes(':'))
							{
								if (fldValue) 
								{
									if(typeof fldValue === 'object')
									{
										if(fldValue.content)
										{
											fldValue = fldValue.content;
										}
									}
									if (fldValue && fldValue.endsWith('00:00:00')) 
									{
										fldValue = fldValue.substring(0, 8); 
									}	
									let date;
									const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
									if (isoDateRegex.test(fldValue)) 
									{
										date = new Date(fldValue);
									} 
									else 
									{
										date = this.parseCustomDateFormat(fldValue)
									}
									if (date && !isNaN(date.getTime())) 
									{
										value = this.formatDate(date);
									} 
								}
							} 
							else
							{	
								fldValue = this.parseCustomDateFormat(fldValue)

								if (!isNaN(fldValue.getTime()))
								{
									value = this.formatDate(fldValue);
								}
							}
						}
					}
					catch(error)
					{
						value = fldValue;
					}
					if(value == null || value == undefined)
					{
						value = "";
					}
					paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
				}
				else if (key != "attribute") 
				{
					if(value == null || value == undefined)
					{
						value = "";
					}
					paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
				}
			}
			paramXML = paramXML + `</` + formDetail + `>`;
			finalXml = finalXml + paramXML;
		}
		else 
		{
			let detailDataLen = 0;
			if (this.allformValues[formDetail] != undefined) 
			{
				detailDataLen = this.allformValues[formDetail].length;
			}
			for (let j = 0; j < detailDataLen; j++) 
			{
				let dbId = "";
				let attributeTagJson = this.allformValues[formDetail][j]['attribute'];
				if (attributeTagJson) 
				{
					attributeTagJson = this.allformValues[formDetail][j]['attribute'];
				}

				let attributeTagInXml = `<attribute IS_CHANGE="Y"`;
				if (JSON.stringify(attributeTagJson).includes('IS_CHANGE')) 
				{
					attributeTagInXml = `<attribute `;
				}
				if(attributeTagJson && typeof attributeTagJson === 'string')
				{
					attributeTagJson = JSON.parse(attributeTagJson);
				}	
				for (const key of Object.keys(attributeTagJson)) 
				{
					if (this.editFlag == 'E') 
					{
						if (key == "pkNames") 
						{
							let primaryKey = attributeTagJson[key];
							let newstr = primaryKey.substring(0, primaryKey.length - 1);
							let arr = newstr.split(":");
							let arrLength = arr.length;

							for (let k = 0; k < arrLength; k++) 
							{
								let currentPkName = arr[k];
								dbId = dbId + this.allformValues[formDetail][j][currentPkName] + ":";
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
				let paramXML = "";
				let currentAllData = this.allformValues[formDetail][j];
				let currentDomId = "";
				if(currentAllData && currentAllData['domID'])
				{
					currentDomId = currentAllData['domID'];
				}
				if( this.editFlag == 'A')
				{
					paramXML = `<` + formDetail + ` objContext="` + formNo
					+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + currentDomId + `" dbID="` + dbId + `">`;
				}
				else
				{
					paramXML = `<` + formDetail + ` objContext="` + formNo
					+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + currentDomId + `" dbID="` + dbId + `">`;
				}
				
				paramXML = paramXML + attributeTagInXml;
				let jsonData:any = {};
				jsonData = JSON.parse(JSON.stringify(currentAllData));
				for (let key in jsonData) 
				{
					let id = formDetail + '.' + currentDomId + '.' + key;					
					let value = jsonData[key];
					if (value instanceof Object) 
					{
						value = "";
					}
					if(value == null || value == undefined)
					{
						value = "";
					}
					if (this.checkIsDateFormat(key, formNo)) 
					{
						let fldValue = value;
						value = "";
						try
						{
							if (fldValue) 
							{
								if(fldValue.includes(':'))
								{
									if (fldValue) 
									{
										if(typeof fldValue === 'object')
										{
											if(fldValue.content)
											{
												fldValue = fldValue.content;
											}
										}
										if (fldValue && fldValue.endsWith('00:00:00')) 
										{
											fldValue = fldValue.substring(0, 8); 
										}	
										let date;
										const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
										if (isoDateRegex.test(fldValue)) 
										{
											date = new Date(fldValue);
										} 
										else 
										{
											date = this.parseCustomDateFormat(fldValue);
										}
										if (date && !isNaN(date.getTime())) 
										{
											value = this.formatDate(date);
										} 
									}
								} 
								else
								{
									fldValue = this.parseCustomDateFormat(fldValue);
									if (!isNaN(fldValue.getTime()))
									{
										value = this.formatDate(fldValue);
									}
								}
							}
						}
						catch(error)
						{
							value = fldValue;
						}
						paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
					}
					else if (key != "attribute") 
					{
						if(value == null || value == undefined)
						{
							value = "";
						}
						paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
					}
				}
				paramXML = paramXML + `</` + formDetail + `>`;
				finalXml = finalXml + paramXML;
			}
		}
		// console.log('Final XML getCurrentFormXML ::::', finalXml);
		return finalXml;
	}


	getallFormXml(finalXml?:any) 
	{
		let noOfForm = this.compData["NO_OF_FORMS"];
		for (let i = 0; i < noOfForm; i++) 
		{
			let formDetail = 'Detail' + (i + 1);
			if (formDetail == 'Detail1') 
			{
				let dbId = "";
				
				let attributeTagJson = this.allformValues['attribute'];
				if(attributeTagJson && typeof attributeTagJson === 'string')
				{
					attributeTagJson = JSON.parse(attributeTagJson);
				}	
				let attributeTagInXml = `<attribute `;
				
				for (const key of Object.keys(attributeTagJson)) 
				{
					if (this.editFlag == 'E') 
					{
						if (key == "pkNames") 
						{
							let primaryKey = attributeTagJson[key];

							let newstr = primaryKey.substring(0, primaryKey.length - 1);
							let arr = newstr.split(":");
							let arrLength = arr.length;

							for (let k = 0; k < arrLength; k++) 
							{
								let currentPkName = arr[k];
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
				let paramXML = `<` + formDetail + ` objContext="` + (i + 1)
					+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + (i + 1) + `" dbID="` + dbId + `" selected="Y">`;

				paramXML = paramXML + attributeTagInXml;
				let currentAllData = JSON.parse(JSON.stringify(this.allformValues));
				for (let key in currentAllData) 
				{
					let value = currentAllData[key];
					if (value instanceof Array) 
					{
						delete currentAllData[key];
					}
				}

				let jsonData:any = {};
				jsonData = JSON.parse(JSON.stringify(currentAllData));

				for (let key in jsonData) 
				{
					let id:any = formDetail + '.1.' + key;
					let value = jsonData[key];
					if (value instanceof Object) 
					{
						value = "";
					}

					if (value == null) 
					{
						value = "";
					}
					if (this.checkIsDateFormat(key, i+1)) 
					{
						let fldValue = value;
						value = "";
						try
						{
							if (fldValue) 
							{
								if(fldValue.includes(':'))
								{
									
									if (fldValue) 
									{
										if(typeof fldValue === 'object')
										{
											if(fldValue.content)
											{
												fldValue = fldValue.content;
											}
										}
										if (fldValue && fldValue.endsWith('00:00:00')) 
										{
											fldValue = fldValue.substring(0, 8); 
										}	
										let date;
										const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
										if (isoDateRegex.test(fldValue)) 
										{
											date = new Date(fldValue);
										} 
										else 
										{
											date = this.parseCustomDateFormat(fldValue);
										}
										if (date && !isNaN(date.getTime())) 
										{
											value = this.formatDate(date);
										}
									}
								} 
								else
								{
									fldValue = this.parseCustomDateFormat(fldValue)

									if (!isNaN(fldValue.getTime()))
									{
										value = this.formatDate(fldValue);
									}
								}
							}
						}
						catch(error)
						{
							value = fldValue;
						}
						if(value == null || value == undefined)
						{
							value = "";
						}
						paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
					}
					else if (key != "attribute") 
					{
						if(value == null || value == undefined)
						{
							value = "";
						}
						paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
					}
				}
				paramXML = paramXML + `</` + formDetail + `>`;
				finalXml = finalXml + paramXML;
			}
			else 
			{
				let detailDataLen = 0;
				if (this.allformValues[formDetail] != undefined) 
				{
					detailDataLen = this.allformValues[formDetail].length;
				}
				let currentAllData = JSON.parse(JSON.stringify(this.allformValues));
				for (let j = 0; j < detailDataLen; j++) 
				{
					let dbId = "";
					let attributeTagJson = this.allformValues[formDetail][j]['attribute'];
					if (attributeTagJson) 
					{
						attributeTagJson = this.allformValues[formDetail][j]['attribute'];
					}

					let attributeTagInXml = `<attribute IS_CHANGE="Y"`;
					if (JSON.stringify(attributeTagJson).includes('IS_CHANGE')) 
					{
						attributeTagInXml = `<attribute `;
					}
					if(attributeTagJson && typeof attributeTagJson === 'string')
					{
						attributeTagJson = JSON.parse(attributeTagJson);
					}	
					for (const key of Object.keys(attributeTagJson)) 
					{
						if (this.editFlag == 'E') 
						{
							if (key == "pkNames") 
							{
								let primaryKey = attributeTagJson[key];
								let newstr = primaryKey.substring(0, primaryKey.length - 1);
								let arr = newstr.split(":");
								let arrLength = arr.length;

								for (let k = 0; k < arrLength; k++) 
								{
									let currentPkName = arr[k];
									dbId = dbId + this.allformValues[formDetail][j][currentPkName] + ":";
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
					let paramXML = "";
					let domId = this.allformValues[formDetail][j]['domID'];
					if( this.editFlag == 'A')
					{
						
						paramXML = `<` + formDetail + ` objContext="` + (i + 1)
						+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + domId + `" dbID="` + dbId + `">`;
					}
					else
					{
						paramXML = `<` + formDetail + ` objContext="` + (i + 1)
						+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + domId + `" dbID="` + dbId + `">`;
					}
					
					paramXML = paramXML + attributeTagInXml;
					currentAllData = this.allformValues[formDetail][j];
					let jsonData:any = {};
					jsonData = JSON.parse(JSON.stringify(currentAllData));

					for (let key in jsonData) 
					{
						let id = formDetail + '.' + domId + '.' + key;
						let value = jsonData[key];
						if (value instanceof Object) 
						{
							value = "";
						}
						if (value == null) 
						{
							value = "";
						}
						if (this.checkIsDateFormat(key, i+1)) 
						{
							let fldValue = value;
							value = "";
							try
							{
								if (fldValue) 
								{
									if(fldValue.includes(':'))
									{
									
										if (fldValue) 
										{
											if(typeof fldValue === 'object')
											{
												if(fldValue.content)
												{
													fldValue = fldValue.content;
												}
											}
											if (fldValue && fldValue.endsWith('00:00:00')) 
											{
												fldValue = fldValue.substring(0, 8); 
											}	
											let date;
											const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
											if (isoDateRegex.test(fldValue)) 
											{
												date = new Date(fldValue);
											} 
											else 
											{
												date = this.parseCustomDateFormat(fldValue)
											}
											if (date && !isNaN(date.getTime())) 
											{
												value = this.formatDate(date);
											} 
										}
									} 
									else
									{
										fldValue = this.parseCustomDateFormat(fldValue);

										if (!isNaN(fldValue.getTime()))
										{
											value = this.formatDate(fldValue);
										}
									}
								}
							}
							catch(error)
							{
								value = fldValue;
							}
							if(value == null || value == undefined)
							{
								value = "";
							}
							paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
						}
						else if (key != "attribute") 
						{
							if(value == null || value == undefined)
							{
								value = "";
							}
							paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
						}
					}
					paramXML = paramXML + `</` + formDetail + `>`;
					finalXml = finalXml + paramXML;
				}
			}
		}
		
		return finalXml;
	}

	callPreValidate(isAddClick:any, currentRowDomId: any, currentFormNo:any, selectedIndex:any, detailDataFromPdf?:any, isFromAttachPdf?: boolean | any, isSaveClick?: boolean) 
	{
        
		let finalXml = "<Root>";
		finalXml = finalXml + "<DocumentRoot>";
		finalXml = finalXml + "<description>Datawindow Root</description>";
		finalXml = finalXml + "<group0>";
		finalXml = finalXml + "<description>Group0 description</description>";
		finalXml = finalXml + "<Header0>";
		finalXml = this.getCurrentFormXML(finalXml,currentFormNo);
		finalXml = finalXml + "</Header0>";
		finalXml = finalXml + "</group0>";
		finalXml = finalXml + "</DocumentRoot>";
		finalXml = finalXml + "</Root>";

		let paramMap:any = {};
		paramMap['OBJ_NAME'] = this.compData['OBJ_NAME'];
		paramMap['XML_STR'] = finalXml;
		paramMap['EDIT_FLAG'] = this.editFlag;
		paramMap['EDITOR_ID'] = this.compData['EDITOR_ID'];
		paramMap['ACTION'] = 'Pre_Validate';
		paramMap['FORM_NO'] = currentFormNo;
		paramMap['PK_VALUES'] = this.compData['PK_VALUES'];
		paramMap['DOM_ID'] = currentRowDomId;
		paramMap['RETURN_TYPE'] = "json";
		paramMap['FORCESAVE'] = "false";
		// let paramString = JSON.stringify(paramMap);
		this._extractTempletService.getPreValidate(paramMap).subscribe((preValidateResponse: any) => {
			// Check for error/exception/Reject in preValidate response
			if(preValidateResponse && typeof preValidateResponse === 'string') {
				try {
					let parsedResp = JSON.parse(preValidateResponse);
					if(parsedResp && parsedResp.status && (parsedResp.status == 'Reject' || parsedResp.status == 'exception' || parsedResp.status == 'error')) {
						this._extractTempletService.checkErrorExceptionJson(preValidateResponse, (result:any) => {
							console.log('[getPreValidate] checkErrorExceptionJson callback result:', result);
						});
						return;
					}
				} catch(e) {
					// Not JSON, continue with normal handling
				}
			}
			// let response = JSON.parse(preValidateResponse);
			let currentDetail = 'Detail' + currentFormNo;
			let columnName = '';
			// if (!(isError == 'true'))
			if(preValidateResponse)
			{
				this.checkValidationError = false;
                
                if(this._extractTempletService.allValidationResponse.hasOwnProperty("01_1"))
				{
					this._extractTempletService.removeResponseFromValidationMap("01_1");
				}

				let selectedRowDetail = 'selected_' + currentDetail + '_RowNo_' + (selectedIndex + 1);
				let rowId = currentFormNo + "_" + (selectedIndex + 1);

				let selectedRowElem = document.getElementById(selectedRowDetail);
				if (selectedRowElem != null && selectedRowElem.classList.contains('disableRow')) 
				{
					selectedRowElem.classList.remove('disableRow');
					selectedRowElem.classList.add('enableRow');

					let editBtnId = 'editBtn_' + (selectedIndex + 1);
					let editElem = document.getElementById(editBtnId);
					if (editElem != null && editElem.classList.contains('showDeleteBtn')) 
					{
						editElem.classList.remove('showDeleteBtn');
						editElem.classList.add('editDetailBtn');
					}

				}
				
				if (this.currentValidationRow && this.currentValidationRow.length > 0) 
				{
					this.currentValidationRow.splice(0, 1);
				}
				if(this.transMode != 'I')
				{
					this.currentValidationRow.push(rowId);
				}
                
				if (isSaveClick) 
				{
					this.afterSaveClick(false);
				}
				else if (isAddClick) 
				{
					this.addNewDetailRow(currentFormNo, selectedIndex, isFromAttachPdf, detailDataFromPdf);
				}
				else 
				{
					this.updateChgStr(currentFormNo, selectedIndex);
					// this.callLocalItemChange('itm_defaultedit', '', currentFormNo, 'upper', selectedIndex);
					this.getFieldItemChange('itm_defaultedit','',currentRowDomId,currentFormNo,selectedIndex);
				}
			}
			else 
			{
				this.checkValidationError = true;
				this.setFocusOnError(currentFormNo, selectedIndex, currentRowDomId, columnName);
			}
        });
	}
	
	removeDeletedData()
	{
		
		for(let i=2; i<=this.numOfForms; i++)
		{
			let formNo = i;
			let currDet = 'Detail' + formNo;
			let allformValuesDemo:any = [];
			
			if(this.allformValues[currDet] != undefined)
			{
				let detailLen = this.allformValues[currDet].length;
				
				let indOfRemovedData:any = [];
				if(detailLen != null)
				{
					for(let j=0; j<detailLen; j++)
					{
						let detailData = this.allformValues[currDet][j];
						
						let attribute = detailData['attribute'];
						let domID = detailData['domID'];
						let updateFlag;
						if(attribute != null && attribute instanceof Object)
						{
							updateFlag = attribute['updateFlag'];
						}
						let detailId = 'selected_' + currDet + '_RowNo_' + domID;
						let detailElem: any = document.getElementById(detailId);
						if(detailElem != null && detailElem.getAttribute('style') != null && detailElem.getAttribute('style').includes('display: none') && updateFlag != 'D')
						{
							indOfRemovedData.push(j);
							updateFlag = '';
						}
					}
					for(let k=0; k<detailLen; k++)
					{
						if(!indOfRemovedData.includes(k))
						{
							let data = this.allformValues[currDet][k];
							allformValuesDemo.push(data);
						}
					}
					this.allformValues[currDet] = allformValuesDemo;
				}
			}
		}
		// this.arrayOfDateFields = [];
		// this.formatFieldsValue();
		this.cdr.markForCheck();
	}

	onNext(previousFormNo: any, previousDomId: any, currentFormNo: any, index:any, isAddDetail:any, isSaveClick?: boolean)
	{
		let modifiedDomId = previousDomId;
		if( previousDomId.length == '1')
		{
			modifiedDomId = '0'+previousDomId;
		}
		// Get previous form's row index from currentValidationRow (format: "formNo_rowIndex")
		let previousRowIndex: any = undefined;
		if(this.currentValidationRow && this.currentValidationRow.length > 0)
		{
			let validationData = this.currentValidationRow[0];
			let parts = validationData.split('_');
			previousRowIndex = parts[1];
		}
		let pkvalues = this.pkValues;
		if (this.editFlag == 'E')
		{
			pkvalues = pkvalues.substring(0, pkvalues.length - 1);
		}
		let tempData = {};
		tempData['OBJ_NAME'] = this.objName;
		tempData['CHG_DATA'] = this.buildChgStr(previousFormNo, undefined, previousRowIndex);
		tempData['OBJ_CONTEXT'] = previousFormNo;
		tempData['EDIT_FLAG'] = this.editFlag;
		tempData['PK_VALUES'] = pkvalues;
		tempData['ACTION'] = 'NEXT';
		tempData['FORM_NO'] = previousFormNo;
		tempData['EDITOR'] = 'MobEditor';
		tempData['DOM_ID'] = previousDomId;
		tempData['EDITOR_ID'] = this.editorId;
		console.log('[validateAndNext] params - FORM_NO:', previousFormNo, 'OBJ_CONTEXT:', previousFormNo, 'DOM_ID:', previousDomId, 'previousRowIndex:', previousRowIndex, 'CHG_DATA:', tempData['CHG_DATA']);
		let paramString = this._extractTempletService.getEncodedParamString(tempData);
		this._extractTempletService.setLoading(true);

		const handleValidateNextForce = (forceResp:any) => {
			this._extractTempletService.setLoading(false);
			this._extractTempletService.checkErrorExceptionJson(forceResp, (forceResult:any) =>{
				if(forceResult == true && this._extractTempletService.isForceSave())
				{
					console.log('[validateAndNext] another warning, resending with FORCESAVE=true again');
					this._extractTempletService.setLoading(true);
					this._extractTempletService.validateAndNext(forceParamString).subscribe(handleValidateNextForce);
				}
				else if(!forceResult)
				{
					this._extractTempletService.setForcedSave(false);
					this._extractTempletService.setLoading(false);
					// Check if this is Warning Cancel (response still has error data) vs genuine success
					try {
						let respCheck = JSON.parse(forceResp);
						let errorsObj = respCheck?.data?.Root?.Errors;
						if(errorsObj && (errorsObj[1]?.error || errorsObj?.error))
						{
							console.log('[validateAndNext] Warning Cancel detected in force handler, focusing on error field');
							this.focusOnValidateNextError(forceResp, previousFormNo, previousDomId, previousRowIndex);
							return;
						}
					} catch(e) {}
					// Force save success — process the response
					this.processValidateNextSuccess(forceResp, modifiedDomId, previousFormNo, previousDomId, previousRowIndex, currentFormNo, index, isAddDetail, isSaveClick);
				}
				else
				{
					// Error after force save — focus on error field
					this._extractTempletService.setForcedSave(false);
					this._extractTempletService.setLoading(false);
					this.focusOnValidateNextError(forceResp, previousFormNo, previousDomId, previousRowIndex);
				}
			});
		};
		let forceParamString = paramString + "&FORCESAVE=true";

		this._extractTempletService.validateAndNext( paramString).subscribe( (newresponse:any)=> {
			this._extractTempletService.setLoading(false);
			this._extractTempletService.checkErrorExceptionJson(newresponse, (result:any) =>{
				console.log('validateAndNext result::::',result);
				if(result == true && this._extractTempletService.isForceSave())
				{
					// Warning OK — resend with FORCESAVE=true
					console.log('[validateAndNext] forceSave is true, resending with FORCESAVE=true');
					this._extractTempletService.setLoading(true);
					this._extractTempletService.validateAndNext(forceParamString).subscribe(handleValidateNextForce);
					return;
				}
				else if(!result)
				{
					this._extractTempletService.setLoading(false);
					// Check if this is Warning Cancel (response still has error data) vs genuine success
					try {
						let respCheck = JSON.parse(newresponse);
						let errorsObj = respCheck?.data?.Root?.Errors;
						if(errorsObj && (errorsObj[1]?.error || errorsObj?.error))
						{
							console.log('[validateAndNext] Warning Cancel detected, focusing on error field');
							this.focusOnValidateNextError(newresponse, previousFormNo, previousDomId, previousRowIndex);
							return;
						}
					} catch(e) {}
					// Success (no error) — process the response
					this.processValidateNextSuccess(newresponse, modifiedDomId, previousFormNo, previousDomId, previousRowIndex, currentFormNo, index, isAddDetail, isSaveClick);
				}
				else
				{
					// Error OK — focus on error field
					this._extractTempletService.setLoading(false);
					this.focusOnValidateNextError(newresponse, previousFormNo, previousDomId, previousRowIndex);
				}
			});
		});
	}

	private processValidateNextSuccess(response: any, modifiedDomId: any, previousFormNo: any, previousDomId: any, previousRowIndex: any, currentFormNo: any, index: any, isAddDetail: any, isSaveClick?: boolean)
	{
		let callbackResp = response.split('%%SEP%%');
		let respData = callbackResp[0];
		let isError = callbackResp[1] ? callbackResp[1].trim() : 'false';
		let columnName = callbackResp[2];
		this.detailCount++;
		if(!(isError == "true"))
		{
			if(this._extractTempletService.allValidationResponse.hasOwnProperty(modifiedDomId + "_" + previousDomId))
			{
				this._extractTempletService.removeResponseFromValidationMap( modifiedDomId + "_" + previousDomId)
			}
			if(this.transMode != 'I')
			{
				this.currentValidationRow.splice(0, 1);
			}
			if (isSaveClick)
			{
				this.afterSaveClick(false);
			}
			else if (currentFormNo == "1")
			{
			}
			else if (isAddDetail)
			{
				this.addNewDetailRow(currentFormNo, index);
			}
		}
		else
		{
			let currDet = 'Detail' + previousFormNo;
			this.setFocusOnError(currDet, previousRowIndex, previousDomId, columnName);
		}
	}

	private focusOnValidateNextError(response: any, previousFormNo: any, previousDomId: any, previousRowIndex: any)
	{
		try
		{
			let respData = JSON.parse(response);
			let errorData = respData?.data?.Root?.Errors?.[1]?.error;
			if(!errorData)
			{
				errorData = respData?.data?.Root?.Errors?.error;
			}
			if(errorData && errorData['column_name'])
			{
				let errorColName = errorData['column_name'];
				let objContext = errorData['objContext'] ? String(errorData['objContext']).trim() : previousFormNo;
				let detailDomId = errorData['detailDomId'] ? String(errorData['detailDomId']).trim() : null;
				let currentDet = 'Detail' + objContext;
				let focusDomID = detailDomId || previousDomId;
				if(objContext == '1')
				{
					focusDomID = this.allformValues['domID'];
				}
				setTimeout(() => {
					this.setFocusOnError(currentDet, previousRowIndex, focusDomID, errorColName);
				}, 500);
			}
		}
		catch(e:any)
		{
			console.log('Exception setting focus on validateAndNext error field:', e.message);
		}
	}

	validateCurrentDetail(formNo:any, domID:any, currentFormNo:any, index:any, isAddDetail:any, isFromAttachPdf?: boolean | any, detailDataFromPdf?:any, isSaveClick?: boolean, isTaxClick: boolean = false) 
	{
		let modifiedDomId = domID;
		if(domID)
		{
			modifiedDomId = '0'+domID;
			let id = 'selected_' + "Detail" + formNo + '_RowNo_' + domID;
			let elemSelected:any = document.getElementById(id);
			
			if (isSaveClick) 
			{
				let detailLen = 0;
				let detailNo = "Detail" + formNo;
				if (this.allformValues.hasOwnProperty(detailNo)) 
				{
					detailLen = this.allformValues[detailNo].length;
				}
				// let detailIndex = detailLen;
				// let rowData = currentFormNo + "_" + detailIndex;
				this.callPreValidate(false, domID, currentFormNo, index, null, false, false);
			}
			if( elemSelected != null )
			{
				if (elemSelected.getAttribute('style') != null) 
				{
					if (elemSelected.getAttribute('style').includes('display: none')) 
					{
						let newRowData = currentFormNo + "_" + index;
						
						if(this.transMode != 'I')
						{
							this.currentValidationRow.splice(0, 1);
							this.currentValidationRow.push(newRowData);
						}
						if (isSaveClick) 
						{
							this.afterSaveClick(false);
						}
						else if (currentFormNo == "1") 
						{
							
						}
						else if (isAddDetail) 
						{
							this.addNewDetailRow(formNo, index, isFromAttachPdf, detailDataFromPdf);
						}
						else 
						{
							this.updateChgStr(currentFormNo, index);
							// this.callLocalItemChange('itm_defaultedit', '', currentFormNo, 'upper', index);
							this.getFieldItemChange('itm_defaultedit','',domID,currentFormNo,index);
						}
						return;
					}
				}
			}
			if(this.transMode != 'I')
			{
				let action = "Pre_Validate";
				let forcedSave = "true";
				let pkvalues = this.pkValues;
				let pageContext = "1";
				if (this.editFlag == 'E')
				{
					action = "EDIT";
					forcedSave = "false";
					pkvalues = pkvalues.substring(0, pkvalues.length - 1);
					pageContext = "2";
				}
				let finalXml = this.getCurrentRowXML(currentFormNo, pageContext, action, forcedSave, pkvalues, domID);
				if(finalXml != '')
				{
					// Find the array index of the previous row using domID (previous row's domID)
					let prevRowIndex = index;
					let prevDetailNo = "Detail" + currentFormNo;
					if (domID && this.allformValues && this.allformValues[prevDetailNo]) {
						for (let k = 0; k < this.allformValues[prevDetailNo].length; k++) {
							if (this.allformValues[prevDetailNo][k]['domID'] == domID) {
								prevRowIndex = k;
								break;
							}
						}
					}
					let tempParam = {};
					tempParam['OBJ_NAME'] = this.objName;
					tempParam['CHG_DATA'] = this.buildChgStr(currentFormNo, undefined, prevRowIndex);
					tempParam['OBJ_CONTEXT'] = currentFormNo;
					tempParam['EDIT_FLAG'] = this.editFlag;
					tempParam['PK_VALUES'] = pkvalues.substring(0, pkvalues.length - 1);
					tempParam['ACTION'] = 'ADD_DETAIL_DOM';
					tempParam['FORM_NO'] = currentFormNo;
					tempParam['EDITOR'] = "MobEditor";
					tempParam['DOM_ID'] = domID;
					tempParam['EDITOR_ID'] = this.compData['EDITOR_ID'];
					console.log('[validateAndDone] params - FORM_NO:', currentFormNo, 'OBJ_CONTEXT:', currentFormNo, 'DOM_ID:', domID);

					// this.transActionUtility.onValidateDetail(this.compData['OBJ_NAME'], finalXml, this.compData['EDITOR_ID'], currentFormNo, this.compData['PK_VALUES'], domID, 'JSON', (response: any) => {
					let paramString = this._extractTempletService.getEncodedParamString(tempParam);
					this._extractTempletService.setLoading(true);
					this._extractTempletService.validateAndDone( paramString).subscribe( (response:any)=> {
					this._extractTempletService.setLoading(false);
					this._extractTempletService.checkErrorExceptionJson(response, (result:any) =>{
						if(result == true && this._extractTempletService.isForceSave())
						{
							console.log('[validateAndDone] forceSave is true, resending with FORCESAVE=true');
							let forceParamString = paramString + "&FORCESAVE=true";
							const handleValidateDoneForce = (forceResp:any) => {
								this._extractTempletService.setLoading(false);
								this._extractTempletService.checkErrorExceptionJson(forceResp, (forceResult:any) =>{
									if(forceResult == true && this._extractTempletService.isForceSave())
									{
										console.log('[validateAndDone] another warning, resending with FORCESAVE=true again');
										this._extractTempletService.setLoading(true);
										this._extractTempletService.validateAndDone(forceParamString).subscribe(handleValidateDoneForce);
									}
									else if(!forceResult)
									{
										this._extractTempletService.setForcedSave(false);
										this._extractTempletService.setLoading(false);
										// Check if this is Warning Cancel (response still has error data) vs genuine success
										try {
											let respCheck = JSON.parse(forceResp);
											let errorsObj = respCheck?.data?.Root?.Errors;
											if(errorsObj && (errorsObj[1]?.error || errorsObj?.error))
											{
												console.log('[validateAndDone] Warning Cancel detected in force handler, focusing on error field');
												let errorData = errorsObj[1]?.error || errorsObj?.error;
												if(errorData && errorData['column_name'])
												{
													let errorColName = errorData['column_name'];
													let objContext = errorData['objContext'] ? errorData['objContext'].trim() : currentFormNo;
													let detailDomId = errorData['detailDomId'] ? errorData['detailDomId'].trim() : null;
													let currentDet = 'Detail' + objContext;
													let focusDomID = '';
													if(objContext == '1') { focusDomID = this.allformValues['domID']; }
													else if(detailDomId) { focusDomID = detailDomId; }
													else { focusDomID = domID; }
													setTimeout(() => {
														this.setFocusOnError(currentDet, index, focusDomID, errorColName);
													}, 500);
												}
												return;
											}
										} catch(e) {}
										// Force save success — process the response
										this.processValidateDoneResponse(forceResp, modifiedDomId, formNo, currentFormNo, index, domID, isAddDetail, isFromAttachPdf, detailDataFromPdf, isSaveClick, isTaxClick);
									}
									else
									{
										this._extractTempletService.setForcedSave(false);
										this._extractTempletService.setLoading(false);
										try
										{
											let forceRespData = JSON.parse(forceResp);
											let forceErrorData = forceRespData?.data?.Root?.Errors?.[1]?.error;
											if(!forceErrorData)
											{
												forceErrorData = forceRespData?.data?.Root?.Errors?.error;
											}
											if(forceErrorData && forceErrorData['column_name'])
											{
												let errorColName = forceErrorData['column_name'];
												let objContext = forceErrorData['objContext'] ? forceErrorData['objContext'].trim() : currentFormNo;
												let detailDomId = forceErrorData['detailDomId'] ? forceErrorData['detailDomId'].trim() : null;
												let currentDet = 'Detail' + objContext;
												let focusDomID = '';
												if(objContext == '1')
												{
													focusDomID = this.allformValues['domID'];
												}
												else if(detailDomId)
												{
													focusDomID = detailDomId;
												}
												else
												{
													focusDomID = domID;
												}
												setTimeout(() => {
													this.setFocusOnError(currentDet, index, focusDomID, errorColName);
												}, 500);
											}
										}
										catch(e:any)
										{
											console.log('Exception setting focus on validateAndDone force error field:', e.message);
										}
									}
								});
							};
							this._extractTempletService.setLoading(true);
							this._extractTempletService.validateAndDone(forceParamString).subscribe(handleValidateDoneForce);
							return;
						}
						else if(!result)
						{
							this._extractTempletService.setLoading(false);
							// Check if this is Warning Cancel (response still has error data) vs genuine success
							try {
								let respCheck = JSON.parse(response);
								let errorsObj = respCheck?.data?.Root?.Errors;
								if(errorsObj && (errorsObj[1]?.error || errorsObj?.error))
								{
									console.log('[validateAndDone] Warning Cancel detected, focusing on error field');
									let errorData = errorsObj[1]?.error || errorsObj?.error;
									if(errorData && errorData['column_name'])
									{
										let errorColName = errorData['column_name'];
										let objContext = errorData['objContext'] ? errorData['objContext'].trim() : currentFormNo;
										let detailDomId = errorData['detailDomId'] ? errorData['detailDomId'].trim() : null;
										let currentDet = 'Detail' + objContext;
										let focusDomID = '';
										if(objContext == '1') { focusDomID = this.allformValues['domID']; }
										else if(detailDomId) { focusDomID = detailDomId; }
										else { focusDomID = domID; }
										setTimeout(() => {
											this.setFocusOnError(currentDet, index, focusDomID, errorColName);
										}, 500);
									}
									return;
								}
							} catch(e) {}

							// Process validate done success response
							this.processValidateDoneResponse(response, modifiedDomId, formNo, currentFormNo, index, domID, isAddDetail, isFromAttachPdf, detailDataFromPdf, isSaveClick, isTaxClick);

						}
						else
						{
							// Error OK - set focus on error field
							this._extractTempletService.setForcedSave(false);
							this._extractTempletService.setLoading(false);
							try
							{
								let respData = JSON.parse(response);
								let errorData = respData?.data?.Root?.Errors?.[1]?.error;
								if(!errorData)
								{
									errorData = respData?.data?.Root?.Errors?.error;
								}
								if(errorData && errorData['column_name'])
								{
									let errorColName = errorData['column_name'];
									let objContext = errorData['objContext'] ? errorData['objContext'].trim() : currentFormNo;
									let detailDomId = errorData['detailDomId'] ? errorData['detailDomId'].trim() : null;
									let currentDet = 'Detail' + objContext;
									let focusDomID = '';
									if(objContext == '1')
									{
										focusDomID = this.allformValues['domID'];
									}
									else if(detailDomId)
									{
										focusDomID = detailDomId;
									}
									else
									{
										focusDomID = domID;
									}
									console.log('[validateAndDone ErrorOK] setFocusOnError params - currentDet:', currentDet, 'focusDomID:', focusDomID, 'errorColName:', errorColName);
									setTimeout(() => {
										this.setFocusOnError(currentDet, index, focusDomID, errorColName);
									}, 500);
								}
							}
							catch(e:any)
							{
								console.log('Exception setting focus on validateAndDone error field:', e.message);
							}
						}
					});
				});
				}
				else
				{
					if (isSaveClick)
					{
						this.afterSaveClick(false);
					}
					else if (currentFormNo == "1")
					{

					}
					else if (isAddDetail)
					{
						this.addNewDetailRow(currentFormNo, index, isFromAttachPdf, detailDataFromPdf);
					}
					else
					{
						this.updateChgStr(currentFormNo, index);
						// this.callLocalItemChange('itm_defaultedit', '', currentFormNo, 'upper', index);
						this.getFieldItemChange('itm_defaultedit','',domID,currentFormNo,index);
					}
					
				}
			}
			else
			{
				if (isAddDetail) 
				{
					this.addNewDetailRow(formNo, index, isFromAttachPdf, detailDataFromPdf);
				}
			}
		}
		this.cdr.markForCheck();
	}

	private processValidateDoneResponse(response: any, modifiedDomId: any, formNo: any, currentFormNo: any, index: any, domID: any, isAddDetail: any, isFromAttachPdf: any, detailDataFromPdf: any, isSaveClick: any, isTaxClick: any)
	{
		let preValidateResp = JSON.parse(response);
		console.log('print preValidateResp 3457::::::',preValidateResp);

		// Detect response format: new JSON API format (object) vs old %%SEP%% format (string)
		let addDetailResp: any = null;
		let isError = 'false';
		let columnName = '';

		if(typeof preValidateResp === 'object' && preValidateResp !== null)
		{
			// New JSON API format - extract detail data from Root
			if(preValidateResp.data && preValidateResp.data.Root)
			{
				addDetailResp = preValidateResp.data.Root;
			}
			else if(preValidateResp.Root)
			{
				addDetailResp = preValidateResp.Root;
			}
			else
			{
				addDetailResp = preValidateResp;
			}
		}
		else if(typeof preValidateResp === 'string')
		{
			// Old %%SEP%% format
			let callbackResp = preValidateResp.split('%%SEP%%');
			preValidateResp = callbackResp[0];
			isError = callbackResp[1] ? callbackResp[1].trim() : 'false';
			columnName = callbackResp[2] || '';
			if(preValidateResp != undefined && preValidateResp != null && isError != 'true')
			{
				addDetailResp = JSON.parse(preValidateResp);
			}
		}

		if(addDetailResp != null && isError != 'true')
		{
			for (const key of Object.keys(addDetailResp))
			{
				if(this.allformValues && this.allformValues[key])
				{
					if(addDetailResp[key] && addDetailResp[key].length > 0)
					{
						for(let i=0; i < addDetailResp[key].length; i++)
						{
							if(addDetailResp[key][i] && addDetailResp[key][i]['domID'] && this.allformValues[key][i] && this.allformValues[key][i]['domID'] && addDetailResp[key][i]['domID'] == this.allformValues[key][i]['domID'])
							{
								Object.keys(addDetailResp[key][i]).forEach(name => {
									if(typeof addDetailResp[key][i][name] === 'object')
									{
										if(addDetailResp[key][i][name].protect)
										{
											if(addDetailResp[key][i][name].protect.toString() == "")
											{
												this.allformValues[key][i][name+'_protect'] = "0";
											}
											else
											{
												this.allformValues[key][i][name+'_protect'] = addDetailResp[key][i][name].protect.toString();
											}
										}
										else
										{
											this.allformValues[key][i][name+'_protect'] = '0';
										}
										if(addDetailResp[key][i][name].visible)
										{
											this.allformValues[key][i][name+'_visible'] = addDetailResp[key][i][name].visible;
										}
										else
										{
											this.allformValues[key][i][name+'_visible'] = '';
										}
										let addContentVal = addDetailResp[key][i][name].content;
										if(addContentVal && addContentVal !== '[object Object]')
										{
											this.allformValues[key][i][name] = addContentVal;
										}
										else
										{
											this.allformValues[key][i][name] = '';
										}
									}
									else
									{
										this.allformValues[key][i][name+'_protect'] = '0';
									}
									let id = 'Detail'+ (i + 1) + '.' + addDetailResp[key][i]['domID'] + '.' + name;
									let value = addDetailResp[key][i][name];
									if (value == undefined || value == null)
									{
										value = "";
									}

									if (this.checkIsDateFormat(name, formNo))
									{
										let fldValue = value;
										if (fldValue)
										{
											if(typeof fldValue === 'object')
											{
												if(fldValue.content)
												{
													fldValue = fldValue.content;
												}
											}
											let date;
											const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
											if (isoDateRegex.test(fldValue))
											{
												date = new Date(fldValue);
											}
											else
											{
												if(typeof fldValue === 'string')
												{
													date = this.parseCustomDateFormat(fldValue);
												}
											}
											if (date && !isNaN(date.getTime()))
											{
												value = this.formatDate(date);
												if(value.includes("/"))
												{
													this.allformValues[key][i][name] = this.convertStringToDate(value)
												}
											}
										}
									}
								});
							}
						}
					}
				}

			}
		}
		this.validateResponse = isError;
		if(this.saveTrue == true)
		{
			if(isError != 'true')
			{
				isSaveClick = true;
			}
		}
		if (!(isError == 'true'))
		{
			this.checkValidationError = false;
			if(this._extractTempletService.allValidationResponse.hasOwnProperty(modifiedDomId + "_" + formNo))
			{
				this._extractTempletService.removeResponseFromValidationMap( modifiedDomId + "_" + formNo)
			}
			let rowData = currentFormNo + "_" + index;

			if(this.transMode != 'I')
			{
				this.currentValidationRow.splice(0, 1);
				this.currentValidationRow.push(rowData);
			}

			if (isSaveClick)
			{
				this.afterSaveClick(false);
			}
			else if (currentFormNo == "1")
			{

			}
			else if (isAddDetail)
			{
				this.addNewDetailRow(currentFormNo, index, isFromAttachPdf, detailDataFromPdf);
			}
			else if( isTaxClick )
			{
				this.taxResponseData = JSON.stringify(addDetailResp);
				this.currentFormNo = currentFormNo;
				this.createTaxDetOverLay();
			}
			else
			{
				this.updateChgStr(currentFormNo, index);
			}
		}
		else
		{
			this.checkValidationError = true;
			let currDet;
			if(this.currentFormNumber != currentFormNo)
			{
				currDet = 'Detail' + currentFormNo
			}
			else
			{
				currDet = 'Detail' + this.currentFormNumber
			}
			this.setFocusOnError(currDet, index, domID, columnName);
		}
		this.cdr.markForCheck();
		if (isError != 'true' && this.overLayForFeedView)
		{
			this.overLayForFeedView.dispose();
		}
	}

	setFocusOnError(currentDet: any, index: any, domID: any, columnName: any)
	{
		console.log('[setFocusOnError] called with currentDet:', currentDet, 'index:', index, 'domID:', domID, 'columnName:', columnName);
		if (columnName)
		{
			columnName = columnName.toLowerCase();
			let id = `${currentDet}-${domID}-${columnName}`;
			let elem = document.getElementById(id);
			if (!elem)
			{
				id = `${currentDet}.${domID}.${columnName}`;
				elem = document.getElementById(id);
			}
			console.log('[setFocusOnError] looking for element id:', id, 'found:', elem != null);

			if (elem)
			{
				let childElem = elem.closest('.collapseGroupBoxChild') as HTMLElement;
				let expandedChildElem = elem.closest('.expandGroupBoxChild') as HTMLElement;
				let feedCollapseElem = elem.closest('.bb-feed-collapseGroupBox') as HTMLElement;
				let feedExpandElem = elem.closest('.bb-feed-expandGroupBox') as HTMLElement;
				let showMoreElem = document.getElementById('moreBtnForExtractId');
				let showMoreText = showMoreElem?.children[0]?.innerHTML.trim();
	
				if (childElem && !expandedChildElem) 
				{
					this.expandGroupsBoxOnError(elem);
				}
				if (feedCollapseElem) 
				{
					this.expandFeedGroupsBoxOnError(feedCollapseElem);
				} 
				else if (feedExpandElem)
				{
					elem.focus({ preventScroll: true });
					this.scrollIntoViewInsideContainer(elem);
				}

				if (showMoreText === 'Show More' && childElem)
				{
					this.onContextMenuClick(null, 'moreBtnForExtractId', true);
					this.expandGroupsBoxOnError(elem);
				}
				else if (showMoreText === 'Show Less' && expandedChildElem)
				{
					elem.focus({ preventScroll: true });
					this.scrollIntoViewInsideContainer(elem);
				}
				else if (showMoreText === 'Show More' && expandedChildElem)
				{
					this.onContextMenuClick(null, 'moreBtnForExtractId', true);
					this.expandGroupsBoxOnError(elem);
				}
				else if (showMoreText === 'Show Less' && childElem)
				{
					this.expandGroupsBoxOnError(elem);
				}
				else if(showMoreText === 'Show All' && childElem)
				{
					this.onContextMenuClick(null, 'moreBtnForExtractId', true);
					this.expandGroupsBoxOnError(elem);
				}

				console.log('[setFocusOnError] elem tagName:', elem.tagName, 'disabled:', elem.hasAttribute('disabled'), 'type:', elem.getAttribute('type'), 'class:', elem.className);
				if (elem)
				{
					// Defer scroll and focus to allow browser to re-render after group expansion
					setTimeout(() => {
						this.scrollIntoViewInsideContainer(elem);
						if(!elem.hasAttribute('disabled'))
						{
							elem.focus({ preventScroll: true });
						}
						console.log('[setFocusOnError] activeElement after focus:', document.activeElement?.id, document.activeElement?.tagName);
					}, 100);
				}
			}
		}
	}

	scrollIntoViewInsideContainer(elem: HTMLElement) {
		if (!elem) return;
		let container = document.getElementById('formContentDivID');
		if (!container) return;

		// First, scroll any inner detail table container (addScrollBar) if the element is inside one
		let detailTable = elem.closest('.addScrollBar') as HTMLElement;
		if (detailTable && detailTable !== container) {
			let tableRect = detailTable.getBoundingClientRect();
			let elemRect = elem.getBoundingClientRect();
			// Scroll horizontally within the detail table
			if (elemRect.left < tableRect.left || elemRect.right > tableRect.right) {
				let elemLeftRelative = elemRect.left - tableRect.left + detailTable.scrollLeft;
				let targetScrollLeft = elemLeftRelative - (tableRect.width / 2) + (elemRect.width / 2);
				detailTable.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
			}
			// Scroll vertically within the detail table
			if (elemRect.top < tableRect.top || elemRect.bottom > tableRect.bottom) {
				let elemTopRelative = elemRect.top - tableRect.top + detailTable.scrollTop;
				let targetScrollTop = elemTopRelative - (tableRect.height / 2) + (elemRect.height / 2);
				detailTable.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
			}
		}

		// Then scroll the outer formContentDivID container to bring the element (or its detail table) into view
		let containerRect = container.getBoundingClientRect();
		let elemRect = elem.getBoundingClientRect();
		let elemTopRelative = elemRect.top - containerRect.top + container.scrollTop;
		let targetScrollTop = elemTopRelative - (containerRect.height / 2) + (elemRect.height / 2);
		container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
	}

	focusNextEditableField() {
		try {
			let currentFieldId = 'Detail' + this.currentFormNumber + '.' + this.currentDomID + '.' + this.fieldName;
			let container = document.getElementById('simple-layout-ctr_simple_editor');
			if (!container) return;

			let allFocusable = Array.from(
				container.querySelectorAll('input:not([type="hidden"]), select, textarea')
			) as HTMLElement[];

			let editableFields = allFocusable.filter((el: any) => {
				if (el.disabled) return false;
				if (el.offsetParent === null) return false;
				if (el.closest('.hideCellData')) return false;
				return true;
			});

			let currentElem = document.getElementById(currentFieldId);
			if (!currentElem) {
				let dashId = 'Detail' + this.currentFormNumber + '-' + this.currentDomID + '-' + this.fieldName;
				currentElem = document.getElementById(dashId);
			}

			let currentIdx = -1;
			if (currentElem) {
				currentIdx = editableFields.indexOf(currentElem);
				if (currentIdx === -1) {
					let innerInput = currentElem.querySelector('input, textarea, select') as HTMLElement;
					if (innerInput) {
						currentIdx = editableFields.indexOf(innerInput);
					}
				}
			}

			if (currentIdx >= 0 && currentIdx < editableFields.length - 1) {
				let nextField = editableFields[currentIdx + 1];
				setTimeout(() => {
					nextField.focus({ preventScroll: true });
				}, 100);
			}
		} catch (e: any) {
			console.log('Exception in focusNextEditableField:', e?.message);
		}
	}

	editDetail(currentDetail:any, formNo:any, selectedIndex:any, selectedDomID:any)
	{
		this.waitForPendingFieldChange().then(() => {
		let rowData = formNo + "_" + selectedIndex;
		if(formNo == '1')
		{
			this.callPreValidate(false, selectedDomID, formNo, selectedIndex, null, false, false);
		}
		else if (this.currentValidationRow && this.currentValidationRow.length == 0) 
		{
			this.updateChgStr(formNo, selectedIndex);
			if(this.editFlag == 'A')
			{
				// this.callLocalItemChange('itm_default', '', formNo, 'upper', selectedIndex);
				this.getFieldItemChange('itm_default','',selectedDomID,formNo,selectedIndex);
			}
			else
			{
				// this.callLocalItemChange('itm_defaultedit', '', formNo, 'upper', selectedIndex);
				this.getFieldItemChange('itm_defaultedit','',selectedDomID,formNo,selectedIndex);
			}
			if(this.transMode != 'I')
			{
				this.currentValidationRow.push(rowData);
			}
		}
		else 
		{
			let previousDomId = 1;
			if(this.currentValidationRow && this.currentValidationRow.length > 0)
			{
				if(formNo == '1')
				{
					previousDomId = this.allformValues['domID'];
				}
				else
				{
					let prevDetail = 'Detail'+formNo;
					if(this.allformValues && this.allformValues[prevDetail] && this.allformValues[prevDetail][selectedIndex])
					{
						previousDomId = this.allformValues[prevDetail][selectedIndex]['domID'];
					}
				}
			}
			if(this.currentDomID != previousDomId)
			{
				this.validateCurrentDetail(formNo, previousDomId, formNo, selectedIndex, false, false, null, false,false);
			}		
		}
		this.cdr.markForCheck();
		});
	}

	addNewDetailRow(formNo:any, index:any, isFromAttachPdf?: boolean, detailDataFromPdf?:any)
	{
		let requiredFldExist = this.validateMandatoryFields(this.currentFormNumber, this.currentDomID);
		if(requiredFldExist == true)
		{
			return;
		}
		let detailNo = "Detail" + formNo;
		
		let detailLen = 0;
		if (this.allformValues.hasOwnProperty(detailNo)) 
		{
			detailLen = this.allformValues[detailNo].length;
		}
		if(this.transMode != 'I')
		{
			let previousDomId: any = 1;
			let previousIndex = index - 1;
			if (this.allformValues.hasOwnProperty(detailNo) && this.allformValues[detailNo][previousIndex]) 
			{
				let formObj = this.allformValues[detailNo][previousIndex];
				previousDomId = formObj['domID'];
			}
			let detailArray:any = [];
			// this.transActionUtility.onAddNewDetail(this.compData['OBJ_NAME'], formNo, this.compData['EDITOR_ID'], this.compData['PK_VALUES'], previousDomId, this.compData['RTEURN_TYPE'], (response: any) => {
			this._extractTempletService.setLoading(true);
			this._extractTempletService.getXmlDataDetails(this.objName, formNo, formNo, this.editorId, 'A' , 'XML_DATA_DETAIL',this.pkValues,'', previousDomId,'1','1', (response:any) =>
			{
				this._extractTempletService.setLoading(false);
				console.log('print response 3815::::::::',response);
				if(response && response['status'] && response['status'] == 'Reject')
				{
					const errorMsg = (response.data && response.data.message) ? response.data.message : 'Session rejected. Please sign in again.';
					console.error('getXmlDataDetails Reject:', errorMsg);
					this.bbconfirmBox.alert('Error', errorMsg, '').subscribe((resp: any) => {});
					return;
				}
				if(response && response['status'] && (response['status'] == 'exception' || response['status'] == 'error'))
				{
					let errorMsg = 'System Exception';
					if(response.data && response.data.Root && response.data.Root.Errors) {
						const errorData = response.data.Root.Errors.error || response.data.Root.Errors;
						errorMsg = errorData.description || errorData.message || errorMsg;
					} else if(response.message) {
						errorMsg = response.message;
					}
					console.error('getXmlDataDetails error:', errorMsg);
					this.bbconfirmBox.alert('Error', errorMsg, '').subscribe((resp: any) => {});
					return;
				}
				if(response && response['status'] == 'success')
				{
					/* let addDetailResp = response;
					let callbackRespNew = addDetailResp.split('%%SEP%%');
					addDetailResp = callbackRespNew[0];
					let isError = callbackRespNew[1].trim();
					if (!(isError == 'true')) */
					{
						// let addDetailRespNew = JSON.parse(addDetailResp);
						let addDetailRespNew = response['data'];
						let detailData = {} = addDetailRespNew.Root.DocumentRoot.group0.Header0[detailNo];
						console.log('print detailData 3827::::::::',detailData);
						if (detailLen != 0) 
						{
							detailArray = this.allformValues[detailNo];
						} 
						for(let key in detailData)
						{
							if(key === 'attribute' && typeof detailData[key] === 'object' && detailData[key] !== null)
							{
								detailData[key] = JSON.stringify(detailData[key]);
							}
						}
						detailArray.push(detailData);
						this.allformValues[detailNo] = detailArray;
						let domID = detailData['domID'];
						for (const key of Object.keys(detailData)) 
						{
							let id = 'Detail' + formNo + '.' + domID + '.' + key;
							let formId = 'Detail' + formNo + '-' + domID + '-' + key;
							if (detailData[key] && detailData[key].protect)
							{
								if(detailData[key].protect.toString() == "")
								{
									this.allformValues[detailNo][index][key+'_protect'] = "0";
								}
								else
								{
									this.allformValues[detailNo][index][key+'_protect'] = detailData[key].protect.toString();
								}
							}
							else
							{
								this.allformValues[detailNo][index][key+'_protect'] = "0";
							}
							if (detailData[key] && detailData[key].visible)
							{
								this.allformValues[detailNo][index][key+'_visible'] = detailData[key].visible;
							}
							else
							{
								this.allformValues[detailNo][index][key+'_visible'] = "";
							}
							if (detailData[key] && (detailData[key].content || detailData[key].content == 0)) 
							{
								let value = detailData[key].content;
								this.checkProtectAndVisbile(detailData, key, id, formId);
								if(value == null || value == undefined)
								{
									this.allformValues[detailNo][index][key] = "";
								}
								else
								{
									if (this.checkIsDateFormat(key, formNo)) 
									{
										const convertedDate = this.convertStringToDate(value);
										if (convertedDate) 
										{
											this.allformValues[detailNo][index][key] = convertedDate;
										} 
										else 
										{
											this.allformValues[detailNo][index][key] = value;
										}
									} 
									else 
									{
										this.allformValues[detailNo][index][key] = value;
									}
								}
							}
							else
							{
								let value = detailData[key];
								if (key === 'attribute' && value instanceof Object)
								{
									value = JSON.stringify(value);
								}
								else if (key != 'attribute' && value instanceof Object)
								{
									value = "";
								}
								this.checkProtectAndVisbile(detailData, key, id, formId);
								if(value == null || value == undefined)
								{
									this.allformValues[detailNo][index][key] = "";
								}
								else
								{
									if (this.checkIsDateFormat(key, formNo)) 
									{
										const convertedDate = this.convertStringToDate(value);
										if (convertedDate) 
										{
											this.allformValues[detailNo][index][key] = convertedDate;
										} 
										else 
										{
											this.allformValues[detailNo][index][key] = value;
										}
									} 
									else 
									{
										this.allformValues[detailNo][index][key] = value;
									}
								}
							}
						}
						if(this.currentValidationRow && this.currentValidationRow.length > 0)
						{
							this.currentValidationRow.splice(0, 1);
						}
						if(this.transMode != 'I')
						{
							this.currentValidationRow.push(formNo+"_"+index);
						}
						this.currentDomID = domID;
						this.currentFormNumber = formNo;
						this.updateChgStr(formNo, index);
						// this.callLocalItemChange('itm_default', '', formNo, 'upper', index)
						this.getFieldItemChange('itm_default','',domID,formNo,index);
						this.rowSelected(detailNo, index, domID, true);
						setTimeout(() => {
							this.setFocusOnFirstEditableFld(detailNo);
						}, 300);
						this._extractTempletService.setLoading(false);
					}

				}
			});
		}
		else
		{
			let loginId = localStorage.getItem('userName');
			let storageKey = this.objName + "" + formNo + "" + "F" + "_" + loginId;
			if (localStorage.getItem(storageKey)) 
			{
				let objMetadata = localStorage.getItem(storageKey);
				this.processMetadataResp(objMetadata,formNo, index);
			}
			// else
			// {
			// 	let tempData: any = {};
			// 	tempData['OBJ_NAME'] = this.compData["OBJ_NAME"]
			// 	tempData['ACTION'] = 'OBJ_METADATA';
			// 	tempData['FORM_NO'] = formNo;
			// 	tempData['PROFILEID'] = this.userInfo['result']['UserInfo']['profileId'];
			// 	tempData['FORM_NAME'] = '';
			// 	tempData['TAB_TYPE'] = 'F';
			// 	tempData['EDITOR'] = '';
			// 	tempData['dummyInt'] = '';
			// 	let paramString = this._extractTempletService.getEncodedParamString(tempData);
			// 	let url = this._extractTempletService.getHostURL() + '/ibase/RIAWizardHandlerServlet';
			// 	this._extractTempletService.isFromAttachPdf = false;
			// 	this._extractTempletService.setLoading(true);
			// 	this._extractTempletService.sendRequest(url, paramString, (objMetadata: any) => {
			// 		let callbackRespNew = objMetadata.split('%%SEP%%');
			// 		this._extractTempletService.setLoading(false);
			// 		objMetadata = callbackRespNew[0];
			// 		let isError = callbackRespNew[1].trim();
			// 		if (!(isError == 'true'))
			// 		{
			// 			localStorage.setItem(storageKey, objMetadata);
			// 			this.processMetadataResp(objMetadata, formNo, index);
			// 		}
			// 	});
			// }
		}
		this.cdr.markForCheck();
	}

	processMetadataResp(objMetadata: any,formNo:any, currentIndex: any) 
	{
		const elementsStrArr: string[] = objMetadata.split("~ELEMSEP~");
		let colObjStrArr: any = [];
		let tableColumnArr: any = [];
		for (let i = 0; i < elementsStrArr.length; i++) 
		{
			const strTok: string[] = elementsStrArr[i].split("~OBJSEP~");
			if(strTok.length > 1)
			{
				const tokenMap = parseTokens(strTok[1]);
				if (tokenMap) 
				{
					if (strTok[0] === "ColumnObject") 
					{
						colObjStrArr.push(tokenMap);
					}
					if (strTok[0] === "table_column") 
					{
						tableColumnArr.push(tokenMap);
					}
				}
			}
		}
		let detailForm = 'Detail' + formNo;
		let jsonObject: any = {};
		for (let tableColCtr = 0; tableColCtr < tableColumnArr.length; tableColCtr++) 
		{
			const tableColMap = tableColumnArr[tableColCtr];
			let name = tableColMap["name"];
			if(tableColMap["initial"])
			{
				jsonObject[name] = tableColMap["initial"];
			}
			else
			{
				jsonObject[name] = "";
			}
		}

		jsonObject['attribute'] = JSON.stringify({
			"updateFlag":"A",
			"pkNames":"",
			"selected":"N",
			"status":"N"
		});
		let domID: any;
		let index = 0;
		if(this.allformValues[detailForm])
		{
			let len = this.allformValues[detailForm].length;
			index = len - 1;
			if(index !== -1 && this.allformValues[detailForm][index])
			{
				let obj = this.allformValues[detailForm][index];
				domID = +obj['domID'] + 1;
			}
			else
			{
				domID = 1;
			}
		}
		else
		{
			domID = 1;
		}

		jsonObject['domID'] = domID;
		
		if(!this.allformValues[detailForm])
		{
			this.allformValues[detailForm] = [];
			
		}
		this.allformValues[detailForm].push(jsonObject);

		// this.callLocalItemChange('itm_defaultedit', '', formNo, 'upper', currentIndex)
		this.getFieldItemChange('itm_defaultedit','',domID,formNo,currentIndex);
		this.rowSelected('Detail'+formNo, currentIndex, domID, true);
		setTimeout(() => {
			this.setFocusOnFirstEditableFld('Detail'+formNo);
		}, 300);

		function parseTokens(this: any, tokenizedStr: string) 
		{
			const tokenMap: any = {};
			try 
			{
				const strMainTok = tokenizedStr.split("~PROPSEP~");
				for (let i = 0; i < strMainTok.length; i++) 
				{
					const strTok = strMainTok[i].split("~PROPVALSEP~");
					const strTok0 = strTok[0];
					let strTok1 = strTok.length > 1 ? strTok[1] : "";
					tokenMap[strTok0] = strTok1;
				}
				this.cdr.markForCheck();
			} 
			catch (error) 
			{
				console.error("Error parsing tokens:", error);
			}
			return tokenMap;
		}
	}

	private detailFocusInfo: any = null;

	onDetailFieldFocus(currentFormNo:any, id:any, index?: any, colName?: any) {
		this.isDetailInputFocused = true;
		// Store initial value to detect changes on blur
		let detailNo = 'Detail' + currentFormNo;
		let initialValue: any = '';
		if(colName) {
			if(this.allformValues[detailNo] && this.allformValues[detailNo][index]) {
				initialValue = this.allformValues[detailNo][index][colName];
			} else {
				initialValue = this.allformValues[colName];
			}
		}
		this.detailFocusInfo = { formNo: currentFormNo, id: id, index: index, colName: colName, initialValue: initialValue };
		this.cdr.detach();
		this.setFocusFormNo(currentFormNo, id, index);
	}

	onDetailFieldBlur(event:any, id:any, displayLabel?: any, dataType?: any) {
		this.isDetailInputFocused = false;
		this.cdr.reattach();

		// Read current value BEFORE setSelectedText, which overwrites allformValues with a string from the DOM
		let valueChanged = false;
		if(this.detailFocusInfo && this.detailFocusInfo.colName) {
			let fi = this.detailFocusInfo;
			let detailNo = 'Detail' + fi.formNo;
			let currentValue: any = '';
			if(this.allformValues[detailNo] && this.allformValues[detailNo][fi.index]) {
				currentValue = this.allformValues[detailNo][fi.index][fi.colName];
			} else {
				currentValue = this.allformValues[fi.colName];
			}
			valueChanged = (currentValue != fi.initialValue);
		}

		this.setSelectedText(event, id, displayLabel, dataType);

		// Call item change after reattach if value changed
		if(this.detailFocusInfo && this.detailFocusInfo.colName) {
			if(valueChanged && !this.isPreventItemChange && !this.isPreventEnterKeyItemChange) {
				let fi = this.detailFocusInfo;
				let detailNo = 'Detail' + fi.formNo;
				let fldValue: any = '';
				if(this.allformValues[detailNo] && this.allformValues[detailNo][fi.index]) {
					fldValue = this.allformValues[detailNo][fi.index][fi.colName];
				} else {
					fldValue = this.allformValues[fi.colName];
				}
				let parts = fi.id.split('.');
				let domID = parts.length > 1 ? parts[1] : '1';
				this.getFieldItemChange(fi.colName, fldValue, domID, fi.formNo, fi.index);
			} else {
				this.isPreventItemChange = false;
				this.isPreventEnterKeyItemChange = false;
			}
		}
		this.detailFocusInfo = null;
		this.cdr.detectChanges();
	}

	setFocusFormNo(currentFormNo:any,id:any, index?: any)
	{
		let fieldName;
		let fldValue;
		this.currentFormNo = currentFormNo;
		let previousFormNumber = this.currentFormNumber;
		let previousFormDomID = this.currentDomID;
		let inputElem = document.getElementById(id);
		this.selectedDetailRowIndex = index;
		this._extractTempletService.isSimpleLayoutCall = true;
		if(inputElem)
		{
			let iconId = id + "_Icon";
			let iconElem = document.getElementById(iconId);
			if (iconElem && iconElem.classList.contains('optionIcon')) 
			{
				iconElem.classList.remove('optionIcon');
				iconElem.classList.add('focusOptionIcon');
				let imgElem = iconElem.getElementsByTagName('img');
				if(imgElem && imgElem[0] && imgElem[0].classList.contains('dateIcon'))
				{
					imgElem[0].setAttribute('src','simpleditorplugin/assets/images/svg/date_simple_W.svg')
				}
			}
		}
		let currentRowDomId = '1';
		if(id && id.includes("."))
		{
			let focusColDetails: any = [];
			focusColDetails = id.split(".");
			this.currentFormNumber = "";
			this.currentFormNumber = focusColDetails[0].charAt(focusColDetails[0].length - 1);
			this.currentDomID = "";
			currentRowDomId = focusColDetails[1]; 
			this.currentDomID = focusColDetails[1];
			fieldName = focusColDetails[2];
			this.currentRowIndex = index;
			this.fieldName = focusColDetails[2];
		}
		if (this.currentValidationRow && this.currentValidationRow.length > 0) 
		{
			if(previousFormNumber == '1' && currentFormNo != previousFormNumber)
			{
				// let rowID = previousFormNumber + "_" + index;
				if(this.isAddDetail != true && this.checkValidationError == false)
				{
					this.callPreValidate(false, currentRowDomId, currentFormNo, index, null, false, false);
				}
				else 
				{
					this.isAddDetail = false;
					this.checkValidationError = false;
				}
			}
			else if(previousFormNumber != currentFormNo || (previousFormNumber == currentFormNo && previousFormDomID != this.currentDomID))
			{
				// In view mode, skip validation and validateAndDone API call
				if(this.editFlag === 'V')
				{
					// do nothing
				}
				else
				{
					let requiredExists = this.validateMandatoryFields(this.currentFormNumber, this.currentDomID);
					if(requiredExists == true)
					{
						return;
					}
					if(this.isAddDetail != true && this.checkValidationError == false)
					{
						this.validateCurrentDetail(currentFormNo, previousFormDomID, previousFormNumber, index, false, false, null, false,false);
						if(this.editFlag == 'E' && this.currentDomID)
						{
							// this.callLocalItemChange('itm_defaultedit', '', currentFormNo, 'upper', index);
							this.getFieldItemChange('itm_defaultedit','',this.currentDomID,currentFormNo,index);
						}
					}
					else
					{
						this.isAddDetail = false;
						this.checkValidationError = false;
					}
				}
			}
			else 
			{
				this.isAddDetail = false;
				this.checkValidationError = false;
			}
		}
		let currentDetail = 'Detail' + this.currentFormNumber;
		let isFocusOrBlur = true;
		if(currentDetail === "Detail1" && this.allformValues[currentDetail] === undefined)
		{
			const feedData: any = {};
			for (const key in this.allformValues) 
			{
				if (!key.startsWith("Detail")) 
				{
					if(this.allformValues[key] !== undefined)
					{
						if(typeof this.allformValues[key] != 'function')
						{
							feedData[key] = JSON.parse(JSON.stringify(this.allformValues[key]));
						}
					}
				}
			}
			this.previousFieldValue = feedData[fieldName];
			fldValue = feedData[fieldName];
			if (feedData[fieldName] && feedData[fieldName] !== "") 
			{
				this._extractTempletService.invokeSimpleLink(feedData, this.currentDomID, this.currentFormNumber, fieldName, this.objName, isFocusOrBlur,fldValue);
			} 
		} 
		else 
		{
			let feedData: any = {};
			let tempDomId = this.currentDomID;
			let matchingRecord = this.allformValues[currentDetail].find((record: any) => {
				return record.domID == tempDomId;
			});

			if (matchingRecord)
			{
				this.currentDomID = matchingRecord.domID;
				feedData = JSON.parse(JSON.stringify(matchingRecord));
				this.previousFieldValue = feedData[fieldName];
				fldValue = feedData[fieldName];
				if (feedData[fieldName] && feedData[fieldName] !== "")
				{
					this._extractTempletService.invokeSimpleLink(feedData, this.currentDomID, this.currentFormNumber, fieldName, this.objName, isFocusOrBlur,fldValue);
				}
			}
			else
			{
				console.log("No matching record found.");
			}
		}

		this.cdr.markForCheck();
	}
	
   
	afterSaveClick(isError:any)
	{
		this.waitForPendingFieldChange().then(() => {
		try
		{
			let requiredFldExist = this.validateMandatoryFields(this.currentFormNumber, this.currentDomID);
			if(requiredFldExist == true)
			{
				return;
			}
			let errorJson:any  = this._extractTempletService.allValidationResponse;
			console.log('afterSaveClick errorJson::::',errorJson);
			const ordered:any = {};
			Object.keys(errorJson).sort().forEach(function(key) 
			{
			ordered[key] = errorJson[key];
			});
			this._extractTempletService.allValidationResponse = {} =  ordered;
			errorJson  = this._extractTempletService.allValidationResponse;
			let keys = Object.keys(errorJson);
			console.log('afterSaveClick keys::::',keys);
			if( errorJson != null && keys != null && keys.length > 0 )
			{
				let keys = Object.keys(errorJson);
				let key = keys[0];
				let response = errorJson[key];
				this._extractTempletService.setLoading(true);
				this._extractTempletService.isFromAttachPdf = false;
				this._extractTempletService.displayErrorException(response, (res:any) => {
					console.log('afterSaveClick res::::',res);
					if (res) 
					{
						this._extractTempletService.setLoading(false);
						let errorJsonData  = this._extractTempletService.allValidationResponse;
						if( errorJsonData != null )
						{
							let errorKeys = Object.keys(errorJsonData);
							let currentKey = errorKeys[0];
							let errorColName = this._extractTempletService.columnNaame;
							let strArray = currentKey.split('_');
							
							let currDet = 'Detail' + strArray[1];
							let index = strArray[0];
							if( index.startsWith('0'))
							{
								index = index.substring(1);
							}
							let domID = '';
							if(strArray[1] == "1")
							{
								domID = this.allformValues['domID'];
							}
							else
							{
								domID = this.allformValues[currDet][index]['domID'];
							}
							if (this.currentValidationRow && this.currentValidationRow.length > 0) 
							{
								this.currentValidationRow.splice(0, 1);
							}
							if(this.transMode != 'I')
							{
								this.currentValidationRow.push(strArray[1]+"_"+index);
							}
							this.setFocusOnError(currDet, index, domID, errorColName);
						}
					}
					else
					{
						let errorColName = this._extractTempletService.columnNaame;
						let errorJsonData = this._extractTempletService.allValidationResponse;
						if(errorJsonData != null)
						{
							let errorKeys = Object.keys(errorJsonData);
							let currentKey = errorKeys[0];
							let strArray = currentKey.split('_');
							let currDet = 'Detail' + strArray[1];
							let index = strArray[0];
							if(index.startsWith('0'))
							{
								index = index.substring(1);
							}
							let domID = '';
							if(strArray[1] == "1")
							{
								domID = this.allformValues['domID'];
							}
							else
							{
								domID = this.allformValues[currDet][index]['domID'];
							}
							this.setFocusOnError(currDet, index, domID, errorColName);
						}
					}
				});
				return;
			}
			
			
			/* let action = "SAVE";
			let forcedSave = "false";
			let pkvalues = this.pkValues;
			let pageContext = "1";
			if (this.editFlag == 'E') 
			{
				action = "EDIT";
				forcedSave = "false";
				pkvalues = pkvalues.substring(0, pkvalues.length - 1);
				pageContext = "2";
			}
			let finalXml = "<Root>";
			finalXml = finalXml + "<header>";
			finalXml = finalXml + "<objName><![CDATA[" + this.compData["OBJ_NAME"] + "]]></objName>";
			finalXml = finalXml + "<pageContext><![CDATA[" + pageContext + "]]></pageContext>";
			finalXml = finalXml + "<objContext><![CDATA["+ this.currentFormNumber +"]]></objContext>";
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
			finalXml = finalXml + "</header>";
			finalXml = this.getCurrentFormXML(finalXml, this.currentFormNumber);
			finalXml = finalXml + "</Root>"; */

			let domID: any;
			console.log('afterSaveClick this.currentValidationRow::::',this.currentValidationRow);
			if(this.currentValidationRow && this.currentValidationRow.length > 0)
			{
            	if(this.currentFormNumber == '1')
				{
					domID = "1";
				}
				else if (this.currentValidationRow.length > 0)
				{
					if(this.currentRowIndex !== null && this.currentRowIndex !== undefined && this.currentRowIndex !== "")
						{
							domID = this.currentDomID;
						}
						else if(this.currentFormNumber && this.allformValues['Detail'+this.currentFormNumber] && this.allformValues['Detail'+this.currentFormNumber].length > 0)
						{
							let lastIndex = this.allformValues['Detail'+this.currentFormNumber].length-1;
							let formObj = this.allformValues['Detail'+this.currentFormNumber][lastIndex];
							domID = formObj['domID'];
						}
            	}
			}
			// Fallback: if domID is still undefined, use currentDomID or "1"
			if(domID === undefined || domID === null || domID === '')
			{
				domID = this.currentDomID || "1";
				console.log('afterSaveClick domID was undefined, using fallback:', domID);
			}
			console.log('afterSaveClick domID::::',domID);
			console.log('afterSaveClick isError::::',isError);
			if (!isError) 
			{
				// this.transActionUtility.onSave(this.compData["OBJ_NAME"], finalXml, this.currentFormNumber, this.editFlag, this.editorId, domID, (response: any) => {
				let tempData = {};
				tempData['OBJ_NAME'] = this.objName;
				tempData['FORM_DATA'] = this.buildChgStr(this.currentFormNo);
				tempData['FORM_NO'] = this.currentFormNo;
				tempData['SAVE_LVL'] = '1';
				tempData['SAVE_DOCUMENT'] = '';
				tempData['EDIT_FLAG'] = this.editFlag;
				tempData['FORM_TYPE'] = '';
				tempData['EDITOR_ID'] = this.editorId;
				tempData['EDITOR'] = 'MobEditor';
				tempData['IS_FORM_CHANGE'] = 'Y';
				console.log('[validateAndSave] params - FORM_NO:', this.currentFormNo, 'SAVE_LVL: 1');
				let paramString = this._extractTempletService.getEncodedParamString(tempData);
				this._extractTempletService.setLoading(true);
				this._extractTempletService.validateAndSave(paramString).subscribe( (response:any)=> {
					this._extractTempletService.setLoading(false);
					this._extractTempletService.checkErrorExceptionJson(response, (result:any) =>{
						console.log('validateAndSave result::::',result);
						if(result == true && this._extractTempletService.isForceSave())
						{
							console.log('[validateAndSave] forceSave is true, resending with FORCESAVE=true');
							let forceParamString = paramString + "&FORCESAVE=true";
							const handleValidateSaveForce = (forceResp:any) => {
								this._extractTempletService.setLoading(false);
								this._extractTempletService.checkErrorExceptionJson(forceResp, (forceResult:any) =>{
									if(forceResult == true && this._extractTempletService.isForceSave())
									{
										console.log('[validateAndSave] another warning, resending with FORCESAVE=true again');
										this._extractTempletService.setLoading(true);
										this._extractTempletService.validateAndSave(forceParamString).subscribe(handleValidateSaveForce, (error:any) => {
											console.log('Exception in retry force validateAndSave HTTP call:', error);
											this._extractTempletService.setLoading(false);
										});
									}
									else if(!forceResult)
									{
										this._extractTempletService.setForcedSave(false);
										this._extractTempletService.setLoading(false);
										// Check if this is Warning Cancel (response still has error data) vs genuine success
										try {
											let respCheck = JSON.parse(forceResp);
											let errorsObj = respCheck?.data?.Root?.Errors;
											if(errorsObj && (errorsObj[1]?.error || errorsObj?.error))
											{
												console.log('[validateAndSave] Warning Cancel detected in force handler, focusing on error field');
												let errorData = errorsObj[1]?.error || errorsObj?.error;
												if(errorData && errorData['column_name'])
												{
													let errorColName = errorData['column_name'];
													let objContext = errorData['objContext'] ? errorData['objContext'].trim() : '1';
													let detailDomId = errorData['detailDomId'] ? errorData['detailDomId'].trim() : null;
													let currentDet = 'Detail' + objContext;
													let focusDomID = '';
													if(objContext == '1') { focusDomID = this.allformValues['domID']; }
													else if(detailDomId) { focusDomID = detailDomId; }
													setTimeout(() => {
														this.setFocusOnError(currentDet, '1', focusDomID, errorColName);
													}, 500);
												}
												return;
											}
										} catch(e) {}
										// Force save success — process the response
										let saveData = JSON.parse(forceResp);
										console.log('validateAndSave forceSave saveData::::',saveData);
										let rootData = saveData?.data?.Root;
										if(rootData && rootData['Detail'] == 'Success' && rootData['MsgOnSave'])
										{
											this._extractTempletService.setLoading(false);
											let successMsg = rootData['TranID'] + ' - ' + rootData['MsgOnSave'];
											this.bbconfirmBox.alert('Success', successMsg, '').subscribe((resp: any) => {
												if(resp)
												{
													this.closeOuterPopup();
												}
											});
										}
									}
									else
									{
										this._extractTempletService.setForcedSave(false);
										this._extractTempletService.setLoading(false);
										try
										{
											let forceRespData = JSON.parse(forceResp);
											let forceErrorData = forceRespData?.data?.Root?.Errors?.[1]?.error;
											if(!forceErrorData)
											{
												forceErrorData = forceRespData?.data?.Root?.Errors?.error;
											}
											if(forceErrorData && forceErrorData['column_name'])
											{
												let errorColName = forceErrorData['column_name'];
												let objContext = forceErrorData['objContext'] ? forceErrorData['objContext'].trim() : '1';
												let detailDomId = forceErrorData['detailDomId'] ? forceErrorData['detailDomId'].trim() : null;
												let currentDet = 'Detail' + objContext;
												let focusDomID = '';
												if(objContext == '1')
												{
													focusDomID = this.allformValues['domID'];
												}
												else if(detailDomId)
												{
													focusDomID = detailDomId;
												}
												console.log('[ForceSaveError] setFocusOnError params - currentDet:', currentDet, 'focusDomID:', focusDomID, 'errorColName:', errorColName);
												setTimeout(() => {
													this.setFocusOnError(currentDet, '1', focusDomID, errorColName);
												}, 500);
											}
										}
										catch(e:any)
										{
											console.log('Exception setting focus on force save error field:', e.message);
										}
									}
								});
							};
							this._extractTempletService.setLoading(true);
							this._extractTempletService.validateAndSave(forceParamString).subscribe(handleValidateSaveForce, (error:any) => {
								console.log('Exception in force validateAndSave HTTP call:', error);
								this._extractTempletService.setLoading(false);
							});
							return;
						}
						else if(result == true)
						{
							console.log('validateAndSave response::::',response);
							let saveData = JSON.parse(response);

							console.log('validateAndSave saveData 4410::::',saveData);		
							if (saveData) 
							{

								let data = saveData?.data?.Root?.Errors[1]?.error;
								if(!data)
								{
									data = saveData?.data?.Root?.Errors?.error;
								}
								if(data && data['column_name'])
								{
									let errorColName = data['column_name'];
									let objContext = data['objContext'] ? data['objContext'].trim() : '1';
									let detailDomId = data['detailDomId'] ? data['detailDomId'].trim() : null;
									let currentDet = 'Detail' + objContext;
									let focusDomID = '';
									if(objContext == '1')
									{
										focusDomID = this.allformValues['domID'];
									}
									else if(detailDomId)
									{
										focusDomID = detailDomId;
									}
									console.log('[ErrorOK] setFocusOnError params - currentDet:', currentDet, 'focusDomID:', focusDomID, 'errorColName:', errorColName);
									setTimeout(() => {
										this.setFocusOnError(currentDet, '1', focusDomID, errorColName);
									}, 500);
								}

								try
								{
									// (window as any).setSummaryDetailData(tTranId, tObjName, allDataXmlStrg, xslRespStr);

								}
								catch
								{
									this._extractTempletService.setLoading(false);
								}
								this._extractTempletService.setLoading(false);
							}
							else 
							{
								let currDet = 'Detail' + this.currentFormNumber;
								let ind = this.currentRowIndex;
								if(this.currentFormNumber == '1' && !domID)
								{
									domID = "1";
								}
								// this.setFocusOnError(currDet, ind, domID, columnName);
								/* let msg = saveData['message'];
								let traceMsg = saveData['trace'];
								let columnName = saveData['column_name'];
								console.log('print columnName 4432::::',columnName);
								if(saveData && saveData['type'] && saveData['type'][0] && saveData['type'][0] == 'W')
								{
									this.bbconfirmBox.alert('Warning', msg, traceMsg).subscribe((resp: any) => {
										// this._extractTempletService.setLoading(false);
									if (resp) {
											// this._extractTempletService.setForcedSave(false);
											this.setFocusOnError(currDet, ind, domID, columnName);
										}
									});

								}
								else if(saveData && saveData['type'] && saveData['type'][0] && saveData['type'][0] == 'E')
								{
									this.bbconfirmBox.alert('Error', msg, traceMsg).subscribe((resp: any) => {
											// this._extractTempletService.setLoading(false);
										if (resp) 
										{
											// this._extractTempletService.setForcedSave(false);
											this.setFocusOnError(currDet, ind, domID, columnName);
											return;
										}
									});
								} */
							}
							
						}
						else
						{
							this._extractTempletService.setLoading(false);
							try
							{
								let respData = JSON.parse(response);
								let rootData = respData?.data?.Root;
								if(rootData && rootData['Detail'] == 'Success' && rootData['MsgOnSave'])
								{
									this._extractTempletService.setLoading(false);
									let successMsg = rootData['TranID'] + ' - ' + rootData['MsgOnSave'];
									this.bbconfirmBox.alert('Success', successMsg, '').subscribe((resp: any) => {
										if(resp)
										{
											this.closeOuterPopup();
										}
									});
								}
								else
								{
								let errorData = respData?.data?.Root?.Errors?.[1]?.error;
								if(!errorData)
								{
									errorData = respData?.data?.Root?.Errors?.error;
								}
								if(errorData && errorData['column_name'])
								{
									let errorColName = errorData['column_name'];
									let objContext = errorData['objContext'] ? errorData['objContext'].trim() : '1';
									let detailDomId = errorData['detailDomId'] ? errorData['detailDomId'].trim() : null;
									let currentDet = 'Detail' + objContext;
									let focusDomID = '';
									if(objContext == '1')
									{
										focusDomID = this.allformValues['domID'];
									}
									else if(detailDomId)
									{
										focusDomID = detailDomId;
									}
									console.log('[WarningCancel] setFocusOnError params - currentDet:', currentDet, 'focusDomID:', focusDomID, 'errorColName:', errorColName);
									setTimeout(() => {
										this.setFocusOnError(currentDet, '1', focusDomID, errorColName);
									}, 500);
								}
							}
							}
							catch(e:any)
							{
								console.log('Exception setting focus on error field:', e.message);
							}
						}
					});
				},
				(error:any) => {
					console.log('Exception in validateAndSave HTTP call:', error);
					this._extractTempletService.setLoading(false);
				});
			}
		}
		catch (e:any)
		{
			console.log('Exception afterSaveClick method....', e.message);
			this._extractTempletService.setLoading(false);
		}
		});
	}

	closeOuterPopup()
	{
		try
		{
			// When running inside an iframe, close the parent popup and destroy the component
			if(window.parent && window.parent !== window)
			{
				if(typeof (<any>window.parent).closePopup === 'function')
				{
					(<any>window.parent).closePopup();
				}
				if(typeof (<any>window.parent).destroyComponent === 'function')
				{
					(<any>window.parent).destroyComponent('simpleEditor');
				}
			}
			else
			{
				// Not in iframe — use local closeEditor if available
				if(typeof closeEditor !== 'undefined')
				{
					closeEditor('simpleEditor');
				}
			}
		}
		catch(e:any)
		{
			console.log('Exception in closeOuterPopup:', e.message);
		}
	}

	setKeyNavigation(formNo:any)
	{
		let tableId = "tableDetails_" + formNo;
		let element = document.getElementById(tableId);

		if (element)
		{
			let self = this;
			// Remove existing listener before adding new one
			if ((element as any).__keydownHandler) {
				element.removeEventListener('keydown', (element as any).__keydownHandler);
			}
			const handler = function (evnt: KeyboardEvent)
			{
				evnt = evnt || <any>window["event"];
				// Skip row navigation if autosuggest popup is open
				let openSuggest: any = null;
				if (self.bbAutoSuggest)
				{
					openSuggest = self.bbAutoSuggest.find((s: any) => s.isOpen);
				}
				// Fallback: use tracked active detail autosuggest if QueryList didn't find it
				if (!openSuggest && self.activeDetailAutoSuggest && self.activeDetailAutoSuggest.isOpen) {
					openSuggest = self.activeDetailAutoSuggest;
				}
				if (openSuggest)
				{
					// Cancel any pending autosuggest debounce to prevent it from
					// resetting selectedIndex while the user is navigating the popup
					if (self.autoSuggestDebounceTimer) {
						clearTimeout(self.autoSuggestDebounceTimer);
						self.autoSuggestDebounceTimer = null;
					}
					// Handle Enter/Tab to select autosuggest item directly
					if ((evnt.key === 'Enter' || evnt.key === 'Tab') && openSuggest.selectedIndex >= 0)
					{
						evnt.stopPropagation();
						evnt.preventDefault();
						self.ngZone.run(() => {
							openSuggest.handleUpDownKeyEvent(evnt);
							if (self.isDetailInputFocused) {
								self.cdr.reattach();
								self.cdr.detectChanges();
								self.cdr.detach();
							}
						});
					}
					return;
				}
				switch (evnt.keyCode)
				{
					case 38:
						self.upArrowPressed(evnt, formNo);
						break;
					case 40:
						self.downArrowPressed(evnt, formNo);
						break;
				}
			};
			(element as any).__keydownHandler = handler;
			// Register outside Angular zone to prevent change detection on every keystroke
			this.ngZone.runOutsideAngular(() => {
				element!.addEventListener('keydown', handler);
			});
		}
	}

	upArrowPressed(evnt:any, formNo:any)
	{
		try
		{
			let targetElm = evnt.target;
			if (targetElm)
			{
				let id = targetElm.id;

				let start = "Detail" + formNo + ".";
				if (id.startsWith(start))
				{
					let idWithCount = id.replace(start, "");
					let count = idWithCount.substring(0, idWithCount.indexOf("."));
					let isFocus: boolean = false;
					do
					{
						count--;
						if (count == 0)
						{
							break;
						}
						let onlyId = idWithCount.substring(idWithCount.indexOf(".") + 1);
						let newId = start + count + '.' + onlyId;
						let element = document.getElementById(newId);

						if (element != null)
						{
							let isDisplay = element.offsetParent === null;
							if (!isDisplay)
							{
								isFocus = true;
								element.focus({ preventScroll: true });
								this.ngZone.run(() => {
									let targetDomID = count;
									let formDetail = "Detail" + formNo;
									let targetIndex = -1;
									if (this.allformValues[formDetail]) {
										for (let k = 0; k < this.allformValues[formDetail].length; k++) {
											if (this.allformValues[formDetail][k]['domID'] == targetDomID) {
												targetIndex = k;
												break;
											}
										}
									}
									if (targetIndex >= 0) {
										this.rowSelected("Detail" + formNo, targetIndex, targetDomID, false);
									}
								});
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
			let targetElm = evnt.target;
			if (targetElm)
			{
				let id = targetElm.id;
				let start = "Detail" + formNo + ".";
				if (id.startsWith(start))
				{
					let idWithCount = id.replace(start, "");
					let count = idWithCount.substring(0, idWithCount.indexOf("."));
					count = Number(count);
					let isFocus: boolean = false;
					do
					{
						count++;
						let formDetail = "Detail" + formNo;
						let detailDataLen = 0;
						if (this.allformValues[formDetail] != undefined)
						{
							detailDataLen = this.allformValues[formDetail].length;
						}
						if (count > detailDataLen)
						{
							break;
						}
						let onlyId = idWithCount.substring(idWithCount.indexOf(".") + 1);
						let newId = start + count + '.' + onlyId;
						let element = document.getElementById(newId);
						if (element != null)
						{
							let isDisplay = element.offsetParent === null;
							if (!isDisplay)
							{
								isFocus = true;
								element.focus({ preventScroll: true });
								this.ngZone.run(() => {
									let targetDomID = count;
									let targetIndex = -1;
									if (this.allformValues[formDetail]) {
										for (let k = 0; k < this.allformValues[formDetail].length; k++) {
											if (this.allformValues[formDetail][k]['domID'] == targetDomID) {
												targetIndex = k;
												break;
											}
										}
									}
									if (targetIndex >= 0) {
										this.rowSelected("Detail" + formNo, targetIndex, targetDomID, false);
									}
								});
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

	leftArrowPressed(evnt:any) 
	{
		let targetElm = evnt.target;
		if (targetElm) 
		{
			let id = targetElm.id;
			if (id.startsWith("detail.2.")) 
			{
				let leftElm = targetElm.previousElementSibling; 
				if (leftElm) 
				{
					leftElm.focus({ preventScroll: true });
				}
			}
		}
	}

	rightArrowPressed(evnt:any) 
	{
		let targetElm = evnt.target;
		if (targetElm) 
		{
			let id = targetElm.id;
			if (id.startsWith("detail.2.")) 
			{
				let rgtElm = targetElm.nextElementSibling; 
				if (rgtElm)
				{
					rgtElm.focus({ preventScroll: true });
				}
			}
		}
	}


	setSelectedText(event: any, id?: any, displayLabel?: any, dataType?: any)
	{
		// 'Detail' + objForm.key + '.' + objForm.key + '.' + colNodeObj.value.name
		if(id && id.includes('Detail') && id.includes('.'))
		{
			let colDetailArr = id.split('.');
			let formNo = colDetailArr[0].charAt(colDetailArr[0].length - 1);
			let domID = colDetailArr[1];
			let colName = colDetailArr[2];
			this.setAllFormValuesJson(formNo, domID, colName, event);
		}
		if(event && event['preventItemChange'])
		{
			this.isPreventItemChange = event['preventItemChange'];
		}
		if(event && event['preventPopHelpItemChange'])
		{
			this.isPreventPopHelpItemChange = event['preventPopHelpItemChange'];
		}
        if(event && event['preventEnterKeyItemChange'] == undefined)
        {
            this.isPreventEnterKeyItemChange = false;
        }
		let inputElem = document.getElementById(id);
		if(inputElem)
		{
			let iconId = id + "_Icon";
			let iconElem = document.getElementById(iconId);
			if (iconElem && iconElem.classList.contains('focusOptionIcon')) 
			{
				iconElem.classList.remove('focusOptionIcon');
				iconElem.classList.add('optionIcon');
				let imgElem = iconElem.getElementsByTagName('img');
				let bbType = 'text';
				if(dataType != undefined && (dataType == 'char' || dataType == 'String')){
					bbType = 'text';
				}
				else if(dataType != undefined && (dataType == 'number' || dataType == 'decimal')){
					bbType = 'number';
				} 
				else if(dataType != undefined && (dataType == 'date' || dataType == 'Date' || dataType == 'datetime')){
					bbType = 'date';
				}
				
				let imgClass = bbType+"Icon";
				if(imgElem && imgElem[0] && imgElem[0].classList.contains(imgClass))
				{
					imgElem[0].setAttribute('src','simpleditorplugin/assets/images/svg/'+bbType+'_simple.svg')
				}
			}
		}
		let elem = document.getElementById(id) as HTMLInputElement;
		if (elem && (elem.getAttribute('format') == 'dateBox' || elem.getAttribute('format') == '[shortdate] [time]' || elem.getAttribute('format') == 'dd/mm/yy' || elem.getAttribute('format') == 'datetime')) 
		{
			let dateVal = elem.value;
			let idd = id;
			this.validateDateOnBlur(dateVal, idd, displayLabel);
		}
		this.cdr.markForCheck();
	}

	loadFormData() 
	{
		let tmpData:any = {};
		tmpData = this.compData;
		this.tmpDataCopy = JSON.stringify(tmpData);
		let maxFormNum = tmpData["NO_OF_FORMS"];
		this.editFlag = tmpData["EDIT_FLAG"];
		let paramString = this._extractTempletService.getEncodedParamString(tmpData);
		let url = this._extractTempletService.getHostURL() + '/ibase/E12EditorHandlerServlet';

		this._extractTempletService.isFromAttachPdf = false;
		this._extractTempletService.setLoading(true);
		this._extractTempletService.sendRequest(url, paramString, (firstCallBrowserData:any) => {
			this._extractTempletService.setLoading(false);
			let callbackRespNew = firstCallBrowserData.split('%%SEP%%');
			firstCallBrowserData = callbackRespNew[0];
			let isError = callbackRespNew[1].trim();

			if (!(isError == 'true')) 
			{
				let firstCallBrowserDataNew = {} = JSON.parse(firstCallBrowserData);
				if (firstCallBrowserDataNew && firstCallBrowserDataNew!.DocumentRoot) 
				{
					for (let i = 1; i <= maxFormNum; i++) 
					{
                        let detailArray:any = [];
						let currentFormNoDetail = 'Detail' + i;
						if (firstCallBrowserDataNew.DocumentRoot.group0.Header0[currentFormNoDetail]) 
						{
							let detailLen = firstCallBrowserDataNew.DocumentRoot.group0.Header0[currentFormNoDetail].length;
							let currentLinetag = 'Detail' + i;
							if ((detailLen == null) && (currentFormNoDetail == "Detail1")) 
							{
								let rowData = i + '_1';
								if (this.currentValidationRow && this.currentValidationRow.length > 0) 
								{
									this.currentValidationRow.splice(0, 1);
								}
								if(this.transMode != 'I')
								{
									this.currentValidationRow.push(rowData);
								}
								let detailJsonData:any = {};
								detailJsonData = firstCallBrowserDataNew.DocumentRoot.group0.Header0[currentFormNoDetail];
								this.currentCompData = JSON.stringify(detailJsonData);
								for (let key in detailJsonData) 
								{
									// id = currentFormNoDetail + '.1.' + key;
									if (detailJsonData[key] && detailJsonData[key].protect)
									{
										if(detailJsonData[key].protect.toString() == "")
										{
											this.allformValues[key+'_protect'] = "0";
										}
										else
										{
											this.allformValues[key+'_protect'] = detailJsonData[key].protect.toString();
										}
									}
									else
									{
										this.allformValues[key+'_protect'] = "0";
									}
									if (detailJsonData[key] && detailJsonData[key].visible)
									{
										this.allformValues[key+'_visible'] = detailJsonData[key].visible.toString();
									}
									else
									{
										this.allformValues[key+'_visible'] = "";
									}
									this.allformValues[key] = signal('');
									if (detailJsonData[key] && (detailJsonData[key].content || detailJsonData[key].content == 0)) 
									{
										let value = detailJsonData[key].content;
										this.checkProtectAndvisibleforFirstForm(detailJsonData, key);
										if(value == null || value == undefined)
										{
											this.allformValues[key] = "";
										}
										else
										{
											this.allformValues[key] = value;

										}
									}
									else
									{
										let value = detailJsonData[key];
										if (key === 'attribute' && value instanceof Object)
										{
											value = JSON.stringify(value);
										}
										else if (key != 'attribute' && value instanceof Object)
										{
											value = "";
										}
										this.checkProtectAndvisibleforFirstForm(detailJsonData, key);
										if(value == null || value == undefined)
										{
											this.allformValues[key] = "";
										}
										else
										{
											this.allformValues[key] = value;
										}
									}
								}
								this.currentCompData = JSON.stringify(this.allformValues);
							}
							else 
							{
								let detailJsonData:any = {};
								if (detailLen == null) 
								{
									let rowData = i + '_0';
									if (this.currentValidationRow && this.currentValidationRow.length > 0) 
									{
										this.currentValidationRow.splice(0, 1);
									}
									if(this.transMode != 'I')
									{
										this.currentValidationRow.push(rowData);
									}
									detailJsonData = firstCallBrowserDataNew.DocumentRoot.group0.Header0[currentFormNoDetail];
									for (const key of Object.keys(detailJsonData))
									{
										let value = detailJsonData[key];
										if (key === 'attribute' && value instanceof Object)
										{
											detailJsonData[key] = JSON.stringify(value);
											detailJsonData[key+'_protect'] = "0";
											detailJsonData[key+'_visible'] = "";
										}
										else if (key != 'attribute' && value instanceof Object)
										{
											detailJsonData[key] = signal('');
											if (detailJsonData[key] && detailJsonData[key].protect)
											{
												if(detailJsonData[key].protect.toString() == "")
												{
													detailJsonData[key+'_protect'] = "0";
												}
												else
												{
													detailJsonData[key+'_protect'] = detailJsonData[key].protect.toString();
												}
											}
											else
											{
												detailJsonData[key+'_protect'] = "0";
											}
											if (detailJsonData[key] && detailJsonData[key].visible)
											{
												detailJsonData[key+'_visible'] = detailJsonData[key].visible.toString();
											}
											else
											{
												detailJsonData[key+'_visible'] = "";
											}
											if (detailJsonData[key] && (detailJsonData[key].content || detailJsonData[key].content == 0))
											{
												value = detailJsonData[key].content;
											}
											else
											{
												value = "";
											}
										}
										else
										{
											detailJsonData[key+'_protect'] = "0";
										}
										// id = currentFormNoDetail + '.1.' + key;
                                        if(value == null || value == undefined)
										{
											detailJsonData[key] = "";
										}
										else
										{
											if (this.checkIsDateFormat(key, i))
											{
												const convertedDate = this.convertStringToDate(value);
												if (convertedDate)
												{
												  detailJsonData[key] = convertedDate;
												}
												else
												{
												  detailJsonData[key] = value;
												}
											}
											else
											{
												detailJsonData[key] = value;
											}
										}
									}
									detailArray.push(detailJsonData);
								}
								else 
								{
									for (let j = 0; j < detailLen; j++) 
									{
										let id;
										detailJsonData = firstCallBrowserDataNew.DocumentRoot.group0.Header0[currentFormNoDetail][j];
										let domID = detailJsonData['domID'];
										let rowData = i + '_' + j;
										if (this.currentValidationRow && this.currentValidationRow.length > 0) 
										{
											this.currentValidationRow.splice(0, 1);
										}
										if(this.transMode != 'I')
										{
											this.currentValidationRow.push(rowData);
										}
										for (const key of Object.keys(detailJsonData))
										{
											let value = detailJsonData[key];
											id = currentFormNoDetail + '.' + domID + '.' + key;
											let formId = currentFormNoDetail + '-' + domID + '-' + key;
											if (key === 'attribute' && value instanceof Object)
											{
												detailJsonData[key] = JSON.stringify(value);
												detailJsonData[key+'_protect'] = "0";
												detailJsonData[key+'_visible'] = "";
											}
											else if (key != 'attribute' && value instanceof Object)
											{
												detailJsonData[key] = signal('');
												if (detailJsonData[key] && detailJsonData[key].protect)
												{
													if(detailJsonData[key].protect.toString() == "")
													{
														detailJsonData[key+'_protect'] = "0";
													}
													else
													{
														detailJsonData[key+'_protect'] = detailJsonData[key].protect.toString();
													}
												}
												else
												{
													detailJsonData[key+'_protect'] = "0";
												}
												if (detailJsonData[key] && detailJsonData[key].visible)
												{
													detailJsonData[key+'_visible'] = detailJsonData[key].visible;
												}
												else
												{
													detailJsonData[key+'_visible'] = "";
												}
												if (detailJsonData[key] && (detailJsonData[key].content || detailJsonData[key].content == 0))
												{
													value = detailJsonData[key].content;
												}
												else
												{
													value = "";
												}
												this.checkProtectAndVisbile(detailJsonData, key, id, formId);
											}
											else
											{
												detailJsonData[key+'_protect'] = "0";
											}
											if(value == null || value == undefined)
											{
												detailJsonData[key] = "";
											}
											else
											{
												if (this.checkIsDateFormat(key, i)) 
												{
													const convertedDate = this.convertStringToDate(value);
													if (convertedDate) 
													{
														detailJsonData[key] = convertedDate;
													} 
													else 
													{
													  detailJsonData[key] = value;
													}
												} 
												else 
												{
													detailJsonData[key] = value;
												}
											}
										}
										detailArray.push(detailJsonData);
									}
								}                            
								this.allformValues[currentLinetag] = detailArray;
							}
						}
					}
						if (this.transMode != 'I') 
						{
							// this.formatFieldsValue();
						}
					this.formatFieldsValue();
					// console.log('Print this.allformValues 4827....', this.allformValues);
				}
				
			}
		});
		this.cdr.markForCheck();
	}


	showIndicator(selectedRowId:any, formNo:any, rowNo:any)
	{

        if(formNo == "1" && this._extractTempletService.errorRowsList != null && this._extractTempletService.errorRowsList.includes(selectedRowId))
        {
            
        }
        if( this._extractTempletService.errorRowsList != null && this._extractTempletService.errorRowsList.includes(selectedRowId) )
		{
            if(! (document.getElementById(selectedRowId)) )
            {
                return;
            }
			let positionOfRow = document.getElementById(selectedRowId)?.getBoundingClientRect();
            if(!positionOfRow)
            {
                return;
            }
			let indicator = this.renderer.createElement('div');
			let parentElem = document.getElementById('tableDetails_'+formNo);
            if(parentElem)
            {
                let positionOfTable = parentElem.getBoundingClientRect();
                let topPos = positionOfRow.top - positionOfTable.top + 3;
				let table = document.getElementById('tableDetails_'+formNo)?.firstElementChild?.nextElementSibling;
                this.renderer.insertBefore(parentElem, indicator, table);		
                indicator.id = 'validationIndicatorForRow_'+(rowNo)+'_'+(formNo);
                indicator.style.top = topPos + 'px';
                indicator.classList.add('indicatorForRow');
                this.detailCount = 0;
            }
		}
	}

	openTaxScreen(formNo:any, index:any,id?:any,callFocusFormNo?:any)
	{
		try
		{
			// When callFocusFormNo is true, extract form info from id FIRST
			if(callFocusFormNo)
			{
				if(id && id.includes("."))
				{
					let focusColDetails: any = [];
					focusColDetails = id.split(".");
					this.currentFormNumber = "";
					this.currentFormNumber = focusColDetails[0].charAt(focusColDetails[0].length - 1);
					this.currentDomID = "";
					this.currentDomID = focusColDetails[1];
					this.currentRowIndex = index;
				}
			}
			// In view mode, skip validation and validateAndDone API call — open tax form directly
			if(this.editFlag === 'V')
			{
				this.taxResponseData = JSON.stringify(this.rawResponseData);
				this.currentFormNo = this.currentFormNumber;
				this.createTaxDetOverLay();
				return;
			}
			if(this.currentFormNumber && this.currentDomID)
			{
				let requiredFldExist = this.validateMandatoryFields(this.currentFormNumber, this.currentDomID);
				if(requiredFldExist == true)
				{
					return;
				}
			}
			if (this.currentValidationRow && this.currentValidationRow.length > 0 )
			{
				let previousDomId = this.currentDomID || 1;
				this.validateCurrentDetail(this.currentFormNumber, previousDomId, this.currentFormNumber, index, false, false, null, false,true);
			}
		}
		catch (e: any)
		{
			console.log('Exception inside openTaxScreen:::: ', e.message);
		}
	}
	createTaxDetOverLay()
	{
		if(this.taxDetailOverLay)
		{
			this.taxDetailOverLay.dispose();
		}
		const positionStrategy = this.overlay
			.position()
			.global();
		const overlayConfig = new OverlayConfig({
			hasBackdrop: true,
			positionStrategy: positionStrategy,
		});
		const templatePortal = new TemplatePortal(this.taxDetail, this.viewContainerRef);
		this.taxDetailOverLay = this.overlay.create(overlayConfig);
		this.taxDetailOverLay.attach(templatePortal);
		// Force center using inline !important styles — this overrides
		// BBOpenPophelp's ::ng-deep .cdk-overlay-pane { position: static !important }
		// Inline !important has the highest CSS priority.
		const pane = this.taxDetailOverLay.overlayElement;
		pane.style.setProperty('position', 'fixed', 'important');
		pane.style.setProperty('top', '50%', 'important');
		pane.style.setProperty('left', '50%', 'important');
		pane.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
		pane.style.setProperty('width', '93%', 'important');
		pane.style.setProperty('height', '93%', 'important');
		pane.style.setProperty('max-width', '93%', 'important');
		pane.style.setProperty('max-height', '93%', 'important');
		pane.style.setProperty('pointer-events', 'auto', 'important');
		pane.style.setProperty('overflow', 'hidden', 'important');
		this.fixOverlayZIndex(this.taxDetailOverLay);
	}

	onTaxItemChange(data: any)
	{
		if(data)
		{
			let currentTaxJson = JSON.parse(data);
			if(currentTaxJson)
			{
				for(const key of Object.keys(currentTaxJson))
				{
					if(currentTaxJson[key] && this.allformValues && this.allformValues['Detail'+this.currentFormNumber] && this.allformValues['Detail'+this.currentFormNumber][this.currentRowIndex] && this.allformValues['Detail'+this.currentFormNumber][this.currentRowIndex][key])
					{
						if(key != 'domID')
						{
							this.allformValues['Detail'+this.currentFormNumber][this.currentRowIndex][key] = currentTaxJson[key];
						}
					}
				}
			}
		}
		this.cdr.markForCheck();
	}

	closeTaxOverlay()
	{
		if(this.taxDetailOverLay)
		{
			this.taxDetailOverLay.dispose();
		}
		if(this.viewContainerRef)
		{
			this.viewContainerRef.clear();
		}
	}

	callItemDefault(columnName:any, columnValue:any, formNo:any, index:any) 
	{
		
		if (!(columnValue instanceof Object) && this.popHelp.pophelpSelectedvalue && columnValue.trim() != this.popHelp.pophelpSelectedvalue.trim()) 
		{
		 	this.popHelp.pophelpSelectedvalue = columnValue;
		}
		this.itemChangeList = this.itemChangeArr[formNo - 1];
		if (this.itemChangeList.includes(columnName)) 
		{
			let paramMap:any = {};
			let paramString:any = "";
			paramMap["OBJ_NAME"] = this.compData['OBJ_NAME'];
			paramMap["ACTION"] = "ITEM_CHANGE";
			paramMap["OBJ_CTX"] = this.compData['OBJ_CTX'];
			paramMap["PAGE_CTX"] = "2";
			paramMap["EDITOR_ID"] = this.compData['EDITOR_ID'];
			paramMap["RTEURN_TYPE"] = "Json";
			paramMap["CHG_STR"] = this.popHelp.createChgStr(columnName, columnValue, formNo);
			paramMap["FIELD_NAME"] = columnName;
			paramMap["dummyInt"] = this.compData['dummyInt'];
			paramString = this._extractTempletService.getEncodedParamString(paramMap);
			let url = this._extractTempletService.getHostURL() + '/ibase/E12EditorHandlerServlet';
			this._extractTempletService.setLoading(true);
			this._extractTempletService.sendRequest(url, paramString, (data:any) => {
				this._extractTempletService.setLoading(false);
				let callbackResp = data.split('%%SEP%%');
				data = callbackResp[0];
				let isError = callbackResp[1].trim();
				if (!(isError == 'true')) 
				{
					this.applyDataOnCurrentForm(data, formNo, index);
				}
			});
		}
	}

	applyDataOnCurrentForm(values:any, formNo:any, index:any) 
	{
		let details = JSON.parse(values);
		let itemChnageValues:any = {};
		try 
		{
			if (values.indexOf('Errors') != -1) 
			{
				this.checkError(values);
			}
			else 
			{
				let currentFormNoDetail = 'Detail' + formNo;

				if (details.Root[currentFormNoDetail]) 
				{
					itemChnageValues = details.Root[currentFormNoDetail];
					for (const key of Object.keys(itemChnageValues)) 
					{
						let domID: any
						if (itemChnageValues['domID'].content) 
						{
							domID = itemChnageValues['domID'].content;
						}
						else
						{
							domID = itemChnageValues['domID'];
						}
						let id = this.popHelp.detailNum + '.' + domID + '.' + key;
						let formId = this.popHelp.detailNum + '-' + domID + '-' + key;
						if (itemChnageValues[key] && itemChnageValues[key].protect)
						{
							if(itemChnageValues[key].protect.toString() == "")
							{
								this.allformValues[key+'_protect'] = "0";
							}
							else
							{
								this.allformValues[key+'_protect'] = itemChnageValues[key].protect.toString();
							}
						}
						else
						{
							this.allformValues[key+'_protect'] = "0";
						}
						if (itemChnageValues[key] && itemChnageValues[key].visible)
						{
							this.allformValues[key+"_visible"] = itemChnageValues[key].visible.toString();
						}
						else
						{
							this.allformValues[key+"_visible"] = "";
						}
						
						if (itemChnageValues[key] && (itemChnageValues[key].content || itemChnageValues[key].content == 0)) 
						{
							let value = itemChnageValues[key].content;
							if(formNo == '1')
							{
								this.allformValues[key] = signal('');
								if(value == null || value == undefined)
								{
									this.allformValues[key] = "";
								}
								else
								{
									if (this.checkIsDateFormat(key, formNo)) 
									{
										const convertedDate = this.convertStringToDate(value);
										if (convertedDate) 
										{
											this.allformValues[key] = convertedDate;
										}
										else 
										{
											this.allformValues[key] = value;
										}
									} 
									else 
									{
										this.allformValues[key] = value;
									}
								}
								this.checkProtectAndvisibleforFirstForm(itemChnageValues, key);
							}
							else
							{
								this.allformValues[currentFormNoDetail][index][key] = signal('');
								if(value == null || value == undefined)
								{
									this.allformValues[currentFormNoDetail][index][key] = "";
								}
								else
								{
									if (this.checkIsDateFormat(key, formNo)) 
									{
										const convertedDate = this.convertStringToDate(value);
										if (convertedDate) 
										{
											this.allformValues[currentFormNoDetail][index][key] = convertedDate;
										}
										else 
										{
											this.allformValues[currentFormNoDetail][index][key] = value;
										}
									}
									else 
									{
										this.allformValues[currentFormNoDetail][index][key] = value;
									}
								}
								this.checkProtectAndVisbile(itemChnageValues, key, id, formId);
							}
						}
						else
						{
							let value = itemChnageValues[key];
							if (key === 'attribute' && value instanceof Object)
							{
								value = JSON.stringify(value);
							}
							else if (value instanceof Object)
							{
								value = "";
							}
							if(formNo == '1')
							{
								this.allformValues[key] = signal('');
								if(value == null || value == undefined)
								{
									this.allformValues[key] = "";
								}
								else
								{
									if (this.checkIsDateFormat(key, formNo))
									{
										const convertedDate = this.convertStringToDate(value);
										if (convertedDate) 
										{
												this.allformValues[key] = convertedDate;
										}
										else 
										{
											this.allformValues[key] = value;
										}
									} 
									else 
									{
										this.allformValues[key] = value;
									}
								}
								this.checkProtectAndvisibleforFirstForm(itemChnageValues, key);
							}
							else
							{
								this.allformValues[currentFormNoDetail][index][key] = signal('');
								if(value == null || value == undefined)
								{
									this.allformValues[currentFormNoDetail][index][key] = "";
								}
								else
								{
									if (this.checkIsDateFormat(key, formNo)) 
									{
										const convertedDate = this.convertStringToDate(value);
										if (convertedDate) 
										{
											this.allformValues[currentFormNoDetail][index][key] = convertedDate;
										}
										else 
										{
											this.allformValues[currentFormNoDetail][index][key] = value;
										}
									}
									else 
									{
										this.allformValues[currentFormNoDetail][index][key] = value;
									}
								}
								this.checkProtectAndVisbile(itemChnageValues, key, id, formId);
							}
						}
					}
				}
			}
			this.cdr.markForCheck();
		}
		catch
		{
			console.log('Exception inside applyDataOnCurrentForm');
		}
		// this.formatFieldsValue();
	}

    openPophelpFromChildComponent( cuurentPophelData:any)
    {
      let currentFormData = JSON.parse(cuurentPophelData);
      let fldName = currentFormData['fldName'];
      let fldValue = currentFormData['fldValue'];
      let formNo = currentFormData['formNo'];
      let index = currentFormData['detailRowNo'];
	  let title = currentFormData['title'];
	  // Prevent bb-open-pophelp from calling its own item change when opened from feed-view
	  // simple_editor will call getFieldItemChange directly in selectedValueFromPopHelp
	  if(this.overLayForFeedView)
	  {
		  this.isPreventPopHelpItemChange = true;
	  }
	  this.openPopHelp(fldName, fldValue, formNo, index, title)
    }

    callItemchangeFormTax( currentData:any )
    {
		let currentFormData = JSON.parse(currentData);
		let fldName = currentFormData['fldName'];
		let fldValue = currentFormData['fldValue'];
		let formNo = currentFormData['formNo'];
		let index = currentFormData['detailRowNo'];
    	// this.callLocalItemChange(fldName, fldValue, formNo, 'upper', index);
		this.getFieldItemChange(fldName,fldValue,this.currentDomID,formNo,index);
    }

	applyTaxScreen()
    {
		this.waitForPendingFieldChange().then(() => {
        if(this.currentValidationRow && this.currentValidationRow.length > 0 )
        {
            let str = this.currentValidationRow[0].split('_');

            let formNo = str[0];
            let index = Number( str[1] );
			let currentDetail = 'Detail'+formNo;
			let domId = this.allformValues[currentDetail][index]['domID'];
            this.validateCurrentDetail(formNo, domId, formNo, index, false, false, false, false, true);
            this.closeTaxOverlay();
        }
		});
    }

	adjustGroupBox() 
	{
		let groupBoxes = document.getElementsByClassName('e12GroupBox');
		for (let i = 0; i < groupBoxes.length; i++) 
		{
			let groupBox: HTMLElement | any = groupBoxes[i] as HTMLElement;
			let groupBoxPnl = groupBox.children[1];
			let width = groupBoxPnl.offsetWidth;

			if (width < 450) 
			{
				groupBoxPnl.classList.add('freeFormContentOneColumn');
				groupBoxPnl.classList.remove('freeFormContentThreeColumn');
				groupBoxPnl.classList.remove('freeFormContentTwoColumn');
			}
			else if (width > 450 && width < 1024) 
			{
				groupBoxPnl.classList.add('freeFormContentTwoColumn');
				groupBoxPnl.classList.remove('freeFormContentOneColumn');
				groupBoxPnl.classList.remove('freeFormContentThreeColumn');
			}
			else if (width > 1024) 
			{
				groupBoxPnl.classList.add('freeFormContentThreeColumn');
				groupBoxPnl.classList.remove('freeFormContentOneColumn');
				groupBoxPnl.classList.remove('freeFormContentTwoColumn');
			}
		}
	}

	private autoSuggestDebounceTimer: any = null;
	openAutosuggest(fldName:any, fldValue:any, formNo:any, detailRowNo?:any, currentDomId?: any, id?: any)
	{
		// Skip autosuggest for fields without popHelp - avoids expensive lookups on every keystroke
		if (!fldName || !this.popHelpFieldSet.has(fldName)) {
			// Also check truncated name for fields with __ suffix
			if (!fldName || !fldName.includes('__') || !this.popHelpFieldSet.has(fldName.substring(0, fldName.indexOf('__')))) {
				return;
			}
		}

		if(this.autoSuggestDebounceTimer) {
			clearTimeout(this.autoSuggestDebounceTimer);
		}

		this.autoSuggestDebounceTimer = setTimeout(() => {
			this.currentIndexForDetailForm = detailRowNo;

			// Close any previously open autosuggest to avoid stale isOpen state
			if (this.activeDetailAutoSuggest && this.activeDetailAutoSuggest.isOpen) {
				this.activeDetailAutoSuggest.isOpen = false;
				this.activeDetailAutoSuggest.selectedIndex = -1;
			}

			// Reattach first so *ngIf creates the autosuggest component if needed
			if(this.isDetailInputFocused) {
				this.cdr.reattach();
				this.cdr.detectChanges();
			}

			let autoSuggest: BbAutosuggestTransactionComponent = this.getAutoSuggestInstance(id);
			this.activeDetailAutoSuggest = autoSuggest;
			if(autoSuggest)
			{
				autoSuggest.detailNum = 'Detail' + formNo;
				autoSuggest.keyValue = currentDomId.toString()? currentDomId.toString() : 1;
				let minLength = 3;
				this.fieldName = fldName;
				let sqlInput: string = "";
				let tempPophelpfldName: any;

				if(fldName && fldName.includes('__'))
				{
					tempPophelpfldName = this.getFieldNameBeforeUnderscore(fldName);
				}

				let popHelpFldName: any = this.pophelpDataMap.get(fldName);
				if(popHelpFldName)
				{
					sqlInput = popHelpFldName['attrib']['@SQL_INPUT'];
					tempPophelpfldName = fldName;
				}
				else
				{
				  let tempFldName: any = tempPophelpfldName ? this.pophelpDataMap.get(tempPophelpfldName) : undefined;
				  if(tempFldName)
				  {
					sqlInput = tempFldName['attrib']['@SQL_INPUT'];
				  }
				}
				// Fallback: ensure tempPophelpfldName is always defined to prevent crash in openSuggest
				if(!tempPophelpfldName)
				{
					tempPophelpfldName = fldName;
				}

				this.updateAutoSuggestChgStr(formNo, detailRowNo, autoSuggest);
				if(this.bbAutoSuggest != undefined)
				{
					autoSuggest.openSuggest(tempPophelpfldName, fldValue, sqlInput, this.pkValues,minLength, formNo, '', fldName, currentDomId, detailRowNo);
				}
			}

			// Detach again to keep typing fast
			if(this.isDetailInputFocused) {
				this.cdr.detach();
			} else {
				this.cdr.markForCheck();
			}
		}, 150);
    }

	setEmitValue(event:any)
	{
	   
	   if(event && event.FORM_NO && event.FORM_NO != '1')
	   	{
			let detailForm = 'Detail'+event.FORM_NO;
			if(this.allformValues && this.allformValues[detailForm] && this.allformValues[detailForm][this.currentIndexForDetailForm])
			{
				this.allformValues[detailForm][this.currentIndexForDetailForm][event.FIELD_NAME] = event.value;
			}
	  	}
	   	else
	   	{
			this.allformValues[event.FIELD_NAME] = event.value; 
	   	}
		if(this.popHelp && event && event.FORM_NO)
		{
			this.popHelp.compData['STARTFORM'] = event.FORM_NO;
		}
		this.cdr.markForCheck();
	}

	getAutoSuggestInstance(id: any) : BbAutosuggestTransactionComponent
	{
	   return this.bbAutoSuggest.find((bbAutoSuggest: any) => id == bbAutoSuggest.id);
	}
	
	onItemChangeFromSuggestBox(event:any)
	{
		this.onItemChangeFromPophelp(JSON.stringify(event));
	}
	
	onPreventItemChange(event: any)
	{
		let data = JSON.parse(event);
		this.isPreventItemChange = data['preventItemChange'];
	}

	openInFeedView(currentDetail:any, formNo:any, index:any, id: any)
	{
		// Clear pendingClickTarget so that completeFieldChange() does not re-trigger
		// the showmore-button click after item change from feed-view
		this.pendingClickTarget = null;
		let requiredFldExist = this.validateMandatoryFields(this.currentFormNumber, this.currentDomID);
		if(requiredFldExist == true)
		{
			return;
		}
		this.setFocusFormNo(formNo, id, index);
		try 
		{
			console.log('print currentDetail:::::',currentDetail);
			Object.entries(currentDetail).forEach(([fieldName, fieldValue]) => 
			{
				if (fieldValue === null || fieldValue === undefined) 
				{
					currentDetail[fieldName] = '';
				}
			});
			this.objFormWiseJson = this.formWiseMap[formNo];
			this.currentFeedData = currentDetail;
			this.currentFormNumber = formNo;
            this.currentIndexForDetailForm = index;
			this.overlayForFeedView();
		}
		catch (e: any) 
		{
			console.log('Exception inside openInFeedView:::: ', e.message);
		}
	}
	
	overlayForFeedView()
	{
		if (this.overLayForFeedView)
		{
			this.overLayForFeedView.dispose();
		}

		const config = this.getOverlayConfig();
		this.overLayForFeedView = this.overlay.create(config);
		const popupTemp = new TemplatePortal(this.BBFeedView, this.viewContainerRef);
		this.overLayForFeedView.attach(popupTemp);
		// Set wrapper alignment using the pane's parent (the correct wrapper for this overlay)
		const pane = this.overLayForFeedView.overlayElement;
		const wrapper = pane.parentElement;
		if(wrapper && wrapper.classList.contains('cdk-global-overlay-wrapper'))
		{
			wrapper.style.setProperty('justify-content', 'center', 'important');
			wrapper.style.setProperty('align-items', 'center');
		}
		// Fix z-index AFTER wrapper styles — must be last to avoid being overwritten
		this.fixOverlayZIndex(this.overLayForFeedView);
	}

	getOverlayConfig(): OverlayConfig 
	{
		const positionStrategy = this.overlay.position()
		.global()
		.centerHorizontally()
		.centerVertically()
		.height('93%')
		.width('93%');
		return new OverlayConfig({
		hasBackdrop: true,
		positionStrategy: positionStrategy,
		});
	}

	closeFeedViewOverlay(event: any)
	{
		this.waitForPendingFieldChange().then(() => {
		let formNo = event.formNo;
		let detailNo = "Detail"+formNo;
		if(formNo == "1")
		{
			this.allformValues = event.data;
		}
		else
		{
			for(let i=0;i<this.allformValues[detailNo].length;i++)
			{
				if(this.allformValues[detailNo][i]['domID'] == event.domID)
				{
					if(this.transMode != 'I')
					{
						this.allformValues[detailNo][i] = event.data;
					}
					else
					{
						this.allformValues[detailNo][i] = JSON.parse(event.data);
					}
				}
			}
		}
		this.cdr.markForCheck();
		if(this.overLayForFeedView)
		{
			this.overLayForFeedView.dispose();
		}
		if(this.viewContainerRef)
		{
			this.viewContainerRef.clear();
		}
		});
	}

	onDelete(event:any)
	{
		let currentSelectedData = JSON.parse(event);
		this.deleteSelectedDetail(currentSelectedData['formDetail'],currentSelectedData['formNo'],currentSelectedData['index']);
	}

	onFeedFormDataChanged(updatedFeedData: any)
	{
		let feedData = JSON.parse(updatedFeedData);
		let requiredFldExist = this.validateMandatoryFields(this.currentFormNumber, this.currentDomID);
		if(requiredFldExist == true)
		{
			return;
		}
		// console.log("PRINT LINE NO onFeedFormDataChanged updatedFeedData 4587",feedData);
		if (this.currentValidationRow && this.currentValidationRow.length > 0) 
		{
			let cuurentValidationData = this.currentValidationRow[0];
			let str = cuurentValidationData.split('_');
			if (str[0] == '1') 
			{
				
			}
			else
			{

			}
			// console.log("PRINT LINE NO onFeedFormDataChanged updatedFeedData 4600",feedData);
			this.currentDomID = feedData['feedDomId'].toString();
			this.validateCurrentDetail(feedData['feedFormNo'], this.currentDomID, feedData['feedFormNo'], str[1], false, false, null, false, false);
		}
		// this.formatFieldsValue();
		if(this.transMode == 'I')
		{
			// this.formatFieldsValue();
			let getvalidate = this.validateMandatoryFields(this.currentFormNumber, this.currentDomID);
			if(getvalidate != true && this.overLayForFeedView)
			{
				this.overLayForFeedView.dispose();
				}
		}
	}
	
	callItemchangeForFeedView(currentData:any)
	{
		// Clear pendingClickTarget so that completeFieldChange() does not re-trigger
		// the showmore-button click after item change from feed-view
		this.pendingClickTarget = null;
		let currentFormData = JSON.parse(currentData);
		let fldName = currentFormData['fldName'];
		let fldValue = currentFormData['fldValue'];
		let formNo = currentFormData['formNo'];
		let index = currentFormData['index'];
		let domID = currentFormData['domID'] || currentFormData['index'];
		// this.callLocalItemChange(fldName, fldValue, formNo, 'upper', index)
		this.getFieldItemChange(fldName,fldValue,domID,formNo,index);
	}
	
	focusOnFeedView(currentData:any)
	{
		let currentFormData = JSON.parse(currentData);
		let formNo = currentFormData['formNo'];
		let id = currentFormData['id'];
        this.setFocusFormNo(formNo,id);
	}
	
	blurOnFeedView(currentData:any)
	{ 
		let currentFormData = JSON.parse(currentData);
		if(currentFormData && currentFormData['id'])
		{
			let id = currentFormData['id'];
			if(id && id.includes('Detail') && id.includes('.'))
			{
				let colDetailArr = id.split('.');
				let formNo = colDetailArr[0].charAt(colDetailArr[0].length - 1);
				let domID = colDetailArr[1];
				let colName = colDetailArr[2];
				this.setAllFormValuesJson(formNo, domID, colName, currentFormData);
			}
		}
	}
	
	validateMandatoryFields(formNo, domId) : boolean 
	{
		let requiredExist = false;
		{
			let requiredFieldList:any = [];
		    requiredFieldList = this.formWiseRequiredFieldsJson[formNo];
			if (requiredFieldList && requiredFieldList.length) 
			{
				for(let i = 0; i < requiredFieldList.length; i++)
				{
					let curId = `Detail${formNo}.${domId}.${requiredFieldList[i]}`;
					let colValue: any = '';
					let curIdArr = curId.split(".");
					let index;
					if (curIdArr[0] == 'Detail1')
					{
						colValue = this.allformValues[curIdArr[2]]; 
					}
					else 
					{
						let detailArr = this.allformValues[curIdArr[0]]; 
						if (detailArr) 
						{
							if (this.transMode != 'I') 
							{
								index = detailArr.findIndex((currDetailObj: any) => currDetailObj.domID == curIdArr[1]);
							}
							else
							{
								index = detailArr.findIndex((currDetailObj: any) => currDetailObj.dom_id == curIdArr[1]);
							}
							if (index !== -1) 
							{
								colValue = detailArr[index][curIdArr[2]];
							}
						}
					}
					if(colValue == '' || colValue == null || colValue == undefined)
					{
						let requiredElem: any = document.getElementById(curId);
						let grpBoxId = requiredElem?.getAttribute('groupboxid');
						let grpElement = document?.getElementById(grpBoxId);
						if(grpElement != null && grpElement != undefined)
						{
							if(document.getElementById('moreBtnForExtractId') != null && document.getElementById('moreBtnForExtractId') != undefined) 
							{
								let showMoreElem: Element = document.getElementById('moreBtnForExtractId') as Element;
								if(showMoreElem.children[0].innerHTML == 'Show More')
								{
									this.onContextMenuClick(null, 'moreBtnForExtractId', true);
								}
							}
							let childElement = grpElement.children[1];
							if(childElement != null && childElement != undefined && childElement.classList.contains("collapseGroupBoxChild"))
							{
								this.hideShowGroupBtn(grpBoxId);
							}
						}

						let curLabel: any = '';
						if(curIdArr[0] == 'Detail1')
						{
							if(requiredElem != null && requiredElem != undefined)
							{
								if(requiredElem.tagName == 'MAT-SELECT')
								{
									let matLabelElement: any = document.getElementById(curId+'_t');
									curLabel = matLabelElement.innerText;
									if(curLabel != undefined && curLabel != null && curLabel != '')
									{
										if(curLabel.includes(":"))
										{
											curLabel = curLabel.substring(0, curLabel.indexOf(":"));
										}
									}
								}
								else
								{
									curLabel = requiredElem.getAttribute('data-placeholder');
									if(curLabel != undefined && curLabel != null && curLabel != '')
									{
										if(curLabel.includes(":"))
										{
											curLabel = curLabel.substring(0, curLabel.indexOf(":"));
										}
									}

								}
							}

						}
						else
						{
							let id = curIdArr[0] + '.' + curIdArr[2] + '_t' + '_t'
							let labelElement: any = document.getElementById(id);
							if (labelElement) 
							{
								curLabel = labelElement.innerText || labelElement.value || '';
								// console.log('Print validateMandatoryFields line no 5525::::', curLabel);
							} 
							else 
							{
								console.error(`Element with id ${id} not found`);
								curLabel = '';
							}
						}
						// newobjectDetails = JSON.parse(this.objectDetails) ;
						let inputElement = document.getElementById(curId);
						
						if (!curLabel && inputElement) 
						{
							let fullText = inputElement.innerText;
							curLabel = fullText.split(':')[0].trim(); 
							// console.log('Print validateMandatoryFields line no 5539::::', curLabel);
						}
						// if(inputElement.hasAttribute('primaryKey'))
						if(inputElement)
						{
							let msg = 'Set mandatory field ' + curLabel
							let traceMsg;
							if(curIdArr[0] == 'Detail1')
							{
								// let primaryKey: any = inputElement.getAttribute('primaryKey');
								// if(keyFlag == 'A' && primaryKey == 'true')
								// {
								// }
								// else
								{
									if(inputElement.querySelector('input'))
									{
										let newInput = inputElement.querySelector('input')
										if (newInput && !newInput.hasAttribute('disabled')) 
										{
											
											this.bbconfirmBox.alert('Error', msg, traceMsg).subscribe((resp: any) => {
												// console.log('Print Validation function line inside bbconfirm 5567:::::');
												this._extractTempletService.setLoading(false);
												if (resp) 
												{
													this._extractTempletService.setForcedSave(false);
													this.setFocusOnError(curIdArr[0], index, curIdArr[1], curIdArr[2]);
													return;
												}
											});
											return true;
										}
									}
									else
									{
										
										this.bbconfirmBox.alert('Error', msg, traceMsg).subscribe((resp: any) => {
												// console.log('porder.ts Validation function line inside bbconfirm 4929')
												this._extractTempletService.setLoading(false);
												if (resp) 
												{
													this._extractTempletService.setForcedSave(false);
													this.setFocusOnError(curIdArr[0], index, curIdArr[1], curIdArr[2]);
													return;
												}
											});
										return true;
									}
								}
							}
							else
							{
								// let primaryKey: any = inputElement.getAttribute('primaryKey');
								// if((keyFlag == 'A' || keyFlag == 'M') && primaryKey == 'true')
								// {
								// }
								// else
								{
									if(inputElement.querySelector('input'))
									{
										let newInput = inputElement.querySelector('input')
										if (newInput && !newInput.hasAttribute('disabled')) 
										{
											
											this.bbconfirmBox.alert('Error', msg, traceMsg).subscribe((resp: any) => {
												// console.log('porder.ts Validation function line inside bbconfirm 4929')
												this._extractTempletService.setLoading(false);
												if (resp) 
												{
													this._extractTempletService.setForcedSave(false);
													this.setFocusOnError(curIdArr[0], index, curIdArr[1], curIdArr[2]);
													return;
												}
											});
											return true;
										}
									}
									else
									{
										
										this.bbconfirmBox.alert('Error', msg, traceMsg).subscribe((resp: any) => {
												// console.log('porder.ts Validation function line inside bbconfirm 4929')
												this._extractTempletService.setLoading(false);
											if (resp) {
													this._extractTempletService.setForcedSave(false);
													this.setFocusOnError(curIdArr[0], index, curIdArr[1], curIdArr[2]);
													return;
												}
											});
										return true;
									}
								}
							}
							
						}
					}
                }
			}
			return requiredExist;
		}
	}

	checkNull(input : any)
	{
		if( input == null || input == undefined || input === 'undefined' )
		{
			input = '';
		}
		return typeof input == 'string' ? input.trim() : input;
	}
	getFirstTwoCharOfDate(dateString: any): string 
	{
		if (!dateString) 
		{
			return '';
		}
		let date;
		if(dateString && typeof dateString === 'string' && dateString.includes('/'))
		{
			const parts: any = dateString.split(' ')[0].split('/'); 
			if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) 
			{
				return '';
			}
			const formattedDate = `${parts[1]}/${parts[0]}/${'20' + parts[2]}`;
			date = new Date(formattedDate);
		}
		else 
		{
			date = new Date(dateString);
		}
		if (date && isNaN(date.getTime())) 
		{
			return '';
		}
		const day = date.getDate().toString();
		return day.slice(0, 2).toUpperCase();
	}
	
	getDdlbIconText(columnName: string): string
	{
		const value = this.allformValues[columnName];
		if(value === undefined || value === null || value === '')
		{
			return '';
		}
		if(this.optionsMap instanceof Map)
		{
			const columnMap = this.optionsMap.get(columnName);
			if(columnMap instanceof Map)
			{
				const displayText = columnMap.get(value);
				if(displayText)
				{
					return displayText.toString().substring(0, 2).toUpperCase();
				}
				const displayTextStr = columnMap.get(String(value));
				if(displayTextStr)
				{
					return displayTextStr.toString().substring(0, 2).toUpperCase();
				}
			}
		}
		return value.toString().substring(0, 2).toUpperCase();
	}

	openRowCountPopup(formNo: any)
	{
		this.userInput = '';
		this.openRowCount[formNo] = true;
		// const tableElement = document.getElementById('RowCount_' + formNo);
		// if (tableElement) 
		// {
		// 	tableElement.setAttribute('style', 'display: block');
		// }
	}

	showMoreActionBtn() 
	{
		if (document.getElementsByClassName('mat-menu-panel')) 
		{
			if (document.getElementsByClassName('mat-menu-panel').length > 0) 
			{
				if (document.getElementsByClassName('mat-menu-panel')[0]) 
				{
					let elems = document.getElementsByClassName('mat-menu-panel');
					for (let i = 0; i < elems.length; i++) 
					{
						let elem = elems[i] as HTMLElement;
						elem.style.setProperty('margin-left', '-107px', 'important');
						elem.style.setProperty('min-height', '40px');
					}
				}
			}
		}
	}
	
	setSelectedValue(key: any)
	{
		
		if(this.toggleValuesJson && this.toggleValuesJson[key+"_toggle"] == false)
		{
			this.toggleValuesJson[key+"_toggle"] = true;
		}
		else if(this.toggleValuesJson && this.toggleValuesJson[key+"_toggle"] == true)
		{
			this.toggleValuesJson[key+"_toggle"] = false;
		}
		this.allformValues[key] = signal('');
		if(this.toggleValuesJson && this.toggleValuesJson[key+"_toggle"] == false)
		{
			this.allformValues[key] = 'N';
		}
		else if(this.toggleValuesJson && this.toggleValuesJson[key+"_toggle"] == true)
		{
			this.allformValues[key] = 'Y';
		}
	}
	
	linkDataForDetail(formNo: any, id:any, domId: any, index: any) 
	{
		let formNumber = formNo.toString();
		this.currentDomID = domId.toString();
		console.log('print this.currentDomID 5641:::::::',this.currentDomID);
		this.setFocusFormNo(formNumber, id, index); 
		this.linksDataForTransaction = [];
		let currentObjdetails = {} = JSON.parse(this.objectDetails); 
		let detailsLinkData = currentObjdetails.ROOT.Transaction.Form;
		console.log('print detailsLinkData 5645:::::::',detailsLinkData);

		for (let i = 0; i < detailsLinkData.length; i++) 
		{ 
			if (detailsLinkData[i]['no'] == formNo) 
			{ 
				if (detailsLinkData[i]['Links']) 
				{ 
					let sortedLinkArray: any = [];
					let tempLinkDataForTransaction = detailsLinkData[i]['Links']['Link'];
					sortedLinkArray = _.sortBy(tempLinkDataForTransaction, [function(o: any) { 
						return parseInt(o.LineNo, 10);
					}]);
					
					let curObjName = this.compData['OBJ_NAME'];
					this._extractTempletService.getActionData(curObjName,(response:any) =>
					{
						if(response && response[0] && response[0]['ACTIONS'] && response[0]['ACTIONS']['action'] &&  response[0]['ACTIONS']['action'].length > 0) 
						{
							let tempActionArr = response[0]['ACTIONS']['action'];
							let sortedActionArray = _.sortBy(tempActionArr, [function(f: any) { 
								return parseInt(f.line_no, 10); 
							}]);
							let objLinkActionArr = sortedLinkArray.concat(sortedActionArray);
							objLinkActionArr.sort((a: any, b: any) => {
								const valueA = a.line_no !== undefined ? a.line_no : a.LineNo;
								const valueB = b.line_no !== undefined ? b.line_no : b.LineNo;
								return valueA - valueB;
							});
							this.linksDataForTransaction = objLinkActionArr;
						}
						this.linksDataForTransaction.forEach((link: any) => {
							this.linkType = link.LinkType;
						});
					}); 
				}
				else
				{
					let curObjName = this.compData['OBJ_NAME'];
					this._extractTempletService.getActionData(curObjName,(response:any) =>
					{
						if(response && response[0] && response[0]['ACTIONS'] && response[0]['ACTIONS']['action'] &&  response[0]['ACTIONS']['action'].length > 0) 
						{
							let tempActionArr = response[0]['ACTIONS']['action'];
							let sortedActionArray = _.sortBy(tempActionArr, [function(f: any) { 
								return parseInt(f.line_no, 10); 
							}]);
							this.linksDataForTransaction = sortedActionArray;
						}
						// console.log('print linksDataForTransaction 4344::::::',this.linksDataForTransaction);
					}); 
				}
			}
		}
		
		if (document.getElementsByClassName('mat-menu-panel')) 
		{
			if (document.getElementsByClassName('mat-menu-panel').length > 0) 
			{
				if (document.getElementsByClassName('mat-menu-panel')[0]) 
				{
					let elems = document.getElementsByClassName('mat-menu-panel');
					for (let i = 0; i < elems.length; i++) 
					{
						let elem = elems[i] as HTMLElement;
						elem.style.setProperty('margin-left', '-99px', 'important');
					}
				}
			}
		}
	}


	performLinksActions(formNo: any, data:any,detailData:any,index:any, isHeaderActionButton: boolean)
	{
		this.isHeaderActionButton = isHeaderActionButton;
		this.currentFormNumber = formNo;

		// Build firstFormData (header fields) and find the current row's feedData
		const firstFormData: any = {};
		let rowFeedData: any = null;
		for (const key in this.allformValues)
		{
			if (!key.startsWith("Detail"))
			{
				firstFormData[key] = JSON.parse(JSON.stringify(this.allformValues[key]));
			}
		}

		// For detail forms, find the matching row record by currentDomID
		let currentDetail = 'Detail' + formNo;
		if (detailData && Array.isArray(detailData))
		{
			let tempDomId = this.currentDomID;
			let matchingRecord = detailData.find((record: any) => {
				return record.domID == tempDomId;
			});
			if (matchingRecord)
			{
				rowFeedData = JSON.parse(JSON.stringify(matchingRecord));
			}
		}
		// For header form (form 1) or if no detail match, use header fields as feedData
		if (!rowFeedData)
		{
			rowFeedData = firstFormData;
		}
		this.feedData = rowFeedData;

		if(data && data.link_type != undefined)
		{
			// Handle link-type items - invoke GWT side panel via invokeLink
			let linkData: any = JSON.parse(JSON.stringify(data));
			// Map snake_case properties to PascalCase expected by invokeLink/GWT
			if (linkData.link_arg != undefined) { linkData.LinkArg = linkData.link_arg; }
			if (linkData.link_title != undefined) { linkData.LinkTitle = linkData.link_title; }
			if (linkData.link_type != undefined) { linkData.LinkType = linkData.link_type; }
			if (linkData.link_form != undefined) { linkData.LinkForm = linkData.link_form; }
			if (linkData.link_uri != undefined) { linkData.LinkUri = linkData.link_uri; }
			if (linkData.link_id != undefined) { linkData.linkId = linkData.link_id; }
			if (linkData.target_object != undefined) { linkData.TargetObject = linkData.target_object; }
			if (linkData.update_flag != undefined) { linkData.UpdateFlag = linkData.update_flag; }
			if (linkData.display_mode != undefined) { linkData.DisplayMode = linkData.display_mode; }
			if (linkData.show_confirm != undefined) { linkData.ShowConfirm = linkData.show_confirm; }
			if (linkData.rights_char != undefined) { linkData.RightsChar = linkData.rights_char; }
			if (linkData.record_specific != undefined) { linkData.RecordSpecific = linkData.record_specific; }
			if (linkData.auto_invoke != undefined) { linkData.AutoInvoke = linkData.auto_invoke; }
			if (linkData.show_in_panel != undefined) { linkData.ShowInPanel = linkData.show_in_panel; }
			if (linkData.shortcut_char != undefined) { linkData.ShortcutChar = linkData.shortcut_char; }
			if (linkData.form_no != undefined) { linkData.FormNo = linkData.form_no.toString(); }
			if (linkData.field_name != undefined) { linkData.FieldName = linkData.field_name; }
			if (linkData.line_no != undefined) { linkData.LineNo = linkData.line_no; }
			if (linkData.image != undefined) { linkData.Image = linkData.image; }
			if (linkData.page_context != undefined) { linkData.pageContext = linkData.page_context; }

			// Sanitize "null" string values to empty string for GWT compatibility
			for (let key in linkData) {
				if (linkData[key] === 'null' || linkData[key] === null) {
					linkData[key] = '';
				}
			}

			console.log('performLinksActions invokeLink linkData:', linkData, 'feedData:', rowFeedData);
			this._extractTempletService.invokeLink(linkData, rowFeedData, this.objName, formNo, firstFormData, this.currentDomID);
		}
		else if(data && data.action_id != undefined && data.service_handler != undefined && data.service_handler == '3')
		{
			let event_code = "";
			if(data && data.service_code && data.service_code.service_code)
			{
				event_code = data.service_code.service_code;
				this.currentFormNumber = formNo;
				this.executeDefault(formNo, 'Detail'+formNo, event_code, data.action_id);
			}
			else if (data && data.service_code && data.service_code.content && isHeaderActionButton)
			{
				event_code = data.service_code.content;
				this.currentFormNumber = formNo;
				this.executeDefault(formNo, 'Detail'+formNo, event_code, data.action_id);
			}
		}
		else if(data && data.action_id != undefined && data.service_handler != undefined && data.service_handler == '4')
		{
			this.gridData = {};
			if(data.title)
			{
				this.gridData['TITLE'] = data.title;
			}
			this.currentFormNumber = formNo;
			this.gridData['FORM_NO'] = formNo;
			this.gridData['INDEX'] = index;
			if(data.service_code && data.service_code)
			{
				let eventCode = "";
				let compType = "";
				let methodName = "";
				if(data.service_code.service_code)
				{
					eventCode = data.service_code.service_code;
					this.gridData['EVENT_CODE'] = eventCode;
				}
				else if (isHeaderActionButton && data.service_code.content)
				{
					eventCode = data.service_code.content;
					this.gridData['EVENT_CODE'] = eventCode;
				}

				if(data.service_code.cmpType)
				{
					compType = data.service_code.cmpType;
					this.gridData['COMP_TYPE'] = compType;
				}
				if(data.service_code.metName)
				{
					methodName = data.service_code.metName;
					this.gridData['METHOD_NAME'] = methodName;
				}
				this.executeServiceHandler4(formNo, 'Detail'+formNo, eventCode, compType, methodName, data.action_id, isHeaderActionButton);
			}
		}
	}

	getCurrentRowXML(formNo: any, pageContext: any, action: any, forcedSave: any, pkvalues: any, domId: any, isHeaderActionButton?: boolean)
	{
		let keyValue = domId
		let currentAllData = JSON.parse(JSON.stringify(this.allformValues));
		let finalXml = "<?xmlversion='1.0'encoding='utf-8'?><Root>";
		finalXml = finalXml + "<header>";
		finalXml = finalXml + "<objName><![CDATA[" + this.compData["OBJ_NAME"] + "]]></objName>";
		finalXml = finalXml + "<pageContext><![CDATA[" + pageContext + "]]></pageContext>";
		finalXml = finalXml + "<objContext><![CDATA[" + formNo +"]]></objContext>";
		finalXml = finalXml + "<editFlag><![CDATA[" + this.editFlag + "]]></editFlag>";
		finalXml = finalXml + "<focusedColumn><![CDATA[]]></focusedColumn>";
		finalXml = finalXml + "<elementName><![CDATA[]]></elementName>";
		finalXml = finalXml + "<keyValue><![CDATA["+ keyValue +"]]></keyValue>";
		finalXml = finalXml + "<taxKeyValue><![CDATA[]]></taxKeyValue>";
		finalXml = finalXml + "<saveLevel><![CDATA[0]]></saveLevel>";
		finalXml = finalXml + "<forcedSave><![CDATA[" + forcedSave + "]]></forcedSave>";
		finalXml = finalXml + "<taxInFocus><![CDATA[false]]></taxInFocus>";
		finalXml = finalXml + "<action><![CDATA["+ action +"]]></action>";
		finalXml = finalXml + "</header>";
		
		let formDetail: any = 'Detail' + formNo;
		if (formDetail == 'Detail1')
		{
			let dbId = "";
			let attributeTagJson = this.allformValues['attribute'];

			if(attributeTagJson && typeof attributeTagJson === 'string')
			{
				attributeTagJson = JSON.parse(attributeTagJson);
			}	
			let attributeTagInXml = `<attribute `;
			for (const key of Object.keys(attributeTagJson)) 
			{
				if (this.editFlag == 'E') 
				{
					if (key == "pkNames") 
					{
						let primaryKey = attributeTagJson[key];

						let newstr = primaryKey.substring(0, primaryKey.length - 1);
						let arr = newstr.split(":");
						let arrLength = arr.length;

						for (let k = 0; k < arrLength; k++) 
						{
							let currentPkName = arr[k];
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
			let paramXML = `<` + formDetail + ` objContext="` + formNo
				+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + formNo + `" dbID="` + dbId + `" selected="Y">`;

			paramXML = paramXML + attributeTagInXml;
			
			for (let key in currentAllData) 
			{
				let value = currentAllData[key];
				if (value instanceof Array) 
				{
					delete currentAllData[key];
				}
			}

			let jsonData:any = {};
			jsonData = JSON.parse(JSON.stringify(currentAllData));

			for (let key in jsonData) 
			{
				let id:any = formDetail + '.1.' + key;
				let value = jsonData[key];
				if (value instanceof Object) 
				{
					value = "";
				}

				if (value == null) 
				{
					value = "";
				}
				if (this.checkIsDateFormat(key, formNo)) 
				{
					let fldValue = value;
					value = "";
					try
					{
						if (fldValue) 
						{
							if(typeof fldValue === 'object')
							{
								if(fldValue.content)
								{
									fldValue = fldValue.content;
								}
							}
							if(fldValue.includes(':'))
							{
								if (fldValue) 
								{
									if(typeof fldValue === 'object')
									{
										if(fldValue.content)
										{
											fldValue = fldValue.content;
										}
									}
									if (fldValue && fldValue.endsWith('00:00:00')) 
									{
										fldValue = fldValue.substring(0, 8); 
									}	
									let date;
									const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
									if (isoDateRegex.test(fldValue)) 
									{
										date = new Date(fldValue);
									} 
									else 
									{
										date = this.parseCustomDateFormat(fldValue)
									}
									if (date && !isNaN(date.getTime())) 
									{
										value = this.formatDate(date);
									}
								}
							} 
							else
							{
								fldValue = this.parseCustomDateFormat(fldValue);
								
								if (!isNaN(fldValue.getTime()))
								{
									value = this.formatDate(fldValue);
								}
							}
						}
					}
					catch(error)
					{
						value = fldValue;
					}
					if(value == null || value == undefined)
					{
						value = "";
					}
					paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
				}
				else if (key != "attribute") 
				{
					if(value == null || value == undefined)
					{
						value = "";
					}
					paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
				}
			}
			paramXML = paramXML + `</` + formDetail + `>`;
			finalXml = finalXml + paramXML;
		}
		else 
		{
			let detailDataLen = 0;
			if (this.allformValues[formDetail] != undefined) 
			{
				detailDataLen = this.allformValues[formDetail].length;
				
			}
			if(detailDataLen > 0)
			{
				for (let j = 0; j < detailDataLen; j++) 
				{
					let dbId = "";
					if(this.allformValues && this.allformValues[formDetail] && this.allformValues[formDetail][j] && this.allformValues[formDetail][j]['domID'])
					{
						
						if(this.allformValues[formDetail][j]['domID'] == domId)
						{
							let attributeTagJson = this.allformValues[formDetail][j]['attribute'];
							
							
							let attributeTagInXml = `<attribute IS_CHANGE="Y"`;
							if (JSON.stringify(attributeTagJson).includes('IS_CHANGE')) 
							{
								attributeTagInXml = `<attribute `;
							}
							if(attributeTagJson && typeof attributeTagJson === 'string')
							{
								attributeTagJson = JSON.parse(attributeTagJson);
							}	
							for (const key of Object.keys(attributeTagJson)) 
							{
								if (this.editFlag == 'E') 
								{
									if (key == "pkNames") 
									{
										let primaryKey = attributeTagJson[key];
										let newstr = primaryKey.substring(0, primaryKey.length - 1);
										let arr = newstr.split(":");
										let arrLength = arr.length;
			
										for (let k = 0; k < arrLength; k++) 
										{
											let currentPkName = arr[k];
											dbId = dbId + this.allformValues[formDetail][j][currentPkName] + ":";
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
							let paramXML = "";
							if( this.editFlag == 'A')
							{
								let domId = this.allformValues[formDetail][j]['domID'];
								paramXML = `<` + formDetail + ` objContext="` + formNo
								+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + domId + `" dbID="` + dbId + `">`;
							}
							else
							{
								paramXML = `<` + formDetail + ` objContext="` + formNo
								+ `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + domId + `" dbID="` + dbId + `">`;
							}
							
							paramXML = paramXML + attributeTagInXml;
							currentAllData = this.allformValues[formDetail][j];
							let jsonData:any = {};
							jsonData = JSON.parse(JSON.stringify(currentAllData));
			
							for (let key in jsonData) 
							{
								let id = formDetail + '.' + (j + 1) + '.' + key;
								let value = jsonData[key];
								if (value instanceof Object) 
								{
									value = "";
								}
								if (value == null) 
								{
									value = "";
								}
								if (this.checkIsDateFormat(key, formNo)) 
								{
									let fldValue = value;
									value = "";
									try
									{
										if (fldValue) 
										{
											if(typeof fldValue === 'object')
											{
												if(fldValue.content)
												{
													fldValue = fldValue.content;
												}
											}
											let date;
											const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
											if (isoDateRegex.test(fldValue)) 
											{
												date = new Date(fldValue);
											} 
											else 
											{
												date = this.parseCustomDateFormat(fldValue);
											}
											if (date && !isNaN(date.getTime())) 
											{
												value = this.formatDate(date);

												if(value.includes("/"))
												{
													this.allformValues[formDetail][j][key] = this.convertStringToDate(value);
											} 
											}
										}
									}
									catch(error)
									{
										value = fldValue;
									}
									if(value == null || value == undefined)
									{
										value = "";
									}
									paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
								}
								else if (key != "attribute") 
								{
									if(value == null || value == undefined)
									{
										value = "";
									}
									paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
									
								}
							}
							paramXML = paramXML + `</` + formDetail + `>`;
							finalXml = finalXml + paramXML;
						}
					}
				}
			}
			else
			{
				if(isHeaderActionButton)
				{
					finalXml = finalXml + "</Root>";
					return finalXml;
				}
					finalXml = "";
					return finalXml;
			}
		}
		finalXml = finalXml + "</Root>";
		this.cdr.markForCheck();
		return finalXml;
	}

	executeDefault(formNo: any, formDetail: any, event_code: any, action_id: any)
    {
        let action = "";
        if( this.compData["EDIT_FLAG"] == "E")
        {
            action = "EDIT";
        }
        else if( this.compData["EDIT_FLAG"] == "A" )
        {
            action = "ADD";
        }
        let keyVal = "";
        let detailDataLen = 0;
        if (this.allformValues[formDetail] != undefined) 
        {
            detailDataLen = this.allformValues[formDetail].length;
            keyVal = this.allformValues[formDetail][detailDataLen-1]['domID'];
        }

        let chgStr = "<?xml version='1.0' encoding='utf-8'?>";
        chgStr = chgStr + "<Root>";
        chgStr = chgStr + "<header>";
        chgStr = chgStr + "<objName><![CDATA["+this.compData["OBJ_NAME"]+"]]></objName>";
        chgStr = chgStr + "<pageContext><![CDATA[1]]></pageContext>";
        chgStr = chgStr + "<objContext><![CDATA["+formNo+"]]></objContext>";
        chgStr = chgStr + "<editFlag><![CDATA["+this.compData["EDIT_FLAG"]+"]]></editFlag>";
        chgStr = chgStr + "<focusedColumn><![CDATA[]]></focusedColumn>";
        chgStr = chgStr + "<elementName><![CDATA[]]></elementName>";
        chgStr = chgStr + "<keyValue><![CDATA["+ keyVal + "]]></keyValue>";
        chgStr = chgStr + "<taxKeyValue><![CDATA[]]></taxKeyValue>";
        chgStr = chgStr + "<saveLevel><![CDATA[0]]></saveLevel>";
        chgStr = chgStr + "<forcedSave><![CDATA[false]]></forcedSave>";
        chgStr = chgStr + "<taxInFocus><![CDATA[false]]></taxInFocus>";
        chgStr = chgStr + "<action><![CDATA["+action+"]]></action>";
        chgStr = chgStr + "</header>";
        chgStr = chgStr + "</Root>";
       	let newtempData: any = {};
        newtempData["SERVICE_HANDLER"] = "3";
        newtempData["SERVICE_CODE"] = event_code;
        newtempData["OBJ_NAME"] = this.compData["OBJ_NAME"];
		newtempData["RED_ID"] = this.pkValues;
		newtempData["COMP_TYPE"] = "";
		newtempData["COMP_NAME"] = "";
		newtempData["METHOD_NAME"] = "";
        newtempData["CHG_STR"] = chgStr;
		newtempData["TITLE"] = "Default";
		newtempData["isDecode"] = "false";
		newtempData["ACTION_ID"] = action_id;
        newtempData["CORE_MDL_ID"] = this.compData["EDITOR_ID"];
        newtempData["INTERFACE"] = "BROWSER";
        newtempData['RETURN_TYPE'] = "json";
		newtempData["dummyInt"] = this.compData["dummyInt"];
		// console.log('print newtempData 6334::::::',newtempData);
       	let paramString = this._extractTempletService.getEncodedParamString(newtempData);
        let url = this._extractTempletService.getHostURL() + '/ibase/WebITMServiceHandlerServlet3';
        this._extractTempletService.setLoading(true);		
		
		this._extractTempletService.sendRequest(url, paramString, (data:any) => 
        {
			// console.log('print data 6341::::::',data);
            this._extractTempletService.setLoading(false);
            try 
            {
				if(data && data.includes('%%SEP%%'))
				{
					let callbackRespNew = data.split('%%SEP%%');
					// console.log('print callbackRespNew 6348::::::',callbackRespNew);
					data = callbackRespNew[0];
					let isError = callbackRespNew[1].trim();
					if (!(isError == 'true')) 
					{
						if( data.includes("No Records Found"))
						{
							return "";
						}
						else
						{
							this._extractTempletService.checkErrorException(data, (res: any) => {
								if (!res) 
								{
									let allDetailData: any = {} ;
									allDetailData['formDetail'] = formDetail;
									allDetailData['Action'] = 'Default';
									let actionResponseNew = {} = JSON.parse(data);
									allDetailData['CurrentFormData'] = actionResponseNew;
									allDetailData['isError'] = false;
									// console.log('print allDetailData 6366::::::',allDetailData);
									this.applyPerformActionData(JSON.stringify(allDetailData));
								}
							});
						}
					}
				}
            }
            catch(error)
            {
                console.log('Error inside ExecuteDefault response Error',error);
            }
        });
    }

	applyPerformActionData( performActionData: any )
    {
        let currentFormData = JSON.parse(performActionData);
        let firstCallBrowserDataNew = currentFormData['CurrentFormData'];
        let currentFormNoDetail = currentFormData['formDetail'];
        let action = currentFormData['Action'];
        let isError = currentFormData['isError'];
		// console.log('print firstCallBrowserDataNew 6388::::::',firstCallBrowserDataNew);
        this.applyDataOndetail( currentFormNoDetail, firstCallBrowserDataNew,  action, isError)
    }

    applyDataOndetail( currentFormNoDetail: any, firstCallBrowserDataNew: any, action: any, isError: any): Promise<void> {
		return new Promise((resolve, reject) => {
			try
			{
				if (action == 'Default') 
				{
					let detailArray: any = [];
					let detailLen = firstCallBrowserDataNew.DocumentRoot.group0.Header0[currentFormNoDetail].length;
					let detailJsonData: any = {};
					if (detailLen == null) 
					{
						detailJsonData = firstCallBrowserDataNew.DocumentRoot.group0.Header0[currentFormNoDetail];
						for (const key of Object.keys(detailJsonData))
						{
							let value = detailJsonData[key];
							if (key === 'attribute' && value instanceof Object)
							{
								detailJsonData[key] = JSON.stringify(value);
								detailJsonData[key+'_protect'] = "0";
								detailJsonData[key+'_visible'] = "";
							}
							else if (key != 'attribute' && value instanceof Object)
							{
								if (detailJsonData[key] && detailJsonData[key].protect)
								{
									if(detailJsonData[key].protect.toString() == "")
									{
										detailJsonData[key+'_protect'] = "0";
									}
									else
									{
										detailJsonData[key+'_protect'] = detailJsonData[key].protect.toString();
									}
								}
								else
								{
									detailJsonData[key+'_protect'] = "0";
								}
								if (detailJsonData[key] && detailJsonData[key].visible)
								{
									detailJsonData[key+'_visible'] = detailJsonData[key].visible.toString();
								}
								else
								{
									detailJsonData[key+'_visible'] = "";
								}
								if (detailJsonData[key] && (detailJsonData[key].content || detailJsonData[key].content == 0))
								{
									value = detailJsonData[key].content;
								}
								else
								{
									value = "";
								}
							}
							// id = currentFormNoDetail + '.1.' + key;
							if(value == null || value == undefined)
							{
								detailJsonData[key] = "";
							}
							else
							{
								detailJsonData[key] = value;
							}
						}
						detailArray.push(detailJsonData);
					}
					else
					{
						for (let j = 0; j < detailLen; j++)
						{
							let id;
							let formId;
							detailJsonData = firstCallBrowserDataNew.DocumentRoot.group0.Header0[currentFormNoDetail][j];
							for (const key of Object.keys(detailJsonData))
							{
								id = currentFormNoDetail + '.' + (j + 1) + '.' + key;
								formId = currentFormNoDetail + '-' + (j + 1) + '-' + key;
								let value = detailJsonData[key];
								if (key === 'attribute' && value instanceof Object)
								{
									detailJsonData[key] = JSON.stringify(value);
									detailJsonData[key+'_protect'] = "0";
									detailJsonData[key+'_visible'] = "";
								}
								else if (key != 'attribute' && value instanceof Object)
								{
									if (detailJsonData[key] && detailJsonData[key].protect)
									{
										if(detailJsonData[key].protect.toString() == "")
										{
											detailJsonData[key+'_protect'] = "0";
										}
										else
										{
											detailJsonData[key+'_protect'] = detailJsonData[key].protect.toString();
										}
									}
									else
									{
										detailJsonData[key+'_protect'] = "0";
									}
									if (detailJsonData[key] && detailJsonData[key].visible)
									{
										detailJsonData[key+'_visible'] = detailJsonData[key].visible.toString();
									}
									else
									{
										detailJsonData[key+'_visible'] = "";
									}
									if (detailJsonData[key] && (detailJsonData[key].content || detailJsonData[key].content == 0))
									{
										value = detailJsonData[key].content;
									}
									else
									{
										value = "";
									}
									this.checkProtectAndVisbile(detailJsonData, key, id, formId);
								}
								if(value == null || value == undefined)
								{
									detailJsonData[key] = "";
								}
								else
								{
									detailJsonData[key] = value;
								}
							}
							detailArray.push(detailJsonData);
						}
					}
					this.allformValues[currentFormNoDetail] = [];
					this.allformValues[currentFormNoDetail].length = 0;  
					this.allformValues[currentFormNoDetail] = detailArray;
					// console.log('print this.allformValues[currentFormNoDetail] 6516::::::',this.allformValues[currentFormNoDetail]);
				}
				setTimeout(() => {
					resolve(); // Resolve the promise when done
				}, 0);
				this.cdr.markForCheck();
			}
			catch (e:any) 
			{
				console.log('Exception inside applyDataOndetail ', e.message);
				reject(e);
			}
		});
    }
    
    onPreventPopHelpItemChange(event: any)
	{
		let data = JSON.parse(event);
		this.isPreventPopHelpItemChange = data['preventPopHelpItemChange'];
	}
	
	getFieldNameBeforeUnderscore(fieldName: string): string 
	{
  		if (fieldName && fieldName.includes('__')) 
  		{
    		return fieldName.substring(0, fieldName.indexOf('__'));
  		}
  		return fieldName;
	}

	setUpdateVisibleProperty(id: any)
	{
		let elem = document.getElementById(id);
		if(elem && elem.classList.contains('inputClass') && elem.hasAttribute('disabled'))
		{
			let elemParent = elem.parentElement;
			if(elemParent)
			{
				let mainDiv = elemParent.parentElement;
				if(mainDiv)
				{
					let wrapperDiv = mainDiv.parentElement;
					if(wrapperDiv)
					{
						let matFormDiv = wrapperDiv.parentElement;
						if(matFormDiv)
						{
							let mainInputDiv = matFormDiv.parentElement;
							if(mainInputDiv && mainInputDiv.classList.contains('mainInputField'))
							{
								let iconElem = mainInputDiv.querySelectorAll('.filterIcon');
								if(iconElem && iconElem[0] && iconElem[0].classList.contains('filterIcon'))
								{
									iconElem[0].classList.remove('filterIcon');
									iconElem[0].classList.add('disabledFilterIcon');
									let optionIconElem = iconElem[0].getElementsByClassName('optionIcon');
									if (optionIconElem && optionIconElem[0] != null) 
									{
										let firstElem = optionIconElem[0];
										if (firstElem.classList && firstElem.classList.contains('optionIcon')) 
										{
											firstElem.classList.remove('optionIcon');
											firstElem.classList.add('disabledOptionIcon');
										}
									} 
									else 
									{
										console.error("optionIconElem[0] is null or undefined.");
									}
								}
							}
						}
					}
				}
			}
		}
		else if(elem && elem.classList.contains('inputClass') && !elem.hasAttribute('disabled'))
		{
			let elemParent = elem.parentElement;
			if(elemParent)
			{
				let mainDiv = elemParent.parentElement;
				if(mainDiv)
				{
					let wrapperDiv = mainDiv.parentElement;
					if(wrapperDiv)
					{
						let matFormDiv = wrapperDiv.parentElement;
						if(matFormDiv)
						{
							let mainInputDiv = matFormDiv.parentElement;
							if(mainInputDiv && mainInputDiv.classList.contains('mainInputField'))
							{
								let iconElem = mainInputDiv.querySelectorAll('.disabledFilterIcon');
								if(iconElem && iconElem[0])
								{
									iconElem[0].classList.remove('disabledFilterIcon');
									iconElem[0].classList.add('filterIcon');
									let optionIconElem = iconElem[0].getElementsByClassName('disabledOptionIcon') 
									if (optionIconElem && optionIconElem[0] != null) 
									{
										let firstElem = optionIconElem[0];
										if (firstElem.classList && firstElem.classList.contains('disabledOptionIcon')) 
										{
											firstElem.classList.remove('disabledOptionIcon');
											firstElem.classList.add('optionIcon');
										}
									} 
									else 
									{
										console.error("optionIconElem[0] is null or undefined.");
									}
								}
							}
						}
					}
				}
			}
		}
	}

	getMonthOfDate(dateString: any): string 
	{
		if (!dateString) 
		{
			return '';
		}
		let date;
		if(dateString.includes('/'))
		{
			const parts = dateString.split(' ')[0].split('/'); 
			if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) 
			{
				return '';
			}
			const formattedDate = `${parts[1]}/${parts[0]}/${'20' + parts[2]}`; 
			date = new Date(formattedDate);
		}
		else 
		{
			date = new Date(dateString);
		}

		if (date && isNaN(date.getTime())) 
		{
			return '';
		}
		const month = date.toLocaleString('en-US',{month: 'short'}).toString()
		return month.toUpperCase();
	}

	getObjMetadata(objectFormDetailData: any)
	{
		/* Commented OBJ_METADATA RIAWizardHandlerServlet call
		if(this.numOfForms)
		{
			for(let formNo = 1; formNo <= this.numOfForms; formNo++)
			{
				let tmpData: any = {};
				this.primaryKeyArray[formNo] = new Set();
				let yCordGrpMapVal = new Map<number, Map<number, any>>();
				tmpData["OBJ_NAME"] = this.objName;
				tmpData["ACTION"] = "OBJ_METADATA";
				tmpData["FORM_NO"] = formNo.toString();
				tmpData["FORM_NAME"] = "";
				tmpData["PROFILEID"] = this.userInfo?.result?.UserInfo.profileId;
				if(formNo == 1)
				{
					tmpData["TAB_TYPE"] = "F";
				}
				else
				{
					tmpData["TAB_TYPE"] = "T";
				}
				tmpData["EDITOR"] = "WebEditor";
				let paramString = this._extractTempletService.getEncodedParamString(tmpData);
				let url = this._extractTempletService.getHostURL() + "/ibase/RIAWizardHandlerServlet";
				this._extractTempletService.isFromAttachPdf = false;
				this._extractTempletService.setLoading(true); 
				this._extractTempletService.sendRequest(url, paramString, (objMetaData: any) => 
				{
					this._extractTempletService.setLoading(false); 
					let callbackRespNew = objMetaData.split("%%SEP%%");
					objMetaData = callbackRespNew[0];
					let isError = callbackRespNew[1].trim();
					if (!(isError == "true")) 
					{
						let metadataMap: any = {};
						const elementsStrArr: string[] = objMetaData.split("~ELEMSEP~");
						let colObjStrArr: any = [];
						let txtObjStrArr: any = [];
						let tableColObjStrArr: any = [];
						let groupArr: any = [];
						let grpObjStrArr: any = [];

						for (let i = 0; i < elementsStrArr.length; i++) 
						{
							const strTok: string[] = elementsStrArr[i].split("~OBJSEP~");
							const tokenMap = parseTokens(strTok[1]);
							if (tokenMap) 
							{
								if (strTok[0] === "ColumnObject") 
								{
									colObjStrArr.push(tokenMap);
								}
								if (strTok[0] === "TextObject") 
								{
									txtObjStrArr.push(tokenMap);
								}
								if (strTok[0] === "table_column") 
								{
									tableColObjStrArr.push(tokenMap);
								}
								if (strTok[0] === "GroupBox") 
								{
									groupArr.push(tokenMap);
								}
								if (strTok[0] === "group") 
								{
									grpObjStrArr.push(tokenMap);
								}
							} 
							else 
							{
								console.error("parseTokens returned undefined or encountered an error." );
							}
						}
					
						metadataMap["ColumnObject"] = colObjStrArr;
						metadataMap["TextObject"] = txtObjStrArr;
						metadataMap["table_column"] = tableColObjStrArr;
						metadataMap["GroupBox"] = groupArr;
						metadataMap["group"] = grpObjStrArr;

						let yMetadataMap: Map<number, Map<number, MetaDataNodeObj>> = new Map();
						let ycolMap: Map<number, any> = new Map();
						for (let grpObjCtr = 0; groupArr !== null && grpObjCtr < groupArr.length; grpObjCtr++) 
						{
							const grpObjMap = groupArr[grpObjCtr];
							let beanGrpObj = new MetaDataNodeObj();
							if(beanGrpObj)
							{
								beanGrpObj.text = grpObjMap["text"];
								beanGrpObj.xCordinate = grpObjMap["x"];
								beanGrpObj.yCordinate = grpObjMap["y"];
								beanGrpObj.height = grpObjMap["height"];
								beanGrpObj.width = grpObjMap["width"];
								beanGrpObj.name = grpObjMap["name"];
								beanGrpObj.isVisible = grpObjMap["visible"];
								beanGrpObj.mask = grpObjMap["mask"];
								beanGrpObj.initial = grpObjMap["initial"];
								beanGrpObj.type = "Group";
								if ( "chg_user" === beanGrpObj.name || "chg_term" === beanGrpObj.name || "add_date" === beanGrpObj.name || "add_user" === beanGrpObj.name ||  "add_term" === beanGrpObj.name) 
								{
									beanGrpObj.isVisible = "0";
								}
								if("32766"=== beanGrpObj.tab )
								{ 
									beanGrpObj.disabled = true;
								}
								if(this.popHelpFieldSet.has(beanGrpObj.name))
								{
									beanGrpObj.popHelp  = "true";
								}
								if ( beanGrpObj.popHelp === "") 
								{
									const columnObjectName: string = beanGrpObj.name || "";
									if (columnObjectName.indexOf("__") !== -1) 
									{
										const endIndex = columnObjectName.indexOf("__");
										const truncatedObjectName = columnObjectName.substring(0, endIndex);
										if (this.popHelpFieldSet.has(truncatedObjectName)) 
										{
											beanGrpObj.popHelp = "true";
										}
									}
								}
								const y = parseInt(beanGrpObj.yCordinate, 10);
							
								let groupBoxObj: any = {};
								groupBoxObj["grpNodeObj"] =  beanGrpObj;
								if(yMetadataMap instanceof Map) 
								{
									yMetadataMap.set(y, groupBoxObj);
								}
							}
						}
						for (let colObjCtr = 0; colObjCtr < colObjStrArr.length; colObjCtr++) 
						{
							const colObjMap = colObjStrArr[colObjCtr];
							let beanGrpObj = new MetaDataNodeObj();
							if(beanGrpObj)
							{
								beanGrpObj.alignment = colObjMap["alignment"];
								beanGrpObj.tab = colObjMap["tabsequence"];
								beanGrpObj.xCordinate = colObjMap["x"];
								beanGrpObj.yCordinate = colObjMap["y"];
								beanGrpObj.height = colObjMap["height"];
								beanGrpObj.width = colObjMap["width"];
								beanGrpObj.format = colObjMap["format"];
								beanGrpObj.name = colObjMap["name"];
								beanGrpObj.isVisible = colObjMap["visible"];
								if(tableColObjStrArr)
								{
									let tableColDataType: any;
									tableColDataType = tableColObjStrArr.find((d: any) => d.name ===  beanGrpObj.name);
									if(tableColDataType)
									{
										beanGrpObj.dataType = tableColDataType.type;
									}
								}
								
								if ( "chg_user" === beanGrpObj.name || "chg_term" === beanGrpObj.name || "add_date" === beanGrpObj.name || "add_user" === beanGrpObj.name ||  "add_term" === beanGrpObj.name) 
								{
									beanGrpObj.isVisible = "0";
								}
								if("32766"=== beanGrpObj.tab )
								{ 
									beanGrpObj.disabled = true;
								}

								beanGrpObj.editStyle = colObjMap["EditStyle"];
								beanGrpObj.limit = colObjMap["limit"];
								beanGrpObj.required= colObjMap["required"];
								beanGrpObj.popHelp = "";
								beanGrpObj.textCase= colObjMap["case"];
								beanGrpObj.displayLabel = colObjMap["displayLabel"];
								beanGrpObj.mask = colObjMap["mask"];
								beanGrpObj.initial = colObjMap["initial"];
								beanGrpObj.type = "Col";
						
								if(this.popHelpFieldSet.has(beanGrpObj.name))
								{
									beanGrpObj.popHelp  = "true";
								}
								if ( beanGrpObj.popHelp === "") 
								{
									const columnObjectName: string = beanGrpObj.name || "";
									if (columnObjectName.indexOf("__") !== -1) 
									{
										const endIndex = columnObjectName.indexOf("__");
										const truncatedObjectName = columnObjectName.substring(0, endIndex);
										if (this.popHelpFieldSet.has(truncatedObjectName)) 
										{
											beanGrpObj.popHelp = "true";
										}
									}
								}
								this.createObjArray(formNo, beanGrpObj);
								const x = parseInt(beanGrpObj.xCordinate, 10);
								const y = parseInt(beanGrpObj.yCordinate, 10);

								if (yMetadataMap.get(y) != null) 
								{
									ycolMap = yMetadataMap.get(y)!;
									if (beanGrpObj != null) 
									{
										if(ycolMap instanceof Map) 
										{
											ycolMap.set(x, beanGrpObj);
										}
									}
									if(ycolMap instanceof Map) 
									{
										const ycolMapArray = Array.from(ycolMap.entries());
										ycolMapArray.sort((a, b) => {
											return a[0] - b[0];
										}); 
									
										ycolMap = new Map<number, Map<number, any>>(ycolMapArray);
										if(yMetadataMap instanceof Map) 
										{
											yMetadataMap.set(y, ycolMap);
										}
									}
								} 
								else 
								{
									if(yMetadataMap instanceof Map) 
									{
										yMetadataMap.set(y, new Map<number, any>());
									}
									if (beanGrpObj != null) 
									{
										if(yMetadataMap?.get(y) instanceof Map) 
										{
											yMetadataMap.get(y)?.set(x, beanGrpObj);
										}
									}	
								}
							}
						}
						if(this.columnsObjArray && this.columnsObjArray[formNo] && colObjStrArr && this.columnsObjArray[formNo].length == colObjStrArr.length)
						{
							this.finalColumnsObjArray[formNo] = this.sortJsonArray(this.columnsObjArray[formNo]);
							// console.log('print this.finalColumnsObjArray 6958::::',this.finalColumnsObjArray);

							this.formWiseFormatJson = {};
							for(let formNo in this.finalColumnsObjArray )
							{
								let columnObj = this.finalColumnsObjArray[formNo];
								
								this.formWiseFormatJson[formNo] = {};
								this.formWiseRequiredFieldsJson[formNo] = [];
								columnObj.forEach(( col=> {
									if(col.name && col.format)
									{
										this.formWiseFormatJson[formNo][col.name] = col.format;
										// console.log('print formWiseFormatJson 6940::::',this.formWiseFormatJson);
										this.popHelp.formWiseFormatJson = this.formWiseFormatJson;
									}

									if(col.name && col.required)
									{
										const required = col.required?.toString().toLowerCase();
										const isRequired = required === 'true' || required === 'yes';

										if (col.name && isRequired) 
										{
											this.formWiseRequiredFieldsJson[formNo].push(col.name);
											// console.log("formWiseRequiredFieldsJson 111 :: ",this.formWiseRequiredFieldsJson)
										}
									}
								}));
							}
						}
						if(yMetadataMap instanceof Map) 
						{
							const sortedDataMapArray = Array.from(yMetadataMap.entries());
							sortedDataMapArray.sort((a, b) => {
								return a[0] - b[0];
							}); 
							yMetadataMap = new Map<number, Map<number, any>>(sortedDataMapArray);
						}
						for (let tableColumnCtr = 0; tableColumnCtr < tableColObjStrArr.length; tableColumnCtr++) 
						{
							const tableColumnMap = tableColObjStrArr[tableColumnCtr];
							if(tableColumnMap["key"] == 'yes')
							{
								this.primaryKeyArray[formNo].add(tableColumnMap["name"])
							}
							let beanGrpObj = new MetaDataNodeObj();
							if(beanGrpObj)
							{
								beanGrpObj.name = tableColumnMap["name"];
								beanGrpObj.initial = tableColumnMap["initial"];
								beanGrpObj.type = tableColumnMap["type"];
								let options = tableColumnMap["values"];
								
								const resultMap = new Map();
								const values = options.split("~OPTSEP~");
								const optionValuePairs = values.map((val: any) => val.split("~OPTVALSEP~"));
								for (const [value, option] of optionValuePairs) 
								{
									if(resultMap instanceof Map) 
									{
										resultMap.set(option, value);
									}
								}
								
								if ( "chg_user" === beanGrpObj.name || "chg_term" === beanGrpObj.name || "add_date" === beanGrpObj.name || "add_user" === beanGrpObj.name ||  "add_term" === beanGrpObj.name) 
								{
									beanGrpObj.isVisible = "0";
								}
								if("32766"=== beanGrpObj.tab )
								{ 
									beanGrpObj.disabled = true;
								}
								if(this.popHelpFieldSet.has(beanGrpObj.name))
								{
									beanGrpObj.popHelp  = "true";
								}
								if ( beanGrpObj.popHelp === "") 
								{
									const columnObjectName: string = beanGrpObj.name || "";
									if (columnObjectName.indexOf("__") !== -1) 
									{
										const endIndex = columnObjectName.indexOf("__");
										const truncatedObjectName = columnObjectName.substring(0, endIndex);
										if (this.popHelpFieldSet.has(truncatedObjectName)) 
										{
											beanGrpObj.popHelp = "true";
										}
									}
								}
								if(this.primaryKeyArray[formNo] && this.primaryKeyArray[formNo].has(beanGrpObj.name))
								{
									beanGrpObj.isPrimaryKey = true;
								}
								if(this.optionsMap instanceof Map)
								{
									this.optionsMap.set(beanGrpObj.name,resultMap)
								}
							}
						}
						if (txtObjStrArr !== null && txtObjStrArr !== undefined)
						{
							for (let textObjCtr = 0; textObjCtr < txtObjStrArr.length; textObjCtr++) 
							{
								const txtObjMap = txtObjStrArr[textObjCtr];
								let text = txtObjMap["text"];
								let name = txtObjMap["name"]
								if(this.labelMapData instanceof Map) 
								{
									this.labelMapData.set(name, text);
								}
							}
						}

						let tempYCordColMap = new Map<number, Map<number, any>>();
						let currentGrpIndex: number = 0;
						let groupBoxObj: any = {};

						for (let ycordMap of yMetadataMap) 
						{
							let yIndex = ycordMap[0];
							if (ycordMap[1] instanceof Map) 
							{
								if(tempYCordColMap instanceof Map) 
								{
									tempYCordColMap.set(ycordMap[0], ycordMap[1]);
								}
								groupBoxObj["grpBox_contents"] = tempYCordColMap;
								if(yCordGrpMapVal instanceof Map) 
								{
									yCordGrpMapVal.set(currentGrpIndex, groupBoxObj);
								}
							} 
							else 
							{
								groupBoxObj = ycordMap[1];
								tempYCordColMap = new Map<number, Map<number, any>>();
								currentGrpIndex = yIndex; 
							}
						}
					}
					this.objFormDetailsJson[formNo.toString()] = yCordGrpMapVal;
					if(objectFormDetailData.length)
					{
						for(let m = 0; m < objectFormDetailData.length; m++)
						{
							let index = m+1;
							if(formNo == index && this.objFormDetailsJson[formNo.toString()])
							{
								this.objFormDetailsJson[formNo.toString()]['Title'] = objectFormDetailData[m]['Title'];
							}
						}
					}
					else
					{
						this.objFormDetailsJson[formNo.toString()]['Title'] = objectFormDetailData['Title'];
					}
					this.cdr.detectChanges();
				});
				function parseTokens(tokenizedStr: string) 
				{
					const tokenMap: any = {};
					try {
						if(tokenizedStr)
						{
						const strMainTok = tokenizedStr.split("~PROPSEP~");
						for (let i = 0; i < strMainTok.length; i++) 
						{
							const strTok = strMainTok[i].split("~PROPVALSEP~");
							const strTok0 = strTok[0];
							let strTok1 = strTok.length > 1 ? strTok[1] : "";
							tokenMap[strTok0] = strTok1;
						}
					}
					} 
					catch (error) 
					{
						console.error("Error parsing tokens:", error);
					}
					return tokenMap;
				}
			}
			// console.log(" print this.objFormDetailsJson 6658::::; ", this.objFormDetailsJson);
			// console.log('print this.finalColumnsObjArray 6959::::',this.finalColumnsObjArray);
		}
		Commented OBJ_METADATA RIAWizardHandlerServlet call */
	}

	trackByIndex(index: number, item: any): any 
	{
        return item.domID || index;
    }

	onKeyEvent(event: KeyboardEvent)
	{
		let openSuggest: any = null;
		if(this.bbAutoSuggest)
		{
			openSuggest = this.bbAutoSuggest.find((s: any) => s.isOpen);
		}
		// Fallback: use tracked active detail autosuggest if QueryList didn't find it
		if (!openSuggest && this.activeDetailAutoSuggest && this.activeDetailAutoSuggest.isOpen) {
			openSuggest = this.activeDetailAutoSuggest;
		}
		if(openSuggest)
		{
			openSuggest.handleUpDownKeyEvent(event);
		}
	}

	
	// onClick = (event: Event) => {
	// 	// console.log('Document clicked', event);
	// };

	onKeyDown = (event: KeyboardEvent) => {
		if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown' && event.key !== 'Enter' && event.key !== 'Escape' && event.key !== 'Tab') {
			return;
		}
		// Cancel any pending autosuggest debounce when navigating/selecting in the popup
		// to prevent it from resetting selectedIndex mid-navigation
		if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter' || event.key === 'Tab') {
			if (this.autoSuggestDebounceTimer) {
				clearTimeout(this.autoSuggestDebounceTimer);
				this.autoSuggestDebounceTimer = null;
			}
		}
		// For Tab and Enter, only intercept if autosuggest is open with a selected item
		if (event.key === 'Tab' || event.key === 'Enter') {
			let openSuggest: any = null;
			if (this.bbAutoSuggest) {
				openSuggest = this.bbAutoSuggest.find((s: any) => s.isOpen && s.selectedIndex >= 0);
			}
			// Fallback: use tracked active detail autosuggest if QueryList didn't find it
			if (!openSuggest && this.activeDetailAutoSuggest &&
				this.activeDetailAutoSuggest.isOpen && this.activeDetailAutoSuggest.selectedIndex >= 0) {
				openSuggest = this.activeDetailAutoSuggest;
			}
			if (openSuggest) {
				event.stopPropagation();
				event.preventDefault();
				this.ngZone.run(() => {
					openSuggest.handleUpDownKeyEvent(event);
					// For Enter key, focus stays on the input so blur does not fire.
					// Reattach CD temporarily so the selected value is reflected in the DOM.
					if (event.key === 'Enter' && this.isDetailInputFocused) {
						this.cdr.reattach();
						this.cdr.detectChanges();
						this.cdr.detach();
					}
				});
			}
			return;
		}
		event.stopPropagation();
		event.preventDefault();
		// Run inside Angular zone so change detection picks up state changes
		// (e.g. autosuggest isOpen = false, selectedIndex updates, event emissions)
		this.ngZone.run(() => {
			this.onKeyEvent(event);
			// Reattach CD temporarily so the selectedIndex / highlight update is visible
			if (this.isDetailInputFocused) {
				this.cdr.reattach();
				this.cdr.detectChanges();
				this.cdr.detach();
			}
		});
	};

	onPreventEnterKeyItemChange(event: any) 
	{
		let data = JSON.parse(event);
		this.isPreventEnterKeyItemChange = data['preventEnterKeyItemChange'];
	}
	
	bbDateChange(event: any)
	{
		// Clear pendingClickTarget so that completeFieldChange() does not re-trigger
		// the datepicker-toggle click after item change, which would reopen the calendar.
		this.pendingClickTarget = null;
		let fldValue = event.value;
		let id = event.id.split('.')
		let formNo = id[1];
		let fldName = id[2];
		// Update allformValues with the selected date so that buildChgStr picks up the current value in chg_str
		let detailNo = 'Detail' + formNo;
		if(formNo == '1' && this.allformValues)
		{
			this.allformValues[fldName] = fldValue;
		}
		else if(this.allformValues[detailNo] && this.allformValues[detailNo][0])
		{
			this.allformValues[detailNo][0][fldName] = fldValue;
		}
		// this.callLocalItemChange(fldName, fldValue, formNo)
		this.getFieldItemChange(fldName,fldValue,'1',formNo,0);
	}

	validateDateOnBlur(value: string, id: string, displayLabel?: string)
	{
		if(!value) return;
		let	fieldID = id.split('.');
		let	formNo = fieldID[0];
		let	domId = fieldID[1];
		let	fieldName = fieldID[2];
		const isValidDate = this.isValidDate(value);
		let elem: any = document.getElementById(id);
		let fieldLabel = elem.getAttribute('data-placeholder');
		if (fieldLabel && fieldLabel.includes(":")) 
		{
			fieldLabel = fieldLabel.substring(0, fieldLabel.indexOf(":"));
		} 
		else if (displayLabel && displayLabel.includes(":")) 
		{
			displayLabel = displayLabel.substring(0, displayLabel.indexOf(":"));
		}
										
		if(value && !isValidDate)
		{	
			let msg = fieldLabel ? fieldLabel +' having invalid date, please input a valid date' : displayLabel +' having invalid date, please input a valid date'
			let traceMsg;
			this.bbconfirmBox.alert('Error', msg, traceMsg).subscribe((resp: any) => {
				this._extractTempletService.setLoading(false);
				if (resp) 
				{
					this._extractTempletService.setForcedSave(false);
					this.setFocusOnError(formNo, '', domId, fieldName);
					return;
				}
			});
		}
	}

	isValidDate(dateStr: string): boolean
	{
		if(!dateStr) return true;
		let applDateFormat: any = localStorage.getItem("APPL_DATE_FORMAT");
		if(!applDateFormat) return true;
		applDateFormat = applDateFormat.toUpperCase();
		let parsedDate = moment(dateStr, applDateFormat, true);
		return parsedDate.isValid();
	}

	bbSetFocusOnError(event: any)
	{
		let formNo = event.formNo
		let domID = event.domId
		let fieldName = event.fieldName
		this.setFocusOnError(formNo, '', domID, fieldName);
	}

	bbSetForceSave(isForceSaved: boolean)
	{
		this._extractTempletService.setForcedSave(isForceSaved);
	}

	private widthCache: Map<any, string> = new Map();

	calculateWidth(width: any)
	{
		if (this.widthCache.has(width)) return this.widthCache.get(width)!;
		let result = (parseInt(width) + 25) + 'px';
		this.widthCache.set(width, result);
		return result;
	}

	calculateWidthOthers(width: any)
	{
		if (this.widthCache.has(width)) return this.widthCache.get(width)!;
		let result = (parseInt(width) + 25) + 'px';
		this.widthCache.set(width, result);
		return result;
	}

	createObjArray(formNo: any, beanGrpObj: any)
	{
		if(this.columnsObjArray && this.columnsObjArray[formNo] && this.columnsObjArray[formNo].length > 0)
		{
			this.columnsObjArray[formNo].push(beanGrpObj);
		}
		else
		{
			this.columnsObjArray[formNo] = [];
			this.columnsObjArray[formNo][0] = beanGrpObj;
		}		
	}

	sortJsonArray(jsonArray: any) 
	{
		return jsonArray.sort((a: any, b: any) => {
			if (parseInt(a.yCordinate) !== parseInt(b.yCordinate)) 
			{
				return parseInt(a.yCordinate) - parseInt(b.yCordinate);
			}
			return parseInt(a.xCordinate) - parseInt(b.xCordinate);
		});
	}

	determineInputType(colNodeObj: any): string 
	{
		if (colNodeObj && colNodeObj.editStyle && colNodeObj.editStyle === 'ddlb') 
		{
			return 'ddlb';
		} 
		else if (colNodeObj && colNodeObj.format && (colNodeObj.format === '[shortdate] [time]' || colNodeObj.format === 'dd/mm/yy'))
		{
			return 'date';
		} 
		else if (colNodeObj && colNodeObj.dataType && (colNodeObj.dataType === 'decimal' || colNodeObj.dataType === 'number'))
		{
			return 'number';
		} 
		else
		{
			return 'text';
		}
	}

	clearDisabledFieldCache()
	{
		this.disabledFieldCache.clear();
	}

	isFieldDisabled(fieldName: string, colNode: any, formNo: any, index: any): boolean
	{
		const cacheKey = fieldName + '_' + formNo + '_' + index;
		const cached = this.disabledFieldCache.get(cacheKey);
		if (cached !== undefined) return cached;

		let detailNo = 'Detail'+formNo;
		if (this.editFlag === 'V')
		{
			this.disabledFieldCache.set(cacheKey, true);
			return true;
		}
		let isProtected = false;
		if(this.allformValues && this.allformValues[detailNo] && this.allformValues[detailNo][index])
		{
			let protectField = this.allformValues[detailNo][index][fieldName + '_protect'];
			isProtected = (protectField && protectField === '1');
		}
		const isTabDisabled = (colNode?.tab === '32766');

		let isColNodeDisabled = false;
		if(this.editFlag == 'E' && isColNodeDisabled)
		{
			isColNodeDisabled = true;
		}
		else
		{
			isColNodeDisabled = !!colNode?.disabled;
		}

		const result = (isProtected || isTabDisabled || isColNodeDisabled);
		this.disabledFieldCache.set(cacheKey, result);
		return result;
	}

	expandGroupsBoxOnError(elem: HTMLElement) 
	{  
		let parentElem = elem.closest('.e12GroupBox') as HTMLElement;
		let childElem = elem.closest('.collapseGroupBoxChild') as HTMLElement;
	
		if (parentElem?.classList.contains('collapseGroupBox')) 
		{
			parentElem.classList.remove('collapseGroupBox');
			parentElem.classList.add('expandGroupBox');
		}
	
		if (childElem?.classList.contains('collapseGroupBoxChild')) 
		{
			childElem.classList.remove('collapseGroupBoxChild');
			childElem.classList.add('expandGroupBoxChild');
			childElem.classList.replace('freeFormContentOneColumn', 'freeFormContentThreeColumn');
		}
	}

	expandFeedGroupsBoxOnError(elem: HTMLElement) 
	{
	
		let parentElem = elem.closest('.bb-feed-collapseGroupBox') as HTMLElement;
		let childElem = elem.closest('.bb-feed-collapseGroupBoxChild') as HTMLElement;
	
		if (parentElem)
		{
			parentElem.classList.remove('bb-feed-collapseGroupBox');
			parentElem.classList.add('bb-feed-expandGroupBox');
		}
	
		if (childElem) 
		{
			childElem.classList.remove('bb-feed-collapseGroupBoxChild');
			childElem.classList.add('bb-feed-expandGroupBoxChild');
		}
	}

	executeServiceHandler4(formNo: any, formDetail: any, eventCode: any,  compType: any, methodName: any, actionId: any, isHeaderActionButton: boolean)
	{
		let action = "";
		let pageContext;
		if(isHeaderActionButton)
		{
			pageContext = "1";
		}
		else 
		{
			pageContext = "2";
		}
        if( this.compData["EDIT_FLAG"] == "E")
        {
            action = "EDIT";
        }
        else if( this.compData["EDIT_FLAG"] == "A" )
        {
            action = "ADD";
        }
		let chgStr = this.getCurrentRowXML(formNo, pageContext, action, false, '', this.currentDomID, isHeaderActionButton);
		let newtempData:any = {};
        newtempData["ACTION"] = "USER_ACTION";
        newtempData["UPDATE_FLAG"] = this.compData["EDIT_FLAG"];
        newtempData["FORM_NO"] = formNo;
        newtempData["PAGE_CONTEXT"] = pageContext;
        newtempData["OBJ_NAME"] = this.compData["OBJ_NAME"];
        newtempData["SERVICE_HANDLER"] = "4";
        newtempData["EVENT_CODE"] = eventCode;
        newtempData["COMP_TYPE"] = compType;
        newtempData["COMP_NAME"] = this.compData["OBJ_NAME"];
        newtempData["METHOD_NAME"] = methodName;
        newtempData["REF_ID"] = "";
        newtempData["EDITOR_ID"] = this.compData["EDITOR_ID"];
        newtempData["CHG_STR"] = chgStr;
        newtempData["INTERFACE"] = "MOBILE";
        newtempData["dummyInt"] = this.compData['dummyInt'];
        newtempData['RETURN_TYPE'] = "json";
       	let paramString = this._extractTempletService.getEncodedParamString(newtempData);
        let url = this._extractTempletService.getHostURL() + '/ibase/WebITMRequestHandlerServlet';
        this._extractTempletService.setLoading(true);
		this._extractTempletService.sendRequest(url, paramString, (data:any) => {
            this._extractTempletService.setLoading(false);
            console.log('executeServiceHandler4 raw response:', data);
            try
            {
				if(data && data.includes('%%SEP%%'))
				{
					let callbackRespNew = data.split('%%SEP%%');
					data = callbackRespNew[0].trim();
					let isError = callbackRespNew[1].trim();
					if (!(isError == 'true'))
					{
						if (!data || data.length === 0) {
							console.warn('executeServiceHandler4: empty response data before %%SEP%%');
							this.bbconfirmBox.alert('Error', 'No Data Found', '').subscribe((resp: any) => {});
							return "";
						}
						let detailDataRes = JSON.parse(data);
						if(detailDataRes && !detailDataRes?.Root)
						{
							this.bbconfirmBox.alert('Error', 'No Data Found', '').subscribe((resp: any) => {});
							return "";
						}
						if( data.includes("No Records Found"))
						{
							return "";
						}
						else
						{
							this._extractTempletService.checkErrorException(data, (res: any) => {
								if (!res) 
								{
									this.gridData['formDetail'] = formDetail;
									this.gridData['Action'] = 'Default';
									let actionResponseNew = {} = JSON.parse(data);
									this.gridData['CurrentFormData'] = actionResponseNew;
									this.gridData['isError'] = false;
									this.openOverlayForAgGrid();
								}
							});
						}
					}
				}
            }
            catch(error)
            {
                console.log('Error inside executeServiceHandler4 response Error',error);
            }
        });
    }

	openOverlayForAgGrid()
	{
		if (this.overLayForAgGridView)
		{
			this.overLayForAgGridView.dispose();
		}
		const config = this.getOverlayConfig();
		this.overLayForAgGridView = this.overlay.create(config);
		const popupTemp = new TemplatePortal(this.openAgGrid, this.viewContainerRef);
		this.overLayForAgGridView.attach(popupTemp);
		this.fixOverlayZIndex(this.overLayForAgGridView);
	}

	onClose(event: any)
	{
		if(event)
		{
			if (this.overLayForAgGridView) 
			{
				this.overLayForAgGridView.dispose();
			}
			if(this.viewContainerRef)
			{
				this.viewContainerRef.clear();
			}
		}
	}

	onAgGridDone(event: any)
	{
		let agGridData = event;
		// console.log('print agGridData 7304:::::',agGridData);
		if(agGridData && agGridData['SELECTED_ROWS'])
		{
			let formDetail = 'Detail'+ agGridData['FORM_NO'];
			let index = agGridData['INDEX'];
			let pageContext = "1";
			let keyValue = "1";
			let action = "ADD";
			let eventCode = agGridData['EVENT_CODE'];
			let compType = agGridData['COMP_TYPE'];
			let methodName = agGridData['METHOD_NAME'];
			if(this.allformValues && this.allformValues[formDetail] && this.allformValues[formDetail][index] && this.allformValues[formDetail][index]['domID'])
			{
				keyValue = this.allformValues[formDetail][index]['domID'];
			}
			if( this.compData["EDIT_FLAG"] == "E")
			{
				if(this.isHeaderActionButton)
				{
					pageContext = "1";
				}
				else 
				{
					pageContext = "2";
				}
				action = "EDIT";
			}

			let chgStr = "<?xmlversion='1.0'encoding='utf-8'?><Root>";
			chgStr = chgStr + "<header>";
			chgStr = chgStr + "<objName><![CDATA[" + this.compData["OBJ_NAME"] + "]]></objName>";
			chgStr = chgStr + "<pageContext><![CDATA[" + pageContext + "]]></pageContext>";
			chgStr = chgStr + "<objContext><![CDATA[" + agGridData['FORM_NO'] +"]]></objContext>";
			chgStr = chgStr + "<editFlag><![CDATA[" + "E" + "]]></editFlag>";
			chgStr = chgStr + "<focusedColumn><![CDATA[]]></focusedColumn>";
			chgStr = chgStr + "<elementName><![CDATA[]]></elementName>";
			chgStr = chgStr + "<keyValue><![CDATA["+ keyValue +"]]></keyValue>";
			chgStr = chgStr + "<taxKeyValue><![CDATA[]]></taxKeyValue>";
			chgStr = chgStr + "<saveLevel><![CDATA[0]]></saveLevel>";
			chgStr = chgStr + "<forcedSave><![CDATA[false]]></forcedSave>";
			chgStr = chgStr + "<taxInFocus><![CDATA[false]]></taxInFocus>";
			chgStr = chgStr + "<action><![CDATA["+ action +"]]></action>";
			chgStr = chgStr + "</header>";
			for(let i=0 ; i < agGridData['SELECTED_ROWS'].length; i++)
			{
				chgStr = chgStr + "<Detail>";
				chgStr = chgStr + "<checkBox>true</checkBox>";
				let selectedRowJson = agGridData['SELECTED_ROWS'][i];
				for(const key of Object.keys(selectedRowJson))
				{
					let value = selectedRowJson[key];

					if (value == null)
					{
						value = '';
					}

					chgStr = chgStr + "<"+ key +"><![CDATA["+ value +"]]></"+ key +">";
				}
				chgStr = chgStr + "</Detail>";
			}
			chgStr = chgStr + "</Root>";
			let newTempData: any = {};
			newTempData['ACTION'] = "USER_ACTION_SET_DATA";
			newTempData['FORM_NO'] = agGridData['FORM_NO'];
			newTempData['OBJ_NAME'] = this.compData["OBJ_NAME"];
			newTempData['PAGE_CONTEXT'] =  this.isHeaderActionButton? "1" : "2";
			newTempData['SERVICE_HANDLER'] = "4";
			newTempData['EVENT_CODE'] = eventCode;
			newTempData['COMP_TYPE'] = compType;
			newTempData['COMP_NAME'] = this.compData["OBJ_NAME"];
			newTempData['METHOD_NAME'] = methodName;
			newTempData['REF_ID'] = "";
			newTempData['EDITOR_ID'] = this.compData['EDITOR_ID'];
			newTempData['CHG_STR'] = chgStr;
			newTempData['INTERFACE'] = "MOBILE";
			newTempData['dummyInt'] = this.compData['dummyInt'];
			newTempData['RTEURN_TYPE'] = "json";
			let paramString = this._extractTempletService.getEncodedParamString(newTempData);
			let url = this._extractTempletService.getHostURL() + '/ibase/WebITMRequestHandlerServlet';
			if (this.overLayForAgGridView) 
			{
				this.overLayForAgGridView.dispose();
			}
			if(this.viewContainerRef)
			{
				this.viewContainerRef.clear();
			}
			this._extractTempletService.setLoading(true);
			this._extractTempletService.sendRequest(url, paramString, (data:any) => {
				this._extractTempletService.setLoading(false);
				try 
				{
					if(data && data.includes('%%SEP%%'))
					{
						let callbackRespNew = data.split('%%SEP%%');
						data = callbackRespNew[0];
						let isError = callbackRespNew[1].trim();
						if (!(isError == 'true')) 
						{
							let tempJsonData = JSON.parse(data);
							if(tempJsonData && tempJsonData['DocumentRoot'] && tempJsonData['DocumentRoot']['group0'] && tempJsonData['DocumentRoot']['group0']['Header0'] && tempJsonData['DocumentRoot']['group0']['Header0'][formDetail] && tempJsonData['DocumentRoot']['group0']['Header0'][formDetail].length > 0)
							{
								this.allformValues[formDetail] = [];
								for(let i = 0 ; i < tempJsonData['DocumentRoot']['group0']['Header0'][formDetail].length; i++)
								{
									let jsonData = tempJsonData['DocumentRoot']['group0']['Header0'][formDetail][i];
									let tempAllFormJsonData: any = {};
									for(let key of Object.keys(jsonData))
									{
										if(jsonData[key] && jsonData[key]['protect'])
											{
												tempAllFormJsonData[key+"_protect"] = jsonData[key]['protect'];
											}
											else
											{
												tempAllFormJsonData[key+"_protect"] = "0";
											}
											if(jsonData[key] && jsonData[key]['visible'])
											{
												tempAllFormJsonData[key+"_visible"] = jsonData[key]['visible'];
											}
											else
											{
												tempAllFormJsonData[key+"_visible"] = "";
											}
											if(jsonData[key] && jsonData[key]['content'] != undefined && jsonData[key]['content'] != null)
											{
												tempAllFormJsonData[key] = jsonData[key]['content'];
											}
											else
											{
												if(jsonData[key] && jsonData[key]['id'] != undefined && (jsonData[key]['content'] == undefined || jsonData[key]['content'] == null))
												{
													tempAllFormJsonData[key] = "";
												}
												else if(jsonData[key] && typeof jsonData[key] == 'object' && (jsonData[key]['content'] == undefined || jsonData[key]['content'] == null))
												{
													tempAllFormJsonData[key] = "";
												}
												else
												{
													tempAllFormJsonData[key] = jsonData[key];
												}
											}
										}
										this.allformValues[formDetail].push(tempAllFormJsonData);
								}
								// console.log('print this.allformValues 7478:::::::',JSON.stringify(this.allformValues));
							}
							else if(tempJsonData && tempJsonData['DocumentRoot'] && tempJsonData['DocumentRoot']['group0'] && tempJsonData['DocumentRoot']['group0']['Header0'] && tempJsonData['DocumentRoot']['group0']['Header0'][formDetail] && typeof tempJsonData['DocumentRoot']['group0']['Header0'][formDetail] == 'object')
							{
								this.allformValues[formDetail] = [];
								let jsonData = tempJsonData['DocumentRoot']['group0']['Header0'][formDetail];
								let tempAllFormJsonData: any = {};
								for(let key of Object.keys(jsonData))
								{
									if(jsonData[key] && jsonData[key]['protect'])
									{
										tempAllFormJsonData[key+"_protect"] = jsonData[key]['protect'];
									}
									else
									{
										tempAllFormJsonData[key+"_protect"] = "0";
									}
									if(jsonData[key] && jsonData[key]['visible'])
									{
										tempAllFormJsonData[key+"_visible"] = jsonData[key]['visible'];
									}
									else
									{
										tempAllFormJsonData[key+"_visible"] = "";
									}
									if(jsonData[key] && jsonData[key]['content'] != undefined && jsonData[key]['content'] != null)
									{
										tempAllFormJsonData[key] = jsonData[key]['content'];
									}
									else
									{
										if(jsonData[key] && jsonData[key]['id'] != undefined && (jsonData[key]['content'] == undefined || jsonData[key]['content'] == null))
										{
											tempAllFormJsonData[key] = "";
										}
										else if(jsonData[key] && typeof jsonData[key] == 'object' && (jsonData[key]['content'] == undefined || jsonData[key]['content'] == null))
										{
											tempAllFormJsonData[key] = "";
										}
										else
										{
											tempAllFormJsonData[key] = jsonData[key];
										}
									}
								}
								this.allformValues[formDetail].push(tempAllFormJsonData);
								// console.log('print this.allformValues 7706:::::::',JSON.stringify(this.allformValues));
							}
						}
					}
				}
				catch(e)
				{
					console.log('Exception inside onAgGridDone::::',e);
				}
			});
		}
	}

	setSimpleLayoutDetailData(title: any, data1: any, procResp: any)
	{
		let formNo = this.currentFormNo
		let paramMap: any = {};
		paramMap["ACTION"] = "SET_DETAIL_DATA";
		paramMap["XML_STR"] = this.getVisionAsstXML(formNo, data1)
		paramMap["OBJ_CTXT"] = formNo;
		paramMap["OBJ_NAME"] = this.compData['OBJ_NAME']
		paramMap["CORE_MDL_ID"] = this.editorId
		paramMap["FORCED_SAVE"] = false;
		paramMap["PK_VALUES"] = "";
		paramMap['RTEURN_TYPE'] = "json";
		let paramString = this._extractTempletService.getEncodedParamString(paramMap);
		let url = this._extractTempletService.getHostURL() + '/ibase/WebITMRequestHandlerServlet';
		this._extractTempletService.setLoading(true);
		this._extractTempletService.sendRequest(url, paramString, (res: any) => {
			this._extractTempletService.setLoading(false);
			try 
			{
				if(res && res.includes('%%SEP%%'))
				{
					let callbackRespNew = res.split('%%SEP%%');
					res = callbackRespNew[0];
					// console.log("res ::: ",res)
					let isError = callbackRespNew[1].trim();
					let formDetail = "Detail" + formNo;
					if(!(isError == 'true'))
					{
						let tempJsonData = JSON.parse(res);
						if(tempJsonData && tempJsonData['DocumentRoot'] && tempJsonData['DocumentRoot']['group0'] && tempJsonData['DocumentRoot']['group0']['Header0'] && tempJsonData['DocumentRoot']['group0']['Header0'][formDetail] && tempJsonData['DocumentRoot']['group0']['Header0'][formDetail].length > 0)
						{
							if (this.allformValues && this.allformValues[formDetail]) 
							{
								this.allformValues[formDetail] = [];
							}
							for(let i = 0 ; i < tempJsonData['DocumentRoot']['group0']['Header0'][formDetail].length; i++)
							{
								let tempJson = tempJsonData['DocumentRoot']['group0']['Header0'][formDetail][i];
								let jsonData: any = {};
								for(let key in tempJson)
								{
									if(tempJson.hasOwnProperty(key))
									{	
										if (tempJson[key] && typeof tempJson[key] === 'object') 
										{
											if(tempJson[key].hasOwnProperty('content'))
											{
												jsonData[key] = tempJson[key].content;
											}
											else 
											{
												jsonData[key] = "";
											}
										} 
										else 
										{
											if(tempJson[key] != null && tempJson[key] != 'null' && tempJson[key] != undefined)
											{
												jsonData[key] = tempJson[key];
											}
											else 
											{
												jsonData[key] = ""
											}
					
										}
									}
								}
								this.allformValues[formDetail].push(jsonData);
							}
							// console.log('print this.allformValues 7599:::::::',JSON.stringify(this.allformValues));
						}
					}
				}
			}
			catch(e)
			{
				console.log('Exception inside setSimoleLayoutDetailData::::',e);
			}
		})
		
	}

	setSimpleLayoutFreeFormData(title: any, data: any, procResp: any)
	{
		console.log('[setSimpleLayoutFreeFormData] called with data type:', typeof data);
		console.log('[setSimpleLayoutFreeFormData] data:', data);
		let itemChnageValues:any = {};
		try
		{
		    if (data.indexOf('Errors') != -1)
			{
				console.log('[setSimpleLayoutFreeFormData] Errors found, calling checkError');
				this.checkError(data);
			}
			else 
			{
				let currentFormNoDetail = 'Detail' + this.currentFormNo;
				for(let i = 0; i < data.length; i++)
				{
					let details = data[i];
					if(details)
					{
						itemChnageValues = details;
						for (const objKey of Object.keys(itemChnageValues)) 
						{
							let key = objKey.toLowerCase().replace(/ /g, '_');
							if (itemChnageValues[objKey] && itemChnageValues[objKey].protect)
							{
								if(itemChnageValues[objKey].protect.toString() == "")
								{
									this.allformValues[key+'_protect'] = "0";
								}
								else
								{
									this.allformValues[key+'_protect'] = itemChnageValues[objKey].protect.toString();
								}
							}
							else
							{
								this.allformValues[key+'_protect'] = "0";
							}
							if (itemChnageValues[objKey] && itemChnageValues[objKey].visible)
							{
								this.allformValues[key+"_visible"] = itemChnageValues[objKey].visible.toString();
							}
							else
							{
								this.allformValues[key+"_visible"] = "";
							}
							if (itemChnageValues[objKey] && (itemChnageValues[objKey].content || itemChnageValues[objKey].content == 0)) 
							{
								let value = itemChnageValues[objKey].content;
								if(value == null || value == undefined)
								{
									this.allformValues[currentFormNoDetail][this.selectedDetailRowIndex][key] = "";
								}
								else
								{
									this.allformValues[currentFormNoDetail][this.selectedDetailRowIndex][key] = value;
								}
							}
							else
							{
								let value = itemChnageValues[objKey];
								if (key === 'attribute' && value && value instanceof Object)
								{
									value = JSON.stringify(value);
								}
								else if (value && value instanceof Object)
								{
									value = "";
								}

								if(value == null || value == undefined)
								{
									this.allformValues[currentFormNoDetail][this.selectedDetailRowIndex][key] = "";
								}
								else
								{
									this.allformValues[currentFormNoDetail][this.selectedDetailRowIndex][key] = value;
								}
							}
						}
					}
				}
			}
		}
		catch
		{
			console.log('Exception inside SetSimpleLayoutFreeDormData ::');
		}
	}

	getVisionAsstXML(formNo: any, data: any)
	{
		const excludeKeys = ['user_msg', 'invoke_sale_order', 'bis_intent_id', 'identity', 'is_browser', 'user_id', 'uuid'];
		let chgstr = `<DocumentRoot><description>Datawindow Root</description><group0><description>Group0 description</description><Header0><description>Header0 members</description>`;
		for(let i = 0; i < data.length; i++)
		{
			let strData = data[i]
			chgstr += `<Detail` + formNo + ` dbID='' domID='' objContext='` + formNo + `' objName='sorder'><attribute pkNames='' selected='N' status='N' updateFlag='A' />`;
			for(const objKey of Object.keys(strData))
			{
				if (!excludeKeys.includes(objKey.toLowerCase())) 
				{
					let key = objKey.toLowerCase();
					key = key.replace(/\s+/g, '_');
					chgstr += "<"+ key +">";
					if(strData[objKey] != null)
					{
						chgstr += `<![CDATA[`+ strData[objKey] + `]]>`;
					}
					else 
					{
						chgstr += `<![CDATA[]]>`;
					}
					chgstr += `</`+key+`>`;
				}
			}
			chgstr += `</Detail` + formNo + `>`;
		}
		chgstr += `</Header0></group0></DocumentRoot>`;
		// console.log("getVisionAsstXML str 7202 ::: ",chgstr)
		return chgstr;
	}
	
	bbDateBlur(event)
	{
		// Clear pendingClickTarget so that completeFieldChange() does not re-trigger
		// the datepicker-toggle click after item change, which would reopen the calendar.
		this.pendingClickTarget = null;
		let fldValue = event.fldValue;
		let id = event.id.split(/[\.-]/)
		let formNo = id[0].match(/\d+/)[0];
		let domId = id[1];
		let fieldName = id[2];
		if(fldValue == null)
		{
			fldValue = '';
		}
		// Update allformValues with the selected date so that buildChgStr picks up the current value in chg_str
		let detailNo = 'Detail' + formNo;
		if(formNo == '1' && this.allformValues)
		{
			this.allformValues[fieldName] = fldValue;
		}
		else if(this.allformValues[detailNo] && this.allformValues[detailNo][0])
		{
			this.allformValues[detailNo][0][fieldName] = fldValue;
		}
		// this.callLocalItemChange(fieldName, fldValue, formNo);
		this.getFieldItemChange(fieldName,fldValue,domId,formNo,0);
	}

	closeRowCountPopup(event)
	{
		let data = event;
		let formNo = data['FORM_NO']
		this.openRowCount[formNo] = data['openRowCount'];
	}

	ngOnDestroy() {
		// document.removeEventListener('click', this.onClick);
    	document.removeEventListener('keydown', this.onKeyDown);
		if(this.viewContainerRef)
		{
			this.viewContainerRef.clear();
		}
		if(this.bbconfirmBox && this.bbconfirmBox.alert)
		{
			this.bbconfirmBox.alert.unsubscribe();
		}

		if(this._extractTempletService && this._extractTempletService.getUserInfo())
		{
			this._extractTempletService.getUserInfo().unsubscribe();
		}
		
    }

	isDateString(value: string): boolean 
	{
		const datePattern = /^\d{2}\/\d{2}\/\d{2}$/;
		return datePattern.test(value);
	}
	  
	convertStringToDate(value: string): Date 
	{
		let newarrayDate = value.split('/');
		let newvalidDate = newarrayDate[1] + '/' + newarrayDate[0] + '/' + newarrayDate[2];
		let newDate =  new Date(newvalidDate);
		return newDate;
		
	}

	checkIsDateFormat(key: any, formNo: any): boolean
	{
		const form = this.formWiseFormatJson[formNo];
		if(!form)
		{
			return false;
		}
		
		const format = form[key];

		if(!format)
		{
			return false;
		}

		const dateFormats = ['dateBox', '[shortdate] [time]', 'dd/mm/yy', 'datetime'];
		
		return dateFormats.includes(format);
	}

	setAllFormValuesJson(formNo: any, domID: any, signalName: any,  event: any)
  	{
		if(event )
		{
			let value: any;
			if(event['input'] && event['input'].value != undefined)
			{
				value = event['input'].value;
			}
			else if(event['target'] && event['target'].value != undefined)
			{
				value = (event.target as HTMLInputElement).value;
			}
			// If value could not be extracted from event (e.g. DOM element lost in JSON serialization),
			// skip the update — the feed view's [(ngModel)] already updated allformValues via the same object reference
			if(value === undefined)
			{
				return;
			}
			console.log('print signalName:::::',signalName);
			// For date fields, ngModel already has the correct Date object -
			// do not overwrite it with a string from event.target.value
			if(signalName && signalName.includes('_date') && this.checkIsDateFormat(signalName, formNo))
			{
				return;
			}
			if(formNo == '1')
			{
				if(value != undefined)
				{
					this.allformValues[signalName] = value;
				}
			}
			else
			{
				let detailFormNo = 'Detail' + formNo;
				if(this.allformValues[detailFormNo] && this.allformValues[detailFormNo].length > 0)
				{
					// Find the correct row by matching domID instead of using domID as array index
					let rowIndex = this.allformValues[detailFormNo].findIndex((row: any) => row && row.domID == domID);
					if(rowIndex >= 0)
					{
						this.allformValues[detailFormNo][rowIndex][signalName] = value;
					}
				}
			}
		}
  	}
  	
  	isMandatoryFieldExist(formNo: string | number, fieldName: string) : boolean
	{
		if(this.formWiseRequiredFieldsJson[formNo] && this.formWiseRequiredFieldsJson[formNo]?.includes(fieldName))
		{
			// console.log("ismandatoryfield true :: ")
			return true;
		}
		else 
		{
			return false;
		}
	}

	parseCustomDateFormat(fldValue: string): Date
	{	
		let date;
		const [datePart, timePart] = fldValue.split(" ");
		const finalTimePart = timePart ? timePart : "00:00:00";
		const [day, month, year] = datePart.split("/");
		const formattedDate = `20${year}-${month}-${day}T${finalTimePart}`;
		date = new Date(formattedDate);
		return date;
	}

	formatDate(dateVal: string | Date): string
	{
		const date = dateVal instanceof Date ? dateVal : new Date(dateVal);

		let value;

		value = this.datePipe.transform(date, 'dd/MM/yy HH:mm:ss');

		let val = value;
		if (val && val.endsWith('00:00:00')) 
		{
			value = val.substring(0, 8);
		}

		return value;
	}

	checkMaxLengthForNum(event: any, maxlength: any)
    {
        let input = event.target as HTMLInputElement;

        let max = maxlength;
        let value = input.value;
        if(max > 0 && value.length > max)
        {
            input.value = value.slice(0, max);
        }
    }

	onSelectionChange(fldName: any, fldValue: any, formNo: any, event?: any)
	{
		if(event && event.value)
		{
			let selectedDdlbVal = event.value; 
			if(selectedDdlbVal)
			{
				this.allformValues[fldName] = signal('');
				this.allformValues[fldName] = selectedDdlbVal;
				// this.callLocalItemChange(fldName, selectedDdlbVal, formNo);
				this.getFieldItemChange(fldName,fldValue,this.currentDomID,formNo,0);
			}
		}
	}
	
	buildObjFormDetailsJson(objMetadata) 
	{
		console.log('print objMetadata 8118:::::',objMetadata);
		let objFormDetJson = {};
		// Loop through each form model
		if (objMetadata && objMetadata.data && objMetadata.data.sql_models) 
		{
			objMetadata.data.sql_models.forEach((form) => {
				let actionDataJson: any = {};
				if(form && form.sql_model && form.sql_model.columns)
				{
					let formDetails = {
						formTitle: form.sql_model.form_title,
						formNo: form.sql_model.form_no,
						groups: {}
					};
					// Sort columns by tabsequence
					/* let sortedColumns = form.sql_model.columns.sort((a, b) => {
						return a.column.tabsequence - b.column.tabsequence;
					}); */

					// action data
					let formNum = form.sql_model.form_no;
					const actionData = form.sql_model.actions || [];
					actionDataJson[formNum] = actionData.filter((action: any) => action.page_context != null && action.page_context === 1);
					this.filteredActionArrayForForms[formNum] = [];
					this.filteredActionArrayForForms[formNum] = actionDataJson[formNum];

					let sortedColumns = form.sql_model.columns.sort((a, b) => {
						// Ensure the x and y values are integers
						let aX = parseInt(a.column.x, 10);
						let bX = parseInt(b.column.x, 10);
						let aY = parseInt(a.column.y, 10);
						let bY = parseInt(b.column.y, 10);
	
						// First, sort by 'y' (vertical position)
						if (aY !== bY) {
							return aY - bY;
						}
						// If 'y' is the same, then sort by 'x' (horizontal position)
						return aX - bX;
					});
					// console.log('print sortedColumns 8229:::::',sortedColumns);
					// Group columns by their group_name
					// form.sql_model.columns.forEach((col) => {
					sortedColumns.forEach((col) => {
						let groupName = col.column.group_name || 'Uncategorized';
		
						if (!formDetails.groups[groupName]) {
							formDetails.groups[groupName] = {
								grpNodeObj: {
									text: groupName
								},
								grpBox_contents: []
							};
						}
		
						let columnDetails = {};
						if(col.column.alignment)
						{
							columnDetails['alignment'] = col.column.alignment;
						}
						if(col.column.name)
						{
							columnDetails['name'] = col.column.name;
						}
						if(col.column.table_display_name)
						{
							columnDetails['displayLabel'] = col.column.table_display_name;
							// Populate labelMapData for ddlb label rendering in header form
							if(this.labelMapData instanceof Map)
							{
								this.labelMapData.set(col.column.name + '_t', col.column.table_display_name);
							}
						}
						else
						{
							columnDetails['displayLabel'] = '';
						}
						if(col.column.edit_mask.mask)
						{
							columnDetails['editStyle'] = col.column.edit_mask.mask;

							// Populate optionsMap for dropdown fields
							if(col.column.edit_mask.mask === 'ddlb' && col.column.edit_mask.values && col.column.edit_mask.values.length > 0)
							{
								const resultMap = new Map();
								for(const item of col.column.edit_mask.values)
								{
									resultMap.set(item.data, item.display);
								}
								if(this.optionsMap instanceof Map)
								{
									this.optionsMap.set(col.column.name, resultMap);
								}
							}
						}
						if(col.column.format)
						{
							columnDetails['format'] = col.column.format;
						}
						if(col.column.mandatory)
						{
							columnDetails['required'] = col.column.mandatory;
						}
						if(col.column.tabsequence)
						{
							columnDetails['tab'] = col.column.tabsequence;
							if("32766"=== col.column.tabsequence )
							{ 
								columnDetails['disabled'] = true;
							}
							else
							{
								columnDetails['disabled'] = false;
							}
						}
						if(col.column.hidden)
						{
							if(col.column.hidden == "0")
							{
								columnDetails['isVisible'] = "1";
							}
							else
							{
								columnDetails['isVisible'] = "0";
							}
							
						} 
						if ( "chg_user" === col.column.name || "chg_term" === col.column.name || "add_date" === col.column.name || "add_user" === col.column.name ||  "add_term" === col.column.name) 
						{
							columnDetails['isVisible'] = "0";
						}
						if(col.column.db_size)
						{
							columnDetails['limit'] = col.column.db_size;
						}
						if(col.column.col_type)
						{
							columnDetails['dataType'] = col.column.col_type;
						}
						if(col.column.x)
						{
							columnDetails['xCordinate'] = col.column.x;
						}
						if(col.column.x)
						{
							columnDetails['yCordinate'] = col.column.y;
						}
						if(col.column.width)
						{
							columnDetails['width'] = col.column.width;
						}
						if(col.column.height)
						{
							columnDetails['height'] = col.column.height;
						}
						if(col.column.lookup)
						{
							this.popHelpFieldList.push(col.column.name);
							this.popHelpFieldSet.add(col.column.name);
							columnDetails['popHelp'] = 'true';
							// Populate pophelpDataMap with lookup data for openPopHelp SQL_INPUT
							if(!this.pophelpDataMap.has(col.column.name))
							{
								this.pophelpDataMap.set(col.column.name, {
									attrib: {
										'@FIELD_NAME': col.column.name,
										'@SQL_INPUT': typeof col.column.lookup === 'string' ? col.column.lookup : ''
									}
								});
							}
						}
						// formDetails.groups[groupName].grpBox_contents[col.column.name+"_"+col.column.tabsequence] = columnDetails;
						formDetails.groups[groupName].grpBox_contents.push(columnDetails);
						this.createObjArray(form.sql_model.form_no, columnDetails);
					});
		
					// Add the form details to the final object, using formNo as key
					objFormDetJson[form.sql_model.form_no] = formDetails;
					objFormDetJson[form.sql_model.form_no]['Title'] = form.sql_model.form_title;
					// console.log('print objFormDetJson 8165::::::',objFormDetJson);
				}
			});
			this.objFormDetailsJson = objFormDetJson;
			// console.log('print this.objFormDetailsJson 8320::::::',this.objFormDetailsJson);
			// actions & links
			// this.getActionLinkData(objMetadata.data.sql_models);
			this.objSqlModelData = objMetadata.data.sql_models;
			this.buildItemChangeColArr();
		}

		// detail form
		for(let formNo = 1; formNo <= this.numOfForms; formNo++)
		{
			if(this.columnsObjArray && this.columnsObjArray[formNo])
			{
				this.finalColumnsObjArray[formNo] = this.sortJsonArray(this.columnsObjArray[formNo]);
				this.formWiseFormatJson = {};
				for(let formNo in this.finalColumnsObjArray )
				{
					let columnObj = this.finalColumnsObjArray[formNo];
					
					this.formWiseFormatJson[formNo] = {};
					this.formWiseRequiredFieldsJson[formNo] = [];
					columnObj.forEach(( col=> {
						if(col.name && col.format)
						{
							this.formWiseFormatJson[formNo][col.name] = col.format;
							// console.log('print formWiseFormatJson 6940::::',this.formWiseFormatJson);
							this.popHelp.formWiseFormatJson = this.formWiseFormatJson;
						}

						if(col.name && col.required)
						{
							const required = col.required?.toString().toLowerCase();
							const isRequired = required === 'true' || required === 'yes';

							if (col.name && isRequired) 
							{
								this.formWiseRequiredFieldsJson[formNo].push(col.name);
								// console.log("formWiseRequiredFieldsJson 111 :: ",this.formWiseRequiredFieldsJson)
							}
						}
					}));
				}
			}
		}
		
		// console.log('print this.finalColumnsObjArray 8369::::::',this.finalColumnsObjArray);

		
		/* if (objMetadata && objMetadata.data && objMetadata.data.sql_models) 
		{
			let detailActionLinkData: any = {};
			let actionDataJson: any = {};
			let linkDataJson: any = {};

			for (let k = 0; k < objMetadata.data.sql_models.length; k++) {
				if (objMetadata.data.sql_models[k] && objMetadata.data.sql_models[k].sql_model && objMetadata.data.sql_models[k].sql_model.actions) {
					let formNum = objMetadata.data.sql_models[k].sql_model.form_no;
					let actionData = objMetadata.data.sql_models[k].sql_model.actions;

					// Filter actions based on page_context === 1
					actionDataJson[formNum] = actionData.filter((action: any) => action.page_context != null && action.page_context === 1);
				}

				if (objMetadata.data.sql_models[k] && objMetadata.data.sql_models[k].sql_model && objMetadata.data.sql_models[k].sql_model.links) {
					let formNum = objMetadata.data.sql_models[k].sql_model.form_no;
					let linksData = objMetadata.data.sql_models[k].sql_model.links;

					// Store the links
					linkDataJson[formNum] = linksData;
				}
			}

			// Organize action and link data
			detailActionLinkData['Action'] = actionDataJson;
			detailActionLinkData['Links'] = linkDataJson;

			let sortedLinkArray: any = [];
			let sortedActionArray: any = [];

			// Sort links by line_no
			sortedLinkArray = _.sortBy(detailActionLinkData['Links'], [function(lin: any) { 
				return parseInt(lin.line_no, 10) || 0; // Default to 0 if line_no is undefined
			}]);

			// Sort actions by line_no
			sortedActionArray = _.sortBy(detailActionLinkData['Action'], [function(f: any) { 
				return parseInt(f.line_no, 10) || 0; // Default to 0 if line_no is undefined
			}]);

			// Combine the sorted link and action arrays
			let objLinkActionArr = sortedLinkArray.concat(sortedActionArray);

			// Final sort by line_no to ensure everything is in order
			objLinkActionArr.sort((a: any, b: any) => {
				let aLineNo = parseInt(a.line_no, 10) || 0;
				let bLineNo = parseInt(b.line_no, 10) || 0;
				return aLineNo - bLineNo;
			});

			// Store the combined sorted array in the component
			this.linksDataForTransaction = objLinkActionArr;
			console.log('Final linksDataForTransaction:', this.linksDataForTransaction);
		} */

		this.cdr.detectChanges();
	}

	getActionLinkData(formNo: any, id:any, domId: any, index: any) 
	{
		if (this.objSqlModelData) 
		{
			let formNumber = formNo.toString();
			this.currentDomID = domId.toString();
			console.log('print this.objSqlModelData 8461:::::::',this.objSqlModelData);
			this.setFocusFormNo(formNumber, id, index);
			let detailActionLinkData: any = {};
			let actionDataJson: any = {};
			let linkDataJson: any = {};

			// Loop through sql_models to extract actions and links
			for (let k = 0; k < this.objSqlModelData.length; k++) 
			{
				let sqlModel = this.objSqlModelData[k]?.sql_model;
				if(sqlModel)
				{
					const formNum = sqlModel.form_no;
					const linkData = sqlModel.links || [];
					const actionData = sqlModel.actions || [];
					actionDataJson[formNum] = actionData
					linkDataJson[formNum] = linkData;
					detailActionLinkData['Action'] = actionDataJson;
					detailActionLinkData['Links'] = linkDataJson;
				}
			}

			// Merge the action and link data
			detailActionLinkData['Action'] = actionDataJson;
			detailActionLinkData['Links'] = linkDataJson;

			// Create a single array combining both links and actions for each form
			let combinedDataArray: any[] = [];

			// Combine links and actions for each form number
			Object.keys(detailActionLinkData['Links']).forEach((formNum: string) => {
				const actionData = detailActionLinkData['Action'][formNum] || [];
				const linkData = detailActionLinkData['Links'][formNum] || [];

				// Add action data and link data to the combined array
				combinedDataArray = combinedDataArray.concat(actionData, linkData);
			});

			// Sort the combined array by line_no
			this.linksDataForTransaction = _.sortBy(combinedDataArray, [(item: any) => parseInt(item.line_no, 10) || 0]);

			console.log('Final linksDataForTransaction 8505:::', JSON.stringify(this.linksDataForTransaction));
			if (document.getElementsByClassName('mat-menu-panel')) 
			{
				if (document.getElementsByClassName('mat-menu-panel').length > 0) 
				{
					if (document.getElementsByClassName('mat-menu-panel')[0]) 
					{
						let elems = document.getElementsByClassName('mat-menu-panel');
						for (let i = 0; i < elems.length; i++) 
						{
							let elem = elems[i] as HTMLElement;
							elem.style.setProperty('margin-left', '-99px', 'important');
						}
					}
				}
			}
			this.cdr.detectChanges();
		}
	}

	buildItemChangeColArr() 
	{
		// console.log('print buildItemChangeColArr this.objSqlModelData 8546:::',this.objSqlModelData);
		if (this.objSqlModelData) 
		{
			let itemChangeColArr: string[] = [];

			for (let i = 0; i < this.objSqlModelData.length; i++) 
			{
				let sqlModel = this.objSqlModelData[i]?.sql_model;
				let itemChgCols: string[] = [];
				if (sqlModel?.columns?.length) 
				{
					for (let j = 0; j < sqlModel.columns.length; j++) 
					{
						let columnData = sqlModel.columns[j];
						if (columnData && columnData.column && columnData.column.item_change) 
						{
							itemChgCols.push(columnData.column.name);
							// console.log('print buildItemChangeColArr itemChgCols 8565:::',itemChgCols);
						}
					}
					if(itemChgCols && itemChgCols.length > 0)
					{
						itemChangeColArr[i] = itemChgCols.join(',');
						// console.log('print buildItemChangeColArr itemChangeColArr[i] 8572:::',itemChangeColArr[i]);
					}
				}
			}
			if(itemChangeColArr)
			{
				this.itemChangeArr = itemChangeColArr;
				console.log('print buildItemChangeColArr this.itemChangeArr 8575:::',this.itemChangeArr);
			}
		}
	}

	@HostListener('mousedown', ['$event'])
	onMouseDownForPendingAction(event: MouseEvent) {
		this.pendingClickTarget = event.target as HTMLElement;
	}

	private waitForPendingFieldChange(): Promise<void> {
		// Action method was reached via click, so the click was NOT swallowed — no need to re-click
		this.pendingClickTarget = null;
		if (this.pendingFieldChangePromise) {
			console.log('[waitForPendingFieldChange] Waiting for pending field change to complete...');
		}
		return this.pendingFieldChangePromise || Promise.resolve();
	}

	private completeFieldChange(): void {
		if (this.pendingFieldChangeResolve) {
			this.pendingFieldChangeResolve();
			this.pendingFieldChangePromise = null;
			this.pendingFieldChangeResolve = null;
		}
		// If the click was swallowed (e.g. loading overlay covered the button),
		// re-trigger it now that the field change is complete
		if (this.pendingClickTarget) {
			const target = this.pendingClickTarget;
			this.pendingClickTarget = null;
			console.log('[completeFieldChange] Re-triggering swallowed click on:', target.tagName, target.id || target.className);
			setTimeout(() => {
				if (document.body.contains(target)) {
					target.click();
				}
			}, 0);
		}
	}

	getFieldItemChange(fldName: any, fldVal: any, domID: any, formNo: any, index: any)
	{
		try
		{
			// Skip if item change is prevented (e.g. autosuggest already triggered item change)
			if(this.isPreventItemChange)
			{
				this.isPreventItemChange = false;
				return;
			}
			if(this.itemChangeArr && this.itemChangeArr.length > 0)
			{
				let curItemChangeList = this.itemChangeArr[formNo - 1];
				if(curItemChangeList && curItemChangeList.includes(fldName))
				{
					let tempParam = {};
					tempParam['OBJ_NAME'] = this.objName;
					tempParam['OBJ_CONTEXT'] = formNo;
					tempParam['PAGE_CTX'] = '2';
					tempParam['CHG_STR'] = this.buildChgStr(formNo,fldName,index);
					tempParam['FIELD_NAME'] = fldName;
					tempParam['EDITOR_ID'] = this.editorId;
					tempParam['DOM_ID'] = domID;
					tempParam['FORM_NO'] = formNo;
					let paramString = this._extractTempletService.getEncodedParamString(tempParam);
					this._extractTempletService.setLoading(true);
					this.pendingFieldChangePromise = new Promise<void>((resolve) => {
						this.pendingFieldChangeResolve = resolve;
					});
					this._extractTempletService.getFieldItemChange( paramString).subscribe({ next: (response:any)=> {
					this._extractTempletService.setLoading(false);
					this._extractTempletService.checkErrorExceptionJson(response, (result:any) =>{
						console.log('getFieldItemChange result::::',result);
							if(result == true && this._extractTempletService.isForceSave())
							{
								console.log('[getFieldItemChange] forceSave is true, resending with FORCESAVE=true');
								let forceParamString = paramString + "&FORCESAVE=true";
								const handleItemChangeForce = (forceResp:any) => {
									this._extractTempletService.setLoading(false);
									this._extractTempletService.checkErrorExceptionJson(forceResp, (forceResult:any) =>{
										if(forceResult == true && this._extractTempletService.isForceSave())
										{
											console.log('[getFieldItemChange] another warning, resending with FORCESAVE=true again');
											this._extractTempletService.setLoading(true);
											this._extractTempletService.getFieldItemChange(forceParamString).subscribe({ next: handleItemChangeForce, error: (err: any) => {
												this._extractTempletService.setLoading(false);
												this.completeFieldChange();
												console.log('getFieldItemChange FORCESAVE retry HTTP error:', err);
											}});
										}
										else if(!forceResult)
										{
											this._extractTempletService.setForcedSave(false);
											this._extractTempletService.setLoading(false);
											// Check if this is Warning Cancel (response still has error data) vs genuine success
											try {
												let respCheck = JSON.parse(forceResp);
												let errorsObj = respCheck?.data?.Root?.Errors;
												if(errorsObj && (errorsObj[1]?.error || errorsObj?.error))
												{
													console.log('[getFieldItemChange] Warning Cancel detected in force handler, focusing on error field');
													let errorData = errorsObj[1]?.error || errorsObj?.error;
													if(errorData && errorData['column_name'])
													{
														let errorColName = errorData['column_name'];
														let objContext = errorData['objContext'] ? errorData['objContext'].trim() : formNo;
														let detailDomId = errorData['detailDomId'] ? errorData['detailDomId'].trim() : null;
														let currentDet = 'Detail' + objContext;
														let focusDomID = detailDomId || domID;
														if(objContext == '1') { focusDomID = this.allformValues['domID']; }
														setTimeout(() => {
															this.setFocusOnError(currentDet, index, focusDomID, errorColName);
														}, 500);
													}
													this.completeFieldChange();
													return;
												}
											} catch(e) {}

											let detailNo: any = 'Detail'+formNo;
											let itmChgResp = JSON.parse(forceResp);
											console.log('getFieldItemChange forceSave itmChgResp::::',itmChgResp);
											if(itmChgResp && itmChgResp.data && itmChgResp.data.Root && itmChgResp.data.Root[detailNo])
											{
												let curFormData = itmChgResp.data.Root[detailNo];
												if(curFormData && typeof curFormData == 'object')
												{
													for(let key of Object.keys(curFormData))
													{
														if(this.allformValues[detailNo])
														{
															if(curFormData[key]['content'] != undefined) {
																let contentVal = curFormData[key]['content'];
																if(contentVal == null) { contentVal = ''; }
																if(key.includes('_date') && contentVal && this.checkIsDateFormat(key, formNo)) {
																	contentVal = this.convertStringToDate(contentVal);
																}
																this.allformValues[detailNo][index][key] = contentVal;
															}
															if(curFormData[key]['protect'] != undefined) { this.allformValues[detailNo][index][key+"_protect"] = curFormData[key]['protect']; }
															if(curFormData[key]['visible'] != undefined) { this.allformValues[detailNo][index][key+"_visible"] = curFormData[key]['visible']; }
														}
														else
														{
															if(curFormData[key]['content'] != undefined) {
																let contentVal3 = curFormData[key]['content'];
																if(contentVal3 == null) { contentVal3 = ''; }
																if(key.includes('_date') && contentVal3 && this.checkIsDateFormat(key, formNo)) {
																	contentVal3 = this.convertStringToDate(contentVal3);
																}
																this.allformValues[key] = contentVal3;
															}
															if(curFormData[key]['protect'] != undefined) { this.allformValues[key+"_protect"] = curFormData[key]['protect']; }
															if(curFormData[key]['visible'] != undefined) { this.allformValues[key+"_visible"] = curFormData[key]['visible']; }
														}
													}
												}
												this.disabledFieldCache.clear();
												this.cdr.detectChanges();
											}
											this.completeFieldChange();
											if (this.focusNextAfterItemChange) {
												this.focusNextAfterItemChange = false;
												this.focusNextEditableField();
											}
										}
										else
										{
											this._extractTempletService.setForcedSave(false);
											this._extractTempletService.setLoading(false);
											try
											{
												let forceRespData = JSON.parse(forceResp);
												let forceErrorData = forceRespData?.data?.Root?.Errors?.[1]?.error;
												if(!forceErrorData)
												{
													forceErrorData = forceRespData?.data?.Root?.Errors?.error;
												}
												if(forceErrorData && forceErrorData['column_name'])
												{
													let errorColName = forceErrorData['column_name'];
													let objContext = forceErrorData['objContext'] ? forceErrorData['objContext'].trim() : formNo;
													let detailDomId = forceErrorData['detailDomId'] ? forceErrorData['detailDomId'].trim() : null;
													let currentDet = 'Detail' + objContext;
													let focusDomID = detailDomId || domID;
													if(objContext == '1')
													{
														focusDomID = this.allformValues['domID'];
													}
													setTimeout(() => {
														this.setFocusOnError(currentDet, index, focusDomID, errorColName);
													}, 500);
												}
											}
											catch(e:any)
											{
												console.log('Exception setting focus on getFieldItemChange force error field:', e.message);
											}
											this.completeFieldChange();
										}
									});
								};
								this._extractTempletService.setLoading(true);
								this._extractTempletService.getFieldItemChange(forceParamString).subscribe({ next: handleItemChangeForce, error: (err: any) => {
									this._extractTempletService.setLoading(false);
									this.completeFieldChange();
									console.log('getFieldItemChange FORCESAVE HTTP error:', err);
								}});
								return;
							}
							else if(!result)
							{
								this._extractTempletService.setLoading(false);
								// Check if this is Warning Cancel (response still has error data) vs genuine success
								try {
									let respCheck = JSON.parse(response);
									let errorsObj = respCheck?.data?.Root?.Errors;
									if(errorsObj && (errorsObj[1]?.error || errorsObj?.error))
									{
										console.log('[getFieldItemChange] Warning Cancel detected, focusing on error field');
										let errorData = errorsObj[1]?.error || errorsObj?.error;
										if(errorData && errorData['column_name'])
										{
											let errorColName = errorData['column_name'];
											let objContext = errorData['objContext'] ? errorData['objContext'].trim() : formNo;
											let detailDomId = errorData['detailDomId'] ? errorData['detailDomId'].trim() : null;
											let currentDet = 'Detail' + objContext;
											let focusDomID = detailDomId || domID;
											if(objContext == '1') { focusDomID = this.allformValues['domID']; }
											setTimeout(() => {
												this.setFocusOnError(currentDet, index, focusDomID, errorColName);
											}, 500);
										}
										this.completeFieldChange();
										return;
									}
								} catch(e) {}

								let detailNo: any = 'Detail'+formNo;
								let itmChgResp = JSON.parse(response);
								console.log('getFieldItemChange itmChgResp::::',itmChgResp);
								if(itmChgResp && itmChgResp.data && itmChgResp.data.Root && itmChgResp.data.Root[detailNo])
								{
									let curFormData = itmChgResp.data.Root[detailNo];
									if(curFormData && typeof curFormData == 'object')
									{
										for(let key of Object.keys(curFormData))
										{
											if(this.allformValues[detailNo])
											{
												if(curFormData[key]['content'] != undefined)
												{
													let contentVal = curFormData[key]['content'];
													if(contentVal == null) { contentVal = ''; }
													if(key.includes('_date') && contentVal && this.checkIsDateFormat(key, formNo)) {
														contentVal = this.convertStringToDate(contentVal);
													}
													this.allformValues[detailNo][index][key] = contentVal;
												}
												if(curFormData[key]['protect'] != undefined)
												{
													this.allformValues[detailNo][index][key+"_protect"] = curFormData[key]['protect'];
												}
												if(curFormData[key]['visible'] != undefined)
												{
													this.allformValues[detailNo][index][key+"_visible"] = curFormData[key]['visible'];
												}
											}
											else
											{
												if(curFormData[key]['content'] != undefined)
												{
													let contentVal2 = curFormData[key]['content'];
													if(contentVal2 == null) { contentVal2 = ''; }
													if(key.includes('_date') && contentVal2 && this.checkIsDateFormat(key, formNo)) {
														contentVal2 = this.convertStringToDate(contentVal2);
													}
													this.allformValues[key] = contentVal2;
												}
												if(curFormData[key]['protect'] != undefined)
												{
													this.allformValues[key+"_protect"] = curFormData[key]['protect'];
												}
												if(curFormData[key]['visible'] != undefined)
												{
													this.allformValues[key+"_visible"] = curFormData[key]['visible'];
												}
											}
										}
									}
									console.log('getFieldItemChange this.allformValues 8657::::',this.allformValues);
									// Refresh feed-view data if open
									if(this.overLayForFeedView && this.allformValues[detailNo] && this.allformValues[detailNo][index])
									{
										this.currentFeedData = this.allformValues[detailNo][index];
									}
									this.disabledFieldCache.clear();
									this.cdr.detectChanges();
								}
								this.completeFieldChange();
								if (this.focusNextAfterItemChange) {
									this.focusNextAfterItemChange = false;
									this.focusNextEditableField();
								}
							}
							else
							{
								// Error OK - set focus on error field
								this._extractTempletService.setForcedSave(false);
								this._extractTempletService.setLoading(false);
								try
								{
									let respData = JSON.parse(response);
									let errorData = respData?.data?.Root?.Errors?.[1]?.error;
									if(!errorData)
									{
										errorData = respData?.data?.Root?.Errors?.error;
									}
									if(errorData && errorData['column_name'])
									{
										let errorColName = errorData['column_name'];
										let objContext = errorData['objContext'] ? errorData['objContext'].trim() : formNo;
										let detailDomId = errorData['detailDomId'] ? errorData['detailDomId'].trim() : null;
										let currentDet = 'Detail' + objContext;
										let focusDomID = detailDomId || domID;
										if(objContext == '1')
										{
											focusDomID = this.allformValues['domID'];
										}
										console.log('[getFieldItemChange ErrorOK] setFocusOnError params - currentDet:', currentDet, 'focusDomID:', focusDomID, 'errorColName:', errorColName);
										setTimeout(() => {
											this.setFocusOnError(currentDet, index, focusDomID, errorColName);
										}, 500);
									}
								}
								catch(e:any)
								{
									console.log('Exception setting focus on getFieldItemChange error field:', e.message);
								}
								this.completeFieldChange();
							}
						});

					}, error: (err: any) => {
						this._extractTempletService.setLoading(false);
						this.focusNextAfterItemChange = false;
						this.completeFieldChange();
						console.log('getFieldItemChange HTTP error:', err);
					}});
				}
			}
		}
		catch(e)
		{
			console.log('Print inside getFieldItemChange Exception::::',e);
		}
	}

	buildChgStr(formNo: any, focusedCol?: any, rowIndex?: any)
	{
		let detailNo = 'Detail'+formNo;
		let chgStrJson: any = {};

		// Resolve domID for header keyValue
		let domIdForHeader = '1';
		if(formNo == '1' && this.allformValues && this.allformValues['domID'])
		{
			domIdForHeader = this.allformValues['domID'];
		}
		else if(this.allformValues && this.allformValues[detailNo] && this.allformValues[detailNo].length > 0)
		{
			let detailArr = this.allformValues[detailNo];
			let targetIdx = (rowIndex !== undefined && rowIndex !== null && rowIndex < detailArr.length) ? rowIndex : detailArr.length - 1;
			if(detailArr[targetIdx] && detailArr[targetIdx]['domID'])
			{
				domIdForHeader = detailArr[targetIdx]['domID'];
			}
		}

		let headerData:any =
		{
		'objName': this.compData['OBJ_NAME'],
		'pageContext': '1',
		'objContext': formNo,
		'editFlag': this.compData['EDIT_FLAG'],
		'focusedColumn': focusedCol || '',
		'elementName': '',
		'keyValue': domIdForHeader,
		'taxKeyValue': '',
		'saveLevel': '0',
		'forcedSave': 'false',
		'taxInFocus': 'false',
		}
		chgStrJson['header'] = headerData;
		if(this.allformValues && this.allformValues[detailNo] && this.allformValues[detailNo].length > 0)
		{
			let detailArr: any = this.allformValues[detailNo]
			console.log('print detailArr 8617:::',detailArr);
			if (detailArr && (!Array.isArray(detailArr) || detailArr.length === 0)) return;
			if(detailArr && detailArr.length > 0)
			{
				// Use specific row if index provided, otherwise use last row (legacy behavior)
				let targetIdx = (rowIndex !== undefined && rowIndex !== null && rowIndex < detailArr.length) ? rowIndex : detailArr.length - 1;
				{
					const row = detailArr[targetIdx];
					chgStrJson[detailNo] = {};
		
					Object.keys(row).forEach((key) => {
						if (key.endsWith('_protect') || key.endsWith('_visible')) return;
						// ----- ATTRIBUTE → ORIG_ATTRIBUTE_NODE -----
						if (key === 'attribute')
						{
							let attrObj: any = {};
							let attrVal = row[key];
							if(attrVal && typeof attrVal === 'object')
							{
								attrObj = attrVal;
							}
							else if(attrVal && typeof attrVal === 'string')
							{
								try { attrObj = JSON.parse(attrVal); } catch(e) { attrObj = {}; }
							}
							chgStrJson[detailNo]['ORIG_ATTRIBUTE_NODE'] = {
							protect: row['attribute_protect'] || '',
							visible: row['attribute_visible'] || '',
							content:
								`<attribute pkNames="${attrObj.pkNames || ''}" ` +
								`selected="${attrObj.selected || ''}" ` +
								`status="${attrObj.status || ''}" ` +
								`updateFlag="${attrObj.updateFlag || ''}"/>`
							};
							// return;
						}
						else if(key.includes('_date'))
						{
							let value = row[key];
							console.log('print value 8716::::',value);
							let formattedDate = '';
							if(value && value != 'Invalid Date')
							{
								formattedDate = this.formatDateToDDMMYY(value);
							}
							chgStrJson[detailNo][key] = {
								protect: row[`${key}_protect`] || '',
								visible: row[`${key}_visible`] || '',
								content: formattedDate
							};
							return;
						}
		
						// ----- NORMAL FIELDS -----
						chgStrJson[detailNo][key] = {
							protect: row[`${key}_protect`] || '',
							visible: row[`${key}_visible`] || '',
							content: (row[key] == null || row[key] == undefined) ? '' : String(row[key])
						};
					});	
					console.log('print chgStrJson 8705:::',chgStrJson);
				}
			}
		}
		else if(this.allformValues && formNo == '1')
		{
			let data = this.allformValues;
			chgStrJson[detailNo] = {};
			Object.keys(data).forEach((key) => {
				if(key != detailNo)
				{
					if (key.endsWith('_protect') || key.endsWith('_visible')) return;
					// ----- ATTRIBUTE → ORIG_ATTRIBUTE_NODE -----
					if (key === 'attribute')
					{
						let attrObj: any = {};
						let attrVal = data[key];
						if(attrVal && typeof attrVal === 'object')
						{
							attrObj = attrVal;
						}
						else if(attrVal && typeof attrVal === 'string')
						{
							try { attrObj = JSON.parse(attrVal); } catch(e) { attrObj = {}; }
						}
						chgStrJson[detailNo]['ORIG_ATTRIBUTE_NODE'] = {
						protect: data['attribute_protect'] || '',
						visible: data['attribute_visible'] || '',
						content:
							`<attribute pkNames="${attrObj.pkNames || ''}" ` +
							`selected="${attrObj.selected || ''}" ` +
							`status="${attrObj.status || ''}" ` +
							`updateFlag="${attrObj.updateFlag || ''}"/>`
						};
						// return;
					}
					else if(key.includes('_date'))
					{
						let value = data[key];
						// console.log('print value 8733:::::',value);
						let formattedDate = '';
						if(value && value != 'Invalid Date')
						{
							formattedDate = this.formatDateToDDMMYY(value);
						}
						chgStrJson[detailNo][key] = {
							protect: data[`${key}_protect`] || '',
							visible: data[`${key}_visible`] || '',
							content: formattedDate
						};
						return;
					}
		
					// ----- NORMAL FIELDS -----
					chgStrJson[detailNo][key] = {
						protect: data[`${key}_protect`] || '',
						visible: data[`${key}_visible`] || '',
						content: (data[key] == null || data[key] == undefined) ? '' : String(data[key])
					};
				}
			});	
			console.log('print chgStrJson 8748:::',chgStrJson);
		}
		return JSON.stringify(chgStrJson);
	}

	formatDateToDDMMYY(date: any): string 
	{
		// console.log('print formatDateToDDMMYY date::::',date);
		// console.log('print formatDateToDDMMYY typeof date::::',typeof date);
		if(date && typeof date == 'string' && date.includes('/'))
		{
			return date;
		}
		else
		{
			const dd = String(date.getDate()).padStart(2, '0');
			const mm = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
			const yy = String(date.getFullYear()).slice(-2);
			return `${dd}/${mm}/${yy}`;
		}
	}

	pophelpFieldData(event: any)
	{
		// for pophelp
		console.log('print this.popHelpFieldList 8969::::', this.popHelpFieldList);
		console.log('print event 8970::::', event);
		if(event)
		{
			this._extractTempletService.setLoading(true);
			this._extractTempletService.getPophelpData(event).subscribe((response:any) => {
				this._extractTempletService.setLoading(false);
				this._extractTempletService.checkErrorException(response, (result:any) =>{
					console.log('Print getFormPophelpData response::::',response);
					console.log('Print getFormPophelpData result::::',result);
					if(!result)
					{
						let jsonData = JSON.parse(event);
						let fldValue = '';
						let isPopHelp = false;
						if(jsonData['FIELD_VALUE'])
						{
							fldValue = jsonData['FIELD_VALUE'];
						}
						if(jsonData['isPopHelp'])
						{
							isPopHelp = jsonData['isPopHelp'];
						}
						console.log('Print getFormPophelpData isPopHelp::::',isPopHelp);
						this.textbox.getAutoSearchPophelp(response,fldValue,isPopHelp);
					}
	
				});
				
			});	
		}
	}

	autoSuggSelectedData(data: any)
	{
		// Clear pendingClickTarget so that completeFieldChange() does not re-trigger
		// the showmore-button click after autosuggest selection from feed-view
		this.pendingClickTarget = null;
		this.isPreventItemChange = true;
		this.isPreventEnterKeyItemChange = true;
		let jsonData = data;
		// Update allformValues with the selected value so that buildChgStr picks up the current field value in chg_str
		let detailNo = 'Detail' + jsonData['FORM_NO'];
		let idx = jsonData['INDEX'];
		if(this.allformValues[detailNo] && this.allformValues[detailNo][idx])
		{
			this.allformValues[detailNo][idx][jsonData['FIELD_NAME']] = jsonData['FIELD_VALUE'];
		}
		else if(jsonData['FORM_NO'] == '1' && this.allformValues)
		{
			this.allformValues[jsonData['FIELD_NAME']] = jsonData['FIELD_VALUE'];
		}

		// Force UI update so the selected value is reflected in the input field
		this.cdr.detectChanges();

		// Update initialValue so subsequent blur detects only manual edits after this selection
		if(this.detailFocusInfo)
		{
			this.detailFocusInfo.initialValue = jsonData['FIELD_VALUE'];
		}

		// Update previousFieldValue so header field (change) event won't trigger a duplicate item change
		this.previousFieldValue = jsonData['FIELD_VALUE'];

		// Call item change with the selected autosuggest value
		let domID = jsonData['DOM_ID'] || this.currentDomID || '1';
		let formNo = jsonData['FORM_NO'];
		let fieldName = jsonData['FIELD_NAME'];
		let fieldValue = jsonData['FIELD_VALUE'];
		// Temporarily allow item change for this call, then re-set prevent flag
		// so the subsequent blur/change event does not trigger a duplicate item change
		this.isPreventItemChange = false;
		this.focusNextAfterItemChange = true;
		this.getFieldItemChange(fieldName, fieldValue, domID, formNo, idx);
		this.isPreventItemChange = true;

		this.activeDetailAutoSuggest = null;
	}

	buildFeedObjFormDetailJson(response: any)
	{
		console.log('print buildFeedObjFormDetailJson response 9138:::::',response);
		this.formWiseMap = {};
		if(response && response.data && response.data.sql_models)
		{
			this.objSqlModelData = response.data.sql_models;

			response.data.sql_models.forEach((formEntry: any) => {
				let sqlModel = formEntry.sql_model;
				let formNo = sqlModel.form_no;
				
				// This object will be the yCordGrpMap for this specific form
				let currentFormGrpMap: any = {};
				if(sqlModel.columns)
				{
					sqlModel.columns.forEach((colWrapper: any) => {
						const col = colWrapper.column;
						const groupName = col.group_name || 'Default';
						const y = col.y;
						const x = col.x;
			
						// A. Initialize the Group Container (matching your HTML structure)
						if (!currentFormGrpMap[groupName]) {
						currentFormGrpMap[groupName] = {
							grpNodeObj: { text: groupName }, // Required for [id] and header text
							grpBox_contents: {}             // This will hold the rows (Y)
						};
						}
			
						// B. Initialize the Row (Y-Coordinate) inside this group
						if (!currentFormGrpMap[groupName].grpBox_contents[y]) {
						currentFormGrpMap[groupName].grpBox_contents[y] = {};
						}
			
						// C. Map internal properties to match HTML logic requirements
						// The HTML looks for .editStyle and .dataType specifically
						col['editStyle'] = col.edit_mask?.mask || 'edit';
						col['dataType'] = col.col_type;
			
						// D. Place the field data into the specific X-coordinate
						currentFormGrpMap[groupName].grpBox_contents[y][x] = col;
					});
				}
		
				// E. Store this completed map under its form number
				this.formWiseMap[formNo] = currentFormGrpMap;
			});
		}
		console.log('print this.formWiseMap 9185::::',this.formWiseMap);
    	// return formWiseMap;
  	}
}
