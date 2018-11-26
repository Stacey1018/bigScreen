import { Injectable } from '@angular/core';
import * as $ from 'jquery';
import { Scene } from '../../domain/scene/scene';
import { DragDataParam } from '../../domain/scene/dragDataParam';
import { ChartInteractService } from './chartInteract.service';

@Injectable()
export class DataMethodService {

  public dataFloderArray: Scene.DataSourceItem[] = []; // 数据源中的文件夹列表
  public dataArray: Scene.DataSourceItem[] = []; // 数据源根目录下的数据列表
  public dataSource = []; // 数据列表 用于前台页面去判断当前拖拽的数据项
  public dragParam: DragDataParam = new DragDataParam(); // 拖拽数据参数
  public dataFileArray: Scene.DataSourceItem[] = []; // 获取不搜索数据源中的文件夹
  public itemDatas = []; // 窗口数据
  public dataSourceList = []; // 搜索出来的数据或跟目录下的数据
  public currArr = []; // 用于判断ischecked
  public pageCount: number; // 数据总条数
  constructor(private chartSer: ChartInteractService) {

  }

  /**
   * 设置拖拽参数
   * @param dataSourceId 拖拽窗口主键标识
   * @param dragLeft 拖拽元素相对于canvas的位置
   * @param dragTop 拖拽元素相对于canvas的位置
   */
  public setDragDataParam(dataSourceId: string, dragLeft: any, dragTop: any) {
    this.dragParam.dataSourceId = dataSourceId;
    this.dragParam.dragLeft = dragLeft;
    this.dragParam.dragTop = dragTop;
  }

  /**
   * 点击场景时弹出框内容
   * @param operateBox 当前操作列表数据项
   * @param id 当前操作项主键标识
   */
  public setOperateBox(operateBox, id): void {
    $('.operate-container').hide();
    let offtop = $('#' + id).offset().top + 25;
    const bodyHeight = $('body').height();
    const boxHeight = operateBox.innerHeight();
    if ((boxHeight + offtop) > bodyHeight) {
      offtop = offtop - 25 - boxHeight;
      operateBox.css({
        'top': offtop,
        'left': 115,
        'background-position': '115px ' + (boxHeight - 4) + 'px'
      }).addClass('top');
    } else {
      operateBox.attr('style', '');
      operateBox.css({ 'top': offtop, 'left': 115 }).removeClass('top');
    }
    operateBox.show();
  }

}
