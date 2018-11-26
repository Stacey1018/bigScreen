import { error } from 'util';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EventPubSub } from '../../../common/eventPubSub';
import { MessageCodeEnum } from '../../../common/messageCodeEnum';
import { DataTable } from '../../../domain/dataDeploy/dataTable';
import { WorkSheetService } from '../../../services/dataAnalysis/workSheet.service';
import { LogHelper } from '../../../common/LogHelper';
import { TooltipService } from '../../../services/tooltip.service';

@Component({
  selector: 'app-table-link-dialog',
  templateUrl: './table-link-dialog.component.html',
  styleUrls: ['./table-link-dialog.component.scss']
})
export class TableLinkDialogComponent implements OnInit {

  public pkTableName: string; // 主表显示名称
  public pkTableId: string; // 主表主键
  public linkDt; // 关联表
  public primaryFields: DataTable.TableFiled[] = new Array<DataTable.TableFiled>(); // 主表字段数组
  public linkFields: DataTable.TableFiled[] = new Array<DataTable.TableFiled>(); // 关联表字段数组(页面展示)
  public fields: DataTable.TableFiled[] = new Array<DataTable.TableFiled>(); // 关联表字段数组(代码使用)
  public multiTableSave: DataTable.MultiTableSave = new DataTable.MultiTableSave(); // 多表关联数据查询/保存实体
  public linkTable: DataTable.LinkTable = new DataTable.LinkTable();
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<TableLinkDialogComponent>,
    private wsSer: WorkSheetService, private tooltipService: TooltipService) {
    this.pkTableId = this.data.pkTableId;
    this.pkTableName = this.data.pkTableName;
    this.linkDt = this.data.param;
    this.multiTableSave.dbId = this.data.dbId;
    this.multiTableSave.dataKeys = [];
  }

  ngOnInit() {
    this.getTableFields();
  }

  /**
   * 获取字段列表
   */
  public getTableFields() {
    const param: string[] = new Array<string>();
    param.push(this.pkTableId);
    param.push(this.linkDt.dtId);
    this.wsSer.getFiles(param).subscribe({
      next: (val) => {
        if (val.code === 0) {
          const data = val.data as DataTable.FieldInfo[];
          if (data.filter(d => d.tableId === this.pkTableId).length) {
            this.primaryFields = data.filter(d => d.tableId === this.pkTableId)[0].dataFields;
          }
          if (data.filter(d => d.tableId === this.linkDt.dtId).length) {
            this.fields = data.filter(d => d.tableId === this.linkDt.dtId)[0].dataFields;
          }
          if (this.data.dataKeys !== undefined) { // 编辑
            this.linkTable = this.data.dataKeys;
            const index = this.fields.findIndex(d => d.fieldId === this.linkTable.fkField);
            this.linkFields = this.fields.filter(d => d.typeName === this.fields[index].typeName);
          } else { // 新增
            this.linkFields = this.fields.filter(d => d.typeName === this.primaryFields[0].typeName);
            this.linkTable.pkField = this.primaryFields[0].fieldId;
            this.linkTable.pkFieldName = this.primaryFields[0].colName;
            this.linkTable.pkTableId = this.pkTableId;
            this.linkTable.pkTableName = this.pkTableName;
            this.linkTable.fkTableId = this.linkDt.dtId;
            this.linkTable.fkTableName = this.linkDt.dtName;
            this.linkTable.linkType = 'left join'; // 默认初始值
            if (this.linkFields.length) {
              this.linkTable.fkField = this.linkFields[0].fieldId;
              this.linkTable.fkFieldName = this.linkFields[0].colName;
            } else {
              this.linkTable.fkField = '';
              this.linkTable.fkFieldName = '无';
            }
          }
        } else {
          LogHelper.log('data-analysis worksheet', 'table-link-dialog getTableFields()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'table-link-dialog getTableFields()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 选择主表字段
   */
  public changePrimaryField() {
    const field = this.primaryFields.filter(d => d.fieldId === this.linkTable.pkField);
    this.linkTable.pkFieldName = field[0].colName;
    this.linkFields = this.fields.filter(d => d.typeName === field[0].typeName);
    if (this.linkFields.length) {
      this.linkTable.fkField = this.linkFields[0].fieldId;
      this.linkTable.fkFieldName = this.linkFields[0].colName;
    } else {
      this.linkTable.fkField = '';
      this.linkTable.fkFieldName = '无';
    }
  }

  /**
   * 选择关联表字段
   */
  public changeLinkField() {
    const field = this.linkFields.filter(d => d.fieldId === this.linkTable.fkField);
    if (field.length) {
      this.linkTable.fkFieldName = field[0].colName;
    }
  }

  /**
   * 取消
   */
  public btnCancel() {
    EventPubSub.instance.publish(MessageCodeEnum.deleteGraph, this.linkDt.dtId);
    this.dialogRef.close();
  }

  /**
   * 确定
   */
  public btnConfirm() {
    if (this.linkTable.fkField === '') {
      this.tooltipService.showMsg('关联失败,请正确选择关联字段');
    } else {
      EventPubSub.instance.publish(MessageCodeEnum.dragDBTable, this.linkDt);
      const param = { dbId: this.data.dbId, dataKey: this.linkTable };
      EventPubSub.instance.publish(MessageCodeEnum.dtFields, JSON.stringify(param));
      this.dialogRef.close();
    }
  }
}
