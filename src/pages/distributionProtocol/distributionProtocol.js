// subExtractMain/pages/extractMoney/protocol/protocol.js 
//获取应用实例  
import { getBrandBaseInfo } from '../../utils/JDH-pharmacy/index'
const protocolItem={
  'common':{
    title:'提现需知'
  },
  'member':{
    title:'提现协议'
  },
} 

import { APP_CONFIG } from '../../constants/index'

Page({ 
  data: {
    showModal: 'common', // 页面展示类型  common:提现需知 member:会员协议  entrust:授权书   
		programName: APP_CONFIG.appName,
		companyName:''
  }, 
  onLoad: function () { 
  },
	onShow: async function () { 
		let that = this;
		
		const brandInfo = await getBrandBaseInfo(); 
		// hotSearchAdGroupId热搜词
		const {companyName} = brandInfo.cpsConfig
		that.setData({
			companyName
		})

		// 获取系统信息，处理iphone X底部按钮 
    wx.getSystemInfo({
      success: function (res) { 
				if(res.model.search('iPhone 7 Plus') != -1){ 
					that.setData({
            phoneType: '07'
          })
				}
        if (res.model.search('iPhone X') != -1) {
          that.setData({
            phoneType: '01'
          })
        }
      },
    })
  },
  /**
   * 跳转到协议详情
   */
  goDetail:function(e){ 
    let { type } = e.currentTarget.dataset; 
    //type member:提现协议  xxxx:其他协议
    if (!type){
      wx.showToast({
        title: '获取协议编号失败！',
        icon:'none'
      });
      return;
    }
    
    this.setData({
      showModal:type
		});

		// 设置当前协议页面的标题
		wx.setNavigationBarTitle({
			title: protocolItem[type].title || ''
		})

  },
  /**
  * 取消并退出
  */
  doCancel: function (e) { 
    wx.redirectTo({
      url: '/pages/distributionIncomeWithdraw/distributionIncomeWithdraw',//收益提现页
    });
  },
  /**
  * 同意并继续
  */
  goAgree: function (e) { 
    wx.redirectTo({
      url: '/pages/distributionMoneyReg/distributionMoneyReg?type=0', // type值 0:新增-提现认证
    });
  },

  /**
  * 返回
  */
  backPage: function (e) {
    this.setData({
      showModal: 'common',
      'navbarData.title': protocolItem['common'].title || ''
    })
  }

})