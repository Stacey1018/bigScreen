import { MessageCodeEnum } from './../../common/messageCodeEnum';
import { Resizable } from 'angular-gridster2/dist/gridsterConfig.interface';
import { Injectable, OnDestroy } from '@angular/core';
import { PanelSourceService } from './panelSource.service';
import swal from 'sweetalert2';
import { Panel } from '../../domain/panel';
import { Scene } from '../../domain/scene/scene';
import { CommonMethodService } from '../scene/commonMethod.service';
import { DataMethodService } from '../scene/dataMethod.service';
import { EventPubSub } from '../../common/eventPubSub';
import { Utils } from '../../utils/utils';
import { Observable } from 'rxjs/internal/Observable';
import { LogHelper } from '../../common/LogHelper';
import { DataSourceEnum } from '../../common/dataSourceEnum';
import { TooltipService } from '../tooltip.service';
declare var echarts;
declare var html2canvas;
declare var jsPDF;
declare var dark;
@Injectable({
  providedIn: 'root'
})
export class PanelMethodService implements OnDestroy {

  private defaultPanelFileName = 1; // 用户没有使用默认文件夹使用新建文件夹名称的时候
  public pageCount: number; // 数据总条数
  public panelfloderArray: Panel.Panelfile[] = []; // 看板文件夹列表
  public panelArray: Panel.Panelfile[] = []; // 根目录下的看板列表
  public panelInFloderArray: Panel.Panelfile[] = []; // 文件夹下的看板列表
  public display = false; // 用于显示保存页面还是编辑页面
  public flag: boolean; // 没有看板时显示的页面（true：保存）
  public panelName = ''; // 看板名称
  private panelfloderSave: Panel.PanelItem = new Panel.PanelItem(); // 保存看板文件夹
  public newChart: Scene.Chart = new Scene.Chart(); // echart图表
  public chartObj = [];
  constructor(public psSer: PanelSourceService, public tooltipService: TooltipService, public dmSer: DataMethodService,
    public cmSer: CommonMethodService) {
    EventPubSub.instance.subscribeEx(MessageCodeEnum.removeChart, this.removeChart, this); // 订阅删除数据项后从echarts数组中移除
  }

  /**
   * 删除数据项时移除chart实例
   * @param chartId chart主键
   * @param params 订阅参数
   */
  public removeChart(chartId: string, params: any) {
    const _selfThis = params[0];
    const index = _selfThis.chartObj.findIndex(d => chartId === d.id);
    _selfThis.chartObj.splice(index, 1);
  }

  /**
   * 窗口改变时echarts自适应大小
   */
  public resizeItem() {
    setTimeout(() => {
      for (const key in this.chartObj) {
        if (this.chartObj.hasOwnProperty(key)) {
          this.chartObj[key].obj.resize();
        }
      }
    }, 200);
  }

  ngOnDestroy(): void {
  }

  /**
   * 新建仪表盘文件夹
   */
  public addFile(parentId, panelId) {
    const defaltname = '新建文件夹' + this.defaultPanelFileName;
    const newArray: Panel.Panelfile[] = [];
    newArray.push({
      dashBoardId: '',
      boardType: null,
      dashBoardName: defaltname,
      panelList: [],
      showList: false,
      parentId: '',
      isNewAdd: true
    });
    this.panelfloderArray = newArray.concat(this.panelfloderArray);
    setTimeout(() => {
      const obj = $('.scencesfile .newName').eq(0);
      // 设置新建文件的样式
      obj.addClass('editStatus');
      obj.focus();
      obj.keyup(() => {
        this.tooltipService.checkFormat($(event.target).val());
      });
      // 设置失去焦点时的样式
      obj.blur((event) => {
        const filename = '新建文件夹' + this.defaultPanelFileName;
        const name = $(event.target).val();
        // 判断文件夹名称是否使用默认
        if (name === filename) {
          this.defaultPanelFileName++;
        }
        // 调用新建文件夹接口
        if (name !== '') {
          if (this.tooltipService.checkFormat(name)) {
            this.addPanelfile(name, parentId, panelId);
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
   * @param name 文件夹名称
   */
  public addPanelfile(name, parentId, panelId) {
    this.panelfloderSave.dashBoardName = name;
    this.panelfloderSave.boardType = 0;
    this.panelfloderSave.parentId = '';
    this.psSer.savePanel(this.panelfloderSave).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('新建仪表盘文件夹成功');
        } else {
          this.tooltipService.showMsg(val.message);
        }
        // 加载看板文件夹列表
        this.getPanelfiles('', '', parentId, panelId);
      },
      error: (err) => {
        LogHelper.error('services panel', 'panelMethod addPanelfile()error,原因:' + JSON.stringify(err));
      }
    });
  }
  /**
   * 获取看板列表
   * @param parentId 文件夹id
   * @param panelfileName 文件夹名称，用于条件搜索
   * @param ppId 当前展示的看板所在文件夹id
   * @param panelId 当前展示看板id
   */
  public getPanelfiles(parentId: string, panelfileName: string, ppId?: string, panelId?: string): void {
    this.psSer.getPanelfiles(parentId, panelfileName).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.pageCount = val.pageCount;
          // 一级目录
          if (parentId === '') {
            this.panelArray = [];
            this.panelfloderArray = [];
            const datas = val.data as Panel.Panelfile[];
            for (let i = 0; i < datas.length; i++) {
              // 文件夹
              if (datas[i].boardType === DataSourceEnum.folder) {
                this.panelfloderArray.push(datas[i]);
              } else {
                // 根目录下的数据项
                this.panelArray.push(datas[i]);
              }
            }
          } else {
            // 二级目录
            // 判断在哪一个一级目录下
            if (val.data.length > 0) {
              for (let i = 0; i < this.panelfloderArray.length; i++) {
                // 将二级目录数据放到对应的以及目录的list中
                if (this.panelfloderArray[i].dashBoardId === val.data[0].parentId) {
                  this.panelfloderArray[i].panelList = val.data;
                }
                if (this.panelfloderArray[i].dashBoardId === parentId) {
                  this.panelfloderArray[i].showList = true;
                }
              }
            }
          }
          if (ppId) {
            this.getPanelfiles(ppId, '');
          }
        } else {
          LogHelper.log('services panel', 'panelMethod getPanelfiles()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('services panel', 'panelMethod getPanelfiles()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 删除仪表盘
   * @param panelId 当前看板
   * @param callBack
   */
  public deletePanel(panelId: string, panelName: string) {
    this.psSer.deletePanel(panelId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('删除成功');
          // 重新加载看板列表
          this.getPanelfiles('', '');
          EventPubSub.instance.publish(MessageCodeEnum.deletePanel, null);
        } else {
          this.tooltipService.showMsg(val.message);
        }
      }, error: (err) => {
        LogHelper.error('services panel', 'panelMethod deletePanel()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 删除文件夹
   * @param id 当前文件夹id
   */
  public deleteFile(id: string) {
    this.psSer.deletePanel(id).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('删除文件夹成功');
          // 刷新左侧列表
          this.getPanelfiles('', '');
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('services panel', 'panelMethod deleteFile()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 文件夹（文件重命名）
   * @param name 文件夹（文件）的新名字
   * @param id 当前文件夹（文件）主键标识
   */
  public updatePanel(name: string, id: string) {
    this.psSer.updatePanel(name, id).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('重命名' + name + '成功');
        } else {
          this.tooltipService.showMsg(val.message);
        }
        // 刷新列表
        this.getPanelfiles('', '');
      },
      error: (err) => {
        LogHelper.error('services panel', 'panelMethod updatePanel()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 保存看板数据
   * @param panelItems 看板数据
   */
  public saveAddItemToPanel(panelItems: Panel.PanelSave) {
    this.psSer.saveAddItemToPanel(panelItems).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('保存成功');
          this.display = false;
          // 刷新左侧树（显示缩略图）
          EventPubSub.instance.publish(MessageCodeEnum.thumb, panelItems);
          EventPubSub.instance.publish(MessageCodeEnum.afterSave, '');
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('services panel', 'panelMethod saveAddItemToPanel()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 加载数据项
   * @param dataSourceType 数据项类型
   * @param chart echart实例
   * @param option 数据项option
   * @param pageType 页面来源(大屏web、仪表盘、大屏)
   * @param layoutStr 布局字符串
   * @param index 仪表盘初始化时加载数据项索引
   * @param isPositionChange 位置信息是否改变(位置信息改变时chartObj数组已经是当前仪表盘的)
   */
  public loadData(dataSourceType, chart, option, pageType, layoutStr, index, isPositionChange = false): void {
    if (index === 0 && !isPositionChange) {
      this.chartObj = [];
    }
    switch (dataSourceType) {
      // 1.图表
      case DataSourceEnum.chart:
        const singleChart: Scene.Chart = new Scene.Chart();
        singleChart.id = chart.id;
        chart.obj.dispose();
        chart.obj = echarts.init(document.getElementsByClassName(chart.id)[0], 'dark');
        this.cmSer.changeSizeOption(option, pageType, layoutStr).subscribe(val => {
          const newOption = val;
          chart.obj.setOption(newOption);
          singleChart.obj = chart.obj;
          if (!isPositionChange) {
            this.chartObj.push(singleChart);
          } else {
            const chartIndex = this.chartObj.findIndex(d => d.id === chart.id);
            this.chartObj[chartIndex].obj = chart.obj;
          }
        });
        break;
    }
  }

  /**
   * 删除窗口中的数据项
   * @param itemId 窗口主键标识
   */
  public removeDataSource(itemId: string) {
    this.psSer.removeDataSource(itemId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('删除成功');
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('services panel', 'panelMethod removeDataSource()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 导出缩略图
   * @param name 看板名称
   */
  public exportPDF(name: string) {
    html2canvas($('#panel-container'),
      {
        useCORS: true,
        dpi: 172, // 导出pdf清晰度
        onrendered: function (canvas) {
          const pageData = canvas.toDataURL('image/png', 0.5);
          const contentWidth = canvas.width;
          const contentHeight = canvas.height;
          // 一页pdf显示html页面生成的canvas高度;
          const pageHeight = contentWidth / 595.28 * 841.89;
          // 未生成pdf的html页面高度
          let leftHeight = 2000;
          // pdf页面偏移
          let position = 0;
          // html页面生成的canvas在pdf中图片的宽高（a4纸的尺寸[595.28,841.89]）
          const imgWidth = 595.28;
          const imgHeight = 595.28 / contentWidth * contentHeight;
          // const pdf = new jsPDF('', 'pt', 'a4');
          const pdf = new jsPDF('l', 'pt', [595.28, 595.28 / contentWidth * contentHeight]);
          // 有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
          // 当内容未超过pdf一页显示的范围，无需分页
          if (leftHeight < pageHeight) {
            pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
          } else {
            while (leftHeight > 0) {
              pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
              leftHeight -= pageHeight;
              position -= 841.89;
              // 避免添加空白页
              if (leftHeight > 0) {
                pdf.addPage();
              }
            }
          }
          const str1 = name + Utils.getCurrentTime() + '.pdf';
          pdf.save(str1);
        },
        // 背景设为白色（默认为黑色）
        background: '#fff'
      });
  }
}
