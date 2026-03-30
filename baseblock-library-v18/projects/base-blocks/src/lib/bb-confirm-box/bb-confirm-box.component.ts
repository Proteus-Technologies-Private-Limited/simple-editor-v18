import { Component } from '@angular/core';
import { ConfirmDialogModel, BBConfirmDialogComponent } from './bb-confirm-dialog/bb-confirm-dialog.component';
// import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatDialog } from '@angular/material/dialog';
import { Observable, BehaviorSubject } from 'rxjs';
@Component({
  selector: 'bb-confirm-box',
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
export class BBConfirmBoxComponent {
  result = new BehaviorSubject<string>("");
  alertResult = new BehaviorSubject<any>(false);


  constructor(public dialog: MatDialog) { }


  confirm(title: string, message: string, callback: any) {
    console.log('bbconfirmBox result!!');
    console.log('bbconfirmBox Thread run::::4');
    const dialogData = new ConfirmDialogModel(title, message, true);

    const dialogRef = this.dialog.open(BBConfirmDialogComponent, {
      width: "400px",
      maxWidth: "90vw",
      data: dialogData,
      panelClass: 'bb-confirm-dialog-panel',
      autoFocus: false,
      restoreFocus: false
    });
    // setTimeout(()=>{

    dialogRef.afterClosed().subscribe(dialogResult => {
      console.log('[BB-CONFIRM-BOX] confirm afterClosed, dialogResult:', dialogResult);
      this.result.next(dialogResult);
      console.log('[BB-CONFIRM-BOX] confirm result.value:', this.result.value);
      callback(this.result.value);
    });
    // },10);
    console.log('bbconfirmBox Thread run::::5');

  }
  // changes made by Mahesh Saggam on 17-JUNE-2020 [to show summary on click of error image]
  alert(title: string, message: string, summary?: any): Observable<string> {
    console.log('[BB-CONFIRM-BOX] alert() called with title:', title, 'message:', message, 'summary:', summary);
    console.log('[BB-CONFIRM-BOX] message type:', typeof message, 'message length:', message ? message.length : 'null');
    const dialogData = new ConfirmDialogModel(title, message, false, summary);
    console.log('[BB-CONFIRM-BOX] dialogData:', JSON.stringify(dialogData));

    const dialogRef = this.dialog.open(BBConfirmDialogComponent, {
      width: "400px",
      maxWidth: "90vw",
      data: dialogData,
      panelClass: 'bb-confirm-dialog-panel',
      autoFocus: false,
      restoreFocus: false
    });
    // setTimeout(()=>{

    dialogRef.afterClosed().subscribe(dialogResult => {
      this.alertResult.next(dialogResult);
      //console.log("result.value>>"+this.result.value);
      this.alertResult = new BehaviorSubject<any>(false);
    });
    // },10);
    return this.alertResult;
  }
}