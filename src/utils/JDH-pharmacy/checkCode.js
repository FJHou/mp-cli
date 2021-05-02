import Api from './api.js';
const api = new Api();
const checkBindCodeLite = function() {
  var bindInviteCodeSucc = wx.getStorageSync('bindInviteCodeSucc');
  if (bindInviteCodeSucc == undefined || bindInviteCodeSucc == "") {
    var pages = getCurrentPages();
    var currentInstance = pages[pages.length - 1];
    api.post("/user/checkUserBindInviteCode").then((res) => {
      if (res.code == "0") {
        if (res.data) {
          var params = "?",
            paramsArray = [];
          for (var i in currentInstance.options) {
            paramsArray.push(i + "=" + currentInstance.options[i]);
          }
          params = params + paramsArray.join("&");
          var returnUrlTemp = currentInstance.route + params;
          //分享商品详情页不拦截绑定邀请码
          if (returnUrlTemp.indexOf('transferDetails/transferDetails?scene')>=0){
            return;
          }
          //分享商品详情页不拦截绑定邀请码
          if (returnUrlTemp.indexOf('transferDetails/transferDetails?') >= 0 && returnUrlTemp.indexOf('inviterUserId=') >= 0) {
            return;
          }
          wx.redirectTo({
            url: "/pages/logincode/logincode?returnUrl=" + encodeURIComponent(returnUrlTemp)
          })
        } else {
          wx.setStorageSync('BindInviteCodeSucc', "BindInviteCodeSucc");
          wx.setStorageSync('login', 'true');
        }
      }
    })
  }
}

// 判断用户是否绑定过邀请码
const isBingCode = (fn) => {
  var that = this;
  var inviterUserId = wx.getStorageSync('inviterUserId');
  let {
    inviteCode,
    scene
  } = this.data;
  api.post("/user/checkUserBindInviteCode").then((res) => {
    if (res.code == "0") {
      if (res.data && inviterUserId && !inviteCode) { //从分享的商品链接跳到首页
        wx.redirectTo({
          url: `/pages/logincode/logincode?&fromRoute=productDetail&inviterUserId=${inviterUserId}` + "&returnUrl=" + returnUrl
        })
      } else if (res.data && inviteCode) { //从分享的海报链接跳到首页
        wx.redirectTo({
          url: `/pages/logincode/logincode?&inviteCode=${inviteCode}` + "&returnUrl=" + returnUrl
        })
      } else if (res.data && scene) { //从分享的海报图片识别二维码跳到首页
        wx.redirectTo({
          url: `/pages/logincode/logincode?&inviteCode=${scene}` + "&returnUrl=" + returnUrl
        })
      } else if (res.data) { //直接扫码进入首页
        api.get('/user/bindInviteCode').then(rs => {
          if (rs.code != 0 || !rs.data) {
            wx.redirectTo({
              url: `/pages/logincode/logincode`
            })
          }
        }).catch((res) => {
          wx.redirectTo({
            url: `/pages/logincode/logincode`
          })
        });
      } else {
        if (fn && typeof fn == 'function') {
          fn();
        }
      }
    } else {
      if (fn && typeof fn == 'function') {
        fn();
      }
    }
  }).catch((res) => {
    if (fn && typeof fn == 'function') {
      fn();
    }
    console.log(res.msg, '绑定邀请码请求失败');
  });
}
export default {
  checkBindCodeLite,
  isBingCode
}