import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Result } from '../../domain/result';
import { Scene } from '../../domain/scene/scene';
import { ScenePolling } from '../../domain/scene/scenePolling';
import { ApiSettingService } from '../apisetting.service';
import { AppSettingService } from '../appsetting.service';

@Injectable()
export class SceneSourceService {
  constructor(private http: HttpClient, private appSer: AppSettingService, private apiSer: ApiSettingService) {
  }

  /**
   * 保存场景
   * @param scene 场景实体信息
   */
  public saveScene(scene: Scene.SceneForm): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.saveSceneUrl;
    return this.http.post<Result>(url, scene);
  }

  /**
   * 新增场景文件夹
   * @param name 文件名称
   */
  public saveSceneFile(sceneName: string): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.setSceneGroupUrl;
    const params = new HttpParams()
      .set('sceneName', sceneName);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取场景列表数据
   * @param fileId 场景文件夹Id
   * @param sceneName 场景名称
   */
  public getScenes(sceneName: string): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.getSceneListUrl;
    const params = new HttpParams()
      .set('sceneName', sceneName);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取场景文件夹
   * @param sceneName 文件夹名称
   */
  public getSceneFolders(sceneName: string): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.getSceneFoldersUrl;
    const params = new HttpParams()
      .set('sceneName', sceneName);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取单个场景信息
   * @param sceneId 场景主键标识
   */
  public getSceneInfo(sceneId: string): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.getSceneInfoUrl;
    const params = new HttpParams()
      .set('sceneId', sceneId);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 设置场景轮巡
   * @param scenePolling 场景轮巡实体信息
   */
  public setScenePolling(scenePolling: ScenePolling.ScenePollingSave[]): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.setScenePollingUrl;
    return this.http.post<Result>(url, scenePolling);

  }

  /**
   * 重命名场景
   * @param sceneName 文件名称
   * @param sceneId 场景主键标识
   */
  public updateSceneName(sceneName: string, sceneId: string): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.renameSceneGroupUrl;
    const params = new HttpParams()
      .set('sceneId', sceneId)
      .set('sceneName', sceneName);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 删除场景
   * @param sceneId 场景主键标识
   */
  public deleteScene(sceneId: string): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.deleteSceneUrl;
    const params = new HttpParams()
      .set('sceneId', sceneId);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 场景移动
   * @param scene 要移动的场景信息
   */
  public moveScene(scene: Scene.SceneRemove): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.moveSceneToGroupUrl;
    return this.http.post<Result>(url, scene);
  }

  /**
   * 获取轮巡场景
   */
  public getPollingScene(): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.getPollingSceneUrl;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8'
      })
    };
    return this.http.get<Result>(url, httpOptions);
  }

  /**
   * 获取图表列表
   * @param name 名称
   * @param id 文件夹主键
   */
  public getChartsForScene(name: string, id: string): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.getChartsForSceneUrl;
    const params = new HttpParams()
      .set('name', name)
      .set('id', id);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取边框背景
   * @param type:类型
   * @param name:图片名称
   *
   */
  public getMaterialForScene(): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.getMaterialForSceneUrl;
    return this.http.get<Result>(url);
  }

  /**
   * 获取场景中单项数据详细信息
   * @param sceneId 场景主键
   * @param resourceId 数据项主键
   */
  public getSceneItemData(sceneId: string, resourceId: string): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.getSceneItemDataUrl;
    const params = new HttpParams()
      .set('sceneId', sceneId)
      .set('resourceId', resourceId);
    return this.http.get<Result>(url, { params });
  }

}
