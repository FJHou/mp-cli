import { httpsGet } from "../../utils/util.js";
import { appid, url } from '../config'

/**
 * 获取头部用户信息  https://cf.jd.com/pages/viewpage.action?pageId=409718847
 * @param {string} pt_pin 通过cookie
 * @param {string} jdhUnionWxAppId 通过cookie
 */
export function queryHeadUserInfo() {
	return httpsGet({
		url,
		data: {
			functionId: "jdhunion_cps_queryHeadUserInfo",
			body: {},
			appid
		}
	})
}

/**
 * 查询用户预估收益 https://cf.jd.com/pages/viewpage.action?pageId=409726040
 * @param {string} startDate 通过cookie
 * @param {string} endDate 通过cookie
 */
export function queryUserEstimateCommission({startDate, endDate} = {}) {
	return httpsGet({
		url,
		data: {
			functionId: "jdhunion_cps_queryUserEstimateCommission",
			body: {
				startDate, endDate
			},
			appid
		}
	})
}

/**
 * 查询用户预估收益 https://cf.jd.com/pages/viewpage.action?pageId=409726040
 * @param {string} startDate 通过cookie
 * @param {string} endDate 通过cookie
 */
export function queryUserEqueryUserUpgradeProgressstimateCommission({startDate, endDate} = {}) {
	return httpsGet({
		url,
		data: {
			functionId: "jdhunion_cps_queryUserEstimateCommission",
			body: {
				startDate, endDate
			},
			appid
		}
	})
}

/**
 * 查询升级进度 https://cf.jd.com/pages/viewpage.action?pageId=423614505
 *  
 */
export function queryUserUpgradeProgress() {
	return httpsGet({
		url,
		data: {
			functionId: "jdhunion_cps_queryUserUpgradeProgress",
			body: {},
			appid
		}
	})
}


/**
 * 查询升级进度 https://cf.jd.com/pages/viewpage.action?pageId=423614505
 *  
 */
export function queryEstimateCommissionByDay({startDate,endDate}) {
	return httpsGet({
		url,
		data: {
			functionId: "jdhunion_cps_estimateCommissionByDay",
			body: {
				startDate,
				endDate
			},
			appid
		}
	})
}
 
/**
 * 可提现金额查询 https://cf.jd.com/pages/viewpage.action?pageId=424563612
 *  
 */
export function queryAvailableBalance(){
	return httpsGet({
		url,
		data: {
			functionId: "jdhunion_cps_queryAvailableBalance",
			body: {},
			appid
		}
	})
}


/**
 * 用户粉丝数量查询 https://cf.jd.com/pages/viewpage.action?pageId=424563850
 *  
 */
export function queryFansNum(){
	return httpsGet({
		url,
		data: {
			functionId: "jdhunion_cps_queryFansNum",
			body: {},
			appid
		}
	})
}

/**
 * 订单数量查询按天分组 https://cf.jd.com/pages/viewpage.action?pageId=424563883
 *  
 */
export function queryOrdersNumByDay({startDate, endDate} = {}){
	return httpsGet({
		url,
		data: {
			functionId: "jdhunion_cps_queryOrdersNumByDay",
			body: {
				startDate,
				endDate
			},
			appid
		}
	})
}