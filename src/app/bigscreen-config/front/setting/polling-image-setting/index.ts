import { Component, OnInit, AfterViewInit, Output, Input, EventEmitter } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';
import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';
import { TooltipService } from '../../../../services/tooltip.service';
import { ThemeConfigService } from '../../../../services/screenDeploy/themeConfig.service';
import { AppSettingService } from '../../../../services/appsetting.service';
import { ApiSettingService } from '../../../../services/apisetting.service';
import { ScreenTheme } from '../../../../domain/screenConfig/screenTheme';
import { DataTypeEnum } from '../../../../common/dataTypeEnum';
import { SortablejsOptions } from 'angular-sortablejs';
import { Utils } from '../../../../utils/utils';
@Component({
  selector: 'app-polling-image-setting',
  templateUrl: './polling-image-setting.component.html',
  styleUrls: ['../../../../../assets/css/componentSetting.scss', './polling-image-setting.component.scss']
})
export class PollingImageSettingComponent implements OnInit, AfterViewInit {
  @Output() changePollingImgData = new EventEmitter<Scene.ResourceView>();
  @Input() pollingImgData: Scene.ResourceView = new Scene.ResourceView();

  public isShowHistotyList = false;
  public uploader: FileUploader;
  private fileTypeArr = ['jpg', 'jpeg', 'svg', 'gif', 'png']; // 文件格式
  public historyImagesList: ScreenTheme.ThemeItem[] = new Array<ScreenTheme.ThemeItem>();
  public historyImagesIdList = [];
  public optionsData;
  constructor(
    private tooltipService: TooltipService, private service: ThemeConfigService, private appSer: AppSettingService,
    private apiSer: ApiSettingService
  ) {
    this.optionsData = Utils.getSortablejsOptions('pollingData', true, (event) => {

    });
  }

  ngOnInit() {
    for (let i = 0; i < this.pollingImgData.configInfo.imgUrl.length; i++) {
      this.historyImagesIdList.push(this.pollingImgData.configInfo.imgUrl[i].resourcesId);
    }
    // 上传组件
    this.uploader = new FileUploader({
      method: 'POST',
      itemAlias: 'file',
      queueLimit: 5,
      headers: [{ name: 'Access-Control-Allow-Origin', value: '*' }],
      autoUpload: true,
    });
    this.uploader.onSuccessItem = this.onSuccessItem.bind(this);
    this.uploader.onAfterAddingAll = files => {
      if (files.length > 5) {
        for (const key in files) {
          if (files.hasOwnProperty(key)) {
            const element = files[key];
            this.uploader.removeFromQueue(files[key]);
          }
        }
        this.tooltipService.showMsg('最多上传五个图片!');
        return;
      }
    };

    // 添加一个文件之后的回调
    this.uploader.onAfterAddingFile = file => {
      const ext = file._file.name.split('.').reverse();
      if ($.inArray(ext[0].toLowerCase(), this.fileTypeArr) >= 0) {
        if (file._file.size > 2 * 1024 * 1024) {
          this.uploader.removeFromQueue(file);
          this.tooltipService.showMsg('图片不能大于2M!');
        } else {
          file.withCredentials = false;
        }
      } else {
        this.addingFile(file, this.uploader);
      }
    };

    // 获取上传图片
    this.getResourceListByType();
  }
  ngAfterViewInit() {
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
    file.url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.uploadUrl + '?sourceType=' + DataTypeEnum.Image;
  }

  // 文件上传成功之后
  private onSuccessItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    this.onSuccess(this.uploader, item, response);
  }

  private onSuccess(uploader, item, response): void {
    const data: ScreenTheme.ThemeItem = JSON.parse(response);
    const imageData = {
      resourcesId: data.resourcesId,
      resourceName: data.resourcesName,
      resourceInfo: data.resourcesUrl
    };
    this.historyImagesIdList.push(data.resourcesId);
    this.pollingImgData.configInfo.imgUrl.push(imageData);
    uploader.removeFromQueue(item);
    this.getResourceListByType();
  }

  public changeData() {
    this.changePollingImgData.emit(this.pollingImgData);
  }

  /**
   * 选中图片
   */
  public selectBg(item: ScreenTheme.ThemeItem): void {
    if (this.historyImagesIdList.length > 4) {
      return;
    }
    // 如果已经选中
    if (this.historyImagesIdList.indexOf(item.resourcesId) > -1) {
      const indexPoll = this.pollingImgData.configInfo.imgUrl.findIndex(t => t.resourcesId === item.resourcesId);
      this.pollingImgData.configInfo.imgUrl.splice(indexPoll, 1);
      const index = this.historyImagesIdList.indexOf(item.resourcesId);
      this.historyImagesIdList.splice(index, 1);

    } else {
      const imageData = {
        resourcesId: item.resourcesId,
        resourceName: item.resourcesName,
        resourceInfo: item.resourcesUrl,
      };
      this.pollingImgData.configInfo.imgUrl.push(imageData);
      this.historyImagesIdList.push(item.resourcesId);
    }
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

  public remove(item) {
    const index = this.pollingImgData.configInfo.imgUrl.findIndex(t => t.resourcesId === item.resourcesId);
    this.pollingImgData.configInfo.imgUrl.splice(index, 1);
    const index1 = this.historyImagesIdList.indexOf(item.resourcesId);
    this.historyImagesIdList.splice(index1, 1);
  }

}
