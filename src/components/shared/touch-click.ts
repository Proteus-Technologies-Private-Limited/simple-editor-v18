import {Directive, HostListener, EventEmitter, Output} from "@angular/core";

@Directive({
  standalone: false,
    selector: "[touch-click]"
})
export class TouchClick
{
    @Output('onTouchClick') touchClick = new EventEmitter<any>();
    
	touchId:any;
	startX = 0;
	startY = 0;
    isTouchMoved : boolean = false;

    @HostListener("touchstart", ["$event"])
    public onTouchStart(event: TouchEvent): void
    {
        console.log('onTouchStart', event.targetTouches);
        if (event.targetTouches && event.targetTouches.length == 1) {
            var start: Touch|any = event.targetTouches.item(0);
            this.touchId = start.identifier;
            this.isTouchMoved = false;
            this.startX = start.clientX
            this.startY = start.clientY;
        }
    }

    @HostListener("touchmove", ["$event"])
    public onTouchMove(event: TouchEvent): void
    {
        if( !this.isTouchMoved )
        {
            var move : Touch|any;
            for (var i = 0; i < event.changedTouches.length; i++) 
            {
                if (event.changedTouches.item(i)?.identifier == this.touchId) 
                {
                    move = event.changedTouches.item(i);
                }
            }
            if( move )
            {
                // Check to see if we moved off of the original element
                // Use Page coordinates since we compare with widget's absolute coordinates
                var xCord = move.clientX;
                var yCord = move.clientY;
                var yTop = false, yBottom = false, xLeft = false, xRight = false;
                if( ( xCord + 25 ) < this.startX  ) //decrease the xCordinate
                {
                    xLeft = true;
                }
                if( xCord  > ( this.startX + 25 )  )//increase the xCordinate
                {
                    xRight = true;
                }
                if( ( yCord + 25 ) < this.startY ) //decrease the yCordinate
                {
                    yTop = true;
                }
                if( yCord  > ( this.startY + 25 ) )//increase the yCordinate
                {
                    yBottom = true;
                }
                if (yTop || yBottom || xLeft || xRight) 
                {
                    this.isTouchMoved = true;
                }
            }
        }
    }

    @HostListener("touchend", ["$event"])
    public onTouchEnd(event: TouchEvent): void
    {
        console.log('onTouchEnd', this.isTouchMoved);
        if( !this.isTouchMoved )
        {
            this.touchClick.emit(event);
            event.stopPropagation();
            event.preventDefault();
        }
    }

    @HostListener("click", ["$event"])
    public onClick(event: any): void
    {
        console.log('onClick', this.isTouchMoved, event);
        this.touchClick.emit(event);
        event.stopPropagation();
        event.preventDefault();
    }

    constructor() {

    }
}
