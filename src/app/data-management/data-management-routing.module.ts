import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '', redirectTo: '/dashboard/dataManagement/dataSource', pathMatch: 'full'
  },
  {
    path: '',
    children: [
      {
        path: 'workSheet',
        loadChildren: 'app/data-management/worksheet#WorkSheetModule',
      },
      {
        path: 'dataSource',
        loadChildren: 'app/data-management/data-source#DataSourceModule',
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataManagementRoutingModule { }
