import { Component, Input, forwardRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
//import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDatepicker } from '@angular/material';
import { MatDatepicker } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import moment from 'moment';
//import { default as _rollupMoment, Moment } from 'moment';
import { Moment } from 'moment';
// const moment =  _moment;

export const YEAR_MODE_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'bb-year-picker',
  templateUrl: './bb-year-picker.component.html',
  styleUrls: [],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: YEAR_MODE_FORMATS },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BBYearPickerComponent),
      multi: true,
    },
  ],
})
export class BBYearPickerComponent implements ControlValueAccessor {
  /** Component label */
  @Input() label = '';
  @Input( 'value' ) bbValue: any;
  @Output() changeYear: EventEmitter<any> = new EventEmitter<any>();
  @Output()opened : EventEmitter<void> = new EventEmitter<void>();
  
  _max: Moment | any;
  @Input() get max(): number | Date {
    return this._max ? this._max.year() : undefined;
  }
  set max(max: number | Date) {
    if (max) {
      console.log("Max exist :::" , max);
      const momentDate = typeof max === 'number' ? moment([max, 0, 1]) : moment(max);
      this._max = momentDate.isValid() ? momentDate : undefined;
    }
  }

  _min: Moment | any;
  @Input() get min(): number | Date {
    return this._min ? this._min.year() : undefined;
  }
  set min(min: number | Date) {
    if (min) {
        console.log("min exist :::" , min);
      const momentDate = typeof min === 'number' ? moment([min, 0, 1]) : moment(min);
      this._min = momentDate.isValid() ? momentDate : undefined;
    }
  }

  @Input() touchUi = false;

  @ViewChild(MatDatepicker) _picker: MatDatepicker<Moment> | any;

  _inputCtrl: FormControl = new FormControl();

  // Function to call when the date changes.
  onChange = (year: Date) => { };

  // Function to call when the input is touched (when a star is clicked).
  onTouched = () => {  };

  writeValue(date: Date): void {
    if (date && this._isYearEnabled(date.getFullYear())) {
      const momentDate = moment(date);
      if (momentDate.isValid()) {
        this._inputCtrl.setValue(moment(date), { emitEvent: false });
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Allows Angular to disable the input.
  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this._picker.disabled = true : this._picker.disabled = false;

    isDisabled ? this._inputCtrl.disable() : this._inputCtrl.enable();
  }

  _yearSelectedHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>) {
      console.log("yearSelectedHandler event get called " , chosenDate);
    // as I'm using the focus event to open the calendar, this is necessary
    // so the calendar isn't opened again after a selection.
    datepicker.disabled = false;
    if (!this._isYearEnabled(chosenDate.year())) {
      datepicker.close();
      // wait for some time before enabling the calendar again
      // setTimeout(() => 
        datepicker.disabled = false
      // , 600);
      return;
    }

    this._inputCtrl.setValue(chosenDate, { emitEvent: false });
    this.onChange(chosenDate.toDate());
    this.onTouched();
    datepicker.close();
    this.changeYearValue(chosenDate);
    // wait for some time before enabling the calendar again
    // setTimeout(() => 
      datepicker.disabled = false
    // , 600);
  }

  _openDatepickerOnClick(datepicker: MatDatepicker<Moment>) {
    console.log("datepicker :::: on click" , datepicker);
    if (!datepicker.opened) {
      datepicker.open();
    }
  }

  _openDatepickerOnFocus(datepicker: MatDatepicker<Moment>) {
       console.log("datepicker :::: on focus" , datepicker);
    // setTimeout(() => {
      if (!datepicker.opened) {
        datepicker.open();
      }
    // });
  }

  _clearInput($evt: MouseEvent) {
    this._inputCtrl.setValue(null);
    $evt.stopPropagation();
  }

  /** Whether the given year is enabled. */
  private _isYearEnabled(year: number) {
    // disable if the year is greater than maxDate lower than minDate
    if (year === undefined || year === null ||
      (this._max && year > this._max.year()) ||
      (this._min && year < this._min.year())) {
      return false;
    }

    return true;
  }
  
  changeYearValue(chosenDate: any)
  {
     console.log('changing the year...',chosenDate._d);
     var yearValue = new Date(chosenDate._d ).getFullYear();
     this.changeYear.emit(yearValue );
     
  }

}
