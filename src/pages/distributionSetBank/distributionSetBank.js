 
// 提现银行卡维护页面
const { saveBankCard } = require("../../api/index.js");

let commitTimes = 0; // 为防止多次重复点击 “提交”，控制点击的事件间隔

Page({ 
  data: { 
    phoneType: '00', // 要区分是否是iphone X手机，设置底部高度： 01代表iphoneX手机 
    nowDate: new Date().getDate(),
		type: '0', //【0: 信息预览  1: 修改 】
		realName:'',
    bankCardNo:''
  }, 
  onLoad: function(options) {
		let {type,realName,bankCardNo} = this.options
		this.setData({
      type,
			realName,
			bankCardNo
		}); 
  },  
  onShow: function() {},

  // 表单提交
  formSubmit: function(e) {
		// 1秒之内不能重复触发
    let nowTimes = Date.now();
    if (nowTimes - commitTimes < 1000) { 
      console.warn('1秒之内不能重复触发');
      return;
    }
		commitTimes = nowTimes;
 
    let {  
      setAccount, // 监听键盘输入的银行卡号 
    } = this.data;

    let {  
      bankAccount, // 银行账号,电脑端输入
		} = e.detail.value; 

    // ************************ 校验数据 ************************  
    if (!setAccount && bankAccount && bankAccount.indexOf('*') != -1) {
      // setAccount为空，表示没有手动输入，加密的银行卡号，不进行校验，设置为空 
    } else {
      let regOther = /^[0-9]+$/;
      if (!bankAccount || !bankAccount.trim() || !regOther.test(bankAccount)) {
        this.toolTipMsg('请填写合法的银行账户');
        return false;
      };

      if (bankAccount.length < 16 || bankAccount.length > 19) {
        this.toolTipMsg('请填写16-19位数字账户号');
        return false;
      }
		}  
    // ************************ END 校验数据 ************************

    // 为避免重复点击，提交按钮设置为loading状态，且不可用
    this.setData({
      disabled: true,
			loading: true,
			bankCardNo: bankAccount||setAccount
		}); 
		
    this.saveBankInfo();
     
  }, 
 
  saveBankInfo: function() { 
		let params = {  
			'cardNo': this.data.bankCardNo //银行卡号
		}
		saveBankCard(params).then(res=>{ 
				if(res.code=='0000'){ 
					this.toolTipMsg('信息已提交');  
					setTimeout(function() { //返回到上一个页面，不能使用wx.navigateTo或wx.redirectTo或出现跳转十次栈溢出的问题
						let pages = getCurrentPages(); 
						if (pages[pages.length-1].route =="pages/distributionSetBank/distributionSetBank") { 
							wx.navigateBack({
								delta: -1
							}); 
						} 
						
					}, 2000);
				}else{
					this.toolTipMsg(res.msg);   
					this.setData({ 
						disabled: false,
						loading: false
					});
				}
		}).catch(errRes=>{
			this.toolTipMsg(errRes.msg); 
			this.setData({ 
				disabled: false,
				loading: false
			});
		}) 
	}, 
	/*
	 * 收集参数
	 */
	onChangeInput: function (e) {
		const key = e.currentTarget.dataset.key;
		const value = e.detail.value;
		this.setData({
			[key]: value
		})
	},
	onFocus(e){
		this.setData({
			bankCardNo : ''
		})
	},
  // 错误信息提示
  toolTipMsg: function(msg, icon) {
    wx.showToast({
      icon: icon || 'none',
      title: msg,
      duration: 2000
    })
  } 
})
