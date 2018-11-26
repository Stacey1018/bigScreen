export namespace ScreenConnect {

  /// <summary>
  /// 保存大屏连接实体
  /// </summary>
  export class SaveRender {
    /// <summary>
    /// 渲染机信息
    /// </summary>
    public itemList: Array<RenderView> = [];

    /// <summary>
    /// 分辨率X
    /// </summary>
    public resolutionX: number;

    /// <summary>
    /// 分辨率Y
    /// </summary>
    public resolutionY: number;

    /// <summary>
    /// 编辑  true,添加  false
    /// </summary>
    public isUpdate: boolean;
  }

  /**
   * 渲染机实体
   */
  export class RenderView {
    /// <summary>
    /// 渲染机ID
    /// </summary>
    public renderId: string;

    /// <summary>
    /// 渲染机IP
    /// </summary>
    public renderIp: string;

    /// <summary>
    /// 渲染机输出名称
    /// </summary>
    public renderName: string;

    /// <summary>
    /// 渲染机端口
    /// </summary>
    public renderPort: string;

    /// <summary>
    /// 渲染机输出卡编号
    /// </summary>
    public sequenceNum: number;
  }

}
