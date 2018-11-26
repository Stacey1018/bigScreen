import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortablejsModule } from 'angular-sortablejs';
import { GridsterModule } from 'angular-gridster2';
import { FrontDataViewComponent } from './front-data-view';
import { FrontDataSourceComponent } from './front-data-source';
import { FrontRoutingModule } from './front-routing.module';
import { DataMethodService } from './../../services/scene/dataMethod.service';
import { SharedModule } from '../../share/shared.module';
import { SceneMethodService } from '../../services/scene/sceneMethod.service';
import { SceneSourceService } from '../../services/scene/sceneSource.service';
import { PagetransitionService } from './../../services/scene/pagetransition.service';
import { ChartInteractService } from '../../services/scene/chartInteract.service';
import { PollingMethodService } from '../../services/scene/pollingMethod.service';
import { FrontSceneListComponent } from './front-scene-list';
import { FrontSceneViewComponent } from './front-scene-view';
import { ThemeConfigService } from '../../services/screenDeploy/themeConfig.service';
import { FrontSceneMoveDialogComponent } from './front-scene-move-dialog';
import { DragModule } from '../../share/drag/drag.module';
import { FrontScenePollingDialogComponent } from './front-scene-polling-dialog';
import { ColorPickerModule } from 'ngx-color-picker';
import { TextSettingComponent } from './setting/text-setting';
import { PageSettingComponent } from './setting/page-setting';
import { EchartsSettingComponent } from './setting/echarts-setting';
import { ImageSettingComponent } from './setting/image-setting';
import { RealVideoSettingComponent } from './setting/real-video-setting';
import { PollingDataSettingComponent } from './setting/polling-data-setting';
import { PollingImageSettingComponent } from './setting/polling-image-setting';
import { FileUploadModule } from 'ng2-file-upload';
import { VideoSettingComponent } from './setting/video-setting';
import { TimerSettingComponent } from './setting/timer-setting';
import { RangeSliderModule } from '../../share/rangeSlider/rangeSlider.module';
import { ComponentModule } from './components';
import { DrawSettingComponent } from './setting/draw-setting';
import { SingleDataSettingComponent } from './setting/single-data-setting/index';
import { MultipleDataSettingComponent } from './setting/multiple-data-setting/index';
import { ScrollTopSettingComponent } from './setting/scroll-top-setting/index';
import { LeaveSceneDataViewGuard } from '../../services/router/leaveSceneDataView.guard';
@NgModule({
  imports: [
    CommonModule,
    FrontRoutingModule,
    SharedModule,
    GridsterModule,
    DragModule,
    FileUploadModule,
    ColorPickerModule,
    RangeSliderModule,
    ComponentModule,
    SortablejsModule.forRoot({ animation: 150 })
  ],
  declarations: [
    FrontDataSourceComponent,
    FrontDataViewComponent,
    FrontSceneListComponent,
    FrontSceneViewComponent,
    FrontSceneMoveDialogComponent,
    FrontScenePollingDialogComponent,
    TextSettingComponent,
    PageSettingComponent,
    EchartsSettingComponent,
    ImageSettingComponent,
    PollingDataSettingComponent,
    PollingImageSettingComponent,
    RealVideoSettingComponent,
    VideoSettingComponent,
    RealVideoSettingComponent,
    TimerSettingComponent,
    DrawSettingComponent,
    SingleDataSettingComponent,
    MultipleDataSettingComponent,
    ScrollTopSettingComponent
  ],
  entryComponents: [
    FrontSceneMoveDialogComponent,
    FrontScenePollingDialogComponent
  ],
  providers: [DataMethodService, SceneMethodService, ThemeConfigService, SceneSourceService,
    ChartInteractService, PollingMethodService, PagetransitionService, LeaveSceneDataViewGuard]
})
export class FrontModule { }
