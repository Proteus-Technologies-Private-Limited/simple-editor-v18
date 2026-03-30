import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from "@angular/core";
import { QueryBuilderConfig, QueryBuilderClassNames } from "angular2-query-builder";
import moment from "moment";
import { Observable, ReplaySubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CdkDragDrop, transferArrayItem, moveItemInArray, CdkDrag, CdkDragMove, copyArrayItem } from '@angular/cdk/drag-drop';
//Added by Samruddhi on 15-06-21 for in operator
import { COMMA, ENTER } from '@angular/cdk/keycodes';
// import { CommonModule } from "@angular/common";

declare const __moduleName: string;

@Component({
	selector: "bb-query-builder",
	templateUrl: "./bb-query-builder.component.html",
	styleUrls: ["./bb-query-builder.component.css"]
})

export class QueryBuilderComponentnew implements OnInit {

	criteriaCtrl = new UntypedFormControl();
	criteriaCtrlCol = new UntypedFormControl();
	filteredOptions: Observable<any[]> | any;
	queryArrayNew: any;
	@Input() viewModelCrt: any;
	isDropHere: boolean = false;
	isDropHereCol: boolean = false;
	@Input() currentConfig: QueryBuilderConfig | any;
	public allowRuleset: boolean = true;
	public allowCollapse: boolean = true;
	@Input() sqlModel: any;
	@Input() editFlag: any;
	//Added by Samruddhi on 15-06-21 for in operator
	selectable = true;
	removable = true;
	addOnBlur = true;
	readonly separatorKeysCodes = [ENTER, COMMA] as const;
	@Output() setSrcSql: EventEmitter<any> = new EventEmitter<any>();

	//Added by nikhil on 12-01-2022 for scheduler visual	
	form: UntypedFormGroup | any;
	customControl = new UntypedFormControl;
	selectFormControl = new UntypedFormControl;
	selectedDay: any = {}
	oBracket = "{";
	cBracket = "}";
	@Input() userInfo: any;

	cust_date = [
		{
			value: "FixedValue"
		},
		{
			value: "Today"
		},
		{
			value: "1stDayOfMonth"
		},
		{
			value: "LastDayOfMonth"
		},
		{
			value: "1stDateOfLastMonth"
		},
		{
			value: "LastDayOfLastMonth"
		},
		{
			value: "1stDayOfWeek"
		},
		{
			value: "LastDayOfWeek"
		},
		{
			value: "1stDateOfLastWeek"
		},
		{
			value: "LastDayOfLastWeek"
		},
		{
			value: "1stDayOfYear"
		},
		{
			value: "LastDayOfYear"
		},
		{
			value: "1stDateOfLastYear"
		},
		{
			value: "LastDayOfLastYear"
		},
		{
			value: "1stDayOfFinYear"
		},
		{
			value: "LastDayOfFinYear"
		},
		{
			value: "1stDateOfLastFinYear"
		},
		{
			value: "LastDayOfLastFinYear"
		},
		{
			value: "Last1Month"
		},
		{
			value: "Last3Month"
		},
		{
			value: "Last6Month"
		},
		{
			value: "Last9Month"
		},
		{
			value: "Last12Month"
		}
	]

	cust_data = [
		{
			value: "FixedValue"
		},
		{
			value: "LoginUser"
		},
		{
			value: "LoginSite"
		},
		{
			value: "EntityType"
		},
		{
			value: "EntityCode"
		},
		{
			value: "LoginEmployee"
		},
		{
			value: "LoginEnterprise"
		}
	]

	customFieldVal = [];

	constructor() {
	}

	ngOnInit() {
	}

	onFocusQuery(inputType: any) {
		if(inputType == 'criteriaInput')
		  {
			this.filteredOptions = this.criteriaCtrl.valueChanges.pipe(
			startWith(""),
			map(value =>
			this.queryArrayNew.filter(
			(option: any) => option["fieldName"].toLowerCase().includes(value.toLowerCase()))));
		  }
		  else
		  {
			this.filteredOptions = this.criteriaCtrlCol.valueChanges.pipe(
			startWith(""),
			map(value =>
			this.queryArrayNew.filter(
			(option: any) => option["fieldName"].toLowerCase().includes(value.toLowerCase()))));
		  }
	  }
	
