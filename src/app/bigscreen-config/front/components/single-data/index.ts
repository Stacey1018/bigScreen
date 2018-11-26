import { Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit, OnDestroy } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';
declare var $: any;
@Component({
  selector: 'app-single-data',
  templateUrl: './single-data.component.html',
  styleUrls: ['./single-data.component.scss']
})
export class SingleDataComponent implements OnInit, OnChanges, AfterViewInit,OnDestroy {
  @Input() singleTextData: Scene.ResourceView = new Scene.ResourceView();
  @Input() id;

  public MyMar;
  public speed = 40; // 数值越大，速度越慢
  private timer;
  constructor() { }

  ngOnInit() {
    // this.marquee();
  }
  ngAfterViewInit() {
    this.marquee();
  }

  ngOnChanges(changes: SimpleChanges): void {
  }
  public marquee() {
    let wrap = document.getElementById('wrap' + this.id);
    console.log(wrap);
    const first = document.getElementById('first' + this.id);
    const that = this;
    this.timer = window.setInterval(move, this.singleTextData.configInfo.timeInterval);
    function move() {
      wrap.scrollLeft = wrap.scrollLeft + that.singleTextData.configInfo.speed;
      if (wrap.scrollLeft >= first.scrollWidth) {
        wrap.scrollLeft = 0;
      }
    }
  }
  // 销毁
  ngOnDestroy() {
    window.clearInterval(this.timer);
  }


}
