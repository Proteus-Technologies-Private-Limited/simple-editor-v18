import { Component, Input, forwardRef, ViewChild, Output, EventEmitter  } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
//import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDatepicker } from '@angular/material';
import { MatDatepicker } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import moment from 'moment';
//import { default as _rollupMoment, Moment } from 'moment'; //unable to understand use of default
import { Moment } from 'moment';
// const moment =  _moment;

export const MONTH_MODE_FORMATS = {
  parse: {
      dateInput: 'LL',
    },
    display: {
     // dateInput: 'LL' //for 01/04/2017
     // dateInput: 'MM/YYYY', //for 01/2017
      dateInput: 'MMM YYYY', //for April/2017
      monthYearLabel: 'MMM YYYY',
      dateA11yLabel: 'LL',
      monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
  selector: 'bb-month-picker',
  templateUrl: './bb-month-picker.component.html',
  styleUrls: [],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_MODE_FORMATS },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BBMonthPickerComponent),
      multi: true,
    },
  ],
})
export class BBMonthPickerComponent implements ControlValueAccessor {
  /** Component label */
  @Input() label = '';
  @Input( 'value' ) bbValue: any;
  @Output() changeMonth: EventEmitter<any> = new EventEmitter<any>();
  @Output()opened : EventEmitter<void> = new EventEmitter<void>();
  
  _max: Moment | any;
  @Input() get max(): string | Date {
    return this._max ? this._max.format('MM/YYYY') : undefined;
  }
  set max(max: string | Date) {
    // expect MM to be 1..12 and YYYY > 0
    if (max) {
      const momentDate = typeof max === 'string' ? moment(max, 'MM/YYYY') : moment(max);
      this._max = momentDate.isValid() ? momentDate : undefined;
    }
  }

  _min: Moment | any;
  @Input() get min(): string | Date {
    return this._min ? this._min.format('MM/YYYY') : undefined;
  }
  set min(min: string | Date) {
    // expect MM to be 1..12 and YYYY > 0
    if (min) {
      const momentDate = typeof min === 'string' ? moment(min, 'MM/YYYY') : moment(min);
      this._min = momentDate.isValid() ? momentDate : undefined;
    }
  }

  private _mode: 'SEMESTER' | 'MONTH' | 'MONTHYEAR' | any;
  @Input() get mode(): 'SEMESTER' | 'MONTH' | 'MONTHYEAR' {
    return this._mode;
  }
  set mode(mode: 'SEMESTER' | 'MONTH' | 'MONTHYEAR') {
    this._mode = mode;
    this._setupFilter();
  }

  @Input() touchUi = false;

  // _customFilter!: (d: Moment) => boolean;
  _customFilter!: (d: Moment | any ) => boolean;


  @ViewChild(MatDatepicker) _picker: MatDatepicker<Moment> | any;

  _inputCtrl: FormControl = new FormControl();

  private _finalDate: Date | any;

  // Function to call when the date changes.
  onChange = (monthAndYear: Date) => { };

  // Function to call when the input is touched.
  onTouched = () => { };

  writeValue(date: Date): void {
    if (date && this._isMonthEnabled(date.getFullYear(), date.getMonth())) {
      const momentDate = moment(date);
      if (momentDate.isValid()) {
        this._inputCtrl.setValue(momentDate, { emitEvent: false });
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

  _yearSelectedHandler(chosenMonthDate: Moment, datepicker: MatDatepicker<Moment>) {
    if (!this._isYearEnabled(chosenMonthDate.year())) {
      datepicker.disabled = true;
      datepicker.close();
      // setTimeout(() => 
        datepicker.disabled = false
      // , 600);
    }
  }

  _monthSelectedHandler(chosenMonthDate: Moment, datepicker: MatDatepicker<Moment>) {
    // as I'm using the focus event to open the calendar, this is necessary
    // so the calendar isn't opened again after a selection.
    datepicker.disabled = true;
    if (!this._isMonthEnabled(chosenMonthDate.year(), chosenMonthDate.month())) {
      // wait for some time before enabling the calendar again
     
      // setTimeout(() => 
        datepicker.disabled = false
      // , 600);
      return;
      
    }

    if (this._max && chosenMonthDate.diff(this._max, 'month') > 0) {
      chosenMonthDate = this._max.clone();
    }

    if (this._min && this._min.diff(chosenMonthDate, 'month') > 0) {
      chosenMonthDate = this._min.clone();
    }

    this._inputCtrl.setValue(chosenMonthDate);
    this.onChange(chosenMonthDate.toDate());
    this.onTouched();
    datepicker.close();
    this.changeMonthValue(chosenMonthDate);

    // wait for some time before enabling the calendar again
    // setTimeout(() => 
      datepicker.disabled = false
    // , 600);
    
  }

  /** Whether the given year is enabled. */
  private _isYearEnabled(year: number) {
    // disable if the year is greater than maxDate lower than minDate
    if (year === undefined || year === null ||
      (this._max && year > this._max.year()) ||
      (this._min && year < this._min.year())) {
      return false;
    }

    // enable if it reaches here and there's no filter defined
    if (!this._customFilter) {
      return true;
    }

    const firstOfYear = moment([year, 0, 1]);

    // If any date in the year is enabled count the year as enabled.
    for (const date = firstOfYear; date.year() === year; date.add(1)) {
      if (this._customFilter(date)) {
        return true;
      }
    }

    return false;
  }

  /** Whether the given year is enabled. */
  private _isMonthEnabled(year: number, month: number) {
    if (month === undefined || month === null ||
      this._isYearAndMonthAfterMaxDate(year, month) ||
      this._isYearAndMonthBeforeMinDate(year, month)) {
      return false;
    }

    if (!this._customFilter) {
      return true;
    }

    const firstOfMonth = moment([year, month, 1]);

    // If any date in the month is enabled count the month as enabled.
    for (const date = firstOfMonth; date.month() === month; date.add(1)) {
      if (this._customFilter(date)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Tests whether the combination month/year is after this.maxDate, considering
   * just the month and year of this.maxDate
   */
  private _isYearAndMonthAfterMaxDate(year: number, month: number) {
    if (this._max) {
      const maxYear = this._max.year();
      const maxMonth = this._max.month();

      return year > maxYear || (year === maxYear && month > maxMonth);
    }

    return false;
  }

  /**
   * Tests whether the combination month/year is before this.minDate, considering
   * just the month and year of this.minDate
   */
  private _isYearAndMonthBeforeMinDate(year: number, month: number) {
    if (this.min) {
      const minYear = this._min!.year();
      const minMonth = this._min!.month();

      return year < minYear || (year === minYear && month < minMonth);
    }

    return false;
  }

  _openDatepickerOnClick(datepicker: MatDatepicker<Moment>) {
    if (!datepicker.opened) {
      datepicker.open();
    }
  }

  _openDatepickerOnFocus(datepicker: MatDatepicker<Moment>) {
    console.log("openDatepickerOnFocus event get called -- " , datepicker  );
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

  private _setupFilter() {
    switch (this.mode) {
      case 'SEMESTER':
        this._customFilter = (d: Moment) => {
          return d.month() === 0 || d.month() === 6;
        };
        break;
    }
  }
  
  changeMonthValue(chosenMonthDate: any)
  {
     console.log('changing the month',chosenMonthDate._d );
    // var monthValue = new Date(chosenMonthDate._d ).getMonth()+1;
     var dateObj = new Date(chosenMonthDate._d );
     var month = dateObj.getMonth()+1;
     var year = dateObj.getFullYear();
     var getMonthValue = month + "/" + year ;
     this.changeMonth.emit(getMonthValue);
  }
}
