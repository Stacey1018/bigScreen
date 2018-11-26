import { Component, Input, OnInit, AfterViewInit, OnDestroy, OnChanges } from '@angular/core';
declare let echarts;
declare var $: any;
@Component({
  selector: 'app-based-map',
  templateUrl: './based-map.component.html',
  styleUrls: ['./based-map.component.scss']
})
export class BasedMapComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() id;
  @Input() mapType;
  @Input() resourceId;
  // 城市经纬度
  public scatterGeo = {
    上海: [121.4648, 31.2891],
    尼日利亚: [-4.388361, 11.186148],
    洛杉矶: [-118.24311, 34.052713],
    香港邦泰: [114.195466, 22.282751],
    芝加哥: [-87.801833, 41.870975],
    加纳库马西: [-4.62829, 7.72415],
    曼彻斯特: [-1.657222, 51.886863],
    汉堡: [10.01959, 54.38474],
    阿拉木图: [45.326912, 41.101891],
    伊尔库茨克: [89.116876, 67.757906],
    巴西: [-48.678945, -10.493623],
    达米埃塔: [31.815593, 31.418032],
    巴塞罗纳: [2.175129, 41.385064],
    金边: [104.88659, 11.545469],
    米兰: [9.189948, 45.46623],
    蒙得维的亚: [-56.162231, -34.901113],
    莫桑比克马普托: [32.608571, -25.893473],
    阿尔及尔: [3.054275, 36.753027],
    迪拜: [55.269441, 25.204514],
    布达佩斯: [17.108519, 48.179162],
    悉尼: [150.993137, -33.675509],
    加州: [-121.910642, 41.38028],
    墨尔本: [144.999416, -37.781726],
    墨西哥: [-99.094092, 19.365711],
    温哥华: [-123.023921, 49.311753]
  };
  // 城市数据
  public scatterVal = [
    [{
      name: '尼日利亚',
      value: 9100
    }, {
      name: '上海'
    }],
    [{
      name: '洛杉矶',
      value: 2370
    }, {
      name: '上海'
    }],
    [{
      name: '香港邦泰',
      value: 3130
    }, {
      name: '上海'
    }],
    [{
      name: '芝加哥',
      value: 2350
    }, {
      name: '上海'
    }],
    [{
      name: '加纳库马西',
      value: 5120
    }, {
      name: '上海'
    }],
    [{
      name: '曼彻斯特',
      value: 3110
    }, {
      name: '上海'
    }],
    [{
      name: '汉堡',
      value: 6280
    }, {
      name: '上海'
    }],
    [{
      name: '阿拉木图',
      value: 7255
    }, {
      name: '上海'
    }],
    [{
      name: '伊尔库茨克',
      value: 8125
    }, {
      name: '上海'
    }],
    [{
      name: '巴西',
      value: 3590
    }, {
      name: '上海'
    }],
    [{
      name: '达米埃塔',
      value: 3590
    }, {
      name: '上海'
    }],
    [{
      name: '巴塞罗纳',
      value: 3590
    }, {
      name: '上海'
    }],
    [{
      name: '金边',
      value: 3590
    }, {
      name: '上海'
    }],
    [{
      name: '米兰',
      value: 3590
    }, {
      name: '上海'
    }],
    [{
      name: '蒙得维的亚',
      value: 3590
    }, {
      name: '上海'
    }],
    [{
      name: '莫桑比克马普托',
      value: 3590
    }, {
      name: '上海'
    }],
    [{
      name: '阿尔及尔',
      value: 3590
    }, {
      name: '上海'
    }],
    [{
      name: '迪拜',
      value: 3590
    }, {
      name: '上海'
    }],
    [{
      name: '布达佩斯',
      value: 3590
    }, {
      name: '上海'
    }],
    [{
      name: '悉尼',
      value: 3590
    }, {
      name: '上海'
    }],
    [{
      name: '加州',
      value: 3590
    }, {
      name: '上海'
    }],
    [{
      name: '墨尔本',
      value: 3590
    }, {
      name: '上海'
    }],
    [{
      name: '墨西哥',
      value: 3590
    }, {
      name: '上海'
    }],
    [{
      name: '温哥华',
      value: 3590
    }, {
      name: '上海'
    }]
  ];
  private myChart;
  constructor() { }

  ngOnInit() {
  }
  ngAfterViewInit() {
    this.setChinaMap('basemap' + this.id);
  }

  ngOnChanges(): void {
    if (this.resourceId !== '') {
      if (this.myChart) {
        this.myChart.resize();
      }
    }
  }
  ngOnDestroy() {
    this.myChart.dispose();
  }

  // 数据转换，转换后的格式：[{name: 'cityName', value: [lng, lat, val]}, {...}]
  public convertScatterData(data) {
    const res = [];
    for (let i = 0; i < data.length; i++) {
      const geoCoord = this.scatterGeo[data[i].name];
      if (geoCoord) {
        res.push({
          name: data[i].name,
          value: geoCoord.concat(data[i].value)
        });
      }
    }
    return res;
  }
  public setChinaMap(idName) {
    const dom = document.getElementById(idName);
    this.myChart = echarts.init(dom);
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          return params.name + ' : ' + params.value[2];
        }
      },
      visualMap: {
        show: false,
        min: 0,
        max: 8,
        calculable: false,
        inRange: {
          color: ['#50a3ba', '#eac736', '#d94e5d']
        },
        textStyle: {
          color: '#fff'
        }
      },
      geo: {
        map: this.mapType,
        roam: 'scale', // 开启鼠标缩放和漫游
        zoom: 1, // 地图缩放级别
        selectedMode: false, // 选中模式：single | multiple
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        layoutCenter: ['50%', '50%'], // 设置后left/right/top/bottom等属性无效
        layoutSize: '100%',
        label: {
          emphasis: {
            show: true,
            color: '#ffffff'
          }
        },
        itemStyle: {
          normal: {
            areaColor: '#101f32',
            borderWidth: 1.1,
            borderColor: '#43d0d6'
          },
          emphasis: {
            areaColor: '#069',
          },
        }
      },
      series: [{
        name: '报价',
        type: 'heatmap',
        // type: 'effectScatter',
        coordinateSystem: 'geo',
        symbolSize: 16,
        label: {
          normal: {
            show: false
          },
          emphasis: {
            show: false
          },
          show: true,
        },
        itemStyle: {
          emphasis: {
            borderColor: '#fff',
            borderWidth: 1
          }
        },
        data: this.convertScatterData(this.scatterVal)
      }]
    };
    this.myChart.setOption(option, true);
  }
}
