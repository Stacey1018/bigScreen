import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutIframeRoutingModule } from './layout-iframe-routing.module';
import { LayoutIframeComponent } from './layout-iframe';
import { ChartInteractService } from '../services/scene/chartInteract.service';
import { PagetransitionService } from '../services/scene/pagetransition.service';
import { DataMethodService } from '../services/scene/dataMethod.service';
import { SceneMethodService } from '../services/scene/sceneMethod.service';
import { SceneSourceService } from '../services/scene/sceneSource.service';
import { ComponentModule } from '../bigscreen-config/front/components';

@NgModule({
  imports: [
    CommonModule,
    ComponentModule,
    LayoutIframeRoutingModule
  ],
  declarations: [
    LayoutIframeComponent
  ],
  providers: [ChartInteractService, PagetransitionService,
    DataMethodService, SceneMethodService, SceneSourceService]
})
export class LayoutIframeModule { }
