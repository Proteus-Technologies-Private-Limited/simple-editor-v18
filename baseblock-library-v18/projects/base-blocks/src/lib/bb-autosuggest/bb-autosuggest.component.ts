import { Component, OnInit,ViewEncapsulation,  HostListener, Input,ViewChild ,Output,EventEmitter,forwardRef , OnDestroy} from '@angular/core';
import { UntypedFormControl, NG_VALUE_ACCESSOR, FormControlStatus } from '@angular/forms';
// import { MatLegacyAutocompleteTrigger as MatAutocompleteTrigger } from '@angular/material/legacy-autocomplete';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';
// import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
// import 'rxjs/add/observable/interval';
// import 'rxjs/add/operator/startWith';
// import 'rxjs/add/operator/map';
// import "rxjs/Rx";
import { BBAutosuggestService } from './bb-autosuggest.service';
import { ValueAccessorBase } from '../form';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { interval } from 'rxjs';

declare var callDataModel: any;

@Component({
  selector: 'bb-autosuggest',
  templateUrl: './bb-autosuggest.component.html',
  styleUrls: ['./bb-autosuggest.component.css'],
  //encapsulation:ViewEncapsulation.None,
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BBAutosuggestComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.Emulated,
})
export class BBAutosuggestComponent extends ValueAccessorBase<string> implements OnInit , OnDestroy {

  @Input() uxDesign : string = 'UX3' ;  //UX1 - Simple, UX2 - Flat, UX3 - Material
  @Input() dataSource : any;  //dataSource - JSON Object, dataSourceURL - URL for Datasource
  @Input( 'placeholder' ) bbPlaceholder: string = ''; // Placeholder to Input Field
  @Input( 'floatPlaceholder' ) bbFloatPlaceholder: string = 'auto'; // move(float) placeholder up(top) to Input Field
  @Input( 'chipEnable' ) bbchipEnable: boolean = false;//Whether to show Chiplist or not default : false
  @Input() duplicateAllow : boolean = false ;  // Whether to Add duplicate data in Chiplist default : false
  @Input() minlength : number = 3 ;  // Min. characters to enter for Data filter and Make request to dataSourceURL default : 3
  @Input() refId : string = 'autosuggest-1'; //Set Hidden element id 
  @Input() chipValue : string | any;
  @Input('disabled') bbDisabled : boolean = false;
  @Input('isPophelp') isPophelp : boolean = false; //indicates pophelp datasource
  @Input() HOST_URL :string = ''   
  @Input() displayMetadata :any; 
  @Input() getSuggestData : boolean = true ;
  @Input() clearAftrSelection:boolean = false;
  
      
  @Output() onSelectionChange: EventEmitter<any> = new EventEmitter(); //after
  @Output() onClear: EventEmitter<any> = new EventEmitter();
  @Output() onChangeValue: EventEmitter<any> = new EventEmitter();
  @Output() bbFocus: EventEmitter<any> = new EventEmitter<any>();
  @Output() onLoadData: EventEmitter<any> = new EventEmitter();
  
  @ViewChild('chip', { read: MatAutocompleteTrigger })
  autocompleteTrigger: MatAutocompleteTrigger | any;

  //propagateChange = (_: any) => {};
  responseSubjects={};
  suggestCtrl: UntypedFormControl | any;
  filteredSuggestions: Observable<any[]> | any;
  public chipData : any[]=[]; // {'displayText' : '' , 'value' : '', 'image' : ''}
  suggestData: any; // {'displayText' : '' , 'value' : '', 'image' : ''}
  suggestFormattedData : any;
  chipToDelete : string | any;
  public entityData: any;
  public EntityList$ = new BehaviorSubject<any>([]);
  dataSourceComp: any;  
  
  
  /*dataSource =  {
  "imgUrl":"http://192.168.0.234:9090/ibase/resource/images/users/<code>.png",
  "chipMetadata":"<name>",
  "suggestMetadata" : "<name>(<empCode>)",
  "valueFields":"name",
  "details":[
         
     ]}*/
  
  constructor(private autoSuggestService : BBAutosuggestService) { 
     super();
     console.log("In constructor  --> --> ",this.bbchipEnable , this.clearAftrSelection); 
     this.suggestCtrl = new UntypedFormControl(); 
  }
  
  
  @HostListener('window:orientationchange', ['$event']) 
  orientationChange(event: any) {
      console.log("orientation event");
      if(this.autocompleteTrigger){
          setTimeout(() => {
              this.autocompleteTrigger.closePanel();
            }, 0)
      }
   }
  
