import { Component, OnInit, Input } from '@angular/core';

@Component( {
    selector: 'bb-toggle-button',
    templateUrl: './bb-toggle-button.component.html',
    styleUrls: ['./bb-toggle-button.component.css']
})
export class BBToggleButtonComponent {

    @Input( 'uxDesign' ) uxDesign: string = 'UX3';
    @Input( 'checked' ) bbChecked: boolean = false;
    @Input( 'disabled' ) bbDisabled: boolean = false;
}
