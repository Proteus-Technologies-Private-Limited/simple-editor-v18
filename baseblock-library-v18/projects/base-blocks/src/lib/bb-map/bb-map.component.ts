import { MapsAPILoader } from '@agm/core';
import { HostListener} from '@angular/core';

import { Component, AfterContentInit,AfterViewInit, ContentChildren, QueryList, ChangeDetectorRef,forwardRef, NgZone, ViewChild, ElementRef, Input, Output, EventEmitter  } from '@angular/core';
import { UntypedFormControl, ValidationErrors } from '@angular/forms';
// import { } from '@types/googlemaps';
// import { } from 'googlemaps';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
// import { MatDialog, MatDialogRef } from '@angular/material';
// import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { ValueAccessorBase } from '../form/value-accessor';
import { EMPTY } from 'rxjs';

declare var getCurrentLatLongPosition : any;

let _uniqueIdCounter = 0;
let bbMarkerLoaded = false;

export const BB_MAP_CONTROL_VALUE_ACCESSOR: any = {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BbmapComponent ),
        multi: true
};

@Component({
    selector: 'bb-map',
    templateUrl: './bb-map.component.html',
    styleUrls: ['./bb-map.component.css'],
     providers: [BB_MAP_CONTROL_VALUE_ACCESSOR]
})
export class BbmapComponent<T> extends ValueAccessorBase<T> implements AfterContentInit{
    @ContentChildren( forwardRef(() => BBMarker ),{descendants: true} ) bbMapMarkers: QueryList<BBMarker> | any ;    
   
    @Input() public geoPosition: string | any;
    @Input() public mapMakers: any;
    @Input() public largeView: boolean = true;
    
    @Output() public onLocationChange: EventEmitter<String> = new EventEmitter<String>();
    @Output() public onMarkerChange: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild("search") public searchElementRef: ElementRef | any;
    @ViewChild('agmEle') agmElement: ElementRef | any;

    public searchControl: UntypedFormControl | any;
    public zoom: number | any;
    public latitude: number | any;
    public longitude: number | undefined;
    public makerInfoWindow: string = "";
    public onClickInfoOpen: boolean = false;
    private tempGeoPos :string = "";
    public screenOptions = { position: 3, };
    public zoomControlOptions = { position: 1, };
    public geoPosArry: string[] = ["1", "2"];
    public previousInfoWindow : any ;
    public currentSelectedMarker : any;
    public bbDialogRef: MatDialogRef<BBConfirmDialog> | any;
    public latlngBounds: any;
    smallScreenDevice = true;
    isE12browser :boolean = false;
    
    constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, public dialog: MatDialog , private cdr :ChangeDetectorRef ) 
    {
       
        super();
        let index = window.location.pathname.indexOf('E12BROWSER');
        console.log("index --- > " , index);
        if(index == -1)
        {
            if(window.innerWidth <= 800)
            {
                this.smallScreenDevice = true;
            }
            else
            {
                this.smallScreenDevice = false;
            }
        }
        else
        {
            this.smallScreenDevice = true;    
        }
    
        console.log("smallScreenDevice bb-map component ",this.smallScreenDevice , this.largeView);
         
    }
    
    @HostListener('window:resize') onResize() 
    {
        console.log("window.screen.width in bb-map component",window.innerWidth);
        let index = window.location.pathname.indexOf('E12BROWSER');
        if(index == -1)
        {
            if(window.innerWidth <= 800)
            {
                this.smallScreenDevice = true;
            }
            else
            {
                this.smallScreenDevice = false;
            }
        }
        else
        {
            this.smallScreenDevice = true;    
        }
        console.log("smallScreenDevice  bb-map component ",this.smallScreenDevice , this.largeView);
    }  
        
        
    ngAfterContentInit()
    {
        console.log('ngAfterContentInit:bbMapMarkers and largeView',this.bbMapMarkers , this.largeView);
        console.log("bbmarkers" , (this.smallScreenDevice == true && this.largeView == true));
        let index = window.location.pathname.indexOf('E12BROWSER');
        if(index == -1){
            this.isE12browser = false; 
        }
        else
        {
            this.isE12browser = true;    
        }
        
        this.mapsAPILoader.load().then(() => 
        {
            this.formateMarkers();    
        });
       
        this.bbMapMarkers.changes.subscribe(list => {
           
            let intervalId = setInterval(() => {
                if(bbMarkerLoaded == true)
                {
                    clearInterval(intervalId);
                    this.formateMarkers();  
                }  
            }, 500);
        });
    }
    
    formateMarkers()
    {
        console.log('formateMarkers:bbMapMarkers',this.bbMapMarkers);
        this.latlngBounds = new google.maps.LatLngBounds();
        console.log('formateMarkers:this.latlngBounds:',this.latlngBounds);
        console.log('formateMarkers:bbMapMarkers1',this.bbMapMarkers);
        let check = true;
        this.bbMapMarkers.forEach(bbMarker => {
            console.log("formateMarkers:bbMarker",bbMarker);
            let min = 0.999999;
            let max = 1.000001;
            try
            {
                check = true;
                this.bbMapMarkers.forEach(bbMarkerTemp => 
                {
                    if( bbMarker != bbMarkerTemp && (bbMarkerTemp.lat == bbMarker.lat) && (bbMarkerTemp.lng == bbMarker.lng) && check)
                    {
                        bbMarker.lat = bbMarker.lat * (Math.random() * (max - min) + min);
                        bbMarker.lng = bbMarker.lng * (Math.random() * (max - min) + min);
                        console.log("formateMarkers:bbMarker:after",bbMarker);
                        check = false;
                    }
                });
                
                let myLatlng = new google.maps.LatLng(bbMarker.lat, bbMarker.lng);
                this.latlngBounds.extend(myLatlng);
            }catch(e)
            {
                console.log("Exception in latlng bound:",e);
            }
        });
    }
    validate(c: UntypedFormControl): ValidationErrors 
    {
        return EMPTY
    }
    
    ngOnChanges(change: any) {
        
        console.log("ngOnChanges Change:", change);
             
        if(change.geoPosition.previousValue == null)
        {
            this.makerInfoWindow = "";
            this.initialiseMap();
        }
        else
        {
            console.log("Change Found in geoPosition.......");
            this.makerInfoWindow = "";
            this.tempGeoPos = this.geoPosition;
            this.geoPosArry = this.geoPosition.split(",");
            if (this.geoPosArry != null && this.geoPosArry.length > 0) {
                this.latitude = +this.geoPosArry[0];
                this.longitude = +this.geoPosArry[1];
            }
            if (this.latitude == 0) 
            {
                this.setCurrentPosition();
            }
          
            this.mapsAPILoader.load().then(() => {
                this.getMakerContentWindow();
            });
        }    
    }

    ngOnInit() {
       
        this.makerInfoWindow = "";
        //this.initialiseMap();
    }
    initialiseMap() {
        console.log("Initializing map...........",this.geoPosition)
        this.zoom = 16;
        this.geoPosArry = this.geoPosition.split(",");

        if (this.geoPosArry != null && this.geoPosArry.length > 0) {
            this.latitude = +this.geoPosArry[0];
            this.longitude = +this.geoPosArry[1];
        }
        //create search FormControl
        this.searchControl = new UntypedFormControl();

        //set current position
        if (this.latitude == 0) {
            this.setCurrentPosition();
        }
        this.mapsAPILoader.load().then(() => {
            let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {});
            autocomplete.addListener("place_changed", () => {
                this.ngZone.run(() => {
                    //get the place result
                    let place: google.maps.places.PlaceResult = autocomplete.getPlace();

                    //verify result
                    if (place.geometry === undefined || place.geometry === null) {
                        return;
                    }

                    //set latitude, longitude and zoom
                    // this.latitude = place.geometry.location.lat();
                    this.latitude = place.geometry.location?.lat();
                    this.longitude = place.geometry.location?.lng();
                    // console.log("place_changed-this.latitude:"+this.latitude);
                    // console.log("place_changed-this.longitude:"+this.longitude);
                    //this.getMakerContentWindow(); 
                    if(this.currentSelectedMarker != null)
                    {
                        this.currentSelectedMarker.lat = place.geometry.location?.lat();
                        this.currentSelectedMarker.lng = place.geometry.location?.lng();
                        this.currentSelectedMarker.oldLat = place.geometry.location?.lat()
                        this.currentSelectedMarker.oldLng = place.geometry.location?.lng();
                        this.currentSelectedMarker.addrAppend = true;
                        this.clickedMarker(this.currentSelectedMarker,1);
                    }  
                    this.tempGeoPos =  this.latitude + "," + this.longitude;
                    this.onLocationChange.emit(this.latitude + "," + this.longitude);
                });
            });
            this.getMakerContentWindow();
            //this.getCurrentAddress(); 
        });
    }

    setCurrentPosition() {
        console.log("setCurrentPosition...");
        //if ("geolocation" in navigator)
        if (true) {
//            navigator.geolocation.getCurrentPosition((position) => {
//                console.log("setCurrentPosition...");
//                this.latitude = position.coords.latitude;
//                this.longitude = position.coords.longitude;
//                this.zoom = 16;
//                console.log("this.latitude:" + this.latitude);
//                console.log("this.longitude:" + this.longitude);
//                //this.getMakerContentWindow();
//                this.tempGeoPos =  this.latitude + "," + this.longitude;
//                this.onLocationChange.emit(this.latitude + "," + this.longitude);
//            });
            getCurrentLatLongPosition((position: any) => {
                console.log("setCurrentPosition...", position);
                this.latitude = position.latitude;
                this.longitude = position.longitude;
                this.zoom = 16;
                console.log("this.latitude:" + this.latitude);
                console.log("this.longitude:" + this.longitude);
                //this.getMakerContentWindow();
                this.tempGeoPos =  this.latitude + "," + this.longitude;
                this.onLocationChange.emit(this.latitude + "," + this.longitude);
            });
            
             console.log("---- end of location ---");
        }
    }

    placeMarker($event: any) {
        console.log($event.coords.lat);
        console.log($event.coords.lng);
        //this.setCurrentPosition();
        this.latitude = $event.coords.lat;
        this.longitude = $event.coords.lng;
        //this.getMakerContentWindow();    
        this.tempGeoPos =  this.latitude + "," + this.longitude;
        this.onLocationChange.emit(this.latitude + "," + this.longitude);
    }
    markerDragEnd($event: any) {
        //console.log("markerDragEnd"+$event.coords.lat);
        // console.log("markerDragEnd"+$event.coords.lng);

        this.latitude = $event.coords.lat;
        this.longitude = $event.coords.lng;
        //this.getMakerContentWindow();
        this.tempGeoPos =  this.latitude + "," + this.longitude;
        this.onLocationChange.emit(this.latitude + "," + this.longitude);
    }
    getMakerContentWindow() {
        try {
            console.log("getMakerContentWindow");
            //this.makerInfoWindow="";
            //if (navigator.geolocation)
            if (true) {
                let geocoder = new google.maps.Geocoder();
                let latlng = new google.maps.LatLng(this.latitude, this.longitude);

                geocoder.geocode({ "location": latlng }, (results: any, status) => {
                    //console.log("11111111111111111111 Try......");
                    console.log("results" + this.latitude + ":" + this.longitude + ":" + status + "", results)
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (results[0] != null) {
                            this.makerInfoWindow = results[0].formatted_address;
                        }
                        else {
                            //this.makerInfoWindow = "";
                        }
                    }
                    console.log("makerInfoWindow" + this.makerInfoWindow);
                });
            }
        } catch (e) {
            console.log("bb-mapComponent:Exception:", e);
        }
    }

    /* getCurrentAddress()
     {
         let intervalId = setInterval(() => {
             let geocoder = new google.maps.Geocoder();
             let latlng = new google.maps.LatLng(this.latitude, this.longitude);
             geocoder = new google.maps.Geocoder();
             latlng = new google.maps.LatLng(this.latitude, this.longitude);
             geocoder.geocode({"location":latlng}, (results, status) => 
             {    
                  console.log("interval loop Try......results"+this.latitude+":"+ this.longitude+""+status+"", results);
                  if (status == google.maps.GeocoderStatus.OK) 
                  {
                     if (results[0] != null) 
                     {
                        this.makerInfoWindow = results[0].formatted_address;                      
                     } 
                     else 
                     {
                        this.makerInfoWindow = "";
                     }
                     clearTimetervalId);
                  }
             }   }, 5000);
     }*/  
    
    onMouseOver(infoWindow: any) {
        infoWindow.open();
        //this.getMakerContentWindow();
    }
    onMouseOut(infoWindow: any) {
        if (this.onClickInfoOpen == false) {
            infoWindow.close();
        }
    }
    onMouseClick(infoWindow: any) {
        //infoWindow.open();
        //this.onClickInfoOpen = true;
        //this.getMakerContentWindow();
    }
    infoWindowClose(infoWindow: any) {
        if (this.onClickInfoOpen == true) {
            this.onClickInfoOpen = false;
        }
    }

    clickedMarker(marker: any, index: number) {
        console.log("clicked the marker:",marker);
        this.currentSelectedMarker = marker;
        if(marker.addrAppend || marker.descr == null || marker.descr == '')
        {
            let geocoder = new google.maps.Geocoder();
            let latlng = new google.maps.LatLng(marker.lat, marker.lng);

            geocoder.geocode({ "location": latlng }, (results: any, status) => {
                console.log("results" + this.latitude + ":" + this.longitude + ":" + status + "", results)
                if (status == google.maps.GeocoderStatus.OK) 
                {
                    if (results[0] != null) {
                        marker.addrAppend = false;
                        marker.descr = results[0].formatted_address;
                    }
                    else {
                        
                    }
                 }
                    console.log("marker.descr" + marker.descr);
            });
        }
    }

     infoWindowToggle(infowindow: any) 
     {   
         if(this.previousInfoWindow != null)
         {
            try
            {
                this.previousInfoWindow.close();
            }catch(e)
            {
                console.log("Exception in closing window:",e);
            }
         }
         this.previousInfoWindow = infowindow;
     }
    
    newPlaceMarker($event: any) {
        this.mapMakers.push({
            lat: $event.coords.lat,
            lng: $event.coords.lng
        });
    }
    multiMarkerInfoWindClose(marker: any)
    {
        this.currentSelectedMarker = null;
    }
    multiMarkerDragEnd(marker: any, event: any) 
    {
        console.log('dragEnd', marker, event);
        this.bbDialogRef = this.dialog.open(BBConfirmDialog, {
         disableClose: true
        });
        this.bbDialogRef.componentInstance.confirmMessage = "Are you sure, you want to change the location?"
    
        this.bbDialogRef.afterClosed().subscribe((result:any) => {
          if(result) 
          {
             marker.addrAppend = true;
             marker.lat = event.coords.lat;
             marker.lng = event.coords.lng;
             marker.oldLat = marker.lat;
             marker.oldLng = marker.lng;
             this.clickedMarker(marker,1);
             this.onMarkerChange.emit(marker);
          }
          else
          {
              console.log("bbDialogRef.....................false");
              marker.lat = 0;
              marker.lng = 0;
              let intervalId = setTimeout(() => 
              {
                   console.log("bbDialogRef.....................");
                   marker.lat =  +marker.oldLat;
                   marker.lng =  +marker.oldLng;
              }, 50);
              
             
          }
          this.bbDialogRef = null;
        });
       
    }
    ngAfterViewChecked(){
        this.cdr.detectChanges();
    }
     
    agmTouchMove()
    {
        console.log("=== touchmove === ");
        this.agmElement.nativeElement.style.pointerEvents = 'auto';
    }
    
    agmTouchEnd(){
        console.log(" ==== touchend)   ==== ");
        this.agmElement.nativeElement.style.pointerEvents = 'none';
    }
    
    
}

