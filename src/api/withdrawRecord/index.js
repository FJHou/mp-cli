import { httpsGet } from "../../utils/util.js";
import { appid, url } from "../config";

 
/**
 * 根据提现记录 https://cf.jd.com/pages/viewpage.action?pageId=424563818
 */
export function queryWithdrawalList(params) {
  return httpsGet({
    url,
    data: {
      functionId: "jdhunion_cps_queryWithdrawalList",
      body: params,
      appid,
    },
  });
}

/**
 * 重新提现 https://cf.jd.com/pages/viewpage.action?pageId=428366716
 */
export function relaunchWithdrawalReq(params) {
  return httpsGet({
    url,
    data: {
      functionId: "jdhunion_cps_relaunchWithdrawal",
      body: params,
      appid,
    },
  });
}
 