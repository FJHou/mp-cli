export let config = {
  appid: 1295,
  returnPage: undefined,
  pageType: undefined,
  isLogout: undefined,
  noWXinfo: 1,
  h5path: undefined,
  isTest: undefined, //1 预发接口，改为undefined 调用线上接口
  isKepler: undefined,
  navigationBarColor: undefined,
  navigationBarTitle: undefined,
  requestHost: 'https://wxapplogin.m.jd.com',
  tabNum: 2,
  author: true,
  selfTips: [
    {
      tip: "《京东用户注册协议》",
      url: "https://wxapplogin.m.jd.com/static/registration.html"
    },
    {
      tip: "《京东隐私政策》",
      url: "https://wxapplogin.m.jd.com/static/private.html"
    }
  ]
};
