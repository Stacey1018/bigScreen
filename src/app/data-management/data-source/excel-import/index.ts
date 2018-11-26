import { Component, OnInit } from '@angular/core';
import { TooltipService } from '../../../services/tooltip.service';
import { DataDeployService } from '../../../services/dataAnalysis/dataDeploy.service';
import { ImportDialogComponent } from '../import-dialog';
import { MatDialog } from '@angular/material';
import { LogHelper } from '../../../common/LogHelper';
import { ExcelTable } from '../../../domain/dataDeploy/excelTable';
import { DataBase } from '../../../domain/dataDeploy/dataBase';
import { Router } from '@angular/router';
@Component({
  selector: 'app-excel-import',
  templateUrl: './excel-import.component.html',
  styleUrls: ['./excel-import.component.scss']
})
export class ExcelImportComponent implements OnInit {

  public isHaveData = false; // 是否有表格数据
  public dbTableData = { key: [], data: [] }; // excel表字段和数据
  public excelTableView: ExcelTable.ExcelTableView = new ExcelTable.ExcelTableView(); // 上传excel返回实体
  public excelNames: Array<string> = new Array<string>(); // excel工作表名称数组
  public excelData; // 接收获取excel数据返回结果
  public dbDeployForm: DataBase.DBDeployForm = new DataBase.DBDeployForm(); // 配置数据库保存实体
  public excelName: string; // excel文件名称
  public currSheet = '';
  constructor(private tooltipService: TooltipService, private ddSer: DataDeployService, private dialog: MatDialog,
    private dataDeploySer: DataDeployService, private router: Router) {
  }

  ngOnInit() {
  }

  public upload(event) {
    this.isHaveData = false;
    if (event.target.files[0].size === 0) {
      this.tooltipService.showMsg('不能上传空文件');
      return;
    }
    this.excelName = event.target.files[0].name;
    this.ddSer.importExcel(event.target.files[0]).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.excelTableView = val.data;
          this.openDialog(val.data.dataSheet, val.data.dbId);
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-management data-source', 'excel-import upload()error,原因:' + JSON.stringify(err));
      },
      complete: () => {
        event.target.value = '';
      }
    });
  }

  /**
   * 打开弹框勾选要展示的sheet
   * @param dataSheet sheet数组
   * @param dbId excel表主键
   */
  public openDialog(dataSheet, dbId) {
    const dialogRef = this.dialog.open(ImportDialogComponent, {
      width: '400px',
      height: '400px',
      disableClose: true,
      data: { dataSheet: dataSheet, dbId: dbId }
    });
    dialogRef.afterClosed().subscribe((val) => {
      if (val.isOK) { // 点击确定按钮
        // 调用后台方法获取表格数据
        this.excelTableView.dataSheet = val.dbTableForm;
        this.dbDeployForm.dbTables = val.dbTableForm;
        this.ddSer.getSheetData(this.excelTableView).subscribe({
          next: (d) => {
            if (d.code === 0) {
              this.isHaveData = true;
              if (d.data !== null) {
                this.excelData = d.data;
                for (const key in this.excelData) {
                  if (this.excelData.hasOwnProperty(key)) {
                    this.excelNames.push(this.excelData[key].sheetName);
                  }
                }
                this.currSheet = this.excelData[0].sheetName;
                this.loadExcelData(this.excelData[0].sheetVal); // 默认展示第一个工作表数据
              }
            }
          }
        });
      }
    });
  }

  /**
   * 筛选excel工作表展示数据
   * @param param 工作表单条数据
   */
  public loadExcelData(param) {
    const keyArr = [];
    for (const key in param[0]) {
      if (param[0].hasOwnProperty(key)) {
        keyArr.push(key);
      }
    }
    this.dbTableData.key = keyArr;
    this.dbTableData.data = param;
  }

  /**
   * 切换excel工作表
   * @param excelName excel工作表名称
   */
  public changeData(excelName: string) {
    const data = this.excelData.filter(d => d.sheetName === excelName);
    this.currSheet = excelName;
    this.loadExcelData(data[0].sheetVal);
  }

  /**
   * 导入数据
   */
  public importExcel() {
    const dbInfo: DataBase.DBView = new DataBase.DBView();
    dbInfo.hostId = this.excelTableView.hostId;
    dbInfo.dbId = this.excelTableView.dbId;
    dbInfo.isDisplay = true;
    this.dbDeployForm.dbs = dbInfo;
    this.dataDeploySer.dbDeploy(this.dbDeployForm).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('导入成功');
          this.router.navigate(['/dashboard/dataManagement/dataSource/dataSourceList']);
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('share', 'database-deploy saveDBDeployInfo()error,原因:' + JSON.stringify(err));
      }
    });
  }
}
