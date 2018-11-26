import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RunNumberDirective } from './runNumber.directive';

/**
 *  滚动条模块
 */
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    RunNumberDirective
  ],
  exports: [
    RunNumberDirective
  ]
})
export class RunNumberModule { }
