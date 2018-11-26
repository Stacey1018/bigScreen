import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScreenThemeUploadComponent } from './screen-theme-upload/index';
import { ScreenThemeHomeComponent } from './screen-theme-home/index';

const routes: Routes = [
  {
    path: '', redirectTo: '/dashboard/bigScreen/backSetting/screenTheme/screenThemeUpload', pathMatch: 'full'
  },
  {
    path: '',
    component: ScreenThemeHomeComponent,
    children: [
      {
        path: '',
        component: ScreenThemeUploadComponent
      },
      {
        path: 'screenThemeUpload',
        component: ScreenThemeUploadComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScreenThemeRoutingModule { }
