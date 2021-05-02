import queryString from 'query-string';
import {RouteConfigInterface, RouterConifgInterface, RouterInterface} from './router.d';

function createRouteMap(routes: Array<RouteConfigInterface>) {
    const routeMap = new Map();
    routes.forEach((route) => {
        routeMap.set(`/${route.path}`, route);
    });

    return routeMap;
}

function normalizedUrl(link: string) {
    const { url } = queryString.parseUrl(link)
    return url;
}

type HookType = (to: RouteConfigInterface, from: RouteConfigInterface, next: Function) => {}



export default class Router implements RouterInterface {
    routes: Array<RouteConfigInterface>;
    beforeHooks: Array<(to: RouteConfigInterface, from: RouteConfigInterface, next: Function) => any>;
    routeMap: Map<string, RouteConfigInterface>
    navigateTo: any
    navigateBack: any
    switchTab: any
    redirectTo: any
    reLaunch: any
    constructor(options: RouterConifgInterface)  {
        this.routes = options.routes || [];
        this.beforeHooks = [];
        this.routeMap = createRouteMap(options.routes);

        this.navigateTo = wx.navigateTo
        this.navigateBack = wx.navigateBack
        this.switchTab = wx.switchTab
        this.redirectTo = wx.redirectTo
        this.reLaunch = wx.reLaunch

        this.init();
    }

    init() {
        Object.defineProperty(wx, 'navigateTo', {
            get: () => this.navigateToInterceptor.bind(this)
        });
        // TODO: 优化这里
        Object.defineProperty(wx, 'redirectTo', {
            get: () => this.redirectToInterceptor.bind(this)
        });
    }
    redirectToInterceptor(args: any) {
        const toUrl = args.url;
        // 登录插件的跳转页面url为plugin-private:xxxxx所以这里不拦截登录插件的跳转的逻辑
        const isLoginPlugin = toUrl.indexOf('plugin-private') > -1;
        const fromUrl = this.getAbsolutePath();
        // // TODO:这里的next并没有实现管道，我们假设之设定一个路由拦截器
        const next = (params = args) => {
            // 如果传入的是空值false '' null undefined则不处理跳转
            if (!params) return;
            if (typeof params === 'object' && !isLoginPlugin) {
                // 如果传入的是一个对象，并且url在routeMaps里面，则跳转过去
                // const url = normalizedUrl(params.url)
                // if (this.routeMap.has(url)) {
                    this.redirectTo(params)
                // }
            } else {
                this.redirectTo(args)
            }
        };
        if (toUrl && !isLoginPlugin) {
            const to = this.routeMap.get(normalizedUrl(toUrl)) || args
            const from = this.routeMap.get(fromUrl) || {
                path: fromUrl
            }
            // 把登录成功后需要跳转的页面带入
            to.returnpage = toUrl
            this.beforeHooks.forEach((hook) => {
                hook(to, from, next);
            });
        } else {
            next(args);
        }
    }

    navigateToInterceptor(args: any) {
        const toUrl = args.url;
        const fromUrl = this.getAbsolutePath()
        const next = (params = args) => {
            if (params === false) return;
            if (typeof params === 'object') {
                // 如果传入的是一个对象，并且url在routeMaps里面，则跳转过去
                // const url = normalizedUrl(params.url)
                // if (this.routeMap.has(url)) {
                    this.navigateTo(params)
                // }
            } else {
                this.navigateTo(args)
            }
        };
        if (toUrl) {
            const routeTo = this.routeMap.get(normalizedUrl(toUrl))
            const to = Object.assign({returnpage: toUrl}, args, routeTo)
            const from = this.routeMap.get(fromUrl) || {
                path: fromUrl
            }
            // 把登录成功后需要跳转的页面带入
            this.beforeHooks.forEach((hook) => {
                hook(to, from, next);
            });
        } else {
            next(args);
        }
    }

    getAbsolutePath() {
        const pages = getCurrentPages();
        const currentRoute = pages[pages.length - 1].route
        // 转换为绝对路径
        return `/${currentRoute}`
    }

    beforeEach(fn: HookType) {
        this.beforeHooks.push(fn);
    }
}