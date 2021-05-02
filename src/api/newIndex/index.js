 
import { httpsGet } from "../../utils/util.js";
import { appid, url } from '../config'

/**
 * 获取门店列表信息 
 */
export function getNearStoreReq(longitude,latitude,bizId,brandId) {
    return httpsGet({
        url,
        data: {
            functionId: "jdhunion_store_queryNearStore",
            body: {
				longitude,
				latitude,
				bizId,
				brandId
            },
            appid
        }
    })
}
 