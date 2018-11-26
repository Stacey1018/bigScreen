import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackSettingHomeComponent } from './back-setting-home';
import { BackSettingRoutingModule } from './back-setting-routing.module';
import { ThemeConfigService } from '../../services/screenDeploy/themeConfig.service';

@NgModule({
  imports: [
    CommonModule,
    BackSettingRoutingModule
  ],
  declarations: [
    BackSettingHomeComponent
  ],
  providers: [ThemeConfigService]
})
export class BackSettingModule { }
