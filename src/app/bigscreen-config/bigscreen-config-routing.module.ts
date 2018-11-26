import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard/bigScreen/front', pathMatch: 'full' },
  {
    path: '',
    children: [
      {
        path: 'backSetting',
        loadChildren: 'app/bigscreen-config/back-setting#BackSettingModule',
      },
      {
        path: 'front',
        loadChildren: 'app/bigscreen-config/front#FrontModule',
        // data: { module: 'FrontModule', reuse: true } // 路由状态保持
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BigScreenConfigRoutingModule { }
