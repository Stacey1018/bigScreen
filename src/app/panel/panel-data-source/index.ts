import { BehaviorSubject } from 'rxjs';
import { MessageCodeEnum } from './../../common/messageCodeEnum';
import { EventPubSub } from './../../common/eventPubSub';
import swal from 'sweetalert2';
import { Component, OnInit, NgZone, AfterViewInit, OnDestroy } from '@angular/core';
import { Panel } from '../../domain/panel';
import { MatDialog } from '@angular/material';
import { PanelDataSourceDialogComponent } from '../panel-data-source-dialog/index';
import { SortablejsOptions } from 'angular-sortablejs/dist';
import { Scene } from '../../domain/scene/scene';
import { DataMethodService } from '../../services/scene/dataMethod.service';
import { PanelMethodService } from '../../services/panel/panelMethod.service';
import { Utils } from '../../utils/utils';
import { ChartMethodService } from '../../services/panel/chartMethod.service';
import { Chart } from '../../domain/workSheet/chart';
import { Router } from '@angular/router';
import { DefConfigService } from '../../services/defConfig.service';
import { TooltipService } from '../../services/tooltip.service';
import { ChartFolderDialogComponent } from '../../share/chart-folder-dialog';

@Component({
  selector: 'app-panel-data-source',
  templateUrl: './panel-data-source.component.html',
  styleUrls: ['../../../assets/css/scene-panel-list-common.scss', './panel-data-source.component.scss']
})
export class PanelDataSourceComponent implements OnInit, AfterViewInit, OnDestroy {
  public imgUrl: string; // 缩略图路径
  public dataSourceStatus = true; // 判断是数据源状态还是仪表盘状态
  public panelFloderArray: Panel.Panelfile[] = []; // 看板文件夹列表
  public panelArray: Panel.Panelfile[] = []; // 看板列表
  public searchFileName = ''; // 搜索名称
  public pageCount: number; // 数据总条数
  public dataFloderArray: Scene.DataSourceItem[] = []; // 数据源中的文件夹列表
  public dataArray: Scene.DataSourceItem[] = []; // 数据源根目录下的数据列表
  public currPanel: Panel.PanelSave = new Panel.PanelSave(); // 当前看板
  public currChart: Chart.ChartSave = new Chart.ChartSave(); // 当前图表
  public panelUpdateId = ''; // 要删除重命名的看板及文件夹id
  public chartUpdateId = ''; // 要删除重命名的图表及文件夹id
  private chartType: number; // 0是sql建表,1是拖拽生成的图表,2是excel生成图表
  public panelUpdateName = ''; // 看板或文件夹名称
  public chartUpdateName = ''; // 图表或文件夹名称
  public parentId = ''; // 移动至时显示文件所在的文件夹
  // 拖拽元素相对于canvas的位置
  private dragLeft;
  private dragTop;
  public options: SortablejsOptions; // 拖动配置项
  public panelId = ''; // 当前选中的仪表盘id
  public subject = new BehaviorSubject(this.pmSer.display);
  public count; // 标识页面初始化时加载最新看板高光显示

  constructor(private router: Router, public dialog: MatDialog, public tooltipService: TooltipService,
    public dmSer: DataMethodService, public pmSer: PanelMethodService, public chartService: ChartMethodService,
    private zone: NgZone, private defSer: DefConfigService) {
    this.subscribe();
  }

  ngOnInit() {
    this.count = 0;
    this.getChartList();
  }

  ngAfterViewInit() {
    Utils.slimScroll();
    $(document).click(function () {
      if (!$(this).hasClass('editIcon')) {
        $('.operate-container').hide();
      }
    });

    $('#selectByName').on('keyup', Utils.lodash.throttle(() => {
      if (!this.dataSourceStatus) {
        this.getChartList(); // 加载数据视图列表
      } else {
        this.getPanelList(); // 加载仪表盘列表
      }
    }, 1000));
  }

  ngOnDestroy() {
    EventPubSub.instance.unsubscribe(MessageCodeEnum.thumb, this);
    EventPubSub.instance.unsubscribe(MessageCodeEnum.editPanel, this);
    EventPubSub.instance.unsubscribe(MessageCodeEnum.newPanel, this);
    EventPubSub.instance.unsubscribe(MessageCodeEnum.hightLight, this);
  }

  public subscribe() {
    EventPubSub.instance.subscribeEx(MessageCodeEnum.thumb, this.thumbRefrash, this);
    EventPubSub.instance.subscribeEx(MessageCodeEnum.editPanel, this.editPanle, this);
    EventPubSub.instance.subscribeEx(MessageCodeEnum.newPanel, this.unFoldChart, this);
    EventPubSub.instance.subscribeEx(MessageCodeEnum.hightLight, this.hightLight, this);
    this.subject.subscribe({
      next: (val) => {
        if (val) { // 保存页面
          this.options = {
            group: {
              name: 'test',
            },
            disabled: false,
            sort: false, //  配置页面上禁止排序
            onEnd: (event: any) => {
              const id = $(event.item).attr('id');
              const event2: any = window.event;
              if (event2.type === 'dragend') {
                // 获取当前拖拽li在data-tree-thumbnail里面的索引
                const lioffsetLeft = event2.clientX;
                const lioffsetTop = event2.clientY;
                // 拖拽元素相对于canvas的pixel
                this.dragLeft = Math.ceil(lioffsetLeft - $('.layout-main').offset().left);
                this.dragTop = Math.ceil(lioffsetTop - $('.layout-main').offset().top);
                if (this.dragLeft < 0 || this.dragTop < 0 || this.dragLeft > $('.layout-main').width() - 24) {
                  return;
                }
                this.zone.run(() => {
                  this.dmSer.setDragDataParam(id, this.dragLeft, this.dragTop);
                  EventPubSub.instance.publish(MessageCodeEnum.dragToPanel, id);
                });
              }
            },
            onClone: (event: any) => {
            }
          };
        } else {
          this.options = {
            group: { name: 'test' },
            sort: false, // 配置页面上禁止排序
            disabled: true
          };
        }
      }
    });
  }

  public hightLight(param: any, params: any) {
    const _selfThis = params[0];
    if (_selfThis.count === 0) {
      _selfThis.panelId = param.id;
      _selfThis.parentId = param.parentId;
      _selfThis.getPanelList(param.parentId, param.id);
    } else {
      if (_selfThis.panelId !== param.id || _selfThis.parentId !== param.parentId) {
        _selfThis.getPanelList(param.parentId, param.id);
        _selfThis.panelId = param.id;
        _selfThis.parentId = param.parentId;
      }
    }
    _selfThis.count++;
  }

  public unFoldChart(str: string, params: any) {
    const _selfThis = params[0];
    _selfThis.panelId = ''; // 新建时去除左侧列表中的高亮
    _selfThis.operateList('dataView');
  }

  public editPanle(str: string, params: any) {
    const _selfThis = params[0];
    _selfThis.subject.next(_selfThis.pmSer.display);
  }

  public thumbRefrash(panel: Panel.PanelSave, params: any) {
    const _selfThis = params[0];
    _selfThis.subject.next(_selfThis.pmSer.display);
    _selfThis.panelId = panel.dashBoardId; // 保存后高亮显示当前看板
    _selfThis.getPanelList(panel.parentId, panel.dashBoardId);
  }

  /**
   * 获取图表列表
   */
  public getChartList() {
    this.chartService.getChartList(this.searchFileName, '');
  }

  public searchCondition() {
    if (this.dataSourceStatus) {
      this.getPanelList();
    } else {
      this.getChartList();
    }
  }

  // 展开收起列表(false:数据源列表，true:仪表盘列表)
  public operateList(title: string): void {
    if (title === 'dataView') {
      this.dataSourceStatus = false;
    } else {
      this.dataSourceStatus = true;
    }
  }

