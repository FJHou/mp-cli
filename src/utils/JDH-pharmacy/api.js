const cfg = require("./config.js");
// const mta = require("./mta_analysis.js");
// Promise.prototype.finally = function (callback) {
//   let P = this.constructor;
//   return this.then(
//     value => P.resolve(callback()).then(() => value),
//     reason => P.resolve(callback()).then(() => { throw reason })
//   );
// };
const methods = ['get', 'post'];
class Api {
  constructor(headers = {}) {
    methods.forEach((method) =>
      this[method] = (url, data, header = {}) => new Promise((resolve, reject) => {
        url = url + "?_=" + (+new Date());
        if (!/^(https?:)|^(\/\/)/.test(url)) url = cfg.requestURL + url;
        
        wx.request({
          url: url,
          data: data,
          method: method.toUpperCase(),
          header: Object.assign({
            'content-type': 'application/x-www-form-urlencoded',
            'Cookie': wx.getStorageSync('cookie'),
            'jcbClientType':"miniProgram"
          }, headers, header),
          success: function (res) {//服务器返回数据
            if (res.statusCode == 200) {
              resolve(res.data);
            } else {//返回错误提示信息
              reject(res.data);
            }
          },
          fail: function (e) {
            reject('网络出错');
          }
        })
      }))
  }
  parallel(url, data, method = 'get', header = {}) {
    var that = this;
    return new Promise(function (resolve) {
      that[method](url, data, header = {}).then(
        function (success) {
          resolve(success);
        },
        function (err) {
          resolve(err);
        }
      );
    });
  }
  // getMta() {
  //   return mta;
  // }
}

exports.default = Api;
module.exports = exports['default'];
