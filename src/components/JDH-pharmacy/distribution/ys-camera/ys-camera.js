const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    limit:{
      type:Number,
      value:5
    },
    mode:{
      type:String,
      value:'photo,video'
    },
    sourceType:{
      type:String,
      value:'album,camera'
    },
    dom:{
      type:String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgArr: [],
    limit:8,
    chooseBtnDisabled:false,
    imgShow:false
  },
  /**
   * 组件在视图层布局完成后执行
   * */
  ready: function() {
    const modeArr = this.data.mode.split(',');
    let photo=false;
    let video=false;
    if(modeArr.indexOf('photo')!=-1){
      photo=true;
    }
    if (modeArr.indexOf('video') != -1) {
      video = true;
    }
    this.setData({
      video,
      photo
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /*
     * 禁止屏幕划动触发
     */
    preventTouchMove: function() {
      // this.uplaodFile(url, filePath, name, this.save);
    },
    /**
     * 图片上传
     * */
    uplaodImg: function (filePath) {
      const { imgArr } = this.data;
      // 列表占位，用于显示加载物资
      const n = imgArr.length;
      imgArr[n] = '';
      this.setData({ imgArr});
      // 上传数量检查
      this.restriction();
      // 上传主体
      wx.uploadFile({
        url: app.globalData.origin + '/system/upload/uploadImgFile',
        filePath: filePath,
        name: 'pictures',
        success: (res) => {
          const data = JSON.parse(res.data);
          imgArr[n] = {
            type:'pictures',
            src: data.data.pictureURL
          }
          this.setData({ imgArr });
          this.callback();
        },
        fail:(e)=>{
          imgArr.splice(n,1)
          this.setData({ imgArr });
        }
      })
    }, 
    /**
     * 视频上传
     * */
    uplaodVideo: function (filePath) {
      const { imgArr } = this.data;
      // 列表占位，用于显示加载物资
      const n = imgArr.length;
      imgArr[n] = '';
      this.setData({ imgArr })
      // 上传数量检查
      this.restriction();
      // 上传主体
      wx.uploadFile({
        url: app.globalData.origin + '/system/upload/uploadVideoFile',
        filePath: filePath,
        name: 'video',
        success: (res) => {
          const data = JSON.parse(res.data);
          imgArr[n] = {
            type: 'video',
            src: data.data.videoURL
          }
          this.setData({ imgArr });
          this.callback();
        },
        fail: (e) => {
          imgArr.splice(n, 1)
          this.setData({ imgArr });
        }
      })
    },
    /**
     * 选择图片
     * */
    chooseImage: function() {
      const {sourceType} = this.data;
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: sourceType.split(','),
        success:(res)=> {
          this.uplaodImg(res.tempFilePaths[0]);
        }
      })
    },
    /**
     * 选择视频
     * */
    chooseVideo: function() {
      const {sourceType} = this.data;
      wx.chooseVideo({
        sourceType: sourceType.split(','),
        success:(res)=> {
          this.uplaodVideo(res.tempFilePath);
        }
      })
    },
    /**
     * 删除上传项
     * */
    delUploadItem: function(e) {
      const {
        imgArr, chooseBtnDisabled
      } = this.data;
      const {
        n
      } = e.target.dataset;
      imgArr.splice(n, 1);
      this.setData({
        imgArr,
        chooseBtnDisabled: false
      })
    },
    /**
     * 上传提示
     * */
    uploadToast: function() {

    },
    /**
     * 图片/视频展示尺寸处理
     * */
    calcImg: function(e) {
      const {
        height,
        width
      } = e.detail;
      const {
        n
      } = e.target.dataset;
      const imgObj = this.data.imgObj || {};
      if (width > height) {
        const size = 158 / height;
        const h = Math.ceil(height * size);
        const w = Math.ceil(width * size);
        imgObj[n] = {
          height: h,
          width: w
        }
      } else {
        const size = 158 / width;
        const h = Math.ceil(height * size);
        const w = Math.ceil(width * size);
        imgObj[n] = {
          height: h,
          width: w
        }
      }
      this.setData({
        imgObj
      })
    },
    /**
     * 图片、视频总数限制
     * */ 
    restriction:function(){
      const { imgArr, limit, chooseBtnDisabled } = this.data;
      if (imgArr.length >= limit){
        this.setData({ chooseBtnDisabled: !chooseBtnDisabled})
      }
    },
    /**
     * 回调
     * */ 
    callback:function(){
      const {imgArr} = this.data;
      this.triggerEvent('callback', imgArr)
    },
    /**
     * 缩略图
     * */ 
    imgShow:function(e){
      const n = e.target.dataset.n || e.currentTarget.dataset.n;
      const { imgShow,imgArr,dom } = this.data;
      const domStatus = !imgShow ? true:false;
      const showItem = !imgShow?imgArr[n]:null;
      this.setData({
        imgShow: !imgShow,
        showItem
      })
      this.triggerEvent('domStatus', domStatus)
    },
    calc:function(e){
      const { width, height } = e.detail;
      if(width<height){
        const size = 750/height;
        const h = Math.ceil(height * size);
        const w = Math.ceil(width * size);
        const ml = (750 - w)/2;
        this.setData({
          width:w,
          height:h,
          ml,
          mt:0
        })
      }else if(width>height){
        const size = 750/width;
        const h = Math.ceil(height * size);
        const w = Math.ceil(width * size);
        const mt = (750 - h)/2;
        this.setData({
          width: w,
          height: h,
          mt,
          ml:0
        })
      }else{
        this.setData({
          width: 750,
          height: 750,
          mt:0,
          ml: 0
        })
      }
    }
  }
})