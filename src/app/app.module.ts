import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found';
import { AuthGuardService } from './services/router/auth.guard.service';
import { AppSettingService } from './services/appsetting.service';
import { ApiSettingService } from './services/apisetting.service';
import { PanelModule } from './panel';
import { ScreenConfigService } from './services/screenDeploy/screenConfig.service';
import { DefConfigService } from './services/defConfig.service';
import { TooltipService } from './services/tooltip.service';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    HttpModule,
    HttpClientModule,
    PanelModule,
    FormsModule
  ],
  providers: [
    TooltipService,
    ScreenConfigService,
    AuthGuardService,
    AppSettingService,
    ApiSettingService,
    DefConfigService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
