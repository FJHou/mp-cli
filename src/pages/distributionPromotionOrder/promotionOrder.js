import { queryOrdersByParams } from "../../api/index";

const date = new Date();
const TODAY =
  date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

const DEFAULT_PARAMS = {
  pageSize: 5,
  pageNo: 1,
  startDate: TODAY,
  endDate: TODAY,
  state: null,
};

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // tab数据
    tabDS: [
      {
        title: "全部",
        orderStatus: null,
      },
      {
        title: "已付款",
        orderStatus: 16,
      },
      {
        title: "已完成",
        orderStatus: 17,
      },
      {
        title: "已结算",
        orderStatus: 18,
      },
      {
        title: "无效",
        orderStatus: 3,
      },
    ],
    loading: false, // 加载中
    totalCount: 0,
    triggered: false,
    dataSource: [], // 列表数据
    params: { ...DEFAULT_PARAMS },
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    this.setData({
      triggered: true
		})
  },

  onRefresh() {
    // 下拉刷新的时候需要将页码设置为1
    this.setData({
      'params.pageNo': 1
    })
    this.getOrders(this.data.params);
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    const data = this.data;
    if (data.loading) return;

    if (data.totalCount > data.dataSource.length) {
      let params = {
        ...data.params,
        pageNo: data.params.pageNo + 1,
      };
      this.setData({
        params,
      });

      this.getOrders(params, true);
    }
  },
  /**
   * 查询订单
   * @param {DEFAULT_PARAMS} params
   */
  getOrders(params = this.data.params, loadMore = false) {
    this.setData({
      loading: true,
    });

    queryOrdersByParams(params)
      .then((res) => {
        if (res.success && res.data) {
          const data = res.data;
          // 如果是加载更多则合并dataSource，否则覆盖dataSource
          const dataSource = loadMore
            ? this.data.dataSource.concat(data.cpsOrderSkus)
            : data.cpsOrderSkus;

          this.setData({
            dataSource,
            totalCount: data.totalCount,
          });
        }
      })
      .finally(() => {
        this.setData({
          loading: false,
          triggered: false,
        });
      });
  },
  /**
   * 选择tab, 获取订单状态参数，加载不同状态的订单
   * 重置筛选条件：时间 和 订单类型
   * 重置页码pageNo: 1
   * 重置列表数据
   */
  onClickTab: function(e) {
    // 前一次请求返回后，才允许被点击，防止tab与数据不对应
    const state = e.currentTarget.dataset.orderStatus || null;
    const { startDate, endDate } = this.data.params;
    const params = {
      ...DEFAULT_PARAMS,
      startDate,
      endDate,
      state,
    };
    this.setData({
      dataSource: [],
      params,
    });

    this.getOrders(params);
  },
  /*
   * 选择时间回调,重新加载数据
   * 需要重置pageNo和列表数据
   */
  selectDate: function(e) {
    const { startDate, endDate } = e.detail;
    const params = {
      ...DEFAULT_PARAMS,
      state: this.data.params.state,
      startDate,
      endDate,
    };
    this.setData({
      dataSource: [],
      params,
      triggered: true
    });

    this.getOrders(params);
  },
});
