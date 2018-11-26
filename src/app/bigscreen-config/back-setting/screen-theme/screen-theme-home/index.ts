import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-screen-theme-home',
  templateUrl: './screen-theme-home.component.html',
  styleUrls: ['./screen-theme-home.component.scss']
})
export class ScreenThemeHomeComponent implements OnInit {

  public themeNavMenu = 0;
  constructor() { }

  ngOnInit() {
  }

  /**
     * tab切换
     * @param num
     */
  public switchThemeNav(num: number) {
    this.themeNavMenu = num;
  }
}