	  onDropCriteria(event: CdkDragDrop<any[]>, dropInCriteria: any){
		 this.isDropHere = false;
		 let droppedCol =  event.previousContainer.data[event.previousIndex];
		 if(droppedCol != undefined)
		{
		   let droppedColValue = droppedCol['tableName'] + '.' + droppedCol['DBNAME'];
		   dropInCriteria['value'] = droppedColValue;
		}
	  }
	
	 onDropCriteriaCol(event: CdkDragDrop<any[]>, dropInCriteriaCol: any){
		 this.isDropHereCol = false;
		 let droppedCol =  event.previousContainer.data[event.previousIndex];
		if(droppedCol != undefined)
		{
		   let droppedColValue = droppedCol['tableName'] + '.' + droppedCol['DBNAME'];
		   dropInCriteriaCol['value'] = droppedColValue;
		}
	}
	
	 onMouseEnter(event: MouseEvent){
		if(event.buttons)
		{
			this.isDropHere = true;
		}
		else
		{
			this.isDropHere = false;
		}
	 }
	
	 onMouseEnterCol(event: MouseEvent){
		if(event.buttons)
		{
			this.isDropHereCol = true;
		}
		else
		{
			this.isDropHereCol = false;
		}
	 }
	
	 onKeyUpFieldContext(event: any, optionName: any){
		let options = document.getElementsByName(optionName);
		options.forEach(
		  option => {
			// let value = option.firstElementChild.innerHTML;
			let value = option.firstElementChild!.innerHTML;
	//Added by Mayur to make changes in Criteria Screen Auto-search on 19/03/21 [Start]
			let valueDB = option.id;
			if(value != null && value.toLowerCase().includes(event.toLowerCase()) || valueDB != null && valueDB.toLowerCase().includes(event.toLowerCase()))
			{
			  option.setAttribute('style', 'display: flex');
			}
			else
			{
			  option.setAttribute('style', 'display: none');
			}
		  }
		)
	 }
	
	 onKeyDown(event: any){
	  if(event.keyCode == "32")
	  {
		event.stopPropagation();
	  }
	}
	//Added by Mayur to make changes in Criteria Screen Auto-search on 19/03/21 [End]
	
	 ngOnChanges(changes: SimpleChanges){
		console.log('print inside ngonchanges currentConfig:::::',this.currentConfig);
		for (const propName in changes) {
		  if (changes.hasOwnProperty(propName)) {
			switch (propName) {
			  case 'currentConfig': {
				if(this.currentConfig != undefined)
				{
					this.queryArrayNew = Object.keys(this.currentConfig.fields).map(
						q => this.currentConfig.fields[q]
					);
				}
			  }
			}
		  }
		}
	  }
	  // Added by Samruddhi on 01/07/21 to remove space between 2 lines in sql-editor component where condition add in criteria. [Start]
	  getImgSrc(COLTYPE: any)
		   {
			   var imgUrl;
				if(COLTYPE == "date")
			   {
				   imgUrl = "/ibase/Insight/angplugin/assets/images/Date.svg";
			   }
			   else if(COLTYPE == "number")
			   {
				   imgUrl = "/ibase/Insight/angplugin/assets/images/Numeric.svg";
			   }
			   else
			   {
				   imgUrl = "/ibase/Insight/angplugin/assets/images/String.svg";
			   }
			   return imgUrl;
		   }
	  // Added by Samruddhi to remove space between 2 lines in sql-editor component where condition add in criteria. [End]
	
	  // Added by Samruddhi for updated UI
	  setSourceSql(value: any)
	  {
		this.setSrcSql.emit(value);
	  }
	
