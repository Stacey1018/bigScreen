import { Directive, Input, ElementRef, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
declare var $: any;

/**
 * 拖拽
 */
@Directive({
  selector: '[app-run-number]'
})
export class RunNumberDirective implements AfterViewInit, OnDestroy, OnChanges {
  @Input() options = {
    drawVal: '666666', // 传入值
    drawTimeInterval: 5, // 更新的时间间距
    fontSize: 18,
    fontColor: '#fff',
    drawBgColor: '#000',
    drawBorderRadius: 5
  };
  public timer;
  constructor(private elementRef: ElementRef) {

  }

  /**
   * 视图初始化
   */
  ngAfterViewInit() {
    this.initHtml();
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.options.firstChange) {
      this.initHtml();
    }
  }

  public initHtml() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.scroNum();
    this.timer = setInterval(() => {
      $($(this.elementRef.nativeElement)).find('.dataNums').find('.tt').attr('style', '');
      setTimeout(() => {
        this.scroNum();
      }, 10);
    }, this.options.drawTimeInterval * 1000);
  }

  public scroNum() {
    const number = this.options.drawVal;
    const $num_item = $($(this.elementRef.nativeElement)).find('.dataNums').find('.tt');
    const h = this.options.fontSize * 2;

    $num_item.css('transition', 'all 2s ease-in-out');
    let numberStr = number.toString();
    if (numberStr.length <= $num_item.length - 1) {
      let tempStr = '';
      for (let a = 0; a < $num_item.length - numberStr.length; a++) {
        tempStr += '0';
      }
      numberStr = tempStr + numberStr;
    }

    const numberArr = numberStr.split('');
    $num_item.each(function (i, item) {
      setTimeout(function () {
        $num_item.eq(i).css('top', -parseInt(numberArr[i], 0) * h - h * 10 + 'px');
      }, i * 100);
    });
  }
}
