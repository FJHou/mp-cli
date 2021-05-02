import { appLaunch, appShow } from "./utils/appBase/appBase.js";
import loginUtil from "./pages/login/util.js";
import { queryBrandBaseInfoByAppId } from "./api/index";
import { reportVisitSourceByOptions } from "./logs/index";

import { API } from "./api/config";
import { APPID, WX_VERSION, TABBAR_PATH } from "./constants/index";
import kGetCleanOpenid from "./utils/getOpenid";
import getLocation from "./utils/getLocation";
const cfg = require("./utils/JDH-pharmacy/config.js");
import { APPType } from "./types/index";

import "./libs/router/index";
import { wxError } from "./utils/JDH-pharmacy/wxlog";

if (!Promise.prototype.finally) {
    Promise.prototype.finally = function(callback: () => any) {
        let P = this.constructor as any;
        return this.then(
            (value) => P.resolve(callback()).then(() => value),
            (reason) =>
                P.resolve(callback()).then(() => {
                    throw reason;
                })
        );
    };
}

App<APPType>({
    log: {},
    onLaunch(options) {
        // 通过开普勒接口获取openId
        kGetCleanOpenid(this);
        this.setSystemInfo();
        this.queryBrandBaseInfoByAppId();
        this.setGlobalStaticFunc();
        appLaunch(options || {}, this);
    },

    onShow(options) {
        appShow(options || {}, this);
        this.redirectToMemberCodeIfOpenWxPay(options);
        this.globalData.newOptions = options;
        reportVisitSourceByOptions(options, this); //记录访问来源
    },
    //onError:小程序发生脚本错误或 API 调用报错时触发   必须在 app.js 中调用，必须调用且只能调用一次
    onError(msg) {
        wxError(`app.js中onError报错: ${msg}`);
    },
    /**
     * 获取小程序及品牌关系数据
     */
    queryBrandBaseInfoByAppId() {
        queryBrandBaseInfoByAppId(APPID).then((res) => {
            if (res.code === "0000" && res.data) {
                const globalConfig = Object.create(null);
                Object.keys(res.data).forEach((key) => {
                    const value = res.data[key];
                    if (key === "wxAppId") {
                        key = "appid";
                    }
                    if (key === "wxVersion") {
                        key = "wxversion";
                    }
                    this.globalData[key] = value;
                    globalConfig[key] = value;
                });
                wx.setStorageSync("PARMACY_GLOBAL_CONFIG", globalConfig);
            }
        });
    },
    /**
     * 设置系统信息，主要用来设置自定义头部导航的高度
     */
    setSystemInfo() {
        try {
            const res = wx.getSystemInfoSync();
            this.setTopNavigator(res);
            this.setPhoneModel(res);
        } catch (e) {
            console.error(e);
            // TODO:顶部导航获取失败兜底方案
        }
    },
    /**
     * @description 设置顶部导航
     */
    setTopNavigator({statusBarHeight}) {
        const menuButtonRect = wx.getMenuButtonBoundingClientRect();
        const { height, top } = menuButtonRect;

        this.globalData.statusBarHeight = statusBarHeight;
        this.globalData.titleBarHeight =
            height + 2 + (top - statusBarHeight) * 2;
        this.globalData.menuButtonRect = menuButtonRect;
    },
    /**
     * 机型适配
     */
    setPhoneModel: function({ model }) {
        if (
            model.indexOf("iPhone X") > -1 ||
            (model.indexOf("iPhone") > -1 && model.indexOf("unknown") > -1)
        ) {
            this.globalData.isIpx = true;
        }
    },
    /**
     * 设置全局静态方法
     */
    setGlobalStaticFunc() {
        this.globalData.getImgUrl = function(url: string) {
            if (
                url.indexOf("http") === -1 &&
                url.indexOf("360buyimg.com") === -1
            ) {
                return API.STATIC_URL + "/popshop/" + url;
            }
            return url;
        };
    },

    toShareUrl(options, self) {
        let openSource = true;
        if (options.openSource === "share") {
            if (options.h5_url) {
                openSource = false;
                loginUtil.navigateToH5({
                    page: options.h5_url,
                } as any);
            }
        }
        self.setData({
            openSource,
        });
    },
    /**
     * 开微信免密回调
     */
    redirectToMemberCodeIfOpenWxPay(options) {
        var res = options;
        if (res && res.scene === 1038 && wx.getStorageSync("isHasOnceScene")) {
            // 场景值1038：从被打开的小程序返回
            wx.removeStorageSync("isHasOnceScene");
            const { appId } = res.referrerInfo!;
            if (appId == "wxbd687630cd02ce1d") {
                // appId为wxbd687630cd02ce1d：从签约小程序跳转回来
                wx.setStorageSync("fromWxSign", true);
                wx.redirectTo({
                    url: "/pages/memberCode/memberCode",
                });
            }
        }
    },
    /**
     * 获取openId 改动这里会直接影响到支付逻辑，请谨慎修改
     */
    getOpenId: kGetCleanOpenid,
    // 获取地址信息
    getLocation: getLocation,

    globalWxclient: "", //tempwx代表模板小程序，传空表示其他

    globalData: {
        /** 全局配置 **/
        brandId: "",
        bizId: "",
        adGroupId: "",
        shopIconId: "", //商城iconId
        copyWriting: "", // 兜底文案
        memberShipId: "",
        showFloorMap: {
            storePicture: true,
            storeHotGoods: true,
            storeClassifyGoods: true,
            storeService: true,
            member: true,
            jumpJdhApplet: true,
            storeQualification: true,
            storeCoupons: true,
        },
        appid: APPID, //微信小程序appid(必填)，该值请与微信开发者工具中配置的appid保持一致，可在微信mp.weixin.com后台进行获取
        wxSecret: "",
        wxversion: WX_VERSION, //开普勒小程序appkey(必填)，登录http://kepler.jd.com/，登录后申请应用，获得appkey
        unionid: "", //如果该小程序有默认unionid，填写默认unionid，否则传空
        channel: "go",
        /** 系统设置 **/
        statusBarHeight: null,
        titleBarHeight: null,
        navigateBarHeight: null,
        isIphoneX: false, //iphoneX适配标识
        menuButtonRect: {},
        platform: "",
        tabBarPathArr: TABBAR_PATH,
        isIpx: false,
        // FIXME: 引用appBase.js
        kxcxtype: "3", //sendpay91位打标 1-导购小程序；2-京商城小程序；3-事业部小程序（代码复用如无特殊情况，请填写3不要修改）
        source: "3_4", //拼购sendpay91位打标 3_2-导购小程序；3_3-京商城小程序；3_4-事业部小程序（代码复用如无特殊情况，请填写3_4不要修改）
        wxappStorageName: "jdwcx", //除了值得买以外的缓存名字都是jdwcx（必填）
        // FIXME: 引用shopFront appBase
        scene: "1001",
        // FIXME: 引用文件[getCoupon.js]
        wxapp_type: "3", //wq拼购商详样式参数，开普勒小程序默认传3
        // FIXME: 引用文件allCoupon.js
        idxPagePath: "/pages/newShop/shopFront",
        // FIXME: 引用文件wv-common.js  扫码进入不同场景
        sceneObj: {
            fromShop: false,
        },
        defaultPic: "/resource/images/default.jpg",
        friendPic: "/resource/images/friend.svg",
        weixinPic: "/resource/images/weixin.svg",
        linkPic: "/resource/images/linkPic.png",
        sharePic: "/resource/images/sharePic.png",
        sharePic2: "/resource/images/sharePic2.png",
        shareTbg: "/resource/images/share-tbg.png",
        loadingLogo: "/resource/images/loadingLogo.png",
        brandTxt: cfg.brandTxt,
        productDefaultImg:
            "https://b2b-v2-pre.oss.cn-north-1.jcloudcs.com/6a52d262-4269-4862-b424-a56f6beee5f7.png",
        headDefaultImg: "/resource/images/defaultHead.png",
    },
    globalRequestUrl: API.globalRequestUrl,
    // 预发：线上；
    diansongUrl: API.diansongUrl,
    /**
     * 为了兼容之前旧代码
     */
    miniWexinAppId: APPID, //外链微信小程序的 wx7b23be392066bc60(门店)  wx862d8e26109609cb（生成代码中原来有的）
    // 线上域名为api.m.jd.com 搜索、首页、扫码、
    globalHealthRequestUrl: API.globalHealthRequestUrl,
    // 预发我的：我的订单接口域名(已改完)
    globalHealthPayRequestUrl: API.globalHealthPayRequestUrl,
    staticUrl: API.STATIC_URL,
});
