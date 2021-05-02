import { API, queryStoreModule } from "../../../../api/index";
import { getReturnPage, toh5 } from "../../../../utils/JDH-pharmacy/index";
// @ts-ignore
import queryString from "query-string";
import { buildUrl, debounce, throttle } from "../../../../utils/index";
import { IS_DEV } from "../../../../constants/index";
import { globalLoginShow, isLogin } from "../../../../utils/loginUtils";
import { JpassStoreInfoType } from "../../../../types/shopFront/index";
// import d
// @ts-ignore
const plugin = requirePlugin("loginPlugin");

type EntryModel = {
    targetType: 1 | 2 | 3; // 1:h5 2:小程序内部 3:外部小程序appid
    targetUrl: string;
    targetWxAppId: string;
    pictureUrl: string;
    name: string;
    module: string;
    extension: any;
};

Component({
    properties: {
        jpassStoreInfo: {
            type: null,
            observer(val: JpassStoreInfoType) {
                // @ts-ignore
                this.resolveStoreModule(val);
            },
        },
        yjsStoreInfo: {
            type: Object,
        },
    },

    data: {
        entries: [],
        entry2D: [] as Array<EntryModel[]>,
        hasProgress: false,
        isWithinFence: true,
    },

    observers: {
        entries(entries) {
            this.setData({
                hasProgress: entries.length > 4 && entries.length !== 8,
                entry2D: toDoubleDimensional<EntryModel>(entries),
            });
        },
    },

    methods: {
        resolveStoreModule: debounce(function(val: JpassStoreInfoType) {
            if (val.supportDs) {
                // @ts-ignore
                this.setData({
                    isWithinFence: val.isWithinFence,
                });
            }

            if (val.storeId) {
                queryStoreModule(val.storeId).then((res) => {
                    if (res.code === "0000") {
                        const entries = res.data;
                        // @ts-ignore
                        this.setData({
                            entries: entries || [],
                            layout: entries.length < 8 ? "" : "wrap",
                        });
                    } else {
                        // @ts-ignore
                        this.setData({
                            entries: [],
                            layout: "",
                        });
                    }
                });
            }
        }, 300),
        // 药急送、复诊续方、视频问诊、积分商城跳转需特殊处理
        handleClick: throttle(function handleClick(e: any) {
            const item: EntryModel = e.currentTarget.dataset.item;

            if (item) {
                let { targetType, targetUrl, targetWxAppId, module } = item;
                // targetType 1:h5 2:小程序内部 3:外部小程序appid

                switch (targetType) {
                    case 1:
                        // @ts-ignore
                        this.toh5({
                            module,
                        });
                        break;
                    case 2:
                        wx.navigateTo({
                            url: `/${targetUrl}`,
                        });
                        break;
                    case 3:
                        if (targetWxAppId) {
                            if (module === "INQUIRY_VIDEO" || module  === "INQUIRY_FZ") {
                                if (isLogin()) {
                                    plugin.getLoginToken().then((res: any) => {
                                        if (res.err_code === 0) {
                                            const path = buildUrl({
                                                url: targetUrl,
                                                query: {
                                                    token_key: res.token_key,
                                                },
                                            });
                                            console.log({ path });
    
                                            wx.navigateToMiniProgram({
                                                appId: targetWxAppId,
                                                path: path,
                                                envVersion: IS_DEV
                                                    ? "trial"
                                                    : "release",
                                            });
                                        }
                                    });
                                } else {
                                    globalLoginShow({
                                        data: {
                                            // fromPageLevel,//该值不传，或者传不等于1 的值。因为该页面为switchTab页面，需要走getJumpPageType
                                            returnpage: getReturnPage(),
                                        },
                                    });
                                }
                            } else {
                                wx.navigateToMiniProgram({
                                    appId: targetWxAppId,
                                    path: targetUrl,
                                    envVersion: IS_DEV
                                        ? "trial"
                                        : "release",
                                });
                            }

                        } else {
                            wx.showToast({
                                title: "未配置appid",
                                icon: "none",
                            });
                        }
                        break;
                    default:
                        wx.showToast({
                            title: "错误的跳转类型",
                            icon: "none",
                        });
                        break;
                }
            }
        }, 300),

        toh5(params) {
            // 如果有module字段说明这个链接需要动态处理。
            if (params.module === "YJS") {
                const { storeId, venderId } = this.data.yjsStoreInfo;
                params.url = `${API.diansongUrl}/store/${storeId}?venderid=${venderId}`;
                toh5(params.url);
            }
        },
    },
});

// 转换为二维数组
function toDoubleDimensional<T>(data: T[]): Array<T[]> {
    let i = -1;
    return data.reduce((collection: Array<T[]>, item: T, index: number) => {
        if (index % 8 === 0) {
            i++;
            collection[i] = [];
        }
        collection[i].push(item);
        return collection;
    }, []);
}
