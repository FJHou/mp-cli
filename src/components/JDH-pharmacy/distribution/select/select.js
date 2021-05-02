/**
 * 2019-03-14
 * created by chenyanhua
 * 下拉选择组件，传递的参数详见属性列表
 * 
 * select方法会向父级返回选中项目selectedItem
 * 使用方法：
 * <select
        dataSource='{{下拉数据}}'
        placeholder='{{默认展示文案}}'
        value='{{选中哪个值}}}'
        bind:select='选择事件回调'
      />
*/
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 默认展示的文案
    placeholder:{
      type: String,
      value: '请选择'
    },
    // active项
    value:{
      type: String,
      value: ''
    },
    // 渲染的下拉数据列表
    dataSource: {
      type: Array,
      value: [] // [{value: '选项1'}, {...}]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false // 是否展示下拉框
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 打开下拉选择框
    */
    onClick: function(){
      this.setData({
        show: !this.data.show
      });
    },
    /**
     * 选择时间，触发父级传递的方法
     * 向父级传递选中项目selectedItem
    */
    onSelect: function(e){
      var index = e.currentTarget.dataset.index;
      this.setData({
        show: !this.data.show,
        value: this.data.dataSource[index].value
      })
      this.triggerEvent('select', { selectedItem: this.data.dataSource[index] });
    }
  }
})
