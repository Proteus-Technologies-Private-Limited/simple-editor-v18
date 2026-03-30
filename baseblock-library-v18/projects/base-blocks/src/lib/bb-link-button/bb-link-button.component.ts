import { Component, Input } from '@angular/core';

@Component( {
    selector: 'bb-link-button',
    templateUrl: './bb-link-button.component.html',
    styleUrls: ['./bb-link-button.component.css']
})
export class BBLinkButtonComponent {

    @Input( 'uxDesign' ) uxDesign: string = 'UX3';
    @Input( 'autofocus' ) bbAutofocus: boolean = false;
    @Input( 'disabled' ) bbDisabled: boolean = false;
    @Input( 'appearance' ) appearance: string = '';
    @Input ( 'link' ) link: any;
    @Input( 'role' ) role: string = '';
    @Input( 'type' ) bbType: string | any;
}
