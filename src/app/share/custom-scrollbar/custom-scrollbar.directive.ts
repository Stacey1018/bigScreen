import { Directive, Input, Output, EventEmitter, ElementRef, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
declare var $: any;

/**
 * 滚动条
 */
@Directive({
    selector: '[app-custom-scrollbar]'
})
export class CustomScrollbarDirective implements AfterViewInit, OnDestroy {

    @Input() options: any = {
        scrollButtons: {
            enable: false,
            scrollType: 'continuous',
            scrollSpeed: 20,
            scrollAmount: 40
        },
        axis: 'xy',
        theme: 'dark',
        autoDraggerLength: true,
    autoHideScrollbar: false,
        scrollInertia: 500,
    };

    @Output()
    onViewInit = new EventEmitter();

    private scrollbarInstance: any;

    constructor(private elementRef: ElementRef) { }


    /**
     * 视图初始化
     */
    ngAfterViewInit() {
        this.createScrollbar();
    }

    /**
    * 创建树
    */
    createScrollbar() {
        this.scrollbarInstance = $(this.elementRef.nativeElement).mCustomScrollbar(this.options);
        this.onViewInit.emit(this.scrollbarInstance);
    }

    /**
    * 销毁
    */
    ngOnDestroy() {
        this.scrollbarInstance.mCustomScrollbar('destroy');
    }

    /**
     * 获得实例
     */
    getScrollbarInstance() {
        return this.scrollbarInstance;
    }
}
