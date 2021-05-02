import {
    getAppletQrCodeUrl,
} from '../../../api/index.js';

const backgroundImage = 'https://img12.360buyimg.com/imagetools/jfs/t1/139715/13/11743/372289/5f9176e1Efafba49e/e17102b2eae0f731.png'
/**
 * @param {Object}
 * @param {String} url 页面地址
 * @param {String} wxAppId 微信appid
 * @param {*} rest 其余的业务，后台会记录下其他业务参数来生成链接
 * @returns {Array<String>} 二维码的地址和背景图地址 
 */
export async function generateQrCode({ url, wxAppId, ...rest }) {
    try {
        const result = await getAppletQrCodeUrl({
            url,
            wxAppId,
            ...rest
        })
        if (result.code === '0000') {
            const qrcodeImage = result.data.indexOf('http') !== -1 ? result.data : 'https://' + result.data
            return Promise.all([getImageInfo(qrcodeImage), getImageInfo(backgroundImage)])
        } else {
            wx.showToast({
                title: `获取二维码图片失败，code:${res.code}`,
                icon: 'none',
                duration: 2000
            })

            return Promise.reject(`获取二维码图片失败，code:${res.code}`)
        }
    } catch (err) {
        wx.showToast({
            title: '生成二维码失败，请重新尝试。',
            icon: 'none',
            duration: 2000
        });

        return Promise.reject('生成二维码失败，请重新尝试。')
    }
}

function getImageInfo(src) {
    return new Promise((resolve, reject) => {
        wx.getImageInfo({
            src,
            success: (res) => {
                resolve(res.path);
            },
            fail: (err) => {
                reject(err);
                console.log(`getImageInfo-fail:${src}, ${err.errMsg}`);
            }
        });
    });
}