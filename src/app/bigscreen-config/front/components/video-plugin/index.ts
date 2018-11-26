import { Component, OnInit, AfterViewInit, OnChanges, Input, OnDestroy, SimpleChanges } from '@angular/core';
import { Utils } from '../../../../utils/utils';
import { AppSettingService } from '../../../../services/appsetting.service';
import { DataTypeEnum } from '../../../../common/dataTypeEnum';
import { Scene } from '../../../../domain/scene/scene';
declare var Plugins;

@Component({
  selector: 'app-video-plugin',
  templateUrl: './video-plugin.component.html',
  styleUrls: ['./video-plugin.component.scss']
})
export class VideoPluginComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Input() resourceInfo = '';
  @Input() videoData: Scene.ResourceView; // 视频实体

  public videoId: string; // 播放视频div唯一标识
  private videoType: number; // 视频播放类型 // rtmp=1,webRTC=2,mp4=3
  private player: any;
  private videoPageId = ''; // 播放窗口的id
  public videoPlayUrl = ''; // 视频播放地址
  constructor(private appSer: AppSettingService) {
    this.videoPageId = Utils.generateUUID();
    this.videoId = 'video' + Utils.generateUUID();
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    // 以下方法用于scene-view回显视频时使用
    this.initVideoPlugin($('#' + this.videoId));
    this.playVideo();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 以下方法用于创建编辑场景时回显视频使用
    if (!this.player) {
      return;
    } else {
      this.playVideo();
    }
  }

  ngOnDestroy(): void {
    this.player.videoDestroy(0);
  }

  /**
     * 初始化播放器 插件
     * @param videoEle
     */
  public initVideoPlugin(videoEle: any) {
    this.player = new Plugins.Camera();
    this.player.init(videoEle, this.videoPageId, `${this.appSer.appsetting.bigScreenUrl}/assets/js/videojs/video-js.swf`);
    this.player.setLayout(1);
  }

  /**
   * 播放视频
   */
  public playVideo(): void {
    if (this.videoData.resourceInfo !== '') {
      if (this.videoData.detailCode === DataTypeEnum.RealVideo) {
        this.videoType = 1; // rtmp
        this.videoPlayUrl = this.videoData.resourceInfo;
      } else if (this.videoData.detailCode === DataTypeEnum.HistoryVideo) {
        this.videoType = 3; // mp4
        this.videoPlayUrl = this.appSer.appsetting.viewServerUrl + this.videoData.resourceInfo;
      }
      const playData = {
        title: '测试',
        cameraId: '1',
        deviceId: '1',
        pipeId: '',
        index: 0,
        IPAddress: '',
        port: '',
        password: '',
        account: '',
        type: this.videoType, // rtmp=1,webRTC=2,mp4=3(播放的是webm视频)
        ptzType: '',
        protocol: '',
        isAutoPlay: true,
        url: this.videoPlayUrl,
        videoCallBack: function (camera, event) { // 录像
        },
        closeCallBack: function (index, event) { // 关闭
        },
        cutImgCallBack: function (camera, event) { // 截图
        }
      };
      this.player.playVideo(playData);
    } else {
      this.videoPlayUrl = '';
      this.player.videoDestroy(0);
    }
  }
}
