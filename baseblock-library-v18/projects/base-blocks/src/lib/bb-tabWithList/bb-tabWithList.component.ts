import { Component, OnInit,OnChanges, Input, Output, EventEmitter,SimpleChanges } from '@angular/core';
import { ElementRef,ViewChild,ViewEncapsulation, ViewContainerRef, TemplateRef } from '@angular/core';
import { Overlay,OverlayConfig,OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal,Portal,TemplatePortal } from '@angular/cdk/portal';
import { BBtabWithListService } from './bb-tabWithList.service';
import { BBDatabaseListService } from '../bb-databaseList/bb-databaseList.service';


@Component( {
    selector: 'bb-tabWithList',
    templateUrl: './bb-tabWithList.component.html',
    styleUrls: ['./bb-tabWithList.component.css']
})
export class BBtabWithList {
 @Input() tabWithListClassData:any;
 @Output() onTabPopuClose : EventEmitter<any> = new EventEmitter<any>();
 @Output() onTabDoneData : EventEmitter<any> = new EventEmitter<any>();
    @Input() currenSelectedTab : any;
    searchValue: any;
    @Input() selectTableData:any = {};
    likeValue = "";
    @Input() tableDetailArray:any;
    custImage1 = "/ibase/CustomMenuImageServlet?fldValue=";
    custImage2 = "&ALT_FLD_VALUE="+''+"&object=";
    custImage3 = "&objName=";
    custImage4 = "&isOval="+'false';
    @Input() editFlag = "";
    @Input() SqlModelData: any;
    @Input() oldSlectedTableDataArray:any[] = [];
    @Output() overLayForListTabFromEnterClick : EventEmitter<any> = new EventEmitter<any>();
    //Added by shrutika on 12-10-21 for select deselect functionality for schema designer.
    @Input() currentSelectedTables:any[] = [];
    @Input() currentDelectedTables:any[] = [];
    //Added by vikas for external data source [Start]
    @Input() currentSelectedTabDb:any;
    @Input() currentDbDetails:any;
    //Added by vikas for external data source [end]
 //currentFeedArray = [];
    constructor( public overlay: Overlay,private viewContainerRef: ViewContainerRef,
    private sqlService : BBtabWithListService,private BBDatabaseListService:BBDatabaseListService) {}
    ngOnInit()
    {
        console.log('Print currentSelectedTabDb inside ngoninit',this.currentSelectedTabDb);
    }
    ngOnChanges(changes: SimpleChanges)
    {
        for (const propName in changes) 
        {
            if (changes.hasOwnProperty(propName)) 
            {
                switch (propName) {
                    case 'tabWithListClassData': 
                    {
                        if( this.tabWithListClassData != undefined && this.tabWithListClassData['tabDetails'] != undefined )
                        {
                            for(var i= 0; i<this.tabWithListClassData['tabDetails'].length; i++ )
                            {
                                if( this.tabWithListClassData['tabDetails'][i]['checked']  == true)
                                {
                                    console.log("line no 57 tabledetailarray:::",this.tableDetailArray);
                                    this.currenSelectedTab = this.tabWithListClassData['tabDetails'][i];
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }


    closeTabWithListPopup(event:any)
    {
        this.onTabPopuClose.emit(this.tabWithListClassData);
    }

    //Changed by vikas for external data source done functionality on 06-09-22 [Start]
    onDoneSelectTable( event:any )
    {
    try 
    {
        if( document.getElementById("criteriaSelect70") != undefined )
        {
            document.getElementById("criteriaSelect70")!.style.display = "none";
        }
        var slectedTableDataArray: any = [];
        var selectedTableArray: any = []
        for(let i = 0; i < this.tableDetailArray.length; i++)
        {
            if(this.tableDetailArray[i]['checked'])
            {
                var currentTableName:any = this.tableDetailArray[i]['TABLE_NAME'];
                selectedTableArray.push(currentTableName);
                console.log("line no 90 tabledetailarray:::",this.tableDetailArray);
                if( !this.oldSlectedTableDataArray.includes(currentTableName) )
                {
                    slectedTableDataArray.push(this.tableDetailArray[i]['TABLE_NAME']);
                }
            }
        }
        let paramMap:any = {};
      //  paramMap["databaseName"] = this.currenSelectedTab['name'];
        //for setting dbdetails on done button in edit mode [Start]
        this.currentSelectedTabDb = this.currentDbDetails
        console.log('Print dbdetails in tabwithlist component line no 102::::',this.currentDbDetails);
        //for setting dbdetails on done button in edit mode [end]
        paramMap["tableName"] = slectedTableDataArray;
        /* if(this.currenSelectedTab['name'] == 'External Data Source')
        {   
            paramMap["databaseName"] = "ExtDBConnection"
            paramMap["dbDetails"] = this.currentSelectedTabDb; 
        }
        else
        {
            paramMap["dbDetails"] = ""
            paramMap["databaseName"] = this.currenSelectedTab['name'];
        } */

        if(this.currenSelectedTab['name'] == 'External Data Source')
        {   
            paramMap["databaseName"] = "E"
            paramMap["dbDetails"] = this.currentSelectedTabDb; 
        }
        else if(this.currenSelectedTab['name'] == 'OLTP')
        {
            paramMap["dbDetails"] = ""
            paramMap["databaseName"] = "O";
        }
        else if(this.currenSelectedTab['name'] == 'InMemeory')
        {
            paramMap["dbDetails"] = ""
            paramMap["databaseName"] = "I";
        }
        console.log("ParamMap line no 135 in tabwithList:::::",paramMap);
        console.log("Print currentSelectedTabDb line no 112 in tabwithList",this.currentSelectedTabDb);
        var url = this.sqlService.getHostURL() + '/ibase/rest/Databasecatlog/table/structure';
        var paramString = this.sqlService.getEncodedParamString(paramMap);
        this.sqlService.setLoading(true);
        this.sqlService.callRequest(url, paramString).subscribe( (data:any) =>
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
                console.log("data line no 129:::",data)
                data = JSON.parse(data);
                var allDataJson:any= {};
                // var selectedTableArray: any = []
                if( data instanceof Array )
                {
                    /* if( data instanceof Array )
                    {
                        //this.oldSlectedTableDataArray = [];
                        for(var i=0;i<data.length;i++ )
                        {
                            console.log('inside after getting response....248');
                            //this.oldSlectedTableDataArray.push(data[i]['TABLE_NAME']);
                            selectedTableArray.push(data[i]['TABLE_NAME']);
                        }
                        console.log('inside after getting response....252',this.oldSlectedTableDataArray);
                     } */
                    allDataJson['tablesArray'] = data;
                    allDataJson['currenSelectedTab'] = this.currenSelectedTab;
                    allDataJson['selectedTableArray'] = selectedTableArray;
    		   //Added by shrutika on 12-10-21 for select deselect functionality for schema designer.
                    allDataJson['currentDeselectedData'] = this.currentDelectedTables;
                    this.onTabDoneData.emit(JSON.stringify(allDataJson));
                }
               
            }
            catch(error)
            {
                console.log('Exception inside onDoneSelectTable webservice..',error);
            }
        });
    }
    catch(error)
    {
        console.log('Exception inside onDoneSelectTable',error);
    }

  }
  //Changed by vikas for external data source done functionality on 06-09-22 [end]

    setCheckValue(  currentTab:any )
    {
        var tabArray = {} = this.tabWithListClassData['tabDetails'];
        for(let i = 0; i < tabArray.length; i++)
        {
            if( currentTab['name'] == tabArray[i]['name'] )
            {
                tabArray[i]['checked'] = true;
                this.currenSelectedTab = tabArray[i];
            }
            else
            {
                tabArray[i]['checked'] = false;
            }
        }
    }


    onSelectTableFeed(feedData:any,index:any)
    {
      var id = "tableDataMatIcon_"+index;
      if( document.getElementById(id) != null)
      {
          if( feedData['checked'] )
          {
            console.log("Print feedData line no 194:::::",feedData);
            console.log("Print currentselecteddb line no 193 inside tblist::::::::::",this.currentSelectedTabDb);
            document.getElementById(id)!.style.display = "block";
	        //Added by shrutika on 12-10-21 for select deselect functionality for schema designer [Start]
              if( !this.currentSelectedTables.includes(feedData['TABLE_NAME']))
              {
                    this.currentSelectedTables.push(feedData['TABLE_NAME']);
              }
              if( this.currentDelectedTables.includes(feedData['TABLE_NAME']))
              {
                for( var i = 0; i < this.currentDelectedTables.length; i++)
                { 
                     if ( this.currentDelectedTables[i] === feedData['TABLE_NAME']) 
                     { 
                         this.currentDelectedTables.splice(i, 1); 
                     }
                 }
              }
              //Added by shrutika on 12-10-21 for select deselect functionality for schema designer[End]
          }
          else
          {
	    //Added by shrutika on 12-10-21 for select deselect functionality for schema designer.[Start]
              if( !this.currentDelectedTables.includes(feedData['TABLE_NAME']) )
              {
                    this.currentDelectedTables.push(feedData['TABLE_NAME']);
              }
             if( this.currentSelectedTables.includes(feedData['TABLE_NAME']) )
             {
               for( var i = 0; i < this.currentSelectedTables.length; i++)
               { 
                    if ( this.currentSelectedTables[i] === feedData['TABLE_NAME']) 
                    { 
                        this.currentSelectedTables.splice(i, 1); 
                    }
                }
             }
	    //Added by shrutika on 12-10-21 for select deselect functionality for schema designer.[End]
              document.getElementById(id)!.style.display = "none";
          }
      }
  }

    changeCheckBox(tableData:any)
    {
     console.log( 'inside changeCheckBox.....',tableData);
     tableData['checked'] = true;
    }

    
    onSelectTable()
    {
        let paramMap:any = {};
        //  paramMap["databaseName"] = this.currenSelectedTab['name'];
        paramMap["tableName"] = this.likeValue;
        paramMap["maxCount"] = "500";
        //for setting dbdetails on search button in popup of edit mode [Start]
        this.currentSelectedTabDb = this.currentDbDetails
        console.log('Print dbdetails in tabwithlist component line no 251::::',this.currentDbDetails);
        //for setting dbdetails on search button in popup of edit mode [end]
        console.log('Print currenSelectedTab in tabwithlist 261::::::::::',this.currenSelectedTab);
        if(this.currenSelectedTab['name'] == 'External Data Source')
        {   
            // paramMap["databaseName"] = "ExtDBConnection"
            paramMap["databaseName"] = "E";
            paramMap["dbDetails"] = this.currentSelectedTabDb; 
            var url = this.sqlService.getHostURL() + '/ibase/rest/Databasecatlog/getTables';
            console.log("Print paramMap line no 254::::::",paramMap);
            console.log("Print doneFeeddata line no 255::::::",this.currentSelectedTabDb);
        }
        else
        {
            paramMap["dbDetails"] = ""
            paramMap["databaseName"] = this.currenSelectedTab['name'];
            var url = this.sqlService.getHostURL() + '/ibase/rest/Databasecatlog/tables';
            console.log("Print paramMap line no 262::::::",paramMap);
            console.log("Print doneFeeddata line no 264::::::",this.currentSelectedTabDb);
        }
            console.log('paramMap line no 252:::::',paramMap);
        //  var url = this.sqlService.getHostURL() + '/ibase/rest/Databasecatlog/tables';
        var paramString = this.sqlService.getEncodedParamString(paramMap);
        this.sqlService.setLoading(true);
        this.sqlService.callRequest(url, paramString).subscribe( (data:any) =>
        {
        try 
        {
	    //Added by shrutika on 18-10-21 for display error [Start]
            this.sqlService.setLoading(false);
            if (data.indexOf('Errors') != -1) 
            {
                this.displayError(data);
                return;
            }
	   //Added by shrutika on 18-10-21 for display error [End]
            console.log('Print data line no 282::::::',data);
            var responseData = JSON.parse(data);
            console.log("responseData line no 283::::::",responseData);
            if ( responseData['Root']['TABLEDETAILS'] instanceof Array) 
            {
                this.tableDetailArray = [];
                this.tableDetailArray = responseData['Root']['TABLEDETAILS'];
                console.log("line no 252 tabledetailarray:::",this.tableDetailArray);
            }
            else
            {
                this.tableDetailArray = [];
                this.tableDetailArray.push(responseData['Root']['TABLEDETAILS']);
                console.log("line no 258 tabledetailarray:::",this.tableDetailArray);
            }
	   //Change by shrutika on 07-10-21 for after enter click if selected table present the  issue occur.
            var firstListTableNames:any = [];
            this.tableDetailArray.forEach((item:any) => {
                firstListTableNames.push(item['TABLE_NAME'].trim());
              	//Added by shrutika on 13-10-21 for if deselect old tables then it remove from treee view,columns
		if( this.oldSlectedTableDataArray.includes(item['TABLE_NAME']) && !this.currentDelectedTables.includes(item['TABLE_NAME']) )
                {
                    item['checked'] = true;
                }
    		//Added by shrutika on 12-10-21 for select deselect functionality for schema designer.
                else if( this.currentSelectedTables.includes(item['TABLE_NAME']))
                {
                    item['checked'] = true;
                }
            });
	        for(var i=0;i< this.oldSlectedTableDataArray.length; i++ )
	        {
	            //if(firstListTableNames != undefined && firstListTableNames.indexOf(this.oldSlectedTableDataArray[i].trim()) !== -1)
	            if(firstListTableNames != undefined && !firstListTableNames.toString().includes(this.oldSlectedTableDataArray[i].trim()))
	            {
	                var currentTableJson:any = {};
	                currentTableJson['TABLE_NAME'] = this.oldSlectedTableDataArray[i];
	                currentTableJson['checked'] = true;
	                this.tableDetailArray.push(currentTableJson);
	            }
	        }
            this.sqlService.setLoading(false);
           this.selectTableData= [];
            this.selectTableData['popupName'] = "Add Table";
            this.selectTableData['popupDescription'] = "Select the tables to be added";
            this.selectTableData['currenSelectedTab'] = this.currenSelectedTab;
    	   //Added by shrutika on 12-10-21 for select deselect functionality for schema designer.[Start]
            for(var i=0;i<this.currentSelectedTables.length;i++)
            {
                if(this.tableDetailArray.some((item:any) => item['TABLE_NAME'] === this.currentSelectedTables[i]))
                {
                    console.log("tablePresent");
                }
                else
                {
                    var currentTableJson:any = {};
	                currentTableJson['TABLE_NAME']= this.currentSelectedTables[i];
	                currentTableJson['checked'] = true;
	                this.tableDetailArray.push(currentTableJson);
                }
            }
	    //Added by shrutika on 12-10-21 for select deselect functionality for schema designer.[End]           
            
            var newData:any = {}
            newData['selectTableData'] = this.selectTableData;
            newData['tableDetailArray'] = this.tableDetailArray;
            newData['tabWithListClassData'] = this.tabWithListClassData;
            this.overLayForListTabFromEnterClick.emit(JSON.stringify(newData));

            
        }
        catch(error)
        {
            console.log('Exception inside onSelectTable',error);
        }
    });
}

//Added by shrutika on 18-10-21 for display error [Start]
displayError(response:any)
{
    var errorDom = new Document();
    var parser = new DOMParser();
    errorDom = parser.parseFromString(response, "text/xml");
    var errorType;
    var errorId;
    var msg:any = "";
    var descr:any = "";
    var trace:any = "";
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


//Added by shrutika on 18-10-21 for display error [End]
}