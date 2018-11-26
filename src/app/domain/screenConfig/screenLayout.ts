import { GridsterConfigS } from 'angular-gridster2/dist/gridsterConfigS.interface';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';

export namespace ScreenLayout {

  /**
   * 布局列表单项数据实体
   */
  export class LayoutModel {
    public options: GridsterConfigS;
    public optionsBorder?: GridsterConfigS;
    public dashboard: Array<GridsterItem>;
    public dashboardBorder?: Array<GridsterItem>;
  }
}

