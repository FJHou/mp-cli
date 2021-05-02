import { globalLoginShow, globallogout } from "../../utils/util.js";
import loginUtil from "../../pages/login/util.js";
import {
    getBrandBaseInfo,
    fetchIsReferenceUser,
} from "../../utils/JDH-pharmacy/index";
import { getMemeberCardInfo } from "../../utils/index";
import { getJDUserInfo } from "../../api/index.js";
import { DEFAULT_AVATAR, USER_INFO_KEY } from "../../constants/index.js";
import { getPtPin, isLogin } from "../../utils/loginUtils.js";

const app = getApp();

Page({
    /**
     * 页面的初始数据
     */
    data: {
        user: {}, //获取用户头像、昵称、京豆数量字段
        isLogined: false,
        isReferenceUser: {},
        showFloorMap: {},
        distributionEnable: false,
        isVip: false,
        pinCode: "", //用户pin
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: async function() {
        this.setFloorMap();
        // 获取京东用户信息
        this.getUserInfo();
        this.setData({ pinCode: getPtPin() });
        if (isLogin()) {
            getMemeberCardInfo().then(res => {
                this.setData({
                    isVip: res.isVip
                })
            })
        }
    },

    getUserInfo() {
        getJDUserInfo().then((data) => {
            let userInfo = {};
            let isLogined = false;

            if (data.code == "999") {
                userInfo = {
                    imgUrl:
                        "https://img11.360buyimg.com/imagetools/jfs/t1/51795/38/9894/41122/5d720254E16e71f44/c62cac645032e247.png",
                };
            } else {
                const user = data.user;
                if (user) {
                    userInfo = {
                        ...user,
                        imgUrl:
                            user.imgUrl === "/images/html5/newDefaul.png"
                                ? DEFAULT_AVATAR
                                : user.imgUrl.replace("http", "https"),
                    };
                    isLogined = true;
                }
            }
            this.setData({ user: userInfo, isLogined });
            this.fetchIsReferenceUser();
            wx.setStorageSync(USER_INFO_KEY, userInfo);
        });
    },

    async fetchIsReferenceUser() {
        const isReferenceUser = await fetchIsReferenceUser();
        this.setData({
            isReferenceUser,
        });
    },

    async setFloorMap() {
        try {
            const { showFloorMap, cpsConfig } = await getBrandBaseInfo();
            this.setData({
                showFloorMap,
                distributionEnable: cpsConfig.enable,
            });
        } catch (err) {
            console.error(err);
        }
    },

    outLogin: function(event) {
        globallogout(this);
    },
    login() {
        if (this.data.isLogined) {
            return false;
        }
        globalLoginShow({
            data: {
                returnpage: "/pages/personalHealth/personalHealth",
                fromPageLevel: 1,
            },
        });
    },

    toPointMall() {
        if (!this.data.isLogined) {
            this.login();
            return;
        }
        const url =
            "https://gw-fsep.jd.com/GoodsList?businessGroup=5&shopId=10088683";
        loginUtil.navigateToH5({ page: url });
    },

    healthFiles() {
        if (!this.data.isLogined) {
            this.login();
            return;
        }
        let url =
            "https://m.healthjd.com/ant_patient/recordList?businessTypbePromotere=2&appType=1";
        loginUtil.navigateToH5({ page: url });
    },

    navigateTo(e) {
        wx.navigateTo({
            url: e.target.dataset.url,
        });
    },
    /**
     * 跳转H5页面(跳转h5链接统一添加openId参数)
     */
    goH5: async function(url) {
        let openId = await app.getOpenId();
        url = decodeURIComponent(
            `${url}${
                url.indexOf("?") > -1 ? "&" : "?"
            }openId=${openId}&miniWexinAppId=${app.miniWexinAppId}`
        );
        loginUtil.navigateToH5({ page: url });
    },
    prescribe: function() {
        this.goH5("https://m.healthjd.com/s/my/prescribe?miniprogram=jdjk");
    },
    selectPatient: function() {
        this.goH5(
            "https://m.healthjd.com/s/common/selectPatient?from=my&miniprogram=jdjk"
        );
    },
    inquiry: function() {
        this.goH5("https://m.healthjd.com/s/inquiry/history?miniprogram=jdjk");
    },

    //复制用户pin
    copyInviteCode: function() {
        var that = this;
        wx.setClipboardData({
            data: that.data.pinCode,
            success(res) {
                wx.getClipboardData({
                    success(res) {
                        wx.showToast({
                            title: "复制成功",
                            icon: "success",
                        });
                    },
                });
            },
        });
    },
});
