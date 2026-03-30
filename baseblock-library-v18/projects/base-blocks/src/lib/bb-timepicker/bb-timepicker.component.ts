import { BaseBlockComponent } from '../base-block.component';
import { Component, OnInit, Input, forwardRef, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, NgModel, Validator, UntypedFormControl, ValidationErrors } from '@angular/forms';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'bb-timepicker',
  templateUrl: './bb-timepicker.component.html',
  styleUrls: ['./bb-timepicker.component.css'],
   providers: [
                {
                    provide: NG_VALUE_ACCESSOR,
                    useExisting: forwardRef(() => BbtimepickerComponent ),
                    multi: true
                }, 
                { 
                    provide: NG_VALIDATORS, 
                    useExisting: BbtimepickerComponent, 
                    multi: true 
                }
            ]
})
export class BbtimepickerComponent extends BaseBlockComponent implements Validator
{
  hhTime : string ="";
  mmTime : string ="";
  ssTime : string ="";
  
  hhTimePopUp : string ="00";
  mmTimePopUp : string ="00";
  amPmTimePopUp : string ="AM";
  
  readOnly : boolean = false;
  minits: Array<number> = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29];
    
  @Input() 
  public placeHolder: string | any;
  
  @Input() 
  public isCustomTimePicker: boolean | any;
  
  @ViewChild( NgModel ) model: NgModel | any;
   
  focused: boolean = false;
  focusedSpan: string = "00";
  isShowClock: boolean = false;
  isHrsClick: boolean = true;
  isMinsClick: boolean = false;
  selectedMMSpan: string = "00";

  constructor() {
    super();
  }
  
  ngOnInit() 
  {
    
  }
  
  validate(c: UntypedFormControl): ValidationErrors 
  {
      return EMPTY
  }
  
  numbersOnly(elemType:any,event:any)
  {
    //console.log("numbersOnly:",event.keyCode);
    let value = event.target.value;
   
    let currentKey = 0;
     if ([46, 8, 9, 27, 13, 110, 190].indexOf(event.keyCode) !== -1 ||
        // Allow: Ctrl+A
        (event.keyCode === 65 && (event.ctrlKey || event.metaKey)) ||
        // Allow: Ctrl+C
        (event.keyCode === 67 && (event.ctrlKey || event.metaKey)) ||
        // Allow: Ctrl+V
        (event.keyCode === 86 && (event.ctrlKey || event.metaKey)) ||
        // Allow: Ctrl+X
        (event.keyCode === 88 && (event.ctrlKey || event.metaKey)) ||
        // Allow: home, end, left, right
        (event.keyCode >= 35 && event.keyCode <= 37 )) {
          // let it happen, don't do anything
          return;
        }
    
      if(event.keyCode == 38)
      {
        event.target.value = +value + 1;
        this.validateTime(elemType, event)
      }
      if(event.keyCode == 40)
      {
        event.target.value = +value - 1;
        this.validateTime(elemType, event)
      }
        // Ensure that it is a number and stop the keypress
        if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) 
        {
            event.preventDefault();
        }
     
  }
  
  increase(elemType:any,element:any)
  {
    let value = element.value;
    element.value = +value + 1;
    this.validateElement(elemType, element)
  }
  decrease(elemType:any,element:any)
  {
    let value = element.value;
    element.value = +value - 1;
    this.validateElement(elemType, element)
  }
  
  validateTime(elemType:any,event:any)
  {
    this.validateElement(elemType, event.target)
  }
  validateElement(elemType:any,element:any)
  {
      let value =  element.value; 
      //console.log("validate:",element.value);
      if("HH" == elemType)
      {
       // console.log("handleKeyPress:HH:",value);
        if(value > 24)
        {
          element.value = 24;
        }else if(value < 0)
        {
          element.value = 0;
        }
      }
      else if("MM" == elemType)
      {
        if(value > 60)
        {
          element.value= 60;
        }else if(value < 0)
        {
          element.value = 0;
        }
      }
      else
      {
        if(value > 60)
        {
          element.value = 60;
        }else if(value < 0)
        {
          element.value = 0;
        }
      }
      element.value = +element.value+"";
      if(element.value < 10)
      {
           element.value = "0"+element.value;
      }
  }
  showClock()
  {
    if(this.isShowClock)
    {
      this.isShowClock= false;
    }
    else
    {
      if(this.hhTime == "")
      {
        this.hhTimePopUp = "12"
      }
      else
      {
        this.hhTimePopUp = this.hhTime;  
      }
      if(this.mmTime == "")
      {
        this.mmTimePopUp = "00"
      }
      else
      {
        this.mmTimePopUp = this.mmTime;
      }
      
      if(+this.hhTimePopUp > 12)
      {
        this.hhTimePopUp = String(+this.hhTimePopUp - 12);
        this.amPmTimePopUp = "PM";
      }
      else
      {
        this.amPmTimePopUp = "AM";
      }
      
      this.isShowClock= true;
      this.hrsClicked();
    }
  }
  focusElement()
  {
    this.focused = true;
  }
  blueElement()
  {
    this.focused = false;
  }
  selectHH(value:any)
  {
    this.hhTimePopUp = value;
    this.focusedSpan = value;
  }
  selectMM(value:any)
  {
    this.mmTimePopUp = value;
    this.selectedMMSpan = value;
  }
  hrsClicked()
  {
    this.isHrsClick = true;
    this.isMinsClick = false;
    this.focusedSpan = this.hhTimePopUp;
  }
  minsClicked()
  {
    this.isHrsClick = false;
    this.isMinsClick = true; 
    this.selectedMMSpan = this.mmTimePopUp;
  }
  closeClock()
  {
    this.isShowClock= false;
  }
  setValues()
  {
     this.hhTime = this.hhTimePopUp;
     this.mmTime = this.mmTimePopUp;
    
     if(this.amPmTimePopUp == "PM")
     {
         this.hhTime = String(+this.hhTime + 12); 
     }
    this.hhTime = +this.hhTime+"";
    this.mmTime = +this.mmTime+""; 
     if(+this.hhTime < 10)
     {
         this.hhTime = "0"+this.hhTime;
     }
     if(+this.mmTime < 10)
     {
         this.mmTime = "0"+this.mmTime;
     }
    
     this.isShowClock= false;
  }
  override toString(str: any){
      return String( str );
  }
}
