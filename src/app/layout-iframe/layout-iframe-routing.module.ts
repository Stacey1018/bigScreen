import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutIframeComponent } from './layout-iframe/index';

const routes: Routes = [
  {
    path: '',
    component: LayoutIframeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutIframeRoutingModule { }

