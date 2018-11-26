import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreenConnectRoutingModule } from './screen-connect-routing.module';
import { ScreenConnectHomeComponent } from './screen-connect-home';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../share/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ScreenConnectRoutingModule,
  ],
  declarations: [
    ScreenConnectHomeComponent
  ]
})
export class ScreenConnectModule { }
