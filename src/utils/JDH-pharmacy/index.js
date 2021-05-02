const fm = require("../../libs/fmsdk/fm.min.js");
import loginUtil from "../../pages/login/util.js";
import queryString from "query-string";
import { queryBrandBaseInfoByAppId, queryHeadUserInfo } from "../../api/index";
import { APPID } from "../../constants/index";
export * from "./scanMpQrCode";
export * from "./shopper";
export * from "./getCurrentRouter";
import kGetCleanOpenid from "../getOpenid";
import { getMPQrCodeParams } from "./scanMpQrCode";
import { wxInfo } from "./wxlog.js";
import { REFERENCE_USER_INFO_KEY } from "../../constants/index";

/**
 * 获取是否是推广者
 * @return false | referenceUser
 */
export function fetchIsReferenceUser() {
    const referenceUser = wx.getStorageSync(REFERENCE_USER_INFO_KEY);

    return new Promise((resolve, reject) => {
        // if (referenceUser) {
        //     resolve(referenceUser)
        // } else {
        queryHeadUserInfo()
            .then((res) => {
                if (res.data) {
                    // wx.setStorageSync(REFERENCE_USER_INFO_KEY, res.data)
                    resolve(res.data);
                } else {
                    resolve(false);
                }
            })
            .catch(() => {
                resolve(false);
            });
        // }
    });
}

/**
 * 获取小程序及品牌关系数据
 * @return Object
 * @name  brandId jpass品牌id
 * @name bizId jpass经营主体id
 */
export async function getBrandBaseInfo() {
    const config = wx.getStorageSync("PARMACY_GLOBAL_CONFIG");
    const { brandId, bizId } = config;
    // brandId和bizId都有的话直接返回，如果没有则重新请求。因为这两个参数直接影响后续流程。
    if (brandId && bizId) {
        return Promise.resolve(config);
    } else {
        // 兜底方案
        return queryBrandBaseInfoByAppId(APPID)
            .then((res) => {
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
                        globalConfig[key] = value;
                    });

                    wx.setStorageSync("PARMACY_GLOBAL_CONFIG", globalConfig);

                    return Promise.resolve(globalConfig);
                } else {
                    wx.showToast({
                        icon: 'none',
                        title: "获取base info失败，请稍后再试",
                    });

                    return Promise.reject(res.data);
                }
            })
            .catch((err) => {
                wx.showToast({
                    icon: 'none',
                    title: "获取base info失败，请稍后再试",
                });
                return Promise.reject(err);
            });
    }
}
/**
 * 时间转换组件-日期补零
 *
 */
export function addZero(num) {
    return num < 10 ? "0" + num : num;
}
/**
 * 时间戳转年月日
 * @return String
 * @param  timestamp 时间戳
 * @param separateMark 分隔符
 * @param isHMS 是否支持时分秒，默认false
 */
export function formatDate(timestamp, separateMark, isHMS) {
    let date = new Date(timestamp);
    let year = date.getFullYear();
    let month = addZero(date.getMonth() + 1);
    let day = addZero(date.getDate());
    let hours = addZero(date.getHours());
    let minutes = addZero(date.getMinutes());
    let seconds = addZero(date.getSeconds());
    let YMD = year + separateMark + month + separateMark + day; //年月日
    let YMDHMS = YMD + " " + hours + ":" + minutes + ":" + seconds; //年月日时分秒
    return isHMS ? YMDHMS : YMD;
}
/**
 * 小程序加载时设置设备指纹参数
 * @return String
 * @param  timestamp 时间戳
 * @param separateMark 分隔符
 * @param isHMS 是否支持时分秒，默认false
 */
export async function setFMInit(that) {
    let openId = await kGetCleanOpenid();
    fm.config(that, {
        bizKey: "bce044c839bb9eb811aad5af18a629e199da4e13",
        canvasOff: true, //是否关闭canvas,默认false。true：启用canvas；false：不用canvas（即添加的<canvas>不生效）
    });
    fm.init({
        openid: openId,
    });
}

/**
 * 如果是从其他小程序进入，获取从其他小程序带过来的参数
 */
export function getQueryIfOpenByOtherMiniprogram() {
    const { referrerInfo, query, scene } = wx.getLaunchOptionsSync();
    // 从其他小程序打开
    return {
        referrerInfo,
        query,
        scene,
    };
}

export function getReturnPage() {
    // 页面栈
    const pages = getCurrentPages();
    // 获取到当前页面的路径和options组成登录返回路径
    const { route, options } = getCurrentPages()[pages.length - 1];
    let params;
    // 如果是扫小程序码进入小程序，需要特殊处理
    if (options.scene) {
        params = `scene=${options.scene}`;
    } else {
        params = queryString.stringify(options);
    }
    const search = params ? `?${params}` : "";
    return `/${route}${search}`;
}
/**
 * 获取来源页面（上页路径）
 */
export function getfromPage() {
    const wxCurrPage = getCurrentPages(); // 页面栈
    const wxPrevPage = wxCurrPage[wxCurrPage.length - 2]; //获取上级页面的page对象
    const prepageRoute = wxPrevPage ? wxPrevPage.route : "";
    return prepageRoute;
}
/**
 * 获取来源场景
 */
