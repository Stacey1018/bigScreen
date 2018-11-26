
/**
 *  数据类型枚举
 */
export enum DataTypeEnum {
  Echarts = 0, // 图表
  Map = 1,    // 地图
  Media = 2,   // 媒体
  Text = 3,     // 文本
  Other = 4, // 其他
  Material = 5, // 素材
  ChinaMap = 100, // 中国地图
  WorldMap = 102, // 世界地图
  SphericalMap = 101, // 3D球形地图
  Image = 200,         // 图片
  PollingImage = 201,  //  轮播图片
  HistoryVideo = 202,  // 视频片段
  RealVideo = 203,      // 实时视频
  Title = 300,       // 标题
  PollingData = 301,  // 轮播列表
  singleData = 302, // 单行文本跑马灯
  multipleData = 303, // 多行文本翻滚
  ScrollTopData = 304, // 多行文本翻滚
  Timer = 400, // 时间器
  Draw = 401, // 翻牌
  Background = 500,  // 背景
  Border = 501,       // 边框
  Decorate = 502,       // 装饰
}
