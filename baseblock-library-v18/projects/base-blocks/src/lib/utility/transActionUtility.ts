import { Component, OnInit, Injectable } from '@angular/core';
import { HttpRequestService } from '../httpRequest/requestBuilder.service';
import { HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';

@Injectable({
	providedIn: 'root'
})

export class TransActionUtility implements OnInit {

	constructor(public _httpRequestService: HttpRequestService, public datePipe: DatePipe) { }

	ngOnInit(): void 
	{
	}
	
	onValidateDetail(objName: any, finalXml: any, editorId: any, formNo: any, pkValue: any, domID: any, returnType: any, callback: any) 
	{
		var paramMap: any = {};
		paramMap['OBJ_NAME'] = objName;
		paramMap['CHG_STR'] = finalXml;
		paramMap['EDIT_FLAG'] = 'A';
		paramMap['EDITOR_ID'] = editorId;
		paramMap['ACTION'] = "ADD_DETAIL_DOM";
		paramMap['OBJ_CTX'] = formNo;
		paramMap['PK_VLAUES'] = "";
		paramMap['PK_VALUES'] = pkValue;
		paramMap['DOM_ID'] = domID;
		paramMap['EDITOR'] = "MobEditor";
		paramMap["RTEURN_TYPE"] = returnType;
		paramMap["FORM_NO"] = formNo;
		// console.log("paramMAP LIne no 33",paramMap);
		var paramString = this._httpRequestService.getEncodedParamString(paramMap);
		var url = this._httpRequestService.getHostURL() + '/ibase/E12EditorHandlerServlet';
		this._httpRequestService.setLoading(true);
		this._httpRequestService.httpMethod = "POST";
		this._httpRequestService.sendRequest(url, paramString, (preValidateResponase: any) => {
			// console.log('print line no 49 preValidateResponase', preValidateResponase);
			this._httpRequestService.setLoading(false);
			callback(preValidateResponase);
		});
	}
	
	onAddNewDetail(objName:any,formNo:any,editorId:any,pkValue:any,previousDomId:any,returnType:any,callback: any)
	{
		var paramMap:any = {};
		paramMap['OBJ_NAME'] = objName;
		paramMap['OBJ_CTX'] = formNo;
		paramMap['EDIT_FLAG'] = 'A';
		paramMap['EDITOR_ID'] = editorId;
		paramMap['ACTION'] = 'XML_DATA_DETAIL';
		paramMap['FORM_NO'] = formNo;
		paramMap['PK_VALUES'] = pkValue;
		paramMap['FORM_TYPE'] = '';
		paramMap['LAST_DOM_ID'] = previousDomId;
		paramMap['PG_CTX'] = '1';
		paramMap['RTEURN_TYPE'] = returnType;
		var paramString = this._httpRequestService.getEncodedParamString(paramMap);
		var url = this._httpRequestService.getHostURL() + '/ibase/E12EditorHandlerServlet';
		this._httpRequestService.setLoading(true);
		this._httpRequestService.httpMethod = "POST";
		this._httpRequestService.sendRequest(url, paramString, (responase: any) => {
			// console.log('print line no 75 responase', responase);
			this._httpRequestService.setLoading(false);
			callback(responase);
		});
	}
	
	onNext(objName:any,chgString:any,editFlag:any,editorId:any,currentFormNo:any,previousDomId:any,pkValue:any,returnType:any,callback: any)
	{
		var paramMap:any = {};
		paramMap['OBJ_NAME'] = objName;
		paramMap['CHG_STR'] = chgString;
		paramMap['EDIT_FLAG'] = editFlag;
		paramMap['EDITOR_ID'] = editorId;
		paramMap['ACTION'] = "NEXT";
		paramMap['FORM_NO'] = currentFormNo;
		paramMap['OBJ_CTX'] = currentFormNo;
		paramMap['DOM_ID'] = previousDomId;
		paramMap['PK_VALUES'] =  pkValue;
		paramMap['EDITOR'] = "MobEditor";
		paramMap["RTEURN_TYPE"] = returnType;
		var paramString = this._httpRequestService.getEncodedParamString(paramMap);
		var url = this._httpRequestService.getHostURL() + '/ibase/E12EditorHandlerServlet';
		this._httpRequestService.setLoading(true);
		this._httpRequestService.httpMethod = "POST";
		this._httpRequestService.sendRequest(url, paramString, (response: any) => {
			// console.log('print line no 109 response', response);
			this._httpRequestService.setLoading(false);
			callback(response);
		});
	}
	
	onDeselect(selectedDetailData:any,objName:any,formNo:any,editorId:any,chgStrg:any,returnType:any,callback:any)
	{
		var paramMap:any = {};
		let objContext = formNo;
		for (var key of Object.keys(selectedDetailData)) 
		{
			var value = selectedDetailData[key];
			paramMap[key] = value;
			// console.log("print line no 1617 paramMap[key]",paramMap[key]);
		}
		paramMap['OBJ_NAME'] = objName;
		paramMap['FORM_NO'] = formNo;
		paramMap['OBJ_CTX'] = objContext;
		paramMap['ACTION'] = 'DESELECT';
		paramMap['EDITOR_ID'] = editorId;
		paramMap['CHG_STR'] = chgStrg
		paramMap['PK_VALUES'] = '';
		paramMap['EDIT_FLAG'] = 'D';
		paramMap['RTEURN_TYPE'] = returnType;
		paramMap['EDITOR'] = 'MobEditor';
		var paramString = this._httpRequestService.getEncodedParamString(paramMap);
		var url = this._httpRequestService.getHostURL() + '/ibase/E12EditorHandlerServlet';
		this._httpRequestService.setLoading(true);
		this._httpRequestService.httpMethod = "POST";
		this._httpRequestService.sendRequest(url, paramString, (dataOnDeleteDetail:any) => {
			// console.log("print line no 149 dataOnDeleteDetail",dataOnDeleteDetail);
			this._httpRequestService.setLoading(false);
			callback(dataOnDeleteDetail);
		});
	}
	
	onSave(objName:any,finalXml:any,currentFormNo:any,editFlag:any,editorId:any,domID:any,callback:any)
	{
		var paramMap:any = {};
		paramMap["OBJ_NAME"] = objName;
		paramMap["CHG_STR"] = finalXml;
		paramMap["FORM_NO"] = currentFormNo;
		paramMap["ACTION"] = "VAL_DATA";
		paramMap["SAVE_LVL"] = "1";
		paramMap["SAVE_DOCUMENT"] = "FALSE";
		paramMap["EDIT_FLAG"] = editFlag;
		paramMap["FORM_TYPE"] = "";
		paramMap["EDITOR_ID"] = editorId;
		paramMap["EDITOR"] = "MobEditor";
		paramMap["isAttachMandatory"] = "";
		paramMap["CALLER_INTERFACE"] = "BROWSER";
		paramMap["RTEURN_TYPE"] = "json";
		paramMap["IsExtractTemplate"] = "true";
		paramMap["IS_FORM_CHANGE"] = "true";
		// console.log("PRINT LINE NO 143 paramMap",paramMap);
		// if(editFlag == 'A')
		// {
		// 	paramMap["IS_FORM_CHANGE"] = "false";
		// }
		// else
		// {
		// 	paramMap["IS_FORM_CHANGE"] = "true";
		// }
		paramMap["DOM_ID"] = domID;
		var paramString = this._httpRequestService.getEncodedParamString(paramMap);
		var url = this._httpRequestService.getHostURL() + '/ibase/E12EditorHandlerServlet';
		this._httpRequestService.setLoading(true);
		this._httpRequestService.httpMethod = "POST";
		this._httpRequestService.sendRequest(url, paramString, (response:any) => {
			this._httpRequestService.setLoading(false);
			// console.log("print line no 179 response",response);
			callback(response);
		});
	}
}