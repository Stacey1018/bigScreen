import { TableDetailDialogComponent } from './../table-detail-dialog/index';
import { Utils } from './../../../utils/utils';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { EventPubSub } from '../../../common/eventPubSub';
import { MessageCodeEnum } from '../../../common/messageCodeEnum';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTable } from '../../../domain/dataDeploy/dataTable';
import { WorkSheetService } from '../../../services/dataAnalysis/workSheet.service';
import { MatDialog } from '@angular/material';
import swal from 'sweetalert2';
import { LogHelper } from '../../../common/LogHelper';
import { TableLinkDialogComponent } from '../table-link-dialog';
import { DefConfigService } from '../../../services/defConfig.service';
import { TooltipService } from '../../../services/tooltip.service';
@Component({
  selector: 'app-multi-table-link',
  templateUrl: './multi-table-link.component.html',
  styleUrls: ['./multi-table-link.component.scss']
})
export class MultiTableLinkComponent implements OnInit, AfterViewInit, OnDestroy {

  public dbTableId: string; // 工作表主键
  private isOriginal: string; // 是否是原始表
  private pkTableId: string; // 主表主键
  public pkTableName: string; // 主表显示名称
  public dragTables = []; // 关联表数组(页面展示关联图使用)
  private dbFields: DataTable.TableFiled[] = new Array<DataTable.TableFiled>(); // 数据表字段数组(ts逻辑处理使用)
  public dbFieldsHtml: DataTable.TableFiled[] = new Array<DataTable.TableFiled>(); // 数据表字段数组(页面展示)
  public dbData: any[] = new Array<any>(); // 数据表数据
  public isOpenSetting = false; // 字段设置收起展开
  public multiTableSave: DataTable.MultiTableSave = new DataTable.MultiTableSave(); // 多表关联数据查询/保存实体
  public dtLink; // 关联表
  public fields: DataTable.FieldInfo[] = new Array<DataTable.FieldInfo>(); // 多表关联字段设置
  public pageIndex = 1;
  public pageCount = 0; // 数据总条数
  public isChangeData = false; // 标识该页面数据是否发生改变
  private isLoadComplete = true;
  constructor(private route: ActivatedRoute, private router: Router, private wsSer: WorkSheetService,
    private tooltipService: TooltipService, private dialog: MatDialog, private defSer: DefConfigService) {
    this.subscribe();
    // 路由切换时获取参数
    route.queryParams.subscribe(params => {
      this.pkTableId = params['pkTableId'] === undefined ? '' : params['pkTableId'];
      this.pkTableName = params['pkTableName'] === undefined ? '' : params['pkTableName'];
      this.dbTableId = params['dbTableId'] === undefined ? '' : params['dbTableId'];
      this.isOriginal = params['isOriginal'] === undefined ? '' : params['isOriginal'];
      this.pageIndex = 1;
      if (this.isOriginal === 'false') { // 添加的关联表
        this.getMultiTableInfo();
      } else { // 原始工作表
        this.getTableDataInfo(this.pkTableId);
      }
    });
    this.multiTableSave.dataKeys = [];
    this.multiTableSave.workTableName = '';
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
            if (this.isOriginal === 'false') { // 添加的关联表
              this.getMultiTableInfo();
            } else { // 原始工作表
              if (this.multiTableSave.dataKeys.length) {
                this.getMultiTableData(false); // 有外键表
              } else {
                this.getTableDataInfo(this.pkTableId); // 只有主表
              }
            }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    EventPubSub.instance.unsubscribe(MessageCodeEnum.dragDBTable, this.drawGraph);
    EventPubSub.instance.unsubscribe(MessageCodeEnum.dtFields, this.getData);
    EventPubSub.instance.unsubscribe(MessageCodeEnum.saveChange, this.saveDialog);
    EventPubSub.instance.unsubscribe(MessageCodeEnum.cancelChange, this.btnEmpty);
  }

  public subscribe() {
    EventPubSub.instance.subscribeEx(MessageCodeEnum.dragDBTable, this.drawGraph, this);
    EventPubSub.instance.subscribeEx(MessageCodeEnum.dtFields, this.getData, this);
    EventPubSub.instance.subscribeEx(MessageCodeEnum.saveChange, this.saveDialog, this);
    EventPubSub.instance.subscribeEx(MessageCodeEnum.cancelChange, this.btnEmpty, this);
  }

  public getData(data: any, params: any) {
    const _selfThis = params[0];
    _selfThis.pageIndex = 1; // 关联图发生变化时重置pageIndex
    const info = JSON.parse(data);
    if (_selfThis.dbTableId === _selfThis.pkTableId) { // 新增多表关联
      _selfThis.multiTableSave.dbId = info.dbId;
      _selfThis.multiTableSave.pageNum = _selfThis.pageIndex;
      _selfThis.multiTableSave.pageSize = _selfThis.defSer.pageSize;
    }
    const index = _selfThis.multiTableSave.dataKeys.findIndex(d => d.fkTableId === info.dataKey.fkTableId);
    if (index >= 0) {
      _selfThis.multiTableSave.dataKeys.splice(index, 1);
    }
    _selfThis.multiTableSave.dataKeys.push(info.dataKey);
    _selfThis.getMultiTableData();
  }

  /**
   * 单表点击多表关联获取数据
   */
  public getTableDataInfo(dbTableId: string) {
    this.wsSer.getTableDataInfo(dbTableId, this.pageIndex, this.defSer.pageSize).subscribe({
      next: (val) => {
        if (val.code === 0) {
          if (val.data.idDtoList && val.data.tableData.fileName) {
            this.fields = val.data.idDtoList; // 关联表字段设置数组
            this.dbFields = val.data.tableData.fileName; // 关联表数据字段
            this.dbFieldsHtml = this.dbFields.filter(d => d.isDisplay === true);
            if (this.pageIndex === 1) {
              this.dbData = [];
            }
            this.dbData = this.dbData.concat(val.data.tableData.tableData); // 关联表数据
            this.pageCount = val.pageCount; // 数据总条数
            // 判断全选按钮的显示状态
            for (const key in this.fields) {
              if (this.fields.hasOwnProperty(key)) {
                const dtFields = this.fields[key].dataFields;
                const dtCheckedFields = dtFields.filter(d => d.isDisplay === true);
                if (dtFields.length === dtCheckedFields.length) {
                  this.fields[key].isCheckedAll = true;
                } else {
                  this.fields[key].isCheckedAll = false;
                }
              }
            }
            this.isLoadComplete = true;
          }
        }
      }
    });
  }

