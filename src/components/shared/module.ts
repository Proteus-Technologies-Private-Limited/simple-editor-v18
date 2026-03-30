import {NgModule} from '@angular/core';

import {CdkTableModule} from '@angular/cdk/table';
import {TouchClick} from './touch-click'; 

@NgModule({
  declarations:[
    TouchClick
  ],
  exports: [
    CdkTableModule,
    TouchClick
  ]
})
export class MaterialModule {}
