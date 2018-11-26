export namespace Panel {
  /**
   * 仪表盘文件夹
   */
  export class Panelfile {
      dashBoardId: string;
      dashBoardName: string;
      boardType: number;
      parentId: string;
      showList: boolean;
      panelList: PanelItem[];
      isNewAdd?: boolean;
      isSelected?: boolean;
  }

  /**
   * 仪表盘
   */
  export class PanelItem {
    dashBoardId: string;
    dashBoardName: string;
    parentId: string; // 看板存放路径，文件夹还是根目录
    boardType: number; // 0文件夹，1文件
  }

  /**
   * 新建仪表盘
   */
  export class PanelSave {
    dashBoardId: string;
    dashBoardName: string;
    boardThemeId: string; // 主题id
    thumb: string; // 缩略图地址
    itemData: LayoutItem[]; // 仪表盘中的窗口
    isChange = 0; // 看板中的数据源是否被改变
    parentId: string;
  }

  /**
   * 仪表盘中的窗口
   */
  export class LayoutItem {
    itemId: string;
    dataSourceId: string;
    dataSourceType: number;
    positionX: number;
    positionY: number;
    sizeRow: number;
    sizeCol: number;
    option?: object;
  }
}
