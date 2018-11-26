import { Injectable } from '@angular/core';
import { ServerSetting } from '../domain/appsetting';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AppSettingService {
  // 后台服务地址
  public appsetting: ServerSetting = new ServerSetting();
  constructor(private httpClient: HttpClient) {
  }

  public loadAppConfig(): Observable<boolean> {
    const rx = new Observable<boolean>((serve) => {
      this.httpClient.get<ServerSetting>('assets/config/appsetting.json').subscribe(res => {
        // 后台服务地址
        this.appsetting.viewServerUrl = res.viewServerUrl;
        this.appsetting.dataServerUrl = res.dataServerUrl;
        this.appsetting.bigScreenUrl = res.bigScreenUrl;
        this.appsetting.timer = res.timer;
        serve.next(true);
      });
    });
    return rx;
  }
}
