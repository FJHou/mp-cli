import { queryListVenderStoreQuaFile } from "../../../api/index.js";
import { getBrandBaseInfo } from "../../../utils/JDH-pharmacy/index.js";
import { getImgUrl } from "../../../utils/util.js";
import { JpassStoreInfoType } from "../../../types/shopFront/index";
interface ShopInfoType {
    jpassStoreInfo: JpassStoreInfoType;
    stroeImgList: string[];
    showFloorMap: any;
}
Page<ShopInfoType, any>({
    data: {
        jpassStoreInfo: {} as JpassStoreInfoType,
        stroeImgList: [],
        showFloorMap: {},
    },

    onLoad(options: any) {
        const { storeId, venderId } = options;
        this.getStoreImg(storeId, venderId);
        this.setData!({
            jpassStoreInfo: wx.getStorageSync("jpassStoreInfo"),
        });
    },

    onShow() {
        this.setFloorMap();
    },

    async setFloorMap() {
        const { showFloorMap } = await getBrandBaseInfo();
        this.setData!({
            showFloorMap,
        });
    },

    makePhoneCall() {
        wx.makePhoneCall({
            phoneNumber: this.data!.jpassStoreInfo.phone,
        });
    },

    getStoreImg(storeId: string, venderId: string) {
        queryListVenderStoreQuaFile(storeId, venderId)
            .then((res) => {
                if (res.code === "0000" && res.data.length) {
                    const stroeImgList: string[] = [];
                    res.data.forEach((item: any) => {
                        stroeImgList.push(getImgUrl(item.url));
                    });
                    this.setData!({
                        stroeImgList,
                    });
                }
            })
            .catch((error) => {
                console.error(error);
                // reportErr(encodeURIComponent(error.errMsg));
            });
    },
    //图片点击事件
    swiperTap: function(event: any) {
        var src = event.currentTarget.dataset.src; //获取data-src
        var imgList = event.currentTarget.dataset.list; //获取data-list
        //图片预览
        wx.previewImage({
            current: src, // 当前显示图片的http链接
            urls: imgList, // 需要预览的图片http链接列表
        });
    },
});
