import { NgZone, Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild, HostListener, ElementRef } from '@angular/core';
import { TreeviewItem } from 'ngx-treeview';
import { BBTreeviewComponent } from 'base-blocks';
import { PophelpService } from './ang-pophelp.service';
import { DatamodelService } from './datamodel.service';

@Component({
  selector: 'ang-pophelp',
  templateUrl: './ang-pophelp.component.html',
  styleUrls: ['./ang-pophelp.component.css']
})
export class AngPophelpComponent implements OnInit,OnDestroy {

  @Input() dataSource: any;
  @Input() encodedParam: any; // Added by Mahesh Saggam on 06-AUG-2020
  @Input() filterName: any ;
  @Input() multi_opt: any;
  @Input() filterValue: any;
  @Input() refId: any;
  @Input() layout: any;
  @Input() layoutTemplName = 'simple';
  //Sainath T. [Form group input from bis-selection component]
  @Input() formGroup: any;
  @Input() isFilter: boolean = false;

  @Input() showHeader : boolean = true;
  @Input() showFooter : boolean = true;
  @Input() showSearch : boolean = false;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onSelect: EventEmitter<any> = new EventEmitter();
  @Output() onDblClick: EventEmitter<any> = new EventEmitter();
  @Output() onSelectPophelpDetails: EventEmitter<any> = new EventEmitter();
//Added By Chitranga tandel if pophelp data is empty
  @Output() onResultEmpty: EventEmitter<any> = new EventEmitter();
  @ViewChild(BBTreeviewComponent) bbTreeviewComponent: BBTreeviewComponent | any;

  @Input() filterExprInput: any;
  @Input() refreshData : boolean = false; 
  
    pophelpData: any[] = [];
    selectedVal: any;
    isAllChecked: any;
    isIndeterminate: any;
    searchValue: any;
    loaded = false;
    loading = true;
    isMobile;
    isLayout=false;

    selectedKeyValue: any = {'display': '', 'value': ''};
    @Input() selPophelpDetails: any[] = [];
    count = 0;
    
    //By Sainath T. on 31-01-19[For KeyBoard events] -Start
    @ViewChild('search') searchElement: ElementRef | any;
    ESCAPE_KEYCODE: number = 27;
    F2: number = 113;
    UP_ARROW = 38;
    DOWN_ARROW = 40;
    //By Sainath T. on 31-01-19[For KeyBoard events] -END
    
    isTreeLayOut: boolean = false;
  constructor(public pophelpService: PophelpService, public datamodelService : DatamodelService, public zone: NgZone) 
  {
        let index = window.location.pathname.indexOf('E12BROWSER');

        if (index == -1) {
            this.isMobile = true;
        }
    }

    ngOnInit() {
        // Register key listeners outside Angular zone to prevent CD on every keystroke
        this.zone.runOutsideAngular(() => {
            document.addEventListener('keyup', this._onKeyUp);
            document.addEventListener('keydown', this._onKeyDown);
        });

        //Added By Vikas Lagad on 20-01-2020[to refresh the data if input flag true]Start
        if(this.refreshData)
        {
            this.refreshPophelp();
        }
        else
        {
            this.getData(false);
        }
        console.log('selPophelpDetails ngOnInit', this.refreshData,this.selPophelpDetails);
        //Added By Vikas Lagad on 20-01-2020[to refresh the data if input flag true]End
       }

