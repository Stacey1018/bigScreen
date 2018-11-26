import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { LeavePanelDataViewGuard } from '../services/router/leavePanelDataView.guard';
import { PanelDataViewComponent } from './panel-data-view';

const panelRoutes: Routes = [
  { path: '', redirectTo: '/dashboard/panel', pathMatch: 'full' },
  {
    path: '',
    component: PanelDataViewComponent,
    canDeactivate: [LeavePanelDataViewGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(panelRoutes)],
  exports: [RouterModule]
})
export class PanelRoutingModule { }
