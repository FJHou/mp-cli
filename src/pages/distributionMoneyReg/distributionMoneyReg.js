const {
	queryUploadImage,
	saveCertificationInfo,
	queryCertificationInfo
} = require("../../api/index.js");

let commitTimes = 0; // 为防止多次重复点击 “认证”，控制点击的事件间隔

Page({
	data: {
		defaultIdCardA: 'https://b2b-v2.oss.cn-north-1.jcloudcs.com/d039a9e4-2bfc-493f-9dd0-087d3cf46c00.png', // 身份证 正 面照默认图
		defaultIdCardB: 'https://b2b-v2.oss.cn-north-1.jcloudcs.com/82f246fa-9325-41de-ba82-2774fd06f122.png', // 身份证 反 面照默认图
		protocalUrl:'http://storage.jd.local/applet-qr-code/id_card_image/20210119/1211.jpg?Expires=1926400550&AccessKey=Da3f9hlku74dSrXI&Signature=3629IRY2YPjNCWojDes5mNGLPZY%3D',//协议地址
		type: 2, //页面类型: 【0: 新增 1: 审核通过  2: 驳回 3: 审核中】 
		extractInfo: {
			realName: '', //真实姓名
			userCardType: '201', // 证件类型:目前只支持身份证：201
			userCardNo: '', // 证件号
			address: '', //地址
			birthday: '', // 出生日期,格式为"YYYY-MM-DD"
			sex: '', // 性别 01:man  00:women
			mobile: '', //手机号
			certFrontUrl: '', // 证件正面照
			certBackUrl: '', // 证件反面照 
		},
		setUserCard: '',
		setMobile: '',
		birthMsg:'',//出生日期，转化后的 XX年XX月XX日 格式
	},
	onLoad: function (options) {
		console.log(options) 
		this.setData({
			type: options.type, //【0: 新增 1: 审核通过  2: 驳回 3: 审核中】   
		});

		// 预览、修改查询认证信息时
		if (options.type != 0) {  
			this.queryCertificationInfo(); 
		}

	},
	onShow: function () {
		
		// 获取系统信息，处理iphone X底部按钮
		let that = this;
		wx.getSystemInfo({
			success: function (res) {
				if (res.model.search('iPhone X') != -1) {
					that.setData({
						phoneType: '01'
					})
				}
			},
		})

	},
	queryCertificationInfo(){
		wx.showLoading()
		queryCertificationInfo().then((res) => {  
			if (res.code == "0000"&&res.data) {
				wx.hideLoading()
				let resData = res.data;  
				//对出生日期进行格式重组
				let bmsg = `${resData.birthday.slice(0, 4)}年${resData.birthday.slice(5, 7)}月${resData.birthday.slice(8, 10)}日`;
				this.setData({ 
					extractInfo : resData,
					birthMsg: bmsg
				});
				 
			} else {  
				wx.hideLoading()
				this.showErrMsg(res.msg); 
			}
		}, (err) => {
			wx.hideLoading()
			this.showErrMsg(err.msg); 
		})
	},
	// 表单提交
	formSubmit: function (e) { 
		console.log(this.data)
		let nowTimes = Date.now();
		if (nowTimes - commitTimes < 1000) {
			// 1秒之内不能重复触发
			console.warn('1秒之内不能重复触发');
			return;
		}
		commitTimes = nowTimes;

		let {
			extractInfo,
			setUserCard, // 监听键盘输入的身份证号
			setMobile,
			type //0: 信息预览  1: 修改 - 提现认证  2: 新增 - 提现认证 3: 审核中，不能修改
		} = this.data

		let {
			realName, //真实姓名
			userCardNo, // 证件号  
			address, //地址
			birthday, // 出生日期,格式为"YYYY-MM-DD" 
			mobile, //手机号 
		} = e.detail.value;
		console.log(birthday)
		// ************************ 校验数据 ************************
		if (!realName || realName.trim().length == 0) {
			this.toolTipMsg('姓名未填写');
			return false;
		};

		let hanZi = /^[\u4e00-\u9fa5]+$/;
		if (!hanZi.test(realName)) {
			this.toolTipMsg('姓名只能是中文汉字');
			return false;
		}

		if (!setUserCard) {//身份证input没有编辑过或者为空时
			if(type !=0 && userCardNo && userCardNo.indexOf('*') != -1){
					// 编辑状态 && 证件号不为空 &&加密的证件号 ==》不进行校验 
			}else{ 
				this.toolTipMsg('请填写18位身份证号');
				return false;
			} 
		} else{  
			// 如果是身份证，则进行身份证校验；
			let regId = /^[0-9]{17}[x,X,0-9]{1}$/;
			if (setUserCard.trim().length != 18 || !regId.test(setUserCard)) {
				this.toolTipMsg('请填写18位身份证号');
				return false;
			}
		}

		if(!setMobile){// 手机号input没有编辑过或者为空
			if (type !=0 && mobile && mobile.indexOf('*') != -1) {
				// setMobile为空，表示没有手动输入，加密的手机号，不进行校验 
			}else{
				this.toolTipMsg('请填写11位手机号');
				return false;
			}
		}else{
			let regOther = /^[0-9]+$/;
				if (setMobile.trim().length != 11 || !regOther.test(setMobile)) {
					this.toolTipMsg('请填写11位手机号');
					return false;
				};
		} 

		if (!address || !address.trim()) {
			this.toolTipMsg('请填写地址');
			return false;
		};

		if (!birthday) {
			this.toolTipMsg('请选择出生日期');
			return false;
		};

		if (extractInfo.sex != '0' && extractInfo.sex != '1') {
			this.toolTipMsg('请选择性别');
			return false;
		};

		if (!extractInfo.certFrontUrl) {
			this.toolTipMsg('请上传 正 面证件照');
			return false;
		};

		if (!extractInfo.certBackUrl) {
			this.toolTipMsg('请上传 反 面证件照');
			return false;
		};
		// ************************ END 校验数据 ************************

		// 为避免重复点击，提交按钮设置为loading状态，且不可用
		this.setData({
			disabled: true,
			loading: true
		});


		let bmsg = `${birthday.slice(0, 4)}-${birthday.slice(5, 7)}-${birthday.slice(8, 10)}`;
		this.setData({
			'extractInfo.realName': realName,
			'extractInfo.userCardNo': userCardNo,
			'extractInfo.address': address,
			'extractInfo.birthday': bmsg,
			'extractInfo.mobile': mobile
		})
		console.log(this.data)
		const params = Object.assign({},this.data.extractInfo,{protocalUrl: this.data.protocalUrl});   
		this.saveCertInfo(params);
	}, 
	// [新增-修改]保存益世信息(add与update是同一个接口))
	saveCertInfo: function (params) {
		let that = this;    
		saveCertificationInfo(params).then((res) => { 
			if (res.code == "0000") {
				this.toolTipMsg('信息已提交', 'success');
				setTimeout(function () {
					wx.redirectTo({
						url: '/pages/distributionIncomeWithdraw/distributionIncomeWithdraw', //收益提现页
					})
				}, 2000);
			} else {  
					this.showErrMsg(res.msg);
					that.setData({
						disabled: false,
						loading: false
					});  
			}
		}, () => {
			this.showErrMsg(res.msg);
			that.setData({
				disabled: false,
				loading: false
			});
		})
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
	 * 选中/取消选中
	 */
	onChangeCheck(e) {
		let { key } = e.currentTarget.dataset; 

		this.setData({
			'extractInfo.sex': key
		});
	}, 

	// 上传图片
	tapPhoto: function (e) {
		var that = this;
		var picType = e.currentTarget.dataset.picType;

		wx.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
  		sourceType: ['album', 'camera'],
			success(res) {
				wx.showLoading({
					title: '上传中',
				}); 
				const tempFilePaths = res.tempFilePaths[0]; 
				let filePathsArr = tempFilePaths.split('.');
				let timestamp=new Date().getTime();
				const fileName =timestamp + '.' +filePathsArr[filePathsArr.length-1]; 
				   
				wx.getFileSystemManager().readFile({
					filePath: tempFilePaths, //选择图片返回的相对路径
					encoding: 'base64', //编码格式
					success: result => { 
						console.log(result.data) 
						if (result.data) { 
							let params = {
								fileBase64 :result.data,
								fileName : fileName,
								code : 'upload_id_card_img',
								isFullUrl: true
							}
							queryUploadImage(params).then(res1 => { 
								if (res1.code == "0000" && res1.data) {
									wx.hideLoading();
									let newImgUrl = res1.data;
									if (picType == 'certFrontUrl') { 
										that.setData({
											'extractInfo.certFrontUrl': newImgUrl
										}); 
									}
									if (picType == 'certBackUrl') {
										that.setData({
											'extractInfo.certBackUrl': newImgUrl
										});
									}
								} else {
									wx.hideLoading();
									this.showErrMsg('上传图片失败!');
								}
							}).catch(err => {
								wx.hideLoading();
								this.showErrMsg('上传图片失败!');
							})
							 
						} else {
							wx.hideloading() 
						}
					}
				})
			}
		})
	},
	// 删除图片
	onDeleteImage: function (e) {
		let that = this;
		wx.showModal({
			title: '提示',
			content: '要删除该图片吗？',
			confirmColor: '#F10216',
			success(res) {
				if (res.confirm) {
					var picType = e.currentTarget.dataset.picType;
					if (picType == 'certFrontUrl') {
						that.setData({
							'extractInfo.certFrontUrl': ''
						});
					}
					if (picType == 'certBackUrl') {
						that.setData({
							'extractInfo.certBackUrl': ''
						});
					}
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}
		})
	},
	// 出生日期选择
	bindDateChange: function (e) {
		let dr = e.detail.value.split('-');
		this.setData({
			"extractInfo.birthday":e.detail.value, 
			birthMsg: `${dr[0]}年${dr[1]}月${dr[2]}日`
		})
	},
	// 错误信息提示
	toolTipMsg: function (msg, icon) {
		wx.showToast({
			icon: icon || 'none',
			title: msg,
			duration: 2000
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
	onFocusMobile(){  
		this.setData({
			'extractInfo.mobile': ''
		})
	},
	onFocusCardNo(){  
		this.setData({
			'extractInfo.userCardNo': ''
		})
	}

})