import { DefConfigService } from './../../../../services/defConfig.service';
import { ScreenTheme } from '../../../../domain/screenConfig/screenTheme';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';
import { MatDialog } from '@angular/material';
import * as $ from 'jquery';
import swal from 'sweetalert2';
import { ThemeConfigService } from '../../../../services/screenDeploy/themeConfig.service';
import { PicturePreviewDialogComponent } from '../picture-preview-dialog/index';
import { CommonMethodService } from '../../../../services/scene/commonMethod.service';
import { AppSettingService } from '../../../../services/appsetting.service';
import { ApiSettingService } from '../../../../services/apisetting.service';
import { Utils } from '../../../../utils/utils';
import { TooltipService } from '../../../../services/tooltip.service';
import { DataTypeEnum } from '../../../../common/dataTypeEnum';

@Component({
  selector: 'app-screen-theme-upload',
  templateUrl: './screen-theme-upload.component.html',
  styleUrls: ['./screen-theme-upload.component.scss']
})
export class ScreenThemeUploadComponent implements OnInit, AfterViewInit {

  public uploadTypeValue = 0; // 选中的已上传主题类型
  public uploader: FileUploader;
  public typeName = ''; // 需要上传的类型
  public sourceType = ''; // 组件类型
  private fileTypeArr = ['jpg', 'jpeg', 'svg', 'gif', 'png']; // 文件格式
  public themes: ScreenTheme.ThemeItem[] = [];  // 主题图片
  public themeType = [   // 搜索上传主题类型
    { value: 0, viewValue: '全部' },
    { value: DataTypeEnum.Background, viewValue: '背景' },
    { value: DataTypeEnum.Border, viewValue: '边框' }
  ];
  public dataTypeEnum = {
    background: DataTypeEnum.Background,
    border: DataTypeEnum.Border,
  };
  constructor(private tooltipService: TooltipService, private dialog: MatDialog, private service: ThemeConfigService,
    private cmSer: CommonMethodService, private appSer: AppSettingService, private apiSer: ApiSettingService,
    private defSer: DefConfigService) { }

  ngOnInit() {
    // 上传组件
    this.uploader = new FileUploader({
      method: 'POST',
      itemAlias: 'file',
      headers: [{ name: 'Access-Control-Allow-Origin', value: '*' }],
      autoUpload: true,
    });

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
    this.uploader.onSuccessItem = this.onSuccessItem.bind(this);
    // 获取上传图片
    this.getResourceListByType();
  }

  ngAfterViewInit() {
    Utils.slimScroll();
    $('.search-picture-input').on('keyup', Utils.lodash.throttle(() => {
      this.getResourceListByType();
    }, Utils.throttleWaitTime));
  }

  /**
   * 上传文件之前回调，更改url，指定上传类型
   */
  public beforeUpload(sourceType) {
    this.sourceType = sourceType;
    this.uploader.onBeforeUploadItem = this.onBeforeUploadItem.bind(this);
  }

  public onBeforeUploadItem(file: FileItem): any {
    file.url = this.appSer.appsetting.viewServerUrl + this.apiSer.apiUrl.uploadUrl + '?sourceType=' + this.sourceType;
  }

  // 文件上传成功之后
  private onSuccessItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    this.onSuccess(this.uploader, item, response);
  }

  private onSuccess(uploader, item, response): void {
    uploader.removeFromQueue(item);
    this.getResourceListByType();
  }

  /**
   * 获取上传图片
   */
  public getResourceListByType() {
    this.service.getResourceListByType(this.uploadTypeValue, this.typeName).subscribe({
      next: (val) => {
        if (val.code === 0) {
          const themeArr = val.data as ScreenTheme.ThemeItem[];
          this.themes = themeArr.filter(t => t.resourcesType === DataTypeEnum.Background || t.resourcesType === DataTypeEnum.Border);
          this.switchType();
          this.cmSer.switchImg(this.themes).subscribe(d => {
            this.themes = d;
          });
        }
      }
    });
  }

  /**
   *  转换类型
   */
  private switchType(): void {
    for (const theme of this.themes) {
      let type = '';
      switch (parseInt(theme.resourcesType, 0)) {
        case DataTypeEnum.Background:
          type = '背景';
          break;
        case DataTypeEnum.Border:
          type = '边框';
          break;
        default:
          break;
      }
      theme.resourcesType = type;
    }
  }

  /**
   * 改变搜索条件
   */
  public changeSearchType(type) {
    this.uploadTypeValue = type;
    this.getResourceListByType();
  }

  /**
   * 预览
   */
  public previewPicture(url): void {
    const width = '960px';
    const height = '540px';
    const dialogRef = this.dialog.open(PicturePreviewDialogComponent, {
      width: width,
      minWidth: width,
      height: height,
      minHeight: height,
      disableClose: true,
      data: {
        url: url,
        isImg: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  /**
   * 删除上传的图片
   */
  public deletePicture(id): void {
    swal({
      title: '提示',
      html: '确定要删除吗?',
      showCancelButton: true,
      confirmButtonColor: this.defSer.swalConfirmButtonColor,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      cancelButtonClass: 'cancelButtonClass',
      showCloseButton: true,
      padding: 0,
      width: '400px',
    }).then((isConfirm) => {
      if (isConfirm.value) {
        this.service.deletePictureById(id).subscribe({
          next: (val) => {
            if (val.code === 0) {
              this.getResourceListByType();
              this.tooltipService.showMsg('删除图片成功');
            } else {
              this.tooltipService.showMsg(val.message);
            }
          }
        });
      }
    });
  }
}
