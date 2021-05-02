import * as wxRequest from "../../../utils/util.js";
import loginUtil from "../../../pages/login/util.js";
import { getYJSNewPersonCouponReq, getYJSNotNewPersonCouponReq, drawJpassCouponReq } from '../../../api/index.js';
import { formatDate, getReturnPage,toh5 } from "../../../utils/JDH-pharmacy/index.js";
let fm = require('../../../libs/fmsdk/fm.min.js');
import { getPtKey } from "../../../utils/loginUtils.js"; 



const app = getApp();
Component({
  properties: {
    fromType: { //1:门店优惠券的药急送券；2：门店优惠券页面的到店券；3：门店首页优惠券
      type: Number
    },
    couponLists: {
      type: Object
    },
    YJSStoreId: {
      type: String
    },
    sepNumFront: {
      type: String
    },
    sepNumBack: {
      type: String
    },
    formatedStartDate: {
      type: String
    },
    formatedEndDate: {
      type: String
    },
    discountNum: {
      type: String
    },
    discountQuotaNum: {
      type: String
    }
  },
  data: {
    newCouponLists: {},
  },
  observers: {
    'couponLists': function (couponLists) {
      if (couponLists) {
        let startDate = formatDate(couponLists.beginTime, '.');
        let endDate = formatDate(couponLists.endTime, '.');
        let isInt = Number.isInteger(couponLists.couponAmount);
        let couponAmount = couponLists.couponAmount;
        let sepNumFront, sepNumBack, discountNum, discountQuotaNum = null;

        if (!isInt) {
          sepNumFront = couponAmount.toString().split(".")[0];
          sepNumBack = couponAmount.toString().split(".")[1];
        }
        if (couponLists.style == 3) {
          discountNum = JSON.parse(couponLists.discountDesc).info[0].discount * 10;
          discountQuotaNum = JSON.parse(couponLists.discountDesc).info[0].quota;
        }

        this.setData({
          startDate,
          endDate,
          isInt,
          sepNumFront,
          sepNumBack,
          discountNum,
          discountQuotaNum,
          newCouponLists: couponLists
        })
      }
    }
  },
  methods: {
    getEid() {
      return new Promise((resolve, reject) => {
        fm.getEid(function (res) {
					// 指纹信息接口 
					if(res.tk){
						wxRequest.httpsGet({
							url: '/JDHpharmacy-api',
							data: {
								functionId: "jdh_coupon_getFingerPrintInfo",
								appid: 'jdhunion',
								body: {
									bizKey: 'bce044c839bb9eb811aad5af18a629e199da4e13',
									token: res.tk
								}
							}
						}).then(res => {
							resolve(res.data.wechatEid);
						})
					}else{
						wx.showToast({
							title: '请求失败',
							icon: "none"
						});
					} 
        })
      })
    },

    updateBtn() {
      this.properties.couponLists.couponStatus = 2;//0去领取 2去使用
      this.setData({
        newCouponLists: this.properties.couponLists
      })
    },
    goGetBtn(e) { 
      let self = this; 
      let fromType = e.currentTarget.dataset.fromtype;
      let couponLists = e.currentTarget.dataset.couponlists;

      let ruleId = couponLists.ruleId;
      let couponKey = couponLists.couponKey;
      // let storeId = couponLists.storeId; //药急送优惠券返回来的storeId
      let couponId = couponLists.couponId;
      let activityId = couponLists.activityId;
      let venderId = couponLists.venderId;
      let selfStoreId = couponLists.selfStoreId; //门店优惠券返回的storeId 
      let activityType = couponLists.activityType;
      if (!getPtKey()) { //没有登录态
        const fromPageLevel = 1;
        wxRequest.globalLoginShow({
          data: {
            // fromPageLevel,//该值不传，或者传不等于1 的值。因为该页面为switchTab页面，需要走getJumpPageType
            returnpage: getReturnPage()
          }
        });
        return
      }else{
				wx.showLoading({								//显示 loading 提示框
					title: '请求中...',
					mask: true
				})
			}
      if (fromType == 1 || (fromType == 3 && couponLists.storeType == 1)) { //药急送 
        if (couponLists.shopCouponType && couponLists.shopCouponType == 4) { //如果是新人券 
          // 领取药急送新人优惠券接口
          getYJSNewPersonCouponReq(activityId, ruleId, venderId).then(res => {
            wx.hideLoading()					//隐藏 loading 提示框
            if (res.success) {
              wx.showToast({
                title: "领取成功"
              });
              self.updateBtn(); //更新按钮状态
            } else {
              wx.showToast({
                title: res.errMsg,
                icon: "none"
              });
            }
          })
        } else { //非新人券,普通券
          wxRequest.toGenerateFingerPrint()
          let JDA = wxRequest.getJda();
          let shshshfp = app.globalData.wxCookie.getCookie('shshshfp') || 'bc97c721833f223716ed784190e6e7c3';
          let shshshfpa = app.globalData.wxCookie.getCookie('shshshfpa') || 'ba861245-16b4-cb1c-d8e1-7eee995fd773-1603078661';
          let shshshfpb = app.globalData.wxCookie.getCookie('shshshfpb') || 'prQZWIZTECmqWySxyOuon6w==';
          self.getEid().then((res) => {
            let eid = res ? res : '7JHZUZ5Y7GGANOUIPLDG';
            // 领取药急送优惠券接口
            getYJSNotNewPersonCouponReq(couponKey, ruleId, shshshfp, shshshfpa, shshshfpb, eid, '-1', JDA).then(res => {
              wx.hideLoading()					//隐藏 loading 提示框
              if (res.success) {
                wx.showToast({
                  title: "领取成功"
                });
                self.updateBtn(); //更新按钮状态
              } else {
                wx.showToast({
                  title: res.errMsg,
                  icon: "none"
                });
              }
            })
          })
        }
      } else if (fromType == 2 || (fromType == 3 && couponLists.storeType == 2)) { //门店
        self.getEid().then((res) => {
          let eid = res ? res : '7JHZUZ5Y7GGANOUIPLDG';
          // 领取到店优惠券接口
          drawJpassCouponReq(selfStoreId, venderId, couponId, activityType, eid).then(res => {
            wx.hideLoading()					//隐藏 loading 提示框
            if (res.code == '0000') { //领取成功，刷新数据 
              wx.showToast({
                title: "领取成功"
              });
              self.updateBtn(); //更新按钮状态
            } else {
              wx.showToast({
                title: res.msg,
                icon: "none"
              });
            }
          })
        })
      }
    },
    goScanBtn(e) { //去看看按钮 
      let couponId = e.currentTarget.dataset.couponid;
      let couponPutNum = e.currentTarget.dataset.couponputnum;
      wx.navigateTo({
        url: '/pages/couponInfo/couponInfo?couponId=' + couponId + '&couponPutNum=' + couponPutNum
      })
    },
    goUseBtn(e) {
      let couponlists = e.currentTarget.dataset.couponlists;
      let fromType = e.currentTarget.dataset.fromtype;
      let allProduct = couponlists.allProduct;
      let venderId = couponlists.venderId;
      let couponId = couponlists.couponId;
      let couponPutNum = couponlists.couponPutNum;
      let storeId = e.currentTarget.dataset.yjsstoreid;

      if (fromType == 1 || (fromType == 3 && couponlists.storeType == 1)) { //药急送 
        if (allProduct) { //全部商品可用-跳到药急送门店主页 
          let url = `${app.diansongUrl}/store/${storeId}?venderid=${venderId}`;
          toh5(url) //主页 
        } else { //部分商品可用-跳到药急送商品页 
          let YJSurl = `${app.diansongUrl}/coupon/ware?storeid=${storeId}&venderid=${venderId}&batchId=${couponId}`;
          toh5(YJSurl) //商品页
        }
      } else if (fromType == 2 || (fromType == 3 && couponlists.storeType == 2)) {
        wx.navigateTo({
          url: '/pages/couponInfo/couponInfo?couponId=' + couponId + '&couponPutNum=' + couponPutNum
        })
      }
    } 
  }
});