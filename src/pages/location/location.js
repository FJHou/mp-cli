//获取应用实例
var app = getApp();
import { globalLoginShow, decryptBy3DES } from '../../utils/util.js';
const { getPtKey } = requirePlugin('loginPlugin');
import { queryAddressName, dsAddrList, getAddrCoordinates } from '../../api/index'

Page({
	data: {
		staticUrl: app.staticUrl,
		queryDone: false,
		navStyle: {
			bgColor: '#ff413f'
		},
		images: {
			emptyImage: `${app.staticUrl}/devfe/jfs/t1/76458/38/12349/31093/5d9c7af5Efdfcb9d1/b9ceccce29425dac.png`,
			logImage: `${app.staticUrl}/devfe/jfs/t1/51611/28/13202/21648/5da072c7Ed1308839/e8e6e2f5d5534552.png`,
			edit: `${app.staticUrl}/imagetools/jfs/t1/95854/28/646/2151/5db166d9Ea33cca6e/63fee687939dc9d1.png`,
			position:
				'https://img10.360buyimg.com/imagetools/jfs/t1/84218/28/8562/863/5d67c5b0Ebaf18803/7ffec9f686e83c7f.png',
			add:
				'https://img10.360buyimg.com/imagetools/jfs/t1/47105/25/9123/337/5d67d45fE40915cb2/c17d85dbffd879fb.png'
		},
		currentLatitude: '',
		currentLongitude: '',
		choiceLocation: '', // 选择过的地址
		curLocation: '', // 当前定位坐标
		isIpx: app.globalData.isIpx,
		adressList: [],
		isLogined: true
	},
	onLoad: function (options) {
		this.options = options;
	},
	onShow: function () {
		this.getPositionInfo(); //获取地址信息
		// 登录用户要获取 用户地址列表
		const isLogined = getPtKey();
		this.setData({
			isLogined: !!isLogined
		});
		if (isLogined) {
			this.getAddressList();
		}
	},
	toLogin() {
		globalLoginShow({
			data: {
				returnpage: '/pages/location/location',
				fromPageLevel: 1
			}
		});
	},
	// 登录成功后，这个页面会有两层页面栈，这个方法用来防止这个页面返回两次
	goback() {
		// let self = this;
		let pages = getCurrentPages();
		let delta = 0;
		for (let i = pages.length - 1; i > 0; i--) {
			if (pages[pages.length - 1].route === pages[i].route) {
				delta += 1;
			}
		}
		// let prevPage = pages[pages.length - delta - 1];
		// prevPage.setData({
		// 	backSource: self.backSource
		// });
		wx.navigateBack({
			delta: delta
		});
	},
	/**
   * 获取用户地址信息
   * @param {} options
   */
	getAddressList: function () {
		wx.showLoading()

		dsAddrList().then(res => {
			let addrList = []
			if (res.success) {
				addrList = res.data.addrList
			}
			this.setData({
				addressList: addrList,
				queryDone: true
			});
			wx.hideLoading()
		}).catch(err => {
			wx.hideLoading()
			console.error('getAddressList:', err);
		})
	},

	useCurLocation() {
		if (this.data.curLocation.indexOf('定位失败') >= 0) return

		wx.setStorageSync('locationInfo', {
			latitude: this.data.currentLatitude,
			longitude: this.data.currentLongitude
		});
		wx.setStorageSync('choiceLocation', this.data.curLocation);
		// app.globalData.storeId='';
		// app.globalData.venderId='';
		this.backSource = 'locationGet';
		this.goback();
	},
	/**
   * 获取定位信息
   */
	getPositionInfo: function (event) {
		wx.getLocation({
			type: 'gcj02',
			altitude: false,
			success: (res) => {
				const { latitude, longitude } = res;
				if (latitude && longitude) {
					this.setData({
						currentLatitude: latitude,
						currentLongitude: longitude
					});
					queryAddressName({
						latitude,
						longitude
					}).then((curLocation) => {
						curLocation = curLocation || '定位失败,请点击重新定位';
						let choiceLocation = wx.getStorageSync('choiceLocation');
						if (!choiceLocation) {
							//缓存中无值，取定位信息
							choiceLocation = curLocation;
						}
						this.setData({
							choiceLocation,
							curLocation
						});
					});
				}
			},
			fail: (res) => {
				let choiceLocation = wx.getStorageSync('choiceLocation') || '未能获取您的定位';
				this.setData({
					choiceLocation,
					curLocation: '定位失败,请点击重新定位'
				});
				this.reAuthLocation(event);
			}
		});
		// wx.getLocation();
	},
	// 重新定位
	resetLocation({ latitude, longitude }) {
		queryAddressName({
			latitude,
			longitude
		}).then((curLocation) => {
			curLocation = curLocation || '定位失败,请点击重新定位';
			this.setData({
				curLocation
			});
		});
	},
	noticeStartLocation() {
		wx.showModal({
			title: '打开设置页面进行授权',
			content: '需要获取您的地理位置，请到小程序的设置中打开地理位置授权',
			confirmText: '去设置',
			success: (confirmReponse) => {
				if (confirmReponse.confirm) {
					wx.openSetting({
						success: (setReponse) => {
							if (setReponse.authSetting['scope.userLocation']) {
								wx.getLocation({
									type: 'gcj02',
									altitude: false,
									success: (reponse) => {
										this.resetLocation(reponse);
									}
								});
							}
						}
					});
				}
			}
		});
	},
	reAuthLocation(event) {
		// 表示点击事件  如果未授权泛起授权申请
		if (event) {
			wx.getLocation({
				type: 'gcj02',
				altitude: false,
				success: (reponse) => {
					this.resetLocation(reponse);
				},
				fail: () => {
					//提示开启手机定位功能
					this.noticeStartLocation();
				}
			});
		}
	},
	/**
   * 跳转新增收货地址
   */
	addAdress() {
		if (this.data.addressList.length >= 20) {
			wx.showModal({
				content: '您的地址已达20条，请删除部分当前地址后再建',
				showCancel: false
			});
		} else {
			wx.navigateTo({
				url: '/pages/address/address?addressId=0&addressType=add&isGlobalPayment=true'
			});
		}
	},
	/**
	 * 重新选择地址信息
	 */
	resetAdress(e) {
		const { id, addressDetail } = e.currentTarget.dataset['item'];
		getAddrCoordinates(id).then(res => {
			const { latitude, longitude } = res.data;
			const locationInfo = {
				latitude,
				longitude,
				addressId: id
			}
			wx.setStorageSync('locationInfo', locationInfo);
			wx.setStorageSync('choiceLocation', addressDetail);
			// this.backSource = 'locationAdress'; 
			this.setData({
				choiceLocation: addressDetail
			});
			this.goback();
		})
	}
});
