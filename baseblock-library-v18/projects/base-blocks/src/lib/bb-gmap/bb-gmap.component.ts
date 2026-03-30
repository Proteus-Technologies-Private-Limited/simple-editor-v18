import { Component, OnInit, ViewChild, NgZone, ChangeDetectorRef} from '@angular/core';
import { MapInfoWindow, MapMarker, GoogleMap } from '@angular/google-maps'
import { BBGmapPlaceService } from './bb-gmap-place.service';

declare var getCurrentLatLongPosition : any;

@Component({
  selector: 'bb-gmap',
  templateUrl: './bb-gmap.component.html',
  styleUrls: ['./bb-gmap.component.css']
})
export class BBGmapComponent implements OnInit {

  @ViewChild(GoogleMap, { static: false }) map: GoogleMap | any
  @ViewChild(MapInfoWindow, { static: false }) info: MapInfoWindow | any

  zoom = 12;
  center: google.maps.LatLngLiteral|any;

  options: google.maps.MapOptions = {
    //Enables/disables all default UI. May be overridden individually.
    disableDefaultUI: true,

    //The initial Map mapTypeId. Defaults to ROADMAP.
    /*
    HYBRID	This map type displays a transparent layer of major streets on satellite images.
    ROADMAP	This map type displays a normal street map.
    SATELLITE	This map type displays satellite images.
    TERRAIN	This map type displays maps with physical features such as terrain and vegetation.
    */
    mapTypeId: 'roadmap',
    
    /*
      Type:  string optional
      This setting controls how the API handles gestures on the map. Allowed values:
      "cooperative": 
          Scroll events and one-finger touch gestures scroll the page, and do not zoom or pan the map. 
          Two-finger touch gestures pan and zoom the map. 
          Scroll events with a ctrl key or ⌘ key pressed zoom the map.
          In this mode the map cooperates with the page.
      "greedy": 
          All touch gestures and scroll events pan or zoom the map.
      "none": 
          The map cannot be panned or zoomed by user gestures.
      "auto": (default) 
          Gesture handling is either cooperative or greedy, depending on whether the page is scrollable or in an iframe.
    */
    gestureHandling : "auto",
    
    //The enabled/disabled state of the Fullscreen control.
    fullscreenControl: true, 
    fullscreenControlOptions : {position: google.maps.ControlPosition.LEFT_BOTTOM},

    /*
    The initial enabled/disabled state of the Street View Pegman control. 
    This control is part of the default UI, and should be set to false 
    when displaying a map type on which the Street View road overlay should not appear 
    */
    streetViewControl: false,
    streetViewControlOptions : {position: google.maps.ControlPosition.RIGHT_CENTER},
   
    //The enabled/disabled state of the Rotate control.
    rotateControl : false,
    rotateControlOptions : {position: google.maps.ControlPosition.RIGHT_CENTER},
  
    //The initial enabled/disabled state of the Scale control.
    scaleControl: false,
    
    //The initial enabled/disabled state of the Map type control.
    mapTypeControl: false,
    mapTypeControlOptions : {
      position: google.maps.ControlPosition.RIGHT_BOTTOM,
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
    },

    //The enabled/disabled state of the Zoom control.
    zoomControl: true,
    zoomControlOptions : {position: google.maps.ControlPosition.LEFT_BOTTOM},
    maxZoom: 15,
    minZoom: 8,
  }

  markers: any[] = []
  infoContent = ''

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef, private placeService: BBGmapPlaceService) { }

  ngOnInit(): void {
    this.setInitialPosition();
  }
  
  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  setInitialPosition() {
    getCurrentLatLongPosition((position: any) => {
        this.center = {
          lat: position.latitude,
          lng: position.longitude,
        }
        this.zoom = 12;
        console.log("setInitialPosition center:" + this.center);
        this.addMarker(this.center);
    });
  }

  onPlaceChanged(place: any){
    this.ngZone.run(() => {
      //set latitude, longitude and zoom
      var _center = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      }
      this.center = _center;
      this.zoom = 12;
      this.infoContent = this.placeService.getAddress(place);
      this.addMarker(_center);
    });
  }

  setPosition(_center: any){
    this.ngZone.run(() => {
      //set latitude, longitude and zoom
      this.center = _center;
      this.zoom = 12;
      this.updateAddress(_center);
      this.addMarker(_center);
    });
  }

  addMarker(_marker_pos: any) {
    this.markers = [];
    this.markers.push({
      position: {
        lat: _marker_pos.lat,
        lng: _marker_pos.lng
      },
      // label: {
      //   color: 'red',
      //   text: 'Marker label ' + (this.markers.length + 1),
      // },
      // title: 'Marker title ' + (this.markers.length + 1),
      // info: 'Marker info ' + (this.markers.length + 1),
      options: {
        draggable:true
      },
    });
  }

  markerClicked(marker: MapMarker, content: any) {
    console.log('openInfo :', marker, content )
    
    if(content) this.infoContent = content;
    this.info.open(marker);
  }
  
  markerDropped(event: google.maps.MouseEvent | null){
    console.log("markerDropped event:", event);
    var _dropped_pos = {
      lat: event!.latLng!.lat(),
      lng: event!.latLng!.lng()
    }
    console.log("mapClicked center:", _dropped_pos);
    this.updateAddress(_dropped_pos);
    this.addMarker(_dropped_pos);
  }

  updateAddress(_latlng: any) {
    console.log("mapClicked center:", _latlng);
    this.placeService.getFormattedAddress(_latlng).subscribe( (formattedAddress) => {
      this.ngZone.run(() => {
        this.infoContent = formattedAddress;
      });
    });
  }

}
