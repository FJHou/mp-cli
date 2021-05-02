/**
 * 所有的商品列表页的分享会统一使用这个方法
 */
import queryString from 'query-string'
import { APP_CONFIG } from "../../constants/index";
import { getCardVisitSource } from "../../logs/getCpsVisitSource";
import { getCurrentRouter } from '../../utils/JDH-pharmacy/index'
import { getPtPin } from "../../utils/loginUtils";

export default function shareAppMessage(res, productInfo) {
	const {route} = getCurrentRouter()

    if (res.from == 'menu') {
		return {
			title: '为您推荐京东优惠购',
			path: route,
			imageUrl: APP_CONFIG.logo
		}
	} else {
		const stringify = queryString.stringify({
			skuId: productInfo.itemId,
			cpsVisitSource: getCardVisitSource(),
			referrerPin: getPtPin()
		})
		return {
			title: productInfo.itemName,
			path: `pages/distributionGoodDetail/distributionGoodDetail?${stringify}`,
			imageUrl: productInfo.annexUrl
		}
	}
}