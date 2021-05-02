
/**
 * 时间范围控件，编辑暂时用于推广页面，随后替换成冯岩写的时间控件
*/
const date = new Date();
const years = []
const months = []
const days = []
let today = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

for (let i = 1990; i <= date.getFullYear(); i++) {
  years.push(i);
}

for (let i = 1; i <= 12; i++) {
  months.push(i);
}

for (let i = 1; i <= 31; i++) {
  days.push(i);
}
const ONE_DAY = 1000 * 24* 60* 60 // 一天的毫秒
const MAX_DAY_RANGE = 60 * ONE_DAY // 日期可选最大区间 60天

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    defaultValue: {
      type: Array,
      value: [today, today] // 默认日期范围
    },
    rangeValue: { // 日期范围
      type: Array,
      value: [today, today]
    },
    placeholder:{
      type: String,
      value: '时间'
    }
  },

  observers: {
    rangeValue(rangeValue) {
      const [startDate, endDate] = rangeValue
      this.setData({
        startDate,
        endDate
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    years,
    months,
    days,
    startDate: today,
    endDate: today,
    value: [years.length - 1, date.getMonth(), date.getDate() - 1], // picker值
    dateType: 'startDate', // 选中tab
    show: false // 是否展示
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleTimeRangeChange(e) {
      this.setData({
        dateType: e.currentTarget.dataset.dateType
      })
    },
    /**
     * 时间tab选择
     * 重新设置picker展示值
    */
    onChangeTab: function(e){
      const dateType = e.currentTarget.dataset.dateType;
      const date = this.data[dateType].split('-');
      
      this.setData({
        dateType: dateType,
        value: this.resetPickerValue(date),
      });
    },

    // 重新设置picker value
    resetPickerValue: function(date){
      let { years, months, days } = this.data;
      let value = [];
      value.push(years.indexOf(parseInt(date[0])));
      value.push(months.indexOf(parseInt(date[1])));
      value.push(days.indexOf(parseInt(date[2])));
      return value;
    }, 
    /**
     * 选择时间
    */
    onPickerClick: function(){
      let { rangeValue, defaultValue } = this.data;
      let startDate = (rangeValue && rangeValue[0]) || (defaultValue && defaultValue[0]);
      let endDate = (rangeValue && rangeValue[1]) || (defaultValue && defaultValue[1]);
      this.setData({
        startDate: startDate,
        endDate: endDate,
        value: this.resetPickerValue(startDate.split('-')),
        show: true
      })
    },
    /**
     * 时间滚动
    */
    onPickerChange: function(e){
      const [year, month, day] = e.detail.value;
      let date = this.data.years[year] + '-' + this.data.months[month] + '-' + this.data.days[day];
      this.setData({
       [this.data.dateType]: date
      })
    },
    /**
     * 取消
     * 根据rangeValue重置开始结束日期
    */
    onCancel: function(){
      this.setData({
        show: false
      })
    },
    /**
     * 确定
    */
    onOk: function () {
      let { startDate, endDate } = this.data;
      const start = new Date(startDate.replace(/-/g, '/'));
      const end = new Date(endDate.replace(/-/g, '/'))
      // 限制查询日期范围
      if (Math.abs(end - start) > MAX_DAY_RANGE) {
        wx.showToast({
          title: `查询范围不能超过${MAX_DAY_RANGE/ONE_DAY}天`,
          icon: 'none'
        })
        return
      }

      if (start > end) {
        let tem = startDate
        startDate = endDate
        endDate = tem
      }

      this.setData({
        show: false,
        dateType: 'startDate',
      });

      this.triggerEvent('selectDate', {
        startDate: startDate,
        endDate: endDate
      })
    }
  }
})
