import { Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay"; 
import { TitleCasePipe } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from "@angular/core";
import {BBCalColumnService} from './bb-cal-column-properties.service';
 


@Component( {
    selector: 'bb-cal-column-properties',
    templateUrl: './bb-cal-column-properties.component.html',
    styleUrls: ['./bb-cal-column-properties.component.css'],
    providers: [TitleCasePipe],
	// encapsulation: ViewEncapsulation.Emulated
})

export class BBCalColumnPropertiesComponent implements OnInit {
	
	passtempColExpressions:any;
	currentDetailJson:any = {};
	isFeedOpen: boolean = false;
	expFlag: boolean = false;
	panelOpenState: boolean = false;
	isExpandcalClose: boolean = true;
	calcType = "Map from Source";
	allformJsonCopy: any = {};
	calcFeedIndex: any;
	@Input() defaultVisual:any;
	@Input() currentVisual:any;
	@Input() currentAction:any
	@Input() editorVisuals:any;
	@Input() isDashboard:any;
	@Input() allformValues: any;
	@Input() getChangeData: any;
	@Input() detail:any;
	@Input() Detail2:any;
	@Input() onCloseActioncalColumnProperty:any;
	@Input() currentDetail2Name:any;
	@Input() calSequence: any;
	@Input() editFlag: any;
	@Input() tempColExpressions: any;
	overLayRefForCalColumn: OverlayRef | any;
	overlayRef: OverlayRef | any;
    @Output() onClosecalAction: EventEmitter<any> = new EventEmitter();
	@Output() currentCalId: EventEmitter<any> = new EventEmitter();
	@Output() performAction: EventEmitter<any> = new EventEmitter();
    @Output() onDoneCalColumnAction: EventEmitter<any> = new EventEmitter();
	@Output() deleteCalColumn: EventEmitter<any> = new EventEmitter();
	@Output() formChange: EventEmitter<any> = new EventEmitter();
	@Output() curColumnDescr: EventEmitter<any> = new EventEmitter();
	@Output() curExpressOnKeyUp: EventEmitter<any> = new EventEmitter();
	@Output() curChangeCalExp: EventEmitter<any> = new EventEmitter();
	//added by tejas and vikas on 29-12-22 for calculation panel updated ui [Start] 
	functionListJson:any;
	functionListArray:any = [];
	hideFunctionList: boolean = false;
	functionParamaterJson:any;
	functionParamaterArray:any = [];
	functionParameters:any;
	paramModelJson:any = {};
	functionName :any;
	@Input() isExpression :any;
	@Input() hideCalculationType:any;
	@Input() editFunctionListArray:any;
	@Input() editFunctionParameterData:any;
	@Input() editFunctionParamaterArray:any;
	@Input() hideFunctionListOnEdit:any;
	// Added by Sujan on 14-01-2023 to add drop down if function list contains model name 
	userInfo;
	modelScope = "Global";
	modelListData: any = [];
	showModelScope: boolean = false;
	//added by tejas and vikas on 29-12-22 for calculation panel updated ui [Start] 
	currentFunction:any;
	DDLBoptionArray: any = [];
	expression;
	functiontypeJson:any;
	functiontypeArray:any = [];
	constructor(private BBCalColumnService:BBCalColumnService,private titlecasePipe:TitleCasePipe) { }

	ngOnInit()
	{
		this.BBCalColumnService.getUserInfo().subscribe(/* happy path */ UserInfo => { 
            console.log("Print getUserInfo:userInfo 75:::::::",UserInfo); 
            this.userInfo = UserInfo;
        });

		console.log('Print inside calcolumnproperties ngOnInit allformValues::::::::::::::',this.allformValues);
		if(this.editFlag != "A"){}

		//Added by vikas on 27-12-22 for setting values in edit of add mode [Start]
		if(this.currentAction == 'edit')
		{
			this.hideFunctionList = this.hideFunctionListOnEdit;
			this.functionListArray =  this.editFunctionListArray;
			this.functionParamaterArray = this.editFunctionParamaterArray;
			this.functionParameters = this.editFunctionParameterData;
		}
		//Added by vikas on 27-12-22 for setting values in edit of add mode [End]
		//Added by Pranjali To Show Calculation Type From API [Start]
			let paramData: any = {};
			paramData["ACTION"] = "GET_FUNCTION_TYPE";
			var url = this.BBCalColumnService.getHostURL() + '/ibase/PreviewHandlerServlet';
			var paramString = this.BBCalColumnService.getEncodedParamString(paramData);
			this.BBCalColumnService.setLoading(true);
			this.BBCalColumnService.callRequest(url, paramString).subscribe( (data: any) => {
			this.BBCalColumnService.setLoading(false); 
			let callbackRespNew = data.split('%%SEP%%');
					data = callbackRespNew[0];
					let isError = callbackRespNew[0].trim();
					if (!(isError == 'true'))
					{
						this.functiontypeArray = JSON.parse(data);
					}
			});
			//Added by Pranjali To Show Calculation Type From API [End]
		
	}

   	popupClose(event: any)
    {
        this.overLayRefForCalColumn.dispose();        
    }
	
	closeFilter(event:any)
	{
		let closeAction:any = {};
		closeAction['event'] = event;
		this.onClosecalAction.emit(JSON.stringify(closeAction));
		let currentColArray = this.allformValues['Detail2'];
        for(let i = 0 ; i < currentColArray.length; i++)
        {
            if(this.calSequence == this.allformValues['Detail2'][i]['calc_seq'])
            {   
                this.allformValues['Detail2'][i] = JSON.parse(this.currentDetailJson);
                break;
            }
        }
	}

	//CHanged by vikas on 29-12-22 for setting type,expression and datatype on done and delete button [Start]
	onCalculationSubmit()
	{
		let index = this.calcFeedIndex;
		let calcolumndata: any = {};
		calcolumndata['calc_seq'] = this.calSequence;
		calcolumndata['calcFeedIndex'] = this.calcFeedIndex;
		calcolumndata['calc_type'] = this.allformValues['Detail2'][index]['calc_type']
		calcolumndata['col_datatype'] = this.allformValues['Detail2'][index]['col_datatype']
		calcolumndata['calc_expression'] = this.allformValues['Detail2'][index]['calc_expression']
		this.onDoneCalColumnAction.emit(JSON.stringify(calcolumndata));
	}

    onCalculationDelete()
	{
		let index = this.calcFeedIndex;
		let calColumnData: any = {};
		calColumnData['calc_seq'] = this.calSequence;
		calColumnData['calcFeedIndex'] = this.calcFeedIndex;
		calColumnData['calc_type'] = this.allformValues['Detail2'][index]['calc_type']
		calColumnData['col_datatype'] = this.allformValues['Detail2'][index]['col_datatype']
		calColumnData['calc_expression'] = this.allformValues['Detail2'][index]['calc_expression']
		this.deleteCalColumn.emit(JSON.stringify(calColumnData));
	}
	//CHanged by vikas on 29-12-22 for setting type,expression and datatype on done button [End]

	setIsFormChange(value: any)
    {
        let setFormChange: any = {};
        setFormChange['value'] = value;
        this.formChange.emit(JSON.stringify(setFormChange));
    }

	changeColumnDescr(detail: any)
    {
        let changeColDescr: any = {};
        changeColDescr['detail'] = detail;
        this.curColumnDescr.emit(JSON.stringify(changeColDescr));
    }
     // Added by tejas to set the column name and column description on calculation heading
	changeCalculationName(detail: any)
	{
		let changeCalName : any;
		let index = this.calcFeedIndex;
		changeCalName = this.allformValues['Detail2'][index]['col_heading'].replaceAll(" ","_").toLowerCase();
		this.allformValues['Detail2'][index]['col_name'] = changeCalName;
		this.allformValues['Detail2'][index]['col_descr'] = this.titlecasePipe.transform(detail['col_heading']);
	} 
    
	setCuurenValidationId(formNo: any, index: any)
	{
		let setcurValId: any = {};
        setcurValId['formNo'] = formNo;
        setcurValId['index'] = index;
		this.currentCalId.emit(JSON.stringify(setcurValId));
	}

	colExpressOnKeyUp(value: any, i: any)
    {
        let colExprOnKeyUp: any = {};
        colExprOnKeyUp['value'] = value;
        colExprOnKeyUp['index'] = i;
        this.curExpressOnKeyUp.emit(JSON.stringify(colExprOnKeyUp));
    }

    onChangeCalcExpr(event: any, ind: any)
    {
        let changeCalExpr: any = {};
        changeCalExpr['event'] = event;
        changeCalExpr['index'] = ind;
        this.curChangeCalExp.emit(JSON.stringify(changeCalExpr));
    }
	//Added by vikas on 27-12-22 for getting functionlist dropdown [Start]
	getFunctionList(event)
	{
		let index  = this.calcFeedIndex;
    	this.functionListArray = [];
		this.functionParamaterArray = [];
		this.functionParameters = [];
		this.currentFunction = event.value;
	    if(event.value == 'Local_AI_Function' || event.value == 'Local_Statistical_Function' || event.value == 'Cloud_AI_Function')
		{
        	this.hideFunctionList = false;
	      	let paramData: any = {};
		  	paramData["ACTION"] = "GET_FUNCTION_LIST";
		  	paramData["functionType"] = event.value;
		  	var url = this.BBCalColumnService.getHostURL() + '/ibase/PreviewHandlerServlet';
		  	var paramString = this.BBCalColumnService.getEncodedParamString(paramData);
		  	// this.BBCalColumnService.callRequest(url, paramString).subscribe( (data: any) => {
			this.BBCalColumnService.sendRequest(url, paramString, (data: any) => {
				let callbackRespNew = data.split('%%SEP%%');
				data = callbackRespNew[0];
				let isError = callbackRespNew[1].trim();
				if (!(isError == 'true'))
				{
				this.functionListJson = JSON.parse(data);
				for (const key in this.functionListJson) 
            	{
            	    this.functionListArray.push(key);
            	}
				}
			});
		}
		else if(event.value == 'SQL' || event.value == 'Lookup' || event.value == 'Cumulative_Sum' || event.value == 'Expression' || event.value == 'Conditional_Expression' || event.value == 'Map_from_Source' || event.value == 'Presentation')
		{
			if(event.value == 'SQL' || event.value == 'Lookup' || event.value == 'Cumulative_Sum' || event.value == 'Expression' || event.value == 'Conditional_Expression' || event.value == 'Presentation')
			{
				this.hideFunctionList = true;
			}
			this.allformValues['Detail2'][index]['function_name'] = event.value;
			this.getFunctionParameter(event);
		}
	//  Added by Sujan on 14-01-2023 to add drop down if function list contains model name 
		if(event.value == 'Local_AI_Function')
		{
			this.showModelScope = true;
			this.allformValues['Detail2'][index]['model_scope'] = 'G';
		}
		else
		{
			this.showModelScope = false;
		}
	}  
	//Added by vikas on 27-12-22 for getting functionlist dropdown [End]    

	//Added by vikas on 27-12-22 for getting function parameters on functionlist selection [Start]
	getFunctionParameter(event)
	{
		let index  = this.calcFeedIndex;
        this.functionParamaterArray = [];
		this.functionParameters = [];
		//  Added by Sujan on 14-01-2023 to add drop down if function list contains model name 
		if(this.currentFunction == 'Local_AI_Function')
		{
	    let paramModelData:any={};
	    paramModelData["enterprise"] = this.userInfo['result']['UserInfo']['enterprise'];
		paramModelData['function_name'] = this.allformValues['Detail2'][index]['function_name'];
		paramModelData['function_type'] = this.allformValues['Detail2'][index]['function_type'];
		paramModelData['model_scope'] = this.allformValues['Detail2'][index]['model_scope'];
		let paramModelString = this.BBCalColumnService.getEncodedParamString(paramModelData);
        var url = this.BBCalColumnService.getHostURL() + '/ibase/rest/GenProcessPreviewService/getModelScopeList';
        this.BBCalColumnService.setLoading(true);
        console.log('paramString-----257', paramModelString);
        // this.BBCalColumnService.callRequest(url, paramModelString).subscribe( (objDetailsData: any) => {
		this.BBCalColumnService.sendRequest(url, paramModelString, (objDetailsData: any) => {
			this.BBCalColumnService.setLoading(false);
				// let newresponse = objDetailsData;
			// newresponse = newresponse.replace(/\\/g, '');
			// newresponse = newresponse.replaceAll(' ','');
				let callbackRespNew = objDetailsData.split('%%SEP%%');
			objDetailsData = callbackRespNew[0];
				let isError = callbackRespNew[1].trim();
			if (!(isError == 'true')) 
			{
				let newresponse = objDetailsData;
					newresponse = newresponse.replace(/\\/g, '');
					newresponse = newresponse.replaceAll(' ','');
				let modelListJson = {}
				modelListJson = JSON.parse(newresponse);
				this.modelListData = modelListJson['modelname'];
			}
			let paramData: any = {};
			paramData["ACTION"] = "GET_FUNCTION_PARAMETER";
			paramData["functionname"] = this.allformValues['Detail2'][index]['function_name']  //Contribution
			var url = this.BBCalColumnService.getHostURL() + '/ibase/PreviewHandlerServlet';
			this.BBCalColumnService.setLoading(true);
			var paramString = this.BBCalColumnService.getEncodedParamString(paramData);
			// this.BBCalColumnService.callRequest(url, paramString).subscribe( (data: any) => {
			this.BBCalColumnService.sendRequest(url, paramString, (data: any) => {	
				this.BBCalColumnService.setLoading(false);
					let callbackRespNew = data.split('%%SEP%%');
					data = callbackRespNew[0];
					let isError = callbackRespNew[1].trim();
				if (!(isError == 'true')) 
				{
					this.functionParamaterJson = JSON.parse(data);
					this.functionParamaterArray.push(this.functionParamaterJson);
					for(let i=0;i<this.functionParamaterArray.length;i++) // {}
					{
						this.functionParameters = this.functionParamaterArray[i]['Arguments'];
					}
									
					this.allformValues['Detail2'][index]['calc_type'] = this.functionParamaterArray[0]['calc_type'];
					this.allformValues['Detail2'][index]['col_datatype'] = this.functionParamaterArray[0]['ReturnDType'];
					if(this.functionParamaterArray[0]['ReturnDType'] =="String")
					{
						this.allformValues['Detail2'][index]['col_datatype'] = "S";
					}
					if(this.functionParamaterArray[0]['ReturnDType'] =="Numeric")
					{
						this.allformValues['Detail2'][index]['col_datatype'] = "N";
					}
					if(this.functionParamaterArray[0]['ReturnDType'] =="Date")
					{
						this.allformValues['Detail2'][index]['col_datatype'] = "D";
					}

				}
			
			});
	 		});
		}
		else
		{
			let paramData: any = {};
			paramData["ACTION"] = "GET_FUNCTION_PARAMETER";
			paramData["functionname"] = this.allformValues['Detail2'][index]['function_name']  //Contribution
			var url = this.BBCalColumnService.getHostURL() + '/ibase/PreviewHandlerServlet';
			this.BBCalColumnService.setLoading(true);
			var paramString = this.BBCalColumnService.getEncodedParamString(paramData);
			// this.BBCalColumnService.callRequest(url, paramString).subscribe( (data: any) => {
			this.BBCalColumnService.sendRequest(url, paramString, (data: any) => {	
				this.BBCalColumnService.setLoading(false);
				// let newresponse = data;
				// console.log('print data line no 301::::::',data);
				// newresponse = newresponse.replaceAll(' ','');
				// console.log('print newresponse line no 303::::::',newresponse);
				let callbackRespNew = data.split('%%SEP%%');
				data = callbackRespNew[0];
				let isError = callbackRespNew[1].trim();
				if (!(isError == 'true'))
				{
					this.functionParamaterJson = JSON.parse(data);	
					this.functionParamaterArray.push(this.functionParamaterJson);
					for(let i=0;i<this.functionParamaterArray.length;i++) // {}
					{
						this.functionParameters = this.functionParamaterArray[i]['Arguments'];		
						console.log('Print functionParameters line no 368:::::',this.functionParameters);
						
					}
					for(let j=0;j<this.functionParameters.length;j++)
					{
						let forecastingList;
						// if(this.functionParameters[j]['value'].includes(","))
						if(this.functionParameters[j]['type'] == 'DDLB')
						{
							forecastingList = this.functionParameters[j]['value'];
							console.log('print forecastingList line no 378::::',forecastingList);
							this.DDLBoptionArray = forecastingList.split(',');
							console.log('print DDLBoptionArray line no 381::::',this.DDLBoptionArray);
						}
					}
					
					this.allformValues['Detail2'][index]['calc_type'] = this.functionParamaterArray[0]['calc_type'];
					this.allformValues['Detail2'][index]['col_datatype'] = this.functionParamaterArray[0]['ReturnDType'];
					if(this.functionParamaterArray[0]['ReturnDType'] =="String")
					{
						this.allformValues['Detail2'][index]['col_datatype'] = "S";
					}
					if(this.functionParamaterArray[0]['ReturnDType'] =="Numeric")
					{
						this.allformValues['Detail2'][index]['col_datatype'] = "N";
					}
					if(this.functionParamaterArray[0]['ReturnDType'] =="Date")
					{
						this.allformValues['Detail2'][index]['col_datatype'] = "D";
					}
				}
	 	});
    }
    }
	//Added by vikas on 27-12-22 for getting function parameters on functionlist selection [End]

	//Added by tejas on 28-12-22 for building expression on done button
	onDoneBtnClick()
	{
		 let isValid: boolean = this.validateForm();
		if(isValid)
		{
			this.buildExpression();
			this.onCalculationSubmit();
		}
		    
	}
	
	validateForm()
	{
		let isValid: boolean = true
		let index = this.calcFeedIndex;
		if(this.allformValues['Detail2'][index]['col_heading'] == '')
		{
			window.alert('Please fill the required field calculation heading');
			isValid = false;
		}
		else if(this.allformValues['Detail2'][index]['col_name'] != '' && this.allformValues['Detail2'][index]['col_name'].includes(" "))
		{
			window.alert('Calculation name could not contain cpace');
			isValid = false;
		}
		else if(this.allformValues['Detail2'][index]['col_name'] == '')
		{
			window.alert('Please fill the required field calculation name');
			isValid = false;
		}
		else if(this.allformValues['Detail2'][index]['function_type'] == '' && this.allformValues['Detail2'][index]['calc_type'] != 'M')
		{
			window.alert('Please fill the required field function type');
			isValid = false;
		}
		else if(this.allformValues['Detail2'][index]['function_name'] == '' && this.allformValues['Detail2'][index]['calc_type'] != 'M')
		{
			window.alert('Please fill the required field Function');
			isValid = false;
		}
		else if(this.allformValues['Detail2'][index]['col_datatype'] == '')
		{
			window.alert('Please fill the required field datatype');
			isValid = false;
		}
		console.log('[PRINT LINE NO 427 ]:::',isValid);
		//isValid = false;
        return isValid
	}

	//Added by tejas on 28-12-22 for building expressions dynamically [Start]
	//Changed by vikas on 29-12-22 for adding lookup expression [Start]
	buildExpression()
	{
		let index  = this.calcFeedIndex;
		let fuctionVal;
		console.log('Print line no 282:::::',index);
		if(this.functionParameters != undefined)
		{
			for(let i=0;i<this.functionParameters.length;i++)
			{
				// Changed by Sujan on 16-01-2023 to add drop down if function list contains model name 
				/* let obj = this.functionParameters[i];
				var id  = "Argument_"+i
				var newid = document.getElementById(id);
				console.log('Print line no 228::::',newid);
				let key;
				if(newid != null)
				{
					let fieldname = obj['name'];
					newid.setAttribute("fieldName",fieldname );
					key = newid.getAttribute("fieldName");
					var value = (document.getElementById(id) as HTMLInputElement).value
					this.paramModelJson[key] = value
					this.allformValues['Detail2'][index]['function_parameter'] = JSON.stringify(this.functionParameters);
				} */
				let curFunctParamJson = {};
				curFunctParamJson = this.functionParameters[i];
				let functionName = curFunctParamJson['name'];
				this.paramModelJson[functionName] = curFunctParamJson['value'];
				this.allformValues['Detail2'][index]['function_parameter'] = JSON.stringify(this.functionParameters);
			}
		}
		let functionParametersFields = [];
		functionParametersFields.push(this.paramModelJson);
		let paramValue = Object.values(this.paramModelJson);
		fuctionVal = paramValue.toString();
		// let expression;
		let functionType = this.allformValues['Detail2'][index]['function_type'];
		if(functionType == 'Local_Statistical_Function' || functionType == 'Cloud_AI_Function')
        {
			this.expression = "@"+""+this.functionParamaterArray[0]["FunctionName"]+""+"("+""+fuctionVal+""+")";
		}
		if(functionType == 'Local_AI_Function' && this.functionParamaterArray[0]["FunctionName"] == 'predict')
		{
			// expression = "@"+""+this.functionParamaterArray[0]["FunctionName"]+""+"("+""+paramValue[0]+","+"'"+paramValue[1]+"'"+","+"'"+paramValue[2]+"'"+""+")";  
			this.expression = "@"+""+this.functionParamaterArray[0]["FunctionName"]+""+"("+""+paramValue[0]+","+"'"+paramValue[1]+"'"+","+"'"+this.allformValues['Detail2'][index]['function_name']+"'"+","+"'"+this.allformValues['Detail2'][index]['model_scope']+"'"+""+")";
		}
		if(functionType == 'Expression')
		{
            this.expression =  fuctionVal;       
		}
		if(functionType == 'Conditional_Expression')
		{
           this.expression = paramValue[0]+":"+paramValue[1]+":"+ paramValue[2];
		}
		if(functionType == 'SQL')
	    {
			if(paramValue[1] != '' && paramValue[1] != undefined)
			{
				this.expression = paramValue[0]+":"+paramValue[1];
			}
			else if(paramValue[1] == '')
			{
				this.expression = paramValue[0];
			}
		}
		if(functionType == 'Lookup')
		{
			if(paramValue[2] != '' && paramValue[2] != undefined)
			{
				this.expression = paramValue[0]+","+paramValue[1]+","+paramValue[2];
				console.log('line no 338:::',this.expression);
			}
			else if(paramValue[2] == '' )
			{
				this.expression = paramValue[0]+","+paramValue[1]
			}
		}
		if(functionType == 'Cumulative_Sum')
		{
			this.expression = fuctionVal;         
		}
         this.allformValues['Detail2'][index]['calc_expression'] = this.expression;
	     console.log('Print line no 350 allformvalues:::',this.allformValues);
	}
	//Changed by vikas on 29-12-22 for adding lookup expression [End]
	//Added by tejas on 28-12-22 for building expressions dynamically [End]

	//Changed by vikas on 25-12-22 for index name 
	ngAfterViewInit()
	{
		let allformValuescopy = this.allformValues;
		if(allformValuescopy['Detail2'].length > 0)
		{
			for(let ind = 0 ; ind < allformValuescopy['Detail2'].length; ind++)
			{
				if(this.calSequence == allformValuescopy['Detail2'][ind]['calc_seq'])
				{
					this.currentDetailJson = JSON.stringify(this.allformValues['Detail2'][ind]);
					this.calcFeedIndex = ind;
					break;
				}
			}
		}
	}
}
