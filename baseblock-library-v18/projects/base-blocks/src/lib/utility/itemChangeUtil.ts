import { Component, OnInit, Input, Output, EventEmitter, HostListener, AfterViewInit, OnDestroy, Injectable, signal } from '@angular/core';
import { HttpRequestService } from '../httpRequest/requestBuilder.service';
import { HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';

@Injectable({
	providedIn: 'root'
})
export class ItemChangeUtils implements OnInit {
	noOfForms: any;
	allformValues: any = {};
	objName: string;
	handleResponse: boolean = true;
	prevItemChangeTrailObj:any = {};
	visibleAttribParams:any = {};
	protectAttribParams:any = {};
	callBackFunction: any;
	prevItemChangeStateFull = [];
	formWiseFormatJson: any = {};

	constructor(
		public _httpRequestService: HttpRequestService, public datePipe: DatePipe) {
		_httpRequestService.httpMethod = 'POST';
		_httpRequestService.httpHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
	}
	ngOnInit() 
	{

	}

	stateFulItemChange(columnName: any, columnValue: any, objCtx: any, editorId: any, chgString: any, formWiseFormatJson: any, dummyInt: any, domID?: any, forms?: any, detailRowNo?: any) 
	{
		this.formWiseFormatJson = formWiseFormatJson
		let formDetail = 'Detail' + objCtx +'_'+ domID;
		// if( this.prevItemChangeTrailObj[columnName + '_' + objCtx] !== columnValue )
		if(objCtx == '1')
		{
			this.noOfForms = forms;
			let paramMap: any = {};
			let paramString = "";
			paramMap["OBJ_NAME"] = this.objName;
			paramMap["ACTION"] = "ITEM_CHANGE";
			paramMap["OBJ_CTX"] = objCtx;
			paramMap["PAGE_CTX"] = "2";
			paramMap["EDITOR_ID"] = editorId;
			paramMap["RTEURN_TYPE"] = "Json";
			paramMap["CHG_STR"] = chgString;
			paramMap["FIELD_NAME"] = columnName;
			paramMap["dummyInt"] = dummyInt;
			// console.log("print line no 37...paramMap", paramMap);
			paramString = this._httpRequestService.getEncodedParamString(paramMap);
			let url = this._httpRequestService.getHostURL() + '/ibase/E12EditorHandlerServlet';
			this.prevItemChangeStateFull.push(formDetail);
			// console.log("print line no 56 prevItemChangeStateFull",this.prevItemChangeStateFull);
			this._httpRequestService.httpMethod = "POST";
			this._httpRequestService.sendRequest(url, paramString, (data: any) => {
				this._httpRequestService.setLoading(false);
				let callbackResp = data.split('%%SEP%%');
				data = callbackResp[0];
				// console.log("print line no 38 data", data);
				// callback(data);
					// console.log("print line no 38 this.handleResponse", this.handleResponse);
				if(this.handleResponse)
				{
					this.handleServerResponse(data, detailRowNo, formWiseFormatJson, domID, columnName)
				}
				else
				{
					// console.log('28022024 returning data ', data);
					this.callBackFunction(data);
				}
			});
		}
		else
		{
			// if(this.prevItemChangeStateFull.find((domid: any) => domid !== formDetail))
			{
				this.noOfForms = forms;
				let paramMap: any = {};
				let paramString = "";
				paramMap["OBJ_NAME"] = this.objName;
				paramMap["ACTION"] = "ITEM_CHANGE";
				paramMap["OBJ_CTX"] = objCtx;
				paramMap["PAGE_CTX"] = "2";
				paramMap["EDITOR_ID"] = editorId;
				paramMap["RTEURN_TYPE"] = "Json";
				paramMap["CHG_STR"] = chgString;
				paramMap["FIELD_NAME"] = columnName;
				paramMap["dummyInt"] = dummyInt;
				// console.log("print line no 37...paramMap", paramMap);
				paramString = this._httpRequestService.getEncodedParamString(paramMap);
				let url = this._httpRequestService.getHostURL() + '/ibase/E12EditorHandlerServlet';
				this.prevItemChangeStateFull.push(formDetail);
				// this.prevItemChangeStateFull = formDetail;
				// console.log("print line no 96 prevItemChangeStateFull",this.prevItemChangeStateFull);
				// this.prevItemChangeStateFull = formDetail;
				this._httpRequestService.httpMethod = "POST";
				this._httpRequestService.sendRequest(url, paramString, (data: any) => {
					this._httpRequestService.setLoading(false);
					let callbackResp = data.split('%%SEP%%');
					data = callbackResp[0];
					// console.log("print line no 113 data", data);
					// callback(data);
					// console.log("print line no 115 this.handleResponse", this.handleResponse);
					if(this.handleResponse)
					{
						this.handleServerResponse(data, detailRowNo, formWiseFormatJson, domID, columnName)
					}
					else
					{
						// console.log('28022024 returning data ', data);
						this.callBackFunction(data);
					}
				});
			}
		}
	}

	setModel(data: any) 
	{
		this.allformValues = data;
	}

	handleServerResponse(values: any, index: any, formWiseFormatJson: any, domID: any, columnName?: any) 
	{
		try 
		{
			// console.log('Print line no 66 values::::: [' + values + ']');
			let isValidJson = this.isJsonString(values);
			if(isValidJson)
			{
				let details = JSON.parse(values);
				let itemChnageValues: any = {};
				let maxFormNo = this.noOfForms;
				let currentDetail;
				if (values.indexOf('Errors') != -1) 
				{
					this.checkError(values);
				}
				else 
				{
					for (let i = 0; i < maxFormNo; i++) 
					{
						let curronFormNo = i + 1;
						let currentFormNoDetail = 'Detail' + curronFormNo;
						// let detailNum = currentFormNoDetail.length;
						if (details && details.Root && details.Root[currentFormNoDetail]) 
						{
							itemChnageValues = details.Root[currentFormNoDetail];
							let domID = itemChnageValues['domID'];
							if(itemChnageValues)
							{
								if (currentFormNoDetail == 'Detail1') 
								{
									for (let key in itemChnageValues) 
									{
										if (itemChnageValues[key] && itemChnageValues[key].protect) 
										{
											if(this.allformValues && this.allformValues[key])
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
										}
										else
										{
											if(this.allformValues && this.allformValues[key])
											{
												this.allformValues[key+'_protect'] = "0";
											}
										}
										if (itemChnageValues[key] && itemChnageValues[key].visible) 
										{
											if(this.allformValues && this.allformValues[key])
											{
												this.allformValues[key+"_visible"] = itemChnageValues[key].visible;
											}
										}
										else
										{
											if(this.allformValues && this.allformValues[key])
											{
												this.allformValues[key+"_visible"] = "";
											}
										}
										if (itemChnageValues[key] && (itemChnageValues[key].content || itemChnageValues[key].content == 0)) 
										{
											let value = itemChnageValues[key].content;
											this.allformValues[key] = value;
											this.checkProtectAndvisibleforFirstForm(itemChnageValues, key);
										}
										else 
										{
											let value = itemChnageValues[key];
											if (value instanceof Object) 
											{
												if (value instanceof Array) 
												{
													value = value[0]
												}
												else if(value.content)
												{
													value = value.content;
												}
												else 
												{
													value = "";
												}
											}
											// this.allformValues[key] = value;
											let objKey = currentFormNoDetail + '.' + domID + '.' + key;
											if (this.checkIsDateFormat(key, curronFormNo)) 
											{
												this.allformValues[key] = this.convertStringToDate(value);
											} 
											else 
											{
												this.allformValues[key] = signal('');
												this.allformValues[key] = value;
											}
											this.checkProtectAndvisibleforFirstForm(itemChnageValues, key);
										}
										// Added by Samruddhi for item change not working in first form on first blur
										if(this.allformValues.hasOwnProperty(columnName+'_ISCHANGE') && this.allformValues[columnName+'_ISCHANGE'] == false)
										{
											this.allformValues[columnName+'_ISCHANGE'] = true;
										}
									}
								}
								else 
								{
									for (const key of Object.keys(itemChnageValues)) 
									{
										let id = currentFormNoDetail + '.' + domID + '.' + key;
										let formId = currentFormNoDetail + '-' + domID + '-' + key;
										if (itemChnageValues[key] && itemChnageValues[key].protect) 
										{
											if(this.allformValues && this.allformValues[currentFormNoDetail] && this.allformValues[currentFormNoDetail][index])
											{
												if(itemChnageValues[key].protect.toString() == "")
												{
													this.allformValues[currentFormNoDetail][index][key+'_protect'] = "0";
												}
												else
												{
													this.allformValues[currentFormNoDetail][index][key+'_protect'] = itemChnageValues[key].protect.toString();
												}
											}
										}
										else
										{
											if(this.allformValues && this.allformValues[currentFormNoDetail] && this.allformValues[currentFormNoDetail][index])
											{
												this.allformValues[currentFormNoDetail][index][key+'_protect'] = "0";
											}
										}
										if (itemChnageValues[key] && itemChnageValues[key].visible) 
										{
											if(this.allformValues && this.allformValues[currentFormNoDetail] && this.allformValues[currentFormNoDetail][index])
											{
												this.allformValues[currentFormNoDetail][index][key+"_visible"] = itemChnageValues[key].visible;
											}
										}
										else
										{
											if(this.allformValues && this.allformValues[currentFormNoDetail] && this.allformValues[currentFormNoDetail][index])
											{
												this.allformValues[currentFormNoDetail][index][key+"_visible"] = "";
											}
										}
										if (itemChnageValues[key] && (itemChnageValues[key].content || itemChnageValues[key].content == 0)) 
										{
											let value = itemChnageValues[key].content;
											if(this.allformValues && this.allformValues[currentFormNoDetail] && this.allformValues[currentFormNoDetail][index])
											{
												let objKey = currentFormNoDetail + '.' + domID + '.' + key;
												if (this.checkIsDateFormat(key, curronFormNo)) 
												{
													this.allformValues[currentFormNoDetail][index][key] = this.convertStringToDate(value);
												}
												else
												{
													this.allformValues[currentFormNoDetail][index][key] = signal('');
													this.allformValues[currentFormNoDetail][index][key] = value;
												}
											}
											this.checkProtectAndVisbile(itemChnageValues, key, id, formId);
										}
										else 
										{
											let value = itemChnageValues[key];
											if (value instanceof Object) 
											{
												// value = "";
												if(value.protect)
												{
													if(this.allformValues && this.allformValues[currentFormNoDetail] && this.allformValues[currentFormNoDetail][index])
													{
														if(value.protect.toString() == "")
														{
															this.allformValues[currentFormNoDetail][index][key+'_protect'] = "0";
														}
														else
														{
															this.allformValues[currentFormNoDetail][index][key+'_protect'] = value.protect.toString();
														}
													}
												}
												else
												{
													if(this.allformValues && this.allformValues[currentFormNoDetail] && this.allformValues[currentFormNoDetail][index])
													{
														this.allformValues[currentFormNoDetail][index][key+'_protect'] = "0";
													}
												}
												if(value.visible)
												{
													if(this.allformValues && this.allformValues[currentFormNoDetail] && this.allformValues[currentFormNoDetail][index])
													{
														this.allformValues[currentFormNoDetail][index][key+'_visible'] = value.visible.toString();
													}
												}
												else
												{
													if(this.allformValues && this.allformValues[currentFormNoDetail] && this.allformValues[currentFormNoDetail][index])
													{
														this.allformValues[currentFormNoDetail][index][key+'_visible'] = "";
													}
												}
												if(value.content)
												{
													value = value.content;
												}
												else
												{
													value = "";
												}
											}
											if(this.allformValues && this.allformValues[currentFormNoDetail] && this.allformValues[currentFormNoDetail][index])
											{
												let objKey = currentFormNoDetail + '.' + domID + '.' + key;
												if (this.checkIsDateFormat(key, curronFormNo)) 
												{
													this.allformValues[currentFormNoDetail][index][key] = this.convertStringToDate(value);
												}
												else
												{
													this.allformValues[currentFormNoDetail][index][key] = signal('');
													this.allformValues[currentFormNoDetail][index][key] = value;
												}
											}
											this.checkProtectAndVisbile(itemChnageValues, key, id, formId);
										}
									}
								}
							}
						}
					}
				}
				// console.log("print line no 362 this.allformValues:::", JSON.stringify(this.allformValues));
				// console.log("print line no 154 this.allformValues", this.allformValues);
				// console.log("print line no 142 this.data",this.data);
			}
		}
		catch (error)
		{
			console.log('Exception inside handleServerResponse::::',error);
		}
	}

	isJsonString(str) 
	{
		try 
		{
			JSON.parse(str);
			return true;
		} 
		catch (e) 
		{
			return false;
		}
	}

	statelessItemChange(fieldName: any, formNo: any, currentDomID: any, fieldValue: any, editFlag: any, formWiseFormatJson: any, noOfForms?: any, indexNew?: any)
	{
		// console.log('statelessItemChange fieldValue 28022024:::::: ', fieldValue);
		// console.log('statelessItemChange this.prevItemChangeTrailObj[fieldName_formNo] 28022024:::::: ', this.prevItemChangeTrailObj[fieldName + '_' + formNo]);
		this.formWiseFormatJson = formWiseFormatJson;
		if( this.prevItemChangeTrailObj[fieldName + '_' + formNo] !== fieldValue || fieldName == 'itm_default' || fieldName == 'itm_defaultedit' )
		{
			this.noOfForms = noOfForms;
			
			let tmpData: any = {};
			let allFormData: any = {};
			let formNum = Number(formNo);
	
			for (let index = 1; index <= formNum; index++) 
			{
				let currFormNo: any = index;
				// console.log('28022024 statelessItemChange currFormNo:: [', currFormNo, '] formNo [', formNo, ']');
				if (currFormNo == '1') 
				{
					if(this.allformValues)
					{
						let domId = "1";
						if(this.allformValues['domID'])
						{
							domId = this.allformValues['domID'];
						}
						Object.keys(this.allformValues).forEach((fldName) => {
							if (!/^Detail([2-9]|[1-9][0-9])$/.test(fldName)) 
							{
								let key = 'Detail' + currFormNo + '.' + domId + '.' + fldName;
								if (fldName == 'attribute') 
								{
									let attributeJSON = this.allformValues['attribute'];
									if (attributeJSON instanceof Object) 
									{
										for (let currAttribute in attributeJSON) 
										{
											let attrKey = 'Detail' + currFormNo + '.' + domId + '.' + currAttribute;
											allFormData[attrKey] = attributeJSON[currAttribute];
										}
									}
								}
								else 
								{
									let fldValue: any = this.allformValues[fldName];
									// console.log('statelessItemChange Value date 231::: [', fldValue, '] currentFieldValue:::[',fieldValue,']');
									if(this.checkIsDateFormat(key, currFormNo))
									{
										try 
										{
											if (fldValue != null) 
											{
												if(fldValue.toString().includes(':'))
												{
													fldValue = this.formatDate(fldValue);
												}
												else
												{
													fldValue = this.datePipe.transform(fldValue, 'dd/MM/yy');	
												}
													// console.log('statelessItemChange Value date 217::: ', fldValue);
											}
										} 
										catch (error) 
										{
											console.log('couldnt transForm the date:::: ', error);
											fldValue = this.allformValues[fldName];
										}
									}
		
									if (fldValue instanceof Object || fldValue == null || fldValue == 'null' || fldValue == undefined) 
									{
										fldValue = "";
									}
									allFormData[key] = fldValue;
								}
							}
						});
					}
				}
				else 
				{
					let curIndex = 0;
					let detailForm = 'Detail' + currFormNo;
					// console.log('28022024 statelessItemChange detailForm:: ', detailForm);
					if(this.allformValues && this.allformValues[detailForm])
					{
						for (let detailFormObj of this.allformValues[detailForm]) 
						{
							if(detailFormObj)
							{
								let domId = "1";
								if(detailFormObj['domID'])
								{
									domId = detailFormObj['domID'];
								}
								if (formNo == currFormNo && curIndex > index) 
								{
									break;
								}
								Object.keys(detailFormObj).forEach((fldName) => {
									let key = 'Detail' + currFormNo + '.' + domId + '.' + fldName;
									if (fldName == 'attribute') 
									{
										let attributeJSON = detailFormObj['attribute'];
										if (attributeJSON instanceof Object) 
										{
											for (let currAttribute in attributeJSON) 
											{
												let attrKey = 'Detail' + currFormNo + '.' + domId + '.' + currAttribute;
												allFormData[attrKey] = attributeJSON[currAttribute];
											}
										}
									}
									else 
									{
										let fldValue: any = detailFormObj[fldName];
										if(this.checkIsDateFormat(key, currFormNo))
										{
											try 
											{
												if (fldValue != null) 
												{
													if(!fldValue.toString().includes('/'))
													{
														if(fldValue.toString().includes(':'))
														{
															fldValue = this.formatDate(fldValue);
														} 
														else
														{
															fldValue = this.datePipe.transform(fldValue, 'dd/MM/yy');	
														}
														// console.log('statelessItemChange Value date 280::: ', fldValue);
													}
												}
											} 
											catch (error) 
											{
												console.log('couldnt transForm the date 281', error);
												fldValue = detailFormObj[fldName];
											}
										}
			
										if (fldValue instanceof Object || fldValue == 'null' || fldValue == undefined) 
										{
											fldValue = "";
										}
										allFormData[key] = detailFormObj[fldName];
									}
								});
								curIndex++;
							}
						}
					}
				}
			}
	
			// console.log('statelessItemChange allFormData 296:::::: ', allFormData);
			
			tmpData = allFormData;
			tmpData["ACTION"] = "default_data_wiz";
			tmpData["OBJ_NAME"] = this.objName;
			tmpData["OBJ_CTX"] = formNo;
			tmpData["FOCUSED_COL"] = "Detail" + formNo + "." + currentDomID + "." + fieldName;
			tmpData["EDIT_FLAG"] = editFlag;
			tmpData["OUTPUT"] = "JSON";
			// console.log("print line no 317 tmpData", tmpData);
			let paramDataString = this._httpRequestService.getEncodedParamString(tmpData);
			// console.log('statelessItemChange paramDataString 306:::::: ', paramDataString);
			let serviceUrl = this._httpRequestService.getHostURL() + '/ibase/E12SingleTranEditorServlet';
			this.prevItemChangeTrailObj[fieldName + '_' + formNo] = fieldValue;
			this._httpRequestService.httpMethod = "POST";
			this._httpRequestService.sendRequest(serviceUrl, paramDataString, (response: any) => {
				this._httpRequestService.setLoading(false);
				let callBackResponse = response.split('%%SEP%%');
				let isError = callBackResponse[1];
				if (!(isError == 'true')) 
				{
					let result: any = callBackResponse[0];
					// console.log('statelessItemChange result 316:::::: ', result);
					if(this.handleResponse)
					{
						this.handleServerResponse(result, indexNew, formWiseFormatJson, currentDomID);
						return;
					}
					else
					{
						// console.log('28022024 returning result ', result);
						this.callBackFunction(result);
					}
				}
			});
		}
	}

	checkError(serverData:any) 
	{
		let errorData: any[] = this._httpRequestService.getErrorData(serverData);
		let msg = errorData[0] != undefined ? errorData[0] : "";
		let msgDescr = errorData[1] != undefined ? errorData[1] : "";
		let msgTrace = errorData[2] != undefined ? errorData[2] : "";
		let errMsg = this._httpRequestService.getErrorMsg(msg, msgDescr, msgTrace);
		console.log('errMsg', errMsg);
		this._httpRequestService.setLoading(false);
		alert(errMsg);
	}

	checkProtectAndvisibleforFirstForm(itemChnageValues:any, key:any) 
	{
		let id = 'Detail1.1.' + key;
		let inputID = 'Detail1-1-' + key;		
		const elem:any = document.getElementById(id);
		let format;
		// console.log('Print elem inside checkProtectAndvisibleforFirstForm::: ', elem);
		if (elem != null) 
		{
			format = elem.getAttribute('format');
			// console.log('Print line inside checkProtectAndvisibleforFirstForm 1534 ', format);
			if (itemChnageValues && itemChnageValues[key] && itemChnageValues[key].protect != undefined && itemChnageValues[key].protect != '' && itemChnageValues[key].protect.toString()) 
			{
				this.protectAttribParams[id] = itemChnageValues[key].protect;
				if (itemChnageValues[key].protect.toString() == '1' || itemChnageValues[key].protect == 1) 
				{
					if (format == 'dateBox') 
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
							}
						}
					}
					else 
					{
						if(elem && elem.parentElement && !elem.parentElement.classList.contains('noPlaceholderIsDisable'))
						{
							let matFormData = elem.querySelector('mat-form-field');
							if(matFormData)
							{
								matFormData.classList.add('mat-form-field-disabled');
							}
						}
						let inputData = elem.querySelector('input');
						if (inputData && !inputData.hasAttribute('disabled'))
						{
							inputData.setAttribute('disabled', 'true');
						}
						if (elem && !elem.hasAttribute('disabled')) 
						{
							elem['disabled'] = true;
						}
						/* let nextElem = elem.nextElementSibling;
						console.log('Print nextElem inside checkProtectAndvisibleforFirstForm 478::: ', nextElem);
						if (nextElem != null && !nextElem.classList.contains('disablePopHelp')) 
						{
							nextElem.classList.add("disablePopHelp");
						} */
						if(document.getElementById(inputID))
						{
							let nextElem = document.getElementById(inputID).nextElementSibling;
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
				else if (itemChnageValues && itemChnageValues[key] && (itemChnageValues[key].protect == undefined || (itemChnageValues[key].protect != undefined && itemChnageValues[key].protect != '' && ((itemChnageValues[key].protect.toString() && itemChnageValues[key].protect.toString() == '0') || itemChnageValues[key].protect == 0))))
				{
					if (format == 'dateBox') 
					{
						let datePickerElem = elem.parentElement.nextElementSibling.firstElementChild.firstElementChild;
						if (elem && elem.hasAttribute('disabled')) 
						{
							elem.removeAttribute('disabled');
						}
						if (datePickerElem && datePickerElem.hasAttribute('disabled')) 
						{
							datePickerElem.removeAttribute('disabled');
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
						/* let nextElem = elem.nextElementSibling;
						console.log('Print nextElem inside checkProtectAndvisibleforFirstForm 523::: ', nextElem);			
						if (nextElem != null && nextElem.classList.contains('disablePopHelp')) 
						{
							nextElem.classList.remove(("disablePopHelp"));
						} */
						if(document.getElementById(inputID))
						{
							let nextElem = document.getElementById(inputID).nextElementSibling;
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
			}
			else 
			{
				this.protectAttribParams[id] = "";
			}
			// console.log('print visible on line 1390:: ', itemChnageValues[key].visible);
			if (itemChnageValues && itemChnageValues[key] && itemChnageValues[key].visible && !(itemChnageValues[key].visible == '')) 
			{
				this.visibleAttribParams[id] = itemChnageValues[key].visible;
				let matFormField = elem.parentElement.parentElement.parentElement.parentElement;
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

	checkProtectAndVisbile(itemChnageValues:any, key:any, id:any, formId: any) 
	{
		if (itemChnageValues && itemChnageValues[key] && itemChnageValues[key].protect != undefined && itemChnageValues[key].protect != '' && itemChnageValues[key].protect.toString()) 
		{
			this.protectAttribParams[id] = itemChnageValues[key].protect;
			if (itemChnageValues[key].protect == '1' || itemChnageValues[key].protect == 1) 
			{
				if (document.getElementById(id) != null) 
				{
					if (!document.getElementById(id)?.classList.contains('disableCellData')) 
					{
						document.getElementById(id)?.classList.add("disableCellData");
					}
					let nextElem = document.getElementById(id)?.nextElementSibling;
					if (nextElem != null) 
					{
						// document.getElementById(id)?.nextElementSibling?.classList.add("disablePopHelp");
						nextElem.setAttribute('style', 'display: none');
						if(nextElem.nextElementSibling && !nextElem.nextElementSibling.classList.contains('disablePopHelp'))
						{
							nextElem.nextElementSibling.classList.add("disablePopHelp");
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
							let nextElem = document.getElementById(formId).nextElementSibling;
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
			else if (itemChnageValues && itemChnageValues[key] && itemChnageValues[key].protect != undefined && itemChnageValues[key].protect != '' && itemChnageValues[key].protect.toString() && (itemChnageValues[key].protect.toString() == '0' || itemChnageValues[key].protect == 0))
			{
				if (document.getElementById(id) != null) 
				{
					if (document.getElementById(id)?.classList.contains('disableCellData')) 
					{
						document.getElementById(id)?.classList.remove(("disableCellData"));
					}
					let inputData = document.getElementById(id)?.querySelector('input');
					if (inputData && inputData.hasAttribute('disabled'))
					{
						inputData.removeAttribute('disabled');
					}
					if (document.getElementById(id) && document.getElementById(id)?.hasAttribute('disabled')) 
					{
						document.getElementById(id)['disabled'] = false;
					}
					let nextElem = document.getElementById(id)?.nextElementSibling;
					if (nextElem != null) 
					{
						// document.getElementById(id)?.nextElementSibling?.classList.remove(("disablePopHelp"));
						nextElem.setAttribute('style', 'display: block');
						if(nextElem.nextElementSibling && nextElem.nextElementSibling.classList.contains('disablePopHelp'))
						{
							nextElem.nextElementSibling.classList.remove(("disablePopHelp"));
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
							let nextElem = document.getElementById(formId).nextElementSibling;
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
		if (itemChnageValues && itemChnageValues[key] && itemChnageValues[key].visible) 
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

	convertStringToDate(value: string): Date 
	{
		let newarrayDate = value.split('/');
		let newvalidDate = newarrayDate[1] + '/' + newarrayDate[0] + '/' + newarrayDate[2];
		let newDate =  new Date(newvalidDate);
		return newDate;
	}

	formatDate(dateVal: Date): string
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

}

