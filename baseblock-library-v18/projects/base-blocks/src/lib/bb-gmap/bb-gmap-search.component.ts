/// <reference types="@types/googlemaps" />
import { Component, ViewChild, EventEmitter, Output, OnInit, AfterViewInit, Input } from '@angular/core';

declare var getCurrentLatLongPosition : any;

@Component({
  selector: 'bb-gmap-search',
  template: `
    <div class="bbgms-input-group">
        <input #addresstext type="text" class="bbgms-input" 
              placeholder="Search for location" 
              autocorrect="off" 
              autocapitalize="off" 
              spellcheck="off" 
              [(ngModel)]="autocompleteInput"> 
        <span class="bbgms-current-loc vision-ui-gps_location_lock" 
            title="Pick Current Location"
            (click)="setCurrentPosition()" >
        </span>
    </div>
  `,
  styles: [
    `
      .bbgms-input-group {
        width: calc(100% - 20px);
        margin: auto;
        min-width: 100px;
        display: flex;
        position: relative;
      }

      .bbgms-current-loc {
        position: absolute;
        font-size: 24px;
        cursor: pointer;
        right: 0px;
        padding: 8px;
        background-position: center center;
        background-repeat: no-repeat;
        background-size: cover;
      }
      /*
      .bbgms-input {
        display: block;
        width: 100%;
        padding: 0.4em 0px;
        margin: -1px;
        font-size: 1rem;
        line-height: 1.25;
        color: #55595c;
        background-color: #fff;
        background-image: none;
        -webkit-background-clip: padding-box;
        background-clip: padding-box;
        border: 1px solid rgba(0, 0, 0, .15);
        border-radius: .25rem;
        outline: none;
        box-shadow: none;
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
      }
      */
      .bbgms-input {
        display: block;
        min-height: 27px;
        font-size: 1em;
        font-weight: 600;
        width: 100%;
        padding: 0.4em 40px .4em 10px;
        margin: -1px;
        line-height: 1.25;
        color: #666666;
        background-color: #ffffff;
        background-image: none;
        background-clip: padding-box;
        border: 1px solid rgba(0, 0, 0, .15);
        border-radius: .25rem;
        outline: none;
        overflow: hidden;
        box-shadow: none;
      }

      .bbgms-input:focus {
        border-bottom: 1px solid blue !important;
      }
    `
  ]
})
export class BBGmapSearchComponent implements OnInit, AfterViewInit  {

  @Input() adressType: string | any;

  @Output() onSetCurrentPosition: EventEmitter<any> = new EventEmitter();
  @Output() onPlaceChange: EventEmitter<any> = new EventEmitter();

  @ViewChild('addresstext') addresstext: any;

  autocompleteInput: string | any;
  selectedPlace: google.maps.places.PlaceResult | undefined;

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
      this.getPlaceAutocomplete();
  }

  private getPlaceAutocomplete() {
      const searchBox = new google.maps.places.SearchBox(this.addresstext.nativeElement);
      const autocomplete = new google.maps.places.Autocomplete(this.addresstext.nativeElement,
        /*{
            componentRestrictions: { country: 'US' },
            types: [this.adressType]  // 'establishment' / 'address' / 'geocode'
        }*/
        {}
      );
      autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          this.changePlace(place);
      });

      this.addresstext.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
        if(!event.key) {
            return;
        }

        let key = event.key.toLowerCase();
        console.log('keydown', key, event.target, searchBox.getPlaces());
        if (key == 'enter' && event.target === this.addresstext.nativeElement) {

            let places = searchBox.getPlaces();
            if( !this.selectedPlace && places ){
              this.changePlace(places[0]);
            }
            event.preventDefault();
            event.stopPropagation();
        }
        else{
          this.selectedPlace = undefined;
        }
      });

    // according to https://gist.github.com/schoenobates/ef578a02ac8ab6726487
    if (window && window.navigator && window.navigator.userAgent && navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
      setTimeout(() => {
        let containers = document.getElementsByClassName('pac-container');
        if (containers) {
          let arr = Array.from(containers);
          if (arr) {
            for (let container of arr) {
              if (!container)
                continue;
              container.addEventListener('touchend', (e) => {
                e.stopImmediatePropagation();
              });
            }
          }
        }
      }, 500);
    }
  }

  changePlace(place: google.maps.places.PlaceResult) {
    if (place.geometry === undefined || place.geometry === null) {
      return;
    }
    this.selectedPlace = place;
    console.log("changePlace place:" + place);
    this.onPlaceChange.emit(place);
  }

  setCurrentPosition() {
    getCurrentLatLongPosition((position: any) => {
        console.log("getCurrentLatLongPosition...", position);
        var center = {
          lat: position.latitude,
          lng: position.longitude,
        }
        console.log("setCurrentPosition center:" + center);
        this.onSetCurrentPosition.emit(center);
    });
  }

}