  public getPanelList(parentId?: string, panelId?: string) {
    this.pmSer.getPanelfiles('', this.searchFileName, parentId, panelId);
  }

  /**
   * 隐藏缩略图
   * @param flag 标识图表还是看板
   */
  public hideImg(flag: string) {
    let showBox;
    switch (flag) {
      case 'chart':
        showBox = $('.data-ShowImg');
        break;
      case 'panel':
        showBox = $('.scene-ShowImg');
        break;
    }
    showBox.hide();
  }

  /**
   * 显示缩略图
   * @param id 图表或看板的主键标识
   * @param flag 标识图表还是看板
   * @param thumb 缩略图信息
   */
  public showImg(id: string, flag: string, thumb: string) {
    let showBox;
    this.imgUrl = thumb;
    switch (flag) {
      case 'chart':
        showBox = $('.data-ShowImg');
        break;
      case 'panel':
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
   * 新建仪表盘文件夹
   * @param flag 标识图表还是看板
   */
  public addFile(flag: string) {
    if (flag === 'chart') {
      this.operateList('dataView');
      this.chartService.addFile();
    } else {
      this.operateList('panel');
      this.pmSer.addFile(this.parentId, this.panelId);
    }
  }

  /**
   * 重命名、删除、移动至功能
   * @param flag 标识是图表还是看板
   * @param id 当前看板的主键标识
   * @param parentId 文件所在的文件夹id
   * @param type 标识sql建表和拖拽建表
   */
  public renameAndRemove(flag: string, id: string, name: string, parentId: string, type: number) {
    let operateBox;
    this.parentId = parentId;
    if (flag === 'chart') {
      this.chartUpdateId = id;
      this.chartUpdateName = name;
      this.chartType = type;
      operateBox = $('.data-rename-remove');
    } else {
      operateBox = $('.scence-rename-remove');
      this.panelUpdateId = id;
      this.panelUpdateName = name;
    }
    this.dmSer.setOperateBox(operateBox, id);
  }

  /**
   * 删除，重命名文件夹
   * @param flag 标识是图表还是看板
   * @param id 当前文件夹的主键标识
   */
  public renameAndDelete(flag: string, id: string, name: string) {
    let operateBox;
    if (flag === 'panel') {
      operateBox = $('.scence-rename-delete');
      this.panelUpdateId = id;
      this.panelUpdateName = name;
    } else {
      this.chartUpdateName = name;
      this.chartUpdateId = id;
      operateBox = $('.data-rename-delete');
    }
    this.dmSer.setOperateBox(operateBox, id);
  }

  /**
   * 切换看板
   * @param panelInfo 当前场景
   */
  public changePanel(panelInfo: any) {
    this.panelId = panelInfo.dashBoardId;
    this.currPanel = panelInfo as Panel.PanelSave;
    EventPubSub.instance.publish(MessageCodeEnum.changePanel, panelInfo);
  }

  // 编辑图表
  public editChart() {
    if (this.chartType === 0 || this.chartType === 1 || this.chartType === 2) {
      this.router.navigate(['/dashboard/dataAnalysis/sqlCreateTable'],
        { queryParams: { 'chartId': this.chartUpdateId, 'chartType': this.chartType } });
    } else if (this.chartType === 3) {
      this.router.navigate(['/dashboard/dataManagement/workSheet/chartAdd'],
        { queryParams: { 'chartId': this.chartUpdateId } });
    }
  }

  /**
   * 删除看板或图表
   * @param flag 标识是看板还是图表
   */
  public deleteData(flag: string) {
    let name;
    if (flag === 'panel') {
      name = this.panelUpdateName;
    } else {
      name = this.chartUpdateName;
    }
    swal({
      title: '提示',
      html: '确定要删除' + name + '?',
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
        if (flag === 'panel') {
          this.pmSer.deletePanel(this.panelUpdateId, this.panelUpdateName);
        } else {
          this.chartService.deleteChart(this.chartUpdateId, this.panelUpdateName); // 调用删除图表文件夹接口
        }
      }
    });
  }

  /**
   * 删除文件夹
   * @param flag1 标识是图表还是看板
   */
  public deleteFile(flag1: string) {
    let name;
    if (flag1 === 'panel') {
      name = this.panelUpdateName;
    } else {
      name = this.chartUpdateName;
    }
    swal({
      title: '提示',
      html: '确定要删除' + name + '?',
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
        if (flag1 === 'panel') {
          this.pmSer.deleteFile(this.panelUpdateId);
        } else {
          this.chartService.deleteChart(this.chartUpdateId);  // 调用删除图表文件夹接口
        }
      }
    });
  }

