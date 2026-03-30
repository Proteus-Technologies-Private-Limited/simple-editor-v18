import { Component, Input } from '@angular/core';

@Component( {
    selector: 'bb-json-editor',
    templateUrl: './bb-json-editor.component.html',
    styleUrls: ['./bb-json-editor.component.css']
})
export class BBJsonEditorComponent {
    @Input() json: any = {};

    constructor()
    {}
    
    ngOnInit()
    {
     console.log('Print json in jsoneditor',this.json);   
    }
}
