import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, OnChanges, ViewChild, Input, ViewEncapsulation, Output, EventEmitter, HostListener, ElementRef, Renderer2, ViewChildren, QueryList } from '@angular/core';
// import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatPaginator } from '@angular/material/paginator';
//import { MatTableDataSource} from '@angular/material/core';
// import { MatLegacyTableDataSource as MatTableDataSource, MatLegacyTable as MatTable } from '@angular/material/legacy-table';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { uniqWith, get } from 'lodash';


/**
 * @title Table with filter, selection, sort, fixed header, paginator
 */

declare var getBBHostURL: any;

@Component({
  selector: 'bb-table',
  styleUrls: ['bb-table.component.css'],
  templateUrl: 'bb-table.component.html',
  encapsulation: ViewEncapsulation.None
})
export class BBTableComponent implements OnInit, OnChanges {

  @ViewChild(MatPaginator) paginator: MatPaginator | any;
  @ViewChild(MatSort) sort: MatSort | any;

  @Input() displayFilter = false;
  @Input() displayPaginator = false; //should set false in case u need row wise total otherwise it goes in continuous loop
  @Input() ELEMENT_DATA = [];

  @Input() freezColumns = 1;//To set the freez callumns
  @Input() groupByRowCol = 1;//To set the group by rows in column
  @Input() rowWiseTotal = false; //To get row wise calculated total && displayPaginator should be false
  @Input() headerRotate = false;//to set the header label position
  @Input() _sumofKeys: any = [];//to get colum wise total at footer eg.['Sell In', 'Sell Out']
  @Input() groupSumOfKeys: any = [];
  private displayedColumns: any = [];//column array
  _displayedColumns: any[] = [];
  displayedCols: any[] = [];
  displayColNameLst: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  public selection = new SelectionModel<any>(true, []);
  private idArray: any = [];
  public leftByIdJson: any = {};
  public span: any = {};
  public grandTotal: boolean = false;

  @Output() onFinsh: EventEmitter<any> = new EventEmitter();
  public defineCellsTotalIndxArr: any[] = []; //will store the _TOTAL_VAL index
  private columnNames: any = [];
  private displayVal: any = [];
  private columnProperties: any = [];
  //Added by Sainath T. on 16-01-2020 [To get the defined cells updated total]-Start
  @Output() upDatedDefinedCellTotal: EventEmitter<any> = new EventEmitter(); //to emit the defined cell total only (sell_out)
  sellOutTotalMap: any = {};
  @Input() definedCellTotalUpdates: boolean = false;
  @Output() cancel: EventEmitter<any> = new EventEmitter();
  //Added by Sainath T. on 16-01-2020 [To get the defined cells updated total]-End

  //Added by Sainath Thakare on 25-01-2019-Start
  @Output() save: EventEmitter<any> = new EventEmitter();
  @Input("finishButton") finishButton: string | any;
  @Input("cancelButton") cancelButton: string | any;
  @Input("saveButton") saveButton: string | any;
  //Added by Sainath Thakare on 25-01-2019-End
  formatByGroupIdMap: any = {};
  //Added by Prajyot 
  @Output() onCellAction: EventEmitter<any> = new EventEmitter();
  //Added By Sainath T. on 07-02-2020-start
  currentChangeValue: any;//to set the currently changing text field value
  currentChangeCol: any;//to set the currently changing text field Column No.
  //calcDefinedCellFirstCall: boolean = true; //commented by sainath T. on 09/04/2020 
  dataSourceLength: number | any;
  selectedRowState: boolean[] = [];
  // lastSelectedRow: number = null;
  lastSelectedRow: number | any;
  //@ViewChild('txtBox') txtBox :QueryList<ElementRef>
  @ViewChildren('txtBox', { read: ElementRef }) txtBox: QueryList<ElementRef> | any
  //Added By Sainath T. on 07-02-2020-end
  activeActionCell: any = -1;

