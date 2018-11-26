import { Chart } from '../workSheet/chart';

export namespace DataOption {
  /**
   *  生成option参数实体
   */
  export class SqlData {
    public category: number; // 0是excel生成图表,1是sql生成的信息,2是教育,3是拖拽生成信息
    public chartId: string; // 图表主键
    public parentId: string; // 文件夹主键标识
    public dbId: string; // 数据库主键
    public sqlInfo: string; // sql语句
    public chartType: number; // 图表类型
    public chartName: string; // 图表标题
    public colorThemeId: string; // 颜色主题
    public params: Array<FilterParam>; // 参数
    public option: object; // 数据option
    public thumb: string; // 缩略图
    public tableId: string; // excel生成图表时表主键
    public tableName: string; // 动态表单生成option时使用
    public min: number; // 是否设置数值最小值,默认自动
    public max: number; // 是否设置数值最大值,默认自动
    public unitName: number; // 数值设置单位
    public yAxisName: string; // Y轴标题
  }

  export class FilterParam {
    public fieldName: string; // 字段名
    public isDimension: boolean; // 维度为true,默认值为false
    public isMeasure: boolean; // 度量为true,默认值为false
    public isLegend: boolean; // true:图例显示
    public isXAxis: boolean; // true:x轴显示
    public isYAxis: boolean; // true:y轴显示
    public chartType: number; // 度量展示图形类型
    public iconName: string;
  }
}
