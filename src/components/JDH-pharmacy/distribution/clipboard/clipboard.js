import Api from "../../../../utils/JDH-pharmacy/api";
const api = new Api();
//获取应用实例
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    input: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    obj: {
      title: '',
      content: '',
      confirmText: '确定',
      isText: true,
      confirmColor: '#F10216'
    },
    // brandTxt: app.data.brandTxt.mine1,
    copyShow: false,
  },
  /**
   * 初始化生命周期
   * */
  ready: function () {
    const { input } = this.data;
    const cookie = wx.getStorageSync('cookie');
    if (!input && cookie) {
      this.getClip();
    }

    let placeHolderTxt = '请输入待转链接文本';
    let initConfig = wx.getStorageSync('init_config');
    if (initConfig['default.text'] && JSON.parse(initConfig['default.text']).link) {
      placeHolderTxt = JSON.parse(initConfig['default.text']).link;
    }
    this.setData({
      initConfig,
      'navbarData.title': initConfig.buyerAppName || '',
      placeHolderTxt
    });

    //获取配置信息
    // api.get("/system/getSysConfigInfo", {
    //   groupId: 'SYSTEM'
    // }).then((res) => {
    //   if (res.code == '0') {
    //     var initConfig = res.data.baseInfo;
    //     let placeHolderTxt = '请输入待转链接文本';
    //     if (initConfig['default.text'] && JSON.parse(initConfig['default.text']).link) {
    //       placeHolderTxt = JSON.parse(initConfig['default.text']).link;
    //     }
    //     this.setData({
    //       initConfig,
    //       'navbarData.title': initConfig.buyerAppName || '',
    //       placeHolderTxt
    //     });
    //   }
    // });
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 获取粘贴板信息
     * */
    getClip: function () {
      // modal弹框参数
      const { obj } = this.data;
      wx.getClipboardData({
        success: (res) => {
          const _data = res.data;
          if (wx.getStorageSync('clipboard') == _data) {
            return;
          }
          // 将剪贴板内容缓存到storage
          wx.setStorageSync('clipboard', _data);
          if (/\S/.test(_data)) {
            const reg = /(http:|https:)/;
            if (reg.test(_data)) {
              // url
              obj.title = '识别到以下链接';
              obj.confirmText = '立即转链';
              obj.content = _data;
              obj.isText = false;
            } else {
              // 文本
              obj.title = '是否搜索以下商品';
              obj.confirmText = '搜索商品';
              obj.isText = true;
              obj.content = _data;
            }
            this.showModal(obj);
          }
        }
      })
    },
    /**
     * 弹框
     * */
    showModal: function (obj) {
      wx.showModal({
        title: obj.title,
        content: obj.content,
        confirmText: obj.confirmText,
        confirmColor: obj.confirmColor,
        success: (res) => {
          if (res.confirm) {
            if (obj.isText) {
              // 搜索
              this.toSearch(obj.content);
            } else {
              // 转链
              this.getConverseShortUrl(obj.content);
            }
          } else if (res.cancel) {
            // 取消操作回调
          }
        }
      })
    },
    /**
     * 搜索
     * */
    toSearch: function (str) {
      wx.navigateTo({
        url: '/pages/searchList/searchList?keyword=' + str,
        // success:()=>{
        //   // 清空剪贴板
        //   wx.setClipboardData({
        //     data: '',
        //     success() {
        //       wx.hideToast();   // 隐藏提示
        //     }
        //   })
        // }
      })
    },
    /**
     * 转链成功显示
     * */
    conversionUrl: function (url,qun) {
      wx.showModal({
        title: '转链成功',
        content: url,
        confirmText: '复制',
        confirmColor: '#F10216',
        success: (res) => {
          if (res.confirm) {
            // 复制
            // if(qun){
            // api.get('/item/cpsGoods/ForRobotAssociation', { spreadText: url }).then(rs => {
            //   })
            // }
            this.setClip(url);
          } else if (res.cancel) {
            // 取消操作回调
          }
        }
      })
    },
    /**
     * 转链失败显示
     * */
    conversionUrlFail: function (msg) {
      wx.showModal({
        title: '转链失败',
        content: '请尝试其它链接！',
        showCancel: false,
        confirmText: '关闭',
        confirmColor: '#F10216',
        // success: (res) => {
        //   if (res.confirm) {
        //     // 确定操作回调
        //   } else if (res.cancel) {
        //     // 取消操作回调
        //   }
        // }
      })
    },
    /**
     * 复制到粘贴板
     * */
    setClip: function (url) {
      var that = this;
      wx.setClipboardData({
        data: url,
        success(res) {
          wx.getClipboardData({
            success(res) {
              // 复制成功回调
              wx.hideToast(); //隐藏复制成功的弹窗提示
              that.showCopySuccess();
              setTimeout(
                () => {
                  that.hideCopySuccess()
                },
                2000
              )
            }
          })
        }
      })
    },
    /**
     * 复制成功弹窗
    */
    showCopySuccess: function () {
      this.setData({ copyShow: true })
    },
    hideCopySuccess: function () {
      this.setData({ copyShow: false })
    },

    /**
     * 获取文本域内容
     * */
    inputTextarea: function (opt) {
      const { value } = opt.detail;
      this.setData({
        val: value
      })
    },
    /**
     * 清空文本域
     * */
    clearTextarea: function () {
      this.setData({ val: '' })
    },
    /**
     * 转链
     * */
    getConverseShortUrl: function (url) {
      const { val } = this.data;
      if (!val && !url) return;
      const _url = val ? val : url;
      // URL过滤
      if (!/(http:|https:)/.test(_url)) {
        wx.showToast({
          title: '请输入带有http或https的有效地址',
          icon: 'none'
        })
        return;
      }
      const params = {};
      params.spreadText = _url;
      params.subUnionId = `${wx.getStorageSync('userId')}_${wx.getStorageSync('userId')}`;
      api.get('/item/cpsGoods/getConverseShortUrl', params).then(rs1 => {
        if (rs1.code == 0) {
          this.conversionUrl(rs1.data);
        } else {
          this.conversionUrlFail(rs1.msg);
        }
        // api.get('/shop/room/queryRoomsByUser').then(rs2 => {
        //   if (rs2.data == []) {
        //     if (rs1.code == 0) {
        //       this.conversionUrl(rs1.data);
        //     } else {
        //       this.conversionUrlFail(rs1.msg);
        //     }
        //   } else {
        //     if (rs1.code == 0) {
        //       console.log("dadadadadad", rs1, rs2)
        //       this.conversionUrl(rs1.data,'youqun');
        //     } else {
        //       this.conversionUrlFail(rs1.msg);
        //     }
        //   }
        // })

      })
    },

  }
})
