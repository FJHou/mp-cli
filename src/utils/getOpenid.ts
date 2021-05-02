// const Promise = require('../libs/promise');
import { request } from "./util";
import { getExtConfig } from "./onLaunch.js";
import { APPType } from "../types/index";

/**
 * @author huzhouli <huzhouli@jd.com>
 * 获取openid
 */
const OPENID_KEY = "oP_key";
let promise: Promise<string>;

/**
 * 获取未加密的openid
 * @param {Object} app
 * @returns {Promise<String>} openid Promise
 */
function kGetCleanOpenid(appdata?: APPType): Promise<string> {
    let app = appdata || getApp<APPType>();
    if (promise) {
        return promise;
    }

    return new Promise((resolve) => {
        const openid = wx.getStorageSync(OPENID_KEY);
        
        let extConfigData: any;
        if (openid) {
            resolve(openid);
            return;
        }
        if (app.globalWxclient && app.globalWxclient == "tempwx") {
            extConfigData = getExtConfig();
        } else {
            extConfigData = {
                appid:
                    app.globalData && app.globalData.appid
                        ? app.globalData.appid
                        : "",
                isIndividual: true,
            };
        }
        wx.login({
            success: function(res) {
                let code = res.code;
                request({
                    url: "https://wxapp.m.jd.com/kwxhome/myJd/getOpenId.json",
                    method: "POST",
                    data: {
                        wxcode: code || "",
                        wxAppId: extConfigData.appid || "",
                        clientType: extConfigData.isIndividual
                            ? "gxhwx"
                            : "tempwx",
                    },
                    success: function(response: any) {
                        if (!response || !response.openId) {
                            wx.showToast({
                                title: "获取openid失败",
                                icon: "none",
                            });
                            resolve("");
                            return;
                        }

                        wx.setStorageSync(OPENID_KEY, response.openId);
                        resolve(response.openId);
                    },
                    fail: function() {
                        wx.showToast({
                            title: "获取openid失败",
                            icon: "none",
                        });
                        resolve("");
                    },
                });
            },
            fail: function() {
                wx.showToast({
                    title: "获取openid失败",
                    icon: "none",
                });
                resolve("");
            },
        });
    });
}
export default kGetCleanOpenid;
