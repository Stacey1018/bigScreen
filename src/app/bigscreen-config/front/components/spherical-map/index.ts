import { Component, OnInit, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
declare var echarts;
@Component({
  selector: 'app-spherical-map',
  templateUrl: './spherical-map.component.html',
  styleUrls: ['./spherical-map.component.scss']
})
export class SphericalMapComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() id;
  @Input() resourceId;

  public myChart;
  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.setOption('spheri' + this.id);
  }

  ngOnChanges(): void {
    if (this.resourceId !== '') {
      if (this.myChart) {
        this.myChart.resize();
      }
    }
  }

  public setOption(idName) {
    const canvas = document.getElementById('bgCanvas' + this.id);
    const mapChart = echarts.init(canvas, null, {
      width: 4096,
      height: 2048
    });
    mapChart.setOption({
      series: [{
        type: 'map',
        map: 'world',
        // 绘制完整尺寸的 echarts 实例
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        itemStyle: {
          normal: {
            areaColor: 'rgba(0, 249, 255,0.8)',
            borderColor: '#000'
          }
        },
        emphasis: {
          itemStyle: {
            areaColor: '#00F9FF',
          },
        },
        boundingCoords: [
          [-180, 90],
          [180, -90]
        ]
      }]
    });
    const option = {
      visualMap: [{
        show: false,
        type: 'continuous',
        seriesIndex: 0,
        text: ['scatter3D'],
        textStyle: {
          color: '#fff'
        },
        calculable: true,
        max: 5000,
        inRange: {
          color: ['#00F9FF', '#00F9FF', '#00F9FF']
        }
      }],
      globe: {
        baseTexture: mapChart,
        // shading: 'lambert',
        light: { // 光照阴影
          main: {
            color: '#fff', // 光照颜色
            intensity: 1.2, // 光照强度
            // shadowQuality: 'high', //阴影亮度
            shadow: false, // 是否显示阴影
            alpha: 40,
            beta: -30
          },
          ambient: {
            intensity: 0.5
          }
        },
        viewControl: {
          alpha: 30,
          beta: 160,
          // targetCoord: [116.46, 39.92],
          autoRotate: true,
          autoRotateAfterStill: 10,
          distance: 240
        }
      },
      series: [{
        name: 'lines3D',
        type: 'lines3D',
        coordinateSystem: 'globe',
        effect: {
          show: true
        },
        blendMode: 'lighter',
        lineStyle: {
          width: 1
        },
        data: [],
        silent: false
      }]
    };
    // 随机数据
    for (let i = 0; i < 0; i++) {
      option.series[0].data = option.series[0].data.concat(this.rodamData());
    }

    const dom = document.getElementById(idName);
    this.myChart = echarts.init(dom);
    this.myChart.setOption(option);
  }
  public rodamData() {
    const name = '随机点' + Number(Math.random().toFixed(5)) * 10000;
    const longitude = Math.random() * 360;
    const longitude2 = Math.random() * 360 - 180;
    const latitude = Math.random() * 360;
    const latitude2 = Math.random() * 180 - 90;
    return {
      coords: [
        [119.90, 35.97],
        [longitude, latitude]
      ],
      value: (Math.random() * 300).toFixed(2)
    };
  }

}
