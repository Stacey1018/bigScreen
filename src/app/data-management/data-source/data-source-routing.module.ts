import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DataSourceListComponent } from './data-source-list';
import { DataSourceTypeComponent } from './data-source-type';
import { DataBaseLinkDeployComponent } from './database-link-deploy';
import { LeaveDataBaseLinkDeployGuard } from '../../services/router/leaveDataBaseLinkDeploy.guard';
import { ExcelImportComponent } from './excel-import';

const routes: Routes = [
  {
    path: '',
    component: DataSourceListComponent,
  },
  {
    path: 'dataSourceList',
    component: DataSourceListComponent,
  },
  {
    path: 'dataSourceType',
    component: DataSourceTypeComponent,
  },
  {
    path: 'dataBaseDeploy',
    component: DataBaseLinkDeployComponent,
    canDeactivate: [LeaveDataBaseLinkDeployGuard]
  },
  {
    path: 'excelImport',
    component: ExcelImportComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataSourceRoutingModule { }
