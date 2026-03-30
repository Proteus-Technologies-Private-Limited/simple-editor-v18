import { Input, Component, HostListener, ViewChild , ViewChildren, ElementRef , QueryList , Output, EventEmitter, TemplateRef, ViewContainerRef, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { CdkDragDrop, transferArrayItem, moveItemInArray, CdkDrag , CdkDragMove, copyArrayItem } from '@angular/cdk/drag-drop';
import { MatExpansionPanel } from '@angular/material/expansion';
import { startWith , map , switchMap , tap } from 'rxjs/operators';
import { merge , Subscription } from 'rxjs';
import { SQLEditorService } from './sql-editor-select.service';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { BBTreeviewComponent } from '../../bb-treeview';
import { QueryBuilderComponentnew } from '../../bb-query-builder';//added by mayuri
import { ConfirmBoxComponent } from '../../confirm-box';//added by mayuri
// import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';//added by mayuri
import { MatDialog } from '@angular/material/dialog';
const speed = 10;

@Component( {
    selector: 'sql-editor-select',
    templateUrl: './sql-editor-select.component.html',
    styleUrls: ['./sql-editor-select.component.css'],
    providers: [TitleCasePipe],
    // encapsulation: ViewEncapsulation.Emulated
})

export class SqlEditorSelectComponent {

    //Added by shrutika on 08-03-21 [Start] for draw sql editor according to ba type.
    // Added by nikhil on 12-01-2022 for scheduler visual for user info	
    @Input() userInfo: any;
    @Input() schemaList: any;
    @Input() currentSchema: any;
    //Added by shrutika on 08-03-21 [End] for draw sql editor according to ba type.
    //Added by shrutika on 27-09-21 for schema designer [Start]
    @Input() isSchemaDesigner:boolean = false;
    @Output() onFilterClose : EventEmitter<any> = new EventEmitter<any>();
    //Added by shrutika on 27-09-21 for schema designer [End]
	//Changed by nikhil on 29-10-2021 for maximize and minimize sidepanel
    @Input() panelIndexValue: any;
    schemaName: any;
    schemaDescr: any;
    schemaDataNew: any;
   //Change by shrutika on 05-10-21 for schema designer group box 
    @Input() defaultGrpName: any;
    defaultVisual: any;
    viewModelSel = false;
    printData(){
       //console.log('Print SqlModelData 20:: ', this.SqlModelData);
    }

    groups = [];
    jsonDataNew: any; 
    currentVisual: any;
   //Change by shrutika on 05-10-21 for schema designer group box 
    @Input()editorVisuals: any;
    editorVisualsCopy: any;
    secondFormToggle: boolean = true;
    schemaData = {};
   //Change by shrutika on 27-09-21 for schema designer [Start]
    @Input() tablesArray:any[] = [];
    tablesArrForCriteria: any = "";
    selectedDataArray:any[] = [];
    schemaSVG: any;
    selectSVG: any;
    criteriaSVG: any;
    schemaThemeSVG: any;
    selectThemeSVG: any;
    criteriaThemeSVG: any;
    ColumnSVG: any;
    ColumnThemeSVG: any;
    PersistSVG: any;
    PersistThemeSVG: any;
    PreviewSVG: any;
    PreviewThemeSVG: any;
    SalesSVG: any;
    IncentiveSVG: any;
    PurchaseSVG: any;
    schemaHtml: any;
    selectHtml: any;
    criteriaHtml: any;
    param1: any = 'COLUMNS';
    param2: any = 'COLUMN';
    schemaFlag: boolean = true;
    selectFlag: boolean = false;
    criteriaFlag: boolean = false;
    formNo = 1;
    totalFormNo = 6;
    isBrowser: boolean = false;
    isExpression: boolean =false;
    objectKeys = Object.keys;
    jsonParse = JSON.parse;
    sqlColumArray:any[] = [];
	// added by nikhil on 06-09-2021 for do not execute SQL again if there is no change in SQL[Start]
    @Input() isSourceSqlChange: any;
	@Output() onNextResp: EventEmitter<any> = new EventEmitter();
	// added by nikhil on 06-09-2021 for do not execute SQL again if there is no change in SQL[End]
    //Added by Mayur Pawar to make Functions Drop Down Dynamic on 09/03/21
    funcArr:any[] = [];
    schemaSQLFilename: any;
    @Output() onNextResponse: EventEmitter<any> = new EventEmitter();
    //changes by shrutika for getting CurrentVisual
    @Output() cuurentVisualResp: EventEmitter<any> = new EventEmitter();
    // Added by Mahesh Saggam on 11-FEB-21 [To load angular component on Add,Edit and View mode of Mobile]
    @Output() onNextPrev: EventEmitter<any> = new EventEmitter();
    isLongPressed: boolean = true;

    @Output() changeSchemaforGpro: EventEmitter<any> = new EventEmitter();
    //Added by shrutika on 18-03-21 for avoid unwanted server call onNext Click.
    onNextOfBrowser: boolean = false;
    currentSelectedDataBaseName="";
    //Added by shrutika on 07-10-21 for display transDB
    transDB ="";
    //Added by shrutika on 12-10-21 for select deselect functionality for schema designer.
    currentSelectedTables: any = [];
    // Added by Samruddhi for updated UI
    @Input() allformValues: any;
    addGroup: boolean = false;
    schemaEditor = 1;
    newPanelOpen: boolean = false;
    panelOpenState: boolean = false;
    @Input() viewModelClick: any;
    compRef: any;
    calcType = "Expression";
    listData: any;
    freehandOpen: boolean = false;
    errorColumnMap = {};
    expFlag: boolean = false;
    colExpressions = [];
    isFeedOpen: boolean = false;
    deletedDomId: any = [];
    @Output() performAction: EventEmitter<any> = new EventEmitter();
    @Output() localItemChange: EventEmitter<any> = new EventEmitter();
    @Output() contextMenuClck: EventEmitter<any> = new EventEmitter();
    @Output() hideShowBtn: EventEmitter<any> = new EventEmitter();
    @Output() setFeedData: EventEmitter<any> = new EventEmitter();
    @Output() currentValId: EventEmitter<any> = new EventEmitter();
    @Output() isFormChange: EventEmitter<any> = new EventEmitter();
    @Output() columnDescr: EventEmitter<any> = new EventEmitter();
    @Output() expressOnKeyUp: EventEmitter<any> = new EventEmitter();
    @Output() onChangeCalExp: EventEmitter<any> = new EventEmitter();
    //Added by shrurtika on 28-11-21 for avoid default functionality in case of edit click at first time.
    @Input() isFirstTimeEdit: any;
   //Changes by shrutika on 29-11-21 [Start] for No data found occur when multiple time click on preview after changing only  where condition
    @Input() isColumnChanges: any;

    @ViewChild('visualTemplate') visualTemplate: TemplateRef<any> | any;
    overlayRef: OverlayRef | any;
    queryOption = { value: 'F', options: [{name: 'Fixed', value: 'F'}, {name: 'Column', value: 'C'}, {name: 'Prompt', value: 'P'}, {name: 'Expression', value: 'E'}]};
    columnOption = { options: [{name: 'Numeric', value: 'NUMBER'}, {name: 'Char', value: 'CHAR'}, {name: 'Date', value: 'DATE'}, {name: 'Varchar', value: 'VARCHAR2'}]};
    mobileTabsData = [{formNo: 1, tabName: 'SCHEMA'}, {formNo: 2, tabName: 'SELECT'}, {formNo: 3, tabName: 'CRITERIA'}, {formNo: 4, tabName: 'PERSIST'}, 
                        {formNo: 5, tabName: 'COLUMNS'}, {formNo: 6, tabName: 'PREVIEW'}];
    queryObj = {
        query: {
            rules: []
        }
    }
    sourceSQL = '';
    prevScrollpos = window.pageYOffset;
    @HostListener('window:scroll', ['$event'])
    onScroll(e: any) {
            var currentScrollPos = window.pageYOffset;
            if (this.prevScrollpos > currentScrollPos) 
            {
                document.getElementById("hideableHeader")!.style.opacity = "1";
            }
            else 
            {
                document.getElementById("hideableHeader")!.style.opacity = "0";
            }
            this.prevScrollpos = currentScrollPos;
        }

    @Input() editFlag = "";
    // Added by Mahesh Saggam on 11-FEB-21 [To load angular component on Add,Edit and View mode of Mobile]
    @Input() objType = "";
    //Added by Samruddhi on 19-03-21 for Mobile
    @Input() compData: any;
    objName = '';
    //Added by Shrutika for Dashboard Definition on 15/03/21 
    @Input() isDashboard = "false";
    // @Input() isDashboard;
    @Input() SqlModelData: any = {};
    sqlData = {
        SQLModel: {
            COLUMNS: [
                {
                    COLUMN: []
                }
            ]
        },
        CRITERIA: {
        query: {
            rules: []
        }
    }
    };
 
    //Added by shrutika on 27-09-21 for schema designer [Start]
    isListWithTab:boolean = false;
    tabWithListClassData: any = {};
    overLayRefFoListWithTab: OverlayRef | any;
    @ViewChild('listWithTab') listWithTab: TemplateRef<any> | any;
    @ViewChild('databaseLsit') databaseLsit: TemplateRef<any> | any;
   //Change by shrutika on 05-10-21 for schema designer group box 
    overLayRefForGroupBox: OverlayRef | any;
    @ViewChild('addGrupBox') addGrupBox: TemplateRef<any> | any;
   currentGroupBoxName = "";
    @Output() onSaveClick = new EventEmitter();
    @Output() setCurrentSelectedTab = new EventEmitter();
    @Input() databaseName = "";    //Added by shrutika on 27-09-21 for schema designer [End]

    @Input() oldSlectedTableDataArray: any = [];
    currenSelectedTab: any;
    likeValue:any;
    tableDetailArray:any;
    selectTableData:any;
    @Output() setSelectedTableNameArray = new EventEmitter();
    //Added by shrutika on 13-10-21 for if deselect old tables then it remove from treee view,columns and visuals
    currentDelectedTables: any = [];
    //Added by shrutika on 18-10-21 for edit groupBox in schema designer.
    @ViewChild('editGrpBox') editGrpBox: TemplateRef<any> | any;
    // Added by Samruddhi for visual name in preview panel
    @Output() currentVisualData = new EventEmitter();
    // Added by Samruddhi for visual option component
    overLayRefForMoreOption: OverlayRef | any;
    overLayRefForVisualOption: OverlayRef | any;
    @ViewChild('visualoptionarray') visualoptionarray: TemplateRef<any> | any;
    @ViewChild('visualProperties') visualProperties: TemplateRef<any> | any;
    //Added by shrutika on 23-11-21 for build schema xml.
    @Output() buildSchemaXml : EventEmitter<any> = new EventEmitter<any>();
    // Added by Samruddhi for Freehandsql
    itemTemplate = 'Feed';
    freehandSelect:boolean = false;
    finalTableArray: any = [];
    @Input() isSqlView:boolean | any;
    @Input() freehandOpenState: any;
    @Input() finalSqlModelTblArr: any;
    @Output() currentFreehandState: EventEmitter<any> = new EventEmitter();
    @Output() isSqlViewValue: EventEmitter<any> = new EventEmitter();
    // Added by Samruddhi for selected groupbox must remain expand on visual change
    groupStateMap: any = {};
    // Added by Aditi to set dynamic columnlist in case of freehand 
    @Input() columnListResponse;
    visualUpdOptions;
    isCriteria: boolean = false;
    isColumnList:boolean = false;
    @Input() getCallBrowserData;
    @Output() setLayoutData: EventEmitter<any> = new EventEmitter();
    // Added by Samruddhi on 22-06-2022 for updated columnlist and sqlview buttons
    isSqlViewData: boolean = true;
    //Added by vikas for BB-ColumnProperties on 1-07-22 component [Start]
    columnName:any;
    currentColName:any;
    currentGroupName:any;
    overLayRefForColumnProperties : OverlayRef |any;
    currentColFunct:any;
    coltypecolumnprop:any;
    @ViewChild('columnProperties') columnProperties: TemplateRef<any> | any;
    @Output() setColumnProperty :EventEmitter<any> = new EventEmitter();
    // Added by Samruddhi on 27-07-2022 for BBCalColumnPropertiesComponent
    currentCalDomID: any;
    currentAction:any
    @Input() tempColExpressions: any;
    @Input() calSequence: any;
    overLayRefForCalColumn: OverlayRef | any;
    @Output() setCalColumnData: EventEmitter<any> = new EventEmitter();
    @ViewChild('calColumn') calColumn: TemplateRef<any> | any;
    @Input() currSchemaType: any;
    //Added by vikas for external data source [Start]
    currentSelectedDb:any;
    currentSelectedTabDb:any;
    @Input() ConnName:any;
    currentDbDetails:any
    externaltransDB:any;
    @Output() isDataSrcRef: EventEmitter<any> = new EventEmitter();
    @Output() isConnectionDbInSchema: EventEmitter<any> = new EventEmitter();
    //Added by vikas for external data source [end]
    //Added by vikas for showing textarea on edit and process type dropdown of generate model [Start]
    @Output() isProcessType:EventEmitter<any> = new EventEmitter();
    @Input() showModelParameters:boolean;
    //Added by vikas for showing textarea on edit and process type dropdown of generate model [End]
     //Added by Vaishali on 28-12-22 To show to Connected Source (Logo) in SchemaDesigner after selection.
    connFeedImage:any;
    //Added by vikas on 28-12-22 for  calculationpanel [Start]
    hideCalculationType:boolean;
    editFunctionParameterData:any;
    functionListJson:any;
    editFunctionListArray:any = [];
    editFunctionParamaterJson:any = {};
    editFunctionParamaterArray:any = [];
    hideFunctionListOnEdit:boolean = false;
    // Added by Sujan on 05-01-2023 if column is selected then open the groupbox if closed.
    currentGrpIndex:any;
    //Added by vikas on 28-12-22 for  calculationpanel [End]
    //Added by Samruddhi for Link Argument
    @ViewChild('treeViewTemp') treeViewTemp: BBTreeviewComponent | any;
    @Input() linkArgVisualName: any;
    @Input() columnsInGroups: any = {};
    @Input() isInsightData: boolean;
    // Added by Sujan on 17-01-2023 to drag and drop or select deselect for calculated columns 
    currentCalArray:any = [];
    currentCalSeq:any;
    autoConfirm: boolean = false;
    finalColArr: any = []; //added by mayuri
    conditionResponse : boolean = false; //added by mayuri
    conditionValue:any = []; //added by mayuri
    finData :any ; //added by mayuri
    confirmBox: any = null; //added by mayuri
    newCriteriaArray:any = [];//added by mayuri
    groupDataNew:any = {};//added by mayuri
    windowsfuncArr:any[] = [];
    numericFormats:any[] = ['9','9.9','9.99','9.999','IND','IND.9','IND.99','IND.999','USA','USA.9','USA.99','USA.999','EURO','EURO.9','EURO.99','EURO.999'];
    @ViewChild('bbQueryBuilder')bbQueryBuilder: QueryBuilderComponentnew | any; //added by mayuri

    constructor(private matIconRegistry : MatIconRegistry, private domSanitizer : DomSanitizer, private sqlService : SQLEditorService, 
    private overlay: Overlay, private viewContainerRef: ViewContainerRef,public datePipe: DatePipe,private titlecasePipe:TitleCasePipe,public dialog: MatDialog) {
        this.confirmBox = new ConfirmBoxComponent(dialog); //added by mayuri
        this.matIconRegistry.addSvgIcon(
            "SchemaSVG",
            this.domSanitizer.bypassSecurityTrustResourceUrl("images/Schema.svg")
        );
        this.matIconRegistry.addSvgIcon(
            "SchemaThemeSVG",
            this.domSanitizer.bypassSecurityTrustResourceUrl("images/SchemaTheme.svg")
        );
        this.matIconRegistry.addSvgIcon(
            "SelectSVG",
            this.domSanitizer.bypassSecurityTrustResourceUrl("images/Select.svg")
        );
        this.matIconRegistry.addSvgIcon(
            "SelectThemeSVG",
            this.domSanitizer.bypassSecurityTrustResourceUrl("images/SelectTheme.svg")
        );
        this.matIconRegistry.addSvgIcon(
            "CriteriaSVG",
            this.domSanitizer.bypassSecurityTrustResourceUrl("images/Criteria.svg")
        );
        this.matIconRegistry.addSvgIcon(
            "CriteriaThemeSVG",
            this.domSanitizer.bypassSecurityTrustResourceUrl("images/CriteriaTheme.svg")
        );
        this.matIconRegistry.addSvgIcon(
            "SalesSVG",
            this.domSanitizer.bypassSecurityTrustResourceUrl("images/Sales.svg")
        );
        this.matIconRegistry.addSvgIcon(
            "IncentiveSVG",
            this.domSanitizer.bypassSecurityTrustResourceUrl("images/Incentive.svg")
        );
        this.matIconRegistry.addSvgIcon(
            "PurchaseSVG",
            this.domSanitizer.bypassSecurityTrustResourceUrl("images/Purchase.svg")
        );
        this.matIconRegistry.addSvgIcon(
            "ColumnSVG",
            this.domSanitizer.bypassSecurityTrustResourceUrl("images/Coloumns.svg")
        );
        this.matIconRegistry.addSvgIcon(
            "ColumnThemeSVG",
            this.domSanitizer.bypassSecurityTrustResourceUrl("images/ColoumnsTheme.svg")
        );
        this.matIconRegistry.addSvgIcon(
            "PersistSVG",
            this.domSanitizer.bypassSecurityTrustResourceUrl("images/Persist.svg")
        );
        this.matIconRegistry.addSvgIcon(
            "PersistThemeSVG",
            this.domSanitizer.bypassSecurityTrustResourceUrl("images/PersistTheme.svg")
        );
        this.matIconRegistry.addSvgIcon(
            "PreviewSVG",
            this.domSanitizer.bypassSecurityTrustResourceUrl("images/Preview.svg")
        );
        this.matIconRegistry.addSvgIcon(
            "PreviewThemeSVG",
            this.domSanitizer.bypassSecurityTrustResourceUrl("images/PreviewTheme.svg")
        );

    }

    ngOnInit()
    {
        console.log('Print line no 382:::::::',this.ConnName);
        console.log('Print inside sqleditor ngOnInit columnListResponse 383::::',this.columnListResponse);
        console.log('Print inside ngoninit isSchemaDesigner line no 384::::::',this.isSchemaDesigner);
        if( this.isSchemaDesigner )
        {
            this.isBrowser = true;
            console.log('Print inside ngoninit transDB line no 348::::::',this.transDB);
        }
        // Added by nikhil on 12-01-2022 for scheduler visual for user info	
		/*this.sqlService.getUserInfo().subscribe( UserInfo => { 	
            console.log("getUserInfo:userInfo line no 316:::::::",UserInfo);
            this.userInfo = UserInfo;	
         });*/
   	//Change by shrutika on 05-10-21 for schema designer group box 
        if( this.oldSlectedTableDataArray != undefined )
        {
            var currentTableString = this.oldSlectedTableDataArray.toString();
            if(currentTableString.includes(","))
            {
                this.oldSlectedTableDataArray =  currentTableString.split(',');
            }
        }
        if( this.editFlag != "E" && this.editFlag != "V")
        {
            this.SqlModelData = JSON.parse(JSON.stringify(this.sqlData));
        }
        let index = window.location.pathname.indexOf('E12BROWSER');
        if (index != -1) {
            this.isBrowser = true;
        }
        else if(window.location.pathname.indexOf('/ibase/Insight/insight.html') != -1)
        {
            // Added by Samruddhi on 16-12-2022 for linkArgument
            this.isBrowser = true;
        }
        //Change by shrutika on 08-03-21 [Start] for draw sql editor according to ba type.
            var currentSchemalist: any = [];
            if( this.SqlModelData != undefined && (this.editFlag == "E" || this.editFlag == "V" ))
            {
                if( this.SqlModelData['VISUAL_NAME'] != undefined && this.SqlModelData['SCHEMA_NAME'] != undefined )
                {
                    for(let i=0; i<this.schemaList.length; i++)
                    {
                        let schema = this.schemaList[i];
                        if(schema['schemaName'] == this.SqlModelData['SCHEMA_NAME'])
                        {
                            //Shrutika changes 05-02-21
                            this.defaultVisual = this.SqlModelData['VISUAL_NAME'];
                            currentSchemalist.push(schema);
                        }
                    }
                    this.schemaList = currentSchemalist;
                    this.currentSchema = this.schemaList [0];
                }
            }
            
            if( this.currentSchema != undefined )
            {
                  //Change by shrutika on 08-03-21 [Start] for draw sql editor according to ba type.
                this.schemaName = this.currentSchema['schemaName'];
                this.schemaDescr = this.currentSchema['schemaDescr'];
                this.currSchemaType = this.currentSchema['baType'];
                //Change by shrutika on 02-08-21 for avoid multiple server call in edit and view mode
            }
            console.log("print line no 446 currentSchema::::",this.currentSchema);
            if(  this.editFlag == "A" && !this.isSchemaDesigner )
            {
                this.onChangeOfSchema(JSON.stringify(this.currentSchema));
                this.getEditorVisuals();    
            }
            // console.log('Print listdata batype 367::::::',this.listData);
            // console.log('Print batype 368:::::::',this.listData['baType']);
            /*if(this.listData != undefined && this.listData['baType'] != undefined && this.listData['baType'] != 'F')
            {
                console.log('Print batype 371::::::',this.listData['baType']);
                this.schemaEditorSelector(1);
            }
            if(this.listData != undefined && this.listData['baType'] != undefined && this.listData['baType'] == 'F')
            {
                console.log('Print batype 376::::::',this.listData['baType']);
                this.schemaEditorSelector(3);
            } */
            if(this.editFlag != 'A' && this.isSqlView == true && this.isSchemaDesigner != true)
            {
                this.schemaEditorSelector(3);
            }
            else if(this.editFlag != 'A' && (this.isSqlView == false || this.isSqlView == undefined) && this.isSchemaDesigner != true)
            {
                this.schemaEditorSelector(1);
                // Added by Sujan on 06-01-2023 if column group contains column then open those groups by default on edit & view mode
                if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'] != undefined)
                {
                    let currentColumnArray = this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN']
                    for(let i=0; i<currentColumnArray.length; i++)
                    {
                        let currentGrpName = currentColumnArray[i]['groupName'];
                        this.groupStateMap[currentGrpName] = "opened";
                    }
                }
            }
            if(this.allformValues != undefined && this.allformValues['auto_confirm'] != undefined && this.allformValues['auto_confirm'] == 'Y')
            {
                this.autoConfirm = true;
            }
            console.log('Inside ngOnInit....line number 488...', this.bbQueryBuilder)
    }

    getEditorVisuals() {
        let paramMap:any = {};
        paramMap['ACTION'] = "getVisuals";
        //Added by Shrutika for Dashboard Definition on 15/03/21 [Start]
        if(this.isDashboard=='true')
        {
            paramMap['fileName'] = "DashboardVisuals.json";
        }
        //Added by Shrutika for Dashboard Definition on 15/03/21 [End]
        else
        {
            paramMap['fileName'] = "Visuals.json";
        }
        var url = this.sqlService.getHostURL() + '/ibase/PreviewHandlerServlet';
        var paramString = this.sqlService.getEncodedParamString(paramMap);
        this.sqlService.callRequest(url, paramString).subscribe( (data: any) =>
        {
            try {
                this.editorVisuals = JSON.parse(data);
                console.log('print inside getEditorVisuals this.editorVisuals 508::::::',JSON.stringify(this.editorVisuals));
                // Added by Mahesh Saggam on 07-SEP-21 [to show all the visuals based on display order]
                this.editorVisuals['Visuals'].sort(this.getVisualSorted("DisplayOrder"));
                if(this.editorVisuals){
                    for(let i=0; i<this.editorVisuals.Visuals.length; i++)
                    {
                        let visual = this.editorVisuals.Visuals[i];
                        for(let j=0; j<visual.ColumnGroups.length; j++)
                        {
                            let columnsArray:any = [];
                            visual.ColumnGroups[j]['COLUMNS'] = columnsArray;
                        }
                    }
                }
                this.editorVisualsCopy = JSON.stringify(this.editorVisuals);
                console.log("print line no 519 editorVisualsCopy",this.editorVisualsCopy);
                this.changeVisualOnChangeSchema();
                if( this.editFlag == "E" || this.editFlag == "V" )
                {
                    this.applySqlModelData();
                    //changes by shrutika for getting CurrentVisual 
                    var sqlEditorData: any = {};
                    /* if( this.isDashboard == 'true')
                    { */
                        if(this.editorVisuals != undefined)
                        {
                            for(let i=0; i<this.editorVisuals.Visuals.length; i++)
                            {
                                let visual = this.editorVisuals.Visuals[i];
                                if( visual['VisualName'] == this.defaultVisual )
                                {
                                    sqlEditorData['cuurentVisual'] = visual;
                                    this.cuurentVisualResp.emit(JSON.stringify(sqlEditorData));
                                    break;
                                }
                            }
                        }
                    // }
                    //changes by shrutika for getting CurrentVisual [End]
                }
            } 
            catch (error) {
                console.log('Exception inside getEditorVisuals',error);
                this.editorVisuals = undefined;
                this.currentVisual = undefined;
                //Added by shrutika on 26-02-2021 [Start] for if there is no visual file present then set defaultVisual as blank in sqlModelData.
                this.defaultVisual = "";
                this.SqlModelData['VISUAL_NAME'] = this.defaultVisual;
                //Added by shrutika on 26-02-2021 [End] for if there is no visual file present then set defaultVisual as blank in sqlModelData.

            }
        });
    }

    applySqlModelData()
    {
        if(this.SqlModelData != undefined && this.SqlModelData['VISUAL_NAME'] != undefined)
        {
            if(this.editorVisuals)
            {
                for(let i=0; i<this.editorVisuals.Visuals.length; i++)
                {
                    let visual = this.editorVisuals.Visuals[i];

                    if( this.SqlModelData != undefined && visual['VisualName'] == this.SqlModelData['VISUAL_NAME'] && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel'][this.param1] != undefined)
                    {
                        let sqlArray = this.SqlModelData['SQLModel'][this.param1][0]['COLUMN'];
                        for(let j=0; j<sqlArray.length; j++)
                        {
                            for(let k=0; k<visual.ColumnGroups.length; k++)
                            {
                                if( sqlArray[j]['groupName'] == visual.ColumnGroups[k]['GroupName'])
                                {
                                    visual.ColumnGroups[k]['COLUMNS'].push(sqlArray[j]); 
                                }
                            }
                        }
                    }

                }
            }
        }
    }

    changeVisualOnChangeSchema(){
        this.editorVisuals = JSON.parse(this.editorVisualsCopy);
        if(this.editorVisuals)
        {
            console.log("print line no 591 defaultVisual",this.defaultVisual);
            if(this.defaultVisual != undefined)
            {
                for(let i=0; i<this.editorVisuals.Visuals.length; i++)
                {
                    let visual = this.editorVisuals.Visuals[i];
                    if(this.defaultVisual == visual['VisualName'])
                    {
                        this.currentVisual = visual;
                        console.log("print line no 599 currentVisual 605 :::::",JSON.stringify(this.currentVisual));
                        // Added by Samruddhi for visual option component
                        if(this.editFlag != 'A')
                        {
			    //Added if condition by shrutika on 18-11-21 for layoutDatanot getting
                            if( this.allformValues != undefined && this.allformValues['layoutData'] != undefined && this.allformValues['layoutData']['visualLayout'])
                            {
                                this.currentVisual['options'] = this.allformValues['layoutData']['visualLayout']['options'];
                            }
			    //Added if condition by shrutika on 18-11-21 for layoutDatanot getting
                        }
                        this.defaultGrpName = this.currentVisual.ColumnGroups[0]['GroupName'];
                        console.log("print line no 610 defaultGrpName",this.defaultGrpName);
                        return;
                    }
                }
                // this.currentVisual = this.editorVisuals['Visuals'][0];
                // this.defaultGrpName = this.currentVisual.ColumnGroups[0]['GroupName'];
                // Added by Nikhil on 05/07/2021 After changing the schema in the sql editor now able to select columns from the table.
                this.onVisualChange(0);
            }
            else
            {
                // this.currentVisual = this.editorVisuals['Visuals'][0];
                // this.defaultGrpName = this.currentVisual.ColumnGroups[0]['GroupName'];
                // Added by Nikhil on 05/07/2021 After changing the schema in the sql editor now able to select columns from the table.
                this.onVisualChange(0);
            }
        }
    }

    getColType(colType: any)
    {
        let colTypeNew = 'string';

        if(colType == 'CHAR' || colType == 'VARCHAR2')
        {
            colTypeNew = 'string';
        }
        else if(colType == 'NUMBER')
        {
            colTypeNew = 'number';
        }
        else if(colType == 'DATE')
        {
            colTypeNew = 'date';
        }
        return colTypeNew;
    }

    ngAfterViewInit()
    {
        console.log('Print inside sqleditor ngAfterViewInit::::');
        //Added by shrutika on 27-09-21 for schema designer [Start]
        if( this.isSchemaDesigner && this.editFlag == "A")
        {
            this.buildEditiorVisualForSchema();
            this.openPopup();
        }
        /* if(!this.isSchemaDesigner && this.listData != undefined && this.listData['baType'] != undefined && this.listData['baType'] != 'F')
        {
            this.schemaEditorSelector(1);
            
        }
        if(!this.isSchemaDesigner && this.listData != undefined && this.listData['baType'] != undefined && this.listData['baType'] == 'F')
        {
            this.schemaEditorSelector(3);
        } */
        var tabDetailArray = [
            
            {
              "imgPath" : "/ibase/Insight/angplugin/assets/images/OLTP.svg",
              "name" : "OLTP",
              "feedDetails" : [
                {
                    "name": "My Call List1",
                    "description": "In memory mode of customer master sfa - PHARMA1",
                    "details" : "SFA12"
                },
                {
                  "name": "My Call List2",
                  "description": "In memory mode of customer master sfa - PHARMA2",
                  "details" : "SFA12"
                }
            ],
            "checked":false,
            "dataBaseType":"1"
            },
            {
                "imgPath" : "/ibase/Insight/angplugin/assets/images/InMemory.svg",
                "name" : "InMemeory",
                "feedDetails" : [
                    {
                        "name": "My Call List In memory1",
                        "description": "In memory mode of customer master sfa - PHARMA1",
                        "details" : "SFA12"
                    },
                    {
                      "name": "My Call List In memory2",
                      "description": "In memory mode of customer master sfa - PHARMA2",
                      "details" : "SFA12"
                    }
                ],
                "checked" :false,
                "dataBaseType":"2"
              },
              //Added by vikas for external data source [Start]
              {
                "imgPath" : "/ibase/Insight/angplugin/assets/images/svg/ExternalDataSource.svg",
                "name" : "External Data Source",
                "NAME" : "External Data Source",
                "feedDetails" : [],
                "checked" :false,
                "dataBaseType":"3"
              }
              //Added by vikas for external data source [end]
          ];
          this.tabWithListClassData['tabDetails'] = tabDetailArray;
          this.tabWithListClassData['popupName'] = "Data Source";
          this.tabWithListClassData['popupDescription'] = "Select the data source type";
         if( this.tabWithListClassData['tabDetails'] != undefined && this.editFlag != "A" )
         {
            for(var i= 0; i<this.tabWithListClassData['tabDetails'].length; i++ )
            {
                if( this.tabWithListClassData['tabDetails'][i]['name']  == this.databaseName )
                {
                    this.tabWithListClassData['tabDetails'][i]['checked'] = true;
    		    //Added by shrutika on 07-10-21 for display transDB
                    this.getUserInfo(this.databaseName);
                    break;
                }
            }
         }
	//Added by shrutika on 27-09-21 for schema designer [End]
          
        if(this.isBrowser == false)
        {
            var contentElement = document.getElementsByClassName("select-editor-content");
            var contentChildElement: any = contentElement[0];
            var popupElement = document.getElementsByClassName("angPopupContent");
            var popupChildElement = popupElement[0];
            var headerElem = document.getElementById('MobileHeader');
            if(headerElem != null)
            {
                // Added by Mahesh Saggam on 11-FEB-21 [To load angular component on Add,Edit and View mode of Mobile]
                headerElem.setAttribute('style', 'display: none');
            }
            if (popupChildElement) 
            {
                popupChildElement.setAttribute('style', 'background-color: #efefef;width: calc(100% - 80px); overflow: visible;');
                var height: any;
                height = Number(popupChildElement.clientHeight);
                var intHeight = Number(height);
                intHeight = intHeight - 90;
                var newHightStr = '' + intHeight + 'px';

                var popupClose = document.getElementsByClassName("angPopupclose");
                if (popupClose) {
                    var element: any = popupClose[0];
                    if (element) {
                        element.setAttribute('style', 'top: -8px; left: -8px;');
                    }
                }
            }
            else if (contentChildElement) 
            {
                var bbContentPluginElement = contentChildElement.parentElement.parentElement;
                if (bbContentPluginElement) 
                {
                    var name = bbContentPluginElement.getAttribute("name");
                    if (name == "bbContentPlugin") 
                    {
                        bbContentPluginElement.setAttribute('style', 'position: absolute; width: 100%; height: 100%;');
                    }
                }
                var dbcontentElement = contentChildElement.parentElement.parentElement.parentElement;
                if (dbcontentElement) 
                {
                    var className = dbcontentElement.getAttribute("class");
                    if (className == "dbcontent") 
                    {
                        dbcontentElement.setAttribute('style', 'overflow: hidden !important;');
                    }
                }
            }
        }
        else
        {
            var contentElement = document.getElementsByClassName("editor-content-browser");
            var contentChildElement: any = contentElement[0];
            var popupElement = document.getElementsByClassName("angPopupContent");
            var popupChildElement = popupElement[0];
            if (popupChildElement) 
            {
            popupChildElement.setAttribute('style', 'background-color: #efefef;width: calc(100% - 80px); overflow: visible;');
            var height: any;
            height = Number(popupChildElement.clientHeight);
            var intHeight = Number(height);
            intHeight = intHeight - 90;
            var newHightStr = '' + intHeight + 'px';
            var contentElement = document.getElementsByClassName("editor-content-browser");
            if (contentElement) 
            {
                var element: any = contentElement[contentElement.length - 1];
                if (element) 
                {
                element["style"].height = newHightStr;
                }
                var actualContentElement = document.getElementsByClassName("contentDiv");
                if (actualContentElement) 
                {
                var childElement = actualContentElement[actualContentElement.length - 1];
                if (childElement) 
                {
                    childElement.setAttribute('style', 'height: calc(100% - 0px);');
                }
                }
            }
            var popupClose = document.getElementsByClassName("angPopupclose");
            if (popupClose) {
                var element: any = popupClose[0];
                if (element) {
                element.setAttribute('style', 'top: -8px; left: -8px;');
                }
            }
            }
            else if (contentChildElement) 
            {
            var bbContentPluginElement = contentChildElement.parentElement.parentElement;
            if (bbContentPluginElement) 
            {
                var name = bbContentPluginElement.getAttribute("name");
                if (name == "bbContentPlugin") 
                {
                bbContentPluginElement.setAttribute('style', 'position: absolute; width: 100%; height: 100%;');
                }
            }

            var dbcontentElement = contentChildElement.parentElement.parentElement.parentElement;
            if (dbcontentElement) 
            {
                var className = dbcontentElement.getAttribute("class");
                if (className == "dbcontent") 
                {
                dbcontentElement.setAttribute('style', 'overflow: hidden !important;');
                }
            }
            }
        }

        //DRAG AND SCROLL PART BEGINS

        const onMove$ = this.dragEls.changes.pipe(
            startWith(this.dragEls)
            , map((d: QueryList<CdkDrag>) => d.toArray())
            , map(dragels => dragels.map(drag => drag.moved))
            , switchMap(obs => merge(...obs))
            , tap(this.triggerScroll)
        );

        this.subs.add(onMove$.subscribe());

        const onDown$ = this.dragEls.changes.pipe(
            startWith(this.dragEls)
            , map((d: QueryList<CdkDrag>) => d.toArray())
            , map(dragels => dragels.map(drag => drag.ended))
            , switchMap(obs => merge(...obs))
            , tap(this.cancelScroll)
        );

        this.subs.add(onDown$.subscribe());
    }

    onAdd(){}

    onPrevious()
    {
        this.formNo = this.formNo - 1;
        //Added by Samruddhi for dashboard definition in Moblile [Start]
        if(this.objName == 'dashboard_definition' && this.formNo == 5)
        {
            this.formNo = 4;
        }
        //Added by Samruddhi for dashboard definition in Moblile [End]

        //Added by Samruddhi for visual definition in Moblile [Start]
        if(this.objName == 'visual_definition' && this.formNo == 5)
        {
            this.formNo = 4;
        }
        //Added by Samruddhi for visual definition in Moblile [End]
        
        // Added by Mahesh Saggam on 11-FEB-21 [To load angular component on Add,Edit and View mode of Mobile] Start
        if(this.formNo < 1)
        {
            if(this.objType == undefined)
            {
                this.objType = '';
            }
            let id = "WallToWallPanel_Abort_" + this.objType;
            let elem = document.getElementById(id);
            if(elem != null)
            {
                elem.click();
            }
            this.formNo = 1;
        }
        this.onNextPrev.emit(this.formNo);
        // Added by Mahesh Saggam on 11-FEB-21 [To load angular component on Add,Edit and View mode of Mobile] End
    }

    onNext()
    {
        //Added by Samruddhi  for empty column array in PurchaseAnalysis in Mobile on 14-04-21 [Start]
        if(this.currentSchema != undefined && this.currentSchema['baType'] != 'F' && this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].length <= 0)
         { 
            window.alert("Rows and Columns input fields cannot be empty. Please select valid Rows and Columns to preview data on the next screen.");
            this.formNo = 1;
            return;
         }
        //Added by Samruddhi  for empty column array in PurchaseAnalysis in Mobile on 14-04-21 [End]
        this.formNo = this.formNo + 1;
        // //Added by Samruddhi for dashboard definition in Mobile [Start]
        // console.log('Print compData inside onNext::: 561:: ['+this.compData+']');
        // if(this.objName == 'dashboard_definition' && this.formNo == 5)
        // {
        //     this.formNo = 6;
        // }
        // //Added by Samruddhi for dashboard definition in Mobile [End]

        //Added by Samruddhi for visual definition in Moblile [Start]
        if(this.objName == 'visual_definition' && this.formNo == 5)
        {
            this.formNo = 6;
        }
        //Added by Samruddhi for visual definition in Moblile [End]

        // Added by Mahesh Saggam on 11-FEB-21 [To load angular component on Add,Edit and View mode of Mobile] Start
        if(this.formNo > 3 && this.formNo < 5)
        {
            if(this.validateGrpsOnNext())
            {
                this.formNo = 3;
                return;
            }
            this.onNextforBrowser();
        }
        if(this.formNo > 6)
        {
            this.onNextPrev.emit(this.formNo);
            this.formNo = 6;
            return;
        }
        this.onNextPrev.emit(this.formNo);
        // Added by Mahesh Saggam on 11-FEB-21 [To load angular component on Add,Edit and View mode of Mobile] End
    }

    tabSelected(tabIndex: any)
    {
        this.formNo = Number(tabIndex);
        // Added by Mahesh Saggam on 11-FEB-21 [To load angular component on Add,Edit and View mode of Mobile]
        this.onNextPrev.emit(this.formNo);
    }

    getChangeData(changedData: any)
    {
		// added by nikhil on 06-09-2021 for do not execute SQL again if there is no change in SQL[Start]
        this.isSourceSqlChange = true;
        //Changes by shrutika on 29-11-21 [Start] for No data found occur when multiple time click on preview after changing only  where condition
        //Changes by shrutika on 09-11-21 for default functionality not working in case of edit mode
        //this.isColumnChanges = true;
        // added by nikhil on 06-09-2021 for do not execute SQL again if there is no change in SQL[End]
        let selectedData = JSON.parse(changedData);
        let currCol = selectedData['columnData'];
        var neWColumData: any = {};
        // Added by Samruddhi to add column from Calculation panel
        var calColVal : boolean = false;
        // Added by Samruddhi for Freehandsql
        var currColumnVal : boolean = false;
        if(currCol.checked && this.currentVisual != undefined)
        {
            for(let i=0; i<this.currentVisual.ColumnGroups.length; i++)
            {
                let grpName = this.currentVisual.ColumnGroups[i]['GroupName'];
		//Added by shrutika on 27-09-21 for schema designer [Start]
                if( !this.isSchemaDesigner )
                {
                    if(this.defaultGrpName == grpName)
                    {
                        if(!this.validateGrpBox(currCol))
                        {
                            currCol['checked'] = false;
                            if( this.tablesArray != undefined )
                            {
                                this.updateTablesArrayOnValidate(currCol);
                            }
                            return false;
                        }
                    }
                }
		//Added by shrutika on 27-09-21 for schema designer [End]
            }
        }
        if(currCol.checked)
        {
            //Changes by shrutika on 09-11-21 for default functionality not working in case of edit mode [Start]
            this.isFirstTimeEdit = false;
            this.isColumnChanges = true;
	        //Changes by shrutika on 09-11-21 for default functionality not working in case of edit mode [End]
            // Changed by Samruddhi to add column from Calculation panel [Start]
            let index;
            // if(this.SqlModelData != undefined)
            if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'] != undefined)
            {
                let calColumnObj = this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].find(function(item: any, i: any)
                {
                    if(currCol['calc_seq'] != undefined && item.calc_seq == currCol['calc_seq'] && currCol['COLUMN_TYPE'] == 'calc_column')
                    {
                        calColVal = true;
                        index = i;
                        return index;
                    }
                });

                // Added by Samruddhi for Freehandsql
                let currColObj = this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].find(function(item: any, i: any)
                {
                    if(currCol['NAME'] != undefined && item.NAME == currCol['NAME'])
                    {
                        currColumnVal = true;
                        calColVal = true;
                        index = i;
                        return index;
                    }
                });
                
                if(calColVal && calColumnObj != undefined)
                {
                    calColumnObj['name'] = currCol['name'];
                    calColumnObj['DBNAME'] = currCol['name'];
                    calColumnObj['content'] = currCol['name'];
                    calColumnObj['NAME'] = currCol['name'];
                    calColumnObj['type'] = currCol['type'];
                    calColumnObj['descr'] = currCol['descr'];
                    calColumnObj['expression'] = currCol['expression'];
                    calColumnObj['calcType'] = currCol['calcType'];
                    calColumnObj['calc_seq'] = currCol['calc_seq'];
                    calColumnObj['persist_clumn_name'] = currCol['persist_clumn_name'];
                    calColumnObj['persist_form_no'] = currCol['persist_form_no'];
                    calColumnObj['checked'] = true;
                    calColumnObj['CALC_TYPE'] = currCol['CALC_TYPE'];;
                }
                else if(currColumnVal && currColObj != undefined)
                {
                    // Added by Samruddhi for Freehandsql
                    currColObj['name'] = currCol['name'];
                    currColObj['DBNAME'] = currCol['DBNAME'];
                    currColObj['content'] = currCol['content'];
                    currColObj['NAME'] = currCol['NAME'];
                    currColObj['type'] = currCol['type'];
                    currColObj['descr'] = currCol['descr'];
                    currColObj['expression'] = currCol['expression'];
                    currColObj['JAVATYPE'] = currCol['JAVATYPE'];
                    currColObj['FUNCTION'] = currCol['FUNCTION'];
                    currColObj['EXPRESSIONTYPE'] = currCol['EXPRESSIONTYPE'];
                    currColObj['COLTYPE'] = currCol['COLTYPE'];
                    currColObj['checked'] = true;
                    currColObj['CALC_TYPE'] = currCol['CALC_TYPE'];
                }
                else
                {
					// Changed by Samruddhi for the issue of columns not getting added in sql model in edit mode in Freehandsql
                    // if(this.editFlag == 'A')
                    if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'] != undefined)
                    {
                        let filteredArray = this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].filter(item => item.DBNAME == currCol.DBNAME && item.NAME == currCol.NAME);
                        if(filteredArray.length == 0)
                        {
                            this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].push(currCol);
                        }
                    }
                }
                console.log("print this.SqlModelData 1086::::::::",this.SqlModelData );
            }
            // Changed by Samruddhi to add column from Calculation panel [End]
        }
        else
        {
            // if(this.SqlModelData != undefined)
            if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'] != undefined)
            {
                let sqlArray = this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'];
                sqlArray.forEach((column: any) => {
                    if(column['DBNAME'] == currCol['DBNAME'] && column['DBTABLE'] == currCol['DBTABLE'])
                    {
                        column['checked'] = false;
                        return;
                    }
                    else if(column['DBNAME'] == currCol['DBNAME'] && column['NAME'] == currCol['NAME'])
                    {
                        column['checked'] = false;
                        return;
                    }
                });
                this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'] = sqlArray.filter((item: any) => item.checked);
            }
        }
        neWColumData['COLUMN'] = selectedData;
        var newColumnArray: any = [];
        newColumnArray.push(neWColumData);
        selectedData = newColumnArray;
        var cuurentData: any = {};
        cuurentData['COLUMNS'] = selectedData;
	//Added by shrutika on 27-09-21 for schema designer [Start]
        // Changed by Samruddhi for Freehandsql
        
        // if( !this.isSchemaDesigner || this.listData.baType != 'F' )
        if( !this.isSchemaDesigner && this.listData != undefined && this.listData['baType'] != 'F' )
        {
            this.buildConfigForCriteria();
        }
	//Added by shrutika on 27-09-21 for schema designer [End]
        if(this.editorVisuals != undefined)
        {
            currCol['groupName'] = this.defaultGrpName;
            if(currCol['checked'] == true)
            {
                if(this.editorVisuals)
                {
                    visualLoop:
                    for(let i=0; i<this.editorVisuals.Visuals.length; i++)
                    {
                        let visual = this.editorVisuals.Visuals[i];
                        // Added by Mahesh Saggam on 11-FEB-21 [To load angular component on Add,Edit and View mode of Mobile]
                        if(this.defaultVisual == visual['VisualName'])
                        {
                            for(let j=0; j<visual.ColumnGroups.length; j++)
                            {
                                if(this.defaultGrpName == visual.ColumnGroups[j]['GroupName'] && this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel'][this.param1] != undefined)
                                {
                                    currCol['StandardName'] = visual.ColumnGroups[j]['StandardName'];
                                    let sqlArray = this.SqlModelData['SQLModel'][this.param1][0]['COLUMN'];
                                    sqlArray.forEach((element: any) => {
                                        if((element.DBNAME == currCol.DBNAME && element.DBTABLE == currCol.DBTABLE) || (element.DBNAME == currCol.DBNAME && element.NAME == currCol.NAME))
                                        {
                                            element['StandardName'] = currCol['StandardName'];
                                            return;
                                        }
                                    });
                                    // Changed by Samruddhi to add column from Calculation panel
                                    //visual.ColumnGroups[j]['COLUMNS'].push(currCol);
                                    if((calColVal != undefined && !calColVal) || (currColumnVal != undefined && !currColumnVal))
                                    {
                                        visual.ColumnGroups[j]['COLUMNS'].push(currCol);
                                    }
                                    break visualLoop;
                                }
                            }
                        }
                    }
                }
            }
            else
            {
                breakVisualLoop:
                for(let i=0; i<this.editorVisuals.Visuals.length; i++)
                {
                   let visual = this.editorVisuals['Visuals'][i];
                    if(this.defaultVisual == visual['VisualName'])
                    {
                        for(let j=0; j<visual.ColumnGroups.length; j++)
                        {
                            var index = -1;
                            let groupItemsArray = [] = visual.ColumnGroups[j]['COLUMNS'];
                            var dbName = currCol.DBNAME;
                            var tblNAme = currCol.DBTABLE;
                            let calSeq = currCol.calc_seq;
                            let calExp = currCol.expression;
                            if (calSeq != undefined) {
                                var calculatedObj = groupItemsArray.find(function (groupItems: any, a: any) {
                                    if (groupItems.DBNAME.toUpperCase() == dbName && groupItems.expression == calExp) {
                                        index = a;
                                        return a;
                                    }
                                });
                            }
                            else
                            {
                                var filteredObj = groupItemsArray.find(function(groupItems: any, a: any)
                                {
                                    if(groupItems.DBNAME == dbName && groupItems.DBTABLE == tblNAme)
                                    {
                                        index = a;
                                        return a;
                                    }
                                });
                            }
                            if( index != -1 )
                            {
                                groupItemsArray.splice(index,1);
                                this.currentVisual.ColumnGroups[j]['COLUMNS'] = groupItemsArray
                                break breakVisualLoop;
                            }
                        }
                    }
                }
                this.updateGroupsData();
            }
        }
    }

    buildConfigForCriteria()
    {
        try
        {
            var tables: any[] = [];
            var jsonData: any = {
                fields: {}
            };
            console.log('print this.tablesArrForCriteria 1224:::::;',this.tablesArrForCriteria);
            const parsed = JSON.parse(this.tablesArrForCriteria);
            console.log('print parsed 1226:::::;',parsed);
            // Changed by Samruddhi for criteria panel not displaying
            // if(this.tablesArrForCriteria instanceof Object)
            if(typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed))
            {
                let tablesData = JSON.parse(this.tablesArrForCriteria);
                var newTablesArr = tablesData['ROOT'];
                for(let a=0; a<newTablesArr.length; a++)
                {
                    let cloneTable = this.tablesArray[a];
                    let cloneCols = cloneTable['COLUMN'];
                    let table = newTablesArr[a];
                    let tableName = table['TABLE_NAME'];
                    let cols = table['COLUMN'];
                    breakOnAdd:
                    for(let b=0; b<cols.length; b++)
                    {
                        let col = cols[b];
                        if(cloneCols[b]['checked'] == true)
                        {
                            if(tables.length == 0)
                            {
                                tables = cols;
                            }
                            else
                            {
                                for(let i=0; i<cols.length; i++)
                                {
                                    let col = cols[i];
                                    tables.push(col);
                                }
                            }
                            break breakOnAdd;
                        }
                    }
                }
                for(let i=0; i<tables.length; i++)
                {
                    let column = {} = tables[i];
                    let fieldName = column['tableName'] + '.' + column['DBNAME'];
                    //Added by Mayur to make changes in Criteria Screen Auto-search on 19/03/21 [Start]
                    // Changed by Samruddhi on 29-07-2022 to append table name in fieldDisplayName 
                    // let fieldDisplayName = column['tableDisplayName'] + '.' + column['name'];
                    let fieldDisplayName = column['DBTABLE'] + '.' + column['name'];
                    //Added by Mayur to make changes in Criteria Screen Auto-search on 19/03/21 [End]
                    jsonData['fields'][fieldName] = {};
                    jsonData['fields'][fieldName]['defaultType'] = column['type'];
                    jsonData['fields'][fieldName]['queryOption'] = this.queryOption;
                    jsonData['fields'][fieldName]['fieldName'] = fieldName;
                    //Added by Mayur to make changes in Criteria Screen Auto-search on 19/03/21 [Start]
                    jsonData['fields'][fieldName]['fieldDisplayName'] = fieldDisplayName;
                    //Added by Mayur to make changes in Criteria Screen Auto-search on 19/03/21 [End]
                    for(const key of Object.keys(column))
                    {
                        jsonData['fields'][fieldName][key] = column[key];
                    }
                }
                this.jsonDataNew = jsonData;
            }
            console.log('print this.jsonDataNew 1284::::::',this.jsonDataNew);
        }
        catch(e)
        {
            console.log('Exception inside buildConfigForCriteria::::::',e);
        }
    }

    updateTablesArrayOnValidate(column: any)
    {
        deleteLoopOnValidate:
        //Changed by nikhil on 29-08-2022 for delete button not shown in the freehand schema add else part 
        // Changed by Samruddhi on 15-09-2022 for drag and drop not working from treeview to groupbox in schema designer.
        if((this.listData != undefined && this.listData['baType'] != 'F') || this.isSchemaDesigner)
        {
	        for(let i=0; i<this.tablesArray.length; i++)
	        {
	            let columns = this.tablesArray[i]['COLUMN'];
	            if( column['tableName'] == this.tablesArray[i]['TABLE_NAME'])
	            {
	                for(var j=0; j<columns.length; j++)
	                {
	                    let col = columns[j];
	                    // console.log('Print the col line no 1170',col);
	                    // console.log('Print the column[DBNAME] line no 1171',column['DBNAME']);
	                    if(column['DBNAME'] == col['DBNAME'] && column['DBTABLE'] == col['DBTABLE'])
	                    {
	                        if(column['checked'])
	                        {
	                            col['checked'] = true;
	                        }
	                        else
	                        {
	                            col['checked'] = false;
	                        }
	                        break deleteLoopOnValidate;
	                    }
	                }
	            }
	        }
		}
		else
		{
			for(let i=0; i<this.finalTableArray.length; i++)
	        {
	            let currentColArr = this.finalTableArray[i]['COLUMN'];
	            for(let j = 0; j < currentColArr.length; j++)
                {
                    if( column['DBNAME'] == currentColArr[j]['DBNAME'])
                    {
                        if(column['checked'])
                        {
                            currentColArr[j]['checked'] = true;
                        }
                        else
                        {
                            currentColArr[j]['checked'] = false;
                        }
                        break deleteLoopOnValidate;
                    }
                    
                }
	    	}
		}
    }

    deleteColumn( column : any)
    {
        // added by nikhil on 06-09-2021 for do not execute SQL again if there is no change in SQL[Start]
        this.isSourceSqlChange = true;
        //Changes by shrutika on 29-11-21 [Start] for No data found occur when multiple time click on preview after changing only  where condition
            this.isColumnChanges = true;
        // added by nikhil on 06-09-2021 for do not execute SQL again if there is no change in SQL[End]
        this.updateTablesArrayOnValidate(column);
        if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel'][this.param1] != undefined)
        {
            let sqlArray = this.SqlModelData['SQLModel'][this.param1][0]['COLUMN'];
            sqlLoop:
            for(let a=0; a<sqlArray.length; a++)
            {
                let columnNew = sqlArray[a];
                if(column['DBNAME'] == columnNew['DBNAME'] && column['DBTABLE'] == columnNew['DBTABLE'])
                {
                    columnNew['checked'] = false;
                    break sqlLoop;
                }
            }
            this.updateGroupsData();
        }
        // Changed by Samruddhi for Freehandsql
        // if(this.listData.baType != 'F' ).
        if(!this.isSchemaDesigner && this.listData != undefined && this.listData.baType != 'F')
        {
            this.buildConfigForCriteria();
        }
        //Added By Mayuri on 13 july 2023 for Remove field in sql editor then remove same field mat icon in calculation panel[Start]
        if (this.allformValues['Detail2'] != undefined) 
        {
            console.log("print line no 1308 allformValues", this.allformValues['Detail2']);
            for (let i = 0; i < this.allformValues['Detail2'].length; i++) 
            {
                if (this.allformValues['Detail2'][i]['calc_seq'] == column['calc_seq']) 
                {
                    this.allformValues['Detail2'][i]['checked'] = false;
                }
            }
        }
        //Added By Mayuri on 13 july 2023 for Remove field in sql editor then remove same field mat icon in calculation panel[end]
    }

    updateGroupsData()
    {
        if(this.currentVisual)
        {
            for(let i=0; i<this.currentVisual.ColumnGroups.length; i++)
            {
                let groupItems = this.currentVisual.ColumnGroups[i]['COLUMNS'].filter((item: any) => item.checked);
                this.currentVisual.ColumnGroups[i]['COLUMNS'] = groupItems;
            }
        }
        if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel'][this.param1] != undefined)
        {
            let sqlArray = this.SqlModelData['SQLModel'][this.param1][0]['COLUMN'];
            this.SqlModelData['SQLModel'][this.param1][0]['COLUMN'] = sqlArray.filter((item: any) => item.checked);
        }
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

    //Added on 10-06-22 by vikas for passing different images for rows,cols,values [Start]
    getImgSrcGroup(GroupName: any)
    {
        var imgUrl;
        if(GroupName != undefined && this.isDashboard == 'true')
        {
            imgUrl = "/ibase/Insight/managevisplugin/assets/images/svg/"+GroupName.toLowerCase()+".svg";
        }
        else if(GroupName == "CHAR" || GroupName == "VARCHAR2" || GroupName == "CHAR/VARCHAR2" || GroupName == "VARCHAR2/CHAR")
        {
            imgUrl = "/ibase/Insight/angplugin/assets/images/StringGroup.svg";
        }
        else if(GroupName == "DATE")
        {
            imgUrl = "/ibase/Insight/angplugin/assets/images/DateGroup.svg";
        }
        else if(GroupName == "NUMBER") 
        {
            imgUrl = "/ibase/Insight/angplugin/assets/images/NumericGroup.svg";
        }
        else
        {
            imgUrl = "/ibase/Insight/angplugin/assets/images/sqlGroup.svg";
        }
        return imgUrl;
    }
    //Added on 10-06-22 by vikas for passing different images for rows,cols,values [end]

    //Added by Mayur Pawar to make Functions Drop Down Dynamic on 09/03/21 [Start]
    isExpanded(columnExpansionPanel: MatExpansionPanel, COLTYPE: any)
    {
       if(columnExpansionPanel.expanded)
        {
            //change by shrutika on 16-07-21 [Start] for display default function on form.
            //Changed by Samruddhi on 27-07-21 for display default function [Start]
            if(COLTYPE == "CHAR" || COLTYPE == "VARCHAR2" || COLTYPE == "VARCHAR" || COLTYPE == "CHAR2" || COLTYPE == "STRING")
            {
                //this.funcArr = [{name: 'NONE', value: ''}, {name: 'COUNT', value: 'Count'}, {name: 'DISTINCT COUNT', value: 'Distinct Count'}];
                //this.funcArr = [{name: 'NONE', value: ''}, {name: 'COUNT', value: 'COUNT'}, {name: 'DISTINCT COUNT', value: 'DISTINCT COUNT'}];
                // this.funcArr = [{name: 'NONE', value: ''}, {name: 'COUNT', value: 'COUNT'}, {name: 'DISTINCT COUNT', value: 'DISTINCT COUNT'}, {name: 'CONCAT', value: 'CONCAT'}, {name: 'INSTR', value: 'INSTR'}, {name: 'RTRIM', value: 'RTRIM'}, {name: 'LTRIM', value: 'LTRIM'}, {name: 'REPLACE', value: 'REPLACE'}, {name: 'REVERSE', value: 'REVERSE'}, {name: 'SUBSTR', value: 'SUBSTR'}, {name: 'LOWER', value: 'LOWER'}, {name: 'UPPER', value: 'UPPER'}, {name: 'INITCAP', value: 'INITCAP'}, {name: 'TO_CHAR', value: 'TO_CHAR'}];
                this.funcArr = [{name: 'NONE', value: ''}, {name: 'COUNT', value: 'COUNT'}, {name: 'DISTINCT COUNT', value: 'DISTINCT COUNT'}, {name: 'LENGTH', value: 'LENGTH'}, {name: 'RTRIM', value: 'RTRIM'}, {name: 'LTRIM', value: 'LTRIM'}, {name: 'REVERSE', value: 'REVERSE'}, {name: 'LOWER', value: 'LOWER'}, {name: 'UPPER', value: 'UPPER'}, {name: 'INITCAP', value: 'INITCAP'}];
            }
            else if(COLTYPE == "NUMBER") 
            {
               // this.funcArr = [{name: 'NONE', value: ''}, {name: 'SUM', value: 'Sum'}, {name: 'COUNT', value: 'Count'}, {name: 'DISTINCT COUNT', value: 'Distinct Count'}, {name: 'AVERAGE', value: 'Average'}, 
                 //               {name: 'MEDIAN', value: 'Median'}, {name: 'PRODUCT', value: 'Product'}, {name: 'MIN', value: 'Min'}, {name: 'MAX', value: 'Max'}, {name: 'INDEX', value: 'Index'}];
                //this.funcArr = [{name: 'NONE', value: ''}, {name: 'SUM', value: 'SUM'}, {name: 'COUNT', value: 'COUNT'}, {name: 'DISTINCT COUNT', value: 'DISTINCT COUNT'}, {name: 'AVG', value: 'AVG'}, {name: 'MIN', value: 'MIN'}, {name: 'MAX', value: 'MAX'}];
                // this.funcArr = [{name: 'NONE', value: ''}, {name: 'SUM', value: 'SUM'}, {name: 'COUNT', value: 'COUNT'}, {name: 'DISTINCT COUNT', value: 'DISTINCT COUNT'}, {name: 'AVG', value: 'AVG'}, {name: 'MIN', value: 'MIN'}, {name: 'MAX', value: 'MAX'}, {name: 'TRUNC', value: 'TRUNC'}, {name: 'CEIL', value: 'CEIL'}, {name: 'ROUND', value: 'ROUND'}, {name: 'TO_NUMBER', value: 'TO_NUMBER'}];
                this.funcArr = [{name: 'NONE', value: ''}, {name: 'SUM', value: 'SUM'}, {name: 'COUNT', value: 'COUNT'}, {name: 'DISTINCT COUNT', value: 'DISTINCT COUNT'}, {name: 'AVG', value: 'AVG'}, {name: 'MIN', value: 'MIN'}, {name: 'MAX', value: 'MAX'}, {name: 'TRUNC', value: 'TRUNC'}, {name: 'CEIL', value: 'CEIL'}, {name: 'ROUND', value: 'ROUND'}];
            }
            else if(COLTYPE == "DATE" || COLTYPE == "DATETIME") 
            {
                //this.funcArr = [{name: 'NONE', value: ''}, {name: 'SUM', value: 'Sum'}, {name: 'COUNT', value: 'Count'}, {name: 'DISTINCT COUNT', value: 'Distinct Count'}, {name: 'AVERAGE', value: 'Average'}, {name: 'MIN', value: 'Min'}, {name: 'MAX', value: 'Max'}];
                //this.funcArr = [{name: 'NONE', value: ''}, {name: 'COUNT', value: 'COUNT'}, {name: 'DISTINCT COUNT', value: 'DISTINCT COUNT'}, {name: 'MIN', value: 'MIN'}, {name: 'MAX', value: 'MAX'}];
                // this.funcArr = [{name: 'NONE', value: ''}, {name: 'COUNT', value: 'COUNT'}, {name: 'DISTINCT COUNT', value: 'DISTINCT COUNT'}, {name: 'MIN', value: 'MIN'}, {name: 'MAX', value: 'MAX'}, {name: 'ADD_MONTHS', value: 'ADD_MONTHS'}, {name: 'EXTRACT', value: 'EXTRACT'}, {name: 'LAST_DAY', value: 'LAST_DAY'}, {name: 'NEXT_DAY', value: 'NEXT_DAY'}, {name: 'SYSDATE', value: 'SYSDATE'}, {name: 'TO_DATE', value: 'TO_DATE'}, {name: 'MONTHS_BETWEEN', value: 'MONTHS_BETWEEN'}];
                this.funcArr = [{name: 'NONE', value: ''}, {name: 'COUNT', value: 'COUNT'}, {name: 'DISTINCT COUNT', value: 'DISTINCT COUNT'}, {name: 'MIN', value: 'MIN'}, {name: 'MAX', value: 'MAX'}, {name: 'LAST_DAY', value: 'LAST_DAY'}];
            }
            else
            {
                //this.funcArr = [{name: 'NONE', value: ''}, {name: 'AVG', value: 'Average'}, {name: 'SUM', value: 'Sum'}, {name: 'MIN', value: 'Min'}, {name: 'MAX', value: 'Max'}];
                this.funcArr = [{name: 'NONE', value: ''}, {name: 'AVG', value: 'AVG'}, {name: 'SUM', value: 'SUM'}, {name: 'MIN', value: 'MIN'}, {name: 'MAX', value: 'MAX'}];
            }
            //Changed by Samruddhi on 27-07-21 for display default function [End]
            //change by shrutika on 16-07-21 [End] for display default function on form.
        }
    }

     //Added by Pranjali on 26-09-2023 for Window Function[Start]
   isExpandedwindows(columnExpansionPanel: MatExpansionPanel, COLTYPE: any)
   {
      if(columnExpansionPanel.expanded)
       {
          if(COLTYPE == "NUMBER") 
           {
              
               this.windowsfuncArr = [{name: 'NONE', value: ''}, {name: 'SUM', value: 'SUM'}, {name: 'COUNT', value: 'COUNT'}, {name: 'DISTINCT COUNT', value: 'DISTINCT COUNT'}, {name: 'AVG', value: 'AVG'}, {name: 'MEDIAN', value: 'MEDIAN'}, {name: 'PRODUCT', value: 'PRODUCT'}, {name: 'MIN', value: 'MIN'}, {name: 'MAX', value: 'MAX'}, {name: 'Population StDeV', value: 'stdevp'}, {name: 'Sample StDev', value: 'stdevs'}, {name: '% of Grand Total', value: 'PERCENT'}, {name: '% of Column', value: 'percentofcolumn'}, {name: '% of Row', value: 'percentofrow'}, {name: '% of Parent Column Total', value: 'percentofparentcolumntotal'}, {name: '% of Parent Row Total', value: 'percentofparentrowtotal'}, {name: 'Index', value: 'Index'}, {name: 'Difference of Column', value: 'differenceofcolumn'}, {name: 'Difference of Row', value: 'differenceofrow'}, {name: '% Difference of Column', value: '%differenceofcolumn'}, {name: '% Difference of Row', value: '%differenceofrow'}, {name: 'Running Totals of Column', value: 'runningtotalsofcolumn'}, {name: 'Running Totals of Row', value: 'runningtotalsofrow'}, {name: 'PERCENT', value: 'PERCENT'}];
           }
       }
   }
   //Added by Pranjali on 26-09-2023 for Window Function[End]

    onTypeChange(columnExpansionPanel: MatExpansionPanel, columnData: any)
    {
        columnData['FUNCTION'] = '';
        this.isExpanded(columnExpansionPanel, columnData['COLTYPE']);
        this.setExpression(columnData);
    }
    //Added by Mayur Pawar to make Functions Drop Down Dynamic on 09/03/21 [End]

    setExpression(columnData: any)
    {
        let column = columnData;
        let val = column['FUNCTION'];
        let type = column['COLTYPE']
		let expr = "";
        if(columnData['expression'])
        {
            expr = columnData['expression'];
        }
        if(val != undefined && val != '' && val != null && column['DBTABLE'] == undefined)
        {
            if(expr == undefined || expr == null || expr == '' )
            {
                expr = column['DBNAME'];
            }
            console.log("print expr line no 1485:::",expr);
        }
          
        if(val != undefined && val != '' && val != null && column['DBTABLE'] != undefined)
        {
            if(expr == undefined || expr == null || expr == '' )
            {
                expr = column['DBTABLE'] + '.' + column['DBNAME'];
            }
            console.log("print val line no 1461:::",expr);
        }
        console.log('Print inside setExpression expr::::::',expr);
        if( expr != undefined && expr != '' && expr != null )
        {
        	columnData['expression'] = expr;
        }
        else
        {
        	columnData['expression'] = "";
        }
        console.log('Print inside setExpression columnData::::::',columnData);
        // console.log('Print inside setExpression columnData[expression]::::::',columnData['expression']);
        if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel'][this.param1] != undefined)
        {
            let arrOfColumns = this.SqlModelData['SQLModel'][this.param1][0]['COLUMN'];
            outerArrLoop:
            for(let i=0; i<arrOfColumns.length; i++)
            {
                let col = arrOfColumns[i];
                if(col['NAME'] == column['NAME'] && col['DBTABLE'] == column['DBTABLE'])
                {
                    col['expression'] = expr;
                    col['FUNCTION'] = val;
                    col['DEFAULTFUNCTION'] = val;
                    col['COLTYPE'] = type;
                    this.SqlModelData['SQLModel'][this.param1][0]['COLUMN'][i] = col;
                    break outerArrLoop;
                }
                else if(col['calc_seq'] == column['calc_seq'] && col['NAME'] == column['NAME'])
                {
                    col['expression'] = expr;
                    col['FUNCTION'] = val;
                    col['DEFAULTFUNCTION'] = val;
                    col['COLTYPE'] = type;
                    this.SqlModelData['SQLModel'][this.param1][0]['COLUMN'][i] = col;
                    break outerArrLoop;
                }
                       //Added by pranjali To Check Functionality For all the Function Type [End] 05-07-2023
            }
        }
    }

    specialUseCase(item: CdkDrag){
        return true;
    }

    onDropSelect(event: CdkDragDrop<any[]> | any, index?: any) 
    {
        let curCalIndex;
	//Changes by shrutika on 29-11-21 [Start] for No data found occur when multiple time click on preview after changing only  where condition
       // this.isColumnChanges = true;
		//Added by nikhil on 28-03-2022 when column is drag or drop then change the isSourceSqlChange
		this.isSourceSqlChange = true;
        this.isLongPressed = true;
	    //Changed by Samruddhi on 03/06/21 for when drag and drop a column all the group boxes must stay open
	    /*if(index != undefined)
        {
	        this.onClickGrpBox(index);
        }*/

        //Changed by Samruddhi on 20-07-21 for when drag and drop column in another group box then that groupbox must open [Start]
        let grpBoxContId = "groupBoxContent_" + (index + 1);
        let grpBoxElement: any = document.getElementById(grpBoxContId);
        let isOpen = grpBoxElement.classList.contains('showContent');
        if(!isOpen)
        {
            this.onClickGrpBox(index);
        }
        //Changed by Samruddhi on 20-07-21 for when drag and drop column in another group box then that groupbox must open [End]
        let grpNamegrpId: any = '';
        if(event.container != undefined)
        {
            grpNamegrpId = event.container.element.nativeElement.id;
        }
        let grpName = grpNamegrpId.split('_')[0];
        this.defaultGrpName = grpName;
        let colDropId: any = '';
        if(event.item != undefined)
        {
            colDropId = event.item.element.nativeElement.id;
        }
        let tableColName = colDropId.split('%SEP%');
        let tableName = tableColName[0];
        let colName = tableColName[1];
        let schemaList = event.previousContainer.id === 'schemaList';
        let prevContainerData = JSON.parse(JSON.stringify(event.previousContainer.data));
        // Changed by Samruddhi on 30-06-2022 for drag and drop issue for searched columns
        // let droppedCol = prevContainerData[event.previousIndex];
        let droppedCol: any;
        let currColIndex: any;
        if(event.item.element.nativeElement.columnIndex != undefined)
        {
            currColIndex = JSON.parse(event.item.element.nativeElement.columnIndex);
            currColIndex = parseInt(event.item.element.nativeElement.columnIndex);
            droppedCol = prevContainerData[currColIndex];
        }
        else
        {
            droppedCol = prevContainerData[event.previousIndex];
        }
        droppedCol['checked'] = true;
        if(this.tablesArrForCriteria)
        {
            let tablesData = JSON.parse(this.tablesArrForCriteria);
            var newTablesArr = tablesData['ROOT'];
            if(newTablesArr.length > 0)
            {
                for(let a=0; a<newTablesArr.length; a++)
                {
                    let cloneTable = this.tablesArray[a];
                    let cloneCols = cloneTable['COLUMN'];
                    let table = newTablesArr[a];
                    let cols = table['COLUMN'];
                    for(let b=0; b<cols.length; b++)
                    {
                        if(cloneCols[b]['NAME'] == droppedCol['NAME'])
                        {
                            cloneCols[b]['checked'] = droppedCol['checked']
                            console.log('onDropSelect 1648',cloneCols);
                        }
                    }
                }
                this.buildConfigForCriteria();
            }
        }
        if(index != undefined && !(event.previousContainer === event.container) && !this.validateGrpBox(droppedCol))
        {
            if(schemaList)
            {
                droppedCol['checked'] = false;
                this.updateTablesArrayOnValidate(droppedCol);
            }
            return false;
        }
        if (event.previousContainer === event.container) 
        {
            if(currColIndex != undefined)
            {
                moveItemInArray(event.container.data, currColIndex, event.currentIndex);
            }
            else
            {
                moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
            }
        }
        else
        {
            // Changed by Samruddhi on 17-05-2022 when we drag and drop a columns in groupbox the column name get disappeared
            if(event.previousContainer.id === 'schemaList' || event.previousContainer.id === 'columnList' )
            {
                this.updateTablesArrayOnValidate(droppedCol);
                if(this.currentVisual)
                {
                    //Changes by shrutika on 09-11-21 for default functionality not working in case of edit mode [Start]
                    this.isColumnChanges = true;
                    this.isFirstTimeEdit = false;
	                //Changes by shrutika on 09-11-21 for default functionality not working in case of edit mode [End]
                    if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'] != undefined)
                    {
                        this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].push(droppedCol);
                    }
                    // Changed by Samruddhi on 17-05-2022 when we drag and drop a columns in groupbox the column name get disappeared
                    if(this.finalTableArray != undefined)
                    {
                        for(let i = 0; i < this.finalTableArray.length; i++)
                        {
                            if(this.finalTableArray[i]['COLUMN'][0]['NAME'] == droppedCol['NAME'])
                            {
                                this.finalTableArray[i]['COLUMN'][0]['checked'] = true;
                            }
                        }
                    }
                }
                if(currColIndex != undefined)
                {
                    copyArrayItem(prevContainerData, event.container.data, currColIndex, event.currentIndex);
                }
                else
                {
                    copyArrayItem(prevContainerData, event.container.data, event.previousIndex, event.currentIndex);
                }
            }
            else if(event.previousContainer.id === 'CalCulationContentID' )
            {
                this.updateTablesArrayOnValidate(droppedCol);
                if (this.currentVisual) {
                    this.isColumnChanges = true;
                    this.isFirstTimeEdit = false;
                    if (this.currentCalArray != undefined) {
                        for (let i = 0; i < this.currentCalArray.length; i++) {
                            if (this.currentCalArray[i] != undefined && this.currentCalArray[i]['columnData']['name'] == droppedCol['col_name']) {
                                this.currentCalArray[i]['columnData']['checked'] = true;
                                if (this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'] != undefined) {
                                    this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].push(this.currentCalArray[i]['columnData']);
                                }
                                this.currentCalSeq = this.currentCalArray[i]['columnData']['calc_seq'];
                                for (let ind = 0; ind < this.allformValues['Detail2'].length; ind++) {
                                    if (this.allformValues['Detail2'][ind]['calc_seq'] == this.currentCalArray[i]['columnData']['calc_seq']) {
                                        this.allformValues['Detail2'][ind]['checked'] = true;
                                        curCalIndex = i;
                                    }
                                }
                            }

                        }


                    }
                }
                if(currColIndex != undefined)
                {
                    copyArrayItem(prevContainerData, event.container.data, currColIndex, event.currentIndex);
                }
                else
                {
                    copyArrayItem(prevContainerData, event.container.data, event.previousIndex, event.currentIndex);
                }
            }
            else
            {
                if(currColIndex != undefined)
                {
                    transferArrayItem(event.previousContainer.data, event.container.data, currColIndex, event.currentIndex);
                }
                else
                {
                    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
                }
            } 
        }
        let arrOfColumns: any = [];
        if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel'][this.param1] != undefined)
        {
            arrOfColumns = this.SqlModelData['SQLModel'][this.param1][0]['COLUMN'];
        }
        // Changed by Samruddhi for Freehandsql
        // if( this.listData.baType != 'F' )
        if(!this.isSchemaDesigner && this.listData != undefined && this.listData.baType != 'F')
        {
            this.buildConfigForCriteria();
        }
        if(this.currentVisual && arrOfColumns.length > 0)
        {
            if(this.currentVisual.ColumnGroups.length > 0)
            {
                // Added by Samruddhi on 22-06-2022 for when column drag and drop in groupbox then not reflecting in edit mode
                //Changed by vikas on 28-06-23 for setting description when column heading
                for(let i = 0; i < this.currentVisual.ColumnGroups.length; i++)
                {
                    for(let j = 0; j < this.currentVisual.ColumnGroups[i]['COLUMNS'].length; j++)
                    {
                        if (droppedCol.col_name == this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['col_name'] && droppedCol.calc_seq == this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['calc_seq'] && event.previousContainer.id === 'CalCulationContentID') 
                        {
                            console.log('print droppedCol 1673::::::', droppedCol);
                            if(droppedCol['col_heading'] != undefined && droppedCol['col_heading'] != '')
                            {
                                console.log('PRINT LINE NO 1669::::::',droppedCol['col_heading'])
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['content'] = droppedCol['col_heading'];
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['descr'] = this.titlecasePipe.transform(droppedCol['col_heading']);
                            }
                            else
                            {
                                console.log('PRINT LINE NO 1674::::::',droppedCol['col_heading'])
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['content'] = droppedCol['col_name'];
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['descr'] = droppedCol['col_name'];
                            }
                            console.log('PRINT LINE NO 1679:::::',this.currentVisual.ColumnGroups[i])
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['name'] = droppedCol['col_name'];
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['DBNAME'] = droppedCol['col_name'];
                           // this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['content'] = droppedCol['col_name'];
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['NAME'] = droppedCol['col_name'].toUpperCase();
                            // this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['type'] = droppedCol['type'];
                            //this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['descr'] = droppedCol['col_name'];
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['expression'] = droppedCol['calc_expression'];
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['calcType'] = droppedCol['calc_type'];
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['calc_seq'] = droppedCol['calc_seq'];
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['persist_clumn_name'] = droppedCol['persist_clumn_name'];
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['persist_form_no'] = droppedCol['persist_form_no'];
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['checked'] = true;
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['CALC_TYPE'] = droppedCol['calc_type'];
                            // this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['FUNCTION'] = "SUM";
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['groupName'] = this.defaultGrpName;
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['StandardName'] = this.defaultGrpName;
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['COLUMN_TYPE'] = "calc_column";
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['DBTABLE'] = "";
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['tableName'] = "";
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['tableDisplayName'] = "";
                            // this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['COLTYPE'] = "NUMBER";
                            if(droppedCol['col_datatype'] == 'N')
                            {
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['COLTYPE'] = "NUMBER";
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['DEFAULTFUNCTION'] = "SUM";
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['FUNCTION'] = "SUM";
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['type'] = "number";
                            }
                            else if(droppedCol['col_datatype'] == 'D')
                            {
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['COLTYPE'] = "DATE";
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['DEFAULTFUNCTION'] = "";
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['FUNCTION'] = "";
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['type'] = "date";
                            }
                            else 
                            {
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['COLTYPE'] = "CHAR";
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['DEFAULTFUNCTION'] = "";
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['FUNCTION'] = "";
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['type'] = "string";
                            }
                        }
                        if(droppedCol.DBNAME == this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['DBNAME'] && droppedCol.DBTABLE == this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['DBTABLE'])
                        {
                            //added by mayuri on 4 oct 2023 for column heading set uppsercase start
                            if(this.isSchemaDesigner == true)
                            {
                                let newName =this.titlecasePipe.transform(this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['content']);
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['content'] = newName;
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['expression'] = '';
                            }
                            //added by mayuri on 4 oct 2023 for column heading set uppsercase end
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['groupName'] = this.defaultGrpName;
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['StandardName'] = this.defaultGrpName;
                        }
                        else if(droppedCol.DBNAME == this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['DBNAME'] && droppedCol.NAME == this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['NAME'])
                        {
                            //added by mayuri on 4 oct 2023 for column heading set uppsercase start
                            if(this.isSchemaDesigner == true)
                            {
                                let newName =this.titlecasePipe.transform(this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['content']);
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['content'] = newName;
                                this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['expression'] = '';
                            }
                            //added by mayuri on 4 oct 2023 for column heading set uppsercase end
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['groupName'] = this.defaultGrpName;
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['StandardName'] = this.defaultGrpName;
                        }
                        else if(droppedCol['calc_seq'] != undefined && droppedCol['calc_seq'] == this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['calc_seq'])
                        {
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['groupName'] = this.defaultGrpName;
                            this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['StandardName'] = this.defaultGrpName;
                            if(this.currentCalSeq == this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['calc_seq'] && this.currentCalArray[curCalIndex] != undefined)
                            {
                                this.currentVisual['ColumnGroups'][i]['COLUMNS'][j] = this.currentCalArray[curCalIndex]['columnData'];
                            }
                        } 
                        console.log("print this.currentVisual 1845::::::::",JSON.stringify(this.currentVisual));
                     // Added by Sujan on 17-01-2023 to drag and drop or select deselect for calculated columns[end]
                    }
                }
            }
            let groups = this.currentVisual.ColumnGroups;
            if(groups.length > 0)
            {
                groups.forEach((group: any) => {
                    if(group.GroupName == this.defaultGrpName)
                    {
						// Changed by nikhil on 24-05-2022 for if column drag drop between groups then group name does not change in sqlmodel
                        /*arrOfColumns.forEach((element: any) => {
                            if(element.DBNAME == droppedCol.DBNAME && element.DBTABLE == droppedCol.DBTABLE)
                            {
                                element['groupName'] = this.defaultGrpName;
                                element['StandardName'] = group['StandardName'];
                                return;
                            }
                        });*/
                       for(let i = 0; i < arrOfColumns.length; i++)
						{
                            if(arrOfColumns[i].DBNAME == droppedCol.DBNAME && arrOfColumns[i].DBTABLE == droppedCol.DBTABLE)
                            {
                                arrOfColumns[i]['groupName'] = this.defaultGrpName;
                                arrOfColumns[i]['StandardName'] = group['StandardName'];
                                return;
                            }
                            else if(droppedCol.col_name != undefined && arrOfColumns[i].DBNAME == droppedCol.col_name.toUpperCase())
                            {
                                arrOfColumns[i]['groupName'] = this.defaultGrpName;
                                arrOfColumns[i]['StandardName'] = group['StandardName'];
                                // this.currentVisual.ColumnGroups[i]['groupName'] = this.defaultGrpName;
								// this.currentVisual.ColumnGroups[i]['StandardName'] = group['StandardName'];
                                return;
                            }
                        }
                        return;
                    }
                });
            }
        }
        else
        {
            if(arrOfColumns.length > 0)
            {
                arrOfColumns.forEach((element: any) => {
                if(element.DBNAME == droppedCol.DBNAME && element.DBTABLE == droppedCol.DBTABLE)
                {
                    if(element.hasOwnProperty('groupName'))
                    {
                        delete element['groupName'];
                    }
                    return;
                }
                });
            }
        }
        // Added by Samruddhi on 04-05-2022 for layoutdata not updating if columns sequence changed
       //Changed by pranjali  On visual option done call refresh method.[Start]
       // this.setLayoutData.emit("");
        let layoutJson = {};
        layoutJson['isDoneSelected'] = false;
        this.setLayoutData.emit(layoutJson);
        //Changed by pranjali  On visual option done call refresh method.[End]
    }

    validateGrpBox(column: any)
    {
      for(let i=0; i<this.currentVisual.ColumnGroups.length; i++)
        {
            let minCol = this.currentVisual.ColumnGroups[i]['MinColumns'];
            let maxCol = this.currentVisual.ColumnGroups[i]['MaxColumns'];
            maxCol = maxCol != undefined && String(maxCol).length > 0 ? Number(maxCol) : 0;
            let allowedType = this.currentVisual.ColumnGroups[i]['AllowedColumnTypes'];
            let colGrpName = this.currentVisual.ColumnGroups[i]['GroupName'];
            let columnsLen = this.currentVisual.ColumnGroups[i]['COLUMNS'].length;
            if(maxCol > 0 && this.defaultGrpName == colGrpName && (columnsLen + 1) > maxCol)
            {
                //Added by Samruddhi on 07/06/2021 for data validation
                let alertMsg = "Maximum " + maxCol + " fields are allowed to be added in "+ colGrpName + " for process";
                window.alert(alertMsg);
                return false;
            }
            
            if(allowedType != undefined && allowedType != 'ANY' && this.defaultGrpName == colGrpName)
            {
                if(!allowedType.includes(column['COLTYPE']))
                {
                    //Added by Samruddhi on 25/05/2021 for data validation
                    let alertMsg = "In the " + colGrpName + " only allow to add " + allowedType + " fields";
                    window.alert(alertMsg);
                    return false;
                }
            }
            if(this.defaultGrpName == colGrpName)
            {
                column['groupName'] = this.defaultGrpName;
                column['StandardName'] = this.currentVisual.ColumnGroups[i]['StandardName'];
                let grpBoxContId = "groupBoxContent_" + (this.currentGrpIndex + 1);
                // Added by Sujan on 05-01-2023 if column is selected then open the groupbox if closed.
                let grpBoxElement: any = document.getElementById(grpBoxContId);
                if(grpBoxElement != null)
                {
                    let isOpen = grpBoxElement.classList.contains('showContent');    
                    if(!isOpen)
                    {
                        this.onClickGrpBox(this.currentGrpIndex);
                    }
                }
            }
        }
        return true;
  }

  onPanelClick(mep: MatExpansionPanel, group: any){
      mep.close();
    }

  deleteColFromSqlArray(column: any)
  {
    let index = -1;
    let dbName = column.DBNAME;
    let tblNAme = column.DBTABLE;
    let filteredObj = this.sqlColumArray.find(function(item, i)
    {
        if(item.DBNAME === dbName && item.tableName === tblNAme)
        {
            index = i;
            return i;
        }
    });
    if( index != -1 )
    {
        this.sqlColumArray.splice(index,1);
    }
  }

  @ViewChild('scrollEl')
  scrollEl:ElementRef<HTMLElement> | any;

  @ViewChildren(CdkDrag)
  dragEls!:QueryList<CdkDrag>;

    subs = new Subscription();
    private scroll($event: CdkDragMove) 
    {
        const { y } = $event.pointerPosition;
        const baseEl = this.scrollEl.nativeElement;
        const box = baseEl.getBoundingClientRect();
        const scrollTop = baseEl.scrollTop;
        const top = box.top + - y ;
        if (top > 0 && scrollTop !== 0) 
        {
            const newScroll = scrollTop - speed * Math.exp(top / 50);
            baseEl.scrollTop = newScroll;
            this.animationFrame = requestAnimationFrame(() => this.scroll($event));
            return;
        }
        const bottom = y - box.bottom ;
        if (bottom > 0 && scrollTop < box.bottom) 
        {
            const newScroll = scrollTop + speed * Math.exp(bottom / 50);
            baseEl.scrollTop = newScroll;
            this.animationFrame = requestAnimationFrame(() => this.scroll($event));
        }
    }
    private animationFrame: number | undefined;

    @bound
    public triggerScroll($event: CdkDragMove) {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = undefined;
        }
        this.animationFrame = requestAnimationFrame(() => this.scroll($event));
    }

    @bound
    private cancelScroll() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = undefined;
        }
    }

    buildTablesArray()
    {
       let detailData = this.schemaDataNew['HR_Master'];
        for (var key of Object.keys(detailData)) 
        {
            if( key == "COLUMNS")
            {
                //Change by shrutika on 06-07-21 [Start] for only one table in schema file then schema not drwn properly.
                //this.tablesArray = detailData[key];
                if (detailData[key] instanceof Array) 
                {
                    this.tablesArray = detailData[key];
                }
                else
                {
                    this.tablesArray = [];
                    this.tablesArray.push(detailData[key]);
                }
                //Change by shrutika on 06-07-21 [End] for only one table in schema file then schema not drwn properly.
                console.log("print line no 2030::::::::::;",this.tablesArray);
               for( var i=0; i<this.tablesArray.length; i++)
                {
                    for (var tableKey of Object.keys(this.tablesArray[i])) 
                    {
                        if( tableKey == "COLUMN")
                        {                            
                            console.log("print line no 2043 tableKey::::::;;",tableKey);               
                            var isArray = Array.isArray(this.tablesArray[i][tableKey]);
                            if( isArray )
                            {
                                for( let j=0; j<this.tablesArray[i][tableKey].length; j++)
                                {
                                    let cuurentColumneData = {} =this.tablesArray[i][tableKey][j];
                                    console.log("print cuurentColumneData line no 2043:::::;",cuurentColumneData);
                                    if(cuurentColumneData['FEILD_TYPE'] != undefined && cuurentColumneData['FEILD_TYPE'] != '')
                                    {
                                        this.tablesArray[i][tableKey][j]["FEILD_TYPE"] = cuurentColumneData['FEILD_TYPE'];
                                    }
                                    else
                                    {
                                    	this.tablesArray[i][tableKey][j]["FEILD_TYPE"] = "TEXTBOX";
                                    }
                                    if(cuurentColumneData['value'] != undefined && cuurentColumneData['value'] != '')
                                    {
                                        this.tablesArray[i][tableKey][j]["value"] = cuurentColumneData['value'];
                                    }
                                    else
                                    {
                                    	this.tablesArray[i][tableKey][j]["value"] = "";
                                    }
                                    if(cuurentColumneData['name'] != undefined && cuurentColumneData['name'] != '')
                                    {
                                        this.tablesArray[i][tableKey][j]["name"] = cuurentColumneData['name']; 
                                    }
                                    else
                                    {
                                    	this.tablesArray[i][tableKey][j]["name"] = cuurentColumneData['content']; 
                                    }
                                    if(cuurentColumneData['type'] != undefined && cuurentColumneData['type'] != '')
                                    {
                                        this.tablesArray[i][tableKey][j]["type"] = cuurentColumneData['type']; 
                                    }
                                    else
                                    {
                                    	this.tablesArray[i][tableKey][j]["type"] = this.getColType(cuurentColumneData['COLTYPE']);
                                    }
                                   
                                    if(cuurentColumneData['descr'] != undefined && cuurentColumneData['descr'] != '')
                                    {
                                        this.tablesArray[i][tableKey][j]["descr"] = cuurentColumneData['descr']; 
                                    }
                                    else
                                    {
                                    	this.tablesArray[i][tableKey][j]["descr"] = cuurentColumneData['content'] + ' description';
                                    }
                                    if(cuurentColumneData['expression'] != undefined && cuurentColumneData['expression'] != '')
                                    {
                                        this.tablesArray[i][tableKey][j]["expression"] = cuurentColumneData['expression']; 
                                    }
                                    else
                                    {
                                    	this.tablesArray[i][tableKey][j]["expression"] = "";
                                    }

                                    // Changed by Samruddhi on 01-08-2022 for issue of table name in criteria
                                    // this.tablesArray[i][tableKey][j]["tableName"] = this.tablesArray[i]['TABLE_NAME'];
                                    if(cuurentColumneData['tableName'] != undefined && cuurentColumneData['tableName'] != '')
                                    {
                                        this.tablesArray[i][tableKey][j]["tableName"] = cuurentColumneData['tableName']; 
                                    }
                                    else
                                    {
                                    	this.tablesArray[i][tableKey][j]["tableName"] = cuurentColumneData['DBTABLE'];                                        
                                    }
                                    
                                    //Added by Mayur to make changes in Criteria Screen Auto-search on 19/03/21 [Start]
                                    if(cuurentColumneData['tableDisplayName'] != undefined && cuurentColumneData['tableDisplayName'] != '')
                                    {
                                        this.tablesArray[i][tableKey][j]["tableDisplayName"] = cuurentColumneData['tableDisplayName']; 
                                    }
                                    else
                                    {
                                    	this.tablesArray[i][tableKey][j]["tableDisplayName"] = this.tablesArray[i]['DISPLAY_NAME'];
                                    }
                                    
                                    //Added by Mayur to make changes in Criteria Screen Auto-search on 19/03/21 [End]
                                    //Changes by shrutika on 20-08-21 for add expression in both case drag and drop and alson from start
                                    //this.tablesArray[i][tableKey][j]["FUNCTION"] = "";
                                    if(cuurentColumneData['FUNCTION'] != undefined && cuurentColumneData['FUNCTION'] != '')
                                    {
                                        this.tablesArray[i][tableKey][j]["FUNCTION"] = cuurentColumneData['FUNCTION']; 
                                    }
                                    else
                                    {
                                    	this.tablesArray[i][tableKey][j]["FUNCTION"] = cuurentColumneData['DEFAULTFUNCTION'];
                                    }
                                   
                                    // Added by nikhil on 10-03-2022 for advance formating
                                    if(cuurentColumneData['ADV_FORMAT'] != undefined && cuurentColumneData['ADV_FORMAT'] != '')
                                    {
                                        this.tablesArray[i][tableKey][j]["ADV_FORMAT"] = cuurentColumneData['ADV_FORMAT']; 
                                    }
                                    else
                                    {
                                    	this.tablesArray[i][tableKey][j]["ADV_FORMAT"] = "";
                                    }
                                    if(cuurentColumneData['HIDDEN'] != undefined && cuurentColumneData['HIDDEN'] != '')
                                    {
                                        this.tablesArray[i][tableKey][j]["HIDDEN"] = cuurentColumneData['HIDDEN']; 
                                    }
                                    else
                                    {
                                        this.tablesArray[i][tableKey][j]["HIDDEN"] = ""; 
                                    }
                                    if(cuurentColumneData['alignment'] != undefined && cuurentColumneData['alignment'] != '')
                                    {
                                        this.tablesArray[i][tableKey][j]['alignment'] = cuurentColumneData['alignment']; 
                                    }
                                    else
                                    {
                                        this.tablesArray[i][tableKey][j]["alignment"] = ""; 
                                    }
                                    if(cuurentColumneData['ALIGNMENT'] != undefined && cuurentColumneData['ALIGNMENT'] != '')
                                    {
                                        this.tablesArray[i][tableKey][j]["ALIGNMENT"] = cuurentColumneData['ALIGNMENT']; 
                                    }
                                    else
                                    {
                                        this.tablesArray[i][tableKey][j]["ALIGNMENT"] = ""; 
                                    }
                                    if(cuurentColumneData['content'] != undefined && cuurentColumneData['content'] != '')
                                    {
                                        this.tablesArray[i][tableKey][j]["content"] = cuurentColumneData['content']; 
                                    }
                                    else
                                    {
                                        this.tablesArray[i][tableKey][j]["content"] = ""; 
                                    }
                                   
                                    let val = cuurentColumneData['DEFAULTFUNCTION'];
                                    let column = cuurentColumneData['DBTABLE'] + "." + cuurentColumneData['DBNAME']
                                    // Changed by Samrudhi on 22-08-2022 to add dynamic column expression
                                    // let expr = val == '' ? column : val + '(' + cuurentColumneData['DBNAME'] + ')';
                                    // this.tablesArray[i][tableKey][j]['expression'] = expr;
                                    //this.tablesArray[i][tableKey][j]['expression'] = "";
                                    //Changes by shrutika on 20-08-21 for add expression in both case drag and drop and alson from  end
                                    if(this.currentVisual)
                                    {
                                        this.tablesArray[i][tableKey][j]["groupName"] = this.defaultGrpName;
                                    }
                                    if(this.columnsInGroups != undefined)
                                    {
                                        for(const key of Object.keys(this.columnsInGroups))
                                        {
                                            let value = this.columnsInGroups[key];
                                            if(value != null)
                                            {
                                                // this.defaultGrpName = key;
                                    			// this.groupStateMap[this.defaultGrpName] = "opened";
                                                if(value instanceof Array)
                                                {
                                                    for(let k=0; k<value.length; k++)
                                                    {
                                                        if(this.tablesArray[i][tableKey][j]["DBNAME"] == value[k])
                                                        {
                                                            this.tablesArray[i][tableKey][j]["checked"] = true;
                                                            this.groupStateMap[key] = "opened";
                                                            this.tablesArray[i][tableKey][j]["groupName"] = key;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        console.log("print line no 2052 defaultgrpname",this.defaultGrpName);
                                    }
                                } 
                            }
                            else if(typeof this.tablesArray[i][tableKey] === 'object')
                            {
                                let cuurentColumneData = {} = this.tablesArray[i][tableKey];
                                if (!Array.isArray(this.tablesArray[i][tableKey])) {
                                    this.tablesArray[i][tableKey] = [{}]; // Initialize the array with an empty object
                                }
                                this.tablesArray[i][tableKey][0] = cuurentColumneData;
                                if(cuurentColumneData['FEILD_TYPE'] != undefined && cuurentColumneData['FEILD_TYPE'] != '')
                                {
                                    this.tablesArray[i][tableKey][0]["FEILD_TYPE"] = cuurentColumneData['FEILD_TYPE'];
                                }
                                else
                                {
                                    this.tablesArray[i][tableKey][0]["FEILD_TYPE"] = "TEXTBOX";
                                }
                                if(cuurentColumneData['value'] != undefined && cuurentColumneData['value'] != '')
                                {
                                    this.tablesArray[i][tableKey][0]["value"] = cuurentColumneData['value'];
                                }
                                else
                                {
                                    this.tablesArray[i][tableKey][0]["value"] = "";
                                }
                                if(cuurentColumneData['name'] != undefined && cuurentColumneData['name'] != '')
                                {
                                    this.tablesArray[i][tableKey][0]["name"] = cuurentColumneData['name']; 
                                }
                                else
                                {
                                    this.tablesArray[i][tableKey][0]["name"] = cuurentColumneData['content']; 
                                }
                                if(cuurentColumneData['type'] != undefined && cuurentColumneData['type'] != '')
                                {
                                    this.tablesArray[i][tableKey][0]["type"] = cuurentColumneData['type']; 
                                }
                                else
                                {
                                    this.tablesArray[i][tableKey][0]["type"] = this.getColType(cuurentColumneData['COLTYPE']);
                                }
                               
                                if(cuurentColumneData['descr'] != undefined && cuurentColumneData['descr'] != '')
                                {
                                    this.tablesArray[i][tableKey][0]["descr"] = cuurentColumneData['descr']; 
                                }
                                else
                                {
                                    this.tablesArray[i][tableKey][0]["descr"] = cuurentColumneData['content'] + ' description';
                                }
                                if(cuurentColumneData['expression'] != undefined && cuurentColumneData['expression'] != '')
                                {
                                    this.tablesArray[i][tableKey][0]["expression"] = cuurentColumneData['expression']; 
                                }
                                else
                                {
                                    this.tablesArray[i][tableKey][0]["expression"] = "";
                                }
                                if(cuurentColumneData['tableName'] != undefined && cuurentColumneData['tableName'] != '')
                                {
                                    this.tablesArray[i][tableKey][0]["tableName"] = cuurentColumneData['tableName']; 
                                }
                                else
                                {
                                    this.tablesArray[i][tableKey][0]["tableName"] = cuurentColumneData['DBTABLE'];                                        
                                }
                                
                                if(cuurentColumneData['tableDisplayName'] != undefined && cuurentColumneData['tableDisplayName'] != '')
                                {
                                    this.tablesArray[i][tableKey][0]["tableDisplayName"] = cuurentColumneData['tableDisplayName']; 
                                }
                                else
                                {
                                    this.tablesArray[i][tableKey][0]["tableDisplayName"] = this.tablesArray[i]['DISPLAY_NAME'];
                                }
                                if(cuurentColumneData['FUNCTION'] != undefined && cuurentColumneData['FUNCTION'] != '')
                                {
                                    this.tablesArray[i][tableKey][0]["FUNCTION"] = cuurentColumneData['FUNCTION']; 
                                }
                                else
                                {
                                    this.tablesArray[i][tableKey][0]["FUNCTION"] = cuurentColumneData['DEFAULTFUNCTION'];
                                }
                                if(cuurentColumneData['ADV_FORMAT'] != undefined && cuurentColumneData['ADV_FORMAT'] != '')
                                {
                                    this.tablesArray[i][tableKey][0]["ADV_FORMAT"] = cuurentColumneData['ADV_FORMAT']; 
                                }
                                else
                                {
                                    this.tablesArray[i][tableKey][0]["ADV_FORMAT"] = "";
                                }
                                if(cuurentColumneData['HIDDEN'] != undefined && cuurentColumneData['HIDDEN'] != '')
                                {
                                    this.tablesArray[i][tableKey][0]["HIDDEN"] = cuurentColumneData['HIDDEN']; 
                                }
                                else
                                {
                                    this.tablesArray[i][tableKey][0]["HIDDEN"] = ""; 
                                }
                                if(cuurentColumneData['alignment'] != undefined && cuurentColumneData['alignment'] != '')
                                {
                                    this.tablesArray[i][tableKey][0]['alignment'] = cuurentColumneData['alignment']; 
                                }
                                else
                                {
                                    this.tablesArray[i][tableKey][0]["alignment"] = ""; 
                                }
                                if(cuurentColumneData['ALIGNMENT'] != undefined && cuurentColumneData['ALIGNMENT'] != '')
                                {
                                    this.tablesArray[i][tableKey][0]["ALIGNMENT"] = cuurentColumneData['ALIGNMENT']; 
                                }
                                else
                                {
                                    this.tablesArray[i][tableKey][0]["ALIGNMENT"] = ""; 
                                }
                                if(cuurentColumneData['content'] != undefined && cuurentColumneData['content'] != '')
                                {
                                    this.tablesArray[i][tableKey][0]["content"] = cuurentColumneData['content']; 
                                }
                                else
                                {
                                    this.tablesArray[i][tableKey][0]["content"] = ""; 
                                }
                               
                                let val = cuurentColumneData['DEFAULTFUNCTION'];
                                let column = cuurentColumneData['DBTABLE'] + "." + cuurentColumneData['DBNAME']

                                if(this.currentVisual)
                                {
                                    this.tablesArray[i][tableKey][0]["groupName"] = this.defaultGrpName;
                                }
                                if(this.columnsInGroups != undefined)
                                {
                                    for(const key of Object.keys(this.columnsInGroups))
                                    {
                                        let value = this.columnsInGroups[key];
                                        if(value != null)
                                        {
                                            if(value instanceof Array)
                                            {
                                                for(let k=0; k<value.length; k++)
                                                {
                                                    if(this.tablesArray[i][tableKey][0]["DBNAME"] == value[k])
                                                    {
                                                        this.tablesArray[i][tableKey][0]["checked"] = true;
                                                        this.groupStateMap[key] = "opened";
                                                        this.tablesArray[i][tableKey][0]["groupName"] = key;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    console.log("print line no 2400 defaultgrpname",this.defaultGrpName);
                                }
                            }
                        }
                    }
                }
            let tablesNewData: any = {};
            tablesNewData['ROOT'] = this.tablesArray;
            this.tablesArrForCriteria = JSON.stringify(tablesNewData);
            console.log('print tablesArrForCriteria 2250::::::',this.tablesArrForCriteria);
            }
        }
  }

	// Added by Pranjali for added new input fields for columns
  buildSchemaTablesArray()
  {
    console.log('Print inside buildSchemaTablesArray this.currentVisual::::::',JSON.stringify(this.currentVisual));
    console.log("print line no 2186 this.tablesArray::::::;;",this.tablesArray);               
    for( var i=0; i<this.tablesArray.length; i++)
    {
        for (var tableKey of Object.keys(this.tablesArray[i])) 
        {
            if( tableKey == "COLUMN")
            {           
                console.log("print line no 2204 tableKey::::::;;",tableKey);               
                var isArray = Array.isArray(this.tablesArray[i][tableKey]);
                console.log("print line no 2045::::::",isArray);
                if( isArray )
                {
                    for( var j=0; j<this.tablesArray[i][tableKey].length; j++)
                    {
                        let curColumneData = {} = this.tablesArray[i][tableKey][j];
                        console.log("print line no 2212::::::",curColumneData);
                        if(curColumneData['ADV_FORMAT'] != undefined)
                        {
                            this.tablesArray[i][tableKey][j]["ADV_FORMAT"] = curColumneData['ADV_FORMAT'];
                            console.log("print line no 2128:::::;",this.tablesArray[i][tableKey][j]["ADV_FORMAT"]);
                        }
                        else
                        {
                            this.tablesArray[i][tableKey][j]["ADV_FORMAT"] = "";
                        }
                        if(curColumneData['ALIGNMENT'] != undefined)
                        {
                            this.tablesArray[i][tableKey][j]["ALIGNMENT"] = curColumneData['ALIGNMENT'];
                        }
                        else
                        {
                            this.tablesArray[i][tableKey][j]["ALIGNMENT"] = "1";
                        }
                        if(curColumneData['alignment'] != undefined)
                        {
                            this.tablesArray[i][tableKey][j]["alignment"] = curColumneData['alignment'];
                        }
                        else
                        {
                            this.tablesArray[i][tableKey][j]["alignment"] = "";
                        }
                        if(curColumneData['BGCOLOR'] != undefined)
                        {
                            this.tablesArray[i][tableKey][j]["BGCOLOR"] = curColumneData['BGCOLOR'];
                        }
                        else
                        {
                            this.tablesArray[i][tableKey][j]["BGCOLOR"] = "";
                        }
                        if(curColumneData['BOLD'] != undefined)
                        {
                            this.tablesArray[i][tableKey][j]["BOLD"] =  curColumneData['BOLD'];
                        }
                        else
                        {
                            this.tablesArray[i][tableKey][j]["BOLD"] = "";
                        }
                        if(curColumneData['FONT'] != undefined)
                        {
                            this.tablesArray[i][tableKey][j]["FONT"] =  curColumneData['FONT'];
                        }
                        else
                        {
                            this.tablesArray[i][tableKey][j]["FONT"] = "";
                        }
                        if(curColumneData['FONTSIZE'] != undefined)
                        {
                            this.tablesArray[i][tableKey][j]["FONTSIZE"] =  curColumneData['FONTSIZE'];
                        }
                        else
                        {
                            this.tablesArray[i][tableKey][j]["FONTSIZE"] = "";
                        }
                        if(curColumneData['FGCOLOR'] != undefined)
                        {
                            this.tablesArray[i][tableKey][j]["FGCOLOR"] =  curColumneData['FGCOLOR'];
                        }
                        else
                        {
                            this.tablesArray[i][tableKey][j]["FGCOLOR"] = "";
                        }
                        if(curColumneData['ITALIC'] != undefined)
                        {
                            this.tablesArray[i][tableKey][j]["ITALIC"] =  curColumneData['ITALIC'];
                        }
                        else
                        {
                            this.tablesArray[i][tableKey][j]["ITALIC"] = "";
                        }
                        if(curColumneData['PATTERN'] != undefined)
                        {
                            this.tablesArray[i][tableKey][j]["PATTERN"] =  curColumneData['PATTERN'];
                        }
                        else
                        {
                            this.tablesArray[i][tableKey][j]["PATTERN"] = "";
                        }
                        if(curColumneData['UNDERLINE'] != undefined)
                        {
                            this.tablesArray[i][tableKey][j]["UNDERLINE"] =  curColumneData['UNDERLINE'];
                        }
                        else
                        {
                            this.tablesArray[i][tableKey][j]["UNDERLINE"] = "";
                        }
                        if(curColumneData['HIDDEN'] != undefined)
                        {
                            this.tablesArray[i][tableKey][j]["HIDDEN"] =  curColumneData['HIDDEN'];
                            console.log("print line no 2297::;;;",this.tablesArray[i][tableKey][j]);
                        }
                        else
                        {
                            this.tablesArray[i][tableKey][j]["HIDDEN"] = "";
                            console.log("print line no 2302::;;;",this.tablesArray[i][tableKey][j]);
                        }
                        if(curColumneData['FORMAT'] != undefined)
                        {
                            this.tablesArray[i][tableKey][j]["FORMAT"] =  curColumneData['FORMAT'];
                            console.log("print line no 2218::::;;", this.tablesArray[i][tableKey][j]["FORMAT"]);
                        }
                        else
                        {
                            this.tablesArray[i][tableKey][j]["FORMAT"] = "";
                        }
                        if(curColumneData['expression'] != undefined)
                        {
                            this.tablesArray[i][tableKey][j]["expression"] =  curColumneData['expression'];
                            console.log("pritn line noo 2225 :::::;;",this.tablesArray[i][tableKey][j]);
                        }
                        else
                        {
                            this.tablesArray[i][tableKey][j]["expression"] = "";
                        }
                        
                        // this.tablesArray[i][tableKey][j]["type"] = "";
                        if(curColumneData['content'] != undefined)
                        {
                            this.tablesArray[i][tableKey][j]["name"] = curColumneData['content']; 
                            this.tablesArray[i][tableKey][j]["descr"] = curColumneData['content'] + ' description';
                            this.tablesArray[i][tableKey][j]["content"] = curColumneData['content']; 
                        }
                        else
                        {
                            this.tablesArray[i][tableKey][j]["name"] = ''; 
                            this.tablesArray[i][tableKey][j]["descr"] = '';
                            this.tablesArray[i][tableKey][j]["content"] = ''; 
                        }
                        if(curColumneData['COLTYPE'] != undefined)
                        {
                            this.tablesArray[i][tableKey][j]["type"] = this.getColType(curColumneData['COLTYPE']);
                        }
                        else
                        {
                            this.tablesArray[i][tableKey][j]["type"] = '';
                        }
                    }
                }
                
            }
        }
    }
    let tablesNewData: any = {};
    tablesNewData['ROOT'] = this.tablesArray;
    this.tablesArrForCriteria = JSON.stringify(tablesNewData);
    console.log('print this.tablesArray 2234::::::::',this.tablesArray);
  }

  onColumnAlignmentSelection(val)
  {
    let currentCOlAlign = val;
    console.log('print this.tablesArray 2234::::::::',this.tablesArray);
  }
  

    onVisualChange(index: any)
    {
       console.log('inside onVisualChange........1454');
	   //Added by nikhil for creating new visual HTML xsl[Start]
	   //Added by nikhil on 13-12-2021 for process definition visual select
	   if(this.isDashboard == 'true' && this.currentVisual['OutputType'] != undefined && (this.currentVisual['OutputType'] == "HTML" || this.currentVisual['OutputType'] == "XML"))
	   {
		   this.isSourceSqlChange = true;
		   this.SqlModelData['OUTPUT_TYPE'] = this.currentVisual['OutputType'];
           console.log('Print SqlModelData 1934::::',this.SqlModelData);
	   }
	   else
	   {
		   this.SqlModelData['OUTPUT_TYPE'] = "JSON";
           console.log('Print SqlModelData 1939::::',this.SqlModelData);
	   }
	   //Added by nikhil for creating new visual HTML and xsl[End]
       if(this.overlayRef != undefined)
       {
        this.overlayRef.dispose();
       }
       //Changed by Samruddhi for updated UI
       if(this.currentVisual)
       {
            for(let j=0; j<this.currentVisual.ColumnGroups.length; j++)
            {
                if( this.currentVisual.ColumnGroups[j]['COLUMNS'] != undefined)
                {
                    // Changed by Samruddhi on 22-04-2022 for visual change issue in freehand
                    // this.currentVisual.ColumnGroups[j]['COLUMNS'] = [];
                    if(this.currentVisual.ColumnGroups[j]['COLUMNS'].length > 0)
                    {
                        let colArrLen = this.currentVisual.ColumnGroups[j]['COLUMNS'].length;
                        this.currentVisual.ColumnGroups[j]['COLUMNS'].splice(0, colArrLen);
                    }
                }
            }
       }
       this.currentVisual = this.editorVisuals['Visuals'][index];
       console.log("print line no 2111 this.currentVisual ::::::",JSON.stringify(this.currentVisual));
       this.defaultVisual = this.currentVisual['VisualName'];
       //Changed by Samruddhi for updated UI
	   //Added by nikhil for creating new visual HTML and xsl[Start]
	   //Added by nikhil on 13-12-2021 for process definition visual select
	   if(this.isDashboard == 'true' && this.currentVisual['OutputType'] != undefined && (this.currentVisual['OutputType'] == "HTML" || this.currentVisual['OutputType'] == "XML"))
	   {
		   this.isSourceSqlChange = true;
		   this.SqlModelData['OUTPUT_TYPE'] = this.currentVisual['OutputType'];
           console.log('Print SqlModelData 1972::::',this.SqlModelData);
	   }
	   else
	   {
		   this.SqlModelData['OUTPUT_TYPE'] = "JSON";
           console.log('Print SqlModelData 1977::::',this.SqlModelData);
	   }
	   //Added by nikhil for creating new visual HTML xsl[End]
	   // Added by nikhil on 04-03-2022 for set the visual description 
       //this.allformValues['descr'] = this.defaultVisual;
       // this.defaultGrpName = this.currentVisual.ColumnGroups[0]['GroupName'];
        let allColumns = [];
        if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel'][this.param1] != undefined)
        {
            allColumns = this.SqlModelData['SQLModel'][this.param1][0]['COLUMN'];
        }

       this.SqlModelData['VISUAL_NAME'] = this.defaultVisual;
      
       // Added by Nikhil on 21-06-21 on change of visual if the groupbox do not match but the datatype is same then add the column array in the first groupbox of current visuals.
       let tempColumnArr: any = [];   
        for(let i=0; i<allColumns.length; i++)
        {
            let column: any = allColumns[i];
            let ind = -1;
            let filteredObj = this.currentVisual.ColumnGroups.find(function(item: any, i: any)
            {
                // Added by Nikhil on 21-06-21 on change of visual if the groupbox do not match but the datatype is same then add the column array in the first groupbox of current visuals.
                if((column['StandardName'] != undefined && (item.StandardName == column['StandardName'] && item.AllowedColumnTypes == 'ANY'))  || (column['StandardName'] != undefined && item.StandardName == column['StandardName'] && item.AllowedColumnTypes.includes(column['COLTYPE'])))
                {
                    ind = i;
                    return i;
                }
            });
            
            if( ind != -1 )
            {
                column['groupName'] = this.currentVisual.ColumnGroups[ind]['GroupName'];
                column['StandardName'] = this.currentVisual.ColumnGroups[ind]['StandardName'];
                this.currentVisual.ColumnGroups[ind]['COLUMNS'].push(column);
            }
            else
            {
                // Added by Nikhil on 21-06-21 on change of visual if the groupbox do not match but the datatype is same then add the column array in the first groupbox of current visuals [Start]
                let firstGroup = this.currentVisual.ColumnGroups[0];
                // Added by Sujan on 06-01-2023 to set the first groupbox selected on change of visual if the groupbox do not match
                this.defaultGrpName = firstGroup['GroupName'];
                if(firstGroup['AllowedColumnTypes'] == 'ANY')
                {
                    column['groupName'] = firstGroup['GroupName'];
                    column['StandardName'] = firstGroup['StandardName'];
                    firstGroup['COLUMNS'].push(column);
                }
                else
                {
                    column['checked'] = false;
                    this.updateTablesArrayOnValidate(column);
                }
            }
        }
        // Added by Sujan on 13-02-2023 for the default must stay open on visual change
        let curGrpName = this.defaultGrpName;
        let idx = -1;
        let grpNameFilter = this.currentVisual.ColumnGroups.find(function (item: any, a: any) {
            if (item != undefined &&  item.GroupName != undefined && item.GroupName == curGrpName) 
            {
                idx = a;
            }
        });
        if(idx == -1)
        {
            this.defaultGrpName = this.currentVisual['ColumnGroups'][0]['GroupName'];
        }
        // Added by Sujan on 06-01-2023 on visual change the groupbxes with columns in it must stay open       
        for(let ind=0; ind < this.currentVisual.ColumnGroups.length; ind++)
        {  
	        // Changed by Sujan on 13-02-2023 for the default must stay open on visual change
            // let currentColumnArray = [] = this.currentVisual['ColumnGroups'][ind]['COLUMNS'];
            let currentGroup = this.currentVisual['ColumnGroups'][ind]['GroupName'];
            if(this.currentVisual['ColumnGroups'][ind]['COLUMNS'] != undefined && this.currentVisual['ColumnGroups'][ind]['COLUMNS'].length > 0)
            {
                // let currentGroup = this.currentVisual['ColumnGroups'][ind]['GroupName'];
                this.groupStateMap[currentGroup] = "opened";
            }
            else
            {
                if(this.defaultGrpName != this.currentVisual['ColumnGroups'][0]['COLUMNS'])
                {
                    let defaultGroup = this.currentVisual['ColumnGroups'][0]['GroupName'];
                    this.groupStateMap[defaultGroup] = "opened";
                }
                else
                {
                    this.groupStateMap[currentGroup] = "closed";
                }
            }
        }
        if(this.defaultVisual == 'Grid')
        {
            this.defaultGrpName = 'Columns';
            this.groupStateMap[this.defaultGrpName] = "opened";
        }
        let tempGrpCols = this.currentVisual.ColumnGroups;
        tempGrpCols.forEach( (columns: any) => {
            // if(columns['COLUMNS'] != undefined)
            if(columns['COLUMNS'].length > 0)
            {
                let cols = columns['COLUMNS'];
                cols.forEach( (column: any) => {
                tempColumnArr.push(column)
                })
            }
        });
        if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel'][this.param1] != undefined)
        {
            this.SqlModelData['SQLModel'][this.param1][0]['COLUMN'] = tempColumnArr;
        }
        // Added by Nikhil on 21-06-21 on change of visual if the groupbox do not match but the datatype is same then add the column array in the first groupbox of current visuals [End]
        // Added by Samruddhi for visual name in preview panel
        // Changed by Samruddhi for exception in console for currentVisual
        if(this.currentVisual != undefined)
        {
            console.log('call currentVisualData......1526');
            this.currentVisualData.emit(JSON.stringify(this.currentVisual));
        }
        
   }

    onChangeOfSchema(schemaListData: any): any
    {
        console.log('Print schemaListData 2306:::::',schemaListData);
	// Changed by Samruddhi for updated UI
        this.freehandOpen = false;
        if( this.editFlag != "E" && this.editFlag != "V")
        {
            this.SqlModelData = JSON.parse(JSON.stringify(this.sqlData));
        }
        this.listData = JSON.parse(schemaListData);
        let fileName = this.listData["schemaName"];
	//Added by shrutika on 22-10-21 for issue occur when freehand first present in schemaList
        this.schemaName = this.listData["schemaName"];
        this.schemaDescr = this.listData['schemaDescr'];
        this.currSchemaType = this.listData["baType"];
	//Added by shrutika on 22-10-21 for issue occur when freehand first present in schemaList
        //Shrutika changes 05-02-21
        //Added by shrutika on 08-03-21 [Start] for draw sql editor according to ba type.
        //Change by shrutika on 06-07-21 [Start] for From schema get database detail and according to database detail connect databse.
        // if( listData["baType"] == 'F' )
        // if(this.isDashboard != 'true' && this.listData != undefined && this.listData["baType"] != 'F')
        /* if(this.listData != undefined && this.listData["baType"] != 'F')
        {
            this.changeSchemaforGpro.emit(schemaListData);
        } */
        //Change by shrutika on 06-07-21 [End] for From schema get database detail and according to database detail connect databse
        //Added by shrutika on 08-03-21 [End] for draw sql editor according to ba type.
        //Added by Shrutika for Dashboard Definition on 15/03/21 [Start]
        if( this.isDashboard == 'true')
        {
            this.listData["defaultVisuals"] = "Column";
        }
        //Added by Shrutika for Dashboard Definition on 15/03/21 [End]

        // Added by Samruddhi for updated UI [Start]
        if(this.listData != undefined && this.listData["baType"] != undefined && this.listData["baType"] == 'F')
        {
            this.freehandOpen = true;
            this.schemaEditor = 3;
            console.log('Print schemaEditor 1718:::::',this.schemaEditor);
            this.listData["defaultVisuals"] = "Grid";
            this.isSqlView = true;
            this.isSqlViewData = true;
        }
        // Changed by Samruddhi for Freehandsql [Start]
        if(this.listData != undefined && this.listData["baType"] != undefined && this.listData["baType"] != 'F')
        {
            this.schemaEditor = 1;
            console.log('Print schemaEditor 1725:::::',this.schemaEditor);
            this.itemTemplate = 'Feed';
            this.freehandSelect = false;
            this.isSqlViewData = false;
        }
        /*if(this.listData["baType"] == 'F' )
        {
            this.schemaEditor = 3;
        }*/
        // Added by Samruddhi for updated UI [End]
        if( this.isDashboard == 'true' && this.listData != undefined && this.listData["baType"] != undefined && this.listData["baType"] == 'F')
        {
            this.listData["defaultVisuals"] = "Grid";
        }
        /*if(this.listData["baType"] != 'F')
        {
            this.itemTemplate = 'Feed';
            this.freehandSelect = false;
        }*/
       /* else if(this.listData["baType"] == 'F')
        {
            this.itemTemplate = 'Column';
            this.freehandSelect = true;
        }*/
       // Changed by Samruddhi for Freehandsql [End]
       
        if( this.editFlag != "E" && this.editFlag != "V")
        {
            if(this.linkArgVisualName != undefined && this.linkArgVisualName != '' && this.linkArgVisualName != null)
            {
                this.defaultVisual = this.linkArgVisualName;
            }
            else
            {
                if(this.listData["defaultVisuals"] != undefined)
                {
                this.defaultVisual = this.listData["defaultVisuals"];
            }
        }
        }
        this.SqlModelData['VISUAL_NAME'] = this.defaultVisual;
        this.SqlModelData['SCHEMA_NAME'] = fileName;
        this.SqlModelData['SCHEMA_DESCR'] = this.listData['schemaDescr'];
		//added by nikhil on 03-06-2022 for adding schema type in sql model
        this.SqlModelData['SCHEMA_TYPE'] = this.listData["baType"];
        
        this.schemaSQLFilename = fileName;
        console.log("print line no 2333 editorVisualsCopy",this.editorVisualsCopy);
        if(this.editorVisualsCopy != undefined)
        {
            this.changeVisualOnChangeSchema();
        }
        let paramMap: any = {};
        paramMap['ACTION'] = "getSchemaData";
        paramMap['fileName'] = fileName;
        var url = this.sqlService.getHostURL() + '/ibase/PreviewHandlerServlet';
        var paramString = this.sqlService.getEncodedParamString(paramMap);
        this.sqlService.callRequest(url, paramString).subscribe( (data: any) => {
            // Added try catch by Nikhil on 05/07/2021 for schema file is note present then showing the alert
            try
            {
                this.schemaDataNew = JSON.parse(data);
                console.log("print line no 2400::::::",this.schemaDataNew);
                this.buildTablesArray();
                if( this.editFlag == "E" || this.editFlag == "V")
                {
                    this.applySqlDataOnTablesArray();
                }

                //Change by shrutika on 06-07-21 [Start] for From schema get database detail and according to database detail connect databse.
		        // Changed by Samruddhi for updated UI [Start]
                /* if( listData["baType"] == 'F' )
                {
                    let detailData = this.schemaDataNew['HR_Master'];
                    // listData['DATABASE_NAME'] = detailData['DATABASE_NAME'];
                    //listData['TEMPLATE'] = detailData['TEMPLATE'];
                    if( detailData['DATABASE'] != null )
                    {
                        this.listData['DATABASE_TYPE'] = ""+detailData['DATABASE']['TYPE'];
                        this.listData['DATABASE_NAME'] = detailData['DATABASE']['DATABASE_NAME'];
                    }
                    this.changeSchemaforGpro.emit(JSON.stringify(this.listData));
                }
               /* else
                {*/
                    // Added by Samruddhi for process definition
                   /* if(this.isDashboard == 'true' || (this.isDashboard != 'true' && this.listData["baType"] != 'F'))
                    {*/
                        // Changed by Samruddhi on 17-05-2022 to avoid mulitple preview calls in edit mode
                        let sourceSql: any = '';
                        if(this.allformValues['source_sql'] != undefined)
                        {
                            sourceSql = this.allformValues['source_sql'].toLowerCase();
                        }
                        // if(this.isCriteria)
                        if((sourceSql != undefined && sourceSql.includes("where") && sourceSql.includes("?")) || (this.SqlModelData != undefined && this.SqlModelData['CRITERIA'] != undefined && this.SqlModelData['CRITERIA']['query'] != undefined && this.SqlModelData['CRITERIA']['query']['rules'].length > 0))
                        {
                            this.listData['DATABASE_DETAIL'] = this.schemaDataNew['HR_Master']['DATABASE'];
                            console.log("print this.listData[DATABASE_DETAIL] line no 2738::::::",this.listData['DATABASE_DETAIL']);
                            this.getDatabseDetail((callBack: any) => {
                                if(this.editFlag != 'A')
                                {
                                    //Added by shrurtika on 28-11-21 for avoid default functionality in case of edit click at first time.
                                    this.isFirstTimeEdit = true;
                                    console.log("print sourceSql line no 2744::::::",sourceSql);
                                    this.onNextforBrowser();
                                }
                            });
                        }
                    // }
		            //Added by shrutika on 22-10-21 for issue occur when freehand first present in schemaList
                    this.changeSchemaforGpro.emit(JSON.stringify(this.listData));
                //}
                // Changed by Samruddhi for updated UI [end]
                //Change by shrutika on 06-07-21 [End] for From schema get database detail and according to database detail connect databse.
            }
            catch(err)
            {
                window.alert(err);
            }
           /* if( listData["baType"] == 'F' )
            {
                let detailData = this.schemaDataNew['HR_Master'];
                listData['DATABASE_NAME'] = detailData['DATABASE_NAME'];
                listData['TEMPLATE'] = detailData['TEMPLATE'];
                this.changeSchemaforGpro.emit(JSON.stringify(listData));
            }*/
			//Added by nikhil on 12-01-2022 for adding the output type in sql model
			//Added by nikhil on 21-04-2022 for assigning the database type in inmemory schema
			console.log('Print schemaDataNew 1877::::',this.schemaDataNew);
			if(this.schemaDataNew != undefined)
			{
	            console.log('Print schemaDataNew 1880::::',this.schemaDataNew);
				if(this.schemaDataNew['HR_Master']['DATABASE'] != undefined && this.schemaDataNew['HR_Master']['DATABASE'] != '' && this.schemaDataNew['HR_Master']['DATABASE'] != null)
				{
					this.SqlModelData['DATABASE_TYPE'] = ""+this.schemaDataNew['HR_Master']['DATABASE']['TYPE'];
                    this.SqlModelData['DATABASE_DETAIL'] = this.schemaDataNew['HR_Master']['DATABASE'];
				}
				else
				{
					this.SqlModelData['DATABASE_TYPE'] = '1';
                    this.SqlModelData['DATABASE_DETAIL'] = '';
				}
			}

           
        });
        //Added by nikhil on 12-01-2022 for adding the output type in sql model
		if(this.currentVisual != undefined && this.currentVisual['OutputType'] != undefined && (this.currentVisual['OutputType'] == "HTML" || this.currentVisual['OutputType'] == "XML"))
		{
			this.SqlModelData['OUTPUT_TYPE'] = this.currentVisual['OutputType'];
            console.log('Print SqlModelData 1855::::',this.SqlModelData);
		}
		else
		{
			this.SqlModelData['OUTPUT_TYPE'] = 'JSON';
            console.log('Print SqlModelData 1860::::',this.SqlModelData);
		}
        console.log("print line no 2796 currentVisual:::::",JSON.stringify(this.currentVisual));
        if(this.currentVisual != undefined)
        {
            console.log("print line no 2799 currentVisual :::::",JSON.stringify(this.currentVisual));
            this.currentVisualData.emit(JSON.stringify(this.currentVisual));
        }
        else
        {
            // added by mayuri on 12-oct-2023 for columns not getting added iin groupbox in Aslk Insight [start]
            console.log("print line no 2805 this.editorVisuals :::::",JSON.stringify(this.editorVisuals));
            if(this.editorVisuals != undefined)
            {
                for (let i = 0; i < this.editorVisuals.Visuals.length; i++) 
                {
                    let visual = this.editorVisuals.Visuals[i];
                    if (this.defaultVisual == visual['VisualName']) 
                    {
                        this.currentVisual = visual;
                    }
                }
                console.log("print line no 2127 this.currentVisual",this.currentVisual);
                this.currentVisualData.emit(JSON.stringify(this.currentVisual));
            }
             // added by mayuri on 12-oct-2023 for columns not getting added iin groupbox in Aslk Insight [end]
        }

        // Added by Samruddhi for linkArgument 
        console.log('Print line no 2474 columnsInGroups',this.columnsInGroups); 
        if(this.treeViewTemp != undefined && this.tablesArray.length > 0 && this.columnsInGroups != undefined && this.isInsightData == true)
        {
            console.log('Print inside columnsInGroups 2456',this.columnsInGroups);
            for(const key of Object.keys(this.columnsInGroups))
            {
                let value = this.columnsInGroups[key];
                if(value != null)
                {
                    this.defaultGrpName = key;
                    console.log("print line no 2130 this.defaultGrpName",this.defaultGrpName);
                    // this.groupStateMap[this.defaultGrpName] = "opened";
                    this.groupStateMap[key] = "opened"; //added by mayuri on 12-oct-2023
                    this.treeViewTemp.setColumns(value);
                }
            }
            this.isSourceSqlChange = true;
            this.onNextforBrowser();
        }
    }

    applySqlDataOnTablesArray()
    {
        // Changed by Samruddhi for Freehandsql
        if( this.SqlModelData !=undefined && this.SqlModelData['VISUAL_NAME'] != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel'][this.param1] != undefined)
        {
            let sqlModelColumArray = JSON.stringify(this.SqlModelData['SQLModel'][this.param1][0]['COLUMN']);
            let sqlArray = JSON.parse(sqlModelColumArray);
            for(let j=0; j<sqlArray.length; j++)
            {
                var currColumn = sqlArray[j];
                this.sqlColumArray.push(currColumn);
            }
            for(let j=0; j<sqlArray.length; j++)
            {
                var currColumn = sqlArray[j];
                for( let i=0; i<this.tablesArray.length; i++ )
                {
                    var columns = []  = this.tablesArray[i]['COLUMN'];
                    // Changed by Samruddhi on 07-11-2023 for new schema created columns not showing selected in edit mode
                    // if( currColumn['tableName'] === this.tablesArray[i]['TABLE_NAME'] )
                    if( currColumn['tableName'] === currColumn['DBTABLE'] )
                    {
                        for(let k=0; k<columns.length; k++)
                        {
                            var col = columns[k];
                            var index = -1;
                            var dbName = currColumn.DBNAME;
                            var tblNAme = currColumn.tableName;
                            if( col.DBNAME === dbName && col.tableName === tblNAme )
                            {
                                let index = columns.findIndex( (record: any) => record.DBNAME === dbName );
                                if( index != -1 )
                                {
                                    columns[k] = currColumn;
                                }
                            }
                        }
                    }
                }
            }
	   //Added by shrutika on 27-09-21 for schema designer [Start]
            //Changed by Samruddhi for Freehandsql
            // if( !this.isSchemaDesigner )
            if( !this.isSchemaDesigner && this.listData != undefined && this.listData.baType != 'F')
            {
                this.buildConfigForCriteria();
            }
            //Added by shrutika on 27-09-21 for schema designer [Start]
        }
    }

   onClickGrpBox(index: any)
    {
        this.currentGrpIndex = index;
        let grpBoxId = "groupBox_" + (index + 1);
        let grpBoxContentId = "groupBoxContent_" + (index + 1);
        let arrayOfGrpBox = document.getElementsByClassName('groupBox');
        for(let i=0; i<arrayOfGrpBox.length; i++)
        {
            let grpBox: any = arrayOfGrpBox[i];
            let grpBoxContent: any = grpBox.nextElementSibling;
            let id = grpBox.getAttribute('id');
            if(grpBoxId == id)
            {
                // let selectedGroupBoxName = this.currentVisual.ColumnGroups[i]['GroupName'];
                //Changed by Samruddhi on 02/06/21 for when drag and drop a column all the group boxes must stay open [Start]
                if(grpBoxContent.classList.contains('showContent'))
                {
                    grpBox.lastElementChild.classList.remove('vision-ui-arrow_up');
                    grpBox.lastElementChild.classList.add('vision-ui-arrow_down');
                    grpBoxContent.classList.remove('showContent');
                    // Added by Samruddhi for selected groupbox must remain expand on visual change
                    let selectedGroupBoxName = this.currentVisual.ColumnGroups[i]['GroupName'];
                    this.groupStateMap[selectedGroupBoxName] = "closed";
                    break;
                }
                else
                {
                    grpBox.lastElementChild.classList.remove('vision-ui-arrow_down');
                    grpBox.lastElementChild.classList.add('vision-ui-arrow_up');
                    grpBoxContent.classList.add('showContent');
                    // Added by Samruddhi for selected groupbox must remain expand on visual change
                    let selectedGroupBoxName = this.currentVisual.ColumnGroups[i]['GroupName'];
                    this.groupStateMap[selectedGroupBoxName] = "opened";
                }
                //Changed by Samruddhi on 02/06/21 for when drag and drop a column all the group boxes must stay open [End]
            }
        }
    }

    validateGrpsOnNext()
    {
        if (this.currentVisual && this.editFlag != 'V')
        {
            for(let i=0; i<this.currentVisual.ColumnGroups.length; i++)
            {
                let minCol = this.currentVisual.ColumnGroups[i]['MinColumns'];
                minCol = minCol != undefined && String(minCol).length > 0 ? Number(minCol) : 0;                
                let columns = this.currentVisual.ColumnGroups[i]['COLUMNS'];
                let colGrpName = this.currentVisual.ColumnGroups[i]['GroupName'];
                let allowColType = this.currentVisual.ColumnGroups[i]['AllowedColumnTypes'];
                //Added by Samruddhi on 25/05/2021 for data validation
                let alertMsg = 'Minimum ' + minCol + ' fields required in ' + colGrpName + ' for process.'
                
                if(minCol > 0 && columns.length < minCol)
                {
                    window.alert(alertMsg);
                    return true;
                }

            }
        }
        return false;
    }

    onNextforBrowser() 
    {
        try 
        { 
            //Added by shrutika on 18-03-21 for avoid unwanted server call onNext Click.
             this.onNextOfBrowser = true;
             //Added by Samruddhi for empty column array in PurchaseAnalysis in Browser on 14-04-21 [Start]
            // Changed by Samruddhi for updated UI
            // if(this.currentSchema['baType'] != 'F' && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].length <= 0)
           // if(this.listData["baType"] != 'F' && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].length <= 0)
            // Changed by Samruddhi for Freehandsql
            if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].length <= 0 && this.isSqlView != undefined && this.isSqlView != true)
            {
                window.alert("Rows and Columns input fields cannot be empty. Please select valid Rows and Columns to preview data on the next screen.");
                return;
            }
             //Added by Samruddhi for empty column array in PurchaseAnalysis in Browser on 14-04-21 [End]

            // Changed by Samruddhi for updated UI
            // Changed by Samruddhi for Freehandsql
            // if(this.validateGrpsOnNext())
            if(this.listData != undefined && this.listData["baType"] != 'F' && this.validateGrpsOnNext())
            {
                return;
            }
			// added by nikhil on 06-09-2021 for do not execute SQL again if there is no change in SQL add if condition only[Start]
			console.log('Print this.currentVisual 2985::::::::',JSON.stringify(this.currentVisual));
            if(this.isSourceSqlChange == false)
			{
                console.log('Print this.currentVisual 2987::::::::',JSON.stringify(this.currentVisual));
                // Changed by Samruddhi to avoid multiple preview calls in edit mode for Freehandsql
                if(this.currentVisual != undefined)
                {
                    this.onNextResp.emit(this.currentVisual);   
                }
			}
			else
		    {
                let newVar : boolean= false;//aded by mayuri
				//Added by Samruddhi on 14/06/21 for when drag and drop a column and change sequence then sequence of sql also changes
	            if(this.currentVisual)
	            {
	                this.generateSQLSeq();
	            }
                //added by mayuri on 18/08/2023 check of condition start
                if(this.conditionResponse == true)
                {
                    this.finData = '';
                    console.log("print line no 2646 this.conditionValue",this.conditionValue);
                    this.createCriteria();
                    console.log("print line no 2655 this.finData",this.finData);
                        newVar = true;
                        console.log("print line no 2664 newVar",newVar);
                    console.log("print line no 2632 this.SqlModelData['CRITERIA']",this.SqlModelData['CRITERIA']);
                }
                //added by mayuri on 18/08/2023 check of condition end
	            //Change by shrutika on 22-06-21 [Start] for sql not working if in where condition date fild is present.
	            var currentData = JSON.stringify(this.SqlModelData);
	            var currentVal = {} = JSON.parse(currentData);
	            //change by shrutika on 29-07-21 [Start] for if add multiple where condition then sql not generate properly.
	            var currentValCopy = {} = JSON.parse(currentData);
		        // Changed by Samruddhi for updated UI
                if(currentValCopy['CRITERIA'] && currentValCopy['CRITERIA']['query'])
                {
                    var ruleArray = [] = currentValCopy['CRITERIA']['query']['rules'];
                    //change by shrutika on 29-07-21 [End] for if add multiple where condition then sql not generate properly.
                    for(let i = 0; i < ruleArray.length; i++)
                    {
                        var currentJson = {} = ruleArray[i];
                        //Added by shrutika on 30-07-21 for condition option not working on sql editor.
                        var copCuurentJson = {} = ruleArray[i];
                        //added by mayuri on 18/08/2023 check for condition start
                        if(newVar == true)
                        {
                            if(this.finData != '' && this.finData != undefined)
                            {
                                var ruleArrayNew = {} = currentValCopy['CRITERIA']['query']['rules'];
                                console.log("print line no 2693 ruleArrayNew",ruleArrayNew);
                                for(let j = 0; j < this.newCriteriaArray.length; j++)
                                {
                                    let finddata = currentValCopy['CRITERIA']['query']['rules'].find((data:any) => data['field'] ==  this.newCriteriaArray[j]['field']) 
                                    console.log("print line no 2697 finddata",finddata);
                                    let newfinddata = currentVal['CRITERIA']['query']['rules'].find((data:any) => data['field'] ==  this.newCriteriaArray[j]['field']);
                                    console.log("print line no 2699 newfinddata",newfinddata);
                                    if(finddata != undefined)
                                    {
                                        if(newfinddata != undefined)
                                        {
                                            currentJson = {} = this.newCriteriaArray[j]
                                            copCuurentJson = {} = this.newCriteriaArray[j]
                                            console.log("print line no 2733 currentValCopy",currentValCopy);
                                            var currentColunJson: any = {}; 
                                            var isDateField : boolean = false;
                                            for(const key of Object.keys(currentJson))
                                            {
                                                let value = currentJson[key];
                                                if(key == "COLTYPE" && value == "date" )
                                                {
                                                    isDateField = true;
                                                    if(!currentJson.hasOwnProperty('value'))
                                                    {
                                                        isDateField = false;
                                                        currentColunJson['value'] = '';
                                                    }
                                                }
                                                else if(key == "COLTYPE" && value == "string")
                                                {
                                                    if(!currentJson.hasOwnProperty('value'))
                                                    {
                                                        currentColunJson['value'] = '';
                                                    }
                        
                                                }
                                                else if(key == "COLTYPE" && value == "number")
                                                {
                                                    if(!currentJson.hasOwnProperty('value'))
                                                    {
                                                        currentColunJson['value'] = '';
                                                    }
                        
                                                }
                                                currentColunJson[key] = value;
                                            }
                                            if( isDateField )
                                            {
                                                let detailData = this.schemaDataNew['HR_Master'];
                                                var schemaDatabaseType = "1";
                                                if( detailData['DATABASE'] != null )
                                                {
                                                    schemaDatabaseType = detailData['DATABASE']['TYPE'];
                                                }
                                                if( schemaDatabaseType == "2" || (schemaDatabaseType == '4' && detailData['DATABASE']['DATABASE_NAME'] == "Dremio"))
                                                {
                                                    let latest_date =this.datePipe.transform(new Date(currentColunJson['value']), 'yyyy-MM-dd');
                                                    currentColunJson['value'] = latest_date;
                                                }
                                                else
                                                {
                                                    let latest_date =this.datePipe.transform(new Date(currentColunJson['value']), 'dd-MMM-yyyy');
                                                    currentColunJson['value'] = latest_date;
                                                    console.log("print line no 2828 currentColunJson",currentColunJson);
                                                }
                                            }
                                            currentVal['CRITERIA']['query']['rules'].splice(0, 1);
                                            currentVal['CRITERIA']['query']['rules'].push(currentColunJson);
                                        }  
                                    }
                                }
                            }
                        }    
                        //added by mayuri //added by mayuri on 18/08/2023 check for condition end
                        if(newVar == false)
                        {
                            if( currentJson['condition'] != null )
                            {
                                var childRuleArray = [] = currentJson['rules']; 
                                //Added by shrutika on 30-07-21 for condition option not working on sql editor.
                                var copyChildRulesArray: any = [] ;
                                for(let j = 0; j < childRuleArray.length; j++)
                                {
                                    var currentColunJson: any = {}; 
                                    var childRuleJson = childRuleArray[j];
                                    var isDateField : boolean = false;
                                    for(const key of Object.keys(childRuleJson))
                                    {
                                        var value = childRuleJson[key];
                                        //Added by shrutika on 30-07-21 for condition option not working on sql editor.[Start]
                                        if(key == "COLTYPE" && value == "date" )
                                        {
                                            isDateField = true;
                                            if(!childRuleJson.hasOwnProperty('value'))
                                            {
                                                isDateField = false;
                                                currentColunJson['value'] = '';
                                            }
                                        }
                                        else if(key == "COLTYPE" && value == "string")
                                        {
                                            if(!childRuleJson.hasOwnProperty('value'))
                                            {
                                                currentColunJson['value'] = '';
                                            }
                                        }
                                        else if(key == "COLTYPE" && value == "number")
                                        {
                                            if(!childRuleJson.hasOwnProperty('value'))
                                            {
                                                currentColunJson['value'] = '';
                                            }
                                        }
                                        //Added by shrutika on 30-07-21 for condition option not working on sql editor.[End]
                                        if(key == "currentFieldType" && value == "date" )
                                        {
                                        isDateField = true;
                                        }
                                        currentColunJson[key] = value;
                                    }
                                    if( isDateField )
                                    {
                                        //Change by shrutika on 05-08-21 for date field not working in where condition in case of inMemeory. start
                                        let detailData = this.schemaDataNew['HR_Master'];
                                        var schemaDatabaseType = "1";
                                        if( detailData['DATABASE'] != null )
                                        {
                                            schemaDatabaseType = detailData['DATABASE']['TYPE'];
                                        }
                                        if( schemaDatabaseType == "2" || (schemaDatabaseType == '4' && detailData['DATABASE']['DATABASE_NAME'] == "Dremio"))
                                        {
                                            let latest_date =this.datePipe.transform(new Date(currentColunJson['value']), 'yyyy-MM-dd');
                                            currentColunJson['value'] = latest_date;
                                        }
                                        else
                                        {
                                        let latest_date =this.datePipe.transform(new Date(currentColunJson['value']), 'dd-MMM-yyyy');
                                            currentColunJson['value'] = latest_date;
                                        }
                                        //Change by shrutika on 05-08-21 for date field not working in where condition in case of inMemeory. end
                                    }
                                    //Added by shrutika on 30-07-21 for condition option not working on sql editor [Start]
                                    copyChildRulesArray.push(currentColunJson);
                                    copCuurentJson['rules'] = copyChildRulesArray;
                                }
                                //Added by nikhil on 12-01-2021
                                currentVal['CRITERIA']['query']['rules'].splice(0, 1);
                                currentVal['CRITERIA']['query']['rules'].push(copCuurentJson);
                            }
                            else
                            {
                                var currentColunJson: any = {}; 
                                var isDateField : boolean = false;
                                // var key = currentJson['DBNAME'];
                                // var value = currentJson['value'];
                                // var newColumName =  key + currentJson['operator'];
            
                                //Changed by Samruddhi on 21-07-21 for if only the add rule is selected and no value provided then ahows data or application error occurs. [Start]
                                for(const key of Object.keys(currentJson))
                                {
                                    let value = currentJson[key];
                                    if(key == "COLTYPE" && value == "date" )
                                    {
                                        isDateField = true;
                                        if(!currentJson.hasOwnProperty('value'))
                                        {
                                            isDateField = false;
                                            currentColunJson['value'] = '';
                                        }
                                    }
                                    else if(key == "COLTYPE" && value == "string")
                                    {
                                        if(!currentJson.hasOwnProperty('value'))
                                        {
                                            currentColunJson['value'] = '';
                                        }
                                    }
                                    else if(key == "COLTYPE" && value == "number")
                                    {
                                        if(!currentJson.hasOwnProperty('value'))
                                        {
                                            currentColunJson['value'] = '';
                                        }
                                    }
                                    //Changed by Samruddhi on 21-07-21 for if only the add rule is selected and no value provided then ahows data or application error occurs. [End]
                                    currentColunJson[key] = value;
                                }
                                if( isDateField )
                                {
                                    //Change by shrutika on 05-08-21 for date field not working in where condition in case of inMemeory. start
                                    let detailData = this.schemaDataNew['HR_Master'];
                                    var schemaDatabaseType = "1";
                                    if( detailData['DATABASE'] != null )
                                    {
                                        schemaDatabaseType = detailData['DATABASE']['TYPE'];
                                    }
                                    if( schemaDatabaseType == "2" || (schemaDatabaseType == '4' && detailData['DATABASE']['DATABASE_NAME'] == "Dremio"))
                                    {
                                        let latest_date =this.datePipe.transform(new Date(currentColunJson['value']), 'yyyy-MM-dd');
                                        currentColunJson['value'] = latest_date;
                                    }
                                    else
                                    {
                                        let latest_date =this.datePipe.transform(new Date(currentColunJson['value']), 'dd-MMM-yyyy');
                                        currentColunJson['value'] = latest_date;
                                    }
                                    //Change by shrutika on 05-08-21 for date field not working in where condition in case of inMemeory. end
                                }
                                currentVal['CRITERIA']['query']['rules'].splice(0, 1);
                                currentVal['CRITERIA']['query']['rules'].push(currentColunJson);
                            }
                        }
                    }
		        }
                // Changed by Samruddhi for updated UI
                let sqlEditorData: any = {};
                // if(this.SqlModelData ! = undefined)
                if(this.listData != undefined && this.listData["baType"] != 'F')
                {
                    //Change by shrutika on 22-06-21 [End] for sql not working if in where condition date fild is present.
                    let paramMap: any = {};
                    paramMap['ACTION'] = "generateSQL";
                    //Change by shrutika on 22-06-21 for sql not working if in where condition date fild is present..
                    //paramMap['SQL_MODEL'] = JSON.stringify(this.SqlModelData); 
                    paramMap['SQL_MODEL'] = JSON.stringify(currentVal);
                    paramMap['SCHEMA_SQL'] = this.schemaSQLFilename; 
                    var url = this.sqlService.getHostURL() + '/ibase/PreviewHandlerServlet'; 
                    var paramString = this.sqlService.getEncodedParamString(paramMap); 
                    this.sqlService.callRequest(url, paramString).subscribe( (data: any) => 
                    {
                        // Changed by Samruddhi for updated UI
                        // let sqlEditorData = {};
                        //Change by shrutika on 02-03-21 [Start] for display error message same as other framework componant i.e system Exception
                        if (data.indexOf('Errors') != -1) 
                        {
                            this.displayError(data);
                        }
                            //Change by shrutika on 02-03-21 [End] for display error message same as other framework componant i.e system Exception
                        else
                        {
                            sqlEditorData['SourceSql'] = data;
                            sqlEditorData['SqlModel'] = this.SqlModelData;
                            //Added by Shrutika for Dashboard Definition on 15/03/21 [Start]
                            // if( this.isDashboard == 'true')
                            console.log('Print inside onNextforBrowser else sqlEditorData[cuurentVisual] 3280:::',JSON.stringify(sqlEditorData['cuurentVisual']));
                            {
                                if(this.currentVisual != undefined)
                                {
                                    sqlEditorData['cuurentVisual'] = this.currentVisual;
                                }
                                else if(this.editorVisuals)
                                {
                                    for(let i=0; i<this.editorVisuals.Visuals.length; i++)
                                    {
                                        let visual = this.editorVisuals.Visuals[i];
                                        if( visual['VisualName'] == this.defaultVisual )
                                        {
                                                sqlEditorData['cuurentVisual'] = visual;
                                                break;
                                        }
                                    }
                                }
                            }
                            //Added by Shrutika for Dashboard Definition on 15/03/21 [End]
        
                            let detailData = this.schemaDataNew['HR_Master'];
                            sqlEditorData['DATABASE_NAME'] = detailData['DATABASE_NAME'];
                            sqlEditorData['TEMPLATE'] = detailData['TEMPLATE'];
                            //Change by shrutika on 06-07-21 [Start] for From schema get database detail and according to database detail connect databse.
                            if( detailData['DATABASE'] != null )
                            {
                                sqlEditorData['DATABASE_TYPE'] = ""+detailData['DATABASE']['TYPE'];
                                sqlEditorData['DATABASE_NAME'] = detailData['DATABASE']['DATABASE_NAME'];
                                sqlEditorData['DATABASE_DETAIL'] = detailData['DATABASE'];
                            }
                            //Change by shrutika on 06-07-21 [Start] for From schema get database detail and according to database detail connect databse.
                            console.log('line no 1734.....',JSON.stringify(sqlEditorData));
                            //Added by shrutika on 25-11-21 for implement default action functionality [Start]
			                //Changes by shrutika on 29-11-21 [Start] for No data found occur when multiple time click on preview after changing only  where condition
                            sqlEditorData['isColumnChanges'] = this.isColumnChanges;
                            //Added by shrurtika on 28-11-21 for avoid default functionality in case of edit click at first time.
                            sqlEditorData['isFirstTimeEdit'] = this.isFirstTimeEdit;
                            this.onNextResponse.emit(JSON.stringify(sqlEditorData));
                        }
                    });
                }
                else
                {
                    console.log('Print inside onNextforBrowser else this.currentVisual:::',JSON.stringify(this.currentVisual));
                    console.log('Print inside onNextforBrowser else this.editorVisuals:::',JSON.stringify(this.editorVisuals));
                    sqlEditorData['SourceSql'] = this.allformValues['source_sql'];
                    sqlEditorData['SqlModel'] = this.SqlModelData;
                    if(this.listData != undefined )
                    {
                        sqlEditorData['baType'] = this.listData["baType"];
                        sqlEditorData['schema_name'] = this.listData["schemaName"];
                    }
                    // Added by Samruddhi for Freehandsql
                    sqlEditorData['defaultVisuals'] = this.defaultVisual;
                    // if( this.isDashboard == 'true')
                    {
                        if(this.currentVisual != undefined)
                        {
                            sqlEditorData['cuurentVisual'] = this.currentVisual;
                            console.log('Print inside onNextforBrowser else sqlEditorData[cuurentVisual] 3331:::',JSON.stringify(sqlEditorData['cuurentVisual']));
                        }
                        else if(this.editorVisuals)
                        {
                            for(let i=0; i<this.editorVisuals.Visuals.length; i++)
                            {
                                let visual = this.editorVisuals.Visuals[i];
                                if( visual['VisualName'] == this.defaultVisual )
                                {
                                    sqlEditorData['cuurentVisual'] = visual;
                                    console.log('Print inside onNextforBrowser else sqlEditorData[cuurentVisual]:::',JSON.stringify(sqlEditorData['cuurentVisual']));
                                    break;
                                }
                            }
                        }
                    }
                    console.log('Print inside onNextforBrowser else sqlEditorData:::',JSON.stringify(sqlEditorData));
                    console.log('Print inside onNextforBrowser else this.schemaDataNew:::',JSON.stringify(this.schemaDataNew));
                    let detailData = this.schemaDataNew['HR_Master'];
                    sqlEditorData['DATABASE_NAME'] = detailData['DATABASE_NAME'];
                    sqlEditorData['TEMPLATE'] = detailData['TEMPLATE'];
                    //Change by shrutika on 06-07-21 [Start] for From schema get database detail and according to database detail connect databse.
                    console.log('Print inside onNextforBrowser else detailData:::::',detailData);
                    if( detailData['DATABASE'] != null )
                    {
                        sqlEditorData['DATABASE_TYPE'] = ""+detailData['DATABASE']['TYPE'];
                        sqlEditorData['DATABASE_NAME'] = detailData['DATABASE']['DATABASE_NAME'];
                        sqlEditorData['DATABASE_DETAIL'] = detailData['DATABASE'];
                        console.log('Print inside onNextforBrowser else sqlEditorData 3369::::::',JSON.stringify(sqlEditorData));
                    }
                    //Change by shrutika on 06-07-21 [Start] for From schema get database detail and according to database detail connect databse.
                    console.log('Print sqlEditorData line no 3372.....',JSON.stringify(sqlEditorData));
                    //Added by shrutika on 25-11-21 for implement default action functionality
                    console.log('Print isColumnChanges::::::::',this.isColumnChanges);
                    if(this.isSourceSqlChange == true)
                    {
                        sqlEditorData['isColumnChanges'] = true;
                    }
                    else
                    {
                        sqlEditorData['isColumnChanges'] = this.isColumnChanges;
                    }
                    //Added by shrurtika on 28-11-21 for avoid default functionality in case of edit click at first time.
                    sqlEditorData['isFirstTimeEdit'] = this.isFirstTimeEdit;
                    sqlEditorData['layoutData'] = this.allformValues['layoutData'];
                    this.onNextResponse.emit(JSON.stringify(sqlEditorData));
                }
                // Changed by Samruddhi for updated UI [End]
            }
        } 
        catch (error) 
        {
            console.log('Exception inside onNextforBrowser.....',error);
        }
  }


  //Added by Samruddhi on 01/06/21 for when drag and drop a column and change sequence then sequence of sql also changes [Start]
  generateSQLSeq()
  {
    let groups = this.currentVisual.ColumnGroups;
    // Changed by Samruddhi on 22-04-2022 for visual change issue in freehand
    // this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'] = [];
    if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].length > 0)
    {
        let arrLen = this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].length;
        this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].splice(0, arrLen);
    
        for(let i = 0; i < groups.length; i++)
        {
            let group = groups[i];
            let columns = group['COLUMNS'];
            for(let j = 0; j < columns.length; j++)
            {
                let column = columns[j];
                this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].push(column);
            }
        }
    }
  }
  //Added by Samruddhi on 01/06/21 for when drag and drop a column and change sequence then sequence of sql also changes [End]

  sqlView()
    {
        try
        {
            //Added by Samruddhi on 14/06/21 for when drag and drop a column and change sequence then sequence of sql also changes
            let paramMap: any = {};
            paramMap['ACTION'] = "generateSQL";
            if(this.currentVisual)
            {
                this.generateSQLSeq();
            }
           // Change by shrutika on 22-06-21 [Start] for sql not working if in where condition date fild is present.
            var currentData = JSON.stringify(this.SqlModelData);
            let currentVal = {} = JSON.parse(currentData);
            //change by shrutika on 29-07-21 [Start] for if add multiple where condition then sql not generate properly.
            var currentValCopy = {} = JSON.parse(currentData);
            var ruleArray = [] = currentValCopy['CRITERIA']['query']['rules'];
            //change by shrutika on 29-07-21 [End] for if add multiple where condition then sql not generate properly.
            for(let i = 0; i < ruleArray.length; i++)
            {
                var currentJson = {} = ruleArray[i];
                 //Added by shrutika on 30-07-21 for condition option not working on sql editor.
                var copCuurentJson = {} = ruleArray[i];
                if( currentJson['condition'] != null )
                {
                    var childRuleArray = [] = currentJson['rules']; 
                    //Added by shrutika on 30-07-21 for condition option not working on sql editor.
                    var copyChildRulesArray: any = [] ;
                    for(let j = 0; j < childRuleArray.length; j++)
                    {
                        var currentColunJson: any = {}; 
                        var childRuleJson = childRuleArray[j];
                        var isDateField : boolean = false;
                        for(const key of Object.keys(childRuleJson))
                        {
                            var value = childRuleJson[key];
                            //Added by shrutika on 30-07-21 for condition option not working on sql editor.[Start]
                            if(key == "COLTYPE" && value == "date" )
                            {
                                isDateField = true;
                                if(!childRuleJson.hasOwnProperty('value'))
                                {
                                    isDateField = false;
                                    currentColunJson['value'] = '';
                                }
                            }
                            else if(key == "COLTYPE" && value == "string")
                            {
                                if(!childRuleJson.hasOwnProperty('value'))
                                {
                                    currentColunJson['value'] = '';
                                }
                            }
                            else if(key == "COLTYPE" && value == "number")
                            {
                                if(!childRuleJson.hasOwnProperty('value'))
                                {
                                    currentColunJson['value'] = '';
                                }
                            }
                            //Added by shrutika on 30-07-21 for condition option not working on sql editor.[End]
                            if(key == "currentFieldType" && value == "date" )
                            {
                               isDateField = true;
                            }
                            currentColunJson[key] = value;
                        }
                        if( isDateField )
                        {
                            //Change by shrutika on 05-08-21 for date field not working in where condition in case of inMemeory. start
                            let detailData = this.schemaDataNew['HR_Master'];
                            var schemaDatabaseType = "1";
                            if( detailData['DATABASE'] != null )
                            {
                                schemaDatabaseType = detailData['DATABASE']['TYPE'];
                            }
                            if( schemaDatabaseType == "2" || (schemaDatabaseType == '4' && detailData['DATABASE']['DATABASE_NAME'] == "Dremio"))
                            {
                                let latest_date =this.datePipe.transform(new Date(currentColunJson['value']), 'yyyy-MM-dd');
                                currentColunJson['value'] = latest_date;
                            }
                            else
                            {
                                let latest_date =this.datePipe.transform(new Date(currentColunJson['value']), 'dd-MMM-yyyy');
                                currentColunJson['value'] = latest_date;
                            }
                            //Change by shrutika on 05-08-21 for date field not working in where condition in case of inMemeory. end
                        }
                        //Added by shrutika on 30-07-21 for condition option not working on sql editor [Start]
                        copyChildRulesArray.push(currentColunJson);
                        copCuurentJson['rules'] = copyChildRulesArray;
                    }
                    console.log('inside genrateSQL...............1743..',copCuurentJson);
                    currentVal['CRITERIA']['query']['rules'].splice(0, 1);
                    currentVal['CRITERIA']['query']['rules'].push(copCuurentJson);
                    //Added by shrutika on 30-07-21 for condition option not working on sql editor [End]
                }
                else
                {
                    var currentColunJson: any = {}; 
                    var isDateField : boolean = false;
                    // var key = currentJson['DBNAME'];
                    // var value = currentJson['value'];
                    //Changed by Samruddhi on 21-07-21 for if only the add rule is selected and no value provided then ahows data or application error occurs. [Start]
                    for(const key of Object.keys(currentJson))
                    {
                        let value = currentJson[key];
                        if(key == "COLTYPE" && value == "date" )
                        {
                            isDateField = true;
                            if(!currentJson.hasOwnProperty('value'))
                            {
                                isDateField = false;
                                currentColunJson['value'] = '';
                            }
                        }
                        else if(key == "COLTYPE" && value == "string")
                        {
                            if(!currentJson.hasOwnProperty('value'))
                            {
                                currentColunJson['value'] = '';
                            }
                        }
                        else if(key == "COLTYPE" && value == "number")
                        {
                            if(!currentJson.hasOwnProperty('value'))
                            {
                                currentColunJson['value'] = '';
                            }

                        }
                        //Changed by Samruddhi on 21-07-21 for if only the add rule is selected and no value provided then ahows data or application error occurs. [End]
                        currentColunJson[key] = value;
                    }
                    if( isDateField )
                    {
                        //Change by shrutika on 05-08-21 for date field not working in where condition in case of inMemeory. start
                        let detailData = this.schemaDataNew['HR_Master'];
                        var schemaDatabaseType = "1";
                        if( detailData['DATABASE'] != null )
                        {
                            schemaDatabaseType = detailData['DATABASE']['TYPE'];
                        }
                        if( schemaDatabaseType == "2" || (schemaDatabaseType == '4' && detailData['DATABASE']['DATABASE_NAME'] == "Dremio"))
                        {
                            let latest_date =this.datePipe.transform(new Date(currentColunJson['value']), 'yyyy-MM-dd');
                            currentColunJson['value'] = latest_date;
                        }
                        else
                        {
                            let latest_date =this.datePipe.transform(new Date(currentColunJson['value']), 'dd-MMM-yyyy');
                            currentColunJson['value'] = latest_date;
                        }
                        //Change by shrutika on 05-08-21 for date field not working in where condition in case of inMemeory. end
                    }
                    console.log('inside genrateSQL...............1755',currentVal);
                    console.log('inside genrateSQL...............1756',currentVal['CRITERIA']['query']['rules']);
                    currentVal['CRITERIA']['query']['rules'].splice(0, 1);
                    currentVal['CRITERIA']['query']['rules'].push(currentColunJson);
                }
            }
            //Change by shrutika on 22-06-21 [End] for sql not working if in where condition date fild is present.
            
            //Change by shrutika on 22-06-21 for sql not working if in where condition date fild is present.
            //paramMap['SQL_MODEL'] = JSON.stringify(this.SqlModelData);
             paramMap['SQL_MODEL'] = JSON.stringify(currentVal);
            paramMap['SCHEMA_SQL'] = this.schemaSQLFilename;
            var url = this.sqlService.getHostURL() + '/ibase/PreviewHandlerServlet';
            var paramString = this.sqlService.getEncodedParamString(paramMap);
            this.sqlService.callRequest(url, paramString).subscribe( (data: any) =>
            {
                //Change by shrutika on 02-03-21 [Start] for display error message same as other framework componant i.e system Exception
                if (data.indexOf('Errors') != -1) 
                {
                    this.displayError(data);
                }
                //Change by shrutika on 02-03-21 [End] for display error message same as other framework componant i.e system Exception
                else
                {
                    this.sourceSQL = data;
                }
            });
            // Added by Samruddhi on 22-06-2022 for updated columnlist and sqlview buttons
            this.secondFormToggle = false;
            this.isSqlViewData = true;
        }
        catch (error)
        {
            console.log('Exception inside sqlView.....',error);
        }
    }

  openVisuals()
  {
        let originElem = document.getElementById('editorVisuals');
        let position: any;

        if (originElem) {
        // position = document.getElementById('editorVisuals').getBoundingClientRect();
        position = document.getElementById('editorVisuals')?.getBoundingClientRect();
        }
        let docPosition = document.body.getBoundingClientRect();
        var width = position.width + 129;
        // Changed by Samruddhi for visuals drop down list 
        var top = position.top + 36;
        var left = position.left - 162;
        var bottom = position.bottom;
        var right = docPosition.right - position.right;

        let positionStrategy;
        if(this.isBrowser == false)
        {
            positionStrategy = this.overlay.position()
            .global()
            .centerHorizontally()
            .top(top + "px")
        }
        // Changed by Samruddhi for visuals drop down list 
        /*else
        {
            console.log('Print inside else 2251::::::');
            positionStrategy = this.overlay.position()
            .global()
            .top(top + "px")
            .right(right + "px");
        }*/
        else
        {
            positionStrategy = this.overlay.position()
            .global()
            .top(top + "px")
            .left(left + "px");
        }
        const overlayConfig = new OverlayConfig({
        positionStrategy,
        });
        overlayConfig.hasBackdrop = true;
        overlayConfig.backdropClass = 'visualsBackDrop';
        const templatePortal = new TemplatePortal(this.visualTemplate, this.viewContainerRef);
        this.overlayRef = this.overlay.create(overlayConfig);
        this.overlayRef.backdropClick().subscribe(() => {
        this.overlayRef.dispose();
        });
        this.overlayRef.attach(templatePortal);
  }
    //Added by Samruddhi
    addGroupBox()
    {
        console.log('Print inside addGroupBox:::::::');
   	//Added by shrutika on 05-10-21 for schema designer group box 
        this.overLayFoAddGroupBox();
    }
    //Added by Samruddhi for updated UI [Start]
    schemaEditorSelector(panelIndex: any)
    {
        this.schemaEditor = Number(panelIndex);
        console.log('Print inside schemaEditorSelector 2630::::::',this.schemaEditor);
        this.isSchemaDesigner = false;
        // this.newPanelOpen = false;
        this.secondFormToggle = true;
        
        // if(this.viewModelClick == true)
        // {
        //     this.schemaEditor = 2;
        // }
        // this.freehandOpen = true;
    }

    //Added by vikas for opening viewmodel and focus of viewmodel if on another tab [Start]
    viewModel()
    {
        if(this.viewModelClick == true)
        {
            let viewmodelTag = document.getElementById('viewmod');
            if(viewmodelTag !=null)
            {
                viewmodelTag.focus();
            }
            
        }
    }
    //Added by vikas for opening viewmodel and focus of viewmodel if on another tab [Start]

    callLocalItemChange(fieldName: any,fieldValue: any,formNumber: any,detailRowNo?: any)
    {
        // added by pranjali for column heading change[start] 29-june-2023
        this.isSourceSqlChange = true;
        // added by pranjali for column heading change[End] 29-june-2023
        let allPropertyData: any = {};
        allPropertyData['fldName'] = fieldName;
        allPropertyData['fldValue']= fieldValue;
        allPropertyData['formNo'] = formNumber;
        allPropertyData['detailRowNo'] = detailRowNo;
        allPropertyData['allformValues'] = this.allformValues;
        this.localItemChange.emit(JSON.stringify(allPropertyData));
    }
    onContextMenuClick(event: any,currentElemId: any,isMoreButtonClick?: any)
    {
        let contextMenu: any = {};
        contextMenu['event'] = event;
        contextMenu['currElemIdd']= currentElemId;
        contextMenu['isMoreButtonClick'] = isMoreButtonClick;
        this.contextMenuClck.emit(JSON.stringify(contextMenu));
    }
    hideShowGroupBtn(id: any)
    {
        let hideShowGrpBtn: any = {};
        hideShowGrpBtn['id']= id;
        this.hideShowBtn.emit(JSON.stringify(hideShowGrpBtn));
    }
    onButtonClick(allformValue: any, action: any, currentRowDetail: any,formNo: any,domId: any)
    {
        let allFormData: any = {};
        allFormData['allformValues'] = allformValue;
        allFormData['action'] = action;
        allFormData['rowDetail'] = currentRowDetail;
        allFormData['formNo'] = formNo;
        allFormData['domId'] = domId;
        // Added by Samruddhi to add column from Calculation panel [Start]
        // let index = parseInt(domId);
        let index = domId;
        let calColData: any = {};
        let calColumnJson: any = {};
        if(action != 'add')
        {
            let dataTypeVal = "";
            if(this.allformValues[currentRowDetail][index]['col_datatype'] == 'S')
            {
                dataTypeVal = "string";
                calColumnJson['JAVATYPE'] = "java.lang.String";
            }
            else if(this.allformValues[currentRowDetail][index]['col_datatype'] == 'N')
            {
                dataTypeVal = "number";
                calColumnJson['JAVATYPE'] = "java.math.BigDecimal";

            }
            else if(this.allformValues[currentRowDetail][index]['col_datatype'] == 'D')
            {
                dataTypeVal = "date";
                calColumnJson['JAVATYPE'] = "java.sql.Date";
            }
            let calColType = "";
            if(this.allformValues[currentRowDetail][index]['calc_type'] == 'S')
            {
                calColType = "SQL";
            }
            else if(this.allformValues[currentRowDetail][index]['calc_type'] == 'E')
            {
                calColType = "Expression";
            }
            else if(this.allformValues[currentRowDetail][index]['calc_type'] == 'L')
            {
                calColType = "Lookup";
            }
            else if(this.allformValues[currentRowDetail][index]['calc_type'] == 'M')
            {
                calColType = "Map from Source";
            }
            else if(this.allformValues[currentRowDetail][index]['calc_type'] == 'C')
            {
                calColType = "Conditional Expression";
            }
            else if(this.allformValues[currentRowDetail][index]['calc_type'] == 'U')
            {
                calColType = "Cumulative Sum";
            }
            else if(this.allformValues[currentRowDetail][index]['calc_type'] == 'P')
            {
                calColType = "Presentation";
            }
            else if(this.allformValues[currentRowDetail][index]['calc_type'] == 'F')
            {
                calColType = "Forecast";
            }
            else if(this.allformValues[currentRowDetail][index]['calc_type'] == 'N')
            {
                calColType = "User Defined";
            }
            else if(this.allformValues[currentRowDetail][index]['calc_type'] == 'T')
            {
                calColType = "Translate";
            }
            else if(this.allformValues[currentRowDetail][index]['calc_type'] == 'O')
            {
                calColType = "Local AI Function";
            }
            else if(this.allformValues[currentRowDetail][index]['calc_type'] == 'R')
            {
                calColType = "Local_Statistical_Function";
            }
            else if(this.allformValues[currentRowDetail][index]['calc_type'] == 'D')
            {
                calColType = "Cloud AI Function";
            }
            calColumnJson['ITALIC'] = 0;
            calColumnJson['BGCOLOR'] = "";
            calColumnJson['EXPRESSIONTYPE'] = this.allformValues[currentRowDetail][index]['col_datatype'];
            calColumnJson['WIDTH'] = 100;
            calColumnJson['HIDDEN'] = "";
            calColumnJson['DBSIZE'] = "";
            calColumnJson['UNDERLINE'] = 0;
            calColumnJson['COLID'] = "";
            calColumnJson['FONT'] = "TIMES NEW ROMAN";

            let calcColName = this.allformValues[currentRowDetail][index]['col_name'];
            calColumnJson['content'] = calcColName.replaceAll('_',' ');
            calColumnJson['NAME'] = calcColName.toUpperCase();
            calColumnJson['NATIVETYPE'] = "AN";
            calColumnJson['FONTSIZE'] = 12;
            calColumnJson['FGCOLOR'] = "#000000";
            calColumnJson['ALIGNMENT'] = 1;
            calColumnJson['DBTABLE'] = "";
            calColumnJson['DBNAME'] = calcColName.toUpperCase();
            calColumnJson['BOLD'] = 0;
            calColumnJson['DEFAULTFUNCTION'] = "";
            //calColumnJson['COLTYPE'] = "python";
			//Added by nikhil on 08-06-2022 for type is not shown when column is selected with calculation panel
			calColumnJson['COLUMN_TYPE'] = "calc_column";
            calColumnJson['KEY'] = false;
            calColumnJson['CAPS'] = false;
            calColumnJson['FEILD_TYPE'] = "TEXTBOX";
            calColumnJson['value'] = "";
            calColumnJson['name'] = this.allformValues[currentRowDetail][index]['col_name'];
            calColumnJson['type'] = dataTypeVal;
            calColumnJson['descr'] = this.allformValues[currentRowDetail][index]['col_descr'];
            calColumnJson['expression'] = this.allformValues[currentRowDetail][index]['calc_expression'];
            calColumnJson['tableName'] = "";
            calColumnJson['tableDisplayName'] = "";
            calColumnJson['FUNCTION'] = "";
            calColumnJson['groupName'] = "";
            //calColumnJson['checked'] = true;
            calColumnJson['calc_seq'] = this.allformValues[currentRowDetail][index]['calc_seq'];
            calColumnJson['persist_clumn_name'] = this.allformValues[currentRowDetail][index]['persist_clumn_name'];
            calColumnJson['persist_form_no'] = this.allformValues[currentRowDetail][index]['persist_form_no'];
            calColumnJson['COLTYPE'] = "CHAR";
            if(calColumnJson['type'] == 'string')
            {
                calColumnJson['JAVATYPE'] = "java.lang.String";
                calColumnJson['FUNCTION'] = "";
                calColumnJson['EXPRESSIONTYPE'] = "C";
                calColumnJson['COLTYPE'] = "CHAR";
            }
            else if(calColumnJson['type'] == 'number')
            {
                calColumnJson['JAVATYPE'] = "java.math.BigDecimal";
                calColumnJson['FUNCTION'] = "SUM";
                calColumnJson['EXPRESSIONTYPE'] = "G";
                calColumnJson['COLTYPE'] = "NUMBER";
            }
            else if(calColumnJson['type'] == 'date string' || calColumnJson['type'] == 'date')
            {
                calColumnJson['JAVATYPE'] = "java.sql.Date";
                calColumnJson['FUNCTION'] = "";
                calColumnJson['EXPRESSIONTYPE'] = "C";
                calColumnJson['COLTYPE'] = "DATE";
                calColumnJson['PATTERN'] = "dd-MMM-yy"
            }
            if (action == 'delete' || action == 'done') {
                console.log('Print inside delete 2481:::::');
                calColumnJson['checked'] = false;
            }
            // Added by Samruddhi on 25-08-2022 for flexmonstor calculation api
            calColumnJson['CALC_TYPE'] = calColType;
            calColData['columnData'] = calColumnJson;
            // Added by Sujan on 17-01-2023 to drag and drop or select deselect for calculated columns
            this.currentCalArray.push(calColData);
            if(calColumnJson['checked'] == false)
            {
                this.getChangeData(JSON.stringify(calColData));
            }
            // if(this.allformValues[currentRowDetail][index]['calc_type'] != 'M' && this.isDashboard == 'true')
            if(this.allformValues[currentRowDetail][index]['calc_type'] != 'M')
            {
                // this.getChangeData(JSON.stringify(calColData));
            }
            if(this.overLayRefForCalColumn != undefined)
            {
                this.overLayRefForCalColumn.dispose();
            }
        }
        // Added by Samruddhi to add column from Calculation panel [End]
        
        // this.performAction.emit(JSON.stringify(allFormData));
        //Change by shrutika on 25-11-21 for toggle related issue in calculation panel and feed panel
        if( action == 'add')
        {
            this.currentAction = 'add';
            //this.panelOpenState = !this.panelOpenState;
            this.panelOpenState = true;
            this.expFlag = true;
	   //Change by shrutika on 27-11-21 for toggle related issue in calculation panel and feed panel
            var elem = document.getElementById('CalCulationContentID');
            var calculationElement: any = document.getElementById('CalculationPanelIDD');
            if( elem!= null && calculationElement != null )
            {
                elem.classList.add('showContent');
                calculationElement.lastElementChild.classList.remove('vision-ui-arrow_down');
                calculationElement.lastElementChild.classList.add('vision-ui-arrow_up');
            }
	//Change by shrutika on 27-11-21 for toggle related issue in calculation panel and feed panel
            // Added by Samruddhi to hide the plus button when new calculation panel is added
            console.log("print isFeedOpen 2352::::::",this.isFeedOpen);
            this.isFeedOpen = true;
        }
        else
        {
            this.expFlag = false;
            // Added by Samruddhi to hide the plus button when new calculation panel is added
            console.log("print isFeedOpen 2352::::::",this.isFeedOpen);
            this.isFeedOpen = false;
        }
        //Change by shrutika on 25-11-21 for toggle related issue in calculation panel and feed panel
        this.performAction.emit(JSON.stringify(allFormData));
    }
    //Added by tejas changed by vikas on 29-06-23 for showing images in functiontype dropdown [Start]
    getImgSrcCol(functionType: any)
    {
        var imgSrc = '/ibase/Insight/managevisplugin/assets/images/Expression.svg';
        if(functionType == 'Map_from_Source'){
            imgSrc = '/ibase/Insight/managevisplugin/assets/images/Map_From_Source.svg';
        }
        else if(functionType == 'Expression'){
            imgSrc = '/ibase/Insight/managevisplugin/assets/images/Expression.svg';
        }
        else if(functionType == 'Conditional_Expression'){
            imgSrc = '/ibase/Insight/managevisplugin/assets/images/ConditionalExp.svg';
        }
        if(functionType == 'SQL'){
            imgSrc = '/ibase/Insight/managevisplugin/assets/images/SQL.svg';
        }
        else if(functionType == 'Lookup'){
            imgSrc = '/ibase/Insight/managevisplugin/assets/images/LookUp.svg';
        }
        else if(functionType == 'Cumulative_Sum')
        {
            imgSrc = '/ibase/Insight/managevisplugin/assets/images/Cummulative_Sum.svg';
        }
        else if(functionType == 'Presentation')
        {
            imgSrc = '/ibase/Insight/managevisplugin/assets/images/Presentation.svg';
        }
        else if(functionType == 'Local_AI_Function')
        {
            imgSrc = '/ibase/Insight/managevisplugin/assets/images/Local_AI_Function.svg';
        }
        else if(functionType == 'Local_Statistical_Function')
        {
            imgSrc = '/ibase/Insight/managevisplugin/assets/images/Local_Statistical_Function.svg';
        }
        else if(functionType == 'Cloud_AI_Function')
        {
            imgSrc = '/ibase/Insight/managevisplugin/assets/images/Cloud_AI_Function.svg';
        }
        // else
        // {
        //     imgSrc = '';
        // }
        return imgSrc;
    }
    //Added by tejas changed by vikas on 29-06-23 for showing images in functiontype dropdown [End]
    
    setIsFeed(isFeed: boolean, index: any)
    {
        // console.log('Print inside setIsFeed:::::::');
        let setFeed: any = {};
        setFeed['isFeed'] = isFeed;
        setFeed['index'] = index;
        this.setFeedData.emit(JSON.stringify(setFeed));
    }
    // Changed by Samruddhi for updated Calculation panel UI
    // setCuurenValidationId( formNo: any, index: any )
    setCuurenValidationId(event: any)
    {
        let currentVaData = JSON.parse(event);
        let setcurrentValId: any = {};
        setcurrentValId['formNo'] = currentVaData['formNo'];
        setcurrentValId['index'] = currentVaData['index'];
        this.currentValId.emit(JSON.stringify(setcurrentValId));
    }
    setIsFormChange(value: any)
    {
        let curFormChange = JSON.parse(value);
        let setFormChange: any = {};
        setFormChange['value'] = curFormChange['value'];
        this.isFormChange.emit(JSON.stringify(setFormChange));
    }
    changeColumnDescr(detail: any)
    {
        let currentColDescr = JSON.parse(detail);
        let changeColDescr: any = {};
        changeColDescr['detail'] = currentColDescr['detail'];
        this.columnDescr.emit(changeColDescr);
    }

    // colExpressOnKeyUp(value: any, i: any)
    colExpressOnKeyUp(event: any)
    {
        let currentColExpData = JSON.parse(event);
        let colExprOnKeyUp: any = {};
        colExprOnKeyUp['value'] = currentColExpData['value'];
        colExprOnKeyUp['index'] = currentColExpData['index'];
        this.expressOnKeyUp.emit(JSON.stringify(colExprOnKeyUp));
    }
    // onChangeCalcExpr(event: any, ind: any)
    onChangeCalcExpr(event: any)
    {
        let curChangeColExp = JSON.parse(event);
        let changeCalExpr: any = {};
        changeCalExpr['event'] = curChangeColExp['event'];
        changeCalExpr['index'] = curChangeColExp['index'];
        this.onChangeCalExp.emit(JSON.stringify(changeCalExpr));
    }
    //Added by Samruddhi for updated UI [End]

    //Added by shrutika on 02-03-21 [Start] for display error message same as other framework componant i.e system Exception
    displayError(response: any)
    {
        var errorDom = new Document();
        var parser = new DOMParser();
        errorDom = parser.parseFromString(response, "text/xml");
        var errorType;
        var errorId;
        var msg: any = "";
        var descr: any = "";
        var trace: any = "";
        var errorColName;
        var errorLen = errorDom.getElementsByTagName("error").length;
        for (var i = 0; i < errorLen; i++)
        {
            if (errorDom.getElementsByTagName("error")[i] != null) 
            {
                errorColName = errorDom.getElementsByTagName("error")[i].getAttribute("column_name");
                errorType = errorDom.getElementsByTagName("error")[i].getAttribute("type");
                errorId = errorDom.getElementsByTagName("error")[i].getAttribute("id");
            }

            if (errorDom.getElementsByTagName("message")[i] != null && errorDom.getElementsByTagName("message")[i].childNodes[0] != null) 
            {
                msg = errorDom.getElementsByTagName("message")[i].childNodes[0].nodeValue;
            }
            
            if (errorDom.getElementsByTagName("description")[i] != null && errorDom.getElementsByTagName("description")[i].childNodes[0] != null) 
            {
                descr = errorDom.getElementsByTagName("description")[i].childNodes[0].nodeValue;
            }
            
            if (errorDom.getElementsByTagName("trace")[i] != null && errorDom.getElementsByTagName("trace")[i].childNodes[0] != null) 
            {
                trace = errorDom.getElementsByTagName("trace")[i].childNodes[0].nodeValue;
            }

            var formNo = "";
            var errorMessage = msg + "<br><br>" + descr;

            if (errorType == 'E' || errorType == 'X' || errorType == 'P') 
            {
                window.alert(errorMessage);
            }
            break;
            

        }
    }  
    //Added by shrutika on 02-03-21 [End] for display error message same as other framework componant i.e system Exception

  ngOnChanges(changes: SimpleChanges)
  {
    // console.log('inside ngOnChanges...........2448',this.isColumnChanges);
    // Added by Samruddhi for selected groupbox must remain expand on visual change
    this.groupStateMap[this.defaultGrpName] = "opened";
    console.log('Print groupStateMap 2804:::::',this.groupStateMap);
    //Added by nikhil on 17-01-2022 for calculation panel in manage visual.
    //this.isColumnChanges = false;
      for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) 
      {
        console.log('inside ngOnChanges...........2821',propName);
        switch (propName) {
          case 'SqlModelData': {
            //Change by shrutika on 18-03-21 for avoid unwanted server call onNext Click.
            if(this.editFlag != 'A' && !this.onNextOfBrowser)
            {
                var currentSchemalist: any = [];
                if(this.SqlModelData != undefined)
                {
                    if( this.SqlModelData != undefined && (this.editFlag == "E" || this.editFlag == "V" ))
                    {
                       
                       // this.transDB = this.externaltransDB;
                        console.log('Print line no 3232:::::::',this.ConnName);
                        this.transDB = this.ConnName;
                         console.log('Print inside sqleditor ngOnChanges 3227::::',this.allformValues);
                        console.log('Print inside ngonchanges externaltransDB line no 3275::::::',this.externaltransDB);
                        console.log('Print inside ngonchanges transDB line no 3276::::::',this.transDB);
                    
                        // Changed by Samruddhi for updated UI
                        if( this.SqlModelData['VISUAL_NAME'] != undefined || this.SqlModelData['SCHEMA_NAME'] != undefined )
                        {
                            if(this.schemaList != undefined)
                            {
                                let editSchema:boolean = false;//added by mayuri 22-dec-2023
                                for(let i=0; i<this.schemaList.length; i++)
                                {
                                    let schema = this.schemaList[i];
                                    if(schema['schemaName'] == this.SqlModelData['SCHEMA_NAME'])
                                    {
                                        editSchema = true;//added by mayuri 22-dec-2023 
                                        currentSchemalist.push(schema);
                                        //Shrutika changes 05-02-21
                                        this.defaultVisual = this.SqlModelData['VISUAL_NAME'];
                                    }
                                }
                                //added by mayuri for If schema name is not exist in schema list then visual is not able to edit on 22-dec-2023 start
                                if(editSchema == false)
                                {
                                    let schema = {};
                                    schema['schemaDescr'] = this.SqlModelData['SCHEMA_DESCR'];
                                    schema['schemaName'] =this.SqlModelData['SCHEMA_NAME'];
                                    schema['schemaTitle'] =this.SqlModelData['SCHEMA_NAME'];
                                    schema['baType'] =this.SqlModelData['SCHEMA_TYPE'];
                                    this.schemaName = schema['schemaName']
                                    this.currentSchema = schema;
                                    console.log("print line no 3793 this.currentSchema",this.currentSchema);
                                    currentSchemalist.push(schema);
                                }
                                //added by mayuri for If schema name is not exist in schema list then visual is not able to edit 22-dec-2023 on 22-dec-2023 end
                                this.schemaList = currentSchemalist;
                            }
                            if(this.allformValues != undefined && this.allformValues['Detail2'] != undefined)
                            {
                                for(let i=0; i < this.allformValues['Detail2'].length; i++)
                                {
                                    this.allformValues['Detail2'][i]['checked'] = true;
                                }
                            }
                        }
                    }
                    if(this.schemaList != undefined)
                    {
                        this.schemaName = this.schemaList[0].schemaName;
                        this.schemaDescr = this.schemaList[0].schemaDescr;
                        this.currSchemaType = this.schemaList[0].baType;
                        // Changed by Samruddhi for Freehandsql
                        if(this.schemaList[0] != undefined)
                        {
                            this.onChangeOfSchema(JSON.stringify(this.schemaList[0]));
                        }
                        // Changed by Samruddhi for updated UI
                        /*if(this.listData["baType"] != 'F')
                        {*/
                        this.getEditorVisuals();
                    }
                    // }
                }
            }
            //Added by Samruddhi for dashboard definition in Mobile [Start]
            break;
          }
             case 'compData': {
              this.objName = this.compData['OBJ_NAME'];
              break;
            //Added by Samruddhi for dashboard definition in Mobile [End]
          }
	 //Added by shrutika on 27-09-21 for schema designer [Start]
          case 'tablesArray':
              {
                  console.log('inside tbalesArray case,',this.isSchemaDesigner);
                  if( this.isSchemaDesigner )
                  {
                    console.log('Print inside ngonchanges transDB line no 3276::::::',this.transDB);
                    console.log('Print inside ngonchanges this.SqlModelData line no 3277::::::',this.SqlModelData);
                    console.log('Print inside ngonchanges this.tablesArray line no 3283::::::',this.tablesArray);
                    console.log('Print line no 3296:::::::',this.ConnName);
	   	             //Added by shrutika on 05-10-21 for schema designer group box start
                      if( this.editorVisuals != undefined && this.editorVisuals['Visuals'] != undefined)
                      {
                          this.defaultVisual = 'VisualName1';
			//Added by shrutika on 12-10-21 for select deselect functionality for schema designer.
                          if( this.currentVisual == undefined )
                          {
                            this.currentVisual = this.editorVisuals.Visuals[0];
                            // this.transDB = this.externaltransDB;
                          }
                      }
                      else
                      {
                         this.buildEditiorVisualForSchema();
                      }
                      this.buildSchemaTablesArray();
                      //Added by shrutika on 05-10-21 for schema designer group box  end
                      this.applySqlDataOnTablesArray();
                      //Added by shrutika on 12-10-21 for select deselect functionality for schema designer.
                      if( this.currentVisual == undefined )
                      {
                          this.currentVisualForSchemaDesigner();
                      }
                      //this.currentVisaulForSchemaDesigner();
                  }
                  break;
              }
          case 'databaseName':{
                if( this.databaseName == "O")
                {
                    this.databaseName = "OLTP";
                }
                else if( this.databaseName == "I")
                {
                    this.databaseName = "InMemeory"
                }
                 //Added by vikas for external data source [Start]
                 else if( this.databaseName ==  "E")
                 {
                     this.databaseName = "External Data Source";
                 }
                 //Added by vikas for external data source [end]
                if( this.tabWithListClassData['tabDetails'] != undefined )
                {
                    for(var i= 0; i<this.tabWithListClassData['tabDetails'].length; i++ )
                    {
                        if( this.tabWithListClassData['tabDetails'][i]['name']  == this.databaseName )
                        {
                            this.tabWithListClassData['tabDetails'][i]['checked'] = true;
                            break;
                        }
                    }
                }
                break;
            }
          	//Added by shrutika on 27-09-21 for schema designer [End]
			//Changed by nikhil on 29-10-2021 for maximize and minimize sidepanel [Start]
			case 'panelIndexValue':
			{
				if(!this.isSchemaDesigner)
				{
                    console.log('Print panelIndexValue 2928:::::',this.panelIndexValue);
					this.schemaEditorSelector(this.panelIndexValue);
				}
				
				break;	
			}
			//Changed by nikhil on 29-10-2021 for maximize and minimize sidepanel [End]

            // Added by Samruddhi for Freehandsql
            case 'finalSqlModelTblArr':
            {
                if(!this.isSchemaDesigner)
				{
                    // if(this.listData['baType'] != undefined && this.listData['baType'] == 'F' && this.SqlModelData['VISUAL_NAME'] != undefined && this.SqlModelData['VISUAL_NAME'] != 'Grid' && (this.editFlag == "E" || this.editFlag == "V" ))
                    // Changed by Samruddhi on 25-04-2022 to display column list in edit mode for grid visual
                    // if(this.listData != undefined && this.listData['baType'] != undefined && this.listData['baType'] == 'F' && this.SqlModelData['VISUAL_NAME'] != undefined && this.SqlModelData['VISUAL_NAME'] != 'Grid')
                    if(this.listData != undefined && this.listData['baType'] != undefined && this.listData['baType'] == 'F' && this.finalSqlModelTblArr.length > 0)
                    {
                        this.finalTableArray = this.finalSqlModelTblArr;
                        this.isSqlView = false;
                        this.freehandSelect = true;
                        // Added by Samruddhi on 22-06-2022 for updated columnlist and sqlview buttons
                        this.isSqlViewData = false;
                        this.itemTemplate = 'Column';
                        this.schemaEditor = 1;
                        console.log('Print schemaEditor 2949::::::',this.schemaEditor);
                        this.schemaEditorSelector(1);
                        this.isSqlViewValue.emit(this.isSqlView);
                    }
                }
                break;
            }
        }
      }
    }
    // Added by Samruddhi for visual name in preview panel
    // Changed by Samruddhi for exception in console for currentVisual
    /*if(this.currentVisual != undefined)
    {
        this.currentVisualData.emit(JSON.stringify(this.currentVisual));
    }*/
   
        // Added by Kaustubh Nandankar
        console.log('Inside ngOnInit....line number 488...', this.bbQueryBuilder)
        // Ends here
  }

  onLongPress(){
    this.isLongPressed = false;
}

    //Change by shrutika on 06-07-21 [Start] for From schema get database detail and according to database detail connect databse.
    // Changed by Samruddhi for updated UI
    getDatabseDetail(callBack: any)
    {
        let detailData = this.schemaDataNew['HR_Master'];
        var schemaDatabaseType = "1";
        if( detailData['DATABASE'] != null )
        {
            schemaDatabaseType = detailData['DATABASE']['TYPE'];
        }
        let paramData: any = {};
        paramData["ACTION"] = "GET_DATABASE_DETAILS";
        paramData["DATABASE_TYPE"] = schemaDatabaseType;
        // paramData["DATABASE_DETAIL"] = detailData['DATABASE'];
        paramData["DATABASE_DETAIL"] = JSON.stringify(detailData['DATABASE']);
        var url = this.sqlService.getHostURL() + '/ibase/PreviewHandlerServlet';
        var paramString = this.sqlService.getEncodedParamString(paramData);
        this.sqlService.callRequest(url, paramString).subscribe( (data: any) => {
            console.log('print data 4323:::::',data);
        });
        // Added by Samruddhi for updated UI
        callBack(true);
    }
    //Change by shrutika on 06-07-21 [End] for From schema get database detail and according to database detail connect databse.

    // Added by Mahesh Saggam on 07-SEP-21 [to show all the visuals based on display order] Start
    getVisualSorted(prop: any)
    {
        return (a: any, b: any) => {
            if (parseInt(a[prop]) > parseInt(b[prop])) {    
            return 1;    
            } else if (parseInt(a[prop]) < parseInt(b[prop])) {    
                return -1;    
            }    
            return 0;
        }
    }
    // Added by Mahesh Saggam on 07-SEP-21 [to show all the visuals based on display order] End

    //Added by shrutika on 27-09-21 for schema designer [Start]
    openPopup()
    {
        if(this.currenSelectedTab != undefined || this.editFlag != "A")
        {
            if( this.currenSelectedTab == undefined )
            {
                if( this.tabWithListClassData['tabDetails'] != undefined )
                {
                    for(var i= 0; i<this.tabWithListClassData['tabDetails'].length; i++ )
                    {
                        if( this.tabWithListClassData['tabDetails'][i]['checked']  == true )
                        {
                            this.currenSelectedTab = this.tabWithListClassData['tabDetails'][i];
                            this.currentSelectedDataBaseName = this.currenSelectedTab['name'];
                            break;
                        }
                    }
                }

            }
            this.onSelectTable();
        }
        else
        {
            this.overLayForListTab();
        }
    }
    
    getTablesData(tableData: any)
    {
        tableData = JSON.parse(tableData);
        this.overLayRefFoListWithTab.dispose();    
        this.setSelectedTableNameArray.emit(tableData['selectedTableArray']);
        if( tableData['tablesArray'] instanceof Array )
        {
            if( this.tablesArray == undefined )
            {
                this.tablesArray = tableData['tablesArray'];
            }
            else
            {
                for(var i=0;i<tableData['tablesArray'].length;i++ )
                {
                    this.tablesArray.push(tableData['tablesArray'][i]);
                }
            }
        }
		//Added by nikhil on 04-10-2021 for join side panel [Start]
	//Added by shrutika on 12-10-21 for select deselect functionality for schema designer.
        this.currentDelectedTables =  tableData['currentDeselectedData'];
        for(var i=0; i<this.currentDelectedTables.length; i++)
        {
            if( this.oldSlectedTableDataArray.includes(this.currentDelectedTables[i]) )
            {
                var index = this.oldSlectedTableDataArray.indexOf(this.currentDelectedTables[i]);
                if (index > -1) {
                    this.oldSlectedTableDataArray.splice(index, 1);
                }
            }
            
            this.tablesArray = this.tablesArray.filter((el) => {
                return el['TABLE_NAME'] !== this.currentDelectedTables[i];
              }); 
        }
        if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel'][this.param1] != undefined)
        {
            let sqlModelColumArray = this.SqlModelData['SQLModel'][this.param1][0]['COLUMN'];
            for( var i=0;i<sqlModelColumArray.length; i++)
            {
                var currentCol: any = {} = sqlModelColumArray[i];
                if( this.currentDelectedTables.includes(currentCol['tableName']))
                {
                    currentCol['checked'] = false;
                    let dataToEmit: any = {};
                    dataToEmit['columnData'] = currentCol;
                    this.getChangeData(JSON.stringify(dataToEmit));
                }
            }
        }
      //Added by shrutika on 12-10-21 for select deselect functionality for schema designer.
      tableData['tablesArray'] = this.tablesArray;
      this.setCurrentSelectedTab.emit(JSON.stringify(tableData))
        //this.setCurrentSelectedTab.emit(JSON.stringify(tableData['currenSelectedTab']))
    }
    overLayForListTab() 
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
        if( this.editFlag != "A" || this.currenSelectedTab != undefined)
        {
            console.log('inside overLayForListTab.....2346');
              const templatePortal = new TemplatePortal(this.listWithTab, this.viewContainerRef);
              this.overLayRefFoListWithTab = this.overlay.create(overlayConfig);
              this.overLayRefFoListWithTab.attach(templatePortal);
             
        }
        else
        {
            console.log('inside overLayForListTab.....2356');
            const templatePortal = new TemplatePortal(this.databaseLsit, this.viewContainerRef);
            this.overLayRefFoListWithTab = this.overlay.create(overlayConfig);
            this.overLayRefFoListWithTab.attach(templatePortal);
            
        }
       
    }
    popupClose(event: any)
    {
        this.overLayRefFoListWithTab.dispose();        
    }
    popupDone(tableData: any)
    {
        if(this.overLayRefFoListWithTab  != undefined)
        {
            this.overLayRefFoListWithTab.dispose();
        }
        var allData = JSON.parse(tableData);
        this.currenSelectedTab = allData['currenSelectedTab'];
        this.currentSelectedDataBaseName = this.currenSelectedTab['name'];
        if(this.SqlModelData != undefined)
        {
            this.SqlModelData['currentDataBaseName'] = this.currentSelectedDataBaseName;
        }
        this.likeValue = allData['likeValue'];
        //Added by shrutika on 07-10-21 for display transDB
	    this.getUserInfo(this.currenSelectedTab['name']);
        if( allData['isSelectTable'] )
        {
            this.onSelectTable();
        }
    }

    saveClick()
    {
        var saveData: any = {};
        // Added by Samruddhi to show a alert before saving transactions without columns
        if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].length <= 0)
        {
            window.alert("Folders cannot be empty. Please add Column in the Folder before saving the transaction.");
            return;
        }
        else if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].length > 0)
        {
            saveData['sqlModel'] = this.SqlModelData;
               //Added by shrutika on 05-10-21 for schema designer group box 
            saveData['editorVisuals'] = this.editorVisuals;
            saveData['defaultGrpName'] = this.defaultGrpName;
            this.onSaveClick.emit(JSON.stringify(saveData));
            console.log('inside save click....2334');
        }
    }


    currentVisualForSchemaDesigner()
    {
        try {
            if(this.editorVisuals){
                for(let i=0; i<this.editorVisuals.Visuals.length; i++)
                {
                    let visual = this.editorVisuals.Visuals[i];
                    for(let j=0; j<visual.ColumnGroups.length; j++)
                    {
                        let columnsArray: any = [];
                        visual.ColumnGroups[j]['COLUMNS'] = columnsArray;
                    }
                }
            }
            this.editorVisualsCopy = JSON.stringify(this.editorVisuals);
            if( this.editFlag == "E" || this.editFlag == "V" )
            {
                this.applySqlModelData();
                var sqlEditorData: any = {};
                if( this.isDashboard == 'true')
                {
                    if(this.editorVisuals)
                    {
                        for(let i=0; i<this.editorVisuals.Visuals.length; i++)
                        {
                            let visual = this.editorVisuals.Visuals[i];
                            if( visual['VisualName'] == this.defaultVisual )
                            {
                                sqlEditorData['cuurentVisual'] = visual;
                                this.cuurentVisualResp.emit(JSON.stringify(sqlEditorData));
                                break;
                            }
                        }
                    }
                }
            }
        } 
        catch (error) {
            console.log('Exception inside getEditorVisuals',error);
            this.editorVisuals = undefined;
            this.currentVisual = undefined;
            this.defaultVisual = "";
            this.SqlModelData['VISUAL_NAME'] = this.defaultVisual;
        }
    }
 
    buildEditiorVisualForSchema()
    {
        if( this.isSchemaDesigner && this.editFlag == 'A' )
        {
            this.editorVisuals = {
                "Visuals": [
                    {
                        "ID": "ID1",
                        "VisualName": "VisualName1",
                        "VisualType": "Standard/UserDefined",
                        "DisplayOrder": "DisplayOrder",
                        "VisualIcon": "Incentive.svg",
                        "ColumnGroups": [
                            {
                                "GroupID": 1,
                                "GroupName": "Folder1",
                                "GroupDescription": "GroupDescription1",
                                "GroupIcon": "Incentive.svg",
                                "AllowedColumnTypes": "ANY",
                                "MinColumns": 1,
                                "MaxColumns": 10,
                                "StandardName": "Folder1"
                            },
                        ]
                    }
                ]
            };

            this.defaultVisual = 'VisualName1';
            let visual = this.editorVisuals.Visuals[0];
            this.currentVisual = visual;
            
            if( this.SqlModelData != undefined )
            {
                this.SqlModelData['VISUAL_NAME'] = this.defaultVisual;
            }
            this.defaultGrpName = this.currentVisual.ColumnGroups[0]['GroupName'];

            if(this.editorVisuals){
                for(let i=0; i<this.editorVisuals.Visuals.length; i++)
                {
                    let visual = this.editorVisuals.Visuals[i];
                    for(let j=0; j<visual.ColumnGroups.length; j++)
                    {
                        let columnsArray: any = [];
                        visual.ColumnGroups[j]['COLUMNS'] = columnsArray;
                    }
                }
            }
        }
    }
