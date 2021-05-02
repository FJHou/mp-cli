import util from "../util.js";
import { request } from "../../../utils/util.js";
import { getBrandBaseInfo } from "../../../utils/JDH-pharmacy/index.js";
import { API } from "../../../api/config.js";
let plugin = requirePlugin("loginPlugin");
const medicineLink = "yao.jkcsjd.com/Instruction";
const app = getApp();
let shareUrl = ''
Page({
  onLoad: function (options = {}) {
    shareUrl = options.h5_url
    let { h5_url = "" } = options;
    // 用户线下扫码进入店铺落地页
    let fromShop = app.globalData.sceneObj.fromShop;
    if (fromShop) {
      this.getShopInfo(options);
    } else {
      util.h5Init(options);
      this.setData({ h5_url });
      util.setCustomNavigation();
      this._genToken();
      this.changBgStyle(h5_url);
    }
    // TODO: 下版优化
    getBrandBaseInfo().then(res => {
      const {copyWriting} = res;
      this.shareTitle = copyWriting
    })
  },
  getShopInfo() {
    // 获取到位置信息
    app.getLocation(
      locationInfo => {
        if (!locationInfo) {
          // 地址信息为空
          wx.switchTab({
            url: '/pages/newShop/shopFront'
          });
          return;
        }
        let requestUrl = this.getRequestUrl(
          "ds_getDistributableStore",
          locationInfo
        );
        request({
          url: requestUrl,
          success: res => {
            console.log("ds_getDistributableStore:", res);
            if ((res && !Array.isArray(res.data)) || res.data.length < 1) {
              // 没有店铺信息
              wx.switchTab({
                url: '/pages/newShop/shopFront'
              });
              return;
            }
            let shopSendInfo = res.data[0];
            let openId = wx.getStorageSync("oP_key") ? wx.getStorageSync("oP_key") : "";
            let h5_url = `${app.diansongUrl}/store/${shopSendInfo.storeId ||
              null}?venderid=${shopSendInfo.venderId || null}&source=mini&openId=${openId}&miniWexinAppId=${app.globalData.appid}`;

            util.h5Init();
            this.setData({ h5_url });
            util.setCustomNavigation();
            this._genToken();
            this.changBgStyle(h5_url);
          },
          fail(res) {
            console.log("获取店送数据失败：", res);
            wx.switchTab({
              url: '/pages/newShop/shopFront'
            });
          }
        });
      },
      () => {
        console.log('wx-common faile');
        //未获取地址信息
        wx.switchTab({
          url: '/pages/newShop/shopFront'
        });
      }
    );
  },
  /**
   * 获取请求Url
   */
  getRequestUrl: function (functionId, param) {
    return `${
      API.globalHealthRequestUrl
      }/api?functionId=${functionId}&body=${JSON.stringify(
        param
      )}&jsonp=&appid=jd_healthy&loginType=2`;
  },
  _genToken() {
    let { h5_url } = this.data;
    plugin
      .genToken({
        h5_url
      })
      .then(res => {
        let { isSuccess, err_code, url, tokenkey, err_msg } = res;
        if (isSuccess && !err_code) {
          console.log(
            "wx-common gettoken",
            `${url}?to=${h5_url}&tokenkey=${tokenkey}`
          );
          this.setData({ url: `${url}?to=${h5_url}&tokenkey=${tokenkey}` });
        } else {
          wx.showModal({
            title: "提示",
            content: err_msg || "页面跳转失败，请重试",
            success: res => {
              if (res.confirm) {
                this._genToken();
              }
            }
          });
        }
      })
      .catch(res => console.jdLoginLog(res));
  },
  onUnload: function () {
    let pages = getCurrentPages();
    if (pages.length > 1) {
      pages[pages.length - 2].setData({
        openSource: true
      })
    }
  },
  getQueryVariable: function (url, variable) {
    let query = url.split("?")[1];
    let vars = query.split("&");
    for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split("=");
      if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
  },
  convertObj(data) {
    var _result = [];
    for (var key in data) {
      if (key == "h5_url") {
        continue
      }
      var value = data[key];
      if (value.constructor == Array) {
        value.forEach(function (_value) {
          _result.push(key + "=" + _value);
        });
      } else {
        _result.push(key + '=' + value);
      }
    }
    return _result.join('&');
  },
  onShareAppMessage: function (e) {
    let shareTitle = this.getQueryVariable(e.webViewUrl, 'share')
    let pages = getCurrentPages();
    if (pages.length > 1) {
      let index = 1
      for (let i = pages.length - 1; i > 0; i--) {
        if (pages[i].route === 'pages/login/wv-common/wv-common') {
          index++
        } else {
          break;
        }
      }
      let pageObject = pages[pages.length - index]
      let urlParam = this.convertObj(pageObject.options)
      console.log(pageObject.options)
      console.log('分享出去的链接', `${pageObject.route}?h5_url=${decodeURIComponent(shareUrl)}&openSource=share&${urlParam}`)
      return {
        title: shareTitle ? decodeURIComponent(shareTitle) : this.shareTitle,
        path: `${pageObject.route}?h5_url=${encodeURIComponent(decodeURIComponent(shareUrl))}&openSource=share&${urlParam}`
      };

    } else {
      return {
        title: shareTitle ? decodeURIComponent(shareTitle) : this.shareTitle,
        path: `/pages/login/wv-common/wv-common?h5_url=${shareUrl}`
      };
    }


  },
  changBgStyle(h5_url) {
    if (decodeURIComponent(h5_url).indexOf(medicineLink) > -1) {
      wx.setNavigationBarColor({
        frontColor: "#ffffff",
        backgroundColor: "#FF8A70",
        animation: {
          duration: 400,
          timingFunc: "easeIn"
        }
      });
    } else {
      wx.setNavigationBarColor({
        frontColor: "#000000",
        backgroundColor: "#ffffff",
        animation: {
          duration: 400,
          timingFunc: "easeIn"
        }
      });
    }
  }
});
