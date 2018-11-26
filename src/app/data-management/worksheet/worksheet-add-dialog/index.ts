import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { DataBase } from '../../../domain/dataDeploy/dataBase';
import { DataDeployService } from '../../../services/dataAnalysis/dataDeploy.service';
import { EventPubSub } from '../../../common/eventPubSub';
import { MessageCodeEnum } from '../../../common/messageCodeEnum';
import { LogHelper } from '../../../common/LogHelper';

@Component({
  selector: 'app-worksheet-add-dialog',
  templateUrl: './worksheet-add-dialog.component.html',
  styleUrls: ['./worksheet-add-dialog.component.scss']
})
export class WorkSheetAddDialogComponent implements OnInit {

  public dataBases: DataBase.DBView[] = new Array<DataBase.DBView>(); // 数据库数组

  public pageType; // 0:excel,1:工作表
  constructor(private router: Router, public dialogRef: MatDialogRef<WorkSheetAddDialogComponent>,
    private dataDeploySer: DataDeployService, private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    EventPubSub.instance.subscribe(MessageCodeEnum.dialogClose, d => {
      this.closeDialog();
    });
    this.pageType = this.data.type;
  }

  ngOnInit() {
    this.getDBList();
  }

  /**
  * 获取所有连接实例下的数据库列表
  */
  public getDBList() {
    this.dataDeploySer.getDBList().subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dataBases = val.data;
        } else {
          LogHelper.log('data-analysis worksheet', 'worksheet-add-dialog getDBList()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'worksheet-add-dialog getDBList()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 添加数据源
   */
  public addDataSource() {
    this.dialogRef.close();
    this.router.navigate(['/dashboard/dataManagement/dataSource/dataSourceType']);
  }

  /**
     * 取消
     */
  public closeDialog() {
    this.dialogRef.close();
  }
}
