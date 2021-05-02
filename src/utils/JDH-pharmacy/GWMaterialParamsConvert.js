/**
 * 商品列表入参
 * obj来源：广告组接口返参
 */

//广告组配置字段文案1-5  https://cf.jd.com/pages/viewpage.action?pageId=379933456
//接口入参    https://cf.jd.com/pages/viewpage.action?pageId=408116524

export function GWMaterialParamsConvert(obj) { 
	console.log('----------',obj)
   	 let app = getApp()
		 let cid=[] 
		 let owner = '';//商品类型string：g-自营 p-非自营POP
		 let isCoupon = null;//是否是优惠券商品，1：有优惠券，0：无优惠券
		 let isPG = null;//是否是拼购商品，1代表拼购商品，0代表非拼购商品
		 let isHot = null;//是否是爆款，1：爆款商品，0：非爆款商品  
     let jxFlags=[] //京喜商品类型，1京喜、2京喜工厂直供、3京喜优选（包含3时可在京东APP购买），入参多个值表示或条件查询
		if(obj.copy3){
			 cid = obj.copy3.split(",");
		}
		if(obj.copy5){
			//第一位
			let firstCopy5 = obj.copy5.substr(0,1) 
			if(firstCopy5!='-'){
				 owner = firstCopy5
			}   
			//第二位
			let secondCopy5 = obj.copy5.substr(1,1)
			if(secondCopy5!='-'){
				isCoupon = Number(secondCopy5)
			} 
			//第三位
			let thirdCopy5 = obj.copy5.substr(2,1)
			if(thirdCopy5!='-'){
				isPG = Number(thirdCopy5)
			} 
			//第四位
			let forthCopy5 = obj.copy5.substr(3,1)
			if(forthCopy5!='-'){
				isHot = Number(forthCopy5)
			}  
			//第七位
			let seventhCopy5 = obj.copy5.substr(6,1)
			if(seventhCopy5!='-'){
				jxFlags.push(seventhCopy5)
			} 
		}
		let skuIds = []
		if(obj.copy2){
			skuIds = obj.copy2.split(',')
		}
		let productListParamObj={ 
				keyword : obj.copy1||'',//关键词
				skuIds,//skuid集合(一次最多支持查询100个sku)，数组类型
				cid1: cid[0]||'',//一级类目id
				cid2: cid[1]||'',//二级类目id
				cid3: cid[2]||'',//三级类目id
				brandCode: obj.copy4||'',//品牌code
				owner,//商品类型
				isCoupon,//是否有优惠券
				isPG,//是否是拼购商品
				isHot,//是否是爆款
				jxFlags,//商品类型 
		 }
		 //第五位-//1：查询内容商品；其他值过滤掉此入参条件。
		 let fifthCopy5 = obj.copy5.substr(4,1)
		 if(fifthCopy5==1){
			productListParamObj.hasContent = Number(fifthCopy5)
		 } 
		 //第六位-//有最优惠券商品 1：查询有最优惠券商品；其他值过滤掉此入参条件。
		 let sixthCopy5 = obj.copy5.substr(5,1)
		 if(sixthCopy5==1){
			productListParamObj.hasBestCoupon = Number(sixthCopy5)
		 } 
		 return productListParamObj
}
 