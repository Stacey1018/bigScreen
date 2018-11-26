import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DataTable } from '../../../domain/dataDeploy/dataTable';
import { Utils } from '../../../utils/utils';
import { LogHelper } from '../../../common/LogHelper';
import { DataDeployService } from '../../../services/dataAnalysis/dataDeploy.service';
import { TooltipService } from '../../../services/tooltip.service';

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss']
})
export class ImportDialogComponent implements OnInit, AfterViewInit {

  public dbTables: DataTable.DataTableView[] = new Array<DataTable.DataTableView>(); // excel表数组
  public dbId: string; // 上传excel文件主键
  public isCheckAll = false; // 是否全选
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ImportDialogComponent>,
    private dataDeploySer: DataDeployService, private tooltipService: TooltipService) {
    this.dbTables = this.data.dataSheet;
    this.dbId = this.data.dbId;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    Utils.slimScroll();
  }

  /**
   * 勾选或取消勾选excel表
   */
  public checkExcelTable(item: DataTable.DataTableView) {
    // 改变全选按钮的状态
    const dt = this.dbTables.filter(d => d.isDisplay === item.isDisplay);
    if (item.isDisplay) {
      if (dt.length === this.dbTables.length) {
        this.isCheckAll = item.isDisplay;
      }
    } else {
      if (dt.length !== this.dbTables.length) {
        this.isCheckAll = item.isDisplay;
      }
    }
    const dataIndex = this.dbTables.findIndex(d => d.tableId === item.tableId);
    if (dataIndex >= 0) {
      this.dbTables[dataIndex].isDisplay = item.isDisplay;
    }
  }

  /**
   * 全选
   */
  public checkAllTable() {
    for (const key in this.dbTables) {
      if (this.dbTables.hasOwnProperty(key)) {
        if (this.isCheckAll) {
          this.dbTables[key].isDisplay = true;
        } else {
          this.dbTables[key].isDisplay = false;
        }
      }
    }
  }

  /**
   * 取消
   */
  public btnCancel() {
    this.dataDeploySer.deleteDB(this.dbId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          LogHelper.error('data-management data-source', 'data-source-list btnCancel()error,原因:' + val.data);
        } else {
          LogHelper.error('data-management data-source', 'data-source-list btnCancel()error,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-management data-source', 'data-source-list btnCancel()error,原因:' + JSON.stringify(err));
      }
    });
    this.dialogRef.close({ isOK: false });
  }

  /**
   * 确定
   */
  public btnConfirm() {
    const dbCheckTables = this.dbTables.filter(d => d.isDisplay === true);
    if (dbCheckTables.length === 0) {
      this.tooltipService.showMsg('请至少勾选一张工作表');
      return;
    }
    this.dialogRef.close({ isOK: true, dbTableForm: this.dbTables });
  }
}
