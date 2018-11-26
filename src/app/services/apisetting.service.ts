import { Injectable } from '@angular/core';
import { ApiSetting } from '../domain/apiSetting';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiSettingService {
  public apiUrl: ApiSetting = new ApiSetting(); // 接口地址

  constructor(public httpClient: HttpClient) {
  }

  public loadApiConfig(): Observable<boolean> {
    const rx = new Observable<boolean>((serve) => {
      this.httpClient.get<ApiSetting>('assets/config/apisetting.json').subscribe(res => {

        // 场景相关接口
        this.apiUrl.saveSceneUrl = res.saveSceneUrl;
        this.apiUrl.getSceneListUrl = res.getSceneListUrl;
        this.apiUrl.getSceneInfoUrl = res.getSceneInfoUrl;
        this.apiUrl.deleteSceneUrl = res.deleteSceneUrl;
        this.apiUrl.updateSceneColorUrl = res.updateSceneColorUrl;
        this.apiUrl.deleteItemDataUrl = res.deleteItemDataUrl;
        this.apiUrl.setScenePollingUrl = res.setScenePollingUrl;
        this.apiUrl.moveSceneToGroupUrl = res.moveSceneToGroupUrl;
        this.apiUrl.setSceneGroupUrl = res.setSceneGroupUrl;
        this.apiUrl.renameSceneGroupUrl = res.renameSceneGroupUrl;
        this.apiUrl.getPollingSceneUrl = res.getPollingSceneUrl;
        this.apiUrl.getSceneFoldersUrl = res.getSceneFoldersUrl;
        this.apiUrl.getChartsForSceneUrl = res.getChartsForSceneUrl;
        this.apiUrl.getMaterialForSceneUrl = res.getMaterialForSceneUrl;
        this.apiUrl.getSceneItemDataUrl = res.getSceneItemDataUrl;
        
        // 后台配置相关接口
        this.apiUrl.getColorInfoUrl = res.getColorInfoUrl;
        this.apiUrl.getColorListUrl = res.getColorListUrl;
        this.apiUrl.setRenderInfoUrl = res.setRenderInfoUrl;
        this.apiUrl.getRenderUrl = res.getRenderUrl;
        this.apiUrl.uploadUrl = res.uploadUrl;
        this.apiUrl.deleteFileUrl = res.deleteFileUrl;
        this.apiUrl.getResourceListUrl = res.getResourceListUrl;
        this.apiUrl.getResolutionUrl = res.getResolutionUrl;

        // 大屏交互
        this.apiUrl.setChartInteractUrl = res.setChartInteractUrl;
        this.apiUrl.sceneApplyUrl = res.sceneApplyUrl;
        this.apiUrl.getSceneIframeUrl = res.getSceneIframeUrl;

        // 数据管理
        this.apiUrl.connectHostUrl = res.connectHostUrl;
        this.apiUrl.getDBListByIdUrl = res.getDBListByIdUrl;
        this.apiUrl.getDBListUrl = res.getDBListUrl;
        this.apiUrl.getListByTypeUrl = res.getListByTypeUrl;
        this.apiUrl.getHostsByIdUrl = res.getHostsByIdUrl;
        this.apiUrl.deleteDBLinkUrl = res.deleteDBLinkUrl;
        this.apiUrl.getHostListUrl = res.getHostListUrl;
        this.apiUrl.hostReNameUrl = res.hostReNameUrl;
        this.apiUrl.instanceReNameUrl = res.instanceReNameUrl;
        this.apiUrl.reNameUrl = res.reNameUrl;
        this.apiUrl.reNameAllUrl = res.reNameAllUrl;
        this.apiUrl.deleteDBUrl = res.deleteDBUrl;
        this.apiUrl.deleteDTUrl = res.deleteDTUrl;
        this.apiUrl.getTableListByIdUrl = res.getTableListByIdUrl;
        this.apiUrl.setIsDisplayUrl = res.setIsDisplayUrl;
        this.apiUrl.getTableListUrl = res.getTableListUrl;
        this.apiUrl.getTableInfoByIdUrl = res.getTableInfoByIdUrl;
        this.apiUrl.updateIsDisplayUrl = res.updateIsDisplayUrl;
        this.apiUrl.getFieldsByIdUrl = res.getFieldsByIdUrl;
        this.apiUrl.getFilesUrl = res.getFilesUrl;
        this.apiUrl.getDataListByIdUrl = res.getDataListByIdUrl;
        this.apiUrl.getMultiTableDataUrl = res.getMultiTableDataUrl;
        this.apiUrl.saveMultiTableUrl = res.saveMultiTableUrl;
        this.apiUrl.getMultiTableInfoUrl = res.getMultiTableInfoUrl;
        this.apiUrl.getTableInfoUrl = res.getTableInfoUrl;
        this.apiUrl.fieldConvertUrl = res.fieldConvertUrl;
        this.apiUrl.fieldReNameUrl = res.fieldReNameUrl;
        this.apiUrl.getDataFieldByIdUrl = res.getDataFieldByIdUrl;
        this.apiUrl.getDataByFieldsUrl = res.getDataByFieldsUrl;

        // sql建表
        this.apiUrl.getDataBySqlUrl = res.getDataBySqlUrl;
        this.apiUrl.getChartOptionUrl = res.getChartOptionUrl;
        this.apiUrl.getChartTypeUrl = res.getChartTypeUrl;
        this.apiUrl.getChartDataBySqlUrl = res.getChartDataBySqlUrl;
        this.apiUrl.saveChartInfoUrl = res.saveChartInfoUrl;
        this.apiUrl.saveDragChartInfoUrl = res.saveDragChartInfoUrl;
        this.apiUrl.getChartInfoUrl = res.getChartInfoUrl;

        // 看板
        this.apiUrl.getChartDataFilesUrl = res.getChartDataFilesUrl;
        this.apiUrl.createPanelUrl = res.createPanelUrl;
        this.apiUrl.getPanelsUrl = res.getPanelsUrl;
        this.apiUrl.deletePanelUrl = res.deletePanelUrl;
        this.apiUrl.getPanelFlodersUrl = res.getPanelFlodersUrl;
        this.apiUrl.movePanelUrl = res.movePanelUrl;
        this.apiUrl.savePanelItemUrl = res.savePanelItemUrl;
        this.apiUrl.getPanelDetailUrl = res.getPanelDetailUrl;
        this.apiUrl.removeDataSourceUrl = res.removeDataSourceUrl;
        this.apiUrl.getDataTypeListUrl = res.getDataTypeListUrl;

        // 图表
        this.apiUrl.getChartListUrl = res.getChartListUrl;
        this.apiUrl.reNameChartUrl = res.reNameChartUrl;
        this.apiUrl.deleteChartUrl = res.deleteChartUrl;
        this.apiUrl.moveChartUrl = res.moveChartUrl;
        this.apiUrl.getChartDataUrl = res.getChartDataUrl;
        this.apiUrl.addChartFloderUrl = res.addChartFloderUrl;
        this.apiUrl.getLatestDataUrl = res.getLatestDataUrl;

        // excel
        this.apiUrl.importExcelUrl = res.importExcelUrl;
        this.apiUrl.getSheetDataUrl = res.getSheetDataUrl;
        this.apiUrl.getSheetTableDataUrl = res.getSheetTableDataUrl;

        // 教育数据相关接口
        this.apiUrl.getEduDataListUrl = res.getEduDataListUrl;
        this.apiUrl.getEduDataBySqlUrl = res.getEduDataBySqlUrl;

        // 读取动态表单生成的数据展示相关接口
        this.apiUrl.getMongoDbDataByIdUrl = res.getMongoDbDataByIdUrl;
        this.apiUrl.getTemplateDataUrl = res.getTemplateDataUrl;
        serve.next(true);
      });
    });
    return rx;
  }
}
