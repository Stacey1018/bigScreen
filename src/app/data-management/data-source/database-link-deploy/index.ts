import { Component, OnInit, Input } from '@angular/core';
import { DataDeployService } from '../../../services/dataAnalysis/dataDeploy.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataBase } from '../../../domain/dataDeploy/dataBase';
import { DataTable } from '../../../domain/dataDeploy/dataTable';
import { DBHost } from '../../../domain/dataDeploy/dataBaseLink';
import { Utils } from '../../../utils/utils';
import { LogHelper } from '../../../common/LogHelper';
import { TooltipService } from '../../../services/tooltip.service';

@Component({
  selector: 'app-database-link-deploy',
  templateUrl: './database-link-deploy.component.html',
  styleUrls: ['./database-link-deploy.component.scss']
})
export class DataBaseLinkDeployComponent implements OnInit {
  public dbLinkForm: DBHost.DataBaseLinkForm = new DBHost.DataBaseLinkForm(); // 数据库链接实体
  public isDivDisplay = false; // 控制配置数据库信息div是否显示
  public dbHostId: string; // 数据库连接主键
  public dbType; // 数据库类型
  public isSuccess = false; // 数据库链接是否成功
  public isChangeData: boolean; // 标识页面数据是否发生变化
  constructor(private deploySer: DataDeployService, public activatedRoute: ActivatedRoute,
    public tooltipService: TooltipService, private router: Router) {
    activatedRoute.queryParams.subscribe(params => {
      this.dbType = params.dbType;
      this.dbHostId = params['dbHostId'] === undefined ? '' : params['dbHostId'];
      if (!Utils.strIsEmptyOrNull(this.dbHostId)) {
        this.getDBLinkInfo(this.dbHostId);
      }
    });
  }

  ngOnInit() {
  }

  onChange(dataChange: boolean) {
    this.isChangeData = dataChange;
  }

  /**
   * 返回测试连接
   */
  public returnToTestLink() {
    this.isDivDisplay = false;
  }

  /**
   * 连接测试
   */
  public dbLink() {
    const checkNum = this.dbType === '2' ? 6 : 5;
    if (this.checkAllIsNull() < checkNum) {
      return;
    }
    this.dbLinkForm.isTest = true;
    this.dbLinkForm.dataBaseType = this.dbType;
    this.deploySer.connectHost(this.dbLinkForm).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dbHostId = val.data;
          this.isSuccess = true;
          this.tooltipService.showMsg('连接成功');
        } else {
          this.tooltipService.showMsg('连接失败');
        }
      },
      error: (err) => {
        this.isSuccess = false;
        LogHelper.error('data-management data-source', 'database-link-deploy dbLink()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 获取连接信息
   * @param dbHostId 数据库Host主键
   */
  public getDBLinkInfo(dbHostId: string) {
    this.deploySer.getHostsById(dbHostId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dbLinkForm = val.data;
          this.dbLinkForm.port = this.dbLinkForm.port.toString();
        } else {
          LogHelper.log('data-management data-source', 'database-link-deploy getDBLinkInfo()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-management data-source', 'database-link-deploy getDBLinkInfo()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 点击下一步
   */
  public goToNext() {
    this.dbLinkForm.isTest = false;
    this.dbLinkForm.dataBaseType = this.dbType;
    this.deploySer.connectHost(this.dbLinkForm).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dbHostId = val.data;
          this.isDivDisplay = true;
        } else {
          this.isDivDisplay = false;
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-management data-source', 'database-link-deploy goToNext()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 非空验证
   * @param inputVal input输入框值
   * @param type 输入框类名
   */
  public checkIsNull(inputVal, type): boolean {
    if (Utils.strIsEmptyOrNull(inputVal) || Utils.strIsEmptyOrNull(inputVal.trim())) {
      $('.' + type + 'Tip').show();
      return false;
    } else {
      $('.' + type + 'Tip').hide();
      return true;
    }
  }

  private checkAllIsNull() {
    let i = 0;
    i = this.checkIsNull(this.dbLinkForm.remarkName, 'remarkName') ? (i + 1) : i;
    i = this.checkIsNull(this.dbLinkForm.ip, 'ip') ? (i + 1) : i;
    i = this.checkIsNull(this.dbLinkForm.port, 'port') ? (i + 1) : i;
    i = this.checkIsNull(this.dbLinkForm.userName, 'userName') ? (i + 1) : i;
    i = this.checkIsNull(this.dbLinkForm.passWord, 'passWord') ? (i + 1) : i;
    if (this.dbType === '2') {
      i = this.checkIsNull(this.dbLinkForm.serverName, 'serverName') ? (i + 1) : i;
    }
    return i;
  }
}
