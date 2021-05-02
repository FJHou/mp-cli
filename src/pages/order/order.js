import {request, reportErr} from "../../utils/util.js"; 
import {getOrderListReq} from '../../api/index.js';
import {gotopay} from "../../utils/MPay.js";
import loginUtil from "../../pages/login/util.js";
import toast from '../../components/toast/toast.js';
import { getBrandBaseInfo,changeURLArg,toh5 } from '../../utils/JDH-pharmacy/index'  
// import { getPtKey } from "../../utils/loginUtils.js";
import queryString from 'query-string';

//获取应用实例
var app = getApp();

Page({
	data: {
		option: '',
		// homedir: "/kwxhome",
		screenHeight: 0,
		screenWidth: 0,
		modalHidden: true,
		scrollTop: '',
		toTopDisplay: "none",
		orderList: [],
		// pageNum: 1,
		pageSize: 10,
		// loadgoPay: true,
		returnpage: '/pages/order/order',
		noMore: false, //最下面没有更多提示语
		loadnone: false, //加载中提示语，默认显示
		// checkLoginFlag: false,
		lastOptionTime: 0,
		tab: {
			list: [{
				id: 'all',
				title: '全部',
				statusId: '4096'
			}, {
				id: 'topay',
				title: '待付款',
				statusId: '1'
			}, {
				id: 'receive',
				title: '待收货',
				statusId: '128'
			}, {
				id: 'sign',
				title: '已完成',
				statusId: '1024'
			}, {
				id: 'cancle',
				title: '已取消',
				statusId: '-1'
			}],
			selectedId: 'all'
		},
		noOrderItem: {
			msg: '您还没有相关订单'
		},
		firstHasData: true, 
		statusId: '4096', //4096：全部订单 ；1：待付款 ；128：待收货； 1024：已完成 ；-1：已取消
		pageIndex: 1,
		isScrolling: false,
		hasNextPage: true,
		requestCount: 0,
		requestMaxNum : 100, //最多循环请求的次数
		orderListArr: [] //暂存的orderlist
	},
	onLoad(options) {
		this.data.option = options;

		if (options.id) {
			this.setData({
				[`tab.selectedId`]: this.data.tab.list[options.id - 1].id,
				statusId: this.data.tab.list[options.id - 1].statusId
			});

		}
		wx.getSystemInfo({
			success: (res) => {
				this.setData({
					screenHeight: res.windowHeight,
					screenWidth: res.windowWidth,
				});
			}
		});
	},
	onShow() {
		this.setData({
			firstHasData: true,
			pageIndex: 1,
			hasNextPage:true,
			orderListArr: [],
			orderList: [],
			loadnone: false,
			noMore: false
		});
		this.circleOrderReq()
	},
	circleOrderReq() { //循环订单列表，知道请求返回的订单数据大于pageSize  
		//已经请求的次数<100 && 暂存的orderlist < pageSize  && 有下一页  则继续请求  
		if (this.data.requestCount < this.data.requestMaxNum && this.data.orderListArr.length < this.data.pageSize && this.data.hasNextPage) { 
			getOrderListReq(this.data.statusId, this.data.pageIndex, this.data.pageSize).then(res => { 
					this.data.requestCount++;
					this.setData({
						requestCount: this.data.requestCount + 1,
						pageIndex: res.data.pageNo + 1, 
						hasNextPage: res.data.hasNextPage
					})
					if(res.data.data.length > 0){
						let tempArr = this.data.orderListArr.concat(res.data.data) 
						this.setData({ 
							orderListArr: tempArr 
						})
					} 
					if(!res.data.hasNextPage){//没有下一页了 
						this.bindRequest()
						return
					}else{//还有下一页
						if(this.data.orderListArr.length<this.data.pageSize.length){//本次循环返回的数据不足pageSize的数量
							this.circleOrderReq()
						} else{ 
							this.bindRequest()
						} 
					} 
				}) 
		}else{
			return;
		}
	},
	bindRequest(){
		this.setData({ 
			loadnone: true, //不显示加载中
		})
		if (this.data.orderListArr.length == 0 && this.data.orderList.length == 0) {//没有数据
			this.setData({
				firstHasData: false,
				noMore: false, 
			})
		} else if (this.data.orderListArr.length == 0) {
			this.setData({ 
				noMore: true 
			})
		} else {  
			let newOrderList = this.data.orderList.concat(this.data.orderListArr); 
			this.setData({
				firstHasData: true,
				noMore: false, 
				orderList: newOrderList,
			})
		}
		wx.hideLoading()
		this.data.isScrolling = false
	},
	//切换tab处理函数
	switchOrder(e) {
		if(this.data.loadnone){
			let selectedId = e.detail.target.dataset.itemId;
			let typeId = e.detail.target.dataset.type;
			this.setData({
				firstHasData: true,
				loadnone: false, 
				noMore: false,
				pageIndex: 1,
				hasNextPage: true,
				requestCount: 0,
				orderListArr:[],
				orderList: [],
				statusId: typeId,
				[`tab.selectedId`]: selectedId,
				scrollTop: Math.random() * 0.001
			});
			this.circleOrderReq()
		}
	},
	ForReachBottom() {
		if (this.data.isScrolling === true) {
			return;
		} else {
			this.data.isScrolling = true
			if (this.data.hasNextPage) {
				wx.showLoading({ //显示 loading 提示框
					title: '请求中...',
					mask: true
				})
				this.setData({ 
					requestCount: 0, 
					orderListArr:[] 
				});
				this.circleOrderReq();
			}else{
				this.setData({ 
					noMore: true
				});
			}
		}
	},
	scroll(e) {
		if (e.detail.scrollTop > this.data.screenHeight) {
			this.setData({
				toTopDisplay: "block"
			})
		} else {
			this.setData({
				toTopDisplay: "none"
			})
		}
	},
	async orderAgain(e){
		let {url} = e.currentTarget.dataset;
		const { query, url: newUrl } = queryString.parseUrl(url);
		const {carlist, venderid} = query;

		const path = queryString.stringifyUrl({
			url: newUrl,
			query: {
				carlist,
				venderid
			},
		})
		toh5(path)
		// let newUrl = changeURLArg(url,'source',yjsSource)  
		// loginUtil.navigateToH5({
		// 	page: `${newUrl}&gisAreaId=1&`
		// });
	}, 
	goPay(e) {
		if (!this.disbale) {
			this.disbale = !this.disbale;
			wx.showToast({
				title: '正在拉起支付',
				icon: 'loading',
				mask: true,
				duration: 10000
			})
			let formId = e.detail.formId;
			gotopay({
				orderId: e.currentTarget.dataset.orderid,
				orderType: e.currentTarget.dataset.ordertype,
				orderTypeCode: e.currentTarget.dataset.ordertypecode,
				factPrice: e.currentTarget.dataset.factprice,
				source: 'order',
				formId: formId
			}, this);

		}
	},
	toTopTap(e) {
		this.setData({
			toTopDisplay: "none",
			scrollTop: Math.random() * 0.001
		})
	},
	//判断登录态
	checkLogin(reponse) {
		// reponse.code '999' 为未登陆
		return reponse.code != '999'
	},
	async jump2orderDetail(e) {
		//avoid repeat request
		let {
			lastOptionTime
		} = this.data;
		if (lastOptionTime == 0) {
			this.setData({
				lastOptionTime: new Date().getTime()
			});
		} else {
			var now = new Date().getTime();
			if (now - lastOptionTime < 5000) {
				return false;
			} else {
				this.setData({
					lastOptionTime: new Date().getTime()
				});
			}
		}
		var {
			orderid
		} = e.currentTarget.dataset;

		let url = `${app.diansongUrl}/order/detail?orderId=${orderid}`;
		let openId = await app.getOpenId()
		url = decodeURIComponent(
			`${url}${url.indexOf("?") > -1 ? "&" : "?"}openId=${openId}&miniWexinAppId=${app.globalData.appid}&source=go&gisAreaId=1&loginPlugin=1`
		);
		wx.setStorageSync('isOrderLocDetail', true);
		loginUtil.navigateToH5({
			page: url
		});

	},
	confirmGoods(e) {
		var curTarget = e.currentTarget,
			orderId = curTarget.dataset.orderid,
			url = app.globalHealthPayRequestUrl + '/user/confirmGoods.json?orderId=' + orderId;

		wx.showModal({
			content: '是否确定已收到货品？',
			showCancel: true,
			cancelText: '取消',
			confirmText: '确认',
			confirmColor: '#f23030',
			success: (res) => {
				if (res.confirm) { //确认
					request({
						url: url,
						method: 'GET',
						success: (data) => {
							if (data.flag == "true") { //确认收货成功  
								this.data.pageIndex = 1;
								// let requestUrl = `${app.globalHealthPayRequestUrl}/newAllOrders/newAllOrdersHealthy.json?functionId=${this.data.functionId}&page=${this.data.pageNum}&pageSize=${this.data.pageSize}`;
								// this.onceGetOrderData(requestUrl);
								this.circleOrderReq()
								this.setData({
									scrollTop: Math.random() * 0.001
								});
								//取消按钮隐藏
							} else {
								toast.show({
									icon: toast.icon.error,
									message: '无法完成收货，请稍后重试。',
									pageObj: this
								});
							}
						},
						fail: (e) => {
							reportErr(encodeURIComponent("订单列表页confirmGoods操作失败，具体信息：") + e.errMsg);
						}
					});
				}
			}
		});

	},

})