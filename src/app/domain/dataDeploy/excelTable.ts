import { DataTable } from './dataTable';

export namespace ExcelTable {
  export class ExcelTableView {
    public path: string; // 文件路径
    public hostId: string; // 文件夹主键标识
    public dbId: string; // 文件主键标识
    public dataSheet: Array<DataTable.DataTableView>; // excel表数组
  }
}
