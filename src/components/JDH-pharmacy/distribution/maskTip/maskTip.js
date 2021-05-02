// components/shopUpdateModal.js
const Api = require("../../../../utils/JDH-pharmacy/api");
// const Common = require("../../../../utils/JDH-pharmacy/common.js");
const api = new Api();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },
  ready: function (opt) {
    // this.getMemberInfo();
  },
  /**
   * 组件的初始数据
   */
  data: {
    showOpenShopMsg:false,
    isVip:true,
    useYS: '01', // 01：使用益世  00:不使用
  },
  pageLifetimes:{
    hide: function () {
    },
    show:function(){
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    closeShopMsg: function (e) {
      this.setData({
        showOpenShopMsg: false
      });

     // 会员 + 用益世, 把 “已经点击了” 的操作，调用接口传递给后台保存
      this.doSaveOpt();
    },
    doSaveOpt:function(){
      api.get('/yishi/saveYiShiUserMessage').then((res) => {
        if (res.code == '0' && !!res.data) {
          // 保存成功
          console.log("弹框-保存成功");
        } else {
          console.error('把 “已经点击了” 的操作，调用接口传递给后台失败');
        }
      }, (res) => {
        console.error("保存 “已经点击了” 的操作失败:", res);
      }).catch((res) => {
        console.error("保存 “已经点击了” 的操作异常:", res);
      })
    },
    goAuth:function(){
      this.doSaveOpt();
      wx.redirectTo({
        url: '/subExtractMain/pages/extractMoney/extractMoneyView/extractMoneyView'
      });
    },

    // getMemberInfo: function () {
    //   // 判断 【1.会员身份--> 2.是否已经点击了】 的操作，若已点击则不再进行显示
    //     // 查询是否使用-[益世]
    //     Common.queryIfYiShiSettle(this, 'useYS',(_this,resData) => {
    //       if (resData != '01') {
    //         console.warn("不使用益世:", resData)
    //         return false;
    //       }
    //       let that = _this;
    //       api.get('/yishi/judgeYiShiUserMessage').then((res) => {
    //         if (res.code == '0' && !!res.data) {
    //           that.setData({ showOpenShopMsg: true }); // 弹出
    //         } else {
    //           that.setData({ showOpenShopMsg: false });
    //         }
    //       }, (res) => {
    //         console.error("查询，是否已经弹出过失败:", res);
    //       }).catch((res) => {
    //         console.error("查询，是否已经弹出过异常:", res);
    //       })
    //   }); // end queryIfYiShiSettle

    // },

  }
})
