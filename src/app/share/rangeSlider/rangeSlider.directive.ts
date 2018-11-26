import { Directive, Input, Output, EventEmitter, ElementRef, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
declare var $: any;

/**
 * 滚动条
 */
@Directive({
  selector: '[app-rangeSlider]'
})
export class RangeSliderDirective implements AfterViewInit {

  @Input() min;
  @Input() max;
  @Input() step;
  @Input() val;

  @Output() onViewInit = new EventEmitter();

  constructor(private elementRef: ElementRef) { }

  /**
   * 视图初始化
   */
  ngAfterViewInit() {
    this.rangeSlider();
  }

  rangeSlider() {
    $(this.elementRef.nativeElement).RangeSlider({
      min: this.min, max: this.max, step: this.step, value: this.val, callback: () => {
        this.onViewInit.emit();
      }
    });
  }
}
