import { httpsGet, request } from "../utils/util.js";
import { appid, url } from "./config";
/**
 * 判断是否为推广人 https://cf.jd.com/pages/viewpage.action?pageId=409163365
 * @param {string} pt_pin 通过cookie
 * @param {string} jdhUnionWxAppId 通过cookie
 */
export function getIsReferenceUser() {
  return httpsGet({
    url,
    data: {
      functionId: "jdhunion_cps_isReferenceUser",
      body: {},
      appid,
    },
  });
}
/**
 * 获取小程序及品牌关系数据
 * @param wxAppId 小程序应用id
 */
export function queryBrandBaseInfoByAppId(wxAppId) {
  return httpsGet({
    url,
    data: {
      functionId: "jdhunion_store_queryBrandBaseInfoByAppId",
      body: {
        wxAppId,
      },
      appid,
    },
  });
}
/**
 * 根据经纬度查询地址名称
 */
export function queryAddressReq(longitude, latitude) {
  return httpsGet({
    url,
    data: {
      functionId: "queryAddress",
      body: {
        longitude,
        latitude,
      },
      appid,
    },
  });
}
/**
 * 根据门店id查询门店详情
 * @param {Long} storeId   必填 jpass门店id
 * @param {String} storeId   非必填 经度
 * @param {String} storeId   非填 纬度
 */
export function queryStoreDetailReq(storeId, longitude, latitude) {
  return httpsGet({
    url,
    data: {
      functionId: "jdhunion_store_queryStoreDetail",
      body: {
        storeId,
        longitude,
        latitude,
      },
      appid,
    },
  });
}
/**
 * 记录访问分享人
 * @param {String} wxOpenId 必填  微信小程序openId
 * @param {String} userPin 必填  用户pin
 * @param {Long} cpsUserId 必填 cps推荐人id
 * @param {Integer} visitSource 必填  访问来源:1-门店二维码 2-零售助手会员二维码 3-零售助手会员分享卡片 4-零售助手券包二维码 5-零售助手券包分享卡片
 */
export function addUserCpsReferrer({
  wxOpenId,
  userPin,
  referrerPin,
  visitSource,
}) {
  return httpsGet({
    url,
    data: {
      functionId: "jdhunion_cps_user_addUserCpsReferrer",
      body: {
        wxOpenId,
        userPin,
        referrerPin,
        visitSource,
      },
      appid,
    },
  });
}
/**
 *新增门店访问来源
 * @param {String} wxOpenId 必填  微信小程序openId
 * @param {Long} jpassStoreId 必填  门店id
 * @param {Integer} visitSource 必填  访问来源:1-门店二维码 2-零售助手会员二维码 3-零售助手会员分享卡片 4-零售助手券包二维码 5-零售助手券包分享卡片
 */
export function visitSourceInfoReq(wxOpenId, jpassStoreId, visitSource, appId) {
  return httpsGet({
    url,
    data: {
      functionId: "jdhunion_store_insertVisitSourceInfo",
      body: {
        wxOpenId,
        jpassStoreId,
        visitSource,
        appId,
      },
      appid,
    },
  });
}

export function getJDUserInfo() {
  return new Promise((resolve, reject) => {
    const app = getApp();
    //全员导购字段
    let extConfig = wx.getExtConfigSync() ? wx.getExtConfigSync() : "";
    let bizId = extConfig && extConfig.b_id ? extConfig.b_id : "";
    let brandId = extConfig && extConfig.brandId ? extConfig.brandId : "";
    let isIfShow = wx.getStorageSync("ifShow")
      ? wx.getStorageSync("ifShow")
      : 0; //如果是1表示是导购
    let daoGouData =
      "&useGuideModule=" + isIfShow + "&bizId=" + bizId + "&brandId=" + brandId;
    request({
      url: app.globalRequestUrl + "/kwxhome" + "/myJd/home.json?" + daoGouData,
      success: function(data) {
        resolve(data);
      },
      complete: function(data) {
        reject(data);
      },
      fail: function(e) {
        reject(e);
        // TODO:加日志
        // reportErr(
        //     encodeURIComponent(
        //         "个人中心onShow数据请求request失败，具体信息："
        //     ) + e.errMsg
        // );
      },
    });
  });
}
