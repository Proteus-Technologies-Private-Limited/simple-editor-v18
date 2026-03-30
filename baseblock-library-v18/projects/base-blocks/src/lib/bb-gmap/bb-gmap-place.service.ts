import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class BBGmapPlaceService {

    getFormattedAddress( _latlng : google.maps.LatLngLiteral ) {
        console.log('getFormattedAddress..');

        let formattedAddress = new BehaviorSubject<string>('');
        let geocoder = new google.maps.Geocoder();
        let latlng = new google.maps.LatLng(_latlng.lat, _latlng.lng);

        geocoder.geocode({ "location": latlng }, (results: any, status) => {
            console.log("results", _latlng , ":", results, status)
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0] != null) {
                    formattedAddress.next(results[0].formatted_address);
                }
                else {
                    formattedAddress.next("");
                }
            }
            console.log("formattedAddress", formattedAddress.value);
        });
        return formattedAddress;
    }

    getAddress(place: any) {
        return place['formatted_address'];
    }

    getStreetNumber(place: any) {
        const COMPONENT_TEMPLATE = { street_number: 'short_name' },
            streetNumber = this.getAddrComponent(place, COMPONENT_TEMPLATE);
        return streetNumber;
    }

    getStreet(place: any) {
        const COMPONENT_TEMPLATE = { route: 'long_name' },
            street = this.getAddrComponent(place, COMPONENT_TEMPLATE);
        return street;
    }

    getCity(place: any) {
        const COMPONENT_TEMPLATE = { locality: 'long_name' },
            city = this.getAddrComponent(place, COMPONENT_TEMPLATE);
        return city;
    }

    getState(place: any) {
        const COMPONENT_TEMPLATE = { administrative_area_level_1: 'short_name' },
            state = this.getAddrComponent(place, COMPONENT_TEMPLATE);
        return state;
    }

    getDistrict(place: any) {
        const COMPONENT_TEMPLATE = { administrative_area_level_2: 'short_name' },
            state = this.getAddrComponent(place, COMPONENT_TEMPLATE);
        return state;
    }

    getCountryShort(place: any) {
        const COMPONENT_TEMPLATE = { country: 'short_name' },
            countryShort = this.getAddrComponent(place, COMPONENT_TEMPLATE);
        return countryShort;
    }

    getCountry(place: any) {
        const COMPONENT_TEMPLATE = { country: 'long_name' },
            country = this.getAddrComponent(place, COMPONENT_TEMPLATE);
        return country;
    }

    getPostCode(place: any) {
        const COMPONENT_TEMPLATE = { postal_code: 'long_name' },
            postCode = this.getAddrComponent(place, COMPONENT_TEMPLATE);
        return postCode;
    }

    getPhone(place: any) {
        const COMPONENT_TEMPLATE = { formatted_phone_number: 'formatted_phone_number' },
            phone = this.getAddrComponent(place, COMPONENT_TEMPLATE);
        return phone;
    }

    private getAddrComponent(place: any, componentTemplate: any) {
        let result;

        for (let i = 0; i < place.address_components.length; i++) {
            const addressType = place.address_components[i].types[0];
            if (componentTemplate[addressType]) {
                result = place.address_components[i][componentTemplate[addressType]];
                return result;
            }
        }
        return;
    }

}