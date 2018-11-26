import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';
import { TooltipService } from '../../../../services/tooltip.service';
import { DataTypeEnum } from '../../../../common/dataTypeEnum';
import { ThemeConfigService } from '../../../../services/screenDeploy/themeConfig.service';
import { ScreenTheme } from '../../../../domain/screenConfig/screenTheme';
import { AppSettingService } from '../../../../services/appsetting.service';
import { ApiSettingService } from '../../../../services/apisetting.service';
import { Scene } from '../../../../domain/scene/scene';

@Component({
  selector: 'app-video-setting',
  templateUrl: './video-setting.component.html',
  styleUrls: ['../../../../../assets/css/componentSetting.scss', './video-setting.component.scss']
})
export class VideoSettingComponent implements OnInit {
  @Input() videoData: Scene.ResourceView;
  @Output() changeVideoData = new EventEmitter<Scene.ResourceView>();
  public isShowHistotyList = false;
  public uploader: FileUploader;
  private fileTypeArr = ['mp4', 'webm']; // 文件格式
  public historyVideosList: ScreenTheme.ThemeItem[] = new Array<ScreenTheme.ThemeItem>();

  constructor(
    private tooltipService: TooltipService, private service: ThemeConfigService, private appSer: AppSettingService,
    private apiSer: ApiSettingService) { }

  ngOnInit() {
    // 上传组件
    this.uploader = new FileUploader({
      method: 'POST',
      itemAlias: 'file',
      queueLimit: 1,
      headers: [{ name: 'Access-Control-Allow-Origin', value: '*' }],
      autoUpload: true,
    });
    this.uploader.onSuccessItem = this.onSuccessItem.bind(this);
    this.uploader.onAfterAddingAll = files => {
      if (files.length > 1) {
        for (const key in files) {
          if (files.hasOwnProperty(key)) {
            this.uploader.removeFromQueue(files[key]);
          }
        }
        this.tooltipService.showMsg('只能上传一个视频!');
        return;
      }
    };

    // 添加一个文件之后的回调
    this.uploader.onAfterAddingFile = file => {
      const ext = file._file.name.split('.').reverse();
      if ($.inArray(ext[0].toLowerCase(), this.fileTypeArr) >= 0) {
        if (file._file.size > 400 * 1024 * 1024) {
          this.uploader.removeFromQueue(file);
          this.tooltipService.showMsg('视频不能大于400M!');
        } else {
          file.withCredentials = false;
        }
      } else {
        this.addingFile(file, this.uploader);
      }
    };
    // 获取上传视频
    this.getResourceListByType();
  }


  /**
   * 判断文件格式
   * @param file: 要上传的文件
   * @param uploader: 上传参数
   */
  private addingFile(file, uploader): void {
    const ext = file._file.name.split('.').reverse();
    if ($.inArray(ext[0].toLowerCase(), this.fileTypeArr) >= 0) {
      file.withCredentials = false;
    } else {
      uploader.removeFromQueue(file);
      this.tooltipService.showMsg('文件类型不支持，请选择正确的文件格式');
    }
  }

  /**
   * 上传文件之前回调，更改url，指定上传类型
   */
  public beforeUpload() {
    this.uploader.onBeforeUploadItem = this.onBeforeUploadItem.bind(this);
  }

  public onBeforeUploadItem(file: FileItem): any {
    file.url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.uploadUrl + '?sourceType=' + DataTypeEnum.HistoryVideo;
  }

  // 文件上传成功之后
  private onSuccessItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    this.onSuccess(this.uploader, item, response);
  }

  private onSuccess(uploader, item, response): void {
    const data: ScreenTheme.ThemeItem = JSON.parse(response);
    this.videoData.resourceId = data.resourcesId;
    this.videoData.resourceName = data.resourcesName;
    this.videoData.resourceInfo = data.resourcesUrl;
    this.changeVideoData.emit(this.videoData);
    uploader.removeFromQueue(item);
    this.getResourceListByType();
  }

  /**
   * 勾选视频
   * @param item 视频信息实体
   */
  public selectVideo(item: ScreenTheme.ThemeItem): void {
    this.videoData.resourceId = item.resourcesId;
    this.videoData.resourceName = item.resourcesName;
    this.videoData.resourceInfo = item.resourcesUrl;
    this.changeVideoData.emit(this.videoData);
  }


  /**
   * 删除图片资源
   * @param resourceId 资源主键
   */
  public deleteResourceById(item: ScreenTheme.ThemeItem) {
    this.videoData.resourceId = '';
    this.videoData.resourceName = '图片';
    this.videoData.resourceInfo = '';
    this.changeVideoData.emit(this.videoData);
    this.service.deletePictureById(item.resourcesId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.getResourceListByType();
        } else {
          this.tooltipService.showMsg(val.message);
        }
      }
    });
  }

  /**
   * 获取上传视频
   */
  public getResourceListByType(): void {
    this.service.getResourceListByType(DataTypeEnum.HistoryVideo, '').subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.historyVideosList = val.data as ScreenTheme.ThemeItem[];
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {

      }
    });
  }

}
