import { Component, Input } from '@angular/core';

@Component( {
    selector: 'bb-label',
    templateUrl: './bb-label.component.html',
    styleUrls: ['./bb-label.component.css']
})
export class BBLabelComponent {
    @Input( 'align' ) align: string | any; 
}
