import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { ScreenTheme } from '../../../../domain/screenConfig/screenTheme';
import { Scene } from '../../../../domain/scene/scene';

@Component({
  selector: 'app-echarts-setting',
  templateUrl: './echarts-setting.component.html',
  styleUrls: ['../../../../../assets/css/componentSetting.scss', './echarts-setting.component.scss']
})
export class EchartsSettingComponent implements OnInit, OnChanges {
  @Input() echartData: Scene.ResourceView; // 数据项实体
  @Input() dataBoxId: string; // div元素Id
  @Output() changeEchartData = new EventEmitter<ScreenTheme.ResourceItem>();
  public option: any; // 数据option
  private a_show = true;
  private b_show = true;
  private value = 'persent'; // 以上三个变量用来控制饼图label标签显示方式(写页面时再修改)
  constructor() {
  }

  ngOnInit() {
    // this.option = this.echartData.resourceInfo;
  }

  ngOnChanges(): void {
    this.option = this.echartData.resourceInfo;
  console.log(this.echartData.timeLength);
    // this.echartData.updateTime = 0;
  }

  /**
   * 提交修改的option
   */
  public changeOption(): void {
    const item: ScreenTheme.ResourceItem = new ScreenTheme.ResourceItem();
    item.itemData = this.echartData;
    item.itemData.resourceInfo = this.option;
    item.itemData.timeLength = this.echartData.timeLength;
    item.id = this.dataBoxId;
    this.changeEchartData.emit(item);
  }

  /**
   * 重新设置option
   */
  public setOptionItem() {
    this.changeOption();
  }


  /**
   * 颜色渐变
   * @param obj 
   * @param color 
   */
  public setChangeColor(obj, color) {
    obj.colorStops[1].color = color;
    this.changeOption();
  }

  /**
    * 设置y轴最大标签
    */
  public setYLimit(value, obj, type) {
    if (value === 'null') {
      if (type === 'max') {
        obj.max = null;
      } else {
        obj.min = null;
      }
    }
    this.changeOption();
  }

  /**
  * 饼图lable formart
  * @param obj 
  */
  public lableFormart(obj) {
    const category = '{a|{b}}';  // 类目
    const value = '{b|{c}}';  // 数值
    const persent = '{b|{d}%}';  // 百分比
    let formart = '';
    if (this.a_show) {
      formart += category;
    };
    if (this.b_show && !this.a_show) {
      if (this.value === 'persent') {
        formart = persent;
      } else {
        formart = value;
      }
    }
    if (this.a_show && this.b_show) {
      if (this.value === 'value') {
        formart += '\n' + value;
      } else {
        formart += '\n' + persent;
      }
    }
    obj.formatter = formart;
    this.changeOption();
  }

}
