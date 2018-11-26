import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { ApiSettingService } from '../apisetting.service';
import { AppSettingService } from '../appsetting.service';
import { Result } from '../../domain/result';
import { ScreenConnect } from '../../domain/screenConfig/screenConnect';

@Injectable()
export class ScreenConfigService {
  constructor(private http: HttpClient, private appSer: AppSettingService, private apiSer: ApiSettingService) {
  }

  /**
   * 获取渲染机配置信息
   */
  public getRender(): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.getRenderUrl;
    return this.http.get<Result>(url);
  }

  /**
   * 保存渲染机配置信息
   * @param renderInfo 渲染机实体信息
   */
  public saveRenderInfo(renderInfo: ScreenConnect.SaveRender) {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.setRenderInfoUrl;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json;charset=utf-8'
    });
    return this.http.post<Result>(url, renderInfo, { headers });
  }

  /**
   * 获取屏幕分辨率接口
   */
  public getResolution(): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.getResolutionUrl;
    return this.http.get<Result>(url);
  }

}
