/**
 * 联盟小程序组件
 * @description 用于获取联盟unpl
 * @author zhengyunping
 * @version 1.0.0
 *
 */
import Mmd5 from '../../libs/Mmd5';

/**
 * data 参数对象
 * {jda：'必传',wxUnionId:'必传',openId:'必传',url:'获取的推广链接',sourceAppid:'来源公众号的appid',pin:'用户pin，有则必传',successCb:'成功回调'，failCb：‘失败回调}
 * isRetry是否重试
 * @param {Object} data
 */

function getUnplUnion(data) {
  var param = {};
  var urlParam = '';
  var signParam = '';
  if (data.jda) {
    param.jda = data.jda;
    signParam += data.jda + '&';
  }
  if (data.openId) {
    param.openId = data.openId;
    signParam += data.openId + '&';
  }

  if (data.pin) {
    param.pin = data.pin;
    signParam += data.pin + '&';
  }
  if (data.siteId) {
    param.siteId = data.siteId;
    signParam += data.siteId + '&';
  }
  if (data.source) {
    param.source = data.source;
    signParam += data.source + '&';
  }
  if (data.sourceAppid) {
    param.sourceAppid = data.sourceAppid;
    signParam += data.sourceAppid + '&';
  }
  if (data.token) {
    param.token = data.token;
    signParam += data.token + '&';
  }
  if (data.url) {
    param.url = decodeURIComponent(data.url);
    signParam += decodeURIComponent(data.url) + '&';
  }
  param.webType = '13';
  signParam += '13&';
  if (data.wxUnionId) {
    param.wxUnionId = data.wxUnionId;
    signParam += data.wxUnionId + '&';
  }

  var sign = Mmd5.hex_md5(signParam.substr(0, signParam.length - 1) + 'H92jik23L#%jd5gN');
  param.sign = sign;
  wx.request({
    url: 'https://union-click.jd.com/api',
    data: param,
    header: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    success: function (res) {
      var app = getApp();
      if (res.data.linkType != '0') {
        wx.setStorage({ key: 'unpl', data: res.data.unpl });
        wx.setStorage({ key: "__jdv", data: res.data.jdv });
      }
      res.data.url = decodeURIComponent(res.data.url); //url反编码
      app.globalData.unionGetUnplData = res;
      data.successCb(res);
    },
    fail: function (res) {
      data.failCb(res);
    }
  })

}
export default getUnplUnion