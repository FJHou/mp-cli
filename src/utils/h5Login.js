import Mmd5 from '../libs/Mmd5.js';
import utils from './util.js'
// var Promise = require('../libs/promise.js');


function jshopH5Login(returnpage) {
    var h5Url = "",
        activityUrl = encodeURIComponent(wx.getStorageSync('activityUrl')) || '';//jshop首页嵌入h5的URL

    promiseGentoken().then(function (res) {
        if (res.data.err_code == 0) {
            h5Url = decodeURIComponent(res.data.url + '?to=' + activityUrl + '&tokenkey=' + res.data.tokenkey);
            wx.setStorageSync('h5NewUrl', h5Url);
        }
    }).then(function () {
        if (returnpage) {
            wx.redirectTo({
                url: returnpage
            });
        }
    })
}

function promiseGentoken() {
	//获取应用实例
	var app = getApp({ allowDefault: true });
    var guid = wx.getStorageSync('jdlogin_guid') || '',
        lsid = wx.getStorageSync('jdlogin_lsid') || '',
        // pt_pin = encodeURIComponent(wx.getStorageSync('jdlogin_pt_pin')|| ''),
        // pt_token = wx.getStorageSync('jdlogin_pt_token') || '',
        pt_key = utils.getPtKey(),  //登录状态
        appid = 269,  // wx.getStorageSync('appid'),
        ts = parseInt(new Date() / 1000),
        h5Data = "appid=" + appid + "&pt_key=" + pt_key + "&ts=" + ts + "dzHdg!ax0g927gYr3zf&dSrvm@t4a+8F",
        md5H5Data = Mmd5.hex_md5(h5Data);

    return new Promise(function (resolve, reject) {
        wx.request({
            url: app.globalRequestUrl + '/wxapplogin/cgi-bin/app/wxapp_gentoken',
            data: {
                appid: appid,
                ts: ts,
                sign: md5H5Data
            },
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded',
                'cookie': 'guid=' + guid + '; lsid=' + lsid + '; pt_key=' + pt_key
            },
            success: resolve,
            fail: reject
        });
    });
}
export {
    jshopH5Login,
    promiseGentoken
}
