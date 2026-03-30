import { Component, OnInit, ViewChild,Output,EventEmitter, ViewEncapsulation, Input, SimpleChanges, ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';
import * as _ from 'lodash';
import { TreeviewItem, TreeviewConfig, TreeviewHelper, TreeviewComponent, TreeviewEventParser, OrderDownlineTreeviewEventParser, DownlineTreeviewItem } from 'ngx-treeview';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SQLEditorService } from '../bb-sql-editor/sql-editor-select/sql-editor-select.service';
// Added by Nikhil on 26-08-2021 for adding the search option in schema for searching the columns
import {UntypedFormControl} from '@angular/forms';
// Added by nikhil on 08-11-2021 for drag and drop functinality
import { CdkDragDrop } from '@angular/cdk/drag-drop';
// import { SqlEditorSelectComponent } from '../bb-sql-editor/sql-editor-select/sql-editor-select.component';
import { TitleCasePipe } from '@angular/common';

import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay'; 

@Component({
  selector: 'bb-treeview',
  templateUrl: './bb-treeview.component.html',
  styleUrls: ['./bb-treeview.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  providers: [TitleCasePipe,
              
              { provide: TreeviewEventParser, useClass: OrderDownlineTreeviewEventParser }
         ]
})

export class BBTreeviewComponent implements OnInit {

    @Input() groupName: any;
    @Input() items : TreeviewItem[] | any;
    @Input() layout : any;
    @Input() itemTemplate : string | any;
    @Input() itemTemplates : any;
    @Input() selectedValues : any;
    @Output() onSelect = new EventEmitter();
    @Input() expansioIconPos: any;
    @Input() tablesArray:any[] = [];
    @Input() functionsArray:any[] = [];
    @Input() sqlColumArray:any[] = [];
    @Input() sqlModelTreeView: any;
    @Output() selectedData = new EventEmitter();
    @Output() changeSchema = new EventEmitter();
    @Input() schemaName: any;
    @Input() schemaDescr: any;
    @Input() schemaList: any[] = [];
    @Input() editFlag: any;
    @Input() isBrowser: any;
    //Added by shrutika on 27-09-21 for schema designer.
    @Input() isSchemaDesigner: any;
    isListWithTab:boolean = false;
    // Added by Nikhil on 06-09-2021 for adding the search option in schema for searching the columns[Start]
    myControl = new UntypedFormControl();
    columnInitial = '';
    isReset:boolean = false;
    // Added by Nikhil on 06-09-2021 for adding the search option in schema for searching the columns[End]
    defaultTemplate  =  `
          <div class="avatar-text-content">
            <span class="avatar-text">{{empname}}</span>
            <span class="avatar-sub-text">{{designation}}</span>
          </div>`;  
    layoutTemplate: any;
    valueField : any[] = [ 'emp_code'];
    count = 0;

    config = TreeviewConfig.create({
        hasAllCheckBox: false,
        hasFilter: false,
        hasCollapseExpand: false,
        decoupleChildFromParent: false,
        maxHeight: 400,
        isAllChecked: false
    });

    treeviewComponent: TreeviewComponent | any;
    @Input() currentSelectedDataBaseName: any;
    //Added by shrutika on 07-10-21 for display transDB
    @Input() transDB: any;
    @Input() currentVisual: any;
    @Input() ColumnGroups: any;
    @Input() SqlModelData:any;

    @ViewChild(TreeviewComponent) set setTreeviewComponent(ref: TreeviewComponent) {
        if(ref){
            this.treeviewComponent = ref;
            this.updateSelectedItem();
        }
    }

