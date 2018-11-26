import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Utils } from '../../../utils/utils';
import { WorkSheet } from '../../../domain/workSheet/workSheet';
import { DataTable } from '../../../domain/dataDeploy/dataTable';
import { LogHelper } from '../../../common/LogHelper';
import { WorkSheetService } from '../../../services/dataAnalysis/workSheet.service';

@Component({
  selector: 'app-select-worksheet-dialog',
  templateUrl: './select-worksheet-dialog.component.html',
  styleUrls: ['./select-worksheet-dialog.component.scss']
})
export class SelectWorksheetDialogComponent implements OnInit, AfterViewInit {
  public workSheets: WorkSheet.WorkSheetView[] = new Array<WorkSheet.WorkSheetView>(); // 工作表数组(含数据库)
  public dbTables: DataTable.DataTableView[] = new Array<DataTable.DataTableView>(); // 搜索时工作表列表
  public isHasList = false; // 解决搜索bug
  public isLoadingComplete = false;
  public dbId: string; // 工作表所属数据库主键
  public dbTableId = ''; // 工作表主键
  public remarkName = ''; // 工作表显示名称
  public searchTableName = ''; // 搜索名称

  constructor(private wsSer: WorkSheetService, @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SelectWorksheetDialogComponent>) { }

  ngOnInit() {
    this.getTableList(1);
  }

  ngAfterViewInit(): void {
    Utils.slimScroll();
    $('#searchInput').on('keyup', Utils.lodash.throttle(() => {
      if (this.isHasList) {
        this.getTableList();
      }
    }, Utils.throttleWaitTime));
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
          if (this.workSheets.length === 0) {
            this.isLoadingComplete = true;
            this.isHasList = false;
          } else {
            for (const key in this.workSheets) {
              if (this.workSheets.hasOwnProperty(key)) {
                const element = this.workSheets[key];
                element.isShow = true;
              }
            }
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
   * 工作表列表二级菜单展开收起
   * @param item 工作表列表实体
   */
  public operateBox(item: WorkSheet.WorkSheetView) {
    item.isShow = !item.isShow;
  }

  /**
   * 选择工作表
   */
  public changeTable(table: DataTable.DataTableView) {
    this.dbTableId = table.tableId;
    this.remarkName = table.remarkName;
    this.dbId = table.dbId;
  }

  /**
   * 点击确定
   */
  public btnConfirm() {
    this.dialogRef.close({ dbTableId: this.dbTableId, remarkName: this.remarkName, isConfirm: true, dbId: this.dbId });
  }

  /**
   * 关闭弹框
   */
  public closeDialog() {
    this.dialogRef.close({ isConfirm: false });
  }
}
