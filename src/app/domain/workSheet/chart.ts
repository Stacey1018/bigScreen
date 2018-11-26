import { FilterType } from './filterType';

export namespace Chart {

  /**
   * 图表类型
   */
  export class ChartType {
    public typeId: string; // 图表主键
    public typeName: string; // 图表类型名称
    public remark: string; // 备注
    public code: number; // 类型code
    public icon: string; // 图表Url
    public iconName: string; // 图表英文名称
    public axisType: number; // 1是轴线图,0是饼图(环图、雷达图)
    public combinationType: number; // 可组合的图形:1是,0 不是
  }

  /**
   * 拖拽生成图表实体
   */
  export class OptionCondition {
    public category: number; // 0是excel生成图表,1是sql建表,2是教育相关,3是拖拽生成的图表
    public chartName: string; // 图表名称
    public dbId: string; // 数据库主键
    public tableId: string; // 数据表主键
    public chartType: FilterType.ChartType; // 图表类型
    public colorThemeId: string; // 颜色主题主键
    public filters: Array<Filter>; // 字段筛选数组
    public chartConditions: Array<ChartCondition>; // 维度/度量字段数组
    public thumb: string; // 缩略图
    public option: object; // 数据option
    public min: number; // 是否设置数值最小值,默认自动
    public max: number; // 是否设置数值最大值,默认自动
    public unitName: number; // 数值设置单位
    public yAxisName: string; // Y轴标题
  }

  /**
   * 筛选
   */
  export class Filter {
    public fieldId: string; // 字段主键
    public colName: string; // 字段名称
    public isDimensions: number; // 1是维度,0是度量
    public filterType: number; // 维度精确筛选(0)或条件筛选(1)
    public fieldValue: Array<FilterView>; // 维度精确筛选字段值数组
    public conditionRange: number; // 维度条件范围(包含所有条件(0)或包含某一条件(1))
    public conditions: Array<ConditionItemFilter>; // 维度筛选条件数组
    public condition: FilterType.ConditionType; // 度量条件(包含、大于等等这些枚举)
    public conditionValue: string; // 度量数值范围
    public startTime: string; // 开始日期
    public endTime: string; // 结束日期
  }

  /**
   * 拖拽生成图表条件实体
   */
  export class ChartCondition {
    public fieldId: string; // 字段主键
    public colName: string; // 字段名称
    public remarkName: string; // 显示名称
    public isDimensions: number; // 1是维度,0是度量
    public orderType: OrderType; // 排序
    public mathRule: MathRule; // 计算规则
    public dateRule: DateRule; // 日期取值规则
    public chartType: number; // 度量显示图表类型
  }

  /**
   * 日期取值规则
   */
  export enum DateRule {
    null,
    year, // 年
    month, // 月
    day, // 日
    hour, // 时
    minute, // 分
    second // 秒
  }

  /**
   * 排序方式
   */
  export enum OrderType {
    null, // 默认值
    asc, // 升序
    desc // 降序
  }

  /**
   * 计算规则
   */
  export enum MathRule {
    null, // 默认值
    sum, // 求和
    avg, // 平均值
    count, // 计数
    max, // 最大值
    min, // 最小值
    percentage // 百分比
  }


  export class FilterView {
    public isChecked: boolean; // 是否是选中
    public value: string; // 字段值
  }

  /**
   * 条件单项范围值
   */
  export class ConditionItemFilter {
    public condition: FilterType.ConditionType; // 条件
    public value: string; // 字段值
  }

  /**
   * 保存图表实体
   */
  export class ChartSave {
    public chartId: string; // 图表或文件夹id
    public chartName: string; // 图表名称
    public sqlInfo: string; // sql语句
    public dbId: string; // 数据库ID
    public tableId: string; // 工作表ID
    public chartType: FilterType.ChartType; // 图表类型
    public params: FiledInfo[]; // 字段信息
    public thumb?: string; // 缩略图
  }

  /**
   * 图表列表返回实体
   */
  export class ChartView {
    public chartId: string; // 图表或文件夹id
    public chartName: string; // 图表名称
    public isData: boolean; // 标识是图表还是文件夹
    public list: ChartView[]; // 文件夹下的数据
    public sqlInfo: string; // sql语句
    public parentId: string; // 文件夹Id
    public dbId: string; // 数据库ID
    public tableId: string; // 工作表ID
    public chartType: FilterType.ChartType; // 图表类型
    public params: FiledInfo[]; // 字段信息
    public isSelected: boolean; // 默认选中的文件夹
    public isNewAdd?: boolean;
    public thumb?: string; // 缩略图
    public showList: boolean; // 显示文件夹下的文件
    public option?: object; // 数据的option
  }

  export class FiledInfo {
    public filedName: string;
    public isDimension: boolean;
    public isLegend: boolean;
    public isXAxis: boolean;
    public isYAxis: boolean;
  }

  export class ChartOption {
    public dbId: string; // 库ID
    public sqlInfo: string; // sql语句
    public chartType: string; // 图表类型
    public params: FiledInfo[]; // 字段信息
  }

  /**
   * 新建文件夹
   */
  export class NewChartFloder {
    public chartId: string;
    public chartName: string;
    public createUserId: string;
    public updateUserId: string;
  }

}
