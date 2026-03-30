import { Component, OnInit, Input, ViewChild, ElementRef, ViewEncapsulation, ChangeDetectionStrategy, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { GridsterConfig, GridsterItem, GridsterItemComponent, GridsterPush, GridsterPushResize, GridsterSwap } from 'angular-gridster2';
import { BBGridsterService } from './bb-gridster.service';
import { CdkDragDrop, transferArrayItem, moveItemInArray, CdkDrag, CdkDragMove, copyArrayItem } from '@angular/cdk/drag-drop';
import { VisualUpdateOptions } from 'visuals';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import {
	DisplayGrid,
	GridsterComponent,
	GridsterComponentInterface,
	GridsterItemComponentInterface,
	GridType
} from 'angular-gridster2';
import _ from 'lodash';
import { DatePipe } from '@angular/common';


@Component({
	selector: 'bb-gridster',
	templateUrl: './bb-gridster.component.html',
	styleUrls: ['./bb-gridster.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})

export class BBGridsterComponent implements OnInit {
	options: GridsterConfig | any;
	dashboard: Array<GridsterItem> | any = [];
	selectedVisual: Object | any;
	itemToPush: GridsterItemComponent | any;

	layout: GridsterItem[] = [];
	loaded = false;
	@Input() isSidePanelOpen: boolean;
	@Input() currentSelectedFeed: any[] = [];
	@Output() gridsterEmit: EventEmitter<any> = new EventEmitter();
	@Input() isgridsterFirstTimeEdit: boolean;
	@Output() gridsterEmitSelectdata: EventEmitter<any> = new EventEmitter();
	@Input() layoutData: any;
	columnListResponse: any = '';
	// compData: any = {};
	@Input() pluginMetadata: any;
	editFlag: any;
	@Input() compData: any;
	@Input() schemaDatabaseType = "1";
	visualLayoutData: any = {};
	sourceSql: any;
	sqlmodel: any = {};
	jsonData: any = [];
	licenseKey: any;
	visualUpdOptions: any;
	displayVisuals: boolean = false;
	@Output() onDrillDown: EventEmitter<any> = new EventEmitter();
	@Output() onDrillDownClose: EventEmitter<any> = new EventEmitter();
	//isDrillDown: boolean = false;
	@Input() isDrillDown: any;
	@Input() setCompId: any;
	
	obj_links: any[] = [];
	obj_name: any;
	firstData:any = [];
    firstElemant:any;
	feedData: any;
	@Input() showMenu:boolean ;
	showMenuInGridster: boolean = true;
	imgVrbl:any;
	@Output() gridPerformLinkEmit: EventEmitter<any> = new EventEmitter();
	promptArgumentList: any
	dashboardID: any;
	selectedRowData: any;
	showErrorMessageOnHover: boolean;
	errorMessage:any = [];
	showErrorMessages = '';
	errorMessageJson = {}
	hoverLogPrinted:any;
	errorVisualId:any;
	visualObjLink: any = {};
	@Output() gridPerformActionEmit: EventEmitter<any> = new EventEmitter();
	showBackgroundColor: boolean = false;
	advanceLayoutProp:any;
	constructor(public gridsterService: BBGridsterService, private http: HttpClient, private elementRef: ElementRef,
		public datePipe: DatePipe) {
	}

	itemChange(item, itemComponent) {
		this.gridsterService.savePositions(this.dashboard);
		this.gridsterEmit.emit(this.dashboard);
	}

	itemResize(item, itemComponent) {
		window.dispatchEvent(new Event('resize'));
		setTimeout(() => {
			window.dispatchEvent(new Event('resize'))
		}, 1000);
	}

	ngOnInit() {
		if (this.pluginMetadata) {
			this.compData = this.pluginMetadata["compData"];
		}
		this.options = {
			gridType: 'scrollVertical',
			displayGrid:'onDrag&Resize',
			initCallback: BBGridsterComponent.gridInit,
			destroyCallback: BBGridsterComponent.gridDestroy,
			gridSizeChangedCallback: BBGridsterComponent.gridSizeChanged,
			itemChangeCallback: BBGridsterComponent.itemChange,
			itemResizeCallback: BBGridsterComponent.itemResize,
			itemInitCallback: BBGridsterComponent.itemInit,
			itemRemovedCallback: BBGridsterComponent.itemRemoved,
			itemValidateCallback: BBGridsterComponent.itemValidate,
			pushItems: true,
			draggable: {
			  enabled: true
			},
			resizable: {
			  enabled: true
			},
			//fixedRowHeight: 13,
			maxCols:64,
			//defaultItemCols:8,
			keepFixedHeightInMobile: true,
			addEmptyRowsCount:1,
			//maxRows:100,
			//maxItemRows: 1000,
			setGridSize: false,
			//rowHeightRatio:1.5,
		  };
        console.log('Print the compdata',this.compData);
		console.log('Print this.visualObjLink 125:::::',this.visualObjLink);
		if(this.compData != undefined && this.compData.component != undefined)
		{
			this.obj_links =  this.compData.component[0].obj_links || [];
			// this.firstData = this.obj_links[0];
			this.obj_name = this.compData.obj_name;
			this.firstElemant = this.obj_links.length;
		}
		else
		{
			this.obj_links =  this.compData.obj_links || [];
			// this.firstData = this.obj_links[0];
			this.obj_name = this.compData.obj_name;
			this.firstElemant = this.obj_links.length;
		}

	}
	handleMissingImage(event: Event) {
		(event.target as HTMLImageElement).style.display = 'none';
	  }
	static itemChange(
		item: GridsterItem,
		itemComponent: GridsterItemComponentInterface
	): void {
		console.info('itemChanged', item, itemComponent);
	}

	changedOptions(): void {
		if (this.options.api && this.options.api.optionsChanged) {
			this.options.api.optionsChanged();
		}
	}

	addItem(data, editFlag, argumentList,dashboardID) {
		try 
		{
			console.info('advanceLayoutProp LINE NO 164', this.advanceLayoutProp);
			let colsValue;
			let rowsValue;
			if(this.advanceLayoutProp)
			{
				colsValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('cols'))?.cols;
				rowsValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('rows'))?.rows;
			}
			this.promptArgumentList = argumentList;
			this.dashboardID = '';
			let dashboardLen = 0;
			let xPos = 0;
			let yPos = 0;
			if (editFlag == 'A') {
				let gristerArr = data;

				if (gristerArr != null) {
					if (this.dashboard != undefined) {
						dashboardLen = this.dashboard.length;
					}
					// let xPos = 0;
					// let yPos = 0;
					for (let i = 0; i < gristerArr.length; i++) {
						const item: GridsterItem = {
							// cols: 16,
							// rows: 16,
							cols:colsValue,
							rows:rowsValue,
							x: xPos,
							y: yPos,
							visual: gristerArr[i],
						};
						console.info('item LINE NO 195', item);
						this.dashboard.push(item);
						

						if(i == 2 || i == 5 || i == 8 || i == 11)
						{
							xPos = 0;
							//yPos = yPos+16;
							yPos = yPos + colsValue;
						}
						else
						{
							//xPos = xPos+16;
							xPos = xPos + rowsValue;
						}
						
					}
					this.itemChange(null, null);
					this.previewVisual(this.dashboard, argumentList, dashboardLen,editFlag,null);
				}
				this.ngOnChanges(null);
			}
			else {
				console.log('PRINT LINE NO 219',data);
				this.editFlag = editFlag;
				this.dashboard = data;
				// for(let i=0;i<this.dashboard.length;i++)
				// {
				// 	this.dashboard[i].cols = colsValue;
				// 	this.dashboard[i].rows = rowsValue;
				// 	if(i == 2 || i == 5 || i == 8 || i == 11)
				// 	{
				// 		xPos = 0;
				// 		//yPos = yPos+16;
				// 		yPos = yPos + colsValue;
				// 		console.info('yPos LINE NO 204', yPos);
				// 		console.info('rowsValue LINE NO 205', colsValue);
				// 	}
				// 	else
				// 	{
				// 		//xPos = xPos+16;
				// 		xPos = xPos + rowsValue;
				// 		console.info('xPos LINE NO 211', xPos);
				// 		console.info('rowsValue LINE NO 212', rowsValue);
				// 	}
				// }
				console.log('PRINT LINE NO 248',this.dashboard);
				this.dashboardID = dashboardID;
				console.log('Print the this.dashboardID',this.dashboardID);
				this.itemChange(null, null);
				this.previewVisual(this.dashboard, argumentList, dashboardLen,editFlag,dashboardID);
				this.ngOnChanges(null);
			}

		}

		catch (e: any) {
			console.log('Exception inisde addItem method ', e.message);
		}
	}

	static change(): void { }

	onDropSelect(event: CdkDragDrop<any[]> | any, index?: any) {
	}
	stopPropagation(event: any) {
	}

	onSelectFeed(selectedFeedData: any) {
		selectedFeedData['sidePanelIndex'] = 1;
		selectedFeedData['checked'] = true;
		this.gridsterEmitSelectdata.emit(selectedFeedData);
	}

	previewVisual(dashboard, argumentList, len,editFlag,dashboardID) {
		try {
			console.log('Inside previewVisual Print the dashboard 274::::',dashboard)
			console.log('Inside previewVisual Print the argumentList 275::::',argumentList);
			this.displayVisuals = false;
			let count = len;
			let tempVisualObjArr = [];
			for (let i = len; i < dashboard.length; i++) 
			{
				// let sqlModel = dashboard[i].visual.visual_data[i]['sqlModel'];
				//let sqlModel = dashboard[i].visual.visual_data[i]?.['sqlModel'] ? dashboard[i].visual.visual_data[i]['sqlModel'] : dashboard[i].visual.visual_data['sqlModel'];
				let sqlModel = Array.isArray(dashboard[i]?.visual?.visual_data)
				? dashboard[i].visual.visual_data.find(item => item?.['sqlModel'])?.['sqlModel']
				: dashboard[i]?.visual?.visual_data?.['sqlModel'];
                console.log("PRINT LINE NO 285 sqlModel",sqlModel);
				var SqlModelAllData = JSON.parse(sqlModel);
				console.log("PRINT LINE NO 281 SqlModelAllData",SqlModelAllData);
				let databaseDetail = SqlModelAllData['DATABASE_DETAIL'];
				let schemaDatabaseType = databaseDetail['TYPE']
				console.log("PRINT LINE NO 283 databaseDetail",databaseDetail);
				let promptArgList = {};
				let id = dashboard[i].visual.visual_id;
				if(argumentList.hasOwnProperty(id))
				{
					console.log('PRINT argumentList[id] 291',argumentList);
					if(argumentList[id] != undefined && argumentList[id] != '' && argumentList[id] != null)
					{
						console.log('PRINT argumentList[id] 294',argumentList);
						for(let j = 0; j < argumentList[id].length; j++)
						{
							console.log('PRINT argumentList[id] 296',argumentList);
							if(argumentList[id][j]['type'] === "4")
							{
								console.log('PRINT argumentList[id] 304',argumentList);
								// if(schemaDatabaseType === 2 || (schemaDatabaseType === 4 && databaseDetail['DATABASE_NAME'] == "Dremio"))
								// {
								if (schemaDatabaseType === 2 || (schemaDatabaseType === 4 && (databaseDetail['DATABASE_NAME'] === "Dremio" || databaseDetail['DATABASE_NAME'] === "InMemory")))
								{
									console.log('PRINT schemaDatabaseType 309',schemaDatabaseType);
									console.log('PRINT databaseDetail 310',databaseDetail);
									console.log("PRINT argumentList[id][j]['value'] 311",argumentList[id][j]['value']);
									if(argumentList[id][j]['value'] != undefined)
									{
										let latest_date = this.datePipe.transform(new Date(argumentList[id][j]['value']), 'yyyy-MM-dd');
										console.log("PRINT latest_date 307",latest_date);
										argumentList[id][j]['value'] = latest_date;
										console.log("PRINT latest_date 309",argumentList[id][j]['value']);
										promptArgList[argumentList[id][j]['promptLabel'].replaceAll(" ", "_").toUpperCase()] = argumentList[id][j]['value']
										console.log("PRINT promptArgList 311",promptArgList);
									}
								}
								else
								{
									promptArgList[argumentList[id][j]['promptLabel'].replaceAll(" ", "_").toUpperCase()] = argumentList[id][j]['value']
									console.log("PRINT promptArgList 320",promptArgList);
								}
							}
							else
							{
								promptArgList[argumentList[id][j]['promptLabel'].replaceAll(" ", "_").toUpperCase()] = argumentList[id][j]['value']
								console.log("PRINT promptArgList 317",promptArgList);
							}
							//promptArgList[argumentList[id][j]['promptLabel'].replaceAll(" ", "_").toUpperCase()] = argumentList[id][j]['value']
						}
					}
				}
				else
				{
					promptArgList = argumentList;
				}
				console.log("PRINT LINE NO 336 in bb-gridster::",promptArgList);
				console.log("PRINT LINE NO 337 in bb-gridster::",dashboard[i].visual);
				if(dashboard[i] != undefined && dashboard[i].visual != undefined && dashboard[i].visual.visual_data != undefined && dashboard[i].visual.visual_data != null)
				{
					let deployObjName = "";
					let processID = "";
					if(dashboard[i].visual.visual_data instanceof Array && dashboard[i].visual.visual_data.length > 0)
					{
						if(dashboard[i].visual.visual_data[0] != undefined && dashboard[i].visual.visual_data[0].DEPLOY_OBJ_NAME != undefined)
						{
							deployObjName = dashboard[i].visual.visual_data[0].DEPLOY_OBJ_NAME;
							processID = dashboard[i].visual.visual_data[0].PROC_DESIGN_ID;
						}
					}
					else if(dashboard[i].visual.visual_data.DEPLOY_OBJ_NAME != undefined)
					{
						deployObjName = dashboard[i].visual.visual_data.DEPLOY_OBJ_NAME;
						processID = dashboard[i].visual.visual_data.PROC_DESIGN_ID;
					}
					let localLinkOption = localStorage.getItem(this.dashboardID+"_"+processID+"_links");
					console.log('Print localLinkOption::::::',localLinkOption);
					if(localLinkOption != null)
					{
						let result = JSON.parse(localLinkOption);
						console.log('print result 277::::::',result);
						// this.visualObjLink[processID] = result['LinkActions'];
						this.visualObjLink[processID] = result;
					}
					else
					{
						let sortedLinkArray = [];
						let sortedActionArray = [];
						console.log('print deployObjName::::::',deployObjName);
						this.gridsterService.getLinkData(deployObjName,(response:any) =>
						{
							// localStorage.setItem(this.dashboardID+"_"+processID+"_links", JSON.stringify(response));
							response = JSON.stringify(response);
							let result = JSON.parse(response);
							console.log('print result 285::::::',result);
							if(result && result['LinkActions'])
							{
								let tempResult = result['LinkActions'];
								tempResult = tempResult.filter(item => item.FormNo === "1");
								console.log('print tempResult 293::::::',tempResult);	
								sortedLinkArray = _.sortBy(tempResult, [function(o) { return parseInt(o.LineNo, 10); }]);
								console.log('print sortedLinkArray 294::::::',sortedLinkArray);
								this.gridsterService.getActionData(deployObjName,(response:any) =>
								{
									// localStorage.setItem(this.dashboardID+"_"+processID+"_links", JSON.stringify(response));
									response = JSON.stringify(response);
									let result = JSON.parse(response);
									if(result && result[0] && result[0]['ACTIONS'] && result[0]['ACTIONS']['action'])
									{
										console.log('print result 299::::::',result);
										let tempResult = result[0]['ACTIONS']['action'];
										tempResult = tempResult.filter(item => item.formNo === "1");
										console.log('print tempResult 304::::::',tempResult);
										
										sortedActionArray = _.sortBy(tempResult, [function(f) { return parseInt(f.line_no, 10); }]);
										console.log('print sortedActionArray 307::::::',sortedActionArray);
										tempVisualObjArr = sortedLinkArray.concat(sortedActionArray);
										console.log('print tempVisualObjArr 302::::::',tempVisualObjArr);
										tempVisualObjArr.sort((a, b) => {
											const valueA = a.line_no !== undefined ? a.line_no : a.LineNo;
											const valueB = b.line_no !== undefined ? b.line_no : b.LineNo;
											
											return valueA - valueB;
										});
										localStorage.setItem(this.dashboardID+"_"+processID+"_links", JSON.stringify(tempVisualObjArr));
										this.visualObjLink[processID] = tempVisualObjArr;
										console.log('print this.visualObjLink 310::::::',this.visualObjLink);
									}
								});
							}
						});
					}
				}
				console.log('Inside previewVisual Print the promptArgList 419 in bb-gridster',promptArgList)
				let outputType;
				if(SqlModelAllData['VISUAL_NAME'] == "XSL" || SqlModelAllData['VISUAL_NAME'] == "xsl" || SqlModelAllData['VISUAL_NAME'] == "Xsl")
				{
					outputType = "XML"
				}
				else if(SqlModelAllData['VISUAL_NAME'] == "HTML" || SqlModelAllData['VISUAL_NAME'] == "html" || SqlModelAllData['VISUAL_NAME'] == "Html")
				{
					outputType = "HTML"
				}
				else
				{
					outputType = ""
				}
				var data: any = {};
				data['VISUAL_ID'] = dashboard[i].visual.visual_id;
				data['TOKEN_ID'] = "";
				data['APP_ID'] = "";
				data['DATA_FORMAT'] = "JSON";
				data['OUTPUT_TYPE'] = outputType;
				data["isSessionAvailable"] = true;
				data['tableName'] = "dashboard_definition";
				data['isComposite'] = "false";
				data['ARGUMENT_LIST'] = JSON.stringify(promptArgList);
				var paramString = this.gridsterService.getEncodedParamString(data);
				var url = this.gridsterService.getHostURL() + '/ibase/rest/GenProcessPreviewService/getVisualData';
				let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
				this.gridsterService.setLoading(true);
				this.http.post(url, paramString, { headers, responseType: 'text' }).subscribe(resp => {
					this.gridsterService.setLoading(false);
					console.log('Inside previewVisual Print the resp',resp);
					// Changed by Samruddhi for json parse error in console when getVisualData response is undefined
					var result: any;
					var responseData: any;
					this.errorMessageJson[dashboard[i]['visual']['visual_id']] = "";
					console.log('Inside previewVisual Print the this.dashboard line no 271',this.dashboard[i]);
					if(resp.includes("No records found"))
					{
						if (resp.includes("error")) 
						{
							let data = JSON.parse(resp);
							console.log('print data 278::',data);
							var respData = data['Response']['results'];
							console.log('print respData 280::>>>>>>>>>',respData);
							let getMsg = respData;
							console.log('print getMsg 282::',getMsg)
							if(getMsg['Root'] != undefined && getMsg['Root']['Errors'] != undefined && getMsg['Root']['Errors']['error'] != undefined && getMsg['Root']['Errors']['error']['message'] != undefined)
							{
								if(this.errorMessageJson[dashboard[i]['visual']['visual_id']] != undefined && this.errorMessageJson[dashboard[i]['visual']['visual_id']] != null && this.errorMessageJson[dashboard[i]['visual']['visual_id']] != "")
								{
									this.errorMessageJson[dashboard[i]['visual']['visual_id']] = getMsg['Root']['Errors']['error']['message'];
								}
								else
								{
									this.errorMessageJson[dashboard[i]['visual']['visual_id']] = getMsg['Root']['Errors']['error']['message'];
								}
							}
							if(getMsg['Root'] != undefined && getMsg['Root']['Errors'] != undefined && getMsg['Root']['Errors']['error'] != undefined && getMsg['Root']['Errors']['error']['description'] != undefined)
							{
								if(this.errorMessageJson[dashboard[i]['visual']['visual_id']] != undefined && this.errorMessageJson[dashboard[i]['visual']['visual_id']] != null && this.errorMessageJson[dashboard[i]['visual']['visual_id']] != "")
								{
									this.errorMessageJson[dashboard[i]['visual']['visual_id']] += "\n" + getMsg['Root']['Errors']['error']['description'];
								}
								else
								{
									this.errorMessageJson[dashboard[i]['visual']['visual_id']] = getMsg['Root']['Errors']['error']['description'];
								}
							}
							if(getMsg['Root'] != undefined && getMsg['Root']['Errors'] != undefined && getMsg['Root']['Errors']['error'] != undefined && getMsg['Root']['Errors']['error']['trace'] != undefined) 
							{
								if(this.errorMessageJson[dashboard[i]['visual']['visual_id']] != undefined && this.errorMessageJson[dashboard[i]['visual']['visual_id']] != null && this.errorMessageJson[dashboard[i]['visual']['visual_id']] != "")
								{
									this.errorMessageJson[dashboard[i]['visual']['visual_id']] += "\n" + getMsg['Root']['Errors']['error']['trace'];
								}
								else
								{
									this.errorMessageJson[dashboard[i]['visual']['visual_id']] = getMsg['Root']['Errors']['error']['trace'];
								}
							}
							this.dashboard[i]['visual_data'] = '';
							console.log('Inside previewVisual Print the this.dashboard line no 315',this.dashboard[i]);
							this.showErrorIcon(i);
						}
					}
					else if(resp.includes("error"))
					{	
						let data = JSON.parse(resp);
						console.log('print data 324::',data);
						var respData = data['Response']['results'];
						console.log('print respData 326::>>>>>>>>>',respData);
						let getMsg = respData;
						console.log('print getMsg 328::',getMsg)
						if(getMsg['Root'] != undefined && getMsg['Root']['Errors'] != undefined && getMsg['Root']['Errors']['error'] != undefined && getMsg['Root']['Errors']['error']['message'] != undefined)
						{
							if(this.errorMessageJson[dashboard[i]['visual']['visual_id']] != undefined && this.errorMessageJson[dashboard[i]['visual']['visual_id']] != null && this.errorMessageJson[dashboard[i]['visual']['visual_id']] != "")
							{
								this.errorMessageJson[dashboard[i]['visual']['visual_id']] = getMsg['Root']['Errors']['error']['message'];
							}
							else
							{
								this.errorMessageJson[dashboard[i]['visual']['visual_id']] = getMsg['Root']['Errors']['error']['message'];
							}
						}
						if(getMsg['Root'] != undefined && getMsg['Root']['Errors'] != undefined && getMsg['Root']['Errors']['error'] != undefined && getMsg['Root']['Errors']['error']['description'] != undefined)
						{
							if(this.errorMessageJson[dashboard[i]['visual']['visual_id']] != undefined && this.errorMessageJson[dashboard[i]['visual']['visual_id']] != null && this.errorMessageJson[dashboard[i]['visual']['visual_id']] != "")
							{
								this.errorMessageJson[dashboard[i]['visual']['visual_id']] += "\n" + getMsg['Root']['Errors']['error']['description'];
							}
							else
							{
								this.errorMessageJson[dashboard[i]['visual']['visual_id']] = getMsg['Root']['Errors']['error']['description'];
							}
						}
						if(getMsg['Root'] != undefined && getMsg['Root']['Errors'] != undefined && getMsg['Root']['Errors']['error'] != undefined && getMsg['Root']['Errors']['error']['trace'] != undefined) 
						{
							if(this.errorMessageJson[dashboard[i]['visual']['visual_id']] != undefined && this.errorMessageJson[dashboard[i]['visual']['visual_id']] != null && this.errorMessageJson[dashboard[i]['visual']['visual_id']] != "")
							{
								this.errorMessageJson[dashboard[i]['visual']['visual_id']] += "\n" + getMsg['Root']['Errors']['error']['trace'];
							}
							else
							{
								this.errorMessageJson[dashboard[i]['visual']['visual_id']] = getMsg['Root']['Errors']['error']['trace'];
							}
						}
						this.dashboard[i]['visual_data'] = '';
						console.log('Inside previewVisual Print the this.dashboard line no 361',this.dashboard[i]);
						this.showErrorIcon(i);		
					}
					else
					{
						console.log('print the resp line no 386>>>',resp);
						responseData = JSON.parse(resp);
						console.log('print the responseData line no 386',responseData);
						console.log('print the responseData line no 371>>>>>>',responseData);
						if(responseData != undefined && responseData != null && responseData != '')
						{
							result = responseData['Response']['results'];
							console.log('print the result line no 377',result);
							if(responseData != undefined && responseData['Response']['status'] == 'success' && result != undefined)
							{
								let optionArr;
								if (dashboard[i]['visual']['visual_data'] != undefined && dashboard[i]['visual']['visual_data'][0] != undefined) {
									optionArr = JSON.parse(dashboard[i]['visual']['visual_data'][0]['layoutData']);
								}
								else {
									if (dashboard[i]['visual']['visual_data'] != undefined) {
										optionArr = JSON.parse(dashboard[i]['visual']['visual_data']['layoutData']);
									}
								}
			
								let updOptions = new VisualUpdateOptions();
								console.log('print the updOptions line no 506>>>>>>',updOptions);
								updOptions['IsEditMode'] = true;
								updOptions['visualID'] = dashboard[i]['visual']['visual_id'];
								if(dashboard[i].visual.visual_name.includes('HTML') || dashboard[i].visual.visual_name.includes('XSL'))
								{
									updOptions['jsonData'] = result;	
								}
								else
								{
									updOptions['jsonData'] = JSON.parse(result);
								}
								if (optionArr['layoutdata'] != undefined) {
									updOptions['layoutdata'] = optionArr['layoutdata'];
			
								}
								updOptions['optionsArr'] = optionArr['visualLayout']['options'];
								updOptions['moreOptions'] = optionArr['moreOptions'];
								updOptions['isDashboard'] = true;
								updOptions['visualLayout'] = optionArr['visualLayout'];
								console.log('print the optionArrvisualLayout 525>>>>>>',optionArr['visualLayout']);
								if(optionArr['visualLayout'] && optionArr['visualLayout']['options'])
								{
									for(let i=0;i<optionArr['visualLayout']['options'].length;i++)
									{
										if(optionArr['visualLayout']['options'][i].optionName === "chartBackgroundColor" && optionArr['visualLayout']['options'][i].defaultValue === "White")
										{
											console.log('Print optionsArr 532:::::::',optionArr['visualLayout']['options'][i]);
											this.showBackgroundColor = true;
										}
										else
										{
											console.log('Print optionsArr 537:::::::',optionArr['visualLayout']['options'][i]);
											this.showBackgroundColor = false;
										}
									}
								}
								let visualID: any;
								if (dashboard[i]['visual'] != undefined)
								{
									visualID = dashboard[i]['visual']['visual_id']
								}
								let data: any = {}
								console.log("print the compData",this.compData);
								if(this.compData != undefined && this.compData.component != undefined)
								{
									data =  this.compData.component.find(elem => elem.visual_id == visualID);
									if(data != undefined)
									{
										if (data["LICENCE_KEY"] != undefined) {
											updOptions['licenseKey'] = data["LICENCE_KEY"];
										}
										else {
											updOptions['licenseKey'] = data["FM_API_KEY"];
										}
										updOptions['link_metadata'] = data["link_metadata"];
										updOptions['callback_method_name'] = data["callback_method_name"];
										updOptions['link_columns'] = data["link_column"];
									}
								}
								else
								{
									if (this.compData["LICENCE_KEY"] != undefined) {
										updOptions['licenseKey'] = this.compData["LICENCE_KEY"];
									}
									else {
										updOptions['licenseKey'] = this.compData["FM_API_KEY"];
									}
								}
	
								if(this.promptArgumentList != undefined)
								{
									updOptions['prompt_ArgumentList'] = this.promptArgumentList;
								}
								console.log("Print updOptions line no 265",updOptions);
								this.dashboard[i]['visual_data'] = updOptions;
								this.itemResize(null, null);
								this.itemChange(null, null);
								setTimeout(() => {
									if(editFlag == 'E')
									{
										this.hideheader(null,null,this.dashboard,editFlag,dashboardID);
									}
								},100);
							}
						}
					}
					count++;
					console.log('print the count 458',count);
					console.log('print the dashboard lenght 549',dashboard.length);
					if(count == dashboard.length)
					{
						this.displayVisuals = true;
					}
				});
			}
		}
		catch (e: any) {
			console.log('Exception inside sendRequest:: ', e.message);
		}
	}

	removeGridsterItem() {
		if (this.dashboard != undefined && this.dashboard.length > 0) {
			for (let i = 0; i < this.dashboard.length; i++) {
				{
					this.dashboard.splice(i);
				}
			}
		}
		let gridsterElem = document.getElementById("gridsterId");
		if (gridsterElem != null) {
			gridsterElem.remove();
		}
		this.itemChange(null, null);

		return;
	}

	removeItem(item) {
		if (this.dashboard != undefined && this.dashboard.length > 0 && (item == undefined || item == null)) {
			for (let i = 0; i < this.dashboard.length; i++) {
				{
					this.dashboard.splice(i);
				}
			}
		}
		else {
			if (this.dashboard != undefined && this.dashboard != '') {
				for (let i = 0; i < this.dashboard.length; i++) {
					if (this.dashboard[i]['visual']['line_no'] == item['line_no']) {
						this.dashboard.splice(i, 1);
						break;
					}
				}
			}
		}

		this.itemChange(null, null);
		return;
	}
	static itemResize(
		item: GridsterItem,
		itemComponent: GridsterItemComponentInterface
	): void {
		console.info('itemResized', item, itemComponent);
	}

	static itemInit(
		item: GridsterItem,
		itemComponent: GridsterItemComponentInterface
	): void {
		console.info('itemInitialized', item, itemComponent);
	}

	static itemRemoved(
		item: GridsterItem,
		itemComponent: GridsterItemComponentInterface
	): void {
		console.info('itemRemoved', item, itemComponent);
	}

	static itemValidate(item: GridsterItem): boolean {
		return item.cols > 0 && item.rows > 0;
	}

	static gridInit(grid: GridsterComponentInterface): void {
		console.info('gridInit', grid);
	}

	static gridDestroy(grid: GridsterComponentInterface): void {
		console.info('gridDestroy', grid);
	}

	static gridSizeChanged(grid: GridsterComponentInterface): void {
		console.info('gridSizeChanged', grid);
	}

	addItemresize(data, editFlag, argumentList) {
		try {
			this.promptArgumentList = argumentList;
			let dashboardLen = 0;
			if (editFlag == 'A') {
				let gristerArr = data;
				if (gristerArr != null) {
					if (this.dashboard != undefined) {
						dashboardLen = this.dashboard.length;
					}
					let xPos = 0;
					let yPos = 0;
					for (let i = 0; i < gristerArr.length; i++) {
						const item: GridsterItem = {
							cols: 16,
							rows: 16,
							x: xPos,
							y: yPos,
							visual: gristerArr[i]['visual'],
						};

						this.dashboard.push(item);

						if(i == 2 || i == 5 || i == 8 || i == 11)
						{
							xPos = 0;
							yPos = yPos+16;
						}
						else
						{
							xPos = xPos+16;
						}
					}
					this.previewVisual(this.dashboard, argumentList, dashboardLen,editFlag,null);
				}
			}
		}
		catch (e: any) {
			console.log('Exception inisde addItem method ', e.message);
		}
	}

	ngOnChanges(changes: SimpleChanges) 
	{
		console.log('changes LINE NO 842 ', changes);
		console.log('advanceLayoutProp LINE NO 843 ngOnChanges ', this.advanceLayoutProp);
		let margin;
		let outerMargin;
		let gridTypeValue 
		let compactTypeValue 
		let fixedColWidthValue 
		let fixedRowHeightValue 
		let maxColsValue 
		let resizableValue 
		let draggableValue 
		let displayGridValue 
		let pushItemsValue 
		let keepFixedHeightInMobile;
		let addEmptyRowsCount;
		let setGridSize;
		if (this.isSidePanelOpen != true) 
		{
			console.log('advanceLayoutProp LINE NO 846 when isSidePnl false ', this.advanceLayoutProp);
			if(this.advanceLayoutProp)
			{
				margin = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('margin'))?.margin;
				outerMargin = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('outerMargin'))?.outerMargin;
				gridTypeValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('gridType'))?.gridType;
				compactTypeValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('compactType'))?.compactType;
				fixedColWidthValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('fixedColWidth'))?.fixedColWidth;
				fixedRowHeightValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('fixedRowHeight'))?.fixedRowHeight;
				maxColsValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('maxCols'))?.maxCols;
				resizableValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('resizable'))?.resizable;
				draggableValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('draggable'))?.draggable;
				displayGridValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('displayGrid'))?.displayGrid;
				pushItemsValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('pushItems'))?.pushItems;
				keepFixedHeightInMobile = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('keepFixedHeightInMobile'))?.keepFixedHeightInMobile;
				addEmptyRowsCount = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('addEmptyRowsCount'))?.addEmptyRowsCount;
				setGridSize = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('setGridSize'))?.setGridSize;
			}
			console.log('margin LINE NO 850 when isSidePnl false ', margin,gridTypeValue,compactTypeValue,fixedColWidthValue,fixedRowHeightValue
			,maxColsValue,resizableValue,draggableValue,displayGridValue,pushItemsValue,keepFixedHeightInMobile,addEmptyRowsCount,setGridSize);

			this.options = {
			    initCallback: BBGridsterComponent.change,
				destroyCallback: BBGridsterComponent.change,
				gridSizeChangedCallback: BBGridsterComponent.change,
				itemInitCallback: BBGridsterComponent.change,
				itemRemovedCallback: BBGridsterComponent.change,
				itemChangeCallback: BBGridsterComponent.itemChange,
				itemResizeCallback: BBGridsterComponent.itemResize,
				margin : margin,
				outerMargin:outerMargin,
				gridType: gridTypeValue,
      			compactType: compactTypeValue,
				fixedColWidth: fixedColWidthValue,
				fixedRowHeight: fixedRowHeightValue,
				maxCols:maxColsValue,
				draggable: {
					enabled: draggableValue
				},
				resizable: {
					enabled: resizableValue
				},
				displayGrid:displayGridValue,
				pushItems:pushItemsValue,
				keepFixedHeightInMobile:keepFixedHeightInMobile,
				addEmptyRowsCount:addEmptyRowsCount,
				setGridSize:setGridSize
				// draggable: {
				// 	enabled: true
				// },
				// resizable: {
				// 	enabled: true
				// },
			};
			console.log('options LINE NO 779 if condn when isSidePnl false ', this.options);
		}
		else {
			console.log('advanceLayoutProp LINE NO 783 when isSidePnl true ', this.advanceLayoutProp);
			if(this.advanceLayoutProp)
			{
				margin = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('margin'))?.margin;
				gridTypeValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('gridType'))?.gridType;
				compactTypeValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('compactType'))?.compactType;
				fixedColWidthValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('fixedColWidth'))?.fixedColWidth;
				fixedRowHeightValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('fixedRowHeight'))?.fixedRowHeight;
				maxColsValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('maxCols'))?.maxCols;
				resizableValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('resizable'))?.resizable;
				draggableValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('draggable'))?.draggable;
				displayGridValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('displayGrid'))?.displayGrid;
				pushItemsValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('pushItems'))?.pushItems;
				keepFixedHeightInMobile = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('keepFixedHeightInMobile'))?.keepFixedHeightInMobile;
				addEmptyRowsCount = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('addEmptyRowsCount'))?.addEmptyRowsCount;
				setGridSize = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('setGridSize'))?.setGridSize;
			}
			console.log('ALL PROPErties LINE NO 914 when isSidePnl true ', margin,gridTypeValue,compactTypeValue,fixedColWidthValue,fixedRowHeightValue
			,maxColsValue,resizableValue,draggableValue,displayGridValue,pushItemsValue,keepFixedHeightInMobile,addEmptyRowsCount,setGridSize);

			this.options = {
				initCallback: BBGridsterComponent.change,
				destroyCallback: BBGridsterComponent.change,
				gridSizeChangedCallback: BBGridsterComponent.change,
				itemInitCallback: BBGridsterComponent.change,
				itemRemovedCallback: BBGridsterComponent.change,
				itemChangeCallback: BBGridsterComponent.itemChange,
				itemResizeCallback: BBGridsterComponent.itemResize,
				margin : margin,
				outerMargin:outerMargin,
				gridType: gridTypeValue,
      			compactType: compactTypeValue,
				fixedColWidth: fixedColWidthValue,
				fixedRowHeight: fixedRowHeightValue,
				maxCols:maxColsValue,
				draggable: {
					enabled: draggableValue
				},
				resizable: {
					enabled: resizableValue
				},
				displayGrid:displayGridValue,
				pushItems:pushItemsValue,
				keepFixedHeightInMobile:keepFixedHeightInMobile,
				addEmptyRowsCount:addEmptyRowsCount,
				setGridSize:setGridSize
				// draggable: {
				// 	enabled: true
				// },
				// resizable: {
				// 	enabled: true
				// },
			};
			console.log('options FINAL LINE NO 827 when isSidePnl true ', this.options);
		}
	}
	openDrillDown(selectedFieldInfo: any) {
		this.selectedRowData = selectedFieldInfo['rowData'];
		let elem = document.getElementById('gridsterId');
		this.onDrillDown.emit(selectedFieldInfo);
	}

	onRowSelect(selectedFieldInfo: any)
	{
		console.log("print the selectedFieldInfo line no 492",selectedFieldInfo);
		this.selectedRowData = selectedFieldInfo;
		if(selectedFieldInfo.linkMetadata != undefined)
		{
			this.onDrillDown.emit(selectedFieldInfo);
		}
	}
	setRowData(selectedFieldInfo: any)
	{
		console.log("print the selectedFieldInfo line no 637",selectedFieldInfo);
		this.selectedRowData = selectedFieldInfo;
	}
	closeDrillDownClose()
	{
		this.onDrillDownClose.emit(this.setCompId);
	}
	
	performLinkAction(linkActionObjData: any,visualData: any){
		console.log("print inside linkActionObjData :::::::",linkActionObjData);
		console.log("print inside this.selectedRowData :::::::",this.selectedRowData);
		console.log("print inside item 733:::::::",visualData);
		if(visualData && this.selectedRowData && linkActionObjData.hasOwnProperty("action_id"))
		{
			console.log("print inside item 741:::::::",visualData);
			var deployObjName;
			var objName;
			var deployObjNameNew
			if (visualData instanceof Array) 
			{
				deployObjName = visualData[0]['DEPLOY_OBJ_NAME'];
				if(deployObjName.startsWith("dash__"))
				{
					deployObjNameNew = deployObjName.split("dash__");
					objName = deployObjNameNew[1];
				}
				else
				{
					objName = deployObjName
				}
				this.selectedRowData['obj_name'] = objName
			}
			else
			{
				deployObjName = visualData['DEPLOY_OBJ_NAME'];
				if(deployObjName.startsWith("dash__"))
				{
					deployObjNameNew = deployObjName.split("dash__");
					objName = deployObjNameNew[1];
				}
				else
				{
					objName = deployObjName
				}
				this.selectedRowData['obj_name'] = objName;
			}
			console.log("print inside selectedRowData 773:::::::",this.selectedRowData);
		}
		else if(visualData && this.selectedRowData == undefined && linkActionObjData.hasOwnProperty("linkId"))
		{
			var deployObjName;
			var objName;
			var deployObjNameNew
			console.log("print inside selectedRowData 777:::::::",linkActionObjData);
			if(linkActionObjData['LinkArg'] == undefined || linkActionObjData['LinkArg'] == null || linkActionObjData['LinkArg'] == '')
			{
				this.selectedRowData = {};
				
				if (visualData instanceof Array) 
				{
					deployObjName = visualData[0]['DEPLOY_OBJ_NAME'];
					if(deployObjName.startsWith("dash__"))
					{
						deployObjNameNew = deployObjName.split("dash__");
						objName = deployObjNameNew[1];
					}
					else
					{
						objName = deployObjName
					}
					this.selectedRowData['obj_name'] = objName;
				}
				else
				{
					deployObjName = visualData['DEPLOY_OBJ_NAME'];
					if(deployObjName.startsWith("dash__"))
					{
						deployObjNameNew = deployObjName.split("dash__");
						objName = deployObjNameNew[1];
					}
					else
					{
						objName = deployObjName
					}
					this.selectedRowData['obj_name'] = objName;
					console.log("print inside item 810:::::::",this.selectedRowData['obj_name']);
				}
			}
		}
		let feedJson = {
			"link" : linkActionObjData,
			"feed" : this.selectedRowData,
			"rowData" : this.selectedRowData
		};
		console.log("print inside performLinkAction feedJson:::::::",feedJson);
		if(linkActionObjData.hasOwnProperty("linkId"))
		{
			this.gridPerformLinkEmit.emit(feedJson);
		}
		else if(linkActionObjData.hasOwnProperty("action_id"))
		{
			this.gridPerformActionEmit.emit(feedJson);
		}
	}
	
	hideheader(event,CurrLineNo,data,editFlag,dashboardID)
	{
		console.log('Inside hideheader Print the CurrLineNo',CurrLineNo)
		if(editFlag == 'A')
		{
			const isChecked = (event.target as HTMLInputElement).checked;
			for(let i = 0; i < data.length; i++)
			{
				let visualName = data[i]['visual_name'].toUpperCase();
				if(data[i]['line_no'] == CurrLineNo && isChecked == true)
				{
					data[i]['hide_header'] = (event.target as HTMLInputElement).checked ? 'Y' : 'N';
					var headerId = 'gridsters_' + 'Hide_' +'headers_' +CurrLineNo+'_';
					var headerDashId = 'gridsters_' + 'Hide_' +'headers_' +CurrLineNo+'_'+dashboardID;
					if(document.getElementById(headerId) != null)
					{
						var showHideheader = document.querySelectorAll('#'+headerId);
						showHideheader.forEach((element: HTMLElement) => {
							console.log("print the element 603",element);
							element.style.display = 'none';
							let getGridsterItem = document.getElementById('gridster_item_ID_'+i);
							if (getGridsterItem != null) 
							{
								const height = getGridsterItem.offsetHeight;
								let visualHeight = height - 46;
								getGridsterItem.style.height = visualHeight+"px";
							} 
							if(data[i]['visual_name'].includes('Card') || data[i]['visual_name'].includes('CARD') || data[i]['visual_name'].includes('card'))
							{
								var visualContentId = 'visual_content_ID_Data_' +i;
								const visualContent = this.elementRef.nativeElement.querySelector('#'+visualContentId);
								if (visualContent != null) 
								{
									visualContent.classList.add('cardHeightVisualOnHideHeader');
									visualContent.classList.remove('cardHeightVisual');
								}
							}
							else
							{
								var visualContentId = 'visual_content_ID_Data_' +i;
								const visualContent = this.elementRef.nativeElement.querySelector('#'+visualContentId);
								if (visualContent != null) 
								{
									
									if(visualName == "COLUMN" || visualName == "BAR" || visualName == "LINE" || visualName == "SCATTER" || visualName == "PIE" || visualName == "STACKED COLUMN" || visualName == "COLUMN LINE" || visualName == "GRID" || visualName == "PIVOT")
									{
										visualContent.classList.add('otherVisualHeightOnHideHeader');
										visualContent.classList.remove('otherVisualHeight');
									}
									else
									{
										visualContent.classList.add('otherVisualHeightOnHideHeader');
										visualContent.classList.remove('customVisual');
									}
									//visualContent.classList.add('otherVisualHeightOnHideHeader');
									//visualContent.classList.remove('otherVisualHeight');
								}
							}
						});
					}
					if(document.getElementById(headerDashId) != null)
					{
						var showHideheader = document.querySelectorAll('#'+headerDashId);
						showHideheader.forEach((element: HTMLElement) => {
							console.log("print the element 603",element);
							element.style.display = 'none';
							let getGridsterItem = document.getElementById('gridster_item_ID_'+i);
							if (getGridsterItem != null) 
							{
								const height = getGridsterItem.offsetHeight;
								let visualHeight = height - 46;
								getGridsterItem.style.height = visualHeight+"px";
							} 
							if(data[i]['visual_name'].includes('Card') || data[i]['visual_name'].includes('CARD') || data[i]['visual_name'].includes('card'))
							{
								var visualContentId = 'visual_content_ID_Data_' +i;
								const visualContent = this.elementRef.nativeElement.querySelector('#'+visualContentId);
								if (visualContent != null) 
								{
									visualContent.classList.add('cardHeightVisualOnHideHeader');
									visualContent.classList.remove('cardHeightVisual');
								}
							}
							else
							{
								var visualContentId = 'visual_content_ID_Data_' +i;
								const visualContent = this.elementRef.nativeElement.querySelector('#'+visualContentId);
								if (visualContent != null) 
								{
									if(visualName == "COLUMN" || visualName == "BAR" || visualName == "LINE" || visualName == "SCATTER" || visualName == "PIE" || visualName == "STACKED COLUMN" || visualName == "COLUMN LINE" || visualName == "GRID" || visualName == "PIVOT")
									{
										visualContent.classList.add('otherVisualHeightOnHideHeader');
										visualContent.classList.remove('otherVisualHeight');
									}
									else
									{
										visualContent.classList.add('otherVisualHeightOnHideHeader');
										visualContent.classList.remove('customVisual');
									}
									//visualContent.classList.add('otherVisualHeightOnHideHeader');
									//visualContent.classList.remove('otherVisualHeight');
								}
							}
						});
					}
					data[i]['hide_header'] = "Y";
					this.dashboard[i]['visual']['hide_header'] = "Y";
					break;
				}
				else if(data[i]['line_no'] == CurrLineNo && isChecked == false)
				{
					data[i]['hide_header'] = (event.target as HTMLInputElement).checked ? 'Y' : 'N';
					var headerId = 'gridsters_' + 'Hide_' +'headers_' +CurrLineNo+'_';
					var headerDashId = 'gridsters_' + 'Hide_' +'headers_' +CurrLineNo+'_'+dashboardID;
					if(document.getElementById(headerId) != null)
					{
						var showHideheader = document.querySelectorAll('#'+headerId);
						showHideheader.forEach((element: HTMLElement) => {
							element.style.display = 'flex';
							let getGridsterItem = document.getElementById('gridster_item_ID_'+i);
							if (getGridsterItem != null) 
							{
								const height = getGridsterItem.offsetHeight;
								let visualHeight = height + 46;
								getGridsterItem.style.height = visualHeight+"px";
							} 
							if(data[i]['visual_name'].includes('Card') || data[i]['visual_name'].includes('CARD') || data[i]['visual_name'].includes('card'))
							{
								var visualContentId = 'visual_content_ID_Data_' +i;
								const visualContent = this.elementRef.nativeElement.querySelector('#'+visualContentId);
								if (visualContent != null) 
								{
									visualContent.classList.add('cardHeightVisual');
									visualContent.classList.remove('cardHeightVisualOnHideHeader');
								}
								else
								{
									var visualContentId = 'visual_content_ID_Data_' +i;
									const visualContent = this.elementRef.nativeElement.querySelector('#'+visualContentId);
									if (visualContent != null) 
									{
										if(visualName == "COLUMN" || visualName == "BAR" || visualName == "LINE" || visualName == "SCATTER" || visualName == "PIE" || visualName == "STACKED COLUMN" || visualName == "COLUMN LINE" || visualName == "GRID" || visualName == "PIVOT")
										{
											visualContent.classList.add('otherVisualHeight');
											visualContent.classList.remove('otherVisualHeightOnHideHeader');
										}
										else
										{
											visualContent.classList.add('customVisual');
											visualContent.classList.remove('otherVisualHeightOnHideHeader');
										}
										//visualContent.classList.add('otherVisualHeight');
										//visualContent.classList.remove('otherVisualHeightOnHideHeader');
									}
								}
							}
						});
					}
					if(document.getElementById(headerDashId) != null)
					{
						var showHideheader = document.querySelectorAll('#'+headerDashId);
						showHideheader.forEach((element: HTMLElement) => {
							element.style.display = 'flex';
							let getGridsterItem = document.getElementById('gridster_item_ID_'+i);
							if (getGridsterItem != null) 
							{
								const height = getGridsterItem.offsetHeight;
								let visualHeight = height + 46;
								getGridsterItem.style.height = visualHeight+"px";
							} 
							if(data[i]['visual_name'].includes('Card') || data[i]['visual_name'].includes('CARD') || data[i]['visual_name'].includes('card'))
							{
								var visualContentId = 'visual_content_ID_Data_' +i;
								const visualContent = this.elementRef.nativeElement.querySelector('#'+visualContentId);
								if (visualContent != null) 
								{
									visualContent.classList.add('cardHeightVisual');
									visualContent.classList.remove('cardHeightVisualOnHideHeader');
								}
							}
							else
							{
								var visualContentId = 'visual_content_ID_Data_' +i;
								const visualContent = this.elementRef.nativeElement.querySelector('#'+visualContentId);
								if (visualContent != null) 
								{
									if(visualName == "COLUMN" || visualName == "BAR" || visualName == "LINE" || visualName == "SCATTER" || visualName == "PIE" || visualName == "STACKED COLUMN" || visualName == "COLUMN LINE" || visualName == "GRID" || visualName == "PIVOT")
									{
										visualContent.classList.add('otherVisualHeight');
										visualContent.classList.remove('otherVisualHeightOnHideHeader');
									}
									else
									{
										visualContent.classList.add('customVisual');
										visualContent.classList.remove('otherVisualHeightOnHideHeader');
									}
									//visualContent.classList.add('otherVisualHeight');
									//visualContent.classList.remove('otherVisualHeightOnHideHeader');
								}
							}
						});
					}
					data[i]['hide_header'] = "N";
					this.dashboard[i]['visual']['hide_header'] = "N";
					break;
				}
			}
		}
		else
		{
			if(this.dashboard != undefined && this.dashboard != null && this.dashboard != '')
			{
				for(let i = 0; i < this.dashboard.length; i++)
				{
					let visualName = this.dashboard[i]['visual']['visual_name'].toUpperCase();
					if(this.dashboard[i]['visual']['hide_header'] != undefined && this.dashboard[i]['visual']['hide_header'] != null && this.dashboard[i]['visual']['hide_header'] != '')
					{
						if(this.dashboard[i]['visual']['hide_header'] == 'Y')
						{
							var headerId = 'gridsters_' + 'Hide_' +'headers_' +this.dashboard[i]['visual']['line_no']+'_'+dashboardID;
							if(document.getElementById(headerId) != null)
							{
								var showHideheader = document.querySelectorAll('#'+headerId);
								console.log('Print the showHideheader 598',showHideheader);
								showHideheader.forEach((element: HTMLElement) => {
									element.style.display = 'none';
									let getGridsterItem = document.getElementById('gridster_item_ID_'+i);
									if (getGridsterItem != null) 
									{
										const height = getGridsterItem.offsetHeight;
										let visualHeight = height - 46;
										getGridsterItem.style.height = visualHeight+"px";
									} 
									if(this.dashboard[i]['visual']['visual_name'].includes('Card') || this.dashboard[i]['visual']['visual_name'].includes('CARD') || this.dashboard[i]['visual']['visual_name'].includes('card'))
									{
										var visualContentId = 'visual_content_ID_Data_' +i;
										const visualContent = this.elementRef.nativeElement.querySelector('#'+visualContentId);
										if (visualContent != null) 
									    {
											visualContent.classList.add('cardHeightVisualOnHideHeader');
											visualContent.classList.remove('cardHeightVisual');
										}
									}
									else
									{
										var visualContentId = 'visual_content_ID_Data_' +i;
										const visualContent = this.elementRef.nativeElement.querySelector('#'+visualContentId);
										if (visualContent != null) 
										{
											if(visualName == "COLUMN" || visualName == "BAR" || visualName == "LINE" || visualName == "SCATTER" || visualName == "PIE" || visualName == "STACKED COLUMN" || visualName == "COLUMN LINE" || visualName == "GRID" || visualName == "PIVOT")
											{
												visualContent.classList.add('otherVisualHeightOnHideHeader');
												visualContent.classList.remove('otherVisualHeight');
											}
											else
											{
												visualContent.classList.add('otherVisualHeightOnHideHeader');
												visualContent.classList.remove('customVisual');
											}
											//visualContent.classList.add('otherVisualHeightOnHideHeader');
											//visualContent.classList.remove('otherVisualHeight');
										}
									}
								});
							}
							this.dashboard[i]['visual']['hide_header'] = "Y";
						}
						else if(this.dashboard[i]['visual']['hide_header'] == 'N')
						{
							var headerId = 'gridsters_' + 'Hide_' +'headers_' +this.dashboard[i]['visual']['line_no']+'_'+dashboardID;
							if(document.getElementById(headerId) != null)
							{
								var showHideheader = document.querySelectorAll('#'+headerId);
								showHideheader.forEach((element: HTMLElement) => {
									element.style.display = 'flex';
									let getGridsterItem = document.getElementById('gridster_item_ID_'+i);
									if (getGridsterItem != null) 
									{
										const height = getGridsterItem.offsetHeight;
										let visualHeight = height + 46;
										getGridsterItem.style.height = visualHeight+"px";
									} 
									if(this.dashboard[i]['visual']['visual_name'].includes('Card') || this.dashboard[i]['visual']['visual_name'].includes('CARD') || this.dashboard[i]['visual']['visual_name'].includes('card'))
									{
										var visualContentId = 'visual_content_ID_Data_' +i;
										const visualContent = this.elementRef.nativeElement.querySelector('#'+visualContentId);
										if (visualContent != null) 
									    {
											visualContent.classList.add('cardHeightVisual');
											visualContent.classList.remove('cardHeightVisualOnHideHeader');
										}
									}
									else
									{
										var visualContentId = 'visual_content_ID_Data_' +i;
										const visualContent = this.elementRef.nativeElement.querySelector('#'+visualContentId);
										if (visualContent != null) 
										{
											if(visualName == "COLUMN" || visualName == "BAR" || visualName == "LINE" || visualName == "SCATTER" || visualName == "PIE" || visualName == "STACKED COLUMN" || visualName == "COLUMN LINE" || visualName == "GRID" || visualName == "PIVOT")
											{
												visualContent.classList.add('otherVisualHeight');
												visualContent.classList.remove('otherVisualHeightOnHideHeader');
											}
											else
											{
												visualContent.classList.add('customVisual');
												visualContent.classList.remove('otherVisualHeightOnHideHeader');
											}
											//visualContent.classList.add('otherVisualHeight');
											//visualContent.classList.remove('otherVisualHeightOnHideHeader');
										}
									}
								});
							}
							this.dashboard[i]['visual']['hide_header'] = "N";         
						}
					}
				}
			}
		}
	}
	showErrorMessage(visualId: number) {
		this.errorVisualId = visualId;
		this.showErrorMessageOnHover = true;

	}
	
	hideErrorMessage() {
		this.showErrorMessageOnHover = false;
	}

	getErrorMessagesAsString(id): string {
		if (this.errorVisualId == id) 
		{
			return this.errorMessageJson[id];
		}
		
	}
	showErrorIcon(index) {
	    setTimeout(() => {
			var visualContentId = 'errorDivID_' + index;
			let errorData:any 
			if (visualContentId != null) 
			{
			errorData = this.elementRef.nativeElement.querySelector('#'+visualContentId);
			errorData.classList.remove('errorClass');
			errorData.classList.add('errorNextClass');							
			}
		}, 1400);
	}


	updateGridsterOptions(advanceLayoutProp)
	{
		console.log('PRINT dashboard LINE NO 1274 in updateGridsterOptions');
		console.log('PRINT dashboard LINE NO 1274 in updateGridsterOptions',this.dashboard);
		console.log('PRINT advanceLayoutProp LINE NO 1274 in updateGridsterOptions',advanceLayoutProp);
		this.advanceLayoutProp = advanceLayoutProp
		let margin;
		let outerMargin;
		let gridTypeValue 
		let compactTypeValue 
		let fixedColWidthValue 
		let fixedRowHeightValue 
		let maxColsValue 
		let resizableValue 
		let draggableValue 
		let displayGridValue 
		let pushItemsValue 
		let keepFixedHeightInMobile;
		let addEmptyRowsCount;
		let setGridSize;
		if(this.advanceLayoutProp)
		{
			margin = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('margin'))?.margin;
			outerMargin = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('outerMargin'))?.outerMargin;
			gridTypeValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('gridType'))?.gridType;
			compactTypeValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('compactType'))?.compactType;
			fixedColWidthValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('fixedColWidth'))?.fixedColWidth;
			fixedRowHeightValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('fixedRowHeight'))?.fixedRowHeight;
			maxColsValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('maxCols'))?.maxCols;
			resizableValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('resizable'))?.resizable;
			draggableValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('draggable'))?.draggable;
			displayGridValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('displayGrid'))?.displayGrid;
			pushItemsValue = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('pushItems'))?.pushItems;
			keepFixedHeightInMobile = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('keepFixedHeightInMobile'))?.keepFixedHeightInMobile;
			addEmptyRowsCount = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('addEmptyRowsCount'))?.addEmptyRowsCount;
			setGridSize = this.advanceLayoutProp['advanceLayout'].find(item => item.hasOwnProperty('setGridSize'))?.setGridSize;
		}
		console.log('margin LINE NO 1271 when isSidePnl false ', margin,gridTypeValue,compactTypeValue,fixedColWidthValue,fixedRowHeightValue
		,maxColsValue,resizableValue,draggableValue,displayGridValue,pushItemsValue,keepFixedHeightInMobile,addEmptyRowsCount,setGridSize);

		this.options = {
			initCallback: BBGridsterComponent.change,
			destroyCallback: BBGridsterComponent.change,
			gridSizeChangedCallback: BBGridsterComponent.change,
			itemInitCallback: BBGridsterComponent.change,
			itemRemovedCallback: BBGridsterComponent.change,
			itemChangeCallback: BBGridsterComponent.itemChange,
			itemResizeCallback: BBGridsterComponent.itemResize,
			margin : margin,
			outerMargin:outerMargin,
			gridType: gridTypeValue,
			  compactType: compactTypeValue,
			fixedColWidth: fixedColWidthValue,
			fixedRowHeight: fixedRowHeightValue,
			maxCols:maxColsValue,
			draggable: {
				enabled: draggableValue
			},
			resizable: {
				enabled: resizableValue
			},
			displayGrid:displayGridValue,
			pushItems:pushItemsValue,
			keepFixedHeightInMobile:keepFixedHeightInMobile,
			addEmptyRowsCount:addEmptyRowsCount,
			setGridSize:setGridSize
		};
		console.log('PRINT options LINE NO 1329 in updateGridsterOptions',this.options);
		this.itemChange(null, null);
	}
}