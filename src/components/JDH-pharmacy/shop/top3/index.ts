import { API, getAllCategoryReq, getTop3DetailReq } from "@/api/index";
import { toh5 } from "@/utils/JDH-pharmacy/index";
import getImgUrl from "@/utils/getImgUrl";
import { emitter } from "@/utils/util";
import { buildUrl } from "@/utils/index";

// type Top3DataType = {
//     category: any[];
//     pageNo: number;
//     activeIndex: number;
//     loading: boolean;
// };
// type Top3MethodsType = {
//     getAllCategory: (yjsStoreInfo: any) => void;
//     onCategoryChange: (e: any) => void;
//     getTopNCategoryList: (data: any[]) => Promise<any[]>;
//     gotoDSWareH5: (e: any) => void;
//     getGoodsWithPagination: () => Promise<any>;
//     getGoodsByCategoryId: (id: number, pageNo?: number) => Promise<any>;
// };

Component({
    // behaviors: [setFloorMap],
    properties: {
        yjsStoreInfo: {
            type: null,
            observer(yjsStoreInfo: any) {
                // 修复不支持药急送的门店切换后状态没有重置的问题
                this.getAllCategory(yjsStoreInfo);
            },
        },

        topN: {
            type: Number,
            value: 3,
        },
    },

    data: {
        category: [],
        pageNo: 1,
        activeIndex: 0,
        loading: false,
    },

    lifetimes: {
        ready() {
            // @ts-ignore
            emitter.on("onReachBottom", () => {
                this.getGoodsWithPagination()
            });
        },

        detached() {
            // @ts-ignore
            emitter.off('onReachBottom')
        }
    },

    methods: {
        onCategoryChange(e) {
            const { category } = e.currentTarget.dataset;

            if (category) {
                const index = this.data.category.findIndex(
                    (item: any) => item.id === category.id
                );
                this.setData({
                    activeIndex: index,
                });
            }
        },

        getGoodsByCategoryId(id: number, pageNo?: number): Promise<any> {
            return new Promise((resolve, reject) => {
                const dataSource = this.data;

                getTop3DetailReq(
                    id,
                    pageNo || 1,
                    dataSource.yjsStoreInfo.venderId,
                    dataSource.yjsStoreInfo.storeId
                )
                    .then(({ errCode, data }) => {
                        if (errCode === "200" && data) {
                            data.data.forEach((item: any) => {
                                item.imageUrl = getImgUrl(item.imgUrl);
                                if (item.price == item.originalPrice) {
                                    item.originalPrice = 0;
                                } else {
                                    item.originalPrice = +item.originalPrice;
                                }
                            });

                            resolve({
                                data: data.data,
                                totalCount: data.totalCount,
                                loadOver: data.totalCount === data.data.length
                            });
                        } else {
                            resolve({
                                data: [],
                                totalCount: 0,
                                loadOver: true
                            });
                        }
                    })
                    .catch(() => {
                        reject({data: [],
                            totalCount: 0,
                            loadOver: true});
                    });
            });
        },

        async getGoodsWithPagination() {
            const dataSource = this.data;
            const currentCategory = dataSource.category[dataSource.activeIndex];
            if (!currentCategory || this.data.loading || currentCategory.loadOver) return
            const pageNo = ++currentCategory.pageNo;

            this.setData({
                loading: true,
            });
            try {
                const result = await this.getGoodsByCategoryId(
                    currentCategory.id,
                    pageNo
                );
                if (result) {
                    currentCategory.data = currentCategory.data.concat(
                        result.data
                    );
                    currentCategory.pageNo = pageNo;
                    currentCategory.loadOver =
                        currentCategory.data.length === result.totalCount;

                    this.setData({
                        category: this.data.category,
                    });
                }
            } catch (err) {
                console.error(err);
            }

            this.setData({
                loading: false,
            });
        },

        async getTopNCategoryList(allCates) {
            const topNCollection = [];
            for (let i = 0; i < allCates.length; i++) {
                const { id, name } = allCates[i];
                if (topNCollection.length < this.data.topN) {
                    const {data, totalCount, loadOver} = await this.getGoodsByCategoryId(id);
                    
                    if (data.length) {
                        topNCollection.push({
                            name,
                            id,
                            data,
                            totalCount,
                            pageNo: 1,
                            loadOver
                        });
                    }
                } else {
                    break;
                }
            }

            return topNCollection;
        },

        getAllCategory(val) {
            if (val && val.venderId) {
                getAllCategoryReq(val.venderId).then(
                    async (res) => {
                        if (res.errCode === "200" && res.data) {
                            // 获取前【topN】分类的商品
                            const allCates = res.data
                            const category = await this.getTopNCategoryList(
                                allCates
                            );
                            
                            this.setData({
                                category,
                            });
                        }
                    }
                ).catch(err => {
                    console.error(err);
                })
            } else {
                this.setData({
                    category: [],
                    activeIndex: 0,
                })
            }
        },
        // 去往店送的商品的h5的页面
        gotoDSWareH5(e) {
            const { good } = e.currentTarget.dataset;
            const { storeId, venderId } = this.data.yjsStoreInfo;
            const query: any = {};

            query.venderid = venderId;
            // 如果target不是去门店，则加上分类id，说明去跳转到具体分类
            query.ShopCategoryId = this.data.category[
                this.data.activeIndex
            ].id;
            // 点击商品跳转
            if (good) {
                query.skuid = good.sku;
            }
            // 点击更多跳转
            const url = buildUrl({
                url: `${API.diansongUrl}/store/${storeId}`,
                query,
            });
            toh5(url);
        },
    },
});
