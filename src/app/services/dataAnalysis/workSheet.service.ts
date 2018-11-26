import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Result } from '../../domain/result';
import { ApiSettingService } from '../apisetting.service';
import { AppSettingService } from '../appsetting.service';
import { Chart } from '../../domain/workSheet/chart';
import { DataTable } from '../../domain/dataDeploy/dataTable';
import { DataOption } from '../../domain/dataDeploy/dataOption';

@Injectable()
export class WorkSheetService {
  constructor(private http: HttpClient, private appSer: AppSettingService, private apiSer: ApiSettingService) {
  }

  /**
   * 获取工作表列表(含搜索)
   */
  public getTableList(dbTableName: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getTableListUrl;
    const params = new HttpParams()
      .set('name', dbTableName);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取工作表详细信息
   * @param wookSheetId 工作表主键
   */
  public getTableInfo(workSheetId: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getTableInfoByIdUrl;
    const params = new HttpParams()
      .set('id', workSheetId);
    return this.http.get<Result>(url, { params });
  }

  /**
    * 删除数据表
    * @param dtId 数据表主键
    */
  public deleteDT(dtId: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.deleteDTUrl;
    const params = new HttpParams()
      .set('id', dtId);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取数据表的所有字段
   * @param dbTableId 数据表主键
   */
  public getFields(dbTableId: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getFieldsByIdUrl;
    const params = new HttpParams()
      .set('id', dbTableId);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取主表关联表所有字段
   * @param masterDtId 主表主键
   * @param relatedDtId 关联表主键
   */
  public getFiles(param: Array<string>): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getFilesUrl;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8'
      })
    };
    return this.http.post<Result>(url, param, httpOptions);
  }

  /**
   * 字段维度、度量转换
   * @param fieldId 字段主键
   * @param isDimensions 维度度量标识
   */
  public convertFieldType(fieldId: string, isDimensions: number): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.fieldConvertUrl + '?id=' + fieldId +
      '&isDimensions=' + isDimensions;
    return this.http.get<Result>(url);
  }

  /**
   * 字段重命名
   * @param fieldId 字段主键
   * @param remarkName 字段别名
   */
  public fieldReName(fieldId: string, remarkName: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.fieldReNameUrl;
    const params = new HttpParams()
      .set('id', fieldId)
      .set('name', remarkName);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取数据表的数据
   * @param dbTableId 数据表主键
   */
  public getTableData(dbTableId: string, pageNum: number, pageSize: number, isDB: number, dbTableName: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getDataListByIdUrl +
      '?id=' + dbTableId + '&pageNum=' + pageNum + '&pageSize=' + pageSize + '&isDB=' + isDB
      + '&tableName=' + dbTableName;
    return this.http.get<Result>(url);
  }

  /**
   * 获取字段的数据
   * @param tableId 工作表主键(读取mongodb的数据添加的参数)
   * @param fieldId 字段主键
   * @param fieldValue 字段数据值
   */
  public getDataField(tableId: string, fieldId: string, fieldValue: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getDataFieldByIdUrl;
    const params = new HttpParams()
      .set('tableId', tableId)
      .set('fieldId', fieldId)
      .set('fieldValue', fieldValue);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取过滤后的数据信息
   * @param optionCondition 参数实体
   */
  public getDataFieldByQuery(optionCondition: Chart.OptionCondition): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getDataByFieldsUrl;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8'
      })
    };
    return this.http.post<Result>(url, optionCondition, httpOptions);
  }

  /**
   * 获取拖拽后生成的数据option
   * @param optionCondition 参数实体
   */
  public getChartOption(optionCondition: Chart.OptionCondition): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getChartOptionUrl;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8'
      })
    };
    return this.http.post<Result>(url, optionCondition, httpOptions);
  }

  /**
   * 获取图表类型列表
   */
  public getChartTypes(): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getChartTypeUrl;
    return this.http.get<Result>(url);
  }

  /**
   * 根据sql语句获取数据
   * @param sqlStr SQL语句
   * @param dbId 数据库链接主键
   */
  public getDataBySql(sqlStr: string, dbId: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getDataBySqlUrl;
    const params = new HttpParams()
      .set('dbId', dbId)
      .set('sqlStr', sqlStr);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取数据的Option

   * @param param 参数实体
   */
  public getChartDataBySql(param: DataOption.SqlData): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getChartDataBySqlUrl;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8'
      })
    };
    return this.http.post<Result>(url, param, httpOptions);
  }

  /**
   * 修改字段的显示或者隐藏
   * @param fieldId 字段主键
   * @param isDisplay 是否显示
   */
  public updateIsDisplay(fieldId: string, isDisplay: boolean): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.updateIsDisplayUrl +
      '?id=' + fieldId + '&isDisplay=' + isDisplay;
    return this.http.get<Result>(url);
  }

  /**
   * 保存sql图表
   * @param param 图表实体
   */
  public saveChartInfo(param: DataOption.SqlData): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.saveChartInfoUrl;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8'
      })
    };
    return this.http.post<Result>(url, param, httpOptions);
  }

  /**
   * 保存拖拽图表
   * @param param 图表实体
   */
  public saveDragChartInfo(param: Chart.OptionCondition): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.saveDragChartInfoUrl;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8'
      })
    };
    return this.http.post<Result>(url, param, httpOptions);
  }
  /**
   * 编辑查看图表信息
   * @param chartId 图表主键
   */
  public getChartInfo(chartId: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getChartInfoUrl;
    const params = new HttpParams()
      .set('chartId', chartId);
    return this.http.get<Result>(url, { params });
  }

  /**
   * 获取关联表数据
   * @param param 实体参数
   */
  public getMultiTableData(param: DataTable.MultiTableSave): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getMultiTableDataUrl;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8'
      })
    };
    return this.http.post<Result>(url, param, httpOptions);
  }

  /**
 * 保存多表关联
 * @param param 实体参数
 */
  public saveMultiTable(param: DataTable.MultiTableSave): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.saveMultiTableUrl;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8'
      })
    };
    return this.http.post<Result>(url, param, httpOptions);
  }

  /**
   * 查看多表关联
   * @param dtId 表主键
   * @param pageIndex 当前显示页码
   * @param pageSize 每页显示条数
   */
  public getMultiTableInfo(dtId: string, pageIndex: number, pageSize: number): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getMultiTableInfoUrl + '?tableId=' +
      dtId + '&pageNum=' + pageIndex + '&pageSize=' + pageSize;
    return this.http.get<Result>(url);
  }

  /**
   * 查看单表的多表关联数据
   * @param dtId 表主键
   * @param pageIndex 当前显示页码
   * @param pageSize 每页显示条数
   */
  public getTableDataInfo(dtId: string, pageIndex: number, pageSize: number): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getTableInfoUrl + '?tableId=' +
      dtId + '&pageNum=' + pageIndex + '&pageSize=' + pageSize;
    return this.http.get<Result>(url);
  }

  /**
   * 获取数据视图文件夹列表
   */
  public getChartDataFiles(): Observable<Result> {
    const url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.getChartDataFilesUrl;
    return this.http.get<Result>(url);
  }

  /**
   * 获取单个excel表格数据
   * @param tableId excel工作表主键标识
   */
  public getSheetTableData(tableId: string): Observable<Result> {
    const url = this.appSer.appsetting.dataServerUrl + this.apiSer.apiUrl.getSheetTableDataUrl;
    const params = new HttpParams()
      .set('tableId', tableId);
    return this.http.get<Result>(url, { params });
  }
}
