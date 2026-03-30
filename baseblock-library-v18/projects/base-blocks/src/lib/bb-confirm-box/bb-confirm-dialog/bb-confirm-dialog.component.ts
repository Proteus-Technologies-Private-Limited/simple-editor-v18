import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';

@Component({
  selector: 'bb-confirm-dialog',
  templateUrl: './bb-confirm-dialog.component.html',
  styleUrls: ['./bb-confirm-dialog.component.css']
})
export class BBConfirmDialogComponent implements OnInit, OnDestroy {
  private keydownHandler: ((event: KeyboardEvent) => void) | null = null;
  private isClosed: boolean = false;
  title: string = "Error";
  message: string = '';
  confirmBox: boolean = false;
  successBox: boolean = false;
  showSummaryFlag: boolean = false;
  errorId = '';
  trace = '';
  summaryDaata: any;

    constructor(public dialogRef: MatDialogRef<BBConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      console.log('[BB-CONFIRM-DIALOG] constructor called, data:', data);
      if(data) {
        this.confirmBox = data.confirmBox;
        if(data.title != "")
        {
          this.title = data.title;
          if(this.title && this.title.toLowerCase() == "success")
          {
            this.confirmBox = true;
            this.successBox = true;
          }
        }
        this.message = data.message || 'An unknown error occurred';
      }
      dialogRef.disableClose = true;

      if(data && data.summaryData != null){
        this.summaryDaata = data.summaryData.split('%%SEP%%');
        this.errorId = this.summaryDaata[0];
        this.trace = this.summaryDaata[1];
      }

      // Since Angular template bindings don't work in this pre-compiled library component,
      // use direct DOM manipulation after the view renders
      setTimeout(() => {
        this.applyDomUpdates();
      }, 0);
  }

  ngOnInit() {
  }

  private applyDomUpdates() {
    // Set message
    const msgEl = document.querySelector('.bb-confirm-msg');
    if (msgEl) {
      msgEl.innerHTML = this.message;
    }

    // Show title for non-confirm (alert) dialogs
    if (!this.confirmBox) {
      const titleEl = document.getElementById('popup_title');
      const titleTextEl = document.getElementById('popup_title_text');
      if (titleEl) {
        titleEl.style.display = '';
      }
      if (titleTextEl) {
        titleTextEl.textContent = this.title;
      }
    }

    // Show CANCEL button for confirm dialogs (not success)
    if (this.confirmBox && !this.successBox) {
      const cancelBtn = document.getElementById('popup_cancel');
      if (cancelBtn) {
        cancelBtn.style.display = '';
        cancelBtn.onclick = () => this.onDismiss();
      }
    }

    // Add success class if needed
    if (this.successBox) {
      const imgEl = document.getElementById('popup_img');
      if (imgEl) {
        imgEl.classList.add('success-box');
      }
    }

    // Set up OK button click and auto-focus
    const okBtn = document.getElementById('popup_ok') as HTMLButtonElement;
    if (okBtn) {
      okBtn.onclick = () => this.onConfirm();
      okBtn.classList.add('btn-focused');
      okBtn.focus();
    }

    // Cache cancel button reference
    const cancelBtn = document.getElementById('popup_cancel') as HTMLButtonElement;
    const hasCancelBtn = cancelBtn && cancelBtn.style.display !== 'none';

    const setFocusOn = (btn: HTMLButtonElement) => {
      if(okBtn) { okBtn.classList.remove('btn-focused'); }
      if(cancelBtn) { cancelBtn.classList.remove('btn-focused'); }
      btn.classList.add('btn-focused');
      btn.focus();
    };

    // Set up keyboard navigation (Enter, ArrowLeft, ArrowRight)
    this.keydownHandler = (event: KeyboardEvent) => {
      if(event.key === 'Enter')
      {
        event.preventDefault();
        event.stopImmediatePropagation();
        if(hasCancelBtn && cancelBtn.classList.contains('btn-focused'))
        {
          this.onDismiss();
        }
        else
        {
          this.onConfirm();
        }
      }
      else if(event.key === 'ArrowLeft' || event.key === 'ArrowRight')
      {
        event.preventDefault();
        event.stopImmediatePropagation();
        if(event.key === 'ArrowLeft' && hasCancelBtn)
        {
          setFocusOn(cancelBtn);
        }
        else if(event.key === 'ArrowRight' && okBtn)
        {
          setFocusOn(okBtn);
        }
      }
    };
    document.addEventListener('keydown', this.keydownHandler, true);

    // Set up summary toggle on image click
    const imgEl = document.getElementById('popup_img');
    if (imgEl) {
      imgEl.onclick = () => this.toggleSummary();
    }

    // Set summary data
    const errorIdEl = document.getElementById('errorId');
    const traceEl = document.getElementById('errorTraceid');
    if (errorIdEl) {
      errorIdEl.textContent = this.errorId;
    }
    if (traceEl) {
      traceEl.textContent = this.trace;
    }
  }

  ngOnDestroy() {
    if(this.keydownHandler)
    {
      document.removeEventListener('keydown', this.keydownHandler, true);
      this.keydownHandler = null;
    }
  }

  onConfirm(): void {
    if(this.isClosed) return;
    this.isClosed = true;
    console.log('[BB-CONFIRM-DIALOG] onConfirm called, confirmBox:', this.confirmBox);
    if(this.confirmBox) {
      console.log('[BB-CONFIRM-DIALOG] closing with YES');
      this.dialogRef.close("YES");
    } else {
      console.log('[BB-CONFIRM-DIALOG] closing with true');
      this.dialogRef.close(true);
    }
  }

  onDismiss(): void {
    if(this.isClosed) return;
    this.isClosed = true;
    console.log('[BB-CONFIRM-DIALOG] onDismiss called, closing with NO');
    this.dialogRef.close("NO");
  }

 toggleSummary() {
  if(this.summaryDaata != null){
    this.showSummaryFlag = !this.showSummaryFlag;
    const summaryEl = document.getElementById('popup_summary');
    if (summaryEl) {
      summaryEl.style.display = this.showSummaryFlag ? '' : 'none';
    }
  }
}
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
