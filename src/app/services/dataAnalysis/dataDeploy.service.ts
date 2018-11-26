import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Result } from '../../domain/result';
import { ApiSettingService } from '../apisetting.service';
import { AppSettingService } from '../appsetting.service';
import { DataBase } from '../../domain/dataDeploy/dataBase';
import { DBHost } from '../../domain/dataDeploy/dataBaseLink';
import { ExcelTable } from '../../domain/dataDeploy/excelTable';

@Injectable()
export class DataDeployService {
  constructor(private http: HttpClient, private appSer: AppSettingService, private apiSer: ApiSettingService) {
  }

  /**
   * 添加数据库链接
   * @param dataBaseInfo 数据库链接实体
   */
  public connectHost(dataBaseInfo: DBHost.DataBaseLinkForm): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.connectHostUrl;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8'
      })
    };
    return this.http.post<Result>(url, dataBaseInfo, httpOptions);
  }

  /**
   * 获取链接数据库列表
   * @param dbHostId 链接库主键
   */
  public getDBListById(dbHostId: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getDBListByIdUrl;
    const params = new HttpParams()
      .set('id', dbHostId);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取所有连接实例的数据库列表
   */
  public getDBList(): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getDBListUrl;
    return this.http.get<Result>(url);
  }

  /**
   * 获取数据源列表（excel列表或数据库列表）
   * @param type 标识excel和数据库
   */
  public getListByType(type: number): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getListByTypeUrl + '?type=' + type;
    return this.http.get<Result>(url);
  }

  /**
   * 获取已连接过的数据库host信息
   */
  public getHostList(): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getHostListUrl;
    return this.http.get<Result>(url);
  }

  /**
   * 数据库配置保存
   * @param dbDeployForm  数据库配置实体
   */
  public dbDeploy(dbDeployForm: DataBase.DBDeployForm): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.setIsDisplayUrl;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8'
      })
    };
    return this.http.post<Result>(url, dbDeployForm, httpOptions);
  }

  /**
   * 获取连接的详细信息
   * @param dbHostId 数据库连接主键
   */
  public getHostsById(dbHostId: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getHostsByIdUrl;
    const params = new HttpParams()
      .set('id', dbHostId);
    return this.http.get<Result>(url, { params });
  }

  /**
   * Host重命名
   * @param dbHostInfo 实体
   */
  public hostReName(dbHostInfo: DBHost.DBHostView): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.hostReNameUrl;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8'
      })
    };
    return this.http.post<Result>(url, dbHostInfo, httpOptions);
  }

  /**
   * 实例重命名
   * @param dbInfo 实体
   */
  public instanceReName(dbId: string, remarkName: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.instanceReNameUrl;
    const params = new HttpParams()
      .set('id', dbId)
      .set('remarkName', remarkName);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 原始表和工作表重命名
   * @param dbTableId 数据表主键
   * @param remarkName 数据表别名
   */
  public dbTableReName(dbTableId: string, remarkName: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.reNameAllUrl;
    const params = new HttpParams()
      .set('id', dbTableId)
      .set('remarkName', remarkName);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 工作表重命名
   * @param dbTableId 数据表主键
   * @param remarkName 数据表别名
   */
  public workTableReName(dbTableId: string, remarkName: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.reNameUrl;
    const params = new HttpParams()
      .set('id', dbTableId)
      .set('remarkName', remarkName);
    return this.http.get<Result>(url, { params });
  }


  /**
   * 根据数据库实例主键标识获取所有表
   * @param instanceId 数据库实例主键
   */
  public getTableListById(instanceId: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getTableListByIdUrl;
    const params = new HttpParams()
      .set('id', instanceId);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 删除数据库连接
   * @param dbHostId 数据库连接主键
   */
  public deleteDBLink(dbHostId: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.deleteDBLinkUrl;
    const params = new HttpParams()
      .set('id', dbHostId);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 删除数据库
   * @param dbId 数据库主键
   */
  public deleteDB(dbId: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.deleteDBUrl;
    const params = new HttpParams()
      .set('dbId', dbId);
    return this.http.get<Result>(url, { params });
  }

  /**
   * excel上传
   */
  public importExcel(file: File): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.importExcelUrl;
    const formData: FormData = new FormData();
    formData.append('data', file);
    return this.http.post<Result>(url, formData);
  }

  /**
   * 获取表格数据
   */
  public getSheetData(excelTableView: ExcelTable.ExcelTableView): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getSheetDataUrl;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8'
      })
    };
    return this.http.post<Result>(url, excelTableView, httpOptions);
  }
}