export function getfromScene(options) {
    let formScene = null;
    switch (options.scene) {
        case 1011:
            formScene = "扫描二维码";
            break;
        case 1012:
            formScene = "长按图片识别二维码";
            break;
        case 1013:
            formScene = "扫描手机相册中选取的二维码";
            break;
        case 1047:
            formScene = "扫描小程序码";
            break;
        case 1048:
            formScene = "长按图片识别小程序码";
            break;
        case 1049:
            formScene = "长按图片识别小程序码";
            break;
        default:
            formScene = "--";
    }
    return formScene;
}
// 统一带登陆态的跳转
export async function toh5(url) {
    // 地址信息
    // TODO: 修改过这里的逻辑，需验证
    const APP = getApp();
    const { addressId, latitude, longitude } = wx.getStorageSync(
        "locationInfo"
    );
    const selectedAddr = encodeURIComponent(
        wx.getStorageSync("choiceLocation")
    );
    const { yjsSource } = await getBrandBaseInfo();
    const openId = await kGetCleanOpenid();

    if (addressId && latitude && longitude) {
        url += `&addressId=${addressId}&lat=${latitude}&lng=${longitude}`;
        url = `${url}${
            url.indexOf("?") > -1 ? "&" : "?"
        }openId=${openId}&miniWexinAppId=${
            APP.globalData.appid
        }&source=${yjsSource}&gisAreaId=1&selectedAddr=${selectedAddr}`;
        loginUtil.navigateToH5({ page: url });
    } else {
        wx.getLocation({
            type: "gcj02",
            success: (res) => {
                if (res.latitude && res.longitude) {
                    url += `&lat=${res.latitude}&lng=${res.longitude}`;
                }
            },
            fail: (res) => {},
            complete: () => {
                url = `${url}${
                    url.indexOf("?") > -1 ? "&" : "?"
                }openId=${openId}&miniWexinAppId=${
                    APP.globalData.appid
                }&source=${yjsSource}&gisAreaId=1&selectedAddr=${selectedAddr}`;
                console.log("药急送链接跳转", decodeURIComponent(url));
                loginUtil.navigateToH5({ page: url });
            },
        });
    }
}
/**
 * 判断页面是否是从小程序码进入
 * @param options onLoad生命周期的options
 */
export function isFromQRCode(options) {
    // options必定是个对象，如果没有scene属性则decode为'undefined'，
    // 除非有人跳页时故意使用scene字段作为key值
    let scene = decodeURIComponent(options.scene);

    return /^vs,/.test(scene);
}
//数组去重
export function ArrayToHeavy(arr) {
    //过滤掉原数组中重复的数字,返回新的数组
    return arr.filter((item, index) => {
        //遍历出数组中数字第一次出现的下标,与数字所在数组的下标相比较，
        //为true就是第一次出现
        if (item) {
            //去除空数据
            return arr.indexOf(item) === index;
        }
    });
}
//通过访问来源(2扫零售助手小程序码进入会员页；3零售助手分享的卡片进入会员页；6零售助手加入会员二维码进入会员页),返回即将跳转的页面url
export async function getBaseUrlFromVisitSource(visitSource, options) {
    switch (visitSource) {
        case 2:
            const {
                brandId,
                bId,
                shareChainId,
                fromPin,
                fromOpenId,
                employeeId,
                qrCodeType,
                channel,
                type,
                storeId,
            } = await getMPQrCodeParams(options.query);
            return `/pages/addVip/addVip?brandId=${brandId}&bId=${bId}&shareChainId=${shareChainId}&type=${type}&level=1&fromPin=${fromPin}&fromOpenId=${fromOpenId}&employeeId=${employeeId}&qrCodeType=${qrCodeType}&channel=${channel}&storeId=${storeId}`;
        case 3:
            const newQuery = options.query; //有分享卡片的shareChainId标志
            return `/pages/addVip/addVip?brandId=${newQuery.brandId}&bId=${newQuery.bId}&shareChainId=${newQuery.shareChainId}&type=${newQuery.type}&level=1&fromPin=${newQuery.fromPin}&fromOpenId=${newQuery.fromOpenId}&employeeId=${newQuery.employeeId}&qrCodeType=${newQuery.qrCodeType}&channel=${newQuery.channel}&storeId=${newQuery.storeId}`;
        case 6:
            const { query } = queryString.parseUrl(
                decodeURIComponent(options.query.q)
            );
            return `/pages/addVip/addVip?from=99&brandId=${query.brandId}&bId=${query.bizId}&employeeId=${query.employeeId}&storeId=${query.storeId}`;
        default:
            wxInfo("进入会员页面时options--------------", options);
    }
}

/* 处理过长的字符串
 * 注：半角长度为1，全角长度为2
 * str:字符串
 * len:截取长度
 * return: 截取后的字符串
 */
export function cutbytestr(str, len) {
    let str_length = 0;
    let str_len = 0;
    let str_cut = "";
    str_len = str.length;
    for (let i = 0; i < str_len; i++) {
        let a = str.charAt(i);
        str_length++;
        if (escape(a).length > 4) {
            //中文字符的长度经编码之后大于4
            str_length++;
        }
        str_cut = str_cut.concat(a);
        if (str_length >= len) {
            return str_cut;
        }
    }
    //如果给定字符串小于指定长度，则返回源字符串；
    if (str_length < len) {
        return str;
    }
}
