import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DragDirective } from './drag.directive';

/**
 *  滚动条模块
 */
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DragDirective
  ],
  exports: [
    DragDirective
  ]
})
export class DragModule { }
