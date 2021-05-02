const Api = require("./api.js");
const cfg = require("./config.js");
const api = new Api();
var brandTxt = cfg.brandTxt;

/**
 * 该文件，维护项目中一些公共的工具类方法的封装
 * created by jingxl
 */

module.exports = {
  /**
   * 检查当前用户是否 VIP会员
   * _this:执行上下文的this对象
   * vipFlag: 执行结果返回后，赋值给上下文中指定的data
   * auth:jingxl
   */
  getIsVip: (_this, vipFlag) => {
    let that = _this;
    api.post("/user/checkUserIdentity").then((res) => {
      if (res.code == "0") {
        that.setData({
          [vipFlag]: res.data
        })
      }
    }, (res) => {
      console.error('查询会员出错！');
    }).catch((res) => {
      console.error('查询会员异常！');
    });
  },
  /**
   * CPS分享函数
   * fromDetails = true 是否是商详:从页面右上角转发的时候，是否使用该函数定义好的格式
   * isOnlyCps == '1' 仅cps商品，未导入到商品库，其他情况为导入到商品库
   */
  cpsShareLifeCicle(res, productBaseInfo, isVip, defaultPic, fromDetails, isOnlyCps) {
    var title = "";
    if (productBaseInfo.itemActivityFlag == '1') {
      title = "【" + brandTxt.jd + brandTxt.pt + "】￥";
    } else if (productBaseInfo.itemActivityFlag == '2') {
      title = "【" + brandTxt.jd + brandTxt.ms + "】￥";
    } else if (productBaseInfo.itemActivityFlag == '3') {
      title = "【" + brandTxt.jd + brandTxt.kj + "】￥";
    } else if (productBaseInfo.jdSelfSaleFlag == '1') {
      title = "【" + brandTxt.jd + brandTxt.zy + "】￥";
    } else {
      title = "【" + brandTxt.jd + "】￥";
    }
    title += (productBaseInfo.salePrice || 0).toFixed(2) + " | " + productBaseInfo.itemName;
    var img = productBaseInfo.annexUrl ? 'https:' + productBaseInfo.annexUrl : defaultPic;

    // 记录分享者
    let inviterUserId = wx.getStorageSync('userId');

    let path = '';

    if (isOnlyCps && isOnlyCps == '1'){
      path = '/pages/distributionGoodDetail/distributionGoodDetail?jdSkuId=' + productBaseInfo.jdSkuId + "&inviterUserId=" + inviterUserId +'&isOnlyCps=1';
    } else {
      // 导入库里
      let sellerId = productBaseInfo.sellerId || '';
      if (isVip) {
        // 是会员，分享出去的sellerId 为自己的userId，并且插入分销商品记录
        sellerId = wx.getStorageSync('userId');
        this.insertProduct(productBaseInfo);
      }
      
      path = '/pages/distributionGoodDetail/distributionGoodDetail?itemId=' + productBaseInfo.itemId + '&promotionId=' + productBaseInfo.promotionId + '&sellerId=' + sellerId + "&inviterUserId=" + inviterUserId;
      
      // 有shopId的商品必定是导入库的
      if (productBaseInfo.shopId) {
        path += '&shopId=' + productBaseInfo.shopId;
      }
    }

    if (fromDetails || res.from === 'button') {
      return {
        title: title,
        imageUrl: img,
        path: path,
        success: function(resp) {
          // 转发成功
          wx.showToast({
            title: '分享成功',
            icon: 'none'
          })
        },
        fail: function(resp) {
          // 转发失败
        }
      }
    }
  },

  /**
   * 有品自营分享函数 fromDetails商详
   * fromDetails = true 是否是商详:从页面右上角转发的时候，是否使用该函数定义好的格式
   */
  ypShareLifeCicle(res, productBaseInfo, isVip, defaultPic, saleTypeDesc, fromDetails) {
    var title = '';
    var salePrice = '';
    // 不同的活动，分享价格取值不同
    if (saleTypeDesc == "group") {
      title = "【" + brandTxt.mine1 + brandTxt.pt + "】";
      salePrice = productBaseInfo.groupBuyPrice;
    } else if (saleTypeDesc == "fanyong") {
      title = "【" + brandTxt.mine1 + "】";
      salePrice = productBaseInfo.salePrice;
    } else if (saleTypeDesc == "bargain") { //砍价
      title = "【" + brandTxt.mine1 + brandTxt.kj + "】";
      salePrice = productBaseInfo.reducePrice;
    }

    title += "￥" + salePrice.toFixed(2) + " | " + productBaseInfo.itemName;
    var img = productBaseInfo.annexUrl ? 'https:' + productBaseInfo.annexUrl : defaultPic;

    let sellerId = productBaseInfo.sellerId;

    // 记录分享者
    let inviterUserId = wx.getStorageSync('userId');

    if (saleTypeDesc == 'fanyong' && isVip) {
      sellerId = wx.getStorageSync('userId');
      this.insertProduct(productBaseInfo);
    }

    let path = '/pages/productsdetails/productsdetails?itemId=' + productBaseInfo.itemId + '&promotionId=' + productBaseInfo.promotionId + '&sellerId=' + sellerId + "&inviterUserId=" + inviterUserId;

    if (fromDetails || res.from === 'button') {
      return {
        title: title,
        imageUrl: img,
        path: path,
        success: function(resp) {
          // 转发成功
          wx.showToast({
            title: '分享成功',
            icon: 'none'
          })
        },
        fail: function(resp) {
          // 转发失败
        }
      }
    }
  },

  // 有品拼团分享函数 fromDetails活动页面
  ypGroupShareLifeCicle(res, productBaseInfo, isVip, defaultPic, fromDetails) {
    var title = "【" + brandTxt.mine1 + brandTxt.pt + "】";
    var salePrice = productBaseInfo.groupBuyPrice;;
    title += "￥" + salePrice.toFixed(2) + " | " + productBaseInfo.itemName;
    var img = productBaseInfo.annexUrl ? 'https:' + productBaseInfo.annexUrl : defaultPic;

    // 记录分享者
    let inviterUserId = wx.getStorageSync('userId');

    let path = 'pages/productsdetails/productGroupDetails/productGroupDetails?groupNo=' + productBaseInfo.groupNo + "&inviterUserId=" + inviterUserId;

    if (fromDetails || res.from === 'button') {
      return {
        title: title,
        imageUrl: img,
        path: path,
        success: function(resp) {
          // 转发成功
          wx.showToast({
            title: '分享成功',
            icon: 'none'
          })
        },
        fail: function(resp) {
          // 转发失败
        }
      }
    }
  },

  insertProduct(productBaseInfo) {
    var param = {
      itemId: productBaseInfo.itemId,
      promotionId: productBaseInfo.promotionId,
      fromSellerId: productBaseInfo.sellerId,
      isOnsale: true
    };
    api.post("/item/publish/distributeItem", param);
  },

  // 模板页面分享逻辑封装
  modulePageDoShare(res, shareObj) {
    let { currentShareType, currentShareItem, isVip, defaultPic } = shareObj;
    if (currentShareType == 'CPS') {
      return this.cpsShareLifeCicle(res, currentShareItem, isVip, defaultPic, false, currentShareItem.isOnlyCps);
    } else if (currentShareType == 'YP') {
      return this.ypShareLifeCicle(res, currentShareItem, isVip, defaultPic, 'fanyong');
    } else {
      console.error("未知的商品来源");
    }
  },


  /** 
   * 【需要写入storage中】加载项目的动态配置信息(e.g: 标题、logo等)
   * _this: 执行上下文
   * initConfig: 如果 Page 根据需要设置的data
   */
  loadInitConfig: function(_this, initConfig, appData) {
    let that = _this;
    api.post("/system/getSysConfigInfo", {
      groupId: 'SYSTEM'
    }).then(
      (res) => {
        if (res.code == '0') {
          let resultData = res.data.baseInfo;

          // 将字符串格式的 营业执照 转换为数组存储
          if (resultData.busiLicense) {
            resultData.busiLicense = resultData.busiLicense.split(',');
          }
          resultData.buyerLogo = 'https:' + resultData.buyerLogo;
          resultData.sellerLogo = 'https:' + resultData.sellerLogo;

          // 将数据存储到storage中
          wx.setStorageSync('init_config', resultData);

          // 设置 “短标题” 的值用于（列表左上角 商品徽标等）
          appData.brandTxt.mine1 = resultData.shortTitle;
          appData.brandTxt.p_mine = resultData.shortTitle + '价';
          wx.setStorageSync('brandTxt', appData.brandTxt);

          // 需要设置 page 中的data数据
          if (initConfig) {
            that.setData({
              [initConfig]: resultData
            });
          }

        } else {
          this.showErrMsg('加载配置失败');
        }
      }, res => {
        this.showErrMsg('加载配置错误');
      }).catch(err => {
      this.showErrMsg('加载配置异常');
    });
  },

  /** 
   * 【不写入storage】加载项目的动态配置信息(e.g: 标题、logo等)
   * _this: 执行上下文
   * initConfig: 如果 Page 根据需要设置的data
   */
  loadInitConfigNoStorage: function (_this, initConfig, callBackFunc) {
    api.post("/system/getSysConfigInfo", {
      groupId: 'SYSTEM'
    }).then(
      (res) => {
        if (res.code == '0') {
          let resultData = res.data.baseInfo;
          // 需要设置 page 中的data数据
          if (initConfig) {
            _this.setData({
              [initConfig]: resultData
            });
          }
          callBackFunc.call(_this, resultData);
        } else {
          this.showErrMsg('加载配置失败');
        }
      }, res => {
        this.showErrMsg('加载配置错误');
      }).catch(err => {
        this.showErrMsg('加载配置异常');
      });
  },

  /**
   * 获取后台配置AppId
   * _this: 执行上下文
   * initConfigAppId:如果 Page 根据需要设置的data
   */
  getAppId: function(_this, initConfigAppId) {
    let that = _this;
    api.post("/system/getSysConfigInfo", {
      groupId: 'MINI'
    }).then(
      (res) => {
        if (res.code == '0') {
          let resultData = res.data.baseInfo;

          // 需要设置 page 中的data数据
          if (initConfigAppId) {
            that.setData({
              [initConfigAppId]: resultData['jcb.appid']
            });
          }

          // 将数据存储到storage中
          wx.setStorageSync('init_seller_appid', resultData['jcb.appid']);

        } else {
          this.showErrMsg(res.msg || 'AppId未获取');
        }
      }, res => {
        this.showErrMsg('AppId未获取.');
      }).catch(err => {
      this.showErrMsg('appId未获取');
    });
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
   * 判断是否开店
   * */
  getShopInfo: function(_this,setDataKey) {
    var userId = wx.getStorageSync('userId');
    if (!userId){
      // 表示没有登录，不进行查询
      return false;
    }
    var hasShop = wx.getStorageSync('hasShop');
    if (hasShop.length == 0){
      // 在storage中取到值为空，查询接口
      api.get('/shop/getShopInfo').then(rs => {
        if (rs.code == 0) {
          if (rs.data){
            _this.setData({
              [setDataKey]: true
            });
            wx.setStorageSync('hasShop', true);
            wx.setStorageSync('shopId', rs.data.shopId);
            wx.setStorageSync('jdShopId', rs.data.jdShopId);
          } else {
            _this.setData({
              [setDataKey]: false
            });
            wx.setStorageSync('hasShop', false);
          }
        } else {
          this.showErrMsg('未获取店铺信息');
        }
      })
    } else {
      // 如果storage中能取到值不为空，则直接返回
      _this.setData({
        [setDataKey]: hasShop
      });
    }
  }, // end getShopInfo

  /**
   * 查询数据字典
   * _this 设置的上下文
   * setDataKey 要设置返回结果到data的名称
   * findKey 要查找的字典类型
   * */
  queryDic: function (_this, setDataKey, findKey, paramObj, callBack) {
    let url = {
      'bank': '/settlement/yishi/queryBankCodeDictionary', //银行列表
      'card': '/settlement/yishi/queryCertTypeDictionary', //证件列表
      'branchBank': '/bank/getBankInfoList', //联行查询银行列表
      'branchArea': '/bank/getBankCityList', //联行省、市查询
    }
    api.get(url[findKey], {
      // keyxxxx: findKey
    }).then(rs => {
      if (rs.code == '0') {
        callBack && callBack(_this, paramObj, rs.data);
        _this.setData({
          [setDataKey]: rs.data
        });
      } else {
        console.error('查询数据字典，错误！');
        _this.setData({
          [setDataKey]: []
        });
        this.showErrMsg('未获取字典信息');
      }
    })

  }, // end queryDic

  queryBranchDic: function (_this, setDataKey, findKey, paramObj, callBack) {
    let url = {
      'branchBank': '/bank/getBankInfoList', //联行查询银行列表
      'branchArea': '/bank/getBankCityList', //联行省、市查询
    }
    api.get(url[findKey], {
      ...paramObj
    }).then(rs => {
      if (rs.code == '0') {
        callBack && callBack(_this, paramObj, rs.data);
        _this.setData({
          [setDataKey]: rs.data
        });
      } else {
        console.error('查询数据字典，错误！');
        _this.setData({
          [setDataKey]: []
        });
        this.showErrMsg('未获取字典信息');
      }
    })

  }, // end queryBranchDic

  /**
   * 查询是否使用【益世】
   * */
  queryIfYiShiSettle: function(_this,setDataKey,callBack) {
    var cookie = wx.getStorageSync('cookie');
    if (!cookie) {
      // 表示没有登录，不进行查询
      return false;
    }

    api.get('/settlement/yishi/getYiShiSettlementConfig').then(rs => {
      if (rs.code == '0') {

        let useYS = rs.data == 1 ? '01' : '00';  //0:不使用 1：使用

        if (callBack) {
          callBack(_this, useYS); // 执行回调函数
        }
        

        _this.setData({
          [setDataKey]: useYS
        });
        wx.setStorageSync('useYS', useYS);
      } else {
        console.error('查询是否使用-益世，错误！');
        _this.setData({
          [setDataKey]: '00'
        });
        wx.setStorageSync('useYS', '00');
        this.showErrMsg('未获取益世信息');
      }
    })

  }, // end queryIfYiShiSettle

  /**
   * 查询【益世】提现认证信息
   * */
  queryYiShiAuthInfo: function (_this, setDataKey,paramObj,callBack) {
    var cookie = wx.getStorageSync('cookie');
    if (!cookie) {
      // 表示没有登录，不进行查询
      return false;
    }

    api.get('/settlement/yishi/queryYiShiUserCertification').then(res => {
      if (res.code == 0) {
        // 处理上传的图片，把 http: 去掉
        if(res.data) {
          let f_url = res.data.legalCardFrontUrl;
          let b_url = res.data.legalCardBackUrl;
          res.data.legalCardFrontUrl = f_url && f_url.replace('http:','');
          res.data.legalCardBackUrl = b_url && b_url.replace('http:','');
        }

        if (setDataKey) {
          _this.setData({
            [setDataKey]: res.data || {}, // 把返回结果存入指定的data中
          });
        }

        if (callBack) {
          callBack(_this,paramObj,res.data || {}); // 查询成功，执行回调func
        }

      } else {
        console.error('查询益世提现认证信息，错误！');
        this.showErrMsg('未获取益世提现认证');
      }
    })

  }, // end queryYiShiAuthInfo

  /**
     * 查询【益世】可提现金额
     * */
  query_YS_SettlementAmount: function (_this, settlementAmount) {
    var cookie = wx.getStorageSync('cookie');
    if (!cookie) {
      // 表示没有登录，不进行查询
      return false;
    }
    
    let that = this;
    api.get('/settlement/yishi/querySettlementAmountByYiShi').then((res) => {
      if (res.code == '0') {
        _this.setData({
          [settlementAmount]: res.data || "0.00"
        })
      } else {
        _this.setData({
          [settlementAmount]: "0.00"
        });
        that.showErrMsg('查询[益世]余额失败!');
      }
    }, (res) => {
      that.showErrMsg('查询[益世]余额失败');
      console.error("加载失败:", res);
    }).catch((res) => {
      that.showErrMsg('查询[益世]余额异常');
      console.error("加载异常:", res);
    })
  },

}