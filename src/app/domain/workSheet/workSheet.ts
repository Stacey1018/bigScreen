import { DataTable } from '../dataDeploy/dataTable';

export namespace WorkSheet {

  /**
   * 工作表展示实体
   */
  export class WorkSheetView {
    public hostId: string; // 连接实例主键
    public dbId: string; // 数据库主键
    public dbName: string; // 数据库名称
    public remarkName: string; // 备注名称
    public isDB: number; // 数据源类型
    public dataTables: DataTable.DataTableView[]; // 数据表list
    public isShow: boolean; // 二级菜单是否展示
  }

  /**
   * 工作表详情
   */
  export class WorkSheetInfo {
    public tableId: string; // 表主键
    public tableName: string; // 表名称
    public remarkName: string; // 备注名称
    public dbId: string; // 数据库主键
    public fileds: DataTable.TableFiled[]; // 字段
  }
}
