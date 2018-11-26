import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Result } from '../../domain/result';
import { ApiSettingService } from '../apisetting.service';
import { AppSettingService } from '../appsetting.service';

@Injectable()
export class ThemeConfigService {
  constructor(private http: HttpClient, private appSer: AppSettingService, private apiSer: ApiSettingService) {
  }

  /**
   * 获取上传图片列表
   * @param type:类型
   * @param name:图片名称
   *
   */
  public getResourceListByType(type: number, name: string): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.getResourceListUrl + '?type=' + type + '&name=' + name;
    return this.http.get<Result>(url);
  }

  /**
   * 通过ID删除图片
   * @param id: 图片ID
   */
  public deletePictureById(id: string): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.deleteFileUrl;
    const params = new HttpParams().set('id', id);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取颜色主题列表
   */
  public getColorThemes(): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.getColorListUrl;
    return this.http.get<Result>(url);
  }

  /**
   * 获取单条颜色主题信息
   * @param themeId 颜色主题主键标识
   */
  public getColorThemeInfoById(themeId: string): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.getColorInfoUrl;
    const params = new HttpParams().set('id', themeId);
    return this.http.get<Result>(url, { params });
  }

}
