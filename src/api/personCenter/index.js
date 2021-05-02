

import { httpsGet } from "../../utils/util.js";
import { appid, url } from '../config'
import { APPID } from '../../constants/index'
/**
 * 获取个人中心订单列表信息  
	* @param {string} statusId  必填  4096：全部订单 ；1：待付款 ；128：待收货； 1024：已完成 ；-1：已取消
	* @param {interger} pageIndex  必填	页数
	* @param {interger} pageSize  必填  分页大小
 */
export function getOrderListReq(statusId, pageIndex, pageSize) {
	return httpsGet({
		url,
		data: {
			functionId: "jdhunion_order_queryOrderPage",
			body: {
				statusId,
				pageIndex,
				pageSize,
				wxAppId: APPID
			},
			appid
		}
	})
}

/**
 * 获取个人中心优惠券列表信息  
	* @param {long} brandId  必填  品牌id
	* @param {string} nextRowKey  必填	hhbase下一页的开始行，第一次进来为空
	* @param {interger} pageSize  必填  分页大小
	* @param {interger} type  必填  优惠券类型（0 未使用 1 已使用 2 已过期）
 */
export function getUserCenterBrandsCouponReq(brandId, nextRowKey, pageSize, type) {
	return httpsGet({
		url,
		data: {
			functionId: "jdh_coupon_getUserCenterBrandsCoupon",
			body: {
				brandId,
				nextRowKey,
				pageSize,
				type
			},
			appid
		}
	})
}
/**
 * 获取个人中心-到店券订单-信息  
	* @param {long} brandId  必填  品牌id
	* @param {string} pageIndex  必填	页码
	* @param {interger} pageSize  必填  分页大小 
 */
export function queryJpassOrderReq(brandId, pageIndex, pageSize) {
	return httpsGet({
		url,
		data: {
			functionId: "jdhunion_order_queryJpassOrderPage",
			body: {
				brandId,
				pageIndex,
				pageSize 
			},
			appid
		}
	})
}