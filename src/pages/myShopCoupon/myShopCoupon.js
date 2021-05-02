
import { dateFormat } from '../../utils/util.js'
import { getBrandBaseInfo } from '../../utils/JDH-pharmacy/index'
import { getUserCenterBrandsCouponReq } from '../../api/index.js';

Page({
    data: {
        winWidth: 0,
        winHeight: 0,
        currentTab: 0,
        currentLabTab: 0,
        swiperHeight: 0,
        nextRowKey: null, //必须为null,为空字符串时数据不对（后期后端会修改）
        noMore: [false, false, false],
        notUseCouponList: [],
        alUseCouponList: [],
        expCouponList: [],
        canToUse: true,
        // returnIcon: true,
        pageSize: 99,
    },
    onLoad: function() {
        // log.set({
        //   urlParam: options,
        //   siteId: 'JA2018_5111046',
        //   account: wx.getStorageSync('jdlogin_pt_pin'),
        //   pageId: 'Mine_coupon'
        // })
        // var self = this;
        // let pagesList = getCurrentPages()
        // console.log(pagesList)
        // if (pagesList.length <= 1) {
        //   this.setData({
        //     returnIcon: false
        //   })
        // }
        wx.getSystemInfo({
            success: (res) => {
                this.setData({
                    swiperHeight:
                        res.windowHeight - (90 * res.windowWidth) / 750,
                });
            },
        });
    },
    onShow: function() {
        this.setData({
            //返回时
            noMore: [false, false, false],
            nextRowKey: null,
        });
        this.selectCoupon(0);
    },
    /**
     * 滑动切换tab
     */
    bindChange: function(e) {
        if (e.detail.source == "touch") {
            this.setData({
                currentLabTab: e.detail.current,
                currentTab: e.detail.current,
            });
            this.selectCoupon(e.detail.current);
        }
    },
    /**
     * 点击tab切换
     */
    swichNav: function(e) {
        // log.click({
        //   "eid":e.currentTarget.dataset.eid,
        //   "event":e
        // })
        var that = this;
        if (that.data.currentTab == e.currentTarget.dataset.currentLab) {
            return false;
        } else {
            that.setData({
                currentTab: e.currentTarget.dataset.currentLab,
                currentLabTab: e.currentTarget.dataset.currentLab,
            });
            that.selectCoupon(e.currentTarget.dataset.currentLab);
        }
    },
    selectCoupon(curr) {
        var self = this;
        curr = parseInt(curr);
        if (this.data.noMore[curr]) {
            return;
        }
        this.getUserCenterBrandsCoupon(curr);
    },
    async getUserCenterBrandsCoupon(curr) {
        let self = this;
        const { brandId } = await getBrandBaseInfo();
        getUserCenterBrandsCouponReq(
            brandId,
            this.data.nextRowKey,
            this.data.pageSize,
            curr
        )
            .then((res) => {
                res = res.data.brandsCouponUserDTOS;

                if (res.length == 0) {
                    return;
                }
                var nextRowKey = self.data.nextRowKey;
                self.setData({
                    nextRowKey: nextRowKey,
                });
                if (nextRowKey === null) {
                    var noMore = self.data.noMore;
                    noMore[curr] = true;
                    self.setData({
                        noMore: noMore,
                    });
                }
                for (var i = 0; i < res.length; i++) {
                    if (new Date().getTime() < res[i].startTime) {
                        //未开始 - 去看看
                        res[i].viewStatus = 0;
                        res[i].couponPutNumText = "去看看";
                    } else {
                        //已开始 - 立即使用
                        res[i].viewStatus = 1;
                        res[i].couponPutNumText = "立即使用";
                    }
                    res[i].endTime = dateFormat(
                        "YYYY.mm.dd",
                        new Date(res[i].endTime)
                    );
                    res[i].startTime = dateFormat(
                        "YYYY.mm.dd",
                        new Date(res[i].startTime)
                    );
                    res[i].brandsLogo = "https:" + res[i].brandsLogo;
                    res[i].couponAmount = res[i].couponAmount / 100;
                }
                switch (curr) {
                    case 0:
                        self.setData({
                            notUseCouponList: res,
                            // notUseCouponList: self.data.notUseCouponList.concat(res)
                        });
                        break;
                    case 1:
                        self.setData({
                            // alUseCouponList: self.data.alUseCouponList.concat(res)
                            alUseCouponList: res,
                        });
                        break;
                    case 2:
                        self.setData({
                            // expCouponList: self.data.expCouponList.concat(res)
                            expCouponList: res,
                        });
                }
            })
            .catch((err) => {});
    },
    lookCoupon(e) {
        // log.click({
        //   "eid":e.currentTarget.dataset.eid,
        //   "eparam":e.currentTarget.dataset.couponId,
        //   "event":e
        // })
        console.log(e.currentTarget.dataset);
        var couponId = e.currentTarget.dataset.couponId;
        var couponPutNum = e.currentTarget.dataset.couponPutNum;

        wx.navigateTo({
            url:
                "/pages/couponInfo/couponInfo?couponId=" +
                couponId +
                "&couponPutNum=" +
                couponPutNum,
        });
    },
    scrollCheck() {
        console.log("bottom");
        this.selectCoupon(this.data.currentTab);
    },
    stopprop(e) {
        return;
    },
    //   autoClick:log.autoClick
});  