//获取应用实例
var app = getApp();
import { getBrandBaseInfo } from "../../utils/JDH-pharmacy/index.js";
import {formatDistance} from '../../utils/formatDistance';
import { getStoreListReq, queryAddressReq } from '../../api/index.js';

Page({
  data: {
    returnpage: '/pages/shopList/shopList',
    queryDone: false,
    isIpx: app.globalData.isIpx,
    images: {
      logImage: `${app.staticUrl}/devfe/jfs/t1/51611/28/13202/21648/5da072c7Ed1308839/e8e6e2f5d5534552.png`,
      moreImage: `https://img10.360buyimg.com/imagetools/jfs/t1/143421/9/12448/401/5f97fe31E4e0acc6e/e045b0999ad09f39.png`,
      addImage: `https://img12.360buyimg.com/imagetools/jfs/t1/129926/13/12264/789/5f8696cdEe0ef0101/f4743ea1d7b9a324.png`
    },
    warpHeight: '', //初始高度置空
    hasMoreData: true,//上拉时是否继续请求数据，即是否还有更多数据
    choiceLocation: '',//定位地址
    longitude: '',//经度
    latitude: '',//纬度
    pageIndex: 1,
    pageSize: 10,
    hasNoData: false,//控制门店没数据时提示信息显隐
    pullNoData: true,//下拉刷新时没有更多数据
    storeLists: []//门店列表数据
  },
  onLoad: function () {
    var self = this; 
    wx.getSystemInfo({
      success: function (res) { 
        self.setData({
          warpHeight: res.windowHeight - 260 * res.windowWidth / 750
        })
      }
    });
  },
  onShow: function () {
    // 重新定位回来或者 选择地址回来 重置经纬度信息
    if (this.data.backSource === 'locationGet' || this.data.backSource === 'locationAdress') {
      app.getLocation((res) => {
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude,
          pageIndex: 1
        });
      })
    }
    const { longitude, latitude } = wx.getStorageSync('locationInfo');

    this.setData({
      longitude,
      latitude
    })
    // console.log();
    this.getAddress(); //从平台首页进入的通过经纬度获取获取地址名称
    this.getStoreList('正在加载数据...');//加载门店列表信息 

  },
  loadMore() {
    //页面触底执行分页逻辑
    ++this.pageIndex;
    this.getStoreList();
  },
  getAddress() {
    this.getPostionName({
      latitude: this.data.latitude,
      longitude: this.data.longitude
    }).then(curLocation => {
      let choiceLocation = wx.getStorageSync("choiceLocation");
      if (!choiceLocation) {
        //缓存中无值，取定位信息
        choiceLocation = curLocation || '定位失败,请点击重新定位';
      }
      this.setData({
        choiceLocation
      });
    });
  },
  /**
   * 获取门店列表信息
   */
  async getStoreList(message) {
    let self = this;
    let branchInfo = await getBrandBaseInfo()
    wx.showNavigationBarLoading()					//在当前页面显示导航条加载动画
    wx.showLoading({								//显示 loading 提示框
      title: message,
    })
    getStoreListReq(branchInfo.brandId, branchInfo.bizId, self.data.longitude, self.data.latitude, self.data.pageIndex, self.data.pageSize).then(res => {
      let contentlistTem = self.data.storeLists;
      let contentlist = [];
      if (res.data.data.length > 0) {
        wx.hideNavigationBarLoading()		//在当前页面隐藏导航条加载动画
        wx.hideLoading()					//隐藏 loading 提示框

        if (self.data.pageIndex == 1) {
          contentlistTem = []
        }
        contentlist = res.data.data;
        //对返回的distance距离数据进行格式转化-start 
        contentlist.forEach((list, i, lists) => {
          lists[i].distance = formatDistance(list.distance)
        });
        //对返回的distance距离数据进行格式转化-end
        //let totalLength = contentlistTem.concat(contentlist);
        if (res.data.totalPage > self.data.pageIndex) {
          self.setData({
            storeLists: contentlistTem.concat(contentlist),
            hasMoreData: true,
            pageIndex: self.data.pageIndex + 1
          })

        } else {
          self.setData({
            storeLists: contentlistTem.concat(contentlist),
            hasMoreData: false
          })
        }

      } else {
        wx.hideNavigationBarLoading()		//在当前页面隐藏导航条加载动画
        wx.hideLoading()					//隐藏 loading 提示框
        self.setData({
          storeLists: []
        })
      }
      if (res.data.totalPage == 1 && contentlist.length < 1) {//处理初次加载无数据返回
        self.setData({
          hasNoData: true
        })
      }
    })
  },
  /**
  * 页面相关事件处理函数--监听用户下拉动作
  */
  onPullDownRefresh: function () {
    this.data.pageIndex = 1
    this.getStoreList('正在刷新数据')
  },

  /**
  * 页面上拉触底事件的处理函数
  */
  onReachBottom: function () {
    if (this.data.hasMoreData) {
      this.getStoreList('加载更多数据')
    } else if (!this.data.hasMoreData && this.data.hasNoData) {
      this.setData({
        pullNoData: false
      })

    }
  },
  goLocation: function (e) {
    wx.navigateTo({
      url: `/pages/location/location`
    });
  },
  /**
   * 前往门店首页
   * @param {*} storeid - 门店ID
   * @param {*} venderid - 门店wenderId
   */
  redirectShopFront: function (e) {
    let storeId = e.currentTarget.dataset.storeid;
    let venderId = e.currentTarget.dataset.venderid;
    wx.navigateTo({
      url: `/pages/newShop/shopFront?storeId=${storeId}&venderId=${venderId}`
    });
  },
  /**
   * 根据经纬度查询地址名称
   */
  getPostionName: function (location) {
    return new Promise((resolve, reject) => {
      queryAddressReq(location.longitude, location.latitude).then(res => {
        resolve(res.data && res.data[0] && res.data[0].title ? res.data[0].title : "");
      }).catch(res => {
        reject(res);
      })
    });
  }
});
