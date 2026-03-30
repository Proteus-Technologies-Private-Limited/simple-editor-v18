import { Component, Input, forwardRef, ViewChild, Output, EventEmitter,OnInit, OnChanges, SimpleChanges, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDatepicker } from '@angular/material/datepicker';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import { MatFormField } from '@angular/material/form-field';
import { NgModel } from '@angular/forms';
import { AppDateAdapter, APP_DATE_FORMATS } from './date.adapter';
import { DatePipe } from '@angular/common';
import { parse } from 'date-fns';
import { MatDialog } from '@angular/material/dialog';
import moment from 'moment';
import { BBConfirmBoxComponent } from '../../bb-confirm-box';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { formatDate } from '@angular/common';

@Component({
  selector: 'bb-day-picker',
  templateUrl: './bb-day-picker.component.html',
  styleUrls: ['./bb-day-picker.component.css'],
  providers: [
		{
			provide: DateAdapter, useClass: AppDateAdapter
		},
		{
			provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
		},
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => BBDayPickerComponent),
			multi: true
		},
		DatePipe
	]
})
export class BBDayPickerComponent implements OnInit, OnChanges, AfterViewInit, ControlValueAccessor {

  @Input() label = '';
  @Input('value') bbValue: any;
  @Input('disabled') bbDisabled: any;
  @Input('id') bbId: any;
  @ViewChild(MatDatepicker) picker: MatDatepicker<Date>;
  @ViewChild('ngModel') model: NgModel;
  @Output() bbChange: EventEmitter<any> = new EventEmitter<any>(); 
  @Output() bbBlur: EventEmitter<any> = new EventEmitter<any>(); 
  @Output() bbFocus: EventEmitter<any> = new EventEmitter<any>(); 
  dateFormat: any;
  valueDate:any = "";
  @Input('isSimpleLayout') isSimpleLayout: boolean = false;
  @Input('format') bbFormat: any;
  @Input('required') bbRequired: any;
  @Input('placeholder') placeholder: any;
  @Output() bbSetFocusOnError = new EventEmitter<object>();
  @Output() bbSetForceSave = new EventEmitter<boolean>();
  bbconfirmBox: any = null;
  @ViewChild('datepickerInput') datepickerInput: ElementRef;
  @Output() bbDateBlur: EventEmitter<any> = new EventEmitter<any>(); 
  initialDateValue: any;

  identifyTheFormats: any = [
	'dd-MMM-yyyy',
	'dd/MM/yy',
	'dd-MMM-yyyy HH:mm:ss',
	'dd/MM/yy HH:mm:ss',
	];

	innerValue: any;

	// callbacks
	private onChange: (value: any) => void = () => {};
	private onTouched: () => void = () => {};

  constructor(public datePipe: DatePipe, public dialog: MatDialog){
    this.dateFormat = window['e12navigator'] ? window['e12navigator'].applDateFormat : localStorage.getItem('APPL_DATE_FORMAT');
	this.bbconfirmBox = new BBConfirmBoxComponent(dialog);
  }
	

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

	ngOnInit(): void 
	{
		// console.log('inside bbDaypicker value..',this.bbValue);
		// console.log('inside bbDaypicker typeof value..',typeof this.bbValue);
		// console.log('inside bbDaypicker id..',this.bbId);
		// console.log('inside bbDaypicker disabled..',this.bbDisabled);
		if(this.bbValue)
		{
			if (typeof this.bbValue === 'string')
			{
				this.valueDate = parse(this.bbValue, this.formatDate(this.bbValue), new Date());
			}
			else if(this.bbValue instanceof Date)
			{
				this.valueDate = this.bbValue;
			}
			// console.log('valueDate..',this.valueDate);
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['bbValue']) {
			const newValue = changes['bbValue'].currentValue;
			if (newValue) {
				if (typeof newValue === 'string') {
					this.valueDate = parse(newValue, this.formatDate(newValue), new Date());
				} else if (newValue instanceof Date) {
					this.valueDate = newValue;
				}
			} else {
				this.valueDate = '';
			}
		}
	}

	ngAfterViewInit() {
		if(this.picker)
		{
			this.picker.openedStream.subscribe(() => {
			this.adjustOverlayPosition();
			});
		}
	}

  	formatDate(date: any)
	{
		let dateFormat: any;
		try
		{
			let parsedDate: any;
			for (const format of this.identifyTheFormats) 
			{
				parsedDate = parse(date, format, new Date());
				if (parsedDate != 'Invalid Date') 
				{
				dateFormat = format;
				// console.log('formattedDate:::', dateFormat);
				break;
				}
			}
		}
		catch(e)
		{
			console.log('catch block formatDate:::', e);
		}
		return dateFormat;
	}

