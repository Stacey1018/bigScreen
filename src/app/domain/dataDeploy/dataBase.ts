import { DataTable } from './dataTable';

export namespace DataBase {

  /**
   * 展示数据库列表
   */
  export class DBView {
    public hostId: string; // 数据库链接主键
    public dbId: string; // 数据库主键
    public dbName: string; // 数据库名称
    public remarkName: string; // 数据库名称
    public isDisplay: boolean; // 是否被选中
    public isDB: number; // 0是excel,1是数据库,2是教育,3是表单
  }

  /**
   * 数据库配置保存实体信息
   */
  export class DBDeployForm {
    public hostId: string; // 数据库链接主键
    public dbs: DBView; // 数据库
    public dbTables: DataTable.DataTableView[]; // 数据表数组
  }
}

