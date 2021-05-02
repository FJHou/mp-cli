// pages/testTemplate/testTemplate.js
const app = getApp();
let rate = 1;
let windowHeight = 0;
let topMargin = 0;
let isAndroid = false;
import Api from "../../../../utils/JDH-pharmacy/api";
const api = new Api();

Component({
  properties: {
    noMoreData: {
      type: Boolean,
        value: false
    },
    isShopOwner: {
      type: Boolean,
      value: false
    },
    isEdit: {
      type: Boolean,
      value: false
    },
    isLoading: {
      type: Boolean,
      value: false
    },
    shopId:{
      type:String,
      value:-1
    },
    dataSource: {
      type: Array,
      value: []
    },
    // cancelIdList: {
    //   type: Array,
    //   value: []
    // },
    backShow: {
      type: Boolean, // 是否显示 '返回顶部'
      value: true
    },
    willSave: {
      type: String, // 页面要保存数据，触发回传
      value: '00', // 01:要保存店铺  00:默认不触发
      observer(newVal, oldVal) {
        console.log('==========我要保存店铺了，快给我数据:', newVal, oldVal);
        if (newVal == '01') {
          this.willSaveData();
          return;
        }
        if (newVal == '02') {
          //reset
          this.willCancel();
          return;
        }
      }
    },
  },
  /**
   * 页面的初始数据
   */
  data: {
    originData:[],
    brandTxt: app.globalData.brandTxt,
    isLoading:false,
    backShow:true,
    helpModal: false,
    screenHeight: wx.getSystemInfoSync().screenHeight,
    height: app.globalData.height,
    // 这里是一些组件内部数据
    hidden: true,
    flag: false,
    x: 0,
    y: 0,
    disabled: true,
    elements: [],
    opacity: 1,
    topOffSet:0,

    // dataSource:[],
    cancelIdList:[],

    animationMove:wx.createAnimation({})
  },

  methods: {
    firstLoadData:function(){
      var that = this;
      // this.setData({ isLoading: true })
      this.isLoading = true;

      // this.getItemList();

      this.isScrolling = false;

      let ret = wx.getSystemInfoSync();
      windowHeight = ret.windowHeight;
      rate = 750 / ret.windowWidth // 750rpx除以当前屏幕宽度的px值，得到转换比;
      topMargin = 545 / rate + 44 + 20;
      // this.setData({ noDataBackHeight: ret.screenHeight - 44 - 20 - 545 / rate })

      this.setData({ noDataBackHeight: 300 })
      //引导  memberHome,没值认为为第一次，有值不是第一次
      if (!this.getStorageByKey('shopTemplat1')) {
        this.setData({ helpModal: true })
        wx.setStorage({
          key: 'shopTemplat1',
          data: 1
        })
      }

      this.isAndroid = ret.system.toLocaleLowerCase().indexOf("android") != -1;
      this.setData({ android: this.isAndroid });
      this.time = 0
    // this.setData({
    //   scrollWatcher: setInterval(function () { 
    //     //这里把setInterval赋值给变量名为timer的变量
    //     //然后把countDownNum存进data，好让用户知道时间在倒计着
    //     if(that.data.shouldScrollBottom){
    //       console.log('开始不断向下移动')
    //       wx.pageScrollTo({
    //         scrollTop: that.data.y + that.data.topOffSet,
    //         duration: 500,
    //       });
    //       that.setData({
    //         topOffSet: that.data.topOffSet + 10,
    //         y:that.data.y+10
    //       })
    //     }else{
    //       console.log('停止向下移动')
    //     }
    //   }, 400)
    // })
    },
    // 返回商品数据给页面
    willSaveData: function () {
      console.log('=================')
      this.triggerEvent('event_save', { dataList:this.reformData4Item(this.data.dataSource), removeList:this.data.cancelIdList });
      this.setData({originData:this.data.dataSource,cancelIdList:[]});
    },
    willCancel:function () {
      var tmpResult = this.data.originData.concat();
      this.setData({dataSource:tmpResult,cancelIdList:[]})
      this.triggerEvent('event_cancel', {});
    },
    reformData4Item(sourceList){
      let result=[];
      for(let i=0;i<sourceList.length;++i){
        result.push({id:sourceList[i].id,sortNumber:sourceList[i].sortNumber})
      }
      return result;
    },
    navigateToDetail:function(e){
      let itemInfo = e.currentTarget.dataset.itemInfo.itemSearchSimpleResultVo;
      let shopId = e.currentTarget.dataset.itemInfo.shopId;
      //缓存
      app.globalData.productBaseInfo = itemInfo;
      // 有品自营的商品详情
      let path = `/pages/productsdetails/productsdetails?itemId=${itemInfo.itemId}&promotionId=${itemInfo.promotionId}&sellerId=${itemInfo.sellerId}&shopId=${shopId}`

      var arr = ['80']; // 70:VOP  80:CPS 66:导入
      if (arr.indexOf(itemInfo.sourceChannel) >= 0) {
        // CPS商品商品详情
        path = `/pages/distributionGoodDetail/distributionGoodDetail?itemId=${itemInfo.itemId}&promotionId=${itemInfo.promotionId}&sellerId=${itemInfo.sellerId}&shopId=${shopId}`
      }
      !this.data.isEdit && wx.navigateTo({
        url: path
      });
    },
    hideHelpModal: function () {
      this.setData({
        helpModal: false,
      })
    },
    deleteItem: function(e) {
      this.data.dataSource.splice(e.currentTarget.dataset.index, 1);
      this.data.cancelIdList.push(e.currentTarget.dataset.id),
        this.triggerEvent('itemData', {
        cancelIdList: this.data.cancelIdList,
        itemData: this.reformData4Item(this.data.dataSource),
        })
        this.setData({
          cancelIdList: this.data.cancelIdList,
          dataSource:this.data.dataSource
        })
    },
    bindtouchmove: function(e) {
      console.log('bindtouchmove:', e);
      return;
    },
    scrollPhoto: function() {
      let that = this;
      var query = that.createSelectorQuery();
      var nodesRef = query.selectAll(".itemBlock");
      nodesRef.fields({
        dataset: true,
        rect: true,
      }, (result) => {
        console.log('element:', result)
        that.setData({
          elements: result
        })
      }).exec()
    },
    //长按
    longtap: function(e) {
      if (!this.data.isEdit) {
        return
      }
      this.time = e.timeStamp
      this.setData({
        x: e.currentTarget.offsetLeft,
        y: e.currentTarget.offsetTop,
        testX: e.touches[0].pageX, //点击时鼠标位置
        testY: e.touches[0].pageY,
        flag: true //开始移动
      });
      setTimeout(() => {
        this.setData({
          opacity: 0.1,
          hidden: false, //移动块展示
        })
      }, 100);
    },
    //滑动
    touchm: function(e) {
      if (!this.data.isEdit) {
        return
      }
      // android上要控制频率，差距在50ms以内就直接返回
      if (this.isAndroid) {
        let time = e.timeStamp
        if (time - this.time < 30) {
          return
        } else {
          this.time = time
        }
      }

      if (this.data.flag) {
        if (
            (e.touches[0].clientY > windowHeight - 486 * 0.5 / rate) ||
            (e.touches[0].clientY < 486 * 0.5 / rate)
        ) {
          let direction=-1;
          if (e.touches[0].clientY > windowHeight - 486 * 0.5 / rate){
            direction=1;
          }else{
            direction=2
          }
          // this.setData({
          //   shouldScrollBottom:true,
          // })
          if(!this.isScrolling){
            this.isScrolling = true;
            wx.pageScrollTo({
              scrollTop: e.touches[0].pageY - this.data.testY + e.target.offsetTop + (direction==1?0:topMargin) +(direction==1?1:-1.2)*486/rate,
              duration: 1000,
              // complete: () => {
              //   this.isScrolling = false;
              // }
            })
            setTimeout(()=>{
              this.isScrolling=false;
            },1000)
          } 
          if(!this.isAndroid){
            this.setData({
              x: e.touches[0].pageX - this.data.testX + e.target.offsetLeft,
              y: e.touches[0].pageY - this.data.testY + e.target.offsetTop,
            });
          }


          // // this.isScrolling=true;
          // wx.pageScrollTo({
          //   scrollTop: e.touches[0].pageY - this.data.testY + e.target.offsetTop + topMargin,
          //   duration: 1000,
          // })
        // }

        }else{
          this.setData({
            shouldScrollBottom: false,
          });
          this.setData({
            x: e.touches[0].pageX - this.data.testX + e.target.offsetLeft,
            y: e.touches[0].pageY - this.data.testY + e.target.offsetTop,
          });
        }
      }
    },
    //触摸开始
    touchs: function(e) {
      if (!this.data.isEdit) {
        return
      }
      this.setData({
        beginIndex: e.currentTarget.dataset.index,
        currentItem: this.data.dataSource[e.currentTarget.dataset.index]
      })
    },
    //判断相交面积
    checkCoverArea(element,x,y){
      let w=element.right-element.left,h=element.bottom-element.top,totalArea = w*h,coverArea=-1;
      if(x>element.left && x<element.right && y>element.top && y<element.bottom){
        coverArea = (element.right-x)*(element.bottom-y);
      } else if (x > element.left && x < element.right && y+h > element.top && y+h < element.bottom){
        coverArea = (element.right - x) * (y+h-element.top);
      } else if (x+w > element.left && x+w < element.right && y+h > element.top && y+h < element.bottom){
        coverArea = (x+w-element.left) * (y+h-element.top);
      } else if (x + w > element.left && x + w < element.right && y> element.top && y< element.bottom){
         coverArea = (x+w-element.left)*(element.bottom-y);
      }
      if(coverArea/w/h>0.6){
        return true;
      }else{
        return false;
      }
    },
    //触摸结束
    touchend: function(e) {
      if (!this.data.isEdit) {
        return
      }
      this.setData({
        shouldScrollBottom:false,
      })
      let that = this;
      var elements = that.data.elements
      if (!this.data.flag) {
        return;
      }
      const x = this.data.x
      const y = this.data.y + topMargin;
      let data = that.data.dataSource;
      for (var j = 0; j < elements.length; j++) {
        const item = elements[j];
        // if (x > item.left && x < item.right && y > item.top && y < item.bottom) {
        if (this.checkCoverArea(item,x,y)) {
          const endIndex = item.dataset.index;
          const beginIndex = that.data.beginIndex;
          //向后移动
          if (beginIndex < endIndex) {
            let tem = data[beginIndex];
            let finalSortNumber = data[endIndex].sortNumber;
            for (let i = beginIndex; i < endIndex; i++) {
              //前一个的位置的数据为后一个位置的
              let sortNumber = data[i].sortNumber;
              data[i] = data[i + 1];
              data[i].sortNumber = sortNumber;
            }
            data[endIndex] = tem;
            data[endIndex].sortNumber = finalSortNumber; 
          }
          //向前移动
          if (beginIndex > endIndex) {
            let tem = Object.assign({}, data[beginIndex]);
            let finalSortNumber = Object.assign({}, data[endIndex]).sortNumber;
            for (let i = beginIndex; i > endIndex; i--) {
              let sortNumber = data[i].sortNumber;
              data[i] = Object.assign({}, data[i - 1]);
              data[i].sortNumber = sortNumber;
            }
            data[endIndex] = tem;
            data[endIndex].sortNumber = finalSortNumber; 
          }
          break;
        }
      }
      that.setData({
        hidden: true,
        flag: false,
        opacity: 1,
        beginIndex: -1,
        currentItem: {},
        x: 0,
        y: 0
      });
      this.triggerEvent('itemData', {
        itemData: this.reformData4Item(data),
        cancelIdList: this.data.cancelIdList,
      });
      this.setData({
        dataSource: data,
        cancelIdList: this.data.cancelIdList,
      })
    },
    getStorageByKey: function (key) {
      try {
        const value = wx.getStorageSync(key)
        if (value) {
          return value
        }
      } catch (e) {

      }
    },
      //请求数据
      getItemList(){
      var that = this;
          api.post('/shop/queryShopItemPageList',{pageNum:this.data.reachBottom,pageSize:4,shopId:this.data.shopId}).then(
              (res)=>{
                  if(res && res.code==0 && res.data && res.data.result){
                      that.setData({
                          dataSource:[].concat(res.data.result),
                          //原始数据，用于取消功能的还原
                          originData:[].concat(res.data.result),
                      });
                      this.scrollPhoto();
                      this.setData({isLoading:false});
                  }else{
                      this.setData({isLoading:false});
                  }
              },
              ()=>{
                  this.setData({isLoading:false});
              }
          )
      }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  ready: function () {
    this.firstLoadData();
  },
  // 页面-生命周期
  pageLifetimes: {
    show() {
      // 页面onShow时,重新刷新数据
      this.firstLoadData();
    },
  },
})