import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { SortablejsOptions, SortablejsDirective, SortablejsModule } from 'angular-sortablejs';
import swal from 'sweetalert2';
import { Utils } from '../../../utils/utils';
import { WorkSheetService } from '../../../services/dataAnalysis/workSheet.service';
import { WorkSheetAddDialogComponent } from '../worksheet-add-dialog';
import { DataTableDeployDialogComponent } from '../../data-source/data-table-deploy-dialog';
import { EventPubSub } from '../../../common/eventPubSub';
import { MessageCodeEnum } from '../../../common/messageCodeEnum';
import { DataBase } from '../../../domain/dataDeploy/dataBase';
import { WorkSheet } from '../../../domain/workSheet/workSheet';
import { DataTable } from '../../../domain/dataDeploy/dataTable';
import { TableLinkDialogComponent } from '../table-link-dialog';
import { BehaviorSubject } from 'rxjs';
import { DataDeployService } from '../../../services/dataAnalysis/dataDeploy.service';
import { LogHelper } from '../../../common/LogHelper';
import { DefConfigService } from '../../../services/defConfig.service';
import { TooltipService } from '../../../services/tooltip.service';

@Component({
  selector: 'app-worksheet-list',
  templateUrl: './worksheet-list.component.html',
  styleUrls: [
    '../../../../assets/css/scene-panel-list-common.scss',
    './worksheet-list.component.scss'
  ]
})
export class WorkSheetListComponent implements OnInit, AfterViewInit {
  public workSheets: WorkSheet.WorkSheetView[] = new Array<WorkSheet.WorkSheetView>(); // 工作表数组(含数据库)
  public dbTables: DataTable.DataTableView[] = new Array<DataTable.DataTableView>(); // 搜索时工作表列表
  public workSheetInfo: WorkSheet.WorkSheetInfo = new WorkSheet.WorkSheetInfo(); // 工作表详细信息
  public dbTableId = ''; // 工作表主键
  private dbRemarkName: string; // 工作表显示名称
  public dbTableName: string; // 工作表原始名称
  private isDB: number; // 工作表来源
  public dbId = ''; // 当前操作工作表所属的数据库主键标识
  public isOriginal: boolean; // 是否是原始表
  public pkTableId: string; // 主表主键
  public pkTableName: string; // 主表名称
  public searchTableName = ''; // 工作表名称搜索
  public isLoadingComplete = false;
  public options: SortablejsOptions = {}; // 拖动配置项
  public dtArr = []; // 拖拽数据表数组
  public type = 'dataPreview';
  public fromSubject = new BehaviorSubject(this.type);   // 表单消息对象（可订阅）
  public operateDbTable: DataTable.DataTableView; // 操作的数据表
  public isHasList = false; // 解决搜索bug
  public currTableName: string; // 当前操作工作表名称
  public isChange = true; // 标识type变量是否可以改变
  constructor(private router: Router, private dialog: MatDialog, private wsSer: WorkSheetService,
    private tooltipService: TooltipService, private dataSer: DataDeployService, private defSer: DefConfigService) {
    Utils.showLoading();
    this.subscribe();
  }

  ngOnInit() {
    this.getTableList(1);
  }
  ngAfterViewInit() {
    Utils.slimScroll();
    $(document).click(function () {
      if (!$(this).hasClass('editIcon')) {
        $('.operate-container').hide();
      }
    });
    $('#searchName').on('keyup', Utils.lodash.throttle(() => {
      if (this.isHasList) {
        this.getTableList();
      }
    }, Utils.throttleWaitTime));
  }

