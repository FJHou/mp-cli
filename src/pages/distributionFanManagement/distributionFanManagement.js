 
import {queryFanManagement} from "../../api/index"

Page({ 
  data: {  
    pageNo: 1,//页码
		pageSize: 10, //分页大小
		hasMoreData: true,//是否有更多数据
		fansDataList:[], //粉丝数据列表 
		defaultPic:'https://img11.360buyimg.com/imagetools/jfs/t1/51795/38/9894/41122/5d720254E16e71f44/c62cac645032e247.png',
    vipCssStyle:[{ //粉丝级别
      name: '粉丝',
      src: 'https://b2b-v2-pre.oss.cn-north-1.jcloudcs.com/bf349a03-448f-4389-bdd8-faa1c105d6eb.png',
      background: '#FE9363'
    }, 
    {
      name: '初级会员',
      src: 'https://b2b-v2-pre.oss.cn-north-1.jcloudcs.com/f3cb9288-b5c6-41b2-be30-df50b320a45f.png',
      background: '#A5B4CB'
    }, 
    {
      name: '中级会员',
      src: 'https://b2b-v2-pre.oss.cn-north-1.jcloudcs.com/acf6b8a9-59d9-4471-a78a-1f40f5cab5ee.png',
      background: '#C3A166'
    }, 
    {
      name: '高级会员',
      src: 'https://b2b-v2-pre.oss.cn-north-1.jcloudcs.com/c6b40700-6be5-48c0-a5e9-17fac1fd3a09.png',
      background: '#E89D38'
    }], 
  }, 
  onLoad(){
		wx.showLoading();  
		this.getFansList();
	}, 
	onShow(){},
	getFansList() {
		let params = {
			pageNo : this.data.pageNo,
			pageSize : this.data.pageSize
		}
		queryFanManagement(params).then(res=>{
			wx.hideLoading();
			if(res.code='00'&&res.data){
				let newFansList = this.data.fansDataList.concat(
					res.data.members
				);
				this.setData({
					fansDataList: newFansList,
					pageNo: this.data.pageNo + 1,
					hasMoreData: res.data.hasNextPage
				}); 
			} 
		}).catch(err=>{ wx.hideLoading();})   
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
	  wx.stopPullDownRefresh();
  }, 
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
   if(this.data.hasMoreData){
			wx.showLoading();  
			this.getFansList();  
    }else{
      this.setData({
        hasMoreData: false,
      }); 
    }
  } 

})