  /**
   * 编辑查看信息
   */
  public getMultiTableInfo() {
    this.wsSer.getMultiTableInfo(this.dbTableId, this.pageIndex, this.defSer.pageSize).subscribe({
      next: (val) => {
        if (val.code === 0 && val.data !== null) {
          this.fields = val.data.idDtoList; // 关联表字段设置数组
          this.dbFields = val.data.tableData.fileName; // 关联表数据字段
          this.dbFieldsHtml = this.dbFields.filter(d => d.isDisplay === true);
          if (this.pageIndex === 1) {
            this.dbData = [];
          }
          this.dbData = this.dbData.concat(val.data.tableData.tableData); // 关联表数据
          const dataKeys = val.data.dataKeys; // 关联表关系数组
          this.pageCount = val.pageCount; // 数据总条数
          this.pkTableName = dataKeys[0].pkTableName; // 主表名称
          this.multiTableSave.dataKeys = val.data.dataKeys; // 关联表数组
          this.multiTableSave.dbId = val.data.dbId; // 数据库主键
          this.multiTableSave.workTableName = val.data.workTableName; // 创建的多表关联工作表名称
          this.multiTableSave.pageNum = this.pageIndex;
          this.multiTableSave.pageSize = this.defSer.pageSize;
          // 判断全选按钮的显示状态
          for (const key in this.fields) {
            if (this.fields.hasOwnProperty(key)) {
              const dtFields = this.fields[key].dataFields;
              const dtCheckedFields = dtFields.filter(d => d.isDisplay === true);
              if (dtFields.length === dtCheckedFields.length) {
                this.fields[key].isCheckedAll = true;
              } else {
                this.fields[key].isCheckedAll = false;
              }
            }
          }
          if (this.pageIndex === 1) { // 分页查询时只有首次加载时绘制关联图
            for (const key in dataKeys) {
              if (dataKeys.hasOwnProperty(key)) {
                const dt = {
                  dtId: dataKeys[key].fkTableId,
                  dtName: dataKeys[key].fkTableName
                };
                this.dragTables.push(dt);
                EventPubSub.instance.publish(MessageCodeEnum.getMultiTable, dataKeys);
              }
            }
          }
          this.isLoadComplete = true;
        } else {
          LogHelper.log('data-analysis worksheet', 'multi-table-link getMultiTableInfo()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'multi-table-link getMultiTableInfo()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 获取字段列表
   */
  public getTableFields() {
    const param: string[] = new Array<string>();
    param.push(this.dtLink.dtId);
    this.wsSer.getFiles(param).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.fields = this.fields.concat(val.data);
          // 判断全选按钮的显示状态
          for (const key in this.fields) {
            if (this.fields.hasOwnProperty(key)) {
              const dtFields = this.fields[key].dataFields;
              const dtCheckedFields = dtFields.filter(d => d.isDisplay === true);
              if (dtFields.length === dtCheckedFields.length) {
                this.fields[key].isCheckedAll = true;
              } else {
                this.fields[key].isCheckedAll = false;
              }
            }
          }
        } else {
          LogHelper.log('data-analysis worksheet', 'multi-table-link getTableFields()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'multi-table-link getTableFields()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 绘制关联关系
   * @param data 关联表
   * @param params this参数
   */
  public drawGraph(data: any, params: any) {
    const _selfThis = params[0];
    const index = _selfThis.dragTables.findIndex(d => d.dtId === data.dtId);
    if (index < 0) {
      _selfThis.dragTables.push(data);
    }
    _selfThis.dtLink = data;
    _selfThis.isChangeData = true;
  }

  /**
   * 删除关联关系表
   * @param item 关联表
   */
  public deleteGraph(item) {
    this.pageIndex = 1; // 关联图发生变化时重置pageIndex
    const delIndex = this.dragTables.findIndex(d => d.dtId === item.dtId);
    if (delIndex >= 0) {
      this.dragTables.splice(delIndex, 1);
      EventPubSub.instance.publish(MessageCodeEnum.deleteGraph, item.dtId);
    }
    const index = this.multiTableSave.dataKeys.findIndex(t => t.fkTableId === item.dtId);
    this.multiTableSave.dataKeys.splice(index, 1); // 改变关联表数组值
    const arrIndex = this.fields.findIndex(d => d.tableId === item.dtId);
    // 改变字段设置数组值
    if (arrIndex >= 0) {
      for (let i = 0; i < this.fields[arrIndex].dataFields.length; i++) {
        this.fields[arrIndex].dataFields.splice(i--, 1);
      }
      this.fields.splice(arrIndex, 1);
    }
    if (this.multiTableSave.dataKeys.length) {
      this.getMultiTableData(false); // 有外键表
    } else {
      this.getTableDataInfo(this.pkTableId); // 只有主表
    }
    if (this.isOriginal === 'false') { // 添加的关联表
      this.isChangeData = true;
    } else { // 原始工作表
      if (this.multiTableSave.dataKeys.length) {
        this.isChangeData = true; // 有外键表
      } else {
        this.isChangeData = false; // 只有主表
      }
    }
  }

  /**
   * 编辑关联关系
   * @param item 关联表
   */
  public editGraph(item) {
    const param = { dtId: item.dtId, dtName: item.dtName };
    const dataKeys = this.multiTableSave.dataKeys.filter(d => d.fkTableId === item.dtId);
    this.dialog.open(TableLinkDialogComponent, {
      width: '600px',
      height: '300px',
      disableClose: true,
      data: {
        param: param, pkTableId: this.pkTableId, pkTableName: this.pkTableName,
        dbId: this.multiTableSave.dbId, dataKeys: dataKeys[0]
      }
    });
  }

  /**
   * 字段设置
   */
  public settingField() {
    this.isOpenSetting = !this.isOpenSetting;
  }

  /**
   * 设置字段的显示和隐藏
   * @param field 字段实体
   */
  public changeField(field: DataTable.TableFiled) {
    // 改变全选按钮的状态
    const dt = this.fields.filter(d => d.tableId === field.tableId); // 字段所在的表实体
    const dtIndex = this.fields.findIndex(d => d.tableId === field.tableId); // 字段所在的表数组索引
    const dtChecked = dt[0].dataFields.filter(d => d.isDisplay === field.isDisplay); // 筛选字段所在的表中当前状态的数组
    if (field.isDisplay) {
      if (dt[0].dataFields.length === dtChecked.length) {
        this.fields[dtIndex].isCheckedAll = field.isDisplay;
      }
    } else {
      if (dt[0].dataFields.length !== dtChecked.length) {
        this.fields[dtIndex].isCheckedAll = field.isDisplay;
      }
    }
    // 改变当前操作字段的状态
    const index = this.dbFields.findIndex(d => d.fieldId === field.fieldId);
    if (index >= 0) {
      this.dbFields[index].isDisplay = field.isDisplay;
    }
    this.dbFieldsHtml = this.dbFields.filter(d => d.isDisplay === true);
  }

  /**
   * 全选
   * @param item 实体参数
   */
  public checkAll(item: DataTable.FieldInfo) {
    // 改变字段设置的状态
    for (const key in item.dataFields) {
      if (item.dataFields.hasOwnProperty(key)) {
        if (item.isCheckedAll) {
          item.dataFields[key].isDisplay = true;
        } else {
          item.dataFields[key].isDisplay = false;
        }
      }
    }
    // 改变表格的字段状态
    for (const key in this.dbFields) {
      if (this.dbFields.hasOwnProperty(key)) {
        if (this.dbFields[key].tableId === item.tableId) {
          if (item.isCheckedAll) {
            this.dbFields[key].isDisplay = true;
          } else {
            this.dbFields[key].isDisplay = false;
          }
        }
      }
    }
    this.dbFieldsHtml = this.dbFields.filter(d => d.isDisplay === true);
  }

  /**
   * 重命名
   */
  public rename(e) {
    $(e.target).hide();
    let obj: any;
    obj = $(e.target).prev('.name');
    obj.addClass('editStatus');
    obj.focus();
    $(obj).blur(() => {
      $(e.target).show();
      obj.removeClass('editStatus');
    });
  }

  /**
   * 验证字段名称是否输入重复
   * @param field 字段实体
   */
  public checkNameIsExist(field: DataTable.TableFiled, index: number) {
    if (this.tooltipService.checkFormat(field.remarkName)) {
      const dataFields = this.fields.filter(t => t.tableId === field.tableId)[0].dataFields;
      for (const key in dataFields) {
        if (dataFields.hasOwnProperty(key)) {
          if (parseInt(key, 0) !== index) {
            if (dataFields[key].remarkName === field.remarkName) {
              this.tooltipService.showMsg('字段名称不能重复');
              return;
            }
          }
        }
      }
    }
  }

  /**
   * 取消(清空)
   */
  public btnEmpty(data: any, params: any) {
    const _selfThis = params[0];
    if (_selfThis.isChangeData) {
      if (_selfThis.isOriginal === 'false') { // 编辑
        _selfThis.pageIndex = 1;
        _selfThis.dragTables = [];
        _selfThis.getMultiTableInfo();
        EventPubSub.instance.publish(MessageCodeEnum.getMultiTable, _selfThis.dragTables);
      } else { // 新增
        _selfThis.dragTables = [];
        _selfThis.getTableDataInfo(_selfThis.dbTableId);
        EventPubSub.instance.publish(MessageCodeEnum.deleteLinkTable, '');
      }
    }
    _selfThis.isChangeData = false;
  }

  /**
   * 保存图表
   */
  public saveDialog(data: any, params: any) {
    const _selfThis = params[0];
    swal({
      title: '保存',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入工作表名称',
      inputValue: _selfThis.multiTableSave.workTableName,
      inputAttributes: { maxlength: '25' },
      confirmButtonColor: _selfThis.defSer.swalConfirmButtonColor,
      cancelButtonClass: 'cancelButtonClass',
      showCloseButton: true,
      padding: 0,
      width: '400px',
      inputValidator: (value) => {
        return new Promise((resolve, reject) => {
          if (value) {
            const reg = /^[\w\u4e00-\u9fa5]+$/;
            if (!reg.test(value)) {
              swal.showValidationError('只允许输入中文、字母、数字、下划线！');
              swal.enableInput();
              swal.enableButtons();
            } else {
              _selfThis.multiTableSave.workTableName = value;
              _selfThis.saveMultiTable((val) => {
                if (val.code === 0) {
                  resolve();
                } else {
                  swal.showValidationError(val.message);
                  swal.enableInput();
                  swal.enableButtons();
                }
              });
            }
          } else {
            swal.showValidationError('请输入图表名称');
            swal.enableInput();
            swal.enableButtons();
          }
        });
      }
    }).then((result) => { });
  }

  /**
   * 保存图表调用后台接口方法
   */
  public saveMultiTable(callback: any) {
    if (this.dbTableId !== this.pkTableId) {
      this.multiTableSave.tableId = this.dbTableId; // 编辑
    }
    this.multiTableSave.dataFields = [];
    for (const key in this.fields) {
      if (this.fields.hasOwnProperty(key)) {
        this.multiTableSave.dataFields = this.multiTableSave.dataFields.concat(this.fields[key].dataFields);
      }
    }
    this.wsSer.saveMultiTable(this.multiTableSave).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('保存成功');
          EventPubSub.instance.publish(MessageCodeEnum.saveMultiTable, val.data);
          this.isChangeData = false;
        }
        callback(val);
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'multi-table-link saveMultiTable()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 获取表格数据
   */
  public getMultiTableData(isInit: boolean = true) {
    this.multiTableSave.pageNum = this.pageIndex;
    this.wsSer.getMultiTableData(this.multiTableSave).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dbFields = val.data.fileName;
          this.dbFieldsHtml = this.dbFields.filter(d => d.isDisplay === true);
          if (this.pageIndex === 1) {
            this.dbData = [];
          }
          this.dbData = this.dbData.concat(val.data.tableData);
          this.pageCount = val.pageCount; // 数据总条数
          this.isLoadComplete = true;
        } else {
          LogHelper.log('data-analysis worksheet', 'multi-table-link getMultiTableData()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'multi-table-link getMultiTableData()error,原因:' + JSON.stringify(err));
      },
      complete: () => {
        if (isInit) {
          this.getTableFields();
        }
      }
    });
  }
}
