//   cps商品的拼购，秒杀，无活动
//   NO_ACTIVITY(0, "无活动"),
//   PINGOU_ACTIVITY(1, "拼购活动"),
//   SECKILL_ACTIVITY(2, " 秒杀活动"),
//   BARGAIN_ACTIVITY(3, " 砍价活动");
import promisify from "../../../../utils/JDH-pharmacy/promise.js"
const wxGetImageInfo = promisify(wx.getImageInfo);
const wxCanvasToTempFilePath = promisify(wx.canvasToTempFilePath);
import { getAppletQrCodeUrl } from "../../../../api/index";
import { fetchIsReferenceUser } from "../../../../utils/JDH-pharmacy/index";
import { APPID, DEFAULT_AVATAR } from "../../../../constants/index";
import { getTextArr } from "./helper";
import { getUserInfo, getPtPin } from "../../../../utils/loginUtils";
import { getPosterVisitSource } from "../../../../logs/getCpsVisitSource";
import { wxError } from "../../../../utils/JDH-pharmacy/wxlog";

const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 分销者Id, 当是商详分享进入商详的时候，该sellerId有可能代表分享者
    sellerId: {
      type: String,
    },
    productInfo: {
      type: Object,
      value: {
        jdSelfSaleFlag: undefined, // 京东:0  京东自营:1 标志
        annexUrl: "", // 商品图片
        salePrice: "", // 商品价格
        referPrice: "", // 商品划线价
        itemName: "", // 商品名称
        itemId: "", // 商品id
        sellerId: "", // 商品所属商家的id
        promotionId: "", // 商品活动id
        itemActivityFlag: "", // 活动标志：京东拼团，砍价，秒杀，无活动
        commentNum: "", // 评论数
        favorableRate: "", // 好评率
        shopId: undefined, // 如果是店铺商品，则有店铺id
        jdSkuId: "", // jd商品skuId
      },
    },
    codeCall: {
      type: String,
      value: "00", // '00'关闭   '01': 开启
      observer(newVal, oldVal) {
        if (oldVal == "00" && newVal == "01") {
          setTimeout((_) => this.doShare(), 300);
        }
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    productDefaultImg: app.globalData.productDefaultImg,
    brandTxt: app.globalData.brandTxt,
    referenceUserInfo: {
      headImg: DEFAULT_AVATAR,
      nickName: "",
      level: 1,
    },
    isReferenceUser: false, // 是否是推广者

    // 分享弹层
    showShareModal: false,

    wxCodeImg: "",

    imgLoaded: false, // 主图是否加载完毕

    // 绘制canvas后得到的图片url
    canvasImg: "",

    // 已经复制过的文案
    hasCopyText: null,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 主图加载完毕之前展示默认图片
     */
    imgOnLoad() {
      this.setData({
        imgLoaded: true,
      });
    },

    // 关闭分享弹窗按钮
    onCloseShareModal() {
      this.setData({
        showShareModal: false, // 关闭分享弹窗
        codeCall: "00", // 还原外层代码调用分享函数的值
        // 绘制canvas后得到的图片url
        canvasImg: "",
      });
    },
    // 分享按钮
    // tapToshare(e) {
    //   setTimeout(() => {
    //     this.doShare();
    //     // 埋点
    //     this.triggerEvent("pointEvent", {
    //       sourceChannel: 80,
    //       ...this.data.productInfo,
    //     });
    //   }, 300);
    // },

    async doShare() {
      wx.showLoading({
        title: "加载中...",
      });
      // 如果是推广者则展示推广者信息，如果不是则展示京东信息
      const referenceUser = await fetchIsReferenceUser();
      if (referenceUser) {
        const { level } = referenceUser
        const { imgUrl, petName } = getUserInfo();
        this.setData({
          referenceUserInfo: {
            nickName: petName,
            headImg: imgUrl || DEFAULT_AVATAR,
            level
          },
          isReferenceUser: true,
        });
      } else {
        const { imgUrl, petName } = getUserInfo();

        this.setData({
          "referenceUserInfo.nickName": petName,
          "referenceUserInfo.headImg": imgUrl || DEFAULT_AVATAR,
          isReferenceUser: false,
        });
      }

      this.initWxCode();
    },
    /**
     * 获取微信二维码, 识别二维码，进入买家端微信小程序
     */
    initWxCode() {
      const productInfo = this.data.productInfo;
      const referenceUserInfo = this.data.referenceUserInfo
      const skuId = productInfo.itemId;
      const params = {
        wxAppId: APPID,
        url: "pages/distributionGoodDetail/distributionGoodDetail",
        userLevel: referenceUserInfo.level,
        skuId: skuId,
        cpsVisitSource: getPosterVisitSource()
      };
      
      // 如果是推荐用户则需要传userId
      if (this.data.isReferenceUser) {
        params.referrerPin = getPtPin();
      }
      wx.showLoading({
        title: '加载中...'
      })
      getAppletQrCodeUrl(params).then((result) => {
        this.setData({
          wxCodeImg: result.data,
          showShareModal: true,
        });
        // 由于wxCanvasToTempFilePath在安卓机太慢，会导致下载图片的时候canvasImg
        // 还未生成所以这里改为promise在下载图片的时候再次取值
        this.posterGenerate = this.savePoster()
        wx.hideLoading()
      });
    },
    /**
     * 下载图片
     * */
    toDownload() {
      if (this.data.canvasImg) {
        wx.previewImage({
          current: this.data.canvasImg, // 当前显示图片的http链接
          urls: [this.data.canvasImg], // 需要预览的图片http链接列表
        });
      } else {
        wx.showLoading({
          title: '正在生成...'
        })
        this.posterGenerate.then(current => {
          wx.previewImage({
            current, // 当前显示图片的http链接
            urls: [current], // 需要预览的图片http链接列表
          });
          wx.hideLoading()
        })
      }
    },

    // canvas生成图文海报
    savePoster() {
      let { productInfo, brandTxt } = this.data;
      let {
        itemName,
        salePrice,
        referPrice,
        annexUrl,
        jdSelfSaleFlag,
      } = productInfo;
      salePrice = salePrice.toFixed(2);
      referPrice = referPrice.toFixed(2);
      const { headImg, nickName } = this.data.referenceUserInfo;
      const wxCodeImg = this.data.wxCodeImg;
      const ctx = wx.createCanvasContext("shareCanvas", this);
      const posterPromise = new Promise((resolve, reject) => {
        Promise.all([
          wxGetImageInfo({
            src: annexUrl, // 商品主图
          }),
          wxGetImageInfo({
            src: headImg, // 用户头像
          }),
          wxGetImageInfo({
            src: wxCodeImg, // 微信二维码
          }),
        ]).then((res) => {
          // 绘制白底
          ctx.setFillStyle("#fff");
          ctx.fillRect(0, 0, 750, 1090);
  
          // 商品主图
          const productImgInfo = res[0]; // 商品主图
          const pWidth = productImgInfo.width,
            pHeight = productImgInfo.height;
          const dWidth = 730,
            dHeight = 750;
          ctx.drawImage(
            productImgInfo.path,
            0,
            0,
            pWidth,
            pHeight,
            0,
            0,
            dWidth,
            dHeight
          );
  
          let y = 790;
  
          ctx.font = "normal normal 22px PingFang-SC-Regular";
          ctx.setFontSize(22);
          let tag_text_width = ctx.measureText(jdSelfSaleFlag).width;
          let tagX = 44;
          let tagWidth = tagX + tag_text_width; // padding: 0 11
          // 打标：红色背景
          ctx.beginPath();
          ctx.setLineWidth(36);
          ctx.setLineCap("round");
          ctx.setStrokeStyle("#F10216");
          ctx.moveTo(tagX, y);
          ctx.lineTo(tagWidth, y);
          ctx.stroke();
          ctx.closePath();
          // 打标：文案
          ctx.save();
          ctx.font = "normal normal 22px PingFang-SC-Regular";
          ctx.setFillStyle("#fff");
          ctx.setFontSize(22);
          ctx.fillText(jdSelfSaleFlag, 44, y + 8);
          ctx.restore();
          // 商品名称
          y = 802;
          ctx.save();
          ctx.font = "normal normal 32px PingFang-SC-Regular";
          ctx.setFillStyle("#333333");
          ctx.setFontSize(32);
          itemName = itemName.replace(" ", "");
          var reg1 = /[\u4E00-\u9FA5]/;
  
          var width1 = ctx.measureText("测").width;
          var reg2 = /[A-Z]/;
          var width2 = ctx.measureText("O").width;
          var reg3 = /[a-z]/;
          var width3 = ctx.measureText("o").width;
          var reg4 = /[0-9]/;
          var width4 = ctx.measureText("8").width;
          var reg5 = /【|】/;
          var width5 = ctx.measureText("【").width;
          var reg6 = /\[|\]/;
          var width6 = ctx.measureText("[").width;
  
          var reg_width = {
            reg1,
            reg2,
            reg3,
            reg4,
            reg5,
            reg6,
            width1,
            width2,
            width3,
            width4,
            width5,
            width6,
          };
          let itemNameArr1 = getTextArr(
            ctx,
            itemName,
            dWidth - tagWidth - 40 - 30,
            reg_width
          );
          let itemNameArr2 = getTextArr(
            ctx,
            itemName.slice(itemNameArr1[0].length),
            dWidth - 40,
            reg_width
          );
          let row1_text = itemNameArr1[0];
          let row2_text = itemNameArr2[0];
          let skuNameX = 30 + tagWidth;
          // 商品名称第一行
          ctx.fillText(row1_text, skuNameX, y);
          // 商品名称第二行
          if (itemNameArr2.length > 0) {
            if (itemNameArr2.length > 1) {
              row2_text = row2_text.slice(0, 20) + "...";
            }
            ctx.fillText(row2_text, 30, y + 45);
          }
          ctx.restore();
          // 红色价格
          y = y + 120;
          ctx.save();
          ctx.font = "normal bold 28px PingFang-SC-Regular";
          ctx.setFillStyle("#F10216");
          let priceStartY = y + 10;
          let priceStartX = 30;
          ctx.setFontSize(26);
          ctx.font = "normal normal 26px PingFang-SC-Regular";
          const rmbSymbolWidth = ctx.measureText("￥").width;
          ctx.fillText("￥", priceStartX, priceStartY);
  
          let red_price = salePrice;
          ctx.setFillStyle("#F10216");
          ctx.setFontSize(40);
          ctx.font = "normal bold 40px PingFang-SC-Regular";
          let red_price_width = ctx.measureText(`${red_price}`).width;
          const priceX = priceStartX + rmbSymbolWidth;
          ctx.fillText(`${red_price}`, priceX, priceStartY);
          ctx.restore();
          // 灰色价格
          if (salePrice != referPrice) {
            let grayPriceStartX =
              priceStartX + rmbSymbolWidth + red_price_width + 20;
              ctx.save();
            ctx.font = "normal normal 24px PingFang-SC-Regular";
            ctx.setFillStyle("#999999");
            ctx.setFontSize(24);
  
            let gray_price = referPrice;
            const gray_price_rect = ctx.measureText(`${gray_price}`);
            let gray_price_width = gray_price_rect.width;
            ctx.fillText("￥" + gray_price, grayPriceStartX, priceStartY);
            ctx.restore();
  
            // 灰色划线
            ctx.save();
            ctx.beginPath();
            ctx.setLineWidth(1);
            ctx.setStrokeStyle("#999999");
            ctx.moveTo(grayPriceStartX + 4, priceStartY - 10);
            ctx.lineTo(gray_price_width + grayPriceStartX + 24, priceStartY - 10);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
          }
          y = y + 50;
          // 绘制用户信息
          // 头像
          ctx.drawImage(res[1].path, 30, y, 80, 80);
  
          ctx.save();
          ctx.font = "normal normal 30px PingFang-SC-Regular";
          ctx.setFillStyle("#333333");
          ctx.setFontSize(30);
          ctx.fillText(nickName, 120, y + 30);
          ctx.restore();
  
          ctx.save();
          ctx.font = "normal normal 24px PingFang-SC-Regular";
          ctx.setFillStyle("#999999");
          ctx.setFontSize(24);
          ctx.fillText(
            "邀请好友享受" + brandTxt.jd + "购物内购优惠",
            120,
            y + 72
          );
          ctx.restore();
  
          y = y - 40;
          // 二维码
          ctx.drawImage(res[2].path, 570, y - 52, 130, 130);
  
          // 长按识别
          ctx.save();
          ctx.font = "normal normal 24px PingFang-SC-Regular";
          ctx.setFillStyle("#999");
          ctx.setFontSize(24);
          ctx.fillText("长按识别", 586, y + 122);
          ctx.restore();
  
          ctx.draw(false, () => {
            // 这个setTimeout必须加，如果不加部分安卓机型会出现绘制样式错乱
            setTimeout(() => {
              // canvas转换为图片
              wxCanvasToTempFilePath(
                {
                  canvasId: "shareCanvas",
                },
                this
              ).then((res) => {
                // 拿到绘制好的图片后，展示分享弹窗
                this.setData({
                  canvasImg: res.tempFilePath, // 海报图片
                });
                resolve(res.tempFilePath)
              }).catch(err => {
                wxError(`代码日志 wxCanvasToTempFilePath：${err}`)
                reject(err)
              })
            }, 100)
          });
        }).catch(err => {
          wxError(`代码日志 海报生成失败：${err}`)
          reject(err)
        })
      })

      return posterPromise;

    },
    // 好的按钮，关闭分享弹窗
    onOK() {
      this.setData({
        showShareModal: false,
        codeCall: "00", // 还原外层代码调用分享函数的值
      });
    },
  },
});
