import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Result } from '../../domain/result';
import { Scene } from '../../domain/scene/scene';
import { ApiSettingService } from '../apisetting.service';
import { AppSettingService } from '../appsetting.service';

@Injectable()
export class ChartInteractService {
  constructor(private http: HttpClient, private appSer: AppSettingService, private apiSer: ApiSettingService) {
  }

  /**
   * 图表交互(切换场景、图例等事件)
   * @param chartParam 图表交互实体参数
   */
  public chartInteract(chartParam: Scene.ChartInteract): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.setChartInteractUrl;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8'
      })
    };
    return this.http.post<Result>(url, chartParam, httpOptions);
  }

  /**
   * 应用场景
   * @param sceneId 场景主键
   */
  public applyScene(sceneId: string): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.sceneApplyUrl;
    const params = new HttpParams()
      .set('sceneId', sceneId);
    return this.http.get<Result>(url, { params });
  }

  /**
   * iframe页面加载场景信息
   * @param sceneId 场景主键
   */
  public getSceneIframe(sceneId: string): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.getSceneIframeUrl;
    const params = new HttpParams()
      .set('sceneId', sceneId);
    return this.http.get<Result>(url, { params });
  }
}
