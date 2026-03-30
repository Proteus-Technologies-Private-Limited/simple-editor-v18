import { Component, Input, ViewChild, forwardRef, Attribute ,ChangeDetectorRef , Output , EventEmitter, OnChanges, SimpleChanges, ViewEncapsulation, ElementRef} from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, NgModel, Validator, UntypedFormControl, ValidationErrors } from '@angular/forms';
// import {MatLegacyChipInputEvent as MatChipInputEvent} from '@angular/material/legacy-chips';
import { MatChipInputEvent} from '@angular/material/chips';
import {ENTER, COMMA} from '@angular/cdk/keycodes';

import { BaseBlockComponent } from '../base-block.component';
//Added by nikhil on 02-08-2022 for multi-input field for 'IN' operator [Start]
import { Observable } from 'rxjs';
import { BBAutosuggestService } from '../bb-autosuggest/bb-autosuggest.service';
// import { MatLegacyAutocompleteTrigger as MatAutocompleteTrigger } from '@angular/material/legacy-autocomplete';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { BBTreeviewComponent } from '../bb-treeview/bb-treeview.component';
//Added by nikhil on 02-08-2022 for multi-input field for 'IN' operator [End]
/**
 * @title Chips with input
 */
@Component({
  selector: 'bb-chip-input',
  templateUrl: './bb-chip-input.component.html',
  styleUrls: ['./bb-chip-input.component.css'],
  providers: [
              {
                  provide: NG_VALUE_ACCESSOR,
                  useExisting: forwardRef(() => BBChipsInput ),
                  multi: true
              }, 
              { 
                  provide: NG_VALIDATORS, 
                  useExisting: BBChipsInput, 
                  multi: true 
              }
          ],
	encapsulation: ViewEncapsulation.Emulated
    //encapsulation: ViewEncapsulation.None
})
export class BBChipsInput extends BaseBlockComponent implements Validator, OnChanges {


    @Input( 'align' ) align: 'right'|'left' = "right";
    @Input( 'requiredMessage' ) requiredMessage: string = 'This field is required';
    @Input( 'invalidMessage' ) invalidMessage: string = 'Please enter a valid input';
    @Input( 'expression' ) bbExpression = /^/;
    
    @Input() separatorKeysCodes = [ENTER, COMMA];
    @Input() dataList: any[] = [];
      
    @Input() visible: boolean = true;
    @Input() selectable: boolean = true;
    @Input() removable: boolean = true;
    @Input() addOnBlur: boolean = true;
	
    @Output('dataChange') dataChange = new EventEmitter<string>();
    @Output('dataChangeAll') dataChangeAll = new EventEmitter<any>();
    
    @Output() bbFocus: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild( NgModel ) model: NgModel | any;
    errors : any ;
    inputValue='';
    //Added by nikhil on 02-08-2022 for multi-input field for 'IN' operator [Start]
    @Input() uxDesignData : string = 'UX3' ;
	@Input() dataSource : any;
	@Input() filterName : any;
	@Input( 'floatPlaceholder' ) bbFloatPlaceholder: string = 'auto'; 
	@Input( 'chipEnableValue' ) bbchipEnable: boolean = false;
	@Input() chipValue : string | any;
    @Input() isChipValue: boolean | any;
	filteredSuggestions: Observable<any[]> | any;
    public chipData : any[]=[]; // {'displayText' : '' , 'value' : '', 'image' : ''}
    suggestData: any; // {'displayText' : '' , 'value' : '', 'image' : ''}
    suggestFormattedData : any;
	chipToDelete : string | any;
	@Input() duplicateAllow : boolean = false ;
	@Output() onSelectionChange: EventEmitter<any> = new EventEmitter();
	@Input() HOST_URL :string = ''   
    @Input() displayMetadata :any;
	@Input('isPophelp') isPophelp : boolean = false;
	@Input() clearAftrSelection:boolean = false;
	suggestCtrl: UntypedFormControl | any;
	@ViewChild('chip', { read: MatAutocompleteTrigger })
    autocompleteTrigger: MatAutocompleteTrigger | any;
	@Output() onChangeValue: EventEmitter<any> = new EventEmitter();
	dataSourceComp: any; 
	getSuggestData : boolean = true ;
	@Input() refId : string = 'autosuggest-1';
	@Output() onClear: EventEmitter<any> = new EventEmitter();
	@Input() minlength :string | any;
	@Output() onLoadData: EventEmitter<any> = new EventEmitter();
	addDataValue : any;
	addDataValueJson: any = {};
	@Input() auto_fill_len : any;
	@Input() help_option : any
	isSuggestData: boolean | any;
	@ViewChild(BBTreeviewComponent) bbTreeviewComponent: BBTreeviewComponent | any;
	suggestDatavalue: Observable<string[]> | any;
	@ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement> | any;		
	//Added by nikhil on 02-08-2022 for multi-input field for 'IN' operator [End]
    public readonly customErrorMessages = {
            'required': () => this.requiredMessage,
            'minlength': ( params: any ) => 'The min number of characters is ' + params.requiredLength,
            'maxlength': ( params: any ) => 'The max allowed number of characters is ' + params.requiredLength,
            'email': (params: any) => params.message,
            'password': (params: any) => params.message,
            'phone': (params: any) => params.message
    };

    constructor(  @Attribute("validator") private validator:boolean , private cdr: ChangeDetectorRef, private autoSuggestService : BBAutosuggestService, public ele: ElementRef ) {
        super();
        this.bbType = 'text';
        //Added by nikhil on 02-08-2022 for multi-input field for 'IN' operator
		this.suggestCtrl = new UntypedFormControl('');
    }
    
    validate(c: UntypedFormControl): ValidationErrors {
        //this.cdr.detectChanges();
        if(!this.validator){
            return null as any;
        }
            
        if( !c.value ) { this.errors = null; return null as any; }
        const isValidText = this.bbExpression.test(c.value);
        const message = {
          'textbox': {
            'message': this.invalidMessage
          }
        };
        if( !isValidText )
        {
            this.errors = message;
        }
        else{
            this.errors = null;
        }
        return isValidText ? null as any : message;
    }
    
    ngAfterViewChecked(){
        //your code to update the model
        this.cdr.detectChanges();
     }

  
    ngOnChanges(changes: SimpleChanges) {
      for (let propName in changes) {
        let chng = changes[propName];
        let cur  = JSON.stringify(chng.currentValue);
        let prev = JSON.stringify(chng.previousValue);
    
        if( propName == 'dataList' )
        {
          console.log(`${propName}: \n currentValue = ${cur}\n previousValue = ${prev}`);
          if( cur === prev ){
            this.updateData();
          }
        }
      }
    }

  add(event: MatChipInputEvent): void {
	
	    let input = event.input;
	    let value = event.value;
	    // Add our fruit
	    if(this.dataList.indexOf(value) == -1)
		{
			if ((value || '').trim()) 
		    {
		      this.dataList.push(
		        { display: value.trim(), value: value.trim() }
		      );
		      this.inputValue = value; //Pravin K
		    }
	 	    this.suggestCtrl.setValue(null);
		    if (input) {
		      input.value = '';
		    }
		    this.updateData();
		}
  }

  remove(fruit: any): void {
    let index = this.dataList.indexOf(fruit);
    if (index >= 0) {
      this.dataList.splice(index, 1);
    }
    this.updateData();
    //Changed By Pravin K on 6-MAY-20 START
    if(fruit == this.inputValue)
    {
      this.inputValue = '';
    }
    //Changed By Pravin K on 6-MAY-20 END
  }

