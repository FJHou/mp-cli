import { API } from "../../../api/index.js";
import { httpsGet, getLocation } from "../../../utils/util.js";

Component({
    data: {
        address: "",
        staticUrl: API.STATIC_URL,
    },
    // TODO: 优化这里的逻辑
    /**
     * 先取缓存的地址，如果没有，则微信定位，拿到经纬度后再请求地址名。
     */
    pageLifetimes: {
        show() {
            this._getPositionInfo();
        },
    },

    lifetimes: {
        attached() {
            this._getPositionInfo();
        }
    },

    methods: {
        goLocation() {
            wx.navigateTo({
                url: `/pages/switchShop/switchShop`,
            });
        },

        _getPositionInfo() {
            getLocation(
                (res) => {
                    const { latitude, longitude } = res;
                    if (latitude && longitude) {
                        this._getPostionNameByLocation({
                            latitude,
                            longitude,
                        });
                    } else {
                        this.setData({
                            address: "定位失败",
                        });
                    }
                    // 注意：门店详情获取依赖定位事件，因为需要拿到用户当前经纬度来获取用户位置与门店的距离
                    // 失败如果获取定位失败页需要派发事件
                    this.triggerEvent("location", { latitude, longitude });
                },
                () => {
                    this.setData({
                        address: "未能获取您的位置",
                    });
                    wx.navigateTo({
                        url: `/pages/location/location`,
                    });
                    // 防止定位失败后没有进行门店详情的请求
                    this.triggerEvent("location", {});
                }
            );
        },
        /**
         * 根据经纬度查询地址名称
         */
        _getPostionNameByLocation({ latitude, longitude }) {
            httpsGet({
                url: "/api",
                data: {
                    functionId: "queryAddress",
                    appid: "jdhunion",
                    body: {
                        latitude,
                        longitude,
                    },
                },
            })
                .then((res) => {
                    const { code, data } = res;
                    if (code === "0000") {
                        if (data) {
                            let choiceLocation =
                                wx.getStorageSync("choiceLocation") ||
                                data[0].title;
                            let locationInfo = wx.getStorageSync(
                                "locationInfo"
                            );
                            locationInfo.provName = data[0].provName;
                            locationInfo.cityName = data[0].cityName;
                            locationInfo.districtName = data[0].districtName;
                            this.setData({
                                address: choiceLocation,
                            });
                            wx.setStorageSync("locationInfo", locationInfo);
                        } else {
                            this.setData({
                                address: "未能获取您的位置",
                            });
                        }
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        },
    },
});
