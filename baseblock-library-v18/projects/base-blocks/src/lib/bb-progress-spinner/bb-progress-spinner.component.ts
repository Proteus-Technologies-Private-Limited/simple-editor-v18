import { Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { interval, Subscription } from 'rxjs';
import { TemplatePortal } from '@angular/cdk/portal';

@Component({
	selector: 'bb-progress-spinner',
	templateUrl: './bb-progress-spinner.component.html',
	styleUrls: ['./bb-progress-spinner.component.css'],
})

export class BBProgressSpinnerComponent implements OnInit {

	loading = true;
	color: ThemePalette = 'primary';
	mode: ProgressSpinnerMode = 'indeterminate';
	value = 50;
	overLayRefForMoreOption: OverlayRef | any;
	@ViewChild('spinnerTemp') spinnerTemp: TemplateRef<any> | any;
	overLayRefForSpinner: OverlayRef | any;

	constructor(private overlay: Overlay, private viewContainerRef: ViewContainerRef) {
		
	}

	ngOnInit() {
	}

	loadContent() {
		this.loading = true;
		const subs$: Subscription = interval(1200).subscribe(res => {
			this.value = this.value + 10;
			if (this.value === 120) {
				subs$.unsubscribe();
				this.loading = false;
				this.value = 0;
			}
		});
	}

	ngAfterViewInit() {
	}

	setLoading(value) {
		try
		{
			if (value == true) 
			{
				this.overLayForSpinner();
			}
			else
			{
				if(this.overLayRefForSpinner)
				{
					this.overLayRefForSpinner.dispose();
				}
			}
		}
		catch(e)
		{
			console.log('Exception inside bb spinner:::',e);
		}
	}

	overLayForSpinner() {
		let width = '300';
		let top = 280;
		let left = 280;
		let bottom = 0;
		const positionStrategy = this.overlay.position()
			.global()
			.centerHorizontally()
			.centerVertically();

		const overlayConfig = new OverlayConfig({
			positionStrategy,
		});

		overlayConfig.hasBackdrop = true;
		const templatePortal = new TemplatePortal(this.spinnerTemp, this.viewContainerRef);
		this.overLayRefForSpinner = this.overlay.create(overlayConfig);
		this.overLayRefForSpinner.attach(templatePortal);
	}
}
