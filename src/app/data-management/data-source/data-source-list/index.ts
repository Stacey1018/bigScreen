import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DataBase } from '../../../domain/dataDeploy/dataBase';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DataTableDeployDialogComponent } from '../data-table-deploy-dialog';
import { DataDeployService } from '../../../services/dataAnalysis/dataDeploy.service';
import { DBHost } from '../../../domain/dataDeploy/dataBaseLink';
import swal from 'sweetalert2';
import { Utils } from '../../../utils/utils';
import { EventPubSub } from '../../../common/eventPubSub';
import { MessageCodeEnum } from '../../../common/messageCodeEnum';
import { LogHelper } from '../../../common/LogHelper';
import { DefConfigService } from '../../../services/defConfig.service';
import { TooltipService } from '../../../services/tooltip.service';

@Component({
  selector: 'app-data-source-list',
  templateUrl: './data-source-list.component.html',
  styleUrls: ['./data-source-list.component.scss']
})
export class DataSourceListComponent implements OnInit, AfterViewInit {

  public dataBases: DataBase.DBView[] = new Array<DataBase.DBView>(); // 数据库数组
  public dbHosts: DBHost.DBHostView[] = new Array<DBHost.DBHostView>(); // 数据库连接数组
  public isLoadingComplete = false;
  public currEditDb: DBHost.DBHostView = new DBHost.DBHostView(); // 数据库链接实体
  public currHostId = '';

  constructor(private router: Router, private dialog: MatDialog, private dataDeploySer: DataDeployService,
    private tooltipService: TooltipService, private defSer: DefConfigService) {
    Utils.showLoading();
    this.subscribe();
  }

  ngOnInit() {
    this.getDBLinkList();
  }

  public subscribe() {
    EventPubSub.instance.subscribe(MessageCodeEnum.dbRename, d => {
      this.getDBList(d);
    });
  }
  ngAfterViewInit() {
    $(document).click(function () {
      if (!$(this).hasClass('editIcon')) {
        $('.operate-container').hide();
      }
    });
    this.scroll();
  }

  private scroll() {
    Utils.slimScroll();
  }

  /**
   * 展开弹框
   * @param item 数据库链接实例实体
   */
  public showOperaBox(item) {
    this.currEditDb = item;
    this.setOperateBox(item.hostId);
  }

  private setOperateBox(id): void {
    const operateBox = $('.operate-container');
    let offtop = $('#' + id).offset().top + 25;
    const bodyHeight = $('body').height();
    const boxHeight = operateBox.innerHeight();
    if ((boxHeight + offtop) > bodyHeight) {
      offtop = offtop - 25 - boxHeight;
      operateBox.css({
        'top': offtop,
        'left': 150,
        'background-position': '115px ' + (boxHeight - 4) + 'px'
      }).addClass('top');
    } else {
      operateBox.attr('style', '');
      operateBox.css({ 'top': offtop, 'left': 150 }).removeClass('top');
    }
    operateBox.show();
  }

  /**
   * 获取数据库连接列表
   */
  public getDBLinkList() {
    this.dataDeploySer.getHostList().subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dbHosts = val.data;
          if (this.currHostId !== '') {
            this.getDBList(this.currHostId); // 当前点击的连接下的数据库列表
          } else {
            if (this.dbHosts.length) {
              this.getDBList(this.dbHosts[0].hostId); // 默认加载第一个连接下的数据库列表
            }
          }
        } else {
          LogHelper.log('data-management data-source', 'data-source-list getDBLinkList()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-management data-source', 'data-source-list getDBLinkList()error,原因:' + JSON.stringify(err));
      },
      complete: () => {
        this.isLoadingComplete = true;
        Utils.hideLoading();
        setTimeout(() => {
          this.scroll();
        }, 100);
      }
    });
  }

  /**
   * 获取某个数据库连接实例下的数据库列表
   * @param dbHostId 数据库连接主键
   */
  public getDBList(dbHostId: string) {
    this.dataDeploySer.getDBListById(dbHostId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          const dbs = val.data as DataBase.DBView[];
          this.dataBases = dbs.filter(d => d.isDisplay === true);
          this.currHostId = dbHostId;
        } else {
          LogHelper.log('data-management data-source', 'data-source-list getDBList()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-management data-source', 'data-source-list getDBList()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 编辑数据库连接信息
   * @param dbHostId 数据库Host主键
   */
  public editDBLink() {
    this.router.navigate(['/dashboard/dataManagement/dataSource/dataBaseDeploy'], {
      queryParams: {
        'dbHostId': this.currEditDb.hostId,
        'dbType': this.currEditDb.dataBaseType
      }
    });
  }

  /**
   * 删除数据库连接
   * @param dbHostId 数据库Host主键
   */
  public deleteDBLink() {
    swal({
      title: '提示',
      html: '确定要删除该"' + this.currEditDb.remarkName + '"连接吗？所有相关数据都会被删除',
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
        this.dataDeploySer.deleteDBLink(this.currEditDb.hostId).subscribe({
          next: (val) => {
            if (val.code === 0) {
              this.tooltipService.showMsg('删除成功');
              this.getDBLinkList();
            } else {
              this.tooltipService.showMsg(val.message);
            }
          },
          error: (err) => {
            LogHelper.error('data-management data-source', 'data-source-list deleteDBLink()error,原因:' + JSON.stringify(err));
          }
        });
      }
    });
  }

  /**
   * 编辑数据库
   * @param item 数据库实体
   */
  public editDB(item: DataBase.DBView) {
    this.currHostId = item.hostId;
    const dialogRef = this.dialog.open(DataTableDeployDialogComponent, {
      width: '500px',
      height: '430px',
      disableClose: true,
      data: { dbId: item.dbId, remarkName: item.remarkName, dbHostId: item.hostId }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getDBLinkList();
    });
  }

  /**
   * 删除数据库
   * @param dbId 数据库主键
   * @param remarkName 数据库显示名称
   */
  public deleteDB(dbInfo: DataBase.DBView) {
    swal({
      title: '提示',
      html: '确定要删除"' + dbInfo.remarkName + '"吗?',
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
        this.dataDeploySer.deleteDB(dbInfo.dbId).subscribe({
          next: (val) => {
            if (val.code === 0) {
              this.tooltipService.showMsg('删除成功');
              this.getDBList(dbInfo.hostId);
            } else {
              this.tooltipService.showMsg(val.message);
            }
          },
          error: (err) => {
            LogHelper.error('data-management data-source', 'data-source-list deleteDB()error,原因:' + JSON.stringify(err));
          }
        });
      }
    });
  }
}
