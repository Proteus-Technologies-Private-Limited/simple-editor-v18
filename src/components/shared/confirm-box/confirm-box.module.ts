import { NgModule } from '@angular/core';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ConfirmBoxComponent } from './confirm-box.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule
    ],
    declarations: [ConfirmDialogComponent, ConfirmBoxComponent],
    exports: [
        MatButtonModule, MatDialogModule, ConfirmBoxComponent
    ]
})
export class ConfirmBoxModule { }
