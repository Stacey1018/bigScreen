import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterModule } from 'angular-gridster2';
import { FormsModule } from '@angular/forms';
import { DataDeployService } from '../services/dataAnalysis/dataDeploy.service';
import { DataBaseDeployComponent } from './database-deploy';
import { MatDialogModule } from '@angular/material';
import { SharedModule } from './shared.module';
import { ChartFolderDialogComponent } from './chart-folder-dialog';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    GridsterModule,
    MatDialogModule,
    SharedModule
  ],
  exports: [
    DataBaseDeployComponent,
    ChartFolderDialogComponent
  ],
  declarations: [
    DataBaseDeployComponent,
    ChartFolderDialogComponent
  ],
  entryComponents: [ChartFolderDialogComponent],
  providers: [DataDeployService]
})
export class ShareModule { }

