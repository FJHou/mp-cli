import { promiseRequest } from '../../utils/util.js';
import { appid, healthUrl as url, API } from '../config'

/**
 * 根据地址id查询地址详情
 * @param {number} addressId 
 */
export function getAddressById(addressId) {
    return promiseRequest({
        url: API.globalJDHpharmacyRequestUrl + url,
        method: 'post',
        data: {
            functionId: 'mb2cappAddress_getAddressById',
            appid,
            body: JSON.stringify({
                addressId
            })
        }
    });
}
// 删除
export function deleteAddressById(addressId) {
    return promiseRequest({
        url: API.globalJDHpharmacyRequestUrl + url,
        method: 'post',
        data: {
            functionId: 'mb2cappAddress_deleteAddressById',
            appid,
            body: JSON.stringify({
                addressId
            })
        }
    });
}
// 添加
export function addAddressById(params) {
    return promiseRequest({
        url: API.globalJDHpharmacyRequestUrl + url,
        method: 'post',
        data: {
            functionId: 'mb2cappAddress_addAddress',
            appid,
            body: JSON.stringify(params)
        }
    });
}
// 更新
export function updateAddressById(params) {
    return promiseRequest({
        url: API.globalJDHpharmacyRequestUrl + url,
        method: 'post',
        data: {
            functionId: 'mb2cappAddress_updateAddressById',
            appid,
            body: JSON.stringify(params)
        }
    });
}