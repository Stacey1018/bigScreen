import { Component, OnInit } from '@angular/core';
import 'jquery-slimscroll';
import { ApiSettingService } from './services/apisetting.service';
import { AppSettingService } from './services/appsetting.service';
import { ScreenConfigService } from './services/screenDeploy/screenConfig.service';
import { DefConfigService } from './services/defConfig.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public isLoadConfig = false;
  constructor(private appSer: AppSettingService, private apiSer: ApiSettingService,
    private scSer: ScreenConfigService, private defSer: DefConfigService) {
  }

  ngOnInit() {
    this.appSer.loadAppConfig().subscribe(val => {
      this.apiSer.loadApiConfig().subscribe(() => {
        this.init();
      });
    });
  }

  public init() {
    // 调后台获取屏幕分辨率信息
    this.scSer.getResolution().subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.isLoadConfig = true;
          this.defSer.screenWidth = val.data.resolutionX;
          this.defSer.screenHeight = val.data.resolutionY;
        }
      }
    });
  }
}