	onDateChange(value: any, id: any): void 
	{
		let dateChangedJson = {};
		dateChangedJson['value'] = value;
		dateChangedJson['id'] = id;
		this.bbChange.emit(dateChangedJson);
	}

	setLoading(flag: boolean) 
    {
        try 
        {
            (<any>window.parent).setLoading(flag);
        }
        catch
        {
            console.log('window.setLoading is not a function!!');
        }
    }

	onBlur(value: any, id: any)
	{
		let dateChangedJson = {};
		let currentValue; 
		let elem = document.getElementById(this.bbId) as HTMLInputElement;
		if (elem) 
		{
			let dateVal = elem.value;
			let idd = this.bbId;
			let dateFieldLable = this.label
			
			const isValidDate = this.validateDateOnBlur(dateVal, idd, dateFieldLable);
			
			if(!isValidDate)
			{
				return;
			}

			currentValue = elem.value
			let formattedInitialValue = this.datePipe.transform(this.initialDateValue, 'dd/MM/yy');
			if(formattedInitialValue !== currentValue)
			{
				dateChangedJson['fldValue'] = value;
				dateChangedJson['id'] = this.bbId;
				this.bbDateBlur.emit(dateChangedJson);
			}
		}
	}
	
	validateDateOnBlur(value: string, id: string, dateFieldLable: string)
	{
		let fieldID = id.split(/[\.-]/);
		let formNo = fieldID[0];
		let domId = fieldID[1];
		let fieldName = fieldID[2];
		
		const isValidDate = this.isValidDate(value);
		let elem: any = document.getElementById(id);
		let fieldLabel = elem.getAttribute('data-placeholder');
		if (fieldLabel && fieldLabel.includes(":")) 
		{
			fieldLabel = fieldLabel.substring(0, fieldLabel.indexOf(":"));
		} 
		else if (dateFieldLable && dateFieldLable.includes(":")) 
		{
			dateFieldLable = dateFieldLable.substring(0, dateFieldLable.indexOf(":"));
		}
										
		if(value && !isValidDate)
		{	
			let msg = fieldLabel ? fieldLabel +' having invalid date, please input a valid date' : dateFieldLable +' having invalid date, please input a valid date' 
			let traceMsg;
			this.bbconfirmBox.alert('Error', msg, traceMsg).subscribe((resp: any) => {
				this.setLoading(false);
				if (resp) {
					this.bbSetForceSave.emit(false)
					this.setFocusOnError(formNo, domId, fieldName);
				}
			});
			return false;
		}
		return true;
	}

	isValidDate(dateStr: string): boolean
	{
		if(!dateStr) return true;
		let applDateFormat = localStorage.getItem("APPL_DATE_FORMAT");
		if(!applDateFormat) return true;
		applDateFormat = applDateFormat.toUpperCase();
		let parsedDate = moment(dateStr, applDateFormat, true);
		return parsedDate.isValid();
	}

	setFocusOnError(formNo: any, domId: any, fieldName: any)
	{
		let setFocusOnErrorData = {}
		setFocusOnErrorData['formNo'] = formNo;
		setFocusOnErrorData['domId'] = domId;
		setFocusOnErrorData['fieldName'] = fieldName;
		this.bbSetFocusOnError.emit(setFocusOnErrorData);
	}

	adjustOverlayPosition() 
	{
		const overlay = document.querySelector('.cdk-overlay-pane');
	
		if (overlay && this.datepickerInput) 
		{
			const inputRect = this.datepickerInput.nativeElement.getBoundingClientRect();

			const calculatedTop = inputRect.top + inputRect.height;
			const calculatedLeft = inputRect.left;

			// setTimeout(() => {
				const cdkOverlayDiv = document.querySelector('.cdk-overlay-pane.mat-datepicker-popup') as HTMLElement
				if (cdkOverlayDiv) 
				{
					cdkOverlayDiv.style.removeProperty('bottom');
					cdkOverlayDiv.style.setProperty('top', `${calculatedTop}px`, 'important');
					cdkOverlayDiv.style.setProperty('left', `${calculatedLeft}px`, 'important');
				}
			// },0);
		}
  	}
  	
  	onFocus()
	{
		this.initialDateValue = this.valueDate;
	}
  
	onDatepickerClosed(valueDate: any, id: any)
	{
		this.onBlur(valueDate, id);
		// Update initialDateValue so that subsequent (blur) event on the input
		// does not trigger a duplicate item change call
		this.initialDateValue = this.valueDate;
	}
  
	onDatepickerOpened() 
	{
		this.initialDateValue = this.valueDate;
	}

}