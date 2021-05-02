import { queryIncomeDetail} from '../../api/index';
Page({ 
  data: { 
		todayEstimateCommission:{},//当天预估收益
		currentMonthEstimateCommission:{},//当月预估收益
		preMonthEstimateCommission:{}//上月预估收益
  }, 
  onLoad: function() {}, 
  onShow: function() {
    this.queryIncomeDetail(); 
  },   
  queryIncomeDetail: function() {
		queryIncomeDetail().then(res => {
      if (res.code) { 
				for(let i in res.data){
          if(res.data[i]==null) res.data[i]=0;
        }
        this.setData({
           ...res.data
				}) 
      }
    }) 
  }
})