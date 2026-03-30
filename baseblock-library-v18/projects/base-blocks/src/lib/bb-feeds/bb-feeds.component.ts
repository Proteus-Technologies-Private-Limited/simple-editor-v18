import { Component, OnInit, Input, OnChanges, EventEmitter, Output, SimpleChanges, ViewEncapsulation, ViewChild, TemplateRef } from "@angular/core";
import { MatAccordion } from '@angular/material/expansion';

@Component( {
    selector: 'bb-feeds',
    templateUrl: './bb-feeds.component.html',
    styleUrls: ['./bb-feeds.component.css'],
    // encapsulation: ViewEncapsulation.Emulated
})
export class BBFeedsComponent implements OnInit {

    @Input('data') feedData: any;
    feedArray = [];
    Object = Object;
    custImage1 = "/ibase/CustomMenuImageServlet?fldValue=";
    custImage2 = "&ALT_FLD_VALUE="+''+"&object=";
    custImage3 = "&objName=";
    custImage4 = "&isOval="+'true';
    objectKeys = Object.keys;
    isGroupsArray : boolean = false;
    @ViewChild(MatAccordion) accordion: MatAccordion | any;
    @Input('visualLayout') visualLayout: any;
    @Output() onDrillDown: EventEmitter<any> = new EventEmitter();
    @ViewChild( 'ftRowLftRef' ) ftRowLftRef: TemplateRef<any> | any;
    @Input() feedJsonData: any;
    // columnJsonArray: any = [];

    constructor() { }

    ngOnInit()
    {
        console.log("BB Feed Component-----:::::",this.feedData);
        /*for(let k=0; k< this.feedData.length; k++)
        {
            if(this.feedData[k]['sorting_col_name'] != undefined && this.feedData[k]['sorting_col_name'] != '')
            {
                let groupVal = this.feedData[k]['sorting_col_name'];
                if(groupVal == undefined)
                {
                    this.isGroupsArray = true;
                }
            }
        } */
        // Added by Samruddhi on 14-06-2022 for updated Json Array
        let groupNameJson = {};
        for(let k=0; k< this.feedData.length; k++)
        {
            groupNameJson = this.feedData[k];
            for(let key in groupNameJson)
            {
                if(Array.isArray(groupNameJson[key]))
                {
                    if(groupNameJson[key].length > 0)
                    {
                        for(let i = 0; i < groupNameJson[key].length; i++)
                        {
                            let groupVal = groupNameJson[key][i]['sorting_col_name'];
                            if(groupVal != undefined && groupVal.length > 0)
                            {
                                this.isGroupsArray = true;
                            }
                        }
                    }
                }
            }
        }
    }

    ngOnChanges(changes: SimpleChanges) 
    {
        console.log("Print data at line 80", this.feedData);
        let sortGrpVal = this.feedData['sorting_col_name'];
    }

    _onDrillDown(feedArray:any, drillColumnName:any, link_metadata: any) 
    {
        let columnJsonObj: any = {};
        if(drillColumnName != undefined)
        {
            columnJsonObj['drillColumnName'] = drillColumnName.toLowerCase();
        }
        if(link_metadata != undefined)
        {
            columnJsonObj['link_metadata'] = link_metadata;
        }
        else
        {
            columnJsonObj['link_metadata'] = this.visualLayout['link_metadata'];
        }

        for(const key of Object.keys(feedArray))
        {
            let columnArray = feedArray[key];
            if(columnArray != undefined && columnArray != '')
            {
                for(let j=0; j<columnArray.length; j++)
                {
                    let columnName = columnArray[j]['name'];
                    columnJsonObj[columnName] = columnArray[j]['value'];
                }
            }
        }

        console.log('Print columnJsonObj 104::::',columnJsonObj)
       
        this.onDrillDown.emit(columnJsonObj);
    }

}