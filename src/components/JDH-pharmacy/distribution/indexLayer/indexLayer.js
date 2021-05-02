// components/indexLayer/indexLayer.js
var Api = require("../../../../utils/JDH-pharmacy/api");

//获取应用实例
const app = getApp();
var api = new Api();

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },
  ready: function() {
    //登录之后进入首页才弹
    var userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      this.setData({
        userId: wx.getStorageSync('userId')
      })
      this.moheOrderInfo(this.settingMh, this.init);
    }
  },
  attached() {
    // 获取项目的运营平台配置信息
    var initConfig = wx.getStorageSync('init_config') || {};
    this.setData({
      initConfig,
      'layerData[0].text': `Hi,快来加入${this.data.initConfig.buyerAppName}社员,邀请粉丝注册立享巨额佣金和购物返利！躺着也能赚到零花钱哦!`
    })
  },
  /**
   * 组件的初始数据
   */
  data: {
    //弹层内容存储
    layerData: [{
        'text': '',
        'marginLeft': '-100%',
        'marginBottom': '330rpx'
      },
      {
        'text': '哈哈，还在为工资不够花发愁吗？',
        'marginLeft': '-100%',
        'marginBottom': '20rpx'
      },
      {
        'text': '邀请粉丝注册就能立享巨额佣金和购物返利！让你天天多赚一份工资哦!',
        'marginLeft': '-100%',
        'marginBottom': '330rpx'
      }
    ],
    // 用户头像
    userInfo: {},
    inviderInfo: {},
    randomOne: false,
    showUpgrade: true,
    showAni: true,
    showMask2: true,
    showBtn: false,
    //魔盒数据
    moheData: {
      "weiDaKai": {
        "class": "weiDaKai",
        "picUrl": "https://b2b-v2.oss.cn-north-1.jcloudcs.com/b2207eb4-74b9-42ae-bbcb-c5c30434b3b2.png",
        "isShow": true,
        "width": 551,
        "height": 859
      },
      "zhongJiang1": {
        "class": "zhongJiang1",
        "picUrl": "https://b2b-v2.oss.cn-north-1.jcloudcs.com/b00df3b9-c1c0-4198-a762-0215837ff067.png",
        "isShow": true,
        "width": 570,
        "height": 777
      },
      "zhongJiang2": {
        "class": "zhongJiang2",
        "picUrl": "https://b2b-v2.oss.cn-north-1.jcloudcs.com/4ca9e14f-6662-4163-9ac4-80c8aecc4f4e.png",
        "isShow": true,
        "width": 600,
        "height": 777
      },
      "weiZhongJiang": {
        "class": "weiZhongJiang",
        "picUrl": "https://b2b-v2.oss.cn-north-1.jcloudcs.com/893ab1d7-c703-4bd4-bee1-c69ae4f121f9.png",
        "isShow": true,
        "width": 606,
        "height": 844
      },
      "lingHongBao": {
        "class": "lingHongBao",
        "picUrl": "https://b2b-v2.oss.cn-north-1.jcloudcs.com/0a56e8bb-715c-4fcd-9c81-eed73ef5ef1b.png",
        "isShow": true,
        "width": 594,
        "height": 673
      }
    },
    moheAni: "",
    moheScaleStatus: "transform: scale(0,0);",
    showMoHe: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init(mhLimit) {
      var that = this;
      //获取头像
      wx.getStorage({
        key: 'userInfo',
        success(res) {
          let userInfo = that.data.userInfo;
          userInfo.avatarUrl = res.data.avatarUrl
          that.setData({
            userInfo
          })
        }
      })

      //每天第一次进入小程序，显示邀请弹层，2019年1月4日显示圣诞魔盒弹层
      const dating = '20190114';
      let oldDate = wx.getStorageSync('oldDate');
      let isShowMohe = wx.getStorageSync('isShowMohe');
      let moheData = this.data.moheData;
      //1546444800000    20190103的时间戳
      const d = new Date();
      let month = d.getMonth() + 1;
      let day = d.getDate();
      month = month < 10 ? ("0" + month) : month;
      day = day < 10 ? ("0" + day) : day;
      const nowDate = `${d.getFullYear()}${month}${day}`;

      if (this.data.money && !isShowMohe && (nowDate == dating)) {
        // 开启魔盒
        moheData["weiDaKai"].isShow = false;
        this.setData({
          moheData
        })
        this.setData({
          showMask2: false,
          moheData,
          moheAni: "animation: moheScale .3s ease-out;",
          moheScaleStatus: "transform: scale(1,1);",
          showMoHe: false,
          showBtn: true
        })
        wx.setStorage({
          key: "isShowMohe",
          data: true
        })
      } else if (!this.data.money && nowDate != oldDate) {
        if (nowDate == dating && isShowMohe) return;
        this.randomLayer();
        wx.setStorage({
          key: "oldDate",
          data: nowDate
        })
      }
    },

    //获取推荐人信息
    getTuiJianRenInfo() {
      var that = this;
      api.post('/user/member/queryFounderInfoVo').then(
        (res) => {
          if (res && res.code == 0) {
            that.setData({
              inviderInfo: res.data,
            })
          } else {
            console.log(res);
          }
        }
      )
    },
    //随机显示某个邀请对话
    randomLayer() {
      this.getTuiJianRenInfo();
      var that = this;
      let arr = [true, false];
      let i = Math.round(Math.random());
      this.setData({
        randomOne: arr[i]
      }, () => {
        that.showLayer();
      })
    },
    //展示邀请弹层
    showLayer() {
      var that = this;
      let layerData = this.data.layerData;
      this.setData({
        showMask2: false,
        showAni: false,
        showBtn: true
      })
      setTimeout(() => {
        layerData[0].marginLeft = '20rpx';
        layerData[1].marginLeft = '20rpx';
        that.setData({
          layerData
        })
      }, 500);
      setTimeout(() => {
        layerData[2].marginLeft = '20rpx';
        that.setData({
          layerData
        })
      }, 1000)
      setTimeout(() => {
        layerData[0].marginBottom = '30rpx';
        layerData[2].marginBottom = '30rpx';
        that.setData({
          layerData,
          showUpgrade: false
        })
      }, 2000)
    },
    //关闭邀请弹层
    closeLayer(e) {
      let layerData = [{
        'text': `Hi,快来加入${this.data.initConfig.buyerAppName}社员,邀请粉丝注册立享巨额佣金和购物返利！躺着也能赚到零花钱哦!`,
          'marginLeft': '-100%',
          'marginBottom': '330rpx'
        },
        {
          'text': '哈哈，还在为工资不够花发愁吗？',
          'marginLeft': '-100%',
          'marginBottom': '20rpx'
        },
        {
          'text': '邀请粉丝注册就能立享巨额佣金和购物返利！让你天天多赚一份工资哦!',
          'marginLeft': '-100%',
          'marginBottom': '330rpx'
        }
      ];
      this.setData({
        showMask2: true,
        showAni: true,
        showUpgrade: true,
        layerData,
        showBtn: false
      })
    },
    //点击底部虚拟导航按钮，唤起邀请弹层
    inviteLayer(e) {
      this.randomLayer();
      this.setData({
        showBtn: true
      })
    },

    //查询当前用户魔盒订单情况
    moheOrderInfo(settingMh, init) {
      var that = this;
      let money = null;
      let moheData = that.data.moheData;
      // 
      api.get('/order/sdmhFinishedStatus').then(
        (res) => {
          // moheData['weiDaKai'].isShow = true;
          if (res && res.code == 0) {
            money = res.data || null;
            // if (money < 1 && money > 0) {
            //   // 小于1元
            //   moheData["zhongJiang1"].isShow = false;
            // } else if (money > 1) {
            //   // 大于1元
            //   moheData["zhongJiang2"].isShow = false;
            // } else {
            //   moheData["weiZhongJiang"].isShow = false;
            // }
          } else {
            // moheData["weiZhongJiang"].isShow = false;
          }
          this.setData({
            moheData,
            money
          })
          settingMh.call(this, init);
        }
      )
    },
    //魔盒-立即打开
    moHeEv(e) {
      let moheData = this.data.moheData;
      let className = e.currentTarget.dataset.className;
      const {
        money
      } = this.data;
      if (className == "weiDaKai") {
        // this.moheOrderInfo(className);
        if (money < 1 && money > 0) {
          // 小于1元
          moheData["zhongJiang1"].isShow = false;
        } else if (money > 1) {
          // 大于1元
          moheData["zhongJiang2"].isShow = false;
        } else {
          moheData["weiZhongJiang"].isShow = false;
        }
        moheData["weiDaKai"].isShow = true;
        this.setData({
          moheData
        })
      } else if (className == "zhongJiang1" || className == "zhongJiang2") {
        moheData[className].isShow = true;
        moheData["lingHongBao"].isShow = false;
        api.post('/order/sdmhFinishedStatus', {
          flag: 'updateStatus'
        })
        this.setData({
          moheData
        })
      } else if (className == "weiZhongJiang") {
        wx.navigateTo({
          url: '/pages/productsdetails/productsdetails?itemId=44253&sellerId=15&promotionId=34662'
        })
      } else {
        return;
      }
    },
    //魔盒-关闭弹层
    closeMoHe(e) {
      let moheData = this.data.moheData;
      let className = e.currentTarget.dataset.className;
      if (className == "weiDaKai") {
        return;
      }
      moheData[className].isShow = true;
      this.setData({
        moheData,
        showMask2: true,
        showMoHe: true,
        showBtn: false
      })
    },
    /**
     * 复制微信号到粘贴板
     * */
    copyCode: function(e) {
      if (e.target.dataset.url != 'https://b2b-v2.oss.cn-north-1.jcloudcs.com/0a56e8bb-715c-4fcd-9c81-eed73ef5ef1b.png') return;
      // 粘贴板方法实现
      wx.setClipboardData({
        data: 'cool2008',
        success: function() {
          wx.showToast({
            title: '客服微信号：cool2008，已复制。长按保存图片',
            icon: 'none'
          })
        }
      });
    },
    /**
     * 保存图片
     * */
    saveImage: function(e) {
      if (e.target.dataset.url != 'https://b2b-v2.oss.cn-north-1.jcloudcs.com/0a56e8bb-715c-4fcd-9c81-eed73ef5ef1b.png') return;
      wx.getImageInfo({
        src: 'https://b2b-v2.oss.cn-north-1.jcloudcs.com/0a56e8bb-715c-4fcd-9c81-eed73ef5ef1b.png',
        success: function(rs) {
          wx.saveImageToPhotosAlbum({
            filePath: rs.path,
            success: function() {
              wx.showToast({
                title: '图片保存成功',
              })
            }
          })
        }
      })
    },
    /**
     * 魔盒设置
     * */
    settingMh: function(fn) {
      api.get('/order/checkSDMHSku').then(rs => {
        if (rs.code == 0) {
          fn.call(this, rs.data)
        }
      })
    },
    clearMH: function() {
      wx.setStorage({
        key: 'isShowMohe',
        data: false,
        success: function(e) {
          wx.showToast({
            title: '消除魔盒cookie成功',
          })
        }
      })
    }
  }
})