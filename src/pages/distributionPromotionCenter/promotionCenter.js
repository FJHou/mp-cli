import WxCharts from "../../libs/wxcharts-min";

var Api = require("../../utils/JDH-pharmacy/api.js");
var api = new Api();
import { 
	queryUserEstimateCommission, 
	queryUserUpgradeProgress, 
	queryEstimateCommissionByDay, 
	queryAvailableBalance, 
	queryFansNum,
	queryOrdersNumByDay
} from '../../api/index';
import {DEFAULT_AVATAR} from '../../constants/index'
import { fetchIsReferenceUser } from "../../utils/JDH-pharmacy";
import { getUserInfo } from "../../utils/loginUtils";


var fansCount;
var invitedUserCout;
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // buyer,
    navbarData: {
      showCapsule: 0,
      title: "会员",
    },
    brandTxt: {},

    helpModal: false,

    screenHeight: wx.getSystemInfoSync().screenHeight,

    height: app.globalData.height,

    defaultPic: app.globalData.defaultPic,
		progressInfo:{},//升级进度
    memberInfo: {},
    todayCommission: 0,
    totalCommission: 0, 

    statistic: {},

    inviteCode: "xxx",

    vipDataSource: [],

    isVip: "xxx",

    hasShop: false,

    vipSwitch: false,

    showMask: false, //专属导师弹窗默认关闭

    // 收益&图表 start
    isShow: false,
    chartDataArr: [],
    tab: 6, 
    theMonthEstimateIncome: 0,
    lastMonthEstimateIncome: 0,
    lastMonthSettledBillableAmount: 0,
    lastMonthUnsettledBillableAmount: 0,
		defaultLimit: 6,
		totalFee:0,//预估收益
		totalOrderCount:0,//订单量
		trendDataError: false,
		// 收益&图表 end
		availableBalance:0,//可提现金额
		hadAuth: true, // 默认隐藏“提现认证未通过”部分
		totalNum:0,//用户粉丝总数量
		todayNum:0,//用户粉丝当天数量
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 隐藏专属导师弹层
    this.setData({
      showMask: false,
    });
    this.getUserCenterInfo()
  },

  getUserCenterInfo(){
    fetchIsReferenceUser().then(res => {
      if (res) {
        
        this.setData({
          memberInfo: {
            ...res,
            headImg: getUserInfo().imgUrl || DEFAULT_AVATAR
          }
        })
      }
    })

    queryUserEstimateCommission().then(res => {
      const data = res.data

      if (data) {
        this.setData({
          todayCommission: data.todayCommission,
          totalCommission: data.totalCommission
        })
      }
    }) 
		
		//升级进度
		queryUserUpgradeProgress().then(res => { 
			if(res.code=="0000"&&res.data){
				this.setData({
					progressInfo: res.data
				}) 
			} 
		}).catch(err=>{}) 

		//可提现金额查询
		queryAvailableBalance().then(res=>{ 
			if(res.code=="0000"&&res.data){
				this.setData({ 
					availableBalance: res.data.availableBalance 
				}) 
			}else{
				this.setData({
          settlementAmount: "0"
        });
				this.showErrMsg('查询余额失败!');
			}
		}).catch(err=>{
			this.showErrMsg('查询余额失败!');
		})

		//我的粉丝
		queryFansNum().then(res=>{ 
			if(res.code=="0000"&&res.data){
				this.setData({ 
					totalNum: res.data.totalNum,//用户粉丝总数量
					todayNum: res.data.todayNum //用户粉丝当天数量
				}) 
			}
		}).catch(err=>{})
	let YMD = 	this.getCurrentYMD();
		//我的订单
		queryOrdersNumByDay({
			startDate:YMD,
			endDate:YMD
		}).then(res=>{ 
			if(res.code=="0000"&&res.data&&res.data.userCpsOrderNums){
				this.setData({ 
					orderInfo : {
						totalNum: res.data.userCpsOrderNums[0].totalNum,//总订单
						spreadNum: res.data.userCpsOrderNums[0].spreadNum //推广订单
					} 
				}) 
			}
		}).catch(err=>{})

  },
	getCurrentYMD(){
		let date = new Date();
		let Year = date.getFullYear();
		let month = date.getMonth()+1;
		let Month = month <10 ? "0"+month : month; //获取当前月份(0-11,0代表1月)
		let Day = date.getDate(); //获取当前日(1-31) 
		return Year + "-" + Month + "-" + Day; 
	},
  onLockPoint: function(e) {
    let tmp = e.currentTarget.dataset.pointKey;
    api.getMta().Event.stat(tmp, {});
	},
	
  hideHelpModal: function() {
    this.setData({
      helpModal: false,
    });
  },

  // goWhere() {
  //   if (this.data.hasShop == true) {
  //     wx.navigateTo({
  //       url: "/pages/myShop/myShop",
  //     });
  //   } else if (this.data.hasShop == false) {
  //     wx.navigateTo({
  //       url: "/pages/noShop/noShop",
  //     });
  //   } else if (this.data.hasShop == -1) {
  //     wx.showLoading({
  //       title: "加载中,请稍后",
  //     });
  //     setTimeout(function() {
  //       wx.hideLoading();
  //     }, 1000);
  //   }
  // },
  swiperTouchMove: function() {
    console.log("swiperTouchMove");
    return false;
  },
  // createShop: function() {
  //   //开通店铺
  //   api.post("/shop/oneKeyOpenShop").then((rs) => {
  //     if (rs.code == 0) {
  //       wx.showToast({
  //         title: "开店成功！",
  //       });
  //       wx.setStorageSync("isVip", true);
  //       wx.navigateTo({
  //         url: `/pages/shopIntroduction/shopIntroduction`,
  //       });
  //     } else {
  //       wx.showToast({
  //         title: "开店失败！",
  //         icon: "none",
  //       });
  //     }
  //   });
  // },
  /**
   * 获取storage中存储的用户信息
   * */
  // getStorageUserInfo: function() {
  //   const { avatarUrl, nickName } = wx.getStorageSync("userInfo");
  //   this.setData({ avatarUrl, nickName });
  // },
  getStorageByKey: function(key) {
    try {
      const value = wx.getStorageSync(key);
      if (value) {
        return value;
      }
    } catch (e) {}
  },
  navigatorToShare: function() {
    wx.navigateTo({
      url: "/pages/share/share",
    });
  },
  getLevelStatus: function(inviteUserIdentity) {
    const { contactStatus } = this.data;
    let title = "---";
    if (inviteUserIdentity == 0) title = !contactStatus ? "粉丝" : "普通";
    if (inviteUserIdentity == 1) title = !contactStatus ? "会员" : "初级会员";
    if (inviteUserIdentity == 2)
      title = !contactStatus ? "会员PLUS" : "中级会员";
    if (inviteUserIdentity == 3) title = !contactStatus ? "团长" : "高级会员";
    return title;
  },
  /**
   * 查询邀请好友成为会员规则（邀请数据）
   * */
  getMemberCondition: function() {
    var api = new Api();
    api
      .get("/user/member/getMemberCondition")
      .then((rs) => {
        if (rs.code == 0 && rs.data) {
          // const {
          //   fansCount
          // } = rs.data;
          // this.setData({
          //   fansCount
          // })
          fansCount = rs.data.fansCount;
        }
      })
      .then((_) => {
        // 获取当前用户的已经邀请的好友人数
        this.getInvitedUserCout();
      });
  },
  /**
   * 已邀请好友人数
   * */
  getInvitedUserCout: function() {
    var api = new Api();
    api.get("/user/member/getInvitedUserCout").then((rs) => {
      if (rs.code == 0 && rs.data) {
        // const {
        //   fansCount
        // } = this.data;
        // const {
        //   invitedUserCout
        // } = rs.data;
        invitedUserCout = rs.data.invitedUserCout;
        // 邀请好友完成状态
        const invitedFinish = invitedUserCout - fansCount;
        // 是否显示邀请进度状态
        const invitedStatus = invitedUserCout > 0;
        this.setData({
          // invitedUserCout,
          invitedShort: fansCount - invitedUserCout,
          // invitedFinish,
          // invitedStatus
        });
      }
    });
  },
  searchVipItemList: function() {
    const params = {};
    params.pageSize = 50;
    params.pageNum = 1;
    api.get("/item/search/searchVipItemList", params).then((rs) => {
      if (rs.code == 0) {
        // 生成直接购买的数据
        // 将所有Null值替换为---
        rs.data &&
          rs.data.result &&
          rs.data.result.map((_item) => {
            // 生成订单数据（uuidkey）
            const itemSkuRequestVo = {
              bargainNo: null,
              num: 1,
              groupType: null,
              sellerId: _item.sellerId,
              itemName: _item.itemName,
              itemId: _item.itemId,
              skuId: _item.skuId,
              promotionId: _item.promotionId,
              attributes: _item.attribute,
            };
            _item.itemSkuRequestVo = JSON.stringify(itemSkuRequestVo);
          });
        this.setData({
          vipDataSource: rs.data.result,
        });
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // this.getStorageUserInfo();
    //底部导航条
    for (let i = 0; i < 2; i++) {
      this.swiperChange();
		}
		
		// 收益&图表
    // 加载图表
    wx.createSelectorQuery().select('.chart').boundingClientRect().exec(res => {
      this.setData({
        canvasWidth: res[0].width,
        canvasHeight: res[0].height
      })
      this.renderChart();
    });
    this.getComProStatInfo();

  },

  //复制邀请码
  copyInviteCode: function() {
    var that = this;
    wx.setClipboardData({
      data: that.data.memberInfo.inviteCode,
      success(res) {
        wx.getClipboardData({
          success(res) {
            wx.showToast({
              title: '复制成功',
              icon: 'success'
            })
          },
        });
      },
    });
  },

  swiperChange: function(opt) {
    //随机数
    var random = Math.random() * (100 - 1) + 1;
    this.setData({ randomNum: random.toFixed(2) });
    //随机姓名
    const str =
      "赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏璇淼栋夫子瑞堂甜敏尚国贤贺祥晨涛昊轩易qwertyuiopasdflkjhgnvbmcxzRQEWUIOTYPFKFDSAJGHBNMCX";
    const { names = [] } = this.data;
    const nameLen = Math.floor(Math.random() * 3) + 2;
    let name = "";
    for (let i = 0; i < nameLen; i++) {
      const strRan = Math.floor(Math.random() * str.length);
      name += str.substr(strRan, 1);
    }
    if (!opt) {
      names.push(name);
    } else {
      const { current } = opt.detail;
      names[current] = name;
    }
    this.setData({
      names,
    });
  },

  // 以下为从收益页面挪移过来的代码
  /**
   * 监听滚动条事件
   * */
  onPageScroll: function(e) {
    const { canvasDisabled } = this.data;
    if (canvasDisabled) return;
    wx.createSelectorQuery()
      .select(".chart")
      .boundingClientRect((res) => {
        const createImgHeight = res.height + this.data.globalHeight + 44;
        const calcHeight = res.bottom;
        if (e.scrollTop < 500) {
          if (!canvasDisabled) return;
          this.setData({
            canvasDisabled: false,
            canvasToImage: "",
          });
        } else {
          if (canvasDisabled) return;
          this.createImageForCanvas();
          this.setData({
            canvasDisabled: true,
          });
        }
      })
      .exec();
  },
  /**
   * 预估收益金额
   * */
  getComProStatInfo: function() { 
    api.get("/user/member/getComProStatInfo", { comProtype: 3 }).then((rs) => {
      if (rs.code == 0) {
        const {
          theMonthEstimateIncome,
          lastMonthEstimateIncome,
          lastMonthSettledBillableAmount,
          lastMonthUnsettledBillableAmount,
        } = rs.data;
        this.setData({
          theMonthEstimateIncome,
          lastMonthEstimateIncome,
          lastMonthSettledBillableAmount,
          lastMonthUnsettledBillableAmount,
        });
      }
    });
  },
  /**
   * 选择卡操作
   *
   */
  tabChange: function(e) {
    // 防重点击
    if (e.currentTarget.id == this.data.tab) return;
    if (parseInt(e.currentTarget.id) > 0) {
      const ranNum = Math.floor(Math.random() * 10);
      this.setData({
        defaultLimit: e.currentTarget.id + "." + ranNum,
      });
    }
    this.setData({
      tab: e.currentTarget.id,
    });
  },
  /**
   * 预估收益说明弹框
   * */
  // TODO:二期
  showModal: function() {
    const { isShow, canvasDisabled } = this.data;
    if (canvasDisabled) {
      this.setData({
        isShow: !isShow,
      });
    } else {
      wx.createSelectorQuery()
        .select(".chart")
        .boundingClientRect((res) => {
          const createImgHeight = res.height + this.data.globalHeight + 44;
          const calcHeight = res.bottom;
          if (isShow) {
            if (!canvasDisabled) return;
            this.setData({
              isShow: !isShow,
              canvasDisabled: false,
              canvasToImage: "",
            });
          } else {
            if (canvasDisabled) return;
            this.createImageForCanvas();
            this.setData({
              isShow: !isShow,
              canvasDisabled: true,
            });
          }
        })
        .exec();
    }
  },
  /*点击图表图片*/
  chartsImgClick: function() {
    this.setData({
      canvasDisabled: false,
    });
  },
  /*
   * 预估收益列表
   */
  getEstimateIncomeStatisticsInfo: function(params) {
		queryEstimateCommissionByDay(params).then(rs=>{ 
			if(rs.code=="0000"&&rs.data){ 
          const { totalFee, totalOrderCount, estimateCommissions } = rs.data;
          // 生成图表数据
          const seriesIncome = [];
          const seriesDate = [];
          const categories = [];
          const series = [];
          const dataSource = [];
          estimateCommissions.map((_item, _index) => {
            seriesIncome.push(_item.totalFee);
            categories.push(_item.day);
            if (_item.totalOrderCount + _item.totalFee > 0) {
              dataSource.push(_item);
            }
					});  
          series.push({
            name: "日预估总收益",
            color: "#F10216",
            data: seriesIncome,
          });
          this.updateChartData(categories, series);
          this.setData({
            totalFee,
            totalOrderCount,
						dataSource: dataSource.reverse()
					}) 
			}else{
				this.setData({
					totalFee:0,
					totalOrderCount:0,
					trendDataError : true
				}) 
			} 
		}) 
  },
  /**
   * 将画布内容生成图片
   * */
  createImageForCanvas: function() {
    const _this = this;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: this.data.canvasWidth * 8,
      height: this.data.canvasHeight * 8,
      destWidth: this.data.canvasWidth * 8,
      destHeight: this.data.canvasHeight * 8,
      canvasId: "lineCanvas",
      quality: 1,
      success(res) {
        _this.setData({
          canvasToImage: res.tempFilePath,
        });
      },
    });
  },
  /**
   * 隐藏画布
   * 调用生成图片方法
   * */
  hideCanvas: function() {
    this.setData({
      canvasDisabled: true,
    });
    this.createImageForCanvas();
  },
  /*
   * 图表点击事件
   * 弹出数据弹框
   */
  canvasHandle: function(e) {
    this.data.chart.showToolTip(e, {
      // background: '#fff',
      color: "#000",
      format: function(item, category) {
        return item.name + "  " + item.data;
      },
    });
  },
  /*
   * 加载图表
   * 默认加载初始信息
   */
  renderChart: function() {
    // 收益&图表
    // 加载图表
    wx.createSelectorQuery()
      .select(".chart")
      .boundingClientRect()
      .exec((res) => {
        const { width, height } = res[0];
        const series = [
          {
            name: "日预估总收益",
            color: "#F10216",
            data: [0],
          },
        ];
        const categories = [0];
        const ChartsObj = {
          dataLabel: false,
          canvasId: "lineCanvas",
          type: "line",
          animation: true,
          extra: {
            lineStyle: "",
          },
          categories: categories,
          series: series,
          width: this.data.canvasWidth - 5,
          height: this.data.canvasHeight,
          dataPointShape: true,
          xAxis: {
            disableGrid: true,
          },
          yAxis: {
            title: "日预估总收益（元）",
          },
          legend: true,
        };
        this.data.chart = new WxCharts(ChartsObj);
        this.setData({
          hasInitChart: true, // 标识charts已经初始化完毕，解决首次渲染没有渲染成功问题
        });
      });
  },
  /*
   * 更新图表数据
   */
  updateChartData: function(categories, series) {
		if (!this.data.chart) return; 
    this.data.chart.updateData({
      series,
      categories,
    });
  },
  /**
   * 取消时间选择回调
   * 显示画布
   * 隐藏图片
   * */
  cencelDate: function(e) {
    if (!e.detail.cencel) return;
    this.setData({
      canvasDisabled: false,
      canvasToImage: "",
    });
  },
  /*
   * 选择时间回调
   */
  selectDate: function(e) {
    const { startDate, endDate } = e.detail;
    const _startDate = startDate.replace(/\./g, "-");
    const _endDate = endDate.replace(/\./g, "-");
    let params = this.data.params || {};
    params.startDate = _startDate;
    params.endDate = _endDate;
    this.setData({
      startDate: _startDate,
      endDate: _endDate,
      params,
      canvasDisabled: false,
      canvasToImage: "",
    });
    this.getEstimateIncomeStatisticsInfo(params);
  },

  // 我的老师弹出弹层
  showTeacher(e) {
    this.setData({
      showMask: true,
    });
    this.hideCanvas();
  },
  // 关闭弹层
  cancelMask(e) {
    this.setData({
      showMask: false,
    });
    this.cencelDate;
  },
  // 复制微信号
  copyWX(e) {
    var that = this;
    var text = "";
    if (this.data.myTeacherWx) {
      text = this.data.myTeacherWx;
    } else if (this.data.myDefaultTeacherWx) {
      text = this.data.myDefaultTeacherWx;
    }
    wx.setClipboardData({
      data: text,
      success(res) {
        wx.getClipboardData({
          success(res) {
            wx.showToast({
              title: "复制成功，赶快去联络队友",
              icon: "none",
            });
            that.setData({
              showMask: false,
            });
          },
        });
      },
    });
  },
  // 查询专属老师
  queryMyTeacher() {
    api
      .post("/user/getUserAdvisorWxAccount", { isDefault: true })
      .then((res) => {
        this.setData({
          code: res.code,
        });
        if (res.code == 0 && res.data) {
          let myTeacherWx = "";
          let myDefaultTeacherWx = "";
          let noSettingWx = "";
          if (res.data.wxAccount) {
            myTeacherWx = res.data.wxAccount;
          } else if (res.data.defaultWxAccount) {
            myDefaultTeacherWx = res.data.defaultWxAccount;
          } else {
            noSettingWx = "暂无导师微信号";
          }
          this.setData({
            myTeacherWx,
            myDefaultTeacherWx,
            noSettingWx,
          });
        } else {
          this.setData({
            noSettingWx: "暂无导师微信号",
          });
        }
      })
      .catch((res) => {
        this.setData({
          noSettingWx: "查询导师微信号出错",
        });
        console.log(res, "查询专属老师出错！");
      });
  },

  //跳转到我的助手
  toMyaides() {
    api.get("/shop/room/queryRoomsByUser", {}).then((rs) => {
      if (rs.code == 0) {
        if (rs.data && rs.data != "") {
          wx.navigateTo({
            url: "/pages/myaides/myaides",
          });
        } else {
          wx.navigateTo({
            url: "/subExtractMain/pages/robot/myWeChatGroup/myWeChatGroup",
          });
        }
      } else {
      }
    });
	},
	navigateTo(e) {
		wx.navigateTo({
				url: e.target.dataset.url,
		});
	},
	// 显示 '错误提示' 信息
  showErrMsg(msg) {
    wx.showToast({
      icon: 'none',
      title: msg,
      duration: 2000
    })
  }
});