  /**
   * 订阅数据库配置更改之后重新刷新工作表列表
   */
  public subscribe() {
    EventPubSub.instance.subscribe(MessageCodeEnum.editDBDeploy, d => {
      this.getTableList();
    });
    EventPubSub.instance.subscribe(MessageCodeEnum.workTableRename, d => {
      this.getTableList();
    });
    EventPubSub.instance.subscribe(MessageCodeEnum.saveMultiTable, d => {
      this.dbTableId = d.tableId;
      this.dbId = d.dbid;
      this.getTableList();
    });
    EventPubSub.instance.subscribe(MessageCodeEnum.gotoMultiTableLinkComponent, d => {
      this.isChange = d;
      this.type = 'multiTableLink';
      this.fromSubject.next(this.type);
    });
    EventPubSub.instance.subscribe(MessageCodeEnum.getMultiTable, dataKeys => {
      // 编辑多表关联时关联图数组
      for (const key in dataKeys) {
        if (dataKeys.hasOwnProperty(key)) {
          const dt = {
            dtId: dataKeys[key].fkTableId,
            dtName: dataKeys[key].fkTableName
          };
          this.dtArr.push(dt);
        }
      }
    });
    EventPubSub.instance.subscribe(MessageCodeEnum.deleteLinkTable, d => {
      this.dtArr = []; // 新增多表关联时点击重置
    });

    EventPubSub.instance.subscribe(MessageCodeEnum.deleteGraph, d => {
      const dtIndex = this.dtArr.findIndex(t => t.dtId === d);
      if (dtIndex >= 0) {
        this.dtArr.splice(dtIndex, 1);
      }
    });
    this.fromSubject.subscribe({
      next: (val) => {
        if (val === 'multiTableLink') {
          this.options = {
            group: { name: 'test' },
            sort: false, // 配置页面上禁止排序
            filter: '.disabledDrag', // 定义哪些不能进行拖放，多个css选择器用,分隔
            disabled: false,
            onEnd: (event: any) => {
              const dtId = $(event.item).attr('id'); // 获取拖拽元素的主表id;
              if (this.pkTableId === dtId) {
                this.tooltipService.showMsg('该表为主表,不能作为关联表');
                return;
              }
              const dtIndex = this.dtArr.findIndex(d => d.dtId === dtId);
              if (dtIndex >= 0) {
                this.tooltipService.showMsg('该关联表已存在关联图中');
                return;
              }
              const dtName = $(event.item).data('id');
              const dbId = $(event.item).data('title');
              const event2: any = window.event;
              if (event2.type === 'dragend') {
                const param = { dtId: dtId, dtName: dtName };
                this.dtArr.push(param);
                this.dialog.open(TableLinkDialogComponent, {
                  width: '600px',
                  height: '300px',
                  disableClose: true,
                  data: { param: param, pkTableId: this.pkTableId, pkTableName: this.pkTableName, dbId: dbId }
                });
              }
            },
            onClone: (event: any) => { },
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

  /**
   * 获取工作表列表
   */
  public getTableList(number = 0) {
    this.wsSer.getTableList(this.searchTableName).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.workSheets = val.data;
          if (number === 1 && this.workSheets.length > 0) {
            this.isHasList = true;
          }
          if (this.workSheets.length) {
            if (this.workSheets[0].dataTables.length) {
              this.isDB = this.workSheets[0].isDB;
              this.changeTable(this.workSheets[0].dataTables[0]); // 默认展示第一个数据库的第一个数据表的数据信息
            }
          } else {
            this.isLoadingComplete = true;
            this.isHasList = false;
          }
        } else {
          LogHelper.log('data-analysis worksheet', 'worksheet-list getTableList()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'worksheet-list getTableList()error,原因:' + JSON.stringify(err));
      },
      complete: () => {
        this.isLoadingComplete = true;
        Utils.hideLoading();
        setTimeout(() => {
          Utils.slimScroll();
        }, 100);
      }
    });
  }

  /**
   * 展开收起二级列表
   * @param obj 当前对象
   * @param isDB 数据来源
   */
  public openChildList(obj, isDB: number) {
    $('.second-lever').addClass('hide');
    $(obj.currentTarget).siblings('.second-lever').removeClass('hide');
    this.isDB = isDB;
  }

  /**
   * 获取工作表详细信息
   * @param workSheetId 工作表主键
   */
  public getTableInfo(workSheetId: string) {
    this.wsSer.getTableInfo(workSheetId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.workSheetInfo = val.data;
        } else {
          LogHelper.log('data-analysis worksheet', 'worksheet-list getTableInfo()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'worksheet-list getTableInfo()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 添加工作表
   */
  public addWorkSheet(type) {
    this.dialog.open(WorkSheetAddDialogComponent, {
      width: '800px',
      height: '500px',
      disableClose: true,
      data: { type: type }
    });
  }

  /**
   * 配置工作表
   * @param hostId 数据库连接实例主键
   * @param dbId 数据库主键
   * @param remarkName 数据库显示名称
   */
  public editWorkSheet(dbHostId: string, dbId: string, remarkName: string) {
    const dialogRef = this.dialog.open(DataTableDeployDialogComponent, {
      width: '500px',
      height: '430px',
      disableClose: true,
      data: { dbHostId: dbHostId, dbId: dbId, remarkName: remarkName }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.getTableList();
    });
  }

  /**
   * 切换数据表
   * @param item 表实体
   */
  public changeTable(item: DataTable.DataTableView) {
    this.dtArr = [];
    this.dbTableId = item.tableId;
    this.dbRemarkName = item.remarkName;
    this.dbId = item.dbId;
    this.dbTableName = item.tableName;
    if (item.isOriginal) {
      this.pkTableId = item.tableId;
      this.pkTableName = item.remarkName;
    } else {
      this.pkTableId = item.originalId;
      this.pkTableName = item.originalName;
    }
    this.isOriginal = item.isOriginal;
    this.dataPreview();
  }

  /**
   * 数据预览
   */
  public dataPreview() {
    if (this.isChange) {
      this.type = 'dataPreview';
    }
    this.fromSubject.next(this.type);
    this.router.navigate(['/dashboard/dataManagement/workSheet/dataPreview'],
      {
        queryParams: {
          'dbTableId': this.dbTableId, 'dbRemarkName': this.dbRemarkName,
          'isOriginal': this.isOriginal, 'isDB': this.isDB, 'dbTableName': this.dbTableName
        }
      });
  }

  /**
   * 多表关联
   */
  public multiTableLink() {
    if (this.isChange) {
      this.type = 'multiTableLink';
    }
    this.fromSubject.next(this.type);
    this.dtArr = [];
    this.router.navigate(['/dashboard/dataManagement/workSheet/multiTableLink'],
      {
        queryParams: {
          'dbTableId': this.dbTableId, 'dbRemarkName': this.dbRemarkName,
          'isOriginal': this.isOriginal, 'pkTableId': this.pkTableId, 'pkTableName': this.pkTableName
        }
      });
  }

  /**
   * 展开弹框
   * @param item 数据库链接实例实体
   */
  public showOperaBox(item: DataTable.DataTableView) {
    this.operateDbTable = item;
    this.currTableName = item.remarkName;
    if (item.isOriginal) {
      this.setOperateBox(item.tableId);
    } else {
      this.setOperateBox(item.originalId);
    }
  }

  private setOperateBox(id): void {
    const operateBox = $('.operate-container');
    let offtop = $('#' + id).offset().top + 30;
    const bodyHeight = $('body').height();
    const boxHeight = operateBox.innerHeight();
    if ((boxHeight + offtop) > bodyHeight) {
      offtop = offtop - 30 - boxHeight;
      operateBox.css({
        'top': offtop,
        'left': 115,
        'background-position': '115px ' + (boxHeight - 4) + 'px'
      }).addClass('top');
    } else {
      operateBox.attr('style', '');
      operateBox.css({ 'top': offtop, 'left': 115 }).removeClass('top');
    }
    operateBox.show();
  }

  /**
   * 重命名
   */
  public renameTableName() {
    let obj: any;
    if (this.operateDbTable.isOriginal) {
      obj = $('#' + this.operateDbTable.tableId).find('.name');
    } else {
      obj = $('#' + this.operateDbTable.originalId).find('.name');
    }
    obj.addClass('editStatus');
    obj.focus();
    $(obj).blur(() => {
      const value = (obj.val()).trim();
      if (!Utils.strIsEmptyOrNull(value)) {
        if (value !== this.currTableName) {
          if (this.tooltipService.checkFormat(value)) {
            this.dataSer.workTableReName(this.operateDbTable.tableId, value).subscribe({
              next: (val) => {
                if (val.code === 0) {
                  this.tooltipService.showMsg('重命名成功');
                } else {
                  this.tooltipService.showMsg(val.message);
                }
              },
              error: (err) => {
                LogHelper.error('data-analysis worksheet', 'worksheet-list renameTableName()error,原因:' + JSON.stringify(err));
              },
              complete: () => {
                obj.removeClass('editStatus');
                this.getTableList(1);
              }
            });
          } else {
            obj.focus();
          }
        } else {
          obj.removeClass('editStatus');
        }
      } else {
        this.tooltipService.showMsg('名称不可以为空');
        obj.focus();
      }
    });
  }

  /**
   * 删除数据表
   * @param dtId 数据表主键
   */
  public deleteTable() {
    swal({
      title: '提示',
      html: '确定要删除"' + this.operateDbTable.remarkName + '"吗?',
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
        this.wsSer.deleteDT(this.operateDbTable.tableId).subscribe({
          next: (val) => {
            if (val.code === 0) {
              this.tooltipService.showMsg('删除成功');
              this.getTableList();
            } else {
              this.tooltipService.showMsg(val.message);
            }
          },
          error: (err) => {
            LogHelper.error('data-analysis worksheet', 'worksheet-list deleteTable()error,原因:' + JSON.stringify(err));
          }
        });
      }
    });
  }

  /**
   * 取消
   */
  public btnCancel() {
    EventPubSub.instance.publish(MessageCodeEnum.cancelChange, '');
  }

  /**
   * 保存
   */
  public btnSave() {
    EventPubSub.instance.publish(MessageCodeEnum.saveChange, '');
  }
}
