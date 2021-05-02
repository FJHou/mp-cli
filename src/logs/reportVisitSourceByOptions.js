// import { getCurrentRouter } from "../utils/JDH-pharmacy/index";
import { APPID } from "../constants/index";
import kGetCleanOpenid from "../utils/getOpenid";
import { getMPQrCodeParams } from "../utils/JDH-pharmacy/index.js";
import queryString from "query-string";
import { visitSourceInfoReq, addUserCpsReferrer } from "../api/index";
import { getPtPin } from "../utils/loginUtils";

/**
 * 根据用户访问场景进行上报  cf: https://cf.jd.com/pages/viewpage.action?pageId=399279759
 * @param {String} appId 小程序appid
 * @param {String} wxOpenId 微信小程序openId
 * @param {Long} jpassStoreId 门店id
 * @param {Integer} visitSource 访问来源:VISIT_SOURCE_ENUM
 */
export async function reportVisitSourceByOptions(options,that) {
  const app = getApp();
  const wxOpenId = await kGetCleanOpenid(); //调用getOpenId拿到openId
  // TODO: 合并这两个方法
  const { visitSource, jpassStoreId } = await getVisitSource(options); //解析options，从options里拿到storeId并计算出visitSource和jpassStoreId
  const { referrerPin, cpsVisitSource } = await getCpsVisitSource(options);
  
  if (visitSource && jpassStoreId) {
		that.globalData.visitSource = visitSource;//app.js中定义时还不能使用app=getApp()这个方法，需要使用this 
    //调用上报接口
    visitSourceInfoReq(wxOpenId, jpassStoreId, visitSource, APPID)
  }

  if (cpsVisitSource && referrerPin) {
    addUserCpsReferrer({
      wxOpenId,
      userPin: getPtPin(),
      referrerPin: decodeURIComponent(referrerPin),
      visitSource: cpsVisitSource,
    })
  }
}

async function getCpsVisitSource(options) {
  if (options.query.scene) {
    try {
      const query = await getMPQrCodeParams(
        options.query
      );
      return query;
    } catch (err) {
      console.log(err);
    }
  } else {
    return options.query
  }
}

/**
 * 获取visitSource
 */
export async function getVisitSource(options) {
  let FROM_MP_QRCODE = false; //是否有scene并且以vs,开头
  let path = options.path; //即将进入的页面
  let shareChainId = options.query.shareChainId; //是否有分享卡片的shareChainId标志
	let jpassStoreId = "";
  if (options.query) {
    //有参数带入
    jpassStoreId = options.query.storeId;
    if (options.query.scene) {
      const newOptions = await getMPQrCodeParams(options.query);
      const newScene = decodeURIComponent(options.query.scene);
      jpassStoreId = newOptions.storeId;
			FROM_MP_QRCODE = /^vs,/.test(newScene);
    }
    if (options.query.q) {
      const { query } = queryString.parseUrl(
        decodeURIComponent(options.query.q)
			);
			jpassStoreId = query.storeId
		}
		if(options.query.storeId && path == "pages/newShop/shopFront"){//运营端直接配置的门店二维码 
			jpassStoreId = options.query.storeId;
			return { visitSource: 1, jpassStoreId };
		}
  }
  //visitSource
  //1 门店生成的小程序码 条件：FROM_MP_QRCODE为true && 路由为门店页
  //2 零售助手会员生成的小程序码 条件：FROM_MP_QRCODE为true && 路由为加入会员
  //3 零售助手会员分享卡片 条件：FROM_MP_QRCODE为false && 路由为加入会员 && shareChainId
  //4 零售助手券包生成的小程序码 条件：FROM_MP_QRCODE为true && 路由为券包页
  //5 零售助手券包分享卡片 条件FROM_MP_QRCODE为false && 路由为券包页 && shareChainId
  //6 零售助手二维码 条件options里有q字段 暂无此需求
  if (FROM_MP_QRCODE) {
    //有scene并且以vs,开头
    if (path == "pages/newShop/shopFront") {
      //门店首页
      return { visitSource: 1, jpassStoreId }; //
    } else if (path == "pages/addVip/addVip") {
      //加入vip页面
      return { visitSource: 2, jpassStoreId };
    } else if (path == "pages/customerCouponBag/customerCouponBag") {
      //券包页面
      return { visitSource: 4, jpassStoreId };
    }

    return { visitSource: "", jpassStoreId: "" }; 
  } else {
    if (shareChainId && path == "pages/addVip/addVip") {
      return { visitSource: 3, jpassStoreId };
    } else if (
      shareChainId &&
      path == "pages/customerCouponBag/customerCouponBag"
    ) {
      return { visitSource: 5, jpassStoreId };
    } else if (options.query.q) {
      return { visitSource: 6, jpassStoreId };
    } else {
      return { visitSource: "", jpassStoreId: "" };
    }
  }
}
