import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'bb-side-bar',
  templateUrl: './bb-side-bar.component.html',
  styleUrls: ['./bb-side-bar.component.css']
})
export class BBSideBarComponent implements OnInit {
 
  @Input() _opened: boolean = false;
  
  constructor(){}

  public ngOnInit(){

  }
  
  private _toggleSidebar(): void {
    this._opened = !this._opened;
  }

}
