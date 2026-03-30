import { Injectable, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import 'rxjs/add/observable/from';
// import { Observable } from 'rxjs/Observable';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmBoxComponent } from '../shared/confirm-box/confirm-box.component';
//import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';
import { BBProgressSpinnerComponent } from 'base-blocks';

declare var getBBHostURL: any;

@Injectable()
export class TaxDetailsService 
{
    urlPath!: string;
    _url: string = "/ibase/WEBITMRIARequestHandlerServlet?";
    private _url1: string = "/ibase/E12EditorHandlerServlet?";
    private _url2: string = "/ibase/RIAWizardHandlerServlet?";
    confirmBox:any = null;
    isForcedSave: boolean = false;
    @ViewChild('bbSpinner') bbSpinner: BBProgressSpinnerComponent | any;
    constructor(private http: HttpClient, public dialog: MatDialog) 
    {
        this.confirmBox = new ConfirmBoxComponent(dialog);
    }
    isForceSave()
    {
        return this.isForcedSave;
    }
    
    setLoading(flag: boolean) 
    {
        try 
        {
            //(<any>window.parent).setLoading(flag);
		this.bbSpinner.setLoading(flag);
        }
        catch
        {
            console.log('this.bbSpinner.setLoading is not a function!!');
        }
    }
}
