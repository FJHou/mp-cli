const app = getApp();
import { APP_CONFIG } from "../../constants/index";

Component({
    options: {
        multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    },

    properties: {
        // 这里定义了innerText属性，属性值可以在组件使用时指定
        innerTitle: {
            type: String,
            // 京东大药房的标题是图片，其他都为文字
            value:
                APP_CONFIG.appName === "京东大药房" ? "" : APP_CONFIG.appName,
        },
        isShowBack: {
            type: String,
            value: "true",
        },
        navStyle: {
            type: Object,
            value: {
                fontColor: "#ffffff",
                bgColor: "transparent",
            },
        },
    },
    data: {
        // 这里是一些组件内部数据
        someData: {
            statusBarHeight: app.globalData.statusBarHeight,
            titleBarHeight: app.globalData.titleBarHeight,
            naviagteBarHeight:
                app.globalData.statusBarHeight + app.globalData.titleBarHeight,
        },
        opacity: 0,
    },

    lifetimes: {
        // 组件所在页面的生命周期函数
        attached() {
            let pages = getCurrentPages();
            let delta = true;
            pages.reduce((prev, current) => {
                if (prev && current && prev.route !== current.route) {
                    delta = false;
                }
            });
            if (delta || pages.length == 1) {
                this.setData({
                    isShowBack: "false",
                });
            }

            this.setTopNavigator();
        },
    },

    methods: {
        setTopNavigator() {
            const { statusBarHeight } = wx.getSystemInfoSync();
            const menuButtonRect = wx.getMenuButtonBoundingClientRect();
            const { height, top } = menuButtonRect;
            const titleBarHeight = height + 2 + (top - statusBarHeight) * 2;

            this.setData({
                someData: {
                    statusBarHeight,
                    titleBarHeight,
                    naviagteBarHeight: statusBarHeight + titleBarHeight,
                },
            });
        },
        changeGradientBg({ scrollTop }) {
            this.setData({
                opacity: scrollTop / 100,
            });
        },
        /**
         * 由于登录插件没有提供登录成功后，执行navigateBack方法。启用returnPage后
         * 会造成页面栈的重复（需要返回两次相同的页面），所以这里重写导航后退的逻辑，
         * 防止页面栈堆积造成的bug。
         * 原理：检测当前页面路由之前有几个相同的路由，有多个则通过设置delta返回页面。
         */
        goback: function() {
            const pages = getCurrentPages();
            const currentRoute = pages[pages.length - 1].route;
            let delta = 0;

            for (let i = pages.length - 1; i > 0; i--) {
                if (currentRoute === pages[i].route) {
                    delta += 1;
                }
            }
            wx.navigateBack({
                delta: delta,
            });
        },
    },
});
