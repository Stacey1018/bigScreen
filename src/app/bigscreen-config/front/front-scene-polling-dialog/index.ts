import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import * as polling from './../../../domain/scene/scenePolling';
import pollingContract = polling.ScenePolling;
import { SceneMethodService } from './../../../services/scene/sceneMethod.service';
import { SceneSourceService } from './../../../services/scene/sceneSource.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CommonMethodService } from './../../../services/scene/commonMethod.service';
import { Scene } from '../../../domain/scene/scene';
import { ScenePolling } from './../../../domain/scene/scenePolling';
import { Utils } from '../../../utils/utils';
import { LogHelper } from '../../../common/LogHelper';
import { TooltipService } from '../../../services/tooltip.service';
@Component({
  selector: 'app-front-scene-polling-dialog',
  templateUrl: './front-scene-polling-dialog.component.html',
  styleUrls: ['./front-scene-polling-dialog.component.scss']
})
export class FrontScenePollingDialogComponent implements OnInit, AfterViewInit {
  public pollingData: pollingContract.ScenePollingForm = {
    isPolling: false,
    switchType: pollingContract.switchType.rightLeft,
    time: 0,
    items: []
  };
  public defaultSceneArr: Scene.SceneView[] = []; // 根目录的数据
  public defaultSceneFolderArr: Scene.SceneView[] = []; // 文件夹下的数据
  public pollingDataStatus = false; // 判断点击取消还是确定
  public searchValue = ''; // 搜索值
  public sceneStatus: Scene.SceneView[] = []; // 条件搜索时的状态
  constructor(public sceneMethodSer: SceneMethodService, public sceneSourceSer: SceneSourceService,
    private dialogRef: MatDialogRef<FrontScenePollingDialogComponent>, @Inject(MAT_DIALOG_DATA) private data,
    public commonMethodService: CommonMethodService, public tooltipService: TooltipService) {
    this.pollingData.isPolling = this.data.pollingStatus;
  }

  ngOnInit() {
    this.loadScene(false);
  }

  ngAfterViewInit() {
    Utils.slimScroll(); // 添加滚动条

    // 搜索数据
    $('#searchFileInput').on('keyup', Utils.lodash.throttle(() => {
      this.searchFile();
    }, Utils.throttleWaitTime));
  }

  /**
   * 初始化场景列表
   * @param flag: true表示重置时调用(为了保留之前勾选的数据状态)，false表示初始化场景时调用
   */
  private loadScene(flag: boolean): void {
    this.sceneMethodSer.getScenes('', '', () => {
      // 文件夹
      for (const key in this.sceneMethodSer.sceneFolderArray) {
        if (this.sceneMethodSer.sceneFolderArray.hasOwnProperty(key)) {
          for (let i = 0; i < this.sceneMethodSer.sceneFolderArray[key].sceneList.length; i++) {
            if (!flag) { // 勾选
              const checkedItem = this.sceneStatus.filter(d => d.sceneId ===
                this.sceneMethodSer.sceneFolderArray[key].sceneList[i].sceneId);
              if (checkedItem.length) {
                this.sceneMethodSer.sceneFolderArray[key].sceneList[i].isPolling = checkedItem[0].isPolling;
                this.sceneMethodSer.sceneFolderArray[key].sceneList[i].pollingType = checkedItem[0].pollingType;
                this.sceneMethodSer.sceneFolderArray[key].sceneList[i].pollingTime = checkedItem[0].pollingTime;
              }
            }
          }
        }
      }
      this.defaultSceneFolderArr = this.sceneMethodSer.sceneFolderArray;
      // 文件
      for (const key in this.sceneMethodSer.sceneFileArray) {
        if (this.sceneMethodSer.sceneFileArray.hasOwnProperty(key)) {
          if (!flag) {
            const checkedItem = this.sceneStatus.filter(d => d.sceneId === this.sceneMethodSer.sceneFileArray[key].sceneId);
            if (checkedItem.length) {
              this.sceneMethodSer.sceneFileArray[key].isPolling = checkedItem[0].isPolling;
              this.sceneMethodSer.sceneFileArray[key].pollingType = checkedItem[0].pollingType;
              this.sceneMethodSer.sceneFileArray[key].pollingTime = checkedItem[0].pollingTime;
            }
          }
        }
      }
      this.defaultSceneArr = this.sceneMethodSer.sceneFileArray;
    });
  }

  /**
   * 选中或取消某一数据项
   * @param item 勾选项
   * @param fileIndex 勾选项索引
   * @param folderIndex 文件夹索引
   */
  public checkScene(item: Scene.SceneView, fileIndex: number, folderIndex?: number): void {
    if (this.pollingData.time === null) { // 用户将input标签中的时间删除之后 默认设置为0
      this.pollingData.time = 0;
    }
    if (folderIndex === undefined) { // 根目录下数据项的勾选
      this.defaultSceneArr[fileIndex].pollingTime = this.pollingData.time;
    } else {  // 文件夹下的数据项勾选
      this.defaultSceneFolderArr[folderIndex].sceneList[fileIndex].pollingTime = this.pollingData.time;
    }
    if (item.isPolling) { // 选中
      this.sceneStatus.push(item);
    } else { // 取消选中
      const delIndex = this.sceneStatus.findIndex(d => d.sceneId === item.sceneId);
      if (delIndex >= 0) {
        this.sceneStatus.splice(delIndex, 1);
      }
    }
  }

  /**
   * 更新轮巡方式
   * @param item 场景
   * @param flag 轮巡时间或类型
   */
  public changeTypeOrTime(item: Scene.SceneView, flag: string) {
    const index = this.sceneStatus.findIndex(d => d.sceneId === item.sceneId);
    switch (flag) {
      case 'type':
        this.sceneStatus[index].pollingType = item.pollingType;
        break;
      case 'time':
        this.sceneStatus[index].pollingTime = item.pollingTime;
        break;
    }
  }

