import { ChartSourceService } from './chartSource.service';
import { Injectable } from '@angular/core';
import { Chart } from '../../domain/workSheet/chart';
import { LogHelper } from '../../common/LogHelper';
import { TooltipService } from '../tooltip.service';

@Injectable({
  providedIn: 'root'
})
export class ChartMethodService {

  public chartArray: Chart.ChartView[] = []; // 根目录下的图表
  public chartFloderArray: Chart.ChartView[] = []; // 文件夹及其目录下的图表
  public dataSource: Chart.ChartView[] = []; // 用于拖拽时判断
  public options; // 展示option
  public defaultChartFileName = 1; // 新建图表名称
  public newChartfloder: Chart.NewChartFloder = new Chart.NewChartFloder(); // 新建文件夹
  constructor(public tooltipService: TooltipService, private csService: ChartSourceService) { }

  /**
   * 获取图表列表
   * @param id 文件夹id
   * @param searchName 文件夹名称，用于条件搜索
   */
  public getChartList(searchName: string, id: string): void {
    this.csService.getChartList(searchName, id).subscribe({
      next: (val) => {
        if (val.code === 0) {
          // 一级目录
          if (id === '') {
            this.chartArray = [];
            this.chartFloderArray = [];
            this.dataSource = [];
            const datas = val.data as Chart.ChartView[];
            for (let i = 0; i < datas.length; i++) {
              if (!datas[i].isData) {  // 文件夹
                this.chartFloderArray.push(datas[i]);
              } else { // 根目录下的数据项
                this.chartArray.push(datas[i]);
                this.dataSource.push(datas[i]);
              }
            }
          } else {
            // 二级目录
            // 判断在哪一个一级目录下
            if (val.data.length > 0) {
              for (let i = 0; i < this.chartFloderArray.length; i++) {
                // 将二级目录数据放到对应的以及目录的list中
                if (this.chartFloderArray[i].chartId === val.data[0].parentId) {
                  this.chartFloderArray[i].list = val.data;
                  if (this.chartFloderArray[i].list !== null) {
                    this.chartFloderArray[i].list.forEach(ele => {
                      if (ele.isData) {
                        this.dataSource.push(ele);
                      }
                    });
                  }
                }
              }
            }
          }
        }
      },
      error: (err) => {
        LogHelper.error('services panel', 'chartMethod getChartList()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 重命名图表
   * @param name 新名称
   * @param id 图表主键标识
   */
  public updateChartName(name: string, id: string) {
    this.csService.updataChartName(name, id).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('重命名' + name + '成功');
        } else {
          this.tooltipService.showMsg(val.message);
        }
        this.getChartList('', '');
      },
      error: (err) => {
        LogHelper.error('services panel', 'chartMethod updateChartName()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 删除图表
   * @param id 要删除的文件夹或图表id
   * @param name 要删除的名称
   */
  public deleteChart(id: string, name?: string) {
    this.csService.deleteChart(id).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('删除成功');
          this.getChartList('', '');
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('services panel', 'chartMethod deleteChart()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 新建图表文件夹
   */
  public addFile() {
    const defaultname = '新建文件夹' + this.defaultChartFileName;
    const newArray: Chart.ChartView[] = [];
    newArray.push({
      chartId: '',
      chartName: defaultname,
      isData: false,
      list: [],
      sqlInfo: '',
      parentId: '',
      dbId: '',
      tableId: '',
      chartType: null,
      params: [],
      isSelected: false,
      isNewAdd: true,
      showList: false
    });
    this.chartFloderArray = newArray.concat(this.chartFloderArray);
    setTimeout(() => {
      const obj = $('.datafile .newName').eq(0);
      // 设置新建文件的样式
      obj.addClass('editStatus');
      obj.focus();
      obj.keyup(() => {
        this.tooltipService.checkFormat($(event.target).val());
      });
      // 设置失去焦点时的样式
      obj.blur((event) => {
        const filename = '新建文件夹' + this.defaultChartFileName;
        const name = $(event.target).val();
        // 判断文件夹名称是否使用默认
        if (name === filename) {
          this.defaultChartFileName++;
        }
        // 调用新建文件夹接口
        if (name !== '') {
          if (this.tooltipService.checkFormat(name)) {
            this.addChartFile(name);
          } else {
            $(event.target).focus();
          }
        } else {
          this.tooltipService.showMsg('名称不可以为空');
          $(event.target).focus();
        }
      });
    }, 100);
  }

  /**
   * 保存文件夹
   * @param name 新建文件夹名称
   */
  public addChartFile(name: string) {
    this.newChartfloder.chartId = '';
    this.newChartfloder.chartName = name;
    this.newChartfloder.createUserId = '';
    this.newChartfloder.updateUserId = '';
    this.csService.addChartFile(this.newChartfloder).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('新建文件夹成功');
        } else {
          this.tooltipService.showMsg(val.message);
        }
        this.getChartList('', '');
      },
      error: (err) => {
        LogHelper.error('services panel', 'chartMethod addChartFile()error,原因:' + JSON.stringify(err));
      }
    });
  }
}
