import { httpsGet } from "../../utils/util.js";
import { appid, url } from "../config";

 
/**
 * 用户提现状态 https://cf.jd.com/pages/viewpage.action?pageId=424563625
 */
export function queryWithdrawal() {
  return httpsGet({
    url,
    data: {
      functionId: "jdhunion_cps_withdrawal",
      body: {},
      appid,
    },
  });
}
 
 export function queryUserCertInfo(){
	return httpsGet({
    url,
    data: {
      functionId: "jdhunion_cps_queryCertificationInfo",
      body: {},
      appid,
    },
  });
 }