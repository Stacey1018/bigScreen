import { DataBaseTypeEnum } from '../../common/dataBaseTypeEnum';

export namespace DBHost {

  /**
   * 数据库连接实体
   */
  export class DataBaseLinkForm {
    public ip: string; // ip地址
    public port: string; // 端口号
    public passWord: string; // 密码
    public userName: string; // 用户名
    public remarkName: string; // 数据库连接显示的名称
    public serverName: string; // oracle用
    public isTest: boolean; // 标识是否为测试连接
    public dataBaseType: DataBaseTypeEnum; // 数据库类型
  }

  /**
   * 数据库连接显示
   */
  export class DBHostView {
    public hostId: string; // 数据库连接主键
    public remarkName: string; // 数据库连接名称
    public dataBaseType: DataBaseTypeEnum; // 数据库类型
  }

}
