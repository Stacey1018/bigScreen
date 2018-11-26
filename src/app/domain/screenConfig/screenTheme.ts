import { Scene } from '../scene/scene';

export namespace ScreenTheme {

  /**
   * 后台主题配置上传的图片实体信息
   */
  export class ThemeItem {
    // 主键Id
    resourcesId: string;
    // 图片名称
    resourcesName: string;
    // 图片资源Url
    resourcesUrl: string;
    // 图片类型
    resourcesType: any;
  }

  /**
   * 前端页面传输数据实体信息
   */
  export class ResourceItem {
    // 主键Id
    id: string;
    // top
    dragTop: number;
    // left
    dragLeft: number;
    // 边框实体
    itemData: Scene.ResourceView;
  }
}





