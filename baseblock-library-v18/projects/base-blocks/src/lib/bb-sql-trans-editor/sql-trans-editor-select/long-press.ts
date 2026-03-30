import {
  Directive,
  Output,
  EventEmitter,
  HostBinding,
  HostListener
} from "@angular/core";

@Directive({
  selector: "[long-press]"
})
export class LongPress {
  pressing: boolean | any;
  longPressing: boolean | any;
  timeout: any;
  interval: number | any;

  @Output()
  onLongPress: EventEmitter<any> = new EventEmitter();

  @Output()
  onLongPressing: EventEmitter<any> = new EventEmitter();

  @HostBinding("class.press")
  get press() {
    return this.pressing;
  }

  @HostBinding("class.longpress")
  get longPress() {
    return this.longPressing;
  }

  @HostListener("touchstart", ["$event"])
  @HostListener("mousedown", ["$event"])
  onMouseDown(event: any) {
    this.pressing = true;
    this.longPressing = false;
    this.timeout = setTimeout(() => {
      this.longPressing = true;
      this.onLongPress.emit(event);
      this.interval = setInterval(() => {
        this.onLongPressing.emit(event);
      }, 50);
    }, 500);
  }

  @HostListener("touchend")
  @HostListener("mouseup")
  @HostListener("mouseleave")
  endPress() {
    clearTimeout(this.timeout);
    clearInterval(this.interval);
    this.longPressing = false;
    this.pressing = false;
  }
}
