import { appid } from "../../project.config.json";
export const ENV = process.env.NODE_ENV; // 'production' 为生产
export const IS_DEV = ENV === "development";

export const APPID = appid;

const CONFIG = {
    wxa61c3729cabe8649: {
        appName: "京东大药房",
        posterBackground:
            "https://img12.360buyimg.com/imagetools/jfs/t1/139715/13/11743/372289/5f9176e1Efafba49e/e17102b2eae0f731.png",
        logo:
            "https://img13.360buyimg.com/imagetools/jfs/t1/155119/14/12523/20304/5feaeb2fE70ede8a3/9f7f181442a7c4d5.jpg",
    },
    wx7b23be392066bc60: {
        appName: "药店便利购",
        posterBackground:
            "https://img14.360buyimg.com/imagetools/jfs/t1/103033/11/6144/603144/5df1a3e4E6eab9ce3/bbfef77db64fc33a.png",
        logo:
            "https://img13.360buyimg.com/imagetools/jfs/t1/153136/34/12580/4059/5feaed1bEd945b42f/823431a0081dcaae.png",
    },
};

export const WX_VERSION = "ddf7bb15f72ff3a03d2035f50f7f2744";

export const APP_CONFIG = CONFIG[APPID];
export const JD_WX_APPID = "wx91d27dbf599dff74"; // 京东购物
export const JX_WX_APPID = "wxca1fe42a16552094"; // 京喜
export const HY_WX_APPID = "wx86d0797d34f56442"; // 互联网医院

export const DEFAULT_AVATAR = "https://i.jd.com/commons/img/no-img_mid_.jpg";
export const USER_INFO_KEY = "JDUserInfo";
export const REFERENCE_USER_INFO_KEY = "referenceUserInfo";
// 弹窗券的关闭时间，控制弹窗券一天只展示一次
export const COUPON_DIALOG_CLOSED_TIME = "couponDialogClosedTime"
// 会员卡详情
export const MEMBER_CARD_INFO = "memberCardInfo"
// 用户正在领取的弹窗券id，登录后会查询用户是否领取过这个券
export const USER_GETTING_COUPON_ID = "userGettingCouponId"
// 优惠券弹窗的来源场景 【fresherCoupon】新人券
export const COUPON_DIALOG_FROM_SCENE = "couponDialogFromScene"
// 登录场景 用来展示个性化的提示 关联utils的loginScene方法
export const LOGIN_FROM_SCENE = "loginFromScene"

export const TABBAR_PATH = [
    "/pages/newShop/shopFront",
    "/pages/distributionIndex/distributionIndex",
    "/pages/personalHealth/personalHealth",
];
// 积分商城H5链接
const POINTS_MALL_ORIGN = IS_DEV ? "https://beta-m-sep.jd.com": "https://m-sep.jd.com"
export const POINTS_MALL_URL = {
    OrderList: `${POINTS_MALL_ORIGN}/OrderList`,

    ProductDetail: `${POINTS_MALL_ORIGN}/ProductDetail`
    // ProductDetail: `${POINTS_MALL_ORIGN}/ProductDetail`
}