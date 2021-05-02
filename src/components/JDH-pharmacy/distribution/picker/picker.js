// components/picker.js
Component({
  observer:function(){
    console.log('=======')
  },
  /**
   * 组件的属性列表
   */
  properties: {
    defaultLimit: {
      type: Number,
      value: 6,
      observer:function(newVal,oldVal){
        // 需要优化
        this.setData({ defaultLimit:newVal});
        this.init();
      }
    },
    limit: {
      type: Number,
      value: 90
    },
    format: {
      type: String,
      value: 'yyyy.MM.dd'
    },
    pos: {
      type: String,
      value: 'middle'
    },
    mode: {
      type: String,
      value: 'radius'
    },
    animate: {
      type: Boolean,
      value: false
    },
    mark: {
      type: String,
      value: '-'
    },
    defaultTitle:{
      type:String,
      value:''
    },
    showTrangle: { // 是否展示下三角
      type: Boolean,
      value: false
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    tab: 'start',
    pickStatus: false,
    animateShow: false,
    modeObj:{
      middle:['radius','rect'],
      bottom:['rect']
    }
  },
  /**
   * 初始化
   * */ 
  ready: function () {
    this.init();
    const { pos, mode, modeObj } = this.data;
    if (modeObj[pos].indexOf(mode) == -1) {
      this.setData({
        mode: 'rect',
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /*
     * 禁止屏幕划动触发
     */
    preventTouchMove: function() {

    },
    /*
     * 初始化
     */
    init: function() {
      const {
        defaultLimit,
        format
      } = this.data;
      const opt = {
        limit: defaultLimit,
        end: new Date()
      }
      const {
        startDate,
        endDate
      } = this.limdat(opt);
      this.setData({
        startDate: this.format(startDate, format),
        endDate,
        cStartDate:startDate,
        cEndDate:endDate
      })
      this.initDate()
      this.positionDate(startDate)
      // 日期回调
      this.callbackDate();
    },
    /**
     * 日期格式化
     */
    format: function(date, fmt) {
      let _fmt = fmt || 'yyyy-MM-dd';
      const d = new Date(this.parseDate(date));
      const obj = {
        'y+': d.getFullYear(),
        'M+': d.getMonth() + 1,
        'd+': d.getDate(),
        'h+': d.getHours(),
        'm+': d.getMinutes(),
        's+': d.getSeconds(),
      }
      // 年
      if (/(y+)/.test(_fmt)) {
        _fmt = _fmt.replace(RegExp.$1, `${d.getFullYear()}`.substr(4 - RegExp.$1.length));
      }
      // 月-日-时-分-秒
      for (let i in obj) {
        if (new RegExp(`(${i})`).test(_fmt)) {
          _fmt = _fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? obj[i] : (`00${obj[i]}`.substr(`${obj[i]}`.length)))
        }
      }
      return _fmt;
    },
    /**
     * 起始时间-结束时间限制
     */
    limdat: function(o) {
      // options
      const opt = {
        limit: 0,
        start: '',
        end: ''
      }
      const _opt = Object.assign(opt, o);
      // 返回数据
      const returnDate = {};
      // 时间段
      const limit = 1000 * 60 * 60 * 24 * _opt.limit;

      const {
        format
      } = this.data;

      if (_opt.start) {
        const startParse = this.parseDate(_opt.start);
        returnDate.startDate = this.format(_opt.start, format);
        returnDate.endDate = this.format(startParse + limit, format);
      } else if (_opt.end) {
        const endParse = this.parseDate(_opt.end);
        returnDate.startDate = this.format(endParse - limit, format);
        returnDate.endDate = this.format(_opt.end, format);
      }
      return returnDate
    },
    /**
     * 初始化-生成日期时间轴
     */
    initDate: function() {
      // 初始化年-月列表
      const yearArr = [];
      const monthArr = [];
      const d = new Date();
      const year = d.getFullYear();
      for (let y = 2010; y <= year; y++) {
        yearArr.push(y);
      }
      for (let m = 1; m <= 12; m++) {
        monthArr.push(m);
      }
      this.setData({
        yearArr,
        monthArr
      });
      this.initDay(d)
    },
    /**
     * 初始化day,根据所选年月，生成当月天数
     */
    initDay: function(date) {
      // 日期计算
      const d = new Date(this.parseDate(date));
      d.setMonth(d.getMonth() + 1);
      d.setDate(0);
      // 初始化日列表
      const dayArr = [];
      for (let i = 1; i <= d.getDate(); i++) {
        dayArr.push(i)
      }
      this.setData({
        dayArr
      });
    },
    /**
     * 日期毫秒数转换-用于计算时间差
     */
    parseDate: function(date) {
      let parse = null;
      if (Object.prototype.toString.call(date) === '[object String]') {
        parse = Date.parse(date.replace(/[\.|-]/g, '/'));
      } else if (Object.prototype.toString.call(date) === '[object Number]') {
        parse = date;
      } else {
        parse = Date.parse(date);
      }
      return parse;
    },

    /**
     * 日期tab选项卡切换
     */
    catchtap: function(e) {
      const tab = e.currentTarget.id;
      const {
        startDate,
        endDate
      } = this.data;
      if (tab == 'start') {
        this.positionDate(startDate)
      } else {
        this.positionDate(endDate)
      }
      this.setData({
        tab
      });
    },
    /**
     * 日期选择
     */
    swiperPick: function(e) {
      // console.log(this.data.dateArr)
      // this.setData({
      //   dateArr:e.detail.value
      // })
      const [y, m, d] = e.detail.value;
      const {
        yearArr,
        monthArr,
        dayArr,
        tab,
        format,
        startDate,
        endDate,
        limit
      } = this.data;
      const chooseDate = `${yearArr[y]}/${monthArr[m]}/${dayArr[d]}`;
      const formatDate = this.format(chooseDate, format);
      const _c = this.parseDate(formatDate); // 选择时间毫秒
      // 计算选择当月日期
      console.log(chooseDate.replace(chooseDate.split('/')[2], '1'))
      this.initDay(new Date(chooseDate.replace(chooseDate.split('/')[2], '1')))
      // 时间段限制参数
      const o = {
        limit: limit,
      };
      if (tab == 'start') { // 开始时间

        const _n = this.parseDate(this.format(new Date(), format)); // 当前时间毫秒
        let _startDate = startDate;
        let _endDate = this.format(new Date(), format);
        // 如果所选时间大于当前时间，提示“选择上期大于当前日期”
        if (_c > _n) {
          o.start = startDate;
          // 提示
          wx.showToast({
            title: '请重新选择时间！',
            icon: 'none',
            duration: 1500
          });
          _startDate = this.format(new Date(), format);
          // 定位重置
          this.positionDate(this.format(new Date(), format))
        } else {
          o.start = formatDate;
          _startDate = formatDate;
          const {
            endDate
          } = this.limdat(o);
          const _e = this.parseDate(endDate);
          if (_e < _n) {
            _endDate = endDate;
          }
        }
        // 赋值
        this.setData({
          startDate: _startDate,
          endDate: _endDate
        });
      } else if (tab == 'end') {
        o.start = startDate;
        const {
          endDate
        } = this.limdat(o);
        const _e = this.parseDate(endDate);
        const _s = this.parseDate(startDate);
        let _endDate = formatDate;
        if (_c > _e) {
          // 提示
          wx.showToast({
            title: '请重新选择时间！',
            icon: 'none',
            duration: 1500
          });
          this.positionDate(endDate);
          _endDate = endDate;
        } else if (_c < _s) {
          // 提示
          wx.showToast({
            title: '请重新选择时间！',
            icon: 'none',
            duration: 1500
          });
          this.positionDate(startDate);
          _endDate = startDate;
        }
        this.setData({
          endDate: _endDate
        })
      } else {
        this.setData({
          chooseDate: formatDate
        });
      };

    },
    /**
     * 在日期列表中定位当时时间位置
     */
    positionDate: function(date) {
      const oriArr = date.split(/[-|\.|\/]/);
      const {
        yearArr,
        monthArr,
        dayArr
      } = this.data;
      // 获取选择时间在年-月-日数组中下标
      const y = yearArr.indexOf(oriArr[0] - 0);
      const m = monthArr.indexOf(oriArr[1] - 0);
      const d = dayArr.indexOf(oriArr[2] - 0);
      this.setData({
        value: [y, m, d]
      });
    },
    /*
     * 日期选择确定
     */
    confirm: function() {
      const {
        pickStatus,
        startDate,
        endDate
      } = this.data;
      this.setData({
        pickStatus: !pickStatus,
        cStartDate: startDate,
        cEndDate: endDate,
        defaultTitle:''
      });
      this.callbackDate();
    },
    /*
     * 取消
     */
    cencel: function() {
      const {
        pickStatus,
        animateShow,
        cStartDate,
        cEndDate,
      } = this.data;
      console.log(cStartDate,cEndDate)
      this.setData({
        pickStatus: !pickStatus,
        animateShow: !animateShow,
        tab: 'start',
        startDate:cStartDate,
        endDate: cEndDate
      });
      if (this.data.pos == 'bottom') {
        this.callbackDate();
      }
      // 日期取消选择回调
      this.callbackCencel();
    },
    /*
     * 日期选择确定
     */
    pickShow: function() {
      const {
        pickStatus,
        animateShow
      } = this.data;
      setTimeout(_ => {
        this.setData({
          animateShow: !animateShow
        });
      })
      this.setData({
        pickStatus: !pickStatus,
        tab: 'start'
      });
      // 选中日期定位
      this.positionDate(this.data.startDate);
    },
    /*
     * 日期选择回调
     */
    callbackDate: function() {
      const {
        startDate,
        endDate
      } = this.data;
      this.triggerEvent('selectDate', {
        startDate,
        endDate
      })
    },
    /*
     * 日期取消选择回调
     */
    callbackCencel: function() {
      this.triggerEvent('cencelDate', {
        cencel: true
      })
    }
  }
})