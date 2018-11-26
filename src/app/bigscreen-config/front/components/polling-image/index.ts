import { Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit, OnDestroy } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';
import { AppSettingService } from '../../../../services/appsetting.service';
import * as $ from 'jquery';
declare var Swiper: any;
@Component({
  selector: 'app-polling-image',
  templateUrl: './polling-image.component.html',
  styleUrls: ['./polling-image.component.scss']
})
export class PollingImageComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() pollingImgData: Scene.ResourceView = new Scene.ResourceView();
  // testSwiper: Swiper;

  public swiper;
  constructor(private appSer: AppSettingService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.initView();

  }
  ngOnChanges(changes: SimpleChanges): void {

  }

  public initView() {

    // 轮播图配置
    // tslint:disable-next-line:no-unused-expression
    this.swiper = new Swiper('.swiper-container', {
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev',
      paginationClickable: true,
      centeredSlides: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      loop: true,
      autoplay: true,
      // disableOnInteraction: true, // 触到轮播图时，停止播放。
      observer: true, // 修改swiper自己或子元素时，自动初始化swiper
      observeParents: true, // 修改swiper的父元素时，自动初始化swiper
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      slidesPerView: 'auto',
      loopedSlides: 3,
    });
  }

  // 销毁
  ngOnDestroy() {
 
  }

}