    getData(isRefresh: boolean) {
      if( this.layout && this.layout.datatree )
      {
          console.log('In intent Service tree layout');
          this.isTreeLayOut = true;
          this.layoutTemplName = 'datatree';
      }
        console.log("Data source in ang-pophelp:[" + this.dataSource + "] & multi_opt:[" + this.multi_opt + "] & filterValue:[" + this.filterValue + "] refId:[" + this.refId);

      if( this.dataSource && this.dataSource.startsWith('/ibase') )
      {
          if( this.refId )
          {
                this.encodedParam = this.encodedParam + "&refid=" + this.refId + "&" + this.refId + "=" + this.filterValue;
            }

            this.pophelpService.getPophelpData(this.dataSource, this.encodedParam, this.filterName, isRefresh).subscribe(
                (result: any) => {
                    console.log('Pophelp data:', result);
                    this.processResult(result);
                    //Added By Chitranga T to emit event if result is empty
                    if (result.DETAILS && result.DETAILS.length == 2) {
                        this.onResultEmpty.emit();
                    }
                }
            );
        }
      else
      {
            this.datamodelService.getDataModelData(this.dataSource, this.filterName, "", isRefresh).subscribe(
                (result: any) => {
                    console.log('Pophelp data::::::', result);

                    if (result && result.reponse != "loading") {
                        this.processResult(result);
                    }
                    //Added By Chitranga T to emit event if result is empty
				if(result.DETAILS && result.DETAILS.length == 2)
                {
                        this.onResultEmpty.emit();
                    }
                }
            );
        }

        if (this.multi_opt == 1) {
            this.selectedVal = [];
            console.log("Pophelp data filterValue>>>>", this.filterValue);
            if (this.filterValue && this.filterValue !== '') {
                //this.selectedVal=this.filterValue.split(",");
                //this.selectedVal=this.filterValue;
                console.log("Pophelp data selectedVal::::", this.selectedVal);
                if (Array.isArray(this.filterValue)) {
                    this.selectedVal = this.filterValue;
                    console.log('selectVal in if::::',this.selectedVal);
                } else {
                    var splitVals = this.filterValue.split(",");
                    if (splitVals) {
                        splitVals.forEach(
                            (val: any) => {
                                console.log('val for split val==>',val);
                                if (val.trim()) {
                                    console.log("vals===>", val);
                                    this.selectedVal.push(val);
                                    console.log("vals for split===>", this.selectedVal);
                                }
                            }
                        );
                    }
                }
            }
        }
    }

  processResult(result: any)
  {
        //Added By Chitranga T to set filterValue for search on [10-JAN-19]
    if(this.isFilter)
    {
            this.searchValue = this.filterValue;
        }
        if (result && result != null) {

        if( this.layout && this.layout.datatree && result.DETAILS )
        {
                var pophelpData = result.DETAILS;
                pophelpData = pophelpData.slice(2, pophelpData.length);

                for (var data of pophelpData) {
                    this.pophelpData.push(new TreeviewItem(data));
                }
            }
        else
        {
            console.log('Inside pophelp else');
            if(result.DETAILS)
            {
                    this.pophelpData = result.DETAILS;
                    console.log('inside details ', result.DETAILS);
                    //Sainath T. on 19/11/2018 [ For pophelp dispay structure and to get filter Expr]-SATRT
                    let layout = "";
                    var filter_expr = "";
                    var layoutObj: any = this.pophelpData[0];
                    layout = layoutObj.LAYOUT;
                if(layout != null && layout != "" && layout.length > 0)
                {
                        let layoutJson = JSON.parse(layout);
                        this.layout = layoutJson['template'];
                        console.log('layout id', this.layout);
                    }
                    console.log('layout ::::', this.layout);
                    //To check layout is not null and undefined 
                    if (this.layout != null && this.layout != undefined && Object.keys(this.layout).length != 0) {
                        this.isLayout = true;
                    }
                    //changed by Sainath T. on 30-05-19
                    var exprObj: any = this.pophelpData[1];
                    var expr = "";
                    if(exprObj)
                    {
                        expr = exprObj!.FILTER_EXPR;
                    }

                if(expr!= null && expr != "" && expr != undefined && expr.length > 0)
                {
                        filter_expr = expr;
                        console.log('filter_expr ', filter_expr);
                    }
                    //Sainath T. on 19/11/2018 [ For pophelp dispay structure]-END

                    //Sainath T. on 05/12/2018 [ To filter dependent pophelp data ]-SATRT
                    var formGroupValues = {};
                if(this.formGroup)
                {
                    if(this.formGroup.value)
                    {
                            formGroupValues = this.formGroup.value;
                            console.log('formGroupValues', formGroupValues);
                        }
                    }
                    this.pophelpData = this.pophelpData.slice(2, this.pophelpData.length);
                
                //Added Kamal.P to Pass FilterExpression input in formGroupValues  START
                if(this.filterExprInput){
                    console.log('filterExprInput==>',this.filterExprInput);
                    formGroupValues = this.filterExprInput;
                    console.log('if filetrExpreesion is then formGroupValues==>',formGroupValues);
                }
                //Added Kamal.P to Pass FilterExpression input in formGroupValues  END

                if(filter_expr != null && filter_expr != "" && filter_expr != undefined && filter_expr.length > 0 && Object.keys(formGroupValues).length > 0)
                {
                        filter_expr = this.getFilterdExpr(formGroupValues, filter_expr);
                        //Sainath T. on 11/12/18[To check filter_expr is not null]
                    if(filter_expr != null && filter_expr != "" )
                    {
                            console.log('filter_expr updated', filter_expr);
                            this.pophelpData = this.filterPophelpJSON(result, filter_expr);
                            console.log('filterDetailData.length', this.pophelpData.length);
                    }
                }
                //Sainath T. on 05/12/2018 [ To filter dependent pophelp data ]-END
                //Sainath T. on 31/01/2019 [ To focus on search field input ]
                try
                {
                    this.searchElement.nativeElement.focus();
                }catch
                {
                    console.log('Cannot read property nativeElement of undefined');
                }
            }
            else
            {
                if(result)
                {
                    console.log('inside detail', result);
                    result.forEach(
                        (record: any) => {
                            if (record.ID) {
                                record["id"] = record.ID;
                            }
                            if (record.VALUE) {
                                record["value"] = record.VALUE;
                            }
                        }
                    );
                    console.log('inside detail>>>>>>>>', result);
                }
                this.pophelpData = result;
                //Sainath T. on 31/01/2019 [ To focus on search field input ]
                try
                {
                    this.searchElement.nativeElement.focus();
                }catch
                {
                    console.log('Cannot read property nativeElement of undefined');
                }
            }
            this.checkSelAll();

            //Changed by Sainath T. on 24/10/18[To check filtered value is not null]
            //if(!Array.isArray(this.filterValue)){ 
            console.log('this.filterValue===>',this.filterValue)
            if (this.filterValue && !Array.isArray(this.filterValue)) {
                console.log('inside if filterValue==>',this.filterValue);
                var splitVals = this.filterValue.split(",");
                console.log('splitVals==>',splitVals);
                if (splitVals) {
                    console.log('inside if splitVals==>',splitVals)
                    splitVals.forEach(
                        (val: any) => {
                            console.log('splitvalue using Each==>',val);
                            if (val.trim()) {
                                console.log("vals===>", val);
                                var pophelpDetail = this.pophelpData.find(detail => detail.id == val.trim());
                                console.log('pophelpDetail onInit ::', pophelpDetail);

                                if (pophelpDetail) {
                                    this.selPophelpDetails.push(pophelpDetail);
                                }
                            }
                        }
                    );
                    if (this.pophelpData.length == this.selPophelpDetails.length) {
                        this.isAllChecked = true;
                    }
                }
            }


        }
        console.log('Loading done...1', this.loaded, this.loading);
        this.loaded = true;
        this.loading = false;
        this.zone.run(() => {
            console.log('view refreshed');
        });
        console.log('Loading done...2', this.loaded, this.loading);
    }
  }

