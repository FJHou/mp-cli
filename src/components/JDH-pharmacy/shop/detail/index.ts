Component({
  properties: {
    jpassStoreInfo: {
      type: Object,
    },
    yjsStoreInfo: {
      type: Object,
    }
  },
  methods: {
    createMap() {
      const {
        latitude,
        longitude,
        storeName,
        storeAddress,
      } = this.data.jpassStoreInfo;
      //创建地图
      wx.openLocation({
        latitude: latitude,
        longitude: longitude,
        name: storeName,
        address: storeAddress,
      });
    },

    gotoShopInfo() {
      const {venderId, storeId} = this.data.jpassStoreInfo
      
      wx.navigateTo({
        url: `/pages/newShop/shopInfo/index?storeId=${storeId}&venderId=${venderId}`
      })
    }
  },
});
