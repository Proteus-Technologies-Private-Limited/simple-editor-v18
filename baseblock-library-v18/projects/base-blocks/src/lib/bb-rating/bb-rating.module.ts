import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BBRatingComponent } from './bb-rating.component';
import { MaterialModule } from '../mat-module';

//import { ADD_PLUGINS } from '../../plugin/utils/bb-plugin-util';
//ADD_PLUGINS('bb-rating', BBRatingComponent)

@NgModule({
    declarations: [
        BBRatingComponent
    ],
    imports: [
        BrowserModule,
        MaterialModule
    ],
    exports: [BBRatingComponent],
    providers: []
})
export class BBRatingModule { }