    closePophelp() {
        this.onClose.emit();
    }

    valueSelected(value: string, data?: string, detail?: any) {
        console.log('inisde valueSelected function',value, 'data==>',data, 'detail==>',detail);
       
        if (this.multi_opt == 1) {
            console.log('inisde valueSelected function if multiOpt is 1');
            if (Array.isArray(value)) {
                this.selectedVal = value;
                console.log('selectedVal===>',this.selectedVal);
                
            } else {
                var index = this.selectedVal.indexOf(value);
                console.log('index after selected value=>',index);

                if (index > -1) {
                    console.log('index greater than -1');
                    this.selectedVal.splice(index, 1);

                    if (this.isAllChecked) {
                        this.isIndeterminate = true;
                    }
                } else {
                    this.selectedVal.push(value);

                    if (this.selectedVal && this.selectedVal.length == this.pophelpData.length) {
                        this.isIndeterminate = false;
                        this.isAllChecked = true;
                    }
                }
            }

        } else {
            console.log('VAL inside else==>',value);
            this.selectedVal = value;
            this.selectedKeyValue.display = data;
            console.log('selectedKeyValue inside else==>',this.selectedKeyValue);
            this.selectedKeyValue.value = value;
        }
        
        console.log('selPophelpDetails ::',this.selPophelpDetails);
        console.log('selectedVal::==>',this.selectedVal);
        
        console.log('Is isTreeLayOut value 379!!!!!['+this.isTreeLayOut+']');
       	if( this.isTreeLayOut)
        {
            var pophelpDetail = this.selectedVal.find((detail: any) =>{
                console.log('detail====>',detail);
                detail.id == value
            });
            if (pophelpDetail) {
                console.log('inside pophelpDetail');
                this.selPophelpDetails = this.selectedVal.filter((detail: any) => {
                    console.log('detail::::::',detail)
                    detail.id != value});
            } else {
                this.selPophelpDetails.push(detail);
            }
            console.log('detail ::', detail, 'value==>',value, 'pophelpDetail==>',pophelpDetail);
        }
        else{
            var pophelpDetail = this.selPophelpDetails.find(detail => detail.id == value);
            if (pophelpDetail) {
            console.log('inside pophelpDetail');
            this.selPophelpDetails = this.selPophelpDetails.filter(detail => detail.id != value);
            } 
            else {
            this.selPophelpDetails.push(detail);
            }
        }

        /*if (pophelpDetail) {
            console.log('inside pophelpDetail');
            this.selPophelpDetails = this.selPophelpDetails.filter(detail => detail.id != value);
        } else {
            this.selPophelpDetails.push(detail);
        }*/
        

        console.log('this.selPophelpDetails & detail', this.selPophelpDetails, detail);

        this.filterValue = this.selectedVal;

        this.count++;
        setTimeout(() => {
            this.count = 0;
        }, 500);
        console.log('---Selected Values are--', this.selectedVal);

    }

