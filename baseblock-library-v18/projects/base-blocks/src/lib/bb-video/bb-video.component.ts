import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, OnDestroy } from '@angular/core';
import { VgAPI } from 'ngx-videogular';
//import { CourseAPIService } from '../../course-contents/course-api.service';

declare var downloadFile: any;

@Component({
    selector: 'bb-video',
    templateUrl: './bb-video.component.html',
    styleUrls: ['./bb-video.component.css', './videogular.css'],
    // encapsulation: ViewEncapsulation.Native
    encapsulation: ViewEncapsulation.None,
})
export class BBVideoComponent implements OnInit, OnDestroy {
    @Input() videoItem:any;
    @Input() videoAPIs:any;
    @Output() onReady = new EventEmitter();
    @Input() crossOriginControlsFucnt: boolean = false;

    //TODO: Need to identify way of providing ID dynamically
    @Input() videoId = 'video1';
    api: any= VgAPI;
    isDefaultPlayer = true;
    public pluginMetadata:any;
    @Output('onPlayerClose') pluginEvtEmitter = new EventEmitter();
    videoUsage:any[] = [];
    downloadVidImg:any;
    noDownloadVidImg:any;
    onfullScreen: boolean = false;
    hostUrl:any;

    //constructor(private courseApiService: CourseAPIService) { }
    constructor() { }

    ngOnInit() {
        this.hostUrl = this.videoAPIs.hosturl;
        console.log('In BBVideoComponent ngOnInit', this.pluginMetadata);
        if (this.pluginMetadata && this.pluginMetadata.compData.data) {
            this.crossOriginControlsFucnt = true;
            this.videoItem = this.pluginMetadata.compData.data;
        }
        
        this.downloadVidImg =   this.videoAPIs.assetImageUrl + "/svg/download.svg";
        this.noDownloadVidImg = this.videoAPIs.assetImageUrl + "/svg/download_off.svg";
    }

    onPlayerReady(api: VgAPI | any) {
        console.log('On Player Ready', api);
        this.api = api;
        /*      
        setTimeout(() => {
             this.api.play();
        }, 200); 	*/
        this.onReady.emit({ 'vgApi': api, 'vgMedia': api.medias['video1'] });

        this.subscribeToEvents();
    }

    subscribeToEvents() {
        this.api.getDefaultMedia().subscriptions.play.subscribe(
            () => {
                this.onPlay();
            });

        this.api.getDefaultMedia().subscriptions.pause.subscribe(
            () => {
                this.onPause();
            });

        this.api.getDefaultMedia().subscriptions.ended.subscribe(
            () => {
                this.onEnd();
            });
    }

    onPlay() {
        console.log('Video Played', this.api);
        var currTime = new Date().getTime();
        var startObj = { 'start': currTime + '' };
        this.videoUsage.push(startObj);
    }

    onPause() {
        console.log('Video Paused', this.api);
        var currTime = new Date().getTime();
        var pauseObj = { 'pause': currTime + '' };
        this.videoUsage.push(pauseObj);
    }

    onEnd() {
        console.log('Video Ended', this.api);
    }

    logVideoUsage() {
        console.log('bb-video destroyed');
        var lastIndex = this.videoUsage.length - 1;
        var lastObj = this.videoUsage[lastIndex];

        if (lastObj) {
            var lastEntry = Object.keys(lastObj)[0];
            var endObj;
            if (lastEntry == 'pause') {
                var lastPauseTime = lastObj['pause'];
                endObj = { 'end': lastPauseTime + '' };
            }
            else {
                var currTime = new Date().getTime();
                endObj = { 'end': currTime + '' };
            }
            this.videoUsage.push(endObj);

            this.videoItem['USAGE_DETAIL_DATA'] = this.videoUsage;
            this.pluginEvtEmitter.emit(this.videoItem);
        }
        console.log('videoUsage', this.videoUsage);
    }

    downloadVideos() {
        downloadFile(this.videoItem.DOC_ID, this.videoItem.DOC_NAME, this.videoItem.DOC_TYPE, false, function (resp:any) {
            console.log('On Download of course video', resp);
        });
    }

    onfullScreenClick(){
        this.onfullScreen = !this.onfullScreen;
        console.log('onfullScreen',this.onfullScreen);
    }

    ngOnDestroy() {
        this.logVideoUsage();
    }

}
