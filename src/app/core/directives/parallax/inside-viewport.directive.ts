import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[insideViewport]'
})
export class InsideViewportDirective {
  @Output() insideViewport = new EventEmitter();
  constructor(
    private elementRef: ElementRef
  ) { }

  @HostListener('window:scroll', ['$event'])
  public onScrollBy(): any {
    const windowHeight = window.innerHeight;
    const boundedRect = this.elementRef.nativeElement.getBoundingClientRect();
console.log("scrolling event")
    if (boundedRect.top >= 0 && boundedRect.bottom <= windowHeight) {
      this.insideViewport.emit(true);
    } else {
      this.insideViewport.emit(false);
    }
  }
}