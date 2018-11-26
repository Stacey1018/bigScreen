import { CanDeactivate } from '@angular/router';
import { SqlCreateTableComponent } from '../../data-analysis/sql-create-table/sql-create-table';

export class LeaveSqlCreateTableGuard implements CanDeactivate<SqlCreateTableComponent> {

  // SqlCreateTableComponent 表示保护的组件，可以拿到当前的组件
  canDeactivate(component: SqlCreateTableComponent) {
    if (component.isChangeData) {
      const isExit = window.confirm('您当前操作未保存，是否离开此页面？');
      return isExit;
    } else {
      return true;
    }
  }
}
