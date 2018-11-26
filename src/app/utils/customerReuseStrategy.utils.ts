import { RouteReuseStrategy, DefaultUrlSerializer, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

// tslint:disable-next-line:class-name
export class customerReuseStrategy implements RouteReuseStrategy {

    public static handlers: { [key: string]: DetachedRouteHandle } = {};

    private static waitDelete: string;
    calcKey(route: ActivatedRouteSnapshot) {
        const url = route.pathFromRoot.map(x => x.url.map(u => u.path).join('/')).join(';');
        // console.log('calcKey url: ' + url);
        if (!url.length) { return undefined; }
        return url;
    }
    /** 表示对所有路由允许复用 如果你有路由不想利用可以在这加一些业务逻辑判断 */
    public shouldDetach(route: ActivatedRouteSnapshot): boolean {
        // console.log('CustomReuseStrategy:shouldDetach', route);
        if (!route.routeConfig) { return false; }
        if (route.routeConfig.loadChildren) { return false; }
        if (route.routeConfig.data && route.routeConfig.data.reuse) {
            return true;
        }
        return false;
    }

    /** 当路由离开时会触发。按path作为key存储路由快照&组件当前实例对象 */
    public store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        // console.log('CustomReuseStrategy:store', route, handle);
        if (!route.routeConfig) { return; }
        if (route.routeConfig.loadChildren) { return; }
        if (route.routeConfig.data && route.routeConfig.data.reuse) {
            const key = this.calcKey(route);
            if (key) { customerReuseStrategy.handlers[key] = handle; }
        }
    }
    /** 若 path 在缓存中有的都认为允许还原路由 */
    public shouldAttach(route: ActivatedRouteSnapshot): boolean {
        // console.debug('CustomReuseStrategy:shouldAttach', route);
        if (!route.routeConfig) { return false; }
        if (route.routeConfig.loadChildren) { return false; }
        if (route.routeConfig.data && route.routeConfig.data.reuse) {
            const key = this.calcKey(route);
            if (key) { return !!customerReuseStrategy.handlers[key]; }
        }
    }

    /** 从缓存中获取快照，若无则返回nul */
    public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        // console.debug('CustomReuseStrategy:retrieve', route);
        if (!route.routeConfig) { return null; }
        if (route.routeConfig.loadChildren) { return null; }
        if (route.routeConfig.data && route.routeConfig.data.reuse) {
            const key = this.calcKey(route);
            if (key) { return customerReuseStrategy.handlers[key] || null; }
        }
    }

    /** 进入路由触发，判断是否同一路由 */
    public shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        // console.debug('CustomReuseStrategy:shouldReuseRoute', future, curr);
        return future.routeConfig === curr.routeConfig;
    }

    private getRouteUrl(route: ActivatedRouteSnapshot) {
        return route['_routerState'].url.replace(/\//g, '_');
    }

    // tslint:disable-next-line:member-ordering
    public static deleteRouteSnapshot(name: string): void {
        if (customerReuseStrategy.handlers[name]) {
            delete customerReuseStrategy.handlers[name];
        } else {
            customerReuseStrategy.waitDelete = name;
        }
    }
}
