import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SqlCreateTableRoutingModule } from './sql-create-table-routing.module';
import { SqlCreateTableComponent } from './sql-create-table';
import { SharedModule } from '../../share/shared.module';
import { WorkSheetService } from '../../services/dataAnalysis/workSheet.service';
import { DataDeployService } from '../../services/dataAnalysis/dataDeploy.service';
import { DataVisualizeDialogComponent } from './data-visualize-dialog';
import { ThemeConfigService } from '../../services/screenDeploy/themeConfig.service';
import { SaveDialogComponent } from './save-dialog';
import { LeaveSqlCreateTableGuard } from '../../services/router/leaveSqlCreateTable.guard';
import { EduDataViewService } from '../../services/dataAnalysis/eduDataView.service';
import { DynamicFormService } from '../../services/dataAnalysis/dynamicForm.service';

@NgModule({
  imports: [
    CommonModule,
    SqlCreateTableRoutingModule,
    SharedModule
  ],
  declarations: [
    SqlCreateTableComponent,
    DataVisualizeDialogComponent,
    SaveDialogComponent
  ],
  entryComponents: [
    DataVisualizeDialogComponent,
    SaveDialogComponent
  ],
  providers: [WorkSheetService, DataDeployService, EduDataViewService,
    DynamicFormService, ThemeConfigService, LeaveSqlCreateTableGuard]
})
export class SqlCreateTableModule { }
