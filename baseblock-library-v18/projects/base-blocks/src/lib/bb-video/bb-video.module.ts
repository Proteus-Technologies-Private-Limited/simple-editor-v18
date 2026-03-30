import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  
import { BrowserModule } from '@angular/platform-browser';

import {VgCoreModule} from 'ngx-videogular';
import {VgControlsModule} from 'ngx-videogular';
import {VgOverlayPlayModule} from 'ngx-videogular';
import {VgBufferingModule} from 'ngx-videogular';

import { BBVideoComponent } from './bb-video.component';

@NgModule({
    declarations: [
        BBVideoComponent,
    ],
    imports: [
        VgCoreModule,
        VgControlsModule,
        VgOverlayPlayModule,
        VgBufferingModule,
        CommonModule,
        BrowserModule,
    ],
    providers: [],
    bootstrap: [],
    exports: [
        BBVideoComponent
    ]
})
export class BBVideoModule { }
