// pages/knowledge-webview/knowledge-webview.js
import loginUtil from "../../pages/login/util.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    url: ""
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.info("webview-url", decodeURIComponent(options.url));
    let url = decodeURIComponent(options.url);
    let decodeUrl = decodeURI(url);
    loginUtil.redirectToH5({ page: decodeUrl });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(options) {}
});