    // Added by Samruddhi for Freehandsql
    @Input() freehandColumnArray: any;
    @Input() finalTableArray: any;
    @Input() isDashboard: any;
    // Added by Samruddhi on 09-06-2022 to remove search popup in tree component and add input box for search 
    showTable: boolean = true;
    @Input() schemaDesignerJson: any;
    //Added by Samruddhi 0n 19-Aug-2022 for column list issue in external database connection schema
    @Input() currSchemaType: any;
    @Input() externaltransDB:any;
    //Added by Vaishali on 28-12-22 To show to Connected Source (Logo) in SchemaDesigner after selection.
    @Input()connFeedImage:any;
    @ViewChild('matIconEl') matIconEl:ElementRef<HTMLElement> | any;
    isLinkArgument: boolean = false;
    // Added by Pranjali on 12-06-2023 to add selected table in the groupbox in schema designer
    @ViewChild('addtofolder') addtofolder: TemplateRef<any> | any;
    overLayRefForMoreOption: OverlayRef | any;
    @Output() doneGroupBox = new EventEmitter();
    @Output() curentTableGroupBox = new EventEmitter();
    currentTable: any;

    // Added by nikhil on 08-11-2021 for drag and drop functinality
    // constructor(private matIconRegistry : MatIconRegistry, private domSanitizer : DomSanitizer, private sqlService: SQLEditorService, private sqlEditor: SqlEditorSelectComponent) {}
    constructor(private matIconRegistry : MatIconRegistry, private domSanitizer : DomSanitizer, private sqlService: SQLEditorService, private overlay: Overlay, private viewContainerRef: ViewContainerRef, private titlecasePipe:TitleCasePipe) {}

    ngOnInit() {
        console.log('itemTemplates :::',this.itemTemplates);
        console.log('Print finalTableArray 96:::::',this.finalTableArray);
        console.log('Print schemaName 97:::::::',this.schemaName);
        // console.log('Print isDashboard 96:::::',this.isDashboard);
        //console.log('Print columnArray DBTABLE 93::::',this.columnArray['DBTABLE']);
        //console.log('ngOnInit::layout: :',this.layout,this.items);
       //console.log('itemTemplates :::.....67',this.itemTemplate);
        console.log('Print ngOnInit tablesArray:::.....104',this.tablesArray);
        console.log('Print ngOnInit transDB:::.....109',this.transDB);
       // console.log('Print ngOnInit externaltransDB:::.....111',this.externaltransDB);
        if(this.layout)
        {
            this.valueField = this.layout.value ? this.layout.value.split(',') : this.valueField;
            this.layoutTemplate = this.layout.template ? this.layout.template : null;
        }
    }
  
    onSelectedChange(downlineItems: DownlineTreeviewItem[]) {
        var values: any = [];
        console.log('onSelectedChange downlineItems',downlineItems, this.selectedValues, this.count);
        if(this.count > 0)
        {
            if(downlineItems && downlineItems.length == 0)
            {
                this.onSelect.emit(values);
                return;
            }
            downlineItems.forEach(downlineItem => {
                const item = downlineItem.item;
                const value = item.itemData[this.valueField[0]];
                const texts = [item.text];
                
                let parent = downlineItem.parent;
                while (!_.isNil(parent)) {
                    texts.push(parent.item.text);
                    parent = parent.parent;
                }
                if(value){
                    values.push(value);
                }
            });
            this.onSelect.emit(values);
        }
        this.count++;
        //console.log('onSelectedChange values',values);
    }
    
    onFilterChange(event: any){
       // console.log('onFilterChange',event);
    }

    onFilterTextChange(event: any){
        //console.log('onFilterTextChange',event);
        if(this.treeviewComponent){
            this.treeviewComponent.onFilterTextChange(event);
        }
    }

    changeSchemaEvent(){
        //console.log('Print schemANme inside changeSchema:::: ', this.schemaName);
        for(let i=0; i<this.schemaList.length; i++)
        {
            let schema = this.schemaList[i];
            if(schema['schemaName'] == this.schemaName)
            {
                this.schemaDescr = schema['schemaDescr'];
                this.changeSchema.emit(JSON.stringify(schema));
                break;
            }
        }
        
    }
    
    private updateSelectedItem() {
        if (!_.isNil(this.items) && this.selectedValues) 
        {
            this.selectedValues.forEach(
                    (value: any) => {   
                        const selectedItem = TreeviewHelper.findItemInList(this.items, value);
                        if (selectedItem) 
                        {
                            this.selectItem(selectedItem);
                        }
                    }
            );
        }
    }
    
    private selectItem(selectedItem: TreeviewItem){
        selectedItem.checked = true;
        this.items.forEach( (item: any) => {
            item.correctChecked(); 
        });        
    }

