import { Utils } from './../../../utils/utils';
import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { WorkSheetService } from '../../../services/dataAnalysis/workSheet.service';
import { WorkSheet } from '../../../domain/workSheet/workSheet';
import { EventPubSub } from '../../../common/eventPubSub';
import { MessageCodeEnum } from '../../../common/messageCodeEnum';
import { ActivatedRoute } from '@angular/router';
import { DataTable } from '../../../domain/dataDeploy/dataTable';
import { LogHelper } from '../../../common/LogHelper';
import { DefConfigService } from '../../../services/defConfig.service';
import { TooltipService } from '../../../services/tooltip.service';

@Component({
  selector: 'app-data-preview',
  templateUrl: './data-preview.component.html',
  styleUrls: ['./data-preview.component.scss']
})
export class DataPreviewComponent implements OnInit, AfterViewInit {
  public dbTableId: string; // 数据表主键
  public dbTableName: string; // 数据表名称
  public dbRemarkName: string; // 数据表显示名称
  public isOriginal: string; // 是否是原始表
  public dateFields: DataTable.TableFiled[] = new Array<DataTable.TableFiled>(); // 数据表日期字段数组
  public textFields: DataTable.TableFiled[] = new Array<DataTable.TableFiled>(); // 数据表文本字段数组
  public valueFields: DataTable.TableFiled[] = new Array<DataTable.TableFiled>(); // 数据表数值字段数组
  public dbFields: DataTable.TableFiled[] = new Array<DataTable.TableFiled>(); // 数据表字段数组
  public dbFieldsHtml: DataTable.TableFiled[] = new Array<DataTable.TableFiled>(); // 数据表字段数组
  public dbData = []; // 数据表数据
  public isOpenSetting = false; // 字段设置收起展开
  public pageIndex = 1;
  public pageCount = 0; // 数据总条数
  public currFieldName: string; // 当前重命名字段名称
  public isLoadComplete = true;
  private isDB: number;
  constructor(private route: ActivatedRoute, private wsSer: WorkSheetService, private tooltipService: TooltipService,
    private defSer: DefConfigService) {
    // 路由切换时获取参数
    route.queryParams.subscribe(params => {
      this.dbTableId = params['dbTableId'] === undefined ? '' : params['dbTableId'];
      this.dbTableName = params['dbTableName'] === undefined ? '' : params['dbTableName'];
      this.dbRemarkName = params['dbRemarkName'] === undefined ? '' : params['dbRemarkName'];
      this.isOriginal = params['isOriginal'] === undefined ? '' : params['isOriginal'];
      this.isDB = params['isDB'] === undefined ? '' : params['isDB'];
      if (this.dbTableId !== null && this.dbTableId !== '') {
        if (this.isOpenSetting) {
          this.isOpenSetting = false;
        }
        this.dbData = [];
        this.pageIndex = 1;
        if (this.isOriginal === 'true') {
          this.getTableData();
        } else {
          this.getMultiTableInfo();
        }
      }
    });
  }

  ngOnInit() {

  }
  ngAfterViewInit() {
    Utils.slimScroll();
    $('#tableList').bind('scroll', () => {
      const h = $('#tableList').height(); // div可视区域的高度
      const sh = $('#tableList')[0].scrollHeight; // 滚动的高度，$(this)指代jQuery对象，而$(this)[0]指代的是dom节点
      const st = $('#tableList')[0].scrollTop; // 滚动条的高度，即滚动条的当前位置到div顶部的距离
      if (h + st >= sh) {
        if (this.isLoadComplete) {
          this.isLoadComplete = false;
          if (this.dbData.length < this.pageCount) {
            this.pageIndex++;
            if (this.isOriginal === 'true') {
              this.getTableData();
            } else {
              this.getMultiTableInfo();
            }
          }
        }


      }
    });
  }

  /**
   * 开关字段设置
   */
  public settingData() {
    this.isOpenSetting = !this.isOpenSetting;
    if (this.isOpenSetting) {
      this.getTableFields();
    }
  }

