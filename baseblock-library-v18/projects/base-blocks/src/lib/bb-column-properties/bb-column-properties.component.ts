import { OverlayRef } from "@angular/cdk/overlay";
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";



@Component({
    selector:'bb-column-properties',
    templateUrl:'./bb-column-properties.component.html',
    styleUrls:['./bb-column-properties.component.css']
})

export class BBColumnPropertiesComponent implements OnInit {
    @Input() defaultVisual:any;
    @Input() currentVisual:any;
    @Input() editorVisuals:any;
    @Input() isDashboard:any;
    @Input() columnName:any;
    @Input() currentColName:any;
    @Input() currentGroupName:any;  
    @Input() editFlag = "";
    @Input() SqlModelData: any = {};
    @Input() currentColFunct:any;
    @Input() coltypecolumnprop:any;
    param: any = 'COLUMNS';
    funcArrcolumnprop:any[] = [];
    overLayRefForColumnProperties: OverlayRef | any;
    @Output() onCloseActionColumnProperty: EventEmitter<any> = new EventEmitter();
    @Output() columnOnDoneAction: EventEmitter<any> = new EventEmitter();
    @Output() deleteColumn :EventEmitter<any> = new EventEmitter();
    @Output() closeOnDeletePopup :EventEmitter<any> = new EventEmitter();
    @Output() setExpColumnProperty :EventEmitter<any> = new EventEmitter();
    closebuttoncolarray : any = {};
    closebtncoljson:any = {}
    columnPropertyOption = { options: [{name: 'Numeric', value: 'NUMBER'}, {name: 'Char', value: 'CHAR'}, {name: 'Date', value: 'DATE'}, {name: 'Varchar', value: 'VARCHAR2'}]};
    numericFormats:any[] = ['9','9.9','9.99','9.999','IND','IND.9','IND.99','IND.999','USA','USA.9','USA.99','USA.999','EURO','EURO.9','EURO.99','EURO.999'];
    ngOnInit()
    {
    console.log('Print numericFormats line no 39::::',this.numericFormats);
    this.isExpandedcolumn(this.currentColFunct,this.coltypecolumnprop);
    console.log('Print currentVisual inside ngonInit in columnproperties::::',this.currentVisual);
   //Added by Vikas for making copy of current visual for showing old data if close before done [Start]
   let currentvisualcopy = {} = this.currentVisual;
   for(var i = 0 ; i < currentvisualcopy['ColumnGroups'].length;i++)
   {
        let currentGroupJson = currentvisualcopy['ColumnGroups'][i];
        if(this.currentGroupName == currentvisualcopy['ColumnGroups'][i]['GroupName'])
        {   
        
            let currentColArray = currentvisualcopy['ColumnGroups'][i]['COLUMNS'];
          
            for(var j = 0; j< currentColArray.length;j++)
            {
             
                if(this.columnName == currentColArray[j]['NAME'])
                {
                    
                    this.closebuttoncolarray = JSON.stringify(currentvisualcopy['ColumnGroups'][i]['COLUMNS'][j]);
                    this.closebtncoljson = currentvisualcopy['ColumnGroups'][i]['COLUMNS'][j];
                    break;
                }
            }
            break;
        }
   }
}
 //Added by Vikas for making copy of current visual for showing old data if close before done [end]

