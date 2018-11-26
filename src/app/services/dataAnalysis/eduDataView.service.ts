import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Result } from '../../domain/result';
import { ApiSettingService } from '../apisetting.service';
import { AppSettingService } from '../appsetting.service';

@Injectable()
export class EduDataViewService {
  constructor(private http: HttpClient, private appSer: AppSettingService, private apiSer: ApiSettingService) {
  }

  /**
   * 获取列表(教育相关数据接口)
   * @param id 主表主键
   */
  public getEduDataList(id: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getEduDataListUrl;
    const params = new HttpParams()
      .set('id', id);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取数据(教育相关数据接口)
   * @param strSql sql语句
   */
  public getEduDataBySql(strSql: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getEduDataBySqlUrl;
    const params = new HttpParams()
      .set('strSql', strSql);
    return this.http.get<Result>(url, { params });
  }
}
