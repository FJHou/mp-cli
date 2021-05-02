// pages/record/record.js 
import * as API from '../../utils/api-member.js'
import { getBrandBaseInfo,getReturnPage } from '../../utils/JDH-pharmacy/index'  
import {queryJpassOrderReq} from '../../api/index.js'; 
import { formatTime,globalLoginShow } from "../../utils/util.js"; 
import { getPtKey } from "../../utils/loginUtils.js";

Page({ 
  data: {
    list: [],
		pageIndex: 1,
		pageSize:10,
		hasNextPage:true, 
    returnIcon: true
  }, 
  onLoad: function (options) {  
    let pagesList = getCurrentPages() 
    if (pagesList.length <= 1) {
      this.setData({
        returnIcon: false
      })
    }
    // 线下商户支付
    if (wx.getStorageSync('order_topay_2')) {
      wx.removeStorageSync('order_topay_2')
		}  
    // this.getOrderList()
  },
  onShow() {
    this.getOrderList()
  },
  async getOrderList() {
    var self = this; 
		const { brandId } = await getBrandBaseInfo(); 
		if (getPtKey()){//有登录态
			queryJpassOrderReq(brandId, this.data.pageIndex, this.data.pageSize).then(res => { 
        let result = res.data.data
        console.log(result);
					if ( res.success&&result.length>0) { 
						for (var i = 0; i < result.length; i++) {
							var orderCreateDate = formatTime(new Date(result[i].orderCreateDate), 3);
							result[i].orderCreateDate = orderCreateDate;
							result[i].moreOpen = false;
						}  
						self.setData({
							list: self.data.list.concat(result),
							pageIndex: res.data.pageNo+1,
							hasNextPage: res.data.hasNextPage
						}) 
						if(result.length<4&&res.data.hasNextPage){//如果返回的数据不足4条，并且还有数据时，没法触发触底函数，需要继续循环调用
							self.getOrderList()
						}
					}
			})
		} else{ //没有登录态
			const fromPageLevel = 1;
			globalLoginShow({
				data: {
					fromPageLevel,
					returnpage: getReturnPage()
				}
			});
			return
		}
  }, 
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { 
		if(this.data.hasNextPage){ 
			this.getOrderList() 
		}
  },
  /**
   * 取消订单
   */
  cancelOrder: function (event) {
    var self = this;
    var list = self.data.list;
    var index = event.currentTarget.dataset.index;
    var orderId = event.currentTarget.dataset.orderId; 
    // 请求取消定点
    API.GWAjax({
      functionName: 'OrderExportService.cancelOrder',
      data: {
        orderId: orderId
      },
      success: res => {
        res = res.data
        if (res.code == 0 && res.data && res.data.success) {
          var isCancel = res.data.data;
          if (isCancel) {
            list[index].orderStatus = -2;//设置状态取消中
            self.setData({
              list: list
            });
          }
        } else {
          // 取消失败稍后重试!
          wx.showToast({
            title: '请检测网络或稍后重试！',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
    //  CANCELLING(-2, "取消中"),
    //  CANCELED(-1, "已取消"),
    //  NOT_PAID(0, "未付款"),
    //  PAID(1, "已付款"),
    //  COMPLETE(2, "已完成"),
    //  UNKNOW(-100, "未知");
  }, 
  changeMore: function (e) {
    var moreOpen = e.currentTarget.dataset.moreOpen
    var key = e.currentTarget.dataset.key
    var list = this.data.list;
    list[key].moreOpen = !moreOpen
    this.setData({
      list: list
    })
  }
})