
const appData = getApp().globalData;
// const mta = require('./mta_analysis.js');

function identity(page) {
  if (page.onShow) {
    let _onShow = page.onShow;
    page.onShow = function () {

      // ***AOP切面：页面埋点mta初始化***
      // mta.Page.init();
      // var pages = getCurrentPages();
      // var currentPage = pages[pages.length - 1];
      // var url = currentPage.route;
      // // 兼容不同页面中变量名称的不同写法，title尝试多次取值
      // let title = currentPage.data.navbarData ? currentPage.data.navbarData.title:'';
      // title = title || (currentPage.data.nvabarData ? currentPage.data.nvabarData.title : '');
      // let array = url.split('/');
      // let route = array.slice(-2).toString().replace(',', '/');
      // mta.Event.stat(`page_show`, { "title": `${title}`, "route": `${route || url}`, });
      // ***end埋点****

      //改动点
      let currentInstance = getPageInstance();
      appData.check().then(() => {
        //获取页面实例，防止this劫持
        _onShow.call(currentInstance);
      }, (r) => {
        //跳转到登录页
        if(r=="login") {
         
          var params = "?", paramsArray = [];
          for(var i in currentInstance.options) {
            paramsArray.push(i + "=" + currentInstance.options[i]);
          }
          params = params + paramsArray.join("&");
          wx.redirectTo({
            url: "/pages/login/login?returnUrl=" + encodeURIComponent(currentInstance.route+params)
          })
        } else if (r == "bindPhone") {
          var params = "?", paramsArray = [];
          for (var i in currentInstance.options) {
            paramsArray.push(i + "=" + currentInstance.options[i]);
          }
          params = params + paramsArray.join("&");
          wx.redirectTo({
            url: "/pages/loginPhone/loginPhone?returnUrl=" + encodeURIComponent(currentInstance.route + params)
          })
        }
        // r=="login"?wx.redirectTo({
        //   url: "/pages/login/login?returnUrl=" + encodeURIComponent(currentInstance.route)
        // }) : wx.redirectTo({
        //   url: "/pages/auth/auth?returnUrl=" + encodeURIComponent(currentInstance.route)
        // })
      });
    }
  }
  return page;
}
function action(fn) {
  return function(e) {
    let currentInstance = getPageInstance();
    appData.check().then(() => {
      //获取页面实例，防止this劫持
      fn.call(currentInstance,e);
    }, () => {
      //跳转到登录页
      var params = "?", paramsArray = [];
      for(var i in currentInstance.options) {
        paramsArray.push(i + "=" + currentInstance.options[i]);
      }
      params = params + paramsArray.join("&");
      wx.redirectTo({
        url: "/pages/login/login?returnUrl=" + encodeURIComponent(currentInstance.route+params)
      });
    });
  }
}
function getPageInstance() {
  var pages = getCurrentPages();
  return pages[pages.length - 1];
}

exports.identity = identity;
exports.action = action;