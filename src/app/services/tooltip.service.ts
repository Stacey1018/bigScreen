import { ScreenConnect } from './../domain/screenConfig/screenConnect';
import { Injectable } from '@angular/core';

@Injectable()
export class TooltipService {
  public timer;
  constructor() { }

  public showMsg(msg) {
    clearTimeout(this.timer);
    this.hideMsg();
    $('#tooltipMsg').addClass('show').html(msg);
    this.timer = setTimeout(() => {
      this.hideMsg();
    }, 2000);
  }

  public hideMsg() {
    $('#tooltipMsg').removeClass('show').html('');
  }

  /**
   * 格式验证
   * @param name 名称
   */
  public checkFormat(name: string) {
    const reg = /^[\w\u4e00-\u9fa5]+$/;
    if (!reg.test(name)) {
      this.showMsg('只允许输入中文、字母、数字、下划线');
      return false;
    } else {
      return true;
    }
  }

  /**
   * 格式验证
   * @param item 渲染机信息
   * @param spanClass 提示框类名
   */
  public checkFormatTip(item: ScreenConnect.RenderView, spanClass: string) {
    let msg;
    const ipBoolean = /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/.test(item.renderIp);
    const portBoolean = /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/.test(item.renderPort);
    const nameBoolean = /^[\w\u4e00-\u9fa5]+$/.test(item.renderName);
    if (ipBoolean) {
      if (portBoolean) {
        if (nameBoolean) {
        } else {
          msg = '只允许输入中文、字母、数字、下划线';
        }
      } else {
        msg = '请输入正确格式的端口号';
      }
    } else {
      msg = '请输入正确格式的IP地址';
    }
    if (ipBoolean && portBoolean && nameBoolean) {
      $(spanClass).hide();
      return true;
    } else {
      $(spanClass).html(msg);
      $(spanClass).show();
      return false;
    }
  }
  // public checkFormatTip(inputVal: string, type: string, spanClass: string) {
  //   let msg, reg;
  //   switch (type) {
  //     case 'ip':
  //       msg = '请输入正确格式的IP地址';
  //       // reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
  //       reg = /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/;
  //       break;
  //     case 'port':
  //       msg = '请输入正确格式的端口号';
  //       reg = /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
  //       break;
  //     case 'name':
  //     case 'passWord':
  //       msg = '只允许输入中文、字母、数字、下划线';
  //       reg = /^[\w\u4e00-\u9fa5]+$/;
  //       break;
  //     default:
  //       break;
  //   }
  //   if (reg !== undefined) {
  //     if (!reg.test(inputVal)) {
  //       $(spanClass).html(msg);
  //       $(spanClass).show();
  //       return false;
  //     } else {
  //       $(spanClass).hide();
  //       return true;
  //     }
  //   } else {
  //     return true;
  //   }
  // }
}



