/**
 * 代理原始的page，所有文件的Page方法都会通过这个代理后执行
 * 可以通过这个页面添加一些共的逻辑，例如打点上报，扩展Page的this属性
 */

const originalPage = Page;

Page = function(config) {
  const { onLoad, onShow } = config;
  config.onLoad = function(onLoadOptions) {
    this.$_app = getApp()
    this.$_route = {
      path: '', // 路由页面
      query: '', // options
      fullPath: '', // 页面所有参数，包括options
      redirectedFrom: '', // 上一个页面
    }
    if (typeof onLoad === 'function') {
      onLoad.call(this, onLoadOptions)
    }
  }
  config.onShow = function() {
    if (typeof onShow === 'function') {
      onShow.call(this)
    }
  }
  // function lifeCycleProxy(lifyCycle) {
  //   config[lifyCycle] = function(options = {}) {
  //       if (typeof lifyCycle === 'function') {
  //           lifyCycle.call(this, options)
  //       }
  //   }
  // }

  // lifeCycleProxy(onLoad)
  // lifeCycleProxy(onShow)

  return originalPage(config);
};