    // Added by Nikhil on 06-09-2021 for adding the search option in schema for searching the columns[Start] 
    onChangeOption( changeOpt: any )
    {
        console.log('Inside onChangeOption line no 176',changeOpt);
        changeOpt['value']['checked'] = true;
        console.log('Inside the if line no 185',changeOpt['value']['checked']);
        this.setChangeValue(changeOpt['value']);
        // Added by Nikhil on 07-09-2021 for adding the search option in schema for searching the columns.
        this.isReset = true;
    }
    // Added by Nikhil on 06-09-2021 for adding the search option in schema for searching the columns[End]
    
    setChangeValue( currentColumn: any )
    {
        console.log('Print inside setChangeValue tablearray::::::',this.tablesArray);
        console.log('Print inside setChangeValue currentColumn::::::',currentColumn);
        currentColumn['groupName'] = this.groupName;
        //change by shrutika on 16-07-21 [Start] for display default function on form.
        var cuurentFunction = currentColumn['DEFAULTFUNCTION'];
        currentColumn['FUNCTION'] = cuurentFunction;
        
        let dataToEmit: any = {};
        //added by mayuri on 4 oct 2023 for column heading set uppsercase start
        if(this.isSchemaDesigner == true)
        {
            
            currentColumn['content'] =this.titlecasePipe.transform(currentColumn['content']);
            currentColumn['expression'] = '';
        }
        //added by mayuri on 4 oct 2023 for column heading set uppsercase end
        // currentColumn['name'] = currentColumn['name'].toUpperCase();
        dataToEmit['columnData'] = currentColumn;
        this.selectedData.emit(JSON.stringify(dataToEmit));
    }

    getImgSrc(COLTYPE: any)
    {
        var imgUrl;
        if(COLTYPE == "CHAR" || COLTYPE == "VARCHAR2")
        {
            imgUrl = "/ibase/Insight/angplugin/assets/images/String.svg";
        }
        else if(COLTYPE == "DATE")
        {
            imgUrl = "/ibase/Insight/angplugin/assets/images/Date.svg";
        }
        else 
        {
            imgUrl = "/ibase/Insight/angplugin/assets/images/Numeric.svg";
        }
        return imgUrl;
    }

    ngOnChanges(changes: SimpleChanges){
        //console.log("Print changes line 230:", changes);
        //console.log("Print schemaName line 231:", this.schemaName);
        //console.log("Print schemaDescr line 232:", this.schemaDescr);
        console.log('Print ngOnChanges transDB 241:::.....',this.transDB);
        console.log('Print ngOnChanges tablesarray 246:::.....',this.tablesArray);
        // Added by Pranjali on 22-06-2023 To resolve the issue on edit mode, If right click on table then popup (Add As New Folder) is opened And duplicate table is added in folder group panel in edit mode.[Start]
        if(this.editFlag == 'E')
        {
            if(this.tablesArray !=undefined )
            {
                for(let j = 0; j< this.tablesArray.length; j++)
                {
                    if(this.currentVisual !=undefined && this.currentVisual['ColumnGroups'] != undefined)
                    {
                        let editcurrenttable =this.currentVisual['ColumnGroups'].find((data:any) =>  data['GroupName'] === this.tablesArray[j]['TABLE_NAME'])
                        if(editcurrenttable !=undefined)
                        {
                            this.tablesArray[j]['checked'] = true; 
                        }
                    }
                }
            }
         }
         // Added by Pranjali on 22-06-2023 To resolve the issue on edit mode, If right click on table then popup (Add As New Folder) is opened And duplicate table is added in folder group panel in edit mode.[End]
    }

