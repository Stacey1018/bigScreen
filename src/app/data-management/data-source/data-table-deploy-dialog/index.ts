import { Utils } from './../../../utils/utils';
import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataDeployService } from '../../../services/dataAnalysis/dataDeploy.service';
import { DataTable } from '../../../domain/dataDeploy/dataTable';
import { DataBase } from '../../../domain/dataDeploy/dataBase';
import { EventPubSub } from '../../../common/eventPubSub';
import { MessageCodeEnum } from '../../../common/messageCodeEnum';
import { LogHelper } from '../../../common/LogHelper';
import { TooltipService } from '../../../services/tooltip.service';

@Component({
  selector: 'app-data-table-deploy-dialog',
  templateUrl: './data-table-deploy-dialog.component.html',
  styleUrls: ['./data-table-deploy-dialog.component.scss']
})
export class DataTableDeployDialogComponent implements OnInit, AfterViewInit {

  public dbHostId: string; // 数据库连接主键
  public remarkName: string; // 数据库显示别名
  public dbTables: DataTable.DataTableView[] = new Array<DataTable.DataTableView>(); // 数据库表数组
  public dbDeployForm: DataBase.DBDeployForm = new DataBase.DBDeployForm(); // 配置数据库保存实体
  public dbForm: DataBase.DBView = new DataBase.DBView(); // 数据库
  public dtIsCheckAll = false; // 数据库表是否全选
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<DataTableDeployDialogComponent>,
    public tooltipService: TooltipService, private dataDeploySer: DataDeployService) {
    this.dbHostId = data.dbHostId;
    this.remarkName = data.remarkName;
    if (data.dbId !== '') {
      this.dbForm.hostId = data.dbHostId;
      this.dbForm.dbId = data.dbId;
      this.dbForm.remarkName = data.remarkName;
      this.dbForm.isDisplay = true;
      this.getDBInfo();
    }
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    Utils.slimScroll();
  }

  /**
   * 获取数据库下的表信息
   */
  public getDBInfo() {
    this.dataDeploySer.getTableListById(this.data.dbId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dbTables = val.data;
          if (this.dbTables.length) {
            const dbChecked = this.dbTables.filter(d => d.isDisplay === true);
            if (this.dbTables.length === dbChecked.length) {
              this.dtIsCheckAll = true;
            }
          }
        } else {
          LogHelper.log('data-management data-source', 'data-table-deploy-dialog getDBInfo()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-management data-source', 'data-table-deploy-dialog getDBInfo()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 数据表勾选或取消勾选
   * @param item 数据表实体
   */
  public checkDataTable(item: DataTable.DataTableView) {
    // 改变全选按钮的状态
    const dt = this.dbTables.filter(d => d.isDisplay === item.isDisplay);
    if (item.isDisplay) {
      if (dt.length === this.dbTables.length) {
        this.dtIsCheckAll = item.isDisplay;
      }
    } else {
      if (dt.length !== this.dbTables.length) {
        this.dtIsCheckAll = item.isDisplay;
      }
    }
    const dataIndex = this.dbTables.findIndex(d => d.tableId === item.tableId);
    if (dataIndex >= 0) {
      this.dbTables[dataIndex].isDisplay = item.isDisplay;
    }
  }

  /**
   * 全选/取消全选
   */
  public checkAll() {
    for (const key in this.dbTables) {
      if (this.dbTables.hasOwnProperty(key)) {
        if (this.dtIsCheckAll) {
          this.dbTables[key].isDisplay = true;
        } else {
          this.dbTables[key].isDisplay = false;
        }
      }
    }
  }

  /**
   * 数据库实例重命名
   */
  public dbRename(e) {
    $(e.target).hide();
    let obj: any;
    obj = $(e.target).siblings('.dbName');
    obj.addClass('editStatus');
    obj.focus();
    const dbHostName = (obj.val()).trim();
    $(obj).blur(() => {
      if (!Utils.strIsEmptyOrNull(this.remarkName)) {
        if (this.remarkName !== dbHostName) {
          if (this.tooltipService.checkFormat(this.remarkName)) {
            this.dataDeploySer.instanceReName(this.data.dbId, this.remarkName).subscribe({
              next: (val) => {
                if (val.code === 0) {
                  this.tooltipService.showMsg('重命名成功');
                  EventPubSub.instance.publish(MessageCodeEnum.dbRename, this.dbHostId);
                } else {
                  this.tooltipService.showMsg(val.message);
                }
              },
              error: (err) => {
                LogHelper.error('data-management data-source', 'data-table-deploy-dialog dbRename()error,原因:' + JSON.stringify(err));
              },
              complete: () => {
                $(e.target).show();
                obj.removeClass('editStatus');
              }
            });
          }
        } else {
          $(e.target).show();
          obj.removeClass('editStatus');
        }

      } else {
        this.tooltipService.showMsg('名称不可以为空');
        obj.focus();
      }
    });
  }

  /**
   * 数据表重命名
   * @param item 数据表实体
   */
  public dbTableRename(e, item: DataTable.DataTableView) {
    const name = item.remarkName;
    $(e.target).hide();
    let obj: any;
    obj = $(e.target).prev('.daTableName');
    obj.addClass('editStatus');
    obj.focus();
    $(obj).blur(() => {
      if (!Utils.strIsEmptyOrNull(item.remarkName)) {
        if (item.remarkName !== name) {
          if (this.tooltipService.checkFormat(item.remarkName)) {
            this.dataDeploySer.dbTableReName(item.tableId, item.remarkName).subscribe({
              next: (val) => {
                if (val.code === 0) {
                  this.tooltipService.showMsg('重命名成功');
                } else {
                  this.tooltipService.showMsg(val.message);
                }
              },
              error: (err) => {
                LogHelper.error('data-management data-source', 'data-table-deploy-dialog dbTableRename()error,原因:' + JSON.stringify(err));
              },
              complete: () => {
                $(e.target).show();
                obj.removeClass('editStatus');
                this.getDBInfo();
              }
            });
          }
        } else {
          $(e.target).show();
          obj.removeClass('editStatus');
        }
      } else {
        this.tooltipService.showMsg('名称不可以为空');
        obj.focus();
      }
    });
  }

  /**
   * 取消
   */
  public closeDialog() {
    this.dialogRef.close();
  }

  /**
   * 保存勾选的数据库配置信息
   */
  public btnConfirm() {
    this.dbDeployForm.hostId = this.dbHostId;
    if (this.dbTables.filter(t => t.isDisplay === true).length) {
      this.dbForm.isDisplay = true;
    } else {
      this.dbForm.isDisplay = false;
    }
    this.dbDeployForm.dbs = this.dbForm;
    this.dbDeployForm.dbTables = this.dbTables;
    this.dataDeploySer.dbDeploy(this.dbDeployForm).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('设置成功');
          this.dialogRef.close();
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-management data-source', 'data-table-deploy-dialog btnConfirm()error,原因:' + JSON.stringify(err));
      }
    });
  }
}
