import { Injectable } from '@angular/core';

@Injectable()
export class DefConfigService {
  constructor() { }
  public swalConfirmButtonColor = '#5dbfe2'; // 弹框颜色
  public isLogin = false; // 是否登录
  public pageIndex = 1; // 第几页
  public pageSize = 20; // 每页数据条数
  public switchingMode = 0; // 动画效果切换方式默认值
  public imgUrl = '/UploadImage/GetImageStream?imgUrl='; // 获取主题路径
  public screenWidth = 1920; // 屏幕宽(默认大小)
  public screenHeight = 1080; // 屏幕高(默认大小)
  public createSceneBoxRadio = 1;
}