  //Sainath T. on 10-04-2020 -Start
  @Input() clearAllParameters: boolean = false;
  @Input() disableSumbit: boolean = false;
  public defineCellsTotalIndxArrForQty: any[] = []; //will store the _TOTAL_QTY index
  //Sainath T. on 10-04-2020 -End
  //Pooja S. on 10-04-2020 -Start
  @Output() onSentBack: EventEmitter<any> = new EventEmitter();
  @Input("sentBackButton") sentBackButton: string | any;
  //Pooja S. on 10-04-2020 -End
  @ViewChild(MatTable) bbTable: MatTable<any> | any;
  borderSeparationKey: string = "";
  //chnaged by sainath T on 27-05-2020-Start
  @ViewChild('bbButtonCantainer') bbButtonCantainer: ElementRef | any;
  @ViewChild('bbTableContainer') bbTableContainer: ElementRef | any;
  //chnaged by sainath T on 27-05-2020-End

  //Added by shrutika on 27-10-2020 [Start] for servicehandler4 Data.
  @Input() isPophelpHeader = false;
  @Input() pophelpTitle = "";
  searchValue = "";
  //Added by shrutika on 27-10-2020 [End] for servicehandler4 Data.
  constructor(private renderer: Renderer2) { }

  ngOnInit() {
    console.log('ngOnInit in bb tabel!!');
    this.initComponent();
  }
  //Sainath T. on 10-04-2020 -Start
  initComponent() {
    console.log('Init components>>');
    this.configureTableData(this.ELEMENT_DATA);
    this.configurePaginator();
    //if the keys of total are provide the set grandTotal true to display column wise total at footer-Start
    if (this._sumofKeys.length > 0) {
      this.grandTotal = true;
    }
    //if the keys of total are provide the set grandTotal true to display column wise total at footer-End
    this.dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
    if (this.displayPaginator) {
      this.dataSource.paginator = this.paginator;
    }
    this.dataSource.sort = this.sort;
    //filter out column names
    this.displayColNameLst = this.displayedColumns.map((c: any) => c.name);
    this.displayedCols = this.displayedColumns.map((c: any) => c.display);
    this.setSpanObject();
    //filter out column select from displayedColumns
    this._displayedColumns = this.displayedColumns.filter((c: any) => { return c.name != 'select' });
    this.dataSourceLength = this.dataSource.data.length;
    if (this.definedCellTotalUpdates) {
      this.borderSeparationKey = this.dataSource.data[0].LABEL;
      this.initSelectedRowState();
      this.setDefinedCellsTotal();
    }
  }
  //Sainath T. on 10-04-2020 -End

  /** To Set displayPaginator flag */
  private configurePaginator() {
    //should set false in case u need row wise total otherwise it goes in continuous loop
    if (this.rowWiseTotal) {
      this.displayPaginator = false;
    }
  }
  /** To Set the span Obj Dynamically */
  private setSpanObject() {
    var groupByObj: any = {};
    var columArr: any = [];
    for (var i = 0; i < this.groupByRowCol; i++) {
      columArr.push(this.displayColNameLst[i]);
      //DealerName: this.spanDeep(['DealerName'], ELEMENT_DATA)
      groupByObj[this.displayedCols[i]] = this.spanDeep(columArr, this.ELEMENT_DATA);
    }
    this.span = Object.assign({}, groupByObj);
  }

