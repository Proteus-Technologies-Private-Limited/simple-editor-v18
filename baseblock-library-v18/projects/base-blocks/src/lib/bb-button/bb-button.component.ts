import { Component, OnInit, Input } from '@angular/core';

@Component( {
    selector: 'bb-button',
    templateUrl: './bb-button.component.html',
    styleUrls: ['./bb-button.component.css']
})
export class BBButtonComponent {

    @Input( 'uxDesign' ) uxDesign: string = 'UX3';
    @Input( 'autofocus' ) bbAutofocus: boolean = false;
    @Input( 'disabled' ) bbDisabled: boolean = false;
    @Input( 'appearance' ) appearance: string | any;
    @Input( 'fontIconClass' ) fontIconClass: string ='';
    @Input( 'class' ) buttonClass: string ='';
}