const JSEncrypt = require('../libs/jsencrypt').default
const DEFAULT_PUBLIC_KEY = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCP/zZ88L2+DP9ePx77g1tXn0HWchrSnCc7o8iuplIZu6qnZiSoGzpv68U+RX43S1SOpW25pkes4CqbXBhj/kE1qbr5OT1XKjWoVEaHkdO8gZmALALWtTPQTerIoMEfU1lz1fo6De1XuK5WLXwKVPeLfZpRGyxQOmQNdvv78ezA0QIDAQAB'

const ADDRESS_ORDER_PUBLIC_KEY = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCBnPU/rIgN/IBkl8zMu573fxlScL2RFbiMlad3rkCKRj8U8zYP2ueBQMYP+DOnfvo4h3PLeJ9Ih+TOzpIxN1elyxM+XDVKBU2AXiSYvlzihJV8hzeb8U9lcsDaAVcq4FsHowClrWvIfEEp02hrE1r2RgHrq9p3oNWbLcLZQJWNHwIDAQAB'

function randomString(len) {
    len = len || 32;
    let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    let maxPos = $chars.length;
    let pwd = '';
    for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

export default function jsencryptCode(enData, publicKey = DEFAULT_PUBLIC_KEY) {
    let jsencrypt = new JSEncrypt()

    jsencrypt.setPublicKey(publicKey)
    // 对数据进行加密处理并返回
    return jsencrypt.encrypt(randomString(6) + enData)
}

export {
    ADDRESS_ORDER_PUBLIC_KEY
}

// ======使用：======index.js
// import Util from '../../common/util'
// 使用内置publicKey
// let code = Util.jsencryptCode(Email)
// 使用新publicKey
// let code = Util.jsencryptCode(Email, "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCBnPU/rIgN/IBkl8zMu573fxlScL2RFbiMlad3rkCKRj8U8zYP2ueBQMYP+DOnfvo4h3PLeJ9Ih+TOzpIxN1elyxM+XDVKBU2AXiSYvlzihJV8hzeb8U9lcsDaAVcq4FsHowClrWvIfEEp02hrE1r2RgHrq9p3oNWbLcLZQJWNHwIDAQAB")