    selectAll() {
        if (this.isAllChecked) {
            this.isAllChecked = false;
            this.selectedVal = [];
            this.selPophelpDetails = [];
        } else {
            this.isAllChecked = true;
            this.pophelpData.forEach(
                detail => {
                    this.selectedVal.push(detail.id);
                }
            );
            this.selPophelpDetails = this.pophelpData;
        }

        this.filterValue = this.selectedVal;
    }

    submitSelection() {
        console.log('selectedVal on submitSelection==>',this.selectedVal);
        this.onSelect.emit(this.selectedVal);
        console.log('this.selPophelpDetails ::', this.selPophelpDetails);
        this.onSelectPophelpDetails.emit(this.selPophelpDetails);
    }

    submitSelKeyValue() {
        this.onSelect.emit(this.selectedKeyValue);
    }

    submitOnDblClick() {
        this.onDblClick.emit(this.selectedKeyValue);
    }

    submitOnDoubleClick() {
        console.log("double click", this.count);
        if (this.count == 2) {
            console.log('Condition Satisfied', this.selectedVal);
            this.selPophelpDetails = [];
            var pophelpDetail = this.pophelpData.find(detail => detail.id.trim() == this.selectedVal.trim());
            console.log('pophelpDetail in submitOnDoubleClick ::', pophelpDetail);

            if (pophelpDetail) {
                this.selPophelpDetails.push(pophelpDetail);
            }
            this.submitSelection();
            this.count = 0;
        }
    }

    checkIsChecked(value: any) {
        if (this.isAllChecked || (this.filterValue && this.filterValue.indexOf(value) > -1)) {
            return true;
        } else {
            return false;
        }
    }

    checkSelAll() {
        if (this.filterValue && this.filterValue.length == this.pophelpData.length) {
            this.isAllChecked = true;
        } else {
            this.isAllChecked = false;
        }
    }

    refreshPophelp() {
        this.loaded = false;
        this.loading = true;
        this.pophelpData = [];
        this.getData(true);
    }
  ngOnDestroy()
  {
        document.removeEventListener('keyup', this._onKeyUp);
        document.removeEventListener('keydown', this._onKeyDown);
        console.log('ang_pophelp ngOnDestroy..');
    }

    onFilterTextChange(value: any) {
        if (this.bbTreeviewComponent) {
            this.bbTreeviewComponent.onFilterTextChange(value);
        }
    }

