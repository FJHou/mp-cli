/**
 * http://cf-b2b.jdcloud.com/pages/viewpage.action?pageId=5458458
 * 从商详纠错按钮，进入该页面，接受两个参数
 * itemId 商品id  必填
 * itemSource 商品来源 (80=cps(sourceChannel))
 */


var Api = require("../../utils/JDH-pharmacy/api.js");
var cfg = require("../../utils/JDH-pharmacy/config.js");
const app = getApp();

var api = new Api();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarData: {
      showCapsule: 1, // 返回按钮
      title: '商品纠错',
      show: false
    },
    navHeight: app.globalData.height,

    loading: false, // 加载商品问题 
    correctData: [], // 纠错列表数据
    errorCode: undefined, // 错误码
    errorRemark: '', // 问题描述

    showSuccessModal: false // 提交成功弹窗
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;

    let itemId = options.itemId || 1111;
    let itemSource = options.itemSource || undefined;

    if (!itemId) {
      wx.showToast({
        icon: "none",
        title: '缺少itemId参数',
      });
      return;
    }

    this.setData({
      itemId: itemId,
      itemSource: itemSource,
      loading: true
    }, () => {
      // 获取商品纠错列表,
      api.get('/item/correct/getDesc').then((res) => {
        let correctData = res.data && res.data.data || [];
        this.setData({
          loading: false,
          correctData: correctData,
          errorCode: correctData[0] && correctData[0].errorCode || undefined
        });
      });
    });
  },
  
  /**
   * 列表选择
   */
  onSelect: function(e){
    this.setData({
      errorCode: e.currentTarget.dataset.errorCode
    })
  },

  /**
   * 问题描述
   */
  textareaChange: function (e) {
      this.setData({
        errorRemark: e.detail.value
      });
  },

  /**
   * 提交
  */
  submit: function(){
    api.post('/item/correct/add', {
      errorCode: this.data.errorCode,
      itemId: this.data.itemId,
      itemSource: this.data.itemSource,
      errorRemark: this.data.errorRemark,
      nickName: wx.getStorageSync("userInfo").nickName, //  用户昵称
      authorType: 2 //  用户类型 1 商家 2 买家
    }).then((res)=>{
      if(res.code == '0'){
        this.setData({
          showSuccessModal: true
        });
      } else {
        wx.showToast({
          title: res.msg || '提交出错！',
          icon: 'none',
          duration: 2000
        });
      }
    }).catch((error)=>{
      console.log('提交出错-----', error);
      wx.showToast({
        title: '网络出错！',
        icon: 'none',
        duration: 2000
      });
    });
  },
  /**
   * 返回上一个页面
  */
  gotoPrevPage: function(){
    wx.navigateBack();
  }
})