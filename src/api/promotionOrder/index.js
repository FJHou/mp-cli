import { httpsGet } from "../../utils/util.js";
import { appid, url } from "../config";

/**
 * 用户cps订单查询  https://cf.jd.com/pages/viewpage.action?pageId=409727878
 * @param {Integer} pageSize 
 * @param {Inreger} pageNo 
 * @param {Inreger} state  3、无效-取消，16、已付款，17、已完成，18已结算
 * @param {string} startDate  yyyy-MM-dd 最大时间间隔30天
 * @param {string} endDate  yyyy-MM-dd
 */
export function queryOrdersByParams({
  pageSize,
  pageNo,
  state,
  startDate,
  endDate,
}) {
  return httpsGet({
    url,
    data: {
      functionId: "jdhunion_cps_queryOrdersByParams",
      body: { pageSize, pageNo, state, startDate, endDate },
      appid,
    },
  });
}
