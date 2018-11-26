import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RangeSliderDirective } from './rangeSlider.directive';

/**
 *  滑块模块
 */
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    RangeSliderDirective
  ],
  exports: [
    RangeSliderDirective
  ]
})
export class RangeSliderModule { }
