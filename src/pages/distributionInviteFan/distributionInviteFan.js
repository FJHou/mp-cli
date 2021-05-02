import promisify from "../../utils/JDH-pharmacy/promise"
const wxGetImageInfo = promisify(wx.getImageInfo)
const wxCanvasToTempFilePath = promisify(wx.canvasToTempFilePath) 
import {getAppletQrCodeUrl, queryHeadUserInfo} from '../../api'
import { APPID } from '../../constants';

const SHARE_PATH = "pages/distributionBePromoter/bePromoter"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    //creating
    creating: false,
    //屏幕高
    mainHeight: wx.getSystemInfoSync().screenHeight,
    //分享、微信图标
    friendPic: 'https://thunder.jd.com/jpass/img/share_friend.png',
    weixinPic: 'https://thunder.jd.com/jpass/img/share_wx.png',
    //头部组件相关
    inviteCode: '', 
    imgSuccess: false,
    currentTab: 0,
    contextHeight: {
      0: 690,
      1: 515,
      2: 690,
      3: 700
    },
    //下载文案图(下载、小程序显示--共用)
    contextImg: {
      0: 'https://img12.360buyimg.com/imagetools/jfs/t1/158092/2/3971/540152/600e3575E780e059c/eaa8eaf81ff44d3c.png',
      1: 'https://img12.360buyimg.com/imagetools/jfs/t1/168434/21/4133/247936/600e3577Edbc54112/29202088417e8692.png',
    },
    //小程序显示的背景图
    bgImg: {
      0: 'https://img12.360buyimg.com/imagetools/jfs/t1/156768/9/7525/530285/600e3574E5203d6ab/9a0e7e4bb67bb9e2.png',
      1: 'https://img12.360buyimg.com/imagetools/jfs/t1/170717/19/4101/341151/600e3576E60260a00/6bfc71956e9fda03.png',
    },
    //下载背景图
    bgDownloadImg: {
      0: 'https://img12.360buyimg.com/imagetools/jfs/t1/167702/5/3800/526339/600e3575Ef8951c92/73f72960f731f5ce.png',
      1: 'https://img12.360buyimg.com/imagetools/jfs/t1/150975/6/17118/309038/600e3576E77095aa7/22a70c85ec6f9bad.png',
    },
    //分享主图
    shareImg: {
      0: 'https://img12.360buyimg.com/imagetools/jfs/t1/157917/32/4960/156285/600e3575Ee0a4aca9/7df4f49cd2c69e2b.png',
      1: 'https://img12.360buyimg.com/imagetools/jfs/t1/36095/14/15914/271771/600e3576Eeb229e01/89485e647e8043b6.png',
    }
  },

  swiperTab: function(e) {
    var that = this;
    that.setData({
      currentTab: e.detail.current,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    queryHeadUserInfo().then(res => {
        const data = res.data
        if (data) {
            this.setData({
                inviteCode: data.inviteCode,
                name: data.nickName
            })
            this.getQrCode();
        }
    })
  },
  //生成二维码
  getQrCode: function() {
    //组装生成二维码参数
    const params = {
        wxAppId: APPID,
        url: SHARE_PATH,
        inviteCode: this.data.inviteCode
    }
    getAppletQrCodeUrl(params).then(res => {
        const qr = res.data
        if (qr) {
            this.setData({ qr });
        } else {
          wxError(`代码日志 邀请粉丝海报生成失败 params:${JSON.stringify(params)} code:${res.code}`)
        }
    })
  },
  //绘制并保存图片
  onDrawCanvas: function(qr) {
    var that = this;
    if (that.data.creating) {
      return;
    }
    that.setData({
      creating: true
    })
    wx.showLoading({
      title: '图片生成中...',
    });
    Promise.all([
      wxGetImageInfo({
        src: that.data.qr
      }),
      wxGetImageInfo({
        src: that.data.contextImg[that.data.currentTab]
      }),
      wxGetImageInfo({
        src: that.data.bgDownloadImg[that.data.currentTab]
      }),
      wxGetImageInfo({
        src: 'https://img12.360buyimg.com/imagetools/jfs/t1/151945/30/14694/3404/5fffdb21Ecf4c69a1/95e1f7967a790d66.png'
      }),
    ]).then(
      (res) => {
        //二维码路径：qr.path
        const qr = res[0];
        //开始绘制画布
        const ctx = wx.createCanvasContext('shareCanvas');
  
        var bgDownloadImg = res[2].path;
        var contextImg = res[1].path;
        // 背景图
        ctx.drawImage(bgDownloadImg, 0, 0, 750, 1088);
        //上方文案图
        ctx.drawImage(contextImg, 0, 88, 750, that.data.contextHeight[that.data.currentTab])
        //长按识别二维码
        ctx.setFontSize(24)
        ctx.setFillStyle('#ffffff');
        ctx.fillText("长按识别二维码", 292, 1020);
        // roundRect(ctx, 299.4, 821.4, 151.1, 151.1, 10);
        //二维码背景
        ctx.drawImage(res[3].path, 242, 698, 266, 295);
        //邀请人
        ctx.setFontSize(24)
        ctx.setFillStyle('#666666');
        ctx.fillText("邀请人", 339, 738);
        //邀请人姓名
        ctx.setFontSize(28)
        ctx.setFillStyle('#333333');
        // 啊哈哈哈哈哈哈哈
        var userName = that.data.name;
        var nameLength = ctx.measureText(userName).width;
        if(nameLength>450){
          userName = userName.slice(0,6)+'...'
          nameLength = ctx.measureText(userName).width;
        }
        var left = (266-nameLength)/2;
        ctx.fillText(userName, 242 + left, 779);
        //绘制二维码  暂时：
        ctx.drawImage(qr.path, 299.4, 821.4, 151.1, 151.1);
        //生成图片
        ctx.draw(true, function(ss) {
          wxCanvasToTempFilePath({
            canvasId: 'shareCanvas'
          }, that).then(
            res => {
              const tempFilePaths = res.tempFilePath;
              let tmp = [];
              tmp[0] = tempFilePaths
              wx.previewImage({
                urls: tmp,
              })
              that.setData({
                creating: false
              });
              wx.hideLoading();
          })
        });
      },
      (res) => {
        that.setData({
          creating: false
        });
        console.log('处理二维码失败');
        wx.showToast({
          icon: 'none',
          title: '处理二维码失败'
        })
        console.log('error', res)
      }
    )
  },
  showImgSuccess: function() {
    var that = this;
    that.setData({
      imgSuccess: true
    });
    setTimeout(() => {
      that.setData({
        imgSuccess: false
      });
    }, 2000);

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var that = this;
    // TODO: 分享文案带确认
    return {
      imageUrl: that.data.shareImg[that.data.currentTab],
      path: `/${SHARE_PATH}?inviteCode=${that.data.inviteCode}`,
    }
  },
  //复制邀请码
  saveText: function() {
    var text = `${this.data.inviteCode}`;
    wx.setClipboardData({
      data: text,
      success(res) {
        wx.getClipboardData({
          success(res) {
            wx.showToast({
              title: '复制成功',
              icon: 'none',
              duration: 2000,
            })
          }
        })
      }
    });
  },
})
// function roundRect(ctx, x, y, w, h, r) {
//   // 开始绘制
//   ctx.setStrokeStyle('#FFFFFF')
//   ctx.setFillStyle('#ffffff')
//   ctx.beginPath()
//   // 因为边缘描边存在锯齿，最好指定使用 transparent 填充
//   // 这里是使用 fill 还是 stroke都可以，二选一即可
//   ctx.setFillStyle('#ffffff')
//   // ctx.setStrokeStyle('transparent')
//   // 左上角
//   ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
//   // border-top
//   // ctx.moveTo(x + r, y)
//   // ctx.lineTo(x + w - r, y)
//   // ctx.lineTo(x + w, y + r)
//   // 右上角
//   ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)

//   // border-right
//   ctx.lineTo(x + w, y + h - r)
//   // ctx.lineTo(x + w - r, y + h)
//   // 右下角
//   ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)

//   // border-bottom
//   ctx.lineTo(x + r, y + h)
//   // ctx.lineTo(x, y + h - r)
//   // 左下角
//   ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)
//   ctx.clip()
//   // border-left
//   ctx.lineTo(x, y + r)
//   // ctx.lineTo(x + r, y)
//   // 这里是使用 fill 还是 stroke都可以，二选一即可，但是需要与上面对应
//   ctx.fill();
//   // ctx.stroke()
//   ctx.closePath();
//   // 剪切
//   ctx.clip();
//   ctx.setFillStyle('#ffffff')
//   ctx.fillRect(x, y, w, h);
// }