  add(value: any) {
    this.chipToDelete = '';
    console.log("In Add method and onSelectionChange --> --> " , value, this.chipValue ,value.trim() ,this.bbchipEnable , this.getSuggestData , this.clearAftrSelection ); 
    if( this.bbchipEnable && value && value.trim() ) {
    //    console.log("this.suggestData in add method",this.suggestData);
        let data = this.suggestData.find( (suggestDataObj: any) => suggestDataObj.value.toLowerCase() === value.toLowerCase());
     //   console.log('add(value).find', data, this.duplicateAllow , this.chipData );
        if( !data ){
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
            console.log("chip already exist"); 
            this.chipValue = "";
        }
        else
        {
            console.log("this.duplicateAllow in else ", this.chipValue);
            this.chipValue = "";
            this.chipData.push(data);
        }
        this.chipValue = "";
    }
    else if ( value && value.trim() ) {
        console.log("this.suggestData in 2nd add method",this.suggestData);
     /*   let sugData = this.suggestData.find( selectedObj => selectedObj.value.toLowerCase() === value.toLowerCase() );
        let selectData = sugData.Details.find( address => address.custCode.toLowerCase() === value.toLowerCase());
        console.log("selectData ------->",selectData);
    /*  let selectedData = this.suggestData.find( selectedObj => selectedObj.value.toLowerCase() === value.toLowerCase() ).Details.find( address => address.custCode.toLowerCase() === value.toLowerCase());  */
        let selectedData = this.suggestData.find( (suggestDataObj: any) => suggestDataObj.value.toLowerCase() === value.toLowerCase());
        if( selectedData ){
           // this.onSelectionChange.emit(selectedData.detail); //onSelectionChange
            this.onSelectionChange.emit(selectedData); //Changed by chitranga for PlaceTime enity to get imgURl
            
        }
    }
  }
  
  removeByKey(value: any){
    console.log(value)
    if( !value ){
      console.log( 'this.chipData.length', this.chipData.length );
      if(this.chipData.length > 0) {
        let len = this.chipData.length;
        console.log( 'this.chipToDelete', len, this.chipToDelete );
        if( this.chipToDelete ) {
          this.chipData.pop();
          this.chipToDelete = '';
        }
        else
        {
          this.chipToDelete = this.chipData[len - 1].value;
          console.log( 'this.chipToDelete', len, this.chipToDelete );
        }
      }
    }
  }
  
  remove(chipDataObj : any) {
      this.chipToDelete = '';
      let idx = this.chipData.indexOf(chipDataObj);
      let delObj = this.chipData.splice(idx, 1);
      console.log('chipDataObj', idx, delObj);
  }
    
  ngOnChanges(change: any) 
  {
     console.log("BBAutosuggestComponent:ngOnChanges:" ,this.displayMetadata );
     if(this.dataSource != this.dataSourceComp)
     {
          this.dataSourceComp = this.dataSource;
          if( typeof this.dataSource === 'string' )
          {
            /* let searchData: any = "";
             this.suggestCtrl = new FormControl(); 
             this.suggestCtrl.valueChanges.debounceTime(100).subscribe( data => 
             {
                 console.log( 'searchData > [' + searchData + ']');
                 if(searchData != data)
                 {
                     searchData = data;
                     console.log( 'data > [' + data + ']');
                     if( data == '' )
                     {
                          this.onClear.emit();
                     }
                     if( data && !this.isPaste) 
                     {
                      if( data.trim().length < this.minlength ) return;
                      let dataSourceURL = this.dataSource + '/'+data.trim();  //saitej
                      console.log('dataSourceURL After append ', dataSourceURL);
                      this.autoSuggestService.getChipListData( dataSourceURL ).subscribe( serviceData => {
                                 this.suggestData = serviceData;
                      });
                    } 
                    else
                    {
                      this.suggestData = [];
                    }
                }
            });*/
          }
          else if( typeof this.dataSource == 'object' )
          {
                console.log("BBAutosuggestComponent:ngOnChanges:inside" ,this.dataSource , "getSuggestData ==  >>" ,this.getSuggestData);
                if(this.getSuggestData)
                {
                    this.suggestData = this.dataSource;
                    //console.log("suggestData",this.suggestData);
                    this.suggestFormattedData = this.autoSuggestService.transformData( this.suggestData ,this.isPophelp , this.displayMetadata );
                    this.suggestData= this.suggestFormattedData;
                    console.log("suggestFormattedData",this.suggestFormattedData);
                    if(this.suggestFormattedData)
                    this.filteredSuggestions = this.suggestCtrl.valueChanges.startWith(null).map( (data: any) => 
                    {
                         return data ? this.filterData(data) : this.suggestFormattedData.slice();
                    });
                }
          }
      }
  } 
    
  
  ngOnInit() {
    console.log('bb-autosuggest ngOnInit 230 typeof datasource && isPophelp ', typeof this.dataSource, this.dataSource , this.isPophelp , Array.isArray(this.dataSource), this.dataSource ,"getSuggestData ==   >> ", this.getSuggestData);
    this.dataSourceComp = this.dataSource;
    let startIndex = this.dataSource.indexOf("FIELDNAME=") + "FIELDNAME=".length;
    let endIndex = this.dataSource.indexOf("&", startIndex);
    let fieldName = endIndex !== -1 ? this.dataSource.substring(startIndex, endIndex) : this.dataSource.substring(startIndex); 
    console.log('Extracted FIELDNAME line no 254:', fieldName); 

    if( typeof this.dataSource == 'string' ) // dataSourceURL - URL for Datasource
    {
        // this.suggestCtrl.valueChanges.debounceTime(100).subscribe( (data: any) => {
        this.suggestCtrl.valueChanges.pipe(debounceTime(100)).subscribe( (data: any) => {
            console.log( 'data > ['+data+']refId[', this.refId ,']');
             
             if(data == '')
             {
                console.log( 'data77777988 > ['+data+']');
                this.onClear.emit();
             }
            
            if(data == undefined || data == null)
            {
                data = '';
            }
                        
            if( (data || this.minlength == 0) && !this.isPaste) 
            {
              	//Added by nikhil on 24-04-2022 geting error trim is not a function on console   
			  	if(data != undefined && data != '' && data != null)
			  	{
              		if( data.trim().length < this.minlength ) return;
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
              //let dataSourceURL = this.dataSource;
        //    let dataSourceURL = this.dataSource + "&refid=" + this.refId + "&" + this.refId + "=" + data;
              if( this.refId !== 'autosuggest-1')
              {
	                //dataSourceURL = this.dataSource + "&refid=" + this.refId + "&" + this.refId + "=" + data;
                  dataSourceURL = this.dataSource + "&refid=" + this.refId + "&" + fieldName.toLowerCase() + "=" + data;
              }
              console.log('dataSourceURL After append 277 in ngOninit ', dataSourceURL);
              this.autoSuggestService.getChipListData( dataSourceURL , this.isPophelp , this.displayMetadata ).subscribe( (serviceData: any) => {
                 // console.log( 'serviceData > ', serviceData );
                  this.suggestData = serviceData;
                 //console.log( 'final data of url > ', this.suggestData);
                  this.onLoadData.emit(this.suggestData);
              });
            } 
            else{
              this.suggestData = [];
            }
        });
    }
    else if( typeof this.dataSource == 'object' ) // dataSource - JSON Object for Datasource
    {
        if(this.getSuggestData)
        {
            this.suggestData = this.dataSource;
            console.log("suggestData",this.suggestData);
            this.suggestFormattedData = this.autoSuggestService.transformData( this.suggestData , this.isPophelp , this.displayMetadata);
            this.suggestData= this.suggestFormattedData;
         //   console.log("suggestFormattedData",this.suggestFormattedData);
            if(this.suggestFormattedData)
            this.filteredSuggestions = this.suggestCtrl.valueChanges.startWith(null).map( (data: any) => {
             // console.log('suggestCtrl.valueChanges.startWith', data);
                return data ? this.filterData(data) : this.suggestFormattedData.slice();
            });
        }
    }
  }  
    
  filterData(value: string) {
      //console.log('final data of static data', value);
       return this.suggestFormattedData.filter((data: any) => {
        return data.displayChipText.toLowerCase().indexOf(value.toLowerCase()) === 0 ;
      });
  }

  log(d:any) {
    console.log(d);
  }
    
  isPaste = false;
  validateData(evt:ClipboardEvent) {
    this.isPaste = true;
    let clipBoardData : string = evt.clipboardData!.getData('Text')!;
    console.log('clipBoardData', clipBoardData );
    let dataSourceURL = this.dataSource + "&refid=list&list=" + clipBoardData;

    this.autoSuggestService.getChipListData( dataSourceURL ,this.isPophelp , this.displayMetadata ).subscribe( (serviceData: any) => {
        console.log( 'serviceData > ', serviceData );
        //Create Valid and Invalid Chips
        //
        for(let suggestObj of serviceData ){
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
      console.log("onValueChange chipvalue  :::" ,this.chipValue );
      this.onChangeValue.emit(this.chipValue );
  }
  
  ngOnDestroy() { 
      console.log("ngOnDestroy of bb-autosuggest component"); 
    }
}    
    







 