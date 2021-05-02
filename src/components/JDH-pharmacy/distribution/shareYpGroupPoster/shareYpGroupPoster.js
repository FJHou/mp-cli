/**
 * 拼团支付成功页面 & 拼团活动页面 & 活动列表页面 分享组件
*/
import Api from "../../../../utils/JDH-pharmacy/api";
const api = new Api();

// 公共头部
var QR = require("../../../../utils/JDH-pharmacy/qrcode.js");
var cfg = require("../../../../utils/JDH-pharmacy/config.js");
import promisify from "../../../../utils/JDH-pharmacy/promise"
const wxGetImageInfo = promisify(wx.getImageInfo);
const wxCanvasToTempFilePath = promisify(wx.canvasToTempFilePath);
const wxSaveImageToPhotosAlbum = promisify(wx.saveImageToPhotosAlbum);

const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    productInfo: {
      type: Object,
      value: {
        annexUrl: '', // 商品图片
        itemName: '', // 商品名称
        salePrice: '', // 商品价格
        groupBuyPrice: '', // 拼团商品拼团价
        numPeople: '',  // 拼团人数
      }
    },
    groupNo: {
      type: String, // 拼团id
      value: ''
    },
    onSale: { // 上下架状态, 列表里如果没有改状态，则传递true
      type: Boolean,
      value: true
    },
    codeCall: {
      type: String,
      value: '00', // '00'关闭   '01': 开启
      observer(newVal, oldVal, changedPath) {
        if (oldVal == '00' && newVal == '01') {
          console.log('==-=-=---=--=-')
          setTimeout(_ => this.doShare(), 300);
        }
      }
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    productDefaultImg: app.globalData.productDefaultImg,
    navHeight: app.globalData.height,
    defaultPic: app.globalData.defaultPic,
    brandTxt: app.globalData.brandTxt,
    fansDefaultPic: app.globalData.fansDefaultPic,

    // 分享弹层
    showShareModal: false,

    wxCodeImg: undefined, // 二维码图片

    // 下载图文重复提交
    disabledDownLoadBtn: false,
    h5_details_url: undefined, // cps h5商详页面链接

    imgLoaded: false, // 主图是否加载完毕
  },

  ready: function () {
    let brandTxt = wx.getStorageSync('brandTxt');
    this.setData({
      brandTxt,
      userInfo: wx.getStorageSync('userInfo')
    })
  },

  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      this.setData({
        userInfo: wx.getStorageSync('userInfo')
      });
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
    * 主图加载完毕之前展示默认图片
    */
    imgOnLoad: function () {
      this.setData({
        imgLoaded: true
      });
    },
    
    // 关闭分享弹窗按钮
    onCloseShareModal() {
      wx.hideLoading();
      this.setData({
        showShareModal: false,
        codeCall: '00', // 还原外层代码调用分享函数的值
      });
    },
    // 分享按钮
    tapToshare: function (e) {
      setTimeout(_ => { 
        this.doShare();
        // 埋点
        this.triggerEvent('pointEvent', {
          ...this.data.productInfo
        });
      }, 300);
    },

    doShare: function () {
      wx.showLoading({
        title: '加载中...',
      });

      // 生成H5 cps商详短链
      this.initH5DetailsUrl(() => {
        // 生成微信识别二维码 
        this.initWxCode();
      });
    },

    /**
       * 获取微信二维码, 识别二维码，进入买家端微信小程序
     */
    initWxCode() {

      // 记录分享者
      let inviterUserId = wx.getStorageSync('userId');

      let path = 'pages/productsdetails/productGroupDetails/productGroupDetails';
      let scene = this.data.groupNo + ',' + inviterUserId;

      var params = {
        page: path,
        width: 245,
        auto_color: false,
        is_hyaline: true,
        scene: scene,
        line_color: {
          "r": "0",
          "g": "0",
          "b": "0"
        }
      };
      api.get("/user/getWXACodeUnlimitWithUrl", params).then(result => {
        if (result.code == "0") {
          wx.hideLoading();
          this.setData({
            wxCodeImg: "https:" + result.data.internet,
            disabledDownLoadBtn: false,
            showShareModal: true
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: '获取二维码失败'
          });
        }
      });
    },
    
    /**
     * h5商详短链接
    */
    initH5DetailsUrl(callback) {

      let that = this;

      var longUrl = "https://" + cfg.h5Domain + "/wxpay/collagedetails?groupNo=" + this.data.groupNo + "&inviterUserId=" + wx.getStorageSync('userId');

      // 生成短链接
      var api = new Api({ "Token": "a567bdcf64c9ae2324437a44ae905ab9", "Content-Type": "application/json" });
      api.get("/shorturl/getShortUrl", { srcUrl: longUrl, token: 'a567bdcf64c9ae2324437a44ae905ab9' }).then((res) => {
        var h5_details_url = res.shortUrl || longUrl;
        that.setData({
          h5_details_url: h5_details_url
        }, () => {
          callback();
        });
      }, (res) => {
        console.log('获取短链接异常---', res.ErrMsg);
        that.setData({
          h5_details_url: longUrl
        }, () => {
          callback();
        });
      })
    },

    //适配不同屏幕大小的canvas
    setCanvasSize: function () {
      var size = {};
      try {
        var res = wx.getSystemInfoSync();
        var scale = 750 / 98;//不同屏幕下canvas的适配比例；设计稿是750宽
        var width = res.windowWidth / scale;
        var height = width;//canvas画布为正方形
        size.w = width;
        size.h = height;
      } catch (e) {
        // Do something when catch error
        console.log("获取设备信息失败" + e);
      }
      return size;
    },

    createQrCode: function (url, canvasId, cavW, cavH) {
      //调用插件中的draw方法，绘制二维码图片
      QR.api.draw(url, canvasId, cavW, cavH, this);
      setTimeout(() => { this.canvasToTempImage(); }, 500);
    },

    //获取临时缓存照片路径，存入data中
    canvasToTempImage: function () {
      var that = this;
      wx.canvasToTempFilePath({
        canvasId: 'h5Canvas',
        success: function (res) {
          var tempFilePath = res.tempFilePath;
          that.setData({
            disabledDownLoadBtn: false,
            showShareModal: true,
            wxCodeImg: tempFilePath,
          }, () => {
            wx.hideLoading();
          });
        },
        fail: function (res) {
          console.log(res);
          wx.hideLoading();
        }
      }, this);
    },

    /**
     * 下载图片
     * 首先判断是否获取【保存到相册】权限，如果没有获取，则先让用户进行授权
     * */
    toDownload: function (e) {
      var that = this;
      this.execute.bind(this);
      wx.getSetting({
        success(authRes) {
          console.log(authRes.authSetting);
          var authSetting = authRes.authSetting;
          var writePhotosAlbum = authSetting['scope.writePhotosAlbum'];
          // 曾经授权过，但是没有获取【相册】权限
          if (authSetting && typeof writePhotosAlbum == 'boolean' && writePhotosAlbum == false) {
            wx.showModal({
              title: '提示',
              content: '请打开【相册】权限！',
              success(res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.openSetting({
                    success(settingdata) {
                      console.log(settingdata)
                      if (settingdata.authSetting['scope.writePhotosAlbum']) {
                        // 授权
                        that.execute();
                      } else {
                        wx.showToast({
                          icon: 'none',
                          title: '图片保存失败，请确认开启【相册】权限！',
                          duration: 3000
                        });
                      }
                    }
                  })
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            });
          } else {
            // 授权
            that.execute();
          }
        }
      })
    },

    // 执行下载绘制
    execute: function () {
      console.log('===下载图片=====', this.data.disabledDownLoadBtn);
      if (this.data.disabledDownLoadBtn) {
        return;
      }
      this.setData({
        disabledDownLoadBtn: true
      });
      // 生成海报
      this.saveText(this.savePoster.bind(this));
    },

    // 剪贴板
    saveText: function (callback) {

      let { productInfo, brandTxt } = this.data;
      var { salePrice, groupBuyPrice, itemName } = productInfo;

      salePrice = (salePrice || 0).toFixed(2);
      groupBuyPrice = (groupBuyPrice || 0).toFixed(2);

      var text = "【" + brandTxt.mine1 + brandTxt.pt+"】";

      text += itemName +
        "\n" +
        "---------------------------" +
        "\n";

      text += brandTxt.p_pt+"：￥" + groupBuyPrice + '\n';
      if (salePrice != groupBuyPrice) {
        text += (brandTxt.p_mine+"：￥" + salePrice + "\n");
      }

      text += "抢购链接：";

      text += this.data.h5_details_url; // h5 cps商详页面
      wx.setClipboardData({
        data: text,
        success(res) {
          wx.getClipboardData({
            success(res) {
              console.log(res.data)
            }
          })
        },
        complete(res) {
          if (callback && typeof callback == 'function') {
            callback();
          }
        }
      });
    },

    // 下载图文海报
    savePoster: function () {
      wx.showLoading({
        title: '加载中...',
      });
      var that = this;
      let { productDefaultImg, productInfo, brandTxt  } = this.data;
      let { itemName, salePrice, annexUrl, groupBuyPrice } = productInfo;

      salePrice = (salePrice || 0).toFixed(2);
      groupBuyPrice = (groupBuyPrice || 0).toFixed(2);

      var productImg = annexUrl ? 'https:' + annexUrl : productDefaultImg;

      const ctx = wx.createCanvasContext('shareCanvas', that);

      // 重新获取，以免获取不到headerurl
      var userInfo = wx.getStorageSync('userInfo');

      var userHeaderUrl = userInfo.userHeaderUrl;
      userHeaderUrl = userHeaderUrl ? userHeaderUrl : userInfo.avatarUrl;

      Promise.all([
        wxGetImageInfo({
          src: productImg // 商品主图
        }),
        wxGetImageInfo({
          src: userHeaderUrl  // 用户头像
        }),
        wxGetImageInfo({
          src: that.data.wxCodeImg // 微信二维码
        }),
        wxGetImageInfo({
            src: "https://b2b-v2-pre.oss.cn-north-1.jcloudcs.com/58d10145-1be6-4d3e-ada2-86bb5822e9d0.png" // 头像圆形
         })
      ]).then((res) => {

        // 绘制白底
        ctx.setFillStyle('#F7F7F7')
        ctx.fillRect(0, 0, 750, 1090);

        // 商品主图
        const productImgInfo = res[0]; // 商品主图
        const pWidth = productImgInfo.width, pHeight = productImgInfo.height;
        const dWidth = 750, dHeight = 750;
        ctx.drawImage(productImgInfo.path, 0, 0, pWidth, pHeight, 0, 0, dWidth, dHeight);

        let y = 790;

        // 打标：获取文案及其长度
        let tagText = brandTxt.mine1 + brandTxt.pt;
        ctx.font = 'normal normal 22rpx PingFang-SC-Regular';
        ctx.setFontSize(22);
        let tag_text_width = ctx.measureText(tagText).width;

        // 打标：红色背景
        ctx.save();
        ctx.beginPath();
        ctx.setLineWidth(32);
        ctx.setLineCap('round');
        ctx.setStrokeStyle('#F10216');
        ctx.moveTo(44, y);
        ctx.lineTo(44 + tag_text_width, y);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        // 打标：文案
        ctx.save();
        ctx.font = 'normal normal 22rpx PingFang-SC-Regular';
        ctx.setFillStyle('#ffffff');
        ctx.setFontSize(22);
        ctx.fillText(tagText, 44, y + 8);
        ctx.restore();

        // 商品名称
        y = 802;
        ctx.save();
        ctx.font = 'normal normal 32rpx PingFang-SC-Regular';
        ctx.setFillStyle('#333333');
        ctx.setFontSize(32);


        var reg1 = /[\u4E00-\u9FA5]/;
        var width1 = ctx.measureText('测').width;
        var reg2 = /[A-Z]/;
        var width2 = ctx.measureText('O').width;
        var reg3 = /[a-z]/;
        var width3 = ctx.measureText('o').width;
        var reg4 = /[0-9]/;
        var width4 = ctx.measureText('8').width;
        var reg_width = { reg1, reg2, reg3, reg4, width1, width2, width3, width4 };
        let itemNameArr1 = getTextArr(ctx, itemName, 690 - tag_text_width - 45, reg_width);
        let itemNameArr2 = getTextArr(ctx, itemName.slice(itemNameArr1[0].length), 675, reg_width);

        let row1_text = itemNameArr1[0];
        let row2_text = itemNameArr2[0];
        // 商品名称第一行
        ctx.fillText(row1_text, 44 + tag_text_width + 20, y);
        // 商品名称第二行
        if (itemNameArr2.length > 0) {
          if (itemNameArr2.length > 1) {
            row2_text = row2_text.slice(0, row2_text.length - 1) + '...';
          }
          ctx.fillText(row2_text, 30, y + 45);
        }
        ctx.restore();

        // 红色价格
        y = y + 45 * 2 + 20;
        ctx.save();
        ctx.font = 'normal bold 28rpx PingFang-SC-Regular';
        ctx.setFillStyle('#F10216');
        ctx.setFontSize(28);
        let red_label = brandTxt.p_pt+'：';
        
        let red_label_width = ctx.measureText(red_label).width;
        ctx.fillText(red_label, 30, y);
        ctx.setFontSize(32);
        let red_price = '';
        red_price = groupBuyPrice; // 拼团价
        let red_price_width = ctx.measureText(red_price + '').width;
        ctx.fillText("￥" + red_price, 30 + red_label_width, y);
        ctx.restore();

        // 灰色价格
        if (groupBuyPrice != salePrice){
          ctx.save();
          ctx.font = 'normal normal 24rpx PingFang-SC-Regular';
          ctx.setFillStyle('#999999');
          ctx.setFontSize(24);
          let gray_label = brandTxt.p_mine+"：";
          let gray_price = '';
          gray_price = salePrice;
          let gray_label_width = ctx.measureText(gray_label).width;
          let price_x = 30 + red_label_width + red_price_width + 50;
          ctx.fillText(gray_label, price_x, y);
          let gray_price_width = ctx.measureText(gray_price + '').width;
          price_x = price_x + gray_label_width;
          ctx.fillText("￥" + gray_price, price_x, y);
          ctx.restore();

          // 灰色划线
          ctx.save();
          ctx.beginPath();
          ctx.setLineWidth(1);
          ctx.setStrokeStyle('#999999');
          ctx.moveTo(price_x + 4, y - 8);
          ctx.lineTo(price_x + gray_price_width + 22, y - 8);
          ctx.stroke();
          ctx.closePath();
          ctx.restore();
        }

        // 绘制用户信息
        y = y + 70;

        // circleImg(ctx, res[1].path, 30, y, 40); 
        // 头像
        ctx.drawImage(res[1].path, 30, y, 80, 80);
        ctx.drawImage(res[3].path, 5, y - 25, 130, 130);

        ctx.save();
        ctx.font = 'normal normal 30rpx PingFang-SC-Regular';
        ctx.setFillStyle("#333333");
        ctx.setFontSize(30);
        ctx.fillText(userInfo.nickName, 120, y + 30);
        ctx.restore();

        ctx.save();
        ctx.font = 'normal normal 24rpx PingFang-SC-Regular';
        ctx.setFillStyle("#999999");
        ctx.setFontSize(24);
        ctx.fillText('邀请好友享受' + brandTxt.mine1+'购物内购优惠', 120, y + 72);
        ctx.restore();

        // 二维码
        ctx.drawImage(res[2].path, 570, y - 92, 130, 130);

        // 长按识别
        ctx.save();
        ctx.setFillStyle("#999999");
        ctx.setFontSize(24);
        ctx.fillText('长按识别', 586, y + 72);
        ctx.restore();

        ctx.draw(true, function (ss) {
          setTimeout(() => {
            wxCanvasToTempFilePath({
              canvasId: 'shareCanvas'
            }, that).then(res => {
              return wxSaveImageToPhotosAlbum({
                filePath: res.tempFilePath
              });
            }).then(res => {
              wx.hideLoading();
              that.setData({
                disabledDownLoadBtn: false,
                showToast: true
              });

            }, (res) => {
              wx.hideLoading();
              that.setData({
                disabledDownLoadBtn: false
              });

              if (res.errMsg == "saveImageToPhotosAlbum:fail auth deny") {
                console.log("打开设置窗口");
                wx.openSetting({
                  success(settingdata) {
                    console.log(settingdata)
                    if (settingdata.authSetting['scope.writePhotosAlbum']) {
                      wx.showToast({
                        icon: 'none',
                        title: '授权成功，请重新点击按钮进行分享',
                        duration: 3000
                      });
                    } else {
                      wx.showToast({
                        icon: 'none',
                        title: '图片保存失败，请确认开启相册权限',
                        duration: 3000
                      });
                    }
                  }
                })
              } else {
                wx.showToast({
                  icon: 'none',
                  title: '图片保存失败，请确认开启相册权限',
                  duration: 3000
                });s
              }
            })
          }, 120);
        });

      });
    },

    //适配不同屏幕大小的canvas
    setWxCodeSize: function () {
      let size = 40; // 默认值
      try {
        var res = wx.getSystemInfoSync();
        var scale = 750 / res.screenWidth;//不同屏幕下canvas的适配比例；设计稿是750宽
        size = parseInt(70 / scale);// 插件规定size必须为整数
      } catch (e) {
        // Do something when catch error
        console.log("获取设备信息失败" + e);
      }
      return size;
    },

    // 好的按钮，关闭分享弹窗
    onOK: function () {
      this.setData({
        showShareModal: false,
        codeCall: '00', // 还原外层代码调用分享函数的值
        showToast: false
      });
    }
  }
})


function getTextArr(context, text, maxWidth, reg_width) {
  var { reg1, reg2, reg3, reg4, width1, width2, width3, width4 } = reg_width;
  var match = false;
  // 字符分隔为数组
  var arrText = text.split('');
  var line = '';
  var newTextArr = [];
  var testWidth = 0;
  for (var n = 0; n < arrText.length; n++) {
    if (!match) {
      // 频繁调用measureText 导致绘制时间特别长
      // var metrics = context.measureText(testLine);
      // var testWidth = metrics.width;

      if (reg1.test(arrText[n])) {
        testWidth += width1;
      } else if (reg2.test(arrText[n])) {
        testWidth += width2;
      } else if (reg3.test(arrText[n])) {
        testWidth += width3;
      } else {
        testWidth += width4;
      }

      if (testWidth > maxWidth && n > 0) {
        newTextArr.push(line);
        line = arrText[n];
        match = true;
      } else {
        line = line + arrText[n];
      }
    }
  }
  newTextArr.push(line);
  return newTextArr;
};
function circleImg(ctx, img, x, y, r) {
  ctx.save();
  ctx.beginPath();
  var d = 2 * r;
  var cx = x + r;
  var cy = y + r;
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.clip();
  ctx.drawImage(img, x, y, d, d);
  ctx.closePath();
  ctx.restore();
}