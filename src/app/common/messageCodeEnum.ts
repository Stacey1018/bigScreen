export enum MessageCodeEnum {
    /**
     * 大屏和配置 1000——1049
     * 数据分析 1050——1099
     * 仪表盘 1100——1149
     */
    /**大屏和配置 */

    // 拖拽数据
    dragData = 1001,
    // 移动场景至某个文件夹时新建文件夹之后同步更新左侧列表
    addSceneFolder = 1002,
    // iframe页面展示
    isLayout = 1003,
    // 实时交互开关
    isInteract = 1004,
    // 轮巡是取消切换
    cancelChangeScene = 1005,

    /**
     * 数据分析
     */
    // 数据表预览
    dataTable = 1050,
    // 数据库配置弹框关闭
    dialogClose = 1051,
    // 数据库实例重命名
    dbRename = 1052,
    // echarts图表Option
    dataOption = 1053,
    // 编辑数据库表配置
    editDBDeploy = 1054,
    // 工作表数据库、数据表重命名
    workTableRename = 1055,
    // 拖拽数据表创建关联关系
    dragDBTable = 1056,
    // 删除拖拽的某个关联表
    deleteGraph = 1057,
    // 多表关联字段和数据
    dtFields = 1058,
    // 多表关联保存
    saveMultiTable = 1059,
    // 查看多表关联关系图
    getMultiTable = 1060,
    // 多表关联取消本次操作
    cancelChange = 1061,
    // 多表关联保存本次操作
    saveChange = 1062,
    // 多表关联取消之后删除关联关系
    deleteLinkTable = 1063,
    gotoMultiTableLinkComponent = 1064,

    /**
     * 看板
     */
    // 切换看板
    changePanel = 1100,
    // 看板重命名
    renamePanel = 1101,
    // 新建仪表盘后刷新右侧页面
    refreshPanel = 1102,
    // 拖拽数据到看板
    dragToPanel = 1103,
    // 新增仪表盘时展开左侧图表列表
    newPanel = 1104,
    // 重命名图表
    renameChart = 1105,
    // 删除看板
    deletePanel = 1106,
    // 切换图表
    changeChart = 1107,
    // 添加缩略图后刷新左侧列表
    thumb = 1109,
    // 看板是否改变
    isChange = 1110,
    // 编辑看板时左侧图表可拖拽
    editPanel = 1111,
    // 保存后设置布局为不可拖拽的
    afterSave = 1112,
    // 删除数据项时从chart数组中移除
    removeChart = 1113,
    // 初始化高亮显示
    hightLight = 1114,
}
