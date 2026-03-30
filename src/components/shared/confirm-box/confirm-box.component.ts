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

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData,
      autoFocus: false
    });
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
  alert(title:string, message:string, summary?: any) :Observable<string> {
    console.log('[BB-CONFIRM-BOX] alert() called with title:', title, 'message:', message, 'summary:', summary);
    const dialogData = new ConfirmDialogModel(title, message, false, summary);
    console.log('[BB-CONFIRM-BOX] dialogData:', JSON.stringify(dialogData));

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData,
      autoFocus: false
    });
    setTimeout(()=>{

      dialogRef.afterClosed().subscribe(dialogResult => {
        console.log('[BB-CONFIRM-BOX] alert afterClosed, dialogResult:', dialogResult);
        this.alertResult.next(dialogResult);
        this.alertResult = new BehaviorSubject<any>(false);
      });
    },10);
    return this.alertResult;
  }
}