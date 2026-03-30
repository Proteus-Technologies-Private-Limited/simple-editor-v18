import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {
  title: string = "Error";
  message: string;
  confirmBox: boolean;
  successBox: boolean = false;
  // changes made by Mahesh Saggam on 17-JUNE-2020 [to show summary on click of error image] Start
  showSummaryFlag: boolean = false;
  errorId = '';
  trace = '';
  summaryDaata;
  // changes made by Mahesh Saggam on 17-JUNE-2020 [to show summary on click of error image] End
    constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel) {
      this.confirmBox = data.confirmBox;
      if(data.title != "")
      {
        this.title = data.title;
        if(this.title.toLowerCase() == "success")
        {
          this.confirmBox = true;
          this.successBox = true;
        }
      }
      this.message = data.message;
      dialogRef.disableClose = true;
      
      console.log('Is summaryData exists:::: ', data.summaryData);
      if(data.summaryData != null){
        this.summaryDaata = data.summaryData.split('%%SEP%%');
        this.errorId = this.summaryDaata[0];
        this.trace = this.summaryDaata[1];
      }
  }

  ngOnInit() {
    console.log("title["+this.title+"]cconfirm box["+this.confirmBox+"]succss box["+this.successBox+"]");
  }

  onConfirm(): void {
    if(this.confirmBox)
    this.dialogRef.close("YES");
    else
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    this.dialogRef.close("NO");
  }
 // changes made by Mahesh Saggam on 17-JUNE-2020 [to show summary on click of error image] Start
 toggleSummary() {
  if(this.summaryDaata != null){
    this.showSummaryFlag = !this.showSummaryFlag;
  }
}
// changes made by Mahesh Saggam on 17-JUNE-2020 [to show summary on click of error image] End
}

/**
 * Class to represent confirm dialog model.
 *
 * It has been kept here to keep it as part of shared component.
 */
export class ConfirmDialogModel {
// changes made by Mahesh Saggam on 17-JUNE-2020 [to show summary on click of error image]
constructor(public title: string, public message: string, public confirmBox:boolean, public summaryData?: any) {
    
  }
}
