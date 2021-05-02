import queryString from "query-string";

function createRouteMap(routes) {
  const routeMap = new Map();
  routes.forEach((route) => {
    routeMap.set(`/${route.path}`, route);
  });

  return routeMap;
}

function normalizedUrl(link) {
  const { url } = queryString.parseUrl(link);
  return url;
}

export default class Router {
  constructor(options) {
    this.routes = options.routes || [];
    this.beforeHooks = [];
    this.routeMap = createRouteMap(options.routes);

    this.navigateTo = wx.navigateTo;
    this.navigateBack = wx.navigateBack;
    this.switchTab = wx.switchTab;
    this.redirectTo = wx.redirectTo;
    this.reLaunch = wx.reLaunch;

    this.init();
  }

  init() {
    Object.defineProperty(wx, "navigateTo", {
      get: this.interceportsInvoker.bind(this, "navigateTo"),
    });
    Object.defineProperty(wx, "redirectTo", {
      get: this.interceportsInvoker.bind(this, "redirectTo"),
    });
  }

  interceportsInvoker(routerType) {
    return (args) => {
      const toUrl = args.url;
      const fromUrl = this.getCurrentRoute();
      const next = (params = args) => {
        if (params === false) return;
        if (typeof params === "object") {
          // 如果传入的是一个对象，并且url在routeMaps里面，则跳转过去
          // const url = normalizedUrl(params.url)
          // if (this.routeMap.has(url)) {
          this[routerType](params);
          // }
        } else {
          this[routerType](args);
        }
      };
      if (toUrl) {
        const routeTo = this.routeMap.get(normalizedUrl(toUrl));
        const to = Object.assign({ returnpage: toUrl }, args, routeTo);
        const from = this.routeMap.get(fromUrl);
        // 把登录成功后需要跳转的页面带入
        this.beforeHooks.forEach((hook) => {
          hook(to, from, next);
        });
      } else {
        next(args);
      }
    };
  }

  getCurrentRoute() {
    const pages = getCurrentPages();
    return `/${pages[pages.length - 1].route}`;
  }

  beforeEach(fn) {
    this.beforeHooks.push(fn);
  }
}
