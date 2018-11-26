import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Result } from '../../domain/result';
import { ApiSettingService } from '../apisetting.service';
import { AppSettingService } from '../appsetting.service';

@Injectable()
export class DynamicFormService {
  constructor(private http: HttpClient, private appSer: AppSettingService, private apiSer: ApiSettingService) {
  }

  /**
   * 根据DBId获取当前库表的列表（mongoDB模板的列表）
   * @param id 主表主键
   */
  public getMongoDbDataById(id: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getMongoDbDataByIdUrl;
    const params = new HttpParams()
      .set('id', id);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取数据(教育相关数据接口)
   * @param condition 获取数据条件
   * @param templateName 表名称
   */
  public getTemplateData(templateName: string, condition: string = ''): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getTemplateDataUrl;
    const params = new HttpParams()
      .set('templateName', templateName)
      .set('condition', condition);
    return this.http.get<Result>(url, { params });
  }
}
