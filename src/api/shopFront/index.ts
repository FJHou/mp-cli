import { promiseRequest, httpsGet } from "@/utils/util.js";
import { appid, url } from "../config";
import { APP_CONFIG } from "@/constants/index";

type AppletQrCodeParamsType = {
    url: string;
    wxAppId: string;
    [key: string]: string;
};

export function queryJpassCouponStatus(
    couponId: number,
) {
    return httpsGet({
        url,
        data: {
            functionId: "jdhunion_coupon_queryJpassCouponStatus",
            body: { couponId },
            appid,
        },
    });
}
//
export function getShopBanner(storeId: number, venderId: number) {
    return promiseRequest({
        url: `https://bigger.jkcsjd.com/medicine/content?storeId=${storeId}&venderId=${venderId}&appid=dian_song`,
    });
}


// 获取积分商城优惠券 https://cf.jd.com/pages/viewpage.action?pageId=450031302
export function queryActivityWareByActivity(
    storeId: number | string,
    pageSize: number | string,
    pageNo: number,
    exchangeWareTypes?: [2]
) {
    return httpsGet({
        url,
        data: {
            functionId: "jdhunion_sep_queryActivityWareByActivity",
            body: { storeId, pageSize, pageNo, exchangeWareTypes },
            appid,
        },
    });
}
/**
 * 获取主要入口 jdhunion_store_queryStoreModule
 * @param jpassStoreId
 */
export function queryStoreModule(jpassStoreId: string | number) {
    return httpsGet({
        url,
        data: {
            functionId: "jdhunion_store_queryStoreModule",
            body: { jpassStoreId },
            appid,
        },
    });
}

/**
 * 获取门店热卖商品
 * @param {String} storeId
 */
export function getGWDrugByStoreId(storeId: string) {
    return httpsGet({
        url,
        data: {
            functionId: "getGWDrugByStoreId",
            body: storeId,
            appid,
        },
    });
}
/**
 * 获取二维码参数
 * @param {String} id
 */
export function getAppletQrCodeParams(id: string) {
    return httpsGet({
        url,
        data: {
            functionId: "jdhunion_applet_getAppletQrCodeParams",
            body: {
                id: encodeURIComponent(id),
            },
            appid,
        },
    });
}

/**
 * 生成二维码
 * @param {String} url required
 * @param {String} wxAppId required
 * 其他参数可以扩展
 */
export function getAppletQrCodeUrl({
    url: link,
    wxAppId,
    ...rest
}: AppletQrCodeParamsType) {
    return httpsGet({
        url,
        data: {
            functionId: "jdhunion_applet_getAppletQrCodeUrl",
            body: {
                url: link,
                wxAppId,
                ...rest,
            },
            appid,
        },
    });
}

export function queryListVenderStoreQuaFile(
    storeId: string,
    venderId: string,
    type = 2
) {
    return httpsGet({
        url,
        data: {
            functionId: "queryListVenderStoreQuaFile",
            body: {
                type,
                storeId,
                venderId,
            },
            appid,
        },
    });
}
/**
 * 大药房小程序网关接口：获取门店主页优惠券列表（包含jpass和药急送优惠券
 * @param {Long} jpassStoreId  必填 jpass门店id
   @param {Long} yjsStoreId 	非必填	药急送门店id(如果不支持药急送可不传)
   @param {Long} yjsVenderId 	非必填	药急送商家id(如果不支持药急送可不传)
   @param {String} pin 	必填	用户pin
 */
export function getUnionCouponList(
    jpassStoreId: string,
    yjsStoreId: string,
    yjsVenderId: string,
    pin?: string
) {
    return httpsGet({
        url,
        data: {
            functionId: "jdh_coupon_getUnionCouponList",
            body: {
                jpassStoreId,
                yjsStoreId,
                yjsVenderId,
                pin,
            },
            appid,
        },
    });
}
/**
 * 获取top3Id
 *
 */
export function getAllCategoryReq(venderId: string) {
    return httpsGet({
        url,
        data: {
            functionId: "ds_getAllCategory",
            body: {
                venderId,
            },
            appid,
        },
    });
}
/**
 * 获取top3商品
 *
 */
export function getTop3DetailReq(
    shopCategory: number,
    pageNo: number,
    venderId: number,
    storeid: number
) {
    return httpsGet({
        url,
        data: {
            functionId: "ds_listProductByShopCategory",
            body: {
                shopCategory,
                pageNo,
                venderId,
                storeid,
            },
            appid,
        },
    });
}

/**
 * @param {Object}
 * @param {String} url 页面地址
 * @param {String} wxAppId 微信appid
 * @param {*} rest 其余的业务，后台会记录下其他业务参数来生成链接
 * @returns {Array<String>} 二维码的地址和背景图地址
 */
// <(params: AppletQrCodeParamsType) => Promise<any>>
export function generateQrCode({
    url,
    wxAppId,
    ...rest
}: AppletQrCodeParamsType) {
    return getAppletQrCodeUrl({
        url,
        wxAppId,
        ...rest,
    })
        .then((result) => {
            if (result.code === "0000") {
                const qrcodeImage =
                    result.data.indexOf("http") !== -1
                        ? result.data
                        : "https://" + result.data;
                return Promise.all([
                    getImageInfo(qrcodeImage),
                    getImageInfo(APP_CONFIG.posterBackground),
                ]);
            } else {
                wx.showToast({
                    title: `获取二维码图片失败，code:${result.code}`,
                    icon: "none",
                    duration: 2000,
                });

                return Promise.reject(
                    `获取二维码图片失败，code:${result.code}`
                );
            }
        })
        .catch((err) => {
            wx.showToast({
                title: "生成二维码失败，请重新尝试。",
                icon: "none",
                duration: 2000,
            });

            return Promise.reject(err);
        });
}

function getImageInfo(src: string): Promise<string> {
    return new Promise((resolve, reject) => {
        wx.getImageInfo({
            src,
            success: (res) => {
                resolve(res.path);
            },
            fail: (err) => {
                reject(err.errMsg);
                console.log(`getImageInfo-fail:${src}, ${err.errMsg}`);
            },
        });
    });
}
