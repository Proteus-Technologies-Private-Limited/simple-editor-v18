import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// import { SidebarModule } from 'ng-sidebar';
import { BBSideBarComponent } from './bb-side-bar.component';

@NgModule({
  declarations: [
    BBSideBarComponent
  ],
  imports: [
    BrowserModule,
    // SidebarModule.forRoot()
  ],
  exports :[BBSideBarComponent],
  providers: [],
  // entryComponents:[BBSideBarComponent]
})
export class BBSidebarModule { }
