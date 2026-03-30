import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'bb-rating',
  templateUrl: './bb-rating.component.html',
  styleUrls: ['./bb-rating.component.css']
})
export class BBRatingComponent implements OnInit {

    range:Array<number> = [5,4,3,2,1];
    overallRatings:Array<number> = [25,10,7,3,1];
    @Input() rate:number | any;
    @Input() isResponsive = false;
    @Input() ratingDetail: any;
    @Input() isSmallRatings: any;
    @Output() updateRate: EventEmitter<any> = new EventEmitter();
    @Output() filterBy: EventEmitter<any> = new EventEmitter();
    totalRatings = 0;
    keys: any;
    temp: any;

    constructor() { }

    ngOnInit() {
        console.log('isSmallRatings ==', this.isSmallRatings);
        console.log('rate ==', this.rate);
        if(this.ratingDetail)
        {
            this.overallRatings.forEach(( rating, i ) => {
                this.totalRatings = this.totalRatings + rating;
            });
        }
    }

    update(value:number) {
        if((this.temp == 1) && value == 1)
        {
            console.log('rate = 1',this.rate,value);
            this.rate = 0;
            this.temp = this.rate;
            this.updateRate.next(0);
        }
        else
        {
            console.log('rate != 1',this.rate,value);
            this.rate = value;
            this.temp = this.rate;
            this.updateRate.next(value);
        }
    }

    reset(){
        if(this.isResponsive){
            this.temp = this.rate;
            this.rate = 0;
        }
    }

    setPrevious(){
        if(this.isResponsive){
            this.rate = this.temp;
        }
    }
}
