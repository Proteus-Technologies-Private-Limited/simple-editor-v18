import { Component, OnInit, Input, OnChanges, EventEmitter, Output, SimpleChanges, ViewEncapsulation, ViewChild, TemplateRef, forwardRef } from "@angular/core";
import { MatAccordion } from '@angular/material/expansion';
import { BBSetRowCountService } from "./bb-set-row-count.service";
import { E, L } from "@angular/cdk/keycodes";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: 'bb-set-row-count',
  templateUrl: './bb-set-row-count.component.html',
  styleUrls: ['./bb-set-row-count.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BBSetRowCountComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.Emulated
})
export class BBSetRowCountComponent implements OnInit, ControlValueAccessor {
  numRows: number | null = null;
  // isPopupVisible: boolean = true;
  userInput: any = '';
  defaultRowHeight: number = 60;
  tableHeight: string;
  @Input('compData') compData: any;
  @Input('formNo') formNo: any;
  @Input('Data') allformValues: any;
  @Input('isPopupVisible') isPopupVisible: boolean;
  prefValue: any
  rowCountForDetail: boolean = false;
  finalUserRowCount: any = [];
  newRowHeightMul: any;
  innerValue: any;
  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };
  @Output() closeRowCountPopup: EventEmitter<any> = new EventEmitter<any>()

  constructor(private bbSetRowCountService: BBSetRowCountService) { }

  writeValue(value: any): void {
    this.innerValue = value;
    // update UI if necessary
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // handle disabling input if needed
  }

  // call this method when your component changes value
  updateValue(value: any) {
    this.innerValue = value;
    this.onChange(value);
    this.onTouched();
  }

  ngOnInit(): void {

  }

  closePopup() {
    /* const popupElement = document.getElementById('detail_' + this.formNo);
      if (popupElement) 
      {
        popupElement.style.display = 'none';  // Hide the popup
      } */
    let data = {}
    data['FORM_NO'] = this.formNo;
    data['openRowCount'] = false;
    this.closeRowCountPopup.emit(data);
  }

  adjustedHeight(formNo: any): Promise<void> { 
    return new Promise((resolve, reject) => {
			try
			{
        this.newRowHeightMul = Number(this.userInput);
        if (!isNaN(this.newRowHeightMul) && this.newRowHeightMul > 1) 
        {
          const tableHeight = this.newRowHeightMul * this.defaultRowHeight;
          const tableEle = document.getElementById('tableDetail_' + this.formNo);
          // try {
          if (tableEle) 
          {
            tableEle.setAttribute('style', `height: ${tableHeight}px !important`);
            if (this.allformValues['Detail' + formNo]) 
            {
              this.finalUserRowCount = this.allformValues['Detail' + formNo].length + this.newRowHeightMul;
            } 
            else 
            {
              this.finalUserRowCount = this.newRowHeightMul;
            }
          }
        }
        setTimeout(() => {
          resolve(); // Resolve the promise when done
        }, 0);
      } 
      catch (e: any) {
        console.log("Exceotion e", e);
        reject(e);
      }
    });
    // this.closePopup();
  }

  applySetRow(formNo: any) {
    let prefValue = this.newRowHeightMul;
    let prefName = "row_count_" + formNo;
    this.adjustedHeight(formNo)
    .then(() => {
      this.setUserPref(prefValue, prefName);
    });
  }


  setUserPref(value: any, prefName: any) {
    let paramMap: any = {};
    paramMap['ACTION'] = 'SET_USER_PREF';
    paramMap['PREF_VAL'] = value;
    paramMap['OBJ_NAME'] = this.compData["OBJ_NAME"];
    paramMap['PREF_NAME'] = prefName;
    paramMap['PREF_VAL_TYPE'] = 'String';
    let paramString = this.bbSetRowCountService.getEncodedParamString(paramMap);
    let url = this.bbSetRowCountService.getHostURL() + '/ibase/WebITMRequestHandlerServlet';
    this.bbSetRowCountService.setLoading(true);
    this.bbSetRowCountService.sendRequest(url, paramString, (data: any) => {
      this.bbSetRowCountService.setLoading(false);
      let callbackResp = data.split('%%SEP%%');
      data = callbackResp[0];
      let isError = callbackResp[1].trim();
      if (!(isError == 'true')) {
        console.log('inside callItemDeafult.......3727[' + data);

      }
      let val = {}
      val['openRowCount'] = false;
      this.closeRowCountPopup.emit(val);
    });
  }

  ngAfterViewInit() {
    let prefName = "row_count_" + this.formNo;
    this.getUserPref(prefName);
  }

  getUserPref(prefName: any) {
    let paramMap: any = {};
    paramMap['ACTION'] = 'GET_USER_PREF';
    paramMap['OBJ_NAME'] = this.compData["OBJ_NAME"];
    paramMap['PREF_NAME'] = prefName;
    let paramString = this.bbSetRowCountService.getEncodedParamString(paramMap);
    let url = this.bbSetRowCountService.getHostURL() + '/ibase/WebITMRequestHandlerServlet';
    // this.bbSetRowCountService.setLoading(true);
    this.bbSetRowCountService.sendRequest(url, paramString, (data: any) => {
      this.bbSetRowCountService.setLoading(false);
      let callbackResp = data.split('%%SEP%%');
      data = callbackResp[0];
      let isError = callbackResp[1].trim();
      if (!(isError == 'true')) {
        let detailForRowCount = "row_count_" + this.formNo;
        this.userInput = data;
        this.adjustedHeight(this.formNo);
        if (prefName == detailForRowCount) {
          if (data == 'true') {
            this.rowCountForDetail = true;
          }
          else {
            this.rowCountForDetail = false;
          }
        }
      }
    });
  }

  onKeyDown = (event: KeyboardEvent) => {
  	event.stopPropagation();
  };

  ngOnDestroy() 
  {
    document.removeEventListener('keydown', this.onKeyDown);
  }

}
