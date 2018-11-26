import { CanDeactivate } from '@angular/router';
import { EventPubSub } from '../../common/eventPubSub';
import { MessageCodeEnum } from '../../common/messageCodeEnum';
import { MultiTableLinkComponent } from '../../data-management/worksheet/multi-table-link';

export class LeaveMultiTableLinkGuard implements CanDeactivate<MultiTableLinkComponent> {

  // MultiTableLinkComponent 表示保护的组件，可以拿到当前的组件
  canDeactivate(component: MultiTableLinkComponent) {
    if (component.isChangeData) {
      const isExit = window.confirm('您当前操作未保存，是否离开此页面？');
      if (isExit) {
        EventPubSub.instance.publish(MessageCodeEnum.cancelChange, '');
      } else {
        EventPubSub.instance.publish(MessageCodeEnum.gotoMultiTableLinkComponent, false);
      }
      return isExit;
    } else {
      return true;
    }
  }
}
