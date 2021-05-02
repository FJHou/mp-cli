import { getAppletQrCodeParams } from '../../api/index'
/**
 * 解析options.scene
 * @param {*} options 
 */
// const reg = /^vs,(\d+),*(\d+)*/

export function resolveScene(scene) {
    if (scene) {
        scene = decodeURIComponent(scene);
        // 判断scene是不是vs,12,123或者vs,5这种格式
        // 把vs,123,123数据匹配成123,123
        let param = scene.replace("vs,", "").split(",");
        // 如果scene带有vs且只有一个逗号则为新的二维码接口，
        // 否则把vs后面的两个参数分别作为storeId和venderId处理则是小程序码
        if (param.length === 1) {
            return {
                id: param[0],
            };
        } else {
            // 这个判断逻辑只在门店首页会用到，为了兼容二期的小程序码
            // 老版二维码，第一个参数是venderId，第二个参数是storeId
            return {
              venderId: param[0],
              storeId: param[1],
            };;
        }
    }

    return {}
}

/**
 * 根据扫码id 解析小程序码的业务参数
 */
export function resolveMPQrCode(id) {
    return getAppletQrCodeParams(id).then(result => {
        if (result.code === '0000') {
            try {
                const paramJson = JSON.parse(result.data.paramJson)
                return Promise.resolve(paramJson)
            } catch (err) {
                return Promise.reject(err)
            }
        } else {
            return Promise.reject(`二维码参数解析失败:${result.msg}`)
        }
    }).catch((err) => {
        return Promise.reject(err)
    })
}
/**
 * 小程序码的参数解析方法。
 * 如果页面是通过扫小程序码进入的，只需要调用这个方法就能解析到生成小程序码时的参数
 * @param {*} options onLoad生命周期的options
 */
export async function getMPQrCodeParams(options) {
    const { id, venderId, storeId } = resolveScene(options.scene)
    if (id) {
        return await resolveMPQrCode(id)
    } else if (venderId || storeId) { // 因为有的店铺没有venderId
        return {
            venderId,
            storeId
        }
    } else {
        return null
    }
}