//Added by shrutika on 27-09-21 for schema designer [End]
  //Added by vikas for getting current db and connection name in external data source [Start]
    oncurrentSelectedDb(event)
    {
      this.currentSelectedDb = event;
      this.currentSelectedTabDb = this.currentSelectedDb;
      let schemaData:any = JSON.parse(this.currentSelectedDb);
      let connJson:any = {};
      connJson['CONN_NAME'] = schemaData['CONN_NAME'];
       this.externaltransDB = schemaData['CONN_NAME'];
    //  this.transDB = schemaData['CONN_NAME'];
        this.SqlModelData['transDB'] = schemaData['CONN_NAME'];
       // this.transDB = this.externaltransDB;
      this.isDataSrcRef.emit(JSON.stringify(connJson));
      this.connFeedImage = schemaData['imgPath'];
     // console.log('Print  externaltransDB:::.....3676',this.externaltransDB);
     console.log('Print inside sqlModelData line no 3714 in sql:::::::',this.SqlModelData);
      console.log('Print inside oncurrentSelectedDb externaltransDB:::::::',this.transDB);
      console.log('Print currentSelected Db line no 3661 in sql::::::',JSON.parse(this.currentSelectedDb));
    }
    //Added by vikas for getting current db and connection name in external data source [End]
    //CHanged by vikas for external data source feed and select table functionality [Start]
    onSelectTable()
    {
      let paramMap: any = {};
    //   paramMap["databaseName"] = this.currenSelectedTab['name'];
      if(paramMap["tableName"] == undefined)
      {
          paramMap["tableName"] = ""
      }
      else
      {
          paramMap["tableName"] = this.likeValue;
      }

        paramMap["maxCount"] = "500";
        console.log('paramMap line no 243:::::',paramMap);
        console.log("print inside currenSelectedTab 3696:::::",this.currenSelectedTab);
        if(this.currenSelectedTab['name'] == 'External Data Source')
        {   
            paramMap["databaseName"] = "E"
            paramMap["dbDetails"] = this.currentSelectedDb; 
            var url = this.sqlService.getHostURL() + '/ibase/rest/Databasecatlog/getTables';
            console.log("Print currentSelecteddb line no 3702 in sql::::::",this.currentSelectedDb);
            console.log("Print paramMap line no 3662 in sql::::::",paramMap);
            this.externaltransDB = this.currentSelectedDb['CONN_NAME'];
            let schemaData = JSON.parse(this.currentSelectedDb);
            //this.transDB = schemaData['CONN_NAME'];
            this.externaltransDB = schemaData['CONN_NAME'];
            this.SqlModelData['transDB'] = this.externaltransDB
             
           // this.transDB = this.SqlModelData['transDB'];
            console.log('Print inside oncurrentSelectedDb externaltransDb line no 3748 in sql:::::::',this.transDB);
            console.log('Print inside sqlModelData line no 3749 in sql:::::::',this.SqlModelData);
            console.log('Print schemaData line no 3745::::::',schemaData);
        }
        else
        {
            paramMap["dbDetails"] = ""
            paramMap["databaseName"] = this.currenSelectedTab['name'];
            var url = this.sqlService.getHostURL() + '/ibase/rest/Databasecatlog/tables';
            console.log("Print currentSelecteddb line no 3670 in sql::::::",this.currenSelectedTab);
            console.log("Print paramMap line no 3671 in sql::::::",paramMap);
        }
      console.log('paramMap line no 252:::::',paramMap);
      this.currentDbDetails  = this.currentSelectedDb
     // var url = this.sqlService.getHostURL() + '/ibase/rest/Databasecatlog/tables';
      var paramString = this.sqlService.getEncodedParamString(paramMap);
      this.sqlService.setLoading(true);
      this.sqlService.callRequest(url, paramString).subscribe( (data: any) =>
      {
          try 
          {
              this.sqlService.setLoading(false);
          //Added by shrutika on 18-10-21 for display error [Start]
              if (data.indexOf('Errors') != -1) 
              {
                  this.displayError(data);
                  return;
              }
          //Added by shrutika on 18-10-21 for display error [End]
              console.log("response in sql  LINE NO 3690:::",data);
              var responseData = JSON.parse(data);
              console.log("datA LINE NO 3692:::",responseData);
              if ( responseData['Root']['TABLEDETAILS'] instanceof Array) 
              {
                  this.tableDetailArray = [];
                  this.tableDetailArray = responseData['Root']['TABLEDETAILS'];
              }
              else
              {
                  this.tableDetailArray = [];
                  this.tableDetailArray.push(responseData['Root']['TABLEDETAILS']);
              }            
              var firstListTableNames: any = [];
              if(this.oldSlectedTableDataArray.includes(','))
              {
                  this.oldSlectedTableDataArray = this.oldSlectedTableDataArray.split(',');
              }
              this.tableDetailArray.forEach((item: any) => {
                  firstListTableNames.push(item['TABLE_NAME'].trim());
                     //Added by shrutika on 13-10-21 for if deselect old tables then it remove from treee view,columns
                  // if( this.oldSlectedTableDataArray.includes(item['TABLE_NAME'] ) && !this.currentDelectedTables.includes(item['TABLE_NAME']) )
                  if(Array.isArray(this.oldSlectedTableDataArray) && this.oldSlectedTableDataArray.length > 0)
                  {
                      for(let i = 0; i < this.oldSlectedTableDataArray.length; i++)
                      {
                          if(this.oldSlectedTableDataArray[i] == item['TABLE_NAME'] && !this.currentDelectedTables.includes(item['TABLE_NAME']) )
                          {
                              item['checked'] = true;
                          }
                      }
                  }
                  else
                  {
                      if(this.oldSlectedTableDataArray == item['TABLE_NAME'] && !this.currentDelectedTables.includes(item['TABLE_NAME']) ) 
                      {
                          item['checked'] = true;
                      }
                  }
              });
              for(var i=0;i< this.oldSlectedTableDataArray.length; i++ )
              {
                  if(firstListTableNames != undefined && !firstListTableNames.toString().includes(this.oldSlectedTableDataArray[i].trim()))
                  {
                      var currentTableJson: any = {};
                      currentTableJson['TABLE_NAME'] = this.oldSlectedTableDataArray[i];
                      currentTableJson['checked'] = true;
                      this.tableDetailArray.push(currentTableJson);
                  }
              }
              this.sqlService.setLoading(false);
              this.selectTableData = [];
              this.selectTableData['popupName'] = "Add Table";
              this.selectTableData['popupDescription'] = "Select the tables to be added";
              this.selectTableData['currenSelectedTab'] = this.currenSelectedTab;
              this.overLayForListTab();
          }
          catch(error)
          {
              console.log('Exception inside onSelectTable',error);
          }
      });
    }  
