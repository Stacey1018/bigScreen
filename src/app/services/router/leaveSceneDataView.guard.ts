import { CanDeactivate } from '@angular/router';
import { FrontDataViewComponent } from '../../bigscreen-config/front/front-data-view/index';

export class LeaveSceneDataViewGuard implements CanDeactivate<FrontDataViewComponent> {

  // FrontDataViewComponent 表示保护的组件，可以拿到当前的组件
  canDeactivate(component: FrontDataViewComponent) {
    if (component.isDataChange) {
      const isExit = window.confirm('您当前操作未保存，是否离开此页面？');
      return isExit;
    } else {
      return true;
    }
  }
}
