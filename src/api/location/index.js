import { httpsGet } from '../../utils/util.js';
import { healthAppid, appid, healthUrl as url, API } from '../config';

export function queryAddressName({ longitude, latitude }) {
    return httpsGet({
        url,
        data: {
            functionId: 'queryAddress',
            appid,
            body: {
                latitude,
                longitude
            }
        }
    })
        .then((res) => {
            return Promise.resolve(res.data && res.data[0] && res.data[0].title ? res.data[0].title : '');
        })
        .catch((res) => {
            return Promise.reject(res);
        });
}

export function dsAddrList() {
    return httpsGet({
        url,
        data: {
            functionId: 'ds_addrList',
            appid: healthAppid,
            body: {}
        }
    });
}

export function getAddrCoordinates(addressId) {
    return httpsGet({
        url,
        data: {
            functionId: 'ds_getAddrCoordinates',
            appid: healthAppid,
            body: {
                addressId
            }
        }
    });
}
/**
 * 开普勒提供的收货地址查询接口
 */
export function kAddrList() {
    return httpsGet({
        url: `${API.globalRequestUrl}/kwxp/norder/address.json`
    });
}
