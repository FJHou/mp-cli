import Router from "./router";
import config from "./config";
import { globalLoginShow } from "../../utils/util.js";
const { getPtKey } = requirePlugin("loginPlugin");
import { GWAjax } from "../../utils/api-member.js";
import {
    getBrandBaseInfo,
    getBaseUrlFromVisitSource,
    fetchIsReferenceUser,
    getMPQrCodeParams,
} from "../../utils/JDH-pharmacy/index";
import { wxInfo } from "../../utils/JDH-pharmacy/wxlog.js";
import { REFERENCE_USER_INFO_KEY } from "../../constants/index";
import { buildUrl, loginScene } from "../../utils/index";

const router = new Router(config);

router.beforeEach(async (to, from, next) => {
    // 拦截需要登陆的页面
    if (to.meta && to.meta.auth && !getPtKey()) {
        globalLoginShow({
            data: {
                fromPageLevel: to.fromPageLevel || 1,
                returnpage: to.returnpage,
            },
        });
    } else {
        /**
         * 需求背景：
         * 为了提升用户体验，当未登录用户点击会员卡跳转的时候会跳转登录页。同时把returnUrl也传了过去，但是这时候
         * 并不知道用户是否是会员。所以这里进行拦截，如果是从登录跳转到addVip界面的路由都走这个拦截器。请求会员通
         * 接口后进行后续跳转逻辑
         */
        if (
            to.path === "pages/addVip/addVip" &&
            from.path === "pages/login/index/index"
        ) {
            const { brandId, bizId } = await getBrandBaseInfo();
            wxInfo("这里是路由拦截页的brandId", brandId);
            wxInfo("这里是路由拦截页的bizId", bizId);
            GWAjax({
                functionName: "CardExportService.getCustomerCardInfo",
                data: {
                    brandId,
                    bId: bizId,
                },
                success: async (res) => {
                    res = res.data;
                    if (res.code === "0" && res.data) {
                        const { customerLevel = "" } = res.data.data || {};
                        let baseUrl = null;
                        const app = getApp();
                        let options = app.globalData.newOptions;
                        let visitSource = app.globalData.visitSource;
                        // 通过扫码过来的
                        // 2扫零售助手小程序码进入会员页；3零售助手分享的卡片进入会员页；6零售助手加入会员二维码进入会员页
                        if (
                            visitSource == 2 ||
                            visitSource == 3 ||
                            visitSource == 6
                        ) {
                            baseUrl = await getBaseUrlFromVisitSource(
                                visitSource,
                                options
                            ); //通过访问来源和入参得到即将跳转的url
                            next({
                                url: baseUrl,
                            });
                        } else {
                            // 点击加入会员过来的
                            if (customerLevel) {
                                //** 是会员的处理逻辑 **/
                                wx.switchTab({
                                    url: "/pages/newShop/shopFront",
                                });

                                if (loginScene.get() === "fresherCoupon") {
                                    setTimeout(() => {
                                        wx.showToast({
                                            title:
                                                "您已是老朋友，无法再领取入会礼包了~",
                                            icon: "none",
                                            duration: 2500,
                                        });
                                    }, 300);
                                }
                            } else {
                                //** 非会员的处理逻辑 **/
                                const url = buildUrl({
                                    url: "/pages/addVip/addVip",
                                    query: {
                                        brandId,
                                        bId: bizId,
                                        storeId: app.globalData.storeId,
                                    },
                                });

                                next({ url });
                            }
                        }
                    } else {
                        next();
                    }
                },
                error: (err) => {
                    wx.showToast({
                        title: "网络异常,请稍后再试",
                        icon: "none",
                        duration: 2000,
                    });
                },
            });
        } else if (to.path === "pages/distributionBePromoter/bePromoter") {
            // 每次去成为推广者之前都进行判断，如果已经是推广者，那么自动跳转到推广中心
            try {
                const referenceUser = await fetchIsReferenceUser();
                referenceUser
                    ? next({
                          url:
                              "/pages/distributionPromotionCenter/promotionCenter",
                      })
                    : next();
            } catch (err) {
                next();
            }
        } else {
            next();
        }
    }
});
