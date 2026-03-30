import { ModuleWithProviders } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AgmCoreModule,AgmInfoWindow,InfoWindowManager,MarkerManager,GoogleMapsAPIWrapper } from '@agm/core';
import { BbmapComponent,BBMarker,BBConfirmDialog } from './bb-map.component';

import { LAZY_MAPS_API_CONFIG, LazyMapsAPILoaderConfigLiteral } from '@agm/core';
import {Injectable} from '@angular/core';
import {MaterialModule} from '../mat-module';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';

/*
export const BBMapModule = (apiKey: string) => {
@NgModule({
  declarations: [
    BbmapComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      libraries: ["places"],
      apiKey: apiKey,
    })
  ],
  exports: [
    BbmapComponent,
    AgmCoreModule,
  ]
})

class BBMapModule {}
 return BBMapModule;
}
 */

/*
 @NgModule({
  declarations: [
    BbmapComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AgmCoreModule.forRoot(
    {
        libraries: ['places'],
      //  apiKey: 'AIzaSyAYI_Jj39gtDEEHK_89cxFZ7zm-wIMOM3g'
       //API KEY Copied from /ibase/webitm/jsp/viewPlaceMap.jsp
        apiKey: 'AIzaSyCxZdyc2eH6D2d3J7vWnm-loqGQq-ifZwE'
    })
  ],
  exports: [
    BbmapComponent,
    AgmCoreModule,
  ]
})
 export class BBMapModule { }
 */

@NgModule({
    declarations: [
        BbmapComponent,
        BBMarker,
        BBConfirmDialog,
    ],
    providers: [
        AgmInfoWindow,
        InfoWindowManager,
        MarkerManager,
        GoogleMapsAPIWrapper,
    ],
    imports: [
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        MaterialModule,
        AgmJsMarkerClustererModule,
        AgmCoreModule.forRoot({
            libraries: ['places'],
            // apiKey: 'AIzaSyAYI_Jj39gtDEEHK_89cxFZ7zm-wIMOM3g'
            //API KEY Copied from /ibase/webitm/jsp/viewPlaceMap.jsp
            apiKey: 'AIzaSyCxZdyc2eH6D2d3J7vWnm-loqGQq-ifZwE'
        }),
    ],
    exports: [
        BbmapComponent,
        BBMarker,
        CommonModule,
        AgmCoreModule,
        MaterialModule,
        BBConfirmDialog,
        AgmJsMarkerClustererModule,
    ]
})

  export class BBMapModule  {
   public static forRoot(config: LazyMapsAPILoaderConfigLiteral): ModuleWithProviders<any> {
    return {
      ngModule: BBMapModule,
      providers: [{ provide: LAZY_MAPS_API_CONFIG, useValue: config }],
    };
  }
}
