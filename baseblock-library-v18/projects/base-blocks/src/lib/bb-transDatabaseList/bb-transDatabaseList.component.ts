import { Component, OnInit,OnChanges, Input, Output, EventEmitter,SimpleChanges } from '@angular/core';
import { ElementRef,ViewChild,ViewEncapsulation, ViewContainerRef, TemplateRef } from '@angular/core';
import { Overlay,OverlayConfig,OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal,Portal,TemplatePortal } from '@angular/cdk/portal';
import { BBtransTabWithListService } from '../bb-transTabWithList/bb-transTabWithList.service';
import { MatIconRegistry } from '@angular/material/icon';
import { BBtransDatabaseListService } from './bb-transDatabaseList.service';
@Component( {
    selector: 'bb-transDatabaseList',
    templateUrl: './bb-transDatabaseList.component.html',
    styleUrls: ['./bb-transDatabaseList.component.css']
})
export class BBtransDatabaseList {
 @Input() tabWithListClassData:any;
 @Output() onTabPopuClose : EventEmitter<any> = new EventEmitter<any>();
 @Output() onTabPopupDone : EventEmitter<any> = new EventEmitter<any>();
 @Output() onTabDoneData : EventEmitter<any> = new EventEmitter<any>();


    @ViewChild('criteriaSelectTable') criteriaSelectTable: TemplateRef<any> | any;
    currenSelectedTab : any;
    searchValue: any;
    selectTableData = {};
    likeValue = "";
    tableDetailArray:any;
    custImage1 = "/ibase/CustomMenuImageServlet?fldValue=";
    custImage2 = "&ALT_FLD_VALUE="+''+"&object=";
    custImage3 = "&objName=";
    custImage4 = "&isOval="+'false';
    @Input() editFlag = "";
    @Input() SqlModelData: any;
    oldSlectedTableDataArray = [];
    @Input() currentSelectedTables:any[] = [];
    @Input() currentDelectedTables:any[] = [];
    //Added by vikas for showing external database ui in schema designer
    showExternalDatabase:any  = false;
    extDbFeed:any = [];
    currentSelectedDb:any;
    externaldatasource:boolean = true;
    @Output() oncurrentSelectedDb : EventEmitter<any> = new EventEmitter<any>();
    constructor( public overlay: Overlay,private viewContainerRef: ViewContainerRef,
     private sqlService : BBtransTabWithListService,private BBDatabaseListService:BBtransDatabaseListService) {}
    ngOnInit()
    {
       console.log('Print tabWithListClassData 38::::::', this.tabWithListClassData);
    }
    ngOnChanges(changes: SimpleChanges)
    {
        console.log('Print tabWithListClassData 42::::::', this.tabWithListClassData);
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

    onDone(event: any)
    {
        var allData: any = {};
        allData['currenSelectedTab'] = this.currenSelectedTab 
        allData['likeValue'] = this.likeValue;
        allData['isSelectTable'] =  false;
        this.onTabPopupDone.emit(JSON.stringify(allData));
    }

    closeTabPopup(event: any)
    {
        this.onTabPopuClose.emit(this.tabWithListClassData);
    }
    //Changed by vikas for showing alert when clicked on select table without selecting feed [Start]
    onSelectTable()
    {
        if(this.currenSelectedTab['name'] == 'External Data Source' && this.currentSelectedDb == undefined)
        {
            window.alert("Please select a database to get Tables");
        }
        else
        {
            var allData: any = {};
            allData['currenSelectedTab'] = this.currenSelectedTab 
            allData['likeValue'] = this.likeValue;
            allData['isSelectTable'] =  true;
            this.onTabPopupDone.emit(JSON.stringify(allData));
        }
    }
    //Changed by vikas for showing alert when clicked on select table without selecting feed [end]
    //Changed by Vikas on 24-9-22 for showing external data source [Start]
    setCheckValue(  currentTab: any )
    {
        var tabArray = {} = this.tabWithListClassData['tabDetails'];
        for(let i = 0; i < tabArray.length; i++)
        {
            if( currentTab['name'] == tabArray[i]['name'] )
            {
                tabArray[i]['checked'] = true;
                this.currenSelectedTab = tabArray[i];
                console.log("currenSelectedTab line no 112 inside onselecttable::::",this.currenSelectedTab);
            }
            else
            {
                tabArray[i]['checked'] = false;
            }
        }
        if(currentTab['name'] == 'External Data Source')
        {
            this.showExternalDatabase = true;
            this.externaldatasource = true;
            console.log('Clicked Successfully');
            let paramMap:any = {};
            var url = this.sqlService.getHostURL() + '/ibase/rest/TransDatabasecatlog/getExtDBConnection';
            var paramString = this.sqlService.getEncodedParamString(paramMap);
            this.sqlService.setLoading(true);
            this.BBDatabaseListService.callRequest(url,paramString).subscribe(response=>{
            //console.log('Print getExtDBConnection line no 103:::::',response);
            this.BBDatabaseListService.setLoading(false);
            this.extDbFeed = [];
            this.extDbFeed = JSON.parse(response);
            console.log('Print this.extDbFeed:::::',this.extDbFeed);
            })
        }
        else
        {
            this.showExternalDatabase = false;
        }
    }
    //Changed by Vikas on 24-9-22 for showing external data source [end]

    //Added by vikas on 07-09-22 for database connection name search box [Start]
        getFilterDatabaseList()
        {
            let paramMap:any = {};
            paramMap['conn_name'] = this.likeValue
            var url = this.sqlService.getHostURL() + '/ibase/rest/TransDatabasecatlog/getExtDBConnection';
            var paramString = this.sqlService.getEncodedParamString(paramMap);
            this.sqlService.setLoading(true);
            this.BBDatabaseListService.callRequest(url,paramString).subscribe(response=>{
            console.log('Print getExtDBConnection line no 103:::::',response);
            this.BBDatabaseListService.setLoading(false);
            this.extDbFeed = [];
            this.extDbFeed = JSON.parse(response);
            })
            this.likeValue = '';
        }
        //Added by vikas on 07-09-22 for database connection name search box [end]

        //Added by vikas on 02-09-22 for selecting active connection name [Start]
        onSelectDatabaseFeed(feedData:any,index:any)
        {
            var id = "DataMatIcon_"+index;
            console.log('id::::::',id);
            if( document.getElementById(id) != null)
            {
                if(feedData['checked'] == true)
                {
                    document.getElementById(id)!.style.display = "block !important";
                    this.currentSelectedDb = feedData;

                    var finalcurrentSelectedDb:any = JSON.stringify(this.currentSelectedDb)
                    this.oncurrentSelectedDb.emit(finalcurrentSelectedDb);
                    for(var i = 0; i < this.extDbFeed.length; i++)
                    {
                        if(this.currentSelectedDb['CONN_NAME'] == this.extDbFeed[i]['CONN_NAME'] && this.currentSelectedDb['DB_CONN_ID'] == this.extDbFeed[i]['DB_CONN_ID'])
                        {
                            this.extDbFeed[i]['checked'] = true;
                            console.log('Print Feeddata value line no 189 inside if loop:::',this.currentSelectedDb);
                        }
                        else
                        {
                            this.extDbFeed[i]['checked'] = false;
                          //  console.log('Print Feeddata value line no 195 inside else loop:::',this.currentSelectedDb);
                        }
                    }
                }
                else if(feedData['checked'] == false)
                {
                  document.getElementById(id)!.style.display = "none !important";
                }
            }
        }
        //Added by vikas on 02-09-22 for selecting active connection name [end]
}