// pages/memberCode/memberCode.js
const memberCode = requirePlugin("memberCode");
const plugin = requirePlugin("loginPlugin");
import pluginUtils from "../login/util.js";
// const log = require('../../utils/weixinAppReport.js').init()
import * as util from "../../utils/util.js";
import * as API from "../../utils/api-member.js";
import { getBrandBaseInfo } from '../../utils/JDH-pharmacy/index'
const APP = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isFirstShow: true,
    status: false,
    userCaptureScreen: "",
    load: false,
    isAgree: false,
    canClick: true,
    check: true,
    ifSet: false,
    score: 0,
    userImgUrl: "",
    userName: "",
    // returnIcon: true,
    couponDialogShow: false,
    dialogCouponList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    // let pagesList = getCurrentPages()
    // if (pagesList.length <= 1) {
    //   this.setData({
    //     returnIcon: false
    //   })
    // }
    this.setData({
      options: options,
    });
    // log.set({
    //   urlParam: options,
    //   siteId: 'JA2018_5111046',
    //   account: wx.getStorageSync('jdlogin_pt_pin'),
    //   pageId: 'JPASSMember_code'
    // });
    wx.getScreenBrightness({
      success(res) {
        self.setData({
          screenBrightness: res.value,
        });
      },
    });

    if (plugin.getPtKey()) {
      wx.setStorageSync(
        "jdlogin_pt_key",
        plugin.getPtKey()
      );
      if (wx.getStorageSync("oP_key")) {
        self.initData();
      } else {
        API.getSessionId(function (res) {
          if (res.data.success) {
            self.initData();
          }
        });
      }
    } else {
      wx.removeStorageSync("sessionId");
      wx.removeStorageSync("userInfo");
      wx.removeStorageSync("jdUserInfo");
      wx.removeStorageSync("jdlogin_pt_key");
      wx.removeStorageSync("jdlogin_pt_pin");
      wx.removeStorageSync("jdlogin_pt_token");

      var returnpage = "/pages/memberCode/memberCode";
      API.login("", returnpage);
    }

    wx.onUserCaptureScreen(function (e) {
      var pages = getCurrentPages();
      var currentPage = pages[pages.length - 1].route;
      if (
        currentPage == "pages/memberCode/memberCode"
      ) {
        self.setData({
          userCaptureScreen: "capture",
        });
      }
    });
  },

  initData() {
    if (wx.getStorageSync("fromWxSign")) {
      var memberCodeData = wx.getStorageSync("memberCodeData");
      memberCodeData.fromWxSign = true;
      wx.setStorageSync("memberCodeData", memberCodeData);
      wx.removeStorage({
        key: "fromWxSign",
      });
      this.showMemberCode();
    } else {
      if (wx.getStorageSync("toMemberCode")) {
        // this.setData({
        //   asyncInitMemberCode:true
        // })
        wx.removeStorageSync("toMemberCode");
        plugin.transferTokenToLogin({
          tokenkey: options.tokenkey,
          callback: function (res) {
            if (res.data.err_code == 0) {
              wx.setStorageSync("jdlogin_pt_key", res.data.pt_key);
              API.getSessionId(function (res) {
                self.initMemberCodeData();
              });
            }
          },
        });
      } else { 
        this.initMemberCodeData();
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // log.pv({
    //   pname: 'JPASSMember_code'
    // });
    // if(!this.data.asyncInitMemberCode){
    //   this.showMemberCode()
    // }
    if (!this.data.isFirstShow) {
      this.initMemberCodeData();
    } else {
      this.setData({
        isFirstShow: false,
      });
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    wx.setScreenBrightness({
      value: this.data.screenBrightness,
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.setScreenBrightness({
      value: this.data.screenBrightness,
    });
  },
  jdpayPluginCallback: function (options) {
    console.log("免密options:", options);
    var self = this;

    switch (options.code) {
      case 0:
        let jumpUrl = options.url;

        if (jumpUrl == "onlychecksales") {
          this.judgeAndDrawNewCoupon();
        } else {
          console.log('pluginUtils.navigateToH5');
          pluginUtils.navigateToH5({
            page: encodeURI(options.url),
            success: () => {
              setTimeout(function () {
                self.setData({
                  status: false,
                  check: true,
                  ifSet: false,
                });
              }, 500);
            },
          });
        }
        // wx.navigateTo({
        //   url: '/pages/webview/webview?murl='+encodeURIComponent(encodeURI(options.url)),
        //   success:function(){
        //     setTimeout(function () {
        //       self.setData({
        //         status: false,
        //         check: true,
        //         ifSet: false
        //       })
        //     }, 500)
        //   }
        // })
        break;
      // 唤起免密支付
      case 1:
        wx.setStorageSync("miniPayParam", options.miniPayParam);
        wx.redirectTo({
          url: "/pages/wxmm/wxmm",
          success: function () {
            setTimeout(function () {
              self.setData({
                status: false,
                check: true,
                ifSet: false,
              });
            }, 500);
          },
        });
        break;
      // FIXME：
      case 2:
        wx.removeStorageSync("sessionId");
        wx.removeStorageSync("userInfo");
        wx.removeStorageSync("jdUserInfo");
        wx.removeStorageSync("jdlogin_pt_key");
        wx.removeStorageSync("jdlogin_pt_pin");
        wx.removeStorageSync("jdlogin_pt_token");
        // TODO:产品确认跳转逻辑
        var returnpage = "/pages/newShop/shopFront";
        API.login("switchTab", returnpage);
        break;
      case 5:
        self.setData({
          status: false,
          ifSet: false,
        });
        break;
      default:
        wx.navigateBack({});
    }
  },
  tapSetting() {
    this.setData({
      ifSet: true,
    });
  },
  lookAgree() {
    wx.navigateTo({
      url: "/pages/protocolJd/protocolJd",
    });
  },
  changeAgree() {
    this.setData({
      isAgree: !this.data.isAgree,
    });
  },
  kt(e) {
    var self = this;
    // log.click({
    //   'event': e,
    //   'eid': 'affirm_member_code'
    // })
    if (this.data.isAgree && this.data.canClick) {
      API.GWAjax({
        functionName: "JrCustomerExportService.signJpass",
        success: (res) => {
          res = res.data;
          if (res.code == 0 && res.data && res.data.success) {
            self.setData({
              status: true,
              isAgree: false,
            });
            var param = wx.getStorageSync("memberCodeData");
            memberCode.init(param, self.jdpayPluginCallback);
          } else {
            wx.showToast({
              title: "开通失败，请重试",
              icon: "none",
              duration: 3000,
            });
          }
        },
        error: (err) => {
          wx.showToast({
            title: "开通失败，请重试",
            icon: "none",
            duration: 3000,
          });
        },
      });
    }
  },
  async initMemberCodeData() {
		const {memberSource, memberMianmi = false} = await getBrandBaseInfo()
		var self = this;
		let openId = await APP.getOpenId();
    let param = {
      pt_key: plugin.getPtKey(),
      openId: openId, //获取opendID
      forPayResult: true,
      color: "#f0250f",
      ifCoercion: memberMianmi, // 是不是需要开通免密支付,false不需要强制开通免密就能支付
      ifNeedOpen: true,
      fromWxSign: self.data.options.fromWxSign == "false" ? false : true,
      setBtn: false,
      appSource: memberSource, //需要申请
      couponIds: self.data.options.couponIds || "",
      locInfo: self.data.options.locInfo || "",
      SET: true,
    };
    // 请求品牌是否在免密白名单里，如果只有一个品牌这里的逻辑可以注释掉。和产品确认大药房品牌这里是否在白名单里了
    if (self.data.options.brandId && self.data.options.bId) {
      API.GWAjax({
        functionName: "JrCustomerExportService.isInNoSecretWhiteList",
        data: {
          brandId: self.data.options.brandId,
          bId: self.data.options.bId,
        },
        success: (res) => {
          res = res.data;
          // if (res.code == 0 && res.data && res.data.success) {
          //   param.ifCoercion = false
          // } else {
          //   param.ifCoercion = false
          // }
          wx.setStorageSync("memberCodeData", param);
          self.showMemberCode();
        },
      });
    } else {
      wx.setStorageSync("memberCodeData", param);
      // if (self.data.asyncInitMemberCode) {
      self.showMemberCode();
      // }
    }
  },
  showMemberCode() {
    var self = this;
    // if (this.data.asyncInitMemberCode) {
    //   this.setData({
    //     asyncInitMemberCode:false
    //   })
    // }
    API.GWAjax({
      functionName: "JrCustomerExportService.toPay",
      success: (res) => {
        res = res.data;
        if (res.code == 0 && res.data) {
          if (res.data.code != 1) {
            self.setData({
              status: true,
              check: false,
            });
            var param = wx.getStorageSync("memberCodeData");
            memberCode.init(param, self.jdpayPluginCallback);
          } else {
            self.setData({
              status: false,
              check: false,
            });
          }
        } else {
          wx.showToast({
            title: "网络错误，请重试",
            icon: "none",
            duration: 3000,
          });
        }
      },
      error: (err) => {
        wx.showToast({
          title: "网络错误，请重试",
          icon: "none",
          duration: 3000,
        });
      },
    });
    API.getJDInfo({
      success: (res) => {
        self.setData({
          userImgUrl: res.data.data.userImgUrl,
          userName: res.data.data.userName,
          score: res.data.data.score,
        });
      },
    });
  },
  judgeAndDrawNewCoupon() {
    API.GWAjax({
      functionName: "CouponExportService.getBatchIdList",
      success: (res) => {
        console.log("获取批次信息", res);
        res = res.data;
        if (res.code == 0 && res.data && res.data.success) {
          let batchId = res.data.data[0];
          API.GWAjax({
            functionName:
              "NewUserActivityExportService.checkPermissionAndGetBatchInfo",
            data: {
              couponInfoParam: {
                batchId: batchId,
              },
              newUserParam: {
                channel: "jpass_applet",
              },
            },
            success: (res) => {
              console.log("是否符合规则", res);
              res = res.data;
              if (res.code == 0 && res.data && res.data.success) {
                // if (res.code == 0 && res.data ) {
                var dialogCoupon = {
                  batchId: res.data.data.batchId,
                  name: res.data.data.couponTitle,
                  value: res.data.data.discount,
                  rule: res.data.data.quota,
                  startDate: util.formatTime(
                    new Date(res.data.data.beginTime),
                    2
                  ),
                  endDate: util.formatTime(new Date(res.data.data.endTime), 2),
                };
                this.setData({
                  couponDialogShow: true,
                  dialogCouponList: [dialogCoupon],
                });
              }
            },
            fail: (res) => { },
          });
        }
      },
      fail: (res) => { },
    });
  },
  closeDialog() {
    this.setData({
      couponDialogShow: false,
    });
  },
});