    //Sai 23/11/2018 [to get filtered expression] -START
  getFilterdExpr(jsonToFilter: any,exprToFilter: any)
  {
        var filterExprsStrg: string;
        var tokens:any = [];
        filterExprsStrg = exprToFilter;
        //Sainath T. on 11/12/18 [To save not updated filtr_expr]
        var tempFilterExpr = exprToFilter;
        console.log('filterExprsStrg==', filterExprsStrg, 'jsonToFilter==', jsonToFilter);
        tokens = filterExprsStrg.split("&&");
        console.log('token', tokens);
    for(var i = 0; i< tokens.length ; i++)
    {
            console.log('in for::', tokens.length);

        	if("" != tokens[i] )
       	 	{
                console.log('in if::', tokens[i]);
                var objKey = "";
                var keyValue = "";
                var leftSide = "";
                var rightSide = "";
                var innerTokens = [];
                var colName = "";
                var splitExpr = tokens[i].trim();
                innerTokens = splitExpr.split("==");
                leftSide = innerTokens[0];
                rightSide = innerTokens[1];
                console.log("Left [" + leftSide + "] Right [" + rightSide + "]");
                colName = splitExpr.substring(splitExpr.indexOf(":") + 1, splitExpr.lastIndexOf(":"));
                var capitalColName = colName.toUpperCase();
                console.log("Final Expresion [" + splitExpr + "] colName  [" + capitalColName + "]");
                filterExprsStrg = filterExprsStrg.replace(leftSide, "value." + leftSide);
            	if(jsonToFilter != null)
            	{
                    var jsonFilterArray:any[] = [];
                    jsonFilterArray.push(jsonToFilter);
                    //To get keys and values -Start
                    jsonFilterArray.forEach(function (elementObject) {
                        var keys = Object.keys(elementObject);
                        keys.forEach(function (key) {
                            console.log("key::" + key + ":value::" + elementObject[key]);
                            objKey = key;
                            //to check if key starts with no. - START
                            var patt = new RegExp(/^[0-9]/);
                      	if( patt.test(objKey))
                      	{
                                console.log('key is::', objKey);
                                objKey = objKey.substring(objKey.indexOf(".") + 1, objKey.length);
                                console.log('key After substring::', objKey);
                            }
                            //to check if key starts with no. - END
                            objKey = objKey.toUpperCase();
                            console.log('key After UpperCase::' + objKey + 'capitalColName' + capitalColName);

                      		if(objKey == capitalColName)
                      		{
                                keyValue = elementObject[key];
                                filterExprsStrg = filterExprsStrg.replace(rightSide, " '" + keyValue + "'");
                                filterExprsStrg = filterExprsStrg.replace("value.value", "value");
                            }
                        })
                    });
                    //To get keys and values -END
                }
            }
        }
        console.log('filterExprsStrg final:::', filterExprsStrg);
        //Sainath T. on 11/12/18 [To check updated expression]-START
    	if(filterExprsStrg.includes(tempFilterExpr))
    	{
            return filterExprsStrg = "";
        }
    	else
    	{
            return filterExprsStrg;
        }
        //Sainath T. on 11/12/18 [To check updated expression]-END
    }
    //Sai 23/11/2018 [to get filtered expression] -END 
    //Sai 05/12/2018 [to get filtered Pophelp Json] -START
	filterPophelpJSON(jsonToFilter: any,expressionToFilter: any)
	{
        var filterJson: any[] = [];
        //var jsonString = JSON.parse(jsonToFilter);
        jsonToFilter.DETAILS.filter(function (value: any) {
            // Commented and changed by Kaustubh NAndankar on 02-04-2025
            // if (eval(value)) {
            //     filterJson.push(value);
            // }

            try {
                const filterFunction = new Function('value', `return ${expressionToFilter};`);
                if (filterFunction(value)) {
                    filterJson.push(value);
                }
            } catch (error) {
                console.error("Error evaluating expression:", error);
            }
            // Ends here
        });
        console.log('filteredJson Data ==> ' + JSON.stringify(filterJson));
        return filterJson;
    }
    //Sai 05/12/2018 [to get filtered Pophelp Json] -END
    
    //By Sainath T. on 04-02-19[For KeyBoard events] -Start
    // Registered outside Angular zone to prevent change detection on every keystroke
    private _onKeyUp = (event: KeyboardEvent) => {
        if (event.keyCode === this.UP_ARROW) {
            try {
                var ele: any = document.activeElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement;
                ele.scrollIntoView(true);
            } catch { }
        }
        if (event.keyCode === this.DOWN_ARROW) {
            try {
                var ele: any = document.activeElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement;
                ele.scrollIntoView(false);
            } catch { }
        }
    };

    private _onKeyDown = (event: KeyboardEvent) => {
        if (event.keyCode === this.ESCAPE_KEYCODE) {
            this.zone.run(() => this.closePophelp());
        }
        if (event.keyCode === this.F2) {
            this.searchElement.nativeElement.focus();
        }
    };
    //By Sainath T. on 04-02-19[For KeyBoard events] -Start
}