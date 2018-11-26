import { MessageCodeEnum } from './../../../common/messageCodeEnum';
import { EventPubSub } from './../../../common/eventPubSub';
import { Component, OnInit, AfterViewInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SortablejsOptions } from 'angular-sortablejs';
import * as $ from 'jquery';
import swal from 'sweetalert2';
import { DataMethodService } from '../../../services/scene/dataMethod.service';
import { Scene } from '../../../domain/scene/scene';
import { SceneMethodService } from '../../../services/scene/sceneMethod.service';
import { Utils } from '../../../utils/utils';
import { DefConfigService } from '../../../services/defConfig.service';
import { TooltipService } from '../../../services/tooltip.service';
import { PollingMethodService } from '../../../services/scene/pollingMethod.service';
import { FrontSceneMoveDialogComponent } from '../front-scene-move-dialog';
import { Router } from '@angular/router';
import { FrontScenePollingDialogComponent } from '../front-scene-polling-dialog';
import { DataTypeEnum } from '../../../common/dataTypeEnum';
import { LogHelper } from '../../../common/LogHelper';
import { SceneSourceService } from '../../../services/scene/sceneSource.service';
@Component({
  selector: 'app-front-scene-list',
  templateUrl: './front-scene-list.component.html',
  styleUrls: ['../../../../assets/css/scene-panel-list-common.scss', './front-scene-list.component.scss']
})
export class FrontSceneListComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() changeScene = new EventEmitter<Scene.SceneView>();
  @Input() isInteractOpen: boolean; // 实时交互按钮状态
  public dataSourceStatus = false; // 判断是场景还是视图的状态，true为场景
  public searchFileName = ''; // 搜索名称
  private sceneUpdatedId = ''; // 要重命名和删除的场景和文件夹的id
  private moveSceneIds: string[] = []; // 要移动的场景主键标识集合
  private sceneUpdatedName = ''; // 场景文件夹的名称
  public imgUrl = '';
  public currSceneId = ''; // 当前点击场景主键（左侧场景列表中的高亮显示与右侧展示的场景一致）

  // 拖拽元素相对于canvas的位置
  private dragLeft;
  private dragTop;
  public dataTypeEnum = {
    echarts: DataTypeEnum.Echarts,
    map: DataTypeEnum.Map,
    media: DataTypeEnum.Media,
    text: DataTypeEnum.Text,
    background: DataTypeEnum.Background,
    border: DataTypeEnum.Border,
    chinaMap: DataTypeEnum.ChinaMap,
    worldMap: DataTypeEnum.WorldMap,
    sphericalMap: DataTypeEnum.SphericalMap,
    image: DataTypeEnum.Image,
    pollingImage: DataTypeEnum.PollingImage,
    historyVideo: DataTypeEnum.HistoryVideo,
    realVideo: DataTypeEnum.RealVideo,
    pollingData: DataTypeEnum.PollingData,
    title: DataTypeEnum.Title,
    timer: DataTypeEnum.Timer,
    draw: DataTypeEnum.Draw,
    singleData: DataTypeEnum.singleData,
    multipleData: DataTypeEnum.multipleData,
    scrollTopData: DataTypeEnum.ScrollTopData
  };
  // 拖动配置项
  public options: SortablejsOptions = {
    group: {
      name: 'test',
    },
    sort: false, //  配置页面上禁止排序
    onEnd: (event: any) => {
      // 获取拖拽元素的id;
      const id = $(event.item).attr('id');
      const event2: any = window.event;
      if (event2.type === 'dragend') {
        // 获取当前拖拽li在data-tree-thumbnail里面的索引
        const lioffsetLeft = event2.clientX;
        const lioffsetTop = event2.clientY;
        // 拖拽元素相对于canvas的pixel
        this.dragLeft = Math.ceil(lioffsetLeft - $('.layout-main').offset().left);
        this.dragTop = Math.ceil(lioffsetTop - $('.layout-main').offset().top);
        this.dataSer.setDragDataParam(id, this.dragLeft, this.dragTop);
        EventPubSub.instance.publish(MessageCodeEnum.dragData, id);
      }
    },
    onClone: (event: any) => {
    },
  };
  constructor(private tooltipService: TooltipService, private dialog: MatDialog, public dataSer: DataMethodService,
    public sceneMethodSer: SceneMethodService, private pollingSer: PollingMethodService, private defSer: DefConfigService,
    private router: Router, private sceneSer: SceneSourceService) {
    this.subscribe(); // 订阅页面消息
  }

  ngOnInit() {
    this.getScenes(); // 加载场景列表
  }

  ngAfterViewInit() {
    $(document).click(function () {
      if (!$(this).hasClass('editIcon')) {
        $('.operate-container').hide();
      }
    });

    $('#selectByName').on('keyup', Utils.lodash.throttle(() => {
      this.getScenes(); // 加载场景列表
    }, Utils.throttleWaitTime));
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  /**
   * 订阅消息
   */
  public subscribe() {
    EventPubSub.instance.subscribe(MessageCodeEnum.addSceneFolder, d => { this.getScenes(); }); // 订阅移动场景时新建文件夹消息
    // EventPubSub.instance.subscribe(MessageCodeEnum.isInteract, d => { this.isInteract = d; });  // 订阅实时交互状态
  }

  /**
   * 反订阅消息
   */
  public unsubscribe() {
    EventPubSub.instance.unsubscribe(MessageCodeEnum.addSceneFolder, this.getScenes);
  }

  /**
   * 新建文件夹
   */
  public addFile(): void {
    setTimeout(() => {
      this.sceneMethodSer.addSceneFile();
    }, 100);
  }

  /**
   * 格式验证
   */
  public checkName(): void {
    const reg = /^[\w\u4e00-\u9fa5]+$/;
    const obj = $('#' + this.sceneUpdatedId).children('.name');
    const name = (obj.val()).trim();
    if (!reg.test(name)) {
      this.tooltipService.showMsg('只允许输入中文、字母、数字、下划线');
    }
  }

  /**
   * 文件夹重命名
   */
  public renameFile(): void {
    let obj: any;
    obj = $('#' + this.sceneUpdatedId).children('.name');
    obj.addClass('editStatus');
    obj.focus();
    $(obj).blur(() => {
      const value = (obj.val()).trim();
      if (value !== '') {
        if (value !== this.sceneUpdatedName) {
          if (this.tooltipService.checkFormat(value)) {
            this.sceneMethodSer.updateSceneName(value, this.sceneUpdatedId); // 调用更新场景文件夹接口
          } else {
            obj.focus();
          }
        }
        obj.removeClass('editStatus');
      } else {
        this.tooltipService.showMsg('名称不可以为空');
        obj.focus();
      }
    });
  }

  /**
   * 删除文件夹
   */
  public deleteFile(): void {
    swal({
      title: '提示',
      html: '确定要删除"' + this.sceneUpdatedName + '"吗？',
      showCancelButton: true,
      confirmButtonColor: this.defSer.swalConfirmButtonColor,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      cancelButtonClass: 'cancelButtonClass',
      showCloseButton: true,
      padding: 0,
      width: '400px',
    }).then((isConfirm) => {
      if (isConfirm.value) {
        this.sceneMethodSer.deleteSceneFile(this.sceneUpdatedId);
      }
    });
  }

  /**
   * 文件夹的重命名和删除的显示
   * @param id 当前操作数据项主键标识
   * @param name 当前操作数据名称
   */
  public folderRenameAndDelete(id: string, name: string): void {
    const operateBox = $('.scence-rename-delete');
    this.sceneUpdatedId = id;
    this.sceneUpdatedName = name;
    this.dataSer.setOperateBox(operateBox, id);
  }

  /**
   * 数据的重命名,删除和移动至显示
   * @param openTitle 区分是数据还是场景
   * @param id 当前数据项主键标识
   */
  public dataRenameAndRemove(id: string, name: string): void {
    const operateBox = $('.scence-rename-remove');
    this.sceneUpdatedId = id;  // 单个场景的删除和重命名
    this.sceneUpdatedName = name;
    this.moveSceneIds.push(id); // 后期的批量移动
    this.dataSer.setOperateBox(operateBox, id);
  }

  /**
   * 二级菜单的显示和隐藏
   * @param folderId 一级目录文件主键标识
   */
  public showSecLevelFile(folderId: string): void {
    const sceneArrIndex = this.sceneMethodSer.sceneFolderArray.findIndex(t => t.sceneId === folderId);
    if (!this.sceneMethodSer.sceneFolderArray[sceneArrIndex].showList) {
      this.sceneMethodSer.sceneFolderArray[sceneArrIndex].showList = true;
    } else {
      this.sceneMethodSer.sceneFolderArray[sceneArrIndex].showList = false;
    }
  }

  /**
   * 获取场景列表
   */
  public getScenes(): void {
    this.sceneMethodSer.getScenes(this.searchFileName, '', () => {
      const sceneFolderIndex = this.sceneMethodSer.sceneFolderArray.findIndex(t => t.isOpen === true);
      if (sceneFolderIndex >= 0) { // 最新创建的场景在文件夹中
        this.changeScene.emit(this.sceneMethodSer.sceneFolderArray[sceneFolderIndex].sceneList[0]);
        this.currSceneId = this.sceneMethodSer.sceneFolderArray[sceneFolderIndex].sceneList[0].sceneId;
      } else if (this.sceneMethodSer.sceneFileArray.length > 0) { // 展示根目录下第一个场景
        this.changeScene.emit(this.sceneMethodSer.sceneFileArray[0]);
        this.currSceneId = this.sceneMethodSer.sceneFileArray[0].sceneId;
      } else if (this.sceneMethodSer.sceneFileArray.length === 0) {
        const scene: Scene.SceneView = new Scene.SceneView();
        scene.sceneId = '';
        this.changeScene.emit(scene);
        this.currSceneId = '';
      }
    });
  }

  /**
   * 场景数据移动
   */
  public removeScene(): void {
    const dialogRef = this.dialog.open(FrontSceneMoveDialogComponent, {
      width: '400px',
      height: '500px',
      disableClose: true,
      data: {
        id: this.moveSceneIds,
        flag: false
      }
    });
    this.moveSceneIds = [];  // 每次传递完数据后清空 防止移动时级联之前的数据
    dialogRef.afterClosed().subscribe(result => {
      this.getScenes();
    });
  }

  /**
   * 删除场景
   */
  public deleteScene(): void {
    swal({
      title: '提示',
      html: '确定要删除"' + this.sceneUpdatedName + '"?',
      showCancelButton: true,
      confirmButtonColor: this.defSer.swalConfirmButtonColor,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      cancelButtonClass: 'cancelButtonClass',
      showCloseButton: true,
      padding: 0,
      width: '400px',
    }).then((isConfirm) => {
      if (isConfirm.value) {
        this.sceneSer.deleteScene(this.sceneUpdatedId).subscribe({
          next: (val) => {
            if (val.code === 0) {
              this.tooltipService.showMsg('删除场景成功');
              this.getScenes(); // 重新加载场景列表
            } else {
              this.tooltipService.showMsg(val.message);
            }
          },
          error: (err) => {
            LogHelper.error('services scene', 'sceneMethod deleteScene()error,原因:' + JSON.stringify(err));
          }
        });
      }
    });
  }

  /**
   * 编辑场景
   */
  public editScene(): void {
    this.router.navigate(['/dashboard/bigScreen/front/createScene'],
      { queryParams: { 'sceneId': this.sceneUpdatedId } });
  }

  /**
   * 切换场景
   * @param sceneInfo 当前点击场景
   */
  public changeSceneInfo(sceneInfo: Scene.SceneView): void {
    sceneInfo.isPolling = this.pollingSer.isPolling;
    this.currSceneId = sceneInfo.sceneId;
    this.changeScene.emit(sceneInfo);

  }

  /**
   * 场景轮巡
   * @param flag 解决轮巡框中的搜索问题
   */
  public scenePolling(flag: string): void {
    if (this.currSceneId === '') {
      return;
    }
    const dialogRef = this.dialog.open(FrontScenePollingDialogComponent, {
      width: '630px',
      height: '460px',
      disableClose: true,
      data: { pollingStatus: this.pollingSer.isPolling, status: flag }
    });
    dialogRef.afterClosed().subscribe((d) => {
      if (d.pollingDataStatus) { // 点击的是确定按钮
        if (d.isPolling) { // 开启轮巡
          this.pollingSer.startPolling(this.isInteractOpen, (val) => {
            this.changeSceneInfo(val); // 调用点击场景的方法
          });
        } else {
          this.pollingSer.endPolling(); // 结束轮巡
        }
      } else {
        return;
      }
    });
  }

  /**
   * 鼠标移动到图标上显示缩略图
   * @param id 数据项主键
   * @param flag 区分数据还是场景
   * @param url 图片路径
   */
  public showImg(id: string, flag: string, url?: string): void {
    let showBox;
    this.imgUrl = url;
    switch (flag) {
      case 'data':
        showBox = $('.data-ShowImg');
        break;
      case 'scene':
        showBox = $('.scene-ShowImg');
        break;
    }
    $('.operate-container').hide();
    let offtop = $('#' + id).offset().top + 30;
    const bodyHeight = $('body').height();
    const boxHeight = showBox.innerHeight();
    if ((boxHeight + offtop) > bodyHeight) {
      offtop = offtop - 30 - boxHeight;
      showBox.css({
        'top': offtop,
        'left': 115,
        'background-position': '115px ' + (boxHeight - 4) + 'px'
      }).addClass('top');
    } else {
      showBox.attr('style', '');
      showBox.css({ 'top': offtop, 'left': 115 }).removeClass('top');
    }
    showBox.show();
  }

  /**
   * 鼠标离开隐藏缩略图
   * @param flag 标识数据视图还是场景
   */
  public hideImg(flag): void {
    let showBox;
    switch (flag) {
      case 'data':
        showBox = $('.data-ShowImg');
        break;
      case 'scene':
        showBox = $('.scene-ShowImg');
        break;
    }
    showBox.hide();
  }
}

