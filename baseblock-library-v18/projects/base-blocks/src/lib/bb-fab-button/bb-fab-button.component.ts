import { Component, OnInit ,Input} from '@angular/core';

@Component({
  selector: 'bb-fab-button',
  templateUrl: './bb-fab-button.component.html',
  styleUrls: ['./bb-fab-button.component.css']
})
export class BBFabButtonComponent {

@Input('uxDesign') uxDesign: string | any ;

}
