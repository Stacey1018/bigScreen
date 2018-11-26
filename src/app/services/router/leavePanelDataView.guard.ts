import { CanDeactivate } from '@angular/router';
import { PanelDataViewComponent } from '../../panel/panel-data-view';

export class LeavePanelDataViewGuard implements CanDeactivate<PanelDataViewComponent> {

  // PanelDataViewComponent 表示保护的组件，可以拿到当前的组件
  canDeactivate(component: PanelDataViewComponent) {
    if (component.isDataChange) {
      const isExit = window.confirm('您当前操作未保存，是否离开此页面？');
      return isExit;
    } else {
      return true;
    }
  }
}
