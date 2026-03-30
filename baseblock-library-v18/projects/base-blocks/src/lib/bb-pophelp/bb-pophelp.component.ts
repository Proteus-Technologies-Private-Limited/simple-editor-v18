import { NgZone, Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { TreeviewItem } from 'ngx-treeview';
import { BBTreeviewComponent } from '../bb-treeview/bb-treeview.component';
import { PophelpService } from './bb-pophelp.service';
import { DatamodelService } from './datamodel.service';

@Component({
  selector: 'bb-pophelp',
  templateUrl: './bb-pophelp.component.html',
  styleUrls: ['./bb-pophelp.component.css']
})
export class BBPophelpComponent implements OnInit,OnDestroy {

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
  @Input('metadataName') metadataName: string = '';
  @Input() filterExprInput: any;
  @Input() refreshData : boolean = false; 
  fieldNameValue:any;
    public pophelpData: any = [];
    selectedVal: any;
    isAllChecked: any;
    isIndeterminate: any;
    searchValue: any;
    loaded = false;
    loading = true;
    isMobile;
    isLayout=false;

    selectedKeyValue: any = {'display': '', 'value': ''};
    @Input() selPophelpDetails: any = [];
    count = 0;
    
    //By Sainath T. on 31-01-19[For KeyBoard events] -Start
    @ViewChild('search') searchElement: ElementRef | any;
    ESCAPE_KEYCODE: number = 27;
    F2: number = 113;
    UP_ARROW = 38;
    DOWN_ARROW = 40;
    //By Sainath T. on 31-01-19[For KeyBoard events] -END
    
    isTreeLayOut: boolean = false;
    selectedIndex: number = 0;
    @Input() callApiForSimpleLayout: boolean = false;
    @Input() tokenID: any = '';
    @Input() jSessionId: any = '';
    @Input() pophelpParamMap: any = {};
    @Input() overlayRef: any = null;
    
  constructor(public pophelpService: PophelpService, public datamodelService : DatamodelService, public zone: NgZone, private cdr: ChangeDetectorRef) 
  {
        let index = window.location.pathname.indexOf('E12BROWSER');

        if (index == -1) {
            this.isMobile = true;
        }
    }

    ngOnInit() {
        //Added By Vikas Lagad on 20-01-2020[to refresh the data if input flag true]Start
        if(this.refreshData)
        {
            this.refreshPophelp();
        }
        else
        {
            this.getData(false, this.pophelpParamMap);
        }
        // console.log('selPophelpDetails ngOnInit 84::::', this.refreshData,this.selPophelpDetails);
        //Added By Vikas Lagad on 20-01-2020[to refresh the data if input flag true]End
        if (this.multi_opt === '0' && this.pophelpData && this.pophelpData.length > 0) 
        {
            this.selectedIndex = 0;
        }
    }

    getData(isRefresh: boolean, paramMap?: any) {
        if( this.layout && this.layout.datatree )
        {
            //   console.log('In intent Service tree layout');
            this.isTreeLayOut = true;
            this.layoutTemplName = 'datatree';
        }
        // console.log("Data source in ang-pophelp:[" + this.dataSource + "] & multi_opt:[" + this.multi_opt + "] & filterValue:[" + this.filterValue + "] refId:[" + this.refId);

        if( this.dataSource && this.dataSource.startsWith('/ibase') )
        {
            if( this.refId )
            {
                this.encodedParam = this.encodedParam + "&refid=" + this.refId + "&" + this.refId + "=" + this.filterValue;
            }
            if(this.filterName)
            {
                let param = this.filterName.toLowerCase() + "=" + this.fieldNameValue;
                let regex = new RegExp(`${this.filterName.toLowerCase()}=[^&]*`);
                if (regex.test(this.dataSource)) {
                    this.dataSource = this.dataSource.replace(regex, param);
                } else {
                    this.dataSource = this.dataSource + "&" + param;
                }
            }
            // console.log("bb-pophelp 103 getData dataSource",this.dataSource);
            // console.log("bb-pophelp 118 getData this.filterValue:::::",this.filterValue);
            if(this.callApiForSimpleLayout == true)
            {
                this.pophelpService.tokenID = this.tokenID;
                this.pophelpService.jSessionId = this.jSessionId;
                this.pophelpService.getApiPophelpData(paramMap).subscribe(
                    (result: any) => {
                    console.log('print getData result 129:::::',result);
                    let response = JSON.parse(result);
                    this.processResult(response);
                    if (response['DETAILS'] && response['DETAILS'].length == 2) {
                        this.onResultEmpty.emit();
                    }
                    this.cdr.detectChanges();
                });
            }
            else
            {
                this.pophelpService.getPophelpData(this.dataSource, this.encodedParam, this.filterName, isRefresh).subscribe(
                    (result: any) => {
                        // console.log('Pophelp data:', result);
                        this.processResult(result);
                        //Added By Chitranga T to emit event if result is empty
                        if (result['DETAILS'] && result['DETAILS'].length == 2) {
                            this.onResultEmpty.emit();
                        }
                        this.cdr.detectChanges();
                    }
                );
            }
            if (this.pophelpData.length > 0) 
            {
                this.selectedIndex = 0; 
            }
        }
      else
      {
            this.datamodelService.getDataModelData(this.dataSource, this.filterName, "", isRefresh).subscribe(
                (result: any) => {
                    // console.log('Pophelp data::::::', result);

                    if (result && result.reponse != "loading") {
                        this.processResult(result);
                    }
                    //Added By Chitranga T to emit event if result is empty
				if(result['DETAILS'] && result['DETAILS'].result['DETAILS'] == 2)
                {
                        this.onResultEmpty.emit();
                    }
                }
            );
        }

        if (this.multi_opt == 1) {
            this.selectedVal = [];
            // console.log("Pophelp data filterValue>>>>", this.filterValue);
            if (this.filterValue && this.filterValue !== '') {
                //this.selectedVal=this.filterValue.split(",");
                //this.selectedVal=this.filterValue;
                // console.log("Pophelp data selectedVal::::", this.selectedVal);
                if (Array.isArray(this.filterValue)) {
                    this.selectedVal = this.filterValue;
                    // console.log('selectVal in if::::',this.selectedVal);
                } else {
                    let splitVals = this.filterValue.split(",");
                    if (splitVals) {
                        splitVals.forEach(
                            (val: any) => {
                                // console.log('val for split val==>',val);
                                if (val.trim()) {
                                    // console.log("vals===>", val);
                                    this.selectedVal.push(val);
                                    // console.log("vals for split===>", this.selectedVal);
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
        if (result && result != null) 
        {
            if( this.layout && this.layout.datatree && result['DETAILS'] )
            {
                let pophelpData = result['DETAILS'];
                pophelpData = pophelpData.slice(2, pophelpData.length);

                for (let data of pophelpData) {
                    this.pophelpData.push(new TreeviewItem(data));
                }
            }
        else
        {
            // console.log('Inside pophelp else');
            if(result['DETAILS'])
            {
                    this.pophelpData = result['DETAILS'];
                    // console.log('Print this.pophelpData 206:::::', this.pophelpData);
                    // console.log('inside details ', result['DETAILS']);

                    //Added by Tejas s On 26-march-2024 [Replace label values and replace '|' with '-']
                    this.pophelpData.forEach((item: any) => {
                        if (item.label) {
                            // item.label = item.label.replace(/\|/g, '-');
                            item.label = item.label.replace(/\|/g, '-').replace(/-$/, '');
                            // console.log("print item.label", item.label);
                          }
                      });
                    // console.log('Print this.pophelpData 217:::::', this.pophelpData);
                    //Sainath T. on 19/11/2018 [ For pophelp dispay structure and to get filter Expr]-SATRT
                    let layout = "";
                    let filter_expr = "";
                    let layoutObj = this.pophelpData[0];
                    layout = layoutObj.LAYOUT;
                if(layout != null && layout != "" && layout.length > 0 && /^[\[{]/.test(layout))
                {
                        let layoutJson = JSON.parse(layout);
                        this.layout = layoutJson['template'];
                        // console.log('layout id', this.layout);
                    }
                    // console.log('layout ::::', this.layout);
                    //To check layout is not null and undefined 
                    if (this.layout != null && this.layout != undefined && Object.keys(this.layout).length != 0) {
                        this.isLayout = true;
                    }
                    //changed by Sainath T. on 30-05-19
                    let exprObj = this.pophelpData[1];
                    let expr = "";
                    if(exprObj)
                    {
                        expr = exprObj!.FILTER_EXPR;
                    }

                if(expr!= null && expr != "" && expr != undefined && expr.length > 0)
                {
                        filter_expr = expr;
                        // console.log('filter_expr ', filter_expr);
                    }
                    //Sainath T. on 19/11/2018 [ For pophelp dispay structure]-END

                    //Sainath T. on 05/12/2018 [ To filter dependent pophelp data ]-SATRT
                    let formGroupValues = {};
                if(this.formGroup)
                {
                    if(this.formGroup.value)
                    {
                        formGroupValues = this.formGroup.value;
                        // console.log('formGroupValues', formGroupValues);
                    }
                }
                this.pophelpData = this.pophelpData.slice(2, this.pophelpData.length);
                // console.log('Print this.pophelpData 259:::::', this.pophelpData);
                
                //Added Kamal.P to Pass FilterExpression input in formGroupValues  START
                if(this.filterExprInput){
                    // console.log('filterExprInput==>',this.filterExprInput);
                    formGroupValues = this.filterExprInput;
                    // console.log('if filetrExpreesion is then formGroupValues==>',formGroupValues);
                }
                //Added Kamal.P to Pass FilterExpression input in formGroupValues  END

                if(filter_expr != null && filter_expr != "" && filter_expr != undefined && filter_expr.length > 0 && Object.keys(formGroupValues).length > 0)
                {
                        filter_expr = this.getFilterdExpr(formGroupValues, filter_expr);
                        //Sainath T. on 11/12/18[To check filter_expr is not null]
                    if(filter_expr != null && filter_expr != "" )
                    {
                            // console.log('filter_expr updated', filter_expr);
                            this.pophelpData = this.filterPophelpJSON(result, filter_expr);
                            // console.log('Print this.pophelpData 276:::::', this.pophelpData);
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
                    // console.log('inside detail', result);
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
                    // console.log('inside detail>>>>>>>>', result);
                }
                this.pophelpData = result;
                // console.log('Print this.pophelpData 307:::::', this.pophelpData);
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
            // console.log('this.filterValue===>',this.filterValue)
            if (this.filterValue && !Array.isArray(this.filterValue)) 
            {
                // console.log('inside if filterValue==>',this.filterValue);
                if (typeof this.filterValue === 'string' && this.filterValue.includes(',')) 
                {
                    let splitVals = this.filterValue.split(",");
                    // console.log('splitVals==>',splitVals);
                    if (splitVals) {
                        // console.log('inside if splitVals==>',splitVals)
                        splitVals.forEach(
                            (val: any) => {
                                // console.log('splitvalue using Each==>',val);
                                if (val.trim()) {
                                    // console.log("vals===>", val);
                                    let pophelpDetail = this.pophelpData.find((detail: any) => detail.id == val.trim());
                                    // console.log('pophelpDetail onInit ::', pophelpDetail);
    
                                    if (pophelpDetail) {
                                        this.selPophelpDetails.push(pophelpDetail);
                                    }
                                }
                            }
                        );
                        if (this.pophelpData && this.selPophelpDetails && (this.pophelpData.length == this.selPophelpDetails.length)) {
                            this.isAllChecked = true;
                        }
                    }
                }
                else if(typeof this.filterValue === 'string' && this.pophelpData && this.pophelpData.length > 0)
                {
                    if (this.pophelpData[0] && this.pophelpData[0]['id']) 
                    {
                        this.filterValue = this.pophelpData[0]['id'];
                        this.selectedVal = this.pophelpData[0]['id'];
                        // console.log('print this.selectedVal 365:::::',this.selectedVal);
                        this.selPophelpDetails.push(this.pophelpData[0]);
                    }
                    this.selectedKeyValue.display = this.filterValue;
                    this.selectedKeyValue.value = this.selectedVal;      
                }
            }
            else if(this.filterValue === '' && this.pophelpData && this.pophelpData.length > 0 && this.pophelpData[0] && this.pophelpData[0]['id'])
            {
                this.filterValue = this.pophelpData[0]['id'];
                this.selectedVal = this.pophelpData[0]['id'];
                let pophelpDetail = this.pophelpData.find((detail: any) => detail.id == this.filterValue);
                if (pophelpDetail) {
                    this.selPophelpDetails.push(pophelpDetail);
                }
                this.selectedKeyValue.display = this.filterValue;
                this.selectedKeyValue.value = this.selectedVal;
            }
        }
        // console.log('Loading done...1', this.loaded, this.loading);
        this.loaded = true;
        this.loading = false;
        this.zone.run(() => {
            // console.log('view refreshed');
        });
        // console.log('Loading done...2', this.loaded, this.loading);
    }
  }

    closePophelp() {
        this.onClose.emit();
        this.disposeOverlay();
    }

    disposeOverlay() {
        if (this.overlayRef) {
            try {
                this.overlayRef.dispose();
            } catch (e) {
                console.log('Error disposing overlay:', e);
            }
            this.overlayRef = null;
        }
    }

    valueSelected(value: string, data?: string, detail?: any) 
    {
        // console.log('inisde valueSelected function',value, 'data==>',data, 'detail==>',detail);
        if (this.multi_opt == 1) 
        {
            if (Array.isArray(value)) 
            {
                this.selectedVal = value;                
            } 
            else 
            {
                let index = this.selectedVal.indexOf(value);
                if (index > -1) 
                {
                    this.selectedVal.splice(index, 1);
                    if (this.isAllChecked) 
                    {
                        this.isIndeterminate = true;
                    }
                } 
                else 
                {
                    this.selectedVal.push(value);
                    if (this.pophelpData && this.selectedVal && (this.selectedVal.length == this.pophelpData.length)) {
                        this.isIndeterminate = false;
                        this.isAllChecked = true;
                    }
                }
            }

        } 
        else 
        {
            this.selectedVal = value;
            this.selectedKeyValue.display = data;
            this.selectedKeyValue.value = value;
        }

       	if( this.isTreeLayOut)
        {
            let pophelpDetail = this.selectedVal.find((detail: any) =>{
                detail.id == value
            });
            if (pophelpDetail) {
                this.selPophelpDetails = this.selectedVal.filter((detail: any) => {
                    detail.id != value});
            } else {
                this.selPophelpDetails.push(detail);
            }
        }
        else
        {
            let pophelpDetail: any = this.selPophelpDetails.find((detail: any) => detail.id == value);
            if (pophelpDetail) 
            {
                this.selPophelpDetails = this.selPophelpDetails.filter((detail: any) => detail.id != value);
            } 
            else 
            {
                this.selPophelpDetails.push(detail);
            }
        }

        this.filterValue = this.selectedVal;

        this.count++;
        // setTimeout(() => {
            this.count = 0;
        // }, 500);
    }

    selectAll() {
        if (this.isAllChecked) {
            this.isAllChecked = false;
            this.selectedVal = [];
            this.selPophelpDetails = [];
        } else {
            this.isAllChecked = true;
            this.pophelpData.forEach(
                (detail: any) => {
                    this.selectedVal.push(detail.id);
                }
            );
            this.selPophelpDetails = this.pophelpData;
        }

        this.filterValue = this.selectedVal;
    }

    submitSelection() {
        // console.log('selectedVal on submitSelection==>',this.selectedVal);
        if(this.selectedVal == undefined)
        {
            this.selectedVal = this.fieldNameValue;
        }
        // console.log('selectedVal on submitSelection==> 466',this.selectedVal);
        if(this.selectedVal != undefined)
        {
            this.onSelect.emit(this.selectedVal);
            // console.log('this.selPophelpDetails ::', this.selPophelpDetails);
            this.onSelectPophelpDetails.emit(this.selPophelpDetails);
            this.disposeOverlay();
        }
        else
        {
            this.closePophelp();
        }
    }

    submitSelKeyValue() {
        this.onSelect.emit(this.selectedKeyValue);
        this.disposeOverlay();
    }

    submitOnDblClick() {
        this.onDblClick.emit(this.selectedKeyValue);
        this.disposeOverlay();
    }

    submitOnDoubleClick() {
        // console.log("double click", this.count);
        if (this.count == 2) {
            // console.log('Condition Satisfied', this.selectedVal);
            this.selPophelpDetails = [];
            let pophelpDetail = this.pophelpData.find((detail: any) => detail.id.trim() == this.selectedVal.trim());
            // console.log('pophelpDetail in submitOnDoubleClick ::', pophelpDetail);

            if (pophelpDetail) {
                this.selPophelpDetails.push(pophelpDetail);
            }
            this.submitSelection();
            this.count = 0;
        }
    }

    checkIsChecked(value: any) 
    {
        if (this.isAllChecked || (this.filterValue && this.filterValue.indexOf(this.checkNull(value)) > -1)) 
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    checkSelAll() {
        if (this.filterValue && this.pophelpData && (this.filterValue.length == this.pophelpData.length)) {
            this.isAllChecked = true;
        } else {
            this.isAllChecked = false;
        }
    }

    refreshPophelp() {
        this.loaded = false;
        this.loading = true;
        this.pophelpData = [];
        this.getData(true, this.pophelpParamMap);
    }

    onFilterTextChange(value: any) {
        this.fieldNameValue = value;
        // console.log('onFilterTextChange line no 530 in bb-pophelp..',value);
        if (this.bbTreeviewComponent) {
            this.bbTreeviewComponent.onFilterTextChange(value);
        }
        function debounce(fn: any, delay: any) 
		{
			let timeout: any;
			return (...args: any) => {
				clearTimeout(timeout);
				timeout = setTimeout(() => fn(...args), delay);
			};
		}
		
		document.addEventListener('keydown', debounce(() => {
		}, 200));
		document.addEventListener('click', debounce(() => {
		}, 200));
    }

    //Sai 23/11/2018 [to get filtered expression] -START
    getFilterdExpr(jsonToFilter: any,exprToFilter: any)
    {
        let filterExprsStrg: string;
        let tokens: any = [];
        filterExprsStrg = exprToFilter;
        //Sainath T. on 11/12/18 [To save not updated filtr_expr]
        let tempFilterExpr = exprToFilter;
        // console.log('filterExprsStrg==', filterExprsStrg, 'jsonToFilter==', jsonToFilter);
        tokens = filterExprsStrg.split("&&");
        // console.log('token', tokens);
        for(let i = 0; i< tokens.length ; i++)
        {
            // console.log('in for::', tokens.length);

        	if("" != tokens[i] )
       	 	{
                // console.log('in if::', tokens[i]);
                let objKey = "";
                let keyValue = "";
                let leftSide = "";
                let rightSide = "";
                let innerTokens = [];
                let colName = "";
                let splitExpr = tokens[i].trim();
                innerTokens = splitExpr.split("==");
                leftSide = innerTokens[0];
                rightSide = innerTokens[1];
                // console.log("Left [" + leftSide + "] Right [" + rightSide + "]");
                colName = splitExpr.substring(splitExpr.indexOf(":") + 1, splitExpr.lastIndexOf(":"));
                let capitalColName = colName.toUpperCase();
                // console.log("Final Expresion [" + splitExpr + "] colName  [" + capitalColName + "]");
                filterExprsStrg = filterExprsStrg.replace(leftSide, "value." + leftSide);
            	if(jsonToFilter != null)
            	{
                    let jsonFilterArray: any = [];
                    jsonFilterArray.push(jsonToFilter);
                    //To get keys and values -Start
                    jsonFilterArray.forEach(function (elementObject: any) {
                        let keys = Object.keys(elementObject);
                        keys.forEach(function (key) {
                            // console.log("key::" + key + ":value::" + elementObject[key]);
                            objKey = key;
                            //to check if key starts with no. - START
                            let patt = new RegExp(/^[0-9]/);
                      	if( patt.test(objKey))
                      	{
                                // console.log('key is::', objKey);
                                objKey = objKey.substring(objKey.indexOf(".") + 1, objKey.length);
                                // console.log('key After substring::', objKey);
                            }
                            //to check if key starts with no. - END
                            objKey = objKey.toUpperCase();
                            // console.log('key After UpperCase::' + objKey + 'capitalColName' + capitalColName);

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
        // console.log('filterExprsStrg final:::', filterExprsStrg);
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
        let filterJson: any = [];
        //let jsonString = JSON.parse(jsonToFilter);
        jsonToFilter.DETAILS.filter(function (value: any) {
            if (eval(expressionToFilter)) {
                filterJson.push(value);
            }
        });
        // console.log('filteredJson Data ==> ' + JSON.stringify(filterJson));
        return filterJson;
    }
    //Sai 05/12/2018 [to get filtered Pophelp Json] -END

    checkNull(input : any)
    {
        if( input == null || input == undefined || input === 'undefined' )
        {
            input = '';
        }
        return typeof input == 'string' ? input.trim() : input;
    }

    handleKeyDown(event: KeyboardEvent): void 
    {
        // console.log("line no 648 handleKeyDown:::", event)
        const totalItems = this.pophelpData.length;
        // console.log("line no 650 totalItems")
        const itemElements = document.querySelectorAll('.pophelp-opt');
        if (event.key === "ArrowDown") 
        {
            if (this.selectedIndex < totalItems - 1) 
            {
                this.selectedIndex++;
            }
        } 
        else if (event.key === "ArrowUp") 
        {
            if (this.selectedIndex > 0) 
            {
                this.selectedIndex--;

            }
        } 
        else if (event.key === "Enter") 
        {
            if (this.selectedIndex >= 0) 
            {
                const selectedItem = this.pophelpData[this.selectedIndex];
                this.valueSelected(selectedItem.id, selectedItem.value, selectedItem);
                this.submitSelKeyValue();
            }
        }

        if (this.selectedIndex >= 0 && this.selectedIndex < totalItems) {
            const selectedItemElement = itemElements[this.selectedIndex] as HTMLElement;
            selectedItemElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    //By Sainath T. on 04-02-19[For KeyBoard events] -Start
    @HostListener('document:keyup', ['$event']) onkeyupHandler(event: KeyboardEvent) 
    {
        // if (event.keyCode === this.UP_ARROW) 
        if (event.key === 'ArrowUp')
        {
            // console.log("focus UP_ARROW in2::")
            try{
                // let ele = document.activeElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
                let ele: any = document.activeElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement;
                ele.scrollIntoView(true);
            }
            catch
            {
                console.log('Error:1 while getting the active element in ang-pophelp.ts');
            }
        }
        // if (event.keyCode === this.DOWN_ARROW) 
        if(event.key === 'ArrowDown')
        {
            // console.log("focus DOWN_ARROW in3::")
            try{
                // let ele = document.activeElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
                let ele: any = document.activeElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement;
                ele.scrollIntoView(false);
            }
            catch
            {
                console.log('Error:2 while getting the active element in ang-pophelp.ts');
            }
        }
        return;
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) 
    {
        if(event.key === 'Escape')
        {
            this.closePophelp();
        }
        if(event.key === 'F2') 
        {
            if(this.searchElement && this.searchElement.nativeElement)
            {
                this.searchElement.nativeElement.focus();
            }
        }
        event.stopPropagation();
        // this.handleKeyDown(event);
    }

    /* @HostListener('document:keydown', ['$event']) onkeydownHandler(event: KeyboardEvent) 
    {
        // if (event.keyCode === this.ESCAPE_KEYCODE) 
        if(event.key === 'Escape')
        {
            // console.log('escpevent492 in pophelp==', event);
            this.closePophelp();
        }
        // if (event.keyCode === this.F2) 
        if(event.key === 'F2') 
        {
            // console.log("focus in1::");
            if(this.searchElement && this.searchElement.nativeElement)
            {
                this.searchElement.nativeElement.focus();
            }
        }
        return;
    } */
    //By Sainath T. on 04-02-19[For KeyBoard events] -Start
    removeFunction(input: any)
    {
        // input = input.substring(0, input.length - 1);
        return input.replaceAll("|", ' - ');
    }

    ngOnDestroy() {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    openPophelp(result: any)
    {
        this.cdr.detectChanges();
        this.processResult(result);
    }
}