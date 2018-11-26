import { Chart } from './../../domain/workSheet/chart';
import { Result } from './../../domain/result';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppSettingService } from '../appsetting.service';
import { ApiSettingService } from '../apisetting.service';

@Injectable({
  providedIn: 'root'
})
export class ChartSourceService {

  private serverUrl: string;
  private dataserverUrl: string;
  constructor(private http: HttpClient, private appSer: AppSettingService, private apiSer: ApiSettingService) {
    this.serverUrl = this.appSer.appsetting.viewServerUrl;
    this.dataserverUrl = this.appSer.appsetting.dataServerUrl;
  }

  /**
   * 获取图表列表
   */
  public getChartList(name: string, id: string): Observable<Result> {
    const url = this.serverUrl + this.apiSer.apiUrl.getChartListUrl;
    const params = new HttpParams()
      .set('name', name)
      .set('id', id);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 图表重命名
   * @param name 文件夹或图表的名字
   * @param id 主键标识
   */
  public updataChartName(name: string, id: string): Observable<Result> {
    const url = this.serverUrl + this.apiSer.apiUrl.reNameChartUrl;
    const params = new HttpParams().set('id', id).set('name', name);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 删除图表
   * @param id 要删除的图表id
   */
  public deleteChart(id: string): Observable<Result> {
    const url = this.serverUrl + this.apiSer.apiUrl.deleteChartUrl;
    const params = new HttpParams().set('id', id);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 移动图表到文件夹
   * @param id 图表id
   * @param floderId 文件夹id
   */
  public moveChart(id: string, floderId: string): Observable<Result> {
    const url = this.serverUrl + this.apiSer.apiUrl.moveChartUrl;
    const params = new HttpParams().set('id', id).set('parentId', floderId);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取展示的Option
   * @param option 获取option所需的参数
   */
  public getOption(option: Chart.ChartOption): Observable<Result> {
    const url = this.dataserverUrl + this.apiSer.apiUrl.getChartDataUrl;
    return this.http.post<Result>(url, option);
  }

  /**
   * 保存图表文件夹
   * @param chart 图表文件夹参数
   */
  public addChartFile(chart: Chart.NewChartFloder): Observable<Result> {
    const url = this.serverUrl + this.apiSer.apiUrl.addChartFloderUrl;
    return this.http.post<Result>(url, chart);
  }

  /**
   * 获取数据类型接口
   */
  public getDataTypes(): Observable<Result> {
    const url = this.serverUrl + this.apiSer.apiUrl.getDataTypeListUrl;
    return this.http.get<Result>(url);
  }

}
