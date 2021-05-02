
//const { httpsGet } = require("../../utils/util.js");
import { httpsGet } from "../../utils/util.js";
import { appid, url } from '../config'

/**
 * 获取门店列表信息 
	* @param {long} brandId  必填	品牌ID
	* @param {long} bizId  必填  经营主体ID
	* @param {string} storeId  必填	经度
	* @param {string} longitude  必填  纬度
	* @param {interger} pageIndex  必填	页数
	* @param {interger} pageSize  必填  分页大小
 */
export function getStoreListReq(brandId,bizId,longitude,latitude,pageIndex,pageSize) {
    return httpsGet({
        url,
        data: {
            functionId: "jdhunion_store_queryStorePage",
            body: {
				brandId,
				bizId,
				longitude,
				latitude,
				pageIndex,
				pageSize
            },
            appid
        }
    })
}
/**
 * 获取历史门店 
	* @param {long} jpassStoreIds  必填  jpass门店id集合
	* @param {string} longitude  必填	经度
	* @param {string} latitude   必填  纬度 
 */
export function getHistoryStoreListReq(jpassStoreIds,longitude,latitude) {
	return httpsGet({
			url,
			data: {
					functionId: "jdhunion_store_queryStoreList",
					body: {
						jpassStoreIds,
						longitude,
						latitude
					},
					appid
			}
	})
}
 