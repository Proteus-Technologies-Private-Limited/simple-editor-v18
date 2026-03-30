import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, AfterViewInit, Inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Component({
  selector: 'confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit, AfterViewInit {
  title: string = "Error";
  message: string = '';
  safeMessage: SafeHtml = '';
  confirmBox: boolean;
  successBox: boolean = false;
  // changes made by Mahesh Saggam on 17-JUNE-2020 [to show summary on click of error image] Start
  showSummaryFlag: boolean = false;
  errorId = '';
  trace = '';
  summaryDaata: any;
  // changes made by Mahesh Saggam on 17-JUNE-2020 [to show summary on click of error image] End
    constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel,
    private sanitizer: DomSanitizer) {
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
      this.message = data.message || 'An unknown error occurred';
      this.safeMessage = this.sanitizer.bypassSecurityTrustHtml(this.message);
      dialogRef.disableClose = true;

      console.log('[CONFIRM-DIALOG] this.message set to:', this.message);
      console.log('[CONFIRM-DIALOG] this.safeMessage set to:', this.safeMessage);
      if(data.summaryData != null){
        this.summaryDaata = data.summaryData.split('%%SEP%%');
        this.errorId = this.summaryDaata[0];
        this.trace = this.summaryDaata[1];
      }
  }

  ngOnInit() {
    console.log("title["+this.title+"]cconfirm box["+this.confirmBox+"]succss box["+this.successBox+"]");
  }

  ngAfterViewInit() {
    // Auto-focus OK button when dialog opens
    setTimeout(() => {
      let okEl = document.getElementById('popup_ok') as HTMLButtonElement;
      if(okEl)
      {
        okEl.focus();
      }
    }, 200);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    let okEl = document.getElementById('popup_ok') as HTMLButtonElement;
    let cancelEl = document.getElementById('popup_cancel') as HTMLButtonElement;

    if(event.key === 'Enter')
    {
      event.preventDefault();
      // If Cancel button is focused, trigger dismiss; otherwise trigger OK
      if(cancelEl && document.activeElement === cancelEl)
      {
        this.onDismiss();
      }
      else
      {
        this.onConfirm();
      }
    }
    else if(event.key === 'ArrowLeft')
    {
      event.preventDefault();
      // Focus Cancel button if it exists, otherwise stay on OK
      if(cancelEl)
      {
        cancelEl.focus();
      }
    }
    else if(event.key === 'ArrowRight')
    {
      event.preventDefault();
      // Focus OK button
      if(okEl)
      {
        okEl.focus();
      }
    }
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
constructor(public title: string, public message: string, public confirmBox:boolean, public summaryData?:any) {
    
  }
}
