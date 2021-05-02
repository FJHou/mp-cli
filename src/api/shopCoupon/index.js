// const { httpsGet } = require("../../utils/util.js");
import { httpsGet } from "../../utils/util.js";
import { appid, url } from "../config";
import fm from '../../libs/fmsdk/fm.min.js';
// 领取优惠券时所用的eid
export function getEid() {
    return new Promise((resolve, reject) => {
        fm.getEid(function(res) {
            // 指纹信息接口
            if (res.tk) {
                httpsGet({
                    url: "/JDHpharmacy-api",
                    data: {
                        functionId: "jdh_coupon_getFingerPrintInfo",
                        appid: "jdhunion",
                        body: {
                            bizKey: "bce044c839bb9eb811aad5af18a629e199da4e13",
                            token: res.tk,
                        },
                    },
                })
                    .then((res) => {
                        resolve(res.data.wechatEid || '7JHZUZ5Y7GGANOUIPLDG');
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else {
                reject(res);
            }
        });
    });
}

/**
 * 获取药急送优惠券列表
 * @param {long} storeId  必填	药急送门店id
 * @param {long} venderId  必填  药急送商家id
 */
export function getYjsCouponDataReq(storeId, venderId) {
    return httpsGet({
        url,
        data: {
            functionId: "jdh_coupon_getYjsCouponList",
            body: {
                storeId,
                venderId,
            },
            appid,
        },
    });
}
/**
 * 活动优惠券礼包-查询 https://cf.jd.com/pages/viewpage.action?pageId=443632463
 * @param {Long} jpassStoreId  必填 jpass门店id
 * @param {integer} activityType 必填 活动类型 1 会员开卡
 */
export function queryActivityCoupons(jpassStoreId, jpassVenderId, activityType = 1) {
    return httpsGet({
        url,
        data: {
            functionId: "jdhunion_coupon_queryActivityCoupons",
            body: { jpassStoreId, jpassVenderId, activityType },
            appid,
        },
    });
}
/**
 * 活动优惠券礼包-领取 https://cf.jd.com/pages/viewpage.action?pageId=444459505
 * @param {Long} jpassStoreId  必填 jpass门店id
 * @param {integer} activityType 必填 活动类型 1 会员开卡
 * @param {Long} activityId 必填 活动id
 */
export function drawActivityCoupons(jpassStoreId, jpassVenderId, activityType, activityId) {
    return httpsGet({
        url,
        data: {
            functionId: "jdhunion_coupon_drawActivityCoupons",
            body: { jpassStoreId, jpassVenderId, activityType, activityId },
            appid,
        },
    });
}

/**
 * 获取到店优惠券列表
 * @param {long} storeId  必填	Jpass门店id
 * @param {Integer} pageSize  必填	页大小
 * @param {Integer} currentPage  必填	当前页
 * @param {Integer} couponStatus 非必填	查询优惠券状态，为0则只查询可领取，否则包含待使用和可领取
 */
export function getShopCouponReq(storeId, pageSize, currentPage, couponStatus) {
    return httpsGet({
        url,
        data: {
            functionId: "jdh_coupon_getJpassCouponList",
            body: {
                storeId,
                pageSize,
                currentPage,
                couponStatus,
            },
            appid,
        },
    });
}

/**
 * 领取药急送新人券
 * @param {long} activityId 活动id
 * @param {long} ruleId 券活动id
 * @param {long} venderId 商家id
 */
export function getYJSNewPersonCouponReq(activityId, ruleId, venderId) {
    return httpsGet({
        url,
        data: {
            functionId: "ds_collectCoupon",
            body: {
                activityId,
                ruleId,
                venderId,
            },
            appid,
        },
    });
}

/**
 * 领取药急送非新人券
 * @param {String} encryptedKey  必填 领券KEY
 * @param {long} ruleId  必填 活动规则Id
 * @param {String} shshshfp  必填 无线安全设备指纹
 * @param {String} shshshfpa  必填 无线安全设备指纹
 * @param {String} shshshfpb  必填 无线安全设备指纹
 * @param {String} eid  必填 无线安全设备指纹
 * @param {String} fp  必填 金融指纹
 * @param {String} jda  必填 京东浏览器访问标识
 */

export function getYJSNotNewPersonCouponReq(
    encryptedKey,
    ruleId,
    shshshfp,
    shshshfpa,
    shshshfpb,
    eid,
    fp,
    jda
) {
    return httpsGet({
        url,
        data: {
            functionId: "ds_receiveCoupon",
            body: {
                encryptedKey,
                ruleId,
                shshshfp,
                shshshfpa,
                shshshfpb,
                eid,
                fp,
                jda,
            },
            appid,
        },
    });
}

/**
 * 领取到店优惠券
 * @param {Long} storeId 必填 Jpass门店id
 * @param {Long} couponId 必填	优惠券id
 * @param {Integer} activityType 必填  渠道类型：0:"直投"/ 13:"导购"/16:"导购渠道"/17:"拉新渠道"/18:"plus会员渠道"/19:"用户风控渠道"/99:"默认"
 * @param {String} eid 非必填	如果 activityType = 17或19、必填
 */
export function drawJpassCouponReq(
    storeId,
    venderId,
    couponId,
    activityType,
    eid
) {
    return httpsGet({
        url,
        data: {
            functionId: "jdh_coupon_drawJpassCoupon",
            body: {
                storeId,
                venderId,
                couponId,
                activityType,
                eid,
            },
            appid,
        },
    });
}
