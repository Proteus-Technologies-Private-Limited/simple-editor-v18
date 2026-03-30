import { Component } from '@angular/core';
import { ConfirmDialogModel, ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable, BehaviorSubject } from 'rxjs';
@Component({
  selector: 'confirm-box',
  template: ``,
})
/**
 * For using this, need to import and declare below code in contructor
 *  import { MatDialog } from '@angular/material';
 * constructor(public dialog: MatDialog) { ConfirmBox = new ConfirmBoxComponent(dialog); }
 * To call confirm box follow: ConfirmBox.confirmDialog(title,message);
 * Eg. 
   ConfirmBox.confirmDialog("Warning!!","Are you sure?").subscribe( result =>{
    if(result == "YES"){ console.log("next code here"); }
    else if (result == "NO") { console.log("cancel code hear"); } 
  });
 */
export class ConfirmBoxComponent {
  result =  new BehaviorSubject<string>(""); 
  alertResult =  new BehaviorSubject<any>(false); 

  
  constructor(public dialog: MatDialog){}

  confirm(title:string, message:string) :Observable<string> {
    console.log('confirm result!!');
    const dialogData = new ConfirmDialogModel(title, message, true);
     console.log('inside confirm..........30dialogData[',dialogData);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
        console.log('inside confirm..........35'); 
        
    setTimeout(()=>{

      dialogRef.afterClosed().subscribe(dialogResult => {
        this.result.next(dialogResult);
        //console.log("result.value>>"+this.result.value);
        this.result = new BehaviorSubject<any>("");
      });
    },10);
    return this.result;
  }
  // changes made by Mahesh Saggam on 17-JUNE-2020 [to show summary on click of error image]
  alert(title:string, message:string, summary?:any) :Observable<string> {
    console.log('alert result!!');
    const dialogData = new ConfirmDialogModel(title, message, false, summary);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    setTimeout(()=>{

      dialogRef.afterClosed().subscribe(dialogResult => {
        this.alertResult.next(dialogResult);
        //console.log("result.value>>"+this.result.value);
        this.alertResult = new BehaviorSubject<any>(false);
      });
    },10);
    return this.alertResult;
  }
}