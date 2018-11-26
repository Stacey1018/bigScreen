import { Chart } from '../workSheet/chart';

export namespace DataTable {
  export class DataTableView {
    public dbId: string; // 数据库主键
    public tableId: string; // 数据表主键
    public tableName: string; // 数据表名称
    public remarkName: string; // 备注名称
    public isDisplay: boolean; // 是否被选中
    public isOriginal: boolean; // 值为true时是原始表，值为false时是用户添加的工作表
    public originalId: string; // 原始表主键
    public originalName: string; // 原始表名称
  }

  /**
   * 字段实体(部分字段改为可空类型兼容Chart.ChartCondition实体类)
   */
  export class TableFiled {
    public fieldId: string; // 字段主键
    public parentId?: string; // 用于日期类型时绑定年月日时分秒
    public tableId?: string; // 表主键
    public colName: string; // 列名称
    public isDimensions: number; // 维度or度量
    public remarkName?: string; // 别名
    public isDisplay?: boolean; // 字段显示或隐藏
    public typeName?: string; // 字段类型
    public mathRule?: Chart.MathRule; // 计算规则
    public orderType?: Chart.OrderType; // 排序
    public iconName?: string; // 用于组合图表时显示图标
  }

  export class DateField {
    public fields: Array<TableFiled>;
    public fieldId: string; // 字段主键
    public parentId?: string; // 用于日期类型时绑定年月日时分秒
    public colName: string; // 列名称
    public remarkName?: string; // 别名
    public isDimensions: number; // 维度or度量
    public isShow: boolean; // 二级目录是否展开
  }

  /**
   * 主表关联表字段
   */
  export class FieldInfo {
    public tableId: string; // 表主键
    public tableName: string; // 表名称
    public dataFields: TableFiled[]; // 字段实体
    public isCheckedAll: boolean; // 字段是否全选
  }

  /**
   * 多表关联实体
   */
  export class MultiTableSave {
    public workTableName: string; // 工作表名称
    public dbId: string; // 数据库名称
    public tableId: string; // 多表主键
    public dataKeys: Array<LinkTable>; // 关联表数组
    public dataFields: Array<TableFiled>; // 字段数组
    public pageNum: number; // 当前显示页码
    public pageSize: number; // 每页显示条数
  }

  export class LinkTable {
    public pkTableId: string; // 主表主键
    public pkTableName: string; // 主表名称
    public pkField: string; // 主表字段主键
    public pkFieldName: string; // 主表字段名称
    public fkTableId: string; // 外键表主键
    public fkTableName: string; // 外键表名称
    public fkField: string; // 外键表字段主键
    public fkFieldName: string; // 外键表字段名称
    public linkType: string; // 连接方式
  }
}
