import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './../../share/shared.module';
import { DataSourceListComponent } from './data-source-list';
import { DataBaseLinkDeployComponent } from './database-link-deploy';
import { DataSourceTypeComponent } from './data-source-type';
import { DataSourceRoutingModule } from './data-source-routing.module';
import { DataTableDeployDialogComponent } from './data-table-deploy-dialog';
import { DataDeployService } from '../../services/dataAnalysis/dataDeploy.service';
import { ShareModule } from '../../share';
import { AddDataSourseNavComponent } from './add-data-sourse-nav';
import { LeaveDataBaseLinkDeployGuard } from '../../services/router/leaveDataBaseLinkDeploy.guard';
import { ExcelImportComponent } from './excel-import';
import { FileUploadModule } from 'ng2-file-upload';
import { ImportDialogComponent } from './import-dialog';

@NgModule({
  imports: [
    CommonModule,
    DataSourceRoutingModule,
    FileUploadModule,
    FormsModule,
    SharedModule,
    ShareModule,
  ],
  providers: [DataDeployService, LeaveDataBaseLinkDeployGuard],
  declarations: [
    DataSourceListComponent,
    DataSourceTypeComponent,
    DataBaseLinkDeployComponent,
    DataTableDeployDialogComponent,
    AddDataSourseNavComponent,
    ExcelImportComponent,
    ImportDialogComponent
  ],
  entryComponents: [
    DataTableDeployDialogComponent,
    ImportDialogComponent
  ],
  exports: [
    DataTableDeployDialogComponent
  ]
})
export class DataSourceModule { }