//CHanged by vikas for external data source feed and select table functionality [end]

// onSelectTable()
// {
    
//     let paramMap: any = {};
//     paramMap["databaseName"] = this.currenSelectedTab['name'];
//     paramMap["tableName"] = this.likeValue;
//     paramMap["maxCount"] = "500";
//     var url = this.sqlService.getHostURL() + '/ibase/rest/Databasecatlog/tables';
//     var paramString = this.sqlService.getEncodedParamString(paramMap);
//     this.sqlService.setLoading(true);
//     this.sqlService.callRequest(url, paramString).subscribe( (data: any) =>
//     {
//         try 
//         {
//             this.sqlService.setLoading(false);
// 	    //Added by shrutika on 18-10-21 for display error [Start]
//             if (data.indexOf('Errors') != -1) 
//             {
//                 this.displayError(data);
//                 return;
//             }
// 	    //Added by shrutika on 18-10-21 for display error [End]
//             var responseData = JSON.parse(data);
//             if ( responseData['Root']['TABLEDETAILS'] instanceof Array) 
//             {
//                 this.tableDetailArray = [];
//                 this.tableDetailArray = responseData['Root']['TABLEDETAILS'];
//             }
//             else
//             {
//                 this.tableDetailArray = [];
//                 this.tableDetailArray.push(responseData['Root']['TABLEDETAILS']);
//             }            
//             var firstListTableNames: any = [];
//             if(this.oldSlectedTableDataArray.includes(','))
//             {
//                 this.oldSlectedTableDataArray = this.oldSlectedTableDataArray.split(',');
//             }
//             this.tableDetailArray.forEach((item: any) => {
//                 firstListTableNames.push(item['TABLE_NAME'].trim());
//                	//Added by shrutika on 13-10-21 for if deselect old tables then it remove from treee view,columns
//                 // if( this.oldSlectedTableDataArray.includes(item['TABLE_NAME'] ) && !this.currentDelectedTables.includes(item['TABLE_NAME']) )
//                 if(Array.isArray(this.oldSlectedTableDataArray) && this.oldSlectedTableDataArray.length > 0)
//                 {
//                     for(let i = 0; i < this.oldSlectedTableDataArray.length; i++)
//                     {
//                         if(this.oldSlectedTableDataArray[i] == item['TABLE_NAME'] && !this.currentDelectedTables.includes(item['TABLE_NAME']) )
//                         {
//                             item['checked'] = true;
//                         }
//                     }
//                 }
//                 else
//                 {
//                     if(this.oldSlectedTableDataArray == item['TABLE_NAME'] && !this.currentDelectedTables.includes(item['TABLE_NAME']) ) 
//                     {
//                         item['checked'] = true;
//                     }
//                 }
//             });
//             for(var i=0;i< this.oldSlectedTableDataArray.length; i++ )
//             {
//                 if(firstListTableNames != undefined && !firstListTableNames.toString().includes(this.oldSlectedTableDataArray[i].trim()))
//                 {
//                     var currentTableJson: any = {};
//                     currentTableJson['TABLE_NAME'] = this.oldSlectedTableDataArray[i];
//                     currentTableJson['checked'] = true;
//                     this.tableDetailArray.push(currentTableJson);
//                 }
//             }
//             this.sqlService.setLoading(false);
//             this.selectTableData = [];
//             this.selectTableData['popupName'] = "Add Table";
//             this.selectTableData['popupDescription'] = "Select the tables to be added";
//             this.selectTableData['currenSelectedTab'] = this.currenSelectedTab;
//             this.overLayForListTab();
//         }
//         catch(error)
//         {
//             console.log('Exception inside onSelectTable',error);
//         }
//     });
// }  

overLayForListTabFromEnterClick(data: any)
{
    data = JSON.parse(data);
    this.selectTableData = data['selectTableData'];
    this.tableDetailArray = data['tableDetailArray'];
    //Added by shrutika on 12-10-21 for select deselect functionality for schema designer.
    if ( this.tablesArray instanceof Array )
    {
        for( var i=0;i<this.tablesArray.length; i++)
        {
            this.oldSlectedTableDataArray.push(this.tablesArray[i]['TABLE_NAME']);
        }
    }
    this.tableDetailArray.forEach((item: any) => {
        if( item['checked'] == true )
        {
            if( !this.currentSelectedTables.includes(item['TABLE_NAME']))
            {
                this.currentSelectedTables.push(item['TABLE_NAME']);
            }
        }
    });
    this.tabWithListClassData = data['tabWithListClassData'];
    if(  this.overLayRefFoListWithTab != undefined )
    {
        this.overLayRefFoListWithTab.dispose()
    }
    this.overLayForListTab();
}

   	//Added by shrutika on 05-10-21 for schema designer group box  start
overLayFoAddGroupBox() 
    {
        if( this.overLayRefForGroupBox != undefined )
        {
            this.overLayRefForGroupBox.dispose();
        }
        if( this.editorVisuals != undefined && this.editorVisuals['Visuals'] != undefined)
        {
            var len = (this.editorVisuals['Visuals'][0]['ColumnGroups'].length)+1;
            this.currentGroupBoxName = "Folder"+len;
        }
        console.log('inside overLayFoAddGroupBox.....2573',this.editorVisuals);
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
        //overlayConfig.hasBackdrop = true;
      
        console.log('inside overLayForListTab.....2356');
        const templatePortal = new TemplatePortal(this.addGrupBox, this.viewContainerRef);
        this.overLayRefForGroupBox = this.overlay.create(overlayConfig);
        this.overLayRefForGroupBox.attach(templatePortal);
    }

    curentTableGroupBox(event:any)
    {
        this.currentGroupBoxName = event['groupName']
    }

    doneGroupBox()
    {
        try
        {
            if(this.overLayRefForGroupBox != undefined)
            {
                this.overLayRefForGroupBox.dispose();
            }
            if( this.editorVisuals != undefined && this.editorVisuals['Visuals'] != undefined)
            {
                var len = this.editorVisuals['Visuals'][0]['ColumnGroups'].length;
                console.log('inside doneGroupBox.....2630',len);
                var currentGrpBox: any = {};
                currentGrpBox['GroupID'] = len+1;
                currentGrpBox['GroupName'] = this.currentGroupBoxName;
                currentGrpBox['GroupDescription'] = this.currentGroupBoxName;
                currentGrpBox['GroupIcon'] = "Incentive.svg";
                currentGrpBox['AllowedColumnTypes'] = "ANY";
                currentGrpBox['MinColumns'] = "";
                currentGrpBox['MaxColumns'] = "";
                currentGrpBox['StandardName'] = this.currentGroupBoxName;
                let columnsArray: any = [];
                currentGrpBox['COLUMNS'] = columnsArray;
                this.editorVisuals['Visuals'][0]['ColumnGroups'].push(currentGrpBox);
                //this.currentVisual = this.editorVisuals.Visuals[0];;
                this.defaultGrpName = this.currentGroupBoxName; 
                 //Addde by shrutika on 06-10-21 to open group box which added[Start]
                setTimeout(()=> 
                { 
                    this.onClickGrpBox(len); 
                }, 30);
                //Addde by shrutika on 06-10-21 to open group box which added[End]

            }
        }
        catch(e)
        {
            console.log('Exception inside doneGroupBox',e);
        }
    }
    // added by pranjali for column heading change[start] 29-june-2023
    resetSourceChange(column:any)
    {
        this.isSourceSqlChange = true;
    }
    // added by pranjali for column heading change[End] 29-june-2023
   
    getUserInfo(databaseName: any)
    {
        let paramMap: any = {};
        paramMap["databaseName"] = databaseName;
        var url = this.sqlService.getHostURL() + '/ibase/rest/Databasecatlog/userInfo';
        var paramString = this.sqlService.getEncodedParamString(paramMap);
        this.sqlService.setLoading(true);
        this.sqlService.callRequest(url, paramString).subscribe( (data: any) =>
        {
            try 
            {
                this.sqlService.setLoading(false);
		//Added by shrutika on 18-10-21 for display error [Start]
                if (data.indexOf('Errors') != -1) 
                {
                    this.displayError(data);
                    return;
                }
		//Added by shrutika on 18-10-21 for display error [End]
                this.transDB = data;
                this.SqlModelData['transDB'] = this.transDB;
                console.log('line no 4044 tabname:::',this.currenSelectedTab);
                if(this.currenSelectedTab['name'] == 'External Data Source')
                {
                    let schemadata:any  = JSON.parse(this.currentSelectedDb)
                    this.SqlModelData['transDB'] = schemadata['CONN_NAME'];
                    console.log('line no 4045 connname::',this.currentSelectedDb);
                    console.log('line no 4051::::',this.SqlModelData);
                    // this.externaltransDB = schemadata['CONN_NAME'];
                    // this.transDB = this.externaltransDB;
                    // console.log('line no 4054::::',this.transDB);
                }
               
            }
            catch(error)
            {
                console.log('Exception inside getUserInfo',error);
            }
        });
    }

    closeGroupBox()
    {
        console.log('inside cloaseGroupBox......2710');
        this.overLayRefForGroupBox.dispose();
    }
    //Added by shrutika on 18-10-21 for edit groupBox in schema designer [start].
    editCurrentGroupBox()
    {
        if( this.overLayRefForGroupBox != undefined )
        {
            this.overLayRefForGroupBox.dispose();
        }
        var columnGroupLen = this.editorVisuals['Visuals'][0]['ColumnGroups'].length;
        for( var i=0;i<columnGroupLen;i++)
        {
            var currentGrpName = this.editorVisuals['Visuals'][0]['ColumnGroups'][i]['GroupName']
            if( this.defaultGrpName == currentGrpName )
            {
                this.editorVisuals['Visuals'][0]['ColumnGroups'][i]['GroupName'] = this.currentGroupBoxName;
                var columnsLengh = this.editorVisuals['Visuals'][0]['ColumnGroups'][i]['COLUMNS'].length;
                for( var j=0;j<columnsLengh; j++)
                {
                    this.editorVisuals['Visuals'][0]['ColumnGroups'][i]['COLUMNS'][j]['StandardName'] = this.currentGroupBoxName;
                    this.editorVisuals['Visuals'][0]['ColumnGroups'][i]['COLUMNS'][j]['groupName'] = this.currentGroupBoxName;
                 }
                break;
            }
        }
        this.defaultGrpName = this.currentGroupBoxName;
    }
    //Added by mayuri on 27 sep 2023 for delete folder start
    deleteCurrentGroupBox(value:any)
    {
        if( this.overLayRefForGroupBox != undefined )
        {
            this.overLayRefForGroupBox.dispose();
        }
        for(let i = this.currentVisual['ColumnGroups'].length - 1; i >= 0; i--)
        {
            if(value == this.currentVisual['ColumnGroups'][i]['GroupName'])
            {
                this.currentVisual['ColumnGroups'].splice(i,1);
                for(let a=0; a < this.tablesArray.length;a++)
                {
                    for(let j = 0; j < this.groupDataNew['COLUMNS'].length; j++)
                    {
                        if(this.groupDataNew['COLUMNS'][j]['DBTABLE'] == this.tablesArray[a]['TABLE_NAME'])
                        {
                            this.tablesArray[a]['checked'] = undefined;
                            for(let b = 0; b < this.tablesArray[a]['COLUMN'].length;b++)
                            {
                                this.tablesArray[a]['COLUMN'][b]['checked'] = undefined;
                            }
                        }
                    }
                }
            }
        }
        for(let i= 0; i < this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].length; i++)
        {
            if(value == this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'][i]['groupName'] || value == this.SqlModelData['COLUMNS'][0]['COLUMN'][i]['tableName'])
            {
                this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].splice(i);
            }
        }
        let lastIndex = this.currentVisual['ColumnGroups'].length - 1;
        this.currentGroupBoxName = this.currentVisual['ColumnGroups'][lastIndex]['GroupName'];
        this.defaultGrpName = this.currentGroupBoxName;
    }
    //Added by mayuri on 27 sep 2023 for delete folder end
    overLayFoEditGroupBox(event: any,index: any,groupData:any) 
    {
        //Added by pranjali On 14-july-2023 for view mode hide the popup.
        this.groupDataNew = {};//added by mayuri
        this.groupDataNew = groupData;//added bt mayuri
        if(this.editFlag != 'V')
        {
        event.preventDefault();
        if( this.overLayRefForGroupBox != undefined )
        {
            this.overLayRefForGroupBox.dispose();
        }
        if( this.editorVisuals != undefined && this.editorVisuals['Visuals'] != undefined)
        {
            this.currentGroupBoxName  = this.editorVisuals['Visuals'][0]['ColumnGroups'][index]['GroupName'];
            this.defaultGrpName = this.editorVisuals['Visuals'][0]['ColumnGroups'][index]['GroupName'];
        }
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
        const templatePortal = new TemplatePortal(this.editGrpBox, this.viewContainerRef);
        this.overLayRefForGroupBox = this.overlay.create(overlayConfig);
        this.overLayRefForGroupBox.attach(templatePortal);
    }
    }
    //Added by shrutika on 18-10-21 for edit groupBox in schema designer [End]

    // Added by Samruddhi for updated UI [Start]
    setSrcSql(value: any)
    {
        console.log('Print inside setSrcSql 2603:::: ',value)
        this.isSourceSqlChange = value;
    }

    onEnterClick()
    {
        this.allformValues['source_sql'] = this.allformValues['source_sql'] + '\r\n';
    }
    // Added by Samruddhi for updated UI [End]
    //Change by shrutika on 27-11-21 for toggle related issue in calculation panel and feed panel
    onClickCalculation()
    {
        this.panelOpenState = !this.panelOpenState;
        var elem = document.getElementById('CalCulationContentID');
        var calculationElement: any = document.getElementById('CalculationPanelIDD');
        if( elem != null && calculationElement!= null )
        {
            if( this.panelOpenState )
            {
                elem.classList.add('showContent');
                calculationElement.lastElementChild.classList.remove('vision-ui-arrow_down');
                calculationElement.lastElementChild.classList.add('vision-ui-arrow_up');
            }
            else
            {
                calculationElement.lastElementChild.classList.remove('vision-ui-arrow_up');
                calculationElement.lastElementChild.classList.add('vision-ui-arrow_down');
                elem.classList.remove('showContent');
            }
        }        
    }
   //Change by shrutika on 27-11-21 for toggle related issue in calculation panel and feed 
   //Added by Samruddhi for visual option component [Start]
   openVisualOption()
   {
       let originElem = document.getElementById('openVisualOption');
       let position: any;
       if (originElem) 
       {
        //    position = document.getElementById('openVisualOption').getBoundingClientRect();
            position = document.getElementById('openVisualOption')?.getBoundingClientRect();
       }

       var width = position.width + 200;
       var top = position.top;
       top = position.top + 24;
       var left = position.left - 206;
       var bottom = position.bottom;
       const positionStrategy = this.overlay.position()
         .global()
         .width(width)
         .top(top + "px")
         .left(left + "px");
       const overlayConfig = new OverlayConfig({
       positionStrategy,
       });

       overlayConfig.hasBackdrop = true;
       overlayConfig.backdropClass = 'moreOptionsBackDrop';
       const templatePortal = new TemplatePortal(this.visualoptionarray, this.viewContainerRef);
       this.overLayRefForMoreOption = this.overlay.create(overlayConfig);
       this.overLayRefForMoreOption.backdropClick().subscribe(() => {
             this.overLayRefForMoreOption.dispose();
          });
       this.overLayRefForMoreOption.attach(templatePortal);
   }

   openVisualProperties()
   {
      // this.overLayRefForMoreOption.dispose(); 
       let originElem = document.getElementById('visualProperties');
       let position: any;
       if (originElem) 
       {
        //    position = document.getElementById('visualProperties').getBoundingClientRect();
           position = document.getElementById('visualProperties')?.getBoundingClientRect();
       }
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
       overlayConfig.backdropClass = 'moreOptionsBackDrop';
       const templatePortal = new TemplatePortal(this.visualProperties, this.viewContainerRef);
       this.overLayRefForVisualOption = this.overlay.create(overlayConfig);
       /*this.overLayRefForVisualOption.backdropClick().subscribe(() => {
             this.overLayRefForVisualOption.dispose();
          });*/
       this.overLayRefForVisualOption.attach(templatePortal);
   }

   closeVisual(event: any)
   {
        this.overLayRefForVisualOption.dispose(); 
   }

   doneVisual(event: any)
   {
        let visualsData = JSON.parse(event);
        this.currentVisual['options'] = visualsData['currentVisualOption'];
        this.overLayRefForVisualOption.dispose();
		//Added by nikhil on 05-05-2022 issual update option not working
		//Added by pranjali  On visual option done call refresh method.[Start]
		//this.setLayoutData.emit("");
        let layoutJson = {};
        layoutJson['isDoneSelected'] = true;
        this.setLayoutData.emit(layoutJson);
        //Added by pranjali  On visual option done call refresh method.[End]
   }

   //Added by Samruddhi for visual option component [End]

    //Added by vikas on 28-06-22 for columnPropeties Popup[Start]
    openColumnProperties(currentGroupName,columnName,curColName,columnFunct,coltype)
    {
      this.currentGroupName = currentGroupName ;
      this.columnName = columnName ;
      this.currentColName = curColName;
      this.currentColFunct = columnFunct;
      this.coltypecolumnprop = coltype;
      let originElem = document.getElementById('columnProperties');
      let position: any;
      if (originElem) 
      {
          position = document.getElementById('columnProperties')?.getBoundingClientRect();
      }
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
     overlayConfig.backdropClass = 'moreOptionsBackDrop';
     const templatePortal = new TemplatePortal(this.columnProperties, this.viewContainerRef);
     this.overLayRefForColumnProperties = this.overlay.create(overlayConfig);
     this.overLayRefForColumnProperties.attach(templatePortal);
    }
 
    //Changed by vikas on 05-02-23 for fixing the issue of popup not closed even after dispose [Start]
    closePropertiesPopup()
    {
        // let columnData = JSON.parse(event);
        // this.isSourceSqlChange = columnData['isSourceSqlChange'];
        this.overLayRefForColumnProperties.dispose();
    }
    //Added by pranjali To check on edit mode issue for column heading::::::::[start] 31-jan-2024
    donePropertiesPopup(event)
    {
        let columnData = JSON.parse(event);
        this.isSourceSqlChange = columnData['isSourceSqlChange'];
        this.currentVisual = columnData['currentVisual'];
        console.log('print inside donePropertiesPopup currentVisual::::::',this.currentVisual);
        this.overLayRefForColumnProperties.dispose();
    }
    //Added by pranjali To check on edit mode issue for column heading::::::::[End] 31-Jan-2024
    //Added by vikas on 28-06-22 for columnPropeties Popup[end]
    //Changed by vikas on 05-02-23 for fixing the issue of popup not closed even after dispose [End]

    //Added by shrutika on 23-11-21 for build schema xml [Start]
    //Changed by nikhil on 22-06-2022 for export option [Start]
    exportToXmlData()
    {
        // if(this.SqlModelData != undefined)
        if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'] != undefined)
        {
            var columnArray = this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN']
            var tableNameListArray: any = []
            columnArray.forEach((column: any) => {
				// column['checked'] = false;
		// Changed by Samruddhi for columns not showing after clicking on export button
                column['checked'] = true;
				column['content'] = column['content'].toUpperCase();
               if( !tableNameListArray.includes((column['DBTABLE'])) )
               {
                   tableNameListArray.push(column['DBTABLE']);
               }
            });
            var mainDataJSON: any = {};
            for( var i=0; i<tableNameListArray.length; i++ )
            {
               var currentTableArray: any = [];
               for(var j=0; j<columnArray.length; j++ )
               {
                   var currJSON = columnArray[j];
                   if( currJSON['DBTABLE'] == tableNameListArray[i] )
                   {
                       currentTableArray.push(currJSON);
                   }
               }
               mainDataJSON[tableNameListArray[i]] = currentTableArray;
            }
            this.buildSchemaXml.emit(JSON.stringify(mainDataJSON));

            let mainJSONData = JSON.stringify(mainDataJSON) + '~!SEP!~' + JSON.stringify(this.SqlModelData);
            this.buildSchemaXml.emit(mainJSONData);
        }
    }
   //Added by shrutika on 23-11-21 for build schema xml [End]

    // Changed by Aditi to set dynamic columnlist in case of freehand//setColumnsList()
    setColumnsList(getCurrentSchema, response)
    {
        this.isSourceSqlChange = true;
        if(this.isDashboard == 'true')
        {
            this.defaultGrpName = "Columns";
            this.listData["defaultVisuals"] = "Grid";
        }
        else
        {
            if(this.currentVisual != undefined)
            {
                this.defaultGrpName = this.currentVisual.ColumnGroups[0]['GroupName'];
                
            }
            this.listData["defaultVisuals"] = this.defaultVisual;
        }
        
        if(this.itemTemplate == "Column" && this.editFlag != 'A')
        {
            this.isColumnList = true;
        }
        if(getCurrentSchema != undefined && getCurrentSchema['baType'] == 'F' && this.isColumnList == true)
        {
            // let colNameArray = response[0];
            let colArrayName: any = [];
            let tempColJson = {};
            if(response != undefined)
            {
                for(const key of Object.keys(response[0]))
                {
                    colArrayName.push(key);
                    let getColData = response[0][key];
                    // tempColJson[key] = getColType['type'];
                    tempColJson[key] = {};
                    if(getColData != undefined)
                    {
                        tempColJson[key] = getColData;
                    }
                    /* if(getColType['type'] != undefined)
                    {
                        tempColJson[key]['type'] = getColType['type'];
                    }
                    if(getColType['checked'] != undefined)
                    {
                        tempColJson[key]['checked'] = getColType['checked'];
                    } */ 
                }
            }
            console.log('Print colArrayName 5002::::::',colArrayName);
            console.log('Print column type array value 5003:::::',tempColJson);
            // this.isDashboard = "true";
            this.isSqlView = false;
            this.finalTableArray = [];
            this.freehandSelect = true;
            this.itemTemplate = 'Column';
            this.schemaEditor = 1;
            // this.listData["defaultVisuals"] = "Grid";
            for(let i=0;i<colArrayName.length;i++)
            {
                let columnJson = {};
                let calColData = {};
                let finalTableJson = {};
                if(tempColJson[colArrayName[i]]['alignment'] != undefined)
                {
                    columnJson['alignment'] = tempColJson[colArrayName[i]]['alignment'];
                }
                else
                {
                    columnJson['alignment'] = '';
                }
                if(tempColJson[colArrayName[i]]['ALIGNMENT'] != undefined)
                {
                    columnJson['ALIGNMENT'] = tempColJson[colArrayName[i]]['ALIGNMENT'];
                }
                else
                {
                    columnJson['ALIGNMENT'] = 1;
                }
                if(tempColJson[colArrayName[i]]['BGCOLOR'] != undefined)
                {
                    columnJson['BGCOLOR'] = tempColJson[colArrayName[i]]['BGCOLOR'];
                }
                else
                {
                    columnJson['BGCOLOR'] = "";
                }
                if(tempColJson[colArrayName[i]]['BOLD'] != undefined)
                {
                    columnJson['BOLD'] = tempColJson[colArrayName[i]]['BOLD'];
                }
                else
                {
                    columnJson['BOLD'] = 0;
                }
               
                if(tempColJson[colArrayName[i]]['CAPS'] != undefined)
                {
                    columnJson['CAPS'] = tempColJson[colArrayName[i]]['CAPS'];
                }
                else
                {
                    columnJson['CAPS'] = false;
                }
               
                if(tempColJson[colArrayName[i]]['COLID'] != undefined)
                {
                    columnJson['COLID'] = tempColJson[colArrayName[i]]['COLID'];
                }
                else
                {
                    columnJson['COLID'] = i+1;
                }
                
                if(tempColJson[colArrayName[i]]['DBSIZE'] != undefined)
                {
                    columnJson['DBSIZE'] = tempColJson[colArrayName[i]]['DBSIZE'];
                }
                else
                {
                    columnJson['DBSIZE'] = "";
                }
                if(tempColJson[colArrayName[i]]['DEFAULTFUNCTION'] != undefined)
                {
                    columnJson['DEFAULTFUNCTION'] = tempColJson[colArrayName[i]]['DEFAULTFUNCTION'];
                }
                else
                {
                    columnJson['DEFAULTFUNCTION'] = "";
                }
                if(tempColJson[colArrayName[i]]['FEILD_TYPE'] != undefined)
                {
                    columnJson['FEILD_TYPE'] = tempColJson[colArrayName[i]]['FEILD_TYPE'];
                }
                else
                {
                    columnJson['FEILD_TYPE'] = "TEXTBOX";
                }
                if(tempColJson[colArrayName[i]]['FGCOLOR'] != undefined)
                {
                    columnJson['FGCOLOR'] = tempColJson[colArrayName[i]]['FGCOLOR'];
                }
                else
                {
                    columnJson['FGCOLOR'] = "#000000";
                }
                if(tempColJson[colArrayName[i]]['FONT'] != undefined)
                {
                    columnJson['FONT'] = tempColJson[colArrayName[i]]['FONT'];
                }
                else
                {
                    columnJson['FONT'] = "TIMES NEW ROMAN";
                }
                if(tempColJson[colArrayName[i]]['FONTSIZE'] != undefined)
                {
                    columnJson['FONTSIZE'] = tempColJson[colArrayName[i]]['FONTSIZE'];
                }
                else
                {
                    columnJson['FONTSIZE'] = 12;
                }
                if(tempColJson[colArrayName[i]]['HIDDEN'] != undefined)
                {
                    columnJson['HIDDEN'] = tempColJson[colArrayName[i]]['HIDDEN'];
                }
                else
                {
                    columnJson['HIDDEN'] = "";
                }
                if(tempColJson[colArrayName[i]]['ITALIC'] != undefined)
                {
                    columnJson['ITALIC'] = tempColJson[colArrayName[i]]['ITALIC'];
                }
                else
                {
                    columnJson['ITALIC'] = 0;
                }
                if(tempColJson[colArrayName[i]]['KEY'] != undefined)
                {
                    columnJson['KEY'] = tempColJson[colArrayName[i]]['KEY'];
                }
                else
                {
                    columnJson['KEY'] = false;
                }
                if(tempColJson[colArrayName[i]]['NATIVETYPE'] != undefined)
                {
                    columnJson['NATIVETYPE'] = tempColJson[colArrayName[i]]['NATIVETYPE'];
                }
                else
                {
                    columnJson['NATIVETYPE'] = "AN";
                }
                if(tempColJson[colArrayName[i]]['UNDERLINE'] != undefined)
                {
                    columnJson['UNDERLINE'] = tempColJson[colArrayName[i]]['UNDERLINE'];
                }
                else
                {
                    columnJson['UNDERLINE'] = 0;
                }
                if(tempColJson[colArrayName[i]]['WIDTH'] != undefined)
                {
                    columnJson['WIDTH'] = tempColJson[colArrayName[i]]['WIDTH'];
                }
                else
                {
                    columnJson['WIDTH'] = 100;
                }
                if(tempColJson[colArrayName[i]]['value'] != undefined)
                {
                    columnJson['value'] = tempColJson[colArrayName[i]]['value'];
                }
                else
                {
                    columnJson['value'] = "";
                }
                // columnJson['checked'] = true;
				// columnJson['checked'] = false;
                if(tempColJson[colArrayName[i]]['checked'] != undefined)
                {
                    columnJson['checked'] = tempColJson[colArrayName[i]]['checked'];
                }
                else
                {
                    columnJson['checked'] = false;
                }
                columnJson['DBNAME'] = colArrayName[i];
                columnJson['NAME'] = colArrayName[i].toUpperCase().trim();
                if(tempColJson[colArrayName[i]]['content'] != undefined)
                {
                    columnJson['content'] = this.titlecasePipe.transform(tempColJson[colArrayName[i]]['content']);
                }
                else
                {
                    columnJson['content'] = this.titlecasePipe.transform(colArrayName[i].replaceAll("_", " ").trim());
                }
                if(tempColJson[colArrayName[i]]['groupName'] != undefined)
                {
                    columnJson['groupName'] = tempColJson[colArrayName[i]]['groupName'];
                }
                if(tempColJson[colArrayName[i]]['StandardName'] != undefined)
                {
                    columnJson['StandardName'] = tempColJson[colArrayName[i]]['StandardName'];
                }
                
                columnJson['name'] = colArrayName[i].replaceAll("_", " ").trim();
                columnJson['descr'] = columnJson['content']+' description' ;
                
                // Changed by Samrudhi on 22-08-2022 to add dynamic column expression
                // columnJson['expression'] = colArrayName[i].trim();
                if(tempColJson[colArrayName[i]]['expression'] != undefined)
                {
                    columnJson['expression'] = this.titlecasePipe.transform(tempColJson[colArrayName[i]]['expression']);
                }
                else
                {
                    columnJson['expression'] = '';
                }
                columnJson['JAVATYPE'] = "java.lang.String";
                // columnJson['FUNCTION'] = "";
                columnJson['EXPRESSIONTYPE'] = "C";
                // columnJson['COLTYPE'] = "CHAR";
                if(tempColJson[colArrayName[i]]['type'] != undefined)
                {
                    columnJson['type'] = tempColJson[colArrayName[i]]['type'];
                    if(columnJson['type'] == 'string')
                    {
                        columnJson['JAVATYPE'] = "java.lang.String";
                        columnJson['FUNCTION'] = "";
                        columnJson['EXPRESSIONTYPE'] = "C";
                        columnJson['COLTYPE'] = "CHAR";
                    }
                    else if(columnJson['type'] == 'number')
                    {
                        columnJson['JAVATYPE'] = "java.math.BigDecimal";
                        columnJson['FUNCTION'] = "SUM";
                        columnJson['EXPRESSIONTYPE'] = "G";
                        columnJson['COLTYPE'] = "NUMBER";
                    }
                    else if(columnJson['type'] == 'date string' || columnJson['type'] == 'date')
                    {
                        columnJson['JAVATYPE'] = "java.sql.Date";
                        columnJson['FUNCTION'] = "";
                        columnJson['EXPRESSIONTYPE'] = "C";
                        columnJson['COLTYPE'] = "DATE";
                        columnJson['PATTERN'] = "dd-MMM-yy"
                    }
                }
                if(tempColJson[colArrayName[i]]['COLTYPE'] != undefined)
                {
                    columnJson['COLTYPE'] = tempColJson[colArrayName[i]]['COLTYPE'];
                    console.log('Print  columnJson[COLTYPE] 5603::::::',columnJson['COLTYPE']);           
                }
                if(tempColJson[colArrayName[i]]['FUNCTION'] != undefined)
                {
                    columnJson['FUNCTION'] = tempColJson[colArrayName[i]]['FUNCTION'];
                    console.log('Print columnJson[FUNCTION] 5608::::::',columnJson['FUNCTION']);           
                }
                columnJson['ADV_FORMAT'] = ""; 
                console.log('Print columnJson 5591::::::',columnJson);           
                finalTableJson['COLUMN'] = [];
                finalTableJson['COLUMN'].length = 0;
                finalTableJson['COLUMN'].push(columnJson);
                this.finalTableArray.push(finalTableJson); 
                calColData['columnData'] = columnJson;
                this.getChangeData(JSON.stringify(calColData));
            }
            this.isSqlViewValue.emit(this.isSqlView);
            this.isColumnList = false;
            // Changed by Samruddhi on 21-02-2024 for criteria pop up window not displaying on visual options done
			// this.isSourceSqlChange = false;
        }
    }

    setSqlView()
    {
        if(this.listData != undefined && this.listData["baType"] == 'F')
        {
            // this.isDashboard = "true";
            this.schemaEditor = 3;
            this.schemaEditorSelector(3);
            this.finalTableArray = [];
            this.freehandSelect = false;
            this.isSqlView = true;
            this.itemTemplate = 'Column';
            // Added by Samruddhi on 22-06-2022 for updated columnlist and sqlview buttons
            this.isSqlViewData = true;
            if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'] != undefined && this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'] != undefined)
            {
                let sqlArray = this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'];
                sqlArray.forEach((column: any) => {
                        column['checked'] = false;
                        return;
                });
                this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'] = sqlArray.filter(item => item.checked);
                // Changed by Samruddhi on 22-04-2022 for visual change issue in freehand
                // this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN']= [];
                if(this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].length > 0)
                {
                    let arrLen = this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].length;
                    this.SqlModelData['SQLModel']['COLUMNS'][0]['COLUMN'].splice(0, arrLen);
                }
                for(let i=0; i<this.editorVisuals.Visuals.length; i++)
                {
                    let currentVisualList = this.editorVisuals['Visuals'][i];
                    if(currentVisualList['ID'] == 'grid')
                    {
                        this.currentVisual = currentVisualList;
                        this.defaultVisual = this.currentVisual['VisualName'];
                        if(this.currentVisual != undefined)
                        {
                            // Added by Samruddhi for column list issue in case of freehandsql
                            for(let j = 0; j < currentVisualList['ColumnGroups'].length; j++)
                            {
                                this.currentVisual['ColumnGroups'][j]['COLUMNS'] = [];
                                this.currentVisualData.emit(JSON.stringify(this.currentVisual));
                            }
                        }
                        break;
                    }
                    //Changed by Samruddhi for updated UI
                    // Added by nikhil on 04-03-2022 for set the visual description
                    //this.allformValues['descr'] = this.defaultVisual;
                }
                this.finalTableArray = [];
                this.isSqlViewValue.emit(this.isSqlView);
                this.isSourceSqlChange = true;
            }
        }
    }
   // Added by Samruddhi for Freehandsql [End]

   // Added by Samruddhi for selected groupbox must remain expand on visual change
   isEmptyObject(object: any)
   {
       return JSON.stringify(object) === '{}';
   }

    // Added by Aditi to set dynamic columnlist in case of freehand 
    onRefresh()
    {
        this.isColumnList = true;
        this.visualUpdOptions = undefined;
        this.isCriteria = false;
        // this.defaultGrpName = "Columns";
        // Added by Samruddhi on 22-06-2022 for updated columnlist and sqlview buttons
        this.isSqlViewData = false;
        this.freehandSelect = true; 
        this.isSourceSqlChange = true;
        console.log('print inside onRefresh currentVisual::::::',this.currentVisual);
        this.onNextforBrowser();
    }

    // Added by Samruddhi on 22-06-2022 for updated columnlist and sqlview buttons
    schemaColumnList()
    {
        this.secondFormToggle = true;
        this.isSqlViewData = false;
    }
    
    // Added by Samruddhi on 27-07-2022 for BBCalColumnPropertiesComponent
    //Changed by vikas on 21-12-22 for hiding calc type on click
    openCalColumnProperties(lastSeq: any)
    {
	this.hideCalculationType = false;
        this.calSequence = lastSeq; 
        let originElem = document.getElementById('CalColumn');
        let position: any;
        this.isExpression = true;
        if (originElem) 
        {
            position = document.getElementById('CalColumn')?.getBoundingClientRect();
        }
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
        overlayConfig.backdropClass = 'moreOptionsBackDrop';
        const templatePortal = new TemplatePortal(this.calColumn, this.viewContainerRef);
        this.overLayRefForCalColumn = this.overlay.create(overlayConfig);
        this.overLayRefForCalColumn.attach(templatePortal);
    }

    closeCalColumn(event: any)
    {
        this.overLayRefForCalColumn.dispose();
    }

    //Changed by vikas and tejas on 28-12-22 for adding functionlist,type,parameters functionality in  calculation panel [Start]
    doneCalColumn(event: any)
    {
      let currCalJson = JSON.parse(event);
      let currentDomId = currCalJson['calcFeedIndex'];
      this.currentCalDomID = currCalJson['calcFeedIndex']
      let index  = this.currentCalDomID;
      this.allformValues['Detail2'][index]['calc_type']  = currCalJson['calc_type']
	  this.allformValues['Detail2'][index]['col_datatype'] = currCalJson['col_datatype']
      this.allformValues['Detail2'][index]['calc_expression'] = currCalJson['calc_expression']
      this.onButtonClick(this.allformValues,'done','Detail2',2,currentDomId);
    }

    deleteCurCalColumn(event: any)
    {
        let currCalJson = JSON.parse(event);
        let curDomID = currCalJson['calcFeedIndex'];
        this.currentCalDomID = currCalJson['calcFeedIndex'];
        let index  = this.currentCalDomID;
        this.allformValues['Detail2'][index]['calc_type']  = currCalJson['calc_type']
	    this.allformValues['Detail2'][index]['col_datatype'] = currCalJson['col_datatype']
        this.allformValues['Detail2'][index]['calc_expression'] = currCalJson['calc_expression']
        this.onButtonClick(this.allformValues,'delete','Detail2',2,curDomID);
    }

    editCalculation(calcSeq: any,ind)
    {
        console.log('Print inside editCalculation this.allformValues Detail2:::::::',this.allformValues['Detail2'][ind]);
        this.calSequence = calcSeq;
        this.currentAction = 'edit';
        if(this.currentAction == 'edit')
        {
            this.editFunctionParamaterArray = [];
            if(this.allformValues['Detail2'][ind]['function_name'] == 'SQL' || this.allformValues['Detail2'][ind]['function_name'] == 'Lookup' || this.allformValues['Detail2'][ind]['function_name'] == 'Cumulative_Sum' || this.allformValues['Detail2'][ind]['function_name'] == 'Expression' || this.allformValues['Detail2'][ind]['function_name'] == 'Conditional_Expression' || this.allformValues['Detail2'][ind]['function_name'] == 'Map_from_Source' || this.allformValues['Detail2'][ind]['function_name'] == 'Presentation' || this.allformValues['Detail2'][ind]['calc_type'] == 'M')
            {
                this.hideFunctionListOnEdit = true;
            }
            else
            {
                this.hideFunctionListOnEdit = false;
            }
            if(this.allformValues['Detail2'][ind]['function_type'] == 'Expression' || this.allformValues['Detail2'][ind]['function_type'] == 'Conditional_Expression' || this.allformValues['Detail2'][ind]['function_type'] == 'SQL' || this.allformValues['Detail2'][ind]['function_type'] == 'Lookup' || this.allformValues['Detail2'][ind]['function_type'] == 'Cumulative_Sum' || this.allformValues['Detail2'][ind]['function_type'] == 'Local_AI_Function' || this.allformValues['Detail2'][ind]['function_type'] == 'Local_Statistical_Function' || this.allformValues['Detail2'][ind]['function_type'] == 'Cloud_AI_Function')
            {
                let paramData: any = {};
                paramData["ACTION"] = "GET_FUNCTION_LIST";
                paramData["functionType"] = this.allformValues['Detail2'][ind]['function_type'];
                var url = this.sqlService.getHostURL() + '/ibase/PreviewHandlerServlet';
                var paramString = this.sqlService.getEncodedParamString(paramData);
                this.sqlService.callRequest(url, paramString).subscribe( (data: any) => {
                    data = data.replaceAll(' ','');
                    this.functionListJson = JSON.parse(data);
    
                    for (const key in this.functionListJson) 
                    {
                        let ky = key;
                        this.editFunctionListArray.push(ky);
                    }
                });
                paramData = {};
                paramData["ACTION"] = "GET_FUNCTION_PARAMETER";
                paramData["functionname"] = this.allformValues['Detail2'][ind]['function_name']  //Contribution
                var url = this.sqlService.getHostURL() + '/ibase/PreviewHandlerServlet';
                var paramString = this.sqlService.getEncodedParamString(paramData);
                this.sqlService.callRequest(url, paramString).subscribe( (data: any) => {
                    data = data.replaceAll(' ','');
                    this.editFunctionParamaterJson = JSON.parse(data);
                    this.editFunctionParamaterArray.push(this.editFunctionParamaterJson);
                })
                this.editFunctionParameterData = JSON.parse(this.allformValues['Detail2'][ind]['function_parameter']);
            }
        }
        this.openCalColumnProperties(calcSeq);
    }
    //Changed by vikas and tejas on 28-12-22 for adding functionlist,type,parameters functionality in  calculation panel [End]

     //Added by vikas on 21-11-22 for Process type dropdown in gpro [Start]
     selectProcessType(event)
     {
         let selectProcType:any = {};
         this.allformValues['proc_type'] = event.value;
         console.log("Print allformValues line no 5296::::",this.allformValues);
         console.log("Print allformValues['proc_type'] line no 5297::::",this.allformValues['proc_type']);
         selectProcType['proc_type'] = this.allformValues['proc_type']
         this.isProcessType.emit(selectProcType);
     }
     //Added by vikas on 21-11-22 for Process type dropdown in gpro [End]
     onCalculationDrop(event: CdkDragDrop<any[]> | any, index?: any)
     {
        this.isSourceSqlChange = true;
        this.isLongPressed = true;
        let grpBoxContId = "CalCulationContentID";
        let grpBoxElement: any = document.getElementById(grpBoxContId);      
     }
     
     // Added by Sujan on 17-01-2023 to drag and drop or select deselect for calculated columns
     onCalClick(detail: any, index)
     {
        if(this.editFlag != "V")
        {
            //detail.checked = !detail.checked;
            if (this.editFlag == "A") 
            {
                detail.checked = !detail.checked;
            }
            if (this.editFlag != "A") 
            {
                this.currentCalArray = [];
                console.log("print line no 5110::::: currentCalArray", this.currentCalArray);
                if (this.currentCalArray.length == 0) {
                    this.currentCalArray[index] = {}; 
                    for (let i = 0; i < this.currentVisual.ColumnGroups.length; i++) {
                        for (let j = 0; j < this.currentVisual.ColumnGroups[i]['COLUMNS'].length; j++) {
			    //Added by mayuri on 13 july 2023 for On edit mode click or drag drop feed functionality not working properly [start]
                            // if(this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['name'] == this.allformValues['Detail2'][index]['col_name'] && this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['calc_seq'] == this.allformValues['Detail2'][index]['calc_seq'])
                            if(this.currentVisual.ColumnGroups[i]['COLUMNS'][j]['calc_seq'] == this.allformValues['Detail2'][index]['calc_seq']) {
                                detail.checked = !detail.checked;
                                this.currentCalArray[index]['columnData'] = this.currentVisual['ColumnGroups'][i]['COLUMNS'][j];
                            break;
                            }
                            else
                    {
                                console.log("print line no 4516::: detail",detail);
                                if(!detail.hasOwnProperty('checked'))
                        {
                                    detail['checked'] = false;
                                }
                                if(detail['checked'] == false)
                            {
                                    detail.checked = !detail.checked;
                                    let calColumnJson:any ={};
                                    let dataTypeVal = "";
                                    if (detail['col_datatype'] == 'S') {
                                        dataTypeVal = "string";
                                        calColumnJson['JAVATYPE'] = "java.lang.String";
                                    }
                                    else if (detail['col_datatype'] == 'N') {
                                        dataTypeVal = "number";
                                        calColumnJson['JAVATYPE'] = "java.math.BigDecimal";

                                    }
                                    else if (detail['col_datatype'] == 'D') {
                                        dataTypeVal = "date";
                                        calColumnJson['JAVATYPE'] = "java.sql.Date";
                                    }
                                    let calColType = "";
                                    if (detail['calc_type'] == 'S') {
                                        calColType = "SQL";
                                    }
                                    else if (detail['calc_type'] == 'E') {
                                        calColType = "Expression";
                                    }
                                    else if (detail['calc_type'] == 'L') {
                                        calColType = "Lookup";
                                    }
                                    else if (detail['calc_type'] == 'M') {
                                        calColType = "Map from Source";
                                    }
                                    else if (detail['calc_type'] == 'C') {
                                        calColType = "Conditional Expression";
                                    }
                                    else if (detail['calc_type'] == 'U') {
                                        calColType = "Cumulative Sum";
                                    }
                                    else if (detail['calc_type'] == 'P') {
                                        calColType = "Presentation";
                                    }
                                    else if (detail['calc_type'] == 'F') {
                                        calColType = "Forecast";
                                    }
                                    else if (detail['calc_type'] == 'N') {
                                        calColType = "User Defined";
                                    }
                                    else if (detail['calc_type'] == 'T') {
                                        calColType = "Translate";
                                    }
                                    else if (detail['calc_type'] == 'O') {
                                        calColType = "Local AI Function";
                                    }
                                    else if (detail['calc_type'] == 'R') {
                                        calColType = "Local_Statistical_Function";
                                    }
                                    else if (detail['calc_type'] == 'D') {
                                        calColType = "Cloud AI Function";
                                    }
                                    calColumnJson['ITALIC'] = 0;
                                    calColumnJson['BGCOLOR'] = "";
                                    calColumnJson['EXPRESSIONTYPE'] = detail['col_datatype'];
                                    calColumnJson['WIDTH'] = 100;
                                    calColumnJson['HIDDEN'] = "";
                                    calColumnJson['DBSIZE'] = "";
                                    calColumnJson['UNDERLINE'] = 0;
                                    calColumnJson['COLID'] = "";
                                    calColumnJson['FONT'] = "TIMES NEW ROMAN";
                        
                                    let calcColName = detail['col_name'];
                                    calColumnJson['content'] = calcColName.replaceAll('_', ' ');
                                    calColumnJson['NAME'] = calcColName.toUpperCase();
                                    calColumnJson['NATIVETYPE'] = "AN";
                                    calColumnJson['FONTSIZE'] = 12;
                                    calColumnJson['FGCOLOR'] = "#000000";
                                    calColumnJson['ALIGNMENT'] = 1;
                                    calColumnJson['DBTABLE'] = "";
                                    calColumnJson['DBNAME'] = calcColName.toUpperCase();
                                    calColumnJson['BOLD'] = 0;
                                    calColumnJson['DEFAULTFUNCTION'] = "";
                                    calColumnJson['COLUMN_TYPE'] = "calc_column";
                                    calColumnJson['KEY'] = false;
                                    calColumnJson['CAPS'] = false;
                                    calColumnJson['FEILD_TYPE'] = "TEXTBOX";
                                    calColumnJson['value'] = "";
                                    calColumnJson['name'] = detail['col_name'];
                                    calColumnJson['type'] = dataTypeVal;
                                    calColumnJson['descr'] = detail['col_descr'];
                                    calColumnJson['expression'] = detail['calc_expression'];
                                    calColumnJson['tableName'] = "";
                                    calColumnJson['tableDisplayName'] = "";
                                    calColumnJson['FUNCTION'] = "";
                                    calColumnJson['groupName'] = "";
                                    calColumnJson['checked'] = true;
                                    calColumnJson['calc_seq'] = detail['calc_seq'];
                                    calColumnJson['persist_clumn_name'] = detail['persist_clumn_name'];
                                    calColumnJson['persist_form_no'] = detail['persist_form_no'];
                                    calColumnJson['COLTYPE'] = "CHAR";
                                    if (calColumnJson['type'] == 'string') {
                                        calColumnJson['JAVATYPE'] = "java.lang.String";
                                        calColumnJson['FUNCTION'] = "";
                                        calColumnJson['EXPRESSIONTYPE'] = "C";
                                        calColumnJson['COLTYPE'] = "CHAR";
                                    }
                                    else if (calColumnJson['type'] == 'number') {
                                        calColumnJson['JAVATYPE'] = "java.math.BigDecimal";
                                        calColumnJson['FUNCTION'] = "SUM";
                                        calColumnJson['EXPRESSIONTYPE'] = "G";
                                        calColumnJson['COLTYPE'] = "NUMBER";
                                    }
                                    else if (calColumnJson['type'] == 'date string' || calColumnJson['type'] == 'date') {
                                        calColumnJson['JAVATYPE'] = "java.sql.Date";
                                        calColumnJson['FUNCTION'] = "";
                                        calColumnJson['EXPRESSIONTYPE'] = "C";
                                        calColumnJson['COLTYPE'] = "DATE";
                                        calColumnJson['PATTERN'] = "dd-MMM-yy"
                                    }
                                    let calColData:any={};
                                    calColumnJson['CALC_TYPE'] = calColType;
                                    calColData['columnData'] = calColumnJson;
                                    this.currentCalArray[index]=calColData;
	                            break;
                                }
                            }
                            //Added by mayuri on 13 july 2023 for On edit mode click or drag drop feed functionality not working properly [end]
                        }
                    }
                }
            }
            if (detail.checked == true && this.allformValues['Detail2'][index]['calc_type'] != 'M') {
                this.currentCalArray[index]['columnData']['checked'] = true;
                let currentCal = this.currentCalArray[index];
                this.getChangeData(JSON.stringify(currentCal));
            }
            else if (detail.checked != true && this.allformValues['Detail2'][index]['calc_type'] != 'M') {
                this.currentCalArray[index]['columnData']['checked'] = false;
                let currentCal = this.currentCalArray[index];
                this.getChangeData(JSON.stringify(currentCal));
            }
        }
     }
     
     onSelectAutoConfirmToggle()
     {
        if(this.autoConfirm == false)
        {
            this.autoConfirm = true;
        }
        else if(this.autoConfirm == true)
        {
            this.autoConfirm = false;
        }
        if(this.autoConfirm == true)
        {
            this.allformValues['auto_confirm'] = 'Y';
        }
        else
        {
            this.allformValues['auto_confirm'] = 'N';
        }
     }
     //added by mayuri on 18/08/2023 check for condition end
     checkCondition(condition:any,value,schema)
     {
          this.conditionResponse = value;
          this.conditionValue = condition;
          for(let i=0;i<this.conditionValue.length;i++)
          {
              this.checkOperator(this.conditionValue[i]);
          }
  
     }
     checkOperator(condition:any)
     {
        let currColOperator;
        let finalColJson = {}
        if(condition.includes("="))
        {
            currColOperator = "="; 
        }
        else if(condition.includes("!="))
        {
            currColOperator = "!=";
        }
        else if(condition.includes(">"))
        {
            currColOperator = ">";
        }
        else if(condition.includes(">="))
        {
            currColOperator = ">=";
        }
        else if(condition.includes("<"))
        {
            currColOperator = "<";
        }
        else if(condition.includes("<="))
        {
            currColOperator = "<=";
        }
        else if(condition.includes("between"))
        {
            currColOperator = "between";
        }
        else if(condition.includes("in"))
        {
            currColOperator = "in";
        }
        else if(condition.includes("like"))
        {
            currColOperator = "like";
        }
        let currentColArr = condition.split(currColOperator);
        let currentColName = currentColArr[0].trim();
        this.sqlService.getProductIdentificationAlias().subscribe((response:any)=> {
        this.sqlService.setLoading(false);
        response = JSON.stringify(response);
        this.sqlService.checkErrorException(response,(result: any) =>{
        if(!result)
        {
            let productIdentificationJson = JSON.parse(response);
            {
                let currentAliasCol = currentColArr[0];
                if(currentAliasCol in productIdentificationJson)
                {
                    currentColName = productIdentificationJson[currentAliasCol]
                }
            }
            
        }
    });
    });
        finalColJson['COLUMN_NAME'] = currentColName.toUpperCase();
        let currentCriteria = currentColArr[1].trim();
        finalColJson['OPERATOR']=currColOperator;
        finalColJson['CRITERIA']= currentCriteria;
        this.finalColArr.push(finalColJson);
   }
   createCriteria()
    {
        let newfindData = [];
        let findData;
        let customValue;
        let newValue = '';
        let indexNew; 
        let defaultTypeNew;
        let conditionLeg;
        let currentNewValue;
        let newChipValue=[];
        if(this.conditionValue != undefined)
        {
            this.schemaEditor = 2;
            this.listData.baType = 'S';
        }
        for(let j=0;j<this.tablesArray.length;j++)
        {
            let newTableArray = this.tablesArray[j];
            if(this.finalColArr != undefined)
            {
                for(let i=0;i<this.finalColArr.length;i++)
                {
                    conditionLeg = i;
                    findData = newTableArray['COLUMN'].find((data:any) => data['NAME'] == this.finalColArr[i]['COLUMN_NAME']);
                    if(findData != undefined)
                    {
                        newfindData.push(findData);  
                    }
                } 
            }
        } 
        for(let i=0;i<this.finalColArr.length;i++)
        {
            newChipValue=[];
            if(this.finalColArr[i]['CRITERIA'] != undefined)
            {
                this.finData = '';
                customValue = (this.finalColArr[i]['CRITERIA'].substring(this.finalColArr[i]['CRITERIA'].indexOf(this.finalColArr[i]['OPERATOR']) + 1)).trim();
                if(customValue.includes('@'))
                {
                    if(this.finalColArr[i]['OPERATOR'].includes('in') || this.finalColArr[i]['OPERATOR'].includes('between'))
                    {
                        if(customValue.includes(','))
                        {
                            let currentCustomValue = customValue.split(',');
                            for(let a=0;a<currentCustomValue.length;a++)
                            {
                                if(currentCustomValue[a].includes('@'))
                                {
                                    indexNew = currentCustomValue[a].indexOf("@"); 
                                    let latestcustomValue = currentCustomValue[a].substring(indexNew + 1);
                                    newChipValue.push(latestcustomValue);
                                    let emptyValue;
                                    customValue = emptyValue;
                                }
                            }
                        }
                        else
                        {
                            if(customValue.includes('@'))
                            {
                                indexNew = customValue.indexOf("@"); 
                                let latestcustomValue = customValue.substring(indexNew + 1);
                                newChipValue.push(latestcustomValue);
                                let emptyValue;
                                customValue = emptyValue;
                            }
                        }
                    }
                    else
                    {
                        indexNew = customValue.indexOf("@"); 
                        customValue = customValue.substring(indexNew + 1);
                    }
                }
                else
                {
                    if(this.finalColArr[i]['CRITERIA'].includes('?.'))
                    {
                        if(this.finalColArr[i]['OPERATOR'].includes('in') || this.finalColArr[i]['OPERATOR'].includes('between'))
                        {
                        if(customValue.includes(','))
                        {
                            let currentCustomValue = customValue.split(',');
                            for(let a=0;a<currentCustomValue.length;a++)
                            {
                                if(currentCustomValue[a].includes('?.'))
                                {
                                    indexNew = currentCustomValue[a].indexOf("?."); 
                                    let latestcustomValue = currentCustomValue[a].substring(indexNew + 2);
                                    newChipValue.push(latestcustomValue);
                                    let emptyValue;
                                    customValue = emptyValue;
                                }
                            }
                        }
                        else
                        {
                            if(customValue.includes('?.'))
                            {
                                indexNew = customValue.indexOf("?."); 
                                let latestcustomValue = customValue.substring(indexNew + 2);
                                newChipValue.push(latestcustomValue);
                                let emptyValue;
                                customValue = emptyValue;
                            } 
                        }
                    }
                        else
                        {
                            customValue = 'FixedValue';
                            let newcustomValue = this.finalColArr[i]['CRITERIA'];
                            indexNew = newcustomValue.indexOf(".") 
                            newcustomValue = newcustomValue.substring(indexNew + 1);
                            newValue = newcustomValue;
                        }
                    }
                    else
                    {
                        if(customValue.includes("currentmonth"))
                        {
                            console.log("print line no 54888 customValue",customValue);
                        }
                        else
                        {
                            if(this.finalColArr[i]['OPERATOR'].includes('in') || this.finalColArr[i]['OPERATOR'].includes('in') || this.finalColArr[i]['OPERATOR'].includes('between') || this.finalColArr[i]['OPERATOR'].includes('BETWEEN'))
                            {
                                if(customValue.includes(','))
                                {
                                    let currentCustomValue = customValue.split(',');
                                    for(let a=0;a<currentCustomValue.length;a++)
                                    {
                                        newChipValue.push(currentCustomValue[a]);
                                        let emptyValue;
                                        customValue = emptyValue;
                                    }
                                }
                                else
                                {
                                    newChipValue.push(customValue);
                                    let emptyValue;
                                    customValue = emptyValue;
                                }
                            }
                            else
                            {
                                customValue = 'FixedValue';
                                newValue = (this.finalColArr[i]['CRITERIA'].substring(this.finalColArr[i]['CRITERIA'].indexOf(this.finalColArr[i]['OPERATOR']) + 1)).trim();
                            }
                        }
                    }
                }
                    let arithmaticOperator;
                    if(customValue != undefined)
                    {
                        if(customValue.includes("-"))
                        {
                            arithmaticOperator = "-"; 
                        }
                        else if(customValue.includes("+"))
                        {
                            arithmaticOperator = "+";
                        }
                    }
                    if(arithmaticOperator != undefined)
                    {
                        let currentColArr = customValue.split(" ");
                        let currentColName = currentColArr[0].trim();
                        let currentOpe = currentColArr[1].trim();
                        let currentValue = currentColArr[2].trim();
                        let tempVal = Number(currentValue);
                        let currentMonth;
                        let currentDate;
                        let newcurrentMonth;
                        var today = new Date();
                        let Last12Month;
                        if(customValue.includes("Last12Month"))
                        {
                            Last12Month = new Date(today.getFullYear(), today.getMonth()-12 , 1, 23, 59, 59);
                            console.log('Inside else if Last12Month....',Last12Month);
                            currentMonth = Last12Month.toISOString();
                        }
                        else if(customValue.includes("Last1Month"))
                        {
                            let Last1Month = new Date(today.getFullYear(), today.getMonth()-1 , 1, 23, 59, 59);
                            console.log('Inside else if Last1Month....',Last1Month);
                            currentMonth = Last1Month;
                        }
                        else if(customValue.includes("Last3Month"))
                        {
                            let Last3Month = new Date(today.getFullYear(), today.getMonth()-3 , 1, 23, 59, 59);
                            console.log('Inside else if Last3Month....',Last3Month);
                            currentMonth = Last3Month;
                        }
                        else if(customValue.includes("Last6Month"))
                        {
                            let Last6Month = new Date(today.getFullYear(), today.getMonth()-6 , 1, 23, 59, 59);
                            console.log('Inside else if Last6Month....',Last6Month);
                            currentMonth = Last6Month;
                        }
                        else if(customValue.includes("Last9Month"))
                        {
                            let Last9Month = new Date(today.getFullYear(), today.getMonth()-9 , 1, 23, 59, 59);
                            console.log('Inside else if Last9Month....',Last9Month);
                            currentMonth = Last9Month;
                        }
                        else if(customValue.includes("Today"))
                        {
                            let todayVal = new Date();
                            currentDate = todayVal;
                            console.log('Inside else if currentDate....',currentDate);
                        }
                        else if(customValue.includes("1stDayOfMonth"))
                        {
                            let firstDayofMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                            currentDate = firstDayofMonth;
                            console.log('Inside else if currentDate....line no 5545',currentDate);
                        }
                        else if(customValue.includes("LastDayOfMonth"))
                        {
                            let lastDayOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0);
                            currentDate = lastDayOfMonth;
                            console.log('Inside else if currentDate....line no 5551',currentDate);
                        }
                        else if(customValue.includes("1stDateOfLastMonth"))
                        {	
                            let firstdayoflastmonth = new Date(today.getFullYear(), today.getMonth()-1 , 1, 23, 59, 59);
                            currentDate = firstdayoflastmonth;
                            console.log('Inside else if currentDate....line no 5557',currentDate);
                        }
                        else if(customValue.includes("LastDayOfLastMonth"))
                        {
                            let lastdayoflastmonth = new Date(today.getFullYear(), today.getMonth() , 0, 23, 59, 59);
                            currentDate = lastdayoflastmonth;
                            console.log('Inside else if currentDate....line no 5563',currentDate);
                        }
                        else if(customValue.includes("1stDayOfWeek"))
                        {
                            var startDay = 1;
                            var d = today.getDay();
                            var weekStart = new Date(today.valueOf() - (d<=0 ? 7-startDay:d-startDay)*86400000);
                            currentDate = weekStart;
                            console.log('Inside else if currentDate....line no 5571',currentDate);
                        }
                        else if(customValue.includes("LastDayOfWeek"))
                        {
                            var startDay = 1;
                            var d = today.getDay();
                            var weekStart = new Date(today.valueOf() - (d<=0 ? 7-startDay:d-startDay)*86400000);
                            var weekEnd = new Date(weekStart.valueOf() + 6*86400000);
                            console.log('Print todayVal 332::::::',weekEnd);
                            currentDate = weekEnd;
                            console.log('Inside else if currentDate....line no 5581',currentDate);
                        }
                        else if(customValue.includes("1stDateOfLastWeek"))
                        {
                            let beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000), day = beforeOneWeek.getDay()
                            , diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1)
                            , lastMonday = new Date(beforeOneWeek.setDate(diffToMonday))
                            , lastSunday = new Date(beforeOneWeek.setDate(diffToMonday + 6));
                            currentDate = lastMonday;
                            console.log('Inside else if currentDate....line no 5590',currentDate);
                        }
                        else if(customValue.includes("LastDayOfLastWeek"))
                        {
                            let beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000), day = beforeOneWeek.getDay()
                            , diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1)
                            , lastMonday = new Date(beforeOneWeek.setDate(diffToMonday))
                            , lastSunday = new Date(beforeOneWeek.setDate(diffToMonday + 6));
                            currentDate = lastSunday;
                            console.log('Inside else if currentDate....line no 5599',currentDate);
                        }
                        else if(customValue.includes("1stDayOfYear"))
                        {
                            let theFirst = new Date(today.getFullYear(), 0, 1);
                            currentDate = theFirst;
                            console.log('Inside else if currentDate....line no 5605',currentDate);
                        }
                        else if(customValue.includes("LastDayOfYear"))
                        {
                            let theLast = new Date(today.getFullYear(), 11, 31);
                            currentDate = theLast;
                            console.log('Inside else if currentDate....line no 5611',currentDate);
                        }
                        else if(customValue.includes("1stDateOfLastYear"))
                        {
                            let theFirstprevyr = new Date(today.getFullYear()-1, 0, 1);
                            currentDate = theFirstprevyr;
                            console.log('Inside else if currentDate....line no 5617',currentDate);
                        }
                        else if(customValue.includes("LastDayOfLastYear"))
                        {
                            let theLastprevyr = new Date(today.getFullYear()-1, 11, 31);
                            currentDate = theLastprevyr;
                            console.log('Inside else if currentDate....line no 5571',currentDate);
                        }
                        else if(customValue.includes("1stDayOfFinYear"))
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
                            currentDate = dobj.toISOString();
                            console.log('Inside else if currentDate....line no 5640',currentDate);
                        }
                        else if(customValue.includes("LastDayOfFinYear"))
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
                            currentDate = dobj.toISOString();
                            console.log('Inside else if currentDate....line no 5657',currentDate);
                        }
                        else if(customValue.includes("1stDateOfLastFinYear"))
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
                            currentDate = dobj.toISOString();
                            console.log('Inside else if currentDate....line no 5674',currentDate);
                        }
                        else if(customValue.includes("LastDayOfLastFinYear"))
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
                            currentDate = dobj.toISOString();
                            console.log('Inside else if currentDate....line no 5691',currentDate);
                        }
                        else if(customValue.includes("currentmonth"))
                        {
                            let currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
                            currentMonth =this.datePipe.transform(new Date(currentDate), 'dd-MMM-yyyy');
                        }
                        if(arithmaticOperator == '+') 
                        {
                            if(currentMonth != undefined)
                            {
                                newcurrentMonth = this.addMonth(currentMonth,tempVal);
                            }
                            else
                            {
                                newcurrentMonth = this.addDays(currentDate,tempVal);
                            }
                        }
                        else if(arithmaticOperator == '-') 
                        {
                            if(currentMonth != undefined)
                            {
                                newcurrentMonth = this.subtractMonths(currentMonth,tempVal) 
                            }
                            else
                            {
                                newcurrentMonth = this.subtractDay(currentDate,tempVal);
                            }
                        }
                        this.finData = newcurrentMonth
                    }
                    else
                    {
                        
                    }
                    if(this.finData != undefined && this.finData != '')
                    {
                        newValue = this.finData;
                        customValue = 'FixedValue';
                    }
                    if(customValue != undefined)
                    {
                        if(customValue.includes("currentmonth"))
                        {
                            customValue = 'FixedValue'; 
                            let NewToday = new Date();
                            let currentDate = new Date(NewToday.getFullYear(), NewToday.getMonth(), 1);
                            this.finData = currentDate;
                            newValue = this.finData;
                        }
                    }
            }
            if(this.finalColArr[i]['CRITERIA'].includes('?'))
            {
                defaultTypeNew='P';
                }
                else
                {
                    defaultTypeNew = 'F';
                }
                let criteriaNewJson: any ={};
                let valueJson:any ={};
                valueJson['value'] = customValue;
                
                for(let j=0;j<newfindData.length;j++)
                {
                    if(newfindData[j]['NAME'] == this.finalColArr[i]['COLUMN_NAME'])
                    {
                        criteriaNewJson['COLTYPE'] = newfindData[j]["type"].toLowerCase();
                        criteriaNewJson['DBNAME'] = newfindData[j]["DBNAME"];
                        if(customValue != undefined)
                        {
                            criteriaNewJson['chipValue'] = [];
                        }
                        else
                        {
                            criteriaNewJson['chipValue'] = newChipValue;
                        }

                        criteriaNewJson['columnDBNAME'] = "";
                        criteriaNewJson['columnTableName'] = "";
                        if(this.finalColArr[i]['OPERATOR'].includes('in') || this.finalColArr[i]['OPERATOR'].includes('between'))
                        {
                            criteriaNewJson['currentFieldType'] = 'multi-input';
                        }
                        else
                        {
                            criteriaNewJson['currentFieldType'] = newfindData[j]["type"].toLowerCase();
                        }
                        if(customValue != undefined)
                        {
                            criteriaNewJson['customValue'] = customValue;
                        }
                        criteriaNewJson['field'] = newfindData[j]["tableName"]+'.'+newfindData[j]["DBNAME"];
                        criteriaNewJson['id'] = "Criteria_"+[i + 1];
                        criteriaNewJson['operator'] = this.finalColArr[i]['OPERATOR'];
                        criteriaNewJson['prevOption'] = "";
                        criteriaNewJson['promptLabel'] = newfindData[j]['name'];
                        criteriaNewJson['queryOption'] = defaultTypeNew;
                        criteriaNewJson['tableName'] = newfindData[j]["tableName"];
                        if(newValue !=undefined)
                        {
                            criteriaNewJson['value'] = newValue;
                        }
                        else
                        {
                            criteriaNewJson['value'] = newChipValue;
                        }
                        this.SqlModelData['CRITERIA']['query']['rules'].push(criteriaNewJson);
                        if(this.finData !=undefined && this.finData != '')
                        {
                            this.newCriteriaArray.push(criteriaNewJson)
                        }
                        setTimeout(()=> 
                        { 
                            if(this.bbQueryBuilder != undefined)
                            {
                                this.bbQueryBuilder.customDrop(valueJson,criteriaNewJson);
                            }
                        }, 90);
                    }
                }
        
            }
    }
    subtractMonths(date, months) {
        let currentDate =  new Date(date);
        currentDate.setMonth(currentDate.getMonth() - months);
        return currentDate;
    }
    addMonth(date, months)
    {
        let currentDate =  new Date(date);
        currentDate.setMonth(currentDate.getMonth() + months);
        if(currentDate.getMonth() < currentDate.getMonth() - months)
        {
            currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
        return currentDate;
    }
    addDays(theDate, days) {
        return new Date(theDate.getTime() + days*24*60*60*1000);
    }
    subtractDay(theDate, days) {
        return new Date(theDate.getTime() - days*24*60*60*1000);
    }
    
    //added by mayuri on 18/08/2023 check for condition end
    onInputChange(event)
    {
        this.generateSQLSeq();
    }
}

export function bound(target: Object, propKey: string | symbol) 
{
    var originalMethod = (target as any)[propKey] as Function;
    if (typeof originalMethod !== "function") throw new TypeError("@bound can only be used on methods.");
    if (typeof target === "function") 
    {
        return {
            value: function () {
                return originalMethod.apply(target, arguments);
            }
        };
    } else if (typeof target === "object") {
        return {
            get: function () {
                var instance: any = this;
                Object.defineProperty(instance, propKey.toString(), {
                    value: function () {
                        return originalMethod.apply(instance, arguments);
                    }
                });
                return instance[propKey];
            }
        } as PropertyDescriptor;
    }
}