  updateData() {
    console.log( 'changeList', this.dataList  );
    var hiddenInput = '';
    for( var data of this.dataList){
      hiddenInput += data.value + ",";
    }
    this.dataChange.emit(hiddenInput);
    //pa start
    var allChangedData = {"selectedValues":hiddenInput,"inputValue":this.inputValue};
    this.dataChangeAll.emit(allChangedData);
    
    //pa end
  }
  //Added by nikhil on 02-08-2022 for multi-input field for 'IN' operator [Start]
  addValue(value: any, event) 
  {
	let input = event.input;
    let valueData = event.source.value;
	let newDataList: any = [];
	if(this.dataList.length > 0)
	{
		for(let i = 0; i< this.dataList.length; i++)
		{
	      if(this.dataList[i]['display'].trim() != valueData)
		  {
				if ((valueData || '').trim()) 
			    {
			      this.dataList.push(
			        { display: valueData.trim(), value: valueData.trim() }
			      );
			      newDataList = this.dataList;
			      this.dataList = [];
			      var lookup = {};
			      for (var item, j = 0; item = newDataList[j++];) 
			      {
					  var name = item.display;
					  if (!(name in lookup)) {
					    lookup[name] = 1;
					    this.dataList.push(
					        { display: name.trim(), value: name.trim() }
					      );
					  }
				  }
			      this.inputValue = valueData;
			    }
				this.suggestCtrl.setValue(null);
			    if (input) {
			      input.value = '';
			    }
		    }
		}
		
	}
	else
	{
		if ((valueData || '').trim()) 
	    {
	      this.dataList.push(
	        { display: valueData.trim(), value: valueData.trim() }
	      );
	      this.inputValue = valueData; //Pravin K
	    }
		this.suggestCtrl.setValue(null);
	    if (input) {
	      input.value = '';
	    }
	}
	this.updateData();
    this.chipToDelete = '';
    if( this.bbchipEnable && value && value.trim() ) 
	  {
      let data = this.suggestData.find( (suggestDataObj: any) => suggestDataObj.value.toLowerCase() === value.toLowerCase());
      if( !data )
      {
        this.chipValue = "";
        return;
      }
      if( this.duplicateAllow )
      {
        this.chipValue = "";
        this.chipData.push(data);
      }
      else if( this.chipData.find( chipDataObj => chipDataObj.value.toLowerCase() === value.toLowerCase())  )
      {
        this.chipValue = "";
      }
      else
      {
          this.chipValue = "";
          this.chipData.push(data);
      }
       this.chipValue = "";
    }
    else if ( value && value.trim() ) 
    {
      let selectedData = this.suggestData.find( (suggestDataObj: any) => suggestDataObj.value.toLowerCase() === value.toLowerCase());
      if( selectedData )
      {
        this.onSelectionChange.emit(selectedData);
      }
    }
    this.fruitInput.nativeElement.value = '';
  }
  ngOnInit() 
  {
    console.log('bb-chip-input ngOnInit 303 typeof datasource && isPophelp ', typeof this.dataSource, this.dataSource , this.isPophelp , Array.isArray(this.dataSource), this.dataSource ,"getSuggestData ==   >> ", this.getSuggestData);
    this.dataSourceComp = this.dataSource;
    // let startIndex = this.dataSource.indexOf("FIELDNAME=") + "FIELDNAME=".length;
    // let endIndex = this.dataSource.indexOf("&", startIndex);
    // let fieldName = endIndex !== -1 ? this.dataSource.substring(startIndex, endIndex) : this.dataSource.substring(startIndex); 
    // console.log('bb-chip-input Extracted FIELDNAME line no 311:', fieldName);
    let fieldName
    if( typeof this.dataSource == 'string' )
    {
          if (this.dataSource.includes("FIELDNAME=")) {  // Check if 'FIELDNAME=' exists
            let startIndex = this.dataSource.indexOf("FIELDNAME=") + "FIELDNAME=".length;
            let endIndex = this.dataSource.indexOf("&", startIndex);
            fieldName = endIndex !== -1
                ? this.dataSource.substring(startIndex, endIndex)
                : this.dataSource.substring(startIndex);
            console.log('bb-chip-input Extracted FIELDNAME line no 316:', fieldName);
        } else {
            console.error('dataSource does not contain "FIELDNAME="');
        }
        this.suggestCtrl.valueChanges.pipe(debounceTime(100)).subscribe( (data: any) => {
             if(data == '')
             {
                this.onClear.emit();
             }
             if(data == undefined || data == null)
             {
                 data = '';
             }
                        
             if( (data || this.minlength == 0) && !this.isPaste) 
             {
			  	if(data != undefined && data != '' && data != null)
			  	{
              		if( data.trim().length < this.minlength ) 
              		{	
	              		return;
					}
			  	}
				let dataSourceURL = "";
			  	if(data != undefined && data != '' && data != null)
			  	{
				 	dataSourceURL = this.dataSource + '/'+data.trim();  //saitej
				}
				else
				{
					dataSourceURL = this.dataSource + '/'+data;
				}
                if( this.refId !== 'autosuggest-1')
                {
		                // dataSourceURL = this.dataSource + "&refid=" + this.refId + "&" + this.refId + "=" + data;
                    dataSourceURL = this.dataSource + "&refid=" + this.refId + "&" + fieldName.toLowerCase() + "=" + data;
                }
                console.log('bb-chip-input 343 line no dataSourceURL',dataSourceURL);
			    this.suggestData = [];
			    if( data.length >= this.auto_fill_len && (this.help_option == '2' || this.help_option == '0'))
			    {
	                  this.autoSuggestService.getChipListData( dataSourceURL , this.isPophelp , this.displayMetadata ).subscribe( (serviceData: any) => {
	                  this.suggestData = serviceData;
	                  this.onLoadData.emit(this.suggestData);
	                  this.suggestDatavalue = this.suggestCtrl.valueChanges.pipe(
				      startWith(null),
				      map((data: string | null) => (data ? this.filter(data) : this.suggestData.slice())),
				      );
	              });
			   }
			   else if( data.length < this.auto_fill_len && (this.help_option == '2' || this.help_option == '0'))
			   {
					this.suggestData = [];
			   }
            } 
            else{
              this.suggestData = [];
            }
        });
    }
    else if( typeof this.dataSource == 'object' )
    {
        if(this.getSuggestData)
        {
            this.suggestData = this.dataSource;
            this.suggestFormattedData = this.autoSuggestService.transformData( this.suggestData , this.isPophelp , this.displayMetadata);
            this.suggestData= this.suggestFormattedData;
            if(this.suggestFormattedData)
            this.filteredSuggestions = this.suggestCtrl.valueChanges.startWith(null).map( (data: any) => {
                return data ? this.filterData(data) : this.suggestFormattedData.slice();
            });
        }
    }
  }  
    