	  //Added by nikhil on 12-01-2022 for scheduler visual[Start]
	  customDrop(cust: any, rule: any)
	  {
		this.setSourceSql(true);
		
			 let finalValue;
		let changeValue = cust.value;
		console.log("print changeValue line no 321",changeValue);
			let sqlModelRuleArr =[] = this.sqlModel['CRITERIA']['query']['rules'];
		var today = new Date();
		if(changeValue == "FixedValue")
		{
			//added by mayuri on 18/08/2023 check for FixedValue condition start
			console.log('Print finalValue 295::::::',finalValue);
			if(rule.value != undefined)
			{
				finalValue = rule.value;
			}
			//added by mayuri on 18/08/2023 check for FixedValue condition end
		}
		else if(changeValue != "FixedValue")
		{
			if(changeValue == "Today")
			{
				let todayVal = new Date();
				finalValue = todayVal;
			}
			else if(changeValue =="1stDayOfMonth")
			{
				let firstDayofMonth = new Date(today.getFullYear(), today.getMonth(), 1);
				finalValue = firstDayofMonth;
			}
			else if(changeValue =="LastDayOfMonth")
			{
				let lastDayOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0);
				finalValue = lastDayOfMonth;
			}
			else if(changeValue =="1stDateOfLastMonth")
			{
				let firstdayoflastmonth = new Date(today.getFullYear(), today.getMonth()-1 , 1, 23, 59, 59);
				finalValue = firstdayoflastmonth;
			}
			else if(changeValue =="LastDayOfLastMonth")
			{
				let lastdayoflastmonth = new Date(today.getFullYear(), today.getMonth() , 0, 23, 59, 59);
				finalValue = lastdayoflastmonth;
			}
			else if(changeValue =="1stDayOfWeek")
			{
				var startDay = 1;
				var d = today.getDay();
				var weekStart = new Date(today.valueOf() - (d<=0 ? 7-startDay:d-startDay)*86400000);
				finalValue = weekStart;
			}
			else if(changeValue =="LastDayOfWeek")
			{
				var startDay = 1;
				var d = today.getDay();
				var weekStart = new Date(today.valueOf() - (d<=0 ? 7-startDay:d-startDay)*86400000);
				var weekEnd = new Date(weekStart.valueOf() + 6*86400000);
				console.log('Print todayVal 332::::::',weekEnd);
				finalValue = weekEnd;
			}
			else if(changeValue =="1stDateOfLastWeek")
			{
				let beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000), day = beforeOneWeek.getDay()
				, diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1)
				, lastMonday = new Date(beforeOneWeek.setDate(diffToMonday))
				, lastSunday = new Date(beforeOneWeek.setDate(diffToMonday + 6));
				finalValue = lastMonday;
			}
			else if(changeValue =="LastDayOfLastWeek")
			{
				let beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000), day = beforeOneWeek.getDay()
				, diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1)
				, lastMonday = new Date(beforeOneWeek.setDate(diffToMonday))
				, lastSunday = new Date(beforeOneWeek.setDate(diffToMonday + 6));
				finalValue = lastSunday;
			}
			else if(changeValue =="1stDayOfYear")
			{
				let theFirst = new Date(today.getFullYear(), 0, 1);
				finalValue = theFirst;
			}
			else if(changeValue =="LastDayOfYear")
			{
				let theLast = new Date(today.getFullYear(), 11, 31);
				finalValue = theLast;
			}
			else if(changeValue =="1stDateOfLastYear")
			{
				let theFirstprevyr = new Date(today.getFullYear()-1, 0, 1);
				finalValue = theFirstprevyr;
			}
			else if(changeValue =="LastDayOfLastYear")
			{
				let theLastprevyr = new Date(today.getFullYear()-1, 11, 31);
				finalValue = theLastprevyr;
			}
			else if(changeValue == "1stDayOfFinYear")
			{
				let fiscalyear;	 
				if ((today.getMonth() + 1) <= 3) 
				{
					fiscalyear = (today.getFullYear() - 1)
				} 
				else 
				{
					fiscalyear = today.getFullYear();
				}
				let start = "01/04/" + fiscalyear;
	
				var darr = start.split("/");
				var dobj = new Date(parseInt(darr[2]),parseInt(darr[1])-1,parseInt(darr[0]));
				finalValue = dobj.toISOString();
			}
			
			else if(changeValue =="LastDayOfFinYear")
			{
				let fiscalyear;
				if ((today.getMonth() + 1) <= 3) 
				{
					fiscalyear = today.getFullYear()
				}
				else 
				{
					fiscalyear = today.getFullYear() + 1
				}
				var end = "31/03/" + fiscalyear;
				var darr = end.split("/");
				var dobj = new Date(parseInt(darr[2]),parseInt(darr[1])-1,parseInt(darr[0]));
				finalValue = dobj.toISOString();
			}
			else if(changeValue =="1stDateOfLastFinYear")
			{
				let fiscalyear;
				if ((today.getMonth() + 1) <= 3) 
				{
					fiscalyear = today.getFullYear() - 2;
				} 
				else 
				{
					fiscalyear = today.getFullYear() -1
				}
				let start = "01/04/" + fiscalyear;
				var darr = start.split("/");
				var dobj = new Date(parseInt(darr[2]),parseInt(darr[1])-1,parseInt(darr[0]));
				finalValue = dobj.toISOString();
			}
			else if(changeValue =="LastDayOfLastFinYear")
			{
				var fiscalyear;
				if ((today.getMonth() + 1) <= 3) 
				{
					fiscalyear = today.getFullYear() - 1;
				} 
				else 	
				{
					fiscalyear = today.getFullYear();
				}
				var end = "31/03/" + fiscalyear;
				var darr = end.split("/");
				var dobj = new Date(parseInt(darr[2]),parseInt(darr[1])-1,parseInt(darr[0]));
				finalValue = dobj.toISOString();
			}
			else if(changeValue =="Last1Month")
			{
				let Last1Month = new Date(today.getFullYear(), today.getMonth()-1 , 1, 23, 59, 59);
				console.log('Inside else if Last1Month....',Last1Month);
				finalValue = Last1Month;
			}
			else if(changeValue =="Last3Month")
			{
				let Last3Month = new Date(today.getFullYear(), today.getMonth()-3 , 1, 23, 59, 59);
				console.log('Inside else if Last3Month....',Last3Month);
				finalValue = Last3Month;
			}
			else if(changeValue =="Last6Month")
			{
				let Last6Month = new Date(today.getFullYear(), today.getMonth()-6 , 1, 23, 59, 59);
				console.log('Inside else if Last6Month....',Last6Month);
				finalValue = Last6Month;
			}
			else if(changeValue =="Last9Month")
			{
				let Last9Month = new Date(today.getFullYear(), today.getMonth()-9 , 1, 23, 59, 59);
				console.log('Inside else if Last9Month....',Last9Month);
				finalValue = Last9Month;
			}
			else if(changeValue =="Last12Month")
			{
				let Last12Month = new Date(today.getFullYear(), today.getMonth()-12 , 1, 23, 59, 59);
				console.log('Inside else if Last12Month....',Last12Month);
				finalValue = Last12Month;
			}
			else if(changeValue =="LoginUser")
			{
				finalValue = this.checkNull(this.userInfo.result.UserInfo.loginCode);
			}
			else if(changeValue =="LoginSite")
			{
				finalValue = this.checkNull(this.userInfo.result.UserInfo.siteCode);
			} 
			else if(changeValue =="EntityType")
			{
				finalValue = this.checkNull(this.userInfo.result.UserInfo.userType);
			}
			else if(changeValue =="EntityCode")
			{
				finalValue = this.checkNull(this.userInfo.result.UserInfo.entityCode);
			}
			else if(changeValue =="LoginEmployee")
			{
				finalValue = this.checkNull(this.userInfo.result.UserInfo.empCode);
			}
			else if(changeValue =="LoginEnterprise")
			{
				finalValue = this.checkNull(this.userInfo.result.UserInfo.enterprise);
			}
		}
		this.getActualValue(sqlModelRuleArr , rule, cust, finalValue);
	  }
	
	  getActualValue( sqlModelRuleArr: any, rule: any, cust: any, finalValue: any)
	  {
		for(let i = 0; i < sqlModelRuleArr.length; i++) 
		{ 
			console.log("line no 528::::::",sqlModelRuleArr[i]['rules']);
			if(sqlModelRuleArr[i]['rules'] == undefined)
			{
				console.log("line no 541::::::",cust.value);
				
				var elem = document.getElementById(rule.id);
				if(sqlModelRuleArr[i]['id'] == rule.id)
				{
					console.log("line no 546::::::");
					if(cust.value != undefined)
					{
						sqlModelRuleArr[i]['customValue'] = cust.value;
					}
					//this.sqlModel['CRITERIA']['query']['rules'][i]['value'] = finalValue;
					sqlModelRuleArr[i]['value'] = finalValue;
				}
			}
			else
			{
				console.log("line no 552::::::");
				let sqlArrModule = [] = sqlModelRuleArr[i]['rules'];
				console.log('Print sqlArrModule line no 562',sqlArrModule);
				this.getActualValue(sqlArrModule, rule, cust, finalValue);	
			}
		}
		
	  }
	  //Added by nikhil on 12-01-2022 for scheduler visual[End]
	  //Added by nikhil on 21-03-2022 create chek null method
	  checkNull(input):any
	  {
		 if (input == undefined || input == '' || input == null)
		 {
			 input= '';
		 }
		 return input.trim();
	  }
}


