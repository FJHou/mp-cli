import { httpsGet, axios } from "../../utils/util.js";
import { appid, url } from '../config'

/**
 * 获取分销商品列表信息  https://cf.jd.com/pages/viewpage.action?pageId=408116524
	* @param {integer} userLevel  必填	等级 
 */
export function queryProductionListReq(productListParamObj) {
    return httpsGet({
        url,
        data: {
            functionId: "jdhunion_cps_queryGoodsByParams",
            body: productListParamObj,
            appid
        }
    })
}

 /**
  * 转链获取cps推广链接 https://cf.jd.com/pages/viewpage.action?pageId=412681782
  * @param {String} wxOpenId 微信openid
  * @param {String} materialUrl 推广物料链接，商品接口中获取
  * @param {String} couponUrl 优惠券链接
  */
 export function genCpsPromotionUrl({wxOpenId, materialUrl, couponUrl}) {
    return axios({
        url,
        method: 'post',
        data: {
            functionId: "jdhunion_cps_goods_genCpsPromotionUrl",
            body: {
                wxOpenId,
                materialUrl,
                couponUrl,
            },
            appid
        }
    })
}