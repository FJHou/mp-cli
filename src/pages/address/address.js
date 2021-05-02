import { request, reportErr, promiseRequest, jsencryptCode } from '../../utils/util.js'
import { getAddressById, deleteAddressById, addAddressById, updateAddressById } from '../../api/index'
import { ADDRESS_ORDER_PUBLIC_KEY } from '../../utils/jsencrypt';

// var log = require('../../libs/keplerReport.js').init();
// var messagePush = require('../../utils/message_push.js');
// import toast from '../../components/toast/toast.js';
//获取应用实例
var app = getApp()
Page({
  data: {
    pDir: '/kwxp',
    arrProvince: [],
    arrCity: [],
    arrArea: [],
    arrTown: [],
    arrSelected: [],
    addressResult: [],
    // strSeledAddress: '',
    defaultFlag: 0,
    addressType: '',
    myOldMobile: '',
    address: {
      id: '',
      name: '',
      where: '',
      mobile: '',
      provinceNameIgnore: '',
      cityNameIgnore: '',
      areaNameIgnore: '',
      townNameIngore: '',
      idProvince: 0,
      idCity: 0,
      idTown: 0,
      idArea: 0,
      oldMobile: ''
    },
    wxAddressFlag: false,
    wxAddress: {
      wxCityName: '',
      wxAreaName: '',
      wxAreaNameHint: false,
      wxTownNameHint: false
    },
    arrDisable: [false, true, true, true],
    isHasTown: false,
    addressIndex: 1,
    requestCacheObj: {},
    addressSaving: false,//用户是否正在保存地址的标识，防止多次保存生成多个相同地址
    pvFlag: true,
    userTel: '',
  },
  onLoad: function (options) {
    let isGlobalPayment = options.isGlobalPayment === "true";
    this.setData({ isGlobalPayment });
    var that = this;
    that.setData({
      addressType: options.addressType ? options.addressType : ''
    })
    this.data.provinceId = options.provinceId ? options.provinceId : '',
      this.data.cityId = options.cityId ? options.cityId : '',
      this.data.areaId = options.areaId ? options.areaId : '',
      this.data.townId = options.townId ? options.townId : ''
    //新建地址
    if (options.addressType && options.addressType == 'add') {
      wx.setNavigationBarTitle({ title: '新建收货地址' });
      //新建地址的时候需要提前加载省份的地址数据，不然来不及给picker里面的range赋值
      request({
        url: app.globalRequestUrl + that.data.pDir + '/norder/selectProvince.action',
        success: function (backData) {
          if (backData) {
            let list = backData.addressList.filter((item) => {
              return item.name !== '海外'
            })
            that.setData({
              arrProvince: list
            });
            if (options.isWxAddress) { //微信导入地址
              that.setData({
                wxAddressFlag: true
              })
              that.getWqAddress();
            }
          }
        },
        fail: function (e) {
          reportErr(encodeURIComponent('新建地址，四级地址选择首次数据onload请求省份地址数据异常，具体信息：') + e.errMsg);
        }
      });
    } else if (options.addressType && options.addressType == 'addEdit') {//缓存中的全站地址与用户已有的收货地址不匹配，需要新建地址的情况
      wx.setNavigationBarTitle({ title: '新建收货地址' });
      //将路径后的全站地址做处理
      this.data.arrSelected.push({ regionId: this.data.provinceId });
      this.data.address.idProvince = this.data.provinceId;
      this.data.arrSelected.push({ regionId: this.data.cityId });
      this.data.address.idCity = this.data.cityId;
      this.data.arrSelected.push({ regionId: this.data.areaId });
      this.data.address.idArea = this.data.areaId;
      if (this.data.townId) {
        this.data.arrSelected.push({ regionId: this.data.townId });
        this.data.address.idTown = this.data.townId;
      }
      this.editAddressRequest();
    } else {//编辑地址
      wx.setNavigationBarTitle({ title: '编辑收货地址' });
      this.getAddressById(options.addressId)
      // request({
      //   url: app.globalRequestUrl + that.data.pDir + '/norder/editAddress.json?addressId=' + options.addressId + '&defaultFlag=0',
      //   success: function (data) {
      //     if (data.isEncrypt == '1') {
      //       data.address.addressDetail = decryptBy3DES(data.address.addressDetail)
      //       data.address.identityCard = decryptBy3DES(data.address.identityCard)
      //       data.address.name = decryptBy3DES(data.address.name)
      //       data.address.pin = decryptBy3DES(data.address.pin)
      //       data.address.where = decryptBy3DES(data.address.where)
      //     }
      //     var arrResult = that.assembleFourLevel(data.address);
      //     console.log(data.address);
      //     that.setData({
      //       address: data.address,
      //       userTel: data.address.mobile,
      //       myOldMobile: data.address.mobile,
      //       arrSelected: arrResult.address
      //     });
      //     that.editAddressRequest();
      //   },
      //   fail: function (e) {
      //     reportErr(encodeURIComponent("结算页编辑地址页首屏数据请求失败：") + e.errMsg);
      //   }
      // });
    }
    that.setData({
      defaultFlag: options.defaultFlag ? options.defaultFlag : 0
    });

    //埋点上报设置
    // let pagePV = {};
    // if (options.addressType && (options.addressType == 'add' || options.addressType == 'addEdit')) {
    //   pagePV.title = "新键收货地址"
    //   pagePV.pageName = 'WDrugstore_NewReceivingAddressPage'
    // } else {
    //   pagePV.title = "编辑收货地址"
    //   pagePV.pageName = 'WDrugstore_EditReceivingAddressPage'
    // }
    //加密key和openid都是异步获取 ，所以setLogPv封装成一个promise 来同步数据
    // utils.setLogPv({
    //   urlParam: options, //onLoad事件传入的url参数对象
    //   title: pagePV.title, //网页标题
    //   pageId: pagePV.pageName,
    //   pageTitleErro: 'pages/address/address/' + pagePV.title,
    // }).then(function (data) {
    //   that.logPvData = data
    //   app.log.set(that.logPvData);
    //   if (that.data.pvFlag) {
    //     that.data.pvFlag = false
    //     app.log.pv()
    //   }
    // })
  },
  getFormData() {
    const address = this.data.address

    return {
      name: address.name,
      mobile: jsencryptCode(address.mobile, ADDRESS_ORDER_PUBLIC_KEY), // 手机号需要加密
      addressDetail: address.where,
      provinceId: address.idProvince,
      cityId: address.idCity,
      countyId: address.idArea,
      townId: address.idTown,
      addressId: address.id,
    }
  },

  addAddressById() {
    const params = this.getFormData()

    addAddressById(params).then(res => {
      if (res.success) {
        wx.navigateBack();
      }
    })
  },

  /**
   * 更新地址
   */
  updateAddressById() {
    const params = this.getFormData()

    updateAddressById(params).then(res => {
      if (res.success) {
        wx.navigateBack();
      }
    })
  },
  /**
   * 根据地址id查询地址详情
   * @param {number} addressId 
   */
  getAddressById(addressId) {
    getAddressById(addressId).then(res => {
      if (res.success) {
        const data = res.data
        const { address: arrSelected } = this.assembleFourLevel(data);

        const address = {
          id: data.id,
          name: data.name,
          where: data.addressDetail,
          mobile: data.mobile,
          provinceNameIgnore: data.provinceName,
          cityNameIgnore: data.cityName,
          areaNameIgnore: data.countyName,
          townNameIngore: data.townName,
          idProvince: data.provinceId,
          idCity: data.cityId,
          idTown: data.townId,
          idArea: data.countyId,
          oldMobile: data.mobile
        }
        this.setData({
          address,
          userTel: data.mobile,
          myOldMobile: data.mobile,
          arrSelected
        });
        this.editAddressRequest();
      }
    })
  },

  telephoneFocus: function (e) {
    let that = this;
    that.setData({
      userTel: ''
    })
    this.data.address.mobile = '';
  },
  //埋点方法调用
  // pingClick: function (eid, elevel, eparam, target, event) {
  //   var that = this;
  //   log.click({
  //     "eid": eid,
  //     "elevel": elevel,
  //     "eparam": eparam,
  //     "pname": "收货地址",
  //     "pparam": "",
  //     "target": target, //选填，点击事件目标链接，凡是能取到链接的都要上报
  //     "event": event //必填，点击事件event
  //   });
  // },
  //获取地址等级
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
  //获取每级地址数据的请求地址
  getRequestUrl: function (index) {
    let objRtn = {};
    let arraySelected = this.data.arrSelected;
    objRtn.curRegionId = arraySelected[index - 1] && arraySelected[index - 1].regionId;
    if (index > 1) {
      var lastAddressId = arraySelected[index - 2] && arraySelected[index - 2].regionId;
      objRtn.url = app.globalRequestUrl + this.data.pDir + '/norder/select' + this.getDistrictType(index) + '.action?id' + this.getDistrictType(index - 1) + '=' + lastAddressId;
    } else {
      objRtn.url = app.globalRequestUrl + this.data.pDir + '/norder/select' + this.getDistrictType(index) + '.action';
    }
    return objRtn;
  },
  //串行请求中的数据处理，以及发起下一级请求
  requestDataHandle: function (data) {
    var that = this;
    var index = this.data.addressIndex;
    var addressLevelNum = this.data.arrSelected.length;
    var seledIndex = this.getSeledIndex(data.addressList, this.data.requestCacheObj.curRegionId);
    var objTemp = {};
    objTemp['arr' + this.getDistrictType(index)] = data.addressList;
    objTemp[this.getDistrictType(index).toLowerCase() + 'Index'] = seledIndex;
    if (index < addressLevelNum) {
      index++;
    }
    objTemp.addressIndex = index;
    objTemp.requestCacheObj = this.getRequestUrl(index);
    this.setData(objTemp);
    if (index <= addressLevelNum) {
      return promiseRequest({
        url: that.data.requestCacheObj.url
      })
    }
  },
  //串行请求每一级的地址信息
  editAddressRequest: function () {
    var that = this;
    var addressLevelNum = this.data.arrSelected.length;
    let objData = {};
    objData.requestCacheObj = this.getRequestUrl(this.data.addressIndex);
    objData.arrDisable = [false, false, false, false];
    if (addressLevelNum == 4) {
      objData.isHasTown = true;
    }
    that.setData(objData);
    promiseRequest({
      url: that.data.requestCacheObj.url
    }).then(data => {
      data.addressList = data.addressList.filter((item) => {
        return item.name !== "海外"
      })
      return that.requestDataHandle(data);
    }).then(data => {
      return that.requestDataHandle(data);
    }).then(data => {
      return that.requestDataHandle(data);
    }).then(data => {
      return that.requestDataHandle(data);
    }).catch(error => {
      reportErr(encodeURIComponent('四级地址选择editAddressRequest串行数据请求request异常，具体信息：') + error.errMsg)
    });
  },
  //获取匹配的下标
  getSeledIndex: function (addressList, regionId) {
    var seledIndex;
    addressList.forEach(function (item, index) {
      if (regionId == item.id) {
        seledIndex = index;
      }
    });
    return seledIndex;
  },
  //picker变化处理函数
  changeAddress: function (e) {
    var iRegionType = parseInt(e.currentTarget.dataset.type);
    var tempObj = {};
    tempObj[this.getDistrictType(iRegionType).toLowerCase() + 'Index'] = e.detail.value;
    tempObj.address = this.data.address;
    tempObj.address['id' + this.getDistrictType(iRegionType)] = this.data['arr' + this.getDistrictType(iRegionType)][e.detail.value].id;
    this.resetChoice(e, iRegionType);
    this.setData(tempObj);
    this.dealWithList(e, iRegionType);

    //微信地址导入第三级或者第四级地址埋点，如果还改第一第二第三地址，就不用再统计了
    if (iRegionType == 3 && this.data.wxAddressFlag) {
      this.setData({
        wxAreaNameHint: true
      })
      // if (!this.data.wxAddress.wxAreaName) {
      //   log.click({
      //     "eid": "WOrder_FillAddressSelect",
      //     "elevel": "",
      //     "ename": "",
      //     "eparam": "",
      //     "pageId": 'WOrder',
      //     "target": '../address/address',
      //     "event": '',
      //   });
      // }
      // else {
      //   this.setData({
      //     wxAddressFlag: false
      //   })
      // }

      this.setData({
        wxAddressFlag: false
      })
    }
    else if (iRegionType == 4 && this.data.wxAddressFlag) {
      this.setData({
        wxTownNameHint: true
      })

      // log.click({
      //   "eid": "WOrder_FillAddressSelect",
      //   "elevel": "",
      //   "ename": "",
      //   "eparam": "",
      //   "pageId": 'WOrder',
      //   "target": '../address/address',
      //   "event": '',
      // });
    }
    // if(this.data.addressType=='add'){
    //    if(e.currentTarget.dataset.type==1){
    //       this.pingClick("Worder_AddressCreateProvince", "", "", "", e);
    //     }else if(e.currentTarget.dataset.type==2){
    //       this.pingClick("Worder_AddressCreateCity", "", "", "", e);
    //     }else if(e.currentTarget.dataset.type==3){
    //       this.pingClick("Worder_AddressCreateArea", "", "", "", e);
    //     }else if(e.currentTarget.dataset.type==4){
    //       this.pingClick("Worder_AddressCreateCountry", "", "", "", e);
    //     }
    // }else{
    //    if(e.currentTarget.dataset.type==1){
    //       this.pingClick("Worder_AddressEditProvince", "", "", "", e);
    //     }else if(e.currentTarget.dataset.type==2){
    //       this.pingClick("Worder_AddressEditCity", "", "", "", e);
    //     }else if(e.currentTarget.dataset.type==3){
    //       this.pingClick("Worder_AddressEditArea", "", "", "", e);
    //     }else if(e.currentTarget.dataset.type==4){
    //       this.pingClick("Worder_AddressEditCountry", "", "", "", e);
    //     }
    // }
  },
  //地址筛选时发起下一级地址数据的请求函数
  dealWithList: function (e, index, wxAddressId) {
    var that = this;
    var seledId = '';
    if (wxAddressId) {
      seledId = wxAddressId;
    }
    else {
      seledId = that.data['arr' + that.getDistrictType(index)][e.detail.value].id;

    }
    var url = app.globalRequestUrl + that.data.pDir + '/norder/select' + that.getDistrictType(index + 1) + '.action?id' + that.getDistrictType(index) + '=' + seledId;
    request({
      url: url,
      success: function (backData) {
        if (backData && backData.addressList && (backData.addressList instanceof Array) && backData.addressList.length > 0) {
          var tempObj = {};
          tempObj['arr' + that.getDistrictType(index + 1)] = backData.addressList;
          tempObj.arrDisable = that.data.arrDisable;
          tempObj.arrDisable[index] = false;
          if (index + 1 >= 4) {
            tempObj.isHasTown = true;
          }
          that.setData(tempObj);
        }
      },
      fail: function (e) {
        reportErr(encodeURIComponent('四级地址选择dealWithList数据请求request异常，具体信息：') + e.errMsg);
      }
    });
  },
  // editPageSaveFunc:function(e){
  // this.pingClick("WDrugstore_EditAddress", "", "", "", e);
  // },
  //通过微信地址的nationalCode字段请求WQ的接口来映射京东的四级地址ID
  getWqAddress: function (e) {
    var that = this;
    var url = '';
    let wxAddressData = wx.getStorageSync('wxRequestData') ? wx.getStorageSync('wxRequestData') : '';
    let wxNationalCode = '';
    //440105||110101
    if (wxAddressData) {
      wxNationalCode = wxAddressData.nationalCode ? wxAddressData.nationalCode : '';
      //wxNationalCode = '210102';
      url = app.globalRequestUrl + '/wqdeal/deal/recvaddr/GetJd3LAddr?sceneval=2&rgid=' + wxNationalCode + '&callback=getAddressId&callersource=miniapp';
      that.setData({
        'address.name': wxAddressData.userName,
        'address.mobile': wxAddressData.telNumber,
      })
      if (that.data.areaIndex == null) {
        that.setData({
          isHasTown: false
        })
      }
      else {
        that.setData({
          isHasTown: true
        })
      }
      let reg = /\{(.+)\}/g; //jsonp接口返回的是function
      request({
        url: url,
        success: function (jsonpData) {
          let wqAddressData = jsonpData ? jsonpData : '';
          let wqAddressJson = JSON.parse(wqAddressData.match(reg)[0]);
          // console.log(wqAddressJson)
          // console.log('这是微信地址')
          that.setData({
            provinceIndex: wqAddressJson.info.provinceId - 1,
            'address.idProvince': wqAddressJson.info.provinceId,
            'address.idCity': wqAddressJson.info.cityId,
            'address.idArea': wqAddressJson.info.countyId,
            'wxAddress.wxCityName': wqAddressJson.info.cityName,
            'wxAddress.wxAreaName': wqAddressJson.info.countyName,
            'address.where': wxAddressData.detailInfo
          })
          that.dealWithList('', 1, wqAddressJson.info.provinceId);
          that.dealWithList('', 2, wqAddressJson.info.cityId);
          that.dealWithList('', 3, wqAddressJson.info.countyId);
        },
        fail: (e) => {
          reportErr(encodeURIComponent('通过微信地址的nationalCode字段请求WQ的接口来映射京东的四级地址ID请求失败，具体信息：') + e.errMsg);
        }
      })
    }

  },
  //重置选中之后的所有地址
  resetChoice: function (e, index) {
    var tempObj = {};

    //微信地址初始化S
    if (this.data.wxAddressFlag) {
      if (index == 1) {
        this.setData({
          wxAddressFlag: false,
          'wxAddress.wxCityName': '',
          'wxAddress.wxAreaName': ''
        })
      }
      else if (index == 2) {
        this.setData({
          wxAddressFlag: false,
          'wxAddress.wxAreaName': ''
        })
      }
    }
    //微信地址初始化E

    for (var i = index; i <= 4; i++) {
      tempObj[this.getDistrictType(i).toLowerCase() + 'Index'] = null;
      tempObj.arrDisable = this.data.arrDisable;
      tempObj.arrDisable[i] = true;
    }
    if (this.data.isHasTown && index < 4) {
      tempObj.isHasTown = false;
    }
    this.setData(tempObj);
  },
  //将请求的地址信息放入数组便于后续处理
  assembleFourLevel: function (objAddress) {
    var objTemp = {};
    objTemp.address = [];
    //省
    if (objAddress.provinceId && objAddress.provinceName) {
      objTemp.address.push({
        regionId: objAddress.provinceId,
        title: objAddress.provinceName
      });
    }
    //市区
    if (objAddress.cityId && objAddress.cityName) {
      objTemp.address.push({
        regionId: objAddress.cityId,
        title: objAddress.cityName
      });
    }
    //镇
    if (objAddress.countyId && objAddress.countyName) {
      objTemp.address.push({
        regionId: objAddress.countyId,
        title: objAddress.countyName
      });
    }
    //县级
    if (objAddress.townId && objAddress.townName) {
      objTemp.address.push({
        regionId: objAddress.townId,
        title: objAddress.townName
      });
    }
    return objTemp;
  },
  formSubmit: function (e) {//提交表单//保存并使用按钮事件
    var that = this;
    var url = '';
    var regExp1 = new RegExp("^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9])*$");
    // var regExp2 = new RegExp("^(\\d{7}|\\d{10}|\\d{11})$");
    var regExp2 = /^[1]([3-9])[0-9]{9}$/;
    //   var regExp3 = new RegExp("[^\\u4E00-\\u9FA5#A-Za-z0-9_( )（）《》-， -]+");
    var regExp3 = new RegExp("[^\\u4E00-\\u9FA5#A-Za-z0-9_( )（）《》-， -]+");
    var regExp4 = new RegExp("\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]");
    var sMobile = that.data.address.mobile;
    var sPhone = that.data.address.phone;
    var finalphone;

    // log.click({ "eid": "WDrugstore_EditReceivingAddressPage", "elevel": "", "ename": "", "eparam": "", "event": '' });
    if (!this.data.addressSaving) {
      // utils.request({//后台验证手机格式
      //   url: app.globalRequestUrl + that.data.pDir + '/norder/validateMobile.action?mobile=' + utils.encryptBy3DES(e.detail.value.userphone, 'np!u5chin@adm!n1aaaaaaa2'),
      //   // data:{mobile:e.detail.value.userphone},
      //   success: function (res) {

      //   },//success
      //   fail: function (e) {
      //     utils.reportErr(encodeURIComponent("结算页编辑地址点击保存按钮后验证手机号请求失败：") + e.errMsg);
      //   }
      // });
      var isCompleteAddress = false;
      if (that.data.isHasTown) {
        if ((that.data.provinceIndex != null && that.data.cityIndex != null && that.data.areaIndex != null && that.data.townIndex != null) || (that.data.townIndex != null && that.data.wxAddressFlag)) {
          isCompleteAddress = true;
        } else {
          isCompleteAddress = false;
        }
      } else {
        if ((that.data.provinceIndex != null && that.data.cityIndex != null && that.data.areaIndex != null) || ((that.data.areaIndex != null || that.data.wxAddress.wxAreaName) && that.data.wxAddressFlag)) {
          isCompleteAddress = true;
        } else {
          isCompleteAddress = false;
        }
      }
      if (!e.detail.value.username) {
        wx.showModal({
          content: '请先完善您的收货人信息',
          showCancel: false
        });
        that.data.addressSaving = false;
        return false;
      }
      if (regExp4.test(e.detail.value.username) || regExp3.test(e.detail.value.username)) {
        wx.showModal({
          content: '您的收货人信息有误',
          showCancel: false
        });
        that.data.addressSaving = false;
        return false;
      } else if (!e.detail.value.userphone) {
        wx.showModal({
          content: '请先完善您的电话信息',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              if (that.data.addressType == 'add') {
                // that.pingClick("Worder_AddressCreatePhone_OK", "", "","", e);
              } else {
                // that.pingClick("Worder_AddressEdit_PhoneSure", "", "","", e);
              }
            }
          }
        })
        that.data.addressSaving = false;
        return false;
      } else if (!isCompleteAddress) {
        wx.showModal({
          content: '请先完善您的所在地区',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              if (that.data.addressType == 'add') {
                // that.pingClick("Worder_AddressCreateRegion_OK", "", "","", e);
              } else {
                // that.pingClick("Worder_AddressEdit_RegionSure", "", "","", e);
              }
            }
          }
        });
        that.data.addressSaving = false;
        return false;
      } else if (!e.detail.value.useraddress) {
        wx.showModal({
          content: '请先完善您的详细地址',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              if (that.data.addressType == 'add') {
                // that.pingClick("Worder_AddressCreateDetail_OK", "", "","", e);
              } else {
                // that.pingClick("Worder_AddressEdit_DetailSure", "", "","", e);
              }
            }
          }
        });
        that.data.addressSaving = false;
        return false;
      } else if (!regExp1.test(e.detail.value.username)) {
        wx.showModal({
          content: '您的收货人信息输入有误',
          showCancel: false
        });
        that.data.addressSaving = false;
        return false;
      } else if (regExp4.test(e.detail.value.useraddress)) {
        wx.showModal({
          content: '您的详细地址输入有误',
          showCancel: false
        });
        that.data.addressSaving = false;
        return false;
      } else if (regExp3.test(e.detail.value.useraddress)) {
        wx.showModal({
          content: '您的详细地址输入有误',
          showCancel: false
        });
        that.data.addressSaving = false;
        return false;
      } else if ((!regExp2.test(e.detail.value.userphone.trim()) && e.detail.value.userphone.trim() != that.data.myOldMobile.trim())) {
        wx.showModal({
          content: '您的手机号输入有误',
          showCancel: false,
          success: function (res) {
            // if (res.confirm) {
            // if (that.data.addressType == 'add') {
            // that.pingClick("Worder_AddressCreatePhone_Error", "", "","", e);
            // } else {
            // that.pingClick("Worder_AddressEdit_PhoneError", "", "","", e);
            // }
            // }
          }
        });
        that.data.addressSaving = false;
        return false;
      }
      // else if (that.data.strSeledAddress.substring(0, 3) == '钓鱼岛' || that.data.strSeledAddress.substring(0, 2) == '台湾') {
      //   wx.showModal({
      //     content: '保存失败',
      //     showCancel: false
      //   });
      //   return false;
      // }
      else {
        if (that.data.addressType == 'add') {
          this.addAddressById()
        } else if (that.data.addressType == 'addEdit') {
          url = app.globalRequestUrl + that.data.pDir + '/norder/addOrUpdateAddress.json?address.id=0&address.name=' + userName + '&address.mobile=' + mobile + '&address.idProvince=' + that.data.address.idProvince + '&address.idCity=' + that.data.address.idCity + '&address.idArea=' + that.data.address.idArea + '&address.idTown=' + that.data.address.idTown + '&address.where=' + where + '&address.oldMobile=' + that.data.myOldMobile + '&addressType=add' + "&globalBuy=" + globalBuy + "&orgAddress.where=" + encodeURIComponent(e.detail.value.useraddress) + "&orgAddress.name=" + encodeURIComponent(e.detail.value.username) + "&orgAddress.mobile=" + e.detail.value.userphone
        } else {
          this.updateAddressById()
        }
        // request({
        //   url: app.globalRequestUrl + that.data.pDir + '/norder/isEncryptAddress.json',
        //   success: function (res) {
        //     var url = '';
        //     let globalBuy = that.data.isGlobalPayment ? "HK" : "";
        //     var userName = ''
        //     var mobile = ''
        //     var where = ''
        //     if (res.isEncrypt == '1') {
        //       userName = encodeURIComponent(encryptBy3DES(e.detail.value.username))
        //       mobile = e.detail.value.userphone.indexOf("*") == -1 ? encodeURIComponent(encryptBy3DES(e.detail.value.userphone)) : e.detail.value.userphone
        //       where = encodeURIComponent(encryptBy3DES(e.detail.value.useraddress))
        //     } else {
        //       userName = encodeURIComponent(e.detail.value.username)
        //       mobile = e.detail.value.userphone
        //       where = encodeURIComponent(e.detail.value.useraddress)
        //     }
        //     if (that.data.addressType == 'add') {
        //       url = app.globalRequestUrl + that.data.pDir + '/norder/addOrUpdateAddress.json?address.id=0&address.name=' + userName + '&address.mobile=' + mobile + '&address.idProvince=' + that.data.address.idProvince + '&address.idCity=' + that.data.address.idCity + '&address.idArea=' + that.data.address.idArea + '&address.idTown=' + that.data.address.idTown + '&address.where=' + where + '&address.oldMobile=' + that.data.myOldMobile + '&addressType=add' + "&globalBuy=" + globalBuy + "&orgAddress.where=" + encodeURIComponent(e.detail.value.useraddress) + "&orgAddress.name=" + encodeURIComponent(e.detail.value.username) + "&orgAddress.mobile=" + e.detail.value.userphone
        //     } else if (that.data.addressType == 'addEdit') {
        //       url = app.globalRequestUrl + that.data.pDir + '/norder/addOrUpdateAddress.json?address.id=0&address.name=' + userName + '&address.mobile=' + mobile + '&address.idProvince=' + that.data.address.idProvince + '&address.idCity=' + that.data.address.idCity + '&address.idArea=' + that.data.address.idArea + '&address.idTown=' + that.data.address.idTown + '&address.where=' + where + '&address.oldMobile=' + that.data.myOldMobile + '&addressType=add' + "&globalBuy=" + globalBuy + "&orgAddress.where=" + encodeURIComponent(e.detail.value.useraddress) + "&orgAddress.name=" + encodeURIComponent(e.detail.value.username) + "&orgAddress.mobile=" + e.detail.value.userphone
        //     } else {//编辑
        //       url = app.globalRequestUrl + that.data.pDir + '/norder/addOrUpdateAddress.json?address.id=' + that.data.address.id + '&address.name=' + userName + '&address.mobile=' + mobile + '&address.idProvince=' + that.data.address.idProvince + '&address.idCity=' + that.data.address.idCity + '&address.idArea=' + that.data.address.idArea + '&address.idTown=' + that.data.address.idTown + '&address.where=' + where + '&address.oldMobile=' + that.data.myOldMobile + '&addressId=' + that.data.address.id + "&globalBuy=" + globalBuy + "&orgAddress.where=" + encodeURIComponent(e.detail.value.useraddress) + "&orgAddress.name=" + encodeURIComponent(e.detail.value.username) + "&orgAddress.mobile=" + e.detail.value.userphone
        //     }
        //     request({
        //       url: url,
        //       success: function (res) {
        //         // messagePush.messagePush({
        //         //   formId: e.detail.formId,
        //         //   times: 1,
        //         //   type: 30007
        //         // })
        //         const wxCurrPage = getCurrentPages();//获取当前页面的页面栈
        //         const wxPrevPage = wxCurrPage[wxCurrPage.length - 2];//获取上级页面的page对象
        //         if (wxPrevPage && wxPrevPage.data && wxPrevPage.data.presaleData && wxPrevPage.data.presaleData.presaleStepPay && wxPrevPage.data.presaleData.presaleStepPay == 2) {
        //           wxPrevPage.data.resetDefaultPhoneNum = true;
        //         }
        //         if (res.success) {//如果保存地址成功更新缓存中的全站地址
        //           let sitesAddressObj = {
        //             regionIdStr: encodeURIComponent(res.regionAddress),
        //             addressId: res.addressId,
        //             fullAddress: res.where
        //           }
        //           wx.setStorageSync('sitesAddress', sitesAddressObj);
        //           that.data.addressSaving = false;
        //           wx.navigateBack();
        //         } else {
        //           if (res.addAddress && res.addAddress.Message) {
        //             toast.show({
        //               icon: toast.icon.error,
        //               message: res.addAddress.Message,
        //               duration: 3000,
        //               pageObj: that,
        //               complete: function () {
        //                 that.data.addressSaving = false;
        //                 wx.navigateBack();
        //               }
        //             });
        //           }
        //         }

        //       },
        //       fail: function (e) {
        //         reportErr(encodeURIComponent("结算页编辑地址点击保存并使用按钮请求失败：") + e.errMsg);
        //       }
        //     });
        //   },
        //   fail: function (e) {
        //     reportErr(encodeURIComponent("结算页编辑地址点击保存并使用按钮用户信息是否加密报错：") + e.errMsg);
        //   }
        // })
      }
    }
    this.data.addressSaving = true;
  },//formSubmit
  saveBuriedFunc: function (e) {
    // this.pingClick("Worder_AddressCreateSave", "", "","", e);
  },
  delete() {//删除按钮事件
    wx.showModal({
      title: '是否删除此地址？',
      success: () => {
        deleteAddressById(this.data.address.id).then(res => {
          if (res.success) {
            wx.navigateBack();
          } else {
            wx.showToast({
              title: res.msg,
              icon: 'none'
            })
          }
        })
      }
    })

    // var that = this;
    // // log.click({ "eid": "MNeworderNewAddress_Delete", "elevel": "", "ename": "", "eparam": "", "event": ev });
    // // that.pingClick("Worder_AddressEditDelete", "", "","", ev);
    // request({
    //   url: app.globalRequestUrl + that.data.pDir + '/norder/delAddress.json?addressId=' + that.data.address.id + '&addressFrom=del',
    //   success: function () {
    //     wx.navigateBack();
    //     // wx.redirectTo({
    //     //   url: '../addressul/addressul'
    //     // })
    //   },
    //   fail: function (e) {
    //     reportErr(encodeURIComponent("结算页编辑地址删除按钮请求失败：") + e.errMsg);
    //   }
    // })
  },
  //用户输完信息失去焦点后保存数据
  saveName: function (e) {
    var that = this;
    that.data.address.name = e.detail.value;
    // if(that.data.addressType=='add'){
    //   that.pingClick("Worder_AddressCreateReceiver", "", "","", e);
    // }else{
    //   that.pingClick("Worder_AddressEditReceiver", "", "","", e);
    // }
  },
  saveWhere: function (e) {
    var that = this;
    that.data.address.where = e.detail.value
  },
  saveMobile: function (e) {
    var that = this;
    that.data.address.mobile = e.detail.value;
    // if(that.data.addressType=='add'){
    //   that.pingClick("Worder_AddressCreatePhone", "", "","", e);
    // }else{
    //   that.pingClick("Worder_AddressEditPhone", "", "","", e)
    // }
  },
  // onHide:function(){
  //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
  // log.pageUnload()
  // },
  // onUnload:function(){
  // let that = this;
  //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
  // log.pageUnload()
  // }
})
