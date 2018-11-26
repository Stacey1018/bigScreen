import { EventPubSub } from './../../common/eventPubSub';
import { Component, OnInit, EventEmitter, Input, Output, AfterViewInit } from '@angular/core';
import { DataBase } from '../../domain/dataDeploy/dataBase';
import { DataTable } from '../../domain/dataDeploy/dataTable';
import { DataDeployService } from '../../services/dataAnalysis/dataDeploy.service';
import { Router } from '@angular/router';
import { MessageCodeEnum } from '../../common/messageCodeEnum';
import { Utils } from '../../utils/utils';
import { LogHelper } from '../../common/LogHelper';
import { TooltipService } from '../../services/tooltip.service';

@Component({
  selector: 'app-database-deploy',
  templateUrl: './database-deploy.component.html',
  styleUrls: ['./database-deploy.component.scss']
})
export class DataBaseDeployComponent implements OnInit, AfterViewInit {
  @Input() dbHostId; // 数据库连接主键
  @Input() className = ''; // 数据库连接主键
  @Input() pageType; // 0:excel,1:工作表
  @Output() emitter = new EventEmitter<boolean>();
  public dataBases: DataBase.DBView[] = new Array<DataBase.DBView>(); // 数据库数组
  public dbTables: DataTable.DataTableView[] = new Array<DataTable.DataTableView>(); // 数据表数组
  public dbDeployForm: DataBase.DBDeployForm = new DataBase.DBDeployForm(); // 配置数据库保存实体
  public dtIsCheckAll = false; // 数据库表是否全选
  public dbChecked: DataBase.DBView = new DataBase.DBView(); // 勾选的数据库
  public dbTablesChecked: DataTable.DataTableView[] = new Array<DataTable.DataTableView>(); // 勾选的数据表数组
  public selectedDbId = ''; // 选中的数据库的id
  public isDataChange = false; // 标识页面是否发生变化
  constructor(private dataDeploySer: DataDeployService, private router: Router, private tooltipService: TooltipService) { }
  ngOnInit() {
    if (this.dbHostId !== undefined && this.dbHostId !== null && this.dbHostId !== '') { // 添加编辑数据源时加载此页面
      this.getDBListById(this.dbHostId);
    } else { // 添加工作表
      this.getDBList();
    }
  }

  ngAfterViewInit() {
    Utils.slimScroll();
  }

  /**
   * 获取数据库列表
   * @param dbHostId 数据库连接主键
   */
  public getDBListById(dbHostId: string) {
    this.dataDeploySer.getDBListById(dbHostId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dataBases = val.data;
          if (this.dataBases.length) {
            this.getTableList(this.dataBases[0].dbId); // 默认显示第一个数据库中的所有表
          }
        } else {
          LogHelper.log('share', 'database-deploy getDBListById()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('share', 'database-deploy getDBListById()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 获取所有连接实例下的数据库列表
   */
  public getDBList() {
    this.dataDeploySer.getListByType(this.pageType).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dataBases = val.data;
          if (this.dataBases.length) {
            this.getTableList(this.dataBases[0].dbId);
          }
        } else {
          LogHelper.log('share', 'database-deploy getDBList()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('share', 'database-deploy getDBList()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 获取数据表
   * @param dbId 数据库主键
   */
  public getTableList(dbId: string) {
    this.selectedDbId = dbId;
    this.dataDeploySer.getTableListById(dbId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dbTables = val.data;
          if (this.dbTables.length) {
            const dt = this.dbTables.filter(d => d.isDisplay === true);
            if (dt.length === this.dbTables.length) {
              this.dtIsCheckAll = true;
            }
          }
        } else {
          LogHelper.log('share', 'database-deploy getTableList()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('share', 'database-deploy getTableList()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 取消
   */
  public btnCancel() {
    EventPubSub.instance.publish(MessageCodeEnum.dialogClose, '');
    this.isDataChange = false;
    this.emitter.emit(this.isDataChange);
  }

  /**
   * 数据库勾选或取消勾选
   * @param item 数据库实体
   */
  public checkDataBase(item: DataBase.DBView) {
    this.dtIsCheckAll = false;
    if (this.dbTablesChecked.length) {
      this.saveDBDeployInfo(false, d => {
        this.getTableList(item.dbId);
      });
    } else {
      this.getTableList(item.dbId);
    }
  }

  /**
   * 数据表勾选或取消勾选
   * @param item 数据表实体
   */
  public checkDataTable(item: DataTable.DataTableView) {
    this.isDataChange = true;
    this.emitter.emit(this.isDataChange);
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
      this.dbTables[dataIndex].isDisplay = item.isDisplay; // 更改数据表的勾选状态
    }
    this.changeDataBase(item);
  }

  /**
   * 根据数据表的勾选判断数据库是否被选中
   * @param item 数据表实体
   */
  public changeDataBase(item: DataTable.DataTableView) {
    const deleteIndex = this.dbTablesChecked.findIndex(d => d.tableId === item.tableId);
    if (deleteIndex >= 0) {
      this.dbTablesChecked.splice(deleteIndex, 1);
    } else {
      this.dbTablesChecked.push(item);
    }
    const dbTableChecked = this.dbTables.filter(d => d.isDisplay === true);
    const dbIndex = this.dataBases.findIndex(d => d.dbId === item.dbId);
    if (dbTableChecked.length) {
      this.dataBases[dbIndex].isDisplay = true; // 更改数据库的勾选状态
    } else {
      this.dataBases[dbIndex].isDisplay = false; // 更改数据库的勾选状态
    }
    this.dbDeployForm.dbs = this.dataBases[dbIndex];
  }

  /**
   * 数据库表全选/取消全选
   */
  public dtCheckAll() {
    this.isDataChange = true;
    this.emitter.emit(this.isDataChange);
    // 改变数据表的状态
    for (const key in this.dbTables) {
      if (this.dbTables.hasOwnProperty(key)) {
        this.changeDataBase(this.dbTables[key]);
        if (this.dtIsCheckAll) {
          this.dbTables[key].isDisplay = true;
          this.dbTablesChecked.push(this.dbTables[key]);
        } else {
          this.dbTables[key].isDisplay = false;
          this.dbTablesChecked.splice(parseInt(key, 0), 1);
        }
      }
    }
    // 改变数据库的状态
    const dbIndex = this.dataBases.findIndex(d => d.dbId === this.dbTables[0].dbId);
    if (this.dtIsCheckAll) {
      this.dataBases[dbIndex].isDisplay = true; // 更改数据库的勾选状态
    } else {
      this.dataBases[dbIndex].isDisplay = false; // 更改数据库的勾选状态
    }
  }

  /**
   * 保存勾选的数据库配置信息
   */
  public saveDBDeployInfo(isConfirm, callback?: any) {
    this.dbDeployForm.dbTables = this.dbTables;
    this.dataDeploySer.dbDeploy(this.dbDeployForm).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dbTablesChecked = [];
          if (isConfirm) {
            this.tooltipService.showMsg('保存成功');
          }
          if (callback) {
            callback();
          }
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('share', 'database-deploy saveDBDeployInfo()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 确定
   */
  public btnConfirm() {
    this.isDataChange = false;
    this.emitter.emit(this.isDataChange);
    if (this.dbTablesChecked.length) {
      this.saveDBDeployInfo(true, d => {
        if (this.dbHostId === undefined) { // 添加工作表时加载此页面
          EventPubSub.instance.publish(MessageCodeEnum.dialogClose, '');
          EventPubSub.instance.publish(MessageCodeEnum.editDBDeploy, ''); // 在回调里写一遍是为了解决异步问题(保存成功之后再刷新列表)
        } else { // 添加编辑数据源时加载此页面
          this.router.navigate(['/dashboard/dataManagement/dataSource/dataSourceList']);
        }
      });
    } else {
      if (this.dbHostId === undefined) { // 添加工作表时加载此页面
        EventPubSub.instance.publish(MessageCodeEnum.dialogClose, '');
        EventPubSub.instance.publish(MessageCodeEnum.editDBDeploy, '');
      } else { // 添加编辑数据源时加载此页面
        this.router.navigate(['/dashboard/dataManagement/dataSource/dataSourceList']);
      }
    }
  }

  /**
   * 数据库实例重命名
   * @param item 数据库实体
   */
  public dbRename(item: DataBase.DBView) {
    let obj: any;
    obj = $('#' + item.dbId).children('.dbName');
    obj.next('.renameIcon').hide();
    obj.addClass('editStatus');
    obj.focus();
    const name = item.remarkName;
    $(obj).blur(() => {
      const value = (obj.val()).trim();
      if (!Utils.strIsEmptyOrNull(value)) {
        if (item.remarkName !== name) {
          if (this.tooltipService.checkFormat(item.remarkName)) {
            this.dataDeploySer.instanceReName(item.dbId, item.remarkName).subscribe({
              next: (val) => {
                if (val.code === 0) {
                  this.tooltipService.showMsg('重命名成功');
                } else {
                  this.tooltipService.showMsg(val.message);
                }
              },
              error: (err) => {
                LogHelper.error('share', 'database-deploy dbRename()error,原因:' + JSON.stringify(err));
              },
              complete: () => {
                obj.removeClass('editStatus');
                obj.next('.renameIcon').show();
                if (this.dbHostId !== undefined && this.dbHostId !== null && this.dbHostId !== '') { // 添加编辑数据源时加载此页面
                  this.getDBListById(this.dbHostId);
                } else { // 添加工作表时加载此页面
                  this.getDBList();
                }
              }
            });
          } else {
            obj.focus();
          }
        } else {
          obj.removeClass('editStatus');
          obj.next('.renameIcon').show();
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
  public dbTableRename(item: DataTable.DataTableView) {
    let obj: any;
    obj = $('#' + item.tableId).children('.dbTableName');
    obj.next('.renameIcon').hide().siblings('.dbTableNameSpan').hide();
    obj.show().addClass('editStatus');
    obj.focus();
    const name = item.remarkName;
    $(obj).blur(() => {
      const value = (obj.val()).trim();
      if (!Utils.strIsEmptyOrNull(value)) {
        if (item.remarkName !== name) {
          if (this.tooltipService.checkFormat(item.remarkName)) {
            this.dataDeploySer.dbTableReName(item.tableId, item.remarkName).subscribe({
              next: (result) => {
                if (result.code === 0) {
                  this.tooltipService.showMsg('重命名成功');
                } else {
                  this.tooltipService.showMsg(result.message);
                }
              },
              error: (err) => {
                LogHelper.error('share', 'database-deploy dbTableRename()error,原因:' + JSON.stringify(err));
              },
              complete: () => {
                obj.removeClass('editStatus').hide();
                obj.next('.renameIcon').show().siblings('.dbTableNameSpan').show();
                this.getTableList(this.selectedDbId);
              }
            });
          } else {
            obj.focus();
          }
        } else {
          obj.removeClass('editStatus').hide();
          obj.next('.renameIcon').show().siblings('.dbTableNameSpan').show();
        }
      } else {
        this.tooltipService.showMsg('名称不可以为空');
        obj.focus();
      }
    });
  }
}
