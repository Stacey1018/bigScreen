import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoPluginComponent } from './video-plugin';
import { TimerComponent } from './timer';
import { TextComponent } from './text';
import { SphericalMapComponent } from './spherical-map';
import { BasedMapComponent } from './based-map';
import { DrawComponent } from './draw';
import { PollingDataComponent } from './polling-data';
import { RunNumberModule } from '../../../share/runNumber/runNumber.module';
import { PollingImageComponent } from './polling-image/index';
import { SingleDataComponent } from './single-data/index';
import { MultipleDataComponent } from './multiple-data/index';
import { ScrollTopComponent } from './scroll-top/index';
@NgModule({
  imports: [
    CommonModule,
    RunNumberModule
  ],
  declarations: [
    TextComponent,
    SphericalMapComponent,
    BasedMapComponent,
    VideoPluginComponent,
    TimerComponent,
    DrawComponent,
    PollingImageComponent,
    PollingDataComponent,
    SingleDataComponent,
    MultipleDataComponent,
    ScrollTopComponent
  ],
  exports: [
    TextComponent,
    SphericalMapComponent,
    BasedMapComponent,
    VideoPluginComponent,
    TimerComponent,
    DrawComponent,
    PollingImageComponent,
    PollingDataComponent,
    SingleDataComponent,
    MultipleDataComponent,
    ScrollTopComponent
  ],
  providers: []
})
export class ComponentModule { }
