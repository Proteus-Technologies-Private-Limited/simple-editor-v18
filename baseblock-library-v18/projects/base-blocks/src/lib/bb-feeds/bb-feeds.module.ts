import { NgModule } from '@angular/core';
import { BBFeedsComponent } from './bb-feeds.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MaterialModule} from '../mat-module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({ declarations: [
        BBFeedsComponent
    ],
    bootstrap: [BBFeedsComponent],
    exports: [
        BBFeedsComponent,
    ], imports: [BrowserModule,
        FormsModule,
        MaterialModule], providers: [provideHttpClient(withInterceptorsFromDi())] })

export class BBFeedsModule { }