  /**
   * 格式验证
   * @param openTitle 区分数据列表和场景列表
   */
  public checkName(openTitle: string) {
    const reg = /^[\w\u4e00-\u9fa5]+$/;
    let name;
    let obj: any;
    if (openTitle === 'chart') {
      obj = $('#' + this.chartUpdateId).children('.name');
    } else {
      obj = $('#' + this.panelUpdateId).children('.name');
    }
    name = (obj.val()).trim();
    if (!reg.test(name)) {
      this.tooltipService.showMsg('只允许输入汉字、字母、数字、下划线');
    }
  }

  /**
   * 重命名（文件夹、文件）
   * @param flag 标识图表和看板
   */
  public renameFile(flag: string) {
    let obj: any;
    let name;
    if (flag === 'chart') {
      obj = $('#' + this.chartUpdateId).children('.name');
      name = this.chartUpdateName;
    } else {
      obj = $('#' + this.panelUpdateId).children('.name');
      name = this.panelUpdateName;
    }
    obj.addClass('editStatus');
    obj.focus();
    $(obj).blur(() => {
      const value = (obj.val()).trim();
      if (value !== '') {
        if (value !== name) {
          if (this.tooltipService.checkFormat(value)) {
            if (flag === 'chart') {
              this.chartService.updateChartName(value, this.chartUpdateId); // 调用更新图表文件夹接口
            } else {
              this.pmSer.updatePanel(value, this.panelUpdateId); // 调用更新看板接口
            }
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

  // 移动看板到文件夹
  public removePanel() {
    const width = '400px';
    const height = '200px';
    this.dialog.open(PanelDataSourceDialogComponent, {
      width: width,
      height: height,
      minWidth: width,
      minHeight: height,
      disableClose: true,
      data: {
        id: this.panelUpdateId,
        parentId: this.parentId,
        name: this.panelUpdateName
      }
    });
  }

  // 移动图表到文件夹
  public removeChart() {
    const width = '400px';
    const height = '200px';
    this.dialog.open(ChartFolderDialogComponent, {
      width: width,
      height: height,
      minWidth: width,
      minHeight: height,
      disableClose: true,
      data: {
        id: this.chartUpdateId,
        parentId: this.parentId,
        name: this.chartUpdateName
      }
    });
  }

  /**
   * 获取某一文件夹下的仪表盘
   * @param id 文件夹主键标识
   * @param flag 标识是仪表盘还是图表
   */
  public showPanelsInFloder(flag: string, id: string) {
    switch (flag) {
      case 'panel':
        for (let i = 0; i < this.pmSer.panelfloderArray.length; i++) {
          if (this.pmSer.panelfloderArray[i].dashBoardId === id) {
            if (this.pmSer.panelfloderArray[i].showList) {
              this.pmSer.panelfloderArray[i].showList = false;
            } else {
              this.pmSer.panelfloderArray[i].showList = true;
              this.pmSer.getPanelfiles(id, '');
            }
          }
        }
        break;
      case 'chart':
        for (let i = 0; i < this.chartService.chartFloderArray.length; i++) {
          if (this.chartService.chartFloderArray[i].chartId === id) {
            if (this.chartService.chartFloderArray[i].showList) {
              this.chartService.chartFloderArray[i].showList = false;
            } else {
              this.chartService.chartFloderArray[i].showList = true;
              this.chartService.getChartList('', id);
            }
          }
        }
        break;
    }
  }
}
