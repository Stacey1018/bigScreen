import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScreenConnectHomeComponent } from './screen-connect-home';

const routes: Routes = [
  {
    path: '',
    component: ScreenConnectHomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScreenConnectRoutingModule { }
