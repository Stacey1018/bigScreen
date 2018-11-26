import { Component, OnInit, Output, AfterViewInit, EventEmitter, Input } from '@angular/core';
import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';
import { TooltipService } from '../../../../services/tooltip.service';
import { DataTypeEnum } from '../../../../common/dataTypeEnum';
import { ThemeConfigService } from '../../../../services/screenDeploy/themeConfig.service';
import { ScreenTheme } from '../../../../domain/screenConfig/screenTheme';
import { AppSettingService } from '../../../../services/appsetting.service';
import { ApiSettingService } from '../../../../services/apisetting.service';
import { Scene } from '../../../../domain/scene/scene';
import { Utils } from '../../../../utils/utils';
@Component({
  selector: 'app-image-setting',
  templateUrl: './image-setting.component.html',
  styleUrls: ['../../../../../assets/css/componentSetting.scss', './image-setting.component.scss']
})
export class ImageSettingComponent implements OnInit, AfterViewInit {
  @Output() changeImageData = new EventEmitter<Scene.ResourceView>();
  @Input() imageData: Scene.ResourceView = new Scene.ResourceView();

  public isShowHistotyList = false;
  public uploader: FileUploader;
  private fileTypeArr = ['jpg', 'jpeg', 'svg', 'gif', 'png']; // 文件格式
  public historyImagesList: ScreenTheme.ThemeItem[] = new Array<ScreenTheme.ThemeItem>();

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
        this.tooltipService.showMsg('只能上传一个图片!');
        return;
      }
    };

    // 添加一个文件之后的回调
    this.uploader.onAfterAddingFile = file => {
      const ext = file._file.name.split('.').reverse();
      if ($.inArray(ext[0].toLowerCase(), this.fileTypeArr) >= 0) {
        if (file._file.size > 5 * 1024 * 1024) {
          this.uploader.removeFromQueue(file);
          this.tooltipService.showMsg('图片不能大于5M!');
          return;
        }
        file.withCredentials = false;
      } else {
        this.uploader.removeFromQueue(file);
        this.tooltipService.showMsg('文件类型不支持，请选择正确的文件格式');
      }
    };

    // 获取上传图片
    this.getResourceListByType();
  }

  ngAfterViewInit() {
    Utils.slimScroll();
  }

  /**
   * 上传文件之前回调，更改url，指定上传类型
   */
  public beforeUpload() {
    this.uploader.onBeforeUploadItem = this.onBeforeUploadItem.bind(this);
  }

  public onBeforeUploadItem(file: FileItem): any {
    file.url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.uploadUrl + '?sourceType=' + DataTypeEnum.Image;
  }

  // 文件上传成功之后
  private onSuccessItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    this.onSuccess(this.uploader, item, response);
  }

  private onSuccess(uploader, item, response): void {
    const data: ScreenTheme.ThemeItem = JSON.parse(response);
    this.imageData.resourceId = data.resourcesId;
    this.imageData.resourceName = data.resourcesName;
    this.imageData.resourceInfo = data.resourcesUrl;
    this.changeImageData.emit(this.imageData);
    uploader.removeFromQueue(item);
    this.getResourceListByType();
  }

  /**
   * 选中图片
   */
  public selectBg(item: ScreenTheme.ThemeItem): void {
    this.imageData.resourceId = item.resourcesId;
    this.imageData.resourceName = item.resourcesName;
    this.imageData.resourceInfo = item.resourcesUrl;
    this.changeImageData.emit(this.imageData);
  }

  /**
   * 删除图片资源
   * @param resourceId 资源主键
   */
  public deleteResourceById(item: ScreenTheme.ThemeItem) {
    this.imageData.resourceId = '';
    this.imageData.resourceName = '图片';
    this.imageData.resourceInfo = '';
    this.changeImageData.emit(this.imageData);
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
   * 获取上传图片
   */
  public getResourceListByType() {
    this.service.getResourceListByType(DataTypeEnum.Image, '').subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.historyImagesList = val.data as ScreenTheme.ThemeItem[];
        }
      }
    });
  }

}