@Component( {
    selector: 'bb-marker',
    template: "<div> <ng-content></ng-content> </div>"
})
export class BBMarker implements AfterViewInit{

    private _uniqueId: string = `bb-marker-${_uniqueIdCounter++}`;
    @Input("lat") lat: any;
    @Input("lng") lng: any;
    @Input("label") label: string | any;
    @Input("draggable") draggable: boolean = true;
    @Input("extraJSON") extraJSON: any;
    @Input('id') bbMakerId: string = this._uniqueId;
    @Input('isInfoWindowOpen') isInfoWindowOpen: boolean = false;
    @Input('bbMapInfoWindow') bbMapInfoWindow1: any;
    @Input('descr')descr: string | any;
    private oldLat: any;
    private oldLng: any;
    addrAppend: boolean = true;
    
    constructor(private _element: ElementRef, private mapsAPILoader: MapsAPILoader, private ngZone: NgZone , private cdr :ChangeDetectorRef ) {
        console.log("BBMaker.....................");
        //super();
    }
    
    ngAfterViewInit()
    {
        console.log("BBMaker.....................bbMapInfoWindow1",this.bbMapInfoWindow1);
    }
    ngOnInit() 
    {
        bbMarkerLoaded = false;
        if ("geolocation" in navigator && this.lat == 0)
        {
            navigator.geolocation.getCurrentPosition((position) => {
                console.log("setCurrentPosition...");
                this.lat = position.coords.latitude;
                this.lng = position.coords.longitude;
                
                console.log("this.lat:" + this.lat);
                console.log("this.lng:" + this.lng);
    
                this.oldLat = this.lat;
                this.oldLng = this.lng;
                
                this.extraJSON.geoPos =  this.lat + "," + this.lng;
                let geocoder = new google.maps.Geocoder();
                let latlng = new google.maps.LatLng(this.lat, this.lng);
                geocoder.geocode({ "location": latlng }, (results: any, status) => {
                console.log("results" + this.lat + ":" + this.lng + ":" + status + "", results)
                    if (status == google.maps.GeocoderStatus.OK) 
                    {
                        if (results[0] != null) 
                        {
                             this.descr = results[0].formatted_address;
                        }
                    }
                    console.log("this.descr" + this.descr);
                });
                bbMarkerLoaded = true;
            });
            
        }
        else if(this.isInfoWindowOpen && (this.descr == null || this.descr == ''))
        {
            let geocoder = new google.maps.Geocoder();
            let latlng = new google.maps.LatLng(this.lat, this.lng);
            geocoder.geocode({ "location": latlng }, (results: any, status) => {
            console.log("results" + this.lat + ":" + this.lng + ":" + status + "", results)
                if (status == google.maps.GeocoderStatus.OK) 
                {
                    if (results[0] != null) 
                    {
                         this.descr = results[0].formatted_address;
                    }
                }
                console.log("this.descr" + this.descr);
            });
            bbMarkerLoaded = true;
        }
        else
        {
            bbMarkerLoaded = true;
        }   
        this.oldLat = this.lat;
        this.oldLng = this.lng;
    }
        
    _getHostElement(): HTMLElement 
    {
        return this._element.nativeElement;
    }
    viewValue(): any 
    {
        return this._getHostElement();
    }
}

@Component({
  selector: 'confirm-dialog',
  template: `<h1 mat-dialog-title>Confirm Location</h1>
                <div mat-dialog-content>{{confirmMessage}}</div>
                <div mat-dialog-actions>
                  <span class="confDialogCancel" (click)="dialogRef.close(false)">CANCEL</span>
                  <span class="confDialogConfirm" (click)="dialogRef.close(true)">CONFIRM</span>
                </div>`,
})
export class BBConfirmDialog 
{
  constructor(public dialogRef: MatDialogRef<BBConfirmDialog>) 
  {
      console.log("BBConfirmDialog.....................dialogRef",this.dialogRef);
  }
  public confirmMessage: string | any;
}
