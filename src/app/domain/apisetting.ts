export class ApiSetting {

  /**
   * 场景
   */
  public saveSceneUrl: string; // 保存/编辑场景接口地址
  public getSceneListUrl: string; // 查询所有的场景的列表接口地址
  public getSceneInfoUrl: string; // 根据场景ID查询单个场景数据信息接口地址
  public deleteSceneUrl: string; // 根据场景ID删除场景接口地址
  public deleteItemDataUrl: string; // 删除场景中窗口数据项接口地址
  public updateSceneColorUrl: string; // 修改场景的颜色主题接口地址
  public setScenePollingUrl: string; // 设置场景轮询接口地址
  public moveSceneToGroupUrl: string; // 移动场景到文件夹接口地址
  public setSceneGroupUrl: string; // 新增场景分组接口地址
  public renameSceneGroupUrl: string; // 修改场景分组名称接口地址
  public getPollingSceneUrl: string; // 获取所有轮询的场景接口地址
  public getSceneFoldersUrl: string; // 只获取场景文件夹接口地址
  public getChartsForSceneUrl: string; // 新建场景时获取图表数据接口地址
  public getMaterialForSceneUrl: string; // 获取资源列表、搜索接口地址
  public getSceneItemDataUrl: string; // 获取场景中单项数据的详细信息

  /**
   * 和大屏交互
   */
  public setChartInteractUrl: string; // 图表交互接口地址
  public sceneApplyUrl: string; // 应用场景接口地址
  public getSceneIframeUrl: string; // 加载iframe页面场景

  /**
   * 后台配置
   */
  public getColorInfoUrl: string; // 根据ID获取一条颜色主题接口地址
  public getColorListUrl: string; // 获取颜色主题列表接口地址
  public uploadUrl: string; // 上传文件接口地址
  public deleteFileUrl: string; // 根据resourceID删除文件接口地址
  public getResourceListUrl: string; // 获取上传图片列表
  /**
   * 数据管理
   */
  public connectHostUrl: string; // 添加数据库链接接口地址
  public getDBListByIdUrl: string; // 链接数据库信息列表接口地址
  public getDBListUrl: string; // 获取连接实例下所有数据库列表接口地址
  public getListByTypeUrl: string; // 获取所有数据源列表（数据库或excel列表）
  public getHostsByIdUrl: string; // 获取连接的详细信息接口地址
  public deleteDBLinkUrl: string; // 删除数据库连接
  public getHostListUrl: string; // 获取已连接过的数据库Host信息接口地址
  public hostReNameUrl: string; // Host重命名接口地址
  public instanceReNameUrl: string; // 实例重命名接口地址
  public getTableListByIdUrl: string; // 获取数据库中的所有表接口地址
  public reNameUrl: string; // 原始表重命名接口地址
  public deleteDBUrl: string; // 删除数据库接口地址
  public setIsDisplayUrl: string; // 配置数据库确定接口地址
  public getTableListUrl: string; // 获取工作表列表接口地址
  public getTableInfoByIdUrl: string; // 获取工作表详细信息接口地址
  public reNameAllUrl: string; // 原始表工作表重命名
  public getFieldsByIdUrl: string; // 获取数据表的所有字段
  public getFilesUrl: string; // 获取主表关联表所有字段
  public getDataListByIdUrl: string; // 获取数据表的数据
  public getMultiTableDataUrl: string; // 获取多表关联数据
  public saveMultiTableUrl: string; // 保存多表关联
  public getMultiTableInfoUrl: string; // 编辑多表关联
  public getTableInfoUrl: string; // 单表点击多表关联获取数据
  public deleteDTUrl: string; // 删除数据表接口地址
  public updateIsDisplayUrl: string; // 修改字段的显示还是隐藏状态
  public fieldReNameUrl: string; // 字段的重命名
  public fieldConvertUrl: string; // 字段维度度量转换接口地址
  public getDataFieldByIdUrl: string; // 获取某个字段的数据接口地址
  public getDataByFieldsUrl: string; // 获取过滤后的数据信息

  /**
   * 数据分析
   */
  public getDataBySqlUrl: string; // 根据sql语句获取数据
  public getChartTypeUrl: string; // 获取所有的图表类型
  public saveChartInfoUrl: string; // 保存sql图表接口地址
  public saveDragChartInfoUrl: string; // 保存拖拽图表接口地址
  public getChartInfoUrl: string; // 编辑查看图表信息
  public getChartDataBySqlUrl: string; // 获取数据的Option
  public getChartOptionUrl: string; // 拖拽获取数据的option
  public getChartDataFilesUrl: string; // 获取数据文件夹列表

  /**
   * 仪表盘
   */
  public createPanelUrl: string; // 创建看板接口地址
  public getPanelsUrl: string; // 获取根目录看板列表或文件夹里看板列表接口地址
  public deletePanelUrl: string; // 删除看板接口地址
  public getPanelFlodersUrl: string; // 获取看板文件夹列表接口地址
  public movePanelUrl: string; // 移动看板到文件夹接口地址
  public savePanelItemUrl: string; // 保存看板数据接口地址
  public getPanelDetailUrl: string; // 获取看板的详细信息
  public removeDataSourceUrl: string; // 资源从看板中删除
  public getChartListUrl: string; // 获取图表数据列表
  public reNameChartUrl: string; // 图表重命名
  public deleteChartUrl: string; // 删除图表
  public moveChartUrl: string; // 移动图表
  public getChartDataUrl: string; // 根据条件获取展示option
  public addChartFloderUrl: string; // 保存图表文件夹
  public getLatestDataUrl: string; // 获取最新的看板数据
  public getDataTypeListUrl: string;  // 数据类型接口

  /**
   * 渲染机配置
   */
  public setRenderInfoUrl: string; // 保存渲染机配置接口地址
  public getRenderUrl: string; // 查看信息接口地址
  public getResolutionUrl: string; // 获取分辨率接口地址

  /**
   * excel上传
   */
  public importExcelUrl: string; // 上传excel
  public getSheetDataUrl: string; // 获取勾选的表格数据
  public getSheetTableDataUrl: string; // 获取单个表格数据

  /**
   *  教育数据相关接口
   */
  public getEduDataListUrl: string;
  public getEduDataBySqlUrl: string;

  /**
   * 读取动态表单生成的数据展示接管接口
   */
  public getMongoDbDataByIdUrl: string; // 根据DBId获取当前库表的列表（mongoDB模板的列表）
  public getTemplateDataUrl: string; // 获取模板的数据
}
