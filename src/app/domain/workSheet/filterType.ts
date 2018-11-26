export namespace FilterType {

  export enum ConditionType {
    Null,
    Contain,
    NotContain,
    Equal,
    NotEqual,
    MoreThan,
    LessThan,
    MoreThanOrEqual,
    LessThanOrEqual,
    ValueInterval,
    NotNull
  }

  export enum DimensionType {
    Accurate, // 精确筛选
    Condition // 条件筛选
  }

  export enum Range {
    All, // 包含所有条件
    Any // 包含任一条件
  }

  export enum ChartType {
    line,                           // 折线图
    curve,                          // 曲线图
    lineArea,                       // 折线面积图
    curveArea,                      // 曲线线面积图
    lineStack,                      // 折线堆叠
    curveStack,                     // 曲线堆叠
    lineAreaStack,                  // 折线面积堆叠
    curveAreaStack,                 // 曲线面积堆叠
    bar,                            // 纵向柱状图
    barCrosswise,                   // 横向柱状图
    barStack,                       // 纵向柱状堆叠
    barCrosswiseStack,              // 横向柱状堆叠
    pie,                            // 饼图
    cycle,                          // 环图
    scatter,                        // 散点图
    effectScatter,                  // 带有涟漪特效动画的散点
    radar,                          // 雷达图
    tree,                           // 树图
    treeMap,                        // 层级数据
    sunburst,                       // 旭日图
    boxPlot,                        // 箱形图
    candlestick,                    // K线图
    heatMap,                        // 热力图
    map,                            // 地图
    parallel,                       // 平行坐标系的系列
    lines,                          // 线图
    graph,                          // 关系图
    sanKey,                         // 桑基图
    funnel,                         // 漏斗图
    gauge,                          // 仪表盘
    pictorialBar,                   // 象形柱图
    themeRiver,                     // 主题河流
    custom,                         // 自定义系列
    ///////////////////////////////////////////
    bar3D,                           // 三维柱状图
    table                           // 表格
  }
}
