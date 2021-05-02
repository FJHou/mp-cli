const app = getApp();
Component({
	data: {
		showFloorMap: {
			jumpJdhApplet: false
		}
	},
	methods: {
		redirectToJDH() {
			//埋点
			// let { provName, cityName, districtName } = wx.getStorageSync('locationInfo') 

			// 这里使用wx.navigateToMiniProgram跳转健康小程序
			wx.navigateToMiniProgram({
				appId: 'wx862d8e26109609cb',
				path: 'pages/index/index'
			});
		},
		modifyAddress() {
			wx.navigateTo({
				url: `/pages/location/location`,
				auth: true
			});
		}
	},
	pageLifetimes: {
		show() {
			this.setData({
				'showFloorMap.jumpJdhApplet': app.globalData.showFloorMap.jumpJdhApplet
			}) 
		}
	},
	lifetimes: {
		attached() { 
			this.setData({
				'showFloorMap.jumpJdhApplet': app.globalData.showFloorMap.jumpJdhApplet
			}) 
		}
	},
});