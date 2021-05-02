// pages/cardInfo/cardInfo.js
//skz
import * as API from '../../utils/api-member.js'
import { wxParse } from "../../libs/wxParse/wxParse.js";
import loginUtil from "../login/util.js";
import { getBrandBaseInfo } from '../../utils/JDH-pharmacy/index'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        param: {},
        showliber: false,
        brandId: '',
        liberty: {},
        status: false,
        formtype: "local",
        openRule: false,
        ruleProAnimation: {},
        shopLoad: true,
        list: [],
        returnIcon: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var self = this;
        let pagesList = getCurrentPages()
        if (pagesList.length <= 1) {
            this.setData({
                returnIcon: false
            })
        }
        this.setData({
            param: {
                brandId: options.brandId || '',
                bId: options.bId || '',
                brandsId: options.brandsId || ''
            }
        })
        if (options.brandId) {
            wx.setStorageSync('brandId', options.brandId);
        }
        if (options.bId) {
            wx.setStorageSync('bId', options.bId);
        }

        var obj = {};
        if (self.data.param.brandsId) {
            obj = {
                brandsId: self.data.param.brandsId
            }
        } else {
            obj = {
                brandId: self.data.param.brandId,
                bizId: self.data.param.bId
            }
        }
        API.GWAjax({
            functionName: 'OpenCardActivityExportService.query',
            data: obj,
            success: res => {
                res = res.data
                if (res.code == 0 && res.data && res.data.success) {
                    var data = res.data.data.couponList;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].activityType == 1 && data[i].couponList.length != 0) {
                            //有开卡大礼包
                            self.setData({
                                memHasGift: true,
                                memCouponList: data[i].couponList,
                                memActivityid: data[i].activityId,
                                memActivitytype: data[i].activityType
                            })
                        }
                        if (data[i].activityType == 2 && data[i].couponList.length != 0) {
                            //有会员日大礼包
                            self.setData({
                                hasGift: true,
                                couponList: data[i].couponList,
                                activityid: data[i].activityId,
                                activitytype: data[i].activityType
                            })
                        }
                    }
                }
            }
        })

        if (!wx.getStorageSync('jdUserInfo')) {
            API.getJDInfo({
                success: res => {
                    wx.setStorageSync('jdUserInfo', res.data.data)
                }
            })
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        // log.pv({
        //     pname: 'card_information',
        //     pparam: this.data.param.brandId
        // });

        var _this = this;
        var obj = {};
        if (this.data.param.brandsId) {
            obj = {
                brandsId: _this.data.param.brandsId
            }
        } else {
            obj = {
                brandId: _this.data.param.brandId,
                bId: _this.data.param.bId
            }
        }
        API.GWAjax({
            functionName: 'CardExportService.getCustomerCardInfo',
            data: obj,
            success: res => {
                var statuscode = res.statusCode.toString()[0];
                if (statuscode == 4 || statuscode == 3 || statuscode == 5) {
                    wx.showToast({
                        title: '网络异常,请稍后再试',
                        icon: 'none',
                        duration: 2000
                    });
                    return;
                }
                res = res.data
                if (res.code == 0 && res.data && res.data.success) {
                    var result = res.data;
                    if (result.data.brandId) {
                        wx.setStorageSync('brandId', result.data.brandId);
                    }
                    if (result.data.bid) {
                        wx.setStorageSync('bId', result.data.bid);
                    }
                    // API.getLocation({
                    //     success: function (res) {
                    //         API.queryNearbyStores({
                    //             data: {
                    //                 pageNo: 0,
                    //                 pageSize: 1,
                    //                 longitude: res.longitude,
                    //                 latitude: res.latitude,
                    //                 bId: result.data.bid,
                    //                 brandId: result.data.brandId
                    //             },
                    //             success: res => {
                    //                 if (res.code == 0 && res.data && res.data.success) {
                    //                     const list = res.data.data.data || [];
                    //                     const storeIds = list.length >= 1 ? list[0].storeId : ''

                    //                     _this.setData({
                    //                         list,
                    //                         shopLoad: false,
                    //                         storeIds
                    //                     })
                    //                 }
                    //             }
                    //         })
                    //     },
                    //     fail(e) {
                    //         API.queryNearbyStores({
                    //             data: {
                    //                 pageNo: 0,
                    //                 pageSize: 1,
                    //                 bId: result.bid,
                    //                 brandId: result.brandId
                    //             },
                    //             success: res => {
                    //                 if (res.code == 0 && res.data && res.data.success) {
                    //                     var res = res.data.data.data;
                    //                     if (res.length >= 1) {
                    //                         res = res.slice(0, 1)
                    //                     }
                    //                     _this.setData({
                    //                         list: res,
                    //                         shopLoad: false
                    //                     })
                    //                 } else {
                    //                     _this.setData({
                    //                         list: [],
                    //                         shopLoad: false
                    //                     })
                    //                 }
                    //             },
                    //             error: err => {
                    //                 _this.setData({
                    //                     list: [],
                    //                     shopLoad: false
                    //                 })
                    //             }
                    //         })
                    //     }
                    // })
                    _this.setData({
                        liberty: result.data
                    })

                } else {
                    wx.showToast({
                        title: res.data.message || '程序开了个小差~~',
                        icon: 'none',
                        duration: 2000
                    })
                }
            },
            error: err => {
                wx.showToast({
                    title: '网络异常,请稍后再试',
                    icon: 'none',
                    duration: 2000
                });
                return;
            }
        })


    },
    toggle(e) {
        var _this = this;
        this.setData({
            showliber: !_this.data.showliber
        })
    },
    openGift(e) {
        var type = e.currentTarget.dataset.type;

        // log.click({
        //     "eid": e.currentTarget.dataset.eid,
        //     "eparam": this.data.param.brandId || this.data.param.brandsId,
        //     "event": e
        // })
        this.setData({
            [type]: true
        })
    },
    closegift(e) {
        if (e.detail.draw) {
            if (e.detail.activitytype == 1) {
                this.setData({
                    memHasGiftStatus: false,
                    memHasGift: false
                })
            } else {
                this.setData({
                    hasGift: false,
                    hasGiftStatus: false
                })
            }
        } else {
            if (e.detail.activitytype == 1) {
                this.setData({
                    memHasGiftStatus: false
                })
            } else {
                this.setData({
                    hasGiftStatus: false
                })
            }

        }

    },
    openRulePro() {
        var that = this;
        var animation = wx.createAnimation({
            transformOrigin: "50% 50%",
            duration: 300,
            timingFunction: "ease-in-out",
            delay: 0
        })
        animation.bottom(0).step()
        this.setData({
            ruleProAnimation: animation.export(),
            openRule: true
        })
        var obj = {}
        if (this.data.param.brandsId) {
            obj = {
                brandsId: this.data.param.brandsId
            }
        } else {
            obj = {
                brandId: this.data.param.brandId,
                bId: this.data.param.bId
            }
        }
        API.GWAjax({
            functionName: 'CardExportService.getUpgradeRule',
            data: obj,
            success: res => {
                if (res.data.code == 0) {
                    var article = res.data.data.data
                    if (article) {
                        wxParse('article', 'html', article, that, 5);
                    }
                }
            }
        })
    },
    closeRulePro() {
        this.setData({
            openRule: false
        })
    },
    /**
     * 查看店铺积分
     */
    async checkMembersPoint(e) {
        const { memberShipId } = await getBrandBaseInfo()

        const url = `https://shopmember.m.jd.com/member/membersPoint?venderId=${memberShipId}&shopId=undefined`
        loginUtil.navigateToH5({ page: url });
    },
    /**
     * 查看等级特权
     */
    checkLevelRight(e) {
        // const url = (e.currentTarget.dataset.url)
        // loginUtil.navigateToH5({ page: url });
    }
})
