import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelDataSourceComponent } from './panel-data-source/index';
import { PanelDataViewComponent } from './panel-data-view/index';
import { PanelRoutingModule } from './panel-routing.module';
import { SharedModule } from '../share/shared.module';
import { ShareModule } from '../share/index';
import { SortablejsModule } from 'angular-sortablejs/dist';
import { GridsterModule } from 'angular-gridster2';
import { PanelDataViewDialogComponent } from './panel-data-view-dialog/index';
import { PanelDataSourceDialogComponent } from './panel-data-source-dialog/index';
import { DataMethodService } from '../services/scene/dataMethod.service';
import { SceneMethodService } from '../services/scene/sceneMethod.service';
import { SceneSourceService } from '../services/scene/sceneSource.service';
import { CommonMethodService } from '../services/scene/commonMethod.service';
import { ChartInteractService } from '../services/scene/chartInteract.service';
import { PanelMethodService } from '../services/panel/panelMethod.service';
import { LeavePanelDataViewGuard } from '../services/router/leavePanelDataView.guard';

@NgModule({
  imports: [
    CommonModule,
    ShareModule,
    SharedModule,
    GridsterModule,
    SortablejsModule.forRoot({ animation: 150 }),
    PanelRoutingModule
  ],
  entryComponents: [PanelDataViewDialogComponent, PanelDataSourceDialogComponent],
  declarations: [
    PanelDataSourceComponent,
    PanelDataViewComponent,
    PanelDataViewDialogComponent,
    PanelDataSourceDialogComponent
  ],
  providers: [DataMethodService, SceneMethodService, ChartInteractService, PanelMethodService,
    SceneSourceService, CommonMethodService, LeavePanelDataViewGuard]
})
export class PanelModule { }
