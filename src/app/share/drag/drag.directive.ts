import { Directive, Input, Output, EventEmitter, ElementRef, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import { Scene } from '../../domain/scene/scene';
import { DefConfigService } from '../../services/defConfig.service';
declare var $: any;

/**
 * 拖拽
 */
@Directive({
  selector: '[app-drag]'
})
export class DragDirective implements AfterViewInit, OnDestroy {
  @Input() itemData: Scene.LayoutItem;
  @Output() itemChange = new EventEmitter<Scene.LayoutItem>();
  private minWidth = 30;
  private minHeight = 30;
  private dataBoxOffset;
  private $container: any;
  private $main: any;
  constructor(private elementRef: ElementRef, private defConfigService: DefConfigService) {

  }

  /**
   * 视图初始化
   */
  ngAfterViewInit() {
    this.$container = $('#layout-container');
    this.$main = $('#dataBox');
    const currThis = this;
    const $box = $(this.elementRef.nativeElement);
    currThis.dataBoxOffset = this.$main.offset();
    $box.mousedown(function (e) {
      const offset = $(this).offset();
      this.posix = { 'x': e.pageX - offset.left, 'y': e.pageY - offset.top };
      const posix = { 'x': e.pageX - offset.left, 'y': e.pageY - offset.top };
      currThis.showLine();
      $.extend(document, {
        'move': true, 'move_target': this, 'call_down': function (e) {
          const top = e.pageY - currThis.$main.offset().top - posix.y;
          const left = e.pageX - currThis.$main.offset().left - posix.x;
          currThis.itemData.positionY = currThis.zoomNumber(top);
          currThis.itemData.positionX = currThis.zoomNumber(left);
          currThis.showLine();
        }, 'call_up': function (e) {
          currThis.hideLine();
        }
      });
    }).on('mousedown', '.top-left-handler', function (e) {
      const posix = {
        'w': $box.width(),
        'h': $box.height(),
        'x': e.pageX,
        'y': e.pageY
      };
      currThis.showLine();
      $.extend(document, {
        'move': true, 'call_down': function (e) {
          const top = e.pageY - currThis.dataBoxOffset.top + currThis.$container.scrollTop();
          const left = e.pageX - currThis.dataBoxOffset.left + currThis.$container.scrollLeft();
          if (currThis.itemData.sizeRow > currThis.minHeight) {
            currThis.itemData.positionY = currThis.zoomNumber(top);
            currThis.itemData.sizeRow = currThis.zoomNumber(posix.y - e.pageY + posix.h);
          }
          if (currThis.itemData.sizeCol > currThis.minWidth) {
            currThis.itemData.positionX = currThis.zoomNumber(left);
            currThis.itemData.sizeCol = currThis.zoomNumber(posix.x - e.pageX + posix.w);
          }
          currThis.showLine();
        }, 'call_up': function (e) {
          currThis.hideLine();
          currThis.itemChange.emit(currThis.itemData);
        }
      });
      return false;
    }).on('mousedown', '.top-right-handler', function (e) {
      const posix = {
        'w': $box.width(),
        'h': $box.height(),
        'x': e.pageX,
        'y': e.pageY
      };
      currThis.showLine();
      $.extend(document, {
        'move': true, 'call_down': function (e) {
          const top = e.pageY - currThis.dataBoxOffset.top + currThis.$container.scrollTop();
          if (currThis.itemData.sizeRow > currThis.minHeight) {
            currThis.itemData.positionY = currThis.zoomNumber(top);
            currThis.itemData.sizeRow = currThis.zoomNumber(posix.y - e.pageY + posix.h);
          }
          if (currThis.zoomNumber(e.pageX - posix.x + posix.w) > currThis.minWidth) {
            currThis.itemData.sizeCol = currThis.zoomNumber(e.pageX - posix.x + posix.w);
          }
          currThis.showLine();
        }, 'call_up': function (e) {
          currThis.hideLine();
          currThis.itemChange.emit(currThis.itemData);
        }
      });
      return false;
    }).on('mousedown', '.bottom-left-handler', function (e) {
      const posix = {
        'w': $box.width(),
        'h': $box.height(),
        'x': e.pageX,
        'y': e.pageY
      };
      currThis.showLine();
      $.extend(document, {
        'move': true, 'call_down': function (e) {
          const left = e.pageX - currThis.dataBoxOffset.left + currThis.$container.scrollLeft();
          if (currThis.itemData.sizeCol > currThis.minWidth) {
            currThis.itemData.positionX = currThis.zoomNumber(left);
            currThis.itemData.sizeCol = currThis.zoomNumber(posix.x - e.pageX + posix.w);
          }
          if (currThis.zoomNumber(e.pageY - posix.y + posix.h) > currThis.minHeight) {
            currThis.itemData.sizeRow = currThis.zoomNumber(e.pageY - posix.y + posix.h);
          }
          currThis.showLine();
        }, 'call_up': function (e) {
          currThis.hideLine();
          currThis.itemChange.emit(currThis.itemData);
        }
      });
      return false;
    }).on('mousedown', '.bottom-right-handler', function (e) {
      const posix = {
        'w': $box.width(),
        'h': $box.height(),
        'x': e.pageX,
        'y': e.pageY
      };
      currThis.showLine();
      $.extend(document, {
        'move': true, 'call_down': function (e) {
          if (currThis.zoomNumber(e.pageY - posix.y + posix.h) > currThis.minHeight) {
            currThis.itemData.sizeRow = currThis.zoomNumber(e.pageY - posix.y + posix.h);
          }
          if (currThis.zoomNumber(e.pageX - posix.x + posix.w) > currThis.minWidth) {
            currThis.itemData.sizeCol = currThis.zoomNumber(e.pageX - posix.x + posix.w);
          }
          currThis.showLine();
        }, 'call_up': function (e) {
          currThis.hideLine();
          currThis.itemChange.emit(currThis.itemData);
        }
      });
      return false;
    }).on('mousedown', '.bottom-handler', function (e) {
      const posix = {
        'w': $box.width(),
        'h': $box.height(),
        'x': e.pageX,
        'y': e.pageY
      };
      currThis.showLine();
      $.extend(document, {
        'move': true, 'call_down': function (e) {
          if (currThis.zoomNumber(e.pageY - posix.y + posix.h) > currThis.minHeight) {
            currThis.itemData.sizeRow = currThis.zoomNumber(e.pageY - posix.y + posix.h);
          }
          currThis.showLine();
        }, 'call_up': function (e) {
          currThis.hideLine();
          currThis.itemChange.emit(currThis.itemData);
        }
      });
      return false;
    }).on('mousedown', '.top-handler', function (e) {
      const posix = {
        'w': $box.width(),
        'h': $box.height(),
        'x': e.pageX,
        'y': e.pageY
      };
      currThis.showLine();
      $.extend(document, {
        'move': true, 'call_down': function (e) {
          const top = e.pageY - currThis.dataBoxOffset.top + currThis.$container.scrollTop();
          if (currThis.itemData.sizeRow > currThis.minHeight) {
            currThis.itemData.positionY = currThis.zoomNumber(top);
            currThis.itemData.sizeRow = currThis.zoomNumber(posix.y - e.pageY + posix.h);
          }
          currThis.showLine();
        }, 'call_up': function (e) {
          currThis.hideLine();
          currThis.itemChange.emit(currThis.itemData);
        }
      });
      return false;
    }).on('mousedown', '.left-handler', function (e) {
      const posix = {
        'w': $box.width(),
        'h': $box.height(),
        'x': e.pageX,
        'y': e.pageY
      };
      currThis.showLine();
      $.extend(document, {
        'move': true, 'call_down': function (e) {
          const left = e.pageX - currThis.dataBoxOffset.left + currThis.$container.scrollLeft();
          if (currThis.itemData.sizeCol > currThis.minWidth) {
            currThis.itemData.positionX = currThis.zoomNumber(left);
            if (left > 0) {
              currThis.itemData.sizeCol = currThis.zoomNumber(posix.x - e.pageX + posix.w);
            }
          }
          currThis.showLine();
        }, 'call_up': function (e) {
          currThis.hideLine();
          currThis.itemChange.emit(currThis.itemData);
        }
      });
      return false;
    }).on('mousedown', '.right-handler', function (e) {
      const posix = {
        'w': $box.width(),
        'h': $box.height(),
        'x': e.pageX,
        'y': e.pageY
      };
      currThis.showLine();
      $.extend(document, {
        'move': true, 'call_down': function (e) {
          if (currThis.zoomNumber(e.pageX - posix.x + posix.w) > currThis.minWidth) {
            currThis.itemData.sizeCol = currThis.zoomNumber(e.pageX - posix.x + posix.w);
          }
          currThis.showLine();
        }, 'call_up': function (e) {
          currThis.hideLine();
          currThis.itemChange.emit(currThis.itemData);
        }
      });
      return false;
    });
  }
  ngOnDestroy() {

  }

  public zoomNumber(num) {
    return Math.round(num / this.defConfigService.createSceneBoxRadio);
  }

  public showLine() {
    $('#guide-h').css('left', this.itemData.positionX).show();
    $('#guide-h').css('height', this.itemData.positionY).show();
    $('#guide-w').css('top', this.itemData.positionY).show();
    $('#guide-w').css('width', this.itemData.positionX).show();
    $('#guide').css({
      // 'width': (this.itemData.positionX) * this.defConfigService.createSceneBoxRadio,
      // 'top': (this.itemData.positionY - 36) * this.defConfigService.createSceneBoxRadio
      'width': this.itemData.positionX,
      'top': this.itemData.positionY - 24 / this.defConfigService.createSceneBoxRadio,
      'font-size': 12 / this.defConfigService.createSceneBoxRadio + 'px',
      'height': 24 / this.defConfigService.createSceneBoxRadio + 'px',
      'line-height': 24 / this.defConfigService.createSceneBoxRadio + 'px',
    }).html(this.itemData.positionX + ',' + this.itemData.positionY).show();
  }
  public hideLine() {
    $('#guide-w, #guide-h,#guide').hide();
  }
}
