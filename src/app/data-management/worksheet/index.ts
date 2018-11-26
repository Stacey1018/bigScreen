import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortablejsModule } from 'angular-sortablejs';
import { WorkSheetRoutingModule } from './worksheet-routing.module';
import { WorkSheetListComponent } from './worksheet-list';
import { DataPreviewComponent } from './data-preview';
import { MultiTableLinkComponent } from './multi-table-link';
import { WorkSheetService } from '../../services/dataAnalysis/workSheet.service';
import { WorkSheetAddDialogComponent } from './worksheet-add-dialog';
import { SharedModule } from '../../share/shared.module';
import { ChartAddComponent } from './chart-add';
import { FilterDialogComponent } from './filter-dialog';
import { ShareModule } from '../../share';
import { TableDetailDialogComponent } from './table-detail-dialog';
import { TableLinkDialogComponent } from './table-link-dialog';
import { DataSourceModule } from '../data-source';
import { LeaveMultiTableLinkGuard } from '../../services/router/leaveMultiTableLink.guard';
import { SelectWorksheetDialogComponent } from './select-worksheet-dialog';
import { ThemeConfigService } from '../../services/screenDeploy/themeConfig.service';

@NgModule({
  imports: [
    CommonModule,
    WorkSheetRoutingModule,
    SharedModule,
    ShareModule,
    DataSourceModule,
    SortablejsModule.forRoot({ animation: 150 })
  ],
  declarations: [
    WorkSheetListComponent,
    DataPreviewComponent,
    MultiTableLinkComponent,
    WorkSheetAddDialogComponent,
    ChartAddComponent,
    FilterDialogComponent,
    TableDetailDialogComponent,
    TableLinkDialogComponent,
    SelectWorksheetDialogComponent
  ],
  entryComponents: [
    WorkSheetAddDialogComponent,
    FilterDialogComponent,
    TableDetailDialogComponent,
    TableLinkDialogComponent,
    SelectWorksheetDialogComponent
  ],
  providers: [WorkSheetService, ThemeConfigService, LeaveMultiTableLinkGuard]
})
export class WorkSheetModule { }
