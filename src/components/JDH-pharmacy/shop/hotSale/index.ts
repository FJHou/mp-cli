import { API, getGWDrugByStoreId } from "../../../../api/index";
import { getImgUrl } from "../../../../utils/util";
import { toh5 } from "../../../../utils/JDH-pharmacy/index";

Component({
    properties: {
        yjsStoreInfo: {
            type: Object,
            observer() {
                this.queryGetProductList()
            }
        }
    },
    data: {
        productList: [] as any[],
        mapProductList: [] as any[]
    },

    methods: {
        // 商品信息获取
        queryGetProductList() {
            getGWDrugByStoreId(this.data.yjsStoreInfo.storeId)
                .then((res) => {
                    let productList: any[] = [];
                    if (res.code === "0000" && res.data) {
                        let mapProductList = res.data.map((item: any) => {
                            item.imageUrl = getImgUrl(item.imageUrl);
                            return item;
                        });
                        this.setData({
                            mapProductList,
                        });
                        let long =
                            mapProductList.length < 9
                                ? mapProductList.length
                                : 9;
                        for (var i = 0; i < long; i += 3) {
                            productList.push(mapProductList.slice(i, i + 3));
                        }
                    }
                    this.setData!({
                        // @ts-ignore
                        productList: productList,
                    });
                })
                .catch((error) => {
                    console.error(error);
                });
        },
        // 去往店送的商品的h5的页面
        gotoDSWareH5(e) {
            let { wareid, analysisfloor } = e.currentTarget.dataset;
            const {storeId, venderId} = this.data.yjsStoreInfo
            //微信埋点analysisFloor
            this.triggerEvent("analysisfloor", analysisfloor);
            
            let url = `${API.diansongUrl}/store/${storeId}?venderid=${venderId}`;
            if (wareid) {
                if (e.currentTarget.dataset.tab == 2) {
                    url += `&skuid=${wareid}&ShopCategoryId=${e.currentTarget.dataset.shopId}`;
                } else if (e.currentTarget.dataset.categeory == "topThree") {
                    url += `&skuid=${wareid}&ShopCategoryId=${e.currentTarget.dataset.shopId}`;
                } else {
                    let wareItem: any[] = this.data.mapProductList.filter(
                        (item: any) => {
                            return item.wareid == wareid;
                        }
                    );
                    //商品详情跳转待对接
                    if (wareItem[0]) {
                        // @ts-ignore
                        let categoryList = wareItem[0].shopCategory.split(" ");
                        let shopCategory =
                            categoryList && categoryList.length > 0
                                ? categoryList[0]
                                : "";
                        url += `&skuid=${wareid}&ShopCategoryId=${shopCategory}`;
                    }
                }
                toh5(url);
            } else {
                //更多抢购
                toh5(url);
            }
        },
    },
});
