// subExtractMain/pages/extractMoney/extractMoneyrecord/extractMoneyrecord.js
const { queryWithdrawalList } = require("../../api/index.js");
const { queryUserCertInfo, relaunchWithdrawalReq} = require("../../api/index.js");
 
Page({ 
  data: {
		dataList:[],
		pageNo:1,
		pageSize:10,
		totalAmount:0,
    hasNextPage: true,
    showLoadingView: true,
  }, 
  onLoad: function (options) { 
    this.setData({ 
      authType: options.authType
    });
    
    this.initData();
	},
	onShow: function () { },

  doShowErr: function (e) {
    let { idx } = e.currentTarget.dataset;
    let currIdx = this.data.errIndex;
    this.setData({
      errIndex: currIdx == idx ? -1 : idx
    })
  },
  initData(){ 
    // 展示loading效果
    this.setData({
      showLoadingView: true
    });
		let params = {
			pageNo: this.data.pageNo,
			pageSize: this.data.pageSize
		}
    queryWithdrawalList(params).then(res => {  
      if(res.code == "0000"&&res.data){
				let newDataList = this.data.dataList.concat(
					res.data.details
				); 
        this.setData({
					totalAmount: res.data.totalAmount,
          showLoadingView: false, // 隐藏loading控件
					dataList: newDataList,
					hasNextPage: res.data.hasNextPage,
					pageNo: this.data.pageNo + 1
        })
      }
      wx.hideLoading()
    }, res => {
      console.error("加载错误:", res);
      this.setData({
        showLoadingView: false
      });
      wx.hideLoading();
      this.showErrMsg('加载失败');
    }).catch(err => {
      console.error("加载异常:", err);
      this.setData({
        showLoadingView: false
      });
      wx.hideLoading();
      this.showErrMsg('加载异常');
    });
  },
  // 重新提现
  jumpToView(e){
    var that = this; 
		var detailId = e.currentTarget.dataset.requestid; 
    wx.showModal({
      title: '提示',
      content: '请确认当前信息修改正确后，再重新发起提现。',
      success(res) { 
        if (res.confirm) {
          that.againWithdrawReq(detailId)
        }
      }
    }) 
	},
	againWithdrawReq(detailId){
		relaunchWithdrawalReq({detailId}).then(res => {  
			if (res.code == "0000" ) { 
				wx.showToast({
					title: "申请提现成功",
					duration: 2000,
					icon: 'none',
				})
				this.setData({//重新提现后需要重置参数
					dataList: [],
					errIndex: -1,//重新提现时，隐藏打开的失败原因
					pageNo:1,
					pageSize:10,
					hasNextPage: true,
					showLoadingView: true,
				});
				this.initData();
			} else {
						wx.showToast({
							title: res.msg,
							duration: 2000,
							icon: 'none',
						})
					} 
		}).catch(err => {})  
	},
  // 跳到银行卡信息页面
  jumpToCard(){ 
		let resultUrl = '/pages/distributionSetBank/distributionSetBank';
		queryUserCertInfo().then(res => { 
			//提现认证状态 '00 未认证'  '01 已认证' '02 认证审核中'  '03 已驳回' 
			if (res.code == "0000" && res.data) { 
				let userName = res.data.realName;
				let bankCardNo = res.data.bankCardNo;
				 // 提现认证已通过，跳转银行页面带参数：认证姓名
				resultUrl += `?type=1&realName=${userName}&bankCardNo=${bankCardNo}`; // 0: 已维护展示预览信息  1: 修改状态展示
				wx.navigateTo({
					url: resultUrl
				});
			}  
		}).catch(err => {}) 
    
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // wx.showLoading({
    //   title: '加载中',
    // });
		// this.initData();
		wx.stopPullDownRefresh();
  },
	onReachBottom(){
			//触底时执行这里
			if (this.data.hasNextPage) {
				this.initData();
			}
	},
  // 显示 '错误提示' 信息
  showErrMsg(msg) {
    wx.showToast({
      icon: 'none',
      title: msg,
      duration: 2000
    })
  },
})