    //Changed by Vikas on 12-07-22 for display default function in popup [Start]
    isExpandedcolumn(emptyexpansion,COLTYPE: any)
    {
        if(COLTYPE == "CHAR" || COLTYPE == "VARCHAR2" || COLTYPE == "VARCHAR" || COLTYPE == "CHAR2" || COLTYPE == "STRING")
        {
            this.funcArrcolumnprop = [{name: 'NONE', value: ''}, {name: 'COUNT', value: 'COUNT'}, {name: 'DISTINCT COUNT', value: 'DISTINCT COUNT'}, {name: 'LENGTH', value: 'LENGTH'}, {name: 'RTRIM', value: 'RTRIM'}, {name: 'LTRIM', value: 'LTRIM'}, {name: 'REVERSE', value: 'REVERSE'}, {name: 'LOWER', value: 'LOWER'}, {name: 'UPPER', value: 'UPPER'}, {name: 'INITCAP', value: 'INITCAP'}];
        }
        else if(COLTYPE == "NUMBER") 
        {
            this.funcArrcolumnprop = [{name: 'NONE', value: ''}, {name: 'SUM', value: 'SUM'}, {name: 'COUNT', value: 'COUNT'}, {name: 'DISTINCT COUNT', value: 'DISTINCT COUNT'}, {name: 'AVG', value: 'AVG'}, {name: 'MIN', value: 'MIN'}, {name: 'MAX', value: 'MAX'}, {name: 'TRUNC', value: 'TRUNC'}, {name: 'CEIL', value: 'CEIL'}, {name: 'ROUND', value: 'ROUND'}];
        }
        else if(COLTYPE == "DATE" || COLTYPE == "DATETIME") 
        {
             this.funcArrcolumnprop = [{name: 'NONE', value: ''}, {name: 'COUNT', value: 'COUNT'}, {name: 'DISTINCT COUNT', value: 'DISTINCT COUNT'}, {name: 'MIN', value: 'MIN'}, {name: 'MAX', value: 'MAX'}, {name: 'LAST_DAY', value: 'LAST_DAY'}];
        }
        else
        {
             this.funcArrcolumnprop = [{name: 'NONE', value: ''}, {name: 'AVG', value: 'AVG'}, {name: 'SUM', value: 'SUM'}, {name: 'MIN', value: 'MIN'}, {name: 'MAX', value: 'MAX'}];
        }
        //Changed by Vikas on 12-07-22 for display default function [End]
    }
    //Added by vikas on 6-07-22 for type selection Column [Start]
    onTypeChangecolumn(emptyexpansion,columnData: any)
    {
        columnData['FUNCTION'] = '';
        this.isExpandedcolumn(emptyexpansion,columnData['COLTYPE']);
        this.setExpressioncolumn(columnData);
    }
    //Added by vikas on 6-07-22 for type selection Column [Start]

    //Changed by Vikas on 12-07-22 for groupBy clause and Function Dropdown in Popup [Start]
    setExpressioncolumn(columnData: any)
    {
        let column = columnData;
        let val = column['FUNCTION'];
		let expr;
        if(val != undefined && val != '' && val != null)
		{
            if(column['DBTABLE'] != undefined && column['DBTABLE'] != null && column['DBTABLE'] != '')
            {
                expr = val == '' ? '' : val + '(' + column['DBTABLE'] + '.' + column['DBNAME'] + ')';
            }
            else
            {
                expr = val == '' ? '' : val + '(' + column['DBNAME'] + ')';
            }
            console.log("Print expr inside setexpression column outer if 114:::::",expr);
		}
        else if((val == undefined || val == '' || val == null) && column['DBTABLE'] != undefined && column['DBTABLE'] != null && column['DBTABLE'] != '')
		{
			expr = column['DBTABLE'] + '.' + column['DBNAME'];
            console.log("Print expr inside setexpression column outer else if:::::",expr);
		}
        else
		{
			expr = column['DBNAME'];
            console.log("Print expr inside setexpression column outer else:::::",expr);
		}
        columnData['expression'] = expr;
        if(this.SqlModelData != undefined && this.SqlModelData['SQLModel'] != undefined && this.SqlModelData['SQLModel'][this.param] != undefined)
        {
            let arrOfColumns = this.SqlModelData['SQLModel'][this.param][0]['COLUMN'];
            outerArrLoop:
            for(let i=0; i<arrOfColumns.length; i++)
            {
                let col = arrOfColumns[i];
                if(col['NAME'] == column['NAME'] && col['DBTABLE'] != undefined && column['DBTABLE'] != undefined && col['DBTABLE'] == column['DBTABLE'])
                {
                    col['expression'] = expr;
                    col['FUNCTION'] = val;
                    this.SqlModelData['SQLModel'][this.param][0]['COLUMN'][i] = col;
                    console.log('Print SetExpression value in sqleditor component::::'+ " " +columnData)
                    console.log("Print expr inside setexpression column inner if:::::",+" "+expr);
                    console.log("Print col inside setexpression column inner if:::::",+" "+col);
                    break outerArrLoop;
                }
                else if(col['NAME'] == column['NAME'] && col['DBNAME'] == column['DBNAME'])
                {
                    col['expression'] = expr;
                    col['FUNCTION'] = val;
                    this.SqlModelData['SQLModel'][this.param][0]['COLUMN'][i] = col;
                    break outerArrLoop;
                }
            }
        }
    }
    //Changed by Vikas on 12-07-22 for groupBy clause and Function Dropdown in Popup [end]
    