  filterData(value: string) {
       return this.suggestFormattedData.filter((data: any) => {
        return data.displayChipText.toLowerCase().indexOf(value.toLowerCase()) === 0 ;
      });
  }

 filterFunction(val: string): string[] {
    return this.suggestData.filter(option =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  log(d:any) {
    console.log(d);
  }
    
  isPaste = false;
  validateData(evt:ClipboardEvent) {
    this.isPaste = true;
    let clipBoardData : string = evt.clipboardData!.getData('Text')!;
    let dataSourceURL = this.dataSource + "&refid=list&list=" + clipBoardData;
	    this.autoSuggestService.getChipListData( dataSourceURL ,this.isPophelp , this.displayMetadata ).subscribe( (serviceData: any) => {
	        for(let suggestObj of serviceData )
	        {
	            if( this.duplicateAllow )
	            {
	                this.chipValue = "";
	                this.chipData.push(suggestObj);
	                this.chipValue = "";
	
	            }
	            
	            else if( this.chipData.find( chipDataObj => chipDataObj.value.toLowerCase() === suggestObj.value.toLowerCase()) )
	            {
	                console.log("chip already exist"); 
	            }
	            
	            else
	            {
	                this.chipValue = "";
	                this.chipData.push(suggestObj);
	                this.chipValue = "";
	            }
	        }
		this.isPaste = false;
	    });
  }
    
  onValueChange(){
      this.onChangeValue.emit(this.chipValue );
  }
  
  ngOnDestroy() 
  { 
      console.log("ngOnDestroy of bb-autosuggest component"); 
  }
    
  filter(value: string): string[] 
  {
	  console.log("print value line no 476",value); 
      const filterValue = value;
	  console.log("print filterValue",filterValue); 
	  console.log("print suggestData line no 514",this.suggestData); 
      /*return this.suggestData.filter(data => data.includes(filterValue)
      );*/
      return this.suggestData.filter(object => {
		console.log('Print the object line no 439',object);
		return object['value'] == filterValue;
	  });
  }
//Added by nikhil on 02-08-2022 for multi-input field for 'IN' operator [Start]
}
