import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '', redirectTo: '/dashboard/dataAnalysis/sqlCreateTable', pathMatch: 'full'
  },
  {
    path: '',
    children: [
      {
        path: 'sqlCreateTable',
        loadChildren: 'app/data-analysis/sql-create-table#SqlCreateTableModule',
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataAnalysisRoutingModule { }
