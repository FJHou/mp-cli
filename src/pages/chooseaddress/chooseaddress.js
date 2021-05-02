//var utils = require('../../utils/util.js');
import { request, reportErr } from "../../utils/util.js";
// var log = require('../../utils/keplerReport.js').init();
//获取应用实例
var app = getApp();
Page({
  data: {
    pDir: '/kwxp',
    scrollTop: 0,
    arrHeader: [],
    arrProvince: [],
    arrCity: [],
    arrArea: [],
    arrTown: [],
    arrDisplay: ['block', 'none', 'none', 'none'],
    windowWidth: 0,
    windowHeight: 0,
    multiOffset: 0,
    isIphoneX: app.globalData.isIphoneX,
    pvFlag: true
  },
  onLoad: function (options) {
    var that = this;
    //初始化地址数据
    request({
      url: app.globalRequestUrl + that.data.pDir + '/norder/selectProvince.action',
      success: function (backData) {
        if (backData) {
          that.setData({
            arrProvince: backData.addressList,
            scrollTop: Math.random() * 0.00001,
            arrHeader: [{
              "title": "请选择",
              "isCurrent": "current"
            }]
          });
        }
      },
      fail: function (e) {
        that.goErrorPage();
        reportErr(encodeURIComponent('四级地址选择首次数据onload请求request异常，具体信息：') + e.errMsg);
      }
    });

    //get system width
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight
        });

      }
    })


    //埋点上报设置
    //加密key和openid都是异步获取 ，所以setLogPv封装成一个promise 来同步数据
    // setLogPv({
    //   urlParam: options, //onLoad事件传入的url参数对象
    //   title: '地址选择', //网页标题
    //   pageId: 'WProductDetail_AddressFChoose',
    //   pageTitleErro: 'pages/chooseaddress/chooseaddress/地址选择'
    // }).then(function (data) {
    //   //   log.set(data);
    //   if (that.data.pvFlag) {
    //     that.data.pvFlag = false
    //     //   log.pv()
    //   }
    // })
  },
  // 跳转错误页
  goErrorPage: function () {
    // 如果请求失败，跳转错误页
    wx.redirectTo({
      url: '/pages/error/error?thisBarTitle=地址选择'
    })
  },
  onShow: function () {
    //this.data.pvFlag为true 上报pv
    if (!this.data.pvFlag) {
      //   log.pv()
    }
  },
  resetChoice: function (e) {
    var that = this;
    var arrHeader = that.data.arrHeader;
    var regionId = arrHeader[0].regionId;

    request({
      url: app.globalRequestUrl + that.data.pDir + '/norder/selectProvince.action',
      success: function (backData) {
        if (backData) {
          //设置之前选择后的默认选中样式
          var newArrAddress = that.setDefaultSeled(backData.addressList, regionId);
          that.setData({
            arrProvince: newArrAddress,
            scrollTop: Math.random() * 0.00001,
            arrHeader: [{
              "title": "请选择",
              "isCurrent": "current"
            }],
            multiOffset: 0,
            arrDisplay: ['block', 'none', 'none', 'none']
          });
        }
      },
      fail: function (e) {
        that.goErrorPage();
        reportErr(encodeURIComponent('四级地址选择resetChoice数据请求request异常，具体信息：') + e.errMsg);
      }
    });
  },
  setDefaultSeled: function (addressList, regionId) {

    addressList.forEach(function (item) {
      item.seled = '';
      if (regionId == item.id) {
        item.seled = 'seled';
      }
    });
    return addressList;
  },
  getSpecificList: function (e) {
    var that = this;
    var objTarget = e.currentTarget,
      iAddressType = parseInt(objTarget.dataset.regiontype),
      arrHeader = that.data.arrHeader,
      url = app.globalRequestUrl + that.data.pDir + '/norder/select' + that.getDistrictType(iAddressType) + '.action',
      curRegionId = arrHeader[iAddressType - 1].regionId;
    //去除不需要的head title
    while (arrHeader.length > iAddressType) {
      arrHeader.pop();
    }
    arrHeader[arrHeader.length - 1].isCurrent = "current";
    if (iAddressType > 1) {
      url += '?id' + that.getDistrictType(iAddressType - 1) + '=' + arrHeader[iAddressType - 2].regionId;
    }

    request({
      url: url,
      success: function (data) {
        //设置之前选择后的默认选中样式
        var newArrAddress = that.setDefaultSeled(data.addressList, curRegionId);
        //set new address list
        var tempObj = {};
        tempObj['arr' + that.getDistrictType(iAddressType)] = newArrAddress;
        tempObj.multiOffset = (1 - iAddressType);
        tempObj.arrDisplay = ['none', 'none', 'none', 'none'];
        tempObj.arrDisplay[iAddressType - 1] = 'block';
        tempObj.arrHeader = arrHeader;
        tempObj.scrollTop = Math.random() * 0.00001,
          that.setData(tempObj);
      },
      fail: function (e) {
        reportErr(encodeURIComponent('四级地址选择getSpecificList数据请求request异常，具体信息：') + e.errMsg);
      }
    });
  },
  dealWithList: function (e) {
    var that = this;
    var oContainer = e.currentTarget,
      objCur = e.target,
      iRegionType = parseInt(oContainer.dataset.type),
      strRegionId = objCur.dataset.id,
      strRegionName = objCur.dataset.val;
    // var  currentIdx = objCur.dataset.index;
    // // 当前被点击的address list
    // var currentAddressList = that.data['arr' + that.getDistrictType(iRegionType)];
    // currentAddressList[currentIdx].seled = 'seled';
    //iRegionType:1-> province;2->city; 3->area; 4->town;
    var url = app.globalRequestUrl + that.data.pDir + '/norder/select' + that.getDistrictType(iRegionType + 1) + '.action?id' + that.getDistrictType(iRegionType) + '=' + objCur.dataset.id;
    if (iRegionType >= 4) {
      that.closeAddress(iRegionType, strRegionName, strRegionId);
      //   log.click({
      //     "eid": 'WProductDetail_AddressFChooseF',
      //     "elevel": '',
      //     "eparam": '',
      //     "pname": "",
      //     "pparam": '',
      //     "target": '', //选填，点击事件目标链接，凡是能取到链接的都要上报
      //     "event": e //必填，点击事件event
      //   });
      return false;
    }
    request({
      url: url,
      success: function (data) {
        if (data) {
          if (data.addressList.length) {
            //save user's choice into arrHeader arr right now
            var arrHeader = that.data.arrHeader;
            arrHeader[iRegionType - 1].title = strRegionName,
              arrHeader[iRegionType - 1].regionId = strRegionId,
              arrHeader[iRegionType - 1].isCurrent = '';
            var lastHeader = arrHeader[arrHeader.length - 1];
            if (lastHeader.title != '请选择') {
              arrHeader.push({
                "title": "请选择",
                "isCurrent": "current"
              });
            }
            //set new address list
            var tempObj = {};
            tempObj['arr' + that.getDistrictType(iRegionType + 1)] = data.addressList;
            tempObj.multiOffset = -(iRegionType);
            tempObj.arrDisplay = ['none', 'none', 'none', 'none'];
            tempObj.arrDisplay[iRegionType] = 'block';
            tempObj.arrHeader = arrHeader;
            tempObj.scrollTop = Math.random() * 0.00001;
            that.setData(tempObj);
          } else {
            that.closeAddress(iRegionType, strRegionName, strRegionId);
          }
        }
      },
      fail: function (e) {
        reportErr(encodeURIComponent('四级地址选择dealWithList数据请求request异常，具体信息：') + e.errMsg);
      }
    });
    let eventIdObj = ['WProductDetail_AddressFChooseO', 'WProductDetail_AddressFChooseS', 'WProductDetail_AddressFChooseT']
    // log.click({
    //   "eid": eventIdObj[iRegionType - 1],
    //   "elevel": '',
    //   "eparam": '',
    //   "pname": "",
    //   "pparam": "",
    //   "target": '', //选填，点击事件目标链接，凡是能取到链接的都要上报
    //   "event": e //必填，点击事件event
    // });
  },
  closeAddress: function (iRegionType, strRegionName, strRegionId) {
    var arrHeader = this.data.arrHeader;
    arrHeader[iRegionType - 1].title = strRegionName;
    arrHeader[iRegionType - 1].regionId = strRegionId;
    arrHeader[iRegionType - 1].isCurrent = '';
    this.setData({
      arrHeader: arrHeader
    });
    let regionIdStr = ''
    //拼接四级地址id
    for (let i = 0; i < this.data.arrHeader.length; i++) {
      regionIdStr = regionIdStr + this.data.arrHeader[i].regionId;
      if (i < this.data.arrHeader.length - 1) {
        regionIdStr = regionIdStr + ',';
      }
    }
    //当用户手动选择4级地址的时候，清空缓存中的收货地址及id
    let sitesAddressObj = {
      regionIdStr: encodeURIComponent(regionIdStr),
      addressId: 0,
      fullAddress: ''
    }
    wx.setStorageSync('sitesAddress', sitesAddressObj);
    wx.navigateBack();
  },
  toGenerateDisplayAddress: function () {
    var that = this;
    var arrayHeader = that.data.arrHeader;
    var typeAccount = arrayHeader.length;
    var tempInteger = typeAccount - 2;
    var lastAddressId = arrayHeader[tempInteger].regionId;
    var curRegionId = arrayHeader[typeAccount - 1].regionId;
    var url = app.globalRequestUrl + that.data.pDir + '/norder/select' + that.getDistrictType(typeAccount) + '.action?id' + that.getDistrictType(typeAccount - 1) + '=' + lastAddressId;

    request({
      url: url,
      success: function (backData) {
        if (backData) {
          //设置之前选择后的默认选中样式
          var newArrAddress = that.setDefaultSeled(backData.addressList, curRegionId);
          var objTemp = {};
          objTemp['arr' + that.getDistrictType(typeAccount)] = newArrAddress;
          objTemp.multiOffset = (1 - typeAccount);
          objTemp.arrDisplay = ['none', 'none', 'none', 'none'];
          objTemp.arrDisplay[typeAccount - 1] = 'block';
          objTemp.scrollTop = Math.random() * 0.00001;
          that.setData(objTemp);
        }
      },
      fail: function (e) {
        reportErr(encodeURIComponent('四级地址选择toGenerateDisplayAddress数据请求request异常，具体信息：') + e.errMsg);
      }
    });
  },
  getDistrictType: function (type) {
    switch (type) {
      case 1:
        return 'Province';
      case 2:
        return 'City';
      case 3:
        return 'Area';
      case 4:
        return 'Town';
      default:
        return '';
    }
  },
  onHide: function () {
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    // log.pageUnload()
  },
  onUnload: function () {
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    //   log.pageUnload()
  }
})
