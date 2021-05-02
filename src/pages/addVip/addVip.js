// pages/addVip/addVip.js
//skz
import * as API from "../../utils/api-member.js";
import { wxParse } from "../../libs/wxParse/wxParse.js";
import queryString from "query-string";
const plugin = requirePlugin("loginPlugin");
import kGetCleanOpenid from "../../utils/getOpenid";
import { wxInfo } from "../../utils/JDH-pharmacy/wxlog.js";
import { COUPON_DIALOG_FROM_SCENE } from "../../constants/index";
import {
    getfromPage,
    getfromScene,
    getMPQrCodeParams,
    setEmployeePinFromShopperAssistant,
} from "../../utils/JDH-pharmacy/index.js";
const app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        brandId: "",
        bId: "",
        todayDate: "",
        isManCheck: true,
        isWomenCheck: false,
        basicBindRegisterInfo: [],
        accompanyBindRegisterDTOList: [],
        babyValidate: [],
        nowBabyIndex: 0,
        submitDisabled: true,
        isScane: false,
        phone: "",
        valiCode: "",
        validate: {},
        canGetPhoneCode: true,
        second: 60,
        kt: 1,
        status: false,
        fromtype: "local",
        agreePro: false,
        agreeProAnimation: {},
        hasGift: false,
        couponList: [],
        hasPlaybillShare: false,
        options: {},
        protocolchecked: false,
        // optionsString: '',
        brandName: "",
        showAccompanyBindIcon: false,
        openFollowVender: false,
        selBabyProtocol: false,
        followFlag: true,
        authWX: false,
        returnIcon: true,
        fromOpenId: "", //openid
        fromPage: "", //微信埋点分析勿删
        fromScene: "", //微信埋点分析勿删
    },

    /**
     * 生命周期函数--监听页面加载
     */
    async onLoad(options = {}) {
        console.log(options);
        wxInfo("进入会员页面时options--------------", options);
        const selfOpenId = await kGetCleanOpenid();
        this.setData({
            selfOpenId,
        });

        if (options && !options.channel && options.from != 99) {
            options.channel = 214;
        }
        if (options.scene) {
            // 扫普通二维码码进入
            if (options.scene == 1011 || options.q) {
                const { query } = queryString.parseUrl(
                    decodeURIComponent(options.q)
                );
                query.bId = query.bizId;
                this.checkLogin(query);
            } else {
                // 扫描小程序码进入
                try {
                    const query = await getMPQrCodeParams(options);
                    if (query) {
                        this.checkLogin(query);
                    }
                } catch (err) {
                    wx.showModal({
                        content: `${err}`,
                        showCancel: false,
                    });
                }
            }
        } else {
            // FIXME: 重新确定scene字段返回时机
            if (options.q) {
                const { query } = queryString.parseUrl(
                    decodeURIComponent(options.q)
                );
                query.bId = query.bizId;
                this.checkLogin(query);
            } else if (options.from == "99") {
                this.checkLogin(options);
            } else {
                this.checkLogin(options);
            }
        }

        // // 如果是扫码进入
        // if (options.scene == 1011 || options.q) {
        //   const { query } = queryString.parseUrl(decodeURIComponent(options.q))
        //   query.bId = query.bizId
        //   this.checkLogin(query);
        // } else {
        //   // 解析参数，判断是否是扫小程序码进入
        //   console.log(query);
        //   if (query) {
        //     this.checkLogin(query);
        //   } else {
        //     this.checkLogin(options);
        //   }
        // }
        setEmployeePinFromShopperAssistant();
        this.setData({
            fromPage: getfromPage(),
            fromScene: getfromScene(options),
        });
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        if (this.data.options.shareChainId) {
            let fromPin = plugin.getPtKey();
            // this.reportData({
            //   shareChainId: this.data.options.shareChainId,
            //   fromPin: fromPin,
            //   fromOpenId: fromOpenId,
            //   type: 1,
            //   level: Number(this.data.options.level) + 1
            // })
            let fromOpenId =
                this.data.options.fromOpenId || this.data.selfOpenId;
            console.log(
                `/pages/addVip/addVip?brandId=${
                    this.data.options.brandId
                }&bId=${this.data.options.bId}&shareChainId=${
                    this.data.options.shareChainId
                }&type=2&level=${Number(this.data.options.level) +
                    1}&fromPin=${fromPin}&fromOpenId=${fromOpenId}&employeeId=${
                    this.data.options.employeeId
                }&qrCodeType=${this.data.options.qrCodeType}&channel=${
                    this.data.options.channel
                }&storeId=${this.data.options.storeId}`
            );

            return {
                title: `【${this.data.options.employeeName ||
                    this.data.userName}】邀请您成为“${
                    this.data.brandName
                }”品牌会员，享受更多专属权益`,
                imageUrl: "https://thunder.jd.com/jpass/img/share_card.png",
                path: `/pages/addVip/addVip?brandId=${
                    this.data.options.brandId
                }&bId=${this.data.options.bId}&shareChainId=${
                    this.data.options.shareChainId
                }&type=2&level=${Number(this.data.options.level) +
                    1}&fromPin=${fromPin}&fromOpenId=${fromOpenId}&employeeId=${
                    this.data.options.employeeId
                }&qrCodeType=${this.data.options.qrCodeType}&channel=${
                    this.data.options.channel
                }&storeId=${this.data.options.storeId}`,
            };
        } else {
            return {
                title: `【${this.data.options.employeeName ||
                    this.data.userName}】邀请您成为“${
                    this.data.brandName
                }”品牌会员，享受更多专属权益`,
                imageUrl: "https://thunder.jd.com/jpass/img/share_card.png",
                path: `/pages/addVip/addVip?brandId=${this.data.options.brandId}&bId=${this.data.options.bId}&storeId=${this.data.options.storeId}`,
            };
        }
    },

    toggleProtocol() {
        this.setData({
            protocolchecked: !this.data.protocolchecked,
        });
    },

    checkLogin(options) {
        API.checkLogin({
            pt_key: options.pt_key || "",
            success: async () => {
                this.setData({
                    options: options,
                    todayDate: this.setTodayDate(),
                    // optionsString: JSON.stringify(options)
                });
                // log.set({
                //   urlParam: options,
                //   siteId: 'JA2018_5111046',
                //   account: wx.getStorageSync('jdlogin_pt_pin'),
                //   pparam: options.brandId,
                //   pageId: 'Page_member'
                // })
                // if (options.brandId && options.bId) {
                //   wx.setStorageSync('brandId', options.brandId)
                //   wx.setStorageSync('bId', options.bId)
                // }
                this.authJudge();
                this.queryOpenCardGiftAndBanner();
                this.checkShareChain();
                wx.getSystemInfo({
                    success: (res) => {
                        this.setData({
                            windowWidth: res.windowWidth,
                            windowHeight: res.windowHeight,
                        });
                    },
                });
                let openId = await app.getOpenId();
                let registerInfoData = {
                    sessionId: openId,
                    brandId: options.brandId,
                    bid: options.bId,
                    channel: options.channel || 214,
                    storeId: options.storeId,
                };
                console.log(registerInfoData);
                // console.log('add Vip RegisterInfo', registerInfoData)
                this.getNewRegisterInfo(registerInfoData);
                API.getJDInfo({
                    success: (res) => {
                        if (res.data.success) {
                            this.setData({
                                userName: res.data.data.userName,
                            });
                        }
                    },
                });
            },
            fail: () => {
                // console.log('fail');
            },
        });
    },

    getNewRegisterInfo(registerInfoData) {
        API.GWAjax({
            functionName: "CardExportService.getNewRegisterInfo",
            data: registerInfoData,
            success: (res) => {
                res = res.data;
                if (res.code == 0 && res.data && res.data.data) {
                    this.setData({
                        registerType: res.data.data.registerType,
                        liberty: res.data.data.cardInfo,
                        brandsName: res.data.data.brandsName,
                        openFollowVender: res.data.data.openFollowVender,
                        showAccompanyBindIcon:
                            res.data.data.showAccompanyBindIcon,
                    });

                    let basicBindRegisterInfo =
                        res.data.data.basicBindRegisterInfo || [];
                    let validate = {};
                    for (let i = 0; i < basicBindRegisterInfo.length; i++) {
                        validate[basicBindRegisterInfo[i].valueId] = {
                            isRequired: basicBindRegisterInfo[i].isRequired,
                            validateRule: basicBindRegisterInfo[i].validateRule,
                            validateTitle:
                                basicBindRegisterInfo[i].validateTitle,
                            isChange: false,
                            value: "",
                        };
                        if (basicBindRegisterInfo[i].valueId == "v_phone") {
                            let data = {
                                labelName: "验证码",
                                valueId: "code",
                                valueType: "code",
                                isRequired: 1,
                                validateRule: "",
                            };
                            validate[basicBindRegisterInfo[i].valueId].value =
                                basicBindRegisterInfo[i].value;
                            if (!basicBindRegisterInfo[i].value) {
                                validate[
                                    basicBindRegisterInfo[i].valueId
                                ].isChange = true;
                            }
                            let valueDefault = JSON.parse(
                                basicBindRegisterInfo[i].valueDefault
                            );
                            if (valueDefault.length) {
                                basicBindRegisterInfo[i].len =
                                    valueDefault.length;
                            }
                            if (valueDefault.format) {
                                basicBindRegisterInfo[i].format =
                                    valueDefault.format;
                            }
                            basicBindRegisterInfo.splice(i + 1, 0, data);
                        } else if (
                            basicBindRegisterInfo[i].valueType == "radio"
                        ) {
                            let valueDefault = JSON.parse(
                                basicBindRegisterInfo[i].valueDefault
                            );
                            validate[
                                basicBindRegisterInfo[i].valueId
                            ].valueDefault = valueDefault;
                            for (let j = 0; j < valueDefault.length; j++) {
                                if (valueDefault[j].selected) {
                                    validate[
                                        basicBindRegisterInfo[i].valueId
                                    ].value = valueDefault[j].name;
                                }
                            }
                        } else {
                            validate[basicBindRegisterInfo[i].valueId].value =
                                basicBindRegisterInfo[i].value;
                            if (basicBindRegisterInfo[i].valueDefault) {
                                try {
                                    let valueDefault = JSON.parse(
                                        basicBindRegisterInfo[i].valueDefault
                                    );
                                    if (valueDefault.length) {
                                        basicBindRegisterInfo[i].len =
                                            valueDefault.length;
                                    }
                                    if (valueDefault.format) {
                                        basicBindRegisterInfo[i].format =
                                            valueDefault.format;
                                    }
                                } catch (e) {}
                            }
                        }
                    }
                    this.initBabyValidate(res);

                    let disabled = false;
                    for (let key in validate) {
                        if (!validate.v_phone.isChange && key == "code") {
                            continue;
                        }
                        if (
                            validate[key].isRequired == 1 &&
                            !validate[key].value
                        ) {
                            disabled = true;
                        }
                    }
                    this.setData({
                        submitDisabled: disabled,
                        basicBindRegisterInfo: basicBindRegisterInfo,
                        validate: validate,
                    });
                } else {
                    const { data } = res;
                    if (data && data.message) {
                        if (
                            data.message === "此品牌暂未开通会员体系" &&
                            registerInfoData.storeId
                        ) {
                            wx.showModal({
                                content:
                                    "此品牌没开通会员体系，是否要跳转门店页",
                                showCancel: false,
                                success: (res) => {
                                    if (res.confirm) {
                                        app.globalData.storeId =
                                            registerInfoData.storeId;
                                        wx.switchTab({
                                            url: `/pages/newShop/shopFront`,
                                        });
                                        // wx.redirectTo({
                                        //   url: `/pages/newShop/shopFront?storeId=${registerInfoData.storeId}`
                                        // })
                                    }
                                },
                            });
                        } else {
                            wx.showToast({
                                title: data.message,
                                duration: 2000,
                                icon: "none",
                            });
                        }
                    }
                }
            },
            fail: (err) => {
                wx.showModal({
                    title: "提示",
                    content: "网络错误，请稍后再试",
                    showCancel: false,
                    confirmText: "返回首页",
                    complete: function() {
                        wx.switchTab({
                            url: "/pages/newShop/shopFront",
                        });
                    },
                });
            },
        });
    },

    authJudge() {
        API.GWAjax({
            functionName: "BrandExportService.isEnterpriseAuth",
            data: {
                isEnterpriseAuthParam: {
                    bid: this.data.options.bId || wx.getStorageInfoSync("bId"),
                },
            },
            success: (res) => {
                res = res.data;
                if (res.code == 0 && res.data.data && res.data.success) {
                    API.GWAjax({
                        functionName: "UserExportService.alreadyExistsPin", //获取unoinid和pin的关系
                        data: {},
                        needOpenId: true,
                        success: (r) => {
                            if (
                                r.data.code == 0 &&
                                r.data.data.success &&
                                r.data.data.data == 0
                            ) {
                                //如果没有关系
                                this.setData({
                                    authWX: true,
                                });
                                wx.login({
                                    success: (res) => {
                                        var jsCode = res.code;
                                        API.GWAjax({
                                            functionName:
                                                "WxDecryptService.getSessionKey",
                                            data: {
                                                wxSessionKeyParam: {
                                                    jsCode: jsCode,
                                                },
                                            },
                                            needOpenId: true,
                                            success: (result) => {
                                                if (result.data.code == 0) {
                                                    this.setData({
                                                        sessionKey:
                                                            result.data.data,
                                                    });
                                                }
                                            },
                                        });
                                    },
                                });
                            }
                        },
                    });
                } else {
                    this.setData({
                        authWX: false,
                    });
                }
            },
            error: (res) => {
                this.setData({
                    authWX: false,
                });
            },
        });
    },

    initBabyValidate(res) {
        // 宝宝信息
        let accompanyBindRegisterDTOList =
            res.data.data.accompanyBindRegisterDTOList || [];
        let babyValidate = [];
        for (let j = 0; j < accompanyBindRegisterDTOList.length; j++) {
            let validate = {};
            for (
                let i = 0;
                i <
                accompanyBindRegisterDTOList[j]["accompanyBindRegisterInfo"]
                    .length;
                i++
            ) {
                validate[
                    accompanyBindRegisterDTOList[j][
                        "accompanyBindRegisterInfo"
                    ][i].valueId
                ] = {
                    isRequired:
                        accompanyBindRegisterDTOList[j][
                            "accompanyBindRegisterInfo"
                        ][i].isRequired,
                    validateRule:
                        accompanyBindRegisterDTOList[j][
                            "accompanyBindRegisterInfo"
                        ][i].validateRule,
                    validateTitle:
                        accompanyBindRegisterDTOList[j][
                            "accompanyBindRegisterInfo"
                        ][i].validateTitle,
                    isChange: false,
                    value: "",
                };
                if (
                    accompanyBindRegisterDTOList[j][
                        "accompanyBindRegisterInfo"
                    ][i].valueId == "v_phone"
                ) {
                    let data = {
                        labelName: "验证码",
                        valueId: "code",
                        valueType: "code",
                        isRequired: 1,
                        validateRule: "",
                    };
                    validate[
                        accompanyBindRegisterDTOList[j][
                            "accompanyBindRegisterInfo"
                        ][i].valueId
                    ].value =
                        accompanyBindRegisterDTOList[j][
                            "accompanyBindRegisterInfo"
                        ][i].value;
                    if (
                        !accompanyBindRegisterDTOList[j][
                            "accompanyBindRegisterInfo"
                        ][i].value
                    ) {
                        validate[
                            accompanyBindRegisterDTOList[j][
                                "accompanyBindRegisterInfo"
                            ][i].valueId
                        ].isChange = true;
                    }
                    let valueDefault = JSON.parse(
                        accompanyBindRegisterDTOList[j][
                            "accompanyBindRegisterInfo"
                        ][i].valueDefault
                    );
                    if (valueDefault.length) {
                        accompanyBindRegisterDTOList[j][
                            "accompanyBindRegisterInfo"
                        ][i].len = valueDefault.length;
                    }
                    if (valueDefault.format) {
                        accompanyBindRegisterDTOList[j][
                            "accompanyBindRegisterInfo"
                        ][i].format = valueDefault.format;
                    }
                    accompanyBindRegisterDTOList[j][
                        "accompanyBindRegisterInfo"
                    ].splice(i + 1, 0, data);
                } else if (
                    accompanyBindRegisterDTOList[j][
                        "accompanyBindRegisterInfo"
                    ][i].valueType == "radio"
                ) {
                    let valueDefault = JSON.parse(
                        accompanyBindRegisterDTOList[j][
                            "accompanyBindRegisterInfo"
                        ][i].valueDefault
                    );
                    validate[
                        accompanyBindRegisterDTOList[j][
                            "accompanyBindRegisterInfo"
                        ][i].valueId
                    ].valueDefault = valueDefault;
                    for (let j = 0; j < valueDefault.length; j++) {
                        if (valueDefault[j].selected) {
                            validate[
                                accompanyBindRegisterDTOList[j][
                                    "accompanyBindRegisterInfo"
                                ][i].valueId
                            ].value = valueDefault[j].name;
                        }
                    }
                } else {
                    validate[
                        accompanyBindRegisterDTOList[j][
                            "accompanyBindRegisterInfo"
                        ][i].valueId
                    ].value =
                        accompanyBindRegisterDTOList[j][
                            "accompanyBindRegisterInfo"
                        ][i].value;
                    if (
                        accompanyBindRegisterDTOList[j][
                            "accompanyBindRegisterInfo"
                        ][i].valueDefault
                    ) {
                        try {
                            let valueDefault = JSON.parse(
                                accompanyBindRegisterDTOList[j][
                                    "accompanyBindRegisterInfo"
                                ][i].valueDefault
                            );
                            if (valueDefault.length) {
                                accompanyBindRegisterDTOList[j][
                                    "accompanyBindRegisterInfo"
                                ][i].len = valueDefault.length;
                            }
                            if (valueDefault.format) {
                                accompanyBindRegisterDTOList[j][
                                    "accompanyBindRegisterInfo"
                                ][i].format = valueDefault.format;
                            }
                        } catch (e) {}
                    }
                }
            }
            babyValidate.push(validate);
        }
        this.setData({
            babyValidate: babyValidate,
            accompanyBindRegisterDTOList: accompanyBindRegisterDTOList,
        });
    },

    queryOpenCardGiftAndBanner() {
        API.getBrandByBidAndBrandId({
            bId: this.data.options.bId,
            brandId: this.data.options.brandId,
            success: (res) => {
                res = res.data;
                if (
                    res.data.brandCustomer &&
                    res.data.brandCustomer.customerInBrand &&
                    !this.data.options.pt_key
                ) {
                    //直达门店-通过导购二维码开通会员卡后(若用户已开卡则直接跳转对应门店主页）
                    wx.setStorageSync("brandId", this.data.options.brandId);
                    wx.setStorageSync("bId", this.data.options.bId);
                    app.globalData.storeId = this.data.options.storeId;
                    wx.switchTab({
                        url: `/pages/newShop/shopFront`,
                    });
                    setTimeout(() => {
                        wx.showToast({
                            title: "已是会员",
                            icon: "none",
                        });
                    }, 500);
                } else {
                    this.setData({
                        logoPath: "https:" + res.data.logoPath,
                        brandName: res.data.brandName,
                    });
                }
            },
        });
        API.GWAjax({
            functionName: "OpenCardActivityExportService.query",
            data: {
                brandId: this.data.options.brandId,
                bizId: this.data.options.bId,
            },
            success: (res) => {
                res = res.data;
                if (res.code == 0 && res.data && res.data.success) {
                    let data = res.data.data.couponList;
                    for (let i = 0; i < data.length; i++) {
                        if (
                            data[i].activityType == 1 &&
                            data[i].couponList.length != 0
                        ) {
                            //有开卡大礼包
                            this.setData({
                                hasGift: true,
                                couponList: data[i].couponList,
                                activityid: data[i].activityId,
                                activitytype: data[i].activityType,
                            });
                        }
                    }
                }
            },
        });
    },

    switchBaby() {
        let len = this.data.accompanyBindRegisterDTOList.length;
        this.setData({
            nowBabyIndex:
                this.data.nowBabyIndex + 1 == len
                    ? 0
                    : this.data.nowBabyIndex + 1,
        });
    },
    bindDateChange: function(e) {
        let validateType =
            e.currentTarget.dataset.validateName == "babyValidate"
                ? `babyValidate[${this.data.nowBabyIndex}]`
                : "validate";
        this.setData({
            [validateType +
            "." +
            e.currentTarget.dataset.name +
            ".isChange"]: true,
        });

        console.log(e);
        this.checkSubmitDisabled(e);
    },

    setTodayDate() {
        var todayDate = new Date();
        var month = todayDate.getMonth();
        month = month < 9 ? "0" + (month + 1) : month + 1;
        todayDate =
            todayDate.getFullYear() + "-" + month + "-" + todayDate.getDate();
        return todayDate;
    },

    selectRadio(e) {
        let radioData = e.currentTarget.dataset.radioData;
        let name = e.currentTarget.dataset.name;
        let validateName = e.currentTarget.dataset.validateName;
        let validateType =
            validateName == "babyValidate"
                ? `babyValidate[${this.data.nowBabyIndex}]`
                : "validate";
        let list = [];
        for (let i = 0; i < radioData.length; i++) {
            list.push(radioData[i].name);
        }
        wx.showActionSheet({
            itemList: list,
            success: (res) => {
                let newData =
                    validateName == "babyValidate"
                        ? this.data.babyValidate[this.data.nowBabyIndex][name]
                              .valueDefault
                        : this.data.validate[name].valueDefault;
                for (let i = 0; i < newData.length; i++) {
                    if (i == res.tapIndex) {
                        newData[i].selected = true;
                    } else {
                        newData[i].selected = false;
                    }
                }
                this.setData({
                    [validateType + "." + name + ".isChange"]: true,
                    [validateType + "." + name + ".valueDefault"]: newData,
                });
                this.checkSubmitDisabled({
                    currentTarget: {
                        dataset: {
                            name: name,
                            validateName: validateName,
                        },
                    },
                    detail: {
                        value: newData[res.tapIndex].name,
                    },
                });
            },
        });
    },

    checkSubmitDisabled(e) {
        let validateType =
            e.currentTarget.dataset.validateName == "babyValidate"
                ? `babyValidate[${this.data.nowBabyIndex}]`
                : "validate";
        let name = e.currentTarget.dataset.name;
        this.setData({
            [validateType + "." + name + ".value"]: e.detail.value,
        });
        let disabled = false;
        let babyDisabled = false;
        for (let key in this.data.validate) {
            if (!this.data.validate.v_phone.isChange && key == "code") {
                continue;
            }
            if (
                this.data.validate[key].isRequired == 1 &&
                !this.data.validate[key].value
            ) {
                disabled = true;
            }
        }
        for (let key in this.data.babyValidate[this.data.nowBabyIndex]) {
            if (
                this.data.babyValidate[this.data.nowBabyIndex][key]
                    .isRequired == 1 &&
                !this.data.babyValidate[this.data.nowBabyIndex][key].value
            ) {
                babyDisabled = true;
            }
        }
        this.setData({
            submitDisabled: disabled || babyDisabled,
        });
    },

    isFocusToCheckChange(e) {
        let validateType =
            e.currentTarget.dataset.validateName == "babyValidate"
                ? `babyValidate[${this.data.nowBabyIndex}]`
                : "validate";
        let ifCondition =
            e.currentTarget.dataset.validateName == "babyValidate"
                ? this.data.babyValidate[this.data.nowBabyIndex][
                      e.currentTarget.dataset.name
                  ].isChange
                : this.data.validate[e.currentTarget.dataset.name].isChange;
        if (!ifCondition) {
            this.setData({
                [validateType +
                "." +
                e.currentTarget.dataset.name +
                ".isChange"]: true,
                [validateType +
                "." +
                e.currentTarget.dataset.name +
                ".value"]: "",
            });
        }
    },
    babyProtocol() {
        this.setData({
            showBabyProtocol: true,
        });
    },
    followProtocol() {
        this.setData({
            followFlag: !this.data.followFlag,
        });
    },
    agreeBabyProtocol() {
        this.setData({
            showBabyProtocol: false,
            selBabyProtocol: true,
        });
    },
    disAgreeBabyProtocol() {
        this.setData({
            showBabyProtocol: false,
            selBabyProtocol: false,
        });
    },
    goback() {
        wx.navigateBack();
    },

    joinMember(e) {
        var self = this;

        if (!this.data.protocolchecked) {
            return wx.showToast({
                icon: "none",
                title: "请确认授权会员协议",
            });
        }
        if (this.data.submitDisabled) {
            wx.showToast({
                icon: "none",
                title: "请将个人信息填充完整",
            });
            return;
        }
        var registerInfoJson = {};
        for (var key in this.data.validate) {
            if (
                this.data.validate[key].validateRule &&
                this.data.validate[key].isChange
            ) {
                var r = new RegExp(this.data.validate[key].validateRule);
                if (!r.test(this.data.validate[key].value)) {
                    wx.showToast({
                        icon: "none",
                        title: this.data.validate[key].validateTitle,
                    });
                    return;
                }
            }
            if (this.data.validate[key].isChange) {
                registerInfoJson[key] = this.data.validate[key].value;
            } else {
                registerInfoJson[key] = null;
            }
        }
        if (this.data.babyValidate.length > 0) {
            let nowBabyValidate = this.data.babyValidate[
                this.data.nowBabyIndex
            ];
            for (var key in nowBabyValidate) {
                if (nowBabyValidate[key].validateRule) {
                    var r = new RegExp(nowBabyValidate[key].validateRule);
                    if (!r.test(nowBabyValidate[key].value)) {
                        wx.showToast({
                            icon: "none",
                            title: nowBabyValidate[key].validateTitle,
                        });
                        return;
                    }
                }
                if (nowBabyValidate[key].isChange) {
                    registerInfoJson[key] = nowBabyValidate[key].value;
                } else {
                    registerInfoJson[key] = null;
                }
            }
            registerInfoJson.v_child_id =
                this.data.accompanyBindRegisterDTOList[this.data.nowBabyIndex]
                    .babyId || this.data.nowBabyIndex + 1;
        }
        wx.showLoading({
            title: "开卡中",
        });
        delete registerInfoJson.code;
        // 加入会员带入storeId
        const storeId = this.options.storeId;
        if (storeId) {
            registerInfoJson.storeId = storeId;
        }

        registerInfoJson = JSON.stringify(registerInfoJson);
        // if (this.data.options.kt) {
        //   log.click({
        //     "eid": "affirm_member_guide" + this.data.options.kt,
        //     "eparam": this.data.options.brandId,
        //     "event": e
        //   })
        // } else {
        //   log.click({
        //     "eid": "affirm_member",
        //     "eparam": this.data.options.brandId,
        //     "event": e
        //   })
        // }

        if (!this.data.validate.v_phone.isChange) {
            self.ktJpassAndVip(registerInfoJson);
        } else {
            API.GWAjax({
                functionName: "SMSExportService.checkSmsCode",
                data: {
                    phone: this.data.validate.v_phone.value,
                    code: this.data.validate.code.value,
                },
                success: (res) => {
                    res = res.data;
                    if (res.code == 0 && res.data && res.data.success) {
                        self.ktJpassAndVip(registerInfoJson);
                    } else {
                        wx.showToast({
                            icon: "none",
                            title: res.data.message,
                        });
                        wx.hideLoading();
                    }
                },
                error: (err) => {
                    wx.showToast({
                        icon: "none",
                        title: "验证码校验失败，请稍后再试",
                    });
                    wx.hideLoading();
                },
            });
        }
    },

    getPhoneCode() {
        var self = this;
        API.GWAjax({
            functionName: "SMSExportService.sendSms",
            data: {
                phone: this.data.validate.v_phone.value,
            },
            success: (res) => {
                res = res.data;
                if (res.code == 0 && res.data && res.data.success) {
                    self.countDown();
                    self.setData({
                        canGetPhoneCode: false,
                    });
                } else {
                    wx.showToast({
                        icon: "none",
                        title: res.data.message,
                    });
                }
            },
            error: (err) => {
                wx.showToast({
                    icon: "none",
                    title: "验证码发送失败，请稍后再试",
                });
            },
        });
    },
    countDown() {
        var self = this;
        setTimeout(function() {
            if (self.data.second != 0) {
                self.setData({
                    second: --self.data.second,
                });
                self.countDown();
            } else {
                self.setData({
                    canGetPhoneCode: true,
                    second: 60,
                });
            }
        }, 1000);
    },
    async ktJpassAndVip(registerInfoJson) {
        var self = this;
        if (this.data.options.shareChainId) {
            var obj = {
                storeId: this.data.options.storeId,
                salesId: this.data.options.employeeId,
                qrCodeType: this.data.options.qrCodeType,
                brandId: this.data.options.brandId,
                bId: this.data.options.bId,
                registerInfoJson: registerInfoJson,
                openType: this.data.options.kt == 1 ? "2" : "1",
                registerType: this.data.registerType,
                channel: this.data.options.channel || 214,
            };
        } else {
            var obj = {
                brandId:
                    this.data.options.brandId || wx.getStorageSync("brandId"),
                bId: this.data.options.bId || wx.getStorageSync("bId"),
                registerInfoJson: registerInfoJson,
                openType: this.data.options.kt == 1 ? "2" : "1",
                registerType: this.data.registerType,
                channel: this.data.options.channel || 214,
            };
            if (
                wx.getStorageSync("qrCodeType") &&
                wx.getStorageSync("salesId") &&
                wx.getStorageSync("storeId")
            ) {
                obj.storeId = wx.getStorageSync("storeId");
                obj.salesId = wx.getStorageSync("salesId");
                obj.qrCodeType = wx.getStorageSync("qrCodeType");
            }
            if (this.data.options.storeId) {
                obj.storeId = this.data.options.storeId;
            }
            // FIXME:这里改过，需要验证
            // 二维码分享需传入employeeId
            if (this.data.options.employeeId) {
                obj.salesId = this.data.options.employeeId;
            }
        }
        obj.phone = this.data.validate.v_phone.isChange
            ? this.data.validate.v_phone.value
            : null;
        obj.followFlag = this.data.followFlag ? 0 : 1;
        if (this.data.showAccompanyBindIcon) {
            obj.writeChildFlag = this.data.selBabyProtocol ? 0 : 1;
        } else {
            if (this.data.accompanyBindRegisterDTOList.length > 0) {
                obj.writeChildFlag = 1;
                let nowBabyValidate = this.data.babyValidate[
                    this.data.nowBabyIndex
                ];
                for (let i; i < nowBabyValidate.length; i++) {
                    if (nowBabyValidate[i].isChange) {
                        obj.writeChildFlag = 0;
                        break;
                    }
                }
            } else {
                obj.writeChildFlag = 1;
            }
        }
        let openId = await app.getOpenId();
        API.GWAjax({
            functionName: "CardExportService.openCardNew",
            data: {
                sessionId: openId,
                params: obj,
            },
            success: (res) => {
                wx.hideLoading();
                if (
                    res.data.code == 0 &&
                    res.data.data &&
                    res.data.data.success
                ) {
                    // 2021-03-17 新人券弹窗
                    // 加入会员返回主页后 需要弹出新人券弹窗的标记
                    wx.setStorageSync(
                        COUPON_DIALOG_FROM_SCENE,
                        "fresherCoupon"
                    );
                    // 开卡是否有开卡礼包，大药房如果不需要可以删除这段逻辑
                    if (self.data.hasGift) {
                        self.setData({
                            status: true,
                        });
                    } else {
                        // TODO: 修改过这里的逻辑需要验证
                        wx.showToast({
                            title: "开通成功",
                            complete: function() {
                                setTimeout(function() {
                                    let visitSource =
                                        app.globalData.visitSource;
                                    if (
                                        visitSource == 2 ||
                                        visitSource == 3 ||
                                        visitSource == 6
                                    ) {
                                        // 如果是导购助手分享出去的
                                        //直达门店-通过导购二维码开通会员卡后，默认跳转导购对应的门店主页
                                        app.globalData.storeId =
                                            self.data.options.storeId;
                                        wxInfo(
                                            "加入会员成功storeId----------------",
                                            self.data.options.storeId
                                        );
                                        wxInfo(
                                            "加入会员成功self.data.options----------------",
                                            self.data.options
                                        );
                                        console.log(
                                            "加入会员成功storeId----------------",
                                            self.data.options.storeId
                                        );
                                        wx.setStorageSync(
                                            "brandId",
                                            self.data.options.brandId
                                        );
                                        wx.setStorageSync(
                                            "bId",
                                            self.data.options.bId
                                        );
                                        wx.switchTab({
                                            url: `/pages/newShop/shopFront`,
                                        });
                                        // wx.redirectTo({
                                        //   url: `/pages/cardInfo/cardInfo?brandId=${self.data.options.brandId}&bId=${self.data.options.bId}`,
                                        // })
                                    } else {
                                        // 普通用户分享出去的
                                        const history = getCurrentPages();
                                        if (history.length === 1) {
                                            wx.redirectTo({
                                                url: `/pages/cardInfo/cardInfo?brandId=${self.data.options.brandId}&bId=${self.data.options.bId}`,
                                            });
                                        } else {
                                            wx.navigateBack();
                                        }
                                    }
                                }, 1000);
                            },
                        });
                    }
                } else {
                    if (res.data.data.code == "E500") {
                        wx.showToast({
                            icon: "none",
                            title: res.data.data.desc,
                        });
                    } else {
                        wx.showToast({
                            icon: "none",
                            title: res.data.data.message,
                            complete: function() {},
                        });
                    }
                }
            },
            fail: (err) => {
                wx.hideLoading();
                wx.showToast({
                    icon: "none",
                    title: "服务器异常，请稍后再试",
                });
            },
        });
    },
    async memberPro(e) {
        var that = this;
        this.setData({
            agreePro: true,
            agreeProType: e.currentTarget.dataset.type,
        });
        var animation = wx.createAnimation({
            transformOrigin: "50% 50%",
            duration: 300,
            timingFunction: "ease-in-out",
            delay: 0,
        });
        animation.bottom(0).step();
        this.setData({
            agreeProAnimation: animation.export(),
        });
        if (e.currentTarget.dataset.type == 1) {
            let openId = await APP.getOpenId();
            API.GWAjax({
                functionName: "CardExportService.getAggrement",
                data: {
                    sessionId: openId,
                    brandId:
                        this.data.options.brandId ||
                        wx.getStorageSync("brandId"),
                    bid: this.data.options.bId || wx.getStorageSync("bId"),
                },
                success: (res) => {
                    if (res.data.code == 0) {
                        var article = res.data.data.data;
                        wxParse("article", "html", article, that, 5);
                    }
                },
            });
        }
    },
    closeAgreePro() {
        var self = this;
        var animation = wx.createAnimation({
            transformOrigin: "50% 50%",
            duration: 300,
            timingFunction: "ease-in-out",
            delay: 0,
        });
        animation.bottom("-888rpx").step();
        this.setData({
            agreeProAnimation: animation.export(),
        });
        setTimeout(function() {
            self.setData({
                agreePro: false,
            });
        }, 300);
    },

    // 上报
    reportData(opt) {
        wx.showShareMenu();
        // API.saleReportData({
        //   shareChainId: opt.shareChainId,
        //   fromPin: opt.fromPin || '',
        //   fromOpenId: opt.fromOpenId || '',
        //   type: opt.type,
        //   level: opt.level
        // })
    },
    //检查是否有分享链
    checkShareChain() {
        //判断是不是从导购小程序进入
        if (this.data.options.pt_key) {
            let reportData = {
                shareChainId: this.data.options.shareChainId,
                type: 2,
                level: 0,
            };
            this.setData({
                hasPlaybillShare: this.data.options.route == 1 ? false : true,
                options: Object.assign({}, this.data.options, reportData),
            });
            this.reportData(reportData);
        } else {
            if (this.data.options.shareChainId) {
                this.openStoreCheck();
                this.reportData(this.data.options);
            }
        }
    },
    openStoreCheck() {
        API.GWAjax({
            functionName: "JrCustomerExportService.openStoreCheck",
            data: {
                bId: this.data.options.bId,
                brandId: this.data.options.brandId,
                salesId: this.data.options.employeeId,
                qrCodeType: this.data.options.qrCodeType,
            },
            success: (res) => {
                res = res.data;
                if (res.code == 0 && res.data && res.data.success) {
                    if (res.data.data && res.data.data.storeId) {
                        this.setData({
                            "options.storeId": res.data.data.storeId,
                        });
                    }
                    if (res.data.data && res.data.data.exStoreId) {
                        this.setData({
                            "options.shopId": res.data.data.exStoreId,
                        });
                    }
                    switch (res.data.code) {
                        case "10000":
                            this.setData({
                                "options.valiCode": res.data.code,
                                "options.kt": 2,
                                "options.fromtype": "scane",
                            });
                            break;
                        case "10001":
                            this.setData({
                                "options.valiCode": res.data.code,
                                "options.kt": 1,
                                "options.fromtype": "scane",
                            });
                            break;
                    }
                }
            },
        });
    },
    bindUserInfo(e) {
        console.log(e);
        if (e.detail.encryptedData) {
            API.GWAjax({
                functionName: "WxDecryptService.decryptBody", //获取unionId
                data: {
                    wxParamDecodeParam: {
                        sessionKey: this.data.sessionKey,
                        iv: e.detail.iv,
                        paramData: e.detail.encryptedData,
                    },
                },
                success: (res) => {
                    console.log("get UnionId", res);
                    if (res.data.code == 0) {
                        API.GWAjax({
                            functionName:
                                "UserExportService.addOpenPlatformUserInfo", //获取unoinid和pin的关系
                            data: {
                                openPlatUserInfoParam: {
                                    unionId: res.data.data.unionId,
                                },
                            },
                            needOpenId: true,
                            success: (result) => {
                                console.log(result);
                            },
                        });
                    }
                    this.joinMember(e);
                },
                error: () => {
                    this.joinMember(e);
                },
            });
        } else {
            this.joinMember(e);
        }
    },
});
