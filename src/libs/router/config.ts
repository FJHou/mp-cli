

export default {
  routes: [
    /* 不需要登录访问的页面 */
    {
      path: "pages/wepay/wepay",
      meta: {
        auth: false,
      },
    },
    {
      path: "pages/shopCoupon/shopCoupon",
      meta: {
        auth: false,
      },
    },
    {
      path: "pages/personalHealth/personalHealth",
      meta: {
        auth: false,
      },
    },
    {
      path: "pages/login/index/index",
      meta: {
        auth: false,
      },
    },
    {
      path: "pages/upgrade/upgrade",
      meta: {
        auth: false,
      },
    },
    {
      path: "pages/login/web-view/web-view",
      meta: {
        auth: false,
      },
    },
    {
      path: "pages/login/wv-common/wv-common",
      meta: {
        auth: false,
      },
    },
    {
      path: "pages/shopList/shopList",
      meta: {
        auth: false,
      },
		},
		{
			path: "pages/record/refundDetail/refundDetail",
			meta: {
				auth: false,
			}
		},
    {
      path: "pages/webview/webview",
      meta: {
        auth: false,
      },
    },
    {
      path: "pages/newShop/shopFront",
      meta: {
        auth: false,
      },
    },
    {
      path: "pages/location/location",
      meta: {
        auth: false,
      },
    },
    /* 需要登录访问的页面 */

    {
      path: "pages/addressul/addressul",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/protocolJd/protocolJd",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/wechatpay/wechatpay",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/skuList/skuList",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/wxmm/wxmm",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/orderTrack/orderTrack",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/record/record",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/customerCouponBag/customerCouponBag",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/couponInfo/couponInfo",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/myShopCoupon/myShopCoupon",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/memberCode/memberCode",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/couponRetailStore/couponRetailStore",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/cardInfo/cardInfo",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/addVip/addVip",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/order/order",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/orderDetail/orderDetail",
      meta: {
        auth: true,
      },
    },

    {
      path: "pages/address/address",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/coupon/coupon",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/coupon/allCoupon",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/coupon/getCoupon/getCoupon",
      meta: {
        auth: true,
      },
    },

    {
      path: "pages/myFeedback/myFeedback",
      meta: {
        auth: true,
      },
		},
		{
      path: "pages/distributionBePromoter/bePromoter",
      meta: {
        auth: true,
      },
    },
    {
      path: "pages/distributionPromotionCenter/promotionCenter",
      meta: {
        auth: true,
      },
		},
		{
			path: "pages/distributionInviteFan/distributionInviteFan",
			meta: {
        auth: true,
      },
		},
		{
			path: "pages/distributionSearchList/distributionSearchList",
			meta: {
        auth: false,
      },
		},
		{
			path: "pages/distributionGoodDetail/distributionGoodDetail",
			meta: {
				auth: false
			}
		},
		{
			path: "pages/distributionIconDetail/distributionIconDetail",
			meta: {
				auth: false
			}
		},
    {
      path: "pages/chooseaddress/chooseaddress",
      meta: {
        auth: true,
      },
		}, 
		{
			path: "pages/distributionIncomeDetails/distributionIncomeDetails",
			meta: {
				auth: true
			},
		},
		{
			path: "pages/distributionIncomeWithdraw/distributionIncomeWithdraw",
			meta: {
				auth: true
			},
		},
		{
			path: "pages/distributionFanManagement/distributionFanManagement",
			meta: {
				auth: true
			},
		},
		{
			path: "pages/distributionMoneyReg/distributionMoneyReg",
			meta: {
				auth: true
			},
		},
		{
			path: "pages/distributionSetBank/distributionSetBank",
			meta: {
				auth: true
			},
		},
		{
			path: "pages/distributionSettleRecord/distributionSettleRecord",
			meta: {
				auth: true
			},
		},
		{
			path: "pages/distributionWithdrawRecord/distributionWithdrawRecord",
			meta: {
				auth: true
			},
		},{
			path: "pages/distributionProtocol/distributionProtocol",
			meta: {
				auth: true
			},
		},{
			path:"pages/distributionMoneyHelp/distributionMoneyHelp",
			meta: {
				auth: false
			}
		}

  ],
};
