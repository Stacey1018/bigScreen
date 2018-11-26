import { Component, OnInit, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';

@Component({
  selector: 'app-scroll-top',
  templateUrl: './scroll-top.component.html',
  styleUrls: ['./scroll-top.component.scss']
})
export class ScrollTopComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() scrollTopData: Scene.ResourceView = new Scene.ResourceView();

  private mytimer;
  constructor() { }

  ngOnInit() {
  }
  ngAfterViewInit() {
    this.scroll();
  }

  public scroll() {
    let area = document.getElementById('scroll');
    let first = document.getElementById('first');
    const second = document.getElementById('second');
    let that = this;

    this.mytimer = setInterval(scrollUp, this.scrollTopData.configInfo.timeInterval);
    function scrollUp() {
      if (area.scrollTop >= first.offsetHeight || first.offsetHeight < area.offsetHeight) {
        area.scrollTop = 0;
        second.innerHTML = '';
      } else {
        second.innerHTML = first.innerHTML;
        area.scrollTop += 1;
      }
    }
    // area.onmouseover = function () {
    //   clearInterval(that.mytimer);
    // };
    // area.onmouseout = function () {
    //   that.mytimer = setInterval(scrollUp, time);
    // };
  }

  // 销毁
  ngOnDestroy() {
    window.clearInterval(this.mytimer);
  }


}
