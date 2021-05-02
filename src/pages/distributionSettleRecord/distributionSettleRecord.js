 
var Api = require("../../utils/JDH-pharmacy/api.js"); 

//获取应用实例
const app = getApp()
var api = new Api();

const URL = {
  queryList: "/settlement/detail/queryBillList",
}
import { querySettlementList} from '../../api/index';

Page({ 
  data: {  
		pageNo:1,
		pageSize:10, 
    hasMoreData: true,
    dataList: [],
  }, 
  onLoad: function () {
		this.loadDataList();
  },
	onShow: function () {}, 
  // 加载列表
  loadDataList: function () { 
		wx.showLoading();
		let params = {
			pageNo : this.data.pageNo,
			pageSize : this.data.pageSize
		}
		querySettlementList(params).then(res=>{
			wx.hideLoading();
			if(res.code=='0000'&&res.data&&res.data.details){
				let newDataList = this.data.dataList.concat(
					res.data.details
				);
				newDataList.forEach((item)=>{ //对年月格式进行转化
					item.formateYear = item.month.slice(0,4);
					item.formatMonth = item.month.slice(4,6);
				})
				this.setData({
					dataList: newDataList,
					pageNo: this.data.pageNo + 1,
					hasMoreData: res.data.hasNextPage
				}); 
			} 
		}).catch(err=>{ wx.hideLoading();})  
  },

  // 显示 '错误提示' 信息
  showErrMsg(msg) {
    wx.showToast({
      icon: 'none',
      title: msg,
      duration: 2000
    })
  },
	/**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
		if(this.data.hasMoreData){
			 wx.showLoading();  
			 this.loadDataList();  
		 }else{
			 this.setData({
				 hasMoreData: false,
			 }); 
		 }
	 },
 
  onPullDownRefresh: function () {
    // wx.showLoading({
    //   title: '加载中...',
    // });
		// this.loadDataList();
		wx.stopPullDownRefresh();
  }

})