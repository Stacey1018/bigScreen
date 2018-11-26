import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Scene } from '../../../domain/scene/scene';
import { EventPubSub } from '../../../common/eventPubSub';
import { MessageCodeEnum } from '../../../common/messageCodeEnum';
import { Utils } from '../../../utils/utils';
import { LogHelper } from '../../../common/LogHelper';
import { TooltipService } from '../../../services/tooltip.service';
import { SceneSourceService } from '../../../services/scene/sceneSource.service';
@Component({
  selector: 'app-front-scene-move-dialog',
  templateUrl: './front-scene-move-dialog.component.html',
  styleUrls: ['./front-scene-move-dialog.component.scss']
})
export class FrontSceneMoveDialogComponent implements OnInit, AfterViewInit {


  public defaultLayerSceneArray: Scene.SceneView[] = []; // 场景文件夹
  public sceneRemoveArray: Scene.SceneRemove = new Scene.SceneRemove(); // 移入的场景数据
  private fromSceneFileId: string[] = []; // 源文件主键标识(从场景移动页面传过来的参数)
  private toSceneFileId: string; // 移动至目标文件夹主键标识
  public searchFileName = ''; // 搜索文件名称
  public newFileName = ''; // 新建文件夹名称
  public newSceneFileFlag = false; // 是否新建文件夹标识

  constructor(public tooltipService: TooltipService, public dialogRef: MatDialogRef<FrontSceneMoveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private sceneSer: SceneSourceService) {

  }

  ngOnInit() {
    // 加载场景文件夹
    this.getSceneFolders(this.searchFileName);
    this.fromSceneFileId = this.data.id;
  }
  ngAfterViewInit() {
    Utils.slimScroll(); // 添加滚动条

    $('.searchFileVal').on('keyup', Utils.lodash.throttle(() => {
      this.getSceneFolders(this.searchFileName);
    }, Utils.throttleWaitTime));
  }
  /**
   * 获取默认的场景文件夹接口
   */
  private getSceneFolders(name?: string): void {
    this.sceneSer.getSceneFolders(name).subscribe({
      next: (val) => {
        if (val.code === 0) {
          if (val.data.length > 0) {
            this.defaultLayerSceneArray = val.data as Scene.SceneView[];
            // 最后将根目录数据推入
            this.defaultLayerSceneArray.push({
              thumbnail: '', // 缩略图
              parentId: '', // 文件夹主键标识
              sceneId: '',
              sceneType: null,
              sceneName: '根目录',
              sceneList: [],
              showList: false,
              isOpen: false
            });
          } else {
            this.defaultLayerSceneArray = []; // 文件夹
          }
        } else {
          LogHelper.log('front', 'scene-dialog getSceneFiles()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('front', 'scene-dialog getSceneFiles()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 新建场景文件夹
   */
  public addSceneFile(): void {
    // 显示创建条目
    this.newSceneFileFlag = true;
  }

  /**
   * 确认创建场景文件夹
   */
  public btnAddSceneFile(): void {
    if (this.newFileName.trim() !== '') {
      this.saveSceneFolder(this.newFileName.trim());
    } else {
      this.tooltipService.showMsg('文件夹名称不可以为空');
    }
  }

  /**
   * 取消创建文件夹
   */
  public btnCancel(): void {
    this.newSceneFileFlag = false;
  }

  /**
   * 调用新建场景文件夹接口并获取新建文件夹id
   * @param name 文件夹名称
   */
  private saveSceneFolder(name): void {
    this.sceneSer.saveSceneFile(name).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.btnCancel();
          // 重新加载文件夹列表
          this.getSceneFolders(this.searchFileName);
          // 通知左侧列表更新数据
          EventPubSub.instance.publish(MessageCodeEnum.addSceneFolder, '');
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('front', 'scene-dialog saveSceneGroup()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 确定移入
   */
  public btnRemove(): void {
    if (this.fromSceneFileId.length === 0) {
      this.tooltipService.showMsg('请先选择要移入的数据项');
    } else if (this.toSceneFileId === undefined) {
      this.tooltipService.showMsg('请选择目标文件夹');
    } else {
      this.sceneRemoveArray.idList = this.fromSceneFileId;
      this.sceneRemoveArray.parentId = this.toSceneFileId;
      this.data.animal = true;
      this.moveScene(this.sceneRemoveArray);
    }
  }

  /**
   * 移入到场景文件夹接口
   * @param array 要移动的场景信息
   */
  private moveScene(array): void {
    this.sceneSer.moveScene(array).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('移入数据成功');
          this.closeDialog();
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('front', 'scene-dialog moveScene()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 选择要移至的目标文件夹
   * @param id 选项一个目标文件夹
   */
  public chooseSceneFile(id): void {
    this.toSceneFileId = id;
  }

  /**
   * 取消
   */
  public closeDialog(): void {
    this.dialogRef.close();
  }
}
