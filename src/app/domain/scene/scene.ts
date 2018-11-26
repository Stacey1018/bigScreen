import { DataTypeEnum } from '../../common/dataTypeEnum';

export namespace Scene {

  /**
   * 新建场景保存实体
   */
  export class SceneForm {
    public sceneId: string; // 场景主键标识
    public thumbnail: string; // 场景缩略图URL
    public sceneName: string; // 场景名称
    public parentId: string; // 文件夹主键标识
    public itemList: Array<SceneFormItem>; // 资源列表
    public backgroundUrl: Background; // 背景图URL
    public resolutionX: number; // 屏幕宽
    public resolutionY: number; // 屏幕高
  }

  /**
   * 场景中的每项窗口实体
   */
  export class SceneFormItem {
    public itemId: string; // 主键标识
    public sceneId: string; // 场景主键标识
    public sizeRow: number; // 每项数据所占行数/height
    public sizeCol: number; // 每项数据所占列数/width
    public positionY: number; // 每项数据起始点Y坐标值/top
    public positionX: number; // 每项数据起始点X坐标值/left
    public resourceId: string; // 资源主键标识
    public resourceName: string; // 资源名称
    public resourceCode: DataTypeEnum; // 资源大类编码
    public detailCode: DataTypeEnum; // 资源小类编码
    public resourceInfo: string; // 资源信息（边框:图片url,图表：option,视频：视频播放的url,图片：图片的地址等）
    public layerNum: number; // 层级
    public configInfo: Text; // 配置信息
    public timeLength: number; // 数据刷新时间
  }

  /**
   * 场景列表展示实体
   */
  export class SceneView {
    public sceneId: string; // 场景主键标识
    public thumbnail: string; // 缩略图
    public sceneName: string; // 场景名称
    public parentId: string; // 文件夹主键标识
    public sceneType: number; // 1是场景,0是文件夹
    public sceneList: SceneView[]; // 场景数组
    public showList: boolean; // 二级列表是否展开
    public isOpen: boolean; // 是否是最新创建的
    public isPolling?: boolean;
    public pollingTime?: number;
    public pollingType?: number;
    public isNewAdd?: boolean;
  }

  /**
   * 窗口单项信息
   */
  export class LayoutItem {
    itemId: string;
    itemData?: ResourceView;
    sizeCol: number;
    sizeRow: number;
    positionX: number;
    positionY: number;
    zIndex?: number;
  }

  /**
   * 颜色列表
   */
  export class Color {
    themeId: string;
    themeName: string;
    themeJson: string;
  }

  /**
   * 新增数据源部分的列表
   */
  export class DataSourceItem {
    id: string;
    dataSourceType: number;
    name: string;
    dataList: DataListArray[];
    showList: boolean;
    isNewAdd: boolean;
    parentId: string;
    isChecked: boolean;
    itemId?: string; // 窗口主键标识
  }

  /**
    * 数据项
    */
  export class DataListArray {
    id: string;
    dataSourceType: number;
    name: string;
    isChecked: boolean;
  }

  /**
   * 移入的场景参数格式
   */
  export class SceneRemove {
    idList: Array<string>; // 要移动的数据项主键集合
    parentId: string; // 目标文件夹主键
  }

  /**
   * echart图表
   */
  export class Chart {
    public id: string; // 窗口主键
    public obj: any = null; // 数据
  }

  /**
   * 图表交互需要的参数
   */
  export class ChartInteract {
    public id: string; // iframe页面dom元素id
    public data: object; // 图表参数
    public sceneId: string; // 场景主键
  }

  /**
   * 新建场景时数据源列表实体
   */
  export class ResourceView {
    public resourceId: string; // 资源主键
    public resourceName: string; // 资源名称
    public resourceInfo: any; // 资源信息（图表：option，视频：视频播放的url，图片：图片的地址，等）
    public resourceCode: number; // 资源分类
    public detailCode: number; // 图表类型
    public isData?: boolean; // 标识是文件夹还是数据
    public thumb?: string; // 缩略图
    public parentId?: string; // 父Id
    public list?: Array<ResourceView>;
    public showList?: boolean; // 二级列表是否展开
    public configInfo?: Text;
    public timeLength?: number; // 数据实时刷新时间
  }

  export class Text {
    // 文本
    public fontBold?: string; // 字体粗细
    public fontSize?: number; // 字体大小
    public fontFamily?: string; // 字体
    public fontColor?: string; // 字体颜色
    public align?: string; // 对齐方式
    public timeInterval?: number; // 动画间隔
    public speed?: number; // 跑马灯速度 轮播图速度
    // 多行文本向上翻滚
    public lineHeight?: number;
    // public
    // 时间器
    public timerType?: string; // 时间格式
    public iconSize?: number; // 图标大小
    public iconColor?: string; // 图标颜色
    public iconSpacing?: number; // 图标间距
    public isShowIcon?: boolean; // 是否显示图标
    // 翻牌
    public drawVal?: string; // 翻牌展示数据
    public drawTimeInterval?: number; // 翻牌的刷新时间
    public drawBgColor?: string; // 翻牌的背景色
    public drawBorderRadius?: number; // 翻牌的背景圆角
    public imgUrl?: Array<any>; // 轮播图片路径集合
    // 轮播列表
    public sizeRows?: number; // 表格行数
    public tableTitle?: TableTitle; // 表格表头的样式
    public oddBgColor?: string; // 奇数背景
    public evenBgColor?: string; // 偶数背景
    public serialNumber?: SerialNumber; // 序列号样式
    public colsData?: Array<ColsData>; // 自定义列
    public pollingData?: Array<any>; // 轮播数据



  }
  // 轮播列表的自定义列
  export class ColsData {
    public colsName: string; // 列名
    public colsFieldName: string; // 列字段名
    public widthRatio: number; // 列宽占比
    public fontSize: number; // 字体大小
    public fontColor: string; // 字体颜色
    public fontBold: string; // 字体粗细
    public align: string; // 对齐方式
  }

  export class Background {
    public bgColor: string; // 背景颜色
    public bgUrl: string; // 背景图片
  }

  // 轮播列表的表头
  export class TableTitle {
    bgColor: string; // 背景颜色
    fontSize: number; // 字体大小
    fontColor: string; // 字体颜色
    fontBold: string; // 字体粗细
    align: string; // 对齐方式
  }

  // 轮播列表的序列号
  export class SerialNumber {
    bgColor: string; // 背景颜色
    widthRatio: number; // 列宽占比
    radius: number; // 半径
    fontSize: number; // 字体大小
    fontColor: string; // 字体颜色
    fontBold: string; // 字体粗细
  }

}


