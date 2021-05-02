// pages/components/imgShare/imgShare.js
import { generateQrCode } from "../../api/index";
import {getCurrentRouter} from '../../utils/JDH-pharmacy/index'
const plugin = requirePlugin("loginPlugin");
const pagesType = {
  1: {
    path: "pages/customerCouponBag/customerCouponBag",
    playbillSrc:
      "https://thunder.jd.com/jpass/img/share_customer_coupon_bag.jpg",
  },
  2: {
    path: "pages/activityInfo/activityInfo",
    playbillSrc: "https://thunder.jd.com/jpass/img/share_activity_info.jpg",
  },
  3: {
    path: "pages/addVip/addVip",
    playbillSrc: "https://thunder.jd.com/jpass/img/share_addvip.jpg",
  },
};
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    bId: {
      type: Number,
      value: "",
    },
    brandId: {
      type: Number,
      value: "",
    },
    type: {
      type: Number,
      value: "",
    },
    shareChainId: {
      type: Number,
      value: "",
    },
    objectId: {
      type: Number,
      value: "",
    },
    brandLogo: {
      type: String,
      value: "",
    },
    brandName: {
      type: String,
      value: "",
    },
    userName: {
      type: String,
      value: "",
    },
    activityName: {
      type: String,
      value: "",
    },
    employeeId: {
      type: String,
      value: "",
    },
    qrCodeType: {
      type: String,
      value: "",
    },
    channel: {
      type: Number,
      value: "",
    },
    storeId: {
      type: Number,
      value: "",
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    playbill: "",
    showPlaybill: false,
  },

  pageLifetimes: {
    show() {
      this.resolveOptions();
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
   async resolveOptions() {
      const { route, options } = getCurrentRouter();
      const defaultTitleMap = {
        "pages/addVip/addVip": "邀您免费领取会员卡",
        "pages/customerCouponBag/customerCouponBag":
          "邀您领取专属优惠券",
      };
      let query = {};
      // 兼容分享连逻辑。由于这里不清楚全渠道的逻辑，这里做一下兼容。效果和分享到朋友圈一致。
      if (options.shareChainId) {
        query = options;
        query.fromPin = plugin.getPtKey();
        query.fromOpenId =await app.getOpenId();
        query.type = 2;
        // 删除无用字段
        delete options.pt_key;
        delete options.route;
      } else {
        query.brandId = options.brandId;
        query.bId = options.bId;
      }

      return {
        defaultTitle: defaultTitleMap[route],
        options: query,
      };
    },

    async drawImg() {
      wx.showLoading({
        title: "生成海报中",
      });

      const { defaultTitle, options } = await this.resolveOptions();
      // 这里将route设置为1后，用户扫码小程序码才不会在用户端展示和导购相同的界面（分享遮罩）
      const params = {
        url: pagesType[this.data.type].path,
        wxAppId: app.globalData.appid,
        ...options,
      };

      generateQrCode(params)
        .then(([qrCodeUrl, bGImgUrl]) => {
          const info = {
            qrCodeUrl,
            bGImgUrl,
            title: this.data.userName, // 导购员名字
          };
          const poster = this.selectComponent("#poster");
          poster.setDefaultData({
            defaultTitle,
          });
          if (poster) {
            poster.makerPoster(info).then(() => {
              wx.hideLoading();
            });
          }
        })
        .catch((err) => {
          console.error(err);
          wx.hideLoading();
        });
    },
  },
});