  //To Set the span Obj Dynamically-End
  ngOnChanges() {
    //Sainath T. on 28-04-2020 -Start
    //console.log('bb table ng on changes>>'+this.clearAllParameters);
    //console.log('bb table ng on disableSumbit>>'+this.disableSumbit);
    if (this.clearAllParameters) {
      if (this.bbTable && this.bbTable != undefined) {
        console.log('bbTable render Rows');
        this.bbTable.removeHeaderRowDef(null as any);
      }
      this.initComponent();
      setTimeout(() => {
        this.ngAfterViewInit();
        console.log('in set time out!!')
        if (this.bbTable && this.bbTable != undefined) {
          this.bbTable.renderRows();
        }
      }, 100);
    }
    //Sainath T. on 28-04-2020 -End

    this.dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
    if (this.displayPaginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  ngAfterViewInit(): void {
    console.log('ngAfterview init!!!');
    //this.calcDefinedCellFirstCall = false;
    this.getColumnLeft();
  }
  /** Whether the number of selected elements matches the total number of rows. */
  private isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  private masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  /** to calculate and get the left property for each cell */
  getColumnLeft() {
    try {
      for (var col = 0; col < Number(this.freezColumns); col++) {
        var setLeftFlag = true;
        if (this.idArray != null && this.idArray.includes(col))/* && this.idArray.includes(id+col) */ {
          setLeftFlag = false;
        }
        else {
          this.idArray.push(col);
        }

        if (col == 0) {
          this.leftByIdJson[col] = '0px';
        }
        else if (col != (this.displayColNameLst.length - 1)) {
          var lastCol = col - 1;
          var prevcolName = this.displayColNameLst[lastCol];
          var prevCallId = prevcolName + '_col' + lastCol;

          var leftPx: any = document.getElementById(prevCallId)?.style.left;
          var left = Number(leftPx.substring(0, leftPx.indexOf('px')));
          var offsetWidth: any = document.getElementById(prevCallId)?.offsetWidth;
          //console.log('prop of'+prevCallId+' offsetWidth='+offsetWidth+' and left='+left);
          left = left + offsetWidth;

          if (setLeftFlag) {
            leftPx = left + "px";
            this.leftByIdJson[col] = leftPx;
          }
          else {
            leftPx = this.leftByIdJson[col];

            if (leftPx != (left + "px")) {
              this.leftByIdJson[col] = left + "px";
            }
          }
        }
      }
    }
    catch {
      console.log('error while setting left!! in bb tables');
    }
  }

  /** returns column wise total */
  public getGrandTotal(columName: string, sticky: boolean, colIdx: any) {
    var total = 0;

    if (this._sumofKeys.length > 0 && this._sumofKeys.includes(columName)) {
      var currValue: any = null;
      this.ELEMENT_DATA.reduce((accum: any, curr) => {
        currValue = Number(curr[columName]);
        total = total + currValue
      }, 0);
    }
    else if (sticky && colIdx == 0) {
      return "Total";
    }
    else {
      return null;
    }
    return total.toFixed(2);
  }

  onFinish() {
    console.log('onFinish!!!');
    /* this.onFinsh.emit(this.dataSource.data); */
    var dataSource = this.dataSource.data.slice(0);
    dataSource.unshift(this.columnProperties);
    dataSource.unshift(this.displayVal);
    dataSource.unshift(this.columnNames);
    this.onFinsh.emit(dataSource);
  }

  /** To Set the table header properties and data */
  private configureTableData(ELEMENT_DATA: any[]) {
    var colCount = 0;
    this.columnNames = ELEMENT_DATA[0]; //column keys
    this.displayVal = ELEMENT_DATA[1]; //header labels 
    this.columnProperties = ELEMENT_DATA[2]; //input type against each col //colInputType ; renamed
    this.displayedColumns = [];
    var inputType = "text";
    var rupeesFlag = "number";
    var groupId = "";
    var actionStr = "";
    var placeholder = "";
    var errormessage = "";
    var visible: any;
    for (var key of this.columnNames) {
      inputType = this.getPropertyValues("INPUT_TYPE", colCount, "number");
      rupeesFlag = this.getPropertyValues("FORMAT", colCount, "N"); //MKT
      groupId = this.getPropertyValues("GROUP_ID", colCount, "");

      actionStr = this.getPropertyValues("ACTION_STR", colCount, "");
      placeholder = this.getPropertyValues("PLACEHOLDER", colCount, "");
      errormessage = this.getPropertyValues("ERROR_MSG", colCount, "");
      //Added By Sainath T. on 07-02-2020
      visible = this.getPropertyValues("DISPLAY", colCount, "Y");
      visible = visible != "" ? visible : "Y";

      var headerObj: any = {
        'name': key, 'display': this.displayVal[colCount], 'width': '100px', 'inputType': inputType,
        "format": rupeesFlag, "group_id": groupId, "action": actionStr, "placeholder": placeholder, "errormessage": errormessage, "visible": visible
      };
      if (colCount < this.freezColumns) {
        headerObj['sticky'] = true;
        headerObj['rotate'] = this.headerRotate;
      }
      else {
        headerObj['sticky'] = false;
        headerObj['rotate'] = this.headerRotate;
      }
      this.displayedColumns.push(headerObj);
      colCount++;
    }
    if (this.rowWiseTotal) {
      headerObj = {
        'name': 'Total', 'display': 'Total', 'width': '100px', 'inputType': 'number',
        "format": "Y", "group_id": "", "action": actionStr, "placeholder": placeholder, "errormessage": errormessage, "visible": "Y"
      };
      headerObj['sticky'] = true;
      headerObj['rotate'] = this.headerRotate;
      this.displayedColumns.push(headerObj);
    }
    this.ELEMENT_DATA.splice(0, 3); //removed first 3 rows and passed to build table
  }

  // private spanDeep(paths: string[] | null, data: any[]) 
  private spanDeep(paths: string[], data: any[]) {
    if (!paths.length) {
      return [...data]
        .fill(0)
        .fill(data.length, 0, 1);
    }

    const copyPaths = [...paths as any];
    const path = copyPaths.shift();
    const uniq: any = uniqWith(data, (a: any, b: any) => get(a, path) === get(b, path))
      .map((item: any) => get(item, path));

    return uniq
      .map((uniqItem: any) => this.spanDeep(copyPaths, data.filter(item => uniqItem === get(item, path))))
      ?.flat(paths.length);
  }

  private calcDefinedCellsTotal(dataCopy: any[], minusVal: number, col: number, sumFieldName: any, forQty: boolean) {
    var total = 0;
    for (var rowNo = 0; rowNo < (dataCopy.length - minusVal); rowNo++) {
      var rowData = dataCopy[rowNo];
      if (rowData[this.displayColNameLst[1]] == sumFieldName) //LABEL = Sell In
      {
        total = Number(total) + Number(rowData[this.displayColNameLst[col]]);
      }
    }
    //Sainath T on 10/04/2020 [Commented and changed For Qty] -Start
    //total = forQty? total : Number(total / 1000);
    if (forQty) {
      return total;
    }
    else {
      total = total / 1000;
      return Number(total).toFixed(2);
    }
    //Sainath T on 10/04/2020 [Commented and changed For Qty] -End
  }
  //Added by Sainath T. on 16-01-2020 [To get the defined cells updated total]-Start
  emitDefinedCellTotal(col: number, dataCopy: any, from: string) {
    var groupId = this._displayedColumns[col]['group_id']; //this._displayedColumns

    var totalSellOutObject = dataCopy[dataCopy.length - 1];

    var gropuTotal = this.getGroupWiseTotal(groupId, totalSellOutObject);
    var eventFlag = false;
    if (!this.sellOutTotalMap || this.sellOutTotalMap[groupId + 'V'] != gropuTotal['valueTotal']
      || this.sellOutTotalMap[groupId + 'Q'] != gropuTotal['qtyTotal']) {
      this.sellOutTotalMap[groupId + 'V'] = gropuTotal['valueTotal'];
      this.sellOutTotalMap[groupId + 'Q'] = gropuTotal['qtyTotal'];
      eventFlag = true;
    }
    if (eventFlag) {
      var totalJson = {
        "GROUP_CODE": groupId, "TOTAL": gropuTotal['valueTotal'],
        "MKTR": this.formatByGroupIdMap[groupId], 'TOTAL_QTY': gropuTotal['qtyTotal']
      };
      this.upDatedDefinedCellTotal.emit(totalJson);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
  //Added by Sainath T. on 16-01-2020 [To get the defined cells updated total]-End
  //Added by Sainath T. on 25-01-2020 [Changes to get group wise total]-Start
  /** emit the save event with data */
  onSave() {
    var dataSource = this.dataSource.data.slice(0);
    dataSource.unshift(this.columnProperties);
    dataSource.unshift(this.displayVal);
    dataSource.unshift(this.columnNames);
    this.save.emit(dataSource);
  }

  /** to get the property values from json*/
  getPropertyValues(request: string, colCount: number, retVal: any): any {
    var retVal: any = "";
    if (this.columnProperties[colCount] && this.columnProperties[colCount][request]) {
      retVal = this.columnProperties[colCount][request];
    }
    return retVal;
  }

  /** to calculate group wise total */
  getGroupWiseTotal(groupId: any, totalSellOutObject: any) {
    var total = 0;
    var qtyTotal = 0;
    for (let totalCol in this.defineCellsTotalIndxArr) {
      var tempIndx = this.defineCellsTotalIndxArr[totalCol];
      if (this._displayedColumns[tempIndx]['group_id'] == groupId) {
        total = total + Number(totalSellOutObject[this.displayColNameLst[tempIndx]]);
        qtyTotal = qtyTotal + Number(totalSellOutObject[this.displayColNameLst[tempIndx + 1]]);/*  + 1 */
        this.formatByGroupIdMap[groupId] = this._displayedColumns[tempIndx]['format'];
      }
    }
    return { "valueTotal": total, "qtyTotal": qtyTotal };
  }

  setChangeValue(event: any, rowNo: number, colNo: number, inputType: any) {
    this.currentChangeValue = event;
    this.currentChangeCol = colNo;
    //console.log('SS event>>'+event+' input type>>>>>'+this._displayedColumns[colNo].inputType);
    //Added by shrutika on 27-10-2020 [Start] for servicehandler4 Data.
    if (inputType == 'checkBox') {
      console.log('inside setChangeValue.......498', this._displayedColumns);
      var currentValue = this.dataSource.data[rowNo][this._displayedColumns[colNo].name];
      currentValue = currentValue == "false" ? "true" : "false";
      this.dataSource.data[rowNo][this._displayedColumns[colNo].name] = currentValue;
    }
    //Added by shrutika on 27-10-2020 [End] for servicehandler4 Data.
    if (this.definedCellTotalUpdates) {
      if (this._displayedColumns[colNo].inputType == 'number' && (Number(event) < 0 || Number(event) == null || Number(event) == undefined || !event)) {
        this.dataSource.data[rowNo][this._displayedColumns[colNo].name] = "0";
        //console.log('SS in if event!!!');
      }
      var dataSource = this.dataSource.data;
      this.saveRateWiseValues(dataSource, rowNo, colNo + 2, colNo + 1, colNo);
      var mktar = this._displayedColumns[colNo]['format'];
      //Commented and changed by Sainath T. on 29-02-2020-Start
      /* if (mktar != "Y") {
        this.saveQty(dataSource, rowNo, colNo + 3, colNo)
       } */
      this.saveQty(dataSource, rowNo, colNo + 3, colNo)
      //Commented and changed by Sainath T. on 29-02-2020-End
      //console.log('Row Label Name>>'+this.groupSumOfKeys[0]);
      if (dataSource[rowNo]['LABEL'] == this.groupSumOfKeys[0])//sell in
      {
        //Sainath T on 10/04/2020 [Added For Qty]
        this.calculateDefinedCellsTotal(dataSource, this.dataSourceLength - 4, colNo + 2);//for Qty
        this.calculateDefinedCellsTotal(dataSource, this.dataSourceLength - 2, colNo + 2);//for value
      }
      else if (dataSource[rowNo]['LABEL'] == this.groupSumOfKeys[1]) {
        //Sainath T on 10/04/2020 [Added For Qty]
        this.calculateDefinedCellsTotal(dataSource, this.dataSourceLength - 3, colNo + 2);//for Qty
        this.calculateDefinedCellsTotal(dataSource, this.dataSourceLength - 1, colNo + 2);//for value
      }
    }
  }
  //Added by Sainath T. on 25-01-2020 [Changes to get group wise total]-Start

  @HostListener('window:orientationchange', ['$event'])
  orientationChange(event: any) {
    this.getColumnLeft();
  }

  //Added by Prajyot
  onCellActionPerform(colDef: any, cellData: any) {
    if (!cellData[colDef.name] || cellData[colDef.name].trim().length == 0) {
      var errormessage = colDef.errormessage || 'Field can not be blank';
      alert(errormessage);
      return;
    }
    console.log('onCellActionPerform cellData', colDef, cellData);
    if (cellData && colDef.action && colDef.action.indexOf('CELL') != -1) {
      cellData['COL_DEF'] = colDef;
      this.onCellAction.emit(cellData);
      this.activeActionCell = -1;
    }
  }

  private saveQty(dataCopy: any[], row: number, col: number, qtyCol: number) {
    var itmValue = dataCopy[row][this.displayColNameLst[qtyCol]];
    dataCopy[row][this.displayColNameLst[col]] = itmValue;
  }
  private saveRateWiseValues(dataCopy: any[], row: number, col: number, rateCol: any, itemCol: any) {
    var rate = dataCopy[row][this.displayColNameLst[rateCol]];
    var itmValue = dataCopy[row][this.displayColNameLst[itemCol]];
    var total = Number(rate) * Number(itmValue);
    dataCopy[row][this.displayColNameLst[col]] = total;
  }

  setDefinedCellsTotal() {
    var dataSource = this.dataSource.data;
    var colCount = 0;
    for (let colDef of this._displayedColumns) {
      colCount++;
      if (colDef.visible == "N" && colDef.name.indexOf("_TOTAL_VAL") != -1) {
        var colNo = colCount - 1;
        if (!this.defineCellsTotalIndxArr.includes(colNo)) {
          this.defineCellsTotalIndxArr.push(colNo);
          //Sainath T on 10/04/2020 [Added For Qty total]
          this.defineCellsTotalIndxArrForQty.push(colNo + 1)
        }
        var rowCount = 0;
        for (let row of dataSource) {
          rowCount++;
          var rowNo = rowCount - 1;
          var mktar = this._displayedColumns[colNo]['format'];
          //Sainath T on 10/04/2020 [Commented and changed For Qty total]
          if (rowNo >= (this.dataSourceLength - 4))//rowNo == (this.dataSourceLength - 3) || rowNo == (this.dataSourceLength - 4)
          {
            this.calculateDefinedCellsTotal(dataSource, rowNo, colNo);
          }
          else {
            this.saveRateWiseValues(dataSource, rowNo, colNo, colNo - 1, colNo - 2);
            // if(mktar != "Y")
            // {
            this.saveQty(dataSource, rowNo, colNo + 1, colNo - 2);
            // }
          }
        }
      }
    }
  }

  calculateDefinedCellsTotal(dataCopy: any, row: number, col: number) {
    if (row == (this.dataSourceLength - 2)) //Sell in
    {
      //Sainath T on 10/04/2020 [Commented and changed For Qty total]
      //var sellInTotal = this.calcDefinedCellsTotal(dataCopy, 2, col, this.groupSumOfKeys[0], false);
      var sellInTotal = this.calcDefinedCellsTotal(dataCopy, 4, col, this.groupSumOfKeys[0], false);
      dataCopy[row][this.displayColNameLst[col]] = sellInTotal;
      dataCopy[row][this.displayColNameLst[col - 2]] = sellInTotal;
    }
    else if (row == (dataCopy.length - 1))//Sell out
    {
      //Sainath T on 10/04/2020 [Commented and changed For Qty total]
      //var sellOtToatl = this.calcDefinedCellsTotal(dataCopy, 1, col, this.groupSumOfKeys[1], false);
      var sellOtToatl = this.calcDefinedCellsTotal(dataCopy, 3, col, this.groupSumOfKeys[1], false);
      dataCopy[row][this.displayColNameLst[col]] = sellOtToatl;
      dataCopy[row][this.displayColNameLst[col - 2]] = sellOtToatl;
      //Commented and changed by Sainath T. on 10-04-2020-Start
      //var sellOutQtyTotal = this.calcDefinedCellsTotal(dataCopy, 1, col+1, this.groupSumOfKeys[1], true);
      var sellOutQtyTotal = this.calcDefinedCellsTotal(dataCopy, 3, col + 1, this.groupSumOfKeys[1], true);//
      dataCopy[row][this.displayColNameLst[col + 1]] = sellOutQtyTotal;
      //Commented and changed by Sainath T. on 10-04-2020-End
      if (this.definedCellTotalUpdates && this.currentChangeValue != undefined) {
        this.emitDefinedCellTotal(col, dataCopy, "VALUE_TOTAL");
      }
    }
    //Added by Sainath T. on 10-04-2020-[For Qty total]-Start
    else if (row == (dataCopy.length - 4)) {
      var sellInQtyTotal = this.calcDefinedCellsTotal(dataCopy, 4, col + 1, this.groupSumOfKeys[0], true); //4
      dataCopy[row][this.displayColNameLst[col + 1]] = sellInQtyTotal;
      dataCopy[row][this.displayColNameLst[col - 2]] = sellInQtyTotal;
    }
    else if (row == (dataCopy.length - 3)) {
      var sellOutQtyTotal = this.calcDefinedCellsTotal(dataCopy, 3, col + 1, this.groupSumOfKeys[1], true);//3
      dataCopy[row][this.displayColNameLst[col + 1]] = sellOutQtyTotal;
      dataCopy[row][this.displayColNameLst[col - 2]] = sellOutQtyTotal;
    }
    //Added by Sainath T. on 10-04-2020-[For Qty total]-End
  }

  isEditable(row: any, col: any) {
    this.selectedRowState[row] = true;
    if (this.lastSelectedRow != row) {
      this.selectedRowState[this.lastSelectedRow] = false;
      setTimeout(() => {
        //this.txtBox.nativeElement.focus();
        //console.log('Sai>>>>>>>'+this.txtBox.toArray());
        // this.txtBox.forEach(tabInstance => console.log(tabInstance))
        var txtEle: any = this.txtBox.find((txtBx: any) => txtBx.nativeElement.id == row + '_' + col);
        //console.log('txtEle>'+txtEle);
        txtEle.nativeElement.focus();
      }, 0);
    }
    this.lastSelectedRow = row;
  }

  onBlur(row: any) {
    if (this.lastSelectedRow != undefined && this.lastSelectedRow != row) {
      this.selectedRowState[row] = false;
    }
    else {
      this.selectedRowState[row] = true;
    }
  }

  initSelectedRowState() {
    this.dataSource.data.map((rowObj) => {
      if (this.groupSumOfKeys.includes(rowObj[this.displayColNameLst[1]])) {
        this.selectedRowState.push(false);
      }
      else {
        this.selectedRowState.push(true);
      }
    });
  }

  /*Added By Vikas Lagad on 24-02-2020 [to show attachment for ot connect]Start */
  showAttachmentPlugin(htmlString: any) {
    console.log('Inside showAttachmentPlugin :: ', htmlString);
    var refSer = 'R-DCR', refId = '';
    var wrapper = document.createElement('div');
    wrapper.innerHTML = htmlString;
    refId = wrapper.children[wrapper.childElementCount - 1].id;
    console.log('refSer  refid  ::', refId, refSer);
    var targetDiv = document.getElementsByClassName(refId);

    if (targetDiv[0].childElementCount == 0) {
      var panel = this.getAttachmentPlugIn(refSer, refId);
      if (targetDiv[0] && panel) {
        this.renderer.appendChild(targetDiv[0], panel);
      }
    }
    else {
      console.log(' -- Attachment present --');
    }

  }

  getAttachmentPlugIn(refSer: any, refId: any) {
    const __win__ = (<any>window);
    var attchPluginViewUI = __win__.getAttachmentsPluginUI({
      OBJ_NAME: "",
      REF_SER: refSer,
      REF_ID: refId,
      HOST_URL: getBBHostURL(),
      DOC_TYPE: "",
      UI: "V",
      THUMBNAIL_WIDTH: "30px",
      THUMBNAIL_HEIGHT: "30px",
      MAX_WIDTH: "100px",
      IS_HOSTED_MODE: true
    });

    return attchPluginViewUI;
  }
  /*Added By Vikas Lagad on 24-02-2020 [to show attachment for ot connect]End */
  onSentBackButton() {
    console.log('onSentBackButton!!!');
    var dataSource = this.dataSource.data.slice(0);
    dataSource.unshift(this.columnProperties);
    dataSource.unshift(this.displayVal);
    dataSource.unshift(this.columnNames);
    this.onSentBack.emit(dataSource);
  }

  //Added by Sainath T. on 10-04-2020-[For Freez last 4 rows for sell plan only]-Start
  bodyRowHeight = 38;
  getFixRowBottom(row: number, colspan?: number) {
    if (this.definedCellTotalUpdates) {
      if (colspan != undefined && colspan != 0) {
        if ((this.dataSourceLength - 2) == row) {
          return -3 + 'px';
        }
        else if ((this.dataSourceLength - 4) == row) {
          return ((this.bodyRowHeight * 2) - 6) + 'px';
        }
      }
      else if ((this.dataSourceLength - 1) == row) {
        return -1 + 'px';
      }
      else if ((this.dataSourceLength - 2) == row) {
        return (this.bodyRowHeight - 3) + 'px';
      }
      else if ((this.dataSourceLength - 3) == row) {
        return ((this.bodyRowHeight * 2) - 4) + 'px';
      }
      else if ((this.dataSourceLength - 4) == row) {
        return ((this.bodyRowHeight * 3) - 6) + 'px';
      }
    }
  }
  //Added by Sainath T. on 10-04-2020-[For Freez last 4 rows for sell plan only]-End

  //Added by shrutika on 27-10-2020 [Start] for servicehandler4 Data.
  applyFilterOnSerch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    console.log('inside applyFilterOnSerch.....829', this.dataSource.filter);
  }
  //Added by shrutika on 27-10-2020 [Start] for servicehandler4 Data.


}
