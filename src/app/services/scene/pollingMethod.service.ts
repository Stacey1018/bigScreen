import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ScenePolling } from '../../domain/scene/scenePolling';
import { ChartInteractService } from './chartInteract.service';
import { SceneMethodService } from './sceneMethod.service';
import { SceneSourceService } from './sceneSource.service';
import { Scene } from '../../domain/scene/scene';

@Injectable()
export class PollingMethodService {
  private sceneCallback: any = null; // 场景轮巡callback
  private pollingData: ScenePolling.ScenePollingView[] = []; // 场景轮巡数据
  public isPolling = false; // 场景是否开启轮巡
  public timer: any; // 设置场景定时器的全局变量
  public pollingIndex = 0; // 轮巡场景数组下标
  public itemDataPolling: any = {}; // 逻辑屏轮巡
  public pollingItem: any = {}; // 逻辑屏轮巡数据
  public sceneItemCallback: any = null; // 逻辑子屏轮巡callback
  public smallTimer: any; // 设置数据轮巡定时器的全局变量

  constructor(private http: HttpClient, private chartSer: ChartInteractService, private ssSer: SceneSourceService) {
  }

  /**
    * 开始轮巡-场景
    */
  public startPolling(isInteract: boolean, callBack: any): void {
    this.sceneCallback = callBack;
    this.loadPollingData(() => {
      this.isPolling = true;
      this.sceneTimeout(isInteract);
    });
  }

  /**
    * 加载所有轮巡数据
    */
  private loadPollingData(callBack: any): void {
    this.ssSer.getPollingScene().subscribe({
      next: (val) => {
        if (val.code === 0) {
          // 把轮巡数据加载到内存
          this.pollingData = val.data as ScenePolling.ScenePollingView[];
          if (callBack) {
            callBack();
          }
        }
      }
    });
  }

  /**
    * 场景轮巡演示器
    */
  private sceneTimeout(isInteract: boolean): void {
    if (this.timer) {
      window.clearTimeout(this.timer);
    }
    // 停止轮巡
    if (!this.isPolling) {
      this.pollingIndex = 0;
      return;
    }
    const currScene = this.pollingData[this.pollingIndex];
    if (isInteract) {
      const sceneInfo: Scene.ChartInteract = new Scene.ChartInteract();
      sceneInfo.id = 'changeSceneBtn';
      sceneInfo.data = {
        sceneId: currScene.sceneId
      };
      // sceneInfo.pollingType = currScene.pollingType;
      this.chartSer.chartInteract(sceneInfo).subscribe(); // 和iframe页面交互
    }
    this.sceneCallback(currScene); // 加载场景
    this.pollingIndex = this.pollingIndex === this.pollingData.length - 1 ? 0 : (this.pollingIndex + 1);
    this.timer = window.setTimeout(() => {
      this.sceneTimeout(isInteract);
    }, currScene.pollingTime * 1000);
  }

  /**
   * 停止轮巡
   */
  public endPolling(): void {
    this.isPolling = false;
  }

}
