import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GoogleMapsModule } from '@angular/google-maps';

import { BBGmapComponent } from './bb-gmap.component';
import { BBGmapSearchComponent } from './bb-gmap-search.component';
import { BBGmapPlaceService } from './bb-gmap-place.service';

@NgModule({
  declarations: [BBGmapComponent, BBGmapSearchComponent],
  exports: [BBGmapComponent, BBGmapSearchComponent, GoogleMapsModule],
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    GoogleMapsModule
  ],
  providers: [BBGmapPlaceService]
})
export class BBGmapModule { }
