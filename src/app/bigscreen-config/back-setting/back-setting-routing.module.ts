import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BackSettingHomeComponent } from './back-setting-home';

const routes: Routes = [
  {
    path: '', redirectTo: '/dashboard/bigScreen/backSetting/screenConnect', pathMatch: 'full'
  },
  {
    path: '',
    component: BackSettingHomeComponent,
    children: [
      {
        path: 'screenTheme',
        loadChildren: 'app/bigscreen-config/back-setting/screen-theme#ScreenThemeModule',
      },
      {
        path: 'screenConnect',
        loadChildren: 'app/bigscreen-config/back-setting/screen-connect#ScreenConnectModule',
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackSettingRoutingModule { }
