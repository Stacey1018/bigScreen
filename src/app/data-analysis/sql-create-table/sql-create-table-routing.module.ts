import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SqlCreateTableComponent } from './sql-create-table';
import { LeaveSqlCreateTableGuard } from '../../services/router/leaveSqlCreateTable.guard';

const routes: Routes = [
  {
    path: '',
    component: SqlCreateTableComponent,
    canDeactivate: [LeaveSqlCreateTableGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SqlCreateTableRoutingModule { }
