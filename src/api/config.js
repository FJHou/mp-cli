import { ENV } from '../constants/index';

export const appid = 'jdhunion'
export const url = '/JDHpharmacy-api'

export const healthAppid = 'jd_healthy_wx'
export const healthUrl = '/api'

export const diansongAppid = 'dian_song'
export const diansongUrl = '/diansong-api'

const api = {
    development: {
        STATIC_URL: "https://img30.360buyimg.com",
        // JDHStaticUrl: "https://img13.360buyimg.com",
        globalRequestUrl: "https://wxapp.m.jd.com",// 主流程域名
        // globalCouponUrl: "https://wxapp-conf.jd.com", //领券域名
        // messagePushRequestUrl: "https://push.k.jd.com", //消息推送域名
        diansongUrl: "https://diansong.jkcsjd.com", //"https://diansong.jkcsjd.com", // "https://dsyf.m.jd.com"
        globalDiansongRequestUrl: "https://color.jkcsjd.com",
        yaoUrl: 'https://yao.jkcsjd.com',
        // gameUrl: "https://sign.jd.com",
        globalHealthRequestUrl: "https://api.m.jd.com",
        // 京东大药房联调接口，后端接口上线后可统一使用globalHealthRequestUrl.
        globalJDHpharmacyRequestUrl: "https://beta-api.m.jd.com", // 京东大药房
        globalHealthPayRequestUrl: "https://jdhhome.jd.com",  //beta-jhkwxhome.m.jd.com
        globalHealthCartUrl: "https://jdhp.jd.com",      // beta-jhkwxp.m.jd.com
        // globalHealthWareUrl: "https://jdhitem.jd.com", // beta-jhkwxitem.m.jd.com
        // globalBackUrl: "https://backup.jd.com" //读券信息
    },
    production: {
        STATIC_URL: "https://img30.360buyimg.com",
        // JDHStaticUrl: "https://img13.360buyimg.com",
        globalRequestUrl: "https://wxapp.m.jd.com",// 主流程域名
        globalDiansongRequestUrl: "https://color.jkcsjd.com",
        // globalCouponUrl: "https://wxapp-conf.jd.com", //领券域名
        // messagePushRequestUrl: "https://push.k.jd.com", //消息推送域名
        diansongUrl: "https://diansong.jkcsjd.com", // https://dsyf.m.jd.com", // 店送预发   // 预发：线上；
        yaoUrl: 'https://yao.jkcsjd.com', // 互联网医院预发和线上一致。
        // gameUrl: "https://sign.jd.com", //通天塔游戏活动了呢
        // 线上
        // jdhitem.jd.com 商详
        // jdhhome.jd.com 我的
        // jdhp.jd.com交易
        // 线上域名为api.m.jd.com 搜索、首页、扫码、
        globalHealthRequestUrl: "https://api.m.jd.com",
        // globalHealthRequestUrl: "https://beta-api.m.jd.com",
        // 预发我的：我的订单接口域名(已改完)
        globalJDHpharmacyRequestUrl: "https://api.m.jd.com", // 京东大药房
        globalHealthPayRequestUrl: "https://jdhhome.jd.com",
        // 预发交易：购物车、结算接口
        globalHealthCartUrl: "https://jdhp.jd.com",
        // 预发商详接口
        // globalHealthWareUrl: "https://jdhitem.jd.com",
        // globalBackUrl: "https://backup.jd.com" //读券信息

    }
}

export const API = api[ENV]