    // Added by Nikhil on 06-09-2021 for adding the search option in schema for searching the columns[Start]
    // Changed by Samruddhi on 09-06-2022 to remove search popup in tree component and add input box for search 
    onSearchoption(event: any, optionName: any)
    {
        this.isReset = true;
        let options = document.getElementsByName(optionName);
        let tableToDisplayArr:Array<any> = [];
        let tableToHideArr:Array<any>  = [];
        options.forEach((option: any,i: number) => {
            let columnNameElem = option.innerText;
            if(columnNameElem != null)
            {
                let columnValue: any = '';
                if(columnNameElem.indexOf("fiber_manual_record") != -1)
                {
                    columnValue = columnNameElem.substring(columnNameElem.indexOf("fiber_manual_record")+19)
                }
                else
                {
                    columnValue = columnNameElem;
                }
                let valueDB = option.id;
                let tableIDValues = '';
                if((columnValue != null && columnValue.toLowerCase().includes(event.toLowerCase()) || valueDB != null && valueDB.toLowerCase().includes(event.toLowerCase())) || (columnValue != null && columnValue.toUpperCase().includes(event.toUpperCase()) || valueDB != null && valueDB.toUpperCase().includes(event.toUpperCase())))
                {
                    option.setAttribute('style', 'display: block');
                    if(option.tableName != undefined && !tableToDisplayArr.includes(option.tableName))
                    {
                        tableToDisplayArr.push(option.tableName);
                    }
                }
                else
                {
                    option.setAttribute('style', 'display: none');
                    if(option.tableName != undefined && !tableToHideArr.includes(option.tableName))
                    {
                        tableToHideArr.push(option.tableName);
                    }
                    this.showTable = false;
                }
            }
        });
        for(let i = 0; i< tableToHideArr.length; i++)
        {
            let hideTableName = tableToHideArr[i];
            let showTable = false;
            for(let j = 0; j< tableToDisplayArr.length; j++)
            {
                let showTableName = tableToDisplayArr[j];
                if(hideTableName == showTableName)
                {
                    showTable = true;
                    break;
                }
            }
            if(showTable == false)
            {
                let tableElem = document.getElementById(tableToHideArr[i]);
                if(tableElem != null)
                {
                    tableElem.setAttribute('style', 'display: none');
                }
            }
            else
            {
                let tableElem = document.getElementById(tableToHideArr[i]);
                if(tableElem != null)
                {
                    tableElem.setAttribute('style', 'display: block');
                }
            }
        }
    }

    onKeyDown(event: any)
	{
    	if(event.keyCode == "32")
    	{
        	event.stopPropagation();
    	}
	}
	
    ngAfterViewInit()
    {
        // Changed by Samruddhi for getElementsByClassName error in console
        // Changed by Samruddhi for Freehandsql
        //if(this.schemaName != 'F' )
        if(document.getElementById('searchOption') != null && this.schemaName != 'F')
        {
            let arrow = document.getElementById('searchOption');
            console.log('line no 247',arrow);
            if(arrow != null)
            {
                let elemarrow = arrow.getElementsByClassName('mat-select-arrow');
                console.log('line no 249',elemarrow);
                if (elemarrow)
                {
                    console.log('line no 251');
                    var element = elemarrow[0];
                    if (element)
                    {
                        element.setAttribute('style', 'border-image-source: none !important; border: none !important;');
                    }
                }
            }
        }
    }

    onOverlay()
    {
        console.log("Print inside ngAfterViewInit:::: ");
        let elem = document.getElementsByClassName('cdk-overlay-pane');
        let searchElement = document.getElementsByClassName("mat-select-panel");
        if (elem)
		{
        	var element = elem[0];
            if (element)
			{
                element.setAttribute('style', 'height: auto !important; width: 284px !important; pointer-events: auto !important; font-size: 14px !important; top: 274px !important; left: 62px !important; transform: translateX(-16px) translateY(-103px) !important; display: flex !important; position: absolute !important;');
            }
        }
        if (searchElement)
		{
            var elementSearch = searchElement[0];
            if (elementSearch)
			{
				elementSearch.setAttribute('style', 'overflow: hidden !important; max-width: 284px !important; max-height: 276px !important; margin-left: -6px!important;');
            }
        } 
    }

    resetSearch()
    {
        this.columnInitial = '';
        this.isReset = false;
    }
    // Added by Nikhil on 06-09-2021 for adding the search option in schema for searching the columns[End]
	// Added by nikhil on 08-11-2021 for drag and drop functinality[Start]
	onDropDelete( event: CdkDragDrop<any[]> )
	{
        console.log('Print inside onDropDelete 323:::::');
        /*let colDropId = event.item.element.nativeElement.id;
        let tableColName = colDropId.split('%SEP%');
        let tableName = tableColName[0];
        let colName = tableColName[1];
        let schemaList = event.previousContainer.id === 'schemaList';
        let prevContainerData = JSON.parse(JSON.stringify(event.previousContainer.data));
        let droppedCol = prevContainerData[event.previousIndex];
        droppedCol['checked'] = false;
		this.sqlEditor.deleteColumn(droppedCol);
        */
	}
	// Added by nikhil on 08-11-2021 for drag and drop functinality[End]

    setColumns(columnInRowsGrp)
    {
        this.isLinkArgument = true;
        console.log('Print inside setColumns isLinkArgument::::::', this.isLinkArgument)
        try
        {
            if(columnInRowsGrp != undefined)
            {
                for(let i = 0; i < columnInRowsGrp.length; i++)
                {
                    for(let ind = 0; ind < this.tablesArray.length; ind++)
                    {
                        {
                           for(let j = 0; j < this.tablesArray[ind]['COLUMN'].length; j++)
                           {
                                let currentColJson = {};
                                currentColJson = this.tablesArray[ind]['COLUMN'][j];
                                if(currentColJson['NAME'] == columnInRowsGrp[i])
                                {
                                    currentColJson['checked'] = true;
                                    this.tablesArray[ind]['COLUMN'][j]['checked'] = true;                                    
                                    let matId = "matIcon_"+ currentColJson['NAME'];
                                    document.getElementById(matId).setAttribute('style', 'display: block');
                                    this.setChangeValue(currentColJson);
                                }
                           }
                       }
                    }
                }
            }
        }
        catch(error)
        {
            console.log('Exception inside setcolumns:::::',error);
        }
    }

    onRightClick(event: any,tableNameNew:any)
    {
        //Added by pranjali On 14-july-2023 for view mode hide the popup.
        if(this.editFlag != 'V')
        {
        this.currentTable = '';
        this.currentTable = tableNameNew;
        let openOverlay: boolean = true;
        setTimeout(() => {
        for(let i = 0; i< this.tablesArray.length; i++)
        {
            if(this.tablesArray[i]['TABLE_NAME'] ==  this.currentTable.toUpperCase())
            {
                if(this.tablesArray[i]['checked'] != undefined && this.tablesArray[i]['checked'] == true)
                {
                    console.log("print tablename:::::496",this.currentTable);
                    openOverlay = false;
                    break;
                }
             }
        }
       }, 50);
        
        if(openOverlay == true)
        {
            event.preventDefault();
            let originElem = document.getElementById('expandCollapse');
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
            overlayConfig.backdropClass = 'moreOptionsBackDrop';
            const templatePortal = new TemplatePortal(this.addtofolder, this.viewContainerRef);
            this.overLayRefForMoreOption = this.overlay.create(overlayConfig);
            this.overLayRefForMoreOption.backdropClick().subscribe(() => {
                this.overLayRefForMoreOption.dispose();
            });
            this.overLayRefForMoreOption.attach(templatePortal);

        }
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
	
    onclickpopup(event: any)
    {
        this.overLayRefForMoreOption.dispose();
        this.sqlService.setLoading(true);
        setTimeout(() => {
            for(let i = 0; i< this.tablesArray.length; i++)
            {
                if(this.tablesArray[i]['TABLE_NAME'] ==  this.currentTable.toUpperCase())
                {
                    this.tablesArray[i]['checked'] = true;
                    this.groupName = this.currentTable;
                    let currentGrp = {};
                    currentGrp['groupName'] = this.groupName;
                    this.curentTableGroupBox.emit(currentGrp);
                    this.doneGroupBox.emit();
                    for(let j = 0; j< this.tablesArray[i]['COLUMN'].length; j++)
                    {
                        this.tablesArray[i]['COLUMN'][j]['checked'] = true;
                        this.setChangeValue(this.tablesArray[i]['COLUMN'][j]);
                    }
                }
            }
            this.sqlService.setLoading(false);
        }, 50);
        
    }
     // Added by Pranjali on 22-06-2023 To open a popup on rightclick [End]
}