  /*
   * 取消事件
   */
  public closeDialog(): void {
    this.pollingDataStatus = false;
    this.pollingData.isPolling = false;
    this.dialogRef.close({ isPolling: this.pollingData.isPolling, pollingDataStatus: this.pollingDataStatus });
  }

  /**
   * 重置
   */
  public resetDialog(reset: boolean) {
    this.pollingData.time = 0;
    this.pollingData.isPolling = this.data.polling;
    this.pollingData.switchType = pollingContract.switchType.DownUp;
    this.loadScene(reset);
  }

  /**
   * 设置切换方式或时间间隔
   * @param pollingParam 设置的值
   * @param type 切换方式还是时间间隔
   */
  public switchTypeChange(pollingParam: number, type: string) {
    let field;
    if (type === 'switchType') {
      field = 'pollingType';
    } else {
      field = 'pollingTime';
      if (pollingParam < 3) {
        pollingParam = 3;
        this.pollingData.time = 3;
        this.tooltipService.showMsg('场景轮巡时间应在3-300秒！');
      }
    }
    for (const key in this.defaultSceneArr) { // 根目录下场景切换方式设置
      if (this.defaultSceneArr.hasOwnProperty(key)) {
        this.defaultSceneArr[key][field] = pollingParam;
      }
    }
    for (const key in this.defaultSceneFolderArr) {
      if (this.defaultSceneFolderArr.hasOwnProperty(key)) {
        for (const j in this.defaultSceneFolderArr[key].sceneList) { // 文件夹下场景切换方式设置
          if (this.defaultSceneFolderArr[key].sceneList.hasOwnProperty(j)) {
            this.defaultSceneFolderArr[key].sceneList[j][field] = pollingParam;
          }
        }
      }
    }
  }

  /**
   * 搜索框
   */
  public searchFile() {
    if (this.searchValue) {
      this.sceneMethodSer.getScenes(this.searchValue, this.data.status, () => {
        // 判断搜索的数据是否是选中状态
        for (const i in this.sceneStatus) {
          if (this.sceneStatus.hasOwnProperty(i)) {
            for (const j in this.sceneMethodSer.searchSceneArray) {
              if (this.sceneMethodSer.searchSceneArray.hasOwnProperty(j)) {
                if (this.sceneStatus[i].sceneId === this.sceneMethodSer.searchSceneArray[j].sceneId) {
                  this.sceneMethodSer.searchSceneArray[j].isPolling = this.sceneStatus[i].isPolling;
                  this.sceneMethodSer.searchSceneArray[j].pollingTime = this.sceneStatus[i].pollingTime;
                  this.sceneMethodSer.searchSceneArray[j].pollingType = this.sceneStatus[i].pollingType;
                }
              }
            }
            for (const k in this.sceneMethodSer.searchSceneFileArray) {
              if (this.sceneMethodSer.searchSceneFileArray.hasOwnProperty(k)) {
                if (this.sceneStatus[i].sceneId === this.sceneMethodSer.searchSceneFileArray[k].sceneId) {
                  this.sceneMethodSer.searchSceneFileArray[k].isPolling = this.sceneStatus[i].isPolling;
                  this.sceneMethodSer.searchSceneFileArray[k].pollingTime = this.sceneStatus[i].pollingTime;
                  this.sceneMethodSer.searchSceneFileArray[k].pollingType = this.sceneStatus[i].pollingType;
                }
              }
            }
          }
        }
        this.defaultSceneArr = this.sceneMethodSer.searchSceneArray;
        this.defaultSceneFolderArr = this.sceneMethodSer.searchSceneFileArray;
      });
    }
  }

  /**
   * 开始轮巡
   */
  public startPolling(): void {
    this.pollingDataStatus = true;
    const pollingDataForm: ScenePolling.ScenePollingSave[] = new Array<ScenePolling.ScenePollingSave>(); // 传给后台保存需要轮巡的数据
    const folderArr = new Array<Scene.SceneView>(); // 用数组接收文件夹下的数据
    for (let i = 0; i < this.defaultSceneFolderArr.length; i++) {
      const item = this.defaultSceneFolderArr[i];
      for (const j in item.sceneList) {
        if (item.sceneList[j].isPolling) {
          folderArr.push(item.sceneList[j]);
        }
      }
    }
    const allFileArray = folderArr.concat(this.defaultSceneArr); // 接收根目录和文件夹下的数据
    for (const key in allFileArray) {
      if (allFileArray.hasOwnProperty(key)) {
        const isPolling = allFileArray[key].isPolling;
        if (isPolling) { // 轮巡
          const pollingData: ScenePolling.ScenePollingSave = new ScenePolling.ScenePollingSave();
          pollingData.isPolling = isPolling;
          pollingData.sceneId = allFileArray[key].sceneId;
          pollingData.pollingTime = allFileArray[key].pollingTime;
          pollingData.pollingType = allFileArray[key].pollingType;
          pollingData.pollingOrder = parseInt(key, 0);
          pollingDataForm.unshift(pollingData);
        }
      }
    }
    // 判断只有一个场景不能轮巡
    if (this.pollingData.isPolling && pollingDataForm.length <= 1) {
      this.tooltipService.showMsg('请选择多个场景!');
      return;
    }
    this.sceneSourceSer.setScenePolling(pollingDataForm).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dialogRef.close({ isPolling: this.pollingData.isPolling, pollingDataStatus: this.pollingDataStatus });
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('front', 'scene-polling-dialog startPolling()error,原因:' + JSON.stringify(err));
      }
    });
  }
}
