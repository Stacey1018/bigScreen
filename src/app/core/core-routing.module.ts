import { DashboardComponent } from './dashboard/index';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard/panel', pathMatch: 'full' },
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'bigScreen',
        loadChildren: 'app/bigscreen-config#BigScreenConfigModule',
      },
      {
        path: 'dataManagement',
        loadChildren: 'app/data-management#DataManagementModule',
      },
      {
        path: 'dataAnalysis',
        loadChildren: 'app/data-analysis#DataAnalysisModule',
      },
      {
        path: 'panel',
        loadChildren: 'app/panel#PanelModule',
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoreRoutingModule { }
