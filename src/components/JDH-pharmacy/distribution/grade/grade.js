// components/grade/grade.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    gradeData: {
      type: Object,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    grade: {}
  },
  /**
   * 监听页面初次渲染完成
   * */
  ready: function() {
    const {
      list
    } = this.data.gradeData;
    const grade = {};
    list.map(_item => {
      grade[_item.name] = _item.choose;
    })
    this.setData({grade})
    this.triggerEvent('gradeCallback', grade)
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /*
     * 评分操作
     */
    gradeBind: function(e) {
      // 获取当时点击的值
      const {
        name,
        level
      } = e.target.dataset;
      // 容错
      if (!name || !level) return;
      // 从data对象中获取缓存数据
      const grade = this.data.grade || {};
      // 两次点击相同的评分等级，评分归零
      // if (grade[name] == level) {
      //   grade[name] = 1;
      // } else {
        grade[name] = level;
      // }
      // 赋值
      this.setData({
        grade
      })
      // 回调
      this.triggerEvent('gradeCallback', grade)
    }
  }
})