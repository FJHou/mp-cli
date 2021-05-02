// subExtractMain/pages/extractMoney/extractMoneyView/extractMoneyView.js
var Api = require("../../utils/JDH-pharmacy/api.js");
const {
	queryUserCertInfo,
	queryAvailableBalance,
	queryWithdrawal
} = require("../../api/index.js");
//获取应用实例 
const api = new Api();

Page({
	data: {
		showModal: true, //控制未认证弹窗
		showModal_refuse: true, //控制审核被拒弹窗提示
		settlementAmount: 0, //可提现金额
		moneyDate: 27, //暂无接口，写死27日为上月结算单日，27至月底可提现
		extract: '-1', // '-1' 默认值(代表接口未返回)  00 未认证'  '01 已认证' '02 已驳回'  03 '认证审核中'

		settleMsg: '', // “2月结算单已出”提示，暂时无此接口
		showModalMoney: true, //提现后弹窗
		submitFlag: false, // 提交订单节流开关
		nowDate: new Date().getDate(),
		remark:"",//认证回显信息中的备注，比如驳回原因
		userCertInfo:{},//认证回显信息
	},
	onLoad: function (options) {
		// this.queryAvailableBalance() //查询可提现金额 
		// this.get_UserCertInfo(); // 查询【益世】提现认证信息  
		// this.getSettleListInfo();  // 查询结算单是否已出，暂无此接口 
	},
	onShow: function () {
		// 初始化部分变量
		this.setData({
			showModal: true,
			showModal_refuse: true,
			showModalMoney: true,
			submitFlag: false, // 提交订单节流开关
			nowDate: new Date().getDate()
		});

		this.queryAvailableBalance() //查询可提现金额 
		this.get_UserCertInfo(); // 查询提现认证信息   
	},
	queryAvailableBalance() { //可提现金额查询 
		queryAvailableBalance().then(res => {
			if (res.code == "0000" && res.data) {
				this.setData({
					settlementAmount: res.data.availableBalance || "0.00"
				})
			} else {
				this.setData({
					settlementAmount: "0.00"
				});
				this.showErrMsg('查询余额失败!');
			}
		}).catch(err => {
			this.showErrMsg('查询余额失败!');
		})
	},

	get_UserCertInfo: function () { //查询提现认证信息
		let that = this;
		queryUserCertInfo().then(res => { 
			//res.data.authStatus  0未认证，1审核通过，2驳回，  3审核中
			//提现认证状态 '00 未认证'  '01 审核通过'  '02 驳回'  '03 审核中 
			if (res.code == "0000" && res.data) {
				let resStatus = res.data; 
				 
				that.setData({
					userCertInfo : res.data,
					isHasbankCardNo: res.data.bankCardNo,//是否已经维护银行卡
					remark : res.data.remark, //备注信息，如驳回原因
					extract : "0"+resStatus.authStatus
				}) 
			} else  { 
				that.setData({
					extract: '00'
				})
				return;
			}
		}).catch(err => {})

	},

	/*
	 * 查询结算单是否已出
	 */
	getSettleListInfo: function () {
		let that = this;
		api.post(URL.querySettleList).then((res) => {
			if (res.code == '0') {
				let msg = res.data;
				let msgArr = (msg && msg.split(';')) || []
				if (msgArr.length == 2) {
					that.setData({
						settleMsg: msgArr[0] == 'false' ? '' : `${msgArr[1]}月结算单已出`
					})
				} else {
					console.error("返回数据有误");
				}
			} else {
				console.error("查询结算单失败1");
			}
		}, (res) => {
			console.error("查询结算单失败2");
		}).catch((res) => {
			console.error("查询结算单异常");
		})
	},


	// 显示 '错误提示' 信息
	showErrMsg(msg) {
		wx.showToast({
			icon: 'none',
			title: msg,
			duration: 2500
		})
	},

	// 【提现】
	getMoney() {
		let {
			extract,
			authInfo
		} = this.data; 
		if (extract == '-1') {
			console.warn('接口还未返回验证信息');
			this.showErrMsg('您还不能提现哦');
			return;
		}
		// '-1' 默认值(代表接口未返回)  00 未认证'  '01 已认证' '02已驳回   '03 '认证审核中'
		if (extract == '00') {
			// 没有进行协议认证，则需要跳转到协议授权页面
			wx.navigateTo({
				url: '/pages/distributionProtocol/distributionProtocol',
			});
		}
		if (extract == '01') {  
			if (!this.data.isHasbankCardNo) {
				this.showErrMsg('请维护银行卡信息');
				return false;
			}
			// 已认证，执行【提现】
			this.withdraw_YS_Deposit();
		}
		if (extract == '02') {
			this.showErrMsg('提现认证尚未完成!');
		} else if (extract == '03') {  
			// 审核中
			this.showErrMsg('认证信息审核中,请耐心等待!');
		} else {
			console.error("未知的提现认证状态");
		}

	},



	// 提现认证、提现记录、结算单记录跳转
	willGo: function (e) {
		let {
			extract, // 认证状态取值：【00 未认证'  '01 已认证' '02 认证审核中'  '03 已驳回'】 
			authInfo,
			commitFlag
		} = this.data;
		let key = e.currentTarget.dataset.key;
		let urlObj = {
			'auth': `/pages/distributionMoneyReg/distributionMoneyReg`, // 跳转到认证页面 
			'record': "/pages/distributionWithdrawRecord/distributionWithdrawRecord?authType=1", //  跳转到提现记录页面,暂时没有此接口，支持修改
			'settle': '/pages/distributionSettleRecord/distributionSettleRecord', // 跳转到结算单页面
			'card': '/pages/distributionSetBank/distributionSetBank', // 跳转到银行卡维护页面
		}
		let resultUrl = urlObj[key];
		if (key == 'card') {
			console.log("extract", extract)
			if (extract != '01') {
				// 未进行提现认证，不能维护银行卡信息
				this.showErrMsg('您还未通过提现认证！');
				return false;
			} else {
				// 提现认证已通过，跳转银行页面带参数：认证姓名 
				//resultUrl += `?type=${isHasbankCardNo ? 0 : 1}`; // 0: 已维护展示预览信息  1: 修改状态展示
				resultUrl += `?type=1&realName=${this.data.userCertInfo.realName}&bankCardNo=${this.data.userCertInfo.bankCardNo}`;
			}

		}

		if (key == 'auth') {
			//type 取值【0: 信息预览  1: 修改 - 提现认证  2: 新增 - 提现认证 3: 审核中，不能修改】
			if (extract == '00') { 
				// 没有进行协议认证，则需要跳转到协议授权页面
				wx.navigateTo({
					url: '/pages/distributionProtocol/distributionProtocol',
				});

				return false;
			}
			if (extract == '01') {
				// 已认证，跳转修改页面
				resultUrl += `?type=1`
			}
			if (extract == '02') {//驳回  
				//审核不通过(被驳回)
				if (commitFlag && commitFlag == '1') {
					// 提交失败后设置的，状态，不进行弹出框显示
					this.goDetailreg();
					return false;
				} else {
					this.getShowRefuse()
					return false;
				}
			}
			if (extract == '03') {//审核中
				resultUrl += `?type=3`
			}
		}
		wx.navigateTo({
			url: resultUrl
		});
	},



	// 弹框提示：“您的提现认证,未通过审核,请重新提交认证或联系客服。”
	// [暂不处理]、[重新认证]
	getShowRefuse() {
		// 审核被拒绝
		this.setData({
			showModal_refuse: !this.data.showModal_refuse
		});
	},

	// 【立即认证】跳转提现页面
	goDetailreg() {
		// extract 值: 【'-1' 默认值(代表接口未返回)  00 未认证'  '01 审核通过' '02 驳回'  '03 审核中'】
		// type值：【0: 未认证-可以修改  1: 审核通过-不能修改  2: 驳回-能修改    3: 审核中，不能修改】
		let {
			extract
		} = this.data;

		let goUrl = `/pages/distributionMoneyReg/distributionMoneyReg`;
		if (extract == '00') {
			wx.navigateTo({
				url: `${goUrl}?type=0`
			})
		}
		if (extract == '02') {
			wx.navigateTo({
				url: `${goUrl}?type=2`, //驳回
			})
		}
		if(extract == '01'){
			wx.navigateTo({
				url: `${goUrl}?type=1`, // 未认证
			})
		}
	},

	//提现逻辑
	withdraw_YS_Deposit: function () {
		// let {
		// 	settlementAmount,
		// 	showModalMoney
		// } = this.data;
		// if (settlementAmount < 1) {
		// 	wx.showToast({
		// 		icon: 'none',
		// 		title: '少于 1 元不能提现哦',
		// 		duration: 2800,
		// 		mask:true
		// 	})
		// 	return;
		// }

		if (this.data.submitFlag) {
			wx.showToast({
				title: '请不要重复发起提现!',
				icon: 'none',
				mask: true
			});
			return;
		}
		this.setData({
			submitFlag: true
		});
		this.do_YS_Getmoney();
	},

	// 执行提现操作
	do_YS_Getmoney() {
		wx.showLoading({
			title: '处理中',
		})
		let { showModalMoney } = this.data;
		let that = this;

		queryWithdrawal().then(res => {
			if (res.code == "0000") {
				this.setData({
					showModalMoney: !showModalMoney
				});
				wx.hideLoading();
			} else {
				wx.hideLoading();
				wx.showModal({
					title: '提示',
					content: res.msg || '提现失败，请稍后再试!',
					showCancel: false,
					confirmColor: '#F10216',
					success() {
						that.setData({
							submitFlag: false
						}); //恢复按钮的可提交状态
					}
				});
			}
		}, res => {
			wx.hideLoading();
			wx.showModal({
				title: '提示',
				content: res.msg || '提现失败异常，请稍后再试!',
				showCancel: false,
				confirmColor: '#F10216',
				success() {
					// 恢复按钮的可提交状态
					that.setData({
						submitFlag: false
					});
				}
			})
		})
	},


	// 提示框的'确定'按钮:
	// 弹出 "提现已被受理,请在提现记录中查看进度。"
	toolTip_tap: function () {
		let {
			showModalMoney
		} = this.data;
		this.setData({
			showModalMoney: !showModalMoney
		});

		// 跳转到提现记录页面
		wx.redirectTo({
			url: '/pages/distributionWithdrawRecord/distributionWithdrawRecord',
		})
	}

})