import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkSheetListComponent } from './worksheet-list';
import { DataPreviewComponent } from './data-preview';
import { MultiTableLinkComponent } from './multi-table-link';
import { ChartAddComponent } from './chart-add';
import { LeaveMultiTableLinkGuard } from '../../services/router/leaveMultiTableLink.guard';

const routes: Routes = [
  {
    path: '',
    component: WorkSheetListComponent,
    children: [
      {
        path: 'dataPreview',
        component: DataPreviewComponent,
      },
      {
        path: 'multiTableLink',
        component: MultiTableLinkComponent,
        // data: { module: 'multiTableLink', reuse: true } // 路由状态保持
        canDeactivate: [LeaveMultiTableLinkGuard]
      }
    ]
  },
  {
    path: 'chartAdd',
    component: ChartAddComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkSheetRoutingModule { }
