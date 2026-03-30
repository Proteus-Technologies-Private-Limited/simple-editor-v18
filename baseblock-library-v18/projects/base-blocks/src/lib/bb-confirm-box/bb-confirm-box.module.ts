import { NgModule } from '@angular/core';
import { BBConfirmDialogComponent } from './bb-confirm-dialog/bb-confirm-dialog.component'
import { BBConfirmBoxComponent } from './bb-confirm-box.component';
// import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatDialogModule } from '@angular/material/dialog';
// import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule
    ],
    declarations: [BBConfirmDialogComponent, BBConfirmBoxComponent],
    exports: [
        MatButtonModule, MatDialogModule, BBConfirmBoxComponent
    ]
})
export class BBConfirmBoxModule { }