  /**
   * 双击重命名
   * @param e 当前元素
   */
  public dblClick(e) {
    $(e.target).css('visibility', 'hidden').next('.name').show().focus();
    this.currFieldName = $(e.target).html();
  }

  /**
   * 重命名调用后台方法
   */
  public rename(e, fieldInfo: DataTable.TableFiled) {
    let obj: any;
    obj = $(e.target);
    if (!Utils.strIsEmptyOrNull(fieldInfo.remarkName)) {
      if (fieldInfo.remarkName !== this.currFieldName) {
        if (this.tooltipService.checkFormat(fieldInfo.remarkName)) {
          this.wsSer.fieldReName(fieldInfo.fieldId, fieldInfo.remarkName).subscribe({
            next: (val) => {
              if (val.code === 0) {
                LogHelper.log('data-analysis worksheet', 'data-preview rename()info,状态:' + val.data);
              } else {
                this.tooltipService.showMsg(val.message);
              }
            },
            error: (err) => {
              LogHelper.error('data-analysis worksheet', 'data-preview rename()error,原因:' + JSON.stringify(err));
            },
            complete: () => {
              $(e.target).hide().prev('.name').css('visibility', 'visible');
            }
          });
        } else {
          obj.focus();
        }
      } else {
        $(e.target).hide().prev('.name').css('visibility', 'visible');
      }
    } else {
      this.tooltipService.showMsg('名称不可以为空');
      obj.focus();
    }
  }

  /**
   * 获取字段列表
   */
  public getTableFields() {
    this.wsSer.getFields(this.dbTableId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dateFields = val.data.TimeVal;
          this.textFields = val.data.TextVal;
          this.valueFields = val.data.NumVal;
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'data-preview getTableFields()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 获取数据表的字段和数据
   */
  public getTableData() {
    this.wsSer.getTableData(this.dbTableId, this.pageIndex, this.defSer.pageSize, this.isDB, this.dbTableName).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.pageCount = val.pageCount;
          if (val.data.fileName !== null && val.data.fileName !== undefined) {
            this.dbFields = val.data.fileName;
            this.dbFieldsHtml = this.dbFields.filter(d => d.isDisplay === true);
            this.dbData = this.dbData.concat(val.data.tableData);
            this.isLoadComplete = true;
          }
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'data-preview getTableData()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 查看多表关联数据
   */
  public getMultiTableInfo() {
    this.wsSer.getMultiTableInfo(this.dbTableId, this.pageIndex, this.defSer.pageSize).subscribe({
      next: (val) => {
        if (val.code === 0 && val.data.tableData !== null && val.data.tableData !== undefined) {
          if (val.data.tableData.fileName) {
            this.dbFields = val.data.tableData.fileName; // 关联表数据字段
            this.dbFieldsHtml = this.dbFields.filter(d => d.isDisplay === true);
          }
          this.dbData = this.dbData.concat(val.data.tableData.tableData); // 关联表数据
          this.pageCount = val.pageCount;
          this.isLoadComplete = true;
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'data-preview getMultiTableInfo()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 修改字段显示或隐藏
   * @param field 字段实体
   */
  public updateIsDisplay(field: DataTable.TableFiled) {
    if (field.isDisplay) {
      this.dbFields.push(field);
    } else {
      const index = this.dbFields.findIndex(d => d.fieldId === field.fieldId);
      this.dbFields.splice(index, 1);
    }
    this.dbFieldsHtml = this.dbFields.filter(d => d.isDisplay === true);
    this.wsSer.updateIsDisplay(field.fieldId, field.isDisplay).subscribe({
      next: (val) => {
        if (val.code === 0) {
          LogHelper.log('data-analysis worksheet', 'data-preview updateIsDisplay()info,结果:' + val.data);
        } else {
          LogHelper.log('data-analysis worksheet', 'data-preview updateIsDisplay()error,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'data-preview updateIsDisplay()error,原因:' + JSON.stringify(err));
      }
    });
  }
}
