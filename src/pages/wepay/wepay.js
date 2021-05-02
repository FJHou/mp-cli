// pages/wepay/wepay.js
//skz
import Mmd5 from '../../libs/Mmd5.js';
import {APPID} from '../../constants/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var timeStamp = this.createTimeStamp();
    var nonceStr = this.createNonceStr()
    var paySign = `appId=${APPID}&nonceStr=` + nonceStr + '&package=prepay_id=' + options.prepay_id + '&signType=MD5&timeStamp=' + timeStamp +'&key=4157F4631208B97F777C7B8A959C67E2'

    if (wx.getStorageSync('order_topay_2')) { //线下商户号
      paySign = `appId=${APPID}&nonceStr=` + nonceStr + '&package=prepay_id=' + options.prepay_id + '&signType=MD5&timeStamp=' + timeStamp + '&key=8556eca32c1b34a0a9e7862a815772a2'
    }

    paySign = Mmd5.hex_md5(paySign);
    wx.requestPayment({
      timeStamp: timeStamp,
      signType:'MD5',
      nonceStr: nonceStr,
      package: 'prepay_id=' + options.prepay_id,
      paySign:paySign.toUpperCase(),
      success(res){
        console.log(1,res)
      },
      fail(err){
        console.log(3,err)
      },
      complete(res){
        console.log(2,res)
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/record/record'
          })
        }, 1000)
        wx.removeStorageSync('order_topay_2')
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },
  createNonceStr: function () {
    return Math.random().toString(36).substr(2,15);
  },
  createTimeStamp: function () {
    return parseInt(new Date().getTime() / 1000) + ''
  }
  // paysignjsapi: function (appid, attach, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type) {
  //   var ret = {
  //     appid: appid,
  //     attach: attach,
  //     body: body,
  //     mch_id: mch_id,
  //     nonce_str: nonce_str,
  //     notify_url: notify_url,
  //     openid: openid,
  //     out_trade_no: out_trade_no,
  //     spbill_create_ip: spbill_create_ip,
  //     total_fee: total_fee,
  //     trade_type: trade_type
  //   }
  //   var str = this.raw(ret)
  //   str = str + '&key=' + '4157F4631208B97F777C7B8A959C67E2'
  //   console.log(str)
  //   var Mmd5Fun = Mmd5.Mmd5();
  //   var sign = Mmd5Fun.hex_md5(str);
    
  //   return sign.toUpperCase()
  // },
  // raw: function (args) {
  //   var keys = Object.keys(args)
  //   keys = keys.sort()
  //   console.log(keys)
  //   var newArgs = {}
  //   keys.forEach(function (key) {
  //     newArgs[key] = args[key]
  //   })
  //   var str = ''
  //   for (var k in newArgs) {
  //     str += '&' + k + '=' + newArgs[k]
  //   }
  //   str = str.substr(1)
  //   console.log(str)
  //   return str
  // }, 
  // order: function (attach, body, mch_id, openid, total_fee, notify_url) {
    
  //   var appid = 'wx64adec0ff1c22386'
  //   var nonce_str = this.createNonceStr()
  //   var timeStamp = this.createTimeStamp()
  //   var url = "https://api.mch.weixin.qq.com/pay/unifiedorder"
  //   var formData = "<xml>"
  //   formData += "<appid>" + appid + "</appid>" //appid 
  //   formData += "<attach>" + attach + "</attach>" //附加数据 
  //   formData += "<body>" + body + "</body>"
  //   formData += "<mch_id>" + mch_id + "</mch_id>" //商户号 
  //   formData += "<nonce_str>" + nonce_str + "</nonce_str>" //随机字符串，不长于32位。 
  //   formData += "<notify_url>" + notify_url + "</notify_url>"
  //   formData += "<openid>" + openid + "</openid>"
  //   formData += "<out_trade_no>" + '201508061253467890123' + "</out_trade_no>"
  //   formData += "<spbill_create_ip>61.50.221.43</spbill_create_ip>"
  //   formData += "<total_fee>" + total_fee + "</total_fee>"
  //   formData += "<trade_type>JSAPI</trade_type>"
  //   formData += "<sign>" + this.paysignjsapi(appid, attach, body, mch_id, nonce_str, notify_url, openid, '20150806125346', '61.50.221.43', total_fee, 'JSAPI') + "</sign>"
  //   formData += "</xml>"
  //   formData = "<xml><appid>wx64adec0ff1c22386</appid><attach>再测一把2</attach><body>京东-无界零售微信支付测试2</body><mch_id>1238342201</mch_id><nonce_str>260rwogiqa0h</nonce_str><notify_url>https://www.baidu.com</notify_url><openid>oNPRM5UQLcR49deKzFP4i6iRDmMQ</openid><out_trade_no>201508061253467890123</out_trade_no><spbill_create_ip>61.50.221.43</spbill_create_ip><total_fee>1</total_fee><trade_type>JSAPI</trade_type><sign>230BAD141122CC99D30C3B670925BD8B</sign></xml>"
  //   console.log(formData)
  //   wx.request({
  //     url: url,
  //     method:'POST',
  //     data:formData,
  //     success(res){
  //       console.log(1,res)
  //     },
  //     fail(res){
  //       console.log(2,res)
  //     }
  //   })
  // }
})

