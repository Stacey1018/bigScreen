import { Component, OnInit, Input } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';
import * as $ from 'jquery';
import { AfterViewInit } from '@angular/core';
declare var Swiper: any;
@Component({
  selector: 'app-multiple-data',
  templateUrl: './multiple-data.component.html',
  styleUrls: ['./multiple-data.component.scss']
})
export class MultipleDataComponent implements OnInit, AfterViewInit {
  @Input() multipleTextData: Scene.ResourceView = new Scene.ResourceView();

  constructor() { }

  ngOnInit() {
  }
  ngAfterViewInit() {
    this.initSwiper();
    
  }


  public initSwiper() {
    const swiper = new Swiper('.swiper-container', {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 3000,
      loop: true,
      autoplay: true,
    });
  }

}
