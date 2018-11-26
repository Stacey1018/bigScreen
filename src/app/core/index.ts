import { CoreRoutingModule } from './core-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard';
import { SharedModule } from '../share/shared.module';
import { CommonMethodService } from '../services/scene/commonMethod.service';
import { customerReuseStrategy } from '../utils/customerReuseStrategy.utils';
import { RouteReuseStrategy } from '@angular/router';
import { ScreenConfigService } from '../services/screenDeploy/screenConfig.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CoreRoutingModule
  ],
  declarations: [
    DashboardComponent
  ],
  providers: [
    // { provide: RouteReuseStrategy, useClass: customerReuseStrategy },
    CommonMethodService, ScreenConfigService]
})
export class CoreModule { }