    //Added by Vikas on 06-07-22 for Close button Function [Start]
    closeFilterColumnProp(event:any)
    {
        let closeAction:any = {};
        closeAction['event'] = event;
        this.onCloseActionColumnProperty.emit(JSON.stringify(closeAction));
        for(var i = 0 ; i < this.currentVisual['ColumnGroups'].length;i++)
        {
             let currentGroupJson = this.currentVisual['ColumnGroups'][i];
             if(this.currentGroupName == this.currentVisual['ColumnGroups'][i]['GroupName'])
             {   
                 let currentColArray = this.currentVisual['ColumnGroups'][i]['COLUMNS'];
                 for(var j = 0; j< currentColArray.length;j++)
                 {
                     if(this.columnName == currentColArray[j]['NAME'])
                     {
                        this.currentVisual['ColumnGroups'][i]['COLUMNS'][j] = JSON.parse(this.closebuttoncolarray);
                         break;
                     }
                 }
                 break;
             }
        }
    }
     //Added by Vikas on 06-07-22 for Close button Function [end]

    //Added by vikas on 02-07-22 for Submit [Start]
    submit(event:any)
    {
        let doneAction:any = {};
        doneAction['event'] = event;
        doneAction['isSourceSqlChange'] = true;
        doneAction['currentVisual'] = this.currentVisual;
        this.columnOnDoneAction.emit(JSON.stringify(doneAction));
    }
    //Added by vikas on 02-07-22 for Submit [End]

    //Added by vikas for delete button functionality on 28-06-22 [Start]
    deleteColumnProperty(event: any)
    {
     let currentvisualcopy = {} = this.currentVisual;
     console.log('Print inside deleteColumnProperty event::::::::',event);
      console.log('Print deleteColumnProperty inside deleteCOlumn::::::',this.closebtncoljson);
     let deleteCol:any = {};
      for(var i = 0 ; i < currentvisualcopy['ColumnGroups'].length;i++)
      {
           let currentGroupJson = currentvisualcopy['ColumnGroups'][i];
           if(this.currentGroupName == currentvisualcopy['ColumnGroups'][i]['GroupName'])
           {   
               let currentColArray = currentvisualcopy['ColumnGroups'][i]['COLUMNS'];
               for(var j = 0; j< currentColArray.length;j++)
               {
                   if(this.columnName == currentColArray[j]['NAME'])
                   {
                       let closebtncoljson = currentvisualcopy['ColumnGroups'][i]['COLUMNS'][j];
                       this.currentVisual['ColumnGroups'][i]['COLUMNS'][j]['checked'] = false; 
                       closebtncoljson['isSourceSqlChange'] = true;
                       this.deleteColumn.emit(closebtncoljson);
                       break;
                   }
               }
               break;
           }
      }
    }
    //Added by vikas for delete button functionality on 28-06-22 [end]
    
    //Added by vikas for closing popup on close,delete and done on 28-06-22 [Start]
    closePropertiesPopup()
    {
      this.closeOnDeletePopup.emit();
    }
    //Added by vikas for closing popup on close,delete and done on 28-06-22 [end]

    //<!-- Added new field by vikas on 06-02-23 for mapping in visualinsight for grid [Start] -->
    onColumnHiddenSelection(hiddenvalue)
    {
        console.log('Print hiddenPropertyValue line no 212:::::',hiddenvalue)
    }
    //<!-- Added new field by vikas on 06-02-23 for mapping in visualinsight for grid [End] -->
    onColAlignmentSelection(event)
    {
        console.log('Print onColAlignmentSelection event line no 218:::::',event);
    }
}