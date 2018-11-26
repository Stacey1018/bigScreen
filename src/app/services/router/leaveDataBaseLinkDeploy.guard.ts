import { CanDeactivate } from '@angular/router';
import { DataBaseLinkDeployComponent } from '../../data-management/data-source/database-link-deploy';

export class LeaveDataBaseLinkDeployGuard implements CanDeactivate<DataBaseLinkDeployComponent> {

  // DataBaseLinkDeployComponent 表示保护的组件，可以拿到当前的组件
  canDeactivate(component: DataBaseLinkDeployComponent) {
    if (component.isChangeData) {
      const isExit = window.confirm('您当前操作未保存，是否离开此页面？');
      return isExit;
    } else {
      return true;
    }
  }
}
