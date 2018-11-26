import { Injectable } from '@angular/core';
import * as $ from 'jquery';
import { MatDialog } from '@angular/material';
import { Scene } from '../../domain/scene/scene';
import { SceneSourceService } from './sceneSource.service';
import { LogHelper } from '../../common/LogHelper';
import { DataSourceEnum } from '../../common/dataSourceEnum';
import { TooltipService } from '../tooltip.service';
import { CommonMethodService } from './commonMethod.service';

@Injectable()
export class SceneMethodService {

  private defaultSceneFileName = 1; // 用户没有使用默认文件夹使用新建文件夹名称的时候
  public sceneFileArray: Scene.SceneView[] = []; // 根目录下的场景列表
  public sceneFolderArray: Scene.SceneView[] = []; // 场景的文件夹列表
  public searchSceneArray: Scene.SceneView[] = []; // 场景轮巡文件搜索
  public searchSceneFileArray: Scene.SceneView[] = []; // 场景轮巡搜索
  public chartArray: Scene.ResourceView[] = []; // 根目录下的图表
  public chartFolderArray: Scene.ResourceView[] = []; // 文件夹及其目录下的图表
  public dataSource: Scene.ResourceView[] = []; // 用于拖拽时判断
  constructor(public dialog: MatDialog, public tooltipService: TooltipService,
    private sceneSer: SceneSourceService, public cmSer: CommonMethodService) {
  }

  /**
   * 新建场景文件夹处理
   */
  public addSceneFile(): void {
    const defaultName = '新建文件夹' + this.defaultSceneFileName;
    const newArray: Scene.SceneView[] = [];
    newArray.push({
      thumbnail: '', // 缩略图
      parentId: '', // 文件夹主键标识
      sceneId: '',
      sceneType: null,
      sceneName: defaultName,
      sceneList: [],
      showList: false,
      isNewAdd: true,
      isOpen: false
    });
    this.sceneFolderArray = newArray.concat(this.sceneFolderArray);
    setTimeout(() => {
      const obj = $('.scencesfile .newName').eq(0);
      // 设置新建文件的样式
      obj.addClass('editStatus');
      obj.focus();
      obj.keyup(() => {
        this.tooltipService.checkFormat($(event.target).val());
      });
      // 设置失去焦点时的样式
      obj.blur((event) => {
        const filename = '新建文件夹' + this.defaultSceneFileName;
        const name = $(event.target).val();
        // 判断文件夹名称是否使用默认
        if (name === filename) {
          this.defaultSceneFileName++;
        }
        // 调用新建文件夹接口
        if (name !== '') {
          if (this.tooltipService.checkFormat(name)) {
            this.saveSceneFile(name);
          } else {
            $(event.target).focus();
          }
        } else {
          this.tooltipService.showMsg('名称不可以为空');
          $(event.target).focus();
        }
      });
    }, 100);
  }

  /**
   * 调用新建场景文件夹接口
   * @param name 文件夹名称
   */
  public saveSceneFile(name: string): void {
    this.sceneSer.saveSceneFile(name).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('新建文件夹成功');
        } else {
          this.tooltipService.showMsg(val.message);
        }
        this.getScenes('', '');
      },
      error: (err) => {
        LogHelper.error('services scene', 'sceneMethod saveScene()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 获取场景列表
   * @param folderId 文件夹主键标识(值为''时获取一级目录和根目录下的数据，不''时获取二级目录数据)
   * @param sceneName 场景名称
   * @param flag 区分左侧搜索还是轮询搜索
   * @param callBack 回调函数
   */
  public getScenes(sceneName?: string, flag?: string, callBack?: any) {
    this.sceneSer.getScenes(sceneName).subscribe({
      next: (val) => {
        if (val.code === 0) {
          const scenes = val.data as Scene.SceneView[];
          if (flag === 'polling') { // 轮询搜索时判断
            this.searchSceneFileArray = [];
            this.searchSceneArray = [];
          } else {
            this.sceneFileArray = [];
            this.sceneFolderArray = [];
          }
          for (let i = 0; i < scenes.length; i++) {
            if (scenes[i].sceneType === DataSourceEnum.folder) { // 是文件夹目录
              if (flag === 'polling') {
                this.searchSceneFileArray.push(scenes[i]);
              } else {
                this.sceneFolderArray.push(scenes[i]);
              }
            } else { // 是根目录下的数据项
              if (flag === 'polling') {
                this.searchSceneArray.push(scenes[i]);
              } else {
                this.sceneFileArray.push(scenes[i]);
              }
            }
          }
          if (callBack) {
            callBack();
          }
        } else {
          LogHelper.log('services scene', 'sceneMethod getScenes()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('services scene', 'sceneMethod getScenes()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 重命名场景文件
   * @param sceneName 文件名称
   * @param sceneId 文件夹主键标识
   */
  public updateSceneName(sceneName, sceneId): void {
    const obj = $('#' + sceneId).children('.name');
    obj.addClass('editStatus');
    this.sceneSer.updateSceneName(sceneName, sceneId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('重命名成功');
        } else {
          this.tooltipService.showMsg(val.message);
        }
        this.getScenes('', ''); // 加载数据列表
      },
      error: (err) => {
        LogHelper.error('services scene', 'sceneMethod updateSceneName()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 调用删除场景文件夹后台接口
   * @param id 文件夹主键标识
   */
  public deleteSceneFile(id: string) {
    this.sceneSer.deleteScene(id).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('删除成功');
          this.getScenes('', ''); // 调用默认的数据列表
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('services scene', 'sceneMethod deleteSceneFilePort()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 获取图表列表
   * @param id 文件夹id
   * @param searchName 文件夹名称，用于条件搜索
   */
  public getChartList(searchName: string, id: string): void {
    this.sceneSer.getChartsForScene(searchName, id).subscribe({
      next: (val) => {
        if (val.code === 0) {
          // 一级目录
          if (id === '') {
            this.chartArray = [];
            this.chartFolderArray = [];
            this.dataSource = [];
            const resourceArr = val.data as Scene.ResourceView[];
            for (let i = 0; i < resourceArr.length; i++) {
              if (!resourceArr[i].isData) {  // 文件夹
                this.chartFolderArray.push(resourceArr[i]);
              } else { // 根目录下的数据项
                this.chartArray.push(resourceArr[i]);
                this.dataSource.push(resourceArr[i]);
              }
            }
          } else {
            // 二级目录
            // 判断在哪一个一级目录下
            if (val.data.length > 0) {
              for (let i = 0; i < this.chartFolderArray.length; i++) {
                // 将二级目录数据放到对应的以及目录的list中
                if (this.chartFolderArray[i].resourceId === val.data[0].parentId) {
                  this.chartFolderArray[i].list = val.data;
                  if (this.chartFolderArray[i].list !== null) {
                    this.chartFolderArray[i].list.forEach(ele => {
                      if (ele.isData) {
                        this.dataSource.push(ele);
                      }
                    });
                  }
                }
              }
            }
          }
        }
      },
      error: (err) => {
        LogHelper.error('services panel', 'chartMethod getChartList()error,原因:' + JSON.stringify(err));
      }
    });
  }
}

