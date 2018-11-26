import { SortablejsOptions } from 'angular-sortablejs';

declare let require;
const lodash = require('lodash');
export class Utils {

  public static throttleWaitTime = 1000;
  public static lodash = lodash;
  public static strIsEmptyOrNull(str: string): boolean {
    return str === undefined || str === null || str === '' ? true : false;
  }
  public static numberIsEmptyOrNull(number: number): boolean {
    return number === undefined || number === null ? true : false;
  }

  public static showLoading() {
    $('#loadingBox').css('display', 'flex');
  }

  public static hideLoading() {
    $('#loadingBox').css('display', 'none');
  }

  public static slimScroll() {
    jQuery('.containerDiv').slimScroll({
      width: '100%',
      height: '100%',
      color: '#02A5E2', // 滚动条颜色
      railColor: '#02A5E2', // 轨道颜色
      opacity: .4, // 滚动条透明度
    });
  }

  public static getCurrentTime(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const date1 = date.getDate();
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const second = date.getSeconds();
    const nowDate = '_' + year + month + date1 + hour + minutes + second;
    return nowDate;
  }

  public static switchDatetime(time, fmt) {
    const o = {
      'y+': time.getFullYear(),                      // 年
      'M+': time.getMonth() + 1,                      // 月份
      'd+': time.getDate(),                           // 日
      'h+': time.getHours(),                          // 小时
      'm+': time.getMinutes(),                        // 分
      's+': time.getSeconds(),                        // 秒
      'q+': Math.floor((time.getMonth() + 3) / 3),    // 季度
      'S': time.getMilliseconds()                     // 毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (time.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (const k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
      }
    }
    return fmt;
  }

  /**
   * generaterUUID
   * @return uuid string. formation: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
   */
  public static generateUUID(): string {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
  }

  /**
   * sortablejsOptions
   */
  public static getSortablejsOptions(groupName, isSort, onEndCallback): SortablejsOptions {
    return {
      group: {
        name: groupName, pull: false, put: false,
      },
      sort: isSort, //  配置页面上禁止排序
      onEnd: (event: any) => {
        onEndCallback(event);
      },
      onClone: (event: any) => {
      },
    };
  }
}
