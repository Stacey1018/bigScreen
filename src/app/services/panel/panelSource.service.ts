import { Result } from './../../domain/result';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppSettingService } from '../appsetting.service';
import { ApiSettingService } from '../apisetting.service';
import { Panel } from '../../domain/panel';

@Injectable({
  providedIn: 'root'
})
export class PanelSourceService {
  private serverUrl: string;
  constructor(private http: HttpClient, private appSer: AppSettingService, private apiSer: ApiSettingService) {
    this.serverUrl = this.appSer.appsetting.viewServerUrl;
  }

  /**
   * 获取仪表盘列表
   * @param parentId
   * @param panelfileName
   */
  public getPanelfiles(parentId: string, panelfileName: string): Observable<Result> {
    const url = this.serverUrl + this.apiSer.apiUrl.getPanelsUrl;
    const params = new HttpParams().set('id', parentId).set('name', panelfileName);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 保存仪表盘
   * @param name 仪表盘名称
   * @param storagePath 存储路径
   */
  public savePanel(panelSave: Panel.PanelItem): Observable<Result> {
    const url = this.serverUrl + this.apiSer.apiUrl.createPanelUrl;
    return this.http.post<Result>(url, panelSave);
  }

  /**
   * 删除仪表盘
   * @param panelId 看板标识
   */
  public deletePanel(panelId: string) {
    const url = this.serverUrl + this.apiSer.apiUrl.deletePanelUrl;
    const params = new HttpParams().set('id', panelId);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 文件夹、仪表盘的重命名
   * @param name 名字
   * @param id 主键标识
   */
  public updatePanel(name: string, id: string): Observable<Result> {
    const url = this.serverUrl + this.apiSer.apiUrl.createPanelUrl;
    const data = { 'dashBoardName': name, 'dashBoardId': id };
    return this.http.post<Result>(url, data);
  }

  /**
   * 将仪表盘移入到某文件夹下
   * @param id 仪表盘主键标识
   * @param parentId 所在文件夹主键标识
   */
  public movePanel(id: string, parentId: string): Observable<Result> {
    const url = this.serverUrl + this.apiSer.apiUrl.movePanelUrl;
    const params = new HttpParams().set('id', parentId).set('boardId', id);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取仪表盘文件夹列表
   * @param id 文件夹主键标识
   */
  public getPanelFloders(): Observable<Result> {
    const url = this.serverUrl + this.apiSer.apiUrl.getPanelFlodersUrl;
    return this.http.get<Result>(url);
  }

  /**
   * 保存看板数据
   * @param panelItems 看板内部资源信息
   */
  public saveAddItemToPanel(panelItems: Panel.PanelSave): Observable<Result> {
    const url = this.serverUrl + this.apiSer.apiUrl.savePanelItemUrl;
    return this.http.post<Result>(url, panelItems);
  }

  /**
   * 获取仪表盘详细信息
   * @param panelId 看板主键标识
   */
  public getPanelDetail(panelId: string): Observable<Result> {
    const url = this.serverUrl + this.apiSer.apiUrl.getPanelDetailUrl;
    const params = new HttpParams().set('id', panelId);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 资源从看板中移除
   * @param itemId 窗口主键标识
   */
  public removeDataSource(itemId: string): Observable<Result> {
    const url = this.serverUrl + this.apiSer.apiUrl.removeDataSourceUrl;
    const params = new HttpParams().set('id', itemId);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取最新的看板数据
   */
  public getLatestPanel(): Observable<Result> {
    const url = this.serverUrl + this.apiSer.apiUrl.getLatestDataUrl;
    return this.http.get<Result>(url);
  }

}
